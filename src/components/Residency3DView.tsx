// ============================================================
// RESIDENCY 3D VIEW — Premium 3D Smart Home & Solar-System Orbital Appliances
// Enhanced House Model with Architectural Windows
// Solar-System-Inspired Planetary Revolution for 6 Smart Appliances
// ============================================================
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ArrowLeft, Sparkles } from 'lucide-react';

interface Props {
  onBackToHome: () => void;
  onBackToIntro?: () => void;
}

interface ApplianceMeta {
  id: string;
  name: string; // Clean, simple label
  category: string;
  powerRating: string;
  baseAngle: number; // 60 degrees apart
}

const APPLIANCES_LIST: ApplianceMeta[] = [
  { id: 'bulb', name: 'Bulb', category: 'Lighting', powerRating: '18W', baseAngle: 0 },
  { id: 'refrigerator', name: 'Refrigerator', category: 'Kitchen', powerRating: '180W', baseAngle: (1 * Math.PI) / 3 },
  { id: 'washer', name: 'Washing Machine', category: 'Laundry', powerRating: '550W', baseAngle: (2 * Math.PI) / 3 },
  { id: 'fan', name: 'Fan', category: 'Ventilation', powerRating: '65W', baseAngle: (3 * Math.PI) / 3 },
  { id: 'ac', name: 'AC', category: 'Climate', powerRating: '1450W', baseAngle: (4 * Math.PI) / 3 },
  { id: 'tv', name: 'TV', category: 'Entertainment', powerRating: '140W', baseAngle: (5 * Math.PI) / 3 },
];

export default function Residency3DView({ onBackToHome, onBackToIntro }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'house' | 'appliances'>('house');
  const [activeApplianceId, setActiveApplianceId] = useState<string | null>(null);

  // Screen positions for 2D floating tags tracking each revolving 3D appliance
  const [tagPositions, setTagPositions] = useState<{ id: string; name: string; x: number; y: number; visible: boolean }[]>([]);

  // Animation & interaction state
  const stateRef = useRef({
    mode: 'house' as 'house' | 'appliances',
    morphProgress: 0,
    targetMorph: 0,
    time: 0,
    orbitRadius: 2.5,
    userRotationY: 0,
    userRotationX: 0.1,
    isPointerDown: false,
    lastPointerX: 0,
    lastPointerY: 0,
    velocityRotationY: 0,
    velocityRotationX: 0,
    lastTapTime: 0,
  });

  // Switch back to 3D Home view
  const handleReturnTo3DHome = () => {
    stateRef.current.mode = 'house';
    stateRef.current.targetMorph = 0.0;
    setMode('house');
    setActiveApplianceId(null);
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // --- 1. Three.js Scene Setup ---
    const scene = new THREE.Scene();

    // --- 2. Camera Setup ---
    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100);
    camera.position.set(0, 1.4, 5.8);
    camera.lookAt(0, 0.1, 0);

    // --- 3. WebGL Renderer with High-Def Antialiasing & Tone Mapping ---
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      precision: 'highp',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // --- 4. Lighting Rig (Luxury Architectural Lighting) ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.35);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xf4f9ff, 0x14281c, 1.5);
    hemiLight.position.set(0, 12, 0);
    scene.add(hemiLight);

    // Key Directional Sunlight with Soft Shadows
    const dirLight = new THREE.DirectionalLight(0xfffaf0, 2.8);
    dirLight.position.set(7, 12, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 30;
    dirLight.shadow.bias = -0.0004;
    scene.add(dirLight);

    // Accent Rim Light (Sage Mint)
    const rimLight = new THREE.DirectionalLight(0x34d399, 1.8);
    rimLight.position.set(-8, 6, -6);
    scene.add(rimLight);

    // Warm Interior Point Light inside House
    const interiorLight = new THREE.PointLight(0xffd494, 3.8, 5);
    interiorLight.position.set(0, 0.45, 0.2);
    scene.add(interiorLight);

    // --- 5. Circular Foundation Ground Platform ---
    const groundGroup = new THREE.Group();
    groundGroup.position.y = -0.75;

    // Dark Pedestal Disc
    const baseDiscGeo = new THREE.CircleGeometry(2.7, 96);
    const baseDiscMat = new THREE.MeshStandardMaterial({
      color: 0x061910,
      roughness: 0.85,
      metalness: 0.15,
      transparent: true,
      opacity: 0.85,
    });
    const baseDisc = new THREE.Mesh(baseDiscGeo, baseDiscMat);
    baseDisc.rotation.x = -Math.PI / 2;
    baseDisc.position.y = -0.01;
    groundGroup.add(baseDisc);

    // Outer Concentric Glowing Ring (Emerald)
    const ringGeo1 = new THREE.RingGeometry(2.48, 2.505, 128);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
    });
    const groundRing1 = new THREE.Mesh(ringGeo1, ringMat1);
    groundRing1.rotation.x = Math.PI / 2;
    groundGroup.add(groundRing1);

    // Mid Planetary Orbital Guide Ring (Subtle glowing path)
    const orbitRingGeo = new THREE.RingGeometry(2.44, 2.448, 128);
    const orbitRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const orbitRing = new THREE.Mesh(orbitRingGeo, orbitRingMat);
    orbitRing.rotation.x = Math.PI / 2;
    groundGroup.add(orbitRing);

    // Inner Concentric Glowing Ring
    const ringGeo2 = new THREE.RingGeometry(1.5, 1.516, 96);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    const groundRing2 = new THREE.Mesh(ringGeo2, ringMat2);
    groundRing2.rotation.x = Math.PI / 2;
    groundGroup.add(groundRing2);

    scene.add(groundGroup);

    // ============================================================
    // 6. ENHANCED LUXURY 3D SMART HOME MODEL
    // Includes 2-3 Realistic Windows blended into architecture
    // ============================================================
    const houseGroup = new THREE.Group();

    // Material Palette
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5efe8, // Warm Alabaster White
      roughness: 0.28,
      metalness: 0.05,
    });

    const slateMaterial = new THREE.MeshStandardMaterial({
      color: 0x1f2723, // Architectural Slate Anthracite
      roughness: 0.35,
      metalness: 0.35,
    });

    const warmWindowMaterial = new THREE.MeshStandardMaterial({
      color: 0xffe2b2, // Warm Candlelight Window Pane
      emissive: 0xffb84d,
      emissiveIntensity: 0.85,
      roughness: 0.15,
    });

    const glassBalconyMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xcde7d8,
      transparent: true,
      opacity: 0.55,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.7,
      ior: 1.5,
    });

    const roofMaterial = new THREE.MeshStandardMaterial({
      color: 0x24362d, // Deep Forest Slate
      roughness: 0.32,
      metalness: 0.25,
    });

    // --- Ground Floor (Level 1) ---
    const groundGeo = new THREE.BoxGeometry(1.82, 0.76, 1.52);
    const groundFloor = new THREE.Mesh(groundGeo, wallMaterial);
    groundFloor.position.set(0, -0.32, 0);
    groundFloor.castShadow = true;
    groundFloor.receiveShadow = true;
    houseGroup.add(groundFloor);

    // Front Ground Floor Window with Architectural Frame & Sill (Separated cleanly on the left)
    const windowFrameMat = new THREE.MeshStandardMaterial({ color: 0x1c2420, roughness: 0.4 });

    const groundFrameGeo = new THREE.BoxGeometry(1.04, 0.50, 0.04);
    const groundFrame = new THREE.Mesh(groundFrameGeo, windowFrameMat);
    groundFrame.position.set(-0.24, -0.30, 0.77);
    houseGroup.add(groundFrame);

    const groundWindowGeo = new THREE.BoxGeometry(0.96, 0.42, 0.02);
    const groundWindow = new THREE.Mesh(groundWindowGeo, warmWindowMaterial);
    groundWindow.position.set(-0.24, -0.30, 0.785);
    houseGroup.add(groundWindow);

    // Front Entrance Door with Inset Frame & Glowing Emerald Handle (Cleanly positioned on the right with solid wall gap)
    const doorFrameGeo = new THREE.BoxGeometry(0.38, 0.66, 0.04);
    const doorFrame = new THREE.Mesh(doorFrameGeo, windowFrameMat);
    doorFrame.position.set(0.62, -0.35, 0.77);
    houseGroup.add(doorFrame);

    const doorGeo = new THREE.BoxGeometry(0.32, 0.60, 0.03);
    const door = new THREE.Mesh(doorGeo, slateMaterial);
    door.position.set(0.62, -0.35, 0.79);
    houseGroup.add(door);

    const doorHandleGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.24, 16);
    const doorHandleMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x34d399,
      emissiveIntensity: 1.2,
    });
    const doorHandle = new THREE.Mesh(doorHandleGeo, doorHandleMat);
    doorHandle.position.set(0.72, -0.35, 0.825);
    houseGroup.add(doorHandle);

    // --- Cantilevered Upper Residence (Level 2) ---
    const upperGeo = new THREE.BoxGeometry(1.62, 0.72, 1.42);
    const upperFloor = new THREE.Mesh(upperGeo, wallMaterial);
    upperFloor.position.set(-0.14, 0.42, 0.1);
    upperFloor.castShadow = true;
    upperFloor.receiveShadow = true;
    houseGroup.add(upperFloor);

    // Upper Floor Front Window with Mullion Frame
    const upperFrameGeo = new THREE.BoxGeometry(1.24, 0.44, 0.05);
    const upperFrame = new THREE.Mesh(upperFrameGeo, windowFrameMat);
    upperFrame.position.set(-0.2, 0.45, 0.82);
    houseGroup.add(upperFrame);

    const upperWindowGeo = new THREE.BoxGeometry(1.16, 0.36, 0.04);
    const upperWindow = new THREE.Mesh(upperWindowGeo, warmWindowMaterial);
    upperWindow.position.set(-0.2, 0.45, 0.84);
    houseGroup.add(upperWindow);

    // Balcony Deck with Glass Railing & Chrome Handrail
    const balconyGeo = new THREE.BoxGeometry(0.72, 0.06, 0.62);
    const balcony = new THREE.Mesh(balconyGeo, slateMaterial);
    balcony.position.set(0.56, 0.08, 0.96);
    houseGroup.add(balcony);

    const railingGeo = new THREE.BoxGeometry(0.72, 0.22, 0.025);
    const railing = new THREE.Mesh(railingGeo, glassBalconyMaterial);
    railing.position.set(0.56, 0.22, 1.26);
    houseGroup.add(railing);

    // --- NEW ENHANCEMENT: 2-3 REALISTIC ARCHITECTURAL WINDOWS ---
    // 1. Right Side Wall (Ground Floor): Pair of Dual Casement Windows
    for (let w = 0; w < 2; w++) {
      const zOffset = -0.28 + w * 0.58;
      const sideFrameGeo = new THREE.BoxGeometry(0.04, 0.46, 0.28);
      const sideFrame = new THREE.Mesh(sideFrameGeo, windowFrameMat);
      sideFrame.position.set(0.92, -0.3, zOffset);
      houseGroup.add(sideFrame);

      const sidePaneGeo = new THREE.BoxGeometry(0.03, 0.4, 0.24);
      const sidePane = new THREE.Mesh(sidePaneGeo, warmWindowMaterial);
      sidePane.position.set(0.93, -0.3, zOffset);
      houseGroup.add(sidePane);
    }

    // 2. Left Side Wall (Upper Floor): Contemporary Studio Window with Cross Mullions
    const leftFrameGeo = new THREE.BoxGeometry(0.04, 0.38, 0.44);
    const leftFrame = new THREE.Mesh(leftFrameGeo, windowFrameMat);
    leftFrame.position.set(-0.96, 0.44, 0.1);
    houseGroup.add(leftFrame);

    const leftPaneGeo = new THREE.BoxGeometry(0.03, 0.32, 0.38);
    const leftPane = new THREE.Mesh(leftPaneGeo, warmWindowMaterial);
    leftPane.position.set(-0.97, 0.44, 0.1);
    houseGroup.add(leftPane);

    // 3. Cantilever Roof Canopy with LED Glow Underneath
    const roofGeo = new THREE.BoxGeometry(2.14, 0.1, 1.84);
    const roof = new THREE.Mesh(roofGeo, roofMaterial);
    roof.position.set(-0.08, 0.83, 0.1);
    roof.castShadow = true;
    houseGroup.add(roof);

    const ledStripGeo = new THREE.BoxGeometry(1.98, 0.015, 1.68);
    const ledStripMat = new THREE.MeshBasicMaterial({ color: 0x34d399 });
    const ledStrip = new THREE.Mesh(ledStripGeo, ledStripMat);
    ledStrip.position.set(-0.08, 0.77, 0.1);
    houseGroup.add(ledStrip);

    // Architectural Roof Utility/Chimney Box
    const chimneyGeo = new THREE.BoxGeometry(0.36, 0.12, 0.36);
    const chimney = new THREE.Mesh(chimneyGeo, slateMaterial);
    chimney.position.set(0.0, 0.94, 0.0);
    houseGroup.add(chimney);

    scene.add(houseGroup);

    // ============================================================
    // 7. HIGH-DEFINITION APPLIANCES IN SOLAR-SYSTEM REVOLUTION
    // Exactly 6 Models: Bulb, Refrigerator, Washing Machine, Fan, AC, TV
    // ============================================================
    const orbitMasterGroup = new THREE.Group();
    orbitMasterGroup.visible = false;
    scene.add(orbitMasterGroup);

    const applianceHolders: THREE.Group[] = [];
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xd8e2dc, metalness: 0.95, roughness: 0.12 });
    const applianceWhiteMat = new THREE.MeshStandardMaterial({ color: 0xfaf8f5, roughness: 0.18, metalness: 0.08 });

    // ------------------------------------------------------------
    // APPLIANCE 1: BULB
    // ------------------------------------------------------------
    const bulbHolder = new THREE.Group();
    const bulbSub = new THREE.Group();

    // Screw Base with Metallic Thread Ribs
    const bulbBaseGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.16, 24);
    const bulbBaseMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.25 });
    const bulbBase = new THREE.Mesh(bulbBaseGeo, bulbBaseMat);
    bulbBase.position.y = -0.22;
    bulbSub.add(bulbBase);

    // Thread Rings
    for (let r = 0; r < 3; r++) {
      const threadGeo = new THREE.TorusGeometry(0.092, 0.01, 12, 24);
      const thread = new THREE.Mesh(threadGeo, bulbBaseMat);
      thread.rotation.x = Math.PI / 2;
      thread.position.y = -0.26 + r * 0.045;
      bulbSub.add(thread);
    }

    // Glass Bulb Envelope
    const glassSphereGeo = new THREE.SphereGeometry(0.24, 32, 32);
    const glassEnvelopeMat = new THREE.MeshPhysicalMaterial({
      color: 0xffeedd,
      transparent: true,
      opacity: 0.42,
      roughness: 0.05,
      metalness: 0.05,
      transmission: 0.85,
      ior: 1.5,
    });
    const glassEnvelope = new THREE.Mesh(glassSphereGeo, glassEnvelopeMat);
    glassEnvelope.position.y = 0.04;
    bulbSub.add(glassEnvelope);

    // Internal Radiant Glowing LED Filament Core
    const filamentGeo = new THREE.TorusGeometry(0.08, 0.015, 16, 32);
    const filamentMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffb84d,
      emissiveIntensity: 2.5,
    });
    const filament = new THREE.Mesh(filamentGeo, filamentMat);
    filament.position.y = 0.04;
    bulbSub.add(filament);

    const bulbGlowLight = new THREE.PointLight(0xffbe6b, 2.4, 3.2);
    bulbGlowLight.position.y = 0.04;
    bulbSub.add(bulbGlowLight);

    bulbHolder.add(bulbSub);
    orbitMasterGroup.add(bulbHolder);
    applianceHolders.push(bulbHolder);

    // ------------------------------------------------------------
    // APPLIANCE 2: REFRIGERATOR
    // ------------------------------------------------------------
    const fridgeHolder = new THREE.Group();
    const fridgeSub = new THREE.Group();

    const fridgeBodyGeo = new THREE.BoxGeometry(0.72, 1.45, 0.62);
    const fridgeBodyMat = new THREE.MeshStandardMaterial({
      color: 0x1b221e, // Obsidian Brushed Titanium
      roughness: 0.22,
      metalness: 0.88,
    });
    const fridgeBody = new THREE.Mesh(fridgeBodyGeo, fridgeBodyMat);
    fridgeBody.castShadow = true;
    fridgeSub.add(fridgeBody);

    // French Door Seam
    const seamGeo = new THREE.BoxGeometry(0.012, 0.95, 0.63);
    const seamMat = new THREE.MeshBasicMaterial({ color: 0x050806 });
    const seam = new THREE.Mesh(seamGeo, seamMat);
    seam.position.set(0, 0.24, 0);
    fridgeSub.add(seam);

    // Chrome Vertical Handles
    const fHandleGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.58, 16);
    const fHandleL = new THREE.Mesh(fHandleGeo, chromeMat);
    fHandleL.position.set(-0.05, 0.24, 0.33);
    fridgeSub.add(fHandleL);

    const fHandleR = new THREE.Mesh(fHandleGeo, chromeMat);
    fHandleR.position.set(0.05, 0.24, 0.33);
    fridgeSub.add(fHandleR);

    // Smart Touch Panel
    const fridgeScreenGeo = new THREE.PlaneGeometry(0.18, 0.3);
    const fridgeScreenMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const fridgeScreen = new THREE.Mesh(fridgeScreenGeo, fridgeScreenMat);
    fridgeScreen.position.set(0.2, 0.34, 0.315);
    fridgeSub.add(fridgeScreen);

    // Bottom Freezer Handle
    const freezerHandleGeo = new THREE.BoxGeometry(0.44, 0.022, 0.03);
    const freezerHandle = new THREE.Mesh(freezerHandleGeo, chromeMat);
    freezerHandle.position.set(0, -0.42, 0.33);
    fridgeSub.add(freezerHandle);

    fridgeHolder.add(fridgeSub);
    orbitMasterGroup.add(fridgeHolder);
    applianceHolders.push(fridgeHolder);

    // ------------------------------------------------------------
    // APPLIANCE 3: WASHING MACHINE
    // ------------------------------------------------------------
    const washerHolder = new THREE.Group();
    const washerSub = new THREE.Group();

    const washerBodyGeo = new THREE.BoxGeometry(0.72, 0.92, 0.68);
    const washerBody = new THREE.Mesh(washerBodyGeo, applianceWhiteMat);
    washerBody.castShadow = true;
    washerSub.add(washerBody);

    // Chrome Circular Door Porthole Bezel
    const portholeGeo = new THREE.TorusGeometry(0.24, 0.032, 16, 48);
    const porthole = new THREE.Mesh(portholeGeo, chromeMat);
    porthole.position.set(0, -0.06, 0.345);
    washerSub.add(porthole);

    // Tinted Glass Door with Internal Perforated Drum View
    const portholeGlassGeo = new THREE.CircleGeometry(0.22, 32);
    const portholeGlassMat = new THREE.MeshStandardMaterial({
      color: 0x071e14,
      roughness: 0.1,
      metalness: 0.7,
      transparent: true,
      opacity: 0.82,
    });
    const portholeGlass = new THREE.Mesh(portholeGlassGeo, portholeGlassMat);
    portholeGlass.position.set(0, -0.06, 0.348);
    washerSub.add(portholeGlass);

    // Rotary Dial & Blue LED Program Display
    const dialGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.025, 24);
    const dial = new THREE.Mesh(dialGeo, chromeMat);
    dial.rotation.x = Math.PI / 2;
    dial.position.set(0, 0.32, 0.35);
    washerSub.add(dial);

    const washerScreenGeo = new THREE.PlaneGeometry(0.18, 0.07);
    const washerScreenMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const washerScreen = new THREE.Mesh(washerScreenGeo, washerScreenMat);
    washerScreen.position.set(0.19, 0.32, 0.345);
    washerSub.add(washerScreen);

    washerHolder.add(washerSub);
    orbitMasterGroup.add(washerHolder);
    applianceHolders.push(washerHolder);

    // ------------------------------------------------------------
    // APPLIANCE 4: FAN (Continuously Spinning)
    // ------------------------------------------------------------
    const fanHolder = new THREE.Group();
    const fanSub = new THREE.Group();

    const fanRodGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.42, 16);
    const fanRod = new THREE.Mesh(fanRodGeo, slateMaterial);
    fanRod.position.y = 0.35;
    fanSub.add(fanRod);

    // Spinning Blades Assembly
    const fanBladesRotor = new THREE.Group();
    fanBladesRotor.position.y = 0.14;

    const motorHubGeo = new THREE.CylinderGeometry(0.15, 0.18, 0.1, 32);
    const motorHub = new THREE.Mesh(motorHubGeo, slateMaterial);
    fanBladesRotor.add(motorHub);

    // Center Frosted LED Light Dome
    const fanLightGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.03, 32);
    const fanLightMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x34d399,
      emissiveIntensity: 0.9,
    });
    const fanLight = new THREE.Mesh(fanLightGeo, fanLightMat);
    fanLight.position.y = -0.055;
    fanBladesRotor.add(fanLight);

    // 3 Aerodynamic Blades
    for (let b = 0; b < 3; b++) {
      const bladeArm = new THREE.Group();
      bladeArm.rotation.y = (b * Math.PI * 2) / 3;

      const bladeGeo = new THREE.BoxGeometry(0.62, 0.018, 0.11);
      const bladeMat = new THREE.MeshStandardMaterial({
        color: 0x24322a,
        roughness: 0.3,
        metalness: 0.3,
      });
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.position.x = 0.42;
      blade.rotation.x = 0.12;
      bladeArm.add(blade);

      fanBladesRotor.add(bladeArm);
    }
    fanSub.add(fanBladesRotor);

    fanHolder.add(fanSub);
    orbitMasterGroup.add(fanHolder);
    applianceHolders.push(fanHolder);

    // ------------------------------------------------------------
    // APPLIANCE 5: AC (AIR CONDITIONER)
    // ------------------------------------------------------------
    const acHolder = new THREE.Group();
    const acSub = new THREE.Group();

    const acBodyGeo = new THREE.BoxGeometry(1.05, 0.36, 0.28);
    const acBody = new THREE.Mesh(acBodyGeo, applianceWhiteMat);
    acBody.castShadow = true;
    acSub.add(acBody);

    // Air Deflector Louver
    const louverGeo = new THREE.BoxGeometry(0.96, 0.05, 0.1);
    const louverMat = new THREE.MeshStandardMaterial({ color: 0xd8e4dd });
    const louver = new THREE.Mesh(louverGeo, louverMat);
    louver.position.set(0, -0.14, 0.1);
    louver.rotation.x = 0.25;
    acSub.add(louver);

    // Glowing LED 22°C Temperature Display
    const acLedGeo = new THREE.PlaneGeometry(0.12, 0.05);
    const acLedMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const acLed = new THREE.Mesh(acLedGeo, acLedMat);
    acLed.position.set(0.34, 0.04, 0.145);
    acSub.add(acLed);

    acHolder.add(acSub);
    orbitMasterGroup.add(acHolder);
    applianceHolders.push(acHolder);

    // ------------------------------------------------------------
    // APPLIANCE 6: TV (CINEMA OLED)
    // ------------------------------------------------------------
    const tvHolder = new THREE.Group();
    const tvSub = new THREE.Group();

    const tvPanelGeo = new THREE.BoxGeometry(1.28, 0.76, 0.025);
    const tvPanelMat = new THREE.MeshStandardMaterial({
      color: 0x0f1412,
      roughness: 0.1,
      metalness: 0.9,
    });
    const tvPanel = new THREE.Mesh(tvPanelGeo, tvPanelMat);
    tvPanel.position.y = 0.16;
    tvPanel.castShadow = true;
    tvSub.add(tvPanel);

    // Glowing OLED Screen Surface
    const tvScreenGeo = new THREE.PlaneGeometry(1.22, 0.7);
    const tvScreenMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0284c7,
      emissiveIntensity: 0.65,
      roughness: 0.05,
    });
    const tvScreen = new THREE.Mesh(tvScreenGeo, tvScreenMat);
    tvScreen.position.set(0, 0.16, 0.016);
    tvSub.add(tvScreen);

    // Stand & Pedestal
    const tvStemGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.28, 16);
    const tvStem = new THREE.Mesh(tvStemGeo, chromeMat);
    tvStem.position.set(0, -0.26, 0);
    tvSub.add(tvStem);

    const tvBaseGeo = new THREE.BoxGeometry(0.48, 0.018, 0.24);
    const tvBase = new THREE.Mesh(tvBaseGeo, chromeMat);
    tvBase.position.set(0, -0.4, 0);
    tvSub.add(tvBase);

    // Soundbar
    const soundbarGeo = new THREE.BoxGeometry(0.95, 0.065, 0.08);
    const soundbarMat = new THREE.MeshStandardMaterial({ color: 0x161e1a, roughness: 0.8 });
    const soundbar = new THREE.Mesh(soundbarGeo, soundbarMat);
    soundbar.position.set(0, -0.28, 0.07);
    tvSub.add(soundbar);

    tvHolder.add(tvSub);
    orbitMasterGroup.add(tvHolder);
    applianceHolders.push(tvHolder);

    // ============================================================
    // 8. RAYCASTING DOUBLE-CLICK & DOUBLE-TAP HANDLING
    // Only triggers when the house model or its platform is clicked!
    // ============================================================
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const checkHouseIntersection = (clientX: number, clientY: number): boolean => {
      const rect = container.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -(((clientY - rect.top) / rect.height) * 2 - 1);
      raycaster.setFromCamera(pointer, camera);

      // Check intersections with house meshes and base disc
      const intersects = raycaster.intersectObjects([houseGroup, baseDisc], true);
      return intersects.length > 0;
    };

    // Desktop Double Click
    const handleDesktopDblClick = (e: MouseEvent) => {
      if (stateRef.current.mode === 'house') {
        const hit = checkHouseIntersection(e.clientX, e.clientY);
        if (hit) {
          stateRef.current.mode = 'appliances';
          stateRef.current.targetMorph = 1.0;
          setMode('appliances');
        }
      }
    };

    // Mobile Double Tap
    const handleTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length === 0) return;
      const touch = e.changedTouches[0];
      const now = Date.now();
      const timeDiff = now - stateRef.current.lastTapTime;
      stateRef.current.lastTapTime = now;

      // Double-tap detected (within 350ms)
      if (timeDiff > 40 && timeDiff < 350) {
        if (stateRef.current.mode === 'house') {
          const hit = checkHouseIntersection(touch.clientX, touch.clientY);
          if (hit) {
            stateRef.current.mode = 'appliances';
            stateRef.current.targetMorph = 1.0;
            setMode('appliances');
          }
        }
      }
    };

    // Pointer Rotation (Drag)
    const onPointerDown = (e: PointerEvent) => {
      stateRef.current.isPointerDown = true;
      stateRef.current.lastPointerX = e.clientX;
      stateRef.current.lastPointerY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!stateRef.current.isPointerDown) {
        // Subtle cursor parallax
        const rect = container.getBoundingClientRect();
        const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        if (stateRef.current.mode === 'house') {
          stateRef.current.userRotationX = 0.1 - normY * 0.12;
        }
        return;
      }

      const deltaX = e.clientX - stateRef.current.lastPointerX;
      const deltaY = e.clientY - stateRef.current.lastPointerY;
      stateRef.current.lastPointerX = e.clientX;
      stateRef.current.lastPointerY = e.clientY;

      stateRef.current.velocityRotationY += deltaX * 0.005;
      stateRef.current.velocityRotationX += deltaY * 0.003;
    };

    const onPointerUp = () => {
      stateRef.current.isPointerDown = false;
    };

    container.addEventListener('dblclick', handleDesktopDblClick);
    container.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // ============================================================
    // 9. ANIMATION LOOP — SOLAR SYSTEM REVOLUTION
    // ============================================================
    let animId: number;
    const clock = new THREE.Clock();
    const tempVec = new THREE.Vector3();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      stateRef.current.time += dt;
      const t = stateRef.current.time;

      // Smooth Morphing Progress
      const targetM = stateRef.current.targetMorph;
      const curM = stateRef.current.morphProgress;
      const diff = targetM - curM;
      if (Math.abs(diff) > 0.0005) {
        stateRef.current.morphProgress += diff * (dt * 3.8);
      } else {
        stateRef.current.morphProgress = targetM;
      }

      const morph = stateRef.current.morphProgress;
      const ease = morph < 0.5 ? 4 * morph * morph * morph : 1 - Math.pow(-2 * morph + 2, 3) / 2;

      // Apply Inertia to User Rotations
      stateRef.current.userRotationY += stateRef.current.velocityRotationY;
      stateRef.current.userRotationX += stateRef.current.velocityRotationX;
      stateRef.current.velocityRotationY *= 0.92;
      stateRef.current.velocityRotationX *= 0.92;
      stateRef.current.userRotationX = THREE.MathUtils.clamp(stateRef.current.userRotationX, -0.3, 0.65);

      // --- Central House Animation ---
      const autoRotate = t * 0.32;
      houseGroup.rotation.y = autoRotate + stateRef.current.userRotationY;
      houseGroup.rotation.x = stateRef.current.userRotationX;
      houseGroup.position.y = Math.sin(t * 1.5) * 0.04;

      // In orbital appliance mode, the house shrinks gracefully to become the central glowing hub
      const houseScale = THREE.MathUtils.lerp(1.0, 0.58, ease);
      houseGroup.scale.setScalar(houseScale);

      // --- Solar System Orbital Revolution ---
      if (morph > 0.01) {
        orbitMasterGroup.visible = true;

        // Slow, elegant, fluid planetary revolution speed (approx 28 seconds per full orbit)
        const orbitSpeed = 0.22;
        const currentRevolutionAngle = t * orbitSpeed + stateRef.current.userRotationY * 0.4;
        const targetRadius = 2.45 * ease;

        // Spin ceiling fan blades smoothly
        fanBladesRotor.rotation.y += 0.09;

        // Compute 2D screen positions for floating labels
        const newTagPos: { id: string; name: string; x: number; y: number; visible: boolean }[] = [];

        for (let i = 0; i < APPLIANCES_LIST.length; i++) {
          const item = APPLIANCES_LIST[i];
          const holder = applianceHolders[i];

          // Orbital position around the circular ground
          const theta = item.baseAngle + currentRevolutionAngle;
          const x = Math.cos(theta) * targetRadius;
          const z = Math.sin(theta) * targetRadius;

          // Gentle floating vertical bobbing
          const yBob = Math.sin(t * 2.0 + i * 1.05) * 0.04;

          holder.position.set(x, yBob, z);
          holder.scale.setScalar(ease);

          // Rotate each appliance to face slightly tangent or outward for optimal visibility
          holder.rotation.y = -theta + Math.PI / 2 + Math.sin(t * 1.2 + i) * 0.1;

          // Project 3D position to 2D screen coordinates for label tracking
          if (morph > 0.6) {
            holder.getWorldPosition(tempVec);
            tempVec.y += 0.72; // position label slightly above the appliance
            tempVec.project(camera);

            const isFront = tempVec.z < 1.0;
            const screenX = (tempVec.x * 0.5 + 0.5) * width;
            const screenY = (-(tempVec.y * 0.5) + 0.5) * height;

            newTagPos.push({
              id: item.id,
              name: item.name,
              x: screenX,
              y: screenY,
              visible: isFront,
            });
          }
        }

        setTagPositions(newTagPos);
      } else {
        orbitMasterGroup.visible = false;
        if (tagPositions.length > 0) setTagPositions([]);
      }

      // Ground glowing rings pulse
      groundRing1.rotation.z += 0.002;
      groundRing2.rotation.z -= 0.003;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('dblclick', handleDesktopDblClick);
      container.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      className="residency-3d-overlay"
      role="region"
      aria-label="3D Residency Experience"
      style={{ touchAction: 'none' }}
    >
      {/* 3D WebGL Canvas */}
      <div
        ref={mountRef}
        className="residency-canvas-container"
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          inset: 0,
          cursor: 'none',
        }}
      />

      {/* Cinematic ambient vignette */}
      <div className="residency-cinematic-vignette" />

      {/* Top HUD Bar */}
      <div
        className="residency-hud-top"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: 'var(--space-6) var(--space-8)',
          zIndex: 20,
        }}
      >
        {/* Left Side: Back to Home Button & Status Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onBackToIntro || onBackToHome}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 18px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(6, 30, 20, 0.85)',
              border: '1px solid rgba(52, 211, 153, 0.45)',
              color: '#a7f3d0',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              cursor: 'pointer',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
              transition: 'all 0.2s ease',
            }}
            title="Go back to Home Page"
          >
            <ArrowLeft size={15} style={{ color: '#34d399' }} />
            <span>Back to Home</span>
          </button>

          {/* Status Pill */}
          <div className="residency-status-pill">
            <span className="pulsing-green-dot" />
            <span className="status-label">
              {mode === 'house'
                ? '3D SMART RESIDENCE · DOUBLE-CLICK HOME ICON'
                : 'SOLAR SYSTEM ORBIT · 6 REVOLVING APPLIANCES'}
            </span>
          </div>
        </div>

        {/* Top-Right: Return to 3D Home Button (Preserved exactly) */}
        {mode === 'appliances' ? (
          <button
            type="button"
            onClick={handleReturnTo3DHome}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 20px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(6, 30, 20, 0.85)',
              border: '1px solid rgba(52, 211, 153, 0.45)',
              color: '#a7f3d0',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              cursor: 'pointer',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
              transition: 'all 0.2s ease',
            }}
            title="Return to 3D Home view"
          >
            <Sparkles size={14} style={{ color: '#34d399' }} />
            <span>Return to 3D Home</span>
          </button>
        ) : (
          <div
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(6, 30, 20, 0.65)',
              border: '1px solid rgba(52, 211, 153, 0.25)',
              color: '#a7f3d0',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.04em',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Sparkles size={13} style={{ color: '#34d399' }} />
            <span>Double-Click or Double-Tap House to Orbit</span>
          </div>
        )}
      </div>

      {/* 2D Floating Labels Tracking Each Revolving 3D Appliance */}
      {mode === 'appliances' && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 15 }}>
          {tagPositions.map((tag) => {
            if (!tag.visible) return null;
            const isHovered = activeApplianceId === tag.id;
            return (
              <div
                key={tag.id}
                style={{
                  position: 'absolute',
                  left: tag.x,
                  top: tag.y,
                  transform: 'translate(-50%, -100%)',
                  padding: '4px 14px',
                  borderRadius: 'var(--radius-full)',
                  background: isHovered ? 'rgba(16, 185, 129, 0.95)' : 'rgba(5, 24, 16, 0.82)',
                  border: '1px solid rgba(52, 211, 153, 0.45)',
                  color: isHovered ? '#FFFFFF' : '#a7f3d0',
                  fontSize: '12px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-heading)',
                  letterSpacing: '0.03em',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                  backdropFilter: 'blur(8px)',
                  transition: 'background 0.2s ease, transform 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {tag.name}
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Enter Dashboard Button — Positioned slightly down, directly above the 3D model */}
      <div
        style={{
          position: 'absolute',
          top: 86,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 30,
          pointerEvents: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="residency-back-home-btn"
          onClick={onBackToHome}
          aria-label="Proceed to Home Dashboard"
          style={{
            padding: '10px 24px',
            fontSize: 'var(--text-sm)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.4)',
          }}
        >
          <ArrowLeft size={16} />
          <span>Enter Dashboard</span>
        </button>
      </div>
    </div>
  );
}
