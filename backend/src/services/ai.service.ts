import { env } from "../config/env.js";
import { logger } from "../utils/logger.utils.js";
import { AppError } from "../utils/appError.js";

interface ModelFeatureBlock {
  traffic_score: number;
  transit_score: number;
  poi_score: number;
  competitor: number;
  comp_ratio: number;
}

interface ModelAlternative {
  peringkat: number;
  nama_jalan: string;
  kecamatan: string;
  skor_potensi_persen: number;
  bobot_fitur: ModelFeatureBlock;
  nilai_fitur_jalan: ModelFeatureBlock;
}

interface ModelRecommendationData {
  target_jalan: string;
  jenis_bisnis: string;
  skor_potensi_persen: number;
  bobot_fitur: ModelFeatureBlock;
  nilai_fitur_jalan: ModelFeatureBlock;
  rekomendasi_alternatif: ModelAlternative[];
}

interface ModelRecommendationResponse {
  status: string;
  message: string;
  data: ModelRecommendationData;
}

// Lightweight type for comparison
interface ComparisonLocation {
  namaJalan: string;
  kelurahan: string;
  finalScore: number;
  trafficScore: number;
  transitScore: number;
  poiScore: number;
  competitorCount: number;
  compRatio: number;
}

const mapBusinessTypeToModel = (businessType: string): string =>
  businessType.trim().toLowerCase();

const toFeatureWeights = (block: ModelFeatureBlock) => ({
  trafficScore: block.traffic_score,
  transitScore: block.transit_score,
  poiScore: block.poi_score,
  competitor: block.competitor,
  compRatio: block.comp_ratio,
});

const toFeatureValues = (block: ModelFeatureBlock) => ({
  trafficScore: block.traffic_score,
  transitScore: block.transit_score,
  poiScore: block.poi_score,
  competitor: block.competitor,
  compRatio: block.comp_ratio,
});

const buildInsightPrompt = (data: ModelRecommendationData): string => {
  const weights = toFeatureWeights(data.bobot_fitur);
  const values = toFeatureValues(data.nilai_fitur_jalan);
  const skor = data.skor_potensi_persen;
  const level = skor >= 70 ? "TINGGI" : skor >= 40 ? "SEDANG" : "RENDAH";

  const alternatives = data.rekomendasi_alternatif
    .slice(0, 3)
    .map(
      (alt) =>
        `- ${alt.nama_jalan} (${alt.kecamatan}): skor ${alt.skor_potensi_persen.toFixed(1)}`,
    )
    .join("\n");

  return `Kamu adalah analis lokasi bisnis UMKM. Buat narasi insight yang LENGKAP dan SELESAI berdasarkan data berikut.

DATA:
- Jalan: ${data.target_jalan}
- Jenis Bisnis: ${data.jenis_bisnis}
- Skor Potensi: ${skor.toFixed(1)}/100 (${level})
- Traffic: ${values.trafficScore.toFixed(2)} (bobot ${weights.trafficScore.toFixed(2)})
- Transit: ${values.transitScore.toFixed(2)} (bobot ${weights.transitScore.toFixed(2)})
- POI: ${values.poiScore.toFixed(2)} (bobot ${weights.poiScore.toFixed(2)})
- Kompetitor: ${values.competitor.toFixed(2)} (bobot ${weights.competitor.toFixed(2)})
- Comp Ratio: ${values.compRatio.toFixed(2)} (bobot ${weights.compRatio.toFixed(2)})
${alternatives ? `\nALTERNATIF LOKASI:\n${alternatives}` : ""}

INSTRUKSI:
1. Tulis dalam Bahasa Indonesia, 2-3 paragraf.
2. Paragraf 1: Ringkasan — sebutkan skor, kategori (${level}), dan kesimpulan umum.
3. Paragraf 2: Analisis — jelaskan faktor paling berpengaruh (traffic/transit/POI/kompetitor) dan mengapa.
4. Paragraf 3: Rekomendasi — beri 2-3 saran tindakan konkret untuk pelaku UMKM.
5. PENTING: Pastikan seluruh narasi SELESAI dan LENGKAP, jangan berhenti di tengah kalimat.`;
};

const buildComparisonPrompt = (
  businessType: string,
  locations: ComparisonLocation[],
): string => {
  const locationDetails = locations
    .map(
      (loc) =>
        `- Jalan ${loc.namaJalan}, Kel. ${loc.kelurahan}: Skor ${loc.finalScore.toFixed(1)}/100, Traffic ${loc.trafficScore.toFixed(2)}, Transit ${loc.transitScore.toFixed(2)}, POI ${loc.poiScore.toFixed(2)}, Kompetitor ${loc.competitorCount.toFixed(2)}, Rasio Peluang ${loc.compRatio.toFixed(2)}`,
    )
    .join("\n");

  return `Buat narasi analisis perbandingan lokasi bisnis UMKM berdasarkan data spesifik di bawah ini.

JENIS USAHA: ${businessType}

DATA LOKASI:
${locationDetails}

INSTRUKSI KETAT:
1. LANGSUNG ke isi analisis. JANGAN gunakan kalimat pengantar seperti "Sebagai analis lokasi bisnis UMKM, saya telah mengevaluasi..." atau "Berikut adalah narasi perbandingan...".
2. Tulis tepat dalam 3 paragraf. Setiap paragraf WAJIB terdiri dari 2 sampai 3 kalimat saja agar singkat, padat, dan tidak bertele-tele.
3. Sebutkan nama jalan spesifik dan kelurahan dari data saat menganalisis setiap lokasi.
4. Paragraf 1: Ringkasan perbandingan — sebutkan lokasi jalan terbaik dan terburuk beserta alasannya secara singkat.
5. Paragraf 2: Analisis perbandingan metrik kunci (traffic, transit, POI, peluang) antar lokasi jalan tersebut.
6. Paragraf 3: Rekomendasi akhir dan strategi konkret yang disarankan untuk lokasi terpilih.
7. PENTING: Pastikan seluruh narasi SELESAI LENGKAP sampai titik akhir tanda titik, JANGAN berhenti di tengah kalimat.`;
};

const callGeminiWithKey = async (
  prompt: string,
  apiKey: string,
  label: string,
): Promise<string> => {
  const url = `${env.geminiApiUrl}/${env.geminiModel}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
    }),
    signal: AbortSignal.timeout(40000),
  });

  if (!response.ok) {
    const body = await response.text();
    logger.warn(`[${label}] API error: ${response.status} ${body}`);
    throw new AppError(`Gagal dari ${label}`, 502, "GEMINI_FAILED");
  }

  const json = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  const text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) {
    throw new AppError(`Respons kosong dari ${label}`, 502, "GEMINI_EMPTY");
  }

  return text;
};

const callGroq = async (prompt: string): Promise<string> => {
  if (!env.groqApiKey) {
    throw new AppError(
      "GROQ_API_KEY tidak dikonfigurasi",
      500,
      "GROQ_NOT_CONFIGURED",
    );
  }

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2048,
      }),
      signal: AbortSignal.timeout(30000),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    logger.warn(`[Groq] API error: ${response.status} ${body}`);
    throw new AppError("Gagal dari Groq", 502, "GROQ_FAILED");
  }

  const json = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const text = json.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new AppError("Respons kosong dari Groq", 502, "GROQ_EMPTY");
  }

  return text;
};

const executeAiPipeline = async (prompt: string): Promise<string> => {
  // 1. Coba Gemini Primary
  if (env.geminiApiKey) {
    try {
      logger.info("[AI Pipeline] Mencoba Gemini Primary...");
      return await callGeminiWithKey(prompt, env.geminiApiKey, "Gemini Primary");
    } catch (err) {
      logger.warn(
        `[AI Pipeline] Gemini Primary gagal (${err instanceof Error ? err.message : String(err)}). Mencoba fallback...`,
      );
    }
  }

  // 2. Coba Gemini Backup
  if (env.geminiBackupApiKey) {
    try {
      logger.info("[AI Pipeline] Mencoba Gemini Backup...");
      return await callGeminiWithKey(
        prompt,
        env.geminiBackupApiKey,
        "Gemini Backup",
      );
    } catch (err) {
      logger.warn(
        `[AI Pipeline] Gemini Backup gagal (${err instanceof Error ? err.message : String(err)}). Mencoba fallback...`,
      );
    }
  }

  // 3. Coba Groq Llama 3
  if (env.groqApiKey) {
    try {
      logger.info("[AI Pipeline] Mencoba Groq (Llama 3)...");
      return await callGroq(prompt);
    } catch (err) {
      logger.warn(
        `[AI Pipeline] Groq gagal (${err instanceof Error ? err.message : String(err)}).`,
      );
    }
  }

  throw new AppError(
    "Semua penyedia AI gagal merespons",
    502,
    "AI_ALL_FAILED",
  );
};

const fetchModelRecommendation = async (
  streetName: string,
  businessType: string,
): Promise<ModelRecommendationData> => {
  if (!env.aiRecommendUrl) {
    throw new AppError(
      "AI_RECOMMEND_URL belum dikonfigurasi",
      500,
      "AI_URL_MISSING",
    );
  }

  const payload = {
    street_name: streetName,
    biz_type: mapBusinessTypeToModel(businessType),
  };

  const response = await fetch(env.aiRecommendUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(20000),
  });

  if (!response.ok) {
    const body = await response.text();
    logger.warn(`AI model error: ${response.status} ${body}`);
    throw new AppError(
      "Gagal mengambil rekomendasi AI",
      502,
      "AI_MODEL_FAILED",
    );
  }

  const json = (await response.json()) as ModelRecommendationResponse;
  if (json.status !== "success" || !json.data) {
    throw new AppError("Respons AI tidak valid", 502, "AI_MODEL_INVALID");
  }

  return json.data;
};

/**
 * Build a simple fallback insight from raw data when Gemini is unavailable.
 */
const buildFallbackInsight = (data: ModelRecommendationData): string => {
  const skor = data.skor_potensi_persen;
  const level =
    skor >= 70 ? "tinggi" : skor >= 40 ? "sedang" : "rendah";
  const values = data.nilai_fitur_jalan;

  const lines = [
    `Lokasi ${data.target_jalan} memiliki skor potensi ${skor.toFixed(1)} dari 100 untuk jenis usaha ${data.jenis_bisnis}, yang termasuk kategori ${level}.`,
    `Nilai traffic: ${values.traffic_score.toFixed(2)}, transit: ${values.transit_score.toFixed(2)}, POI: ${values.poi_score.toFixed(2)}, kompetitor: ${values.competitor.toFixed(2)}, peluang pasar: ${values.comp_ratio.toFixed(2)}.`,
  ];

  if (data.rekomendasi_alternatif.length > 0) {
    const top = data.rekomendasi_alternatif[0];
    if (top) {
      lines.push(
        `Alternatif terbaik: ${top.nama_jalan} (${top.kecamatan}) dengan skor ${top.skor_potensi_persen.toFixed(1)}.`,
      );
    }
  }

  lines.push(
    "(Narasi AI detail sedang tidak tersedia. Insight ini dihasilkan dari data mentah.)",
  );

  return lines.join(" ");
};

export const aiService = {
  async getRecommendation(
    streetName: string,
    businessType: string,
  ): Promise<ModelRecommendationData> {
    return fetchModelRecommendation(streetName, businessType);
  },

  async generateInsightFromRecommendation(
    recommendation: ModelRecommendationData,
  ): Promise<string> {
    try {
      const prompt = buildInsightPrompt(recommendation);
      return await executeAiPipeline(prompt);
    } catch (err) {
      logger.warn(
        `AI Pipeline insight failed, using fallback: ${err instanceof Error ? err.message : String(err)}`,
      );
      return buildFallbackInsight(recommendation);
    }
  },

  async generateComparisonNarrative(
    businessType: string,
    locations: ComparisonLocation[],
  ): Promise<string> {
    try {
      const prompt = buildComparisonPrompt(businessType, locations);
      return await executeAiPipeline(prompt);
    } catch (err) {
      logger.warn(
        `AI Pipeline comparison failed, using fallback: ${err instanceof Error ? err.message : String(err)}`,
      );
      return "Narasi perbandingan AI sedang tidak tersedia. Silakan bandingkan skor dan metrik secara manual.";
    }
  },
};

