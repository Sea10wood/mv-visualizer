import React, { useRef, useEffect } from "react";

export default function App() {
  const canvasRef = useRef(null);

  useEffect(() => {
    let p5Instance;
    let song;
    let fft;
    let spherePosition = { x: 400, y: 300 }; // 初期位置
    let sphereSpeed = { x: 2, y: 2 }; // 初期速度
    let sphereColor = { r: 255, g: 182, b: 193, a: 150 }; // パステルピンクの色
    let sphereSize = 100; // 球体のサイズ

    p5Instance = new window.p5((p) => {
      p.preload = () => {
        song = p.loadSound("/audio.mp3");
      };

      p.setup = () => {
        p.createCanvas(800, 600).parent(canvasRef.current);
        fft = new p5.FFT(0.8, 64); // FFTインスタンスを作成
        song.stop(); // 最初は音楽を停止
      };

      p.draw = () => {
        p.background(240); // 薄い灰色の背景

        // 音楽の再生が開始されていれば、球体の位置を動かす
        if (song.isPlaying()) {
          // 音量取得
          const spectrum = fft.analyze(); // スペクトルデータを取得
          const volume = fft.getEnergy(20, 200); // 20Hz～200Hzの範囲で音量を取得

          // 音量に応じて球体のサイズを変える
          sphereSize = p.map(volume, 0, 255, 50, 150); // 音量によって球体のサイズを調整

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
          sphereColor.r = p.random(180, 255);
          sphereColor.g = p.random(180, 255);
          sphereColor.b = p.random(180, 255);

          p.fill(sphereColor.r, sphereColor.g, sphereColor.b, sphereColor.a); // 塗りつぶしの色を設定
          p.noStroke(); // 枠線を無しに
          p.ellipse(spherePosition.x, spherePosition.y, sphereSize, sphereSize); // 球体を描く
        } else {
          p.fill(255, 182, 193, 150); // 音楽が停止中はデフォルトの色
          p.noStroke();
          p.ellipse(spherePosition.x, spherePosition.y, sphereSize, sphereSize);
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
    });

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
