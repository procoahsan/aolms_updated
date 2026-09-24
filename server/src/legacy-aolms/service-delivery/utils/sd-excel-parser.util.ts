import * as XLSX from 'xlsx';

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────

export interface IWbsRecord {
  date: string;
  team: string;
  exchange: string;
  orderNumber: string;
  contact: string;
  lo: string;
  serviceIdentifier: string;
  orderType: string;       // "Type" header
  connectionType: string;  // "Connection Type" header
  lineDescription1: string;
  lineDescription2: string;
  lineDescription3: string;
  lineDescription4: string;
  fttrType: string;
  actioned: string;
  nceSN: string;           // "Nce SN" header (col AL area)
  mimsSN: string;
  ap1SN: string;
  ap2SN: string;
  package: string;
  block: string;
  road: string;
  build: string;
  flat: string;
  slot: string;
  controller: string;
}

export interface IResponseRecord {
  timestamp: string;
  teamName: string;
  orderNumber: string;
  fttrOrderType: string;
  packageName: string;
  connectionType: string;
  ontSerialNumber: string;  // "ONT Serial Number" column
}

export interface IDeliveryRecord {
  date: string;
  name: string;
  orderNumber: string;
  orderType: string;      // "New" column header
  closeType: string;
  ontSerialNumber: string; // "Serial Number of ONT"
  ontReservationNo: string; // "ONT Reservation Number"
  addNoted: string;        // "Add Noted"
  protectionBox: string;
  wifiSixQty: string;     // col AB - Huawei WiFi-6
  h5Qty: string;          // col AC - H5
  notes: string;
}

export interface IWbsParseResult {
  records: IWbsRecord[];
  allRecords: IWbsRecord[];   // All delivered records across ALL dates
  allDates: string[];
  selectedDate: string;
  totalDelivered: number;
  sheetName: string;
}

export interface IResponseParseResult {
  records: IResponseRecord[];
  totalRecords: number;
}

export interface IDeliveryParseResult {
  records: IDeliveryRecord[];
  totalRecords: number;
}

// ─────────────────────────────────────────────────────────
// Header-based column finder
// ─────────────────────────────────────────────────────────

/**
 * Build a header → column-index map from the first N rows.
 * Searches rows 0..maxHeaderRow for recognizable header text.
 */
function buildHeaderMap(
  sheet: XLSX.WorkSheet,
  maxHeaderRow = 5,
): { headerMap: Record<string, number>; headerRow: number } {
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
  let headerMap: Record<string, number> = {};
  let headerRow = 0;

  for (let r = 0; r <= Math.min(maxHeaderRow, range.e.r); r++) {
    const map: Record<string, number> = {};
    let headerCount = 0;
    for (let c = 0; c <= range.e.c; c++) {
      const cell = sheet[XLSX.utils.encode_cell({ r, c })];
      if (cell && cell.v != null) {
        const headerName = String(cell.v).trim();
        if (headerName) {
          map[headerName] = c;
          // Also store lowercase version for case-insensitive matching
          map[headerName.toLowerCase()] = c;
          headerCount++;
        }
      }
    }
    // The header row is the one with most non-empty cells
    if (headerCount > Object.keys(headerMap).length / 2) {
      headerMap = map;
      headerRow = r;
    }
  }

  return { headerMap, headerRow };
}

/**
 * Get cell value from a row by header name (case-insensitive).
 */
export function getCellByHeader(
  sheet: XLSX.WorkSheet,
  row: number,
  headerMap: Record<string, number>,
  headerName: string,
  raw = false,
): string {
  // Try exact match first, then lowercase
  let colIndex = headerMap[headerName];
  if (colIndex === undefined) {
    colIndex = headerMap[headerName.toLowerCase()];
  }
  // Try partial match if exact didn't work
  if (colIndex === undefined) {
    const lowerName = headerName.toLowerCase();
    for (const [key, idx] of Object.entries(headerMap)) {
      if (key.toLowerCase().includes(lowerName) || lowerName.includes(key.toLowerCase())) {
        colIndex = idx;
        break;
      }
    }
  }
  if (colIndex === undefined) return '';

  const cell = sheet[XLSX.utils.encode_cell({ r: row, c: colIndex })];
  if (!cell) return '';
  if (raw) return cell.v != null ? String(cell.v) : '';
  return cell.w || (cell.v != null ? String(cell.v) : '');
}

/**
 * Find a header column index by partial name match.
 */
function findHeaderIndex(
  headerMap: Record<string, number>,
  ...partialNames: string[]
): number | undefined {
  for (const partial of partialNames) {
    const lower = partial.toLowerCase();
    for (const [key, idx] of Object.entries(headerMap)) {
      if (key.toLowerCase().includes(lower)) {
        return idx;
      }
    }
  }
  return undefined;
}

// ─────────────────────────────────────────────────────────
// Month ordering for auto-detection
// ─────────────────────────────────────────────────────────

const MONTH_ORDER: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

/**
 * Auto-detect the latest "Order Details - Month" sheet from the workbook.
 * Pattern: "Order Details - Jan", "Order Details - Feb", etc.
 */
function findLatestOrderDetailsSheet(sheetNames: string[]): string | undefined {
  const orderDetailsSheets: Array<{ name: string; monthIndex: number }> = [];

  for (const name of sheetNames) {
    // Match "Order Details - Month" pattern (case-insensitive)
    const match = name.match(/^order\s+details\s*[-–]\s*(\w+)$/i);
    if (match) {
      const monthStr = match[1].toLowerCase();
      const monthIndex = MONTH_ORDER[monthStr];
      if (monthIndex !== undefined) {
        orderDetailsSheets.push({ name, monthIndex });
      }
    }
  }

  if (orderDetailsSheets.length === 0) return undefined;

  // Sort by month index descending and return the latest
  orderDetailsSheets.sort((a, b) => b.monthIndex - a.monthIndex);
  return orderDetailsSheets[0].name;
}

// ─────────────────────────────────────────────────────────
// WBS Sheet Parser
// ─────────────────────────────────────────────────────────

/**
 * Parse WBS Sheet.
 * Auto-detects the latest "Order Details - Month" sheet.
 * Filters Column V (Actioned) = "Delivered".
 */
export function parseWbsBuffer(
  buffer: Buffer,
  targetDate?: string,
): IWbsParseResult {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: false });

  // Auto-detect the latest "Order Details - Month" sheet
  let sheetName = findLatestOrderDetailsSheet(workbook.SheetNames);

  // Fallback: try to find any sheet containing 'order details'
  if (!sheetName) {
    sheetName = workbook.SheetNames.find(
      (n) => n.toLowerCase().includes('order details'),
    );
  }

  // Final fallback: use first sheet
  if (!sheetName) {
    sheetName = workbook.SheetNames[0];
  }

  const sheet = workbook.Sheets[sheetName];
  if (!sheet || !sheet['!ref']) {
    return { records: [], allRecords: [], allDates: [], selectedDate: '', totalDelivered: 0, sheetName: '' };
  }

  const { headerMap, headerRow } = buildHeaderMap(sheet);
  const range = XLSX.utils.decode_range(sheet['!ref']);

  // Collect unique dates & count delivered
  const uniqueDates = new Set<string>();
  const dateTimestamps = new Map<string, number>();
  const allRecords: IWbsRecord[] = [];

  for (let r = headerRow + 1; r <= range.e.r; r++) {
    const dateVal = getCellByHeader(sheet, r, headerMap, 'Date');
    const actioned = getCellByHeader(sheet, r, headerMap, 'Action') || getCellByHeader(sheet, r, headerMap, 'Actioned');
    const orderNum = getCellByHeader(sheet, r, headerMap, 'Order Number') || getCellByHeader(sheet, r, headerMap, 'Order');

    if (!orderNum && !dateVal) continue;

    if (dateVal) {
      uniqueDates.add(dateVal);
      if (!dateTimestamps.has(dateVal)) {
        let parsed = Date.parse(dateVal);
        if (isNaN(parsed)) parsed = Date.parse(`${dateVal} 2026`);
        if (isNaN(parsed)) {
          const serial = parseFloat(dateVal);
          if (!isNaN(serial) && serial > 1000) {
            parsed = (serial - 25569) * 86400000;
          }
        }
        dateTimestamps.set(dateVal, isNaN(parsed) ? 0 : parsed);
      }
    }

    const record: IWbsRecord = {
      date: dateVal,
      team: getCellByHeader(sheet, r, headerMap, 'Team'),
      exchange: getCellByHeader(sheet, r, headerMap, 'Exc'),
      orderNumber: orderNum,
      contact: getCellByHeader(sheet, r, headerMap, 'Contact'),
      lo: getCellByHeader(sheet, r, headerMap, 'LO'),
      serviceIdentifier: getCellByHeader(sheet, r, headerMap, 'Service Identifier'),
      orderType: getCellByHeader(sheet, r, headerMap, 'Type'),
      connectionType: getCellByHeader(sheet, r, headerMap, 'Connection Type'),
      lineDescription1: getCellByHeader(sheet, r, headerMap, 'Line Description 1'),
      lineDescription2: getCellByHeader(sheet, r, headerMap, 'Line Description 2'),
      lineDescription3: getCellByHeader(sheet, r, headerMap, 'Line Description 3'),
      lineDescription4: getCellByHeader(sheet, r, headerMap, 'Line Description 4'),
      fttrType: getCellByHeader(sheet, r, headerMap, 'FTTR Type'),
      actioned: actioned,
      nceSN: getCellByHeader(sheet, r, headerMap, 'Nce SN'),
      mimsSN: getCellByHeader(sheet, r, headerMap, 'Mims SN'),
      ap1SN: getCellByHeader(sheet, r, headerMap, 'AP1'),
      ap2SN: getCellByHeader(sheet, r, headerMap, 'AP2'),
      package: getCellByHeader(sheet, r, headerMap, 'Package'),
      block: getCellByHeader(sheet, r, headerMap, 'Block'),
      road: getCellByHeader(sheet, r, headerMap, 'Road'),
      build: getCellByHeader(sheet, r, headerMap, 'Build'),
      flat: getCellByHeader(sheet, r, headerMap, 'Flat'),
      slot: getCellByHeader(sheet, r, headerMap, 'Slot'),
      controller: getCellByHeader(sheet, r, headerMap, 'Controller'),
    };

    allRecords.push(record);
  }

  // Sort dates descending
  const sortedDates = Array.from(uniqueDates).sort((a, b) => {
    return (dateTimestamps.get(b) || 0) - (dateTimestamps.get(a) || 0);
  });

  // If no target date, find the latest date with delivered records
  let selectedDate = targetDate || '';
  if (!selectedDate && sortedDates.length > 0) {
    selectedDate = sortedDates[0]; // latest date
  }

  // All delivered records (across ALL dates) — for Final Output
  const allDeliveredRecords = allRecords.filter((r) => {
    return r.actioned.toLowerCase().trim() === 'delivered';
  });

  // Filter: Action/Actioned = "Delivered" AND matching date
  const filteredRecords = allRecords.filter((r) => {
    const actionMatch = r.actioned.toLowerCase().trim() === 'delivered';
    const dateMatch = !selectedDate || r.date === selectedDate;
    return actionMatch && dateMatch;
  });

  return {
    records: filteredRecords,
    allRecords: allDeliveredRecords,
    allDates: sortedDates,
    selectedDate,
    totalDelivered: filteredRecords.length,
    sheetName,
  };
}

/**
 * Parse WBS from individual date tabs.
 * Each tab has the same header structure.
 */
export function parseWbsDateTabs(buffer: Buffer): { sheetNames: string[] } {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const dateSheets = workbook.SheetNames.filter((n) => /^\d+-\w+$/.test(n));
  return { sheetNames: dateSheets };
}

// ─────────────────────────────────────────────────────────
// Response Sheet Parser
// ─────────────────────────────────────────────────────────

export function parseResponseBuffer(buffer: Buffer): IResponseParseResult {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: false });

  // Look for "Form Responses 1" or first sheet
  let sheetName = workbook.SheetNames.find(
    (n) => n.toLowerCase().includes('form responses'),
  );
  if (!sheetName) sheetName = workbook.SheetNames[0];

  const sheet = workbook.Sheets[sheetName];
  if (!sheet || !sheet['!ref']) {
    return { records: [], totalRecords: 0 };
  }

  const { headerMap, headerRow } = buildHeaderMap(sheet);
  const range = XLSX.utils.decode_range(sheet['!ref']);
  const records: IResponseRecord[] = [];

  for (let r = headerRow + 1; r <= range.e.r; r++) {
    const orderNum = getCellByHeader(sheet, r, headerMap, 'Order Number');
    if (!orderNum) continue;

    records.push({
      timestamp: getCellByHeader(sheet, r, headerMap, 'Timestamp'),
      teamName: getCellByHeader(sheet, r, headerMap, 'Team Name'),
      orderNumber: orderNum,
      fttrOrderType: getCellByHeader(sheet, r, headerMap, 'FTTR Order Type'),
      packageName: getCellByHeader(sheet, r, headerMap, 'Package'),
      connectionType: getCellByHeader(sheet, r, headerMap, 'Connection Type'),
      ontSerialNumber: getCellByHeader(sheet, r, headerMap, 'ONT Serial Number'),
    });
  }

  return { records, totalRecords: records.length };
}

// ─────────────────────────────────────────────────────────
// Delivery Material Sheet Parser
// ─────────────────────────────────────────────────────────

export function parseDeliveryBuffer(buffer: Buffer): IDeliveryParseResult {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: false });

  // Look for "Material sheet" tab
  let sheetName = workbook.SheetNames.find(
    (n) => n.toLowerCase().includes('material'),
  );
  if (!sheetName) sheetName = workbook.SheetNames[0];

  const sheet = workbook.Sheets[sheetName];
  if (!sheet || !sheet['!ref']) {
    return { records: [], totalRecords: 0 };
  }

  // Material sheet has headers in row 4 (index 3)
  const { headerMap, headerRow } = buildHeaderMap(sheet, 10);
  const range = XLSX.utils.decode_range(sheet['!ref']);
  const records: IDeliveryRecord[] = [];

  for (let r = headerRow + 1; r <= range.e.r; r++) {
    const orderNum = getCellByHeader(sheet, r, headerMap, 'Order Number');
    if (!orderNum) continue;

    // Find WiFi-6 and H5 columns by partial match
    const wifiSix = getCellByHeader(sheet, r, headerMap, 'WiFi-6') ||
                    getCellByHeader(sheet, r, headerMap, 'Huawei HG8245X6');
    const h5 = getCellByHeader(sheet, r, headerMap, 'HG8M8240 H5') ||
               getCellByHeader(sheet, r, headerMap, 'HUAWEI ECHOLIFE HG8M8240');

    records.push({
      date: getCellByHeader(sheet, r, headerMap, 'Date'),
      name: getCellByHeader(sheet, r, headerMap, 'Name'),
      orderNumber: orderNum,
      orderType: getCellByHeader(sheet, r, headerMap, 'New'),
      closeType: getCellByHeader(sheet, r, headerMap, 'Close type'),
      ontSerialNumber: getCellByHeader(sheet, r, headerMap, 'Serial Number of ONT'),
      ontReservationNo: getCellByHeader(sheet, r, headerMap, 'ONT Reservation Number'),
      addNoted: getCellByHeader(sheet, r, headerMap, 'Add Noted'),
      protectionBox: getCellByHeader(sheet, r, headerMap, 'Protection Box'),
      wifiSixQty: wifiSix,
      h5Qty: h5,
      notes: getCellByHeader(sheet, r, headerMap, 'Notes'),
    });
  }

  return { records, totalRecords: records.length };
}

// ─────────────────────────────────────────────────────────
// Extract serial numbers from various sheets
// ─────────────────────────────────────────────────────────

export function extractWbsSerialNumbers(records: IWbsRecord[]): string[] {
  const serials: string[] = [];
  for (const r of records) {
    if (r.nceSN && r.nceSN.trim().length > 3) {
      serials.push(r.nceSN.trim());
    }
  }
  return [...new Set(serials)];
}

export function extractDeliverySerialNumbers(records: IDeliveryRecord[]): string[] {
  const serials: string[] = [];
  for (const r of records) {
    if (r.ontSerialNumber && r.ontSerialNumber.trim().length > 3) {
      serials.push(r.ontSerialNumber.trim());
    }
  }
  return [...new Set(serials)];
}
