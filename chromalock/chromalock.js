const state = {
  level: 1, lives: 3, best: Number(localStorage.getItem("chromaLockBest") || 1),
  target: {h:0,s:78,l:58}, current: {h:0,s:78,l:58}, roundStart: 0, animationId: null, locked: false,
};
const els = {
  level: document.querySelector("#level"), lives: document.querySelector("#lives"), margin: document.querySelector("#margin"), best: document.querySelector("#best"),
  target: document.querySelector("#targetSwatch"), moving: document.querySelector("#movingSwatch"), lock: document.querySelector("#lockBtn"),
  message: document.querySelector("#message"), accuracy: document.querySelector("#accuracyText"), difference: document.querySelector("#differenceText"), fill: document.querySelector("#scoreFill"),
  help: document.querySelector("#help-dialog"), gameover: document.querySelector("#gameover-dialog"),
};
const randomBetween = (min,max) => Math.floor(Math.random()*(max-min+1))+min;
const marginForLevel = level => Math.max(5,26-level*2);
const cycleDurationForLevel = level => Math.max(10000,16000-Math.min(level,12)*450);
const cycleArcForLevel = level => Math.max(60,170-level*5);
const hsl = colour => `hsl(${colour.h.toFixed(1)} ${colour.s.toFixed(1)}% ${colour.l.toFixed(1)}%)`;
function hueDifference(a,b){const difference=Math.abs(a-b)%360;return Math.min(difference,360-difference);}
function track(name,params){if(typeof window.gtag==="function")window.gtag("event",name,params);if(window.mixpanel?.track)window.mixpanel.track(name,params);}

function updateHud(){
  els.level.textContent=state.level;
  els.lives.textContent=Array.from({length:state.lives},()=>"●").join(" ");
  els.lives.setAttribute("aria-label",`${state.lives} lives`);
  els.margin.textContent=`${marginForLevel(state.level)}°`;
  els.best.textContent=state.best;
}
function renderSwatches(){els.target.style.background=hsl(state.target);els.moving.style.background=hsl(state.current);}
function generateTarget(){state.target={h:randomBetween(0,359),s:randomBetween(62,88),l:randomBetween(42,64)};}
function setMessage(text,tone=""){els.message.textContent=text;els.message.className=`message ${tone}`.trim();}
function animate(timestamp){
  if(!state.roundStart)state.roundStart=timestamp;
  const elapsed=timestamp-state.roundStart,arc=cycleArcForLevel(state.level),duration=cycleDurationForLevel(state.level),phase=(elapsed%duration)/duration;
  state.current={h:(state.target.h+Math.sin(phase*Math.PI*2)*arc+360)%360,s:Math.min(92,Math.max(50,state.target.s+Math.sin(phase*Math.PI*2+Math.PI/3)*2.5)),l:Math.min(70,Math.max(34,state.target.l+Math.cos(phase*Math.PI*2)*2))};
  renderSwatches();state.animationId=requestAnimationFrame(animate);
}
function startRound(message=`Level ${state.level} gives you a ${marginForLevel(state.level)}° match window.`){
  cancelAnimationFrame(state.animationId);state.locked=false;state.roundStart=0;els.lock.disabled=false;els.fill.style.width="0%";
  els.accuracy.textContent="Watch the colour move through the target.";els.difference.textContent="Press lock when your eyes say they match.";
  setMessage(message);generateTarget();updateHud();state.animationId=requestAnimationFrame(animate);
}
function saveBest(){if(state.level>state.best){state.best=state.level;localStorage.setItem("chromaLockBest",String(state.best));}}
function lockMatch(){
  if(state.locked)return;state.locked=true;els.lock.disabled=true;cancelAnimationFrame(state.animationId);
  const difference=hueDifference(state.target.h,state.current.h),margin=marginForLevel(state.level),accuracy=Math.max(0,Math.round((1-difference/180)*100)),passed=difference<=margin;
  els.fill.style.width=`${accuracy}%`;els.difference.textContent=`${difference.toFixed(1)}° away`;els.accuracy.textContent=passed?"Inside the match window.":"Outside the match window.";
  if(passed){state.level+=1;saveBest();track("chroma_lock_success",{level:state.level-1,difference:Number(difference.toFixed(1)),margin});setMessage(`Good lock — ${difference.toFixed(1)}° away.`,"good");setTimeout(()=>startRound(),900);return;}
  state.lives-=1;track("chroma_lock_miss",{level:state.level,difference:Number(difference.toFixed(1)),margin});updateHud();setMessage(`${difference.toFixed(1)}° away. ${state.lives?`${state.lives} ${state.lives===1?"life":"lives"} left.`:"No lives remaining."}`,"bad");
  if(state.lives<=0){document.querySelector("#final-level").textContent=state.level;setTimeout(()=>els.gameover.showModal(),500);}else setTimeout(()=>startRound(),1000);
}
function restart(){state.level=1;state.lives=3;if(els.gameover.open)els.gameover.close();startRound();}

els.lock.addEventListener("click",lockMatch);els.moving.addEventListener("click",lockMatch);
document.querySelector("#help-button").addEventListener("click",()=>els.help.showModal());
document.querySelectorAll("[data-close]").forEach(button=>button.addEventListener("click",()=>button.closest("dialog").close()));
document.querySelector("#restart-button").addEventListener("click",restart);
startRound();
if(!localStorage.getItem("chromaLockIntroSeen")){els.help.showModal();localStorage.setItem("chromaLockIntroSeen","true");}
