for (const box of document.querySelectorAll('[data-filter]')) {
  const rows = [...box.querySelectorAll('tbody tr')];
  const out = box.querySelector('[data-count]');
  const run = () => {
    const v = Object.fromEntries([...box.querySelectorAll('input,select')].map((el) => [el.name, el.value.trim().toLowerCase()]));
    let n = 0;
    for (const tr of rows) {
      const d = tr.dataset;
      const ok = (!v.q || d.text.includes(v.q)) && (!v.cat || d.cat === v.cat) && (!v.region || d.region === v.region)
        && (!v.curr || d.curr.split(' ').includes(v.curr)) && (!v.tag || d.tag.split(' ').includes(v.tag));
      tr.hidden = !ok;
      n += ok;
    }
    out.textContent = n;
  };
  box.addEventListener('input', run);
}
