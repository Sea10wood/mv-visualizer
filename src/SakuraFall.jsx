import React, { useEffect, useState } from "react";

const SakuraFall = () => {
  const [sakuraElements, setSakuraElements] = useState([]);

  useEffect(() => {
    const numSakura = 30;
    const sakuras = [];
    
    for (let i = 0; i < numSakura; i++) {
      sakuras.push(
        <img
          key={i}
          src="/sakura.png"
          alt="Sakura"
          className="sakura"
          style={{
            left: `${Math.random() * 100}vw`,
            animationDelay: `${Math.random() * 10}s`, 
            animationDuration: `${Math.random() * 10 + 5}s`, 
          }}
        />
      );
    }
    setSakuraElements(sakuras);
  }, []);

  return <div id="sakura-container">{sakuraElements}</div>;
};

export default SakuraFall;
