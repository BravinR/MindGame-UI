import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Map as MapIcon, Wind, Compass, Landmark, History, Move } from 'lucide-react';

// --- Constants & Types ---
const CITY_SIZE = 200;
const BUILDING_COUNT = 400;

// --- Components ---

const Overlay = ({ onToggleInfo }: { onToggleInfo: () => void }) => {
  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-8 z-10">
      <header className="flex justify-between items-start">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <h1 className="font-display text-4xl tracking-widest text-amber-100/90">ROMA</h1>
          <p className="font-serif italic text-sm text-amber-200/50">Aeterna • Medievalis</p>
        </motion.div>
        
        <div className="flex gap-4 pointer-events-auto">
          <button 
            onClick={onToggleInfo}
            className="p-3 rounded-full glass-panel hover:bg-amber-900/20 transition-colors text-amber-100/80"
          >
            <Info size={20} />
          </button>
        </div>
      </header>

      <div className="flex flex-col items-center justify-center flex-1">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
          className="glass-panel px-6 py-3 rounded-full flex items-center gap-4 text-amber-100/60 text-xs tracking-[0.2em] uppercase font-sans"
        >
          <div className="flex gap-1">
            <span className="px-2 py-1 border border-amber-500/30 rounded bg-amber-500/10">W</span>
            <span className="px-2 py-1 border border-amber-500/30 rounded bg-amber-500/10">A</span>
            <span className="px-2 py-1 border border-amber-500/30 rounded bg-amber-500/10">S</span>
            <span className="px-2 py-1 border border-amber-500/30 rounded bg-amber-500/10">D</span>
          </div>
          <span>to Explore</span>
        </motion.div>
      </div>

      <footer className="flex justify-between items-end">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-4 rounded-lg space-y-2 max-w-xs"
        >
          <div className="flex items-center gap-2 text-amber-200/70 text-xs uppercase tracking-widest font-sans font-semibold">
            <Compass size={14} />
            <span>Navigation</span>
          </div>
          <p className="text-xs text-amber-100/60 leading-relaxed">
            The city of ruins and rebirth. Navigate through the remnants of the Empire and the rising towers of the nobility.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-right space-y-1"
        >
          <div className="text-4xl font-display text-amber-100/20 select-none">MCCL</div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-amber-200/30">Anno Domini</div>
        </motion.div>
      </footer>
    </div>
  );
};

const InfoModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="glass-panel max-w-2xl w-full p-8 rounded-2xl overflow-hidden relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
            
            <div className="flex items-start gap-6">
              <div className="p-4 bg-amber-900/20 rounded-xl text-amber-400">
                <History size={32} />
              </div>
              <div className="space-y-4">
                <h2 className="font-display text-3xl text-amber-100">Rome in the Middle Ages</h2>
                <div className="space-y-4 text-amber-100/70 font-serif leading-relaxed">
                  <p>
                    By the 12th century, Rome was a city of dramatic contrasts. The vast monuments of the Roman Empire stood as crumbling giants, often repurposed as fortresses by warring noble families like the Frangipani and the Orsini.
                  </p>
                  <p>
                    The population had shrunk significantly from its imperial peak, clustering near the Tiber and around the great basilicas. This visualization captures the "Abitato" — the inhabited core — where medieval towers rose amidst the ruins of antiquity.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-4 border border-amber-500/10 rounded-lg bg-amber-500/5">
                    <div className="flex items-center gap-2 text-amber-400 text-xs uppercase tracking-wider mb-1">
                      <Landmark size={14} />
                      <span>Monuments</span>
                    </div>
                    <p className="text-xs text-amber-100/50">Repurposed ruins of the Forum and Colosseum.</p>
                  </div>
                  <div className="p-4 border border-amber-500/10 rounded-lg bg-amber-500/5">
                    <div className="flex items-center gap-2 text-amber-400 text-xs uppercase tracking-wider mb-1">
                      <Wind size={14} />
                      <span>Atmosphere</span>
                    </div>
                    <p className="text-xs text-amber-100/50">Dusty, golden light of the Roman Campagna.</p>
                  </div>
                </div>

                <button 
                  onClick={onClose}
                  className="mt-6 w-full py-3 bg-amber-700/20 hover:bg-amber-700/40 border border-amber-500/30 text-amber-100 font-display tracking-widest transition-all rounded-lg"
                >
                  RETURN TO THE CITY
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showInfo, setShowInfo] = useState(false);
  const keys = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (!containerRef.current) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0502);
    scene.fog = new THREE.FogExp2(0x0a0502, 0.008);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 40, 100);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffd59e, 2.5);
    sunLight.position.set(50, 100, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 500;
    sunLight.shadow.camera.left = -100;
    sunLight.shadow.camera.right = 100;
    sunLight.shadow.camera.top = 100;
    sunLight.shadow.camera.bottom = -100;
    scene.add(sunLight);

    // --- Ground ---
    const groundGeo = new THREE.PlaneGeometry(1000, 1000);
    const groundMat = new THREE.MeshStandardMaterial({ 
      color: 0x1a1510,
      roughness: 0.9,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // --- Warrior Character ---
    const createWarrior = () => {
      const group = new THREE.Group();

      // Armor Material
      const armorMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.8, roughness: 0.2 });
      const skinMat = new THREE.MeshStandardMaterial({ color: 0xd2b48c });
      const capeMat = new THREE.MeshStandardMaterial({ color: 0x8b0000, side: THREE.DoubleSide });

      // Body
      const body = new THREE.Mesh(new THREE.BoxGeometry(1, 1.5, 0.6), armorMat);
      body.position.y = 1.25;
      body.castShadow = true;
      group.add(body);

      // Head / Helmet
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), armorMat);
      head.position.y = 2.3;
      head.castShadow = true;
      group.add(head);

      // Helmet Slit
      const slit = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.1), new THREE.MeshBasicMaterial({ color: 0x000000 }));
      slit.position.set(0, 2.35, 0.3);
      group.add(slit);

      // Arms
      const armGeo = new THREE.BoxGeometry(0.3, 1, 0.3);
      const leftArm = new THREE.Mesh(armGeo, armorMat);
      leftArm.position.set(-0.7, 1.5, 0);
      leftArm.castShadow = true;
      group.add(leftArm);

      const rightArm = new THREE.Mesh(armGeo, armorMat);
      rightArm.position.set(0.7, 1.5, 0);
      rightArm.castShadow = true;
      group.add(rightArm);

      // Legs
      const legGeo = new THREE.BoxGeometry(0.4, 1, 0.4);
      const leftLeg = new THREE.Mesh(legGeo, armorMat);
      leftLeg.position.set(-0.3, 0.5, 0);
      leftLeg.castShadow = true;
      group.add(leftLeg);

      const rightLeg = new THREE.Mesh(legGeo, armorMat);
      rightLeg.position.set(0.3, 0.5, 0);
      rightLeg.castShadow = true;
      group.add(rightLeg);

      // Cape
      const cape = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2), capeMat);
      cape.position.set(0, 1.3, -0.35);
      cape.rotation.x = 0.1;
      group.add(cape);

      // Sword
      const swordGroup = new THREE.Group();
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.5, 0.05), new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.9 }));
      blade.position.y = 0.75;
      swordGroup.add(blade);
      
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.1), new THREE.MeshStandardMaterial({ color: 0x4a3728 }));
      swordGroup.add(handle);

      swordGroup.position.set(0.8, 1.2, 0.3);
      swordGroup.rotation.x = -Math.PI / 4;
      group.add(swordGroup);

      return group;
    };

    const warrior = createWarrior();
    warrior.position.set(0, 0, 0);
    scene.add(warrior);

    // --- City Generation ---
    const buildingGroup = new THREE.Group();
    scene.add(buildingGroup);

    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x4a4540 });
    const ruinMat = new THREE.MeshStandardMaterial({ color: 0x5a5045, roughness: 1 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x3a2015 });

    const createHouse = (x: number, z: number) => {
      const h = 4 + Math.random() * 8;
      const w = 3 + Math.random() * 2;
      const d = 3 + Math.random() * 2;
      const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), stoneMat);
      body.position.set(x, h / 2, z);
      body.castShadow = true;
      body.receiveShadow = true;
      const roof = new THREE.Mesh(new THREE.ConeGeometry(w * 0.8, 3, 4), roofMat);
      roof.position.set(x, h + 1.5, z);
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      buildingGroup.add(body, roof);
    };

    const createRuin = (x: number, z: number) => {
      const type = Math.random();
      if (type > 0.7) {
        const archGroup = new THREE.Group();
        const p1 = new THREE.Mesh(new THREE.BoxGeometry(2, 15, 2), ruinMat);
        p1.position.set(-4, 7.5, 0);
        const p2 = new THREE.Mesh(new THREE.BoxGeometry(2, 15, 2), ruinMat);
        p2.position.set(4, 7.5, 0);
        const top = new THREE.Mesh(new THREE.BoxGeometry(12, 3, 3), ruinMat);
        top.position.set(0, 16, 0);
        archGroup.add(p1, p2, top);
        archGroup.position.set(x, 0, z);
        archGroup.rotation.y = Math.random() * Math.PI;
        archGroup.castShadow = true;
        buildingGroup.add(archGroup);
      } else {
        const colCount = 3 + Math.floor(Math.random() * 5);
        for (let i = 0; i < colCount; i++) {
          const ch = 5 + Math.random() * 15;
          const col = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, ch, 8), ruinMat);
          col.position.set(x + (i * 4) - (colCount * 2), ch / 2, z);
          col.castShadow = true;
          buildingGroup.add(col);
        }
      }
    };

    for (let i = 0; i < BUILDING_COUNT; i++) {
      const x = (Math.random() - 0.5) * CITY_SIZE;
      const z = (Math.random() - 0.5) * CITY_SIZE;
      if (Math.sqrt(x*x + z*z) < 20) continue;
      if (Math.random() > 0.8) createRuin(x, z);
      else createHouse(x, z);
    }

    // --- Input Handling ---
    const onKeyDown = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = true; };
    const onKeyUp = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // --- Animation ---
    const moveSpeed = 0.5;
    const rotateSpeed = 0.05;
    const cameraOffset = new THREE.Vector3(0, 10, 20);

    const animate = () => {
      requestAnimationFrame(animate);

      // Movement
      if (keys.current['w']) {
        warrior.translateZ(moveSpeed);
      }
      if (keys.current['s']) {
        warrior.translateZ(-moveSpeed);
      }
      if (keys.current['a']) {
        warrior.rotation.y += rotateSpeed;
      }
      if (keys.current['d']) {
        warrior.rotation.y -= rotateSpeed;
      }

      // Camera Follow
      const relativeCameraOffset = cameraOffset.clone().applyMatrix4(warrior.matrixWorld);
      camera.position.lerp(relativeCameraOffset, 0.1);
      camera.lookAt(warrior.position.x, warrior.position.y + 2, warrior.position.z);

      renderer.render(scene, camera);
    };

    animate();

    // --- Resize Handler ---
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <div ref={containerRef} className="absolute inset-0" />
      
      <Overlay onToggleInfo={() => setShowInfo(true)} />
      
      <InfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />

      {/* Vignette effect */}
      <div className="fixed inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />
      
      {/* Dust particles simulation (CSS) */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05)_1px,_transparent_1px)] bg-[length:40px_40px] animate-[pulse_8s_infinite]" />
      </div>
    </div>
  );
}
