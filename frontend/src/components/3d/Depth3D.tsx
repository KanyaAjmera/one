import { useState } from "react";
import "./Depth3D.css";

interface Depth3DProps {
  image: string;
}

export default function Depth3D({ image }: Depth3DProps) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x =
      ((e.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 40;
    const y =
      ((e.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * 40;
    setOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div className="flex justify-center items-center min-h-96">
      <div
        className="depth-container"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Base Layer */}
        <img
          src={image}
          alt="Depth Base"
          className="layer base w-full h-full object-cover rounded-2xl"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://via.placeholder.com/320?text=Invalid+Image";
          }}
        />

        {/* Depth Layer */}
        <img
          src={image}
          alt="Depth Effect"
          className="layer depth w-full h-full object-cover rounded-2xl"
          style={{
            transform: `translate(${offset.x * 1.5}px, ${offset.y * 1.5}px) scale(1.2)`,
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://via.placeholder.com/320?text=Invalid+Image";
          }}
        />
      </div>
    </div>
  );
}
