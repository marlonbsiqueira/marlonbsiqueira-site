/* =============================================================
   main.js — cinematic camera over a spatial canvas.
   The .world is transformed so each stop flies to centre + zoom.
   ============================================================= */

(() => {
  "use strict";

  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const world = document.getElementById("world");
  const stopsEls = Array.from(document.querySelectorAll(".stop"));
  const rail = document.getElementById("rail");
  const btnNext = document.getElementById("btnNext");
  const btnBack = document.getElementById("btnBack");
  const curIndex = document.getElementById("curIndex");
  const curName = document.getElementById("curName");
  const roFill = document.getElementById("roFill");
  const pathLine = document.getElementById("pathLine");
  const pathSvg = document.getElementById("pathSvg");

  const DOT_LABELS = ["dot.1","dot.2","dot.3","dot.4","dot.5","dot.6","dot.7"];

  const stops = stopsEls.map(el => ({
    el,
    x: +el.dataset.x,
    y: +el.dataset.y,
    rot: +el.dataset.rot
  }));
  const N = stops.length;
  let index = 0;
  let flying = false;

  /* ---------- place stops in world space ---------- */
  function layout(){
    stops.forEach(s => {
      s.el.style.left = s.x + "px";
      s.el.style.top  = s.y + "px";
      s.el.style.transform = `translate(-50%,-50%) rotate(${s.rot}deg)`;
    });
    const pts = stops.map(s => `${s.x},${s.y}`).join(" ");
    pathLine.setAttribute("points", pts);
    pathSvg.querySelectorAll(".path-node").forEach(n => n.remove());
    const NS = "http://www.w3.org/2000/svg";
    stops.forEach(s => {
      const c = document.createElementNS(NS, "circle");
      c.setAttribute("class", "path-node");
      c.setAttribute("cx", s.x); c.setAttribute("cy", s.y); c.setAttribute("r", 9);
      pathSvg.appendChild(c);
    });
  }

  /* ---------- camera ---------- */
  function camFor(i){
    const s = stops[i];
    const w = s.el.offsetWidth, h = s.el.offsetHeight;
    const vw = innerWidth, vh = innerHeight;
    const padX = vw < 760 ? 0.96 : 0.84;
    const padY = vw < 760 ? 0.92 : 0.82;
    let k = Math.min(vw * padX / w, vh * padY / h);
    k = Math.min(k, 1.12);
    return { k, x: s.x, y: s.y, rot: s.rot };
  }

  function applyCam(c, instant){
    if (instant || reduce()) world.classList.add("instant");
    else world.classList.remove("instant");
    const vw = innerWidth, vh = innerHeight;
    world.style.transform =
      `translate(${vw/2}px,${vh/2}px) scale(${c.k}) rotate(${-c.rot}deg) translate(${-c.x}px,${-c.y}px)`;
    if (instant || reduce()){ void world.offsetWidth; world.classList.remove("instant"); }
  }

  function overviewCam(){
    let minX=1e9,minY=1e9,maxX=-1e9,maxY=-1e9;
    stops.forEach(s => {
      const w=s.el.offsetWidth, h=s.el.offsetHeight;
      minX=Math.min(minX,s.x-w/2); maxX=Math.max(maxX,s.x+w/2);
      minY=Math.min(minY,s.y-h/2); maxY=Math.max(maxY,s.y+h/2);
    });
    const cw=maxX-minX, ch=maxY-minY, cx=(minX+maxX)/2, cy=(minY+maxY)/2;
    const k=Math.min(innerWidth*0.92/cw, innerHeight*0.92/ch)*0.92;
    return { k, x:cx, y:cy, rot:0 };
  }

  /* dramatic dive into the face area of the portrait */
  function portraitCam(){
    const p=document.querySelector("#s-hero .portrait");
    const s=stops[0]; if(!p) return camFor(0);
    const w=s.el.offsetWidth, h=s.el.offsetHeight;
    // Target the upper-center of the portrait (face area)
    const wx=s.x - w/2 + p.offsetLeft + p.offsetWidth/2;
    const wy=s.y - h/2 + p.offsetTop  + p.offsetHeight*0.26;
    // Tighter zoom → dramatic "entering through the photo"
    const k=Math.min(innerWidth,innerHeight)/(p.offsetWidth*0.34);
    return { k, x:wx, y:wy, rot:0 };
  }

  /* ---------- per-stop entrance animation trigger ---------- */
  function triggerEnterAnim(to, from, instant){
    if (instant || reduce()) return;
    const cfg = {
      "s-impact":  { cls:"sa-rise",      delay:350 },
      "s-reach":   { cls:"sa-globe-fly", delay:320 },
      "s-exp":     { cls:"sa-puzzle",    delay:640 },
      "s-edu":     { cls:"sa-flip",      delay:680 },
      "s-skills":  { cls:"sa-unfold",    delay:480 },
      "s-contact": { cls:"sa-zoom-near", delay:380 },
    };
    const id = stops[to].el.id;
    const c = cfg[id]; if(!c) return;
    const el = stops[to].el;
    el.classList.remove(c.cls);
    void el.offsetWidth;                         // force reflow to restart animation
    setTimeout(()=>{
      el.classList.add(c.cls);
      setTimeout(()=>el.classList.remove(c.cls), 2800);
    }, c.delay);
  }

  /* ---------- navigation ---------- */
  function go(i, instant){
    if (i < 0 || i >= N || (i === index && !instant)) return;
    const from = index;
    index = i;
    flying = true;

    if (!instant && !reduce() && from===0 && i===1){
      // Phase 1: dramatic zoom into portrait face
      applyCam(portraitCam(), false);
      clearTimeout(go._p);
      // Phase 2: fly to impact stop
      go._p = setTimeout(()=>{ applyCam(camFor(i), false); }, 1050);
    } else {
      applyCam(camFor(i), instant);
    }

    updateChrome();
    onEnter(i);
    triggerEnterAnim(i, from, instant);

    clearTimeout(go._t);
    go._t = setTimeout(() => { flying = false; },
      instant ? 0 : (from===0 && i===1 ? 2350 : 1450));
  }

  function next(){ if (index < N-1) go(index+1); }
  function back(){ if (index > 0) go(index-1); }

  function updateChrome(){
    rail.querySelectorAll("button").forEach((b,k)=>{
      b.classList.toggle("active", k===index);
      b.setAttribute("aria-current", k===index ? "true":"false");
    });
    if (curIndex) curIndex.textContent = String(index+1).padStart(2,"0");
    if (roFill) roFill.style.width = (((index)/(N-1))*100) + "%";
    if (curName){
      const key = DOT_LABELS[index];
      curName.setAttribute("data-i18n", key);
      const dict = window.I18N && window.I18N[window.I18nController ? I18nController.get() : "en"];
      curName.textContent = (dict && dict[key]) || curName.textContent;
    }
    btnBack.disabled = index===0;
    btnNext.disabled = index===N-1;
  }

  /* ---------- per-stop activations ---------- */
  const seen = new Set();
  function onEnter(i){
    const id = stops[i].el.id;
    if (id === "s-reach") Globe3D.ensure();
    if (window.FX) FX.activate(id);
    if (!seen.has(i)){ countUps(stops[i].el); seen.add(i); }
  }

  /* ---------- count-ups ---------- */
  function countUps(scope){
    scope.querySelectorAll("[data-count]").forEach(el=>{
      const target=parseFloat(el.dataset.count);
      if (reduce()){ el.textContent=target; return; }
      const dur=1400, t0=performance.now();
      const tick=(t)=>{const p=Math.min(1,(t-t0)/dur);const e=1-Math.pow(1-p,3);
        el.textContent=Math.round(target*e);if(p<1)requestAnimationFrame(tick);else el.textContent=target;};
      requestAnimationFrame(tick);
    });
  }

  /* ---------- build rail ---------- */
  function buildRail(){
    stops.forEach((s,i)=>{
      const b=document.createElement("button");
      b.setAttribute("data-dot", DOT_LABELS[i]);
      b.setAttribute("aria-label", s.el.getAttribute("data-screen-label")||("Section "+(i+1)));
      b.addEventListener("click",()=>go(i));
      rail.appendChild(b);
    });
  }

  /* ============================================================
     GLOBE — filled country polygons, no pins
     ============================================================ */
  const Globe3D = (() => {
    let world3=null, built=false;

    // Countries lived / worked in
    const WORKED  = new Set(["BRA","IRL","ITA","PRT"]);
    // Countries visited
    const VISITED = new Set(["USA","FRA","ESP","GBR","DEU"]);

    // Animated arcs: Porto → other worked countries
    const HOME={lat:41.1496,lng:-8.6109};
    const ARCS=[
      {startLat:HOME.lat,startLng:HOME.lng,endLat:-19.9167,endLng:-43.9345},
      {startLat:HOME.lat,startLng:HOME.lng,endLat: 53.3498,endLng: -6.2603},
      {startLat:HOME.lat,startLng:HOME.lng,endLat: 41.9028,endLng: 12.4964},
    ];

    function build(){
      const el=document.getElementById("globeViz");
      if(!el||typeof window.Globe==="undefined")return;
      built=true;

      fetch("https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson")
        .then(r=>r.json())
        .then(gj=>{
          world3=Globe()(el)
            .backgroundColor("rgba(0,0,0,0)")
            .showAtmosphere(true).atmosphereColor("#7BA0D4").atmosphereAltitude(0.22)
            .globeImageUrl("https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg")
            .bumpImageUrl("https://unpkg.com/three-globe@2.31.0/example/img/earth-topology.png")
            // country polygon fills — no pins, no rings
            .polygonsData(gj.features)
            .polygonAltitude(d=>{
              const iso=d.properties.ADM0_A3||d.properties.ISO_A3||"";
              return (WORKED.has(iso)||VISITED.has(iso)) ? 0.010 : 0.001;
            })
            .polygonCapColor(d=>{
              const iso=d.properties.ADM0_A3||d.properties.ISO_A3||"";
              if(WORKED.has(iso))  return "rgba(255,95,75,0.62)";
              if(VISITED.has(iso)) return "rgba(70,224,139,0.50)";
              return "rgba(90,120,170,0.04)";
            })
            .polygonSideColor(()=>"rgba(0,0,0,0)")
            .polygonStrokeColor(d=>{
              const iso=d.properties.ADM0_A3||d.properties.ISO_A3||"";
              if(WORKED.has(iso))  return "rgba(255,120,95,0.90)";
              if(VISITED.has(iso)) return "rgba(70,224,139,0.80)";
              return "rgba(90,120,170,0.10)";
            })
            // animated gold arcs from Porto to other worked countries
            .arcsData(ARCS)
            .arcColor(()=>["rgba(255,95,75,0.06)","rgba(201,162,75,0.88)"])
            .arcAltitude(0.22).arcStroke(0.55)
            .arcDashLength(0.42).arcDashGap(0.22).arcDashAnimateTime(3400);

          size();
          const c=world3.controls();
          c.autoRotate=!reduce(); c.autoRotateSpeed=1.1; c.enableZoom=false;
          world3.pointOfView({lat:22,lng:-15,altitude:2.4},0);
          brighten();
          addEventListener("resize",size);
        })
        .catch(()=>{});
    }

    /* Brighten globe so both hemispheres are visible */
    function brighten(){
      try{
        const mat=world3.globeMaterial&&world3.globeMaterial();
        if(mat&&mat.map){
          mat.emissive&&mat.emissive.setRGB(0.44,0.50,0.62);
          mat.emissiveMap=mat.map;
          mat.emissiveIntensity=1.05;
          if(mat.color) mat.color.setRGB(1,1,1);
          mat.needsUpdate=true; return;
        }
      }catch(e){}
      setTimeout(brighten,200);
    }

    function size(){
      if(!world3)return;
      const st=document.querySelector(".globe-stage");
      const s=Math.min(st.clientWidth,st.clientHeight);
      world3.width(s).height(s);
    }

    function ensure(){ if(!built) build(); else size(); }
    return { ensure };
  })();

  /* ---------- input ---------- */
  btnNext.addEventListener("click", next);
  btnBack.addEventListener("click", back);
  addEventListener("keydown",(e)=>{
    if(["ArrowRight","ArrowDown","PageDown"," "].includes(e.key)){e.preventDefault();next();}
    else if(["ArrowLeft","ArrowUp","PageUp"].includes(e.key)){e.preventDefault();back();}
    else if(e.key==="Home")go(0); else if(e.key==="End")go(N-1);
  });

  let wl=false;
  addEventListener("wheel",(e)=>{
    if(wl||flying)return; if(Math.abs(e.deltaY)<18&&Math.abs(e.deltaX)<18)return;
    wl=true; (e.deltaY>0||e.deltaX>0)?next():back();
    setTimeout(()=>wl=false,820);
  },{passive:true});

  let sx=0,sy=0,sw=false;
  addEventListener("touchstart",(e)=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY;sw=true;},{passive:true});
  addEventListener("touchend",(e)=>{
    if(!sw)return;sw=false;
    const dx=e.changedTouches[0].clientX-sx, dy=e.changedTouches[0].clientY-sy;
    if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)){dx<0?next():back();}
    else if(Math.abs(dy)>55&&Math.abs(dy)>Math.abs(dx)){dy<0?next():back();}
  },{passive:true});

  let rt;
  addEventListener("resize",()=>{ clearTimeout(rt); rt=setTimeout(()=>applyCam(camFor(index),true),120); });

  /* ---------- init ---------- */
  function init(){
    if(window.FX) FX.init();
    buildRail();
    layout();
    if(window.I18nController) I18nController.init();
    updateChrome();
    if(reduce()){ applyCam(camFor(0), true); }
    else{
      applyCam(overviewCam(), true);
      requestAnimationFrame(()=>{ setTimeout(()=>{ applyCam(camFor(0)); onEnter(0); }, 520); });
    }
    seen.add(0); countUps(stops[0].el);
  }

  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init);
  else init();
})();
