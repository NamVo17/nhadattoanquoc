"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { authorizedFetch } from "@/lib/authorizedFetch";

interface User {
  id: string;
  fullName?: string;
  name?: string;
  email: string;
  role: string;
  avatarUrl?: string;
  coverUrl?: string;
  phone?: string;
  address?: string;
  username?: string;
  title?: string;
  licenseCode?: string;
  joinYear?: string;
  experience?: string;
  areas?: string[];
  propertyTypes?: string[];
  bio?: string;
  facebook?: string;
  zalo?: string;
  successDeals?: string;
}

const PROPERTY_TYPE_OPTIONS = [
  "Căn hộ cao cấp",
  "Nhà phố & Biệt thự",
  "Shophouse",
  "Đất nền",
  "Bất động sản nghỉ dưỡng",
  "Bất động sản công nghiệp",
  "Văn phòng/Thương mại",
];

const AREA_OPTIONS = [
  "Quận 1, TP.HCM",
  "Quận 2 (Thủ Đức), TP.HCM",
  "Quận 3, TP.HCM",
  "Quận 4, TP.HCM",
  "Quận 7, TP.HCM",
  "Quận 9, TP.HCM",
  "Bình Thạnh, TP.HCM",
  "Thủ Đức, TP.HCM",
  "Hà Nội",
  "Đà Nẵng",
  "Bình Dương",
  "Đồng Nai",
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [originalData, setOriginalData] = useState({ fullName: "", phone: "", email: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [customArea, setCustomArea] = useState("");

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    username: "",
    address: "",
    facebook: "",
    zalo: "",
    title: "",
    licenseCode: "",
    joinYear: new Date().getFullYear().toString(),
    experience: "1",
    successDeals: "",
    bio: "",
    areas: [] as string[],
    propertyTypes: [] as string[],
  });

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("user");
    if (!token || !userData) {
      router.push("/login");
      return;
    }
    try {
      const parsed: User = JSON.parse(userData);
      setUser(parsed);

      const fullName = parsed.fullName || parsed.name || "";
      const phone = parsed.phone || "";
      const email = parsed.email || "";

      setOriginalData({ fullName, phone, email });
      setFormData({
        fullName,
        phone,
        email,
        username: parsed.username || "",
        address: parsed.address || "",
        facebook: parsed.facebook || "",
        zalo: parsed.zalo || "",
        title: parsed.title || "",
        licenseCode: parsed.licenseCode || "",
        joinYear: parsed.joinYear || new Date().getFullYear().toString(),
        experience: parsed.experience || "1",
        successDeals: parsed.successDeals || "",
        bio: parsed.bio || "",
        areas: parsed.areas || [],
        propertyTypes: parsed.propertyTypes || [],
      });
    } catch {
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  interface ServerUser {
    id: string;
    email: string;
    role: string;
    full_name: string;
    phone?: string;
    avatar_url?: string;
    cover_url?: string;
    username?: string;
    title?: string;
    license_code?: string;
    join_year?: string;
    experience?: string;
    success_deals?: string;
    bio?: string;
    areas?: string[];
    property_types?: string[];
    facebook?: string;
    zalo?: string;
    address?: string;
  }

  const updateUserFromServer = (serverUser: ServerUser, prevUser: User | null): User => {
    const updatedLocalUser: User = {
      ...(prevUser || {
        id: serverUser.id,
        email: serverUser.email,
        role: serverUser.role,
      }),
      fullName: serverUser.full_name,
      name: serverUser.full_name,
      phone: serverUser.phone,
      avatarUrl: serverUser.avatar_url,
      coverUrl: serverUser.cover_url,
      username: serverUser.username,
      title: serverUser.title,
      licenseCode: serverUser.license_code,
      joinYear: serverUser.join_year,
      experience: serverUser.experience,
      successDeals: serverUser.success_deals,
      bio: serverUser.bio,
      areas: serverUser.areas || [],
      propertyTypes: serverUser.property_types || [],
      facebook: serverUser.facebook,
      zalo: serverUser.zalo,
      address: serverUser.address,
    };

    localStorage.setItem("user", JSON.stringify(updatedLocalUser));
    return updatedLocalUser;
  };

  const toggleTag = (field: "areas" | "propertyTypes", value: string) => {
    setFormData((prev) => {
      const list = prev[field];
      return {
        ...prev,
        [field]: list.includes(value)
          ? list.filter((v) => v !== value)
          : [...list, value],
      };
    });
  };

  const addCustomArea = () => {
    const trimmed = customArea.trim();
    if (trimmed && !formData.areas.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, areas: [...prev.areas, trimmed] }));
    }
    setCustomArea("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaveError("");
    setIsSaving(true);

    try {
      // Build payload — only send fullName/phone if they changed
      // Email cannot be changed (immutable after registration)
      const payload: Record<string, unknown> = {
        username: formData.username,
        title: formData.title,
        licenseCode: formData.licenseCode,
        joinYear: formData.joinYear,
        experience: formData.experience,
        successDeals: formData.successDeals,
        bio: formData.bio,
        areas: formData.areas,
        propertyTypes: formData.propertyTypes,
        facebook: formData.facebook,
        zalo: formData.zalo,
        address: formData.address,
      };

      if (formData.fullName !== originalData.fullName) {
        payload.fullName = formData.fullName;
      }
      if (formData.phone !== originalData.phone) {
        payload.phone = formData.phone;
      }

      const res = await authorizedFetch(`${API_URL}/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Lưu thất bại. Vui lòng thử lại.");
      }

      // Update localStorage with server response
      const serverUser = json.data?.user;
      if (serverUser) {
        const updatedLocalUser = updateUserFromServer(serverUser, user);
        setUser(updatedLocalUser);
        setOriginalData({
          fullName: serverUser.full_name,
          phone: serverUser.phone,
          email: serverUser.email,
        });
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Lưu thất bại. Vui lòng thử lại.";
      setSaveError(message);
      setTimeout(() => setSaveError(""), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const uploadAvatarToServer = async (avatarDataUrl: string) => {
    try {
      setIsUploadingAvatar(true);

      const res = await authorizedFetch(`${API_URL}/auth/upload-avatar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ avatarUrl: avatarDataUrl }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Tải ảnh thất bại. Vui lòng thử lại.");
      }

      const serverUser = json.data?.user;
      if (serverUser) {
        const updatedLocalUser = updateUserFromServer(serverUser, user);
        setUser(updatedLocalUser);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Tải ảnh thất bại. Vui lòng thử lại.";
      setSaveError(message);
      setTimeout(() => setSaveError(""), 5000);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const uploadCoverToServer = async (coverDataUrl: string) => {
    try {
      setIsUploadingCover(true);

      const res = await authorizedFetch(`${API_URL}/auth/upload-cover`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ coverUrl: coverDataUrl }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Tải ảnh bìa thất bại. Vui lòng thử lại.");
      }

      const serverUser = json.data?.user;
      if (serverUser) {
        const updatedLocalUser = updateUserFromServer(serverUser, user);
        setUser(updatedLocalUser);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Tải ảnh bìa thất bại. Vui lòng thử lại.";
      setSaveError(message);
      setTimeout(() => setSaveError(""), 5000);
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === "string") {
        void uploadAvatarToServer(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setCoverPreview(previewUrl);

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === "string") {
        void uploadCoverToServer(result);
      }
    };
    reader.readAsDataURL(file);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
          Cập nhật hồ sơ
        </h1>
        <p className="text-slate-500 mt-1">
          Xây dựng hồ sơ năng lực chuyên nghiệp để thu hút khách hàng và đối tác.
        </p>
      </div>

      {/* Success toast */}
      {saved && (
        <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-5 py-3 rounded-xl font-semibold text-sm">
          <span className="material-symbols-outlined text-green-500">check_circle</span>
          Hồ sơ đã được lưu thành công lên hệ thống!
        </div>
      )}

      {/* Error toast */}
      {saveError && (
        <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-3 rounded-xl font-semibold text-sm">
          <span className="material-symbols-outlined text-red-500">error</span>
          {saveError}
        </div>
      )}

      {/* Cover Photo + Avatar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        {/* Cover */}
        <div className="h-48 w-full bg-slate-200 relative group">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                coverPreview
                  ? `url('${coverPreview}')`
                  : user?.coverUrl
                  ? `url('${user.coverUrl}')`
                  : "url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200')",
            }}
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all" />
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            className="absolute top-4 right-4 bg-white/90 p-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-sm hover:bg-white transition-all"
          >
            <span className="material-symbols-outlined text-lg">photo_camera</span>
            <span>Thay đổi ảnh bìa</span>
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverChange}
          />
        </div>

        {/* Avatar + Name */}
        <div className="px-8 pb-8 -mt-12 relative flex flex-col md:flex-row items-end gap-6">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-white bg-slate-200 shadow-xl overflow-hidden">
              {avatarPreview || user?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarPreview || user?.avatarUrl || ""}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-4xl font-bold">
                  {formData.fullName?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full shadow-lg border-2 border-white hover:scale-105 transition-all"
            >
              <span className="material-symbols-outlined text-sm">
                {isUploadingAvatar ? "hourglass_top" : "edit"}
              </span>
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div className="flex-1 pb-2">
            <h2 className="text-xl font-bold text-slate-900">{formData.fullName || "Họ và tên"}</h2>
            <p className="text-slate-500">{formData.title || "Chuyên danh chưa cập nhật"}</p>
            {formData.licenseCode && (
              <p className="text-xs text-slate-400 mt-0.5">
                <span className="material-symbols-outlined text-xs align-middle mr-1">badge</span>
                {formData.licenseCode}
              </p>
            )}
          </div>
        </div>
      </div>

      <form className="space-y-8" onSubmit={handleSave}>

        {/* ── 1. Thông tin cá nhân ── */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary">person</span>
            <h2 className="text-lg font-bold">Thông tin cá nhân</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Họ và tên *</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
                placeholder="Nguyễn Văn A"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Số điện thoại</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                placeholder="0901 234 567"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Email</label>
              <input
                type="email"
                value={formData.email}
                readOnly
                className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400">Email không thể thay đổi sau khi đăng ký.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Địa chỉ</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                placeholder="Nhập địa chỉ của bạn"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Link Facebook</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">link</span>
                <input
                  type="url"
                  value={formData.facebook}
                  onChange={(e) => setFormData((p) => ({ ...p, facebook: e.target.value }))}
                  placeholder="https://facebook.com/your-profile"
                  className="w-full pl-10 rounded-xl border border-slate-200 px-4 py-2.5 focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Zalo</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">chat</span>
                <input
                  type="url"
                  value={formData.zalo}
                  onChange={(e) => setFormData((p) => ({ ...p, zalo: e.target.value }))}
                  placeholder="https://zalo.me/your-number"
                  className="w-full pl-10 rounded-xl border border-slate-200 px-4 py-2.5 focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. Thông tin nghề nghiệp ── */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary">work</span>
            <h2 className="text-lg font-bold">Thông tin nghề nghiệp</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-700">Chuyên danh / Chức vụ</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                placeholder="VD: Chuyên viên cấp cao, Chuyên gia Biệt thự nghỉ dưỡng..."
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Mã số chứng chỉ hành nghề</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">badge</span>
                <input
                  type="text"
                  value={formData.licenseCode}
                  onChange={(e) => setFormData((p) => ({ ...p, licenseCode: e.target.value }))}
                  placeholder="VD: BDS-HCM-88291"
                  className="w-full pl-10 rounded-xl border border-slate-200 px-4 py-2.5 focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Năm gia nhập nghề</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">calendar_today</span>
                <input
                  type="number"
                  min={2000}
                  max={new Date().getFullYear()}
                  value={formData.joinYear}
                  onChange={(e) => setFormData((p) => ({ ...p, joinYear: e.target.value }))}
                  className="w-full pl-10 rounded-xl border border-slate-200 px-4 py-2.5 focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Số năm kinh nghiệm</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">military_tech</span>
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={formData.experience}
                  onChange={(e) => setFormData((p) => ({ ...p, experience: e.target.value }))}
                  className="w-full pl-10 rounded-xl border border-slate-200 px-4 py-2.5 focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Số giao dịch thành công</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">handshake</span>
                <input
                  type="number"
                  min={0}
                  value={formData.successDeals}
                  onChange={(e) => setFormData((p) => ({ ...p, successDeals: e.target.value }))}
                  placeholder="VD: 450"
                  className="w-full pl-10 rounded-xl border border-slate-200 px-4 py-2.5 focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. Khu vực hoạt động ── */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-primary">location_on</span>
            <h2 className="text-lg font-bold">Khu vực hoạt động</h2>
          </div>
          <p className="text-xs text-slate-400 mb-5">
            Chọn một hoặc nhiều khu vực bạn đang hoạt động chính. Nếu không có trong danh sách, nhập thêm bên dưới.
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {AREA_OPTIONS.map((area) => {
              const active = formData.areas.includes(area);
              return (
                <button
                  key={area}
                  type="button"
                  onClick={() => toggleTag("areas", area)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    active
                      ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
                      : "bg-white text-slate-600 border-slate-200 hover:border-primary hover:text-primary"
                  }`}
                >
                  {active && <span className="mr-1">✓</span>}
                  {area}
                </button>
              );
            })}
            {/* Custom areas added by user */}
            {formData.areas
              .filter((a) => !AREA_OPTIONS.includes(a))
              .map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => toggleTag("areas", area)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold border bg-primary text-white border-primary shadow-sm shadow-primary/20"
                >
                  <span className="mr-1">✓</span>
                  {area}
                </button>
              ))}
          </div>

          {/* Custom area input */}
          <div className="flex gap-2 mt-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">add_location</span>
              <input
                type="text"
                value={customArea}
                onChange={(e) => setCustomArea(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomArea(); } }}
                placeholder="Nhập khu vực khác (VD: Toàn quốc, Vũng Tàu...)"
                className="w-full pl-10 rounded-xl border border-slate-200 px-4 py-2.5 focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none text-sm"
              />
            </div>
            <button
              type="button"
              onClick={addCustomArea}
              className="px-4 py-2.5 bg-primary/10 text-primary font-bold rounded-xl text-sm hover:bg-primary hover:text-white transition-all"
            >
              Thêm
            </button>
          </div>

          {formData.areas.length > 0 && (
            <p className="text-xs text-slate-500 mt-3">
              Đã chọn: <span className="font-bold text-primary">{formData.areas.join(", ")}</span>
            </p>
          )}
        </div>

        {/* ── 4. Loại BĐS chuyên sâu ── */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-primary">apartment</span>
            <h2 className="text-lg font-bold">Loại bất động sản chuyên sâu</h2>
          </div>
          <p className="text-xs text-slate-400 mb-5">Chọn phân khúc bạn có kiến thức và kinh nghiệm sâu nhất</p>
          <div className="flex flex-wrap gap-2">
            {PROPERTY_TYPE_OPTIONS.map((type) => {
              const active = formData.propertyTypes.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleTag("propertyTypes", type)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    active
                      ? "bg-blue-50 text-primary border-primary shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:border-primary hover:text-primary"
                  }`}
                >
                  {active && <span className="mr-1">✓</span>}
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 5. Chứng chỉ hành nghề ── */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary">verified</span>
            <h2 className="text-lg font-bold">Chứng chỉ hành nghề</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 cursor-pointer transition-all">
              <span className="material-symbols-outlined text-3xl text-slate-400">upload_file</span>
              <span className="text-xs font-bold text-slate-500">Tải lên PDF/Ảnh</span>
              <span className="text-[10px] text-slate-400">Chứng chỉ, bằng cấp liên quan</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-red-500">picture_as_pdf</span>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold truncate">Chung_chi_hanh_nghe.pdf</p>
                  <p className="text-[10px] text-slate-500 uppercase">2.4 MB</p>
                </div>
              </div>
              <button type="button" className="text-slate-400 hover:text-red-500 transition-colors">
                <span className="material-symbols-outlined text-lg">delete</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── 6. Giới thiệu bản thân ── */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-primary">description</span>
            <h2 className="text-lg font-bold">Giới thiệu &amp; Kinh nghiệm</h2>
          </div>
          <p className="text-xs text-slate-400 mb-5">
            Viết đoạn giới thiệu hấp dẫn — đây là nội dung đầu tiên khách hàng đọc trên trang hồ sơ của bạn.
          </p>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 p-2 border-b border-slate-200 flex flex-wrap gap-1">
              {["format_bold", "format_italic", "format_list_bulleted", "format_list_numbered", "link"].map((icon) => (
                <button
                  key={icon}
                  type="button"
                  className="p-1.5 hover:bg-white rounded text-slate-600 transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">{icon}</span>
                </button>
              ))}
            </div>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData((p) => ({ ...p, bio: e.target.value }))}
              className="w-full p-4 bg-transparent border-none focus:ring-0 focus:outline-none text-slate-700 leading-relaxed min-h-[200px] resize-none text-sm"
              placeholder="Hơn X năm kinh nghiệm trong lĩnh vực bất động sản... Chuyên tư vấn giải pháp đầu tư tối ưu cho khách hàng cá nhân và doanh nghiệp. Cam kết minh bạch, tận tâm và hiệu quả trong mọi giao dịch."
            />
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-right">
              <span className="text-xs text-slate-400">{formData.bio.length}/2000 ký tự</span>
            </div>
          </div>
        </div>

        {/* ── Save Buttons ── */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pb-12">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full sm:w-auto px-10 py-3.5 rounded-xl font-bold text-slate-600 bg-slate-200 hover:bg-slate-300 transition-all"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-10 py-3.5 rounded-xl font-bold text-white bg-primary shadow-lg shadow-primary/30 hover:bg-primary/90 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Đang lưu...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">save</span>
                Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
