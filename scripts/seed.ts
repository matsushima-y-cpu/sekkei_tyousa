/**
 * Seed script: Excelファイルから都道府県・市区町村・調査項目マスタデータを投入
 *
 * Usage: npm run db:seed
 * 前提: DATABASE_URL が .env.local に設定されていること
 */
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "../src/db/schema";

// ExcelJS is CommonJS, use dynamic import
async function loadExcelJS() {
  const ExcelJS = await import("exceljs");
  return ExcelJS.default;
}

interface InvestigationRow {
  municipalityName: string;
  description: string;
  quantity: number;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  daysBeforeConstruction: number | null;
}

// Prefecture mapping: sheet name -> { code, name, shortName }
const PREFECTURE_SHEETS = [
  { sheet: "25滋賀県", code: 25, name: "滋賀県", shortName: "滋賀" },
  { sheet: "26京都府", code: 26, name: "京都府", shortName: "京都" },
  { sheet: "27大阪府", code: 27, name: "大阪府", shortName: "大阪" },
  { sheet: "28兵庫県", code: 28, name: "兵庫県", shortName: "兵庫" },
  { sheet: "29奈良県", code: 29, name: "奈良県", shortName: "奈良" },
  { sheet: "30和歌山県", code: 30, name: "和歌山県", shortName: "和歌山" },
];

// Municipality data sheets (postal code based)
const MUNICIPALITY_SHEETS = [
  { sheet: "25SHIGA", prefCode: 25 },
  { sheet: "26KYOUTO", prefCode: 26 },
  { sheet: "27OSAKA", prefCode: 27 },
  { sheet: "28HYOGO", prefCode: 28 },
  { sheet: "29NARA", prefCode: 29 },
  { sheet: "30WAKAYA", prefCode: 30 },
];

function cellValue(row: import("exceljs").Row, col: number): string {
  const cell = row.getCell(col);
  if (cell.value === null || cell.value === undefined) return "";
  return String(cell.value).trim();
}

function cellNumber(row: import("exceljs").Row, col: number): number {
  const cell = row.getCell(col);
  if (cell.value === null || cell.value === undefined) return 0;
  const num = Number(cell.value);
  return isNaN(num) ? 0 : num;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set in .env.local");
    process.exit(1);
  }

  const ExcelJS = await loadExcelJS();
  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzle(pool, { schema });

  // Excel file path
  const excelPath = process.argv[2] || String.raw`C:\Users\matsushima-y\Downloads\役所調査書＿見積＿おうちづくりスケジュール.xlsx`;

  console.log(`Reading Excel: ${excelPath}`);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(excelPath);

  console.log("Sheets found:", workbook.worksheets.map((ws) => ws.name).join(", "));

  // Step 1: Insert prefectures
  console.log("\n=== Inserting prefectures ===");
  const prefectureIdMap = new Map<number, number>(); // code -> db id

  for (const pref of PREFECTURE_SHEETS) {
    const [inserted] = await db
      .insert(schema.prefectures)
      .values({
        code: pref.code,
        name: pref.name,
        shortName: pref.shortName,
        isActive: true,
      })
      .onConflictDoNothing()
      .returning();

    if (inserted) {
      prefectureIdMap.set(pref.code, inserted.id);
      console.log(`  Inserted: ${pref.name} (id=${inserted.id})`);
    } else {
      // Already exists, fetch id
      const existing = await db.query.prefectures.findFirst({
        where: (p, { eq }) => eq(p.code, pref.code),
      });
      if (existing) {
        prefectureIdMap.set(pref.code, existing.id);
        console.log(`  Exists: ${pref.name} (id=${existing.id})`);
      }
    }
  }

  // Step 2: Extract municipalities from postal code sheets
  console.log("\n=== Extracting municipalities ===");
  for (const munSheet of MUNICIPALITY_SHEETS) {
    const ws = workbook.getWorksheet(munSheet.sheet);
    if (!ws) {
      console.log(`  Sheet not found: ${munSheet.sheet}`);
      continue;
    }

    const prefId = prefectureIdMap.get(munSheet.prefCode);
    if (!prefId) continue;

    const municipalitySet = new Set<string>();
    ws.eachRow((row, rowNumber) => {
      // Column H = municipality name (col 8)
      const munName = cellValue(row, 8);
      if (munName && munName !== "以下に掲載がない場合") {
        municipalitySet.add(munName);
      }
    });

    const municipalities = Array.from(municipalitySet).sort();
    console.log(`  ${munSheet.sheet}: ${municipalities.length} municipalities`);

    // Batch insert
    if (municipalities.length > 0) {
      const values = municipalities.map((name) => ({
        prefectureId: prefId,
        name,
        isActive: true,
      }));

      // Insert in batches of 100
      for (let i = 0; i < values.length; i += 100) {
        const batch = values.slice(i, i + 100);
        await db.insert(schema.municipalities).values(batch).onConflictDoNothing();
      }
    }
  }

  // Step 3: Extract investigation items from prefecture sheets
  console.log("\n=== Extracting investigation items ===");
  for (const pref of PREFECTURE_SHEETS) {
    const ws = workbook.getWorksheet(pref.sheet);
    if (!ws) {
      console.log(`  Sheet not found: ${pref.sheet}`);
      continue;
    }

    const prefId = prefectureIdMap.get(pref.code);
    if (!prefId) continue;

    const items: InvestigationRow[] = [];
    let sortOrder = 0;

    ws.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const munName = cellValue(row, 1);   // Column A: municipality
      const desc = cellValue(row, 2);       // Column B: description
      const qty = cellNumber(row, 3);       // Column C: quantity
      const unit = cellValue(row, 4) || "式"; // Column D: unit
      const costPrice = cellNumber(row, 5); // Column E: cost price
      const sellingPrice = cellNumber(row, 7); // Column G: customer price
      const days = cellNumber(row, 8);      // Column H: days

      if (!desc || costPrice === 0) return;

      items.push({
        municipalityName: munName,
        description: desc,
        quantity: qty || 1,
        unit,
        costPrice: Math.round(costPrice),
        sellingPrice: Math.round(sellingPrice) || Math.ceil(costPrice / 0.7 / 10000) * 10000,
        daysBeforeConstruction: days || null,
      });
    });

    console.log(`  ${pref.name}: ${items.length} items`);

    // Batch insert
    for (let i = 0; i < items.length; i += 50) {
      const batch = items.slice(i, i + 50);
      const values = batch.map((item, idx) => ({
        prefectureId: prefId,
        municipalityName: item.municipalityName,
        description: item.description,
        quantity: String(item.quantity),
        unit: item.unit,
        costPrice: item.costPrice,
        sellingPrice: item.sellingPrice,
        daysBeforeConstruction: item.daysBeforeConstruction,
        sortOrder: sortOrder + i + idx,
        isActive: true,
      }));
      await db.insert(schema.investigationItems).values(values);
      sortOrder += batch.length;
    }
  }

  console.log("\n=== Seed completed ===");
  await pool.end();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
