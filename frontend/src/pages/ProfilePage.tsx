import { useState, useEffect } from "react";
import { SiteHeader } from "../components/layout/SiteHeader";
import { SiteFooter } from "../components/layout/SiteFooter";
import { User, Mail, AtSign, CheckCircle } from "lucide-react";
import { getProfile } from "../services/api/user";
import type { AuthUser } from "@wira-app/shared";
import { tokenManager } from "../utils/tokenManager";
import { useNavigate } from "react-router-dom";

export function ProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!tokenManager.getAccessToken()) {
        navigate("/login");
        return;
      }
      try {
        setLoading(true);
        const data = await getProfile();
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat profil");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body">
      <SiteHeader />
      <main className="grow py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <h1 className="font-display font-bold text-3xl text-primary-900 mb-8">Profil Saya</h1>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-none mb-6">
              {error}
            </div>
          ) : user ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column: Avatar & Summary */}
              <div className="md:col-span-1">
                <div className="bg-white border border-surface-3 rounded-none p-8 flex flex-col items-center text-center shadow-sm">
                  <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 border-2 border-primary-50 mb-4">
                    <User className="w-12 h-12" />
                  </div>
                  <h2 className="font-display font-bold text-xl text-primary-900">{user.name}</h2>
                  <p className="text-sm text-primary-700 font-mono mb-6">@{user.username || "wirauser"}</p>
                  
                  <div className="w-full pt-6 border-t border-surface-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-wiraText-secondary">Status Akun</span>
                      <span className="inline-flex items-center gap-1 text-green-600 font-bold text-xs uppercase">
                        <CheckCircle className="w-3 h-3" /> Terverifikasi
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Details */}
              <div className="md:col-span-2 flex flex-col gap-6">
                <div className="bg-white border border-surface-3 rounded-none p-8 shadow-sm">
                  <h3 className="font-display font-bold text-lg text-primary-900 mb-6 border-b border-surface-3 pb-4">
                    Informasi Pengguna
                  </h3>
                  
                  <div className="flex flex-col gap-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-surface-2 rounded-none">
                        <AtSign className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-wiraText-muted uppercase tracking-wider mb-1">Username</span>
                        <span className="text-primary-900 font-mono font-medium">@{user.username || "wirauser"}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-surface-2 rounded-none">
                        <User className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-wiraText-muted uppercase tracking-wider mb-1">Nama Lengkap</span>
                        <span className="text-primary-900 font-medium">{user.name}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-surface-2 rounded-none">
                        <Mail className="w-5 h-5 text-primary-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-wiraText-muted uppercase tracking-wider mb-1">Alamat Email</span>
                        <span className="text-primary-900 font-medium">{user.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-primary-50 border border-primary-100 p-6 rounded-none">
                  <h4 className="text-primary-900 font-bold mb-2">Informasi Keamanan</h4>
                  <p className="text-sm text-primary-800/80 mb-4">
                    Data Anda aman dan dienkripsi. Riwayat analisis Anda hanya dapat dilihat oleh Anda sendiri.
                  </p>
                  <button className="text-sm font-bold text-primary-700 hover:text-primary-900 transition-colors uppercase tracking-wider">
                    Ubah Password →
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
