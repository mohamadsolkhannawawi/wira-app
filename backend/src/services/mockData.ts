import type {
  BusinessType,
  ClusterLabel,
  ConfidenceLevel,
  LocationDetail,
  LocationMetrics,
  LocationSummary,
} from "@wira-app/shared";

const baseLocations: Array<{
  kelurahan: string;
  kecamatan: string;
  latitude: number;
  longitude: number;
}> = [
  {
    kelurahan: "Tembalang",
    kecamatan: "Tembalang",
    latitude: -7.0511,
    longitude: 110.4381,
  },
  {
    kelurahan: "Banyumanik",
    kecamatan: "Banyumanik",
    latitude: -7.0796,
    longitude: 110.4166,
  },
  {
    kelurahan: "Pedurungan",
    kecamatan: "Pedurungan",
    latitude: -7.0029,
    longitude: 110.4762,
  },
  {
    kelurahan: "Semarang Tengah",
    kecamatan: "Semarang Tengah",
    latitude: -6.9829,
    longitude: 110.4091,
  },
  {
    kelurahan: "Ngaliyan",
    kecamatan: "Ngaliyan",
    latitude: -6.9806,
    longitude: 110.3562,
  },
];

const businessTypeBias: Record<BusinessType, number> = {
  CAFE: 0.78,
  LAUNDRY: 0.6,
  FNB: 0.74,
  BARBERSHOP: 0.58,
  SALON: 0.55,
  GYM: 0.62,
  BENGKEL: 0.52,
  CARWASH: 0.49,
  FASHION: 0.66,
  ELEKTRONIK: 0.57,
  PHOTOSTUDIO: 0.61,
  STATIONERY: 0.53,
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const hashSeed = (input: string): number => {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const toScore = (seed: number, bias: number): number => {
  const normalized = (seed % 100) / 100;
  return clamp(40 + normalized * 60 * bias, 35, 95);
};

const toCluster = (score: number): ClusterLabel => {
  if (score >= 72) return "POTENSIAL";
  if (score >= 55) return "RAMAI";
  return "SEPI";
};

const toConfidence = (score: number): ConfidenceLevel => {
  if (score >= 75) return "TINGGI";
  if (score >= 60) return "SEDANG";
  return "RENDAH";
};

export const buildMetrics = (seed: number): LocationMetrics => {
  const trafficScore = clamp(0.45 + (seed % 30) / 100, 0.3, 0.95);
  const transitScore = clamp(0.35 + ((seed + 13) % 40) / 100, 0.2, 0.9);
  const poiScore = clamp(0.4 + ((seed + 29) % 45) / 100, 0.25, 0.95);
  const competitorScore = clamp(0.3 + ((seed + 51) % 35) / 100, 0.2, 0.8);
  const compRatio = clamp(0.35 + ((seed + 71) % 35) / 100, 0.25, 0.85);

  return {
    trafficScore,
    transitScore,
    poiScore,
    competitorScore,
    compRatio,
  };
};

export const getLocationSummaries = (
  businessType: BusinessType,
): LocationSummary[] => {
  return baseLocations.map((location, index) => {
    const seed = hashSeed(`${location.kelurahan}-${businessType}-${index}`);
    const score = toScore(seed, businessTypeBias[businessType] ?? 0.5);

    return {
      id: `${businessType}-${index}`,
      kelurahan: location.kelurahan,
      kecamatan: location.kecamatan,
      latitude: location.latitude,
      longitude: location.longitude,
      finalScore: Math.round(score * 10) / 10,
      clusterLabel: toCluster(score),
    };
  });
};

export const getLocationDetail = (
  businessType: BusinessType,
  kelurahan: string,
): LocationDetail | null => {
  const summaries = getLocationSummaries(businessType);
  const matched = summaries.find(
    (item) => item.kelurahan.toLowerCase() === kelurahan.toLowerCase(),
  );

  if (!matched) return null;

  const seed = hashSeed(`${kelurahan}-${businessType}`);
  const metrics = buildMetrics(seed);

  return {
    ...matched,
    businessType,
    confidenceLevel: toConfidence(matched.finalScore),
    metrics,
  };
};

export const buildInsight = (
  businessType: BusinessType,
  kelurahan: string,
  score: number,
): string => {
  return `Kelurahan ${kelurahan} menampilkan performa ${
    score >= 72 ? "kuat" : score >= 55 ? "stabil" : "moderat"
  } untuk kategori ${businessType}. Skor ini didorong oleh kombinasi arus lalu lintas, kepadatan POI, dan kompetisi yang masih dapat dimasuki. Gunakan insight ini untuk menyesuaikan positioning dan jam operasional agar lebih selaras dengan pola aktivitas lokal.`;
};
