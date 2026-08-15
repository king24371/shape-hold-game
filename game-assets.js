/** 素材接口：替換同名檔案，或在 circleVariants 新增素材即可。 */
window.GAME_ASSETS = {
  background: {
    tag: "background",
    apiUrl: "https://rule34-api.netlify.app/posts?limit=100&pid=0"
  },
  doubleCircle: { image: "assets/Boobs.png", outline: "assets/Boobs_white_outline.png", loop: "audio/loop/oppai-loop.mp3" },
  circleVariants: [
    { id: "boob", image: "assets/Circle/Boob.png", loop: "audio/loop/oppai-loop.mp3" },
    { id: "clit", image: "assets/Circle/Clit.png", loop: "audio/loop/kuri-loop.mp3" },
    { id: "glans", image: "assets/Circle/Glans.png", loop: "audio/loop/kitou-loop.mp3" },
    { id: "nipple", image: "assets/Circle/Nipple.png", loop: "audio/loop/chikubi-loop.mp3" },
    { id: "nipple1", image: "assets/Circle/Nipple1.png", loop: "audio/loop/chikubi-loop.mp3" },
    { id: "pussy", image: "assets/Circle/Pussy.png", loop: "audio/loop/manko-loop.mp3" }
  ],
  successSounds: ["audio/iku/Ah.mp3", "audio/iku/Huh.mp3", "audio/iku/iku.mp3"],
  failureSound: "audio/cry/cry.mp3"
};
