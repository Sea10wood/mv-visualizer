import React, { useRef, useEffect } from "react";

export default function App() {
  const canvasRef = useRef(null);

  useEffect(() => {
    let p5Instance;

    const sketch = (p) => {
      let song;
      let spherePosition = { x: 400, y: 300 }; // 初期位置
      let sphereSpeed = { x: 2, y: 2 }; // 初期速度
      let sphereColor = p.color(255, 182, 193, 150); // パステルピンクの色

      p.preload = () => {
        // 音楽ファイルは public/audio.mp3 に配置している前提
        song = p.loadSound("/audio.mp3");
      };

      p.setup = () => {
        p.createCanvas(800, 600).parent(canvasRef.current);
        song.stop(); // 最初は音楽を停止
      };

      p.draw = () => {
        p.background(240); // 薄い灰色の背景

        // 音楽の再生が開始されていれば、球体の位置を動かす
        if (song.isPlaying()) {
          spherePosition.x += sphereSpeed.x;
          spherePosition.y += sphereSpeed.y;

          // 球体が画面の端にぶつかったときに反転する
          if (spherePosition.x < 0 || spherePosition.x > p.width) {
            sphereSpeed.x *= -1;
          }
          if (spherePosition.y < 0 || spherePosition.y > p.height) {
            sphereSpeed.y *= -1;
          }

          // 球体の色をランダムに変える
          sphereColor = p.color(
            p.random(180, 255),
            p.random(180, 255),
            p.random(180, 255),
            150
          );

          p.fill(sphereColor); // 塗りつぶしの色を設定
          p.noStroke(); // 枠線を無しに
          p.ellipse(spherePosition.x, spherePosition.y, 100, 100); // 球体を描く
        } else {
          p.fill(255, 182, 193, 150); // 音楽が停止中はデフォルトの色
          p.noStroke();
          p.ellipse(spherePosition.x, spherePosition.y, 100, 100);
        }
      };

      p.mousePressed = () => {
        // クリックで再生／ポーズの切替
        if (song.isPlaying()) {
          song.pause(); // 再生中なら一時停止
        } else {
          song.play(); // 停止中なら再生
        }
      };
    };

    // グローバルに読み込んだ p5 (CDN経由で読み込むので window.p5 に存在する)
    p5Instance = new window.p5(sketch);

    return () => {
      p5Instance.remove();
    };
  }, []);

  return (
    <div className="App">
      <h1 style={{ color: "yellow" }}>オーディオビジュアライザー</h1>
      <p style={{ color: "white" }}>クリックで再生/ポーズ</p>
      <div ref={canvasRef}></div>
    </div>
  );
}
