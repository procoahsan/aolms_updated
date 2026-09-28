const XLSX = require('./backend/node_modules/xlsx');
const logWb = XLSX.readFile('./logistics.xlsx');
const logSheet = logWb.Sheets[logWb.SheetNames[0]];

// Find all columns with column letter mapping (header:'A' mode) for row 1
console.log('=== Using header:A mode (what parser uses) ===');
const jsonData = XLSX.utils.sheet_to_json(logSheet, { header: 'A', defval: '', raw: false });
console.log('Row count:', jsonData.length);
console.log('Row 0 (headers):', JSON.stringify(jsonData[0]).substring(0, 500));
console.log('\nRow 1 (first data):');
const r1 = jsonData[1];
console.log('  A (Date):', r1.A);
console.log('  C (Team):', r1.C);
console.log('  E (Package):', r1.E);
console.log('  O (LO Name):', r1.O);
console.log('  P (Ticket No):', r1.P);
console.log('  Z (Status):', r1.Z);
console.log('  AA:', r1.AA);
console.log('  AB:', r1.AB);
console.log('  AC:', r1.AC);
console.log('  AF:', r1.AF);
console.log('  AG:', r1.AG);
console.log('  AH:', r1.AH);
console.log('  AI:', r1.AI);
console.log('  AJ:', r1.AJ);

// What does the parser ACTUALLY get for column P (ticketNo)?
// In the header:A mode, P maps to the 16th column (0-indexed: 15)
// Column P in the file is "Creationdate/time"
// But in the parser, ticketNo is row['P'] which would be col P's data

// Let me also check column D (Ticket No in the file)
console.log('\n  D (should be Ticket No):', r1.D);

// Check what resolved looks like in column Z
console.log('\n=== Checking Z column for resolved values ===');
let resolvedCount = 0;
let sample = [];
for (let i = 1; i < Math.min(jsonData.length, 100); i++) {
  const z = String(jsonData[i].Z || '').toLowerCase();
  if (z.includes('resolved')) {
    resolvedCount++;
    if (sample.length < 3) sample.push(jsonData[i].Z);
  }
}
console.log('Rows with "resolved" in Z (first 100):', resolvedCount);
console.log('Samples:', sample);

// Check what's in column W (which is empty per header "  ")
console.log('\nW column first 3 data rows:', jsonData[1].W, '|', jsonData[2].W, '|', jsonData[3].W);

// Check if there's a Status column somewhere
console.log('\n=== Looking for Status column ===');
const headers = jsonData[0];
Object.keys(headers).forEach(k => {
  const v = String(headers[k]).toLowerCase();
  if (v.includes('status') || v.includes('resolved')) {
    console.log('  Column', k, ':', headers[k]);
  }
});
