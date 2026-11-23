// 학교 간 유사도 (0~99) + 이유. 빌드와 테스트에서 함께 쓴다.
const TRACKS = { 'ib-dp': 'IB DP', ap: 'AP', 'a-level': 'A-Level', korean: '한국 교육과정', 'french-bac': '바칼로레아', cbse: 'CBSE' };
const NAMES = { 'ib-pyp': 'IB PYP', 'ib-myp': 'IB MYP', 'ib-dp': 'IB DP', ap: 'AP', american: '미국식', canadian: '캐나다식', british: '영국식', igcse: 'IGCSE', 'a-level': 'A-Level', cbse: 'CBSE', 'french-bac': '바칼로레아', korean: '한국 교육과정', japanese: '일본 1조교' };
const mid = (f) => (f[0] + f[1]) / 2;

export function similarity(a, b, pa, pb, regionArea) {
  const reasons = [];
  let score = 0;
  const shared = a.curr.filter((c) => b.curr.includes(c));
  const union = new Set([...a.curr, ...b.curr]).size;
  score += 35 * (shared.length / union);
  if (shared.length) reasons.push(`${shared.map((c) => NAMES[c]).join('·')} 공통`);
  const track = Object.keys(TRACKS).find((t) => a.curr.includes(t) && b.curr.includes(t));
  if (track) { score += 15; reasons.push(`고등 ${TRACKS[track]} 동일`); }
  if (a.cat === b.cat) score += 8;
  if (a.region === b.region) { score += 10; reasons.push('같은 지역'); }
  else if (regionArea[a.region] === regionArea[b.region]) { score += 5; reasons.push(`같은 ${regionArea[a.region]} 권역`); }
  const ba = !!(pa.boarding || a.tags.includes('boarding')), bb = !!(pb.boarding || b.tags.includes('boarding'));
  if (ba && bb) { score += 8; reasons.push('기숙사 운영'); } else if (!ba && !bb) score += 3;
  const d = Math.abs(mid(pa.fee) - mid(pb.fee));
  score += 10 * Math.max(0, 1 - d / 150);
  if (d <= 40) reasons.push('학비 수준 비슷');
  const lo = Math.max(pa.g[0], pb.g[0]), hi = Math.min(pa.g[1], pb.g[1]);
  const span = Math.max(pa.g[1], pb.g[1]) - Math.min(pa.g[0], pb.g[0]) + 1;
  score += 7 * Math.max(0, hi - lo + 1) / span;
  const langs = pa.langs.filter((l) => l !== '영어' && pb.langs.includes(l));
  score += Math.min(4, langs.length * 2);
  if (langs.includes('한국어')) reasons.push('한국어 교육');
  const tags = a.tags.filter((t) => t !== 'boarding' && b.tags.includes(t));
  score += Math.min(6, tags.length * 2);
  return { score: Math.min(99, Math.round(score)), reasons, tags };
}

export function topMatches(s, schools, profiles, regionArea, n = 8) {
  return schools.filter((x) => x.slug !== s.slug)
    .map((x) => ({ school: x, ...similarity(s, x, profiles[s.slug], profiles[x.slug], regionArea) }))
    .sort((p, q) => q.score - p.score).slice(0, n);
}
