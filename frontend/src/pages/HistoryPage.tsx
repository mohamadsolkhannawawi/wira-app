import { useState, useEffect } from "react";
import { SiteHeader } from "../components/layout/SiteHeader";
import { SiteFooter } from "../components/layout/SiteFooter";
import { Star, AlertTriangle, MapPin, Trash2, ArrowRight } from "lucide-react";
import { getHistory, deleteHistory, toggleBookmark } from "../services/api/history";
import type { SearchHistorySummary } from "@wira-app/shared";
import { tokenManager } from "../utils/tokenManager";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale/id";

export function HistoryPage() {
  const [historyItems, setHistoryItems] = useState<SearchHistorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isAuthenticated = !!tokenManager.getAccessToken();

  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await getHistory();
        if (isMounted) setHistoryItems(res.data);
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : "Gagal memuat riwayat");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchHistory();
    return () => { isMounted = false; };
  }, [isAuthenticated]);

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus riwayat ini?")) return;
    try {
      await deleteHistory(id);
      setHistoryItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus");
    }
  };

  const handleBookmark = async (id: string) => {
    try {
      const res = await toggleBookmark(id);
      setHistoryItems(prev => prev.map(item => 
        item.id === id ? { ...item, isSaved: res.isSaved } : item
      ));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengubah bookmark");
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body">
      <SiteHeader />
      <main className="grow py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display font-bold text-3xl text-primary-900 mb-2">Riwayat Analisis</h1>
              <p className="font-body text-wiraText-secondary">
                20 hasil analisis tersimpan
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select className="px-4 py-2 bg-white border border-surface-3 rounded-none text-sm text-wiraText-secondary font-medium hover:border-primary-300 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer">
                <option>Filter: Semua Usaha</option>
                <option>Cafe / Kopi</option>
                <option>Laundry</option>
              </select>
              <select className="px-4 py-2 bg-white border border-surface-3 rounded-none text-sm text-wiraText-secondary font-medium hover:border-primary-300 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer">
                <option>Urutkan: Terbaru</option>
                <option>Skor Tertinggi</option>
              </select>
              <button className="px-4 py-2 bg-white border border-surface-3 rounded-none text-sm text-wiraText-secondary font-medium hover:bg-surface-2 transition-colors flex items-center gap-2">
                <Star className="w-4 h-4" /> Bookmark
              </button>
            </div>
          </div>

          {!isAuthenticated && (
            <div className="mb-8 px-5 py-4 bg-amber-50 text-amber-800 text-sm font-body font-medium rounded-none border border-amber-200 flex items-start sm:items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <div className="grow flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span>Riwayat hanya tersedia untuk akun terdaftar.</span>
                <a href="/register" className="px-4 py-2 bg-white text-amber-900 border border-amber-200 rounded-none hover:bg-amber-100 transition-colors whitespace-nowrap text-xs uppercase tracking-wider font-bold">
                  Daftar Akun Gratis
                </a>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>
          ) : error ? (
            <div className="text-red-500 text-center py-10">{error}</div>
          ) : historyItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {historyItems.map((item) => (
                <div key={item.id} className="bg-white border border-surface-3 rounded-none p-6 shadow-sm hover:shadow-md transition-shadow relative group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col gap-1">
                      <h3 className="font-display font-bold text-xl text-primary-900 flex items-center gap-2">
                        <MapPin className="text-primary-600 w-5 h-5" /> {item.locationName}
                      </h3>
                      <p className="font-body text-sm text-wiraText-secondary font-medium">{item.businessType}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleBookmark(item.id)} className={`w-8 h-8 flex items-center justify-center rounded-none transition-colors ${item.isSaved ? 'text-amber-500 bg-amber-50' : 'text-wiraText-muted hover:bg-surface-2 hover:text-amber-500'}`} title="Bookmark">
                        <Star className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="w-8 h-8 flex items-center justify-center rounded-none hover:bg-red-50 text-wiraText-muted hover:text-red-500 transition-colors" title="Hapus">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <span className="font-mono font-medium text-4xl text-primary-800">{item.finalScore.toFixed(1)}</span>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-none font-bold text-xs ${
                      item.clusterLabel === "POTENSIAL" ? "bg-[#D1FAE5] text-[#065F46]" :
                      item.clusterLabel === "RAMAI" ? "bg-[#FEF3C7] text-[#92400E]" :
                      "bg-[#FEE2E2] text-[#991B1B]"
                    }`}>
                      <span className={`w-2 h-2 rounded-none ${
                        item.clusterLabel === "POTENSIAL" ? "bg-[#22C55E]" :
                        item.clusterLabel === "RAMAI" ? "bg-[#F59E0B]" :
                        "bg-[#EF4444]"
                      }`} />
                      {item.clusterLabel}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-surface-3 pt-4 text-xs font-medium text-wiraText-muted">
                    <span>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: localeId })}</span>
                    <a href={`/#analysis?id=${item.id}`} className="text-primary-600 hover:text-primary-800 flex items-center gap-1">
                      Lihat Detail <ArrowRight className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4 border border-surface-3 bg-white shadow-sm">
              <img src="/empty_history.png" alt="Empty History" className="w-64 h-auto mb-6" />
              <h3 className="font-display font-bold text-2xl text-primary-900 mb-2 text-center">Belum ada analisis tersimpan</h3>
              <p className="font-body text-wiraText-secondary text-center max-w-md mb-8">
                Mulai analisis pertama Anda untuk melihat riwayat dan membandingkan lokasi bisnis terbaik.
              </p>
              <a
                href="/#analysis"
                className="px-6 py-3 bg-primary-800 text-white! font-body font-medium rounded-none hover:bg-primary-700 transition-colors inline-flex items-center gap-2"
              >
                Mulai Analisis <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
