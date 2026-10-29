import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import particleDataHD from './particlePointsHD.json';
import { ArrowLeft } from 'lucide-react';

interface ParticleModelData {
  particleCount: number;
  house: number[];
  appliances: number[];
  applianceNames: string[];
}

const data = particleDataHD as ParticleModelData;

interface Props {
  onBackToHome: () => void;
}

export default function Residency3DView({ onBackToHome }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'house' | 'appliances'>('house');

  // Internal animation state ref
  const stateRef = useRef({
    mode: 'house' as 'house' | 'appliances',
    morphProgress: 0,
    targetMorph: 0,
    time: 0,
    userRotationY: 0,
    userRotationX: 0,
  });

  // Pure double-click trigger on the 3D scene (no bottom toggle buttons)
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (stateRef.current.mode === 'house') {
      stateRef.current.mode = 'appliances';
      stateRef.current.targetMorph = 1.0;
      setMode('appliances');
    } else {
      // Second double-click returns back home
      onBackToHome();
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera setup - centered right at the exact middle of the screen
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.38, 2.85);
    camera.lookAt(0, 0.05, 0);

    // 3. High-Definition WebGL Renderer (1080p+ Retina Support)
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      precision: 'highp',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // 4. Geometry and Attributes
    const particleCount = data.particleCount || 8000;
    const houseCoords = data.house;
    const applCoords = data.appliances;

    const currentPositions = new Float32Array(particleCount * 3);
    const housePositions = new Float32Array(particleCount * 3);
    const applPositions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const randomScatter = new Float32Array(particleCount * 3);

    // Ultra-sharp particle colors
    // Emerald Green & Mint for House (sharp architectural blueprint look)
    const emeraldCore = new THREE.Color('#10b981');
    const emeraldBright = new THREE.Color('#34d399');
    const mintGlow = new THREE.Color('#a7f3d0');

    // High-tech appliance color palette
    const appliancePalettes = [
      new THREE.Color('#38bdf8'), // Bulb: Electric Cyan
      new THREE.Color('#2dd4bf'), // Fan: Aero Mint
      new THREE.Color('#60a5fa'), // Refrigerator: Ice Blue
      new THREE.Color('#f59e0b'), // Geyser: Thermo Amber
      new THREE.Color('#34d399'), // AC: Climate Emerald
      new THREE.Color('#818cf8'), // TV: OLED Indigo
      new THREE.Color('#a78bfa'), // Speakers: Spatial Violet
      new THREE.Color('#38bdf8'), // Purifier: Crystal Aqua
    ];

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      housePositions[i3] = houseCoords[i3] ?? 0;
      housePositions[i3 + 1] = houseCoords[i3 + 1] ?? 0;
      housePositions[i3 + 2] = houseCoords[i3 + 2] ?? 0;

      applPositions[i3] = applCoords[i3] ?? 0;
      applPositions[i3 + 1] = applCoords[i3 + 1] ?? 0;
      applPositions[i3 + 2] = applCoords[i3 + 2] ?? 0;

      currentPositions[i3] = housePositions[i3];
      currentPositions[i3 + 1] = housePositions[i3 + 1];
      currentPositions[i3 + 2] = housePositions[i3 + 2];

      randomScatter[i3] = (Math.random() - 0.5) * 0.35;
      randomScatter[i3 + 1] = (Math.random() - 0.5) * 0.35;
      randomScatter[i3 + 2] = (Math.random() - 0.5) * 0.35;

      // Razor-sharp house color with bright corner highlights
      const yNorm = (housePositions[i3 + 1] + 0.35) / 0.85;
      const c = emeraldCore.clone().lerp(emeraldBright, THREE.MathUtils.clamp(yNorm, 0, 1));
      if (Math.random() > 0.85) c.lerp(mintGlow, 0.65);

      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Custom 1080p razor-sharp particle dot (crisp core + subtle aura)
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 128;
    pCanvas.height = 128;
    const pCtx = pCanvas.getContext('2d')!;
    const radGrad = pCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
    radGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    radGrad.addColorStop(0.25, 'rgba(167, 243, 208, 0.95)');
    radGrad.addColorStop(0.55, 'rgba(16, 185, 129, 0.4)');
    radGrad.addColorStop(1, 'rgba(5, 150, 105, 0)');
    pCtx.fillStyle = radGrad;
    pCtx.beginPath();
    pCtx.arc(64, 64, 64, 0, Math.PI * 2);
    pCtx.fill();

    const particleTexture = new THREE.CanvasTexture(pCanvas);

    // Fine-point material for razor-sharp edges
    const material = new THREE.PointsMaterial({
      size: 0.032,
      vertexColors: true,
      map: particleTexture,
      transparent: true,
      opacity: 0.96,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Subtle 3D floor foundation rings centered at base
    const groundY = -0.42;

    const ringGeo1 = new THREE.RingGeometry(0.85, 0.865, 128);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.32,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 2;
    ring1.position.y = groundY;
    scene.add(ring1);

    const ringGeo2 = new THREE.RingGeometry(1.4, 1.415, 128);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.2,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = Math.PI / 2;
    ring2.position.y = groundY;
    scene.add(ring2);

    // Dotted orbital ring
    const orbitPointsCount = 80;
    const orbitPositions = new Float32Array(orbitPointsCount * 3);
    for (let k = 0; k < orbitPointsCount; k++) {
      const a = (k / orbitPointsCount) * Math.PI * 2;
      orbitPositions[k * 3] = Math.cos(a) * 1.7;
      orbitPositions[k * 3 + 1] = groundY;
      orbitPositions[k * 3 + 2] = Math.sin(a) * 1.7;
    }
    const orbitGeo = new THREE.BufferGeometry();
    orbitGeo.setAttribute('position', new THREE.BufferAttribute(orbitPositions, 3));
    const orbitMat = new THREE.PointsMaterial({
      size: 0.024,
      color: 0x34d399,
      transparent: true,
      opacity: 0.4,
    });
    const orbitPoints = new THREE.Points(orbitGeo, orbitMat);
    scene.add(orbitPoints);

    // Subtle mouse tilt for immersive depth without breaking 360 auto rotation
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      stateRef.current.userRotationX = -y * 0.12;
      stateRef.current.userRotationY = x * 0.18;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Main Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.1);
      stateRef.current.time += dt;
      const t = stateRef.current.time;

      // Morphing interpolation
      const targetM = stateRef.current.targetMorph;
      const curM = stateRef.current.morphProgress;
      const diff = targetM - curM;
      if (Math.abs(diff) > 0.001) {
        stateRef.current.morphProgress += diff * (dt * 3.6);
      } else {
        stateRef.current.morphProgress = targetM;
      }

      const morph = stateRef.current.morphProgress;
      const ease = morph < 0.5 ? 4 * morph * morph * morph : 1 - Math.pow(-2 * morph + 2, 3) / 2;
      const scatterWave = Math.sin(morph * Math.PI) * 0.24;

      // Update positions & colors
      const posAttr = geometry.attributes.position as THREE.BufferAttribute;
      const pArr = posAttr.array as Float32Array;
      const colAttr = geometry.attributes.color as THREE.BufferAttribute;
      const cArr = colAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const hx = housePositions[i3];
        const hy = housePositions[i3 + 1];
        const hz = housePositions[i3 + 2];

        const ax = applPositions[i3];
        const ay = applPositions[i3 + 1];
        const az = applPositions[i3 + 2];

        const sx = randomScatter[i3] * scatterWave;
        const sy = randomScatter[i3 + 1] * scatterWave;
        const sz = randomScatter[i3 + 2] * scatterWave;

        const microFloat = Math.sin(t * 2.0 + i * 0.08) * 0.005;

        pArr[i3] = THREE.MathUtils.lerp(hx, ax, ease) + sx;
        pArr[i3 + 1] = THREE.MathUtils.lerp(hy, ay, ease) + sy + microFloat;
        pArr[i3 + 2] = THREE.MathUtils.lerp(hz, az, ease) + sz;

        // Transition from sharp architectural emerald to holographic appliance colors
        if (morph > 0.02) {
          const applIndex = Math.floor((i / particleCount) * 8);
          const targetColor = appliancePalettes[applIndex % 8];
          cArr[i3] = THREE.MathUtils.lerp(colors[i3], targetColor.r, ease);
          cArr[i3 + 1] = THREE.MathUtils.lerp(colors[i3 + 1], targetColor.g, ease);
          cArr[i3 + 2] = THREE.MathUtils.lerp(colors[i3 + 2], targetColor.b, ease);
        } else {
          cArr[i3] = colors[i3];
          cArr[i3 + 1] = colors[i3 + 1];
          cArr[i3 + 2] = colors[i3 + 2];
        }
      }
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;

      // SMOOTH 360-DEGREE CONTINUOUS ROTATION
      const baseRotationAngle = t * 0.42;
      particles.rotation.y = baseRotationAngle + stateRef.current.userRotationY;
      particles.rotation.x = stateRef.current.userRotationX;

      // Pulse ground holographic elements
      ring1.scale.setScalar(1 + Math.sin(t * 2.2) * 0.025);
      ring2.scale.setScalar(1 + Math.cos(t * 1.8) * 0.02);
      ring2.rotation.z -= 0.002;
      orbitPoints.rotation.y += 0.002;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      particleTexture.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      orbitGeo.dispose();
      orbitMat.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      className="residency-3d-overlay"
      onDoubleClick={handleDoubleClick}
      role="region"
      aria-label="3D Residency Experience"
    >
      {/* 3D WebGL Particle Canvas (Native HD Three.js Simulation) */}
      <div
        ref={mountRef}
        className="residency-canvas-container"
        style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
      />

      {/* Cinematic ambient background */}
      <div className="residency-cinematic-vignette" />

      {/* Top HUD Bar */}
      <div className="residency-hud-top">
        <div className="residency-status-pill">
          <span className="pulsing-green-dot" />
          <span className="status-label">
            {mode === 'house'
              ? '3D RESIDENCY HOLOGRAPH · 360° CONTINUOUS ROTATION'
              : 'ALL HOME APPLIANCES · 3D ROTATING SYSTEM'}
          </span>
        </div>
      </div>

      {/* Bottom Clean Control: Back to Home Button */}
      <div className="residency-clean-bottom" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="residency-back-home-btn"
          onClick={onBackToHome}
          aria-label="Go back to Home Page"
        >
          <ArrowLeft size={18} />
          <span>Back to Home</span>
        </button>
      </div>
    </div>
  );
}
