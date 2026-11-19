import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RotateCcw, RotateCw, RefreshCw, Sun, Moon, Play, Pause } from 'lucide-react';

const FINISH_OPTIONS = [
  { id: 'white', label: 'Warm White', color: '#F5F2EB' },
  { id: 'sandstone', label: 'Travertine Sand', color: '#D8CBB8' },
  { id: 'concrete', label: 'Architectural Grey', color: '#7D7B76' },
  { id: 'charcoal', label: 'Obsidian', color: '#2A2B2E' },
];

const CAMERA_VIEWS = [
  { id: 'hero', label: 'Front', pos: [11.5, 6.2, 12.2], target: [0, 1.4, 0] },
  { id: 'pool', label: 'Pool', pos: [-7.5, 4.2, 10.5], target: [-1.2, 1.0, 2.2] },
  { id: 'top', label: 'Aerial', pos: [0.5, 14.5, 10.5], target: [0, 0.8, 0.4] },
];

export default function Villa3DViewer() {
  const mountRef = useRef(null);
  const villaGroupRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const lightsRef = useRef({});
  const matsRef = useRef({});
  const targetCamRef = useRef(null);

  const [isNight, setIsNight] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [finishColor, setFinishColor] = useState('#F5F2EB');
  const [activeView, setActiveView] = useState('hero');

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene & Atmosphere
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#141619');
    scene.fog = new THREE.FogExp2('#141619', 0.018);

    const camera = new THREE.PerspectiveCamera(
      40,
      container.clientWidth / container.clientHeight,
      0.1,
      120
    );
    camera.position.set(11.5, 6.2, 12.2);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.7;
    controls.minDistance = 6.5;
    controls.maxDistance = 24;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.target.set(0, 1.4, 0);
    controlsRef.current = controls;

    // Cancel smooth preset transition if user interacts manually
    const onControlStart = () => {
      targetCamRef.current = null;
    };
    controls.addEventListener('start', onControlStart);

    // ==========================================
    // LIGHTING SETUP
    // ==========================================
    const hemiLight = new THREE.HemisphereLight('#e8f1ff', '#2a2d28', 0.75);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight('#fff2dc', 1.9);
    sunLight.position.set(14, 18, 11);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 2;
    sunLight.shadow.camera.far = 45;
    sunLight.shadow.camera.left = -12;
    sunLight.shadow.camera.right = 12;
    sunLight.shadow.camera.top = 12;
    sunLight.shadow.camera.bottom = -12;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight('#8bb8ff', 0.45);
    rimLight.position.set(-12, 8, -10);
    scene.add(rimLight);

    // Night Accent Lights
    const warmInterior1 = new THREE.PointLight('#ffbe5c', 0, 11, 1.6);
    warmInterior1.position.set(-1.5, 1.5, 0.8);
    scene.add(warmInterior1);

    const warmInterior2 = new THREE.PointLight('#ffbe5c', 0, 10, 1.6);
    warmInterior2.position.set(0.5, 4.0, 0.8);
    scene.add(warmInterior2);

    const poolLight = new THREE.PointLight('#22d3ee', 0, 9, 1.5);
    poolLight.position.set(-2.2, 0.6, 3.2);
    scene.add(poolLight);

    const entranceLight = new THREE.PointLight('#ffd285', 0, 7, 1.8);
    entranceLight.position.set(2.9, 2.2, 1.8);
    scene.add(entranceLight);

    lightsRef.current = {
      scene,
      hemiLight,
      sunLight,
      rimLight,
      warmInterior1,
      warmInterior2,
      poolLight,
      entranceLight,
    };

    // ==========================================
    // MATERIALS
    // ==========================================
    const plasterMat = new THREE.MeshStandardMaterial({ color: '#F5F2EB', roughness: 0.72, metalness: 0.04 });
    const stoneMat = new THREE.MeshStandardMaterial({ color: '#585651', roughness: 0.85, metalness: 0.05 });
    const darkTrimMat = new THREE.MeshStandardMaterial({ color: '#1A1B1E', roughness: 0.35, metalness: 0.45 });
    const woodMat = new THREE.MeshStandardMaterial({ color: '#8C5A32', roughness: 0.65, metalness: 0.05 });
    const deckWoodMat = new THREE.MeshStandardMaterial({ color: '#6E472B', roughness: 0.7, metalness: 0.05 });
    const goldMat = new THREE.MeshStandardMaterial({ color: '#C59B27', metalness: 0.8, roughness: 0.22 });
    const marbleMat = new THREE.MeshStandardMaterial({ color: '#E8E4DC', roughness: 0.25, metalness: 0.1 });
    const asphaltMat = new THREE.MeshStandardMaterial({ color: '#26282B', roughness: 0.9, metalness: 0.05 });
    const lawnMat = new THREE.MeshStandardMaterial({ color: '#263826', roughness: 0.92 });
    const foliageMat = new THREE.MeshStandardMaterial({ color: '#2D4F2E', roughness: 0.85 });
    const hedgeMat = new THREE.MeshStandardMaterial({ color: '#1F3B22', roughness: 0.9 });
    const fabricWhiteMat = new THREE.MeshStandardMaterial({ color: '#F4F1EA', roughness: 0.85 });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: '#a8d5e5',
      transparent: true,
      opacity: 0.45,
      roughness: 0.06,
      metalness: 0.15,
      reflectivity: 0.9,
    });

    const interiorGlowMat = new THREE.MeshStandardMaterial({
      color: '#3b3328',
      emissive: '#ffb84d',
      emissiveIntensity: 0.15,
      roughness: 0.8,
    });

    const ledStripMat = new THREE.MeshStandardMaterial({
      color: '#fff4d6',
      emissive: '#ffbe55',
      emissiveIntensity: 0.25,
      roughness: 0.2,
    });

    const poolWaterMat = new THREE.MeshPhysicalMaterial({
      color: '#0ea5c6',
      emissive: '#064e63',
      emissiveIntensity: 0.15,
      transparent: true,
      opacity: 0.82,
      roughness: 0.08,
      metalness: 0.1,
    });

    const poolTileMat = new THREE.MeshStandardMaterial({ color: '#0c4a6e', roughness: 0.4 });
    const carBodyMat = new THREE.MeshStandardMaterial({ color: '#1f2937', metalness: 0.85, roughness: 0.2 });

    matsRef.current = { plasterMat, interiorGlowMat, ledStripMat, poolWaterMat };

    // ==========================================
    // VILLA GROUP & HELPER
    // ==========================================
    const villa = new THREE.Group();
    villaGroupRef.current = villa;

    const addBox = (w, h, d, mat, x, y, z, cast = true, receive = true) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      mesh.position.set(x, y, z);
      mesh.castShadow = cast;
      mesh.receiveShadow = receive;
      villa.add(mesh);
      return mesh;
    };

    // 1. PLOT BASE, BORDER & DRIVEWAY
    addBox(15.6, 0.36, 12.6, stoneMat, 0, -0.22, 0.4, false, true);
    addBox(15.0, 0.12, 12.0, lawnMat, 0, -0.02, 0.4, false, true);

    // Driveway on right side
    addBox(3.4, 0.14, 6.2, asphaltMat, 5.2, 0.01, 2.8, false, true);

    // Stepping stones to front door
    for (let i = 0; i < 4; i++) {
      addBox(1.5, 0.08, 0.55, marbleMat, 2.9, 0.05, 2.3 + i * 0.9, false, true);
    }

    // 2. GROUND FLOOR VOLUMES
    // Main living room block
    addBox(6.8, 2.8, 4.8, plasterMat, -1.6, 1.4, -1.0);
    // Stone accent wall on left side
    addBox(0.35, 2.82, 4.85, stoneMat, -5.05, 1.4, -1.0);
    // Right wing (Entrance & Garage/Study)
    addBox(4.0, 2.6, 4.2, plasterMat, 3.6, 1.3, -1.3);

    // Ground Floor Recessed Interior Glow Backing
    addBox(5.2, 2.1, 0.15, interiorGlowMat, -1.6, 1.25, 1.25, false, false);
    // Ground Floor Glass Curtain Wall + Mullions
    addBox(5.2, 2.15, 0.06, glassMat, -1.6, 1.28, 1.42, false, false);
    addBox(5.3, 0.08, 0.12, darkTrimMat, -1.6, 2.35, 1.42);
    addBox(5.3, 0.08, 0.12, darkTrimMat, -1.6, 0.22, 1.42);
    for (let i = -2; i <= 2; i++) {
      addBox(0.07, 2.15, 0.1, darkTrimMat, -1.6 + i * 1.28, 1.28, 1.42);
    }

    // Grand Entrance Door & Canopy
    addBox(1.6, 2.3, 0.18, darkTrimMat, 2.9, 1.15, 0.82);
    addBox(1.38, 2.15, 0.2, woodMat, 2.9, 1.12, 0.84);
    addBox(0.05, 1.2, 0.06, goldMat, 3.32, 1.15, 0.96); // Gold door handle
    addBox(2.2, 0.14, 1.2, darkTrimMat, 2.9, 2.42, 1.3); // Entry canopy
    addBox(1.9, 0.04, 0.12, ledStripMat, 2.9, 2.34, 1.75, false, false); // Canopy LED
    addBox(1.9, 0.14, 0.8, marbleMat, 2.9, 0.07, 1.25, false, true); // Entry step

    // 3. UPPER FLOOR CANTILEVERED VOLUME
    addBox(7.4, 2.55, 4.6, plasterMat, 0.3, 4.05, -0.7);
    // Vertical Wood Louvers (Architectural Slats) on upper right facade
    for (let i = 0; i < 9; i++) {
      addBox(0.08, 2.35, 0.18, woodMat, 2.45 + i * 0.18, 4.05, 1.62);
    }

    // Upper Floor Interior Glow + Glass Wall + Mullions
    addBox(4.4, 1.85, 0.15, interiorGlowMat, -0.8, 3.95, 1.48, false, false);
    addBox(4.4, 1.9, 0.06, glassMat, -0.8, 3.98, 1.62, false, false);
    addBox(4.5, 0.08, 0.12, darkTrimMat, -0.8, 4.92, 1.62);
    addBox(4.5, 0.08, 0.12, darkTrimMat, -0.8, 3.04, 1.62);
    for (let i = -1; i <= 1; i++) {
      addBox(0.07, 1.9, 0.1, darkTrimMat, -0.8 + i * 1.45, 3.98, 1.62);
    }

    // Upper Balcony Slab + Frameless Glass Balustrade + Gold Handrail
    addBox(5.2, 0.16, 1.5, marbleMat, -0.8, 2.86, 2.25);
    addBox(5.1, 0.78, 0.05, glassMat, -0.8, 3.33, 2.96, false, false);
    addBox(5.16, 0.05, 0.07, goldMat, -0.8, 3.74, 2.96, false, false);
    // Side balcony glass
    addBox(0.05, 0.78, 1.4, glassMat, -3.35, 3.33, 2.25, false, false);
    addBox(0.05, 0.78, 1.4, glassMat, 1.75, 3.33, 2.25, false, false);

    // Roof Fascia, Overhang & Warm LED Cove
    addBox(7.9, 0.22, 5.1, darkTrimMat, 0.3, 5.42, -0.65);
    addBox(7.96, 0.07, 5.16, goldMat, 0.3, 5.3, -0.65, false, false);
    addBox(7.4, 0.05, 0.1, ledStripMat, 0.3, 5.26, 1.82, false, false);

    // 4. INFINITY SWIMMING POOL & WOODEN DECK
    addBox(8.6, 0.18, 4.2, deckWoodMat, -1.2, 0.09, 3.4, false, true);
    // Pool basin rim
    addBox(5.2, 0.22, 2.6, marbleMat, -2.3, 0.11, 3.4, false, true);
    addBox(4.8, 0.2, 2.2, poolTileMat, -2.3, 0.12, 3.4, false, true);
    // Animated Water Surface
    const waterMesh = new THREE.Mesh(new THREE.BoxGeometry(4.78, 0.16, 2.18), poolWaterMat);
    waterMesh.position.set(-2.3, 0.17, 3.4);
    villa.add(waterMesh);

    // 5. POOLSIDE SUN LOUNGERS & UMBRELLA
    const createLounger = (x, z) => {
      const g = new THREE.Group();
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.12, 1.65), darkTrimMat);
      frame.position.y = 0.22;
      frame.castShadow = true;
      g.add(frame);

      const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.08, 1.15), fabricWhiteMat);
      cushion.position.set(0, 0.31, 0.2);
      cushion.castShadow = true;
      g.add(cushion);

      const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.08, 0.52), fabricWhiteMat);
      backrest.position.set(0, 0.45, -0.55);
      backrest.rotation.x = 0.55;
      backrest.castShadow = true;
      g.add(backrest);

      g.position.set(x, 0, z);
      villa.add(g);
    };
    createLounger(0.85, 3.9);
    createLounger(1.8, 3.9);

    // Modern Pool Umbrella
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.1, 10), darkTrimMat);
    pole.position.set(1.32, 1.15, 3.15);
    pole.castShadow = true;
    villa.add(pole);
    const canopy = new THREE.Mesh(new THREE.ConeGeometry(1.15, 0.32, 6), fabricWhiteMat);
    canopy.position.set(1.32, 2.2, 3.15);
    canopy.castShadow = true;
    villa.add(canopy);

    // 6. PERGOLA & OUTDOOR LOUNGE
    const pergolaPosts = [
      [-6.2, 2.0],
      [-6.2, 4.4],
      [-5.0, 4.4],
    ];
    pergolaPosts.forEach(([px, pz]) => {
      addBox(0.12, 2.5, 0.12, darkTrimMat, px, 1.25, pz);
    });
    addBox(1.5, 0.1, 2.7, darkTrimMat, -5.6, 2.52, 3.2);
    for (let i = 0; i < 6; i++) {
      addBox(1.4, 0.06, 0.09, woodMat, -5.6, 2.58, 2.1 + i * 0.44);
    }

    // 7. SLEEK MODERN CAR IN DRIVEWAY
    const car = new THREE.Group();
    const carChassis = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.48, 3.3), carBodyMat);
    carChassis.position.y = 0.42;
    carChassis.castShadow = true;
    car.add(carChassis);

    const carCabin = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.42, 1.75), glassMat);
    carCabin.position.set(0, 0.82, -0.15);
    carCabin.castShadow = true;
    car.add(carCabin);

    const carRoof = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.07, 1.5), carBodyMat);
    carRoof.position.set(0, 1.04, -0.18);
    car.add(carRoof);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.18, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    [
      [-0.74, 0.24, 1.0],
      [0.74, 0.24, 1.0],
      [-0.74, 0.24, -1.0],
      [0.74, 0.24, -1.0],
    ].forEach(([wx, wy, wz]) => {
      const wheel = new THREE.Mesh(wheelGeo, darkTrimMat);
      wheel.position.set(wx, wy, wz);
      wheel.castShadow = true;
      car.add(wheel);
    });

    // Subtle Headlights
    const headlightMat = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      emissive: '#e0f2fe',
      emissiveIntensity: 0.6,
    });
    const hl1 = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.09, 0.05), headlightMat);
    hl1.position.set(-0.52, 0.48, 1.66);
    car.add(hl1);
    const hl2 = hl1.clone();
    hl2.position.x = 0.52;
    car.add(hl2);

    car.position.set(5.2, 0.08, 3.0);
    villa.add(car);

    // 8. ARCHITECTURAL TREES, HEDGES & GARDEN BOLLARD LIGHTS
    const createTree = (x, z, scale = 1) => {
      const t = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 1.1, 8), woodMat);
      trunk.position.y = 0.55;
      trunk.castShadow = true;
      t.add(trunk);

      const crown1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.68, 1), foliageMat);
      crown1.position.set(0, 1.45, 0);
      crown1.castShadow = true;
      t.add(crown1);

      const crown2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.48, 1), foliageMat);
      crown2.position.set(0.32, 1.85, 0.15);
      crown2.castShadow = true;
      t.add(crown2);

      t.scale.setScalar(scale);
      t.position.set(x, 0, z);
      villa.add(t);
    };

    createTree(-6.3, -3.5, 1.25);
    createTree(-6.1, -0.5, 0.95);
    createTree(6.3, -3.4, 1.15);
    createTree(-6.2, 5.2, 0.85);

    // Manicured Perimeter Hedges
    addBox(14.4, 0.55, 0.45, hedgeMat, 0, 0.28, -5.2);
    addBox(0.45, 0.55, 10.6, hedgeMat, -7.1, 0.28, 0.2);
    addBox(5.2, 0.45, 0.4, hedgeMat, -4.4, 0.22, 6.0);

    // Pathway Bollard Lights
    [
      [1.9, 2.4],
      [1.9, 4.2],
      [3.9, 2.4],
      [3.9, 4.2],
    ].forEach(([bx, bz]) => {
      addBox(0.1, 0.45, 0.1, darkTrimMat, bx, 0.22, bz);
      addBox(0.11, 0.08, 0.11, ledStripMat, bx, 0.42, bz, false, false);
    });

    scene.add(villa);

    // ==========================================
    // ANIMATION LOOP
    // ==========================================
    let frameId;
    const startTime = performance.now();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startTime) * 0.001;

      // Subtle pool water shimmer
      waterMesh.position.y = 0.17 + Math.sin(elapsed * 2.2) * 0.012;

      // Smooth camera preset transition
      if (targetCamRef.current) {
        const { pos, target } = targetCamRef.current;
        camera.position.lerp(pos, 0.07);
        controls.target.lerp(target, 0.07);
        if (camera.position.distanceTo(pos) < 0.08) {
          targetCamRef.current = null;
        }
      }

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      controls.removeEventListener('start', onControlStart);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  useEffect(() => {
    if (matsRef.current.plasterMat) {
      matsRef.current.plasterMat.color.set(finishColor);
    }
  }, [finishColor]);

  useEffect(() => {
    const {
      scene,
      hemiLight,
      sunLight,
      rimLight,
      warmInterior1,
      warmInterior2,
      poolLight,
      entranceLight,
    } = lightsRef.current;
    const { interiorGlowMat, ledStripMat, poolWaterMat } = matsRef.current;
    if (!scene) return;

    if (isNight) {
      scene.background = new THREE.Color('#090b10');
      scene.fog = new THREE.FogExp2('#090b10', 0.022);
      hemiLight.intensity = 0.22;
      sunLight.intensity = 0.25;
      rimLight.intensity = 0.55;
      warmInterior1.intensity = 3.4;
      warmInterior2.intensity = 3.0;
      poolLight.intensity = 3.2;
      entranceLight.intensity = 2.6;
      if (interiorGlowMat) interiorGlowMat.emissiveIntensity = 1.45;
      if (ledStripMat) ledStripMat.emissiveIntensity = 2.2;
      if (poolWaterMat) poolWaterMat.emissiveIntensity = 0.65;
    } else {
      scene.background = new THREE.Color('#141619');
      scene.fog = new THREE.FogExp2('#141619', 0.018);
      hemiLight.intensity = 0.75;
      sunLight.intensity = 1.9;
      rimLight.intensity = 0.45;
      warmInterior1.intensity = 0;
      warmInterior2.intensity = 0;
      poolLight.intensity = 0;
      entranceLight.intensity = 0;
      if (interiorGlowMat) interiorGlowMat.emissiveIntensity = 0.15;
      if (ledStripMat) ledStripMat.emissiveIntensity = 0.25;
      if (poolWaterMat) poolWaterMat.emissiveIntensity = 0.15;
    }
  }, [isNight]);

  const rotateVilla = (angle) => {
    if (villaGroupRef.current) {
      villaGroupRef.current.rotation.y += angle;
    }
  };

  const selectCameraView = (view) => {
    setActiveView(view.id);
    targetCamRef.current = {
      pos: new THREE.Vector3(...view.pos),
      target: new THREE.Vector3(...view.target),
    };
  };

  const resetCamera = () => {
    if (villaGroupRef.current) {
      villaGroupRef.current.rotation.y = 0;
    }
    selectCameraView(CAMERA_VIEWS[0]);
  };

  return (
    <div className="relative w-full h-[360px] sm:h-[450px] lg:h-[520px] border border-black/15 dark:border-white/15 bg-[#141619] overflow-hidden shadow-2xl animate-fade-up delay-200">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing touch-none" />

      {/* Top Left Badge */}
      <div className="absolute top-3 left-3 px-2.5 sm:px-3 py-1 bg-[#111111]/85 backdrop-blur-sm border border-white/15 text-[10px] sm:text-[11px] uppercase tracking-wider text-[#C59B27] font-semibold">
        <span className="sm:hidden">3D Villa</span>
        <span className="hidden sm:inline">Interactive 3D Villa — Drag to Rotate</span>
      </div>

      {/* Top Right Quick Camera Presets */}
      <div className="absolute top-3 right-3 flex items-center gap-1 bg-[#111111]/85 backdrop-blur-sm border border-white/15 p-1">
        {CAMERA_VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => selectCameraView(v)}
            className={`px-2 py-1 text-[10px] uppercase tracking-wider font-semibold transition-colors cursor-pointer ${
              activeView === v.id
                ? 'bg-[#C59B27] text-[#111111]'
                : 'text-white/70 hover:text-white'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Bottom Left: Exterior Finish Color Swatches */}
      <div className="absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 bg-[#111111]/90 backdrop-blur-sm border border-white/15">
        <span className="hidden sm:inline text-[10px] uppercase tracking-wider text-white/60 mr-1">
          Finish
        </span>
        {FINISH_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setFinishColor(opt.color)}
            title={opt.label}
            style={{ backgroundColor: opt.color }}
            className={`w-4 h-4 rounded-full border transition-transform cursor-pointer ${
              finishColor === opt.color
                ? 'border-[#C59B27] scale-125'
                : 'border-white/30 hover:scale-110'
            }`}
          />
        ))}
      </div>

      {/* Bottom Right: Camera & Lighting Controls */}
      <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 flex items-center gap-1 sm:gap-1.5">
        <button
          type="button"
          onClick={() => setAutoRotate((prev) => !prev)}
          title={autoRotate ? 'Pause Rotation' : 'Auto Rotate'}
          className="p-1.5 sm:p-2 bg-[#111111]/90 border border-white/15 text-[#C59B27] hover:border-[#C59B27] active:scale-90 transition-all cursor-pointer"
        >
          {autoRotate ? <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
        </button>
        <button
          type="button"
          onClick={() => rotateVilla(-0.4)}
          title="Rotate Left"
          className="p-1.5 sm:p-2 bg-[#111111]/90 border border-white/15 text-white hover:border-[#C59B27] active:scale-90 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button
          type="button"
          onClick={() => rotateVilla(0.4)}
          title="Rotate Right"
          className="p-1.5 sm:p-2 bg-[#111111]/90 border border-white/15 text-white hover:border-[#C59B27] active:scale-90 transition-all cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button
          type="button"
          onClick={resetCamera}
          title="Reset View"
          className="p-1.5 sm:p-2 bg-[#111111]/90 border border-white/15 text-white hover:border-[#C59B27] active:scale-90 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button
          type="button"
          onClick={() => setIsNight((prev) => !prev)}
          title="Toggle Day/Night"
          className="p-1.5 sm:p-2 bg-[#111111]/90 border border-white/15 text-[#C59B27] hover:border-[#C59B27] active:scale-90 transition-all cursor-pointer"
        >
          {isNight ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
        </button>
      </div>
    </div>
  );
}