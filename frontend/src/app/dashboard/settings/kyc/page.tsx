"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface KYCData {
    status: "verified" | "pending" | "unverified" | "rejected";
    submittedAt?: string;
    rejectionReason?: string;
    verificationScore?: number;
}

export default function KYCPage() {
    const router = useRouter();
    const [kycData, setKycData] = useState<KYCData | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Form data
    const [formData, setFormData] = useState({
        idType: "cccd",
        idNumber: "",
        fullName: "",
        dateOfBirth: "",
        gender: "male",
        address: "",
        city: "",
        district: "",
        ward: "",
    });

    const [files, setFiles] = useState({
        idImageFront: null as File | null,
        idImageBack: null as File | null,
    });

    const [previews, setPreviews] = useState({
        idImageFront: "",
        idImageBack: "",
    });

    // Fetch current KYC status
    useEffect(() => {
        const fetchKYC = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
                const res = await fetch(`${apiUrl}/kyc/me`, {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                });
                const data = await res.json();
                if (data.success) {
                    setKycData(data.data);
                    if (data.data.status === "verified" || data.data.status === "pending" || data.data.status === "rejected") {
                        setFormData((prev) => ({
                            ...prev,
                            ...data.data,
                        }));
                    }
                }
            } catch (err) {
                console.error("Failed to fetch KYC:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchKYC();
    }, []);

    const handleFileChange = (field: "idImageFront" | "idImageBack", file: File | null) => {
        if (file) {
            setFiles((prev) => ({ ...prev, [field]: file }));
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviews((prev) => ({ ...prev, [field]: e.target?.result as string }));
            };
            reader.readAsDataURL(file);
        } else {
            setFiles((prev) => ({ ...prev, [field]: null }));
            setPreviews((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        setSuccess("");

        try {
            // Validate files exist
            if (!files.idImageFront) {
                setError("Vui lòng tải lên ảnh mặt trước.");
                setSubmitting(false);
                return;
            }
            if (!files.idImageBack) {
                setError("Vui lòng tải lên ảnh mặt sau.");
                setSubmitting(false);
                return;
            }

            // Validate form fields
            if (!formData.idNumber || !formData.fullName || !formData.dateOfBirth || !formData.address || !formData.city || !formData.district) {
                setError("Vui lòng điền đầy đủ tất cả các thông tin bắt buộc.");
                setSubmitting(false);
                return;
            }

            const formDataToSend = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                if (value) {
                    formDataToSend.append(key, value as string);
                }
            });
            
            // Append files with proper handling
            if (files.idImageFront instanceof File) {
                formDataToSend.append("idImageFront", files.idImageFront);
            }
            if (files.idImageBack instanceof File) {
                formDataToSend.append("idImageBack", files.idImageBack);
            }

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
            const res = await fetch(`${apiUrl}/kyc/submit`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
                },
                body: formDataToSend,
            });

            const data = await res.json();
            if (data.success) {
                setSuccess(data.message);
                setKycData(data.data);
                setTimeout(() => {
                    router.refresh();
                }, 1500);
            } else {
                setError(data.message || "Có lỗi xảy ra khi xác thực. Vui lòng kiểm tra lại thông tin.");
                console.error("API Error:", data);
            }
        } catch (err) {
            setError("Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.");
            console.error("Submit error:", err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Xác thực danh tính
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Hoàn thành KYC để nâng cao độ tin cậy và hưởng đầy đủ quyền lợi môi giới.
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    {/* Main KYC Form */}
                    <section className="xl:col-span-8 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">verified_user</span>
                                    <h2 className="text-lg font-bold">Xác thực danh tính (KYC)</h2>
                                </div>
                                {kycData?.status === "verified" && (
                                    <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700 rounded-full">
                                        <span className="material-symbols-outlined text-sm">check_circle</span>
                                        Đã xác minh
                                    </span>
                                )}
                                {kycData?.status === "pending" && (
                                    <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wide bg-amber-100 text-amber-700 rounded-full">
                                        <span className="material-symbols-outlined text-sm">schedule</span>
                                        Đang xử lý
                                    </span>
                                )}
                                {kycData?.status === "rejected" && (
                                    <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wide bg-red-100 text-red-700 rounded-full">
                                        <span className="material-symbols-outlined text-sm">cancel</span>
                                        Bị từ chối
                                    </span>
                                )}
                                {kycData?.status === "unverified" && (
                                    <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wide bg-slate-100 text-slate-500 rounded-full">
                                        <span className="material-symbols-outlined text-sm">cancel</span>
                                        Chưa xác thực
                                    </span>
                                )}
                            </div>

                            {error && (
                                <div className="p-6 bg-red-50 border-b border-red-200">
                                    <div className="flex gap-3">
                                        <span className="material-symbols-outlined text-red-600 text-lg">error</span>
                                        <div>
                                            <p className="text-sm font-bold text-red-700">Lỗi</p>
                                            <p className="text-sm text-red-600 mt-1">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {success && (
                                <div className="p-6 bg-emerald-50 border-b border-emerald-200">
                                    <div className="flex gap-3">
                                        <span className="material-symbols-outlined text-emerald-600 text-lg">check_circle</span>
                                        <div>
                                            <p className="text-sm font-bold text-emerald-700">Thành công</p>
                                            <p className="text-sm text-emerald-600 mt-1">{success}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {kycData?.status === "rejected" && (
                                <div className="p-6 bg-orange-50 border-b border-orange-200">
                                    <div className="flex gap-3">
                                        <span className="material-symbols-outlined text-orange-600 text-lg">warning</span>
                                        <div>
                                            <p className="text-sm font-bold text-orange-700">Yêu cầu bị từ chối</p>
                                            <p className="text-sm text-orange-600 mt-1">{kycData.rejectionReason || "Vui lòng gửi lại với thông tin chính xác."}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {kycData?.status === "verified" && !success ? (
                                <div className="p-6 space-y-4">
                                    <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                                        <p className="text-sm text-emerald-700">
                                            ✓ Tài khoản của bạn đã được xác thực thành công. Bạn có thể sử dụng tất cả các tính năng được phép cho môi giới.
                                        </p>
                                    </div>
                                </div>
                            ) : kycData?.status !== "pending" ? (
                                <form onSubmit={handleSubmit} className="p-6 space-y-8 flex-1">
                                    {/* ID Type Selection */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-slate-700">Loại giấy tờ xác định</label>
                                        <select
                                            name="idType"
                                            value={formData.idType}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            <option value="cccd">CCCD/căn cước công dân</option>
                                            <option value="passport">Hộ chiếu</option>
                                            <option value="license">Giấy phép lái xe</option>
                                        </select>
                                    </div>

                                    {/* ID Number and Full Name */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-sm font-bold text-slate-700">Số {formData.idType === "cccd" ? "CCCD" : formData.idType === "passport" ? "hộ chiếu" : "bằng lái"}</label>
                                            <input
                                                type="text"
                                                name="idNumber"
                                                value={formData.idNumber}
                                                onChange={handleInputChange}
                                                placeholder="VD: 001234567890"
                                                required
                                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-bold text-slate-700">Họ tên</label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                                placeholder="Nguyễn Văn A"
                                                required
                                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>
                                    </div>

                                    {/* Date of Birth and Gender */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-sm font-bold text-slate-700">Ngày sinh</label>
                                            <input
                                                type="date"
                                                name="dateOfBirth"
                                                value={formData.dateOfBirth}
                                                onChange={handleInputChange}
                                                required
                                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-bold text-slate-700">Giới tính</label>
                                            <select
                                                name="gender"
                                                value={formData.gender}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            >
                                                <option value="male">Nam</option>
                                                <option value="female">Nữ</option>
                                                <option value="other">Khác</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-slate-700">Địa chỉ</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            placeholder="VD: 123 Đường Lê Lợi"
                                            required
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>

                                    {/* City, District, Ward */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-sm font-bold text-slate-700">Thành phố</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                placeholder="TP. Hồ Chí Minh"
                                                required
                                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-bold text-slate-700">Quận/Huyện</label>
                                            <input
                                                type="text"
                                                name="district"
                                                value={formData.district}
                                                onChange={handleInputChange}
                                                placeholder="Quận 1"
                                                required
                                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-bold text-slate-700">Phường/Xã</label>
                                            <input
                                                type="text"
                                                name="ward"
                                                value={formData.ward}
                                                onChange={handleInputChange}
                                                placeholder="Phường Bến Nghé"
                                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>
                                    </div>

                                    {/* ID Image uploads */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-sm font-bold text-slate-700">{formData.idType === "cccd" ? "CCCD" : "Giấy tờ"} Mặt trước</label>
                                            <label className="block relative group aspect-[1.6/1] border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center bg-slate-50 hover:border-primary transition-colors cursor-pointer overflow-hidden">
                                                {previews.idImageFront ? (
                                                    <img src={previews.idImageFront} alt="Front" className="w-full h-full object-cover" />
                                                ) : (
                                                    <>
                                                        <div className="relative z-10 text-center p-4">
                                                            <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-primary mb-2">cloud_upload</span>
                                                            <p className="text-xs text-slate-500">Tải lên hoặc kéo thả tệp</p>
                                                        </div>
                                                    </>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileChange("idImageFront", e.target.files?.[0] || null)}
                                                    className="hidden"
                                                    required
                                                />
                                            </label>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-sm font-bold text-slate-700">{formData.idType === "cccd" ? "CCCD" : "Giấy tờ"} Mặt sau</label>
                                            <label className="block relative group aspect-[1.6/1] border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center bg-slate-50 hover:border-primary transition-colors cursor-pointer overflow-hidden">
                                                {previews.idImageBack ? (
                                                    <img src={previews.idImageBack} alt="Back" className="w-full h-full object-cover" />
                                                ) : (
                                                    <>
                                                        <div className="relative z-10 text-center p-4">
                                                            <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-primary mb-2">cloud_upload</span>
                                                            <p className="text-xs text-slate-500">Tải lên hoặc kéo thả tệp</p>
                                                        </div>
                                                    </>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileChange("idImageBack", e.target.files?.[0] || null)}
                                                    className="hidden"
                                                    required
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    {/* Note */}
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary text-lg">info</span>
                                            Lưu ý quan trọng
                                        </p>
                                        <ul className="mt-2 space-y-1.5 text-xs text-slate-500 list-disc list-inside">
                                            <li>Ảnh phải rõ nét và đầy đủ thông tin</li>
                                            <li>Khuôn hình phải đúng như trên giấy tờ</li>
                                            <li>Không được chỉnh sửa hoặc sử dụng ảnh giả</li>
                                            <li>Quá trình xác thực có thể mất 1-3 ngày làm việc</li>
                                        </ul>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="p-6 border-t border-slate-100 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="px-8 py-3 text-sm font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="material-symbols-outlined text-lg">{submitting ? "schedule" : "send"}</span>
                                            {submitting ? "Đang gửi..." : "Gửi yêu cầu xác thực"}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="p-6 space-y-4">
                                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                                        <p className="text-sm text-amber-700 font-bold flex items-center gap-2">
                                            <span className="material-symbols-outlined">schedule</span>
                                            Yêu cầu đang được xử lý
                                        </p>
                                        <p className="text-sm text-amber-600 mt-2">
                                            Yêu cầu KYC của bạn đang được xem xét. Chúng tôi sẽ thông báo cho bạn khi có kết quả.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Why KYC */}
                    <section className="xl:col-span-4 space-y-6">
                        <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20">
                            <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined">security_update_good</span>
                                Tại sao cần KYC?
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { title: "Xác thực uy tín", desc: "Tài khoản được gắn nhãn \"Đã xác minh\" giúp khách hàng tin tưởng hơn." },
                                    { title: "Mở khóa tính năng", desc: "Đăng tin không giới hạn và tiếp cận các dự án độc quyền của hệ thống." },
                                    { title: "An toàn giao dịch", desc: "Bảo vệ bạn trước các rủi ro giả mạo và tranh chấp trong giao dịch." },
                                ].map((item) => (
                                    <div key={item.title} className="flex gap-3">
                                        <span className="material-symbols-outlined text-primary text-lg">task_alt</span>
                                        <div className="text-sm">
                                            <p className="font-bold mb-1">{item.title}</p>
                                            <p className="text-slate-500">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </>
    );
}
