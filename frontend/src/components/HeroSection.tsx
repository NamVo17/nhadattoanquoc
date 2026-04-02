"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const CITY_OPTIONS = [
  { value: "", label: "Toàn quốc" },
  { value: "Hà Nội", label: "Hà Nội" },
  { value: "TP. Hồ Chí Minh", label: "TP. Hồ Chí Minh" },
  { value: "Đà Nẵng", label: "Đà Nẵng" },
];

const TYPE_OPTIONS = [
  { value: "", label: "Tất cả loại hình" },
  { value: "villa", label: "Biệt thự" },
  { value: "apartment", label: "Chung cư" },
  { value: "house", label: "Nhà phố" },
];

const PRICE_OPTIONS = [
  { value: "", label: "Mọi mức giá" },
  { value: "0-2e9", label: "Dưới 2 tỷ" },
  { value: "2e9-5e9", label: "2 - 5 tỷ" },
  { value: "5e9-10e9", label: "5 - 10 tỷ" },
  { value: "10e9-", label: "Trên 10 tỷ" },
];

export default function HeroSection() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [price, setPrice] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (type) params.set("type", type);
    if (price) {
      const [min, max] = price.split("-");
      if (min) params.set("minPrice", min);
      if (max) params.set("maxPrice", max);
    }
    router.push(`/properties?${params.toString()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <section className="relative bg-slate-900 min-h-[420px] sm:min-h-[480px] lg:h-[540px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 opacity-40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="Hero Background"
          className="w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVkwPEvoUKrL52xtPLKuZyLSx4KRRFeY0KuQ-6F2jAYopUpv0jRH-aqyJCBbxwWoR1Rb7YinZQzAvqJI-Upbo_nf_FPoIaimXqpMrxyn35fHTHXn493GLbjIy03Tnr4pt4dcjFKwRIbakrYagtICJkkcJVOrZQUdOul9VHKBXZUpINviCFG2cm24Ja9FgWfnNAH9Cq8UaByKwWBRN5BeKY4EGFjvkif7AoZh6nkvzjb31iaGXEznWgnSIYCO7S1GO-1BjDZFyQkXGb"
        />
      </div>
      <div className="absolute inset-0 bg-linear-to-b from-slate-900/60 via-slate-900/40 to-slate-900/90" />

      <div className="relative z-10 w-full max-w-5xl px-4 sm:px-6 text-center py-12 sm:py-16">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 sm:mb-6 leading-tight">
          Kết nối Môi giới - Chốt deal nhanh chóng
        </h1>
        <p className="text-base sm:text-lg text-slate-200 mb-8 sm:mb-10 max-w-xl sm:max-w-2xl mx-auto text-balance">
          Sàn giao dịch bất động sản cộng tác hàng đầu. Minh bạch hoa hồng, hỗ trợ tận&nbsp;tâm.
        </p>

        <div className="bg-white/10 backdrop-blur-sm p-3 sm:p-4 rounded-2xl shadow-2xl max-w-4xl mx-auto">
          <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <div className="flex items-center border-b sm:border-b-0 sm:border-r border-slate-100 px-3 py-2">
              <span className="material-symbols-outlined text-primary mr-2 text-xl shrink-0" aria-hidden="true">location_on</span>
              <div className="text-left flex-1 min-w-0">
                <label htmlFor="search-city" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Khu vực</label>
                <select
                  id="search-city"
                  className="w-full border-none p-0 text-sm font-bold bg-transparent focus:ring-0 outline-none text-slate-500"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyDown={handleKeyDown}
                >
                  {CITY_OPTIONS.map((opt) => (
                    <option key={opt.value || "all"} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center border-b sm:border-b-0 lg:border-r border-slate-100 px-3 py-2">
              <span className="material-symbols-outlined text-primary mr-2 text-xl shrink-0" aria-hidden="true">home_work</span>
              <div className="text-left flex-1 min-w-0">
                <label htmlFor="search-type" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Loại nhà đất</label>
                <select
                  id="search-type"
                  className="w-full border-none p-0 text-sm font-bold bg-transparent focus:ring-0 outline-none text-slate-500"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  onKeyDown={handleKeyDown}
                >
                  {TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value || "all"} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center border-b sm:border-b-0 sm:border-r border-slate-100 px-3 py-2">
              <span className="material-symbols-outlined text-primary mr-2 text-xl shrink-0" aria-hidden="true">payments</span>
              <div className="text-left flex-1 min-w-0">
                <label htmlFor="search-price" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mức giá</label>
                <select
                  id="search-price"
                  className="w-full border-none p-0 text-sm font-bold bg-transparent focus:ring-0 outline-none text-slate-500"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  onKeyDown={handleKeyDown}
                >
                  {PRICE_OPTIONS.map((opt) => (
                    <option key={opt.value || "all"} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center px-1 pt-1 sm:pt-0">
              <button
                type="button"
                onClick={handleSearch}
                  className="w-full bg-primary hover:bg-blue-700 active:bg-blue-800 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm sm:text-base"
              >
                <span className="material-symbols-outlined text-xl leading-none">search</span>
                Tìm kiếm
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
