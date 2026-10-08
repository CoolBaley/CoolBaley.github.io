let scrollFrame = null;
let navScrolled;
const syncScroll = () => {
 scrollFrame = null;
 const scrolled = window.scrollY > 12;
 if (scrolled !== navScrolled) {
  document.documentElement.classList.toggle('scrolled', scrolled);
  navScrolled = scrolled;
 }
};
window.addEventListener('scroll', () => {
 if (scrollFrame === null) scrollFrame = requestAnimationFrame(syncScroll);
}, { passive: true });
syncScroll();
function loadDialogImages(dialog) {
 dialog.querySelectorAll('img[data-src]').forEach(image => {
  if (image.closest('[data-content-lang][hidden]')) return;
  if (image.dataset.srcset) {
   image.srcset = image.dataset.srcset;
   image.removeAttribute('data-srcset');
  }
  image.src = image.dataset.src;
  image.removeAttribute('data-src');
 });
}
document.querySelectorAll('[data-dialog]').forEach(button => button.addEventListener('click', () => {
 const dialog = document.getElementById(button.dataset.dialog);
 if (!dialog) return;
 dialog.showModal();
 loadDialogImages(dialog);
}));
document.querySelectorAll('dialog').forEach(dialog => {
 dialog.querySelector('.dialog-close')?.addEventListener('click', () => dialog.close());
 dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
 });
});
const imageViewer = document.getElementById('image-dialog');
let fullImageRatio = 1;
function sizeFullImage() {
 const maxWidth = Math.min(window.innerWidth * .96 - (window.innerWidth <= 640 ? 18 : 34), 1566);
 imageViewer.querySelector('img').sizes = Math.ceil(Math.min(maxWidth, window.innerHeight * .8 * fullImageRatio)) + 'px';
}
function showFullImage(image) {
 const full = imageViewer.querySelector('img');
 fullImageRatio = Number(image.getAttribute('width')) / Number(image.getAttribute('height'));
 sizeFullImage();
 full.srcset = image.dataset.fullSrcset || '';
 full.src = image.dataset.full;
 full.alt = image.alt;
 imageViewer.querySelector('.image-caption').textContent = image.alt;
 imageViewer.showModal();
}
window.addEventListener('resize', () => { if (imageViewer.open) sizeFullImage(); }, { passive: true });
document.querySelectorAll('img[data-full]').forEach(image => {
 image.addEventListener('click', () => showFullImage(image));
 image.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); showFullImage(image); }
 });
});
document.addEventListener('languagechange', () => {
 document.querySelectorAll('dialog[open]').forEach(loadDialogImages);
});
