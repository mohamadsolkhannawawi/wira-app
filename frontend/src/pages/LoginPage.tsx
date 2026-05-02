import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SiteHeader } from "../components/layout/SiteHeader";
import { login } from "../services/api/auth";
import { tokenManager } from "../utils/tokenManager";
import { Eye, EyeOff } from "lucide-react";

export function LoginPage() {
  const [email, setEmail] = useState("user@wira.app");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await login(email, password);
    tokenManager.setTokens(
      response.tokens.accessToken,
      response.tokens.refreshToken,
    );
    setStatus(`Welcome back, ${response.user.name}.`);
    setTimeout(() => navigate("/"), 1000);
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
          <h1 className="font-display font-bold text-2xl text-primary-900 mb-2">Selamat datang kembali</h1>
          <p className="font-body text-wiraText-secondary mb-6">
            Masuk untuk menyimpan riwayat analisis dan membandingkan lokasi.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            
            <button className="w-full bg-primary-800 text-white! font-body font-medium h-[52px] rounded-none hover:bg-primary-700 transition-colors mt-2" type="submit">
              Masuk
            </button>
            {status ? <p className="text-sm font-medium text-primary-700 bg-primary-50 p-3 rounded-none border border-primary-100">{status}</p> : null}
          </form>

          <p className="text-sm text-wiraText-secondary mt-6 text-center">
            Belum punya akun?{" "}
            <Link className="text-primary-600 font-medium hover:text-primary-800 transition-colors" to="/register">
              Daftar Gratis
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
