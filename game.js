(() => {
  const TARGETS = [.72,.84,.96,1.08,1.2,1.32,1.44,1.56];
  const START = .42;
  const $ = (id) => document.getElementById(id);
  const ui = { score:$("score"), round:$("round"), headline:$("headline"), description:$("description"), panel:$("gamePanel"), target:$("targetShape"), player:$("playerShape"), hold:$("holdZone"), card:$("statusCard"), title:$("statusTitle"), sub:$("statusSub"), final:$("finalCard"), finalScore:$("finalScore"), finalCopy:$("finalCopy"), restart:$("restart") };
  const assets = window.GAME_ASSETS;
  const audio = {};
  Object.entries(assets.audio).forEach(([key,path]) => { audio[key] = path ? new Audio(path) : null; });
  if (audio.growingLoop) audio.growingLoop.loop = true;
  let phase="ready", outcome=null, round=1, score=0, scale=START, target=TARGETS[0], frame=null, timer=null, started=0;

  function sound(name) { const a=audio[name]; if(!a)return; a.currentTime=0; a.play().catch(()=>{}); }
  function stopLoop(){ cancelAnimationFrame(frame); frame=null; if(audio.growingLoop){audio.growingLoop.pause();audio.growingLoop.currentTime=0;} }
  function shapeMarkup(kind){ return kind==="circle" ? '<span class="disc"></span>' : '<span class="ring left"></span><span class="ring right"></span>'; }
  function setShape(kind){
    ui.target.className=`shape-mark ghost ${kind}`; ui.target.innerHTML=shapeMarkup(kind);
    ui.player.className=`shape-mark asset ${kind}`;
    ui.player.innerHTML=`<img class="shape-image" src="${kind==="circle"?assets.images.circle:assets.images.doubleCircle}" alt="" draggable="false">`;
  }
  function transform(){ ui.player.style.transform=`translate(-50%,-50%) scale(${scale})`; ui.target.style.transform=`translate(-50%,-50%) scale(${target})`; }
  function status(title,sub,classes){ ui.title.textContent=title;ui.sub.textContent=sub;ui.card.className=`status-card ${classes}`; }
  function prepare(n){
    round=n; target=TARGETS[n-1]; scale=START; phase="ready"; outcome=null;
    ui.round.textContent=String(n).padStart(2,"0"); setShape(n%2===0?"double":"circle"); transform();
    status("????","皛?嚗孛?改???SPACE嚗NTER","ready"); ui.hold.disabled=false;
  }
  function begin(){
    if(phase!=="ready")return; phase="growing"; started=performance.now(); status("?曉?暸?嚗?,"撠??格?憭?","growing");
    if(audio.growingLoop){audio.growingLoop.currentTime=0;audio.growingLoop.play().catch(()=>{});}
    const tick=(now)=>{scale=Math.min(1.9,START+(now-started)/1350);transform();if(scale<1.9)frame=requestAnimationFrame(tick);};
    frame=requestAnimationFrame(tick);
  }
  function release(){
    if(phase!=="growing")return; stopLoop(); phase="result";
    const accuracy=Math.max(0,Math.round((1-Math.abs(scale-target)/target)*100));
    const success=scale>=target*.94&&scale<=target*1.08; outcome=success?"success":"failure";
    const earned=success?(accuracy>=99?1500:accuracy>=96?1000:accuracy*8):0;
    if(success)score+=earned;ui.score.textContent=score.toLocaleString();ui.hold.disabled=true;
    status(success?`瞍漁嚗?${accuracy}%`:`憭望? 繚 ${accuracy}%`,success?`+${earned.toLocaleString()} 繚 ?芸??脣銝??:"甇?蝯??蜀",`result ${outcome}`);
    sound(success?"success":"failure");
    timer=setTimeout(()=>{if(!success||round>=TARGETS.length)finish();else prepare(round+1);},success?900:1200);
  }
  function finish(){
    phase="finished";ui.panel.hidden=true;ui.final.hidden=false;ui.finalScore.textContent=score.toLocaleString();
    const cleared=outcome==="failure"?round-1:round;
    ui.headline.textContent=outcome==="failure"?"?蝯???:"?券??嚗?;
    ui.description.textContent=`雿??? ${cleared} ?撓?曉之?璅;
    ui.finalCopy.textContent=outcome==="failure"?`甇Ｘ郊蝚?${round} ???勗???${cleared} ?:"?怠撓?曉之??敶ｇ??冽摰???;
  }
  function restart(){stopLoop();clearTimeout(timer);score=0;ui.score.textContent="0";ui.panel.hidden=false;ui.final.hidden=true;ui.headline.textContent="??閬綽???憟賬?;ui.description.textContent="瘥??格???靘?憭扼?雿?敶Ｚ?摰??瘀??冽??亥?憭????;prepare(1);}
  ui.hold.addEventListener("pointerdown",e=>{ui.hold.setPointerCapture(e.pointerId);begin();});
  ui.hold.addEventListener("pointerup",release);ui.hold.addEventListener("pointercancel",release);
  addEventListener("keydown",e=>{if((e.code==="Space"||e.code==="Enter")&&!e.repeat){e.preventDefault();begin();}});
  addEventListener("keyup",e=>{if(e.code==="Space"||e.code==="Enter")release();});
  ui.restart.addEventListener("click",restart);prepare(1);
})();

