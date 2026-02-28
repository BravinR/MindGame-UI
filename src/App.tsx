import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Map as MapIcon, Wind, Compass, Landmark, History, Move, Users, Sun, Sword, Snowflake, Mountain } from 'lucide-react';
import sceneConfig from './sceneConfig.json';


// --- Icon Mapping ---
const IconMap: { [key: string]: React.ElementType } = {
  Info,
  MapIcon,
  Wind,
  Compass,
  Landmark,
  History,
  Move,
  Users,
  Sun,
  Sword,
  Snowflake,
  Mountain
};

// --- Types ---
type QuestNpc = { npcId: string; npcName: string; position: { x: number; z: number }; dialogue: string; completed: boolean };

// --- Components ---

const Overlay = ({ onToggleInfo }: { onToggleInfo: () => void }) => {
  const { theme } = sceneConfig;
  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-8 z-10">
      <header className="flex justify-between items-start">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <h1 className="font-display text-4xl tracking-widest text-slate-100 shadow-lg">{theme.title}</h1>
          <p className="font-serif italic text-sm text-slate-300/80">{theme.subtitle}</p>
        </motion.div>

        <div className="flex gap-4 pointer-events-auto">
          <button
            onClick={onToggleInfo}
            className="p-3 rounded-full glass-panel hover:bg-slate-700/40 transition-colors text-slate-100/90 border-slate-500/30"
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
          className="glass-panel px-6 py-3 rounded-full flex items-center gap-4 text-slate-100/80 text-xs tracking-[0.2em] uppercase font-sans border-slate-500/30"
        >
          <div className="flex gap-1">
            <span className="px-2 py-1 border border-slate-400/40 rounded bg-slate-400/20">W</span>
            <span className="px-2 py-1 border border-slate-400/40 rounded bg-slate-400/20">A</span>
            <span className="px-2 py-1 border border-slate-400/40 rounded bg-slate-400/20">S</span>
            <span className="px-2 py-1 border border-slate-400/40 rounded bg-slate-400/20">D</span>
            <span className="px-2 py-1 border border-slate-400/40 rounded bg-slate-400/20 ml-2">↑</span>
            <span className="px-2 py-1 border border-slate-400/40 rounded bg-slate-400/20">←</span>
            <span className="px-2 py-1 border border-slate-400/40 rounded bg-slate-400/20">↓</span>
            <span className="px-2 py-1 border border-slate-400/40 rounded bg-slate-400/20">→</span>
          </div>
          <span>to Roam the Tundra</span>
        </motion.div>
      </div>

      <footer className="flex justify-between items-end">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-panel p-4 rounded-lg space-y-2 max-w-xs border-slate-500/30"
        >
          <div className="flex items-center gap-2 text-slate-300 text-xs uppercase tracking-widest font-sans font-semibold">
            <Snowflake size={14} />
            <span>{theme.atmosphereLabel}</span>
          </div>
          <p className="text-xs text-slate-100/80 leading-relaxed">
            {theme.atmosphereDescription}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-right space-y-1"
        >
          <div className="text-4xl font-display text-slate-100/30 select-none tracking-tighter">{theme.era}</div>
          <div className="text-[10px] tracking-[0.3em] uppercase text-slate-300/50">{theme.eraLabel}</div>
        </motion.div>
      </footer>
    </div>
  );
};

const InfoModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { infoModal } = sceneConfig;
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="glass-panel max-w-2xl w-full p-8 rounded-2xl overflow-hidden relative border-slate-500/40"
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />

            <div className="flex items-start gap-6">
              <div className="p-4 bg-slate-700/30 rounded-xl text-slate-200">
                <Mountain size={32} />
              </div>
              <div className="space-y-4">
                <h2 className="font-display text-3xl text-slate-50">{infoModal.title}</h2>
                <div className="space-y-4 text-slate-100/90 font-serif leading-relaxed">
                  {infoModal.paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  {infoModal.stats.map((stat, i) => {
                    const Icon = IconMap[stat.icon] || Info;
                    return (
                      <div key={i} className="p-4 border border-slate-500/30 rounded-lg bg-slate-500/10">
                        <div className="flex items-center gap-2 text-slate-300 text-xs uppercase tracking-wider mb-1">
                          <Icon size={14} />
                          <span>{stat.label}</span>
                        </div>
                        <p className="text-xs text-slate-100/60">{stat.description}</p>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={onClose}
                  className="mt-6 w-full py-3 bg-slate-700/40 hover:bg-slate-700/60 border border-slate-400/50 text-slate-50 font-display tracking-widest transition-all rounded-lg shadow-lg"
                >
                  {infoModal.buttonLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

type Message = { from: 'player' | 'npc'; text: string };

const CHAT_API = '/api/chat';

const DialogueModal = ({ npc, onClose }: { npc: QuestNpc | null; onClose: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [conversationEnded, setConversationEnded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = async (currentNpc: QuestNpc, playerMessage: string) => {
    setIsLoading(true);
    setMessages(prev => [...prev, { from: 'player', text: playerMessage }]);
    try {
      const res = await fetch(CHAT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ npcId: currentNpc.npcId, playerMessage }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { from: 'npc', text: data.npcResponse }]);
      setConversationEnded(data.conversationEnded);
    } catch {
      setMessages(prev => [...prev, { from: 'npc', text: '(No response.)' }]);
      setConversationEnded(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!npc) {
      setMessages([]);
      setConversationEnded(false);
      setInputText('');
      setIsLoading(false);
      return;
    }
    sendMessage(npc, `Hey ${npc.npcName}, what have you been up to?`);
  }, [npc]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!npc || !inputText.trim() || isLoading) return;
    const msg = inputText.trim();
    setInputText('');
    sendMessage(npc, msg);
  };

  return (
    <AnimatePresence>
      {npc && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center pb-16 px-6 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="glass-panel max-w-xl w-full p-6 rounded-2xl relative border-slate-500/40"
            onClick={e => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent rounded-t-2xl" />
            <h2 className="font-display text-xl text-slate-50 mb-4 tracking-widest uppercase">{npc.npcName}</h2>

            {/* Chat messages */}
            <div className="space-y-2 max-h-56 overflow-y-auto mb-4 pr-1">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === 'player' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm font-serif leading-relaxed ${
                    msg.from === 'player'
                      ? 'bg-slate-500/30 text-slate-100/90'
                      : 'bg-slate-700/50 text-slate-100/90'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-700/50 px-3 py-2 rounded-lg text-slate-400 text-sm tracking-widest">...</div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input or Farewell */}
            {conversationEnded ? (
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-slate-700/40 hover:bg-slate-700/60 border border-slate-400/50 text-slate-50 font-display tracking-widest transition-all rounded-lg shadow-lg text-sm"
              >
                FAREWELL
              </button>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Say something..."
                  disabled={isLoading}
                  autoFocus
                  className="flex-1 bg-slate-700/30 border border-slate-500/40 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-slate-400/60 disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !inputText.trim()}
                  className="px-4 py-2 bg-slate-700/40 hover:bg-slate-700/60 border border-slate-400/50 text-slate-50 font-display tracking-widest transition-all rounded-lg text-sm disabled:opacity-40"
                >
                  SEND
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ObjectivesHUD = ({ objectives }: { objectives: QuestNpc[] }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed bottom-8 right-8 z-10 glass-panel p-4 rounded-lg border-slate-500/30 min-w-[220px] pointer-events-none"
    >
      <h3 className="text-[10px] font-sans font-semibold uppercase tracking-[0.25em] text-slate-300 mb-3">Objectives</h3>
      <ul className="space-y-2">
        {objectives.map(obj => (
          <li key={obj.npcId} className="flex items-start gap-2 text-xs">
            <span className={obj.completed ? 'text-green-400 mt-0.5' : 'text-slate-400 mt-0.5'}>
              {obj.completed ? '✓' : '○'}
            </span>
            <span className={obj.completed ? 'line-through text-slate-400/60' : 'text-slate-100/80'}>
              Find and talk to {obj.npcName}
            </span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showInfo, setShowInfo] = useState(false);
  const keys = useRef<{ [key: string]: boolean }>({});

  const [activeDialogue, setActiveDialogue] = useState<QuestNpc | null>(null);
  const [nearbyQuestNpc, setNearbyQuestNpc] = useState<QuestNpc | null>(null);
  const [questNpcData, setQuestNpcData] = useState<QuestNpc[]>([]);
  const [objectives, setObjectives] = useState<QuestNpc[]>([]);
  const nearbyQuestNpcRef = useRef<QuestNpc | null>(null);

  useEffect(() => {
    fetch('/api/state')
      .then(res => res.json())
      .then(data => {
        setQuestNpcData(data.objectives);
        setObjectives(data.objectives);
      });
  }, []);

  useEffect(() => {
    if (!containerRef.current || questNpcData.length === 0) return;

    const { scene: sceneSettings, materials } = sceneConfig;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    const skyColor = new THREE.Color(sceneSettings.skyColor);
    scene.background = skyColor;
    scene.fog = new THREE.FogExp2(skyColor, sceneSettings.fogDensity);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 40, 100);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(sceneSettings.ambientLight.color, sceneSettings.ambientLight.intensity);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(sceneSettings.sunLight.color, sceneSettings.sunLight.intensity);
    sunLight.position.set(50, 100, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 500;
    sunLight.shadow.camera.left = -150;
    sunLight.shadow.camera.right = 150;
    sunLight.shadow.camera.top = 150;
    sunLight.shadow.camera.bottom = -150;
    scene.add(sunLight);

    // --- Ground ---
    const groundGeo = new THREE.PlaneGeometry(1000, 1000);
    const groundMat = new THREE.MeshStandardMaterial({
      color: sceneSettings.groundColor,
      roughness: 0.9,
      metalness: 0.0
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // --- Dragonborn Character ---
    const createDragonborn = () => {
      const group = new THREE.Group();
      const ironMat = new THREE.MeshStandardMaterial({ color: materials.character.iron, metalness: 0.8, roughness: 0.3 });
      const furMat = new THREE.MeshStandardMaterial({ color: materials.character.fur, roughness: 1.0 });
      const skinMat = new THREE.MeshStandardMaterial({ color: materials.character.skin });

      // Body
      const body = new THREE.Mesh(new THREE.BoxGeometry(1, 1.5, 0.6), furMat);
      body.position.y = 1.25;
      body.castShadow = true;
      group.add(body);

      // Iron Chestplate
      const chest = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.8, 0.7), ironMat);
      chest.position.y = 1.5;
      group.add(chest);

      // Head / Horned Helmet
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.6), ironMat);
      head.position.y = 2.3;
      head.castShadow = true;
      group.add(head);

      // Horns
      const hornGeo = new THREE.ConeGeometry(0.15, 0.6, 8);
      const leftHorn = new THREE.Mesh(hornGeo, ironMat);
      leftHorn.position.set(-0.4, 2.6, 0);
      leftHorn.rotation.z = Math.PI / 4;
      group.add(leftHorn);

      const rightHorn = new THREE.Mesh(hornGeo, ironMat);
      rightHorn.position.set(0.4, 2.6, 0);
      rightHorn.rotation.z = -Math.PI / 4;
      group.add(rightHorn);

      // Arms
      const armGeo = new THREE.BoxGeometry(0.3, 1, 0.3);
      const leftArm = new THREE.Mesh(armGeo, furMat);
      leftArm.position.set(-0.7, 1.5, 0);
      leftArm.castShadow = true;
      group.add(leftArm);

      const rightArm = new THREE.Mesh(armGeo, furMat);
      rightArm.position.set(0.7, 1.5, 0);
      rightArm.castShadow = true;
      group.add(rightArm);

      // Legs
      const legGeo = new THREE.BoxGeometry(0.4, 1, 0.4);
      const leftLeg = new THREE.Mesh(legGeo, ironMat);
      leftLeg.position.set(-0.3, 0.5, 0);
      leftLeg.castShadow = true;
      group.add(leftLeg);

      const rightLeg = new THREE.Mesh(legGeo, ironMat);
      rightLeg.position.set(0.3, 0.5, 0);
      rightLeg.castShadow = true;
      group.add(rightLeg);

      // Shield
      const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.1, 16), ironMat);
      shield.rotation.x = Math.PI / 2;
      shield.position.set(-1.0, 1.5, 0.2);
      group.add(shield);

      // Sword
      const swordGroup = new THREE.Group();
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.5, 0.05), new THREE.MeshStandardMaterial({ color: materials.character.blade, metalness: 0.9 }));
      blade.position.y = 0.75;
      swordGroup.add(blade);
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.1), furMat);
      swordGroup.add(handle);
      swordGroup.position.set(1.0, 1.2, 0.3);
      swordGroup.rotation.x = -Math.PI / 4;
      group.add(swordGroup);

      return group;
    };

    const warrior = createDragonborn();
    warrior.position.set(0, 0, 0);
    scene.add(warrior);

    // --- NPCs ---
    const npcs: THREE.Group[] = [];
    const npcTargets: THREE.Vector3[] = [];
    const createNPC = () => {
      const group = new THREE.Group();
      const colors = [0x4a3728, 0x2c3e50, 0x34495e, 0x7f8c8d];
      const mat = new THREE.MeshStandardMaterial({ color: colors[Math.floor(Math.random() * colors.length)] });

      const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.4, 0.5), mat);
      body.position.y = 0.7;
      body.castShadow = true;
      group.add(body);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), new THREE.MeshStandardMaterial({ color: materials.character.skin }));
      head.position.y = 1.6;
      head.castShadow = true;
      group.add(head);

      return group;
    };

    for (let i = 0; i < sceneSettings.npcCount; i++) {
      const npc = createNPC();
      const x = (Math.random() - 0.5) * sceneSettings.citySize;
      const z = (Math.random() - 0.5) * sceneSettings.citySize;
      npc.position.set(x, 0, z);
      scene.add(npc);
      npcs.push(npc);
      npcTargets.push(new THREE.Vector3((Math.random() - 0.5) * sceneSettings.citySize, 0, (Math.random() - 0.5) * sceneSettings.citySize));
    }

    // --- Quest NPCs ---
    const questNpcObjects: { [id: string]: THREE.Group } = {};
    questNpcData.forEach((npcData) => {
      const npc = createNPC();
      npc.position.set(npcData.position.x, 0, npcData.position.z);
      scene.add(npc);
      questNpcObjects[npcData.npcId] = npc;
    });

    // --- Pine Trees ---
    const createTree = (x: number, z: number) => {
      const group = new THREE.Group();
      const trunkMat = new THREE.MeshStandardMaterial({ color: materials.environment.trunk });
      const leavesMat = new THREE.MeshStandardMaterial({ color: materials.environment.leaves });

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 4, 8), trunkMat);
      trunk.position.y = 2;
      trunk.castShadow = true;
      group.add(trunk);

      for (let i = 0; i < 3; i++) {
        const leaves = new THREE.Mesh(new THREE.ConeGeometry(2.5 - i * 0.5, 4, 8), leavesMat);
        leaves.position.y = 4 + i * 2.5;
        leaves.castShadow = true;
        group.add(leaves);
      }

      group.position.set(x, 0, z);
      scene.add(group);
    };

    for (let i = 0; i < sceneSettings.treeCount; i++) {
      const x = (Math.random() - 0.5) * sceneSettings.citySize * 1.5;
      const z = (Math.random() - 0.5) * sceneSettings.citySize * 1.5;
      if (Math.sqrt(x*x + z*z) < 40) continue;
      createTree(x, z);
    }

    // --- Nordic City Generation ---
    const buildingGroup = new THREE.Group();
    scene.add(buildingGroup);

    const stoneMat = new THREE.MeshStandardMaterial({ color: materials.buildings.stone, roughness: 0.9 });
    const woodMat = new THREE.MeshStandardMaterial({ color: materials.buildings.wood, roughness: 0.8 });
    const roofMat = new THREE.MeshStandardMaterial({ color: materials.buildings.roof });

    // --- Roads ---
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 1.0 });
    const roads = sceneConfig.worldState?.roads || [];
    roads.forEach((road: any) => {
      const start = new THREE.Vector3(road.start.x, 0.05, road.start.z);
      const end = new THREE.Vector3(road.end.x, 0.05, road.end.z);
      const distance = start.distanceTo(end);
      const roadGeo = new THREE.PlaneGeometry(road.width, distance);
      const roadMesh = new THREE.Mesh(roadGeo, roadMat);

      const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      roadMesh.position.set(midpoint.x, 0.05, midpoint.z);
      roadMesh.rotation.x = -Math.PI / 2;

      const angle = Math.atan2(end.x - start.x, end.z - start.z);
      roadMesh.rotation.z = angle;

      roadMesh.receiveShadow = true;
      scene.add(roadMesh);
    });

    // --- Landmarks ---
    const createTemple = (x: number, z: number, color: string) => {
      const templeGroup = new THREE.Group();
      const tStoneMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.7 });

      const base = new THREE.Mesh(new THREE.BoxGeometry(12, 2, 12), tStoneMat);
      base.position.y = 1;
      base.castShadow = true;
      base.receiveShadow = true;
      templeGroup.add(base);

      const pillarGeo = new THREE.CylinderGeometry(0.5, 0.5, 8, 8);
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) continue;
          const pillar = new THREE.Mesh(pillarGeo, tStoneMat);
          pillar.position.set(i * 4.5, 6, j * 4.5);
          pillar.castShadow = true;
          templeGroup.add(pillar);
        }
      }

      const tRoof = new THREE.Mesh(new THREE.BoxGeometry(14, 2, 14), tStoneMat);
      tRoof.position.y = 10.5;
      tRoof.castShadow = true;
      templeGroup.add(tRoof);

      const spire = new THREE.Mesh(new THREE.ConeGeometry(4, 8, 4), tStoneMat);
      spire.position.y = 15.5;
      spire.rotation.y = Math.PI / 4;
      spire.castShadow = true;
      templeGroup.add(spire);

      templeGroup.position.set(x, 0, z);
      buildingGroup.add(templeGroup);
    };

    const landmarks = sceneConfig.worldState?.landmarks || [];
    landmarks.forEach((landmark: any) => {
      if (landmark.type === 'temple') {
        createTemple(landmark.position.x, landmark.position.z, landmark.color);
      }
    });

    const createNordicHouse = (x: number, z: number) => {
      const h = 8 + Math.random() * 12;
      const w = 6 + Math.random() * 4;
      const d = 6 + Math.random() * 4;

      const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), stoneMat);
      body.position.set(x, h / 2, z);
      body.castShadow = true;
      body.receiveShadow = true;

      const beamGeo = new THREE.BoxGeometry(w + 0.2, 0.4, 0.4);
      for (let i = 0; i < 4; i++) {
        const beam = new THREE.Mesh(beamGeo, woodMat);
        beam.position.set(x, (h / 4) * (i + 1), z + d/2);
        buildingGroup.add(beam);
      }

      const roof = new THREE.Mesh(new THREE.ConeGeometry(w * 0.9, 6, 4), roofMat);
      roof.position.set(x, h + 3, z);
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;

      buildingGroup.add(body, roof);
    };

    const createNordicTower = (x: number, z: number) => {
      const h = 25 + Math.random() * 15;
      const w = 6;
      const tower = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), stoneMat);
      tower.position.set(x, h / 2, z);
      tower.castShadow = true;
      tower.receiveShadow = true;

      const top = new THREE.Mesh(new THREE.BoxGeometry(w + 1, 2, w + 1), stoneMat);
      top.position.set(x, h + 1, z);

      buildingGroup.add(tower, top);
    };

    const isOnRoadOrLandmark = (x: number, z: number) => {
      for (const road of roads) {
        const start = new THREE.Vector2(road.start.x, road.start.z);
        const end = new THREE.Vector2(road.end.x, road.end.z);
        const p = new THREE.Vector2(x, z);

        const line = new THREE.Vector2().subVectors(end, start);
        const lenSq = line.lengthSq();
        const t = Math.max(0, Math.min(1, new THREE.Vector2().subVectors(p, start).dot(line) / lenSq));
        const projection = start.clone().add(line.multiplyScalar(t));
        const dist = p.distanceTo(projection);

        if (dist < road.width / 2 + 5) return true;
      }

      for (const landmark of landmarks) {
        const dist = Math.sqrt(Math.pow(x - landmark.position.x, 2) + Math.pow(z - landmark.position.z, 2));
        if (dist < 15) return true;
      }

      return false;
    };

    for (let i = 0; i < sceneSettings.buildingCount; i++) {
      const x = (Math.random() - 0.5) * sceneSettings.citySize;
      const z = (Math.random() - 0.5) * sceneSettings.citySize;
      if (Math.sqrt(x*x + z*z) < 30) continue;
      if (isOnRoadOrLandmark(x, z)) continue;

      if (Math.random() > 0.9) createNordicTower(x, z);
      else createNordicHouse(x, z);
    }

    // --- Input Handling ---
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDialogue(null);
        return;
      }

      if (e.target instanceof HTMLInputElement) return;

      keys.current[e.key.toLowerCase()] = true;

      if (e.key.toLowerCase() === 'e' && nearbyQuestNpcRef.current) {
        const npc = nearbyQuestNpcRef.current;
        setActiveDialogue(npc);
        setObjectives(prev =>
          prev.map(o => o.npcId === npc.npcId ? { ...o, completed: true } : o)
        );
      }
    };
    const onKeyUp = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // --- Animation ---
    const moveSpeed = 0.5;
    const rotateSpeed = 0.05;
    const cameraOffset = new THREE.Vector3(0, 12, 25);

    const animate = () => {
      requestAnimationFrame(animate);

      // Movement
      if (keys.current['s'] || keys.current['arrowdown']) warrior.translateZ(moveSpeed);
      if (keys.current['w'] || keys.current['arrowup']) warrior.translateZ(-moveSpeed);
      if (keys.current['a'] || keys.current['arrowleft']) warrior.rotation.y += rotateSpeed;
      if (keys.current['d'] || keys.current['arrowright']) warrior.rotation.y -= rotateSpeed;

      // NPC Movement
      npcs.forEach((npc, i) => {
        const target = npcTargets[i];
        const dir = target.clone().sub(npc.position).normalize();
        npc.position.add(dir.multiplyScalar(0.08));
        npc.lookAt(target);
        if (npc.position.distanceTo(target) < 1) {
          npcTargets[i] = new THREE.Vector3((Math.random() - 0.5) * sceneSettings.citySize, 0, (Math.random() - 0.5) * sceneSettings.citySize);
        }
      });

      // Camera Follow
      const relativeCameraOffset = cameraOffset.clone().applyMatrix4(warrior.matrixWorld);
      camera.position.lerp(relativeCameraOffset, 0.08);
      camera.lookAt(warrior.position.x, warrior.position.y + 3, warrior.position.z);

      renderer.render(scene, camera);

      // Name tag projection
      questNpcData.forEach((npcData) => {
        const obj = questNpcObjects[npcData.npcId];
        if (!obj) return;
        const pos = obj.position.clone();
        pos.y += 4;
        const projected = pos.project(camera);
        const x = (projected.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-projected.y * 0.5 + 0.5) * window.innerHeight;
        const el = document.getElementById(`nametag-${npcData.npcId}`);
        if (el) {
          el.style.left = '0px';
          el.style.top = '0px';
          el.style.transform = `translate(-50%, -100%) translate(${x}px, ${y}px)`;
          el.style.opacity = projected.z < 1 ? '1' : '0';
        }
      });

      // Proximity detection
      let foundNearby: QuestNpc | null = null;
      questNpcData.forEach((npcData) => {
        const obj = questNpcObjects[npcData.npcId];
        if (!obj) return;
        const dist = warrior.position.distanceTo(obj.position);
        if (dist < 8) foundNearby = npcData;
      });
      if (foundNearby !== nearbyQuestNpcRef.current) {
        nearbyQuestNpcRef.current = foundNearby;
        setNearbyQuestNpc(foundNearby);
      }
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
  }, [questNpcData]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-200">
      <div ref={containerRef} className="absolute inset-0" />

      <Overlay onToggleInfo={() => setShowInfo(true)} />

      {/* Floating name tags (repositioned each frame via DOM) */}
      {questNpcData.map(npc => (
        <div
          key={npc.npcId}
          id={`nametag-${npc.npcId}`}
          className="absolute pointer-events-none text-xs font-sans tracking-widest uppercase text-slate-100 glass-panel px-2 py-0.5 rounded"
          style={{ left: 0, top: 0, transform: 'translate(-50%, -100%)', opacity: 0, transition: 'opacity 0.2s' }}
        >
          {npc.npcName}
        </div>
      ))}

      {/* Press E prompt */}
      <AnimatePresence>
        {nearbyQuestNpc && !activeDialogue && (
          <motion.div
            key="press-e"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-36 left-1/2 -translate-x-1/2 z-20 glass-panel px-5 py-2.5 rounded-full text-slate-100 text-xs tracking-widest uppercase font-sans border-slate-500/30 pointer-events-none"
          >
            Press <span className="px-1.5 py-0.5 border border-slate-400/40 rounded bg-slate-400/20 mx-1">E</span> to talk to {nearbyQuestNpc.npcName}
          </motion.div>
        )}
      </AnimatePresence>

      <InfoModal isOpen={showInfo} onClose={() => setShowInfo(false)} />

      <DialogueModal npc={activeDialogue} onClose={() => setActiveDialogue(null)} />

      <ObjectivesHUD objectives={objectives} />

      {/* Cold Vignette effect */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ boxShadow: `inset 0 0 200px ${sceneConfig.vignette}` }}
      />

      {/* Snow particles simulation (CSS) */}
      <div className="fixed inset-0 pointer-events-none" style={{ opacity: sceneConfig.particles.opacity }}>
        <div
          className="absolute inset-0 animate-[pulse_5s_infinite]"
          style={{
            backgroundImage: `radial-gradient(circle at center, ${sceneConfig.particles.color} 1px, transparent 1px)`,
            backgroundSize: `${sceneConfig.particles.size} ${sceneConfig.particles.size}`
          }}
        />
      </div>
    </div>
  );
}
