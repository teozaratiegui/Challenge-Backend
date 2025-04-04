import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';

const TOTAL_ROWS = 200_000;
const ERROR_ROWS = 10_000;
const FILE_PATH = path.join(__dirname, 'testfile.xlsx');

const getRandomNumbers = (count: number) =>
  Array.from({ length: count }, () => Math.floor(Math.random() * 10000)).join(',');

const generateRow = (index: number): any[] => {
  const isError = index < ERROR_ROWS;

  const name = isError && index % 4 === 0 ? 123 : `Nombre ${index}`;
  const age = isError && index % 4 === 1 ? "veinte" : Math.floor(Math.random() * 100);
  const nums = isError && index % 4 === 2 ? "1,2,3,tres,4" : getRandomNumbers(5000);
  const extra = isError && index % 4 === 3 ? "col extra" : undefined;

  const row = [name, age, nums];
  if (extra !== undefined) row.push(extra);

  return row;
};

async function generateLargeXLSX() {
  console.time("xlsx");

  const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ filename: FILE_PATH });
  const sheet = workbook.addWorksheet("Datos");

  sheet.addRow(["name", "age", "nums"]).commit();

  for (let i = 1; i <= TOTAL_ROWS; i++) {
    const row = generateRow(i);
    sheet.addRow(row).commit();
    if (i % 10000 === 0) console.log(`→ ${i} filas`);
  }

  await sheet.commit();
  await workbook.commit();

  console.timeEnd("xlsx");
  console.log(`✅ Archivo generado en: ${FILE_PATH}`);
}

generateLargeXLSX();
