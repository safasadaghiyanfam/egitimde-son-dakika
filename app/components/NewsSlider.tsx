"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────────────────────
   VERİ YAPISI / TİPLER
   ───────────────────────────────────────────────────────────── */
export interface SlideHaber {
  id: number | string;
  baslik: string;
  gorselUrl: string;
  saat: string;
  link: string;
}

export interface NewsSliderProps {
  haberler?: SlideHaber[];
  autoPlayInterval?: number; // Varsayılan 5000 ms (5 saniye)
}

/* ─────────────────────────────────────────────────────────────
   ÖRNEK 3 HABERLİK DUMMY VERİ (Prop geçilmezse kullanılır)
   ───────────────────────────────────────────────────────────── */
const DUMMY_HABERLER: SlideHaber[] = [
  {
    id: 1,
    baslik: "YÖK Başkanı Özvar: Üniversitelerde yeni dönemde 70 yeni program eğitime başlıyor",
    gorselUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    saat: "15:28",
    link: "https://www.trthaber.com/haber/egitim/yokten-vakif-universitelerine-net-mesaj-yuzde-25-sinirina-uyulacak-954863.html",
  },
  {
    id: 2,
    baslik: "MEB Duyurdu: LGS tercih sonuçları e-Okul sistemi üzerinden erişime açıldı",
    gorselUrl: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=1200&q=80",
    saat: "14:15",
    link: "https://www.aa.com.tr/tr/egitim",
  },
  {
    id: 3,
    baslik: "ÖSYM Sınav Takvimi Güncellendi: YKS ve KPSS ek yerleştirme başvuru tarihleri açıklandı",
    gorselUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80",
    saat: "12:05",
    link: "https://www.osym.gov.tr",
  },
];

/* ─────────────────────────────────────────────────────────────
   MANŞET SLIDER BİLEŞENİ
   ───────────────────────────────────────────────────────────── */
export default function NewsSlider({
  haberler = DUMMY_HABERLER,
  autoPlayInterval = 5000,
}: NewsSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Dokunmatik / Dokunma kaydırma (Swipe) için referanslar
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Manuel geçiş sonrası otomatik geçişi kısa süreliğine duraklatma timer'ı
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);

  const totalSlides = haberler.length;

  // Sonraki habere geçiş
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  // Önceki habere geçiş
  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Belirli bir indekse geçiş
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Kullanıcı manuel etkileşimde bulununca otomatik geçişi geçici olarak 5 sn dondur
  const handleUserInteraction = () => {
    setIsManuallyPaused(true);
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => {
      setIsManuallyPaused(false);
    }, 5000);
  };

  // Ok butonlarına tıklama (Yönlendirmeyi engeller, slide değiştirir)
  const handlePrevClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleUserInteraction();
    prevSlide();
  };

  const handleNextClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleUserInteraction();
    nextSlide();
  };

  // Numaralı sayfalama butonuna tıklama (Yönlendirmeyi engeller, slide değiştirir)
  const handleDotClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    handleUserInteraction();
    goToSlide(index);
  };

  // Otomatik geçiş (5 saniyede bir)
  useEffect(() => {
    if (totalSlides <= 1 || isHovered || isManuallyPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [totalSlides, isHovered, isManuallyPaused, autoPlayInterval, nextSlide]);

  // Klavyeyle (sol / sağ ok tuşları) gezinme
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      handleUserInteraction();
      prevSlide();
    } else if (e.key === "ArrowRight") {
      handleUserInteraction();
      nextSlide();
    }
  };

  // Mobilde Dokunma (Touch / Swipe) olayları
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isSwipeLeft = distance > 50;
    const isSwipeRight = distance < -50;

    if (isSwipeLeft) {
      handleUserInteraction();
      nextSlide();
    } else if (isSwipeRight) {
      handleUserInteraction();
      prevSlide();
    }
  };

  if (!haberler || haberler.length === 0) return null;

  const currentHaber = haberler[currentIndex];

  return (
    <>
      <style jsx>{`
        .news-slider-container {
          position: relative;
          width: 100%;
          height: 460px;
          overflow: hidden;
          background-color: #111;
          border-radius: 8px;
          user-select: none;
          outline: none;
        }

        /* Responsive yükseklik */
        @media (max-width: 768px) {
          .news-slider-container {
            height: 280px;
          }
        }

        /* Tüm alanı kaplayan tıklanabilir ana kart linki */
        .slider-main-link {
          display: block;
          width: 100%;
          height: 100%;
          text-decoration: none;
          color: inherit;
          position: relative;
          cursor: pointer;
        }

        /* Arka plan görseli */
        .slider-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          transition: opacity 400ms ease-in-out, transform 600ms ease-out;
        }

        .slider-main-link:hover .slider-image {
          transform: scale(1.02);
        }

        /* Alt taraftaki koyu gradient karartma overlay */
        .slider-gradient-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.15) 0%,
            rgba(0, 0, 0, 0.3) 40%,
            rgba(0, 0, 0, 0.85) 80%,
            rgba(0, 0, 0, 0.95) 100%
          );
          pointer-events: none;
        }

        /* Sol üst saat rozeti */
        .slider-time-badge {
          position: absolute;
          top: 20px;
          left: 24px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(4px);
          color: #ffffff;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.03em;
          border: 1px solid rgba(255, 255, 255, 0.15);
          z-index: 10;
        }

        .clock-icon {
          color: #ff6b00; /* Turuncu ikon */
          width: 14px;
          height: 14px;
        }

        /* Alt başlık metin alanı */
        .slider-content-bottom {
          position: absolute;
          bottom: 54px;
          left: 24px;
          right: 24px;
          z-index: 10;
          max-width: 1100px;
        }

        .slider-title {
          color: #ffffff;
          font-family: var(--font-serif, "Libre Caslon Display", Georgia, serif);
          font-size: 28px;
          font-weight: 700;
          line-height: 1.25;
          margin: 0;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          transition: opacity 400ms ease-in-out;
        }

        @media (max-width: 768px) {
          .slider-time-badge {
            top: 14px;
            left: 16px;
            font-size: 11px;
            padding: 4px 10px;
          }
          .slider-content-bottom {
            bottom: 44px;
            left: 16px;
            right: 16px;
          }
          .slider-title {
            font-size: 18px;
            line-height: 1.3;
          }
        }

        /* Sol / Sağ dairesel oklar */
        .nav-arrow-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(40, 40, 40, 0.65);
          backdrop-filter: blur(4px);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 20;
          transition: background-color 200ms ease, transform 150ms ease;
        }

        .nav-arrow-btn:hover {
          background: rgba(10, 10, 10, 0.9);
          transform: translateY(-50%) scale(1.08);
          border-color: #ff6b00;
        }

        .nav-arrow-btn--prev {
          left: 20px;
        }

        .nav-arrow-btn--next {
          right: 20px;
        }

        /* Mobilde okları gizle */
        @media (max-width: 768px) {
          .nav-arrow-btn {
            display: none !important;
          }
        }

        /* En alttaki numaralı sayfalama (1, 2, 3...) */
        .pagination-container {
          position: absolute;
          bottom: 14px;
          left: 24px;
          right: 24px;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          z-index: 20;
        }

        @media (max-width: 768px) {
          .pagination-container {
            left: 12px;
            right: 12px;
            bottom: 10px;
            gap: 5px;
          }
        }

        .pagination-number-btn {
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(2px);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: rgba(255, 255, 255, 0.85);
          font-size: 17px;
          font-weight: 700;
          font-family: inherit;
          min-width: 34px;
          height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 2px; /* Kare tasarım */
          cursor: pointer;
          position: relative;
          transition: all 180ms ease-in-out;
          padding: 0 4px;
        }

        .pagination-number-btn:hover {
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.7);
          background: rgba(0, 0, 0, 0.85);
        }

        /* Seçilen numara: Kırmızı Kare Çerçeveli */
        .pagination-number-btn.active {
          color: #ffffff;
          background: rgba(204, 0, 0, 0.9);
          border: 2px solid #cc0000; /* Kırmızı kare çerçeve */
          font-weight: 800;
          box-shadow: 0 0 10px rgba(204, 0, 0, 0.6);
        }

        @media (max-width: 768px) {
          .pagination-number-btn {
            min-width: 26px;
            height: 26px;
            font-size: 13px;
          }
        }
      `}</style>

      <div
        className="news-slider-container"
        tabIndex={0}
        role="region"
        aria-label="Son dakika haber manşetleri"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* TIKLANABİLİR ANA ALAN (Site içi haber detayına yönlendirir) */}
        <a
          href={currentHaber.link}
          className="slider-main-link"
          aria-label={currentHaber.baslik}
        >
          {/* Arka plan görseli */}
          <img
            key={currentHaber.id}
            src={currentHaber.gorselUrl}
            alt={currentHaber.baslik}
            className="slider-image"
          />

          {/* Koyu gradient overlay */}
          <div className="slider-gradient-overlay" />

          {/* Sol üst saat rozeti */}
          <div className="slider-time-badge">
            <svg
              className="clock-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{currentHaber.saat}</span>
          </div>

          {/* Alt büyük başlık metni */}
          <div className="slider-content-bottom">
            <h2 className="slider-title">{currentHaber.baslik}</h2>
          </div>
        </a>

        {/* SOL OK BUTONU (e.stopPropagation ile linke gitmez) */}
        {totalSlides > 1 && (
          <button
            type="button"
            className="nav-arrow-btn nav-arrow-btn--prev"
            onClick={handlePrevClick}
            aria-label="Önceki haber"
          >
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        {/* SAĞ OK BUTONU (e.stopPropagation ile linke gitmez) */}
        {totalSlides > 1 && (
          <button
            type="button"
            className="nav-arrow-btn nav-arrow-btn--next"
            onClick={handleNextClick}
            aria-label="Sonraki haber"
          >
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}

        {/* EN ALTTA NUMARALI SAYFALAMA (1, 2, 3...) */}
        {totalSlides > 1 && (
          <div className="pagination-container" role="tablist">
            {haberler.map((_, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Haber ${idx + 1}`}
                  className={`pagination-number-btn ${isActive ? "active" : ""}`}
                  onClick={(e) => handleDotClick(e, idx)}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
