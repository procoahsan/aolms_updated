const XLSX = require('./backend/node_modules/xlsx');

const logWb = XLSX.readFile('./logistics.xlsx');
const logSheet = logWb.Sheets[logWb.SheetNames[0]];

// Print ALL headers with their column letters
const logRange = XLSX.utils.decode_range(logSheet['!ref']);
console.log('Total columns:', logRange.e.c + 1);
for (let c = 0; c <= logRange.e.c; c++) {
  const addr = XLSX.utils.encode_cell({r: 0, c});
  const cell = logSheet[addr];
  const colLetter = XLSX.utils.encode_col(c);
  if (cell) console.log(colLetter + ' (' + addr + '): ' + String(cell.v).substring(0, 60));
}

// Show a data row with the columns we care about
console.log('\n--- Sample data row (row 2) ---');
const importantCols = [0, 2, 3, 14, 15, 25, 26, 27, 28, 31, 32, 33, 34, 35];
importantCols.forEach(c => {
  const colLetter = XLSX.utils.encode_col(c);
  const hdrCell = logSheet[XLSX.utils.encode_cell({r: 0, c})];
  const dataCell = logSheet[XLSX.utils.encode_cell({r: 2, c})];
  console.log(colLetter + ': header="' + (hdrCell ? String(hdrCell.v).substring(0,40) : '') + '" value="' + (dataCell ? String(dataCell.v).substring(0,50) : '') + '"');
});

// Check form responses timestamp values
console.log('\n--- Team timestamps (first 10) ---');
const teamWb = XLSX.readFile('./team.xlsx');
const teamSheet = teamWb.Sheets['Form Responses 1'];
const teamRange = XLSX.utils.decode_range(teamSheet['!ref']);
for (let r = 1; r <= Math.min(10, teamRange.e.r); r++) {
  const cell = teamSheet[XLSX.utils.encode_cell({r, c: 0})];
  if (cell) {
    console.log('Row ' + r + ': raw=' + cell.v + ' type=' + cell.t);
  }
}
