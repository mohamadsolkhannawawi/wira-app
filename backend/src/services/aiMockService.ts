import { AnalysisRequest, AnalysisResponse } from "@wira-app/shared";

export const analyzeLocationDummy = async (
  reqData: AnalysisRequest,
): Promise<AnalysisResponse> => {
  // Simulasi delay proses AI selama 2 detik
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Mengembalikan data dummy
  return {
    success: true,
    data: {
      location: reqData.locationId,
      businessType: reqData.businessType,
      metrics: {
        traffic_score: 0.85,
        transit_score: 0.65,
        poi_score: 0.9,
        competitor_count: 12,
        comp_ratio: 0.45,
      },
      ai_prediction: {
        final_score: 82.5,
        cluster: "Potensial",
        insight: `Wilayah ${reqData.locationId} menunjukkan potensi yang sangat baik untuk usaha ${reqData.businessType}. Meskipun ada 12 kompetitor, skor lalu lintas dan transit menunjukkan arus pengunjung yang tinggi yang belum terpenuhi.`,
      },
    },
  };
};
