import React, { useEffect, useRef } from "react";

export default function ThreeHero() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cleanup = () => {};
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    async function init() {
      const el = ref.current;
      if (!el) return;

      let THREE: typeof import("three");
      try {
        THREE = (await import("three")) as typeof import("three");
      } catch {
        return;
      }

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(el.clientWidth, el.clientHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, el.clientWidth / el.clientHeight, 0.1, 100);
      camera.position.z = 7.5;

      scene.add(new THREE.AmbientLight(0xffffff, 0.6));
      const dir = new THREE.DirectionalLight(0xffffff, 0.35);
      dir.position.set(3, 4, 5);
      scene.add(dir);

      const readCssVar = (name: string, fallback: string) =>
        getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

      const readAccent = () => new THREE.Color(readCssVar("--accent", "#58A6FF"));
      const readText = () => new THREE.Color(readCssVar("--text", "#1F2328"));

      let accent = readAccent();
      let textCol = readText();

      const coreGroup = new THREE.Group();
      scene.add(coreGroup);

      const polyGeo = new THREE.IcosahedronGeometry(1.4, 2);
      const edges = new THREE.EdgesGeometry(polyGeo);
      const lineMat = new THREE.LineBasicMaterial({
        color: accent,
        transparent: true,
        opacity: 0.9,
      });
      const wire = new THREE.LineSegments(edges, lineMat);
      coreGroup.add(wire);

      const glowMat = new THREE.LineBasicMaterial({
        color: accent,
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const glow = new THREE.LineSegments(edges.clone(), glowMat);
      glow.scale.setScalar(1.02);
      coreGroup.add(glow);

      const torus = new THREE.TorusGeometry(2.2, 0.55, 64, 128);
      const positions = new Float32Array(torus.getAttribute("position").array as ArrayLike<number>);

      const spriteSize = 64;
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = spriteSize;
      const ctx = canvas.getContext("2d")!;
      const rad = ctx.createRadialGradient(
        spriteSize / 2,
        spriteSize / 2,
        0,
        spriteSize / 2,
        spriteSize / 2,
        spriteSize / 2
      );
      rad.addColorStop(0, "rgba(255,255,255,0.9)");
      rad.addColorStop(0.5, "rgba(255,255,255,0.25)");
      rad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = rad;
      ctx.fillRect(0, 0, spriteSize, spriteSize);
      const spriteTex = new THREE.CanvasTexture(canvas);
      spriteTex.colorSpace = THREE.SRGBColorSpace;

      const pointsGeo = new THREE.BufferGeometry();
      pointsGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const pointsMat = new THREE.PointsMaterial({
        map: spriteTex,
        color: accent,
        size: 0.06,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const halo = new THREE.Points(pointsGeo, pointsMat);
      scene.add(halo);

      const planeGeo = new THREE.PlaneGeometry(20, 12, 20, 12);
      const gridMat = new THREE.MeshBasicMaterial({
        color: textCol.clone(),
        transparent: true,
        opacity: readCssVar("data-theme", "") === "dark" ? 0.035 : 0.06,
      });
      const gridPlane = new THREE.Mesh(planeGeo, gridMat);
      gridPlane.position.z = -6;
      scene.add(gridPlane);

      const mo = new MutationObserver(() => {
        const nextAccent = readAccent();
        const nextText = readText();

        if (!nextAccent.equals(accent)) {
          accent = nextAccent;
          lineMat.color = accent;
          glowMat.color = accent;
          pointsMat.color = accent;
          lineMat.needsUpdate = glowMat.needsUpdate = pointsMat.needsUpdate = true;
        }
        if (!nextText.equals(textCol)) {
          textCol = nextText;
          gridMat.color = textCol;
          gridMat.opacity =
            document.documentElement.getAttribute("data-theme") === "dark" ? 0.035 : 0.06;
          gridMat.needsUpdate = true;
        }
      });
      mo.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme", "class"],
      });

      function onResize() {
        const w = el.clientWidth || 1;
        const h = el.clientHeight || 1;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
      window.addEventListener("resize", onResize);

      let raf = 0;
      let t0 = performance.now();
      const animate = () => {
        const t = (performance.now() - t0) / 1000;
        coreGroup.rotation.x = Math.sin(t * 0.6) * 0.15 + 0.2;
        coreGroup.rotation.y = t * 0.35;
        halo.rotation.x = t * 0.12;
        halo.rotation.y = t * 0.18;
        pointsMat.size = 0.06 + Math.sin(t * 2.2) * 0.01;
        pointsMat.opacity = 0.55 + Math.sin(t * 1.3) * 0.15;
        gridPlane.rotation.z = Math.sin(t * 0.2) * 0.05;
        renderer.render(scene, camera);
        raf = requestAnimationFrame(animate);
      };
      animate();

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("resize", onResize);
        mo.disconnect();

        if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
        renderer.dispose();

        polyGeo.dispose();
        edges.dispose();
        torus.dispose();
        pointsGeo.dispose();
        spriteTex.dispose();
        planeGeo.dispose();

        lineMat.dispose();
        glowMat.dispose();
        pointsMat.dispose();
        gridMat.dispose();
      };
    }

    init();
    return () => cleanup();
  }, []);

  return <div ref={ref} className="h-full w-full" aria-hidden="true" />;
}
