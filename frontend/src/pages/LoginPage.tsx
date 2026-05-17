import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SiteHeader } from "../components/layout/SiteHeader";
import { login } from "../services/api/auth";
import { tokenManager } from "../utils/tokenManager";
import { Eye, EyeOff, AlertTriangle, X, CheckCircle } from "lucide-react";
import { useToast } from "../contexts/ToastContext";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setStatus(null);
    setFieldErrors({});

    // Validate empty fields
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) errors.email = "Email wajib diisi.";
    if (!password) errors.password = "Password wajib diisi.";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError(Object.values(errors).join(" "));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await login(email.trim(), password);
      tokenManager.setTokens(
        response.tokens.accessToken,
        response.tokens.refreshToken,
      );
      setStatus(`Selamat datang, ${response.user.name}!`);
      showToast(`Berhasil masuk! Selamat datang, ${response.user.name}.`);
      setTimeout(() => navigate("/"), 1000);
    } catch {
      setError("Email atau password salah. Silakan periksa kembali.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (field: "email" | "password") =>
    `w-full px-4 py-3 bg-surface border rounded-none focus:outline-none focus:ring-1 transition-colors ${
      fieldErrors[field]
        ? "border-red-400 focus:border-red-500 focus:ring-red-500"
        : "border-surface-3 focus:border-primary-500 focus:ring-primary-500"
    }`;

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body">
      <SiteHeader />

      {/* Error Modal */}
      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(13,26,20,0.4)] backdrop-blur-sm px-4">
          <div className="bg-white border border-surface-3 p-8 shadow-2xl flex flex-col items-center text-center max-w-md w-full">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="font-display font-bold text-xl text-primary-900 mb-2">
              Login Gagal
            </h3>
            <p className="font-body text-sm text-wiraText-secondary mb-6">
              {error}
            </p>
            <button
              type="button"
              onClick={() => setError(null)}
              className="px-6 py-2.5 bg-primary-800 text-white! font-body font-medium rounded-none hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" /> Coba Lagi
            </button>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-14 flex flex-col items-center justify-center grow">
        <div className="w-full max-w-md bg-white border border-surface-3 rounded-none p-8 shadow-sm">
          <div className="flex flex-col items-center mb-8">
            <img
              src="/logo_wira.png"
              alt="WIRA Logo"
              className="w-16 h-16 object-contain mb-2"
            />
            <span className="font-display font-extrabold text-2xl text-primary-800">
              WIRA
            </span>
          </div>
          <h1 className="font-display font-bold text-2xl text-primary-900 mb-2">
            Selamat datang kembali
          </h1>
          <p className="font-body text-wiraText-secondary mb-6">
            Masuk untuk menyimpan riwayat analisis dan membandingkan lokasi.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="font-body text-[13px] font-medium text-wiraText-secondary uppercase tracking-wider">
                Email
              </span>
              <input
                className={inputClass("email")}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@contoh.com"
              />
              {fieldErrors.email && (
                <span className="text-xs text-red-500">
                  {fieldErrors.email}
                </span>
              )}
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="font-body text-[13px] font-medium text-wiraText-secondary uppercase tracking-wider">
                Password
              </span>
              <div className="relative">
                <input
                  className={`${inputClass("password")} pr-10`}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-wiraText-muted hover:text-primary-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <span className="text-xs text-red-500">
                  {fieldErrors.password}
                </span>
              )}
            </label>

            <button
              className="w-full bg-primary-800 text-white! font-body font-medium h-[52px] rounded-none hover:bg-primary-700 transition-colors mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Memproses..." : "Masuk"}
            </button>

            {status && (
              <div className="flex items-center gap-2 text-sm font-medium text-primary-700 bg-primary-50 p-3 rounded-none border border-primary-100">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{status}</span>
              </div>
            )}
          </form>

          <p className="text-sm text-wiraText-secondary mt-6 text-center">
            Belum punya akun?{" "}
            <Link
              className="text-primary-600 font-medium hover:text-primary-800 transition-colors"
              to="/register"
            >
              Daftar Gratis
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
