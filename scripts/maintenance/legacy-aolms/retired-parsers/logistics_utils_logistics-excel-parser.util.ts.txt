import * as XLSX from 'xlsx';

export interface ILogisticsRecord {
  id: number;
  date: string;              // A
  team: string;              // C
  package: string;           // E
  exchange: string;          // F
  block: string;             // G
  road: string;              // H
  colI: string;              // I
  flat: string;              // J
  loName: string;            // O
  ticketNo: string;          // P
  status: string;            // Z
  rootCause: string;         // AA
  resolution: string;        // AB
  resolutionDesc: string;    // AC
  faultyDamaged: string;     // AF
  ont: string;               // AG
  snOldOnt: string;          // AH
  newSnNo: string;           // AI
  ontProtectionBox: string;  // AJ
  finalRemarksAnisa: string; // AJ
}

export interface ILogisticsParseResult {
  records: ILogisticsRecord[];
  allDates: string[];        // all unique dates (sorted desc)
  selectedDate: string;      // the date used for filtering
}

/**
 * Parse an Excel buffer (from file upload) for Logistics.
 * Filters by: status (column Z) = 'resolved' AND Final remarks - ANISA (column AJ) != 'not required'
 * If targetDate is provided, filter by that date; otherwise use 2nd latest date.
 */
export function parseLogisticsExcelBuffer(
  buffer: Buffer,
  targetDate?: string,
): ILogisticsParseResult {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: false });
  return parseWorkbook(workbook, targetDate);
}

export function parseTeamExcelBuffer(buffer: Buffer): any[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json<any>(sheet, { defval: '' });
}

/**
 * Extract all new serial numbers (column AF) from the raw logistics buffer.
 */
export function extractNewSerialNumbers(buffer: Buffer): string[] {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: false });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: '', raw: false });
  const { headerMap, headerRow } = buildHeaderMap(rows);

  if (rows.length <= headerRow + 1) return [];

  const serials: string[] = [];
  for (let i = headerRow + 1; i < rows.length; i++) {
    const row = rows[i];
    const sn = getByHeader(row, headerMap, 'New SN No', 'New SN', 'Serial Number', 'ONT Serial Number');
    if (sn && sn.length > 3) {
      serials.push(sn);
    }
  }

  return [...new Set(serials)]; // unique
}

function normalizeHeader(value: string): string {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function buildHeaderMap(rows: any[][]): { headerMap: Map<string, number>; headerRow: number } {
  let headerRow = 0;
  let bestCount = 0;
  let headerMap = new Map<string, number>();

  rows.slice(0, 10).forEach((row, index) => {
    const map = new Map<string, number>();
    let count = 0;
    row.forEach((cell, colIndex) => {
      const key = normalizeHeader(cell);
      if (key) {
        map.set(key, colIndex);
        count++;
      }
    });
    if (count > bestCount) {
      bestCount = count;
      headerRow = index;
      headerMap = map;
    }
  });

  return { headerMap, headerRow };
}

function findHeader(headerMap: Map<string, number>, names: string[]): number | undefined {
  for (const name of names) {
    const wanted = normalizeHeader(name);
    if (headerMap.has(wanted)) return headerMap.get(wanted);
  }
  for (const name of names) {
    const wanted = normalizeHeader(name);
    for (const [key, index] of headerMap.entries()) {
      if (key.includes(wanted) || wanted.includes(key)) return index;
    }
  }
  return undefined;
}

function getByHeader(row: any[], headerMap: Map<string, number>, ...names: string[]): string {
  const index = findHeader(headerMap, names);
  if (index === undefined) return '';
  return String(row[index] ?? '').trim();
}

function parseDateValue(value: string): number {
  let parsed = Date.parse(value);
  if (isNaN(parsed)) parsed = Date.parse(`${value} 2026`);
  if (isNaN(parsed)) {
    const serial = parseFloat(value);
    if (!isNaN(serial) && serial > 1000) parsed = (serial - 25569) * 86400000;
  }
  return isNaN(parsed) ? 0 : parsed;
}

function parseWorkbook(
  workbook: XLSX.WorkBook,
  targetDate?: string,
): ILogisticsParseResult {
  // Use the first sheet
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: '', raw: false });
  const { headerMap, headerRow } = buildHeaderMap(rows);

  if (rows.length <= headerRow + 1) {
    return { records: [], allDates: [], selectedDate: '' };
  }

  // First, find unique dates to determine the "2nd latest date"
  const uniqueDates = new Set<string>();
  const dateMap = new Map<string, number>();

  for (let i = headerRow + 1; i < rows.length; i++) {
    const rawDate = getByHeader(rows[i], headerMap, 'Date');
    if (rawDate != null && String(rawDate).trim() !== '') {
      const dStr = String(rawDate).trim();
      uniqueDates.add(dStr);
      if (!dateMap.has(dStr)) {
         dateMap.set(dStr, parseDateValue(dStr));
      }
    }
  }

  const sortedDates = Array.from(uniqueDates).sort((a, b) => {
    return dateMap.get(b)! - dateMap.get(a)!; // descending
  });

  // Determine the date to filter by
  let selectedDate = targetDate || '';
  if (!selectedDate) {
    if (sortedDates.length > 1) {
      selectedDate = sortedDates[1]; // 2nd latest
    } else if (sortedDates.length === 1) {
      selectedDate = sortedDates[0]; // fallback
    }
  }

  const records: ILogisticsRecord[] = [];
  let currentId = 1;

  for (let i = headerRow + 1; i < rows.length; i++) {
    const row = rows[i];
    
    // Skip empty rows
    if (!row.some((cell) => String(cell || '').trim())) continue;

    const rowDate = getByHeader(row, headerMap, 'Date');
    const rowAJ = getByHeader(row, headerMap, 'Final Remarks ANISA', 'Final Remarks', 'Protection Box').toLowerCase();

    // Condition: date matches selected AND final remarks is NOT 'not required'.
    // Resolved status is no longer mandatory.
    const isSelectedDate = rowDate === selectedDate;
    const isNotExcluded = !rowAJ.includes('not required');

    if (isSelectedDate && isNotExcluded) {
      records.push({
        id: currentId++,
        date: rowDate,
        team: getByHeader(row, headerMap, 'Team'),
        package: getByHeader(row, headerMap, 'Package'),
        exchange: getByHeader(row, headerMap, 'Exchange'),
        block: getByHeader(row, headerMap, 'Block'),
        road: getByHeader(row, headerMap, 'Road'),
        colI: getByHeader(row, headerMap, 'Col I', 'Area'),
        flat: getByHeader(row, headerMap, 'Flat'),
        loName: getByHeader(row, headerMap, 'LO Name', 'LO'),
        ticketNo: getByHeader(row, headerMap, 'Ticket No', 'Ticket Number', 'Order Number'),
        status: getByHeader(row, headerMap, 'Status'),
        rootCause: getByHeader(row, headerMap, 'Root Cause'),
        resolution: getByHeader(row, headerMap, 'Resolution'),
        resolutionDesc: getByHeader(row, headerMap, 'Resolution Desc', 'Resolution Description'),
        faultyDamaged: getByHeader(row, headerMap, 'Faulty Damaged', 'Faulty/Damaged'),
        ont: getByHeader(row, headerMap, 'ONT'),
        snOldOnt: getByHeader(row, headerMap, 'SN Old ONT', 'Old ONT SN'),
        newSnNo: getByHeader(row, headerMap, 'New SN No', 'New SN', 'Serial Number'),
        ontProtectionBox: getByHeader(row, headerMap, 'Protection Box'),
        finalRemarksAnisa: getByHeader(row, headerMap, 'Final Remarks ANISA', 'Final Remarks'),
      });
    }
  }

  return { records, allDates: sortedDates, selectedDate };
}
