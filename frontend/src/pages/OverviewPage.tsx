import { useState, useEffect } from "react";
import type {
  AnalysisRequest,
  AnalysisResult,
  AnalysisHistorySummary,
} from "@wira-app/shared";
import { SiteFooter } from "../components/layout/SiteFooter";
import { SiteHeader } from "../components/layout/SiteHeader";
import { submitAnalysis, getAnalysisById } from "../services/api/analysis";
import { InsightCard } from "../shared/InsightCard";
import { SearchCard } from "../shared/SearchCard";
import {
  Star,
  History,
  AlertTriangle,
  ArrowRight,
  MapPin,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getHistory } from "../services/api/history";
import { tokenManager } from "../utils/tokenManager";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { useLocation } from "react-router-dom";

export function OverviewPage() {
  const location = useLocation();
  const [result, setResult] = useState<AnalysisResult | null>(() => {
    const saved = localStorage.getItem("wira_last_analysis");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [historyItems, setHistoryItems] = useState<AnalysisHistorySummary[]>(
    [],
  );
  const [historyLoading, setHistoryLoading] = useState(false);
  const isAuthenticated = !!tokenManager.getAccessToken();

  useEffect(() => {
    const fetchFromHash = async () => {
      if (location.hash && location.hash.startsWith("#analysis?id=")) {
        const id = location.hash.split("id=")[1];
        if (id) {
          if (result?.id !== id) {
            try {
              setLoading(true);
              const res = await getAnalysisById(id);
              setResult(res);
              localStorage.setItem("wira_last_analysis", JSON.stringify(res));
              setTimeout(() => {
                document.getElementById("analysis")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }, 300);
            } catch (err) {
              console.error("Gagal memuat detail analisis", err);
            } finally {
              setLoading(false);
            }
          } else {
            // Already loaded, just scroll to it
            setTimeout(() => {
              document.getElementById("analysis")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
          }
        }
      }
    };
    fetchFromHash();
  }, [location.hash, result?.id]);
  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated) {
      setTimeout(() => {
        if (isMounted) setHistoryLoading(true);
      }, 0);
      getHistory(1, 4)
        .then((res) => {
          if (isMounted) setHistoryItems(res.data);
        })
        .catch((err) => console.error("Gagal memuat riwayat", err))
        .finally(() => {
          if (isMounted) setHistoryLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const handleSubmit = async (payload: AnalysisRequest) => {
    setLoading(true);
    try {
      const analysis = await submitAnalysis(payload);
      setResult(analysis);
      // Persist result to localStorage
      localStorage.setItem("wira_last_analysis", JSON.stringify(analysis));
    } catch (err) {
      console.error("Analysis failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResult(null);
    localStorage.removeItem("wira_last_analysis");
  };

  return (
    <div>
      <SiteHeader />
      <main className="grow">
        <section className="relative pt-8 pb-16 overflow-hidden min-h-[calc(100vh-64px)] flex items-center bg-surface">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(10,79,61,0.06)_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Text Content */}
              <div className="lg:col-span-7 flex flex-col items-start gap-6">
                <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-primary-900 leading-[1.1] tracking-tight">
                  Lokasi Tepat,
                  <br />
                  <span className="text-primary-600">Bisnis Berkembang.</span>
                </h1>
                <p className="font-body text-wiraText-secondary text-lg leading-relaxed max-w-xl">
                  Rekomendasi lokasi terbaik untuk UMKM Anda di Semarang, didukung data geospasial dan AI.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
                  <a
                    href="#analysis"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-800 text-white! font-body font-medium rounded-none hover:bg-primary-700 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
                  >
                    Mulai Analisis Sekarang <ArrowRight className="w-5 h-5" />
                  </a>
                  <a
                    href="#history"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-800 border border-primary-100 font-body font-medium rounded-none hover:bg-primary-50 transition-all duration-300"
                  >
                    Lihat Contoh Hasil
                  </a>
                </div>

                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-surface-3 w-full max-w-md">
                  <div className="flex items-center gap-2 text-sm font-bold text-primary-900">
                    <div className="flex text-[#F59E0B]">
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                    Dipercaya 1.200+ pelaku UMKM Semarang
                  </div>
                  <div className="flex items-center gap-4 text-xs text-wiraText-muted font-body">
                    <span>174 Kelurahan</span>
                    <span className="w-1 h-1 rounded-none bg-surface-3" />
                    <span>12 Jenis Usaha</span>
                    <span className="w-1 h-1 rounded-none bg-surface-3" />
                    <span>Data Real OSM</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Preview Card */}
              <div className="lg:col-span-5 hidden md:block relative">
                <img
                  src="/loading_illustration_transparant.png"
                  alt="WIRA Data Illustration"
                  className="w-full object-contain h-[380px] mb-[-120px] z-0 relative mix-blend-multiply opacity-90 scale-110 pointer-events-none"
                />
                <div className="rounded-none p-6 shadow-xl border border-surface-3 relative z-10 w-[90%] ml-auto backdrop-blur-sm bg-white/90">
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-xs font-semibold text-wiraText-muted uppercase tracking-wider">
                      Preview Analisis
                    </div>
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-none bg-surface-3" />
                      <span className="w-2 h-2 rounded-none bg-surface-3" />
                      <span className="w-2 h-2 rounded-none bg-surface-3" />
                    </div>
                  </div>

                  <h3 className="font-display font-bold text-xl text-primary-900 mb-4">
                    Skor Potensi Teratas
                  </h3>

                  <div className="flex flex-col gap-3">
                    {/* Item 1 */}
                    <div className="flex items-center justify-between p-4 rounded-none bg-surface-2 border border-surface-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-none bg-cluster-potensial/20 flex items-center justify-center">
                          <span className="w-3 h-3 rounded-none bg-cluster-potensial" />
                        </div>
                        <span className="font-body font-medium text-wiraText-primary">
                          Tembalang
                        </span>
                      </div>
                      <span className="font-mono font-medium text-xl text-primary-800">
                        84.9
                      </span>
                    </div>
                    {/* Item 2 */}
                    <div className="flex items-center justify-between p-4 rounded-none border border-surface-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-none bg-cluster-potensial/10 flex items-center justify-center">
                          <span className="w-3 h-3 rounded-none bg-cluster-potensial/50" />
                        </div>
                        <span className="font-body font-medium text-wiraText-secondary">
                          Banyumanik
                        </span>
                      </div>
                      <span className="font-mono font-medium text-lg text-wiraText-secondary">
                        71.2
                      </span>
                    </div>
                    {/* Item 3 */}
                    <div className="flex items-center justify-between p-4 rounded-none border border-surface-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-none bg-cluster-ramai/10 flex items-center justify-center">
                          <span className="w-3 h-3 rounded-none bg-cluster-ramai/50" />
                        </div>
                        <span className="font-body font-medium text-wiraText-secondary">
                          Pedurungan
                        </span>
                      </div>
                      <span className="font-mono font-medium text-lg text-wiraText-secondary">
                        65.8
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURE CARDS */}
        <section className="py-20 bg-white border-y border-surface-3">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="flex flex-col items-start p-6 rounded-none bg-surface hover:bg-surface-2 transition-colors border border-surface-3 relative overflow-hidden group">
                <div className="w-full h-40 mb-6 flex items-center justify-center overflow-hidden bg-surface-2">
                  <img
                    src="/feature_data.png"
                    alt="Data Akurat"
                    className="w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-display font-bold text-xl text-primary-900 mb-3">
                  Skor Potensi Akurat
                </h3>
                <p className="font-body text-wiraText-secondary leading-relaxed">
                  Dihitung dari 5 variabel geospasial nyata: traffic, transit,
                  POI, kompetitor, dan peluang pasar.
                </p>
              </div>

              {/* Card 2 */}
              <div className="flex flex-col items-start p-6 rounded-none bg-surface hover:bg-surface-2 transition-colors border border-surface-3 relative overflow-hidden group">
                <div className="w-full h-40 mb-6 flex items-center justify-center overflow-hidden bg-surface-2">
                  <img
                    src="/feature_map.png"
                    alt="Peta Interaktif"
                    className="w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-display font-bold text-xl text-primary-900 mb-3">
                  Peta Visual Interaktif
                </h3>
                <p className="font-body text-wiraText-secondary leading-relaxed">
                  Lihat persebaran potensi seluruh Semarang sekaligus. Warna
                  menunjukkan peluang, klik untuk detail.
                </p>
              </div>

              {/* Card 3 */}
              <div className="flex flex-col items-start p-6 rounded-none bg-surface hover:bg-surface-2 transition-colors border border-surface-3 relative overflow-hidden group">
                <div className="w-full h-40 mb-6 flex items-center justify-center overflow-hidden bg-surface-2">
                  <img
                    src="/feature_ai.png"
                    alt="AI Insight"
                    className="w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-display font-bold text-xl text-primary-900 mb-3">
                  Narasi AI yang Mudah Dipahami
                </h3>
                <p className="font-body text-wiraText-secondary leading-relaxed">
                  Bukan sekadar angka. AI menjelaskan mengapa sebuah lokasi
                  cocok untuk bisnis Anda, dalam bahasa sehari-hari.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="analysis"
          className="py-20 bg-surface-2 border-b border-surface-3 scroll-mt-16"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5">
                <SearchCard onSubmit={handleSubmit} isLoading={loading} />
              </div>
              <div id="insight" className="lg:col-span-7 scroll-mt-24">
                <InsightCard
                  result={result}
                  isLoading={loading}
                  onClear={handleClear}
                />
              </div>
            </div>
          </div>
        </section>

        <section id="history" className="py-20 bg-surface scroll-mt-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="mb-8">
              <span className="text-[10px] font-bold text-wiraText-secondary tracking-widest uppercase bg-surface-2 px-2 py-1 rounded-none border border-surface-3">
                Riwayat
              </span>
              <h2 className="font-display font-bold text-3xl text-primary-900 mt-3 mb-2">
                Riwayat analisis Anda
              </h2>
              <p className="font-body text-wiraText-secondary max-w-2xl">
                {isAuthenticated
                  ? "Daftar riwayat analisis terbaru yang telah Anda lakukan. Klik untuk melihat detail atau kelola riwayat Anda."
                  : "Simpan hasil analisis untuk dibandingkan kembali. Masuk untuk menyimpan riwayat secara permanen."}
              </p>
            </div>

            {isAuthenticated ? (
              historyLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                </div>
              ) : historyItems.length > 0 ? (
                <div className="flex flex-col items-center">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8 max-w-5xl mx-auto">
                    {historyItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white border border-surface-3 rounded-none p-6 shadow-sm hover:shadow-md transition-shadow relative"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex flex-col gap-1">
                            <h3 className="font-display font-bold text-lg text-primary-900 flex items-center gap-2">
                              <MapPin className="text-primary-600 w-4 h-4 shrink-0" />{" "}
                              {item.streetName}
                            </h3>
                            <p className="font-body text-xs text-wiraText-secondary font-medium">
                              {item.kelurahan} · {item.bizType}
                            </p>
                          </div>
                          {item.isSaved && (
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                          <span className="font-mono font-medium text-3xl text-primary-800">
                            {item.skorPotensi.toFixed(1)}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-wiraText-secondary">
                            Skor Potensi
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-t border-surface-3 pt-3 text-[11px] font-medium text-wiraText-muted">
                          <span>
                            {item.createdAt
                              ? formatDistanceToNow(new Date(item.createdAt), {
                                  addSuffix: true,
                                  locale: localeId,
                                })
                              : "Baru saja"}
                          </span>
                          <a
                            href={`/#analysis?id=${item.id}`}
                            className="text-primary-600 hover:text-primary-800 flex items-center gap-1 font-bold"
                          >
                            Lihat Detail <ArrowRight className="w-3 h-3 ml-1" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link
                    to="/history"
                    className="px-8 py-3 bg-primary-800 text-white! font-body font-medium text-sm rounded-none hover:bg-primary-700 transition-colors inline-flex items-center gap-2"
                  >
                    Lihat Semua Riwayat <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <div className="relative max-w-4xl mx-auto">
                  <img
                    src="/history_ornament.png"
                    alt=""
                    className="hidden lg:block absolute -left-32 top-1/2 -translate-y-1/2 w-56 h-auto mix-blend-multiply opacity-30 pointer-events-none"
                  />
                  <img
                    src="/history_ornament.png"
                    alt=""
                    className="hidden lg:block absolute -right-32 top-1/2 -translate-y-1/2 w-56 h-auto mix-blend-multiply opacity-30 pointer-events-none scale-x-[-1]"
                  />
                  <div className="bg-white border border-surface-3 rounded-none p-12 flex flex-col items-center justify-center text-center shadow-sm relative z-10">
                    <div className="w-16 h-16 bg-surface-2 rounded-none flex items-center justify-center text-wiraText-muted mb-4 border border-surface-3">
                      <History className="w-8 h-8" />
                    </div>
                    <p className="font-body text-wiraText-secondary mb-6 text-lg">
                      Belum ada analisis tersimpan di akun Anda. Mulai analisis pertama Anda!
                    </p>
                    <a
                      href="#analysis"
                      className="px-6 py-3 bg-primary-800 text-white! font-body font-medium rounded-none hover:bg-primary-700 transition-colors"
                    >
                      Mulai Analisis
                    </a>
                  </div>
                </div>
              )
            ) : (
              <div className="relative max-w-4xl mx-auto">
                <img
                  src="/history_ornament.png"
                  alt=""
                  className="hidden lg:block absolute -left-32 top-1/2 -translate-y-1/2 w-56 h-auto mix-blend-multiply opacity-30 pointer-events-none"
                />
                <img
                  src="/history_ornament.png"
                  alt=""
                  className="hidden lg:block absolute -right-32 top-1/2 -translate-y-1/2 w-56 h-auto mix-blend-multiply opacity-30 pointer-events-none scale-x-[-1]"
                />
                <div className="bg-white border border-surface-3 rounded-none p-12 flex flex-col items-center justify-center text-center shadow-sm relative z-10">
                  <div className="w-16 h-16 bg-surface-2 rounded-none flex items-center justify-center text-wiraText-muted mb-4 border border-surface-3">
                    <History className="w-8 h-8" />
                  </div>
                  <p className="font-body text-wiraText-secondary mb-6 text-lg">
                    Belum ada analisis tersimpan. Mulai analisis pertama Anda!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href="#analysis"
                      className="px-6 py-3 bg-primary-800 text-white! font-body font-medium rounded-none hover:bg-primary-700 transition-colors"
                    >
                      Mulai Analisis
                    </a>
                    <Link
                      to="/register"
                      className="px-6 py-3 bg-white text-primary-800 border border-primary-200 font-body font-medium rounded-none hover:bg-primary-50 transition-colors"
                    >
                      Daftar Gratis
                    </Link>
                  </div>
                  <div className="mt-8 px-4 py-3 bg-amber-50 text-amber-800 text-sm font-body font-medium rounded-none border border-amber-200 flex items-start gap-3 text-left w-full max-w-md">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                    <span>
                      Riwayat guest akan hilang saat tab ditutup. Daftar akun
                      gratis untuk menyimpan permanen.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
