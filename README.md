<div align="center">

# 🏠 NhaDatToanQuoc

**Nền tảng bất động sản toàn quốc — Tìm kiếm, đăng tin & giao dịch bất động sản thông minh**

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=nextdotjs)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=nodedotjs)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express)](https://expressjs.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

---

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng](#-tính-năng)
- [Tech Stack](#-tech-stack)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt & Chạy dự án](#-cài-đặt--chạy-dự-án)
- [Biến môi trường](#-biến-môi-trường)
- [API Reference](#-api-reference)
- [Đóng góp](#-đóng-góp)

---

## 🌟 Giới thiệu

**NhaDatToanQuoc** là nền tảng bất động sản toàn quốc được xây dựng với kiến trúc hiện đại (Next.js + Node.js/Express). Cho phép người dùng tìm kiếm, đăng tin, quản lý giao dịch bất động sản và kết nối với môi giới chuyên nghiệp trên toàn quốc.
 Dự án Fullstack của công ty Thiên Hà Group. Được thực hiện khi 

---

## ✨ Tính năng

### 🔐 Xác thực & Bảo mật
- Đăng ký / Đăng nhập với JWT (Access Token + Refresh Token)
- Xác thực email 2 bước (OTP)
- Xác thực 2 yếu tố (2FA) qua ứng dụng Authenticator (TOTP/HOTP)
- Forgot Password / Reset Password qua email
- Bảo mật HTTP: Helmet, CORS, XSS-Clean, Rate Limiting

### 🏘️ Bất động sản
- Đăng / chỉnh sửa / xóa tin bất động sản
- Tìm kiếm nâng cao: vị trí, loại hình, giá, diện tích
- Upload ảnh & quản lý media
- Phân trang, SEO-friendly URL

### 💳 Thanh toán
- Tích hợp **VNPay** (sandbox & production)
- Tích hợp **MoMo** (sandbox & production)
- Lịch sử giao dịch & trạng thái thanh toán realtime

### 🤝 Môi giới & Hợp tác
- Hệ thống KYC (xác minh danh tính) cho môi giới
- Quản lý hợp đồng hợp tác
- Hệ thống tin nhắn nội bộ (messaging)
- Thông báo realtime (Notifications)

### 📰 Tin tức
- Quản lý bài viết, tin tức thị trường bất động sản
- Phân loại theo chủ đề, tag

### 👤 Quản trị
- Admin Dashboard: quản lý người dùng, bài đăng, KYC, thanh toán
- Phân quyền: `user` / `agent` / `admin`

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16, React 19, TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **State Management** | Redux Toolkit, React Context |
| **HTTP Client** | Axios |
| **Icons** | Lucide React, React Icons |
| **Notifications (UI)** | Sonner |
| **Backend** | Node.js ≥18, Express 4 |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | JWT (jsonwebtoken), bcrypt |
| **2FA** | Speakeasy (TOTP/HOTP), QRCode |
| **Email** | Nodemailer (SMTP) |
| **Payment** | VNPay SDK, MoMo SDK |
| **File Upload** | Multer |
| **Logging** | Winston, Morgan |
| **Security** | Helmet, CORS, express-rate-limit, xss-clean |

---

## 🏗 Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT BROWSER                   │
└───────────────────────┬─────────────────────────────┘
                        │ HTTPS
┌───────────────────────▼─────────────────────────────┐
│           FRONTEND  (Next.js — port 3000)           │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐ │
│  │  Pages   │  │Components│  │ Redux / Context    │ │
│  └──────────┘  └──────────┘  └────────────────────┘ │
│  ┌──────────────────────────────────────────────┐   │
│  │           Axios HTTP Client (services/)      │   │
│  └──────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────┘
                        │ REST API  /api/v1
┌───────────────────────▼─────────────────────────────┐
│           BACKEND  (Express — port 5000)            │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐ │
│  │  Routes  │──│Controllers│──│    Services        │ │
│  └──────────┘  └──────────┘  └────────────────────┘ │
│  ┌──────────┐  ┌───────────────────────────────┐    │
│  │Middleware│  │  Models (Supabase queries)    │    │
│  └──────────┘  └───────────────────────────────┘    │
└───────────────────────┬─────────────────────────────┘
                        │ Supabase Client
┌───────────────────────▼─────────────────────────────┐
│            SUPABASE  (PostgreSQL + Storage)          │
└─────────────────────────────────────────────────────┘
         │                           │
┌────────▼───────┐         ┌─────────▼─────────┐
│  VNPay Gateway │         │   MoMo  Gateway   │
└────────────────┘         └───────────────────┘
```

---

## 📁 Cấu trúc dự án

```
batdongsan/
├── backend/                    # Node.js / Express API server
│   ├── config/                 # Cấu hình app, DB, env
│   ├── controllers/            # Request handlers
│   ├── middleware/             # Auth, error, validation middleware
│   ├── models/                 # Supabase data access layer
│   │   ├── user.model.js
│   │   ├── property.model.js
│   │   ├── payment.model.js
│   │   ├── news.model.js
│   │   ├── kyc.model.js
│   │   ├── collaboration.model.js
│   │   └── notification.model.js
│   ├── routes/                 # API route definitions
│   │   ├── auth.routes.js
│   │   ├── property.routes.js
│   │   ├── payment.routes.js
│   │   ├── news.routes.js
│   │   ├── kyc.routes.js
│   │   ├── collaboration.routes.js
│   │   └── notification.routes.js
│   ├── services/               # Business logic layer
│   ├── utils/                  # Helpers, logger, mailer
│   ├── views/                  # Email templates
│   ├── scripts/                # Seed / migration scripts
│   ├── .env.example            # Mẫu biến môi trường
│   ├── app.js                  # Express app setup
│   └── server.js               # Entry point
│
└── frontend/                   # Next.js App Router
    └── src/
        ├── app/                # Pages (App Router)
        │   ├── (home)/         # Trang chủ
        │   ├── properties/     # Danh sách & chi tiết BĐS
        │   ├── post/           # Đăng tin mới
        │   ├── news/           # Tin tức
        │   ├── payment/        # Thanh toán
        │   ├── dashboard/      # Dashboard người dùng
        │   ├── admin/          # Quản trị hệ thống
        │   ├── login/          # Đăng nhập
        │   ├── register/       # Đăng ký
        │   ├── verify-email/   # Xác thực email
        │   ├── agents/         # Danh sách môi giới
        │   └── projects/       # Dự án bất động sản
        ├── components/         # Shared UI components
        ├── features/           # Feature-based modules
        │   ├── auth/
        │   ├── property/
        │   ├── collaboration/
        │   ├── message/
        │   ├── news/
        │   └── user/
        ├── hooks/              # Custom React hooks
        ├── services/           # API service calls (Axios)
        ├── store/              # Redux store
        ├── context/            # React Context providers
        ├── types/              # TypeScript type definitions
        ├── utils/              # Utility functions
        └── lib/                # Third-party integrations
```

---

## 💻 Yêu cầu hệ thống

| Công cụ | Phiên bản tối thiểu |
|---|---|
| Node.js | ≥ 18.0.0 |
| npm | ≥ 9.0.0 |
| Git | ≥ 2.x |
| Supabase | Tài khoản (free tier khả dụng) |

---

## 🚀 Cài đặt & Chạy dự án

### 1. Clone repository

```bash
git clone https://github.com/NamVo17/nhadattoanquoc.git
cd nhadattoanquoc
```

### 2. Cài đặt Backend

```bash
cd backend
npm install
cp .env.example .env
# Chỉnh sửa file .env với thông tin thực tế của bạn
npm run dev
```

> Backend khởi động tại `http://localhost:5000`

### 3. Cài đặt Frontend

```bash
cd ../frontend
npm install
# Tạo file .env.local và điền biến môi trường
npm run dev
```

> Frontend khởi động tại `http://localhost:3000`

### 4. Tạo JWT Secret Keys

```bash
cd backend
node generate-secrets.js
# Copy output vào file .env
```

---

## 🔧 Biến môi trường

### Backend — `backend/.env`

```env
# Server
NODE_ENV=development
PORT=5000
API_PREFIX=/api/v1
API_URL=http://localhost:5000

# Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT
JWT_ACCESS_SECRET=min-64-chars-random-string
JWT_REFRESH_SECRET=min-64-chars-random-string
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM="NhaDatToanQuoc <no-reply@nhadattoanquoc.vn>"

# Client
CLIENT_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# VNPay (Sandbox)
VNPAY_SANDBOX=true
VNPAY_TMN_CODE=your-tmn-code
VNPAY_HASH_SECRET=your-hash-secret
VNPAY_RETURN_URL=http://localhost:5000/api/v1/payments/vnpay/return
VNPAY_IPN_URL=http://localhost:5000/api/v1/payments/vnpay/ipn

# MoMo (Sandbox)
MOMO_SANDBOX=true
MOMO_PARTNER_CODE=your-partner-code
MOMO_ACCESS_KEY=your-access-key
MOMO_SECRET_KEY=your-secret-key
MOMO_REDIRECT_URL=http://localhost:5000/api/v1/payments/momo/return
MOMO_IPN_URL=http://localhost:5000/api/v1/payments/momo/ipn
```

### Frontend — `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

---

## 📡 API Reference

> Base URL: `http://localhost:5000/api/v1`

### Authentication

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `POST` | `/auth/register` | Đăng ký tài khoản | ✅ |
| `POST` | `/auth/login` | Đăng nhập | ✅ |
| `POST` | `/auth/verify-email` | Xác thực email bằng OTP | ✅ |
| `POST` | `/auth/refresh` | Làm mới Access Token | ✅ |
| `POST` | `/auth/logout` | Đăng xuất | ✅ |
| `POST` | `/auth/forgot-password` | Yêu cầu reset mật khẩu | ✅ |
| `POST` | `/auth/reset-password` | Đặt lại mật khẩu | ✅ |
| `POST` | `/auth/verify-2fa` | Xác thực 2FA | ✅ |
| `GET` | `/auth/me` | Lấy thông tin user hiện tại | ✅ |

### Properties (Bất động sản)

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| `GET` | `/properties` | Danh sách tin bất động sản | ✅ |
| `GET` | `/properties/:id` | Chi tiết tin bất động sản | ✅ |
| `POST` | `/properties` | Đăng tin mới | ✅ |
| `PUT` | `/properties/:id` | Cập nhật tin | ✅ |
| `DELETE` | `/properties/:id` | Xóa tin | ✅ |

### Payments (Thanh toán)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `POST` | `/payments/vnpay/create` | Tạo giao dịch VNPay |
| `GET` | `/payments/vnpay/return` | Callback VNPay return |
| `POST` | `/payments/vnpay/ipn` | Webhook VNPay IPN |
| `POST` | `/payments/momo/create` | Tạo giao dịch MoMo |
| `POST` | `/payments/momo/ipn` | Webhook MoMo IPN |

### Health Check

```http
GET /api/v1/health
```

```json
{
  "success": true,
  "status": "ok",
  "timestamp": "2026-04-02T00:00:00.000Z"
}
```

---

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/ten-tinh-nang`
3. Commit changes: `git commit -m 'feat: thêm tính năng X'`
4. Push branch: `git push origin feature/ten-tinh-nang`
5. Mở Pull Request

> Tuân thủ [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) khi viết commit message.

---

<div align="center">

Made with ❤️ by **NamVo17**

</div>
