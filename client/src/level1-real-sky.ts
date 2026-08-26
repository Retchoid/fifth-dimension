/* LEVEL 1 TRUE TRANSPARENT FOREGROUND + ORIGINAL MOVING SKY + ALLEY LIFE */
import "./level1-real-sky.css";

const SKY_HOST_SELECTOR = ".arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-sunset-alley";
const MASTER_SELECTOR = ".level-one-master-art";
const FOREGROUND_SRC = "https://raw.githubusercontent.com/Retchoid/fifth-dimension/49898bf04b85d0eb3373abafd063e85e586cc4bb/5d_level1_no_sky.png";
const ORIGINAL_SKY_SRC = "https://raw.githubusercontent.com/Retchoid/fifth-dimension/4bf5ac658e541491b31c9a044161825c7c2abdc0/5d_level1_sky_preview-5.png";
const processedHosts = new WeakSet<Element>();

const waitForImage = (image: HTMLImageElement) => new Promise<boolean>((resolve) => {
  if (image.complete) return resolve(Boolean(image.naturalWidth && image.naturalHeight));
  image.addEventListener("load", () => resolve(true), { once: true });
  image.addEventListener("error", () => resolve(false), { once: true });
});
const makeImage = (className: string, src: string) => { const image=document.createElement("img"); image.className=className; image.src=src; image.alt=""; image.draggable=false; image.setAttribute("aria-hidden","true"); return image; };
const randomBetween=(min:number,max:number)=>Math.round(min+Math.random()*(max-min));

const installOriginalSkyContract=()=>{
  if(document.getElementById("level-one-original-sky-contract")) return;
  document.getElementById("level-one-visible-sky-override")?.remove();
  const style=document.createElement("style");
  style.id="level-one-original-sky-contract";
  style.textContent=`
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-real-sky-stack,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two).level-one-master-state-waking .level-one-real-sky-stack,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two).level-one-master-state-dusk .level-one-real-sky-stack,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two).level-one-master-state-night .level-one-real-sky-stack{background:none!important;filter:none!important}
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-real-sky-stack::before,
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-real-sky-stack::after{content:none!important;display:none!important;background:none!important;animation:none!important}
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two) .level-one-painted-sky{inset:0!important;width:100%!important;height:100%!important;object-fit:contain!important;object-position:50% 50%!important;opacity:1!important;mix-blend-mode:normal!important;transform:scale(1.04)!important;transform-origin:50% 50%!important;filter:none!important;animation:level-one-original-sky-drift 26s ease-in-out infinite alternate!important;transition:filter 2600ms ease!important}
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two).level-one-master-state-waking .level-one-painted-sky{opacity:1!important;filter:saturate(1.04) brightness(.95) hue-rotate(4deg)!important}
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two).level-one-master-state-dusk .level-one-painted-sky{opacity:1!important;filter:saturate(.98) brightness(.82) hue-rotate(15deg)!important}
  .arcade-cabinet-bezel .game-viewport:not(.is-level-two).level-one-master-state-night .level-one-painted-sky{opacity:1!important;filter:saturate(.88) brightness(.62) hue-rotate(32deg)!important}
  @keyframes level-one-original-sky-drift{0%{transform:scale(1.045) translate3d(-.35%,0,0)}50%{transform:scale(1.047) translate3d(.08%,-.12%,0)}100%{transform:scale(1.045) translate3d(.35%,.06%,0)}}
  `;
  document.head.append(style);
};

const installAlleyLife=(host:Element)=>{
  const viewport=host.closest<HTMLElement>(".game-viewport"); if(!viewport) return;
  const life=document.createElement("div"); life.className="level-one-alley-life"; life.setAttribute("aria-hidden","true");
  life.innerHTML=`<span class="alley-rat"><i></i></span><span class="alley-pipe-steam alley-pipe-steam-a"></span><span class="alley-pipe-steam alley-pipe-steam-b"></span><span class="alley-bouncer-life alley-bouncer-left"></span><span class="alley-bouncer-life alley-bouncer-right"></span><span class="alley-crowd-life alley-crowd-a"></span><span class="alley-crowd-life alley-crowd-b"></span><span class="alley-crowd-life alley-crowd-c"></span><span class="alley-window-light alley-window-a"></span><span class="alley-window-light alley-window-b"></span><span class="alley-window-light alley-window-c"></span><span class="alley-neon-life"></span><span class="alley-flyer-life"></span><div class="alley-earned-gear"><span class="earned-gear earned-crate"><i></i><i></i><i></i></span><span class="earned-gear earned-headphones"><i></i><b></b></span><span class="earned-gear earned-flightcase"></span><span class="earned-gear earned-cable"></span></div>`;
  host.append(life);
  const timers=new Set<number>();
  const schedule=(selector:string,className:string,minDelay:number,maxDelay:number,activeMs:number,probability=1)=>{const el=life.querySelector<HTMLElement>(selector);if(!el)return;const run=()=>{if(!document.body.contains(host))return;if(Math.random()<=probability){el.classList.remove(className);void el.offsetWidth;el.classList.add(className);const off=window.setTimeout(()=>el.classList.remove(className),activeMs);timers.add(off)}const next=window.setTimeout(run,randomBetween(minDelay,maxDelay));timers.add(next)};timers.add(window.setTimeout(run,randomBetween(minDelay,maxDelay)))};
  schedule(".alley-rat","is-scuttling",18000,42000,2200,.72); schedule(".alley-pipe-steam-a","is-bursting",6500,14500,3300,.88); schedule(".alley-pipe-steam-b","is-bursting",23000,48000,4700,.68); schedule(".alley-bouncer-left","is-moving",12000,29000,1600,.72); schedule(".alley-bouncer-right","is-moving",17000,35000,1900,.66); schedule(".alley-crowd-a","is-moving",9000,24000,1400,.72); schedule(".alley-crowd-b","is-moving",13000,31000,1800,.66); schedule(".alley-crowd-c","is-moving",16000,36000,1300,.60); schedule(".alley-neon-life","is-flickering",11000,27000,1200,.72); schedule(".alley-flyer-life","is-skittering",26000,56000,3900,.55);
  const update=()=>{const records=Number.parseInt(viewport.querySelector<HTMLElement>(".records-hud strong")?.textContent??"0",10)||0;life.classList.toggle("gear-crate-earned",records>=5);life.classList.toggle("gear-headphones-earned",records>=10);life.classList.toggle("gear-flightcase-earned",records>=15);life.classList.toggle("gear-cable-earned",records>=20);life.classList.toggle("alley-progress-waking",records>=6);life.classList.toggle("alley-progress-dusk",records>=12);life.classList.toggle("alley-progress-night",records>=19)}; update(); const obs=new MutationObserver(update); obs.observe(viewport,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["class"]});
};

const installOnHost=async(host:Element)=>{if(processedHosts.has(host))return;processedHosts.add(host);const masters=Array.from(host.querySelectorAll<HTMLImageElement>(MASTER_SELECTOR));if(!masters.length)return;await Promise.all(masters.map(waitForImage));host.querySelectorAll(".level-one-checkerboard-sky,.level-one-animated-sky,.level-one-transparent-foreground,.level-one-real-sky,.level-one-real-sky-stack,.level-one-alley-life").forEach(n=>n.remove());const sky=document.createElement("span");sky.className="level-one-real-sky-stack";sky.setAttribute("aria-hidden","true");sky.append(makeImage("level-one-real-sky-image level-one-painted-sky",ORIGINAL_SKY_SRC));const foreground=makeImage("level-one-transparent-foreground",FOREGROUND_SRC);host.prepend(sky);host.append(foreground);const[fgOk,skyOk]=await Promise.all([waitForImage(foreground),waitForImage(sky.querySelector<HTMLImageElement>(".level-one-painted-sky")!)]);if(!fgOk){foreground.remove();sky.remove();return}host.classList.add("level-one-transparent-foreground-ready");if(skyOk)host.classList.add("level-one-independent-sky-ready");installAlleyLife(host)};
const scan=()=>document.querySelectorAll(SKY_HOST_SELECTOR).forEach(host=>void installOnHost(host));
const observer=new MutationObserver(scan); const start=()=>{installOriginalSkyContract();scan();if(document.body)observer.observe(document.body,{childList:true,subtree:true})};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
