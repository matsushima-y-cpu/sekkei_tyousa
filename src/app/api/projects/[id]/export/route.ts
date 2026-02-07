import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects, projectItems, projectSurvey } from "@/db/schema";
import { eq } from "drizzle-orm";

// Dynamic import for ExcelJS (CommonJS module)
async function loadExcelJS() {
  const ExcelJS = await import("exceljs");
  return ExcelJS.default;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const type = request.nextUrl.searchParams.get("type") || "estimate";

  // Fetch project data
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
    with: {
      prefecture: true,
      items: {
        orderBy: (items, { asc }) => [asc(items.sortOrder)],
      },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ExcelJS = await loadExcelJS();
  const workbook = new ExcelJS.Workbook();

  if (type === "estimate") {
    await generateEstimate(workbook, project);
  } else if (type === "survey") {
    const survey = await db.query.projectSurvey.findFirst({
      where: eq(projectSurvey.projectId, id),
    });
    await generateSurvey(workbook, project, survey);
  }

  const buffer = await workbook.xlsx.writeBuffer();

  const filename = type === "estimate"
    ? `見積書_${project.propertyName}.xlsx`
    : `調査書_${project.propertyName}.xlsx`;

  return new NextResponse(buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  });
}

interface ProjectWithItems {
  id: string;
  propertyName: string;
  customerName: string | null;
  municipality: string | null;
  estimateDate: string | null;
  estimateNumber: string | null;
  prefecture: { name: string } | null;
  items: Array<{
    description: string;
    quantity: string;
    unit: string;
    sellingPrice: number;
    isSelected: boolean;
  }>;
}

async function generateEstimate(
  workbook: InstanceType<Awaited<ReturnType<typeof loadExcelJS>>["Workbook"]>,
  project: ProjectWithItems
) {
  const ws = workbook.addWorksheet("見積書");

  // Title
  ws.mergeCells("B1:I1");
  const titleCell = ws.getCell("B1");
  titleCell.value = "見　積　書";
  titleCell.font = { size: 16, bold: true };
  titleCell.alignment = { horizontal: "center" };

  // Customer
  ws.getCell("C3").value = project.customerName || "";
  ws.getCell("E3").value = "御中";

  // Estimate info
  ws.getCell("H3").value = "No.";
  ws.getCell("I3").value = project.estimateNumber || "";
  ws.getCell("H4").value = "見積日";
  ws.getCell("I4").value = project.estimateDate || new Date().toISOString().split("T")[0];

  // Description
  ws.getCell("C5").value = "下記のとおり、御見積申し上げます。";
  ws.getCell("C6").value = "件名";
  ws.getCell("D6").value = `${project.propertyName} 申請関連の見積もり`;

  // Company info
  ws.getCell("H6").value = "株式会社";
  ws.getCell("I6").value = "Gハウス";
  ws.getCell("H7").value = "〒";
  ws.getCell("I7").value = "535-0022";
  ws.getCell("H8").value = "住所";
  ws.getCell("I8").value = "大阪府大阪市旭区";
  ws.getCell("I9").value = "新森2-23-12";
  ws.getCell("H10").value = "TEL：";
  ws.getCell("I10").value = "06-6954-0648";

  // Selected items
  const selectedItems = project.items.filter((item) => item.isSelected);

  // Calculate totals
  let subtotal = 0;
  selectedItems.forEach((item) => {
    subtotal += item.sellingPrice * parseFloat(item.quantity);
  });
  const tax = Math.floor(subtotal * 0.1);
  const total = subtotal + tax;

  // Total at top
  ws.getCell("C12").value = "合計";
  ws.getCell("D12").value = total;
  ws.getCell("D12").numFmt = "#,##0";
  ws.getCell("E12").value = "（税込）";

  // Headers
  const headerRow = 14;
  ws.getCell(`B${headerRow}`).value = "No.";
  ws.getCell(`C${headerRow}`).value = "摘要";
  ws.getCell(`F${headerRow}`).value = "数量";
  ws.getCell(`G${headerRow}`).value = "単位";
  ws.getCell(`H${headerRow}`).value = "単価";
  ws.getCell(`I${headerRow}`).value = "金額";

  // Style header
  for (const col of ["B", "C", "F", "G", "H", "I"]) {
    const cell = ws.getCell(`${col}${headerRow}`);
    cell.font = { bold: true };
    cell.border = {
      bottom: { style: "thin" },
    };
  }

  // Line items
  selectedItems.forEach((item, idx) => {
    const row = headerRow + 1 + idx;
    ws.getCell(`B${row}`).value = idx + 1;
    ws.getCell(`C${row}`).value = item.description;
    ws.getCell(`F${row}`).value = parseFloat(item.quantity);
    ws.getCell(`G${row}`).value = item.unit;
    ws.getCell(`H${row}`).value = item.sellingPrice;
    ws.getCell(`H${row}`).numFmt = "#,##0";
    ws.getCell(`I${row}`).value = item.sellingPrice * parseFloat(item.quantity);
    ws.getCell(`I${row}`).numFmt = "#,##0";
  });

  // Totals
  const totalsRow = headerRow + 1 + Math.max(selectedItems.length, 20);
  ws.getCell(`H${totalsRow}`).value = "小計";
  ws.getCell(`I${totalsRow}`).value = subtotal;
  ws.getCell(`I${totalsRow}`).numFmt = "#,##0";
  ws.getCell(`H${totalsRow + 1}`).value = "消費税";
  ws.getCell(`I${totalsRow + 1}`).value = tax;
  ws.getCell(`I${totalsRow + 1}`).numFmt = "#,##0";
  ws.getCell(`H${totalsRow + 2}`).value = "合計";
  ws.getCell(`I${totalsRow + 2}`).value = total;
  ws.getCell(`I${totalsRow + 2}`).numFmt = "#,##0";
  ws.getCell(`I${totalsRow + 2}`).font = { bold: true };

  // Column widths
  ws.getColumn("B").width = 5;
  ws.getColumn("C").width = 40;
  ws.getColumn("D").width = 15;
  ws.getColumn("E").width = 8;
  ws.getColumn("F").width = 8;
  ws.getColumn("G").width = 5;
  ws.getColumn("H").width = 12;
  ws.getColumn("I").width = 12;
}

interface SurveyData {
  districtPlan?: string | null;
  districtPlanNotes?: string | null;
  buildingAgreement?: string | null;
  landscape?: string | null;
  buriedCultural?: string | null;
  road1Type?: string | null;
  road1Side?: string | null;
  road1Name?: string | null;
  road1Width?: string | null;
  publicSewerage?: string | null;
  waterSupply?: string | null;
  gas?: string | null;
  [key: string]: unknown;
}

interface ProjectForSurvey {
  propertyName: string;
  municipality: string | null;
  lotNumber: string | null;
  addressDisplay: string | null;
  siteArea: string | null;
  buildingScale: string | null;
  cityPlanningZone: string | null;
  firePrevention: string | null;
  zoning: string | null;
  buildingCoverage: string | null;
  floorAreaRatio: string | null;
  prefecture: { name: string } | null;
}

async function generateSurvey(
  workbook: InstanceType<Awaited<ReturnType<typeof loadExcelJS>>["Workbook"]>,
  project: ProjectForSurvey,
  survey: SurveyData | null | undefined
) {
  const ws = workbook.addWorksheet("調査書");

  // Title
  ws.mergeCells("B1:K1");
  const titleCell = ws.getCell("B1");
  titleCell.value = "調　査　書";
  titleCell.font = { size: 16, bold: true };
  titleCell.alignment = { horizontal: "center" };

  // Date and staff
  ws.getCell("G3").value = "作成日：";
  ws.getCell("H3").value = new Date().toISOString().split("T")[0];
  ws.getCell("J3").value = "担当者：";

  // Basic info
  ws.getCell("B5").value = "物件名称";
  ws.getCell("C5").value = project.propertyName;
  ws.getCell("B6").value = "建築地（地番）";
  ws.getCell("C6").value = project.prefecture?.name || "";
  ws.getCell("D6").value = project.municipality || "";
  ws.getCell("G6").value = project.lotNumber || "";
  ws.getCell("B8").value = "敷地面積";
  ws.getCell("C8").value = project.siteArea ? `${project.siteArea}` : "";
  ws.getCell("E8").value = "㎡";
  ws.getCell("G8").value = "建物規模";
  ws.getCell("H8").value = project.buildingScale || "";

  // City planning
  ws.getCell("B9").value = "都市計画区域";
  ws.getCell("C9").value = project.cityPlanningZone || "";
  ws.getCell("G9").value = "防火指定";
  ws.getCell("H9").value = project.firePrevention || "";
  ws.getCell("B10").value = "用途地域";
  ws.getCell("C10").value = project.zoning || "";
  ws.getCell("B12").value = "建蔽率";
  ws.getCell("C12").value = project.buildingCoverage ? `${project.buildingCoverage}` : "";
  ws.getCell("D12").value = "％";
  ws.getCell("G12").value = "容積率";
  ws.getCell("H12").value = project.floorAreaRatio ? `${project.floorAreaRatio}` : "";
  ws.getCell("J12").value = "％";

  // Survey data
  if (survey) {
    ws.getCell("B13").value = "各種区域等";
    ws.getCell("C13").value = "地区計画";
    ws.getCell("D13").value = survey.districtPlan || "";
    ws.getCell("C14").value = "建築協定";
    ws.getCell("D14").value = survey.buildingAgreement || "";
    ws.getCell("C15").value = "景観";
    ws.getCell("D15").value = survey.landscape || "";
    ws.getCell("C16").value = "埋蔵文化財";
    ws.getCell("D16").value = survey.buriedCultural || "";

    // Roads
    ws.getCell("B17").value = "接続道路";
    ws.getCell("C17").value = "道路種別";
    ws.getCell("C18").value = `${survey.road1Side || "---"}側`;
    ws.getCell("D18").value = survey.road1Name || "";
    ws.getCell("I18").value = survey.road1Width ? `幅員 ${survey.road1Width}m` : "";

    // Infrastructure
    ws.getCell("B23").value = "公共下水道";
    ws.getCell("C23").value = survey.publicSewerage || "";
    ws.getCell("B24").value = "水道";
    ws.getCell("C24").value = survey.waterSupply || "";
    ws.getCell("B25").value = "ガス";
    ws.getCell("C25").value = survey.gas || "";
  }

  // Column widths
  ws.getColumn("A").width = 3;
  ws.getColumn("B").width = 15;
  ws.getColumn("C").width = 20;
  ws.getColumn("D").width = 15;
  ws.getColumn("E").width = 5;
  ws.getColumn("F").width = 5;
  ws.getColumn("G").width = 15;
  ws.getColumn("H").width = 12;
  ws.getColumn("I").width = 10;
  ws.getColumn("J").width = 10;
  ws.getColumn("K").width = 10;
}
