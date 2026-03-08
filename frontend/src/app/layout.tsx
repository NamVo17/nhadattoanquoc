import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope",
});

const siteUrl = "https://NhaDatToanQuoc.vn";

export const metadata: Metadata = {
  // ── Core ──
  title: {
    default: "NhàĐấtToànQuốc  – Sàn Giao Dịch Bất Động Sản Cộng Tác",
    template: "%s | NhàĐấtToànQuốc ",
  },
  description:
    "Nền tảng kết nối môi giới bất động sản chuyên nghiệp số 1 Việt Nam. Minh bạch hoa hồng, hỗ trợ tận tâm. Hơn 1,240 tin đăng – 8,500 môi giới kết nối.",
  keywords: [
    "bất động sản",
    "sàn giao dịch bất động sản",
    "môi giới bất động sản",
    "cộng tác viên bất động sản",
    "hoa hồng bất động sản",
    "mua bán nhà đất",
    "NhàĐấtToànQuốc",
    "chung cư",
    "biệt thự",
    "nhà phố",
  ],
  authors: [{ name: "NhàĐấtToànQuốc ", url: siteUrl }],
  creator: "NhàĐấtToànQuốc ",
  publisher: "NhàĐấtToànQuốc ",
  metadataBase: new URL(siteUrl),

  // ── Open Graph (Facebook, Zalo…) ──
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: siteUrl,
    siteName: "NhàĐấtToànQuốc ",
    title: "NhàĐấtToànQuốc  – Sàn Giao Dịch Bất Động Sản Cộng Tác",
    description:
      "Kết nối môi giới – Chốt deal nhanh chóng. Minh bạch hoa hồng, hỗ trợ tận tâm. Hơn 8,500 môi giới chuyên nghiệp.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NhàĐấtToànQuốc  – Sàn Giao Dịch Bất Động Sản",
      },
    ],
  },

  // ── Twitter / X ──
  twitter: {
    card: "summary_large_image",
    title: "NhàĐấtToànQuốc  – Sàn Giao Dịch Bất Động Sản Cộng Tác",
    description:
      "Kết nối môi giới – Chốt deal nhanh chóng. Minh bạch hoa hồng, hỗ trợ tận tâm.",
    images: ["/og-image.png"],
    creator: "@nhadattoanquoc",
  },

  // ── Robots ──
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ── Canonical ──
  alternates: {
    canonical: siteUrl,
    languages: {
      "vi-VN": siteUrl,
    },
  },

  // ── App / PWA ──
  applicationName: "NhàĐấtToànQuốc ",
  category: "real estate",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
        {/* Structured Data – Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "NhàĐấtToànQuốc ",
              url: siteUrl,
              logo: `${siteUrl}/icon.svg`,
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "1900-8888",
                contactType: "customer service",
                availableLanguage: "Vietnamese",
              },
              sameAs: [],
            }),
          }}
        />
        {/* Structured Data – RealEstateAgent */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RealEstateAgent",
              name: "NhàĐấtToànQuốc ",
              description:
                "Nền tảng kết nối môi giới bất động sản chuyên nghiệp số 1 Việt Nam.",
              url: siteUrl,
              telephone: "1900-8888",
              email: "support@vocongnam172.vn",
              areaServed: "Vietnam",
              priceRange: "$$",
            }),
          }}
        />
      </head>
      <body
        className={`${manrope.variable} antialiased`}
        style={{ fontFamily: "var(--font-manrope), Manrope, sans-serif" }}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
