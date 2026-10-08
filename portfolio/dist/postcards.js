(() => {
 const track = document.querySelector('.postcard-track');
 if (!track) return;
 const slots = [...track.querySelectorAll('.postcard-slot')];
 if (!slots.length) return;
 const previous = document.getElementById('postcards-prev');
 const next = document.getElementById('postcards-next');
 const counter = document.getElementById('fragment-current');
 const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

 // Shuffle the original nodes once per page load; no duplicated stories or IDs.
 for (let index = slots.length - 1; index > 0; index--) {
  const random = Math.floor(Math.random() * (index + 1));
  [slots[index], slots[random]] = [slots[random], slots[index]];
 }
 slots.forEach(slot => track.appendChild(slot));

 let frame = null;
 let animation = null;
 let remainingDistance = 0;
 let rebasing = false;
 let currentSlot = slots[0];
 let viewportWidth = track.clientWidth;

 function stride() {
  const nodes = track.children;
  return nodes.length > 1 ? nodes[1].offsetLeft - nodes[0].offsetLeft : nodes[0].offsetWidth;
 }
 function centerOf(slot) {
  return slot.offsetLeft + slot.offsetWidth / 2 - track.clientWidth / 2;
 }
 function moveNode(slot, before = null) {
  // moveBefore preserves focused descendants in browsers that support it.
  if (track.moveBefore) track.moveBefore(slot, before);
  else track.insertBefore(slot, before);
 }
 function rebalance(left = track.scrollLeft) {
  const maximum = track.scrollWidth - track.clientWidth;
  const step = stride();
  if (rebasing || slots.length < 3 || maximum <= step * 2) return false;
  const buffer = Math.min(step * 3, maximum * .15);
  if (left >= buffer && left <= maximum - buffer) return false;
  const nodes = [...track.children];
  const count = Math.max(1, Math.min(Math.floor(slots.length / 3), Math.floor((maximum - buffer * 2) / step)));
  const reference = left < buffer ? nodes[0] : nodes[count];
  const before = reference.offsetLeft;
  const focused = document.activeElement;
  rebasing = true;
  if (left < buffer) nodes.slice(-count).forEach(slot => moveNode(slot, reference));
  else nodes.slice(0, count).forEach(slot => moveNode(slot));
  // Compensate by the exact moved width, keeping every visible card in place.
  track.scrollTo({ left: left + reference.offsetLeft - before, behavior: 'instant' });
  if (focused && track.contains(focused) && document.activeElement !== focused) focused.focus({ preventScroll: true });
  rebasing = false;
  return true;
 }
 function centerSlot(slot) {
  const left = centerOf(slot);
  if (!rebalance(left)) track.scrollTo({ left, behavior: 'instant' });
 }
 function arrange() {
  rebalance();
  const center = track.clientWidth / 2;
  const left = track.scrollLeft;
  // Finish all geometry reads before writing transforms, avoiding forced layouts per card.
  const positions = slots.map(slot => ({ slot, x: slot.offsetLeft - left + slot.offsetWidth / 2 }));
  let distance = Infinity;
  positions.forEach(({slot, x}) => {
   const delta = x - center;
   const unit = Math.max(-1, Math.min(1, delta / center));
   slot.style.setProperty('--arc-angle', `${unit * 9}deg`);
   slot.style.setProperty('--arc-y', `${unit * unit * 13}px`);
   if (Math.abs(delta) < distance) { distance = Math.abs(delta); currentSlot = slot; }
  });
  const current = String(slots.indexOf(currentSlot) + 1).padStart(2, '0');
  if (counter.textContent !== current) counter.textContent = current;
 }
 function schedule() {
  // The button animation already arranges once per frame; scroll events must not repeat it.
  if (animation !== null || document.hidden) return;
  if (frame === null) frame = requestAnimationFrame(() => { frame = null; arrange(); });
 }
 function stopMotion() {
  if (animation !== null) cancelAnimationFrame(animation);
  animation = null;
  remainingDistance = 0;
 }
 function advance(distance) {
  // Small increments also cross a seam correctly in reduced-motion mode.
  while (Math.abs(distance) > .01) {
   rebalance();
   const increment = Math.sign(distance) * Math.min(Math.abs(distance), stride() / 2);
   track.scrollTo({ left: track.scrollLeft + increment, behavior: 'instant' });
   distance -= increment;
  }
  arrange();
 }
 function moveBy(distance) {
  const total = remainingDistance + distance;
  stopMotion();
  if (frame !== null) { cancelAnimationFrame(frame); frame = null; }
  if (Math.abs(total) < .5) return;
  if (reducedMotion.matches) { advance(total); return; }
  remainingDistance = total;
  let start;
  function animate(time) {
   start ??= time;
   const progress = Math.min(1, (time - start) / 420);
   const remaining = total * Math.pow(1 - progress, 3);
   advance(remainingDistance - remaining);
   remainingDistance = remaining;
   animation = progress < 1 ? requestAnimationFrame(animate) : null;
  }
  animation = requestAnimationFrame(animate);
 }
 function browse(direction) {
  moveBy(direction * stride() * (track.clientWidth > 700 ? 2 : 1));
 }

 // Start away from either physical end, with the first random story centered.
 const first = track.firstElementChild;
 [...track.children].slice(-Math.floor(slots.length / 3)).forEach(slot => moveNode(slot, first));
 centerSlot(slots[0]);
 previous.addEventListener('click', () => browse(-1));
 next.addEventListener('click', () => browse(1));
 track.addEventListener('scroll', schedule, { passive: true });
 track.addEventListener('wheel', stopMotion, { passive: true });
 track.addEventListener('pointerdown', stopMotion, { passive: true });
 window.addEventListener('resize', () => {
  if (track.clientWidth !== viewportWidth) {
   stopMotion();
   viewportWidth = track.clientWidth;
   centerSlot(currentSlot);
  }
  schedule();
 }, { passive: true });
 document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
   stopMotion();
   if (frame !== null) cancelAnimationFrame(frame);
   frame = null;
  } else schedule();
 });
 window.addEventListener('pagehide', stopMotion);
 reducedMotion.addEventListener('change', () => { stopMotion(); schedule(); });
 track.addEventListener('keydown', event => {
  // Let the story's scroll area keep its own arrow-key scrolling.
  if ((event.target === track || event.target.matches('.postcard-front')) && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
   event.preventDefault(); browse(event.key === 'ArrowLeft' ? -1 : 1);
  }
  if (event.key === 'Escape') {
   const focusedCard = event.target.closest('.postcard');
   const openCards = track.querySelectorAll('.postcard.is-flipped');
   if (openCards.length) event.preventDefault();
   openCards.forEach(card => flip(card, false, card === focusedCard));
  }
 });
 function flip(card, open, moveFocus = true) {
  card.classList.toggle('is-flipped', open);
  const front = card.querySelector('.postcard-front');
  const back = card.querySelector('.postcard-back');
  front.disabled = open;
  front.setAttribute('aria-expanded', String(open));
  front.setAttribute('aria-hidden', String(open));
  front.tabIndex = open ? -1 : 0;
  back.inert = !open;
  back.setAttribute('aria-hidden', String(!open));
  back.querySelectorAll('.postcard-link, .postcard-audio, .postcard-note, .postcard-return').forEach(control => { control.tabIndex = open ? 0 : -1; });
  card.dispatchEvent(new CustomEvent('postcardflip', { detail: { open } }));
  if (moveFocus) {
   const destination = open ? back.querySelector('.postcard-link, .postcard-note') : front;
   destination.focus({ preventScroll: true });
  }
 }
 track.querySelectorAll('.postcard').forEach(card => {
  card.querySelector('.postcard-front').addEventListener('click', () => flip(card, true));
  card.querySelector('.postcard-return').addEventListener('click', () => flip(card, false));
  card.addEventListener('focusin', () => {
   if (rebasing) return;
   stopMotion();
   const slot = card.closest('.postcard-slot');
   if (slot.offsetLeft < track.scrollLeft + 60 || slot.offsetLeft + slot.offsetWidth > track.scrollLeft + track.clientWidth - 60) {
    moveBy(centerOf(slot) - track.scrollLeft);
   }
  });
 });
 arrange();
 // Browser-native lazy loading can fetch many cards along a horizontal rail.
 // Observe only the visible cards and one nearby card on either side after shuffling.
 const thumbnails = [...track.querySelectorAll('.postcard-visual img[data-src]')];
 function loadThumbnail(image) {
  image.loading = 'eager';
  if (image.dataset.srcset) {
   image.srcset = image.dataset.srcset;
   image.removeAttribute('data-srcset');
  }
  image.src = image.dataset.src;
  image.removeAttribute('data-src');
 }
 if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
   entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    loadThumbnail(entry.target);
    observer.unobserve(entry.target);
   });
  }, { root: track, rootMargin: '0px 180px', threshold: 0 });
  thumbnails.forEach(image => observer.observe(image));
 } else thumbnails.forEach(loadThumbnail);
})();
