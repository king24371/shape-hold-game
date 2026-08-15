(() => {
  const TARGETS = [.72,.84,.96,1.08,1.2,1.32,1.44,1.56];
  const START = .42;
  const $ = (id) => document.getElementById(id);
  const ui = { score:$("score"), round:$("round"), headline:$("headline"), description:$("description"), panel:$("gamePanel"), target:$("targetShape"), player:$("playerShape"), hold:$("holdZone"), card:$("statusCard"), title:$("statusTitle"), sub:$("statusSub"), final:$("finalCard"), finalScore:$("finalScore"), finalCopy:$("finalCopy"), restart:$("restart"), background:$("webBackground") };
  const assets = window.GAME_ASSETS;
  const audio = { loop:null, success:assets.successSounds.map(path=>new Audio(path)), failure:assets.failureSound?new Audio(assets.failureSound):null };
  let phase="ready", outcome=null, failureReason=null, round=1, score=0, scale=START, target=TARGETS[0], frame=null, timer=null, started=0, currentAsset=assets.circleVariants[0], lastCircle=-1, lastTarget=-1;

  function sound(name) { const a=name==="success"?audio.success[Math.floor(Math.random()*audio.success.length)]:audio.failure; if(!a)return; a.currentTime=0; a.play().catch(()=>{}); }
  async function loadBackground(){
    const config=assets.background;
    try{
      const response=await fetch(`${config.apiUrl}&tags=${encodeURIComponent(config.tag)}`);
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const posts=await response.json();
      const candidates=posts.filter(post=>post.sample_url||post.file_url||post.preview_url).sort(()=>Math.random()-.5);
      if(!candidates.length)return;
      for(const post of candidates.slice(0,12)){
        const urls=[post.sample_url,post.file_url,post.preview_url].filter(url=>url&&/\.(?:jpe?g|png|webp|gif)(?:\?|$)/i.test(url));
        for(const url of urls){
          const loaded=await new Promise(resolve=>{const image=new Image();image.referrerPolicy="no-referrer";image.onload=()=>resolve(image.naturalWidth>0&&image.naturalHeight>0);image.onerror=()=>resolve(false);image.src=url;});
          if(loaded){ui.background.style.backgroundImage=`url("${url}")`;ui.background.closest(".play-area").classList.add("has-background");return;}
        }
      }
      console.warn("本批背景圖片皆無法載入，保留目前背景。");
    }catch(error){console.warn("背景圖片載入失敗，使用預設背景。",error);}
  }
  function stopLoop(){ cancelAnimationFrame(frame); frame=null; if(audio.loop){audio.loop.pause();audio.loop.currentTime=0;} }
  function shapeMarkup(kind){ return kind==="circle" ? '<span class="disc"></span>' : `<img class="shape-image outline-image" src="${assets.doubleCircle.outline}" alt="" draggable="false">`; }
  function setShape(kind, asset){
    ui.target.className=`shape-mark ghost ${kind}`; ui.target.innerHTML=shapeMarkup(kind);
    ui.player.className=`shape-mark asset ${kind}`;
    ui.player.innerHTML=`<img class="shape-image" src="${asset.image}" alt="" draggable="false">`;
  }
  function transform(){ ui.player.style.transform=`translate(-50%,-50%) scale(${scale})`; ui.target.style.transform=`translate(-50%,-50%) scale(${target})`; }
  function status(title,sub,classes){ ui.title.textContent=title;ui.sub.textContent=sub;ui.card.className=`status-card ${classes}`; }
  function prepare(n){
    let targetIndex=Math.floor(Math.random()*TARGETS.length);if(TARGETS.length>1&&targetIndex===lastTarget)targetIndex=(targetIndex+1)%TARGETS.length;lastTarget=targetIndex;
    round=n; target=TARGETS[targetIndex]; scale=START; phase="ready"; outcome=null; failureReason=null;
    document.querySelector(".stage").classList.remove("exploding");
    const kind=Math.random()<.5?"double":"circle";
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
    timer=setTimeout(()=>{if(!success)finish();else prepare(round+1);},success?900:1200);
  }
  function release(){if(phase!=="growing")return;resolve(scale<target*.94?"too-small":"success");}
  function finish(){
    phase="finished";ui.panel.hidden=true;ui.final.hidden=false;ui.finalScore.textContent=score.toLocaleString();
    const cleared=outcome==="failure"?round-1:round;
    ui.headline.textContent="挑戰結束。";
    ui.description.textContent=`你完成了 ${cleared} 個隨機目標。`;
    ui.finalCopy.textContent=`止步第 ${round} 關，共完成 ${cleared} 關。`;
  }
  function restart(){stopLoop();clearTimeout(timer);score=0;ui.score.textContent="0";ui.panel.hidden=false;ui.final.hidden=true;ui.headline.textContent="憑感覺，剛剛好。";ui.description.textContent="每回合的圖形與目標尺寸都會隨機變化。按住圖形，在最接近外框時放開。";loadBackground();prepare(1);}
  ui.hold.addEventListener("pointerdown",e=>{ui.hold.setPointerCapture(e.pointerId);begin();});
  ui.hold.addEventListener("pointerup",release);ui.hold.addEventListener("pointercancel",release);
  addEventListener("keydown",e=>{if((e.code==="Space"||e.code==="Enter")&&!e.repeat){e.preventDefault();begin();}});
  addEventListener("keyup",e=>{if(e.code==="Space"||e.code==="Enter")release();});
  ui.restart.addEventListener("click",restart);loadBackground();prepare(1);
})();
