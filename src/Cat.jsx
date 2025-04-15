import React, { useEffect, useRef, useState } from "react";
import "./Cat.css"; // 後述するCSSをここで読み込み

const Cat = () => {
  const canvasRef = useRef(null);
  const p5InstanceRef = useRef(null);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [sound, setSound] = useState(null);

  useEffect(() => {
    if (!window.p5) return;

    let fft;

    const sketch = (p) => {
      p.preload = () => {
        // 音声ファイルをロード
        const loadedSound = p.loadSound("/sound.mp3", () => {
          setAudioLoaded(true); // ロード完了フラグ
          setSound(loadedSound); // 音声を状態に保存
        });
      };

      p.setup = () => {
        const cnv = p.createCanvas(800, 600);
        cnv.parent(canvasRef.current);
        cnv.style("position", "absolute");
        cnv.style("top", "50%");
        cnv.style("left", "50%");
        cnv.style("transform", "translate(-50%, -50%)");
        p.background(30);
        
        fft = new p5.FFT();
        fft.setInput(sound); // 音声をFFTに設定
      };

      p.draw = () => {
        p.background(30);

        if (sound && sound.isPlaying()) {
          // 音の周波数データを取得
          const spectrum = fft.analyze();

          // 波形の描画
          p.stroke(255);
          p.noFill();
          p.beginShape();
          for (let i = 0; i < spectrum.length; i++) {
            const x = p.map(i, 0, spectrum.length, 0, p.width);
            const y = p.map(spectrum[i], 0, 255, p.height, 0);
            p.vertex(x, y);
          }
          p.endShape();

          // 他の描画処理（例: マウス位置に円を描く）
          p.fill(255);
          p.ellipse(p.mouseX, p.mouseY, 30, 30);
        }
      };

      p.mousePressed = () => {
        if (sound && !sound.isPlaying()) {
          sound.play();
        }
      };
    };

    p5InstanceRef.current = new window.p5(sketch);

    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, [sound]);

  return (
    <div className="hello-cat-page">
      <div ref={canvasRef} className="canvas-container" />
      {audioLoaded ? (
        <p className="audio-instruction">画面をクリックして音を再生</p>
      ) : (
        <p className="audio-instruction">音声を読み込み中...</p>
      )}
    </div>
  );
};

export default Cat;
