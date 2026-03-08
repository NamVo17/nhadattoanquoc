export interface HotProjectCardProps {
    image: string;
    title: string;
    commission: string;
    description: string;
    price: string;
}

export default function HotProjectCard({
    image,
    title,
    commission,
    description,
    price,
}: HotProjectCardProps) {
    return (
        <div className="flex flex-col sm:flex-row bg-white rounded-2xl overflow-hidden border border-slate-200 group shadow-md hover:shadow-xl transition-all duration-300">
            {/* Image */}
            <div className="w-full sm:w-40 md:w-48 h-52 sm:h-auto overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    src={image}
                />
            </div>

            {/* Content */}
            <div className="p-4 sm:p-5 md:p-6 flex flex-col flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="text-base md:text-lg font-bold text-slate-900 leading-snug">{title}</h3>
                    <span className="bg-orange-100 text-orange-600 text-xs font-black px-2 py-1 rounded shrink-0">
                        {commission}
                    </span>
                </div>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-1">{description}</p>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Giá từ</p>
                        <p className="text-lg md:text-xl font-black text-[#135bec]">{price}</p>
                    </div>
                    <button className="px-4 sm:px-6 py-2 bg-[#135bec] hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-lg text-sm transition-colors">
                        Nhận bán
                    </button>
                </div>
            </div>
        </div>
    );
}
