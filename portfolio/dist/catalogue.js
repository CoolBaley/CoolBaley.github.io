(() => {
 const grid = document.querySelector('.work-grid');
 const cards = [...grid.querySelectorAll('article')];
 const filters = [...document.querySelectorAll('[data-filter]')];
 const sort = document.getElementById('work-sort');
 const count = document.getElementById('work-count');
 let category = 'all';
 const text = card => card.querySelector('h3').textContent.trim();
 function update() {
  const ordered = [...cards].sort((a,b) => {
   if (sort.value === 'title') return text(a).localeCompare(text(b), document.documentElement.lang === 'en' ? 'en' : 'zh-CN');
   if (sort.value !== 'featured') {
    if (!a.dataset.date || !b.dataset.date) return a.dataset.date ? -1 : b.dataset.date ? 1 : Number(a.dataset.order)-Number(b.dataset.order);
    const diff = a.dataset.date.localeCompare(b.dataset.date);
    if(diff) return sort.value === 'newest' ? -diff : diff;
   }
   return Number(a.dataset.order)-Number(b.dataset.order);
  });
  let visible=0;
  ordered.forEach(card => {
   const categories = [card.dataset.category, ...(card.dataset.tags || '').split(/\s+/)];
   card.hidden = category !== 'all' && !categories.includes(category);
   if (!card.hidden) visible++;
   grid.appendChild(card);
  });
  count.textContent = document.documentElement.lang === 'en' ? `${visible} of ${cards.length} works` : `显示 ${visible} / ${cards.length} 件作品`;
 }
 filters.forEach(button => button.addEventListener('click', () => {
  category = button.dataset.filter;
  filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
  update();
 }));
 sort.addEventListener('change', update);
 document.addEventListener('languagechange', update);
 update();
})();
