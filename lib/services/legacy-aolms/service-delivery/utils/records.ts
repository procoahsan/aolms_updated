import 'server-only';
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

