import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { IStaffMember } from '../interfaces/staff.interface';

const COLUMN_MAP: Record<string, keyof IStaffMember> = {
  'Name': 'name',
  'Contact personal': 'contactPersonal',
  'Contact (office)': 'contactOffice',
  'CPR': 'cpr',
  'CPR expiry': 'cprExpiry',
  'CON ID Bnet': 'conIdBnet',
  'Bnet Id expiry': 'bnetIdExpiry',
  'CON ID Batelco': 'conIdBatelco',
  'Batelco expiry': 'batelcoExpiry',
  'RP expiry / Contract expiry (1 day before expiry)': 'rpExpiry',
  'Nationality': 'nationality',
  'Passport expiry': 'passportExpiry',
  'NOC': 'noc',
  'Picture': 'picture',
  'Visa': 'visa',
  'Missing data': 'missingData',
  'Check Bnet Card': 'checkBnetCard',
  'Check CPR Expiry': 'checkCprExpiry',
  'Check RP expiry': 'checkRpExpiry',
  'Check passport expiry': 'checkPassportExpiry',
  'Check Batelco Expiry': 'checkBatelcoExpiry',
  'Comments on expiry': 'commentsOnExpiry',
  'Bnet card status': 'bnetCardStatus',
  'Active / resigned / notice period / LWD': 'status',
  'Staff category': 'staffCategory',
};

// Target sheet name in the Excel workbook
const TARGET_SHEET = 'staff details';

/**
 * Parse an Excel file from a file path on disk.
 * Reads the "staff details" sheet specifically.
 */
export function parseExcelFile(filePath: string): IStaffMember[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Excel file not found: ${filePath}`);
  }

  const workbook = XLSX.readFile(filePath, { cellDates: false });
  return parseWorkbook(workbook);
}

/**
 * Parse an Excel buffer (from file upload).
 */
export function parseExcelBuffer(buffer: Buffer): IStaffMember[] {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: false });
  return parseWorkbook(workbook);
}

/**
 * Core workbook parser — finds the best sheet and maps rows to IStaffMember.
 */
function parseWorkbook(workbook: XLSX.WorkBook): IStaffMember[] {
  // Try to find the "staff details" sheet first, fallback to first sheet
  let sheetName = workbook.SheetNames.find(
    (name) => name.toLowerCase() === TARGET_SHEET.toLowerCase(),
  );

  if (!sheetName) {
    // Fallback: look for any sheet that has matching headers
    for (const name of workbook.SheetNames) {
      const sheet = workbook.Sheets[name];
      const testData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
        defval: '',
        raw: false,
        range: 0,
      });
      if (testData.length > 0 && testData[0]['Name'] !== undefined) {
        sheetName = name;
        break;
      }
    }
  }

  if (!sheetName) {
    sheetName = workbook.SheetNames[0];
  }

  const sheet = workbook.Sheets[sheetName];

  // Use raw: false to get formatted date strings instead of serial numbers
  const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
    defval: '',
    raw: false,
  });

  const records: IStaffMember[] = [];

  for (let i = 0; i < jsonData.length; i++) {
    const row = jsonData[i];

    // Skip rows without a name
    const name = row['Name'];
    if (!name || String(name).trim() === '') continue;

    const staff: Record<string, any> = { id: records.length + 1 };

    for (const [excelCol, fieldName] of Object.entries(COLUMN_MAP)) {
      const value = row[excelCol];
      staff[fieldName] =
        value !== undefined && value !== null ? String(value).trim() : '';
    }

    records.push(staff as IStaffMember);
  }

  return records;
}

/**
 * Scan a directory for Excel files and return their paths.
 */
export function findExcelFiles(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) return [];

  return fs
    .readdirSync(dirPath)
    .filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return (ext === '.xlsx' || ext === '.xls') && !file.startsWith('~$');
    })
    .map((file) => path.join(dirPath, file));
}
