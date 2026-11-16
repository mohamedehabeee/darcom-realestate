import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RotateCcw, RotateCw, RefreshCw, Sun, Moon, Play, Pause } from 'lucide-react';

const FINISH_OPTIONS = [
  { id: 'white', label: 'Warm White', color: '#FAF8F5' },
  { id: 'concrete', label: 'Concrete Grey', color: '#787672' },
  { id: 'charcoal', label: 'Charcoal', color: '#2B2B2B' },
];

export default function Villa3DViewer() {
  const mountRef = useRef(null);
  const villaGroupRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const lightsRef = useRef({});
  const plasterMatRef = useRef(null);

  const [isNight, setIsNight] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [finishColor, setFinishColor] = useState('#FAF8F5');

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#161616');

    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(11, 7.5, 12);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.9;
    controls.minDistance = 7;
    controls.maxDistance = 24;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controlsRef.current = controls;

    // Lighting
    const ambient = new THREE.AmbientLight('#ffffff', 0.65);
    scene.add(ambient);

    const sunLight = new THREE.DirectionalLight('#fff5e4', 1.4);
    sunLight.position.set(12, 16, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    const warmInterior = new THREE.PointLight('#C59B27', 0, 14);
    warmInterior.position.set(0, 2.2, 1.5);
    scene.add(warmInterior);

    const poolLight = new THREE.PointLight('#38bdf8', 0, 8);
    poolLight.position.set(-1.4, 0.7, 2.8);
    scene.add(poolLight);

    lightsRef.current = { scene, ambient, sunLight, warmInterior, poolLight };

    // Villa Group
    const villa = new THREE.Group();
    villaGroupRef.current = villa;

    const plasterMat = new THREE.MeshStandardMaterial({ color: '#FAF8F5', roughness: 0.7 });
    plasterMatRef.current = plasterMat;

    const darkTrimMat = new THREE.MeshStandardMaterial({ color: '#1A1A1A', roughness: 0.5 });
    const goldMat = new THREE.MeshStandardMaterial({ color: '#C59B27', metalness: 0.6, roughness: 0.3 });
    const glassMat = new THREE.MeshStandardMaterial({
      color: '#9ec5d6',
      transparent: true,
      opacity: 0.55,
      roughness: 0.1,
      metalness: 0.2,
    });
    const lawnMat = new THREE.MeshStandardMaterial({ color: '#2b332b', roughness: 0.9 });
    const poolMat = new THREE.MeshStandardMaterial({
      color: '#1b6b88',
      roughness: 0.15,
      metalness: 0.1,
    });

    // Plot base
    const base = new THREE.Mesh(new THREE.BoxGeometry(12, 0.3, 10), lawnMat);
    base.position.y = -0.15;
    base.receiveShadow = true;
    villa.add(base);

    // Main ground floor & side wing
    const groundFloor = new THREE.Mesh(new THREE.BoxGeometry(6.4, 2.6, 4.4), plasterMat);
    groundFloor.position.set(-1.2, 1.3, -0.8);
    groundFloor.castShadow = true;
    groundFloor.receiveShadow = true;
    villa.add(groundFloor);

    const sideWing = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.4, 3.6), plasterMat);
    sideWing.position.set(3.2, 1.2, -1.2);
    sideWing.castShadow = true;
    sideWing.receiveShadow = true;
    villa.add(sideWing);

    // Upper floor cantilevered volume
    const upperFloor = new THREE.Mesh(new THREE.BoxGeometry(5.6, 2.3, 4.0), plasterMat);
    upperFloor.position.set(0.4, 3.75, -0.6);
    upperFloor.castShadow = true;
    upperFloor.receiveShadow = true;
    villa.add(upperFloor);

    // Roof fascia & gold trim
    const roofTrim = new THREE.Mesh(new THREE.BoxGeometry(5.9, 0.18, 4.3), darkTrimMat);
    roofTrim.position.set(0.4, 4.95, -0.6);
    villa.add(roofTrim);

    const goldAccent = new THREE.Mesh(new THREE.BoxGeometry(5.94, 0.06, 4.34), goldMat);
    goldAccent.position.set(0.4, 4.86, -0.6);
    villa.add(goldAccent);

    // Glass curtain walls
    const frontGlass = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.9, 0.1), glassMat);
    frontGlass.position.set(-1.2, 1.2, 1.42);
    villa.add(frontGlass);

    const upperGlass = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.6, 0.1), glassMat);
    upperGlass.position.set(0.4, 3.7, 1.42);
    villa.add(upperGlass);

    // Entrance frame
    const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.1, 0.2), darkTrimMat);
    doorFrame.position.set(2.8, 1.05, 0.6);
    villa.add(doorFrame);

    // Terrace deck & Swimming pool
    const deck = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.12, 3.2), darkTrimMat);
    deck.position.set(-0.6, 0.06, 2.6);
    deck.receiveShadow = true;
    villa.add(deck);

    const pool = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.14, 2.0), poolMat);
    pool.position.set(-1.4, 0.08, 2.8);
    villa.add(pool);

    // Pergola over right terrace
    const post1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.4, 0.12), darkTrimMat);
    post1.position.set(1.4, 1.2, 3.8);
    post1.castShadow = true;
    villa.add(post1);

    const post2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.4, 0.12), darkTrimMat);
    post2.position.set(2.8, 1.2, 3.8);
    post2.castShadow = true;
    villa.add(post2);

    const pergolaFrame = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.1, 2.5), darkTrimMat);
    pergolaFrame.position.set(2.1, 2.42, 2.65);
    pergolaFrame.castShadow = true;
    villa.add(pergolaFrame);

    for (let i = 0; i < 5; i++) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.06, 0.08), goldMat);
      slat.position.set(2.1, 2.48, 1.7 + i * 0.48);
      villa.add(slat);
    }

    scene.add(villa);

    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
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
    if (plasterMatRef.current) {
      plasterMatRef.current.color.set(finishColor);
    }
  }, [finishColor]);

  useEffect(() => {
    const { scene, ambient, sunLight, warmInterior, poolLight } = lightsRef.current;
    if (!scene) return;
    if (isNight) {
      scene.background = new THREE.Color('#0b0c10');
      ambient.intensity = 0.25;
      sunLight.intensity = 0.35;
      warmInterior.intensity = 2.8;
      poolLight.intensity = 2.4;
    } else {
      scene.background = new THREE.Color('#161616');
      ambient.intensity = 0.65;
      sunLight.intensity = 1.4;
      warmInterior.intensity = 0;
      poolLight.intensity = 0;
    }
  }, [isNight]);

  const rotateVilla = (angle) => {
    if (villaGroupRef.current) {
      villaGroupRef.current.rotation.y += angle;
    }
  };

  const resetCamera = () => {
    if (cameraRef.current && controlsRef.current && villaGroupRef.current) {
      cameraRef.current.position.set(11, 7.5, 12);
      villaGroupRef.current.rotation.y = 0;
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  return (
    <div className="relative w-full h-[320px] sm:h-[420px] lg:h-[460px] border border-black/15 dark:border-white/15 bg-[#161616] overflow-hidden animate-fade-up delay-200">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing touch-none" />

      <div className="absolute top-3 left-3 px-2.5 sm:px-3 py-1 bg-[#111111]/85 border border-white/15 text-[10px] sm:text-[11px] uppercase tracking-wider text-[#C59B27]">
        Interactive 3D Villa — Drag to Rotate
      </div>

      {/* Exterior Finish Color Swatches */}
      <div className="absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 bg-[#111111]/90 border border-white/15">
        <span className="hidden sm:inline text-[10px] uppercase tracking-wider text-white/60 mr-1">
          Finish
        </span>
        {FINISH_OPTIONS.map((opt) => (
          <button
            key={opt.id}
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

      {/* Camera & Lighting Controls */}
      <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 flex items-center gap-1 sm:gap-1.5">
        <button
          onClick={() => setAutoRotate((prev) => !prev)}
          title={autoRotate ? 'Pause Rotation' : 'Auto Rotate'}
          className="p-1.5 sm:p-2 bg-[#111111]/90 border border-white/15 text-[#C59B27] hover:border-[#C59B27] active:scale-90 transition-all cursor-pointer"
        >
          {autoRotate ? <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
        </button>
        <button
          onClick={() => rotateVilla(-0.4)}
          title="Rotate Left"
          className="p-1.5 sm:p-2 bg-[#111111]/90 border border-white/15 text-white hover:border-[#C59B27] active:scale-90 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button
          onClick={() => rotateVilla(0.4)}
          title="Rotate Right"
          className="p-1.5 sm:p-2 bg-[#111111]/90 border border-white/15 text-white hover:border-[#C59B27] active:scale-90 transition-all cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button
          onClick={resetCamera}
          title="Reset View"
          className="p-1.5 sm:p-2 bg-[#111111]/90 border border-white/15 text-white hover:border-[#C59B27] active:scale-90 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
        <button
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