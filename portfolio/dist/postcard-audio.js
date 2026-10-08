(() => {
 document.querySelectorAll('.postcard-audio').forEach(button => {
  const card = button.closest('.postcard');
  const audio = document.getElementById(button.getAttribute('aria-controls'));
  if (!audio) return;
  const label = button.querySelector('.postcard-action-label');
  let generation = 0;
  let requested = false;
  let mode = null;
  let needsClick = false;
  audio.volume = 1;

  function allowed() {
   return card.classList.contains('is-flipped') && !document.hidden;
  }
  function translate(text) {
   return document.documentElement.lang === 'en' && window.portfolioText ? window.portfolioText(text) : text;
  }
  function update() {
   const playing = requested && !audio.paused && !audio.ended;
   button.classList.toggle('is-playing', playing);
   button.setAttribute('aria-pressed', String(playing));
   button.setAttribute('aria-label', translate(playing ? '暂停小耳朵的声音' : needsClick ? '点击播放小耳朵的声音' : '播放小耳朵的声音'));
   button.title = translate(playing ? '暂停小耳朵的声音' : needsClick ? '点击播放小耳朵的声音' : '悬停或点击，听小耳朵打招呼');
   if (label) label.textContent = translate(playing ? '播放中' : needsClick ? '点击播放' : '听猫猫');
  }
  function stop() {
   generation++;
   requested = false;
   mode = null;
   audio.pause();
   audio.currentTime = 0;
   update();
  }
  async function play(source) {
   if (!allowed()) return;
   const request = ++generation;
   requested = true;
   mode = source;
   audio.currentTime = 0;
   try {
    await audio.play();
    if (request !== generation) {
     if (!requested) { audio.pause(); audio.currentTime = 0; }
     return;
    }
    if (!allowed()) { stop(); return; }
    needsClick = false;
    update();
   } catch {
    if (request !== generation) return;
    stop();
    needsClick = true;
    update();
   }
  }
  button.addEventListener('pointerenter', event => {
   if (event.pointerType === 'mouse' && !requested) play('hover');
  });
  button.addEventListener('pointerleave', () => {
   if (mode === 'hover') stop();
  });
  button.addEventListener('click', () => {
   if (requested) stop();
   else play('click');
  });
  audio.addEventListener('playing', () => {
   if (!requested || !allowed()) stop();
   else update();
  });
  audio.addEventListener('pause', update);
  audio.addEventListener('ended', stop);
  audio.addEventListener('error', () => { stop(); needsClick = true; update(); });
  card.addEventListener('postcardflip', event => { if (!event.detail.open) stop(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.addEventListener('pagehide', stop);
  document.addEventListener('languagechange', update);
 });
})();
