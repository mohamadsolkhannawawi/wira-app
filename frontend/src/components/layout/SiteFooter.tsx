export function SiteFooter() {
    return (
        <footer className="bg-surface-2 border-t border-surface-3 pt-16 pb-8 text-wiraText-secondary">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
                    <div className="lg:col-span-4 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <img
                                src="/logo_wira.png"
                                alt="WIRA Logo"
                                className="w-8 h-8 object-contain"
                            />
                            <div className="font-display font-extrabold text-[20px] text-primary-800 leading-none">
                                WIRA
                            </div>
                        </div>
                        <p className="font-body text-sm leading-relaxed pr-4">
                            Sistem rekomendasi lokasi bisnis untuk UMKM
                            Semarang.
                        </p>
                    </div>

                    <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="flex flex-col gap-4">
                            <h4 className="font-display font-bold text-sm text-primary-900 tracking-wider uppercase">
                                Produk
                            </h4>
                            <nav className="flex flex-col gap-3 text-sm">
                                <a
                                    href="#analysis"
                                    className="hover:text-primary-700 transition-colors"
                                >
                                    Analisis
                                </a>
                                <a
                                    href="#map"
                                    className="hover:text-primary-700 transition-colors"
                                >
                                    Peta
                                </a>
                                <a
                                    href="#history"
                                    className="hover:text-primary-700 transition-colors"
                                >
                                    Riwayat
                                </a>
                            </nav>
                        </div>
                        <div className="flex flex-col gap-4">
                            <h4 className="font-display font-bold text-sm text-primary-900 tracking-wider uppercase">
                                Data & Riset
                            </h4>
                            <nav className="flex flex-col gap-3 text-sm">
                                <a
                                    href="/"
                                    className="hover:text-primary-700 transition-colors"
                                >
                                    Metodologi
                                </a>
                                <a
                                    href="/"
                                    className="hover:text-primary-700 transition-colors"
                                >
                                    Sumber Data
                                </a>
                                <a
                                    href="/"
                                    className="hover:text-primary-700 transition-colors"
                                >
                                    Akurasi
                                </a>
                            </nav>
                        </div>
                        <div className="flex flex-col gap-4">
                            <h4 className="font-display font-bold text-sm text-primary-900 tracking-wider uppercase">
                                Tim
                            </h4>
                            <nav className="flex flex-col gap-3 text-sm">
                                <a
                                    href="/"
                                    className="hover:text-primary-700 transition-colors"
                                >
                                    Tim Kami
                                </a>
                                <a
                                    href="/"
                                    className="hover:text-primary-700 transition-colors"
                                >
                                    Coding Camp
                                </a>
                                <a
                                    href="/"
                                    className="hover:text-primary-700 transition-colors"
                                >
                                    DBS Foundation
                                </a>
                            </nav>
                        </div>
                        <div className="flex flex-col gap-4">
                            <h4 className="font-display font-bold text-sm text-primary-900 tracking-wider uppercase">
                                Legal
                            </h4>
                            <nav className="flex flex-col gap-3 text-sm">
                                <a
                                    href="/"
                                    className="hover:text-primary-700 transition-colors"
                                >
                                    Disclaimer
                                </a>
                                <a
                                    href="/"
                                    className="hover:text-primary-700 transition-colors"
                                >
                                    Privasi
                                </a>
                            </nav>
                        </div>
                    </div>
                </div>

                <div className="border-t border-surface-3 pt-8 flex flex-col gap-6">
                    <div className="text-xs leading-relaxed max-w-4xl text-wiraText-muted">
                        Data geospasial bersumber dari OpenStreetMap (OSM) dan
                        diperbarui secara berkala. Hasil analisis WIRA bersifat
                        indikatif berdasarkan data historis, bukan jaminan
                        keberhasilan bisnis. Kami menyarankan untuk tetap
                        melakukan survei lapangan sebelum mengambil keputusan
                        final.
                    </div>
                    <div className="text-xs text-wiraText-muted flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <span>
                            © 2026 Tim CC26-PSU364 · Coding Camp 2026 powered by
                            DBS Foundation
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
