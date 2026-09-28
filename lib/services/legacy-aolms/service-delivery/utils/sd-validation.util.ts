import 'server-only';
import {
  IWbsRecord,
  IResponseRecord,
  IDeliveryRecord,
} from './records';

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
  projectType: 'Service Delivery' | 'Service Assurance' | 'Unknown';
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
  return (t || '').toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
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
    const t = ct.toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();

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

export function crossVerifyOntCheck(
  wbsRecords: IWbsRecord[],
  responseRecords: IResponseRecord[],
  ontLookup: Map<string,{poNumber:string;assetDescription:string;sheetNames:string[]}>,
  cpeOrderLookup: Map<string,boolean>,
): ICrossVerifyOntRecord[] {
  // Requirement: If order number is not filled by technicians (not in response), skip it
  let filteredWbs = wbsRecords;
  if (responseRecords) {
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

function getProjectType(orderNumber: string): IFinalOutputRecord['projectType'] {
  const order = String(orderNumber || '').trim();
  if (order.startsWith('200')) return 'Service Delivery';
  if (order.startsWith('2')) return 'Service Assurance';
  return 'Unknown';
}

/**
 * Build a combined ONT lookup from ONT UPDATE file once, for all serial numbers.
 * This avoids re-reading the ONT file for every serial number (massive perf improvement).
 */
function calculateCharges(record: IWbsRecord, projectType: IFinalOutputRecord['projectType'], assetDescription: string) {
  const desc = [
    record.lineDescription1,
    record.lineDescription2,
    record.lineDescription3,
    record.lineDescription4,
    record.connectionType,
    assetDescription,
  ].join(' ').toLowerCase();

  if (projectType === 'Service Delivery') {
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

export function buildFinalOutput(wbsRecords: IWbsRecord[], ontLookup:Map<string,{poNumber:string;assetDescription:string}>): IFinalOutputRecord[] {

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
