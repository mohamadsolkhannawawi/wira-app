import { useState } from "react";
import { Link } from "react-router-dom";
import { SiteHeader } from "../components/layout/SiteHeader";
import { register } from "../services/api/auth";
import { tokenManager } from "../utils/tokenManager";
import { Eye, EyeOff } from "lucide-react";

export function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }
    try {
      const response = await register(name, email, password);
      tokenManager.setTokens(
        response.tokens.accessToken,
        response.tokens.refreshToken,
      );
      setStatus(`Akun berhasil dibuat untuk ${response.user.name}.`);
    } catch {
      setError("Gagal mendaftar. Silakan coba lagi.");
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body">
      <SiteHeader />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-14 flex flex-col items-center justify-center grow">
        <div className="w-full max-w-md bg-white border border-surface-3 rounded-none p-8 shadow-sm">
          <div className="flex flex-col items-center mb-8">
            <img src="/logo_wira.png" alt="WIRA Logo" className="w-16 h-16 object-contain mb-2" />
            <span className="font-display font-extrabold text-2xl text-primary-800">WIRA</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-primary-900 mb-2">Buat akun gratis</h1>
          <p className="font-body text-wiraText-secondary mb-6">
            Simpan riwayat analisis dan akses fitur banding lokasi kapan saja.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="font-body text-[13px] font-medium text-wiraText-secondary uppercase tracking-wider">Nama</span>
              <input
                className="w-full px-4 py-3 bg-surface border border-surface-3 rounded-none focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="font-body text-[13px] font-medium text-wiraText-secondary uppercase tracking-wider">Email</span>
              <input
                className="w-full px-4 py-3 bg-surface border border-surface-3 rounded-none focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="font-body text-[13px] font-medium text-wiraText-secondary uppercase tracking-wider">Password</span>
              <div className="relative">
                <input
                  className="w-full px-4 py-3 bg-surface border border-surface-3 rounded-none focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors pr-10"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-wiraText-muted hover:text-primary-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="font-body text-[13px] font-medium text-wiraText-secondary uppercase tracking-wider">Konfirmasi Password</span>
              <div className="relative">
                <input
                  className="w-full px-4 py-3 bg-surface border border-surface-3 rounded-none focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors pr-10"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-wiraText-muted hover:text-primary-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </label>
            
            <button className="w-full bg-primary-800 text-white! font-body font-medium h-[52px] rounded-none hover:bg-primary-700 transition-colors mt-2" type="submit">
              Daftar Gratis
            </button>
            {status ? <p className="text-sm font-medium text-primary-700 bg-primary-50 p-3 rounded-none border border-primary-100">{status}</p> : null}
            {error ? <p className="text-sm font-medium text-red-700 bg-red-50 p-3 rounded-none border border-red-100">{error}</p> : null}
          </form>

          <p className="text-sm text-wiraText-secondary mt-6 text-center">
            Sudah punya akun?{" "}
            <Link className="text-primary-600 font-medium hover:text-primary-800 transition-colors" to="/login">
              Masuk
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
