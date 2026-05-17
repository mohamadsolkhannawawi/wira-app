/**
 * Seed Script — WIRA Street Locations
 *
 * Reads df_scaled.xlsx from `shared/data-modeling/` and inserts into
 * the `street_locations` table.
 *
 * Run: npx prisma db seed
 */

import { PrismaClient } from "@prisma/client";
import XLSX from "xlsx";
import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

type StreetRow = {
  namaJalan: string;
  kelurahan: string;
  kecamatan: string;
  latCentroid: number;
  lngCentroid: number;
};

const EXCEL_PATH = path.resolve(
  __dirname,
  "../../shared/data-modeling/df_scaled.xlsx",
);

function readExcel(): StreetRow[] {
  const workbook = XLSX.readFile(EXCEL_PATH);
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return [];

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
  return rows.map((row) => ({
    namaJalan: String(row["nama_jalan"] ?? "").trim(),
    kelurahan: String(row["kelurahan"] ?? "").trim(),
    kecamatan: String(row["kecamatan"] ?? "").trim(),
    latCentroid: Number(row["lat_centroid"] ?? 0),
    lngCentroid: Number(row["lng_centroid"] ?? 0),
  }));
}

async function main() {
  if (!fs.existsSync(EXCEL_PATH)) {
    console.error(`Data file not found: ${EXCEL_PATH}`);
    process.exit(1);
  }

  console.log("🌱 Starting WIRA seed...\n");

  console.log("👤 Seeding test user...");
  const hashedPassword = await bcrypt.hash("password123", 10);
  await prisma.user.upsert({
    where: { email: "user@wira.app" },
    update: { password: hashedPassword },
    create: {
      email: "user@wira.app",
      username: "wirauser",
      password: hashedPassword,
      name: "WIRA User",
      role: "USER",
    },
  });
  console.log("   ✅ Test user seeded (user@wira.app / password123)\n");

  console.log("📂 Reading df_scaled.xlsx...");
  const rows = readExcel();
  console.log(`   ✅ ${rows.length} rows read`);

  const validRows = rows.filter(
    (row) =>
      row.namaJalan &&
      row.kelurahan &&
      row.kecamatan &&
      Number.isFinite(row.latCentroid) &&
      Number.isFinite(row.lngCentroid),
  );

  console.log(`   ✅ ${validRows.length} rows valid`);
  console.log(`   ⚠️  ${rows.length - validRows.length} rows skipped\n`);

  await prisma.streetLocation.deleteMany();
  const result = await prisma.streetLocation.createMany({
    data: validRows,
    skipDuplicates: true,
  });

  console.log(`   ✅ ${result.count} street locations inserted\n`);
  const kelurahanCount = await prisma.streetLocation.findMany({
    distinct: ["kelurahan"],
    select: { kelurahan: true },
  });
  const kecamatanCount = await prisma.streetLocation.findMany({
    distinct: ["kecamatan"],
    select: { kecamatan: true },
  });

  console.log("📊 Verification");
  console.log(`   Total jalan    : ${result.count}`);
  console.log(`   Total kelurahan: ${kelurahanCount.length}`);
  console.log(`   Total kecamatan: ${kecamatanCount.length}`);
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
