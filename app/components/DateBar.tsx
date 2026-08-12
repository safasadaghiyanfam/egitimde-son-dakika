"use client";

import { useEffect, useState } from "react";

export default function DateBar() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(new Date());
  const [location, setLocation] = useState("");

  useEffect(() => {
    setMounted(true);
    
    // Saat için interval
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    // Lokasyon belirleme (Önce Timezone'dan tahmin et)
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz && tz.includes("/")) {
        const cityStr = tz.split("/").pop()?.replace(/_/g, " ");
        if (cityStr) setLocation(cityStr);
      }
    } catch (e) {}

    // IP üzerinden daha kesin lokasyon bul (adblocker/cors engellemezse)
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        if (data.city) {
          setLocation(data.city);
        }
      })
      .catch(() => {});

    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="datebar">
        <div className="wrap datebar__inner">
          <span className="datebar__date">...</span>
          <div className="datebar__right">
            <span>Konum Bulunuyor...</span>
            <span className="datebar__live">
              <span className="live-dot" aria-hidden="true" />
              Canlı
            </span>
            <span className="datebar__clock">--:--:--</span>
          </div>
        </div>
      </div>
    );
  }

  const dateLabel = now.toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="datebar">
      <div className="wrap datebar__inner">
        <span className="datebar__date">
          {dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)}
        </span>
        <div className="datebar__right">
          <span>{location || "Bilinmiyor"}</span>
          <span className="datebar__live">
            <span className="live-dot" aria-hidden="true" />
            Canlı
          </span>
          <span className="datebar__clock">
            {now.toLocaleTimeString("tr-TR", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
