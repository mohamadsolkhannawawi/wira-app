import type { AnalysisResult } from "@wira-app/shared";
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, Zap, Bookmark, ArrowLeftRight, Download } from "lucide-react";

interface InsightCardProps {
  result: AnalysisResult | null;
  isLoading?: boolean;
}

const formatScore = (value: number): string => {
  if (!Number.isFinite(value)) return "-";
  return value.toFixed(1);
};

const formatPercent = (value: number): string => {
  if (!Number.isFinite(value)) return "0%";
  return `${Math.round(value * 100)}%`;
};

const getClusterStyles = (label: string) => {
  const normalized = label.toLowerCase();
  if (normalized === "potensial") {
    return { bg: "bg-[#D1FAE5]", text: "text-[#065F46]", dot: "bg-[#22C55E]" };
  }
  if (normalized === "ramai") {
    return { bg: "bg-[#FEF3C7]", text: "text-[#92400E]", dot: "bg-[#F59E0B]" };
  }
  if (normalized === "sepi") {
    return { bg: "bg-[#FEE2E2]", text: "text-[#991B1B]", dot: "bg-[#EF4444]" };
  }
  return { bg: "bg-surface-2", text: "text-wiraText-secondary", dot: "bg-surface-3" };
};

const getConfidenceStyles = (level: string) => {
  const normalized = level.toLowerCase();
  if (normalized === "tinggi") return { text: "text-cluster-potensial", icon: <CheckCircle2 className="w-3 h-3" /> };
  if (normalized === "sedang") return { text: "text-cluster-ramai", icon: <AlertTriangle className="w-3 h-3" /> };
  if (normalized === "rendah") return { text: "text-cluster-sepi", icon: <AlertOctagon className="w-3 h-3" /> };
  return { text: "text-wiraText-secondary", icon: <Info className="w-3 h-3" /> };
};

export function InsightCard({ result, isLoading }: InsightCardProps) {
  if (isLoading) {
    return (
      <div className="bg-surface-2 border border-surface-3 rounded-none p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
        <img src="/loading_illustration.png" alt="Loading" className="w-48 h-auto mb-4 mix-blend-multiply opacity-80" />
        <h3 className="font-display font-bold text-xl text-primary-900 mb-2">Sedang Menganalisis...</h3>
        <p className="font-body text-wiraText-secondary max-w-sm">
          Sistem WIRA sedang mengkalkulasi variabel geospasial dan menyusun insight AI.
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-surface-2 border border-surface-3 rounded-none p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
        <span className="px-3 py-1 bg-white rounded-none text-xs font-bold text-wiraText-secondary tracking-widest uppercase mb-4 shadow-sm border border-surface-3">
          Hasil Analisis
        </span>
        <h3 className="font-display font-bold text-xl text-primary-900 mb-2">Belum ada hasil</h3>
        <p className="font-body text-wiraText-secondary max-w-sm">
          Jalankan analisis untuk menampilkan skor dan narasi insight dari AI.
        </p>
      </div>
    );
  }

  const clusterStyles = getClusterStyles(result.clusterLabel);
  const confidenceStyles = getConfidenceStyles(result.confidenceLevel);

  return (
    <div className="bg-white border border-surface-3 rounded-none shadow-[0_2px_8px_rgba(13,26,20,0.08),0_0_0_1px_rgba(13,26,20,0.04)] overflow-hidden">
      {/* Header Label */}
      <div className="px-6 pt-6 pb-2">
        <span className="text-[10px] font-bold text-wiraText-secondary tracking-widest uppercase">
          Hasil Analisis
        </span>
      </div>

      <div className="px-6 pb-6 border-b border-surface-3">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          {/* Location Info & Badges */}
          <div className="flex flex-col gap-3">
            <div>
              <h3 className="font-display font-bold text-2xl text-primary-900">{result.locationName}</h3>
              <p className="font-body text-wiraText-secondary text-sm">
                Analisis untuk {result.businessType}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-none ${clusterStyles.bg} ${clusterStyles.text} font-bold text-xs`}>
                <span className={`w-2 h-2 rounded-none ${clusterStyles.dot}`} />
                {result.clusterLabel.toUpperCase()}
              </div>
              <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-none bg-surface-2 ${confidenceStyles.text} font-bold text-xs border border-surface-3`}>
                <span className="flex items-center">{confidenceStyles.icon}</span>
                Data OSM: {result.confidenceLevel.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Score */}
          <div className="flex flex-col items-end">
            <span className="font-mono font-medium text-[72px] md:text-[84px] text-primary-800 leading-none tracking-[-0.03em]">
              {formatScore(result.finalScore)}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 border-b border-surface-3 bg-surface">
        <h4 className="font-display font-bold text-sm text-primary-900 mb-4 uppercase tracking-wide">Breakdown Metrik</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          
          <MetricRow label="Kepadatan Lalu Lintas" value={result.metrics.trafficScore} />
          <MetricRow label="Aksesibilitas Transportasi" value={result.metrics.transitScore} />
          <MetricRow label="Kepadatan Lokasi Strategis" value={result.metrics.poiScore} />
          <MetricRow label="Tingkat Kompetisi" value={result.metrics.competitorScore} />
          <MetricRow label="Peluang Pasar Tersisa" value={result.metrics.compRatio} />
          
        </div>
      </div>

      <div className="p-6 border-b border-surface-3">
        <h4 className="font-display font-bold text-sm text-primary-900 mb-3 uppercase tracking-wide flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary-600" />
          AI Insight
        </h4>
        <p className="font-body text-wiraText-secondary leading-relaxed text-[15px]">
          "{result.insight}"
        </p>
      </div>

      <div className="p-4 bg-surface-2 flex flex-col sm:flex-row items-center gap-3">
        <button className="w-full sm:w-auto flex-1 py-2.5 px-4 bg-white border border-surface-3 font-body font-medium text-sm text-wiraText-secondary rounded-none hover:bg-surface transition-colors flex items-center justify-center gap-2">
          <Bookmark className="w-4 h-4" />
          Simpan ke Riwayat
        </button>
        <button className="w-full sm:w-auto flex-1 py-2.5 px-4 bg-white border border-surface-3 font-body font-medium text-sm text-wiraText-secondary rounded-none hover:bg-surface transition-colors flex items-center justify-center gap-2">
          <ArrowLeftRight className="w-4 h-4" />
          Bandingkan
        </button>
        <button className="w-full sm:w-auto flex-1 py-2.5 px-4 bg-primary-800 text-white! font-body font-medium text-sm rounded-none hover:bg-primary-700 transition-colors flex items-center justify-center gap-2">
          <Download className="w-4 h-4" />
          Unduh PDF
        </button>
      </div>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: number }) {
  const percent = formatPercent(value);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center text-sm">
        <span className="font-body text-wiraText-secondary">{label}</span>
        <span className="font-mono text-primary-900">{percent}</span>
      </div>
      <div className="h-1.5 w-full bg-surface-3 rounded-none overflow-hidden">
        <div 
          className="h-full bg-linear-to-r from-primary-600 to-primary-400 rounded-none transition-all duration-1000 ease-out"
          style={{ width: percent }}
        />
      </div>
    </div>
  );
}
