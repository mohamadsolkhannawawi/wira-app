import type {
  BusinessType,
  ClusterLabel,
  LocationDetail,
  LocationSummary,
} from "@wira-app/shared";

const baseLocations = [
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

const resolveCluster = (score: number): ClusterLabel => {
  if (score >= 72) return "POTENSIAL";
  if (score >= 55) return "RAMAI";
  return "SEPI";
};

export const buildLocationsMock = (
  businessType: BusinessType,
): LocationSummary[] => {
  return baseLocations.map((item, index) => {
    const score = 58 + ((index + businessType.length) % 20);
    return {
      id: `${businessType}-${index}`,
      kelurahan: item.kelurahan,
      kecamatan: item.kecamatan,
      latitude: item.latitude,
      longitude: item.longitude,
      finalScore: Math.round(score * 10) / 10,
      clusterLabel: resolveCluster(score),
    };
  });
};

export const buildLocationDetailMock = (
  businessType: BusinessType,
  kelurahan: string,
): LocationDetail => {
  const base = buildLocationsMock(businessType).find(
    (item) => item.kelurahan.toLowerCase() === kelurahan.toLowerCase(),
  );

  return {
    id: base?.id ?? "mock",
    kelurahan,
    kecamatan: base?.kecamatan ?? "Semarang",
    latitude: base?.latitude ?? -7.0,
    longitude: base?.longitude ?? 110.4,
    finalScore: base?.finalScore ?? 64,
    clusterLabel: base?.clusterLabel ?? "RAMAI",
    businessType,
    confidenceLevel: "SEDANG",
    metrics: {
      trafficScore: 0.72,
      transitScore: 0.61,
      poiScore: 0.68,
      competitorScore: 0.44,
      compRatio: 0.57,
    },
  };
};
