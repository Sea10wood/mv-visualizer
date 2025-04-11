import React, { useEffect, useRef, useState } from "react";

export default function App() {
  const canvasRef = useRef(null);
  const p5InstanceRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const songRef = useRef(null);
  const [rotation, setRotation] = useState(0);

  const createP5Instance = () => {
    return new window.p5((p) => {
      let song;
      let fft;
      let beatDetector;
      let fireworks = [];
      let baseSize = 100;
      let currentSize = baseSize;
      let lastBeatTime = 0;

      class Particle {
        constructor(x, y, angle, speed, color) {
          this.pos = p.createVector(x, y);
          this.vel = p5.Vector.fromAngle(angle).mult(speed);
          this.acc = p.createVector(0, 0);
          this.lifespan = 255;
          this.color = color;
        }

        update() {
          this.vel.mult(0.95);
          this.vel.add(this.acc);
          this.pos.add(this.vel);
          this.acc.mult(0);
          this.lifespan -= 4;
        }

        show() {
          p.stroke(this.color, 100, 100, this.lifespan);
          p.strokeWeight(2);
          p.point(this.pos.x, this.pos.y);
        }

        isDead() {
          return this.lifespan <= 0;
        }
      }

      class Firework {
        constructor(x, y, color) {
          this.particles = [];
          const type = Math.floor(p.random(3));
          const count = 50;
          for (let i = 0; i < count; i++) {
            const angle = p.random(p.TWO_PI);
            const speed = type === 0
              ? p.random(1, 4)
              : type === 1
              ? p.random(3, 6)
              : p.random(2, 5);
            const particleColor = type === 2 ? (i % 2 === 0 ? (color + 60) % 360 : color) : color;
            this.particles.push(new Particle(x, y, angle, speed, particleColor));
          }
        }

        update() {
          for (const p of this.particles) {
            p.update();
          }
          this.particles = this.particles.filter((p) => !p.isDead());
        }

        show() {
          for (const p of this.particles) {
            p.show();
          }
        }

        isDone() {
          return this.particles.length === 0;
        }
      }

      class BeatDetect {
        constructor(mode = "kick", freq2) {
          this.freq1 = mode === "snare" ? 2000 : mode === "male" ? 200 : 20;
          this.freq2 = freq2 || (mode === "snare" ? 6000 : 80);
          this.time = 0;
          this.threshold = 0;
          this.minThreshold = 0;
          this.decayRate = 0.01;
          this.minThresholdRate = 0.8;
          this.holdTime = 45;
          this.marginThresholdTime = 10;
          this.marginThreshold = 0.06;
        }

        update(fft) {
          const e = fft.getEnergy(this.freq1, this.freq2);
          const level = e / 255.0 || 0.0;
          let isBeat = false;

          if (level > this.threshold && level > this.minThreshold) {
            this.threshold = level * 1.05;
            this.minThreshold = Math.max(this.minThreshold, level * this.minThresholdRate);
            if (this.time > this.marginThresholdTime) {
              isBeat = true;
            }
            this.time = 0;
          } else {
            if (this.time === this.marginThresholdTime) {
              this.threshold -= this.marginThreshold;
            }
            this.time += 1;
            if (this.time > this.holdTime) {
              this.threshold -= this.decayRate;
            }
          }

          return { threshold: this.threshold, level, isBeat };
        }
      }

      p.preload = () => {
        song = p.loadSound("/audio.mp3", () => console.log("Sound loaded successfully"), (err) => console.error("Error loading sound:", err));
      };

      p.setup = () => {
        p.createCanvas(800, 600).parent(canvasRef.current);
        fft = new p5.FFT(0.9, 1024);
        beatDetector = new BeatDetect("kick");
        p.colorMode(p.HSB, 360, 100, 100, 255);
        songRef.current = song;
      };

      p.draw = () => {
        p.background(0);
        p.noFill();
        p.stroke(255);
        p.strokeWeight(2);
        p.rect(1, 1, p.width - 2, p.height - 2);

        const spectrum = fft.analyze();
        const beat = beatDetector.update(fft);
        const now = p.millis();
        const binCount = 1024;
        const spacing = (p.width / binCount) * 1.5;

        for (let i = 0; i < binCount; i++) {
          const x = i * spacing;
          const amp = spectrum[i] || 0;
          const h = p.map(amp, 0, 255, 0, p.height / 2);
          p.noStroke();
          p.fill(180, 50, 100, 100);
          p.rect(x, p.height, spacing - 2, -h);
        }

        if (beat.isBeat && now - lastBeatTime > 180) {
          currentSize = baseSize + 60;
          lastBeatTime = now;
          const fx = p.random(p.width * 0.2, p.width * 0.8);
          const fy = p.random(p.height * 0.2, p.height * 0.8);
          const color = p.random(360);
          fireworks.push(new Firework(fx, fy, color));
        } else {
          currentSize = p.lerp(currentSize, baseSize, 0.07);
        }

        for (const fw of fireworks) {
          fw.update();
          fw.show();
        }
        fireworks = fireworks.filter((fw) => !fw.isDone());

        p.push();
        p.translate(p.width / 2, p.height / 2);
        if (isPlaying) {
          setRotation((prevRotation) => prevRotation + 0.02);
        }
        p.rotate(rotation);
        p.beginShape();
        for (let i = 0; i < 5; i++) {
          const angle = (p.TWO_PI / 5) * i;
          const x = currentSize * p.cos(angle);
          const y = currentSize * p.sin(angle);
          p.vertex(x, y);
        }
        p.endShape(p.CLOSE);
        p.pop();
      };
    });
  };

  useEffect(() => {
    if (!p5InstanceRef.current) {
      p5InstanceRef.current = createP5Instance();
    }

    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, []);

  const togglePlay = () => {
    const song = songRef.current;
    if (!song) return;

    if (song.isPlaying()) {
      song.pause();
      setIsPlaying(false);
    } else {
      song.play();
      setIsPlaying(true);
    }
  };

  return (
    <div
      className="App"
      style={{
        textAlign: "center",
        display: "flex-column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        minWidth: "100vw",
        backgroundColor: "#fdfdfd",
        paddingTop: "20px",
        backgroundImage: `
          linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: "20px 20px",
      }}
    >
      <div
        style={{
          width: "800px",
          height: "600px",
          margin: "0 auto",
          boxShadow: "0 10px 6px -6px #777",
          background: "#f5f5f5",
        }}
      >
        <div ref={canvasRef}></div>
      </div>
      <div
        onClick={togglePlay}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          backgroundColor: "#444",
          cursor: "pointer",
          marginTop: "20px",
        }}
      >
        {isPlaying ? (
          <div style={{ display: "flex", gap: "6px" }}>
            <div style={{ width: "8px", height: "24px", backgroundColor: "#fff" }} />
            <div style={{ width: "8px", height: "24px", backgroundColor: "#fff" }} />
          </div>
        ) : (
          <div
            style={{
              width: "0",
              height: "0",
              borderLeft: "20px solid #fff",
              borderTop: "12px solid transparent",
              borderBottom: "12px solid transparent",
              marginLeft: "4px",
            }}
          />
        )}
      </div>
    </div>
  );
}
