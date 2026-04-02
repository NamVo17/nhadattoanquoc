"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { propertyService } from "../../features/property/property.service";
import { authorizedFetch } from "@/lib/authorizedFetch";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { VIETNAM_PROVINCES, DIRECTION_OPTIONS } from "@/data/vietnam-locations";

// ── Types ──────────────────────────────────────────────
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

type PropertyValue = string | number | File[];

interface PropertyFormData {
  title: string;
  type: string;
  projectName: string;
  city: string;
  district: string;
  address: string;
  mapUrl: string;
  price: number;
  area: number;
  bedrooms: number;
  direction: string;
  description: string;
  images: File[];
  videoUrl: string;
  commission: number;
  package: string;
}

interface Step1Errors {
  title?: string;
  type?: string;
  city?: string;
  district?: string;
  address?: string;
  price?: string;
  area?: string;
  description?: string;
}

// ── Constants ──────────────────────────────────────────
const PROPERTY_TYPES = [
  { value: "apartment", label: "Căn hộ / Chung cư" },
  { value: "house", label: "Nhà phố" },
  { value: "land", label: "Đất nền" },
  { value: "villa", label: "Biệt thự" },
  { value: "commercial", label: "Văn phòng" },
];

const CITIES = VIETNAM_PROVINCES.map((p) => ({ value: p.value, label: p.label }));
const DISTRICTS_BY_CITY: Record<string, { value: string; label: string }[]> = Object.fromEntries(
  VIETNAM_PROVINCES.map((p) => [p.value, p.districts])
);

// ── Main Page ──────────────────────────────────────────
export default function PostPropertyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams?.get('edit');
  const renewPackage = searchParams?.get('renewPackage') === 'true';
  const isEditMode = !!editId;
  const isRenewalMode = isEditMode && renewPackage;
  
  const [user, setUser] = useState<User | null>(null);
  const [currentStep, setCurrentStep] = useState(isRenewalMode ? 3 : 1);
  const [isLoading, setIsLoading] = useState(false);
  const [step1Errors, setStep1Errors] = useState<Step1Errors>({});
  const [formData, setFormData] = useState<PropertyFormData>({
    title: "",
    type: "",
    projectName: "",
    city: "",
    district: "",
    address: "",
    mapUrl: "",
    price: 0,
    area: 0,
    bedrooms: 0,
    direction: "",
    description: "",
    images: [],
    videoUrl: "",
    commission: 1,
    package: "free",
  });

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("user");
    if (!token || !userData) { router.push("/login"); return; }
    try {
      const parsedUser = JSON.parse(userData) as User;
      if (parsedUser.role !== "agent" && parsedUser.role !== "admin") {
        router.push("/"); return;
      }
      setUser(parsedUser);
      
      // Load property data if in edit mode
      if (isEditMode && editId) {
        loadPropertyForEdit(editId);
      }
    } catch {
      router.push("/login");
    }
  }, [router, isEditMode, editId]);
  
  // Load property data for editing
  const loadPropertyForEdit = async (propertyId: string) => {
    try {
      setIsLoading(true);
      const properties = await propertyService.getByAgent();
      const property = properties.find(p => p.id === propertyId);
      
      if (!property) {
        alert('Không tìm thấy bất động sản để chỉnh sửa');
        router.push('/dashboard/properties');
        return;
      }
      
      // Populate form with existing data
      setFormData({
        title: property.title || "",
        type: property.type || "",
        projectName: property.projectname || "",
        city: property.city || "",
        district: property.district || "",
        address: property.address || "",
        mapUrl: property.mapurl || "",
        price: property.price || 0,
        area: property.area || 0,
        bedrooms: property.bedrooms || 0,
        direction: property.direction || "",
        description: property.description || "",
        images: [],
        videoUrl: property.videourl || "",
        commission: property.commission || 1,
        package: property.package || "free",
      });
    } catch (error) {
      console.error('Error loading property for edit:', error);
      alert('Lỗi khi tải dữ liệu bất động sản');
      router.push('/dashboard/properties');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: keyof PropertyFormData, value: PropertyValue) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for the field being updated
    if (field in step1Errors) {
      setStep1Errors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // ── Step 1 Validation ──────────────────────────────────
  const validateStep1 = (): boolean => {
    const errors: Step1Errors = {};
    const title = formData.title.trim();
    if (!title || title.length < 10) {
      errors.title = "Tiêu đề phải có ít nhất 10 ký tự";
    } else if (title.length > 99) {
      errors.title = "Tiêu đề không quá 99 ký tự";
    }
    if (!formData.type) {
      errors.type = "Vui lòng chọn loại hình bất động sản";
    }
    if (!formData.city) {
      errors.city = "Vui lòng chọn Tỉnh/Thành";
    }
    if (!formData.district) {
      errors.district = "Vui lòng chọn Quận/Huyện";
    }
    if (!formData.address.trim()) {
      errors.address = "Vui lòng nhập địa chỉ chi tiết";
    }
    if (!formData.price || formData.price <= 0) {
      errors.price = "Vui lòng nhập giá bán hợp lệ (lớn hơn 0)";
    }
    if (!formData.area || formData.area <= 0) {
      errors.area = "Vui lòng nhập diện tích hợp lệ (lớn hơn 0)";
    }
    if (!formData.description.trim() || formData.description.trim().length < 50) {
      errors.description = "Mô tả phải có ít nhất 50 ký tự";
    }
    setStep1Errors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };
  const prevStep = () => { 
    // Don't allow going back from step 3 in renewal mode
    if (isRenewalMode && currentStep === 3) return;
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const normalizeMapUrl = (input: string) => {
    const trimmed = (input || "").trim();
    if (!trimmed) return "";
    if (trimmed.toLowerCase().includes("<iframe")) {
      const match = trimmed.match(/src=['"]([^'"]+)['"]/i);
      if (match?.[1]) return match[1].trim();
    }
    return trimmed;
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const propertyData = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        area: formData.area,
        address: formData.address,
        district: formData.district,
        city: formData.city,
        type: formData.type as "apartment" | "house" | "villa" | "land" | "commercial",
        projectName: formData.projectName,
        videoUrl: formData.videoUrl,
        commission: formData.commission,
        package: formData.package,
        images: [] as string[],
        bedrooms: formData.bedrooms || undefined,
        direction: formData.direction || undefined,
        mapurl: normalizeMapUrl(formData.mapUrl) || undefined,
      };

      // CREATE or UPDATE based on edit mode
      let resultProperty;
      if (isEditMode && editId) {
        resultProperty = await propertyService.update(editId, propertyData);
      } else {
        const createdProperty = await propertyService.create(propertyData);
        resultProperty = { data: createdProperty };
      }

      // Upload images regardless of package
      if (formData.images.length > 0 && resultProperty?.data?.id) {
        const formDataImages = new FormData();
        formData.images.forEach((file) => { formDataImages.append("images", file); });
        const uploadRes = await authorizedFetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/properties/${resultProperty.data.id}/images`,
          { method: "POST", body: formDataImages }
        );
        if (!uploadRes.ok) {
          const errJson = await uploadRes.json().catch(() => ({})) as { message?: string };
          throw new Error(errJson.message || "Tải ảnh lên thất bại.");
        }
      }

      // Handle payment redirect for renewal (expired package renewal)
      if (isEditMode && resultProperty?.requiresPayment) {
        // User is renewing an expired package with VIP/Diamond
        alert("Vui lòng thanh toán để gia hạn tin đăng");
        const params = new URLSearchParams({
          propertyId: editId,
          package: resultProperty.package || 'vip',
          title: formData.title,
        });
        router.push(`/payment?${params.toString()}`);
        return;
      }

      // In edit mode without payment, go back to dashboard
      if (isEditMode) {
        alert(isRenewalMode ? "Gia hạn tin đăng thành công!" : "Cập nhật tin đăng thành công!");
        router.push('/dashboard/properties');
        return;
      }

      // For new listings with paid package, redirect to payment
      if (formData.package === "vip" || formData.package === "diamond") {
        // Small delay to ensure token is still valid
        await new Promise(r => setTimeout(r, 500));
        const params = new URLSearchParams({
          propertyId: resultProperty.data.id,
          package: formData.package,
          title: formData.title,
        });
        router.push(`/payment?${params.toString()}`);
        return;
      }

      if (resultProperty?.data?.slug) router.push(`/properties/${resultProperty.data.slug}`);
      else router.push("/properties");
    } catch (error) {
      console.error("Error saving property:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="max-w-6xl mx-auto px-4 md:px-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6">
            <Link href="/" className="text-slate-400 text-sm font-medium hover:text-primary">Trang chủ</Link>
            <span className="material-symbols-outlined text-slate-500 text-sm">chevron_right</span>
            <span className="text-slate-700 text-sm font-medium">
              {isRenewalMode ? "Gia hạn tin" : isEditMode ? "Chỉnh sửa tin" : "Đăng tin mới"}
            </span>
          </div>

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-black text-3xl font-extrabold tracking-tight mb-2">
              {isRenewalMode ? "Gia hạn tin đăng" : isEditMode ? "Chỉnh sửa tin đăng" : "Đăng tin mới"}
              {currentStep === 1 && !isEditMode && " - Thông tin cơ bản"}
              {currentStep === 2 && " - Hình ảnh & Video"}
              {currentStep === 3 && (isRenewalMode ? " - Chọn gói gia hạn" : " - Hoa hồng & Phí dịch vụ")}
            </h1>
            <p className="text-slate-400 text-base">
              {isRenewalMode ? "Chọn gói gia hạn phù hợp để đưa tin đăng của bạn trở lại ngoài." : null}
              {currentStep === 1 && !isEditMode && "Cung cấp các thông tin chính xác nhất về bất động sản của bạn."}
              {currentStep === 2 && "Tin đăng có hình ảnh đẹp và video thực tế sẽ nhận được lượt xem gấp 5 lần."}
              {currentStep === 3 && "Thiết lập chính sách cộng tác và lựa chọn gói hiển thị tối ưu cho tin đăng của bạn."}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8 overflow-x-auto">
            <div className="flex border-b border-slate-700 min-w-max">
              {[
                { step: 1, label: "Thông tin cơ bản" },
                { step: 2, label: "Hình ảnh & Video" },
                { step: 3, label: "Hoa hồng & Phí dịch vụ" },
              ].map(({ step, label }, i) => (
                <button
                  key={step}
                  onClick={() => currentStep > step && setCurrentStep(step)}
                  className={`flex items-center gap-2 pb-4 transition-all ${i === 0 ? "pr-8" : i === 1 ? "px-8" : "pl-8"} ${currentStep === step
                    ? "border-b-2 border-primary text-primary"
                    : currentStep > step
                      ? "border-b-2 border-transparent text-green-400"
                      : "border-b-2 border-transparent text-slate-400"
                    }`}
                >
                  <span className={`size-6 rounded-full flex items-center justify-center text-xs font-bold ${currentStep > step ? "bg-green-100 text-green-400"
                    : currentStep === step ? "bg-primary text-white"
                      : "bg-white"
                    }`}>
                    {currentStep > step ? "✓" : step}
                  </span>
                  <span className="text-sm font-bold">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {currentStep === 1 && <Step1BasicInfo formData={formData} updateFormData={updateFormData} errors={step1Errors} />}
              {currentStep === 2 && <Step2ImagesVideos formData={formData} updateFormData={updateFormData} />}
              {currentStep === 3 && <Step3CommissionPackage formData={formData} updateFormData={updateFormData} isRenewal={isRenewalMode} />}
            </div>
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <PropertyProgressSidebar currentStep={currentStep} formData={formData} />
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-700 relative z-10 gap-4">
            {currentStep > 1 && !(isRenewalMode && currentStep === 3) ? (
              <button onClick={prevStep}
                className="flex items-center gap-2 px-6 py-2.5 border border-slate-600 rounded-lg text-slate-300 font-bold hover:bg-slate-700 transition-all">
                <span className="material-symbols-outlined">arrow_back</span>
                Quay lại
              </button>
            ) : <div />}

            {currentStep < 3 ? (
              <button onClick={nextStep}
                className="px-10 py-2.5 rounded-lg bg-primary text-white font-bold shadow-md hover:bg-primary/90 transition-all flex items-center gap-2">
                Tiếp tục
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={isLoading}
                className="px-10 py-2.5 rounded-lg bg-primary text-white font-bold shadow-md hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? "Đang xử lý..." : isRenewalMode ? "Gia hạn & Thanh toán" : isEditMode ? "Cập nhật tin đăng" : "Thanh toán & Đăng tin"}
                <span className="material-symbols-outlined text-lg">send</span>
              </button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// ── Field Error Component ─────────────────────────────
function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
      <span className="material-symbols-outlined text-[13px]">error</span>
      {msg}
    </p>
  );
}

// ── Step 1 ─────────────────────────────────────────────
function Step1BasicInfo({ formData, updateFormData, errors }: {
  formData: PropertyFormData;
  updateFormData: (field: keyof PropertyFormData, value: PropertyValue) => void;
  errors: Step1Errors;
}) {
  const errCls = (hasErr: boolean) =>
    `w-full rounded-lg border ${hasErr ? "border-red-400 bg-red-50" : "border-slate-400 bg-slate-100"} text-black focus:ring-primary focus:border-primary text-sm px-4 py-3 placeholder-slate-400`;
  const selErrCls = (hasErr: boolean) =>
    `w-full rounded-lg border ${hasErr ? "border-red-400 bg-red-50" : "border-slate-400 bg-slate-100"} text-slate-600 focus:ring-primary focus:border-primary text-sm px-4 py-3`;

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg border border-primary/10">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-black mb-2">
            Tiêu đề tin đăng <span className="text-red-400">*</span>
          </label>
          <input type="text"
            className={errCls(!!errors.title)}
            placeholder="VD: Bán căn hộ 2PN, nội thất cao cấp tại Landmark 81"
            value={formData.title}
            onChange={(e) => updateFormData("title", e.target.value)} />
          <p className="text-[11px] text-slate-600 mt-1">Tối thiểu 10 ký tự, tối đa 99 ký tự.</p>
          <FieldError msg={errors.title} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-black mb-2">Loại hình <span className="text-red-400">*</span></label>
            <select className={selErrCls(!!errors.type)}
              value={formData.type} onChange={(e) => updateFormData("type", e.target.value)}>
              <option value="">Chọn loại hình</option>
              {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <FieldError msg={errors.type} />
          </div>
          <div>
            <label className="block text-sm font-bold text-black mb-2">Tên dự án</label>
            <input type="text"
              className="w-full rounded-lg border border-slate-600 bg-slate-100 text-black focus:ring-primary focus:border-primary text-sm px-4 py-3 placeholder-slate-400"
              placeholder="VD: Vinhomes Central Park"
              value={formData.projectName}
              onChange={(e) => updateFormData("projectName", e.target.value)} />
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-bold text-black mb-2">Địa chỉ chi tiết <span className="text-red-400">*</span></label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <select className={selErrCls(!!errors.city)}
                value={formData.city}
                onChange={(e) => { updateFormData("city", e.target.value); updateFormData("district", ""); }}>
                <option value="">Chọn Tỉnh/Thành</option>
                {CITIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <FieldError msg={errors.city} />
            </div>
            <div>
              <select className={selErrCls(!!errors.district)}
                value={formData.district} onChange={(e) => updateFormData("district", e.target.value)}>
                <option value="">Chọn Quận/Huyện</option>
                {(DISTRICTS_BY_CITY[formData.city] || []).map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
              <FieldError msg={errors.district} />
            </div>
          </div>
          <div>
            <input type="text"
              className={errCls(!!errors.address)}
              placeholder="Số nhà, tên đường, phường/xã..."
              value={formData.address} onChange={(e) => updateFormData("address", e.target.value)} />
            <FieldError msg={errors.address} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-black mb-2">Link Google Maps (không bắt buộc)</label>
          <input type="url"
            className="w-full rounded-lg border border-slate-600 bg-slate-100 text-slate-600 focus:ring-primary focus:border-primary text-sm px-4 py-3 placeholder-slate-400"
            placeholder="Dán link chia sẻ Google Maps hoặc link embed"
            value={formData.mapUrl} onChange={(e) => updateFormData("mapUrl", e.target.value)} />
          <p className="text-[11px] text-slate-500 mt-1">Bạn có thể dùng link chia sẻ từ Google Maps.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-black mb-2">Số phòng ngủ</label>
            <input type="number" min={0}
              className="w-full rounded-lg border border-slate-600 bg-slate-100 text-slate-600 focus:ring-primary focus:border-primary text-sm px-4 py-3 placeholder-slate-400"
              placeholder="VD: 2"
              value={formData.bedrooms || ""}
              onChange={(e) => updateFormData("bedrooms", e.target.value ? Number(e.target.value) : 0)} />
          </div>
          <div>
            <label className="block text-sm font-bold text-black mb-2">Hướng nhà</label>
            <select className="w-full rounded-lg border border-slate-600 bg-slate-100 text-slate-600 focus:ring-primary focus:border-primary text-sm px-4 py-3"
              value={formData.direction} onChange={(e) => updateFormData("direction", e.target.value)}>
              {DIRECTION_OPTIONS.map((opt) => <option key={opt.value || "none"} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-black mb-2">Giá bán (VNĐ) <span className="text-red-400">*</span></label>
            <div className="relative">
              <input type="number"
                className={`w-full rounded-lg border ${errors.price ? "border-red-400 bg-red-50" : "border-slate-600 bg-slate-100"} text-slate-600 focus:ring-primary focus:border-primary text-sm px-4 py-3 pr-12 placeholder-slate-400`}
                placeholder="VD: 5500000000"
                value={formData.price || ""}
                onChange={(e) => updateFormData("price", Number(e.target.value))} />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">VNĐ</span>
            </div>
            <FieldError msg={errors.price} />
          </div>
          <div>
            <label className="block text-sm font-bold text-black mb-2">Diện tích (m²) <span className="text-red-400">*</span></label>
            <div className="relative">
              <input type="number"
                className={`w-full rounded-lg border ${errors.area ? "border-red-400 bg-red-50" : "border-slate-600 bg-slate-100"} text-slate-600 focus:ring-primary focus:border-primary text-sm px-4 py-3 pr-12 placeholder-slate-400`}
                placeholder="VD: 75"
                value={formData.area || ""}
                onChange={(e) => updateFormData("area", Number(e.target.value))} />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">m²</span>
            </div>
            <FieldError msg={errors.area} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-black mb-2">Mô tả chi tiết <span className="text-red-400">*</span></label>
          <textarea
            className={`w-full rounded-lg border ${errors.description ? "border-red-400 bg-red-50" : "border-slate-600 bg-slate-100"} text-slate-600 focus:ring-primary focus:border-primary text-sm px-4 py-3 placeholder-slate-400`}
            placeholder="Mô tả về tình trạng nội thất, hướng nhà, tiện ích xung quanh..."
            rows={8}
            value={formData.description}
            onChange={(e) => updateFormData("description", e.target.value)} />
          <p className="text-[11px] text-slate-400 mt-1">Nên cung cấp ít nhất 50 ký tự để tăng tỷ lệ chốt khách.</p>
          <FieldError msg={errors.description} />
        </div>
      </div>
    </div>
  );
}

// ── Step 2 ─────────────────────────────────────────────
function Step2ImagesVideos({ formData, updateFormData }: {
  formData: PropertyFormData;
  updateFormData: (field: keyof PropertyFormData, value: PropertyValue) => void;
}) {
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    updateFormData("images", [...formData.images, ...files]);
    setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const removeImage = (index: number) => {
    updateFormData("images", formData.images.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl p-6 shadow-lg border border-primary/30">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-black flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">add_a_photo</span>
            Hình ảnh sản phẩm
          </h2>
          <span className="text-sm text-slate-500">Tối đa 20 ảnh</span>
        </div>
        <div className="relative border-2 border-dashed border-slate-600 rounded-xl p-10 flex flex-col items-center justify-center bg-white hover:border-primary transition-colors cursor-pointer mb-8">
          <div className="size-16 bg-primary/40 rounded-full flex items-center justify-center text-primary mb-4">
            <span className="material-symbols-outlined text-3xl">cloud_upload</span>
          </div>
          <p className="text-lg font-bold text-black">Kéo thả ảnh vào đây</p>
          <p className="text-sm text-slate-600 mt-1 text-center">Hoặc click để chọn ảnh từ máy tính.<br />Hỗ trợ JPG, PNG (Tối đa 5MB/ảnh)</p>
          <input type="file" id="imageUpload" multiple accept="image/*" onChange={handleImageUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative group aspect-4/3 rounded-lg overflow-hidden border-2 border-primary">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt={`Ảnh ${index + 1}`} className="w-full h-full object-cover" src={preview} />
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-primary text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase">Ảnh bìa</div>
              )}
              <button onClick={() => removeImage(index)}
                className="absolute top-2 right-2 size-7 bg-white/90 rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          ))}
          {Array.from({ length: Math.max(0, 4 - imagePreviews.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-4/3 rounded-lg border-2 border-dotted border-slate-600 flex items-center justify-center bg-slate-100">
              <span className="material-symbols-outlined text-slate-500">image</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg border border-primary/30">
        <h2 className="text-xl font-bold text-black mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">movie</span>
          Video thực tế
        </h2>
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-2">Link video từ Youtube hoặc TikTok</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">link</span>
            <input type="text"
              className="w-full rounded-lg border border-slate-600 bg-slate-100 text-slate-600 focus:ring-primary focus:border-primary text-sm pl-12 pr-4 py-3 placeholder-slate-400"
              placeholder="https://www.youtube.com/watch?v=..."
              value={formData.videoUrl}
              onChange={(e) => updateFormData("videoUrl", e.target.value)} />
          </div>
          <p className="mt-2 text-xs text-slate-600 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">info</span>
            Dán đường dẫn video giới thiệu nhà đất để tăng độ tin cậy.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Step 3 ─────────────────────────────────────────────
function Step3CommissionPackage({ formData, updateFormData, isRenewal = false }: {
  formData: PropertyFormData;
  updateFormData: (field: keyof PropertyFormData, value: PropertyValue) => void;
  isRenewal?: boolean;
}) {
  return (
    <div className="space-y-8">
      {/* Commission Section - Only show when NOT in renewal mode */}
      {!isRenewal && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-primary/30">
          <h2 className="text-xl font-bold text-black mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">handshake</span>
            Cấu hình hoa hồng cộng tác
          </h2>
          <p className="text-sm text-slate-600 mb-6">Mức hoa hồng bạn sẵn sàng chi trả cho môi giới khác khi họ giới thiệu khách hàng chốt giao dịch thành công.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((percent) => (
              <label key={percent} className="relative cursor-pointer">
                <input type="radio" className="peer sr-only" name="commission" value={percent}
                  checked={formData.commission === percent}
                  onChange={(e) => updateFormData("commission", Number(e.target.value))} />
                <div className="p-4 border-2 border-slate-600 rounded-xl peer-checked:border-primary peer-checked:bg-primary/10 transition-all text-center">
                  <span className="block text-2xl font-bold text-black mb-1">{percent}%</span>
                  <span className="text-xs text-slate-600 font-medium">
                    {percent === 1 ? "Cơ bản" : percent === 2 ? "Hấp dẫn" : "Ưu tiên cao"}
                  </span>
                </div>
              </label>
            ))}
          </div>
          <div className="mt-6">
            <label className="block text-sm font-semibold text-slate-600 mb-2">Hoặc nhập phần trăm khác</label>
            <div className="flex items-center gap-2 max-w-[200px]">
              <input type="number"
                className="w-full rounded-lg border border-slate-600 bg-slate-100 text-slate-600 focus:ring-primary focus:border-primary text-sm px-4 py-3 placeholder-slate-400"
                placeholder="Ví dụ: 2.5"
                value={formData.commission || ""}
                onChange={(e) => updateFormData("commission", Number(e.target.value))} />
              <span className="font-bold text-slate-600">%</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-lg border border-primary/30">
        <h2 className="text-xl font-bold text-black mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">workspace_premium</span>
          {isRenewal ? "Chọn gói gia hạn" : "Chọn gói tin đăng"}
        </h2>
        <div className="space-y-4">
          {/* Free */}
          <label className="block relative cursor-pointer">
            <input type="radio" className="peer sr-only" name="package" value="free"
              checked={formData.package === "free"}
              onChange={(e) => updateFormData("package", e.target.value)} />
            <div className="flex flex-col md:flex-row md:items-center justify-between p-5 border-2 border-slate-600 rounded-xl peer-checked:border-primary peer-checked:bg-primary/10 transition-all gap-4">
              <div className="flex items-start gap-4">
                <div className="bg-gray-400 p-3 rounded-lg text-slate-600"><span className="material-symbols-outlined">description</span></div>
                <div>
                  <h3 className="font-bold text-black text-base">Gói Thường</h3>
                  <ul className="mt-2 space-y-1">
                    <li className="flex items-center gap-2 text-xs text-slate-600"><span className="material-symbols-outlined text-green-400 text-sm">check_circle</span>Hiển thị trong 3 ngày</li>
                    <li className="flex items-center gap-2 text-xs text-slate-600"><span className="material-symbols-outlined text-green-400 text-sm">check_circle</span>Tiếp cận khách hàng cơ bản</li>
                  </ul>
                </div>
              </div>
              <div className="text-left md:text-right"><span className="text-lg font-black text-slate-800">Miễn phí</span></div>
            </div>
          </label>

          {/* VIP */}
          <label className="block relative cursor-pointer">
            <input type="radio" className="peer sr-only" name="package" value="vip"
              checked={formData.package === "vip"}
              onChange={(e) => updateFormData("package", e.target.value)} />
            <div className="flex flex-col md:flex-row md:items-center justify-between p-5 border-2 border-slate-600 rounded-xl peer-checked:border-primary peer-checked:bg-primary/10 transition-all gap-4">
              <div className="flex items-start gap-4">
                <div className="bg-primary/20 p-3 rounded-lg text-primary"><span className="material-symbols-outlined">auto_awesome</span></div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-yellow-500 text-base">Gói VIP</h3>
                    <span className="bg-yellow-900/40 text-yellow-300 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Phổ biến</span>
                  </div>
                  <ul className="mt-2 space-y-1">
                    <li className="flex items-center gap-2 text-xs text-slate-600"><span className="material-symbols-outlined text-green-400 text-sm">check_circle</span>Tự động đẩy tin lên đầu mỗi ngày</li>
                    <li className="flex items-center gap-2 text-xs text-slate-600"><span className="material-symbols-outlined text-green-400 text-sm">check_circle</span>Hiển thị huy hiệu VIP nổi bật</li>
                    <li className="flex items-center gap-2 text-xs text-slate-600"><span className="material-symbols-outlined text-green-400 text-sm">check_circle</span>Ưu tiên xuất hiện trong kết quả tìm kiếm</li>
                  </ul>
                </div>
              </div>
              <div className="text-left md:text-right"><span className="text-xl font-black text-primary">50.000đ</span><span className="block text-xs text-slate-600">/7ngày</span></div>
            </div>
          </label>

          {/* Diamond */}
          <label className="block relative cursor-pointer">
            <input type="radio" className="peer sr-only" name="package" value="diamond"
              checked={formData.package === "diamond"}
              onChange={(e) => updateFormData("package", e.target.value)} />
            <div className="flex flex-col md:flex-row md:items-center justify-between p-5 border-2 border-slate-600 rounded-xl peer-checked:border-primary peer-checked:bg-primary/10 transition-all gap-4">
              <div className="flex items-start gap-4">
                <div className="bg-indigo-200 p-3 rounded-lg text-indigo-400"><span className="material-symbols-outlined">diamond</span></div>
                <div>
                  <h3 className="font-bold text-indigo-900 text-base">Gói Kim Cương</h3>
                  <ul className="mt-2 space-y-1">
                    <li className="flex items-center gap-2 text-xs text-slate-600"><span className="material-symbols-outlined text-green-400 text-sm">check_circle</span>Xuất hiện trang chủ chuyên mục</li>
                    <li className="flex items-center gap-2 text-xs text-slate-600"><span className="material-symbols-outlined text-green-400 text-sm">check_circle</span>Kích thước ảnh đại diện lớn hơn 2x</li>
                    <li className="flex items-center gap-2 text-xs text-slate-600"><span className="material-symbols-outlined text-green-400 text-sm">check_circle</span>Hỗ trợ quảng cáo Facebook & Google</li>
                  </ul>
                </div>
              </div>
              <div className="text-left md:text-right"><span className="text-xl font-black text-indigo-400">150.000đ</span><span className="block text-xs text-slate-600">/30ngày</span></div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────
function PropertyProgressSidebar({ currentStep, formData }: { currentStep: number; formData: PropertyFormData }) {
  const progressPercent = currentStep === 1 ? 30 : currentStep === 2 ? 60 : 100;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-primary/30 overflow-hidden">
      <div className="p-4 border-b border-slate-700 bg-white flex justify-between items-center">
        <h3 className="font-bold text-black">Tiến độ tin đăng</h3>
        <span className="text-xs font-bold text-primary">{progressPercent}%</span>
      </div>
      <div className="p-6">
        <div className="w-full bg-slate-700 h-2 rounded-full mb-6 overflow-hidden">
          <div className="bg-primary h-full rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
        </div>
        <ul className="space-y-4">
          {[
            { label: "Thông tin cơ bản", step: 1 },
            { label: "Hình ảnh & Video", step: 2 },
            { label: "Hoa hồng & Phí dịch vụ", step: 3 },
          ].map(({ label, step }) => (
            <li key={step} className="flex items-center gap-3 text-sm">
              <span className={`material-symbols-outlined text-xl ${currentStep > step ? "text-green-400" : currentStep === step ? "text-primary" : "text-slate-500"
                }`}>
                {currentStep > step ? "check_circle" : "radio_button_unchecked"}
              </span>
              <span className={`font-medium ${currentStep > step ? "text-green-400" : currentStep === step ? "text-primary" : "text-slate-400"}`}>
                {label}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-8 pt-6 border-t border-slate-700">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">Xem trước tin đăng</h4>
          <div className="relative rounded-lg overflow-hidden border border-slate-600 aspect-4/3 bg-white">
            {formData.images.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="Preview" className="w-full h-full object-cover" src={URL.createObjectURL(formData.images[0])} />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 gap-2">
                <span className="material-symbols-outlined text-4xl">image</span>
                <span className="text-[10px] font-medium px-4 text-center">Hình ảnh sẽ xuất hiện sau khi bạn hoàn thành Bước 2</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}