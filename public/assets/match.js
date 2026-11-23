const form = document.querySelector('[data-match]');
const out = document.querySelector('[data-results]');
const summary = document.querySelector('[data-summary]');
const data = JSON.parse(document.getElementById('match-data').textContent);
const TRACK = { 'ib-dp': 'IB DP', ap: 'AP', 'a-level': 'A-Level', korean: '한국 교육과정', japanese: '일본 1조교', 'french-bac': '바칼로레아', cbse: 'CBSE' };
const TAG = { eal: 'EAL 강점', korean: '한국 학생 친화', small: '소규모', affordable: '학비 합리적', historic: '전통 명문', religious: '종교 교육' };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const gname = (g) => (g <= -2 ? '유아' : g === -1 ? 'PreK' : g === 0 ? 'K' : 'G' + g);
const fee = (f) => (f[0] === f[1] ? `${f[0]}만 엔` : `${f[0]}~${f[1]}만 엔`);

// 고른 조건만 배점: 일치율 = 얻은 점수 / 가능한 점수. 학년이 없으면 크게 깎는다.
function score(s, p) {
  if (p.sex === 'm' && s.tags.includes('girls')) return null;
  if (p.sex === 'f' && s.tags.includes('boys')) return null;
  const why = [], miss = [];
  let got = 0, max = 0, gradeOk = true;
  const add = (w, part, yes, no) => { max += w; got += w * part; if (part >= 0.5 && yes) why.push(yes); if (part < 0.5 && no) miss.push(no); };
  if (p.grade !== '') { const g = +p.grade; gradeOk = g >= s.g[0] && g <= s.g[1]; add(25, gradeOk ? 1 : 0, `${gname(g)} 학년 운영`, `${gname(g)} 학년 없음 (${gname(s.g[0])}~${gname(s.g[1])})`); }
  if (p.track) add(25, s.curr.includes(p.track) ? 1 : 0, `${TRACK[p.track]} 운영`, `${TRACK[p.track]} 없음`);
  if (p.region) {
    const area = data.find((x) => x.region === p.region).area;
    add(15, s.region === p.region ? 1 : s.area === area ? 0.5 : 0, s.region === p.region ? `${s.regionName} 소재` : `같은 ${area} 권역`, `${s.regionName} 소재`);
  }
  if (p.budget) { const b = +p.budget; add(15, s.fee[0] <= b ? 1 : s.fee[0] <= b * 1.2 ? 0.4 : 0, `수업료 ${fee(s.fee)} (예산 내)`, `수업료 ${fee(s.fee)}`); }
  if (p.boarding) add(12, (p.boarding === 'yes') === s.boarding ? 1 : 0, p.boarding === 'yes' ? '기숙사 운영' : '통학형', p.boarding === 'yes' ? '기숙사 없음' : '전원 기숙형');
  if (p.lang) add(10, s.langs.includes(p.lang) ? 1 : 0, `${p.lang} 교육`, `${p.lang} 수업 없음`);
  if (p.pref) add(8, s.tags.includes(p.pref) ? 1 : 0, TAG[p.pref], null);
  if (!max) return { v: null, why, miss };
  let v = Math.round(100 * got / max);
  if (!gradeOk) v = Math.round(v * 0.4);
  return { v: Math.max(1, Math.min(99, v)), why, miss };
}

function run() {
  const p = Object.fromEntries(new FormData(form));
  const list = data.map((s) => ({ s, r: score(s, p) })).filter((x) => x.r);
  const none = list.every((x) => x.r.v === null);
  list.sort((a, b) => (b.r.v ?? 0) - (a.r.v ?? 0));
  const good = list.filter((x) => x.r.v >= 80).length;
  summary.textContent = none ? '조건을 하나 이상 고르면 학교별 일치율이 계산됩니다.' : `${list.length}개 학교 비교 · 일치율 80% 이상 ${good}곳`;
  out.innerHTML = list.map(({ s, r }) => `<a class="match${r.v >= 80 ? ' hot' : ''}" href="../schools/${s.slug}/"><span class="pct">${r.v === null ? '–' : `${r.v}<small>%</small>`}</span><span class="mbody"><strong>${esc(s.ko)}</strong><span class="muted">${esc(s.regionName)} · ${esc(s.program)} · 수업료 ${fee(s.fee)}</span><span class="why">${r.why.map((t) => `<em>${esc(t)}</em>`).join('')}${r.miss.map((t) => `<em class="no">${esc(t)}</em>`).join('')}</span></span></a>`).join('');
}
form.addEventListener('input', run);
run();
