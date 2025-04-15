import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

const Clock = () => {
  const hourRef = useRef(null);
  const minuteRef = useRef(null);
  const secondRef = useRef(null);

  useEffect(() => {
    // 秒針: 6度/秒（60秒で360度）
    gsap.to(secondRef.current, {
      rotation: "+=360",
      duration: 60,
      ease: "none",
      repeat: -1,
      transformOrigin: "center bottom"
    });

    // 分針: 6度/分（360秒で360度）
    gsap.to(minuteRef.current, {
      rotation: "+=360",
      duration: 360,
      ease: "none",
      repeat: -1,
      transformOrigin: "center bottom"
    });

    // 時針: 0.5度/分（4320秒で360度 = 12時間）
    gsap.to(hourRef.current, {
      rotation: "+=360",
      duration: 4320,
      ease: "none",
      repeat: -1,
      transformOrigin: "center bottom"
    });
  }, []);

  return (
    <div id="clock-container">
      <div className="clock">
        <div className="hand hour" ref={hourRef} />
        <div className="hand minute" ref={minuteRef} />
        <div className="hand second" ref={secondRef} />
      </div>
    </div>
  );
};

export default Clock;
