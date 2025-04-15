import React, { useEffect, useRef } from "react";
import p5 from "p5";

export default function Pop({ audioFile }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const sketch = (p) => {
      let song;
      p.preload = () => {
        if (audioFile) {
          song = p.loadSound(URL.createObjectURL(audioFile));
        }
      };
      
      p.setup = () => {
        p.createCanvas(800, 600).parent(canvasRef.current);
      };

      p.draw = () => {
        p.background(0, 255, 0);
        p.fill(0, 0, 255);
        p.rect(p.mouseX, p.mouseY, 50, 50);
      };
    };

    const p5Instance = new p5(sketch);
    return () => p5Instance.remove();
  }, [audioFile]);

  return <div ref={canvasRef}></div>;
}
