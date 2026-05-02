import * as XLSX from "xlsx";

const filePath = "d:/Magang/Coding Camp DBS Foundation 2026/wira-app/shared/data-modeling/df_scaled_cafe.xlsx";
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json<any>(sheet);

const tembalang = rows.filter((r: any) => 
  String(r.kelurahan || "").toLowerCase().includes("tembalang")
);

console.log("Found Tembalang rows:", tembalang.length);
if (tembalang.length > 0) {
  console.log("Example:", JSON.stringify(tembalang[0], null, 2));
} else {
  console.log("First 5 rows:", JSON.stringify(rows.slice(0, 5), null, 2));
}
