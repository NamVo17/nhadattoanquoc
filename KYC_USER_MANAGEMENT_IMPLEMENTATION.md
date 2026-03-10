# KYC & Quản lý người dùng - Tài liệu Triển khai

## Tổng quan

Đã xây dựng hoàn chỉnh các tính năng:ư

1. **Xác thực danh tính (KYC)** - Người dùng
2. **Đổi mật khẩu** - Người dùng
3. **Quản lý KYC** - Admin
4. **Quản lý người dùng** - Admin

---

## 1. Database & Migrations

### Migration: `004_add_kyc_table.sql`

Tạo bảng `kyc_verifications` với các cột:

- `id`: UUID, khóa chính
- `user_id`: tham chiếu tới bảng users
- `id_type`: loại giấy tờ (cccd, passport, license)
- `id_number`: số giấy tờ
- `id_image_front`: ảnh mặt trước
- `id_image_back`: ảnh mặt sau
- `full_name`: họ tên
- `date_of_birth`: ngày sinh
- `gender`: giới tính
- `address`, `city`, `district`, `ward`: địa chỉ
- `status`: pending, verified, rejected, unverified
- `verification_score`: điểm xác thực (0-100)
- `rejection_reason`: lý do từ chối
- `reviewed_by`: ID của admin đã duyệt
- `submitted_at`, `verified_at`, `reviewed_at`: thời gian

Thêm cột `kyc_status` vào bảng `users`.

**Chạy migration:**

```sql
-- Chạy file migration trong Supabase SQL editor
```

---

## 2. Backend APIs

### Models: `kyc.model.js`

Hàm chính:

- `upsert()`: Tạo/cập nhật KYC verification
- `getByUserId()`: Lấy thông tin KYC của user
- `getPendingVerifications()`: Lấy danh sách KYC chờ phê duyệt (admin)
- `getById()`: Lấy chi tiết KYC (admin)
- `approve()`: Phê duyệt KYC (admin)
- `reject()`: Từ chối KYC (admin)
- `getStatistics()`: Lấy thống kê KYC (admin)

### Controller: `kyc.controller.js`

**Endpoints người dùng:**

- `GET /api/v1/kyc/me` - Lấy trạng thái KYC của user hiện tại
- `POST /api/v1/kyc/submit` - Gửi yêu cầu KYC
- `POST /api/v1/kyc/change-password` - Đổi mật khẩu

**Endpoints admin:**

- `GET /api/v1/kyc/admin/statistics` - Lấy thống kê KYC
- `GET /api/v1/kyc/admin/pending` - Lấy danh sách KYC chờ phê duyệt
- `GET /api/v1/kyc/admin/:id` - Lấy chi tiết KYC
- `POST /api/v1/kyc/admin/:id/approve` - Phê duyệt KYC
- `POST /api/v1/kyc/admin/:id/reject` - Từ chối KYC

### Routes: `kyc.routes.js`

Định nghĩa tất cả các route với:

- Xác thực middleware
- Quyền hạn (admin, moderator)
- Validations bằng express-validator
- Upload file middleware cho KYC images

---

## 3. Frontend - User Dashboard

### Tính năng KYC: `/dashboard/settings/kyc/page.tsx`

**Chức năng:**

- Kiểm tra trạng thái KYC hiện tại
- Form gửi KYC với 8 trường:
  - Loại giấy tờ (CCCD/Hộ chiếu/Bằng lái)
  - Số giấy tờ
  - Họ tên
  - Ngày sinh
  - Giới tính
  - Địa chỉ, Thành phố, Quận/Huyện, Phường/Xã
- Upload 2 ảnh (mặt trước & mặt sau)
- Xem lý do từ chối nếu bị reject
- Hiển thị thông báo lỗi/thành công
- Tải dữ liệu từ API

**Trạng thái hiển thị:**

- Chưa xác thực (unverified) - Cho phép gửi KYC
- Đang xử lý (pending) - Hiển thị thông báo chờ
- Đã xác minh (verified) - Hiển thị thông báo thành công
- Bị từ chối (rejected) - Cho phép gửi lại + hiển thị lý do

### Tính năng Đổi mật khẩu: `/dashboard/settings/change-password/page.tsx`

**Chức năng:**

- 3 trường input: mật khẩu hiện tại, mật khẩu mới, xác nhận
- Nút ẩn/hiện mật khẩu cho mỗi trường
- Thanh kiểm tra độ mạnh mật khẩu (4 tiêu chí):
  - Tối thiểu 8 ký tự
  - Có ít nhất 1 chữ hoa
  - Có ít nhất 1 chữ số
  - Có ký tự đặc biệt (!@#$%^&\*)
- Vô hiệu hóa nút submit nếu không đáp ứng yêu cầu
- Hiển thị lỗi/thành công
- Gọi API để cập nhật mật khẩu

---

## 4. Frontend - Admin Dashboard

### Quản lý KYC: `/admin/kyc/page.tsx`

**Chức năng:**

- **Danh sách KYC:**
  - Hiển thị danh sách các yêu cầu KYC đang chờ phê duyệt
  - Tìm kiếm theo tên, email, SDT
  - Phân trang
  - Click để xem chi tiết

- **Chi tiết KYC:**
  - Thông tin user (tên, email, điện thoại)
  - Thông tin giấy tờ (loại, số)
  - Điểm xác thực
  - Ảnh mặt trước & mặt sau
  - Ngày gửi

- **Hành động:**
  - Phê duyệt KYC - Set trạng thái = "verified"
  - Từ chối KYC - Form nhập lý do từ chối

- **Gọi API:**
  - `GET /api/v1/kyc/admin/pending` - Lấy danh sách
  - `GET /api/v1/kyc/admin/:id` - Lấy chi tiết
  - `POST /api/v1/kyc/admin/:id/approve` - Phê duyệt
  - `POST /api/v1/kyc/admin/:id/reject` - Từ chối

### Quản lý người dùng: `/admin/users/page.tsx`

**Chức năng:**

- **Bộ lọc:**
  - Lọc theo vai trò (Tất cả, Người dùng, Môi giới, Quản trị viên)
  - Lọc theo trạng thái (Hoạt động, Không hoạt động)
  - Tìm kiếm theo tên, email, SDT

- **Thống kê:**
  - Tổng số người dùng
  - Số người dùng cần xác thực KYC
  - Số người đang hoạt động
  - Số báo cáo vi phạm

- **Bảng người dùng:**
  - Tên & Thông tin id
  - Email & Điện thoại
  - Vai trò (Người dùng, Môi giới, Admin)
  - Trạng thái KYC (Đã xác minh, Chờ phê duyệt, Bị từ chối, Chưa xác thực)
  - Ngày tham gia
  - Trạng thái tài khoản (Hoạt động, Không hoạt động)

- **Hành động:**
  - Vô hiệu hóa/Kích hoạt tài khoản
  - Xem chi tiết (Modal)

- **Chi tiết người dùng (Modal):**
  - Avatar
  - Tên, email, điện thoại
  - Vai trò
  - Trạng thái KYC
  - Trạng thái tài khoản
  - Ngày tham gia

- **Phân trang:**
  - Hiển thị page hiện tại
  - Nút Previous/Next

---

## 5. Tích hợp API

### Các endpoint cần triển khai trên backend:

1. **Có sẵn:**
   - `/api/v1/kyc/*` (đã tạo)

2. **Cần thêm vào auth.controller.js:**
   - `GET /api/v1/auth/users` - Lấy danh sách users (với filter & pagination)
   - `PATCH /api/v1/auth/users/:id/toggle-status` - Bật/tắt tài khoản user

---

## 6. Quy Trình KYC

### Từ phía User:

1. User vào Dashboard → Cài đặt → Xác thực danh tính
2. Điền form KYC (8 trường) + Upload 2 ảnh
3. Click "Gửi yêu cầu xác thực"
4. Trạng thái chuyển sang "Đang xử lý"
5. Admin xem & phê duyệt → Trạng thái = "Đã xác minh" ✓

### Từ phía Admin:

1. Admin vào Admin → KYC
2. Xem danh sách yêu cầu chờ phê duyệt
3. Click vào yêu cầu để xem chi tiết
4. Xem thông tin user & ảnh giấy tờ
5. 2 lựa chọn:
   - "Phê duyệt KYC" → Trạng thái = "Verified"
   - "Từ chối" → Nhập lý do → Trạng thái = "Rejected"

---

## 7. Bảo Mật

### Xác thực & Phân quyền:

- Tất cả endpoint đều cần token JWT
- Endpoints admin cần role = "admin" hoặc "moderator"
- Validation input trên cả server & client

### Mật khẩu:

- Hash bằng bcryptjs (salt rounds: 10)
- Kiểm tra mật khẩu hiện tại trước khi đổi
- Yêu cầu độ mạnh: 8+ ký tự, chữ hoa, số, ký tự đặc biệt

### Upload File:

- Chỉ chấp nhận file ảnh
- Giới hạn kích thước & loại file
- Lưu vào cloud storage (S3 hoặc tương tự)

---

## 8. Cài đặt & Chạy

### Backend:

```bash
cd backend
npm install
# Chạy migration 004_add_kyc_table.sql trong Supabase
node server.js  # hoặc npm run dev
```

### Frontend:

```bash
cd frontend
npm install
npm run dev
# Truy cập http://localhost:3000/dashboard/settings/kyc
# hoặc http://localhost:3000/admin/kyc
```

---

## 9. Testing Checklist

### User (KYC):

- [ ] Gửi KYC form → Lưu vào DB, trạng thái = "pending"
- [ ] Xem lại dữ liệu KYC đã gửi
- [ ] Nếu bị reject → Xem lý do & gửi lại
- [ ] Đổi mật khẩu → Validate độ mạnh & cập nhật

### Admin (KYC):

- [ ] Xem danh sách KYC chờ phê duyệt
- [ ] Tìm kiếm/filter danh sách
- [ ] Xem chi tiết & ảnh
- [ ] Phê duyệt → Cập nhật user kyc_status = "verified"
- [ ] Từ chối → Nhập lý do, cập nhật status = "rejected"

### Admin (Users):

- [ ] Filter theo vai trò & trạng thái
- [ ] Tìm kiếm người dùng
- [ ] Xem thống kê
- [ ] Vô hiệu hóa/kích hoạt user
- [ ] Xem chi tiết user

---

## 10. Lưu ý

- Đảm bảo Supabase storage được cấu hình để lưu KYC images
- JWT token từ localStorage cần đính kèm header "Authorization: Bearer <token>"
- API response format: `{ success: boolean, message: string, data: any }`
- Lỗi được throw dùng ApiError class với (message, statusCode)

---

## 11. File được tạo/cập nhật

### Backend:

```
backend/
├── database/migrations/
│   └── 004_add_kyc_table.sql          ✓ Tạo
├── models/
│   └── kyc.model.js                  ✓ Tạo
├── controllers/
│   └── kyc.controller.js             ✓ Tạo
├── routes/
│   └── kyc.routes.js                 ✓ Tạo
└── app.js                            ✓ Cập nhật (thêm KYC routes)
```

### Frontend:

```
frontend/src/
├── app/dashboard/settings/
│   ├── kyc/page.tsx                  ✓ Cập nhật (tính năng đầy đủ)
│   └── change-password/page.tsx      ✓ Cập nhật (tính năng đầy đủ)
└── app/admin/
    ├── kyc/page.tsx                  ✓ Cập nhật (tính năng đầy đủ)
    └── users/page.tsx                ✓ Cập nhật (tính năng đầy đủ)
```

---

**Hoàn tất ngày:** 10/03/2026
