import { Link } from "react-router-dom";
import { SiteHeader } from "../components/layout/SiteHeader";

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col font-body">
      <SiteHeader />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-20 flex flex-col items-center justify-center grow text-center">
        <span className="text-[10px] font-bold text-wiraText-secondary tracking-widest uppercase bg-surface-2 px-2 py-1 rounded-none mb-4">
          Error 404
        </span>
        <img src="/404_illustration.png" alt="Page Not Found" className="w-64 h-auto mb-8 mix-blend-multiply opacity-90" />
        <h1 className="font-display font-bold text-4xl sm:text-5xl text-primary-900 mb-4">Halaman tidak ditemukan</h1>
        <p className="font-body text-wiraText-secondary text-lg mb-8 max-w-md">
          Halaman yang Anda cari mungkin telah dipindahkan atau dihapus.
        </p>
        <Link 
          className="px-6 py-3 bg-white text-primary-800 border border-surface-3 font-body font-medium rounded-none hover:bg-surface-2 transition-colors flex items-center justify-center gap-2 shadow-sm" 
          to="/"
        >
          Kembali ke Beranda
        </Link>
      </main>
    </div>
  );
}
