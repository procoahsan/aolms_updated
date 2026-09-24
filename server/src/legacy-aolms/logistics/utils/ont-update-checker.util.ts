import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

export interface IOntCheckResult {
  serialNumber: string;   // ONT S/N
  poNumber: string;       // ONT Reservation No.
  ontName: string;        // Add Noted (sheet/ONT type name)
}

/**
 * Sheet configuration: maps ONT Check header names to actual sheet names
 * and their serial number / PO number column positions.
 */
interface SheetConfig {
  ontCheckHeader: string;   // Header name in ONT Check sheet (B1, C1, etc.)
  sheetName: string;        // Actual sheet name in the workbook
  serialCol: string;        // Column letter containing serial numbers
  poCol: string;            // Column letter containing PO/reservation numbers
}

const SHEET_CONFIGS: SheetConfig[] = [
  { ontCheckHeader: 'W6',              sheetName: 'Wifi 6 ONT Summary',     serialCol: 'H', poCol: 'B' },
  { ontCheckHeader: 'H5',              sheetName: 'Voice H5 ONT Summary',   serialCol: 'B', poCol: 'D' },
  { ontCheckHeader: 'X8',              sheetName: '8X ONT ',                serialCol: 'B', poCol: 'D' },
  { ontCheckHeader: 'W5',              sheetName: 'W5',                     serialCol: 'I', poCol: 'C' },
  { ontCheckHeader: 'Amwaj',           sheetName: 'Amwaj',                  serialCol: 'A', poCol: 'C' },
  { ontCheckHeader: 'FTTR',            sheetName: 'FTTR',                   serialCol: 'E', poCol: 'B' },
  { ontCheckHeader: 'W6 Retrived',     sheetName: 'Wifi 6 ONT Summary',     serialCol: 'H', poCol: 'B' },
  { ontCheckHeader: 'FTTRF50',         sheetName: 'FTTR F50',               serialCol: 'G', poCol: 'H' },
  { ontCheckHeader: 'iFTTRF50 - 91',   sheetName: 'IFTTR F50 91',          serialCol: 'G', poCol: 'H' },
  { ontCheckHeader: 'iFTTR F50 600',   sheetName: 'IFTTR F50 600',         serialCol: 'G', poCol: 'H' },
];

/**
 * Build lookup maps for each sheet: serialNumber -> PO number.
 */
function buildSheetLookup(
  workbook: XLSX.WorkBook,
  config: SheetConfig,
): Map<string, string> {
  const sheet = workbook.Sheets[config.sheetName];
  if (!sheet || !sheet['!ref']) return new Map();

  const range = XLSX.utils.decode_range(sheet['!ref']);
  const lookup = new Map<string, string>();

  for (let r = range.s.r; r <= range.e.r; r++) {
    const serialCell = sheet[XLSX.utils.encode_cell({ r, c: XLSX.utils.decode_col(config.serialCol) })];
    const poCell = sheet[XLSX.utils.encode_cell({ r, c: XLSX.utils.decode_col(config.poCol) })];

    if (serialCell) {
      const serial = String(serialCell.v ?? '').trim().toUpperCase();
      const po = String(poCell?.v ?? '').trim();
      if (serial && serial.length > 3) {
        lookup.set(serial, po);
      }
    }
  }

  return lookup;
}

/**
 * Check an array of serial numbers against the ONT UPDATE Excel file.
 * Returns found serial numbers with their PO numbers and ONT names.
 */
export function checkOntUpdate(serialNumbers: string[]): IOntCheckResult[] {
  // Resolve ONT UPDATE file path (project root)
  const ontFilePath = path.resolve(process.cwd(), '..', 'ONT UPDATE.xlsx');

  // Fallback paths
  const fallbackPaths = [
    path.resolve(process.cwd(), 'ONT UPDATE.xlsx'),
    path.resolve('../ONT UPDATE.xlsx'),
  ];

  let filePath = ontFilePath;
  if (!fs.existsSync(filePath)) {
    for (const fp of fallbackPaths) {
      if (fs.existsSync(fp)) {
        filePath = fp;
        break;
      }
    }
  }

  if (!fs.existsSync(filePath)) {
    throw new Error(`ONT UPDATE file not found. Searched: ${ontFilePath}, ${fallbackPaths.join(', ')}`);
  }

  const workbook = XLSX.readFile(filePath, { type: 'file' });

  // Build lookup maps for each sheet
  const sheetLookups = new Map<string, Map<string, string>>();
  for (const config of SHEET_CONFIGS) {
    if (!sheetLookups.has(config.sheetName)) {
      sheetLookups.set(config.sheetName, buildSheetLookup(workbook, config));
    }
  }

  // Check each serial number across all sheets
  const results: IOntCheckResult[] = [];
  const uppercaseSerials = serialNumbers.map(s => s.trim().toUpperCase());

  for (const serial of uppercaseSerials) {
    if (!serial) continue;

    let found = false;
    for (const config of SHEET_CONFIGS) {
      const lookup = sheetLookups.get(config.sheetName);
      if (!lookup) continue;

      const po = lookup.get(serial);
      if (po !== undefined) {
        results.push({
          serialNumber: serial,
          poNumber: po || 'N/A',
          ontName: config.ontCheckHeader,
        });
        found = true;
        break; // Stop at first match
      }
    }

    if (!found) {
      results.push({
        serialNumber: serial,
        poNumber: 'Not Found',
        ontName: '-',
      });
    }
  }

  return results;
}
