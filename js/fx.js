/* =============================================================
   fx.js — the living data-scape  (professional overhaul)
   · CircuitField : PCB traces (L-shaped + smooth bezier),
                    pixel squares, bloom, light pulses,
                    superpulse, data bursts, scan beam,
                    + 13 drifting transparent chart types
   · MatrixRain   : falling glyphs behind Impact numbers
   · buildFlow    : knowledge flowchart, PDCA hub, no kanji
   ============================================================= */

window.FX = (() => {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DPR = Math.min(devicePixelRatio || 1, 1.8);
  const TAU = Math.PI * 2;
  const lerp = (a,b,t) => a+(b-a)*t;
  const rnd  = (a,b)   => a+Math.random()*(b-a);
  const clamp= (v,lo,hi)=> Math.max(lo,Math.min(hi,v));

  /* ================================================================
     CIRCUIT FIELD
     ================================================================ */
  const Circuit = (() => {
    let cv, ctx, W, H, nodes=[], grid=[], links=[], pulses=[],
        squares=[], blooms=[], widgets=[], bursts=[], scanBeam=null,
        raf=0, t=0;

    /* ---- path helpers ---- */
    const plen = pts => {
      let L=0;
      for(let i=0;i<pts.length-1;i++) L+=Math.hypot(pts[i+1].x-pts[i].x,pts[i+1].y-pts[i].y);
      return L;
    };
    function pointAt(pts,d){
      for(let i=0;i<pts.length-1;i++){
        const a=pts[i],b=pts[i+1]; const s=Math.hypot(b.x-a.x,b.y-a.y);
        if(d<=s){ const f=s?d/s:0; return {x:lerp(a.x,b.x,f),y:lerp(a.y,b.y,f)}; }
        d-=s;
      }
      return pts[pts.length-1];
    }
    // Sample a cubic bezier into polyline pts
    function bezierPts(p0,cp1,cp2,p1,steps){
      const out=[];
      for(let i=0;i<=steps;i++){
        const s=i/steps, si=1-s;
        out.push({
          x:si*si*si*p0.x+3*si*si*s*cp1.x+3*si*s*s*cp2.x+s*s*s*p1.x,
          y:si*si*si*p0.y+3*si*si*s*cp1.y+3*si*s*s*cp2.y+s*s*s*p1.y,
        });
      }
      return out;
    }

    /* ---- build world ---- */
    function build(){
      const GX = W<700?110:140;
      const cols=Math.ceil(W/GX), rows=Math.ceil(H/GX);
      grid=[]; nodes=[];
      for(let i=0;i<=cols;i++){
        grid[i]=[];
        for(let j=0;j<=rows;j++){
          const x=i*GX+rnd(-22,22), y=j*GX+rnd(-22,22);
          if(Math.random()<0.58){
            grid[i][j]={x,y,i,j,tw:rnd(0,TAU)};
            nodes.push(grid[i][j]);
          } else grid[i][j]=null;
        }
      }

      links=[];
      nodes.forEach(n=>{
        [[1,0],[0,1],[1,1],[2,0],[0,2]].forEach(([di,dj])=>{
          const m=grid[n.i+di] && grid[n.i+di][n.j+dj];
          if(!m||Math.random()>0.55) return;
          const useBezier = Math.random()<0.45;
          let pts;
          if(useBezier){
            const dx=(m.x-n.x), dy=(m.y-n.y);
            const cp1={x:n.x+dx*0.35+rnd(-60,60), y:n.y+dy*0.1+rnd(-60,60)};
            const cp2={x:n.x+dx*0.65+rnd(-60,60), y:n.y+dy*0.9+rnd(-60,60)};
            pts=bezierPts({x:n.x,y:n.y},cp1,cp2,{x:m.x,y:m.y},24);
          } else {
            const mid=Math.random()<0.5 ? {x:m.x,y:n.y} : {x:n.x,y:m.y};
            pts=[{x:n.x,y:n.y},mid,{x:m.x,y:m.y}];
          }
          if(!useBezier && Math.random()<0.2 && pts.length===3){
            const jx=pts[1].x+rnd(-30,30), jy=pts[1].y+rnd(-30,30);
            pts.splice(1,0,{x:jx,y:jy});
          }
          links.push({pts, bezier:useBezier, brightness:rnd(0.8,1.4)});
        });
      });
      // occasional long-range curved links for visual surprise
      for(let extra=0;extra<Math.round(nodes.length*0.06);extra++){
        const a=nodes[(Math.random()*nodes.length)|0];
        const b=nodes[(Math.random()*nodes.length)|0];
        if(a===b) continue;
        const dx=b.x-a.x, dy=b.y-a.y;
        const perp={x:-dy*rnd(0.3,0.7), y:dx*rnd(0.3,0.7)};
        const cp1={x:a.x+dx*0.25+perp.x, y:a.y+dy*0.25+perp.y};
        const cp2={x:a.x+dx*0.75-perp.x, y:a.y+dy*0.75-perp.y};
        const pts=bezierPts({x:a.x,y:a.y},cp1,cp2,{x:b.x,y:b.y},32);
        links.push({pts, bezier:true, brightness:rnd(0.6,1.0), longRange:true});
      }
      links.forEach(l=>l.len=plen(l.pts));

      pulses=[];
      const pc=Math.round(links.length*0.50);
      for(let k=0;k<pc;k++) spawnPulse();

      squares=[];
      links.forEach(l=>{
        const n=1+(Math.random()*4|0);
        for(let k=0;k<n;k++){
          const p=pointAt(l.pts, Math.random()*l.len);
          squares.push({x:p.x+rnd(-14,14),y:p.y+rnd(-14,14),s:rnd(2.5,7),fill:Math.random()<0.5,tw:rnd(0,TAU),sp:rnd(0.5,1.8)});
        }
      });
      for(let k=0;k<W/14;k++) squares.push({x:rnd(0,W),y:rnd(0,H),s:rnd(2,5),fill:Math.random()<0.4,tw:rnd(0,TAU),sp:rnd(0.4,1.2)});

      blooms=[];
      for(let k=0;k<6;k++) blooms.push({x:rnd(0,W),y:rnd(0,H),r:rnd(80,160),tw:rnd(0,TAU)});

      widgets=[];
      const wn=W<900?6:9;
      const kinds=["radar","pie","scatter","candles","spark","donut","bars","gauge",
                   "network","heatmap","area","waterfall","funnel"];
      for(let k=0;k<wn;k++) widgets.push({
        x:rnd(0,W), y:rnd(0,H),
        vx:rnd(-0.08,0.08), vy:rnd(-0.06,0.06),
        w:rnd(150,218),
        kind:kinds[k%kinds.length],
        seed:rnd(0,TAU),
        angle:rnd(0,TAU), aSpd:rnd(-0.0004,0.0004)
      });

      bursts=[];
      scanBeam={y:rnd(0,H), spd:rnd(0.18,0.35)*H/600, alpha:0};
    }

    function spawnPulse(){
      if(!links.length) return;
      const li=(Math.random()*links.length)|0;
      const l=links[li];
      const rev=Math.random()<0.40;
      const gold=Math.random()<0.55;
      pulses.push({
        li, rev,
        d: rev ? l.len : 0,
        spd: rnd(1.2,3.4) * (rev?-1:1),
        col: gold ? [201,162,75] : [123,176,224],
        life:1,
        isSuper: Math.random()<0.07
      });
    }

    function spawnBurst(x,y){
      const n=6+(Math.random()*8|0);
      for(let i=0;i<n;i++) bursts.push({
        x,y,
        vx:rnd(-2.5,2.5), vy:rnd(-2.5,2.5),
        life:1,
        col: Math.random()<0.5 ? [201,162,75] : [123,176,224],
        r: rnd(1.5,3.5)
      });
    }

    /* ---- chart renderers ---- */
    function roundRect(x,y,w,h,r){
      ctx.beginPath();
      ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r);
      ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
    }
    const CGOLD="rgba(201,162,75,0.62)";
    const CBLUE="rgba(123,176,224,0.58)";
    const CFBLUE="rgba(123,176,224,0.18)";
    const CGREEN="rgba(70,224,139,0.55)";

    function widgetCard(w){
      ctx.save();
      ctx.translate(w.x, w.y);
      if(w.aSpd!==0){ ctx.translate(w.w/2, w.w*0.62/2); ctx.rotate(w.angle); ctx.translate(-w.w/2,-w.w*0.62/2); }
      ctx.globalAlpha=0.46;
      const h=w.w*0.62;
      ctx.fillStyle="rgba(8,21,47,0.52)";
      ctx.strokeStyle="rgba(123,176,224,0.22)";
      ctx.lineWidth=1;
      roundRect(0,0,w.w,h,10); ctx.fill(); ctx.stroke();
      ctx.fillStyle=CGOLD; ctx.fillRect(12,10,28,4);
      ctx.fillStyle="rgba(174,185,210,0.28)"; ctx.fillRect(46,10,w.w-62,4);
      const cw=w.w-24, ch=h-36;
      ctx.translate(12,24);

      switch(w.kind){

        case "spark":{
          ctx.beginPath();
          for(let i=0;i<20;i++){
            const x=cw*i/19;
            const y=ch-(0.18+0.64*(Math.sin(t*0.001+i*0.55+w.seed)*0.5+0.5))*ch;
            i ? ctx.lineTo(x,y) : ctx.moveTo(x,y);
          }
          ctx.strokeStyle=CGOLD; ctx.lineWidth=1.7; ctx.stroke();
          ctx.lineTo(cw,ch); ctx.lineTo(0,ch); ctx.closePath();
          ctx.fillStyle="rgba(201,162,75,0.09)"; ctx.fill();
          break;
        }

        case "bars":{
          const n=8;
          for(let i=0;i<n;i++){
            const v=Math.sin(t*0.0011+i*0.9+w.seed)*0.5+0.5;
            const bh=ch*(0.15+0.75*v);
            ctx.fillStyle=i%2?CBLUE:CGOLD;
            ctx.fillRect(i*cw/n,ch-bh,cw/n*0.55,bh);
          }
          break;
        }

        case "donut":{
          const r=Math.min(cw,ch)/2-2;
          const ang=(Math.sin(t*0.0008+w.seed)*0.5+0.5)*TAU;
          ctx.lineWidth=7;
          ctx.strokeStyle=CFBLUE;
          ctx.beginPath(); ctx.arc(cw/2,ch/2,r,0,TAU); ctx.stroke();
          ctx.strokeStyle=CGOLD;
          ctx.beginPath(); ctx.arc(cw/2,ch/2,r,-Math.PI/2,-Math.PI/2+ang); ctx.stroke();
          ctx.fillStyle="rgba(201,162,75,0.55)";
          ctx.font=`bold ${Math.round(ch*0.2)}px monospace`;
          ctx.textAlign="center"; ctx.textBaseline="middle";
          ctx.fillText(Math.round(ang/TAU*100)+"%",cw/2,ch/2);
          ctx.textAlign="start"; ctx.textBaseline="alphabetic";
          break;
        }

        case "gauge":{
          const r=Math.min(cw,ch/1.2)/2;
          const ang=(Math.sin(t*0.0009+w.seed)*0.5+0.5)*Math.PI;
          ctx.lineWidth=7; ctx.lineCap="round";
          ctx.strokeStyle=CFBLUE;
          ctx.beginPath(); ctx.arc(cw/2,ch*0.8,r,Math.PI,0); ctx.stroke();
          ctx.strokeStyle=CGOLD;
          ctx.beginPath(); ctx.arc(cw/2,ch*0.8,r,Math.PI,Math.PI+ang); ctx.stroke();
          const nx=cw/2+Math.cos(Math.PI+ang)*(r-8);
          const ny=ch*0.8+Math.sin(Math.PI+ang)*(r-8);
          ctx.strokeStyle="rgba(226,200,135,0.9)"; ctx.lineWidth=1.5;
          ctx.beginPath(); ctx.moveTo(cw/2,ch*0.8); ctx.lineTo(nx,ny); ctx.stroke();
          ctx.lineCap="butt";
          break;
        }

        case "radar":{
          const cx=cw/2, cy=ch/2, R=Math.min(cw,ch)/2-3, N=6;
          ctx.strokeStyle=CFBLUE; ctx.lineWidth=0.8;
          for(let ring=1;ring<=3;ring++){
            ctx.beginPath();
            for(let i=0;i<=N;i++){
              const a=-Math.PI/2+i/N*TAU;
              const x=cx+Math.cos(a)*R*ring/3, y=cy+Math.sin(a)*R*ring/3;
              i?ctx.lineTo(x,y):ctx.moveTo(x,y);
            }
            ctx.stroke();
          }
          for(let i=0;i<N;i++){
            const a=-Math.PI/2+i/N*TAU;
            ctx.beginPath(); ctx.moveTo(cx,cy);
            ctx.lineTo(cx+Math.cos(a)*R, cy+Math.sin(a)*R); ctx.stroke();
          }
          ctx.beginPath();
          for(let i=0;i<=N;i++){
            const a=-Math.PI/2+i/N*TAU;
            const v=0.35+0.6*(Math.sin(t*0.001+i*1.1+w.seed)*0.5+0.5);
            const x=cx+Math.cos(a)*R*v, y=cy+Math.sin(a)*R*v;
            i?ctx.lineTo(x,y):ctx.moveTo(x,y);
          }
          ctx.closePath();
          ctx.fillStyle="rgba(201,162,75,0.15)"; ctx.fill();
          ctx.strokeStyle=CGOLD; ctx.lineWidth=1.4; ctx.stroke();
          break;
        }

        case "pie":{
          const cx=cw/2, cy=ch/2, R=Math.min(cw,ch)/2-2;
          let a=-Math.PI/2+t*0.00025;
          const segs=[0.33,0.24,0.20,0.14,0.09];
          const cols=[CGOLD,CBLUE,"rgba(226,200,135,0.5)","rgba(110,151,204,0.4)",CGREEN];
          segs.forEach((s,i)=>{
            const a2=a+s*TAU;
            ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,R,a,a2); ctx.closePath();
            ctx.fillStyle=cols[i]; ctx.fill(); a=a2;
          });
          break;
        }

        case "scatter":{
          ctx.strokeStyle=CFBLUE; ctx.lineWidth=0.8; ctx.strokeRect(0,0,cw,ch);
          ctx.strokeStyle="rgba(201,162,75,0.5)"; ctx.lineWidth=1;
          ctx.setLineDash([4,4]);
          ctx.beginPath(); ctx.moveTo(0,ch*0.75); ctx.lineTo(cw,ch*0.2); ctx.stroke();
          ctx.setLineDash([]);
          for(let i=0;i<14;i++){
            const x=(Math.sin(i*13.1+w.seed)*0.5+0.5)*cw;
            const y=ch-((Math.sin(t*0.0006+i*2.3+w.seed)*0.5+0.5))*ch;
            ctx.fillStyle=i%3===0?CGOLD:CBLUE;
            ctx.beginPath(); ctx.arc(x,y,2.5,0,TAU); ctx.fill();
          }
          break;
        }

        case "candles":{
          const n=7, bw=cw/n;
          for(let i=0;i<n;i++){
            const base=Math.sin(t*0.0009+i*1.7+w.seed);
            const mid=ch*0.5-base*ch*0.18;
            const len=ch*0.14+(Math.sin(t*0.0013+i)*0.5+0.5)*ch*0.15;
            const up=base>0;
            const colStr=up?"rgba(70,224,139,0.65)":"rgba(255,99,99,0.58)";
            const x=i*bw+bw/2;
            ctx.strokeStyle=colStr; ctx.lineWidth=1;
            ctx.beginPath(); ctx.moveTo(x,mid-len*1.4); ctx.lineTo(x,mid+len*1.4); ctx.stroke();
            ctx.fillStyle=colStr;
            ctx.fillRect(x-bw*0.22,mid-len*0.5,bw*0.44,len);
          }
          break;
        }

        case "network":{
          const n=7;
          const nx=Array.from({length:n},(_,i)=>({
            x:(Math.sin(i*2.399+w.seed)*0.5+0.5)*cw,
            y:(Math.cos(i*2.399+w.seed*0.7)*0.5+0.5)*ch
          }));
          ctx.strokeStyle="rgba(123,176,224,0.28)"; ctx.lineWidth=1;
          for(let i=0;i<n;i++){
            const target=(i+1)%n;
            ctx.beginPath(); ctx.moveTo(nx[i].x,nx[i].y); ctx.lineTo(nx[target].x,nx[target].y); ctx.stroke();
            if(i%3===0){
              const target2=(i+3)%n;
              ctx.beginPath(); ctx.moveTo(nx[i].x,nx[i].y); ctx.lineTo(nx[target2].x,nx[target2].y); ctx.stroke();
            }
          }
          nx.forEach((nd,i)=>{
            const pulse=0.55+0.45*Math.sin(t*0.002+i+w.seed);
            const r=3.5*pulse;
            ctx.fillStyle=i%2?CGOLD:CBLUE;
            ctx.beginPath(); ctx.arc(nd.x,nd.y,r,0,TAU); ctx.fill();
            ctx.strokeStyle=i%2?"rgba(201,162,75,0.25)":"rgba(123,176,224,0.25)";
            ctx.lineWidth=1; ctx.beginPath(); ctx.arc(nd.x,nd.y,r*2.5,0,TAU); ctx.stroke();
          });
          break;
        }

        case "heatmap":{
          const rows=5, cols=7;
          const cellW=cw/cols, cellH=ch/rows;
          for(let r=0;r<rows;r++){
            for(let c=0;c<cols;c++){
              const v=Math.sin(t*0.0007+r*1.3+c*0.8+w.seed)*0.5+0.5;
              const rr=Math.round(lerp(62,201,v));
              const gg=Math.round(lerp(111,162,v));
              const bb=Math.round(lerp(176,75,v));
              ctx.fillStyle=`rgba(${rr},${gg},${bb},0.75)`;
              ctx.fillRect(c*cellW+1,r*cellH+1,cellW-2,cellH-2);
            }
          }
          break;
        }

        case "area":{
          const steps=20;
          const s1=Array.from({length:steps},(_,i)=>0.2+0.4*(Math.sin(t*0.001+i*0.6+w.seed)*0.5+0.5));
          const s2=Array.from({length:steps},(_,i)=>0.1+0.3*(Math.sin(t*0.0013+i*0.8+w.seed*1.2)*0.5+0.5));
          ctx.beginPath();
          for(let i=0;i<steps;i++) i?ctx.lineTo(cw*i/(steps-1),ch*(1-s1[i])):ctx.moveTo(0,ch*(1-s1[0]));
          ctx.lineTo(cw,ch); ctx.lineTo(0,ch); ctx.closePath();
          ctx.fillStyle="rgba(201,162,75,0.22)"; ctx.fill();
          ctx.strokeStyle=CGOLD; ctx.lineWidth=1.4; ctx.stroke();
          ctx.beginPath();
          for(let i=0;i<steps;i++){
            const y=ch*(1-s1[i]-s2[i]);
            i?ctx.lineTo(cw*i/(steps-1),y):ctx.moveTo(0,y);
          }
          for(let i=steps-1;i>=0;i--) ctx.lineTo(cw*i/(steps-1),ch*(1-s1[i]));
          ctx.closePath();
          ctx.fillStyle="rgba(123,176,224,0.22)"; ctx.fill();
          ctx.strokeStyle=CBLUE; ctx.lineWidth=1.2; ctx.stroke();
          break;
        }

        case "waterfall":{
          const n=6;
          let cum=ch*0.5;
          ctx.strokeStyle="rgba(123,176,224,0.2)"; ctx.lineWidth=0.8;
          ctx.beginPath(); ctx.moveTo(0,cum); ctx.lineTo(cw,cum); ctx.stroke();
          for(let i=0;i<n;i++){
            const delta=(Math.sin(t*0.0008+i*1.6+w.seed)*0.5+0.5-0.5)*ch*0.28;
            const x=i*cw/n+cw/n*0.12;
            const bw=cw/n*0.65;
            const y1=cum, y2=cum+delta;
            ctx.fillStyle=delta<0?"rgba(70,224,139,0.6)":"rgba(255,99,99,0.55)";
            ctx.fillRect(x,Math.min(y1,y2),bw,Math.abs(delta)||1);
            if(i<n-1){
              ctx.strokeStyle="rgba(174,185,210,0.2)"; ctx.lineWidth=0.8;
              ctx.beginPath(); ctx.setLineDash([3,4]);
              ctx.moveTo(x+bw,y2); ctx.lineTo(x+cw/n,y2); ctx.stroke();
              ctx.setLineDash([]);
            }
            cum=y2;
          }
          break;
        }

        case "funnel":{
          const levels=5;
          for(let i=0;i<levels;i++){
            const fraction=0.8+0.2*Math.sin(t*0.0007+w.seed)-i*(0.15+0.03*Math.sin(t*0.001+w.seed));
            const fw=cw*clamp(fraction,0.1,1);
            const lh=ch/levels-3;
            const x=(cw-fw)/2;
            const y=i*(lh+3);
            const ratio=i/(levels-1);
            const rr=Math.round(lerp(201,123,ratio));
            const gg=Math.round(lerp(162,176,ratio));
            const bb=Math.round(lerp(75,224,ratio));
            ctx.fillStyle=`rgba(${rr},${gg},${bb},0.58)`;
            roundRect(x,y,fw,lh,4); ctx.fill();
          }
          break;
        }

      }
      ctx.restore();
    }

    /* ---- main frame ---- */
    function frame(now){
      t=now;
      ctx.clearRect(0,0,W,H);

      // 1. drifting charts
      widgets.forEach(w=>{
        w.x+=w.vx; w.y+=w.vy; w.angle+=w.aSpd;
        if(w.x < -w.w)w.x=W+10; if(w.x > W+w.w)w.x=-w.w-10;
        if(w.y < -w.w)w.y=H+10; if(w.y > H+w.w)w.y=-w.w-10;
        widgetCard(w);
      });

      // 2. scan beam
      if(scanBeam){
        scanBeam.y += scanBeam.spd * 0.4;
        if(scanBeam.y>H+80){ scanBeam.y=-80; scanBeam.alpha=0; }
        const prog=scanBeam.y/H;
        scanBeam.alpha = Math.sin(prog*Math.PI)*0.28;
        if(scanBeam.alpha>0){
          const sg=ctx.createLinearGradient(0,scanBeam.y-22,0,scanBeam.y+22);
          sg.addColorStop(0,"rgba(123,176,224,0)");
          sg.addColorStop(0.5,`rgba(123,176,224,${scanBeam.alpha})`);
          sg.addColorStop(1,"rgba(123,176,224,0)");
          ctx.fillStyle=sg; ctx.fillRect(0,scanBeam.y-22,W,44);
        }
      }

      // 3. bloom glow
      ctx.save(); ctx.globalCompositeOperation="lighter";
      blooms.forEach(b=>{
        const a=0.04+0.05*(Math.sin(now*0.0007+b.tw)*0.5+0.5);
        const g=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r);
        g.addColorStop(0,`rgba(123,176,224,${a})`);
        g.addColorStop(1,"rgba(0,0,0,0)");
        ctx.fillStyle=g; ctx.fillRect(b.x-b.r,b.y-b.r,b.r*2,b.r*2);
      });
      ctx.restore();

      // 4. circuit traces
      links.forEach(l=>{
        const alpha = l.longRange ? 0.055 : (l.bezier ? 0.10 : 0.13);
        ctx.strokeStyle=`rgba(123,176,224,${alpha*l.brightness})`;
        ctx.lineWidth = l.longRange ? 0.8 : 1.3;
        ctx.beginPath();
        l.pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
        ctx.stroke();
      });

      // 5. pixel squares
      squares.forEach(s=>{
        const a=0.10+0.28*(Math.sin(now*0.0015*s.sp+s.tw)*0.5+0.5);
        if(s.fill){ ctx.fillStyle=`rgba(123,176,224,${a})`; ctx.fillRect(s.x,s.y,s.s,s.s); }
        else { ctx.strokeStyle=`rgba(201,162,75,${a*0.9})`; ctx.lineWidth=1; ctx.strokeRect(s.x,s.y,s.s,s.s); }
      });

      // 6. node markers
      nodes.forEach(n=>{
        const a=0.22+0.30*(Math.sin(now*0.0014+n.tw)*0.5+0.5);
        ctx.fillStyle=`rgba(201,162,75,${a})`;
        ctx.fillRect(n.x-1.5,n.y-1.5,3.5,3.5);
      });

      // 7. traveling pulses
      ctx.save(); ctx.globalCompositeOperation="lighter";
      for(let pi=pulses.length-1;pi>=0;pi--){
        const p=pulses[pi];
        const l=links[p.li]; if(!l){ p.life=0; continue; }
        p.d += p.spd;
        const atEnd = p.rev ? (p.d<=0) : (p.d>=l.len);
        if(atEnd){ p.life=0; }
        const headD = clamp(p.d,0,l.len);
        const tailD = clamp(p.d-(p.rev?-30:30),0,l.len);
        const head=pointAt(l.pts,headD);
        const tail=pointAt(l.pts,tailD);
        const [r,g,b]=p.col;
        const grad=ctx.createLinearGradient(tail.x,tail.y,head.x,head.y);
        grad.addColorStop(0,`rgba(${r},${g},${b},0)`);
        grad.addColorStop(1,`rgba(${r},${g},${b},${p.isSuper?1.0:0.88})`);
        ctx.strokeStyle=grad;
        ctx.lineWidth=p.isSuper?4.0:2.2;
        ctx.lineCap="round";
        ctx.beginPath(); ctx.moveTo(tail.x,tail.y); ctx.lineTo(head.x,head.y); ctx.stroke();
        ctx.fillStyle=`rgba(${r},${g},${b},1)`;
        ctx.shadowBlur=p.isSuper?24:14;
        ctx.shadowColor=`rgba(${r},${g},${b},0.95)`;
        ctx.beginPath(); ctx.arc(head.x,head.y,p.isSuper?4:2,0,TAU); ctx.fill();
        ctx.shadowBlur=0;
        if(p.isSuper){
          const ring=((now*0.001)%1);
          ctx.strokeStyle=`rgba(${r},${g},${b},${1-ring})`;
          ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(head.x,head.y,ring*18+4,0,TAU); ctx.stroke();
        }
        if(p.life<=0){ pulses.splice(pi,1); spawnPulse(); }
      }
      ctx.restore();

      // 8. data burst particles
      ctx.save(); ctx.globalCompositeOperation="lighter";
      for(let bi=bursts.length-1;bi>=0;bi--){
        const b=bursts[bi];
        b.x+=b.vx; b.y+=b.vy; b.vx*=0.94; b.vy*=0.94;
        b.life-=0.025;
        if(b.life<=0){ bursts.splice(bi,1); continue; }
        const [r,g,bl]=b.col;
        ctx.fillStyle=`rgba(${r},${g},${bl},${b.life*0.8})`;
        ctx.beginPath(); ctx.arc(b.x,b.y,b.r*b.life,0,TAU); ctx.fill();
      }
      ctx.restore();

      if(Math.random()<0.0008 && nodes.length){
        const n=nodes[(Math.random()*nodes.length)|0];
        spawnBurst(n.x,n.y);
      }

      if(!reduce) raf=requestAnimationFrame(frame);
    }

    function size(){
      W=innerWidth; H=innerHeight;
      cv.width=W*DPR; cv.height=H*DPR;
      cv.style.width=W+"px"; cv.style.height=H+"px";
      ctx.setTransform(DPR,0,0,DPR,0,0);
      build();
    }

    function init(){
      cv=document.getElementById("fxCircuit"); if(!cv)return;
      ctx=cv.getContext("2d"); size(); frame(performance.now());
      addEventListener("resize",()=>{ clearTimeout(size._t); size._t=setTimeout(()=>{ size(); frame(performance.now()); },150); });
    }

    return { init };
  })();

  /* ================================================================
     MATRIX RAIN
     ================================================================ */
  const Matrix = (() => {
    let cv, ctx, W, H, cols, drops=[], raf=0, on=false, alpha=0;
    const GL="アイウエオカキクケコサシスセソタチツテトナニヌ0123456789$€£%ABCDEFXYZ".split("");
    const FS=18;
    function size(){
      W=innerWidth; H=innerHeight;
      cv.width=W*DPR; cv.height=H*DPR;
      cv.style.width=W+"px"; cv.style.height=H+"px";
      ctx.setTransform(DPR,0,0,DPR,0,0);
      cols=Math.ceil(W/FS); drops=Array.from({length:cols},()=>rnd(-40,0));
    }
    function frame(){
      alpha=lerp(alpha,on?1:0,0.06);
      if(alpha<0.01&&!on){ ctx.clearRect(0,0,W,H); if(!reduce)raf=requestAnimationFrame(frame); return; }
      ctx.fillStyle="rgba(6,13,34,0.16)"; ctx.fillRect(0,0,W,H);
      ctx.font=`${FS}px ui-monospace, monospace`;
      for(let i=0;i<cols;i++){
        const ch=GL[(Math.random()*GL.length)|0];
        const x=i*FS, y=drops[i]*FS;
        ctx.fillStyle=`rgba(226,200,135,${0.9*alpha})`; ctx.fillText(ch,x,y);
        ctx.fillStyle=`rgba(123,176,224,${0.32*alpha})`; ctx.fillText(GL[(Math.random()*GL.length)|0],x,y-FS);
        if(y>H&&Math.random()>0.975) drops[i]=rnd(-30,0);
        drops[i]+=0.55;
      }
      if(!reduce) raf=requestAnimationFrame(frame);
    }
    function init(){
      cv=document.getElementById("fxMatrix"); if(!cv)return;
      ctx=cv.getContext("2d"); size(); frame();
      addEventListener("resize",()=>{ clearTimeout(size._t); size._t=setTimeout(size,150); });
    }
    return { init, set:(v)=>{ on=v; if(reduce){ alpha=v?0.55:0; frame(); } } };
  })();

  /* ================================================================
     KNOWLEDGE FLOWCHART — rotating PDCA hub (KAIZEN, no kanji)
     ================================================================ */
  function buildFlow(){
    const host=document.getElementById("flowChart");
    if(!host||host.dataset.built) return;
    host.dataset.built="1";
    const NS="http://www.w3.org/2000/svg", VW=1400, VH=430;
    const svg=document.createElementNS(NS,"svg");
    svg.setAttribute("viewBox",`0 0 ${VW} ${VH}`);
    svg.setAttribute("class","flow-svg");
    svg.innerHTML=`<defs>
      <filter id="flGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>`;

    const cx=700, cy=215, R=92;
    const N={
      data:  {x:60,   y:38,  w:250,h:74, k:"in",     key:"flow.data"},
      proc:  {x:60,   y:178, w:250,h:74, k:"in",     key:"flow.process"},
      qual:  {x:60,   y:318, w:250,h:74, k:"in",     key:"flow.quality"},
      sap:   {x:1070, y:90,  w:270,h:96, k:"pillar", key:"flow.sap"},
      auto:  {x:1070, y:244, w:270,h:96, k:"pillar", key:"flow.auto"},
    };
    const aR=(n)=>[N[n].x+N[n].w, N[n].y+N[n].h/2];
    const aL=(n)=>[N[n].x, N[n].y+N[n].h/2];

    function edgePath(a,b){
      const mx=(a[0]+b[0])/2;
      return `M${a[0]},${a[1]} C${mx},${a[1]} ${mx},${b[1]} ${b[0]},${b[1]}`;
    }

    const edges=[
      {d:edgePath(aR("data"), [cx-R-2, cy-52])},
      {d:edgePath(aR("proc"), [cx-R+4, cy])},
      {d:edgePath(aR("qual"), [cx-R-2, cy+52])},
      {d:edgePath([cx+R+2, cy-46], aL("sap"))},
      {d:edgePath([cx+R+2, cy+46], aL("auto"))},
    ];

    let html="";
    edges.forEach((e,i)=>{
      html+=`<path d="${e.d}" id="fe${i}" class="flow-edge"></path>
             <path d="${e.d}" class="flow-edge-dash"></path>`;
    });
    Object.entries(N).forEach(([id,o])=>{
      html+=`<g class="flow-node fn-${o.k}">
        <rect x="${o.x}" y="${o.y}" width="${o.w}" height="${o.h}" rx="12" ${o.k==="pillar"?'filter="url(#flGlow)"':''}></rect>
        <text x="${o.x+o.w/2}" y="${o.y+o.h/2}" class="flow-label" data-i18n="${o.key}"
          text-anchor="middle" dominant-baseline="central">…</text></g>`;
    });
    svg.innerHTML+=html;

    /* rotating PDCA ring */
    const ring=document.createElementNS(NS,"g");
    ring.setAttribute("class","kaizen-rot");
    const gap=14, segCols=["#C9A24B","#7BB0E0","#E2C887","#6E97CC"], letters=["P","D","C","A"];
    let segs="";
    for(let s=0;s<4;s++){
      const a0=(s*90+gap/2)*Math.PI/180, a1=((s+1)*90-gap/2)*Math.PI/180;
      const x0=cx+R*Math.cos(a0), y0=cy+R*Math.sin(a0);
      const x1=cx+R*Math.cos(a1), y1=cy+R*Math.sin(a1);
      segs+=`<path d="M${x0.toFixed(1)},${y0.toFixed(1)} A${R},${R} 0 0 1 ${x1.toFixed(1)},${y1.toFixed(1)}"
              fill="none" stroke="${segCols[s]}" stroke-width="11" stroke-linecap="round" opacity="0.92"></path>`;
      const ta=a1+Math.PI/2, ah=9;
      segs+=`<path d="M${(x1+Math.cos(ta)*ah).toFixed(1)},${(y1+Math.sin(ta)*ah).toFixed(1)}
              L${(x1+Math.cos(a1)*ah*1.4).toFixed(1)},${(y1+Math.sin(a1)*ah*1.4).toFixed(1)}
              L${(x1-Math.cos(ta)*ah).toFixed(1)},${(y1-Math.sin(ta)*ah).toFixed(1)} Z" fill="${segCols[s]}"></path>`;
      const am=((s+0.5)*90)*Math.PI/180;
      segs+=`<text x="${(cx+Math.cos(am)*R).toFixed(1)}" y="${(cy+Math.sin(am)*R).toFixed(1)}"
              class="kaizen-letter" text-anchor="middle" dominant-baseline="central">${letters[s]}</text>`;
    }
    ring.innerHTML=segs;
    ring.innerHTML+=`<animateTransform attributeName="transform" type="rotate"
        from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="20s" repeatCount="indefinite"></animateTransform>`;
    svg.appendChild(ring);

    /* static centre — KAIZEN in Latin, no kanji */
    const centre=document.createElementNS(NS,"g");
    centre.setAttribute("class","kaizen-centre");
    centre.innerHTML=`
      <circle cx="${cx}" cy="${cy}" r="${R-28}" class="kaizen-core"></circle>
      <text x="${cx}" y="${cy-10}" class="kaizen-title" text-anchor="middle">KAIZEN</text>
      <text x="${cx}" y="${cy+18}" class="kaizen-sub" text-anchor="middle"
        data-i18n="flow.hub">Continuous Improvement</text>`;
    svg.appendChild(centre);

    edges.forEach((e,i)=>{
      for(let k=0;k<2;k++){
        const c=document.createElementNS(NS,"circle");
        c.setAttribute("r","4.5"); c.setAttribute("class","flow-pulse");
        c.innerHTML=`<animateMotion dur="${rnd(2.6,3.8).toFixed(2)}s"
          begin="${(k*1.4+i*0.3).toFixed(2)}s" repeatCount="indefinite" rotate="auto">
          <mpath href="#fe${i}"></mpath></animateMotion>`;
        svg.appendChild(c);
      }
    });

    host.appendChild(svg);
  }

  function init(){ Circuit.init(); Matrix.init(); buildFlow(); }
  function activate(stopId){ Matrix.set(stopId==="s-impact"); }
  return { init, activate, buildFlow };
})();
