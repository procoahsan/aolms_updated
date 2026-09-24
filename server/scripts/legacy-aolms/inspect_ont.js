const XLSX = require('./backend/node_modules/xlsx');

const wb = XLSX.readFile('./ONT UPDATE.xlsx');
console.log('Sheet Names:', JSON.stringify(wb.SheetNames));

wb.SheetNames.forEach(name => {
  const sheet = wb.Sheets[name];
  const ref = sheet['!ref'] || 'empty';
  console.log('\nSheet: "' + name + '", Range: ' + ref);
  if (ref === 'empty') return;
  const range = XLSX.utils.decode_range(ref);
  for (let r = range.s.r; r <= Math.min(range.s.r + 2, range.e.r); r++) {
    let rowVals = [];
    for (let c = range.s.c; c <= Math.min(range.e.c, 15); c++) {
      const addr = XLSX.utils.encode_cell({r, c});
      const cell = sheet[addr];
      rowVals.push(addr + '=' + (cell ? String(cell.v).substring(0, 30) : ''));
    }
    console.log('  Row ' + r + ': ' + rowVals.join(' | '));
  }
});
