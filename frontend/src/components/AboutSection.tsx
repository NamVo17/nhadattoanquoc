"use client";

import { useEffect, useRef, useState } from "react";

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
}

function AnimatedCounter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView(0.3);

  useEffect(() => {
    if (!inView) return;

    let start = 0;
    const end = parseInt(target);
    const step = Math.ceil(end / (1600 / 16));

    const timer = setInterval(() => {
      start += step;

      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export default function AboutSection() {
  const [colLeft, leftInView] = useInView(0.1);
  const [colRight, rightInView] = useInView(0.1);

  return (
    <>
      <style>{`

        @keyframes fadeSlideLeft {
          from {opacity:0; transform:translateX(-50px);}
          to {opacity:1; transform:translateX(0);}
        }

        @keyframes fadeSlideRight {
          from {opacity:0; transform:translateX(50px);}
          to {opacity:1; transform:translateX(0);}
        }

        @keyframes fadeSlideUp {
          from {opacity:0; transform:translateY(40px);}
          to {opacity:1; transform:translateY(0);}
        }

        @keyframes float0 {
          0%,100% { transform: rotate(-3deg) translateY(0px); }
          50% { transform: rotate(-3deg) translateY(-10px); }
        }

        @keyframes float1 {
          0%,100% { transform: rotate(2deg) translateY(0px); }
          50% { transform: rotate(2deg) translateY(-12px); }
        }

        @keyframes float2 {
          0%,100% { transform: rotate(6deg) translateY(0px); }
          50% { transform: rotate(6deg) translateY(-9px); }
        }

        @keyframes float3 {
          0%,100% { transform: rotate(-6deg) translateY(0px); }
          50% { transform: rotate(-6deg) translateY(-11px); }
        }

        .img-0 { transform: rotate(-3deg); }
        .img-1 { transform: rotate(2deg); }
        .img-2 { transform: rotate(6deg); }
        .img-3 { transform: rotate(-6deg); }

        .img-0.floating { animation: float0 4s ease-in-out infinite; }
        .img-1.floating { animation: float1 4.5s ease-in-out infinite; }
        .img-2.floating { animation: float2 3.8s ease-in-out infinite; }
        .img-3.floating { animation: float3 4.2s ease-in-out infinite; }

        .img-card{
          transition: all .35s ease;
        }

        .img-card:hover{
          transform: scale(1.05);
          box-shadow:0 30px 60px rgba(0,0,0,.25);
          z-index:50 !important;
        }

        .stat-block{
          transition: transform .3s ease;
        }

        .stat-block:hover{
          transform: translateY(-5px);
        }

      `}</style>

      <section
        className="pt-0 pb-20 px-6 lg:px-16 overflow-hidden"
        id="about-us"
      >
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

          {/* IMAGE COLLAGE */}

          <div
            ref={colLeft}
            className="relative py-4 flex justify-center order-2 lg:order-1"
            style={{
              animation: leftInView ? "fadeSlideLeft .7s ease both" : "none",
              opacity: leftInView ? 1 : 0
            }}
          >
            <div className="relative w-full max-w-xl h-[420px] sm:h-[520px]">

              {/* glow background */}
              <div className="absolute -z-10 w-[320px] h-[320px] bg-blue-400/20 blur-[120px] rounded-full top-20 left-20"></div>

              {/* image 1 */}
              <div className={`img-card img-0 ${leftInView ? "floating":""} absolute w-[65%] h-52 sm:h-64 top-10 left-0 overflow-hidden rounded-2xl border-4 border-white shadow-xl`}>
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c"
                  className="w-full h-full object-cover"
                  alt="office"
                />
              </div>

              {/* image 2 */}
              <div className={`img-card img-1 ${leftInView ? "floating":""} absolute w-[50%] h-60 sm:h-80 top-0 right-6 overflow-hidden rounded-2xl border-4 border-white shadow-xl z-10`}>
                <img
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab"
                  className="w-full h-full object-cover"
                  alt="building"
                />
              </div>

              {/* image 3 */}
              <div className={`img-card img-2 ${leftInView ? "floating":""} absolute w-[60%] h-44 sm:h-56 bottom-6 left-12 overflow-hidden rounded-2xl border-4 border-white shadow-xl z-20`}>
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
                  className="w-full h-full object-cover"
                  alt="house"
                />
              </div>

              {/* image 4 */}
              <div className={`img-card img-3 ${leftInView ? "floating":""} absolute w-[40%] h-36 sm:h-44 bottom-16 right-0 overflow-hidden rounded-2xl border-4 border-white shadow-xl z-30`}>
                <img
                  src="https://images.unsplash.com/photo-1556912173-3bb406ef7e77"
                  className="w-full h-full object-cover"
                  alt="kitchen"
                />
              </div>

            </div>
          </div>


          {/* TEXT CONTENT */}

          <div
            ref={colRight}
            className="space-y-6 order-1 lg:order-2"
            style={{
              animation: rightInView ? "fadeSlideRight .7s ease both" : "none",
              opacity: rightInView ? 1 : 0
            }}
          >

            <div
              className="flex items-center space-x-2 text-blue-600 font-semibold uppercase text-sm"
              style={{
                animation: rightInView ? "fadeSlideUp .6s ease .2s both" : "none"
              }}
            >
              <span className="w-8 h-[2px] bg-blue-600"></span>
              <span>Về chúng tôi</span>
            </div>

            <h2
              className="text-4xl lg:text-5xl font-bold text-slate-900"
              style={{
                animation: rightInView ? "fadeSlideUp .6s ease .3s both" : "none"
              }}
            >
              NhàĐấtToànQuốc
            </h2>

            <p
              className="text-slate-600 leading-relaxed"
              style={{
                animation: rightInView ? "fadeSlideUp .6s ease .4s both" : "none"
              }}
            >
              NhàĐấtToànQuốc là nền tảng kết nối môi giới bất động sản chuyên nghiệp
              tại Việt Nam. Chúng tôi cung cấp hệ thống quản lý dự án, dữ liệu thị
              trường và các công cụ giúp môi giới tối ưu hiệu quả bán hàng.
            </p>

            <p
              className="text-slate-600 leading-relaxed"
              style={{
                animation: rightInView ? "fadeSlideUp .6s ease .5s both" : "none"
              }}
            >
              Bằng việc ứng dụng công nghệ hiện đại, chúng tôi giúp môi giới bất
              động sản nâng cao hiệu suất làm việc, mở rộng mạng lưới và gia tăng
              cơ hội giao dịch thành công.
            </p>

            <div
              className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200"
              style={{
                animation: rightInView ? "fadeSlideUp .6s ease .6s both" : "none"
              }}
            >
              <div className="stat-block text-center">
                <div className="text-3xl font-bold text-blue-600">
                  <AnimatedCounter target="5000" suffix="+" />
                </div>
                <div className="text-sm text-slate-500">Đối tác tin dùng</div>
              </div>

              <div className="stat-block text-center">
                <div className="text-3xl font-bold text-blue-600">
                  <AnimatedCounter target="10000" suffix="+" />
                </div>
                <div className="text-sm text-slate-500">Dự án thành công</div>
              </div>
            </div>

          </div>

        </div>
      </section>
    </>
  );
}