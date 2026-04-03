import { useEffect, useRef } from "react";
import * as THREE from "three";

interface Real3DProps {
  image: string;
}

export default function Real3D({ image }: Real3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cubeRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(75, 400 / 400, 0.1, 1000);
    camera.position.z = 2.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(400, 400);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;

    // Clear previous content
    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(renderer.domElement);

    // Texture loading
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(image, undefined, undefined, () => {
      // Fallback on error
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#333";
        ctx.fillRect(0, 0, 400, 400);
        ctx.fillStyle = "#fff";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Invalid Image", 200, 200);
      }
      const fallbackTexture = new THREE.CanvasTexture(canvas);
      if (cubeRef.current) {
        (cubeRef.current.material as THREE.MeshBasicMaterial).map =
          fallbackTexture;
      }
    });

    // Cube geometry with texture on each face
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const cube = new THREE.Mesh(geometry, material);
    cubeRef.current = cube;
    scene.add(cube);

    // Lighting
    const light1 = new THREE.PointLight(0xffffff, 1.5);
    light1.position.set(5, 5, 5);
    scene.add(light1);

    const light2 = new THREE.PointLight(0x4488ff, 0.8);
    light2.position.set(-5, -5, 5);
    scene.add(light2);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (cubeRef.current) {
        cubeRef.current.rotation.x += 0.015;
        cubeRef.current.rotation.y += 0.02;
        cubeRef.current.rotation.z += 0.008;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (rendererRef.current) {
        renderer.setSize(400, 400);
      }
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [image]);

  return (
    <div className="flex justify-center items-center min-h-96">
      <div
        ref={containerRef}
        className="w-96 h-96 rounded-2xl overflow-hidden shadow-2xl"
      />
    </div>
  );
}
