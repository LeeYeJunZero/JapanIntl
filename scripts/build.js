import { mkdirSync, writeFileSync, rmSync, readdirSync, copyFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { schools, categories, regions, curricula, tags } from '../src/data.js';
import { guides } from '../src/guides.js';
import { details } from '../src/details.js';
import { curriculumMore } from '../src/curriculum-more.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CFG = JSON.parse(readFileSync(join(ROOT, 'site.config.json'), 'utf8'));
const BRAND = '재팬 인터스쿨';
const SITE_URL = CFG.customDomain ? `https://${CFG.customDomain}/` : 'https://leeyejunzero.github.io/JapanIntl/';
const PHONE = '010-2224-2123';
const V = CFG.verification || {};
const VERIFY = [['google-site-verification', V.google], ['naver-site-verification', V.naver], ['msvalidate.01', V.bing]]
  .filter(([, c]) => c).map(([n, c]) => `<meta name="${n}" content="${String(c).replace(/[^\w-]/g, '')}">`).join('');

const OUT = join(ROOT, 'dist');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const by = (list) => Object.fromEntries(list.map((x) => [x.slug, x]));
const CAT = by(categories), REG = by(regions), CUR = by(curricula), TAG = by(tags);

const pages = [];
function page(path, { title, desc, body, crumbs = [], jsonld }) {
  const r = '../'.repeat(path.split('/').filter(Boolean).length);
  const nav = [['schools/', '학교 전체'], ['category/', '분류'], ['region/', '지역'], ['curriculum/', '커리큘럼'], ['tags/', '특징'], ['guides/', '가이드']];
  const crumb = crumbs.length ? `<nav class="crumbs" aria-label="현재 위치"><a href="${r}">홈</a>${crumbs.map(([h, t]) => h ? ` / <a href="${r}${h}">${esc(t)}</a>` : ` / <span>${esc(t)}</span>`).join('')}</nav>` : '';
  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} | ${BRAND}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${SITE_URL}${path}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="website">
<meta property="og:url" content="${SITE_URL}${path}"><meta property="og:site_name" content="${BRAND}"><meta property="og:locale" content="ko_KR">${path ? '' : VERIFY}
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@600;800&family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${r}assets/site.css">${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>` : ''}</head>
<body><a class="skip" href="#main">본문 바로가기</a>
<header class="top"><div class="wrap top-in"><a class="logo" href="${r}"><span class="seal">学</span><span>${BRAND}<small>일본 국제학교 전문 안내</small></span></a>
<nav class="nav" aria-label="주 메뉴">${nav.map(([h, t]) => `<a href="${r}${h}"${path.startsWith(h) ? ' aria-current="page"' : ''}>${t}</a>`).join('')}<a class="nav-cta" href="${r}contact/">상담</a></nav></div></header>
<main id="main" class="wrap">${crumb}${body}</main>
<footer class="foot"><div class="wrap"><p><strong>${BRAND}</strong> · 일본 국제학교 ${schools.length}곳 · 커리큘럼 ${curricula.length}종 안내</p>
<p class="muted">학교 공식 자료·학교 프로필·언론 보도·교육 정보 사이트를 종합해 2026년 11월 기준으로 정리했습니다. 학비와 모집 요강은 매년 갱신됩니다.</p>
<p><a href="${r}contact/">입학·IB 학습 상담 ${PHONE}</a></p></div></footer>
${body.includes('data-filter') ? `<script src="${r}assets/filter.js" defer></script>` : ''}</body></html>`;
  pages.push(path);
  const file = join(OUT, path, 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

const chip = (r, s) => s.curr.map((c) => `<a class="chip" href="${r}curriculum/${c}/">${esc(CUR[c].name)}</a>`).join('');
const card = (r, s) => `<article class="card"><a class="card-link" href="${r}schools/${s.slug}/"><span class="abbr">${esc(s.abbr)}</span><h3>${esc(s.ko)}</h3><p class="en">${esc(s.en)}</p></a>
<p class="loc">${esc(REG[s.region].name)} · ${esc(s.area)}</p><p class="note">${esc(s.note)}</p><div class="chips">${chip(r, s)}</div></article>`;
const grid = (r, list) => list.length ? `<div class="grid">${list.map((s) => card(r, s)).join('')}</div>` : '<p class="muted">해당 학교가 없습니다.</p>';
const head = (kicker, title, lead) => `<header class="hero-sm"><p class="kicker">${esc(kicker)}</p><h1>${esc(title)}</h1>${lead ? `<p class="lead">${esc(lead)}</p>` : ''}</header>`;
const count = (n) => `<span class="count">${n}</span>`;
const indexList = (r, base, list, n) => `<ol class="index">${list.map((x) => `<li><a href="${r}${base}/${x.slug}/"><span>${esc(x.name)}</span>${count(n(x))}</a></li>`).join('')}</ol>`;
const cta = (r) => `<aside class="cta"><div><h2>우리 아이에게 맞는 학교, 함께 고릅니다</h2><p>입학 평가 대비 영어·수학, IB MYP·DP 과목 학습까지 상담해 드립니다.</p></div><a class="btn" href="${r}contact/">무료 상담 신청</a></aside>`;
const R = (path) => '../'.repeat(path.split('/').filter(Boolean).length);

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
// fs.cpSync crashes Node 24 on this non-ASCII Windows path, so copy by hand (public/ is flat per folder).
for (const e of readdirSync(join(ROOT, 'public'), { recursive: true, withFileTypes: true })) if (e.isFile()) { const to = join(OUT, e.parentPath.slice(join(ROOT, 'public').length), e.name); mkdirSync(dirname(to), { recursive: true }); copyFileSync(join(e.parentPath, e.name), to); }

// Home
{
  const r = '';
  const featured = ['asij', 'kist', 'yis', 'bst', 'uwc-isak', 'harrow-appi'].map((s) => schools.find((x) => x.slug === s));
  page('', {
    title: '일본 국제학교 전문 안내 — 학교·커리큘럼·지역별 비교', desc: `일본 국제학교 ${schools.length}곳을 IB·미국식·영국식·한국계 등 커리큘럼과 지역별로 분류해 비교합니다.`,
    body: `<section class="hero"><p class="kicker">Japan International Schools · ${schools.length} Schools</p>
<h1>일본 국제학교,<br><em>커리큘럼</em>으로 고르세요.</h1>
<p class="lead">IB · AP · A-Level · 한국계까지. 도쿄부터 오키나와까지 ${schools.length}개 학교를 6개 유형, ${regions.length}개 지역, ${curricula.length}개 커리큘럼으로 정리했습니다.</p>
<div class="hero-act"><a class="btn" href="#finder">학교 찾기</a><a class="btn ghost" href="guides/how-to-choose/">고르는 법 7가지</a></div></section>
<section><h2 class="sec"><span>01</span>유형별 분류</h2><div class="cats">${categories.map((c) => `<a class="cat" href="category/${c.slug}/"><span class="no">0${c.no}</span><strong>${esc(c.name)}</strong><span class="muted">${esc(c.lead.slice(0, 54))}…</span>${count(schools.filter((s) => s.cat === c.slug).length)}</a>`).join('')}</div></section>
<section><h2 class="sec"><span>02</span>대표 학교</h2>${grid(r, featured)}</section>
<section class="two"><div><h2 class="sec"><span>03</span>지역별</h2>${indexList(r, 'region', regions, (g) => schools.filter((s) => s.region === g.slug).length)}</div>
<div><h2 class="sec"><span>04</span>커리큘럼별</h2>${indexList(r, 'curriculum', curricula, (c) => schools.filter((s) => s.curr.includes(c.slug)).length)}</div></section>
<section id="finder"><h2 class="sec"><span>05</span>학교 찾기</h2>${finder(r)}</section>
<section><h2 class="sec"><span>06</span>입학 가이드</h2><div class="guides">${guides.map((g) => `<a class="guide" href="guides/${g.slug}/"><strong>${esc(g.title)}</strong><span class="muted">${esc(g.lead)}</span></a>`).join('')}</div></section>
${cta(r)}`,
  });
}

function finder(r) {
  const opt = (list) => list.map((x) => `<option value="${x.slug}">${esc(x.name)}</option>`).join('');
  return `<div class="finder" data-filter><div class="filters">
<label>검색<input type="search" name="q" placeholder="학교명·영문·지역" autocomplete="off"></label>
<label>유형<select name="cat"><option value="">전체</option>${opt(categories)}</select></label>
<label>지역<select name="region"><option value="">전체</option>${opt(regions)}</select></label>
<label>커리큘럼<select name="curr"><option value="">전체</option>${opt(curricula)}</select></label>
<label>특징<select name="tag"><option value="">전체</option>${opt(tags)}</select></label></div>
<p class="muted" aria-live="polite"><span data-count>${schools.length}</span>개 학교</p>
<div class="table-wrap"><table><thead><tr><th>학교</th><th>지역</th><th>과정</th><th>특징</th></tr></thead><tbody>
${schools.map((s) => `<tr data-cat="${s.cat}" data-region="${s.region}" data-curr="${s.curr.join(' ')}" data-tag="${s.tags.join(' ')}" data-text="${esc(`${s.ko} ${s.en} ${s.abbr} ${REG[s.region].name} ${s.area}`.toLowerCase())}">
<td><a href="${r}schools/${s.slug}/"><strong>${esc(s.ko)}</strong></a><br><span class="en">${esc(s.en)}</span></td><td>${esc(REG[s.region].name)}<br><span class="muted">${esc(s.area)}</span></td><td>${esc(s.program)}</td><td>${esc(s.note)}</td></tr>`).join('')}
</tbody></table></div></div>`;
}

// All schools
page('schools/', { title: `일본 국제학교 전체 목록 (${schools.length}곳)`, desc: '일본 국제학교 전체 목록을 유형·지역·커리큘럼·특징으로 필터링해 찾아보세요.', crumbs: [[null, '학교 전체']],
  body: head('All Schools', `일본 국제학교 전체 ${schools.length}곳`, '검색과 필터로 조건에 맞는 학교를 바로 찾을 수 있습니다.') + finder(R('schools/')) });

const moreList = (k) => (curriculumMore[k] || []).map(([h, p]) => `<div><dt>${esc(h)}</dt><dd>${esc(p)}</dd></div>`).join('');
const row = (k, v) => v ? `<tr><th scope="row">${esc(k)}</th><td>${esc(v)}</td></tr>` : '';
function schoolDetail(s, r, q) {
  const d = details[s.slug] || {};
  const boarding = s.tags.includes('boarding');
  const ul = (list) => `<ul class="check">${list.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
  return `<section><h2 class="sec">학교 기본 정보</h2><div class="table-wrap"><table class="info"><tbody>
${row('설립', d.founded)}${row('운영 학년', d.grades)}${row('규모', d.size)}${row('운영 과정', s.program)}${row('연간 학비', d.tuition)}${row('시험 성적', d.results)}
${d.site ? `<tr><th scope="row">공식 사이트</th><td><a href="${esc(d.site)}" rel="noopener" target="_blank">${esc(d.site.replace(/^https?:\/\//, '').replace(/\/$/, ''))} ↗</a></td></tr>` : ''}
</tbody></table></div></section>
${d.levels ? `<section><h2 class="sec">학년별 커리큘럼</h2><ol class="levels">${d.levels.map(([h, p]) => `<li><strong>${esc(h)}</strong><p>${esc(p)}</p></li>`).join('')}</ol></section>` : ''}
<section><h2 class="sec">운영 커리큘럼 상세</h2><div class="curr-list">${s.curr.map((k, i) => { const u = CUR[k]; return `<details class="curr"${i ? '' : ' open'}><summary><h3><a href="${r}curriculum/${k}/">${esc(u.name)}</a> <span class="muted">${esc(u.full)} · ${esc(u.age)}</span></h3></summary>${u.about.map((p) => `<p>${esc(p)}</p>`).join('')}<dl class="more">${moreList(k)}</dl></details>`; }).join('')}</div></section>
<section><h2 class="sec">입학 · 지원 상세</h2><div class="apply">
<div><h3>모집 · 입학 평가</h3>${ul(d.admission || ['모집 학년·일정은 학교 입학처에 확인하세요.'])}</div>
<div><h3>영어 지원 (EAL)</h3><p>${esc(d.eal || (s.tags.includes('eal') ? 'EAL 지원 체계가 강점인 학교입니다.' : 'EAL 운영 여부와 수용 학년은 학교에 확인하세요. 고학년일수록 영어 요구 수준이 높습니다.'))}</p></div>
<div><h3>${boarding ? '기숙사 · 통학' : '통학 · 스쿨버스'}</h3><p>${esc(d.bus || (boarding ? '기숙사 운영 학교입니다. 정원·비용·주말/방학 운영을 확인하세요.' : '스쿨버스 노선과 통학 시간을 확인하세요.'))}</p></div>
<div><h3>학비</h3><p>${esc(d.tuition || '학교 입학처에 확인하세요.')}</p><p class="muted">수업료 외 입학금·시설비·건축기금·버스·급식비가 별도인 경우가 많습니다.</p></div>
</div></section>
<section><h2 class="sec">${esc(d.pathways?.label || '진학 경로')}</h2>${d.pathways ? `<div class="chips path">${d.pathways.list.map((x) => `<span class="chip">${esc(x)}</span>`).join('')}</div><p class="muted">${esc(d.pathways.note || '')}</p>` : '<p class="muted">진학 실적은 학교에 요청하세요.</p>'}</section>
<section><h2 class="sec">지원 전 최종 체크</h2>${ul([
    '올해 모집 학년과 지원 마감일, 대기자(Waitlist) 현황',
    `입학 평가 과목과 인터뷰 언어${d.admission ? ' (위 입학 정보와 최신 요강 대조)' : ''}`,
    s.curr.includes('ib-dp') ? 'IB DP 개설 과목(HL/SL)과 최근 평균 점수' : s.curr.includes('ap') ? '개설 AP 과목 목록과 수강 조건' : s.curr.includes('a-level') ? 'A-Level 개설 과목과 과목 조합 제한' : '상급 학교(다음 단계) 진학 계획',
    '연간 총비용 (수업료 + 일회성 비용 + 버스·급식·기숙사)',
  ])}
<p class="btns">${d.site ? `<a class="btn" href="${esc(d.site)}" rel="noopener" target="_blank">공식 사이트 ↗</a>` : ''}<a class="btn ghost" href="https://www.google.com/search?q=${q}" rel="noopener" target="_blank">입학 정보 검색 ↗</a></p>
${d.sources ? `<p class="src">출처: ${d.sources.map((u, i) => `<a href="${esc(u)}" rel="noopener" target="_blank">[${i + 1}]</a>`).join(' ')} · 2026년 11월 조사 기준, 학비·요강은 매년 바뀝니다.</p>` : ''}</section>`;
}

// School detail pages
for (const s of schools) {
  const path = `schools/${s.slug}/`, r = R(path), c = CAT[s.cat], g = REG[s.region];
  const others = (f) => schools.filter((x) => x.slug !== s.slug && f(x));
  const sameRegion = others((x) => x.region === s.region);
  const sameCat = others((x) => x.cat === s.cat && x.region !== s.region).slice(0, 6);
  const sameCurr = others((x) => x.cat !== s.cat && x.curr.some((k) => s.curr.includes(k))).slice(0, 6);
  const q = encodeURIComponent(`${s.en} official site admissions`);
  page(path, {
    title: `${s.ko} (${s.en}) — ${s.program}`, desc: `${s.ko}(${s.abbr}) · ${g.name} ${s.area} · ${s.program}. ${s.note}.`,
    crumbs: [['schools/', '학교 전체'], [`category/${c.slug}/`, c.short], [null, s.ko]],
    jsonld: { '@context': 'https://schema.org', '@type': 'School', name: s.en, alternateName: s.ko, address: { '@type': 'PostalAddress', addressRegion: g.name, addressLocality: s.area, addressCountry: 'JP' } },
    body: `<header class="school-head"><span class="abbr big">${esc(s.abbr)}</span><div><p class="kicker">${esc(c.name)}</p><h1>${esc(s.ko)}</h1><p class="en">${esc(s.en)}</p></div></header>
<dl class="facts"><div><dt>소재지</dt><dd><a href="${r}region/${g.slug}/">${esc(g.name)}</a> · ${esc(s.area)} <span class="muted">(${esc(g.area)})</span></dd></div>
<div><dt>운영 과정</dt><dd>${esc(s.program)}</dd></div><div><dt>유형</dt><dd><a href="${r}category/${c.slug}/">${esc(c.name)}</a></dd></div>
<div><dt>핵심 특징</dt><dd>${esc(s.note)}</dd></div>${s.tags.length ? `<div><dt>특징 태그</dt><dd class="chips">${s.tags.map((t) => `<a class="chip tag" href="${r}tags/${t}/">${esc(TAG[t].name)}</a>`).join('')}</dd></div>` : ''}</dl>
${schoolDetail(s, r, q)}
${sameRegion.length ? `<section><h2 class="sec">${esc(g.name)}의 다른 국제학교</h2>${grid(r, sameRegion)}</section>` : ''}
${sameCat.length ? `<section><h2 class="sec">같은 유형 · ${esc(c.short)}</h2>${grid(r, sameCat)}</section>` : ''}
${sameCurr.length ? `<section><h2 class="sec">비슷한 커리큘럼을 운영하는 학교</h2>${grid(r, sameCurr)}</section>` : ''}
${cta(r)}`,
  });
}

// Categories
page('category/', { title: '국제학교 유형별 분류', desc: '일본 국제학교를 6개 유형으로 나눠 비교합니다.', crumbs: [[null, '분류']],
  body: head('Categories', '유형별 분류', '커리큘럼 운영 방식에 따라 6개 유형으로 나눴습니다.') + categories.map((c) => `<section><h2 class="sec"><span>0${c.no}</span><a href="${c.slug}/">${esc(c.name)}</a></h2><p>${esc(c.lead)}</p>${grid('../', schools.filter((s) => s.cat === c.slug))}</section>`).join('') });
for (const c of categories) {
  const path = `category/${c.slug}/`, r = R(path), list = schools.filter((s) => s.cat === c.slug);
  const byRegion = regions.filter((g) => list.some((s) => s.region === g.slug));
  page(path, { title: `${c.name} 국제학교 ${list.length}곳`, desc: c.lead, crumbs: [['category/', '분류'], [null, c.short]],
    body: head(`Category 0${c.no}`, c.name, c.lead) + `<div class="table-wrap"><table><thead><tr><th>학교</th><th>소재지</th><th>과정</th><th>핵심 특징</th></tr></thead><tbody>${list.map((s) => `<tr><td><a href="${r}schools/${s.slug}/"><strong>${esc(s.ko)}</strong></a><br><span class="en">${esc(s.en)}</span></td><td>${esc(REG[s.region].name)} (${esc(s.area)})</td><td>${esc(s.program)}</td><td>${esc(s.note)}</td></tr>`).join('')}</tbody></table></div>`
      + byRegion.map((g) => `<section><h2 class="sec"><a href="${r}region/${g.slug}/">${esc(g.name)}</a></h2>${grid(r, list.filter((s) => s.region === g.slug))}</section>`).join('') + cta(r) });
}

// Regions
page('region/', { title: '지역별 일본 국제학교', desc: '도쿄·가나가와·오사카·교토·고베 등 지역별 국제학교.', crumbs: [[null, '지역']],
  body: head('Regions', '지역별 국제학교', '생활권을 먼저 정하고 학교를 비교하세요.') + [...new Set(regions.map((g) => g.area))].map((a) => `<section><h2 class="sec">${esc(a)}</h2>${indexList('../', 'region', regions.filter((g) => g.area === a), (g) => schools.filter((s) => s.region === g.slug).length)}</section>`).join('') });
for (const g of regions) {
  const path = `region/${g.slug}/`, r = R(path), list = schools.filter((s) => s.region === g.slug);
  const currs = curricula.filter((u) => list.some((s) => s.curr.includes(u.slug)));
  page(path, { title: `${g.name} 국제학교 ${list.length}곳 — 커리큘럼별 비교`, desc: `${g.name}(${g.area})의 국제학교 ${list.length}곳: ${list.map((s) => s.ko).join(', ')}.`, crumbs: [['region/', '지역'], [null, g.name]],
    body: head(`${g.area} · Region`, `${g.name}의 국제학교`, `${g.name}에서 운영 중인 국제학교 ${list.length}곳입니다. 운영 커리큘럼: ${currs.map((u) => u.name).join(', ')}.`)
      + `<p class="chips">${currs.map((u) => `<a class="chip" href="${r}curriculum/${u.slug}/">${esc(u.name)} ${list.filter((s) => s.curr.includes(u.slug)).length}</a>`).join('')}</p>` + grid(r, list)
      + (list.length > 1 ? `<section><h2 class="sec">${esc(g.name)} 국제학교 비교표</h2><div class="table-wrap"><table><thead><tr><th>학교</th><th>세부 위치</th><th>유형</th><th>과정</th></tr></thead><tbody>${list.map((s) => `<tr><td><a href="${r}schools/${s.slug}/">${esc(s.ko)}</a></td><td>${esc(s.area)}</td><td><a href="${r}category/${s.cat}/">${esc(CAT[s.cat].short)}</a></td><td>${esc(s.program)}</td></tr>`).join('')}</tbody></table></div></section>` : '') + cta(r) });
}

// Curricula
page('curriculum/', { title: '국제학교 커리큘럼 총정리 — IB·AP·A-Level·IGCSE', desc: '일본 국제학교에서 운영하는 13가지 커리큘럼을 설명합니다.', crumbs: [[null, '커리큘럼']],
  body: head('Curricula', '커리큘럼 총정리', '과정 이름은 비슷해도 공부 방식과 진학 경로가 다릅니다.') + `<div class="guides">${curricula.map((u) => `<a class="guide" href="${u.slug}/"><strong>${esc(u.name)} ${count(schools.filter((s) => s.curr.includes(u.slug)).length)}</strong><span class="muted">${esc(u.full)} · ${esc(u.age)}</span></a>`).join('')}</div>` + `<p><a class="btn ghost" href="../guides/ib-vs-ap-vs-alevel/">IB vs AP vs A-Level 비교 →</a></p>` });
for (const u of curricula) {
  const path = `curriculum/${u.slug}/`, r = R(path), list = schools.filter((s) => s.curr.includes(u.slug));
  page(path, { title: `${u.name}란? 일본에서 ${u.name} 운영 국제학교 ${list.length}곳`, desc: `${u.name}(${u.full}) 설명과 일본 내 운영 학교 ${list.length}곳.`, crumbs: [['curriculum/', '커리큘럼'], [null, u.name]],
    body: head(`${u.full} · ${u.age}`, u.name, null) + `<div class="prose">${u.about.map((p) => `<p>${esc(p)}</p>`).join('')}<h2 class="sec">세부 구성</h2><dl class="more">${moreList(u.slug)}</dl><h2 class="sec">학습 포인트</h2><ul class="check">${u.tips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>`
      + `<section><h2 class="sec">${esc(u.name)} 운영 학교 ${list.length}곳</h2>${grid(r, list)}</section>` + cta(r) });
}

// Tags
page('tags/', { title: '특징별 국제학교 — 기숙사·여학교·이중언어·인증', desc: '기숙사, 여학교, 이중언어, WASC 인증 등 특징별로 국제학교를 찾아보세요.', crumbs: [[null, '특징']],
  body: head('Features', '특징별로 찾기', null) + indexList('../', 'tags', tags, (t) => schools.filter((s) => s.tags.includes(t.slug)).length) });
for (const t of tags) {
  const path = `tags/${t.slug}/`, r = R(path), list = schools.filter((s) => s.tags.includes(t.slug));
  page(path, { title: `${t.name} 일본 국제학교 ${list.length}곳`, desc: t.lead, crumbs: [['tags/', '특징'], [null, t.name]],
    body: head('Feature', `${t.name} 국제학교`, t.lead) + grid(r, list) + (t.slug === 'boarding' ? `<p><a class="btn ghost" href="${r}guides/boarding/">보딩스쿨 체크리스트 →</a></p>` : '') + (t.slug === 'eal' ? `<p><a class="btn ghost" href="${r}guides/eal/">EAL 제도 이해하기 →</a></p>` : '') + cta(r) });
}

// Guides
page('guides/', { title: '일본 국제학교 입학 가이드', desc: '국제학교 선택, 입학 절차, 커리큘럼 비교, 한국 학생 체크리스트.', crumbs: [[null, '가이드']],
  body: head('Guides', '입학 가이드', null) + `<div class="guides">${guides.map((g) => `<a class="guide" href="${g.slug}/"><strong>${esc(g.title)}</strong><span class="muted">${esc(g.lead)}</span></a>`).join('')}</div>` });
for (const g of guides) {
  const path = `guides/${g.slug}/`, r = R(path);
  const table = g.table ? `<div class="table-wrap"><table><thead><tr>${g.table[0].map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${g.table.slice(1).map((row) => `<tr>${row.map((v, i) => i ? `<td>${esc(v)}</td>` : `<th scope="row">${esc(v)}</th>`).join('')}</tr>`).join('')}</tbody></table></div>` : '';
  page(path, { title: g.title, desc: g.lead, crumbs: [['guides/', '가이드'], [null, g.title]],
    body: head('Guide', g.title, g.lead) + table + `<div class="prose">${g.sections.map(([h, p]) => `<h2 class="sec">${esc(h)}</h2><p>${esc(p)}</p>`).join('')}</div>`
      + `<section><h2 class="sec">다른 가이드</h2><div class="guides">${guides.filter((x) => x !== g).map((x) => `<a class="guide" href="${r}guides/${x.slug}/"><strong>${esc(x.title)}</strong></a>`).join('')}</div></section>` + cta(r) });
}

// Contact
page('contact/', { title: '입학·학습 상담', desc: '일본 국제학교 선택, 입학 평가 대비, IB·AP 학습 상담.', crumbs: [[null, '상담']],
  body: head('Contact', '입학·학습 상담', '학교 선택부터 입학 평가 대비, 재학 중 IB·AP 과목 학습까지 상담해 드립니다.')
    + `<div class="contact"><a class="btn" href="tel:${PHONE.replace(/-/g, '')}">전화 ${PHONE}</a><a class="btn ghost" href="sms:${PHONE.replace(/-/g, '')}">문자 보내기</a></div>
<ul class="check"><li>희망 학교·학년과 현재 영어 수준을 알려 주시면 상담이 빨라집니다.</li><li>입학 평가(영어 에세이·수학) 대비</li><li>IB MYP·DP, AP, IGCSE·A-Level 과목 학습</li><li>귀국·재외국민 특별전형 고려한 학교 선택</li></ul>` });

// 404 + sitemap (404 uses absolute base since GitHub Pages serves it at any depth)
writeFileSync(join(OUT, '404.html'), `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>페이지 없음 | ${BRAND}</title><link rel="stylesheet" href="${SITE_URL}assets/site.css"></head><body><main class="wrap">${head('404', '페이지를 찾을 수 없습니다', null)}<p><a class="btn" href="${SITE_URL}">홈으로</a> <a class="btn ghost" href="${SITE_URL}schools/">학교 전체 보기</a></p></main></body></html>`);
const today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map((p) => `<url><loc>${SITE_URL}${p}</loc><lastmod>${today}</lastmod></url>`).join('')}</urlset>\n`);
if (CFG.customDomain) writeFileSync(join(OUT, 'CNAME'), `${CFG.customDomain}\n`);
// HTML-file ownership checks: { "google1234.html": "file body" }
for (const [name, text] of Object.entries(CFG.verificationFiles || {})) if (/^[\w.-]+\.html$/.test(name)) writeFileSync(join(OUT, name), text);
writeFileSync(join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}sitemap.xml\n`);
console.log(`built ${pages.length} pages`);
