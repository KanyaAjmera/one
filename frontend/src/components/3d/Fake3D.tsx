import { useState } from "react";
import "./Fake3D.css";

interface Fake3DProps {
  image: string;
}

export default function Fake3D({ image }: Fake3DProps) {
  const [transform, setTransform] = useState(
    "perspective(1000px) rotateY(0deg) rotateX(0deg)",
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x =
      ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 50;
    const y =
      ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -50;
    setTransform(`perspective(800px) rotateY(${x}deg) rotateX(${y}deg)`);
  };

  const handleMouseLeave = () => {
    setTransform("perspective(1000px) rotateY(0deg) rotateX(0deg)");
  };

  return (
    <div className="flex justify-center items-center min-h-96">
      <div
        className="tilt-card"
        style={{ transform }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <img
          src={image}
          alt="3D Tilt"
          className="w-80 h-80 object-cover rounded-2xl shadow-2xl"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://via.placeholder.com/320?text=Invalid+Image";
          }}
        />
      </div>
    </div>
  );
}
