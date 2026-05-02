/**
 * Seed Script — WIRA Location Data
 *
 * Reads 12 Excel files from `shared/data-modeling/` and inserts them into
 * the `location_data` and `business_type_masters` tables.
 *
 * Run: npx prisma db seed
 */

import { PrismaClient, BusinessType, ClusterLabel } from "@prisma/client";
import XLSX from "xlsx";
import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Prisma init (reads DATABASE_URL from schema.prisma) ──
const prisma = new PrismaClient();

// ── Business Type Mapping ──
const BUSINESS_TYPES: { code: BusinessType; label: string; file: string }[] = [
  { code: "CAFE", label: "Cafe / Kopi", file: "df_scaled_cafe.xlsx" },
  { code: "LAUNDRY", label: "Laundry", file: "df_scaled_laundry.xlsx" },
  { code: "FNB", label: "Restoran / F&B", file: "df_scaled_fnb.xlsx" },
  { code: "BARBERSHOP", label: "Barbershop", file: "df_scaled_barbershop.xlsx" },
  { code: "SALON", label: "Salon Kecantikan", file: "df_scaled_salon.xlsx" },
  { code: "GYM", label: "Gym / Fitness", file: "df_scaled_gym.xlsx" },
  { code: "BENGKEL", label: "Bengkel Motor", file: "df_scaled_bengkel.xlsx" },
  { code: "CARWASH", label: "Cuci Motor/Mobil", file: "df_scaled_carwash.xlsx" },
  { code: "FASHION", label: "Toko Fashion", file: "df_scaled_fashion.xlsx" },
  { code: "ELEKTRONIK", label: "Toko Elektronik", file: "df_scaled_elektronik.xlsx" },
  { code: "PHOTOSTUDIO", label: "Photo Studio", file: "df_scaled_photostudio.xlsx" },
  { code: "STATIONERY", label: "ATK / Stationery", file: "df_scaled_stationery.xlsx" },
];

// ── K-Means Cluster Assignment ──
function assignCluster(finalScore: number): ClusterLabel {
  if (finalScore >= 0.65) return "POTENSIAL";
  if (finalScore >= 0.35) return "RAMAI";
  return "SEPI";
}

// ── Main ──
async function main() {
  const dataDir = path.resolve(__dirname, "../../shared/data-modeling");

  if (!fs.existsSync(dataDir)) {
    console.error(`Data directory not found: ${dataDir}`);
    process.exit(1);
  }

  console.log("🌱 Starting WIRA seed...\n");

  // 1. Seed BusinessTypeMaster
  console.log("📋 Seeding BusinessTypeMaster...");
  for (const bt of BUSINESS_TYPES) {
    await prisma.businessTypeMaster.upsert({
      where: { code: bt.code },
      update: { label: bt.label },
      create: {
        code: bt.code,
        label: bt.label,
        description: `Kategori usaha ${bt.label}`,
      },
    });
  }
  console.log(`   ✅ ${BUSINESS_TYPES.length} business types seeded\n`);

  // 2. Seed LocationData from Excel files
  let totalInserted = 0;

  for (const bt of BUSINESS_TYPES) {
    const filePath = path.join(dataDir, bt.file);

    if (!fs.existsSync(filePath)) {
      console.warn(`   ⚠️  File not found: ${bt.file} — skipping`);
      continue;
    }

    console.log(`📂 Processing ${bt.file} (${bt.code})...`);

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      console.warn(`   ⚠️  No sheet in ${bt.file}`);
      continue;
    }

    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

    let count = 0;
    for (const row of rows) {
      const namaJalan = String(row["nama_jalan"] ?? "").trim();
      const kecamatan = String(row["kecamatan"] ?? "").trim();
      const kelurahan = String(row["kelurahan"] ?? "").trim();
      const latCentroid = Number(row["lat_centroid"] ?? 0);
      const lngCentroid = Number(row["lng_centroid"] ?? 0);

      if (!kelurahan || !kecamatan) continue;

      // Find score columns dynamically
      const trafficScore = Number(findColumn(row, "traffic_score") ?? 0);
      const transitScore = Number(findColumn(row, "transit_score") ?? 0);
      const poiScore = Number(findColumn(row, "poi_score") ?? 0);
      const competitorCount = Number(findColumn(row, "competitor") ?? 0);
      const compRatio = Number(findColumn(row, "comp_ratio") ?? 0);

      // Calculate final weighted score
      const finalScore =
        trafficScore * 0.25 +
        transitScore * 0.15 +
        poiScore * 0.30 +
        (1 - competitorCount) * 0.15 +
        compRatio * 0.15;

      const clusterLabel = assignCluster(finalScore);

      try {
        await prisma.locationData.upsert({
          where: {
            kelurahan_businessType: {
              kelurahan,
              businessType: bt.code,
            },
          },
          update: {
            namaJalan,
            kecamatan,
            latCentroid,
            lngCentroid,
            trafficScore,
            transitScore,
            poiScore,
            competitorCount,
            compRatio,
            clusterLabel,
            finalScore: Math.round(finalScore * 1000) / 1000,
          },
          create: {
            namaJalan,
            kecamatan,
            kelurahan,
            latCentroid,
            lngCentroid,
            businessType: bt.code,
            trafficScore,
            transitScore,
            poiScore,
            competitorCount,
            compRatio,
            clusterLabel,
            finalScore: Math.round(finalScore * 1000) / 1000,
          },
        });
        count++;
      } catch (err) {
        // Skip duplicates or invalid rows silently
      }
    }

    console.log(`   ✅ ${count} rows inserted/updated`);
    totalInserted += count;
  }

  console.log(`\n🎉 Seed complete! Total: ${totalInserted} location records`);
}

// ── Helper: find column with partial match ──
function findColumn(row: Record<string, unknown>, prefix: string): unknown {
  const keys = Object.keys(row);
  const key = keys.find((k) => k.toLowerCase().startsWith(prefix.toLowerCase()));
  return key ? row[key] : undefined;
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
