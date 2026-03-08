import HotProjectCard, { HotProjectCardProps } from "./property/HotProjectCard";

const hotProjects: HotProjectCardProps[] = [
    {
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVkwPEvoUKrL52xtPLKuZyLSx4KRRFeY0KuQ-6F2jAYopUpv0jRH-aqyJCBbxwWoR1Rb7YinZQzAvqJI-Upbo_nf_FPoIaimXqpMrxyn35fHTHXn493GLbjIy03Tnr4pt4dcjFKwRIbakrYagtICJkkcJVOrZQUdOul9VHKBXZUpINviCFG2cm24Ja9FgWfnNAH9Cq8UaByKwWBRN5BeKY4EGFjvkif7AoZh6nkvzjb31iaGXEznWgnSIYCO7S1GO-1BjDZFyQkXGb",
        title: "The Heritage Boutique Hotel",
        commission: "HH 5%",
        description: "Dự án biệt thự nghỉ dưỡng đẳng cấp tại lõi phố cổ Hội An. Cơ hội nhận hoa hồng lên đến 2 tỷ đồng mỗi căn.",
        price: "45 tỷ VNĐ",
    },
    {
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBmhFpzyL2ZKdMnbe1CzA9ro5l6w21CdUOgjeHb1CUwG-0cXDHUJkQae9E81i8VdHjNyGS2kARaeyEuwmDbEMOOzNycp4w-rRsqithu-BvWPjRYLVIQvjjPDSSzCXa1LoEjHCErFcFFUbxVVmoBXSG4VBLFtzuSHX8kvnYfepEztf2CXVoTU0xv2UFaC4cdqIsEokMi9LzP5aKHmuRc3ehXy-uiEjA9JUDg3LheGhTKNSBB8qVVuLXK_LpcyFLrpgI21R66qTV6U_u",
        title: "Grand Park Villa Marina",
        commission: "HH 4.5%",
        description: "Tổ hợp biệt thự ven sông Đồng Nai với bến du thuyền riêng. Hỗ trợ tài chính cực tốt cho khách hàng.",
        price: "18 tỷ VNĐ",
    },
];

export default function HotProjectsSection() {
    return (
        <section className="bg-blue-50 -mx-4 sm:-mx-6 lg:-mx-10 xl:-mx-20 px-4 sm:px-6 lg:px-10 xl:px-20 py-10 sm:py-14 lg:py-16 rounded-2xl sm:rounded-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
                <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2">
                        Dự án hot cho cộng tác
                        <span className="bg-red-500 text-white text-[10px] uppercase px-2 py-0.5 rounded-full animate-pulse">
                            Hot
                        </span>
                    </h2>
                    <p className="text-sm sm:text-base text-slate-500 mt-1">
                        Tập trung nguồn hàng có mức hoa hồng cộng tác cao nhất thị trường
                    </p>
                </div>
            </div>

            {/* 1 col mobile → 2 col lg */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                {hotProjects.map((project) => (
                    <HotProjectCard key={project.title} {...project} />
                ))}
            </div>
        </section>
    );
}
