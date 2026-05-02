import { SiteHeader } from "../components/layout/SiteHeader";
import { SiteFooter } from "../components/layout/SiteFooter";
import { Plus, X, MapPin, Zap, Download } from "lucide-react";

export function ComparePage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col font-body">
      <SiteHeader />
      <main className="grow py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display font-bold text-3xl text-primary-900 mb-2">Bandingkan Lokasi</h1>
              <p className="font-body text-wiraText-secondary">
                Pilih hingga 3 lokasi untuk dibandingkan side-by-side.
              </p>
            </div>
            <button className="px-6 py-2.5 bg-primary-800 text-white! font-body font-medium rounded-none hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 h-[42px]">
              <Plus className="w-4 h-4" /> Tambah Lokasi Pembanding
            </button>
          </div>

          <div className="bg-white border border-surface-3 rounded-none shadow-sm overflow-hidden mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-surface-3">
              {/* Column 1: Tembalang */}
              <div className="p-6 flex flex-col items-center text-center bg-surface-2/50 relative">
                <button className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-none bg-white border border-surface-3 text-wiraText-muted hover:text-red-500 hover:border-red-200 transition-colors shadow-sm" title="Hapus">
                  <X className="w-4 h-4" />
                </button>
                <div className="w-12 h-12 bg-primary-100 text-primary-800 rounded-none flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-xl text-primary-900">Tembalang</h3>
                <p className="font-body text-sm font-medium text-wiraText-secondary uppercase tracking-wider mb-6">CAFE</p>
                
                <span className="font-mono font-medium text-6xl text-primary-800 mb-3 tracking-tight">84.9</span>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none bg-[#D1FAE5] text-[#065F46] font-bold text-xs mb-8">
                  <span className="w-2 h-2 rounded-none bg-[#22C55E]" />
                  POTENSIAL
                </div>

                <div className="w-full space-y-4 border-t border-surface-3 pt-6 text-sm text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-wiraText-secondary">Traffic</span>
                    <span className="font-mono font-medium text-primary-900">74%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-wiraText-secondary">Transit</span>
                    <span className="font-mono font-medium text-primary-900">57%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-wiraText-secondary">POI Score</span>
                    <span className="font-mono font-medium text-primary-900">83%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-wiraText-secondary">Kompetitor</span>
                    <span className="font-mono font-medium text-primary-900">55%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-wiraText-secondary">Opp. Ratio</span>
                    <span className="font-mono font-medium text-primary-900">45%</span>
                  </div>
                </div>
              </div>

              {/* Column 2: Banyumanik */}
              <div className="p-6 flex flex-col items-center text-center bg-white relative">
                <button className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-none bg-white border border-surface-3 text-wiraText-muted hover:text-red-500 hover:border-red-200 transition-colors shadow-sm" title="Hapus">
                  <X className="w-4 h-4" />
                </button>
                <div className="w-12 h-12 bg-primary-100 text-primary-800 rounded-none flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-xl text-primary-900">Banyumanik</h3>
                <p className="font-body text-sm font-medium text-wiraText-secondary uppercase tracking-wider mb-6">CAFE</p>
                
                <span className="font-mono font-medium text-6xl text-wiraText-primary mb-3 tracking-tight">71.2</span>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none bg-[#D1FAE5] text-[#065F46] font-bold text-xs mb-8">
                  <span className="w-2 h-2 rounded-none bg-[#22C55E]" />
                  POTENSIAL
                </div>

                <div className="w-full space-y-4 border-t border-surface-3 pt-6 text-sm text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-wiraText-secondary">Traffic</span>
                    <span className="font-mono font-medium text-primary-900">62%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-wiraText-secondary">Transit</span>
                    <span className="font-mono font-medium text-primary-900">65%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-wiraText-secondary">POI Score</span>
                    <span className="font-mono font-medium text-primary-900">70%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-wiraText-secondary">Kompetitor</span>
                    <span className="font-mono font-medium text-primary-900">40%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-wiraText-secondary">Opp. Ratio</span>
                    <span className="font-mono font-medium text-primary-900">60%</span>
                  </div>
                </div>
              </div>

              {/* Column 3: Empty Slot */}
              <div className="p-6 flex flex-col items-center justify-center text-center bg-surface border-2 border-dashed border-surface-3 m-4 rounded-none">
                <div className="w-16 h-16 rounded-none bg-white border border-surface-3 flex items-center justify-center text-wiraText-muted mb-4 shadow-sm">
                  <Plus className="w-6 h-6" />
                </div>
                <h3 className="font-display font-bold text-lg text-wiraText-primary mb-2">Tambah Lokasi</h3>
                <p className="font-body text-sm text-wiraText-secondary mb-6">Pilih lokasi ke-3 untuk dibandingkan.</p>
                <button className="px-6 py-2.5 bg-white border border-surface-3 text-primary-800 font-body font-medium rounded-none hover:bg-surface-2 transition-colors flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Pilih
                </button>
              </div>
            </div>
          </div>

          {/* AI Recommendation */}
          <div className="bg-primary-50 border border-primary-100 rounded-none p-8 mb-8 flex flex-col md:flex-row gap-6 items-start">
            <div className="w-12 h-12 rounded-none bg-primary-800 text-white! flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-display font-bold text-lg text-primary-900 mb-2">Rekomendasi AI</h4>
              <p className="font-body text-primary-800 leading-relaxed">
                "Untuk Cafe dengan target mahasiswa, <strong className="font-bold">Tembalang</strong> adalah pilihan terkuat karena kombinasi traffic dan POI yang lebih tinggi di sekitar kawasan kampus. Banyumanik menawarkan kompetisi yang lebih rendah, namun volume pasarnya tidak sebesar Tembalang."
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button className="px-6 py-3 bg-white border border-surface-3 text-primary-800 font-body font-medium rounded-none hover:bg-surface-2 transition-colors flex items-center gap-2 shadow-sm">
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
