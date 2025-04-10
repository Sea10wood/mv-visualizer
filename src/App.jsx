import React, { useEffect, useRef } from "react";

export default function App() {
  const canvasRef = useRef(null);

  useEffect(() => {
    let p5Instance;
    let song;
    let fft;
    let beatDetector;
    let smoothedHeights = [];
    let baseSize = 100;
    let currentSize = baseSize;
    let lastBeatTime = 0;

    class BeatDetect {
      constructor(mode = "kick", freq2) {
        if (!isNaN(freq2) && !isNaN(mode)) {
          this.freq1 = mode;
          this.freq2 = freq2;
        } else {
          if (mode === "snare") {
            this.freq1 = 2000;
            this.freq2 = 6000;
          } else if (mode === "male") {
            this.freq1 = 200;
            this.freq2 = 2000;
          } else {
            // mode == "kick"
            this.freq1 = 20;
            this.freq2 = 80; // 重低音
          }
        }

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
        const e = fft.getEnergy(this.freq1, this.freq2); // 指定した周波数帯域のエネルギーを取得
        const level = e / 255.0 || 0.0;
        let isBeat = false;

        if (level > this.threshold && level > this.minThreshold) {
          this.threshold = level * 1.05; // 閾値強化
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

    p5Instance = new window.p5((p) => {
      p.preload = () => {
        song = p.loadSound("/audio.mp3");
      };

      p.setup = () => {
        p.createCanvas(800, 600).parent(canvasRef.current);
        fft = new p5.FFT(0.9, 1024); // FFTで広範囲の周波数を解析
        beatDetector = new BeatDetect("kick"); // 重低音のビート検出モード
        smoothedHeights = new Array(1024).fill(0);
        p.colorMode(p.HSB, 360, 100, 100, 255);
      };

      p.draw = () => {
        p.background(0);
        p.noFill();
        p.stroke(255);
        p.strokeWeight(2);
        p.rect(1, 1, p.width - 2, p.height - 2);

        const spectrum = fft.analyze(); // 周波数解析
        const beat = beatDetector.update(fft); // ビート検出
        const now = p.millis();

        const binCount = 1024; // スペクトラムの解像度
        const spacing = p.width / binCount * 1.5; // 棒グラフの幅

        // 高音と低音を表示
        for (let i = 0; i < binCount; i++) {
          const x = i * spacing;
          const amp = spectrum[i] || 0;
          const h = p.map(amp, 0, 255, 0, p.height / 2);

          p.noStroke();
          p.fill(180, 50, 100, 100); // パステルブルー風
          p.rect(x, p.height, spacing - 2, -h);
        }

        // ビート検出 & クールダウン
        if (beat.isBeat && now - lastBeatTime > 180) {
          currentSize = baseSize + 60;
          lastBeatTime = now;
        } else {
          currentSize = p.lerp(currentSize, baseSize, 0.07);
        }

        // 回転する五角形を描画
        p.push();
        p.translate(p.width / 2, p.height / 2); // 画面中央に移動
        p.rotate(p.frameCount * 0.02); // 時間で回転
        p.beginShape();
        for (let i = 0; i < 5; i++) {
          const angle = p.TWO_PI / 5 * i;
          const x = currentSize * p.cos(angle);
          const y = currentSize * p.sin(angle);
          p.vertex(x, y);
        }
        p.endShape(p.CLOSE);
        p.pop();
      };

      // 再生 / 停止
      p.mousePressed = () => {
        if (song.isPlaying()) {
          song.pause();
        } else {
          song.play();
        }
      };
    });

    return () => {
      p5Instance.remove();
    };
  }, []);

  return (
    <div className="App">
      <h1 style={{ color: "#eee" }}>Visualizer: Bars + Rotating Pentagon 💫</h1>
      <p style={{ color: "#ccc" }}>クリックで再生 / 停止</p>
      <div ref={canvasRef}></div>
    </div>
  );
}
