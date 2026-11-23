// 학년 단계 템플릿: 프로그램 공통 구조(정확한 프레임워크 내용) + 학교별 언어·특징을 끼워 넣는다.
export const st = (name, grades, program, subjects, learn, goal) => ({ name, grades, program, subjects, learn, goal });

export const pyp = (grades, langs = '일본어', extra = '') => st('초등부', grades, 'IB PYP',
  ['영어(언어·문학)', `${langs}(외국어)`, '수학', '과학', '사회', '예술(음악·미술)', '체육·건강(PSPE)', '탐구 단원(Unit of Inquiry)'],
  `6개 초학문적 주제(우리는 누구인가·시간과 공간·자기표현·세계의 작동 방식·사회 조직·지구 공유)로 연 5~6개 탐구 단원을 진행합니다. 교과는 단원 안에 통합해 배우고, 마지막 학년에 스스로 주제를 정해 조사·발표하는 PYP 전시(Exhibition)를 합니다.${extra ? ' ' + extra : ''}`,
  '질문하고 스스로 탐구하는 습관, 영어로 생각을 표현하는 힘, IB 학습자상 10가지(탐구·지식·사고·소통·원칙·열린 마음·배려·도전·균형·성찰) 형성.');

export const myp = (grades, langs = '일본어', extra = '') => st('중등부', grades, 'IB MYP',
  ['언어와 문학(영어 / 일본어)', `언어 습득(${langs})`, '개인과 사회(역사·지리·경제)', '과학(통합 → 생물·화학·물리)', '수학(Standard / Extended)', '예술(미술·음악·연극)', '체육과 건강', '디자인(제품·디지털)'],
  `8개 교과군을 매년 모두 이수하며, 교과마다 A~D 4개 기준(0~8점)으로 평가해 1~7 등급을 받습니다. 개념 중심·교과 통합 수업, 봉사 실천(Service as Action), G10에 자율 연구 결과물과 보고서를 내는 개인 프로젝트(Personal Project)를 수행합니다.${extra ? ' ' + extra : ''}`,
  'DP 진입에 필요한 학업 기초(특히 Extended 수학·과학 분과), 기준표(루브릭)에 맞춰 답하는 서술 능력, 자기주도 연구 경험.');

export const dp = (subjects, extra = '') => st('고등부', 'G11~G12', 'IB DP',
  subjects || ['그룹1 언어와 문학: 영어 A, 일본어 A', '그룹2 언어 습득: 일본어 B, 스페인어 등', '그룹3 개인과 사회: 경제·역사·심리 등', '그룹4 과학: 생물·화학·물리', '그룹5 수학: AA / AI (SL·HL)', '그룹6 예술: 미술·음악 또는 대체 과목', '코어: TOK · 소논문(EE) · CAS'],
  `6과목 중 3~4과목은 HL(고급 240시간), 나머지는 SL(150시간). 과목마다 내부평가(IA: 탐구 보고서·구술 등)와 5월 최종 시험을 치르고, 과목 7점 × 6 + 코어 3점 = 45점 만점입니다.${extra ? ' ' + extra : ''}`,
  'IB 디플로마 취득(24점 이상 + 코어 요건)과 지원 대학·전공 요건에 맞는 HL 과목 조합 완성. 세계 대학 입시에 쓰이는 예상 점수(Predicted Grade) 확보.');

export const usElem = (grades, extra = '') => st('초등부', grades, '미국식 초등',
  ['영어(읽기·쓰기·말하기, Common Core)', '수학(Common Core)', '과학(NGSS 기반)', '사회', '일본어', '음악·미술', '체육', '도서관·ICT'],
  `담임 중심 학급에서 영어 리터러시와 수학 기초를 단계별로 다지고, 과학·사회는 프로젝트 단위로 배웁니다.${extra ? ' ' + extra : ''}`,
  '학년 수준의 영어 읽기·쓰기와 수학 연산·문제해결 능력, 중학 과정으로 이어질 학습 습관.');

export const usMid = (grades, extra = '') => st('중등부', grades, '미국식 중학',
  ['영어(Language Arts)', '수학(Math 6~8 → Pre-Algebra·Algebra I 가속반)', '과학(지구·생명·물리 과학)', '사회(세계사·지리)', '외국어(일본어·스페인어 등)', '예술·음악(밴드·합창)', '체육·보건', '선택(코딩·디자인 등)'],
  `교과별 교사 체제로 바뀌고, 수학은 수준별 가속반이 생겨 고등 진도 선택이 시작됩니다.${extra ? ' ' + extra : ''}`,
  '고교 학점 과정에 들어갈 준비 — 특히 G8까지 Algebra I을 마치면 고등부에서 AP Calculus까지 갈 수 있습니다.');

export const usHigh = (grades, ap, extra = '') => st('고등부', grades, ap ? '미국식 고교 + AP' : '미국식 고교',
  ['영어 4년', '수학(Algebra II·Pre-Calculus·Calculus·Statistics)', '과학(생물·화학·물리·환경)', '사회(세계사·미국사·경제·심리)', '외국어(일본어·스페인어 등)', '예술·체육·보건', ap ? `AP 과목: ${ap}` : '선택 과목'],
  `과목별 학점(credit)과 GPA로 성적을 관리하고, 졸업 요건 학점을 채우면 미국 인증 고교 졸업장을 받습니다.${ap ? ' Honors·AP로 난도를 올리고, AP는 5월 시험(1~5점)으로 대학 학점 인정에 씁니다.' : ''}${extra ? ' ' + extra : ''}`,
  '높은 GPA와 도전적 과목 이수 기록, SAT/ACT(선택), 에세이·활동으로 미국·캐나다·일본 등 대학 진학.');

export const ukPrim = (grades, extra = '') => st('초등부', grades, '영국 EYFS · KS1 · KS2',
  ['영어(음운 파닉스 → 독해·작문)', '수학(National Curriculum)', '과학', '역사·지리(주제 학습)', '일본어·외국어', '미술·디자인·음악', '체육', 'PSHE(인성·건강)'],
  `Nursery·Reception(EYFS)에서 놀이 기반 학습으로 시작해 Year 1~6에서 영국 국가교육과정을 배웁니다.${extra ? ' ' + extra : ''}`,
  '영어 읽기·쓰기 기초와 수학 개념 이해, KS3(중등)로 이어질 학습 태도.');

export const ukKs3 = (grades, langs = '일본어·프랑스어·스페인어 등', extra = '') => st('중등 저학년', grades, '영국 KS3',
  ['영어', '수학', '과학(생물·화학·물리)', '역사', '지리', `외국어(${langs})`, '컴퓨팅', '미술·음악·연극', '디자인·테크놀로지', '체육', 'PSHE'],
  `Year 7~9 동안 넓은 과목을 고르게 배우며 IGCSE 과목 선택을 준비합니다.${extra ? ' ' + extra : ''}`,
  'IGCSE에서 고를 과목의 기초 확보와 강점 과목 발견.');

export const igcse = (grades, extra = '') => st('중등 고학년', grades, 'IGCSE (Year 10~11)',
  ['필수: 영어(1언어/2언어), 수학(Core/Extended), 과학(통합 또는 3과목)', '선택: 외국어, 역사, 지리, 경제·경영, 컴퓨터과학, 미술·음악·연극, 체육 등', '보통 8~10과목 응시'],
  `2년 과정 후 Cambridge·Pearson Edexcel 외부 시험으로 과목별 9~1(또는 A*~G) 등급을 받습니다.${extra ? ' ' + extra : ''}`,
  'Sixth Form(A-Level·IB DP) 진학 요건 충족 — 상위 과목은 보통 7/A 이상 필요.');

export const alevel = (grades, extra = '') => st('Sixth Form', grades, 'A-Level',
  ['3~4과목 선택: 수학·심화수학, 물리·화학·생물, 경제·경영, 역사·지리·심리, 영문학, 외국어, 미술·디자인, 컴퓨터과학 등', 'EPQ(확장 프로젝트, 학교별)', '대학 지원(UCAS) 지도'],
  `2년 동안 소수 과목을 깊게 공부하고 과목별 A*~E 등급을 받습니다.${extra ? ' ' + extra : ''}`,
  '지원 전공 요건에 맞는 과목 조합과 예상 등급으로 영국 등 대학 조건부 합격.');

export const jpSchool = (name, grades, subjects, learn, goal) => st(name, grades, '일본 학교교육법 1조교', subjects, learn, goal);
