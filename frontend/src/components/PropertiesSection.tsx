"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import PropertyCard, { PropertyCardProps } from "./property/PropertyCard";
import { propertyService } from "@/features/property/property.service";

function formatPrice(price: number): string {
  if (price >= 1e9) return `${(price / 1e9).toFixed(1)} tỷ VNĐ`;
  if (price >= 1e6) return `${(price / 1e6).toFixed(0)} triệu VNĐ`;
  return `${price.toLocaleString("vi-VN")} VNĐ`;
}

function mapToCardProps(item: {
  slug: string;
  title: string;
  price: number;
  area?: number;
  bedrooms?: number;
  district?: string;
  city?: string;
  images?: string[] | unknown;
  commission?: number;
}): PropertyCardProps {
  const img = Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : "";
  const location = [item.district, item.city].filter(Boolean).join(", ") || "—";
  return {
    slug: item.slug,
    image: typeof img === "string" ? img : "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400",
    commission: item.commission != null ? `HH ${item.commission}%` : "—",
    price: formatPrice(item.price),
    title: item.title,
    area: item.area != null ? `${item.area} m²` : "—",
    bedrooms: item.bedrooms != null ? `${item.bedrooms} PN` : "—",
    location,
  };
}

export default function PropertiesSection() {
  const [properties, setProperties] = useState<PropertyCardProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    propertyService
      .getAll({ limit: 4, page: 1 })
      .then((res) => {
        if (!cancelled) setProperties(res.data.map(mapToCardProps));
      })
      .catch(() => {
        if (!cancelled) setProperties([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mb-10 sm:mb-14 lg:mb-16">
      <div className="flex items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold">Bất động sản mới nhất</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Cập nhật những nguồn hàng chất lượng nhất trong ngày</p>
        </div>
        <Link className="text-[#135bec] font-bold text-xs sm:text-sm flex items-center gap-0.5 hover:underline whitespace-nowrap shrink-0" href="/properties">
          Xem tất cả
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
              <div className="h-36 bg-slate-200" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="h-3 bg-slate-200 rounded w-full" />
                <div className="h-3 bg-slate-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {properties.map((property) => (
            <PropertyCard key={property.slug || property.title} {...property} compact />
          ))}
        </div>
      )}
    </section>
  );
}
