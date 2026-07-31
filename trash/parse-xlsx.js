import XLSX from 'xlsx';
import { readFileSync } from 'fs';

const workbook = XLSX.readFile('/Users/parkmyeongsu/Documents/kiro/임시(카카오)/final/통합 문서1.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

// Print first 10 rows to understand structure
for (let i = 0; i < Math.min(30, data.length); i++) {
  console.log(`Row ${i}: ${JSON.stringify(data[i])}`);
}
console.log(`\nTotal rows: ${data.length}`);
