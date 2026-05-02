import { useState, useEffect, useRef } from "react";
import type { AnalysisRequest } from "@wira-app/shared";
import { Loader2, ArrowRight, MapPin } from "lucide-react";
import { getLocationSuggestions } from "../services/api/locations";

interface SearchCardProps {
  onSubmit: (payload: AnalysisRequest) => void;
  isLoading: boolean;
}

export function SearchCard({ onSubmit, isLoading }: SearchCardProps) {
  const [businessType, setBusinessType] = useState("CAFE");
  const [kelurahan, setKelurahan] = useState("Tembalang");
  const [latitude, setLatitude] = useState("-7.0511");
  const [longitude, setLongitude] = useState("110.4381");
  const [isLocating, setIsLocating] = useState(false);
  const [allKelurahans, setAllKelurahans] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load all kelurahans once on mount
  useEffect(() => {
    const loadAll = async () => {
      try {
        const data = await getLocationSuggestions();
        setAllKelurahans(data);
      } catch (err) {
        console.error("Failed to load locations", err);
      }
    };
    void loadAll();
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const suggestions = kelurahan.trim().length >= 1
    ? allKelurahans.filter(k => k.toLowerCase().includes(kelurahan.toLowerCase()))
    : []; // Empty if no input to avoid clutter

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // Validasi & Auto-correct casing
    const canonicalName = allKelurahans.find(
      (k) => k.toLowerCase() === kelurahan.trim().toLowerCase()
    );

    if (!canonicalName) {
      alert("Kelurahan tidak ditemukan dalam database kami. Silakan pilih dari saran yang muncul.");
      return;
    }

    // Set kelurahan ke nama resmi (casing benar)
    setKelurahan(canonicalName);

    onSubmit({
      businessType,
      kelurahan: canonicalName,
      latitude: Number(latitude),
      longitude: Number(longitude),
    });
  };

  const handleReset = () => {
    setBusinessType("");
    setKelurahan("");
    setLatitude("-7.0511");
    setLongitude("110.4381");
  };

  const handleDetectLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());
          // Simulasi reverse geocoding: jika koordinat dekat Tembalang, pilih Tembalang
          setKelurahan("Tembalang");
          setIsLocating(false);
        },
        (error) => {
          console.error("Error getting location", error);
          alert("Gagal mendeteksi lokasi. Pastikan izin lokasi diberikan pada peramban Anda.");
          setIsLocating(false);
        }
      );
    } else {
      alert("Geolocation tidak didukung di peramban ini.");
      setIsLocating(false);
    }
  };

  return (
    <form 
      className="bg-white border border-surface-3 rounded-none p-8 shadow-[0_2px_8px_rgba(13,26,20,0.08),0_0_0_1px_rgba(13,26,20,0.04)] flex flex-col gap-6 w-full"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center self-start px-2 py-1 bg-surface-2 rounded-none text-[10px] font-bold text-wiraText-secondary tracking-widest uppercase">
          Analisis Lokasi
        </div>
        <h2 className="font-display font-bold text-2xl text-primary-900 mt-2">
          Temukan lokasi terbaik untuk bisnis Anda
        </h2>
        <p className="font-body text-wiraText-secondary">
          Pilih jenis usaha dan kelurahan. Kami hitung sisanya.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Jenis Usaha */}
        <label className="flex flex-col gap-1.5">
          <span className="font-body text-[13px] font-medium text-wiraText-secondary">
            Jenis Usaha *
          </span>
          <select
            className="w-full px-4 py-3 bg-surface border border-surface-3 rounded-none focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors hover:border-primary-400"
            value={businessType}
            onChange={(event) => setBusinessType(event.target.value)}
          >
            <option value="CAFE">Cafe / Kopi</option>
            <option value="LAUNDRY">Laundry</option>
            <option value="FNB">Restoran / F&B</option>
            <option value="BARBERSHOP">Barbershop</option>
            <option value="SALON">Salon</option>
            <option value="GYM">Gym / Fitness</option>
            <option value="BENGKEL">Bengkel Motor</option>
            <option value="CARWASH">Cuci Motor/Mobil</option>
            <option value="FASHION">Toko Fashion</option>
            <option value="ELEKTRONIK">Toko Elektronik</option>
            <option value="PHOTOSTUDIO">Photo Studio</option>
            <option value="STATIONERY">ATK / Stationery</option>
          </select>
        </label>

        {/* Kelurahan & GPS Button */}
        <div className="flex flex-col gap-1.5">
          <span className="font-body text-[13px] font-medium text-wiraText-secondary">
            Kelurahan / Lokasi *
          </span>
          <div className="flex flex-col md:flex-row gap-3 relative" ref={dropdownRef}>
            <div className="flex-1 relative">
              <input
                type="text"
                className="w-full px-4 py-3 bg-surface border border-surface-3 rounded-none focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors hover:border-primary-400 placeholder-wiraText-muted"
                placeholder="Cari kelurahan (misal: Pleburan)..."
                value={kelurahan}
                onChange={(event) => {
                  setKelurahan(event.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
              />
              
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-surface-3 shadow-xl max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200">
                  {suggestions.map((s) => (
                    <div
                      key={s}
                      className="px-4 py-3 hover:bg-surface-2 cursor-pointer transition-colors border-b border-surface-2 last:border-0"
                      onClick={() => {
                        setKelurahan(s);
                        setShowSuggestions(false);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-primary-500" />
                        <span className="text-sm text-wiraText-primary font-medium">{s}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showSuggestions && kelurahan.length >= 2 && suggestions.length === 0 && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-surface-3 p-4 text-center shadow-xl">
                  <p className="text-sm text-wiraText-muted">Tidak ada kelurahan yang cocok</p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isLocating}
              className="md:w-auto px-4 py-3 bg-surface-2 border border-surface-3 rounded-none text-sm font-medium text-primary-800 hover:bg-primary-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLocating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MapPin className="w-4 h-4" />
              )}
              Gunakan Lokasi Saat Ini
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-2">
        <button
          className="flex-1 bg-primary-800 text-white! font-body font-medium h-[52px] rounded-none hover:bg-primary-700 hover:-translate-y-px hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white!" />
              Sedang menganalisis...
            </>
          ) : (
            <>
              Analisis Sekarang <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </button>
        <button
          className="px-6 py-3 bg-white text-wiraText-secondary border border-surface-3 font-body font-medium rounded-none hover:bg-surface-2 transition-colors h-[52px]"
          type="button"
          onClick={handleReset}
          disabled={isLoading}
        >
          Reset Form
        </button>
      </div>
    </form>
  );
}
