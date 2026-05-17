import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  AlertTriangle,
  Zap,
  Bookmark,
  ArrowLeftRight,
  Download,
  XCircle,
} from "lucide-react";
import { tokenManager } from "../utils/tokenManager";
import type { AnalysisResult } from "@wira-app/shared";
import { generateAnalysisPdf } from "../utils/exportPdf";
import ReactMarkdown from "react-markdown";
import { ConfirmModal } from "./ConfirmModal";

interface InsightCardProps {
  result: AnalysisResult | null;
  isLoading?: boolean;
  onClear?: () => void;
}

const formatScore = (value: number): string => {
  if (!Number.isFinite(value)) return "-";
  return value.toFixed(1);
};

const formatPercent = (value: number): string => {
  if (!Number.isFinite(value)) return "0%";
  const normalized = value > 1 ? value : value * 100;
  return `${Math.round(normalized)}%`;
};

/**
 * Determine a cluster-style label based on skorPotensi.
 * This replaces the old clusterLabel from the backend.
 */
const getScoreLabel = (score: number): string => {
  if (score >= 70) return "POTENSIAL";
  if (score >= 40) return "SEDANG";
  return "RENDAH";
};

const getClusterStyles = (label: string) => {
  const normalized = label.toLowerCase();
  if (normalized === "potensial") {
    return { bg: "bg-[#D1FAE5]", text: "text-[#065F46]", dot: "bg-[#22C55E]" };
  }
  if (normalized === "sedang") {
    return { bg: "bg-[#FEF3C7]", text: "text-[#92400E]", dot: "bg-[#F59E0B]" };
  }
  if (normalized === "rendah") {
    return { bg: "bg-[#FEE2E2]", text: "text-[#991B1B]", dot: "bg-[#EF4444]" };
  }
  return {
    bg: "bg-surface-2",
    text: "text-wiraText-secondary",
    dot: "bg-surface-3",
  };
};

export function InsightCard({ result, isLoading, onClear }: InsightCardProps) {
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "success" | "error" | "guest"
  >("idle");
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-surface-2 border border-surface-3 rounded-none p-8 flex flex-col items-center justify-center min-h-100 text-center">
        <img
          src="/loading_illustration.png"
          alt="Loading"
          className="w-48 h-auto mb-4 mix-blend-multiply opacity-80"
        />
        <h3 className="font-display font-bold text-xl text-primary-900 mb-2">
          Sedang Menganalisis...
        </h3>
        <p className="font-body text-wiraText-secondary max-w-sm">
          Sistem WIRA sedang mengkalkulasi variabel geospasial dan menyusun
          insight AI.
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-surface-2 border border-surface-3 rounded-none p-8 flex flex-col items-center justify-center min-h-100 text-center">
        <span className="px-3 py-1 bg-white rounded-none text-xs font-bold text-wiraText-secondary tracking-widest uppercase mb-4 shadow-sm border border-surface-3">
          Hasil Analisis
        </span>
        <h3 className="font-display font-bold text-xl text-primary-900 mb-2">
          Belum ada hasil
        </h3>
        <p className="font-body text-wiraText-secondary max-w-sm">
          Jalankan analisis untuk menampilkan skor dan narasi insight dari AI.
        </p>
      </div>
    );
  }

  const handleSaveToHistory = () => {
    const isAuthenticated = !!tokenManager.getAccessToken();
    if (!isAuthenticated) {
      setSaveStatus("guest");
    } else {
      // Logic for saving already happens on backend submit,
      // but we show confirmation here.
      setSaveStatus("success");
    }

    // Auto close modal after 3 seconds
    setTimeout(() => setSaveStatus("idle"), 3000);
  };

  const handleCompare = () => {
    if (result) {
      navigate(
        `/compare?kelurahan=${result.kelurahan}&type=${result.bizType}`,
      );
    }
  };

  const handleDownload = () => {
    const isAuthenticated = !!tokenManager.getAccessToken();
    if (!isAuthenticated) {
      setSaveStatus("guest");
      return;
    }
    if (result) {
      generateAnalysisPdf(result);
    }
  };

  const scoreLabel = getScoreLabel(result.skorPotensi);
  const clusterStyles = getClusterStyles(scoreLabel);

  // Map new FeatureBlock to display metrics
  const fitur = result.nilaiFiturJalan;

  return (
    <div
      id="insight-report"
      className="bg-white border border-surface-3 rounded-none shadow-[0_2px_8px_rgba(13,26,20,0.08),0_0_0_1px_rgba(13,26,20,0.04)] overflow-hidden relative"
    >
      {/* POPUP MODAL (Save Status) */}
      {saveStatus !== "idle" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(13,26,20,0.4)] backdrop-blur-sm animate-in fade-in duration-200 px-4">
          <div className="bg-white border border-surface-3 p-8 shadow-2xl flex flex-col items-center text-center max-w-md w-full animate-in zoom-in-95 duration-300">
            {saveStatus === "success" ? (
              <>
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-display font-bold text-xl text-primary-900 mb-2">
                  Berhasil Tersimpan!
                </h3>
                <p className="font-body text-sm text-wiraText-secondary mb-6">
                  Analisis untuk {result.streetName} telah ditambahkan ke
                  riwayat Anda.
                </p>
              </>
            ) : saveStatus === "guest" ? (
              <>
                <div className="w-16 h-16 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="font-display font-bold text-xl text-primary-900 mb-2">
                  Login Diperlukan
                </h3>
                <p className="font-body text-sm text-wiraText-secondary mb-6">
                  Silakan masuk ke akun Anda untuk menggunakan fitur ini. Fitur
                  simpan riwayat dan unduh laporan hanya tersedia untuk pengguna
                  yang sudah login.
                </p>
                <div className="flex gap-3">
                  <a
                    href="/login"
                    className="px-5 py-2.5 bg-primary-800 text-white! text-xs font-bold uppercase tracking-wider hover:bg-primary-700 transition-colors"
                  >
                    Masuk
                  </a>
                  <a
                    href="/register"
                    className="px-5 py-2.5 border border-primary-200 text-primary-800 text-xs font-bold uppercase tracking-wider hover:bg-primary-50 transition-colors"
                  >
                    Daftar
                  </a>
                  <button
                    onClick={() => setSaveStatus("idle")}
                    className="px-4 py-2 border border-surface-3 text-xs font-bold uppercase tracking-wider hover:bg-surface transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                  <XCircle className="w-8 h-8" />
                </div>
                <h3 className="font-display font-bold text-xl text-primary-900 mb-2">
                  Terjadi Kesalahan
                </h3>
                <p className="font-body text-sm text-wiraText-secondary mb-6">
                  Gagal menyimpan riwayat. Silakan coba lagi nanti.
                </p>
              </>
            )}
            {saveStatus === "success" && (
              <button
                onClick={() => setSaveStatus("idle")}
                className="font-body text-xs font-bold text-primary-700 hover:text-primary-900 uppercase tracking-widest"
              >
                Lanjutkan
              </button>
            )}
          </div>
        </div>
      )}

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
            <div className="flex items-center gap-3">
              <h3 className="font-display font-bold text-2xl text-primary-900">
                {result.streetName}
              </h3>
              {result && !isLoading && onClear && (
                <button
                  onClick={() => setShowConfirmClear(true)}
                  className="p-1.5 text-wiraText-muted hover:text-red-500 hover:bg-red-50 transition-colors rounded-none"
                  title="Hapus Hasil"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              )}
            </div>
            <div>
              <p className="font-body text-wiraText-secondary text-sm">
                {result.kelurahan}, {result.kecamatan} · {result.bizType}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-1">
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-none ${clusterStyles.bg} ${clusterStyles.text} font-bold text-xs`}
              >
                <span className={`w-2 h-2 rounded-none ${clusterStyles.dot}`} />
                {scoreLabel}
              </div>
            </div>
          </div>

          {/* Score */}
          <div className="flex flex-col items-end">
            <span className="font-mono font-medium text-[72px] md:text-[84px] text-primary-800 leading-none tracking-[-0.03em]">
              {formatScore(result.skorPotensi)}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 border-b border-surface-3 bg-surface">
        <h4 className="font-display font-bold text-sm text-primary-900 mb-4 uppercase tracking-wide">
          Breakdown Metrik
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <MetricRow
            label="Kepadatan Lalu Lintas"
            value={fitur.traffic_score}
          />
          <MetricRow
            label="Aksesibilitas Transportasi"
            value={fitur.transit_score}
          />
          <MetricRow
            label="Kepadatan Lokasi Strategis"
            value={fitur.poi_score}
          />
          <MetricRow
            label="Tingkat Kompetisi"
            value={fitur.competitor}
          />
          <MetricRow
            label="Peluang Pasar Tersisa"
            value={fitur.comp_ratio}
          />
        </div>
      </div>

      <div className="p-6 border-b border-surface-3">
        <h4 className="font-display font-bold text-sm text-primary-900 mb-3 uppercase tracking-wide flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary-600" />
          AI Insight
        </h4>
        <div className="font-body text-wiraText-secondary leading-relaxed text-[15px] max-w-none [&_p]:mb-4 last:[&_p]:mb-0 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4 [&_strong]:font-bold [&_strong]:text-primary-950 [&_li]:mb-1 [&_h3]:font-display [&_h3]:font-bold [&_h3]:text-lg [&_h3]:mt-4 [&_h3]:mb-2 [&_h4]:font-display [&_h4]:font-bold [&_h4]:text-base [&_h4]:mt-3 [&_h4]:mb-1">
          <ReactMarkdown>{result.insight}</ReactMarkdown>
        </div>
      </div>

      {result.rekomendasiAlternatif && result.rekomendasiAlternatif.length > 0 && (
        <div className="p-6 border-b border-surface-3 bg-surface">
          <h4 className="font-display font-bold text-sm text-primary-900 mb-4 uppercase tracking-wide">
            Alternatif Lokasi
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.rekomendasiAlternatif.map((alt) => (
              <div
                key={`${alt.peringkat}-${alt.nama_jalan}`}
                className="border border-surface-3 bg-white p-4 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-bold text-wiraText-muted uppercase tracking-widest">
                      Peringkat {alt.peringkat}
                    </div>
                    <div className="font-display font-bold text-primary-900">
                      {alt.nama_jalan}
                    </div>
                    <div className="text-xs text-wiraText-secondary">
                      {alt.kecamatan}
                    </div>
                  </div>
                  <div className="font-mono text-2xl text-primary-800">
                    {formatScore(alt.skor_potensi_persen)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-wiraText-secondary">
                  <span>
                    Traffic: {formatPercent(alt.nilai_fitur_jalan.traffic_score)}
                  </span>
                  <span>
                    Transit: {formatPercent(alt.nilai_fitur_jalan.transit_score)}
                  </span>
                  <span>POI: {formatPercent(alt.nilai_fitur_jalan.poi_score)}</span>
                  <span>
                    Kompetisi: {formatPercent(alt.nilai_fitur_jalan.competitor)}
                  </span>
                  <span>
                    Peluang: {formatPercent(alt.nilai_fitur_jalan.comp_ratio)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-4 bg-surface-2 flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={handleSaveToHistory}
          className="w-full sm:w-auto flex-1 py-2.5 px-4 bg-white border border-surface-3 font-body font-medium text-sm text-wiraText-secondary rounded-none hover:bg-surface transition-colors flex items-center justify-center gap-2"
        >
          <Bookmark className="w-4 h-4" />
          Simpan ke Riwayat
        </button>
        <button
          onClick={handleCompare}
          className="w-full sm:w-auto flex-1 py-2.5 px-4 bg-white border border-surface-3 font-body font-medium text-sm text-wiraText-secondary rounded-none hover:bg-surface transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeftRight className="w-4 h-4" />
          Bandingkan
        </button>
        <button
          onClick={handleDownload}
          className="w-full sm:w-auto flex-1 py-2.5 px-4 bg-primary-800 text-white! font-body font-medium text-sm rounded-none hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Unduh PDF
        </button>
      </div>
      <ConfirmModal
        isOpen={showConfirmClear}
        title="Hapus hasil analisis?"
        message="Hasil analisis lokasi ini akan dibersihkan dari layar."
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        onConfirm={() => {
          setShowConfirmClear(false);
          onClear?.();
        }}
        onCancel={() => setShowConfirmClear(false)}
      />
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
