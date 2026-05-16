import type { LocationData } from "@prisma/client";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.utils.js";

interface AIInsightInput {
  businessType: string;
  kelurahan: string;
  kecamatan: string;
  trafficScore: number;
  transitScore: number;
  poiScore: number;
  competitorCount: number;
  compRatio: number;
  clusterLabel: string;
  finalScore: number;
}

function buildInputFromLocation(
  businessType: string,
  location: LocationData,
): AIInsightInput {
  return {
    businessType,
    kelurahan: location.kelurahan,
    kecamatan: location.kecamatan,
    trafficScore: location.trafficScore,
    transitScore: location.transitScore,
    poiScore: location.poiScore,
    competitorCount: location.competitorCount,
    compRatio: location.compRatio,
    clusterLabel: location.clusterLabel,
    finalScore: location.finalScore,
  };
}

// Mock AI: generates rich 2-3 paragraph insight

function generateMockInsight(input: AIInsightInput): string {
  const { businessType, kelurahan, kecamatan, trafficScore, transitScore, poiScore, competitorCount, compRatio, clusterLabel, finalScore } = input;

  const labels: Record<string, string> = {
    CAFE: "Cafe / Kedai Kopi",
    LAUNDRY: "Laundry",
    FNB: "Restoran / F&B",
    BARBERSHOP: "Barbershop",
    SALON: "Salon Kecantikan",
    GYM: "Gym / Fitness",
    BENGKEL: "Bengkel Motor",
    CARWASH: "Cuci Motor/Mobil",
    FASHION: "Toko Fashion",
    ELEKTRONIK: "Toko Elektronik",
    PHOTOSTUDIO: "Photo Studio",
    STATIONERY: "ATK / Stationery",
  };

  const label = labels[businessType] ?? businessType;
  const scoreDesc = finalScore >= 72 ? "kuat" : finalScore >= 55 ? "moderat" : "menantang";
  const clusterDesc = clusterLabel === "POTENSIAL"
    ? "wilayah yang sedang berkembang dengan peluang masuk yang baik"
    : clusterLabel === "RAMAI"
      ? "wilayah yang sudah ramai aktivitas ekonomi dengan kompetisi tinggi"
      : "wilayah dengan aktivitas ekonomi yang masih rendah";

  const trafficDesc = trafficScore >= 0.7
    ? `Kepadatan lalu lintas di area ini cukup tinggi (skor ${(trafficScore * 100).toFixed(0)}%), menandakan potensi footfall yang baik untuk menarik pelanggan walk-in`
    : trafficScore >= 0.4
      ? `Arus lalu lintas berada pada level menengah (skor ${(trafficScore * 100).toFixed(0)}%), cukup memadai untuk bisnis yang mengandalkan pelanggan reguler`
      : `Kepadatan lalu lintas relatif rendah (skor ${(trafficScore * 100).toFixed(0)}%), sehingga perlu strategi pemasaran digital yang lebih aktif untuk menarik pelanggan`;

  const transitDesc = transitScore >= 0.6
    ? `Aksesibilitas transportasi umum yang baik (skor ${(transitScore * 100).toFixed(0)}%) memudahkan calon pelanggan dari berbagai area untuk menjangkau lokasi ini.`
    : `Aksesibilitas transportasi umum masih terbatas (skor ${(transitScore * 100).toFixed(0)}%), sehingga lokasi ini lebih cocok untuk target pasar yang memiliki kendaraan pribadi.`;

  const poiDesc = poiScore >= 0.6
    ? `Kepadatan Point of Interest (POI) yang tinggi (skor ${(poiScore * 100).toFixed(0)}%) menunjukkan bahwa area sekitar ${kelurahan} memiliki ekosistem ekonomi yang aktif`
    : `POI di sekitar lokasi masih relatif sparse (skor ${(poiScore * 100).toFixed(0)}%), yang bisa menjadi peluang sebagai first-mover`;

  const compDesc = competitorCount >= 0.6
    ? `Tingkat kompetisi cukup tinggi (${(competitorCount * 100).toFixed(0)}%) — Anda perlu diferensiasi yang kuat dalam produk atau layanan.`
    : `Kompetisi masih relatif rendah (${(competitorCount * 100).toFixed(0)}%) — ada ruang yang cukup bagi pendatang baru.`;

  const ratioAdvice = compRatio >= 0.6
    ? "Competition ratio menunjukkan masih ada gap yang bisa dimanfaatkan antara permintaan dan supply di area ini."
    : "Rasio kompetisi mengindikasikan pasar yang sudah cukup tersaturasi, pertimbangkan untuk menawarkan proposisi nilai yang unik.";

  const paragraph1 = `Kelurahan ${kelurahan} (Kecamatan ${kecamatan}) menampilkan performa ${scoreDesc} untuk kategori ${label} dengan skor akhir ${finalScore.toFixed(1)} dari 100. Area ini termasuk dalam klaster "${clusterLabel}" yang mengindikasikan ${clusterDesc}. ${trafficDesc}. ${transitDesc}`;

  const paragraph2 = `${poiDesc}. ${compDesc} ${ratioAdvice}`;

  const paragraph3 = finalScore >= 72
    ? `Rekomendasi: Lokasi ini sangat cocok untuk membuka ${label}. Fokuslah pada branding yang kuat dan jam operasional yang disesuaikan dengan pola aktivitas lokal. Pertimbangkan untuk menawarkan layanan unik yang belum ada di area ini untuk memaksimalkan keunggulan kompetitif Anda.`
    : finalScore >= 55
      ? `Rekomendasi: Lokasi ini memiliki potensi menengah untuk ${label}. Lakukan survei lapangan tambahan untuk memvalidasi data ini. Pertimbangkan strategi harga yang kompetitif dan bangun kehadiran digital yang kuat untuk menjangkau pelanggan di luar radius walk-in.`
      : `Rekomendasi: Pertimbangkan dengan matang sebelum memilih lokasi ini untuk ${label}. Jika tetap ingin membuka di area ini, pastikan Anda memiliki strategi pemasaran yang agresif dan modal operasional yang cukup untuk bertahan di fase awal. Alternatifnya, eksplorasi kelurahan lain di kecamatan ${kecamatan} yang mungkin memiliki potensi lebih tinggi.`;

  return `${paragraph1}\n\n${paragraph2}\n\n${paragraph3}`;
}

function generateMockComparison(
  businessType: string,
  locations: AIInsightInput[],
): string {
  if (locations.length === 0) return "Tidak ada lokasi untuk dibandingkan.";

  const sorted = [...locations].sort((a, b) => b.finalScore - a.finalScore);
  const best = sorted[0]!;
  const label = businessType;

  let narrative = `Dari ${locations.length} lokasi yang dibandingkan untuk jenis usaha ${label}, **${best.kelurahan}** memiliki skor tertinggi (${best.finalScore.toFixed(1)}) dan menjadi rekomendasi utama.\n\n`;

  for (const loc of sorted) {
    const pros: string[] = [];
    const cons: string[] = [];

    if (loc.trafficScore >= 0.6) pros.push("traffic tinggi");
    else cons.push("traffic rendah");
    if (loc.poiScore >= 0.6) pros.push("POI padat");
    else cons.push("POI sparse");
    if (loc.competitorCount < 0.5) pros.push("kompetisi rendah");
    else cons.push("kompetisi tinggi");

    narrative += `• ${loc.kelurahan} (${loc.finalScore.toFixed(1)}): Kelebihan — ${pros.join(", ") || "—"}. Kekurangan — ${cons.join(", ") || "—"}.\n`;
  }

  narrative += `\nKesimpulan: ${best.kelurahan} menawarkan keseimbangan terbaik antara potensi pasar dan tingkat kompetisi untuk bisnis ${label} di area Semarang.`;

  return narrative;
}

// Real AI API call (stub - swap body when API ready)

async function callRealAI(
  _prompt: string,
): Promise<string | null> {
  // SETTING: Change this to true to force mock even if API keys are present
  const forceMock = false;
  if (forceMock || !env.aiServiceUrl || !env.aiApiKey) return null;

  try {
    const response = await fetch(`${env.aiServiceUrl}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.aiApiKey}`,
      },
      body: JSON.stringify({ prompt: _prompt }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) return null;

    const json = (await response.json()) as { insight?: string };
    return json.insight ?? null;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn(`AI API call failed: ${msg}`);
    return null;
  }
}

// Public API

export const aiService = {
  async generateInsight(
    businessType: string,
    location: LocationData,
  ): Promise<string> {
    const input = buildInputFromLocation(businessType, location);

    // Try real AI first
    const prompt = `Berikan analisis lokasi bisnis ${businessType} di Kelurahan ${input.kelurahan}, Kecamatan ${input.kecamatan}, Semarang. Data: traffic=${input.trafficScore}, transit=${input.transitScore}, poi=${input.poiScore}, competitor=${input.competitorCount}, compRatio=${input.compRatio}, cluster=${input.clusterLabel}, score=${input.finalScore}. Berikan 2-3 paragraf insight dalam Bahasa Indonesia.`;

    const realInsight = await callRealAI(prompt);
    if (realInsight) return realInsight;

    // Fallback to rich mock
    return generateMockInsight(input);
  },

  async generateComparisonNarrative(
    businessType: string,
    locations: LocationData[],
  ): Promise<string> {
    const inputs = locations.map((loc) =>
      buildInputFromLocation(businessType, loc),
    );

    return generateMockComparison(businessType, inputs);
  },
};
