import Link from 'next/link';

export default function Home({ businessName }: { businessName?: string }) {
  const displayTitle = businessName || 'Cibitung Petshop';

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-5 bg-white/70 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-100/50">
        <div className="flex lg:flex-1">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="bg-blue-600 w-11 h-11 rounded-[1.2rem] flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-all duration-500">
              <span className="text-xl">🐾</span>
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-gray-900">{displayTitle}</h1>
          </Link>
        </div>
        <div className="hidden md:flex items-center gap-10 font-black uppercase tracking-[0.2em] text-[10px] text-gray-400">
          <a href="#layanan" className="hover:text-blue-600 transition-colors">Layanan</a>
          <a href="#keunggulan" className="hover:text-blue-600 transition-colors">Keunggulan</a>
          <a href="#kontak" className="hover:text-blue-600 transition-colors">Kontak</a>
          <Link href="/" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/10">Dashboard</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative isolate px-6 pt-24 pb-32 lg:px-8 bg-gradient-to-b from-blue-50/50 via-white to-white overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full blur-[100px]" />
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-indigo-100 rounded-full blur-[80px] animate-pulse" />
        </div>

        <div className="mx-auto max-w-4xl relative z-10 text-center animate-in fade-in zoom-in-95 duration-1000">
          <span className="inline-block px-5 py-2 mb-10 text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 bg-blue-100/50 rounded-full backdrop-blur-sm">
            Trusted Pet Care Center
          </span>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-gray-900 mb-8 leading-[0.9]">
            Ciptakan Senyum <br className="hidden md:block" /> di Wajah <span className="text-blue-600">{businessName ? businessName : 'Anabul'}</span>
          </h1>
          <p className="mt-8 text-lg md:text-xl leading-relaxed text-gray-500 max-w-2xl mx-auto font-medium tracking-tight">
            Mulai dari Grooming Wangi hingga Penitipan Nyaman. Kami hadir untuk memastikan anabul Anda sehat, bahagia, dan selalu ceria.
          </p>
          <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-6">
            <a
              href="https://wa.me/628123456789"
              className="w-full sm:w-auto rounded-2xl bg-blue-600 px-10 py-5 text-[11px] font-black uppercase tracking-[0.3em] text-white shadow-2xl shadow-blue-600/20 hover:bg-blue-700 transition-all transform hover:scale-105"
            >
              Booking Grooming ➔
            </a>
            <a href="#layanan" className="w-full sm:w-auto rounded-2xl bg-white border-2 border-gray-100 px-10 py-5 text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-blue-600 hover:border-blue-100 transition-all">
              Lihat Layanan
            </a>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div id="layanan" className="py-32 bg-white">
        <div className="mx-auto max-w-7xl px-8 lg:px-12">
          <div className="mx-auto max-w-2xl text-center mb-24">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 mb-6">Our Services</h2>
            <p className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900">
              Perawatan Lengkap <br /> untuk Anabul Anda
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { emoji: "🛁", title: "Professional Grooming", desc: "Mandi sehat, potong kuku, hingga pembersihan telinga dengan produk premium." },
              { emoji: "🏨", title: "Hotel Hewan", desc: "Fasilitas penitipan bersih, ber-AC, dan terpantau agar Anda tenang saat bepergian." },
              { emoji: "🍖", title: "Pet Shop", desc: "Menyediakan berbagai merek pakan ternama, mainan, dan perlengkapan harian." }
            ].map((service, i) => (
              <div key={i} className="group flex flex-col bg-gray-50/50 p-10 rounded-[3rem] border border-gray-100 hover:bg-white hover:border-blue-100 hover:shadow-2xl hover:shadow-blue-600/5 transition-all duration-500">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl mb-8 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                  {service.emoji}
                </div>
                <dt className="text-2xl font-black tracking-tight text-gray-900 mb-4">{service.title}</dt>
                <dd className="text-sm leading-relaxed text-gray-500 font-medium">
                  {service.desc}
                </dd>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why Us Section */}
      <div id="keunggulan" className="px-6 py-20">
        <div className="bg-blue-600 py-24 px-8 md:px-20 rounded-[4rem] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

          <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:gap-x-20 items-center relative z-10">
            <div className="text-white">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-8 leading-tight">Kenapa Harus <br /> {displayTitle}?</h2>
              <p className="text-lg opacity-80 leading-relaxed font-medium mb-10 tracking-tight">
                Kami memahami bahwa anabul Anda adalah bagian dari keluarga. Itulah mengapa kami memperlakukan mereka dengan kasih sayang penuh.
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-[11px] font-black uppercase tracking-wider">
                <li className="flex items-center gap-x-3 bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">✨ Staf Profesional</li>
                <li className="flex items-center gap-x-3 bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">✨ Lingkungan Steril</li>
                <li className="flex items-center gap-x-3 bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">✨ Harga Kompetitif</li>
                <li className="flex items-center gap-x-3 bg-white/10 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">✨ Update Harian</li>
              </ul>
            </div>
            <div className="bg-white p-12 rounded-[3rem] shadow-2xl text-center flex flex-col items-center">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-8">
                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 13.1216 16 12.017 16L9.017 16C7.91243 16 7.017 16.8954 7.017 18L7.017 21M14.017 21L17.017 21C18.1216 21 19.017 20.1046 19.017 19L19.017 16C19.017 14.8954 18.1216 14 17.017 14L14.017 14M14.017 21L14.017 14M7.017 21L4.017 21C2.91243 21 2.017 20.1046 2.017 19L2.017 5C2.017 3.89543 2.91243 3 4.017 3L17.017 3C18.1216 3 19.017 3.89543 19.017 5L19.017 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <p className="text-xl font-bold italic text-gray-900 leading-relaxed mb-6">"Kucing saya jadi wangi banget dan gak stress kalau mandi di sini. Pelayanannya benar-benar top!"</p>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">— Pelanggan Setia</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Contact */}
      <footer id="kontak" className="bg-white pt-32 pb-16">
        <div className="mx-auto max-w-7xl px-8 lg:px-12 text-center">
          <div className="mb-20 flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mb-10 shadow-sm text-blue-600">🐾</div>
            <h2 className="text-3xl font-black mb-6 tracking-tighter text-gray-900">{displayTitle}</h2>
            <div className="space-y-4 text-base text-gray-500 font-medium tracking-tight">
              <p>📍 Dekat RS EMC Cibitung, Bekasi, Jawa Barat</p>
              <p>📞 WhatsApp: 0812-3456-7890</p>
            </div>
          </div>
          <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">© {new Date().getFullYear()} {displayTitle} • Premium Pet Care</p>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-600/60 bg-blue-50 px-4 py-2 rounded-full">Demo by DigitalinUMKM</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
