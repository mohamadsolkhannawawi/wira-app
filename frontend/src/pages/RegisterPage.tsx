import { useState } from "react";
import { Link } from "react-router-dom";
import { SiteHeader } from "../components/layout/SiteHeader";
import { register } from "../services/api/auth";
import { tokenManager } from "../utils/tokenManager";
import { Eye, EyeOff, AlertTriangle, X, CheckCircle } from "lucide-react";
import { useToast } from "../contexts/ToastContext";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s]).{8,}$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;

interface ValidationErrors {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export function RegisterPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const validate = (): ValidationErrors => {
    const errors: ValidationErrors = {};

    // Name
    if (!name.trim()) {
      errors.name = "Nama wajib diisi.";
    } else if (!/^[a-zA-Z\s'.]+$/.test(name.trim())) {
      errors.name = "Nama hanya boleh berisi huruf.";
    } else if (name.trim().length > 60) {
      errors.name = "Nama maksimal 60 karakter.";
    }

    // Username
    if (!username.trim()) {
      errors.username = "Username wajib diisi.";
    } else if (!USERNAME_REGEX.test(username.trim())) {
      errors.username =
        "Username 3-30 karakter, hanya huruf, angka, dan underscore.";
    }

    // Email
    if (!email.trim()) {
      errors.email = "Email wajib diisi.";
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errors.email = "Format email tidak valid.";
    }

    // Password
    if (!password) {
      errors.password = "Password wajib diisi.";
    } else if (!PASSWORD_REGEX.test(password)) {
      errors.password =
        "Password minimal 8 karakter, harus kombinasi huruf, angka, dan karakter unik (!@#$%).";
    }

    // Confirm Password
    if (!confirmPassword) {
      errors.confirmPassword = "Konfirmasi password wajib diisi.";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Konfirmasi password tidak cocok.";
    }

    return errors;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(null);
    setModalError(null);
    setFieldErrors({});

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const messages = Object.values(errors);
      setModalError(messages.join("\n"));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await register(
        name.trim(),
        username.trim().toLowerCase(),
        email.trim().toLowerCase(),
        password,
      );
      tokenManager.setTokens(
        response.tokens.accessToken,
        response.tokens.refreshToken,
      );
      setStatus(`Akun berhasil dibuat untuk ${response.user.name}. Mengarahkan...`);
      showToast(`Registrasi berhasil! Selamat datang, ${response.user.name}.`);
      setTimeout(() => (window.location.href = "/"), 1500);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Gagal mendaftar. Silakan coba lagi.";
      setModalError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (field: keyof ValidationErrors) =>
    `w-full px-4 py-3 bg-surface border rounded-none focus:outline-none focus:ring-1 transition-colors ${
      fieldErrors[field]
        ? "border-red-400 focus:border-red-500 focus:ring-red-500"
        : "border-surface-3 focus:border-primary-500 focus:ring-primary-500"
    }`;

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body">
      <SiteHeader />

      {/* Validation Modal */}
      {modalError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(13,26,20,0.4)] backdrop-blur-sm px-4">
          <div className="bg-white border border-surface-3 p-8 shadow-2xl flex flex-col items-center text-center max-w-md w-full">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="font-display font-bold text-xl text-primary-900 mb-2">
              Pendaftaran Gagal
            </h3>
            <div className="font-body text-sm text-wiraText-secondary mb-6 text-left w-full space-y-1">
              {modalError.split("\n").map((line, i) => (
                <p key={i} className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span>{line}</span>
                </p>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setModalError(null)}
              className="px-6 py-2.5 bg-primary-800 text-white! font-body font-medium rounded-none hover:bg-primary-700 transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" /> Mengerti
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
            Buat akun gratis
          </h1>
          <p className="font-body text-wiraText-secondary mb-6">
            Simpan riwayat analisis dan akses fitur banding lokasi kapan saja.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Name */}
            <label className="flex flex-col gap-1.5">
              <span className="font-body text-[13px] font-medium text-wiraText-secondary uppercase tracking-wider">
                Nama <span className="text-red-500">*</span>
              </span>
              <input
                className={inputClass("name")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                placeholder="Contoh: Budi Santoso"
              />
              {fieldErrors.name && (
                <span className="text-xs text-red-500">{fieldErrors.name}</span>
              )}
            </label>

            {/* Username */}
            <label className="flex flex-col gap-1.5">
              <span className="font-body text-[13px] font-medium text-wiraText-secondary uppercase tracking-wider">
                Username <span className="text-red-500">*</span>
              </span>
              <input
                className={inputClass("username")}
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
                maxLength={30}
                placeholder="Contoh: budi123"
              />
              {fieldErrors.username && (
                <span className="text-xs text-red-500">
                  {fieldErrors.username}
                </span>
              )}
            </label>

            {/* Email */}
            <label className="flex flex-col gap-1.5">
              <span className="font-body text-[13px] font-medium text-wiraText-secondary uppercase tracking-wider">
                Email <span className="text-red-500">*</span>
              </span>
              <input
                className={inputClass("email")}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Contoh: budi@gmail.com"
              />
              {fieldErrors.email && (
                <span className="text-xs text-red-500">{fieldErrors.email}</span>
              )}
            </label>

            {/* Password */}
            <label className="flex flex-col gap-1.5">
              <span className="font-body text-[13px] font-medium text-wiraText-secondary uppercase tracking-wider">
                Password <span className="text-red-500">*</span>
              </span>
              <div className="relative">
                <input
                  className={`${inputClass("password")} pr-10`}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contoh: budi123."
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

            {/* Confirm Password */}
            <label className="flex flex-col gap-1.5">
              <span className="font-body text-[13px] font-medium text-wiraText-secondary uppercase tracking-wider">
                Konfirmasi Password <span className="text-red-500">*</span>
              </span>
              <div className="relative">
                <input
                  className={`${inputClass("confirmPassword")} pr-10`}
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Contoh: budi123!"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-wiraText-muted hover:text-primary-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <span className="text-xs text-red-500">
                  {fieldErrors.confirmPassword}
                </span>
              )}
            </label>

            <button
              className="w-full bg-primary-800 text-white! font-body font-medium h-[52px] rounded-none hover:bg-primary-700 transition-colors mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Mendaftar..." : "Daftar Gratis"}
            </button>

            {status && (
              <div className="flex items-center gap-2 text-sm font-medium text-primary-700 bg-primary-50 p-3 rounded-none border border-primary-100">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{status}</span>
              </div>
            )}
          </form>

          <p className="text-sm text-wiraText-secondary mt-6 text-center">
            Sudah punya akun?{" "}
            <Link
              className="text-primary-600 font-medium hover:text-primary-800 transition-colors"
              to="/login"
            >
              Masuk
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
