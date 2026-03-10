"use client";

import { useEffect, useRef, useState } from "react";
import { newsService } from "@/features/news/news.service";
import type { NewsItem, NewsStatus } from "@/features/news/news.types";

interface FormState {
  id?: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  image_url: string;
  status: NewsStatus;
}

const emptyForm: FormState = {
  title: "",
  category: "",
  summary: "",
  content: "",
  image_url: "",
  status: "draft",
};

export default function AdminNewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<NewsStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async (opts?: { page?: number }) => {
    setLoading(true);
    try {
      const res = await newsService.getAdminList({
        page: opts?.page ?? page,
        limit: 10,
        search: search || undefined,
        status: status || undefined,
      });
      setItems(res.data);
      setPage(res.page);
      setPages(res.pages);
      setTotal(res.total);
    } catch (e) {
      console.error(e);
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const openCreate = () => {
    setForm(emptyForm);
    setModalOpen(true);
    setError(null);
  };

  const openEdit = (item: NewsItem) => {
    setForm({
      id: item.id,
      title: item.title,
      category: item.category || "",
      summary: item.summary || "",
      content: item.content || "",
      image_url: item.image_url || "",
      status: item.status,
    });
    setModalOpen(true);
    setError(null);
  };

  const handleSave = async () => {
    const summaryLen = form.summary.trim().length;
    const contentLen = form.content.trim().length;
    
    if (!form.title.trim()) {
      setError("Vui lòng nhập Tiêu đề.");
      return;
    }
    if (summaryLen < 20) {
      setError(`Tóm tắt phải có ít nhất 20 ký tự (hiện có: ${summaryLen})`);
      return;
    }
    if (contentLen < 50) {
      setError(`Nội dung phải có ít nhất 50 ký tự (hiện có: ${contentLen})`);
      return;
    }
    
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        category: form.category.trim() || undefined,
        summary: form.summary.trim(),
        content: form.content.trim(),
        imageUrl: form.image_url.trim() || undefined,
        status: form.status,
      };
      if (form.id) {
        await newsService.update(form.id, payload);
      } else {
        await newsService.create(payload);
      }
      setModalOpen(false);
      await load({ page: 1 });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn tệp ảnh hợp lệ');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    setUploading(true);
    try {
      const url = await newsService.uploadImage(file);
      setForm((f) => ({ ...f, image_url: url }));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (item: NewsItem) => {
    if (!confirm(`Xóa tin tức "${item.title}"?`)) return;
    try {
      await newsService.remove(item.id);
      await load({ page: 1 });
    } catch (e) {
      alert((e as Error).message);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Quản lý tin tức</h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý nội dung hiển thị tại trang <span className="font-semibold text-primary">/news</span>.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Thêm tin tức
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-4">
          <div className="flex gap-2 flex-1">
            <div className="relative flex-1 max-w-sm">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                search
              </span>
              <input
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-primary focus:border-primary outline-none"
                placeholder="Tìm theo tiêu đề..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && load({ page: 1 })}
              />
            </div>
            <button
              onClick={() => load({ page: 1 })}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary"
            >
              Lọc
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold uppercase">Trạng thái:</span>
            <select
              className="border border-slate-200 rounded-lg text-sm px-3 py-2 focus:ring-primary focus:border-primary outline-none"
              value={status}
              onChange={(e) => setStatus(e.target.value as NewsStatus | "")}
            >
              <option value="">Tất cả</option>
              <option value="published">Đã xuất bản</option>
              <option value="draft">Nháp</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-100">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3">Tiêu đề</th>
                <th className="px-4 py-3 hidden md:table-cell">Danh mục</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 hidden md:table-cell">Ngày xuất bản</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-sm">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-sm">
                    Chưa có tin tức nào.
                  </td>
                </tr>
              ) : (
                items.map((n) => (
                  <tr key={n.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 line-clamp-2">{n.title}</span>
                        <span className="text-[11px] text-slate-400 mt-1 break-all">
                          /news/{n.slug}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell align-top text-slate-600 text-sm">
                      {n.category || "—"}
                    </td>
                    <td className="px-4 py-3 align-top">
                      {n.status === "published" ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold uppercase">
                          Nháp
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell align-top text-slate-500 text-sm">
                      {n.published_at ? new Date(n.published_at).toLocaleString("vi-VN") : "—"}
                    </td>
                    <td className="px-4 py-3 align-top text-right space-x-1">
                      <button
                        onClick={() => openEdit(n)}
                        className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold text-slate-700 border border-slate-200 rounded-lg hover:border-primary hover:text-primary"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(n)}
                        className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold text-red-600 border border-red-100 rounded-lg hover:bg-red-50"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-between mt-4 text-sm text-slate-500">
            <span>
              Tổng cộng <span className="font-semibold">{total}</span> tin tức
            </span>
            <div className="flex gap-1">
              <button
                disabled={page <= 1}
                onClick={() => { const p = Math.max(1, page - 1); setPage(p); load({ page: p }); }}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <span className="px-2 py-1 text-xs rounded-lg bg-slate-100 font-semibold">
                {page} / {pages}
              </span>
              <button
                disabled={page >= pages}
                onClick={() => { const p = Math.min(pages, page + 1); setPage(p); load({ page: p }); }}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {form.id ? "Chỉnh sửa tin tức" : "Thêm tin tức mới"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 flex items-start gap-2">
                  <span className="material-symbols-outlined text-base shrink-0 mt-0.5">error</span>
                  <span>{error}</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tiêu đề *</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Nhập tiêu đề tin tức..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Danh mục</label>
                  <input
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none"
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    placeholder="VD: Thị trường, Pháp lý..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Trạng thái</label>
                  <select
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none"
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as NewsStatus }))}
                  >
                    <option value="draft">Nháp</option>
                    <option value="published">Đã xuất bản</option>
                  </select>
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">Ảnh đại diện</label>
                <div className="flex gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || saving}
                    className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-300 hover:border-primary hover:text-primary disabled:opacity-50 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">image</span>
                    {uploading ? "Đang tải..." : "Chọn ảnh từ máy"}
                  </button>
                  <div className="text-xs text-slate-500 py-2">
                    Hoặc dán URL ảnh vào đây
                  </div>
                </div>
                {form.image_url && (
                  <div className="space-y-2">
                    <div className="relative inline-block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={form.image_url}
                        alt="Preview"
                        className="h-24 w-auto rounded-lg border border-slate-200 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, image_url: '' }))}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  </div>
                )}
                <input
                  type="text"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none"
                  value={form.image_url}
                  onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Tóm tắt *</label>
                  <span className={`text-xs font-semibold ${form.summary.trim().length < 20 ? 'text-red-500' : 'text-emerald-600'}`}>
                    {form.summary.trim().length}/20+
                  </span>
                </div>
                <textarea
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none"
                  rows={3}
                  value={form.summary}
                  onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                  placeholder="Tóm tắt ngắn gọn nội dung tin tức (tối thiểu 20 ký tự)..."
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">Nội dung chi tiết *</label>
                  <span className={`text-xs font-semibold ${form.content.trim().length < 50 ? 'text-red-500' : 'text-emerald-600'}`}>
                    {form.content.trim().length}/50+
                  </span>
                </div>
                <textarea
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-primary focus:border-primary outline-none font-mono text-xs"
                  rows={8}
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="Nội dung tin tức (tối thiểu 50 ký tự). Hỗ trợ markdown hoặc HTML đơn giản..."
                />
              </div>
            </div>

            <div className="px-5 py-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100"
                disabled={saving}
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm font-bold text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-60"
              >
                {saving ? "Đang lưu..." : "Lưu tin tức"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

