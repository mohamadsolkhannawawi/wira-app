import { useCallback, useEffect, useRef, useState } from "react";
import type { AnalysisRequest } from "@wira-app/shared";
import { Loader2, ArrowRight, MapPin, AlertTriangle, X } from "lucide-react";
import { getKelurahanList, getStreetList, findNearestLocation } from "../services/api/locations";

interface SearchCardProps {
  onSubmit: (payload: AnalysisRequest) => void;
  isLoading: boolean;
}

export function SearchCard({ onSubmit, isLoading }: SearchCardProps) {
  const [businessType, setBusinessType] = useState("CAFE");
  const [kelurahan, setKelurahan] = useState("");
  const [streetName, setStreetName] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [kelurahanOptions, setKelurahanOptions] = useState<string[]>([]);
  const [streetOptions, setStreetOptions] = useState<string[]>([]);
  const [showKelurahan, setShowKelurahan] = useState(false);
  const [showStreet, setShowStreet] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const kelurahanRef = useRef<HTMLDivElement>(null);
  const streetRef = useRef<HTMLDivElement>(null);

  const fetchKelurahanData = useCallback(async () => {
    if (kelurahanOptions.length > 0) return;
    try {
      const data = await getKelurahanList();
      setKelurahanOptions(data);
    } catch (err) {
      console.error("Failed to load kelurahan list", err);
    }
  }, [kelurahanOptions.length]);

  const fetchStreetData = useCallback(async (kel: string) => {
    if (!kel) return;
    try {
      const data = await getStreetList(kel);
      setStreetOptions(data);
    } catch (err) {
      console.error("Failed to load street list", err);
    }
  }, []);

  useEffect(() => {
    const initFetch = async () => {
      await fetchKelurahanData();
    };
    void initFetch();
  }, [fetchKelurahanData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        kelurahanRef.current &&
        !kelurahanRef.current.contains(event.target as Node)
      ) {
        setShowKelurahan(false);
      }
      if (
        streetRef.current &&
        !streetRef.current.contains(event.target as Node)
      ) {
        setShowStreet(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!kelurahan) {
      setTimeout(() => {
        setStreetOptions([]);
        setStreetName("");
      }, 0);
      return;
    }
    setTimeout(() => {
      void fetchStreetData(kelurahan);
    }, 0);
  }, [kelurahan, fetchStreetData]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const missing: string[] = [];
    if (!businessType.trim()) missing.push("Jenis Usaha");
    if (!kelurahan.trim()) missing.push("Kelurahan");
    if (!streetName.trim()) missing.push("Nama Jalan");

    if (missing.length > 0) {
      setValidationError(
        `Mohon lengkapi semua bagian berikut: ${missing.join(", ")}.`,
      );
      return;
    }

    // Verify kelurahan is in the options list
    const isValidKelurahan = kelurahanOptions.some(
      (opt) => opt.toLowerCase() === kelurahan.trim().toLowerCase(),
    );
    if (!isValidKelurahan && kelurahanOptions.length > 0) {
      setValidationError(
        `Kelurahan "${kelurahan}" tidak ditemukan di database. Silakan pilih dari daftar.`,
      );
      return;
    }

    onSubmit({
      bizType: businessType,
      kelurahan: kelurahan.trim(),
      streetName: streetName.trim(),
    });
  };

  const handleReset = () => {
    setBusinessType("");
    setKelurahan("");
    setStreetName("");
  };

  const handleDetectLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            
            const data = await findNearestLocation(lat, lng);
            
            // If nearest location is more than 15km away, they are likely outside Semarang
            if (!data.nearest || data.distanceKm > 15) {
              setValidationError("Lokasi Anda saat ini terdeteksi berada di luar area layanan aplikasi (di luar radius Semarang). Silakan pilih kelurahan dan nama jalan secara manual dari menu dropdown.");
            } else {
              setKelurahan(data.nearest.kelurahan);
            }
          } catch (err) {
            console.error("Geocoding error", err);
            setValidationError("Gagal memproses koordinat lokasi Anda. Silakan coba lagi atau pilih manual.");
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          console.error("Error getting location", error);
          setValidationError("Gagal mendeteksi lokasi. Pastikan izin lokasi (GPS) diberikan pada peramban Anda.");
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setValidationError("Geolocation tidak didukung di peramban ini.");
      setIsLocating(false);
    }
  };

  return (
    <>
    {/* Validation Modal */}
    {validationError && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(13,26,20,0.4)] backdrop-blur-sm animate-in fade-in duration-200 px-4">
        <div className="bg-white border border-surface-3 p-8 shadow-2xl flex flex-col items-center text-center max-w-md w-full animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="font-display font-bold text-xl text-primary-900 mb-2">
            Data Belum Lengkap
          </h3>
          <p className="font-body text-sm text-wiraText-secondary mb-6">
            {validationError}
          </p>
          <button
            type="button"
            onClick={() => setValidationError(null)}
            className="px-6 py-2.5 bg-primary-800 text-white! font-body font-medium rounded-none hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" /> Mengerti
          </button>
        </div>
      </div>
    )}
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
          Pilih jenis usaha, kelurahan, dan nama jalan. Kami hitung sisanya.
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
            Kelurahan *
          </span>
          <div
            className="flex flex-col md:flex-row gap-3 relative"
            ref={kelurahanRef}
          >
            <div className="flex-1 relative">
              <input
                type="text"
                className="w-full px-4 py-3 bg-surface border border-surface-3 rounded-none focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors hover:border-primary-400 placeholder-wiraText-muted"
                placeholder="Cari kelurahan (misal: Tembalang)..."
                value={kelurahan}
                onChange={(event) => {
                  setKelurahan(event.target.value);
                  setShowKelurahan(true);
                }}
                onFocus={() => {
                  setShowKelurahan(true);
                  void fetchKelurahanData();
                }}
                onClick={() => {
                  setShowKelurahan(true);
                }}
              />

              {showKelurahan && kelurahanOptions.length > 0 && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-surface-3 shadow-xl max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200">
                  {kelurahanOptions
                    .filter((item) =>
                      item.toLowerCase().includes(kelurahan.toLowerCase()),
                    )
                    .map((item) => (
                      <div
                        key={item}
                        className="px-4 py-3 hover:bg-surface-2 cursor-pointer transition-colors border-b border-surface-2 last:border-0"
                        onClick={() => {
                          setKelurahan(item);
                          setShowKelurahan(false);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-primary-500" />
                          <span className="text-sm text-wiraText-primary font-medium">
                            {item}
                          </span>
                        </div>
                      </div>
                    ))}
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

        {/* Nama Jalan */}
        <div className="flex flex-col gap-1.5" ref={streetRef}>
          <span className="font-body text-[13px] font-medium text-wiraText-secondary">
            Nama Jalan *
          </span>
          <div className="relative">
            <input
              type="text"
              className="w-full px-4 py-3 bg-surface border border-surface-3 rounded-none focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors hover:border-primary-400 placeholder-wiraText-muted"
              placeholder={
                kelurahan
                  ? "Cari nama jalan di kelurahan terpilih..."
                  : "Pilih kelurahan terlebih dahulu"
              }
              value={streetName}
              onChange={(event) => {
                setStreetName(event.target.value);
                setShowStreet(true);
              }}
              onFocus={() => {
                setShowStreet(true);
                void fetchStreetData(kelurahan);
              }}
              onClick={() => {
                setShowStreet(true);
              }}
              disabled={!kelurahan}
            />

            {showStreet && streetOptions.length > 0 && kelurahan && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-surface-3 shadow-xl max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200">
                {streetOptions
                  .filter((item) =>
                    item.toLowerCase().includes(streetName.toLowerCase()),
                  )
                  .map((item) => (
                    <div
                      key={item}
                      className="px-4 py-3 hover:bg-surface-2 cursor-pointer transition-colors border-b border-surface-2 last:border-0"
                      onClick={() => {
                        setStreetName(item);
                        setShowStreet(false);
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-primary-500" />
                        <span className="text-sm text-wiraText-primary font-medium">
                          {item}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3.5 mt-6 pt-4 border-t border-surface-2">
        <button
          className="group w-full sm:flex-1 bg-primary-800 text-white! font-display font-bold text-base min-h-[56px] px-8 rounded-none shadow-[0_4px_12px_rgba(13,26,20,0.15)] hover:bg-primary-700 hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(13,26,20,0.2)] active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2.5 tracking-wide disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none uppercase cursor-pointer"
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
              Analisis Sekarang <ArrowRight className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
        <button
          className="w-full sm:w-auto px-8 py-3 min-h-[56px] bg-white text-wiraText-secondary border border-surface-3 font-display font-bold text-sm tracking-wide rounded-none hover:bg-surface-2 hover:text-wiraText-primary transition-all duration-200 uppercase flex items-center justify-center cursor-pointer"
          type="button"
          onClick={handleReset}
          disabled={isLoading}
        >
          Reset Form
        </button>
      </div>
    </form>
    </>
  );
}
