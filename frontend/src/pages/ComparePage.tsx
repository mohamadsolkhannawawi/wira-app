import { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { SiteHeader } from "../components/layout/SiteHeader";
import { SiteFooter } from "../components/layout/SiteFooter";
import {
  Plus,
  X,
  MapPin,
  Zap,
  Download,
  Search,
  AlertCircle,
  XCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { getKelurahanList, getStreetList } from "../services/api/locations";
import { submitAnalysis } from "../services/api/analysis";
import { tokenManager } from "../utils/tokenManager";
import type { AnalysisResult } from "@wira-app/shared";
import { requestJson } from "../services/api/client";
import { generateComparisonPdf } from "../utils/exportPdf";
import ReactMarkdown from "react-markdown";
import { ConfirmModal } from "../shared/ConfirmModal";

interface CompareCard {
  kelurahan: string;
  streetName: string;
  bizType: string;
  result: AnalysisResult | null;
  loading: boolean;
  error: string | null;
}

export function ComparePage() {
  const [searchParams] = useSearchParams();
  const bizTypeParam = searchParams.get("type") || "CAFE";

  // Cards state - initialize from URL params + analysis cache if available
  const [cards, setCards] = useState<CompareCard[]>(() => {
    const kelurahanParam = searchParams.get("kelurahan");
    if (kelurahanParam) {
      const cached = localStorage.getItem("wira_last_analysis");
      if (cached) {
        try {
          const result = JSON.parse(cached) as AnalysisResult;
          if (result.kelurahan === kelurahanParam) {
            const initialCards: CompareCard[] = [
              {
                kelurahan: result.kelurahan,
                streetName: result.streetName,
                bizType: result.bizType,
                result,
                loading: false,
                error: null,
              },
            ];

            // Add alternatives as additional cards
            if (result.rekomendasiAlternatif) {
              result.rekomendasiAlternatif.slice(0, 2).forEach((alt) => {
                initialCards.push({
                  kelurahan: alt.kecamatan,
                  streetName: alt.nama_jalan,
                  bizType: result.bizType,
                  result: null,
                  loading: true,
                  error: null,
                });
              });
            }
            return initialCards;
          }
        } catch {
          // ignore
        }
      }
    }
    return [];
  });
  const [error, setError] = useState<string | null>(null);

  // Add Location Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allKelurahans, setAllKelurahans] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKelurahan, setSelectedKelurahan] = useState("");
  const [streetOptions, setStreetOptions] = useState<string[]>([]);
  const [selectedStreet, setSelectedStreet] = useState("");
  const [modalStep, setModalStep] = useState<"kelurahan" | "street">(
    "kelurahan",
  );

  // AI Insight
  const [insightNarrative, setInsightNarrative] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState(false);

  // Confirm Modal
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    type: "clearAll" | "removeCard";
    index?: number;
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "clearAll",
    title: "",
    message: "",
  });

  const onRemoveCardClick = (index: number, streetName: string) => {
    setConfirmModalState({
      isOpen: true,
      type: "removeCard",
      index,
      title: `Hapus ${streetName}?`,
      message: "Lokasi ini akan dihapus dari perbandingan Anda.",
    });
  };

  const onClearAllClick = () => {
    setConfirmModalState({
      isOpen: true,
      type: "clearAll",
      title: "Hapus semua perbandingan?",
      message: "Seluruh kartu lokasi perbandingan saat ini akan dihapus dari layar.",
    });
  };

  const executeConfirmAction = () => {
    if (confirmModalState.type === "clearAll") {
      handleClearAll();
    } else if (
      confirmModalState.type === "removeCard" &&
      confirmModalState.index !== undefined
    ) {
      handleRemoveCard(confirmModalState.index);
    }
    setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
  };

  // Fetch alternatives on mount if auto-populated
  useEffect(() => {
    cards.forEach((card, idx) => {
      if (idx > 0 && card.loading) {
        submitAnalysis({
          bizType: card.bizType,
          kelurahan: card.kelurahan,
          streetName: card.streetName,
        })
          .then((res) => {
            setCards((prev) =>
              prev.map((c, i) =>
                i === idx
                  ? { ...c, result: res, loading: false, kelurahan: res.kelurahan }
                  : c,
              ),
            );
          })
          .catch((err) => {
            setCards((prev) =>
              prev.map((c, i) =>
                i === idx
                  ? {
                      ...c,
                      loading: false,
                      error:
                        err instanceof Error
                          ? err.message
                          : "Gagal memuat",
                    }
                  : c,
              ),
            );
          });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAllKelurahans = useCallback(async () => {
    if (allKelurahans.length > 0) return;
    try {
      const data = await getKelurahanList();
      setAllKelurahans(data);
    } catch (err) {
      console.error(err);
    }
  }, [allKelurahans.length]);

  const fetchStreetOptions = useCallback(async (kel: string) => {
    if (!kel) return;
    try {
      const data = await getStreetList(kel);
      setStreetOptions(data);
    } catch (err) {
      console.error(err);
      setStreetOptions([]);
    }
  }, []);

  // Load kelurahan list for modal
  useEffect(() => {
    const initFetch = async () => {
      await fetchAllKelurahans();
    };
    void initFetch();
  }, [fetchAllKelurahans]);

  // Load streets when kelurahan selected
  useEffect(() => {
    setTimeout(() => {
      void fetchStreetOptions(selectedKelurahan);
    }, 0);
  }, [selectedKelurahan, fetchStreetOptions]);

  const suggestions = allKelurahans.filter(
    (k) =>
      k.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !cards.some((c) => c.kelurahan === k && c.streetName),
  );

  const handleSelectKelurahan = (kel: string) => {
    setSelectedKelurahan(kel);
    setModalStep("street");
    setSearchQuery("");
  };

  const handleAddCard = () => {
    if (!selectedKelurahan || !selectedStreet) return;

    const newCard: CompareCard = {
      kelurahan: selectedKelurahan,
      streetName: selectedStreet,
      bizType: bizTypeParam,
      result: null,
      loading: true,
      error: null,
    };

    const cardIndex = cards.length;
    setCards((prev) => [...prev, newCard]);
    setIsModalOpen(false);
    resetModal();

    // Fetch analysis
    submitAnalysis({
      bizType: bizTypeParam,
      kelurahan: selectedKelurahan,
      streetName: selectedStreet,
    })
      .then((res) => {
        setCards((prev) =>
          prev.map((c, i) =>
            i === cardIndex ? { ...c, result: res, loading: false } : c,
          ),
        );
      })
      .catch((err) => {
        setCards((prev) =>
          prev.map((c, i) =>
            i === cardIndex
              ? {
                  ...c,
                  loading: false,
                  error:
                    err instanceof Error ? err.message : "Gagal memuat analisis",
                }
              : c,
          ),
        );
      });
  };

  const resetModal = () => {
    setSelectedKelurahan("");
    setSelectedStreet("");
    setSearchQuery("");
    setModalStep("kelurahan");
  };

  const handleRemoveCard = (index: number) => {
    setCards((prev) => prev.filter((_, i) => i !== index));
    setInsightNarrative(null);
  };

  const handleClearAll = () => {
    setCards([]);
    setInsightNarrative(null);
  };

  const handleGenerateInsight = async () => {
    const isAuthenticated = !!tokenManager.getAccessToken();
    if (!isAuthenticated) {
      setLoginPrompt(true);
      return;
    }

    const completed = cards.filter((c) => c.result);
    if (completed.length < 2) {
      setError("Minimal 2 lokasi dengan hasil analisis untuk generate insight.");
      return;
    }

    setInsightLoading(true);
    setError(null);

    try {
      const locations = completed.map((c) => ({
        namaJalan: c.result!.streetName,
        kelurahan: c.result!.kelurahan,
        finalScore: c.result!.skorPotensi,
        trafficScore: c.result!.nilaiFiturJalan.traffic_score,
        transitScore: c.result!.nilaiFiturJalan.transit_score,
        poiScore: c.result!.nilaiFiturJalan.poi_score,
        competitorCount: c.result!.nilaiFiturJalan.competitor,
        compRatio: c.result!.nilaiFiturJalan.comp_ratio,
      }));

      const res = await requestJson<{ narrative: string }>(
        "/analysis/compare-insight",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ businessType: bizTypeParam, locations }),
        },
      );
      setInsightNarrative(res.narrative);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal menghasilkan insight komparasi",
      );
    } finally {
      setInsightLoading(false);
    }
  };

  const completedCards = cards.filter((c) => c.result);

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body">
      <SiteHeader />

      {/* Login Required Modal */}
      {loginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(13,26,20,0.4)] backdrop-blur-sm px-4">
          <div className="bg-white border border-surface-3 p-8 shadow-2xl flex flex-col items-center text-center max-w-md w-full">
            <div className="w-16 h-16 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="font-display font-bold text-xl text-primary-900 mb-2">
              Login Diperlukan
            </h3>
            <p className="font-body text-sm text-wiraText-secondary mb-6">
              Fitur Generate Insight memerlukan login. Masuk untuk mendapatkan
              analisis perbandingan dari AI.
            </p>
            <div className="flex gap-3">
              <Link
                to="/login"
                className="px-5 py-2.5 bg-primary-800 text-white! text-xs font-bold uppercase tracking-wider hover:bg-primary-700 transition-colors"
              >
                Masuk
              </Link>
              <button
                onClick={() => setLoginPrompt(false)}
                className="px-4 py-2 border border-surface-3 text-xs font-bold uppercase tracking-wider hover:bg-surface transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD LOCATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(13,26,20,0.6)] backdrop-blur-md px-4">
          <div className="bg-white border border-surface-3 p-8 shadow-2xl w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display font-bold text-xl text-primary-900">
                {modalStep === "kelurahan"
                  ? "Pilih Kelurahan"
                  : `Pilih Jalan di ${selectedKelurahan}`}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetModal();
                }}
                className="text-wiraText-muted hover:text-primary-900"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {modalStep === "kelurahan" && (
              <>
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-wiraText-muted" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Cari Kelurahan..."
                    className="w-full pl-12 pr-4 py-3 bg-surface-2 border border-surface-3 rounded-none focus:outline-none focus:ring-1 focus:ring-primary-500 font-body"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => void fetchAllKelurahans()}
                  />
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {suggestions.length > 0 ? (
                    suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSelectKelurahan(s)}
                        className="w-full text-left p-4 bg-white border border-surface-3 hover:bg-primary-50 hover:border-primary-200 transition-colors flex items-center gap-3"
                      >
                        <MapPin className="w-4 h-4 text-primary-500" />
                        <span className="font-body font-medium text-primary-900">
                          {s}
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="text-center py-8 text-wiraText-secondary text-sm">
                      Ketikkan nama Kelurahan untuk mencari.
                    </p>
                  )}
                </div>
              </>
            )}

            {modalStep === "street" && (
              <>
                <button
                  onClick={() => {
                    setModalStep("kelurahan");
                    setSelectedKelurahan("");
                    setSelectedStreet("");
                  }}
                  className="text-sm text-primary-600 hover:text-primary-800 mb-4 flex items-center gap-1"
                >
                  ← Ganti Kelurahan
                </button>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {streetOptions.length > 0 ? (
                    streetOptions.map((street) => (
                      <button
                        key={street}
                        onClick={() => setSelectedStreet(street)}
                        className={`w-full text-left p-4 border transition-colors flex items-center gap-3 ${
                          selectedStreet === street
                            ? "bg-primary-50 border-primary-300"
                            : "bg-white border-surface-3 hover:bg-primary-50 hover:border-primary-200"
                        }`}
                      >
                        <MapPin className="w-4 h-4 text-primary-500" />
                        <span className="font-body font-medium text-primary-900">
                          {street}
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="text-center py-8 text-wiraText-secondary text-sm">
                      Memuat daftar jalan...
                    </p>
                  )}
                </div>
                {selectedStreet && (
                  <button
                    onClick={handleAddCard}
                    className="w-full mt-4 px-6 py-3 bg-primary-800 text-white! font-body font-medium rounded-none hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Tambah ke Perbandingan
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <main className="grow py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display font-bold text-3xl text-primary-900 mb-2">
                Bandingkan Lokasi
              </h1>
              <p className="font-body text-wiraText-secondary">
                Bandingkan lokasi untuk{" "}
                {bizTypeParam.replace(/_/g, " ")}. Tambahkan lokasi untuk memulai.
              </p>
            </div>
            <div className="flex gap-3 h-10.5">
              {cards.length > 0 && (
                <button
                  onClick={onClearAllClick}
                  className="px-6 py-2.5 bg-white border border-red-200 text-red-600 font-body font-medium rounded-none hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" /> Hapus Semua
                </button>
              )}
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-2.5 bg-primary-800 text-white! font-body font-medium rounded-none hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Tambah Lokasi
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              {error}
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {cards.map((card, idx) => (
              <div
                key={`${card.kelurahan}-${card.streetName}-${idx}`}
                className="bg-white border border-surface-3 rounded-none shadow-sm overflow-hidden relative"
              >
                <button
                  onClick={() => onRemoveCardClick(idx, card.streetName)}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white border border-surface-3 text-wiraText-muted hover:text-red-500 hover:border-red-200 transition-colors shadow-sm z-10"
                  title="Hapus"
                >
                  <X className="w-4 h-4" />
                </button>

                {card.loading ? (
                  <div className="p-6 flex flex-col items-center justify-center min-h-80">
                    <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-4" />
                    <p className="font-body text-sm text-wiraText-secondary">
                      Menganalisis {card.streetName}...
                    </p>
                  </div>
                ) : card.error ? (
                  <div className="p-6 flex flex-col items-center justify-center min-h-80 text-center">
                    <AlertCircle className="w-8 h-8 text-red-400 mb-4" />
                    <p className="font-body text-sm text-red-600">
                      {card.error}
                    </p>
                  </div>
                ) : card.result ? (
                  <div className="p-6 flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-primary-100 text-primary-800 rounded-none flex items-center justify-center mb-4">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <h3 className="font-display font-bold text-lg text-primary-900">
                      {card.result.streetName}
                    </h3>
                    <p className="font-body text-[10px] font-bold text-wiraText-muted uppercase tracking-widest mb-1">
                      {card.result.kelurahan}, {card.result.kecamatan}
                    </p>
                    <p className="text-xs text-wiraText-secondary mb-4">
                      {card.result.bizType}
                    </p>

                    <span className="font-mono font-medium text-5xl text-primary-800 mb-2 tracking-tight">
                      {card.result.skorPotensi.toFixed(1)}
                    </span>
                    <ScoreBadge score={card.result.skorPotensi} />

                    <div className="w-full mt-6 space-y-3 border-t border-surface-3 pt-4 text-sm text-left">
                      <MetricRow
                        label="Traffic"
                        value={card.result.nilaiFiturJalan.traffic_score}
                      />
                      <MetricRow
                        label="Transit"
                        value={card.result.nilaiFiturJalan.transit_score}
                      />
                      <MetricRow
                        label="POI Score"
                        value={card.result.nilaiFiturJalan.poi_score}
                      />
                      <MetricRow
                        label="Kompetitor"
                        value={card.result.nilaiFiturJalan.competitor}
                      />
                      <MetricRow
                        label="Peluang"
                        value={card.result.nilaiFiturJalan.comp_ratio}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            ))}

            {/* Empty slot */}
            {cards.length === 0 && (
              <div className="col-span-full p-12 flex flex-col items-center justify-center text-center bg-surface border-2 border-dashed border-surface-3 rounded-none min-h-80">
                <div className="w-16 h-16 bg-white border border-surface-3 flex items-center justify-center text-wiraText-muted mb-4 shadow-sm">
                  <Plus className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-lg text-wiraText-primary mb-2">
                  Mulai Bandingkan
                </h3>
                <p className="font-body text-sm text-wiraText-secondary mb-6 max-w-md">
                  Tambahkan minimal 2 lokasi untuk membandingkan skor dan metrik.
                  Klik tombol "Tambah Lokasi" di atas untuk memulai.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-2.5 bg-primary-800 text-white! font-body font-medium rounded-none hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Tambah Lokasi Pertama
                </button>
              </div>
            )}
          </div>

          {/* Generate Insight Button */}
          {completedCards.length >= 2 && (
            <div className="flex justify-center mb-8">
              <button
                onClick={handleGenerateInsight}
                disabled={insightLoading}
                className="px-8 py-3 bg-primary-800 text-white! font-body font-medium rounded-none hover:bg-primary-700 transition-colors flex items-center gap-3 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {insightLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Insight...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Generate AI Insight Perbandingan
                  </>
                )}
              </button>
            </div>
          )}

          {/* AI Narrative */}
          {insightNarrative && (
            <div className="bg-primary-50 border border-primary-100 rounded-none p-8 mb-8 flex flex-col md:flex-row gap-6 items-start">
              <div className="w-12 h-12 rounded-none bg-primary-800 text-white! flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-display font-bold text-lg text-primary-900 mb-2">
                  Rekomendasi Strategis WIRA
                </h4>
                <div className="font-body text-primary-900 leading-relaxed text-[15px] max-w-none [&_p]:mb-4 last:[&_p]:mb-0 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4 [&_strong]:font-bold [&_strong]:text-primary-950 [&_li]:mb-1 [&_h3]:font-display [&_h3]:font-bold [&_h3]:text-lg [&_h3]:mt-4 [&_h3]:mb-2 [&_h4]:font-display [&_h4]:font-bold [&_h4]:text-base [&_h4]:mt-3 [&_h4]:mb-1">
                  <ReactMarkdown>{insightNarrative}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {/* Download */}
          {completedCards.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={() => {
                  const isAuthenticated = !!tokenManager.getAccessToken();
                  if (!isAuthenticated) {
                    setLoginPrompt(true);
                    return;
                  }
                  const results = completedCards
                    .map((c) => c.result)
                    .filter((r): r is AnalysisResult => r !== null);
                  generateComparisonPdf(
                    results,
                    insightNarrative,
                    bizTypeParam,
                  );
                }}
                className="px-6 py-3 bg-white border border-surface-3 text-primary-800 font-body font-medium rounded-none hover:bg-surface-2 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Download className="w-5 h-5" />
                Unduh Laporan Komparasi PDF
              </button>
            </div>
          )}
        </div>
      </main>
      <ConfirmModal
        isOpen={confirmModalState.isOpen}
        title={confirmModalState.title}
        message={confirmModalState.message}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        onConfirm={executeConfirmAction}
        onCancel={() =>
          setConfirmModalState((prev) => ({ ...prev, isOpen: false }))
        }
      />
      <SiteFooter />
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const label = score >= 70 ? "POTENSIAL" : score >= 40 ? "SEDANG" : "RENDAH";
  const styles =
    score >= 70
      ? "bg-[#D1FAE5] text-[#065F46]"
      : score >= 40
        ? "bg-[#FEF3C7] text-[#92400E]"
        : "bg-[#FEE2E2] text-[#991B1B]";
  const dot =
    score >= 70 ? "bg-[#22C55E]" : score >= 40 ? "bg-[#F59E0B]" : "bg-[#EF4444]";

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 font-bold text-xs ${styles}`}
    >
      <span className={`w-2 h-2 ${dot}`} />
      {label}
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: number }) {
  const percent = `${Math.round((value > 1 ? value : value * 100))}%`;
  return (
    <div className="flex justify-between items-center">
      <span className="text-wiraText-secondary">{label}</span>
      <span className="font-mono font-medium text-primary-900">{percent}</span>
    </div>
  );
}
