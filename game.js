(() => {
  const TARGETS = [.72,.84,.96,1.08,1.2,1.32,1.44,1.56];
  const START = .42;
  const $ = (id) => document.getElementById(id);
  const ui = { score:$("score"), round:$("round"), headline:$("headline"), description:$("description"), panel:$("gamePanel"), target:$("targetShape"), player:$("playerShape"), hold:$("holdZone"), card:$("statusCard"), title:$("statusTitle"), sub:$("statusSub"), final:$("finalCard"), finalScore:$("finalScore"), finalCopy:$("finalCopy"), restart:$("restart") };
  const assets = window.GAME_ASSETS;
  const audio = { loop:null, success:assets.successSounds.map(path=>new Audio(path)), failure:assets.failureSound?new Audio(assets.failureSound):null };
  let phase="ready", outcome=null, failureReason=null, round=1, score=0, scale=START, target=TARGETS[0], frame=null, timer=null, started=0, currentAsset=assets.circleVariants[0], lastCircle=-1;

  function sound(name) { const a=name==="success"?audio.success[Math.floor(Math.random()*audio.success.length)]:audio.failure; if(!a)return; a.currentTime=0; a.play().catch(()=>{}); }
  function stopLoop(){ cancelAnimationFrame(frame); frame=null; if(audio.loop){audio.loop.pause();audio.loop.currentTime=0;} }
  function shapeMarkup(kind){ return kind==="circle" ? '<span class="disc"></span>' : '<span class="ring left"></span><span class="ring right"></span>'; }
  function setShape(kind, asset){
    ui.target.className=`shape-mark ghost ${kind}`; ui.target.innerHTML=shapeMarkup(kind);
    ui.player.className=`shape-mark asset ${kind}`;
    ui.player.innerHTML=`<img class="shape-image" src="${asset.image}" alt="" draggable="false">`;
  }
  function transform(){ ui.player.style.transform=`translate(-50%,-50%) scale(${scale})`; ui.target.style.transform=`translate(-50%,-50%) scale(${target})`; }
  function status(title,sub,classes){ ui.title.textContent=title;ui.sub.textContent=sub;ui.card.className=`status-card ${classes}`; }
  function prepare(n){
    round=n; target=TARGETS[n-1]; scale=START; phase="ready"; outcome=null; failureReason=null;
    document.querySelector(".stage").classList.remove("exploding");
    const kind=n%2===0?"double":"circle";
    if(kind==="double") currentAsset=assets.doubleCircle;
    else { let index=Math.floor(Math.random()*assets.circleVariants.length); if(assets.circleVariants.length>1&&index===lastCircle)index=(index+1)%assets.circleVariants.length;lastCircle=index;currentAsset=assets.circleVariants[index]; }
    ui.round.textContent=String(n).padStart(2,"0"); setShape(kind,currentAsset); transform();
    status("按住開始","滑鼠／觸控，或 SPACE／ENTER","ready"); ui.hold.disabled=false;
  }
  function begin(){
    if(phase!=="ready")return; phase="growing"; started=performance.now(); status("現在放開！","對準目標外框","growing");
    if(audio.loop)audio.loop.pause();audio.loop=currentAsset.loop?new Audio(currentAsset.loop):null;if(audio.loop){audio.loop.loop=true;audio.loop.currentTime=0;audio.loop.play().catch(()=>{});}
    const tick=(now)=>{scale=START+(now-started)/1350;transform();if(scale>target*1.08){resolve("too-large");return;}frame=requestAnimationFrame(tick);};
    frame=requestAnimationFrame(tick);
  }
  function resolve(result){
    if(phase!=="growing")return; stopLoop(); phase="result";
    const accuracy=Math.max(0,Math.round((1-Math.abs(scale-target)/target)*100));
    const success=result==="success"; outcome=success?"success":"failure"; failureReason=success?null:result;
    if(result==="too-large")document.querySelector(".stage").classList.add("exploding");
    const earned=success?(accuracy>=99?1500:accuracy>=96?1000:accuracy*8):0;
    if(success)score+=earned;ui.score.textContent=score.toLocaleString();ui.hold.disabled=true;
    status(success?`漂亮！ ${accuracy}%`:result==="too-large"?"太大了！爆炸！":"太小了！",success?`+${earned.toLocaleString()} · 自動進入下一關`:"正在結算成績",`result ${outcome}`);
    sound(success?"success":"failure");
    timer=setTimeout(()=>{if(!success||round>=TARGETS.length)finish();else prepare(round+1);},success?900:1200);
  }
  function release(){if(phase!=="growing")return;resolve(scale<target*.94?"too-small":"success");}
  function finish(){
    phase="finished";ui.panel.hidden=true;ui.final.hidden=false;ui.finalScore.textContent=score.toLocaleString();
    const cleared=outcome==="failure"?round-1:round;
    ui.headline.textContent=outcome==="failure"?"挑戰結束。":"全部過關！";
    ui.description.textContent=`你完成了 ${cleared} 個逐漸放大的目標。`;
    ui.finalCopy.textContent=outcome==="failure"?`止步第 ${round} 關，共完成 ${cleared} 關。`:"八個逐漸放大的圖形，全數完成。";
  }
  function restart(){stopLoop();clearTimeout(timer);score=0;ui.score.textContent="0";ui.panel.hidden=false;ui.final.hidden=true;ui.headline.textContent="憑感覺，剛剛好。";ui.description.textContent="每關目標會越來越大。按住圖形讓它成長，在最接近外框時放開。";prepare(1);}
  ui.hold.addEventListener("pointerdown",e=>{ui.hold.setPointerCapture(e.pointerId);begin();});
  ui.hold.addEventListener("pointerup",release);ui.hold.addEventListener("pointercancel",release);
  addEventListener("keydown",e=>{if((e.code==="Space"||e.code==="Enter")&&!e.repeat){e.preventDefault();begin();}});
  addEventListener("keyup",e=>{if(e.code==="Space"||e.code==="Enter")release();});
  ui.restart.addEventListener("click",restart);prepare(1);
})();
