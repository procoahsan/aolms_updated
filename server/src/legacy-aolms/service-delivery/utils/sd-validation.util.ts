import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';
import {
  IWbsRecord,
  IResponseRecord,
  IDeliveryRecord,
} from './sd-excel-parser.util';

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────

export interface IOrderValidationResult {
  orderNumber: string;
  wbsTeam: string;
  wbsOrderType: string;
  wbsConnectionType: string;
  foundInResponse: boolean;
  responseOrderType: string;
  responseConnectionType: string;
  status: 'OK' | 'Not Found';
}

export interface IDeliveryValidationResult {
  orderNumber: string;
  responseOrderType: string;
  responseConnectionType: string;
  foundInDelivery: boolean;
  deliveryOrderType: string;
  deliveryCloseType: string;
  status: 'OK' | 'Not Found';
}

export interface ISortValidationResult {
  totalWbs: number;
  totalDelivery: number;
  countMatch: boolean;
  sequenceMatch: boolean;
  missingInDelivery: string[];
  missingInWbs: string[];
}

export interface ICrossVerificationResult {
  orderNumber: string;
  wbsOrderType: string;
  wbsConnectionType: string;
  deliveryOrderType: string;
  deliveryCloseType: string;
  typeMatch: boolean;
  nceSN: string;
  copiedToDelivery: boolean;
}

export interface IOntVerificationResult {
  serialNumber: string;
  orderNumber: string;
  poNumber: string;
  ontName: string;
  foundInOnt: boolean;
  foundInCpe: boolean;
  needsInvestigation: boolean;
  source: string;
}

export interface IFinalOutputRecord {
  orderNumber: string;
  projectType: 'Service Assurance' | 'Service Delivery' | 'Unknown';
  wbsType: string;
  date: string;
  exchange: string;
  lo: string;
  connectionType: string;
  serialNumber: string;
  poNumber: string;
  assetDescription: string;
  labourCharge: number;
  cpeCharge: number;
  warnings: string[];
}

export interface ICategorizeResult {
  orderNumber: string;
  orderType: string;
  serialNumber: string;
  ontReservationNo: string;
  productCode: string;
  colAB: number | null;
  colAC: number | null;
}

// ─────────────────────────────────────────────────────────
// Data Verification Types (NEW — merged Phase 1 + 2)
// ─────────────────────────────────────────────────────────

export interface IDataVerificationRecord {
  date: string;
  wbsOrder: string;
  responseOrderNumber: string;
  wbsType: string;
  responseFttrOrderType: string;
  wbsConnectionType: string;
  responseConnectionType: string;
  wbsNceSN: string;
  orderMatch: boolean;
  typeMatch: boolean;
  connectionMatch: boolean;
}

// ─────────────────────────────────────────────────────────
// Cross Verification & ONT Check Types (NEW — merged Phase 3 + 4)
// ─────────────────────────────────────────────────────────

export interface ICrossVerifyOntRecord {
  date: string;
  team: string;
  orderNumber: string;
  orderType: string;
  connectionType: string;
  nceSN: string;
  scenario: 'A' | 'B';
  poNumber: string;
  foundInOnt: boolean;
  foundInCpe: boolean;
  status: 'OK' | 'Investigate';
  notes: string;
}

// ─────────────────────────────────────────────────────────
// Normalization helpers
// ─────────────────────────────────────────────────────────

function normalizeType(t: string): string {
  return (t || '').toLowerCase().replace(/[_\-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

// ─────────────────────────────────────────────────────────
// Data Verification Logic (NEW)
// ─────────────────────────────────────────────────────────

/**
 * Type validation: uses contains/includes logic.
 * WBS = "External" matches Response = "External - Shift (Modify)"
 * WBS = "Internal" matches Response = "Internal - Shift (Modify)"
 */
function typesMatchNew(wbsType: string, responseType: string): boolean {
  const wbsNorm = normalizeType(wbsType);
  const respNorm = normalizeType(responseType);

  if (!wbsNorm || !respNorm) return false;

  // Direct match
  if (wbsNorm === respNorm) return true;

  // Contains/includes logic: if response contains the WBS type, it's valid
  if (respNorm.includes(wbsNorm)) return true;

  return false;
}

/**
 * Connection Type normalization and comparison.
 * Valid mappings:
 *   Home Connect ↔ Home Connect
 *   Home Pass ↔ Home Pass, Home Pass (Overhead Splitter), Home Pass (Underground Splitter)
 *   Overhead ↔ Overhead
 *   Reprovide ↔ Reprovide, Re-Provide
 */
function connectionTypesMatch(wbsConn: string, responseConn: string): boolean {
  const wbsNorm = normalizeType(wbsConn);
  const respNorm = normalizeType(responseConn);

  if (!wbsNorm || !respNorm) return false;

  // Direct match
  if (wbsNorm === respNorm) return true;

  // Normalize connection type to a canonical form
  function canonicalize(ct: string): string {
    const t = ct.toLowerCase().replace(/[_\-]+/g, ' ').replace(/\s+/g, ' ').trim();

    if (t === 'home connect') return 'home connect';

    if (t === 'home pass' || t.startsWith('home pass')) return 'home pass';

    if (t === 'overhead') return 'overhead';

    if (t === 'reprovide' || t === 're provide') return 'reprovide';

    return t;
  }

  return canonicalize(wbsNorm) === canonicalize(respNorm);
}

/**
 * Data Verification: validates WBS records against Response records.
 * Field-level matching for: Order, Type, Connection Type, Serial Number.
 */
export function dataVerification(
  wbsRecords: IWbsRecord[],
  responseRecords: IResponseRecord[],
): IDataVerificationRecord[] {
  // Build response lookup by order number
  const responseMap = new Map<string, IResponseRecord>();
  for (const r of responseRecords) {
    const key = String(r.orderNumber).trim();
    if (key) responseMap.set(key, r);
  }

  const results: IDataVerificationRecord[] = [];

  for (const wbs of wbsRecords) {
    const wbsOrder = String(wbs.orderNumber).trim();
    if (!wbsOrder) continue;

    const response = responseMap.get(wbsOrder);

    const responseOrderNum = response ? String(response.orderNumber).trim() : '';
    const responseFttrType = response ? (response.fttrOrderType || '') : '';
    const responseConnType = response ? (response.connectionType || '') : '';

    const orderMatch = !!response;

    const typeMatch = response
      ? typesMatchNew(wbs.orderType, responseFttrType)
      : false;

    const connectionMatch = response
      ? connectionTypesMatch(wbs.connectionType, responseConnType)
      : false;

    results.push({
      date: wbs.date,
      wbsOrder,
      responseOrderNumber: responseOrderNum,
      wbsType: wbs.orderType || '',
      responseFttrOrderType: responseFttrType,
      wbsConnectionType: wbs.connectionType || '',
      responseConnectionType: responseConnType,
      wbsNceSN: wbs.nceSN || '',
      orderMatch,
      typeMatch,
      connectionMatch,
    });
  }

  return results;
}

// ─────────────────────────────────────────────────────────
// Phase 1: Order Validation (WBS ↔ Response) — kept for compatibility
// ─────────────────────────────────────────────────────────

export function validateOrders(
  wbsRecords: IWbsRecord[],
  responseRecords: IResponseRecord[],
): IOrderValidationResult[] {
  // Build a set of response order numbers for O(1) lookup
  const responseMap = new Map<string, IResponseRecord>();
  for (const r of responseRecords) {
    const key = String(r.orderNumber).trim();
    if (key) responseMap.set(key, r);
  }

  const results: IOrderValidationResult[] = [];
  for (const wbs of wbsRecords) {
    const orderNum = String(wbs.orderNumber).trim();
    if (!orderNum) continue;

    const response = responseMap.get(orderNum);
    results.push({
      orderNumber: orderNum,
      wbsTeam: wbs.team,
      wbsOrderType: wbs.orderType,
      wbsConnectionType: wbs.connectionType,
      foundInResponse: !!response,
      responseOrderType: response?.fttrOrderType || '',
      responseConnectionType: response?.connectionType || '',
      status: response ? 'OK' : 'Not Found',
    });
  }

  return results;
}

// ─────────────────────────────────────────────────────────
// Phase 2: Delivery Validation (Response ↔ Delivery) — kept for compatibility
// ─────────────────────────────────────────────────────────

export function validateDelivery(
  responseRecords: IResponseRecord[],
  deliveryRecords: IDeliveryRecord[],
): IDeliveryValidationResult[] {
  const deliveryMap = new Map<string, IDeliveryRecord>();
  for (const d of deliveryRecords) {
    const key = String(d.orderNumber).trim();
    if (key) deliveryMap.set(key, d);
  }

  const results: IDeliveryValidationResult[] = [];
  for (const resp of responseRecords) {
    const orderNum = String(resp.orderNumber).trim();
    if (!orderNum) continue;

    const delivery = deliveryMap.get(orderNum);
    results.push({
      orderNumber: orderNum,
      responseOrderType: resp.fttrOrderType,
      responseConnectionType: resp.connectionType,
      foundInDelivery: !!delivery,
      deliveryOrderType: delivery?.orderType || '',
      deliveryCloseType: delivery?.closeType || '',
      status: delivery ? 'OK' : 'Not Found',
    });
  }

  return results;
}

export function validateSortOrder(
  wbsRecords: IWbsRecord[],
  deliveryRecords: IDeliveryRecord[],
): ISortValidationResult {
  const wbsOrders = wbsRecords.map((r) => String(r.orderNumber).trim()).filter(Boolean).sort();
  const deliveryOrders = deliveryRecords.map((r) => String(r.orderNumber).trim()).filter(Boolean).sort();

  const wbsSet = new Set(wbsOrders);
  const deliverySet = new Set(deliveryOrders);

  const missingInDelivery = wbsOrders.filter((o) => !deliverySet.has(o));
  const missingInWbs = deliveryOrders.filter((o) => !wbsSet.has(o));

  const sequenceMatch = wbsOrders.length === deliveryOrders.length &&
    wbsOrders.every((o, i) => o === deliveryOrders[i]);

  return {
    totalWbs: wbsOrders.length,
    totalDelivery: deliveryOrders.length,
    countMatch: wbsOrders.length === deliveryOrders.length,
    sequenceMatch,
    missingInDelivery: [...new Set(missingInDelivery)],
    missingInWbs: [...new Set(missingInWbs)],
  };
}

// ─────────────────────────────────────────────────────────
// Phase 3: Cross-Verification & Type Matching — kept for compatibility
// ─────────────────────────────────────────────────────────

const TYPE_MAPPING_RULES: Array<{ wbsPatterns: string[]; deliveryPatterns: string[] }> = [
  { wbsPatterns: ['new', 'internal'], deliveryPatterns: ['new fttr', 'new'] },
  { wbsPatterns: ['external', 'external shift', 'external-shift'], deliveryPatterns: ['external', 'external - shift', 'external-shift', 'external shift'] },
  { wbsPatterns: ['reprovide'], deliveryPatterns: ['reprovide'] },
  { wbsPatterns: ['internal shift'], deliveryPatterns: ['internal shift', 'internal - shift'] },
  { wbsPatterns: ['internal'], deliveryPatterns: ['internal'] },
];

function typesMatch(wbsType: string, deliveryType: string): boolean {
  const wbsNorm = normalizeType(wbsType);
  const delNorm = normalizeType(deliveryType);

  // Direct match
  if (wbsNorm === delNorm) return true;

  // Check mapping rules
  for (const rule of TYPE_MAPPING_RULES) {
    const wbsMatches = rule.wbsPatterns.some((p) => wbsNorm.includes(p));
    const delMatches = rule.deliveryPatterns.some((p) => delNorm.includes(p));
    if (wbsMatches && delMatches) return true;
  }

  return false;
}

export function crossVerify(
  wbsRecords: IWbsRecord[],
  deliveryRecords: IDeliveryRecord[],
): ICrossVerificationResult[] {
  const deliveryMap = new Map<string, IDeliveryRecord>();
  for (const d of deliveryRecords) {
    const key = String(d.orderNumber).trim();
    if (key) deliveryMap.set(key, d);
  }

  const results: ICrossVerificationResult[] = [];
  for (const wbs of wbsRecords) {
    const orderNum = String(wbs.orderNumber).trim();
    if (!orderNum) continue;

    const delivery = deliveryMap.get(orderNum);
    const wbsType = wbs.orderType || wbs.connectionType;
    const delType = delivery?.orderType || '';
    const match = delivery ? typesMatch(wbsType, delType) : false;

    results.push({
      orderNumber: orderNum,
      wbsOrderType: wbsType,
      wbsConnectionType: wbs.connectionType,
      deliveryOrderType: delType,
      deliveryCloseType: delivery?.closeType || '',
      typeMatch: match,
      nceSN: wbs.nceSN || '',
      copiedToDelivery: match && !!wbs.nceSN,
    });
  }

  return results;
}

// ─────────────────────────────────────────────────────────
// ONT + CPE Verification
// ─────────────────────────────────────────────────────────

interface SheetConfig {
  ontCheckHeader: string;
  sheetName: string;
  serialCol: string;
  poCol: string;
  assetDescriptionCol?: string;
}

const SHEET_CONFIGS: SheetConfig[] = [
  { ontCheckHeader: 'W6', sheetName: 'Wifi 6 ONT Summary', serialCol: 'H', poCol: 'B', assetDescriptionCol: 'J' },
  { ontCheckHeader: 'H5', sheetName: 'Voice H5 ONT Summary', serialCol: 'B', poCol: 'D', assetDescriptionCol: 'C' },
  { ontCheckHeader: 'X8', sheetName: '8X ONT ', serialCol: 'B', poCol: 'D', assetDescriptionCol: 'C' },
  { ontCheckHeader: 'W5', sheetName: 'W5', serialCol: 'I', poCol: 'C' },
  { ontCheckHeader: 'Amwaj', sheetName: 'Amwaj', serialCol: 'A', poCol: 'C' },
  { ontCheckHeader: 'FTTR', sheetName: 'FTTR', serialCol: 'E', poCol: 'B' },
  { ontCheckHeader: 'W6 Retrived', sheetName: 'Wifi 6 ONT Summary', serialCol: 'H', poCol: 'B', assetDescriptionCol: 'J' },
  { ontCheckHeader: 'FTTRF50', sheetName: 'FTTR F50', serialCol: 'G', poCol: 'H' },
  { ontCheckHeader: 'iFTTRF50 - 91', sheetName: 'IFTTR F50 91', serialCol: 'G', poCol: 'H' },
  { ontCheckHeader: 'iFTTR F50 600', sheetName: 'IFTTR F50 600', serialCol: 'G', poCol: 'H' },
];

function buildSheetLookup(
  workbook: XLSX.WorkBook,
  config: SheetConfig,
): Map<string, { poNumber: string; assetDescription: string }> {
  const sheet = workbook.Sheets[config.sheetName];
  if (!sheet || !sheet['!ref']) return new Map();

  const range = XLSX.utils.decode_range(sheet['!ref']);
  const lookup = new Map<string, { poNumber: string; assetDescription: string }>();

  for (let r = range.s.r; r <= range.e.r; r++) {
    const serialCell = sheet[XLSX.utils.encode_cell({ r, c: XLSX.utils.decode_col(config.serialCol) })];
    const poCell = sheet[XLSX.utils.encode_cell({ r, c: XLSX.utils.decode_col(config.poCol) })];
    const assetCell = config.assetDescriptionCol
      ? sheet[XLSX.utils.encode_cell({ r, c: XLSX.utils.decode_col(config.assetDescriptionCol) })]
      : undefined;

    if (serialCell) {
      const serial = String(serialCell.v ?? '').trim().toUpperCase();
      const po = String(poCell?.v ?? '').trim();
      if (serial && serial.length > 3) {
        lookup.set(serial, {
          poNumber: po,
          assetDescription: String(assetCell?.v ?? config.ontCheckHeader).trim() || config.ontCheckHeader,
        });
      }
    }
  }

  return lookup;
}

/**
 * Build ONT lookup that returns PO Number AND the sheet name(s) where found.
 * Supports multiple matches across sheets (for Scenario B notes).
 */
function buildOntLookupWithSheetNames(
  workbook: XLSX.WorkBook,
): Map<string, { poNumber: string; assetDescription: string; sheetNames: string[] }> {
  const lookup = new Map<string, { poNumber: string; assetDescription: string; sheetNames: string[] }>();

  for (const config of SHEET_CONFIGS) {
    const sheet = workbook.Sheets[config.sheetName];
    if (!sheet || !sheet['!ref']) continue;

    const range = XLSX.utils.decode_range(sheet['!ref']);

    for (let r = range.s.r; r <= range.e.r; r++) {
      const serialCell = sheet[XLSX.utils.encode_cell({ r, c: XLSX.utils.decode_col(config.serialCol) })];
      const poCell = sheet[XLSX.utils.encode_cell({ r, c: XLSX.utils.decode_col(config.poCol) })];
      const assetCell = config.assetDescriptionCol
        ? sheet[XLSX.utils.encode_cell({ r, c: XLSX.utils.decode_col(config.assetDescriptionCol) })]
        : undefined;

      if (serialCell) {
        const serial = String(serialCell.v ?? '').trim().toUpperCase();
        const po = String(poCell?.v ?? '').trim();
        if (serial && serial.length > 3) {
          const existing = lookup.get(serial);
          if (existing) {
            // Add sheet name if not already present
            if (!existing.sheetNames.includes(config.sheetName)) {
              existing.sheetNames.push(config.sheetName);
            }
          } else {
            lookup.set(serial, {
              poNumber: po,
              assetDescription: String(assetCell?.v ?? config.ontCheckHeader).trim() || config.ontCheckHeader,
              sheetNames: [config.sheetName],
            });
          }
        }
      }
    }
  }

  return lookup;
}

/**
 * Build CPE Database serial number lookup.
 */
function buildCpeLookup(): Map<string, boolean> {
  const cpeFilePaths = [
    path.resolve(process.cwd(), '..', 'CPE DATA BASE (1).xlsx'),
    path.resolve(process.cwd(), 'CPE DATA BASE (1).xlsx'),
  ];

  let cpeFile = '';
  for (const fp of cpeFilePaths) {
    if (fs.existsSync(fp)) {
      cpeFile = fp;
      break;
    }
  }

  if (!cpeFile) {
    console.warn('CPE Database file not found');
    return new Map();
  }

  const workbook = XLSX.readFile(cpeFile, { type: 'file' });
  const lookup = new Map<string, boolean>();

  // Check across all year sheets for Serial Number column
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet || !sheet['!ref']) continue;

    const range = XLSX.utils.decode_range(sheet['!ref']);

    // Find "Serial Number" header column
    let serialCol = -1;
    for (let r = 0; r <= Math.min(2, range.e.r); r++) {
      for (let c = 0; c <= range.e.c; c++) {
        const cell = sheet[XLSX.utils.encode_cell({ r, c })];
        if (cell && String(cell.v || '').toLowerCase().includes('serial number')) {
          serialCol = c;
          break;
        }
      }
      if (serialCol >= 0) break;
    }

    if (serialCol < 0) continue;

    for (let r = 2; r <= range.e.r; r++) {
      const cell = sheet[XLSX.utils.encode_cell({ r, c: serialCol })];
      if (cell && cell.v) {
        const serial = String(cell.v).trim().toUpperCase();
        if (serial.length > 3) {
          lookup.set(serial, true);
        }
      }
    }
  }

  return lookup;
}

/**
 * Build CPE Database order number lookup.
 * Searches all sheets that contain an "Order Number" column.
 */
function buildCpeOrderLookup(): Map<string, boolean> {
  const cpeFilePaths = [
    path.resolve(process.cwd(), '..', 'CPE DATA BASE (1).xlsx'),
    path.resolve(process.cwd(), 'CPE DATA BASE (1).xlsx'),
  ];

  let cpeFile = '';
  for (const fp of cpeFilePaths) {
    if (fs.existsSync(fp)) {
      cpeFile = fp;
      break;
    }
  }

  if (!cpeFile) {
    console.warn('CPE Database file not found');
    return new Map();
  }

  const workbook = XLSX.readFile(cpeFile, { type: 'file' });
  const lookup = new Map<string, boolean>();

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet || !sheet['!ref']) continue;

    const range = XLSX.utils.decode_range(sheet['!ref']);

    // Find "Order Number" header column
    let orderCol = -1;
    for (let r = 0; r <= Math.min(2, range.e.r); r++) {
      for (let c = 0; c <= range.e.c; c++) {
        const cell = sheet[XLSX.utils.encode_cell({ r, c })];
        if (cell && String(cell.v || '').toLowerCase().includes('order number')) {
          orderCol = c;
          break;
        }
      }
      if (orderCol >= 0) break;
    }

    if (orderCol < 0) continue;

    for (let r = 2; r <= range.e.r; r++) {
      const cell = sheet[XLSX.utils.encode_cell({ r, c: orderCol })];
      if (cell && cell.v) {
        const order = String(cell.v).trim();
        if (order.length > 0) {
          lookup.set(order, true);
        }
      }
    }
  }

  return lookup;
}

/**
 * Cross Verification & ONT Check — combined Scenarios A and B.
 *
 * Scenario A (Type != New):
 *   Search Nce SN in ONT UPDATE → if PO found → search WBS Order in CPE DB
 *   → if Order NOT found in CPE → highlight red (Investigate)
 *   → if Order found in CPE OR PO not found → OK
 *
 * Scenario B (Type = New):
 *   Search Nce SN in ONT UPDATE → if PO found → display record with sheet notes
 */
export function crossVerifyOntCheck(
  wbsRecords: IWbsRecord[],
  responseRecords?: IResponseRecord[],
): ICrossVerifyOntRecord[] {
  // Requirement: If order number is not filled by technicians (not in response), skip it
  let filteredWbs = wbsRecords;
  if (responseRecords && responseRecords.length > 0) {
    const responseOrderSet = new Set(
      responseRecords
        .map((r) => String(r.orderNumber).trim())
        .filter(Boolean),
    );
    filteredWbs = wbsRecords.filter((w) => {
      const orderNum = String(w.orderNumber).trim();
      return orderNum && responseOrderSet.has(orderNum);
    });
  }
  // Resolve ONT UPDATE file path
  const ontFilePaths = [
    path.resolve(process.cwd(), '..', 'ONT UPDATE.xlsx'),
    path.resolve(process.cwd(), 'ONT UPDATE.xlsx'),
  ];

  let ontFilePath = '';
  for (const fp of ontFilePaths) {
    if (fs.existsSync(fp)) {
      ontFilePath = fp;
      break;
    }
  }

  if (!ontFilePath) {
    throw new Error('ONT UPDATE file not found');
  }

  const ontWorkbook = XLSX.readFile(ontFilePath, { type: 'file' });

  // Build ONT lookup with sheet names (for Scenario B notes)
  const ontLookup = buildOntLookupWithSheetNames(ontWorkbook);

  // Build CPE Order Number lookup (for Scenario A)
  const cpeOrderLookup = buildCpeOrderLookup();

  const results: ICrossVerifyOntRecord[] = [];

  for (const wbs of filteredWbs) {
    const orderNum = String(wbs.orderNumber).trim();
    if (!orderNum) continue;

    const wbsType = normalizeType(wbs.orderType);
    const isNew = wbsType === 'new';
    const nceSN = (wbs.nceSN || '').trim();
    const serialUpper = nceSN.toUpperCase();

    if (!isNew) {
      // ── Scenario A: Type != New ──
      const ontMatch = serialUpper ? ontLookup.get(serialUpper) : undefined;

      if (ontMatch && ontMatch.poNumber && ontMatch.poNumber !== '' && ontMatch.poNumber !== 'N/A') {
        // PO Number found → check CPE Database for the WBS Order Number
        const foundInCpe = cpeOrderLookup.has(orderNum);

        results.push({
          date: wbs.date,
          team: wbs.team,
          orderNumber: orderNum,
          orderType: wbs.orderType,
          connectionType: wbs.connectionType,
          nceSN,
          scenario: 'A',
          poNumber: ontMatch.poNumber,
          foundInOnt: true,
          foundInCpe,
          status: foundInCpe ? 'OK' : 'Investigate',
          notes: foundInCpe ? '' : 'Order not found in CPE Database',
        });
      } else {
        // PO Number NOT found → Status = OK
        results.push({
          date: wbs.date,
          team: wbs.team,
          orderNumber: orderNum,
          orderType: wbs.orderType,
          connectionType: wbs.connectionType,
          nceSN,
          scenario: 'A',
          poNumber: '',
          foundInOnt: !!ontMatch,
          foundInCpe: false,
          status: 'OK',
          notes: '',
        });
      }
    } else {
      // ── Scenario B: Type = New ──
      const ontMatch = serialUpper ? ontLookup.get(serialUpper) : undefined;

      if (ontMatch && ontMatch.poNumber && ontMatch.poNumber !== '' && ontMatch.poNumber !== 'N/A') {
        // PO found → display full record
        results.push({
          date: wbs.date,
          team: wbs.team,
          orderNumber: orderNum,
          orderType: wbs.orderType,
          connectionType: wbs.connectionType,
          nceSN,
          scenario: 'B',
          poNumber: ontMatch.poNumber,
          foundInOnt: true,
          foundInCpe: false,
          status: 'OK',
          notes: ontMatch.sheetNames.join(', '),
        });
      } else {
        // PO not found
        results.push({
          date: wbs.date,
          team: wbs.team,
          orderNumber: orderNum,
          orderType: wbs.orderType,
          connectionType: wbs.connectionType,
          nceSN,
          scenario: 'B',
          poNumber: '',
          foundInOnt: false,
          foundInCpe: false,
          status: 'OK',
          notes: '',
        });
      }
    }
  }

  return results;
}

// ─────────────────────────────────────────────────────────
// Legacy ONT + CPE verification (kept for compatibility)
// ─────────────────────────────────────────────────────────

export function verifyOntAndCpe(
  serialNumbers: string[],
  sourceRecords: Array<{ serialNumber: string; orderNumber: string }>,
  dateFilter?: string,
): IOntVerificationResult[] {
  // Resolve ONT UPDATE file path
  const ontFilePaths = [
    path.resolve(process.cwd(), '..', 'ONT UPDATE.xlsx'),
    path.resolve(process.cwd(), '..', 'ONT UPDATE.xlsx'),
    path.resolve(process.cwd(), 'ONT UPDATE.xlsx'),
    path.resolve(process.cwd(), 'ONT UPDATE.xlsx'),
  ];

  let ontFilePath = '';
  for (const fp of ontFilePaths) {
    if (fs.existsSync(fp)) {
      ontFilePath = fp;
      break;
    }
  }

  if (!ontFilePath) {
    throw new Error('ONT UPDATE file not found');
  }

  const ontWorkbook = XLSX.readFile(ontFilePath, { type: 'file' });

  // Build ONT lookup maps
  const sheetLookups = new Map<string, Map<string, { poNumber: string; assetDescription: string }>>();
  for (const config of SHEET_CONFIGS) {
    if (!sheetLookups.has(config.sheetName)) {
      sheetLookups.set(config.sheetName, buildSheetLookup(ontWorkbook, config));
    }
  }

  // Build CPE lookup
  const cpeLookup = buildCpeLookup();

  // Build order number mapping from source records
  const serialToOrder = new Map<string, string>();
  for (const row of sourceRecords) {
    if (row.serialNumber) {
      serialToOrder.set(row.serialNumber.trim().toUpperCase(), row.orderNumber);
    }
  }

  const results: IOntVerificationResult[] = [];
  const uppercaseSerials = serialNumbers.map((s) => s.trim().toUpperCase()).filter(Boolean);

  for (const serial of uppercaseSerials) {
    if (!serial) continue;

    let foundInOnt = false;
    let poNumber = '';
    let ontName = '-';

    // Search ONT UPDATE sheets
    for (const config of SHEET_CONFIGS) {
      const lookup = sheetLookups.get(config.sheetName);
      if (!lookup) continue;

      const ont = lookup.get(serial);
      if (ont !== undefined) {
        foundInOnt = true;
        poNumber = ont.poNumber || 'N/A';
        ontName = config.ontCheckHeader;
        break;
      }
    }

    // If found in ONT, check CPE Database
    const foundInCpe = cpeLookup.has(serial);
    const needsInvestigation = foundInOnt && !!poNumber && poNumber !== 'Not Found' && !foundInCpe;

    results.push({
      serialNumber: serial,
      orderNumber: serialToOrder.get(serial) || '',
      poNumber: foundInOnt ? poNumber : 'Not Found',
      ontName,
      foundInOnt,
      foundInCpe,
      needsInvestigation,
      source: foundInOnt ? 'ONT UPDATE' : 'Not Found',
    });
  }

  return results;
}

function getProjectType(orderNumber: string): IFinalOutputRecord['projectType'] {
  const order = String(orderNumber || '').trim();
  if (order.startsWith('200')) return 'Service Assurance';
  if (order.startsWith('2')) return 'Service Delivery';
  return 'Unknown';
}

/**
 * Build a combined ONT lookup from ONT UPDATE file once, for all serial numbers.
 * This avoids re-reading the ONT file for every serial number (massive perf improvement).
 */
function buildFullOntLookup(): Map<string, { poNumber: string; assetDescription: string }> {
  const ontFilePaths = [
    path.resolve(process.cwd(), '..', 'ONT UPDATE.xlsx'),
    path.resolve(process.cwd(), 'ONT UPDATE.xlsx'),
  ];
  const filePath = ontFilePaths.find((fp) => fs.existsSync(fp));
  if (!filePath) return new Map();

  const workbook = XLSX.readFile(filePath, { type: 'file' });
  const combined = new Map<string, { poNumber: string; assetDescription: string }>();

  for (const config of SHEET_CONFIGS) {
    const lookup = buildSheetLookup(workbook, config);
    for (const [serial, data] of lookup) {
      if (!combined.has(serial)) {
        combined.set(serial, data);
      }
    }
  }

  return combined;
}

function calculateCharges(record: IWbsRecord, projectType: IFinalOutputRecord['projectType'], assetDescription: string) {
  const desc = [
    record.lineDescription1,
    record.lineDescription2,
    record.lineDescription3,
    record.lineDescription4,
    record.connectionType,
    assetDescription,
  ].join(' ').toLowerCase();

  if (projectType === 'Service Assurance') {
    if (desc.includes('h5')) return { labourCharge: 0, cpeCharge: 10 };
    if (desc.includes('wifi') || desc.includes('w6') || desc.includes('fttr') || desc.includes('f50')) {
      return { labourCharge: 0, cpeCharge: 15 };
    }
    return { labourCharge: 0, cpeCharge: 0 };
  }

  if (desc.includes('fttr') || desc.includes('f50')) return { labourCharge: 25, cpeCharge: 15 };
  if (desc.includes('wifi') || desc.includes('w6')) return { labourCharge: 20, cpeCharge: 15 };
  if (desc.includes('h5')) return { labourCharge: 15, cpeCharge: 10 };
  if (desc.includes('new')) return { labourCharge: 10, cpeCharge: 0 };
  return { labourCharge: 0, cpeCharge: 0 };
}

export function buildFinalOutput(wbsRecords: IWbsRecord[]): IFinalOutputRecord[] {
  // Build ONT lookup ONCE upfront instead of per-serial (major perf fix)
  const ontLookup = buildFullOntLookup();

  return wbsRecords
    .filter((record) => {
      const action = normalizeType(record.actioned);
      const type = normalizeType(record.orderType);
      return action === 'delivered' && type === 'new';
    })
    .map((record) => {
      const serialNumber = (record.nceSN || '').trim();
      const cacheKey = serialNumber.toUpperCase();
      const ont = serialNumber && ontLookup.has(cacheKey)
        ? ontLookup.get(cacheKey)!
        : { poNumber: '', assetDescription: '' };
      const projectType = getProjectType(record.orderNumber);
      const charges = calculateCharges(record, projectType, ont.assetDescription);
      const warnings: string[] = [];
      if (!serialNumber) warnings.push('Missing Serial Number');
      if (serialNumber && !ont.poNumber) warnings.push('Missing PO mapping');
      if (!record.date) warnings.push('Invalid or missing date');

      return {
        orderNumber: record.orderNumber,
        projectType,
        wbsType: record.orderType || '',
        date: record.date,
        exchange: record.exchange,
        lo: record.lo,
        connectionType: record.connectionType,
        serialNumber,
        poNumber: ont.poNumber,
        assetDescription: ont.assetDescription,
        labourCharge: charges.labourCharge,
        cpeCharge: charges.cpeCharge,
        warnings,
      };
    });
}

// ─────────────────────────────────────────────────────────
// Phase 5: Final Categorization
// ─────────────────────────────────────────────────────────

export function categorizeDeliveryOrders(
  deliveryRecords: IDeliveryRecord[],
): ICategorizeResult[] {
  // Filter only "New" orders, exclude Internal/External
  const newOrders = deliveryRecords.filter((r) => {
    const orderType = normalizeType(r.orderType);
    return (
      orderType.includes('new') &&
      !orderType.includes('internal') &&
      !orderType.includes('external')
    );
  });

  const results: ICategorizeResult[] = [];
  for (const order of newOrders) {
    const addNoted = normalizeType(order.addNoted);
    const orderType = normalizeType(order.orderType);

    let colAB: number | null = null;
    let colAC: number | null = null;
    let productCode = '';

    // Product coding rules
    if (
      addNoted.includes('w6') ||
      addNoted.includes('wifi 6') ||
      addNoted.includes('wifi-6') ||
      orderType.includes('f50') ||
      addNoted.includes('f50') ||
      orderType.includes('fttr') ||
      addNoted.includes('fttr')
    ) {
      colAB = 1;
      productCode = 'W6/F50/FTTR';
    }

    if (addNoted.includes('h5') || orderType.includes('h5')) {
      colAC = 1;
      productCode = 'H5';
    }

    results.push({
      orderNumber: order.orderNumber,
      orderType: order.orderType,
      serialNumber: order.ontSerialNumber || '',
      ontReservationNo: order.ontReservationNo || '',
      productCode,
      colAB,
      colAC,
    });
  }

  return results;
}
