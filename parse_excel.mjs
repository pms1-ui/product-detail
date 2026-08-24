import XLSX from 'xlsx';
import { resolve } from 'path';

const wb = XLSX.readFile(resolve('01_data/260903/260903_data.xlsx'));
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

// 구성별(순서별) 그룹핑
const groups = {};
for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  if (!r || !r[0]) continue;
  const seq = r[0];
  if (!groups[seq]) {
    groups[seq] = {
      seq,
      model: r[3],
      name: r[5],
      tagPrice: r[6],
      dealPrice: r[7],
      benefitPrice: r[8],
      discountRate: r[9],
      colors: []
    };
  }
  // 컬러코드 = E열 뒤 3자리
  const fullCode = r[4] || '';
  const colorCode = fullCode.split('_').pop();
  groups[seq].colors.push(colorCode);
}

const items = Object.values(groups);
console.log(`총 구성 수: ${items.length}`);
console.log('');
items.forEach(item => {
  const dr = Math.round((1 - item.benefitPrice / item.tagPrice) * 100);
  console.log(`구성${String(item.seq).padStart(2,'0')} | ${item.model} | ${item.name} | 택가:${item.tagPrice} | 톡딜가:${item.dealPrice} | 혜택가:${item.benefitPrice} | 할인율:${dr}% | 컬러: ${item.colors.join(', ')}`);
});
