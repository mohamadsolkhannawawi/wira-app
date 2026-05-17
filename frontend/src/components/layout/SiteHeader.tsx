import { useState, useEffect } from "react";
import { Menu, X, User, LogOut, History } from "lucide-react";
import { tokenManager } from "../../utils/tokenManager";

export function SiteHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication on mount and whenever tokens change
    setTimeout(() => {
      setIsAuthenticated(!!tokenManager.getAccessToken());
    }, 0);
  }, []);

  const handleLogout = () => {
    tokenManager.clearTokens();
    setIsAuthenticated(false);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 h-16 w-full bg-[rgba(248,250,247,0.92)] backdrop-blur-lg border-b border-[rgba(13,26,20,0.08)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between max-w-7xl">
        
        {/* LOGO AREA */}
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <img src="/logo_wira.png" alt="WIRA Logo" className="w-8 h-8 object-contain" />
            <span className="font-display font-extrabold text-[24px] text-primary-800 leading-none mt-1">
              WIRA
            </span>
          </a>
        </div>

        {/* NAV LINKS (Desktop) */}
        <nav className="hidden md:flex items-center gap-2">
          <a
            href="/#analysis"
            className="px-4 py-2 font-body text-sm font-medium text-wiraText-secondary hover:bg-[rgba(10,79,61,0.06)] rounded-none transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            Analisis
          </a>
        </nav>

        {/* AUTH AREA (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <a
                href="/history"
                className="flex items-center gap-2 px-4 py-2 font-body text-sm font-medium text-wiraText-secondary hover:bg-[rgba(10,79,61,0.06)] transition-colors"
                title="Riwayat Analisis"
              >
                <History className="w-4 h-4" />
                <span>Riwayat</span>
              </a>
              <div className="h-4 w-px bg-[rgba(13,26,20,0.12)] mx-1" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 font-body text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar</span>
              </button>
              <a
                href="/profile"
                className="ml-2 w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 hover:bg-primary-200 transition-colors border border-primary-200"
                title="Profil Saya"
              >
                <User className="w-5 h-5" />
              </a>
            </div>
          ) : (
            <>
              <a
                href="/login"
                className="px-4 py-2 font-body text-sm font-medium text-primary-800 border border-primary-800 rounded-none hover:bg-primary-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                Masuk
              </a>
              <a
                href="/register"
                className="px-4 py-2 font-body text-sm font-medium text-white! bg-primary-800 rounded-none hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 hover:-translate-y-px hover:shadow-md"
              >
                Daftar Gratis
              </a>
            </>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden p-2 text-wiraText-primary focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* MOBILE MENU (Drawer) */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-surface-3 p-4 flex flex-col gap-4 animate-in slide-in-from-top duration-300 shadow-xl">
          <nav className="flex flex-col gap-2">
            <a
              href="/#analysis"
              className="px-4 py-3 font-body text-base font-medium text-wiraText-secondary hover:bg-[rgba(10,79,61,0.06)] rounded-none transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Analisis
            </a>
            <a
              href="/#map"
              className="px-4 py-3 font-body text-base font-medium text-wiraText-secondary hover:bg-[rgba(10,79,61,0.06)] rounded-none transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Peta Heatmap
            </a>
            {isAuthenticated && (
              <a
                href="/history"
                className="px-4 py-3 font-body text-base font-medium text-wiraText-secondary hover:bg-[rgba(10,79,61,0.06)] rounded-none transition-colors flex items-center gap-3"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <History className="w-5 h-5" />
                Riwayat Analisis
              </a>
            )}
          </nav>
          <div className="flex flex-col gap-3 pt-4 border-t border-[rgba(13,26,20,0.08)]">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full text-center px-4 py-3 font-body text-base font-medium text-red-600 border border-red-200 rounded-none hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Keluar
              </button>
            ) : (
              <>
                <a
                  href="/login"
                  className="w-full text-center px-4 py-3 font-body text-base font-medium text-primary-800 border border-primary-800 rounded-none hover:bg-primary-50 transition-colors"
                >
                  Masuk
                </a>
                <a
                  href="/register"
                  className="w-full text-center px-4 py-3 font-body text-base font-medium text-white! bg-primary-800 rounded-none hover:bg-primary-700 transition-colors shadow-sm"
                >
                  Daftar Gratis
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
