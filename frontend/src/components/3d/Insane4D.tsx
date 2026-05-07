import { useEffect, useRef } from "react";
import * as THREE from "three";

interface Insane4DProps {
  image: string;
}

export default function Insane4D({ image }: Insane4DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);

    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 2.5;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(500, 500);
    renderer.setPixelRatio(window.devicePixelRatio);

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(renderer.domElement);

    // Load texture
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(image, undefined, undefined, () => {
      // Fallback texture
      const canvas = document.createElement("canvas");
      canvas.width = 500;
      canvas.height = 500;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, 0, 500, 500);
      }
      const fallbackTexture = new THREE.CanvasTexture(canvas);
      material.map = fallbackTexture;
    });

    // Advanced material
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.2,
      metalness: 0.8,
      emissive: new THREE.Color(0x0099ff),
      emissiveIntensity: 0.1,
    });

    // High-res sphere
    const geometry = new THREE.IcosahedronGeometry(1, 128);
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Store original positions for wave effect
    const positionAttribute = geometry.getAttribute("position");
    const originalPositions = Array.from(
      positionAttribute.array as Float32Array,
    );

    // Multi-light setup
    const light1 = new THREE.PointLight(0xffffff, 1.2);
    light1.position.set(5, 5, 5);
    scene.add(light1);

    const light2 = new THREE.PointLight(0x00ffff, 0.8);
    light2.position.set(-5, -5, 5);
    scene.add(light2);

    const light3 = new THREE.PointLight(0xff0099, 0.6);
    light3.position.set(0, -5, -5);
    scene.add(light3);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Particle system
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 800;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 8;
      posArray[i + 1] = (Math.random() - 0.5) * 8;
      posArray[i + 2] = (Math.random() - 0.5) * 8;
    }

    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3),
    );

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.03,
      color: 0x00ffff,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.6,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Animation variables
    let time = 0;
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;

      velocityRef.current.x = mouseRef.current.x;
      velocityRef.current.y = mouseRef.current.y;
    };

    window.addEventListener("mousemove", handleMouseMove);

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.01;

      // Smooth mouse interpolation (inertia)
      targetRotX = mouseRef.current.y * 0.5;
      targetRotY = mouseRef.current.x * 0.5;

      currentRotX += (targetRotX - currentRotX) * 0.06;
      currentRotY += (targetRotY - currentRotY) * 0.06;

      sphere.rotation.x = currentRotX + Math.sin(time * 0.3) * 0.1;
      sphere.rotation.y = currentRotY + time * 0.3;
      sphere.rotation.z += 0.001;

      // Pulse breathing effect
      const scale = 1 + Math.sin(time * 1.5) * 0.12;
      sphere.scale.set(scale, scale, scale);

      // 🔥 Geometry wave/distortion (4D effect)
      const pos = geometry.getAttribute("position");
      for (let i = 0; i < pos.count; i++) {
        const x = (originalPositions[i * 3] as number) || 0;
        const y = (originalPositions[i * 3 + 1] as number) || 0;
        const z = (originalPositions[i * 3 + 2] as number) || 0;

        const distortion =
          Math.sin(time + x * 5) * 0.02 + Math.cos(time + y * 5) * 0.02;

        pos.setXYZ(
          i,
          x * (1 + distortion),
          y * (1 + distortion),
          z * (1 + distortion),
        );
      }
      pos.needsUpdate = true;

      // Color shifting
      const hue = (time * 0.1) % 1;
      material.color.setHSL(hue, 0.8, 0.5);
      material.emissive.setHSL(hue + 0.5, 0.9, 0.4);

      // Particle animation
      particles.rotation.x += 0.0001;
      particles.rotation.y += 0.0003;
      particles.rotation.z += 0.0002;

      // Particle color cycling
      (particlesMaterial as THREE.PointsMaterial).color.setHSL(hue, 1, 0.6);

      // Light animation
      light1.intensity = 1 + Math.sin(time) * 0.3;
      light2.intensity = 0.8 + Math.cos(time * 0.7) * 0.3;
      light3.intensity = 0.6 + Math.sin(time * 1.2) * 0.3;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationId);
      geometry.dispose();
      material.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, [image]);

  return (
    <div className="flex justify-center items-center min-h-96">
      <div
        ref={containerRef}
        className="w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl"
        style={{
          boxShadow:
            "0 0 60px rgba(0, 255, 255, 0.2), 0 0 100px rgba(255, 0, 153, 0.1)",
        }}
      />
    </div>
  );
}
