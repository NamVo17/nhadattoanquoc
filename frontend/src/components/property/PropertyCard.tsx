const PLACEHOLDER_IMAGE = "https://placehold.co/400x300/e2e8f0/64748b?text=Kh%C3%B4ng+c%C3%B3+%E1%BA%A3nh";

export interface PropertyCardProps {
    image: string;
    commission: string;
    price: string;
    title: string;
    area: string;
    bedrooms: string;
    location: string;
    slug?: string;
    /** Thu nhỏ card (dùng cho trang chủ "Bất động sản mới nhất") */
    compact?: boolean;
}

export default function PropertyCard({
    image,
    commission,
    price,
    title,
    area,
    bedrooms,
    location,
    slug,
    compact = false,
}: PropertyCardProps) {
    const href = slug ? `/properties/${slug}` : "#";
    const imgSrc = image && typeof image === "string" && image.trim() !== "" ? image : PLACEHOLDER_IMAGE;

    return (
        <div className={`group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all ${compact ? "rounded-xl" : ""}`}>
            <div className={`relative ${compact ? "h-36" : "h-48"}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    alt={title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    src={imgSrc}
                />
                <div className={`absolute top-2 left-2 ${compact ? "text-[10px] px-2 py-0.5" : "text-xs px-2 py-1"} bg-[#135bec] text-white font-bold rounded`}>
                    {commission}
                </div>
                <button className="absolute top-2 right-2 flex items-center justify-center w-7 h-7 bg-white/80 backdrop-blur rounded-full text-slate-700 hover:text-red-500">
                    <span className={`material-symbols-outlined ${compact ? "text-base" : "text-lg"}`}>favorite</span>
                </button>
            </div>

            <div className={compact ? "p-3" : "p-4"}>
                <p className={`text-[#135bec] font-bold mb-0.5 ${compact ? "text-sm" : "text-lg"}`}>{price}</p>
                <h3 className={`font-bold text-slate-900 line-clamp-1 mb-1.5 ${compact ? "text-sm" : "text-base"}`}>{title}</h3>
                <div className={`flex items-center gap-2 text-slate-500 mb-2 ${compact ? "text-[11px]" : "text-xs"}`}>
                    <span className="flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-sm">square_foot</span> {area}
                    </span>
                    <span className="flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-sm">bed</span> {bedrooms}
                    </span>
                </div>
                <p className={`text-slate-400 flex items-center gap-0.5 mb-3 ${compact ? "text-[10px] mb-2" : "text-xs mb-4"}`}>
                    <span className="material-symbols-outlined text-sm">location_on</span> {location}
                </p>
                <a
                    href={href}
                    className={`block w-full text-center bg-slate-100 hover:bg-[#135bec] hover:text-white text-slate-700 font-bold rounded-lg transition-colors ${compact ? "py-2 text-xs" : "py-2.5 text-sm"}`}
                >
                    Xem chi tiết
                </a>
            </div>
        </div>
    );
}
