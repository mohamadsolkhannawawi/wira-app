import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SiteHeader } from "../components/layout/SiteHeader";
import { SiteFooter } from "../components/layout/SiteFooter";
import { Plus, X, MapPin, Zap, Download, Search, AlertCircle, XCircle } from "lucide-react";
import { compareLocations, getLocationSuggestions } from "../services/api/locations";
import type { CompareLocationsResponse, BusinessType } from "@wira-app/shared";
import { exportElementToPdf } from "../utils/exportPdf";

export function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize state from URL and fallback to localStorage
  const [selectedKelurahans, setSelectedKelurahans] = useState<string[]>(() => {
    const kelurahanParam = searchParams.get("kelurahan");
    const saved = localStorage.getItem("wira_compare_locations");
    const savedList = saved ? JSON.parse(saved) : [];
    
    if (kelurahanParam) {
      // Ensure URL param is always in the list and at the first position
      const list = [kelurahanParam, ...savedList.filter((k: string) => k !== kelurahanParam)];
      return list.slice(0, 3);
    }
    return savedList;
  });
  const businessType = (searchParams.get("type") as BusinessType) || "CAFE";
  
  const [comparisonData, setComparisonData] = useState<CompareLocationsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allKelurahans, setAllKelurahans] = useState<string[]>([]);

  // Selection Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Load all kelurahans once on mount for the search modal
  useEffect(() => {
    const loadAll = async () => {
      try {
        const data = await getLocationSuggestions();
        setAllKelurahans(data);
      } catch (err) {
        console.error("Failed to load locations", err);
      }
    };
    loadAll();
  }, []);

  // Fetch comparison data when selections change
  useEffect(() => {
    if (selectedKelurahans.length === 0) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (selectedKelurahans.length === 1) {
          const { getLocationDetail } = await import("../services/api/locations");
          const details = await getLocationDetail(businessType, selectedKelurahans[0]);
          // Take the first item from the array returned by backend
          const detail = Array.isArray(details) ? details[0] : details;
          
          if (detail) {
            setComparisonData({
              businessType,
              locations: [detail],
              recommended: detail.kelurahan,
              narrative: "Tambahkan lokasi pembanding untuk mendapatkan analisis komparasi dari AI WIRA."
            });
          }
        } else {
          const res = await compareLocations(businessType, selectedKelurahans);
          setComparisonData(res);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat data komparasi");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Persist to localStorage
    localStorage.setItem("wira_compare_locations", JSON.stringify(selectedKelurahans));

    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    newParams.set("type", businessType);
    if (selectedKelurahans.length > 0) {
        newParams.set("kelurahan", selectedKelurahans[0]);
    } else {
        newParams.delete("kelurahan");
    }
    setSearchParams(newParams);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedKelurahans, businessType]);

  const suggestions = searchQuery.trim().length >= 1
    ? allKelurahans.filter(k => 
        k.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !selectedKelurahans.includes(k)
      ) // Removed slice to show all results
    : [];

  const handleAddLocation = (kelurahan: string) => {
    if (selectedKelurahans.length >= 3) return;
    if (selectedKelurahans.includes(kelurahan)) return;
    setSelectedKelurahans([...selectedKelurahans, kelurahan]);
    setIsModalOpen(false);
    setSearchQuery("");
  };

  const handleRemoveLocation = (index: number) => {
    const newSelections = [...selectedKelurahans];
    newSelections.splice(index, 1);
    setSelectedKelurahans(newSelections);
    
    // Reset data if no locations left
    if (newSelections.length === 0) {
      setComparisonData(null);
      localStorage.removeItem("wira_compare_locations");
    }
  };

  const handleClearAll = () => {
    setSelectedKelurahans([]);
    setComparisonData(null);
    localStorage.removeItem("wira_compare_locations");
  };

  const handleDownloadPDF = () => {
    if (selectedKelurahans.length > 0) {
      exportElementToPdf("compare-report", `WIRA_Comparison_${businessType}`);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body">
      <SiteHeader />
      
      {/* SEARCH MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(13,26,20,0.6)] backdrop-blur-md animate-in fade-in duration-200 px-4">
          <div className="bg-white border border-surface-3 p-8 shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display font-bold text-xl text-primary-900">Pilih Lokasi</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-wiraText-muted hover:text-primary-900">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-wiraText-muted" />
              <input 
                autoFocus
                type="text" 
                placeholder="Cari Kelurahan (min. 3 karakter)..." 
                className="w-full pl-12 pr-4 py-3 bg-surface-2 border border-surface-3 rounded-none focus:outline-none focus:ring-1 focus:ring-primary-500 font-body"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {suggestions.length > 0 ? (
                suggestions.map(s => (
                  <button 
                    key={s}
                    onClick={() => handleAddLocation(s)}
                    className="w-full text-left p-4 bg-white border border-surface-3 hover:bg-primary-50 hover:border-primary-200 transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-primary-500" />
                      <span className="font-body font-medium text-primary-900">{s}</span>
                    </div>
                    <Plus className="w-4 h-4 text-primary-600 opacity-0 group-hover:opacity-100" />
                  </button>
                ))
              ) : searchQuery.length >= 3 ? (
                <p className="text-center py-8 text-wiraText-secondary text-sm">Tidak ada hasil ditemukan.</p>
              ) : (
                <p className="text-center py-8 text-wiraText-secondary text-sm">Ketikkan nama Kelurahan untuk mencari.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="grow py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display font-bold text-3xl text-primary-900 mb-2">Bandingkan Lokasi</h1>
              <p className="font-body text-wiraText-secondary">
                Bandingkan hingga 3 lokasi untuk {businessType.replace(/_/g, " ")}.
              </p>
            </div>
            <div className="flex gap-3 h-[42px]">
              {selectedKelurahans.length > 0 && (
                <button 
                  onClick={handleClearAll}
                  className="px-6 py-2.5 bg-white border border-red-200 text-red-600 font-body font-medium rounded-none hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" /> Hapus Semua
                </button>
              )}
              {selectedKelurahans.length < 3 && (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="px-6 py-2.5 bg-primary-800 text-white! font-body font-medium rounded-none hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Tambah Lokasi Pembanding
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          <div id="compare-report" className="bg-white border border-surface-3 rounded-none shadow-sm overflow-hidden mb-8">
            <div className={`grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-surface-3 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
              
              {/* RENDER SELECTED LOCATIONS */}
              {comparisonData?.locations.map((loc, idx) => (
                <div key={loc.kelurahan} className={`p-6 flex flex-col items-center text-center relative ${idx === 0 ? 'bg-surface-2/30' : ''}`}>
                  <button 
                    onClick={() => handleRemoveLocation(idx)}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-none bg-white border border-surface-3 text-wiraText-muted hover:text-red-500 hover:border-red-200 transition-colors shadow-sm" title="Hapus"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="w-12 h-12 bg-primary-100 text-primary-800 rounded-none flex items-center justify-center mb-4">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-primary-900">{loc.kelurahan}</h3>
                  <p className="font-body text-[10px] font-bold text-wiraText-muted uppercase tracking-widest mb-6">{loc.kecamatan}</p>
                  
                  <span className="font-mono font-medium text-6xl text-primary-800 mb-3 tracking-tight">
                    {loc.finalScore !== undefined ? loc.finalScore.toFixed(1) : "0.0"}
                  </span>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-none font-bold text-xs mb-8 ${
                    loc.clusterLabel === "POTENSIAL" ? "bg-[#D1FAE5] text-[#065F46]" :
                    loc.clusterLabel === "RAMAI" ? "bg-[#FEF3C7] text-[#92400E]" :
                    "bg-[#FEE2E2] text-[#991B1B]"
                  }`}>
                    <span className={`w-2 h-2 rounded-none ${
                      loc.clusterLabel === "POTENSIAL" ? "bg-[#22C55E]" :
                      loc.clusterLabel === "RAMAI" ? "bg-[#F59E0B]" :
                      "bg-[#EF4444]"
                    }`} />
                    {loc.clusterLabel}
                  </div>

                  <div className="w-full space-y-4 border-t border-surface-3 pt-6 text-sm text-left">
                    <MetricRow label="Traffic" value={loc.metrics.trafficScore} />
                    <MetricRow label="Transit" value={loc.metrics.transitScore} />
                    <MetricRow label="POI Score" value={loc.metrics.poiScore} />
                    <MetricRow label="Kompetisi" value={loc.metrics.competitorScore} />
                    <MetricRow label="Opp. Ratio" value={loc.metrics.compRatio} />
                  </div>
                </div>
              ))}

              {/* EMPTY SLOTS */}
              {Array.from({ length: 3 - (comparisonData?.locations.length || 0) }).map((_, i) => (
                <div key={`empty-${i}`} className="p-6 flex flex-col items-center justify-center text-center bg-surface border-2 border-dashed border-surface-3 m-4 rounded-none min-h-[400px]">
                  <div className="w-16 h-16 rounded-none bg-white border border-surface-3 flex items-center justify-center text-wiraText-muted mb-4 shadow-sm">
                    <Plus className="w-6 h-6" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-wiraText-primary mb-2">Tambah Lokasi</h3>
                  <p className="font-body text-sm text-wiraText-secondary mb-6">Pilih lokasi pembanding untuk melihat performa relatif.</p>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-2.5 bg-white border border-surface-3 text-primary-800 font-body font-medium rounded-none hover:bg-surface-2 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Pilih
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendation */}
          {comparisonData && (
            <div className="bg-primary-50 border border-primary-100 rounded-none p-8 mb-8 flex flex-col md:flex-row gap-6 items-start">
              <div className="w-12 h-12 rounded-none bg-primary-800 text-white! flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-display font-bold text-lg text-primary-900 mb-2">Rekomendasi Strategis WIRA</h4>
                <p className="font-body text-primary-800 leading-relaxed italic">
                  "{comparisonData.narrative}"
                </p>
                <p className="mt-4 text-xs font-bold text-primary-700 uppercase tracking-widest">
                  Lokasi Rekomendasi: {comparisonData.recommended}
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button 
              onClick={handleDownloadPDF}
              className="px-6 py-3 bg-white border border-surface-3 text-primary-800 font-body font-medium rounded-none hover:bg-surface-2 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Download className="w-5 h-5" />
              Unduh Laporan Komparasi PDF
            </button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: number }) {
  const percent = `${Math.round(value * 100)}%`;
  return (
    <div className="flex justify-between items-center">
      <span className="text-wiraText-secondary">{label}</span>
      <span className="font-mono font-medium text-primary-900">{percent}</span>
    </div>
  );
}
