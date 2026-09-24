const XLSX = require('./backend/node_modules/xlsx');

// Inspect team file
console.log('=== TEAM FILE ===');
const teamWb = XLSX.readFile('./team.xlsx');
console.log('Sheet Names:', JSON.stringify(teamWb.SheetNames));
teamWb.SheetNames.forEach(name => {
  const sheet = teamWb.Sheets[name];
  const ref = sheet['!ref'] || 'empty';
  console.log('\nSheet: "' + name + '", Range: ' + ref);
  if (ref === 'empty') return;
  const range = XLSX.utils.decode_range(ref);
  for (let r = range.s.r; r <= Math.min(range.s.r + 2, range.e.r); r++) {
    let rowVals = [];
    for (let c = range.s.c; c <= Math.min(range.e.c, 40); c++) {
      const addr = XLSX.utils.encode_cell({r, c});
      const cell = sheet[addr];
      if (cell) rowVals.push(addr + '=' + String(cell.v).substring(0, 40));
    }
    console.log('  Row ' + r + ': ' + rowVals.join(' | '));
  }
});

// Inspect logistics file - specifically AJ column header and a few values
console.log('\n\n=== LOGISTICS FILE ===');
const logWb = XLSX.readFile('./logistics.xlsx');
console.log('Sheet Names:', JSON.stringify(logWb.SheetNames));
const logSheet = logWb.Sheets[logWb.SheetNames[0]];
const logRef = logSheet['!ref'];
console.log('Range:', logRef);
// Print header row (row 0)
const logRange = XLSX.utils.decode_range(logRef);
let headers = [];
for (let c = 0; c <= Math.min(logRange.e.c, 40); c++) {
  const addr = XLSX.utils.encode_cell({r: 0, c});
  const cell = logSheet[addr];
  if (cell) headers.push(addr + '=' + String(cell.v).substring(0, 40));
}
console.log('Headers:', headers.join(' | '));

// Show AJ column (col 35) for a few rows
console.log('\nAJ column values (first 5 data rows):');
for (let r = 1; r <= 5; r++) {
  const ajCell = logSheet[XLSX.utils.encode_cell({r, c: 35})];
  const zCell = logSheet[XLSX.utils.encode_cell({r, c: 25})];
  const aCell = logSheet[XLSX.utils.encode_cell({r, c: 0})];
  console.log('  Row ' + r + ': A=' + (aCell ? aCell.v : '') + ' Z=' + (zCell ? zCell.v : '') + ' AJ=' + (ajCell ? ajCell.v : ''));
}

// Also check what's in the ONT Check sheet more closely
console.log('\n\n=== ONT CHECK SHEET - More Detail ===');
const ontWb = XLSX.readFile('./ONT UPDATE.xlsx');
const ontCheckSheet = ontWb.Sheets['ONT Check'];
if (ontCheckSheet) {
  const ontRef = ontCheckSheet['!ref'];
  console.log('Range:', ontRef);
  // Print header row
  const ontRange = XLSX.utils.decode_range(ontRef);
  let ontHeaders = [];
  for (let c = 0; c <= Math.min(ontRange.e.c, 20); c++) {
    const addr = XLSX.utils.encode_cell({r: 0, c});
    const cell = ontCheckSheet[addr];
    ontHeaders.push(addr + '=' + (cell ? String(cell.v).substring(0, 30) : ''));
  }
  console.log('Headers:', ontHeaders.join(' | '));
}

// Check W6 and related sheets for serial number and PO structure
console.log('\n=== Wifi 6 ONT Summary (W6) - structure ===');
const w6Sheet = ontWb.Sheets['Wifi 6 ONT Summary'];
if (w6Sheet) {
  const w6Range = XLSX.utils.decode_range(w6Sheet['!ref']);
  // header row
  let w6Headers = [];
  for (let c = 0; c <= Math.min(w6Range.e.c, 15); c++) {
    const addr = XLSX.utils.encode_cell({r: 0, c});
    const cell = w6Sheet[addr];
    w6Headers.push(addr + '=' + (cell ? String(cell.v).substring(0, 30) : ''));
  }
  console.log('Row 0:', w6Headers.join(' | '));
  // Check if row 0 is empty, look at row 1 for headers
  w6Headers = [];
  for (let c = 0; c <= Math.min(w6Range.e.c, 15); c++) {
    const addr = XLSX.utils.encode_cell({r: 1, c});
    const cell = w6Sheet[addr];
    w6Headers.push(addr + '=' + (cell ? String(cell.v).substring(0, 30) : ''));
  }
  console.log('Row 1:', w6Headers.join(' | '));
}

// Check H5 sheet (Voice H5)
console.log('\n=== Voice H5 - structure ===');
const h5Sheet = ontWb.Sheets['Voice H5 ONT Summary'];
if (h5Sheet) {
  const h5Range = XLSX.utils.decode_range(h5Sheet['!ref']);
  for (let r = 0; r <= Math.min(5, h5Range.e.r); r++) {
    let vals = [];
    for (let c = 0; c <= Math.min(h5Range.e.c, 15); c++) {
      const addr = XLSX.utils.encode_cell({r, c});
      const cell = h5Sheet[addr];
      if (cell) vals.push(addr + '=' + String(cell.v).substring(0, 30));
    }
    if (vals.length > 0) console.log('  Row ' + r + ': ' + vals.join(' | '));
  }
}

// Dec 2024 = W6 Retrieved?
console.log('\n=== Dec 2024 (possible W6 Retrieved) ===');
const decSheet = ontWb.Sheets['Dec 2024'];
if (decSheet) {
  const r0 = [];
  for (let c = 0; c <= 10; c++) {
    const cell = decSheet[XLSX.utils.encode_cell({r: 0, c})];
    if (cell) r0.push(XLSX.utils.encode_cell({r:0,c}) + '=' + String(cell.v).substring(0,30));
  }
  console.log('Row 0:', r0.join(' | '));
}
