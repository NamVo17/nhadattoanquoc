# KẾ HOẠCH TRIỂN KHAI WEBSITE HỢP TÁC BĐS

## NhàĐấtToànQuốc - BDS Platform

**Ngày lập:** 10/03/2026  
**Phiên bản:** 1.0  
**Trạng thái:** Phát triển

---

## I. TỔNG QUAN DỰ ÁN

### 1.1 Mục tiêu chính

- Xây dựng nền tảng BĐS trực tuyến toàn quốc
- Kết nối người mua, người bán, và các nhà môi giới chuyên nghiệp
- Cung cấp công cụ quản lý bất động sản tiện lợi
- Tạo hệ sinh thái giao dịch BĐS an toàn và minh bạch

### 1.2 Phạm vị dự án

| Thành phần         | Chi tiết                                   |
| ------------------ | ------------------------------------------ |
| **Frontend**       | Next.js 16, TypeScript, Tailwind CSS       |
| **Backend**        | Node.js/Express, Supabase PostgreSQL       |
| **Người dùng**     | Chủ nhân, Môi giới, Quản trị viên          |
| **Tính năng core** | Đăng tin, KYC, Thanh toán, Admin Dashboard |
| **Phạm vi địa lý** | Toàn quốc Việt Nam                         |

---

## II. GIAI ĐOẠN TRIỂN KHAI

### Phase 1: MVP (Hiện tại - 31/03/2026) - 6 tuần

**Trạng thái:** 70% hoàn thành

#### 2.1.1 Backend

- ✅ Database schema & migrations
- ✅ Authentication & JWT
- ✅ User management
- ✅ News module
- ✅ KYC verification
- 🔄 Property management (85%)
- 🔄 Admin endpoints (80%)

#### 2.1.2 Frontend

- ✅ Login/Register
- ✅ Email verification
- ✅ Dashboard người dùng
- ✅ Admin dashboard
- 🔄 User management page (95%)
- 🔄 KYC verification UI (70%)
- ⏳ Property listing (30%)
- ⏳ Payment integration (0%)

#### 2.1.3 Tính năng

| Tính năng           | Độ ưu tiên | Tiến độ | Ngày hoàn thành dự kiến |
| ------------------- | ---------- | ------- | ----------------------- |
| Xác thực người dùng | Cao        | 100%    | ✅ 15/02/2026           |
| KYC Verification    | Cao        | 75%     | 28/03/2026              |
| Quản lý người dùng  | Cao        | 95%     | 25/03/2026              |
| Đăng tin BĐS        | Cao        | 40%     | 28/03/2026              |
| Admin Dashboard     | Cao        | 80%     | 31/03/2026              |
| Thanh toán (Stripe) | Trung      | 0%      | 10/04/2026              |
| Chat/Messaging      | Trung      | 0%      | 15/04/2026              |
| Notification        | Trung      | 20%     | 05/04/2026              |

---

### Phase 2: Tối ưu & Mở rộng (01/04/2026 - 30/05/2026) - 8 tuần

**Tính năng bổ sung**

| Tính năng           | Mô tả                      | Độ phức tạp |
| ------------------- | -------------------------- | ----------- |
| Payment Gateway     | Thanh toán tiền boa, VNPay | Cao         |
| Commission System   | Tính hoa hồng tự động      | Cao         |
| Advanced Search     | Tìm kiếm nâng cao, filter  | Trung       |
| Favorite Properties | Lưu tin yêu thích          | Thấp        |
| Property Comparison | So sánh BĐS                | Trung       |
| Analytics Dashboard | Thống kê giao dịch         | Cao         |
| Mobile App (V0)     | Phiên bản di động          | Rất cao     |
| SEO Optimization    | Tối ưu công cụ tìm kiếm    | Trung       |

---

### Phase 3: Thương mại hóa (01/06/2026 - 31/07/2026) - 8 tuần

| Hoạt động      | Chi tiết                        | Tài nguyên |
| -------------- | ------------------------------- | ---------- |
| **Marketing**  | Content marketing, Social media | 2 người    |
| **Sales**      | Hỗ trợ khách hàng, onboarding   | 3 người    |
| **Support**    | Ticketing system, live chat     | 2 người    |
| **Operations** | Kiểm duyệt, chất lượng dữ liệu  | 2 người    |
| **Analytics**  | Tracking, reporting             | 1 người    |

---

## III. TÍNH NĂNG CỌN TÍNH

### 3.1 Cho Người dùng (Chủ nhân/Môi giới)

#### Đăng ký & KYC

```
├── Đăng ký tài khoản (Email/Phone)
├── Xác thực email
├── KYC verification
│   ├── Tải CCCD/Hộ chiếu
│   ├── Xác minh thông tin
│   └── Phê duyệt (Admin)
└── Cấu hình hồ sơ
```

#### Quản lý tin đăng

```
├── Đăng tin mới
│   ├── Thông tin cơ bản
│   ├── Upload ảnh/video
│   ├── Định giá
│   └── Chi phí (Miễn phí/VIP/Diamond)
├── Chỉnh sửa tin
├── Xóa tin
├── Quản lý trạng thái
└── Thống kê lượt xem
```

#### Giao dịch & Thanh toán

```
├── Thanh toán tiền boa
├── Nâng cấp gói VIP
├── Rút hoa hồng
├── Lịch sử giao dịch
└── Invoice/Receipt
```

### 3.2 Cho Admin

#### Quản lý người dùng

```
├── Danh sách người dùng tất cả
├── Lọc theo vai trò/trạng thái
├── Quản lý quyền hạn
├── Khoá/mở khóa tài khoản
├── Xem lịch sử hoạt động
└── Gửi thông báo
```

#### Quản lý KYC

```
├── Danh sách yêu cầu KYC
├── Xem chi tiết hồ sơ
├── Phê duyệt/Từ chối
├── Lên biên bản xác minh
└── Thống kê KYC
```

#### Quản lý tin đăng

```
├── Duyệt tin đăng mới
├── Xoá tin vi phạm
├── Quản lý gói VIP
├── Thống kê hoạt động
└── Tìm kiếm/filter
```

#### Quản lý tài chính

```
├── Dòng tiền
├── Hoa hồng theo người dùng
├── Báo cáo doanh thu
├── Quản lý gói VIP
└── Xuất báo cáo
```

---

## IV. KIẾN TRÚC HỆ THỐNG

### 4.1 Frontend Architecture

```
Frontend (Next.js 16)
├── App Router
│   ├── Public pages (Home, News, Properties)
│   ├── Auth pages (Login, Register, KYC)
│   ├── Dashboard (User)
│   └── Admin pages
├── Components
│   ├── Common UI
│   ├── Property cards
│   ├── Forms
│   └── Admin components
├── Features (Feature-based)
│   ├── Auth
│   ├── Property
│   ├── News
│   ├── User
│   └── Payment
├── Hooks (Custom)
└── Services (API calls)
```

### 4.2 Backend Architecture

```
Backend (Node.js/Express)
├── Routes
│   ├── /auth (Register, Login, KYC)
│   ├── /news (Admin, Public)
│   ├── /properties (CRUD, Search)
│   ├── /users (Management)
│   └── /payments (Stripe, VNPay)
├── Controllers (Business logic)
├── Models (Database queries)
├── Middleware
│   ├── Authentication
│   ├── Authorization
│   └── Error handling
├── Services (External APIs)
│   ├── Email service
│   ├── S3 upload
│   ├── PaymentGW
│   └── Analytics
└── Database (Supabase PostgreSQL)
```

### 4.3 Database Schema

```sql
-- Core tables
users (id, email, phone, role, kyc_status, last_login)
properties (id, title, price, area, agent_id, status)
kyc_verifications (id, user_id, status, verified_at)
news (id, title, slug, status, published_at)
transactions (id, user_id, amount, type, status)
packages (id, name, duration, price, features)
```

---

## V. TIMELINE CHI TIẾT

### Tháng 3/2026 - Phase 1 (MVP)

| Tuần         | Công việc             | Trạng thái | Output           |
| ------------ | --------------------- | ---------- | ---------------- |
| W1 (3-9/3)   | Backend: Property API | ✅ 90%     | API endpoints    |
| W1 (3-9/3)   | Frontend: User list   | ✅ 95%     | Users page       |
| W2 (10-16/3) | KYC UI/UX             | 🔄 70%     | KYC form + admin |
| W2 (10-16/3) | Admin dashboard       | 🔄 80%     | Dashboard core   |
| W3 (17-23/3) | Property listing      | 🔄 40%     | Property page    |
| W3 (17-23/3) | Testing & bugs        | 🔄 50%     | Bug reports      |
| W4 (24-30/3) | Deployment prep       | ⏳ 0%      | Staging env      |
| W4 (24-30/3) | Documentation         | ⏳ 20%     | API docs         |

### Tháng 4/2026 - Phase 2 (Optimization)

| Công việc           | Thời gian | Assigned to   |
| ------------------- | --------- | ------------- |
| Payment integration | 10 ngày   | Backend team  |
| Commission system   | 12 ngày   | Backend team  |
| Advanced search     | 8 ngày    | Full stack    |
| Mobile optimization | 10 ngày   | Frontend team |
| Performance tuning  | 5 ngày    | DevOps        |

### Tháng 5/2026 - Phase 3 (Pre-launch)

| Công việc             | Thời gian | Assigned to    |
| --------------------- | --------- | -------------- |
| User testing (Beta)   | 15 ngày   | QA + Support   |
| Marketing preparation | 20 ngày   | Marketing team |
| Law/Compliance review | 10 ngày   | Legal team     |
| Final optimizations   | 5 ngày    | Engineering    |

---

## VI. TÀI NGUYÊN & NHÂN SỰ

### 6.1 Đội ngũ dự án

```
Engineering Team (6 người)
├── Tech Lead: 1 người
├── Backend developers: 2 người
├── Frontend developers: 2 người
└── Full-stack: 1 người

Support Team (5 người)
├── Product Manager: 1 người
├── QA/Tester: 1 người
├── DevOps/Infrastructure: 1 người
├── Customer support: 1 người
└── Data analyst: 1 người

Marketing Team (3 người)
├── Content marketer: 1 người
├── Social media: 1 người
└── SEO specialist: 1 người

Total: 14 người
```

### 6.2 Công nghệ & Chi phí hàng tháng

| Công nghệ               | Chi phí                  | Mục đích         |
| ----------------------- | ------------------------ | ---------------- | --- |
| **Supabase**            | $25/tháng                | Database + Auth  |
| **Vercel**              | $20/tháng                | Frontend hosting |
| **Render**              | $20/tháng                | Backend hosting  |
| **AWS S3**              | $15/tháng                | Image storage    |
| **Stripe**              | 2.9% + $0.30/transaction | Payment          |
| **SendGrid**            | $20/tháng                | Email service    |
| **Auth0**               | $0 (Free tier)           | Authentication   |
| **Cloudflare**          | $20/tháng                | CDN + Security   |
| **Monitoring (Sentry)** | $29/tháng                | Error tracking   |
| **Analytics**           | $10/tháng                | Usage metrics    |
| **Domain**              | $12/năm                  | Website domain   |
| **SSL Certificate**     | Free                     | HTTPS            |
| **Workspace tools**     | $50/tháng                | Slack, Jira, etc |
|                         | **Tổng cộng**            | **~$220/tháng**  |     |

---

## VII. RỦI RO & GIẢI PHÁP KHẮC PHỤC

### Rủi ro Kỹ thuật

| Rủi ro                   | Tác động | Xác suất | Giải pháp                              |
| ------------------------ | -------- | -------- | -------------------------------------- |
| Database performance     | Cao      | Trung    | Caching (Redis), Database optimization |
| Payment integration bugs | Cao      | Thấp     | Thorough testing, Sandbox environment  |
| Security vulnerabilities | Rất cao  | Thấp     | Security audit, OWASP compliance       |
| API rate limiting        | Trung    | Trung    | Rate limiting, Queue system            |
| Data loss                | Rất cao  | Rất thấp | Daily backups, Disaster recovery       |

### Rủi ro Kinh doanh

| Rủi ro                | Tác động | Xác suất | Giải pháp                           |
| --------------------- | -------- | -------- | ----------------------------------- |
| User acquisition slow | Cao      | Trung    | Marketing campaign, Partnerships    |
| Competition           | Trung    | Cao      | Unique features, Better UX          |
| Regulatory changes    | Cao      | Thấp     | Legal consultation, Compliance team |
| Payment fraud         | Trung    | Trung    | Fraud detection, KYC verification   |

---

## VIII. KPI & MỤC TIÊU

### 8.1 Giai đoạn 1 (Tháng 4-6/2026)

| KPI               | Target    | Người chịu trách nhiệm |
| ----------------- | --------- | ---------------------- |
| Tổng users        | 10,000    | Product Manager        |
| Active agents     | 500       | Sales Team             |
| Properties listed | 5,000     | Operations             |
| Revenue (VND)     | 100 triệu | Finance                |
| NPS Score         | > 40      | Customer Success       |
| System uptime     | > 99.5%   | DevOps                 |

### 8.2 Giai đoạn 2 (Tháng 7-9/2026)

| KPI               | Target    | Note             |
| ----------------- | --------- | ---------------- |
| Tổng users        | 50,000    | Growth 5x        |
| Active agents     | 2,500     | Growth 5x        |
| Properties listed | 20,000    | Growth 4x        |
| Revenue (VND)     | 500 triệu | Growth 5x        |
| Churn rate        | < 5%      | Per month        |
| Conversion rate   | > 10%     | Signup to active |

---

## IX. NHỮNG CÔNG VIỆC TRƯỚC KHOÁ

- [ ] Database migration (last_login) - **3 ngày**
- [ ] Payment gateway integration - **10 ngày**
- [ ] Security audit - **7 ngày**
- [ ] Load testing - **5 ngày**
- [ ] Compliance review - **10 ngày**
- [ ] User acceptance testing - **10 ngày**
- [ ] Documentation completion - **5 ngày**

---

## X. PHƯƠNG ÁN CONTINGENCY

### Nếu trễ tiến độ

1. Hạn chế scope tính năng Phase 2
2. Tập trung MVP và bug fixes
3. Tăng từng nhân sự
4. Giảm testing scope (nếu cần)

### Nếu gặp vấn đề kỹ thuật

1. Escalate to Tech Lead
2. Organize quick solution session
3. Adjust timeline if needed
4. Document learnings

### Nếu gặp vấn đề pháp lý

1. Immediate consultation with Legal
2. Adjust features if required
3. Update compliance roadmap
4. Communicate to stakeholders

---

## XI. KẾT LUẬN

Website BĐS **NhàĐấtToànQuốc** sẽ là nền tảng:

- ✅ **Chuyên nghiệp**: Tính năng đầy đủ cho BĐS
- ✅ **An toàn**: KYC, xác thực bảo mật
- ✅ **Dễ dùng**: UX tốt cho tất cả người dùng
- ✅ **Mở rộng được**: Kiến trúc scalable
- ✅ **Lợi nhuận**: Multiple revenue streams

**Dự kiến khoá tháng 5/2026 với MVP hoàn chỉnh.**

---

**Phê duyệt:**

| Chức danh       | Tên | Ký  | Ngày |
| --------------- | --- | --- | ---- |
| Project Manager |     |     |      |
| Tech Lead       |     |     |      |
| Business Lead   |     |     |      |
| Director        |     |     |      |

---

_Tài liệu này được lập vào ngày 10/03/2026 và có hiệu lực 6 tháng._
_Cần cập nhật hàng tháng hoặc khi có thay đổi lớn._
