/**
 * FoldingBox.jsx
 * Faithful port of the Threejs-folding-cardboard-box-tutorial by ksenia-k.
 * Adapted for React + Three.js v0.186 (mergeGeometries API).
 *
 * Key changes vs tutorial:
 *  - mergeBufferGeometries → mergeGeometries (v0.160+)
 *  - Scroll / GSAP timeline is driven externally via `progress` prop
 *  - Full WebGL safety: pre-check + try-catch + context-lost handler
 *  - Isolated SVG fallback (never throws to parent ErrorBoundary)
 */

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import gsap from "gsap";

// ─── WebGL support check ───────────────────────────────────────────────────
function isWebGLAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl") || c.getContext("experimental-webgl"))
    );
  } catch (_) {
    return false;
  }
}

// ─── 2-D SVG fallback (shown only when WebGL truly cannot start) ───────────
function BoxSVGFallback({ progress, className }) {
  const stage = progress < 0.25 ? 0 : progress < 0.55 ? 1 : progress < 0.88 ? 2 : 3;
  const titles = ["Flat Die-Cut Blank", "Walls Rising 90°", "Base Flaps Interlocked", "Sealed & Ready"];

  // Animate a simple isometric box based on progress
  const wallH = Math.min(1, progress * 3) * 50; // 0→50
  const flapBot = Math.min(1, Math.max(0, (progress - 0.35) / 0.25)) * 50;
  const flapTop = Math.min(1, Math.max(0, (progress - 0.6) / 0.35)) * 50;

  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-4 select-none ${className}`}
      data-testid="folding-box-fallback"
    >
      <div className="w-full max-w-md rounded-2xl border border-bone/15 bg-charcoal/85 p-6 shadow-2xl backdrop-blur-md">
        <div className="mb-4 flex items-center justify-between border-b border-bone/10 pb-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-tape">
            Schematic · Stage {stage + 1} / 4
          </span>
          <span className="font-mono text-[10px] text-bone/50">{Math.round(progress * 100)}%</span>
        </div>

        <div className="flex justify-center py-4">
          <svg viewBox="0 0 240 180" className="h-44 w-72" fill="none">
            {/* Bottom base */}
            <polygon points="60,140 120,160 180,140 120,120" fill="#c39d6e30" stroke="#c39d6e" strokeWidth="1.5" />

            {/* Left face (animates height) */}
            <polygon
              points={`60,${140 - wallH} 60,140 120,160 120,${160 - wallH}`}
              fill="#c39d6e40"
              stroke="#c39d6e"
              strokeWidth="1.5"
            />

            {/* Right face */}
            <polygon
              points={`120,${160 - wallH} 120,160 180,140 180,${140 - wallH}`}
              fill="#c39d6e55"
              stroke="#c39d6e"
              strokeWidth="1.5"
            />

            {/* Back face */}
            <polygon
              points={`60,${140 - wallH} 120,${120 - wallH} 180,${140 - wallH} 120,${160 - wallH}`}
              fill="#c39d6e20"
              stroke="#c39d6e"
              strokeWidth="1.5"
            />

            {/* Bottom flaps */}
            {flapBot > 0 && (
              <>
                <polygon
                  points={`75,${160 - flapBot} 75,160 110,160 110,${160 - flapBot}`}
                  fill="#b8936a60"
                  stroke="#b8936a"
                  strokeWidth="1"
                  strokeDasharray="3 2"
                />
                <polygon
                  points={`130,${160 - flapBot} 130,160 165,160 165,${160 - flapBot}`}
                  fill="#b8936a60"
                  stroke="#b8936a"
                  strokeWidth="1"
                  strokeDasharray="3 2"
                />
              </>
            )}

            {/* Top flaps */}
            {flapTop > 0 && (
              <>
                <polygon
                  points={`75,${160 - wallH} 75,${160 - wallH - flapTop} 110,${160 - wallH - flapTop} 110,${160 - wallH}`}
                  fill="#c39d6e50"
                  stroke="#c39d6e"
                  strokeWidth="1.5"
                />
                <polygon
                  points={`130,${160 - wallH} 130,${160 - wallH - flapTop} 165,${160 - wallH - flapTop} 165,${160 - wallH}`}
                  fill="#c39d6e50"
                  stroke="#c39d6e"
                  strokeWidth="1.5"
                />
              </>
            )}

            {/* Tape seal line when top flaps closed */}
            {flapTop > 40 && (
              <line
                x1="75"
                y1={160 - wallH}
                x2="165"
                y2={160 - wallH}
                stroke="#f6c445"
                strokeWidth="4"
              />
            )}

            {/* Al Lulu label */}
            {wallH > 20 && (
              <text
                x="120"
                y={160 - wallH / 2 + 5}
                fill="#ebd5b3"
                fontSize="8"
                fontFamily="monospace"
                textAnchor="middle"
              >
                AL LULU
              </text>
            )}
          </svg>
        </div>

        <p className="text-center font-display text-sm font-bold text-bone">{titles[stage]}</p>
        <p className="mt-1 text-center font-mono text-[10px] text-bone/50">
          760 × 270 × 440 mm • 3-Ply Corrugated RSC
        </p>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
export default function FoldingBox({
  progress = 0,
  autoRotate = true,
  zoomLevel = 1,
  className = "",
}) {
  const mountRef = useRef(null);
  const [webglError, setWebglError] = useState(null);
  const sceneRef = useRef(null); // { timeline, orbit, camera, renderer }

  // ── Mount scene ──────────────────────────────────────────────────────────
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    if (!isWebGLAvailable()) {
      setWebglError("no-webgl");
      return;
    }

    let teardown = () => {};
    try {
      teardown = buildScene(container, sceneRef, setWebglError);
    } catch (err) {
      console.error("[FoldingBox] scene init failed:", err);
      setWebglError(String(err));
    }
    return () => { try { teardown(); } catch (_) {} };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sync progress → GSAP timeline ───────────────────────────────────────
  useEffect(() => {
    const s = sceneRef.current;
    if (s && s.timeline) {
      s.timeline.progress(Math.max(0, Math.min(1, progress)));
    }
  }, [progress]);

  // ── Sync autoRotate ──────────────────────────────────────────────────────
  useEffect(() => {
    const s = sceneRef.current;
    if (s && s.orbit) s.orbit.autoRotate = autoRotate;
  }, [autoRotate]);

  // ── Sync zoom ────────────────────────────────────────────────────────────
  useEffect(() => {
    const s = sceneRef.current;
    if (s && s.camera) {
      gsap.to(s.camera, {
        duration: 0.25,
        zoom: zoomLevel,
        onUpdate: () => s.camera.updateProjectionMatrix(),
      });
    }
  }, [zoomLevel]);

  if (webglError) {
    return <BoxSVGFallback progress={progress} className={className} />;
  }

  return (
    <div
      ref={mountRef}
      className={`relative h-full w-full cursor-grab select-none active:cursor-grabbing ${className}`}
      data-testid="threejs-folding-box-canvas"
    />
  );
}

// ─── Three.js scene builder ────────────────────────────────────────────────
// Faithfully ports the tutorial logic. Returns a teardown function.
function buildScene(container, sceneRef, setWebglError) {
  // ── Box params (same as tutorial) ────────────────────────────────────────
  const params = {
    width: 27,
    length: 80,
    depth: 45,
    thickness: 0.6,
    fluteFreq: 5,
    flapGap: 1,
    stampSize: [27, 10],
  };

  // ── Mutable animated state (GSAP will tween these) ──────────────────────
  const animated = {
    openingAngle: 0.02 * Math.PI,
    flapAngles: {
      backHalf: {
        width: { top: 0, bottom: 0 },
        length: { top: 0, bottom: 0 },
      },
      frontHalf: {
        width: { top: 0, bottom: 0 },
        length: { top: 0, bottom: 0 },
      },
    },
  };

  // ── Panel mesh hierarchy (mirrors tutorial exactly) ──────────────────────
  const els = {
    group: new THREE.Group(),
    backHalf: {
      width: { top: new THREE.Mesh(), side: new THREE.Mesh(), bottom: new THREE.Mesh() },
      length: { top: new THREE.Mesh(), side: new THREE.Mesh(), bottom: new THREE.Mesh() },
    },
    frontHalf: {
      width: { top: new THREE.Mesh(), side: new THREE.Mesh(), bottom: new THREE.Mesh() },
      length: { top: new THREE.Mesh(), side: new THREE.Mesh(), bottom: new THREE.Mesh() },
    },
  };

  // ── Renderer ─────────────────────────────────────────────────────────────
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "default",
      failIfMajorPerformanceCaveat: false,
    });
  } catch (err) {
    setWebglError(String(err));
    return () => {};
  }

  const W = container.clientWidth || 640;
  const H = container.clientHeight || 480;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(W, H);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const onContextLost = (e) => { e.preventDefault(); setWebglError("context-lost"); };
  renderer.domElement.addEventListener("webglcontextlost", onContextLost, false);

  // ── Scene & camera ───────────────────────────────────────────────────────
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, W / H, 10, 1000);
  camera.position.set(40, 90, 110);

  // ── Procedural Kraft Paper Texture with corrugated & fibrous details ─────
  function createCardboardTextures() {
    // 1. Diffuse / Color Map
    const colorCanvas = document.createElement("canvas");
    colorCanvas.width = 512;
    colorCanvas.height = 512;
    const ctx = colorCanvas.getContext("2d");

    // Base kraft brown
    ctx.fillStyle = "#c29b68";
    ctx.fillRect(0, 0, 512, 512);

    // Subtle corrugated ribbing stripes
    for (let x = 0; x < 512; x += 8) {
      ctx.fillStyle = x % 16 === 0 ? "rgba(90, 60, 30, 0.08)" : "rgba(255, 240, 210, 0.06)";
      ctx.fillRect(x, 0, 4, 512);
    }

    // Kraft paper speckles & grain
    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 26;
      data[i]     = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise * 0.85));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise * 0.6));
    }
    ctx.putImageData(imgData, 0, 0);

    // Random cardboard paper fibers
    ctx.strokeStyle = "rgba(70, 45, 20, 0.18)";
    ctx.lineWidth = 1;
    for (let f = 0; f < 240; f++) {
      const fx = Math.random() * 512;
      const fy = Math.random() * 512;
      const fl = 3 + Math.random() * 8;
      const fa = Math.random() * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx + Math.cos(fa) * fl, fy + Math.sin(fa) * fl);
      ctx.stroke();
    }

    const diffuseTexture = new THREE.CanvasTexture(colorCanvas);
    diffuseTexture.wrapS = THREE.RepeatWrapping;
    diffuseTexture.wrapT = THREE.RepeatWrapping;
    diffuseTexture.repeat.set(4, 4);

    // 2. Bump / Roughness Map for realistic tactile feel
    const bumpCanvas = document.createElement("canvas");
    bumpCanvas.width = 256;
    bumpCanvas.height = 256;
    const bCtx = bumpCanvas.getContext("2d");
    bCtx.fillStyle = "#808080";
    bCtx.fillRect(0, 0, 256, 256);
    const bData = bCtx.getImageData(0, 0, 256, 256);
    for (let i = 0; i < bData.data.length; i += 4) {
      const n = (Math.random() - 0.5) * 45;
      const val = Math.min(255, Math.max(0, 128 + n));
      bData.data[i] = val;
      bData.data[i + 1] = val;
      bData.data[i + 2] = val;
    }
    bCtx.putImageData(bData, 0, 0);

    const bumpTexture = new THREE.CanvasTexture(bumpCanvas);
    bumpTexture.wrapS = THREE.RepeatWrapping;
    bumpTexture.wrapT = THREE.RepeatWrapping;
    bumpTexture.repeat.set(8, 8);

    return { diffuseTexture, bumpTexture };
  }

  const { diffuseTexture, bumpTexture } = createCardboardTextures();

  // ── Lighting ─────────────────────────────────────────────────────────────
  const ambientLight = new THREE.AmbientLight(0xfff3e6, 0.7);
  scene.add(ambientLight);

  // Soft directional key light for deep shadows & surface definition
  const keyLight = new THREE.DirectionalLight(0xfffaed, 1.2);
  keyLight.position.set(80, 140, 100);
  scene.add(keyLight);

  // Warm rim light from back-left for edge separation
  const rimLight = new THREE.DirectionalLight(0xe8c79b, 0.8);
  rimLight.position.set(-100, 80, -60);
  scene.add(rimLight);

  // Bottom soft bounce light (simulating warehouse floor bounce)
  const groundLight = new THREE.DirectionalLight(0x735c44, 0.4);
  groundLight.position.set(0, -100, 40);
  scene.add(groundLight);

  const lightHolder = new THREE.Group();
  const topLight = new THREE.PointLight(0xffffff, 0.5);
  topLight.position.set(-30, 300, 0);
  lightHolder.add(topLight);
  const sideLight = new THREE.PointLight(0xffecd6, 0.6);
  sideLight.position.set(50, 0, 150);
  lightHolder.add(sideLight);
  scene.add(lightHolder);

  // ── Cardboard Material with tactile paper feel ───────────────────────────
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xd6a874),
    map: diffuseTexture,
    bumpMap: bumpTexture,
    bumpScale: 0.12,
    roughness: 0.88,
    metalness: 0.02,
    side: THREE.DoubleSide,
  });
  els.group.traverse((c) => { if (c.isMesh) c.material = material; });

  // ── OrbitControls ────────────────────────────────────────────────────────
  const orbit = new OrbitControls(camera, renderer.domElement);
  orbit.enableZoom = false;
  orbit.enablePan = false;
  orbit.enableDamping = true;
  orbit.autoRotate = true;
  orbit.autoRotateSpeed = 0.25;

  // ── Geometry helpers (ported 1-to-1 from tutorial) ───────────────────────
  function createSideGeometry(baseGeometry, size, folds, hasMiddleLayer) {
    const geometriesToMerge = [];

    function getLayerGeometry(offset) {
      const layerGeometry = baseGeometry.clone();
      const positionAttr = layerGeometry.attributes.position;
      // need to mark as needsUpdate after modification
      for (let i = 0; i < positionAttr.count; i++) {
        const x = positionAttr.getX(i);
        const y = positionAttr.getY(i);
        let z = positionAttr.getZ(i) + offset(x);
        z = applyFolds(x, y, z);
        positionAttr.setXYZ(i, x, y, z);
      }
      positionAttr.needsUpdate = true;
      return layerGeometry;
    }

    function applyFolds(x, y, z) {
      const modifier = (c, s) => 1.0 - Math.pow(c / (0.5 * s), 10.0);
      if ((x > 0 && folds[1]) || (x < 0 && folds[3])) z *= modifier(x, size[0]);
      if ((y > 0 && folds[0]) || (y < 0 && folds[2])) z *= modifier(y, size[1]);
      return z;
    }

    geometriesToMerge.push(
      getLayerGeometry((v) => -0.5 * params.thickness + 0.01 * Math.sin(params.fluteFreq * v))
    );
    geometriesToMerge.push(
      getLayerGeometry((v) => 0.5 * params.thickness + 0.01 * Math.sin(params.fluteFreq * v))
    );
    if (hasMiddleLayer) {
      geometriesToMerge.push(
        getLayerGeometry((v) => 0.5 * params.thickness * Math.sin(params.fluteFreq * v))
      );
    }

    // mergeGeometries (Three.js v0.160+) — safe call with null guard
    const merged = mergeGeometries(geometriesToMerge, false);
    if (!merged) {
      // Fallback: just return a plain plane if merge fails
      return baseGeometry.clone();
    }
    merged.computeVertexNormals();
    return merged;
  }

  function setGeometryHierarchy() {
    els.group.add(
      els.frontHalf.width.side,
      els.frontHalf.length.side,
      els.backHalf.width.side,
      els.backHalf.length.side
    );
    els.frontHalf.width.side.add(els.frontHalf.width.top, els.frontHalf.width.bottom);
    els.frontHalf.length.side.add(els.frontHalf.length.top, els.frontHalf.length.bottom);
    els.backHalf.width.side.add(els.backHalf.width.top, els.backHalf.width.bottom);
    els.backHalf.length.side.add(els.backHalf.length.top, els.backHalf.length.bottom);
  }

  function createBoxElements() {
    for (let halfIdx = 0; halfIdx < 2; halfIdx++) {
      for (let sideIdx = 0; sideIdx < 2; sideIdx++) {
        const half = halfIdx ? "frontHalf" : "backHalf";
        const side = sideIdx ? "width" : "length";

        const sideWidth = side === "width" ? params.width : params.length;
        const flapWidth = sideWidth - 2 * params.flapGap;
        const flapHeight = 0.5 * params.width - 0.75 * params.flapGap;

        const sidePlaneGeometry = new THREE.PlaneGeometry(
          sideWidth,
          params.depth,
          Math.floor(5 * sideWidth),
          Math.floor(0.2 * params.depth)
        );
        const flapPlaneGeometry = new THREE.PlaneGeometry(
          flapWidth,
          flapHeight,
          Math.floor(5 * flapWidth),
          Math.max(1, Math.floor(0.2 * flapHeight))
        );

        const sideGeometry = createSideGeometry(
          sidePlaneGeometry,
          [sideWidth, params.depth],
          [true, true, true, true],
          false
        );
        const topGeometry = createSideGeometry(
          flapPlaneGeometry,
          [flapWidth, flapHeight],
          [false, false, true, false],
          true
        );
        const bottomGeometry = createSideGeometry(
          flapPlaneGeometry,
          [flapWidth, flapHeight],
          [true, false, false, false],
          true
        );

        topGeometry.translate(0, 0.5 * flapHeight, 0);
        bottomGeometry.translate(0, -0.5 * flapHeight, 0);

        els[half][side].top.geometry = topGeometry;
        els[half][side].side.geometry = sideGeometry;
        els[half][side].bottom.geometry = bottomGeometry;

        // Apply material to all newly created meshes
        els[half][side].top.material = material;
        els[half][side].side.material = material;
        els[half][side].bottom.material = material;

        els[half][side].top.position.y = 0.5 * params.depth;
        els[half][side].bottom.position.y = -0.5 * params.depth;
      }
    }
    updatePanelsTransform();
  }

  // ── Al Lulu Branding stamp using transparent brand image ─────────────────
  let stamp = null;
  const textureLoader = new THREE.TextureLoader();
  const brandTexture = textureLoader.load("/image-removebg-preview.png", (tex) => {
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    tex.needsUpdate = true;
  });

  // Plane geometry proportional to the wide brand logo (aspect ratio ~ 2.1:1)
  const stampGeom = new THREE.PlaneGeometry(
    params.length * 0.72,
    (params.length * 0.72) * (340 / 720)
  );
  const stampMat = new THREE.MeshBasicMaterial({
    map: brandTexture,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  stamp = new THREE.Mesh(stampGeom, stampMat);
  scene.add(stamp);

  // ── Transform logic (1-to-1 port from tutorial) ──────────────────────────
  function updatePanelsTransform() {
    // Place width-sides at ends of length-sides
    els.frontHalf.width.side.position.x = 0.5 * params.length;
    els.backHalf.width.side.position.x = -0.5 * params.length;

    // Rotate width-sides from 0 → 90 deg
    els.frontHalf.width.side.rotation.y = animated.openingAngle;
    els.backHalf.width.side.rotation.y = animated.openingAngle;

    // Move length-sides to keep box centered (cos: 1→0)
    const cos = Math.cos(animated.openingAngle);
    els.frontHalf.length.side.position.x = -0.5 * cos * params.width;
    els.backHalf.length.side.position.x = 0.5 * cos * params.width;

    // Move length-sides to define box inner space (sin: 0→1)
    const sin = Math.sin(animated.openingAngle);
    els.frontHalf.length.side.position.z = 0.5 * sin * params.width;
    els.backHalf.length.side.position.z = -0.5 * sin * params.width;

    // Flap rotations
    els.frontHalf.width.top.rotation.x = -animated.flapAngles.frontHalf.width.top;
    els.frontHalf.length.top.rotation.x = -animated.flapAngles.frontHalf.length.top;
    els.frontHalf.width.bottom.rotation.x = animated.flapAngles.frontHalf.width.bottom;
    els.frontHalf.length.bottom.rotation.x = animated.flapAngles.frontHalf.length.bottom;

    els.backHalf.width.top.rotation.x = animated.flapAngles.backHalf.width.top;
    els.backHalf.length.top.rotation.x = animated.flapAngles.backHalf.length.top;
    els.backHalf.width.bottom.rotation.x = -animated.flapAngles.backHalf.width.bottom;
    els.backHalf.length.bottom.rotation.x = -animated.flapAngles.backHalf.length.bottom;

    // Stamp centered on the front panel surface
    if (stamp) {
      stamp.position.copy(els.frontHalf.length.side.position);
      // No X offset — stamp is centered on the panel
      stamp.position.x += 0;
      stamp.position.y += 0;
      // Float just above the panel surface
      stamp.position.z += params.thickness + 0.15;
    }
  }

  // ── Build scene graph ────────────────────────────────────────────────────
  scene.add(els.group);
  setGeometryHierarchy();
  createBoxElements();

  // ── GSAP Timeline (paused, driven by scroll progress prop) ───────────────
  // Exactly the same keyframe sequence as the tutorial
  const timeline = gsap.timeline({
    paused: true,
    onUpdate: updatePanelsTransform,
  });

  timeline
    .to(animated, {
      duration: 1,
      openingAngle: 0.5 * Math.PI,
      ease: "power1.inOut",
    })
    .to(
      [animated.flapAngles.backHalf.width, animated.flapAngles.frontHalf.width],
      { duration: 0.6, bottom: 0.6 * Math.PI, ease: "back.in(3)" },
      0.9
    )
    .to(
      animated.flapAngles.backHalf.length,
      { duration: 0.7, bottom: 0.5 * Math.PI, ease: "back.in(2)" },
      1.1
    )
    .to(
      animated.flapAngles.frontHalf.length,
      { duration: 0.8, bottom: 0.49 * Math.PI, ease: "back.in(3)" },
      1.4
    )
    .to(
      [animated.flapAngles.backHalf.width, animated.flapAngles.frontHalf.width],
      { duration: 0.6, top: 0.6 * Math.PI, ease: "back.in(3)" },
      1.4
    )
    .to(
      animated.flapAngles.backHalf.length,
      { duration: 0.7, top: 0.5 * Math.PI, ease: "back.in(3)" },
      1.7
    )
    .to(
      animated.flapAngles.frontHalf.length,
      { duration: 0.9, top: 0.49 * Math.PI, ease: "back.in(4)" },
      1.8
    );

  if (stamp) {
    timeline.to(
      stamp.material,
      {
        duration: 0.4,
        opacity: 1,
        ease: "power2.out",
      },
      2.7
    );
  }

  // ── Render loop ──────────────────────────────────────────────────────────
  let rafId;
  const render = () => {
    rafId = requestAnimationFrame(render);
    orbit.update();
    lightHolder.quaternion.copy(camera.quaternion);
    renderer.render(scene, camera);
  };
  render();

  // ── Resize ───────────────────────────────────────────────────────────────
  const handleResize = () => {
    const w = container.clientWidth || 640;
    const h = container.clientHeight || 480;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener("resize", handleResize);

  // Expose refs for prop-sync effects
  sceneRef.current = { timeline, orbit, camera, renderer };

  // ── Teardown ─────────────────────────────────────────────────────────────
  return () => {
    window.removeEventListener("resize", handleResize);
    if (rafId) cancelAnimationFrame(rafId);
    try { timeline.kill(); } catch (_) {}
    try { orbit.dispose(); } catch (_) {}
    if (renderer.domElement) {
      renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    }
    try { renderer.dispose(); } catch (_) {}
    material.dispose();
    els.group.traverse((obj) => {
      if (obj.geometry) try { obj.geometry.dispose(); } catch (_) {}
    });
    if (stamp) {
      try { stamp.geometry.dispose(); } catch (_) {}
      try { stamp.material.map.dispose(); } catch (_) {}
      try { stamp.material.dispose(); } catch (_) {}
    }
  };
}
