'use strict';

const sceneLayouts = {
  desktop: {
    w: 1160, h: 675, mobile: false,
    question: [114, 188], questionSize: [168, 154], student: [275, 205],
    prefix: [[393, 205], [502, 205]], wrong: [[655, 205], [803, 205]],
    corrected: [[685, 293], [831, 293], [987, 293]], boundary: [550, 205], hint: [510, 320],
    dataset: [994, 473], train: [777, 473], evaluate: [610, 473], base: [777, 399], feedback: [636, 583],
    book: { x: 588, y: 34, w: 536, cellY: 59, cellH: 99, gap: 7 },
    map: { x: 30, y: 432, w: 512, h: 223, top: 43, step: 36, rowH: 28, chipX: 141, chipW: 105, gap: 9 },
    inputPath: 'M198 205H241', prefixPath: 'M309 205H502', wrongPath: 'M524 205H803',
    correctPath: 'M524 205C576 205 576 293 639 293H987',
    diagnosisPath: 'M655 177V159', rollbackPath: 'M803 230V259H550V227', hintPath: 'M510 299C510 272 550 264 550 229',
    targetPath: 'M1014 293C1123 293 1133 473 1094 473', dataPath: 'M894 473H813', basePath: 'M777 418V437',
    modelPath: 'M741 473H645', feedbackPath: 'M636 555V534Q636 520 610 520V507',
    selectionPath: 'M576 473H560Q552 473 552 487V519H535', returnPath: 'M164 432V379H22V188H41',
    freshPath: 'M309 205H820',
    localTitle: [30, 28], outerTitle: [30, 413], prefixLabel: [447, 169], wrongLabel: [940, 243],
    suffixLabel: [760, 338], modelLabel: [692, 453], datasetLabel: [994, 546], mapSignal: [566, 548],
  },
  mobile: {
    w: 600, h: 1184, mobile: true,
    question: [113, 143], questionSize: [166, 196], student: [270, 125],
    prefix: [[390, 125], [503, 125]], wrong: [[503, 224], [503, 318]],
    corrected: [[349, 231], [349, 318]], boundary: [503, 172], hint: [300, 596],
    dataset: [486, 730], train: [300, 730], evaluate: [114, 730], base: [300, 826], feedback: [115, 826],
    book: { x: 30, y: 409, w: 540, cellY: 432, cellH: 123, gap: 7 },
    map: { x: 30, y: 900, w: 540, h: 268, top: 49, step: 45, rowH: 36, chipX: 183, chipW: 109, gap: 9 },
    inputPath: 'M196 125H235', prefixPath: 'M305 125H503', wrongPath: 'M503 147V318',
    correctPath: 'M503 147C503 180 349 173 349 209V318',
    diagnosisPath: 'M529 224H565V388H95V430', rollbackPath: 'M529 318H548V172H529', hintPath: 'M460 596H594V172H529',
    targetPath: 'M374 318C387 318 390 345 405 345H582V647Q582 655 574 655H494Q486 655 486 663V675', dataPath: 'M402 730H336', basePath: 'M300 804V766',
    modelPath: 'M264 730H149', feedbackPath: 'M115 797V765',
    selectionPath: 'M80 730H28V928H41', returnPath: 'M65 900H17V143H29',
    freshPath: 'M305 125H503V270',
    localTitle: [30, 28], outerTitle: [30, 672], prefixLabel: [447, 86], wrongLabel: [492, 369],
    suffixLabel: [158, 339], modelLabel: [209, 711], datasetLabel: [486, 809], mapSignal: [300, 880],
  },
};

const errorScenarios = [
  {
    key: 'visual', code: 'V1', family: 0, subtype: 0, name: 'Visual misreading',
    summary: 'A missed finding calls for another look at the relevant image region.',
    cue: 'Reinspect the region', icon: 'ct', tags: [0, 0, 0, 1], next: [1, 1, 1, 2],
  },
  {
    key: 'reasoning', code: 'R2', family: 1, subtype: 1, name: 'Reasoning error',
    summary: 'Reconcile supporting and opposing observations before continuing the inference.',
    cue: 'Reconcile both observations', icon: 'ecg', tags: [2, 2, 0, 1], next: [0, 0, 2, 2],
  },
  {
    key: 'differential', code: 'D2', family: 2, subtype: 1, name: 'Differential diagnosis error',
    summary: 'Compare the features that distinguish the candidate explanations.',
    cue: 'Compare key features', icon: 'histology', tags: [1, 1, 1, 2], next: [2, 2, 0, 1],
  },
  {
    key: 'knowledge', code: 'K2', family: 3, subtype: 1, name: 'Knowledge gap',
    summary: 'A missing diagnostic criterion calls for a cue to the relevant rule category.',
    cue: 'Recall the rule category', icon: 'ct', tags: [0, 0, 2, 0], next: [1, 1, 1, 1],
  },
];
const modalityNames = ['CT', 'Histology', 'ECG'];
const anatomyNames = ['Thorax', 'Abdomen', 'Heart'];
const modalityIcons = ['ct', 'histology', 'ecg'];

function diagnosisRoute(c, caseIndex) {
  const cellWidth = (c.book.w - c.book.gap * 3) / 4;
  const center = c.book.x + cellWidth / 2 + caseIndex * (cellWidth + c.book.gap);
  return c.mobile ? `M529 224H565V388H${center}V430` : `M655 177V173H${center}V159`;
}

function buildScene(c) {
  const m = c.mobile;
  const xy = a => a.join(' ');
  const text = (x, y, value, cls = '', anchor = 'middle', id = '') => `<text${id ? ` id="${id}"` : ''} x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}">${value}</text>`;
  const check = '<path d="M-7 0l5 5 10-11" class="check"/>';
  const icon = (name, x, y, size) => `<use href="#medical-${name}" x="${x - size / 2}" y="${y - size / 2}" width="${size}" height="${size}"/>`;
  const line = (id, path, cls = '', arrow = '') => `<path id="${id}" d="${path}" class="route ${cls}" fill="none"${arrow ? ` data-arrow="${arrow}" marker-end="url(#${arrow})"` : ''}/>`;
  const node = (id, pos, cls, symbol = check) => `<g id="${id}" transform="translate(${xy(pos)})"><circle r="22" class="node ${cls}"/>${symbol}</g>`;
  const [qx, qy] = c.question, [qw, qh] = c.questionSize;
  const [sx, sy] = c.student, [dx, dy] = c.dataset, [tx, ty] = c.train, [ex, ey] = c.evaluate;
  const book = c.book, cellW = (book.w - 3 * book.gap) / 4;
  const families = [
    { title: ['Visual', 'misreading'], operation: ['Reinspect'] },
    { title: ['Reasoning', 'error'], operation: ['Reconcile'] },
    { title: ['Differential', 'diagnosis'], operation: ['Compare features'] },
    { title: ['Knowledge', 'gap'], operation: ['Cue a rule'] },
  ];
  const tags = [
    ['Modality', ['CT', 'Histology', 'ECG']],
    ['Anatomy', ['Thorax', 'Abdomen', 'Heart']],
    ['Disease', ['Vascular', 'Neoplasm', 'Infection']],
    ['Difficulty', ['L2', 'L3', 'L4']],
  ];
  const map = c.map;
  const mapRows = tags.map(([label, choices], row) => {
    const y = map.y + map.top + row * map.step;
    const xs = choices.map((_, i) => map.x + map.chipX + i * (map.chipW + map.gap));
    return `<g class="tag-row">${text(map.x + 18, y + map.rowH / 2 + (m ? 7 : 5), label, 'axis-label', 'start')}
      ${xs.map(x => `<rect x="${x}" y="${y}" width="${map.chipW}" height="${map.rowH}" rx="5" class="tag-chip"/>`).join('')}
      <rect id="tag-focus-${row}" x="${xs[row === 3 ? 1 : 0]}" y="${y}" width="${map.chipW}" height="${map.rowH}" rx="5" class="tag-focus"/>
      ${choices.map((label, i) => text(xs[i] + map.chipW / 2, y + map.rowH / 2 + (m ? 7 : 5), label, 'tag-text')).join('')}</g>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${c.w} ${c.h}" class="navigation-scene" role="group" aria-labelledby="scene-title scene-description" data-mobile="${m}">
<title id="scene-title">Medical Knowledge Navigation in MedEvo</title>
<desc id="scene-description">Four independent schematic cases illustrate visual misreading, conflicting evidence, missing differential comparison, and a missing diagnostic criterion. Case numbers do not denote training rounds or measured clinical results. A training question supplies observable clinical context. Each fresh failed rollout is diagnosed against four fixed error families, with five subtypes per family. A gold-blind auditor supplies an answer-free recovery cue. The same student keeps supported reasoning and regenerates only the suffix. Screened targets update medical supervision, with at most one active target per question. Each SFT round starts from the same M zero. A separate fixed feedback set supplies assessment signals, never training samples. Feedback shifts selection priorities across the fixed modality, anatomy, disease and difficulty axes. Answer-derived disease labels stay in planning metadata and never reach the auditor or hint. The next training question is diagnosed afresh. CT, histology and ECG contexts and highlighted priorities are illustrative. Select any error-family card to play its complete audit, repair, learning and reselection cycle.</desc>
<style>
.navigation-scene{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:#fff;color:#23475d}
.navigation-scene text{font-size:${m ? 23 : 16}px;fill:#294b62}
.navigation-scene .small{font-size:${m ? 21 : 14}px;fill:#536b7a}
.navigation-scene .section-label{font-size:${m ? 21 : 14}px;letter-spacing:1.3px;font-weight:650;fill:#40687e}
.navigation-scene .title{font-size:${m ? 24 : 17}px;font-weight:650;fill:#294b62}
.navigation-scene .white{fill:#fff;font-size:${m ? 25 : 23}px;font-weight:600}
.navigation-scene .good-label{fill:#725297;font-size:${m ? 22 : 15}px}
.navigation-scene .repair-label{fill:#227487;font-size:${m ? 22 : 15}px}
.navigation-scene .bad-label{fill:#925851;font-size:${m ? 22 : 15}px}
.navigation-scene .base{font-size:${m ? 22 : 15}px;fill:#294b62}
.navigation-scene .book-title{font-size:${m ? 23 : 16}px;font-weight:650}
.navigation-scene .family-name{font-size:${m ? 22 : 15}px;font-weight:600}
.navigation-scene .family-operation{font-size:${m ? 20 : 14}px;fill:#5a6d7c}
.navigation-scene .axis-label{font-size:${m ? 22 : 15}px;font-weight:600}
.navigation-scene .tag-text{font-size:${m ? 21 : 14}px;fill:#324e62}
.navigation-scene .route{stroke:#c5d5e1;stroke-width:${m ? 2.5 : 2.3};stroke-linecap:round;stroke-linejoin:round}
.navigation-scene .draw-blue{stroke:#287db1;stroke-width:2.7}.navigation-scene .draw-violet{stroke:#8059a5;stroke-width:2.7}
.navigation-scene .draw-red{stroke:#bd7b72;stroke-width:2.5}.navigation-scene .rollback{stroke:#b58176;stroke-dasharray:5 6}
.navigation-scene .node{stroke:#becfdd;stroke-width:1.7;fill:#fff}.navigation-scene .node.good{stroke:#aa91c1;fill:#f5f0fa}
.navigation-scene .node.bad{stroke:#cb9c94;fill:#fcf1ee}.navigation-scene .node.repaired{stroke:#63a3b1;fill:#edf8f8}
.navigation-scene .check{fill:none;stroke:#267c8c;stroke-width:2.3;stroke-linecap:round;stroke-linejoin:round}
.navigation-scene .node.good+.check{stroke:#8059a5}.navigation-scene .cross{stroke:#b36e65;stroke-width:2;stroke-linecap:round}
.navigation-scene .local-region{fill:#f6faff}.navigation-scene .supervision-region{fill:#faf7fd}
.navigation-scene .outer-label{fill:#716086}.navigation-scene .panel{fill:#fff;stroke:#d8deea;stroke-width:1.3}.navigation-scene .plain{fill:#fff;stroke:#becfdd;stroke-width:1.4}
.navigation-scene .family-card{fill:#fff;stroke:#d6e1e9;stroke-width:1.2}.navigation-scene .family-active{fill:#f0e9f8;stroke:#9369b4;stroke-width:1.7}
.navigation-scene .family-control{cursor:pointer;outline:none}.navigation-scene .family-control:focus .family-card{stroke:#326f9e;stroke-width:3}
.navigation-scene .family-selected{stroke:#75a3be;stroke-width:1.8}.navigation-scene .family-control:hover .family-card{stroke:#7a58a0}
.navigation-scene .action-line{fill:none;stroke:#769cb4;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.navigation-scene .action-cue{fill:#f1eaf8;stroke:#9574b0;stroke-width:1.5}.navigation-scene .action-dash{stroke-dasharray:3 4}
.navigation-scene .action-label{font-size:${m ? 21 : 14}px;fill:#4f6577}
.navigation-scene .action-accent{fill:#e6f3f5;stroke:#4d95a5;stroke-width:1.7}
.navigation-scene .subtype-dot{fill:#b6c5d2}.navigation-scene .active-subtype{fill:#8059a5}
.navigation-scene .tag-chip{fill:#fff;stroke:#d7e3ed;stroke-width:1.1}.navigation-scene .tag-focus{fill:#e5f1fa;stroke:#5999c0;stroke-width:1.8}
.navigation-scene .hint-shape{fill:#fff;stroke:#b8a7ca;stroke-width:1.5}.navigation-scene .sft{fill:#eaf4fb;stroke:#8aadc7;stroke-width:1.6}
.navigation-scene .feedback-shape{fill:#f5f0f9;stroke:#ac93c2;stroke-width:1.4}.navigation-scene .feedback-bank{fill:#fbf9fd;stroke:#b49aca;stroke-width:1.4;stroke-dasharray:5 4}
.navigation-scene .active-target{fill:#edf8f3;stroke:#6da797;stroke-width:1.5}.navigation-scene .ring{fill:none;stroke:#b97c70;stroke-width:1.8;stroke-dasharray:4 5}
.navigation-scene .boundary{stroke:#90aec2;stroke-width:1.5;stroke-dasharray:3 5}.navigation-scene .divider{stroke:#d8dfea;stroke-width:1.3}
.navigation-scene .fresh-route{stroke:#a6bfce;stroke-dasharray:5 7}.navigation-scene .marker-blue{fill:#287db1}.navigation-scene .marker-violet{fill:#8059a5}
</style>
<defs>
${[['blue', '#287db1'], ['violet', '#8059a5'], ['red', '#b58176']].map(([name, color]) => `<marker id="arrow-${name}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto"><path d="M1 1L8 5L1 9" fill="none" stroke="${color}" stroke-width="1.7"/></marker>`).join('')}
<symbol id="medical-ct" viewBox="0 0 64 64"><ellipse cx="32" cy="32" rx="28" ry="25" fill="#eff5fa" stroke="#7ca3bc" stroke-width="1.6"/><path d="M27 14C19 13 11 24 13 38C15 49 24 50 28 42C31 34 27 23 27 14ZM37 14C45 13 53 24 51 38C49 49 40 50 36 42C33 34 37 23 37 14Z" fill="#aac9dc" stroke="#638eaa" stroke-width="1.3"/><path d="M32 14V27M32 25L25 31M32 25L39 31" fill="none" stroke="#e7f1f8" stroke-width="2.4" stroke-linecap="round"/><circle cx="32" cy="47" r="4" fill="#e0eaf2" stroke="#819fb4" stroke-width="1.2"/></symbol>
<symbol id="medical-histology" viewBox="0 0 64 64"><rect x="4" y="5" width="56" height="54" rx="8" fill="#fbf1f6" stroke="#bc99ba" stroke-width="1.5"/><g fill="#efd6e8" stroke="#b585b0" stroke-width="1.2"><ellipse cx="17" cy="18" rx="8" ry="7"/><ellipse cx="40" cy="16" rx="10" ry="7"/><ellipse cx="29" cy="32" rx="10" ry="8"/><ellipse cx="50" cy="36" rx="7" ry="9"/><ellipse cx="13" cy="44" rx="7" ry="8"/><ellipse cx="35" cy="49" rx="9" ry="6"/></g><g fill="#9674a5"><circle cx="18" cy="18" r="2.5"/><circle cx="39" cy="16" r="3"/><circle cx="28" cy="32" r="3"/><circle cx="50" cy="35" r="2.4"/><circle cx="13" cy="44" r="2.4"/><circle cx="34" cy="49" r="2.5"/></g></symbol>
<symbol id="medical-ecg" viewBox="0 0 64 64"><rect x="4" y="5" width="56" height="54" rx="7" fill="#f0f7fa" stroke="#88acbd" stroke-width="1.5"/><path d="M5 20H59M5 33H59M5 46H59M18 6V58M32 6V58M46 6V58" fill="none" stroke="#d5e5ec" stroke-width="1"/><path d="M8 35H16L20 30L24 35H28L32 18L37 49L42 30L46 35H56" fill="none" stroke="#3a879f" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></symbol>
</defs>
<rect width="${c.w}" height="${m ? 652 : 389}" class="local-region"/>
<rect y="${m ? 652 : 389}" width="${c.w}" height="${c.h - (m ? 652 : 389)}" class="supervision-region"/>
${text(...c.localTitle, 'LOCAL MEDICAL REPAIR', 'section-label', 'start')}
<path d="M30 ${m ? 652 : 389}H${c.w - 30}" class="divider"/>
${text(...c.outerTitle, 'EVOLVING SUPERVISION', 'section-label outer-label', 'start')}
<g id="outer-tracks">
${line('target-track', c.targetPath)}${line('data-track', c.dataPath)}${line('model-track', c.modelPath)}${line('feedback-track', c.feedbackPath)}${line('selection-track', c.selectionPath)}${line('return-track', c.returnPath)}${line('base-track', c.basePath)}
</g>
<g id="question" transform="translate(${qx} ${qy})">
<rect x="${-qw / 2}" y="${-qh / 2}" width="${qw}" height="${qh}" rx="10" class="plain"/>
${text(0, m ? -72 : -52, m ? 'Training input' : 'Training question', m ? 'base' : 'small')}
<g id="question-ct">${icon('ct', 0, m ? -22 : -15, m ? 74 : 66)}</g>
<g id="question-histology">${icon('histology', 0, m ? -22 : -15, m ? 74 : 66)}</g>
<g id="question-ecg">${icon('ecg', 0, m ? -22 : -15, m ? 74 : 66)}</g>
${text(0, m ? 42 : 37, 'CT', 'base', 'middle', 'context-modality')}
${text(0, m ? 70 : 59, 'Thorax', 'base', 'middle', 'context-anatomy')}
<circle id="reinspection-ring" cx="${m ? 14 : 12}" cy="${m ? -20 : -13}" r="${m ? 14 : 12}" class="ring"/>
</g>
${text(qx, m ? 273 : 287, 'Observable context', 'small')}
${line('input-path', c.inputPath, 'draw-blue', 'arrow-blue')}
<g id="student" transform="translate(${sx} ${sy})"><circle r="33" fill="#287db1"/>${text(0, 8, 'Mₜ', 'white', 'middle', 'student-model')}${text(0, 53, 'Student', 'small')}</g>
<g id="trace-past">
${line('prefix-path', c.prefixPath, 'draw-violet')}
${c.prefix.map((p, i) => node(`prefix-${i}`, p, 'good')).join('')}
${text(...c.prefixLabel, 'Supported prefix', 'good-label')}
<g id="failed-branch">${line('wrong-path', c.wrongPath, 'draw-red')}${c.wrong.map((p, i) => node(`wrong-${i}`, p, 'bad', '<path d="M-6-6L6 6M6-6L-6 6" class="cross"/>')).join('')}</g>
${text(...c.wrongLabel, m ? 'Failed suffix' : 'First error → failed suffix', 'bad-label', 'middle', 'failed-label')}
<circle id="error-ring" cx="${c.wrong[0][0]}" cy="${c.wrong[0][1]}" r="30" class="ring"/>
${line('diagnosis-path', diagnosisRoute(c, 0), 'draw-violet', 'arrow-violet')}
${line('rollback-path', c.rollbackPath, 'rollback', 'arrow-red')}
<path id="safe-boundary" d="${m ? `M${c.boundary[0] - 26} ${c.boundary[1]}h52` : `M${c.boundary[0]} ${c.boundary[1] - 25}v112`}" class="boundary"/>
<g id="new-branch">${line('correct-path', c.correctPath, 'draw-blue')}${c.corrected.map((p, i) => node(`corrected-${i}`, p, 'repaired', i === c.corrected.length - 1 ? '<g id="screen-check">' + check + '</g>' : check)).join('')}</g>
${m ? text(c.suffixLabel[0], 305, 'Same student', 'repair-label') + text(c.suffixLabel[0], 378, 'New suffix', 'repair-label') : text(...c.suffixLabel, 'Same student · new suffix', 'repair-label')}
${text(c.corrected.at(-1)[0], c.corrected.at(-1)[1] + (m ? 51 : 43), m ? 'Candidate' : 'Candidate target', 'small', 'middle', 'target-status-label')}
</g>
<g id="trace-fresh">${line('fresh-path', c.freshPath, 'fresh-route')}${node('fresh-result', m ? [503, 278] : [849, 205], '', text(0, 8, '?', 'title'))}
${text(...c.prefixLabel, 'Fresh rollout', 'good-label')}${text(...c.wrongLabel, m ? 'Diagnose again' : 'Diagnose the new rollout independently', 'small')}</g>
<g id="case-action" transform="translate(${m ? 158 : 290} ${m ? 333 : 329})">
<g id="action-visual">
  <rect x="${m ? -65 : -48}" y="-20" width="${m ? 69 : 51}" height="40" rx="6" class="plain"/>
  ${icon('ct', m ? -30 : -23, 0, 43)}
  <g id="action-lens"><circle cx="${m ? 16 : 15}" cy="-4" r="15" fill="#fff" fill-opacity=".7" stroke="#8059a5" stroke-width="2"/><path d="M27 7l13 13" class="action-line"/></g>
</g>
<g id="action-reasoning">
  <g id="evidence-left"><rect x="${m ? -97 : -67}" y="-20" width="${m ? 52 : 39}" height="40" rx="5" class="plain"/>
  <path d="M${m ? -86 : -60} -11h${m ? 30 : 24}M${m ? -86 : -60} 0h${m ? 19 : 14}M${m ? -86 : -60} 11h${m ? 30 : 24}" class="action-line"/></g>
  <g id="evidence-right"><rect x="${m ? 45 : 28}" y="-20" width="${m ? 52 : 39}" height="40" rx="5" class="plain"/>
  <path d="M${m ? 56 : 35} -11h${m ? 30 : 24}M${m ? 56 : 35} 0h${m ? 19 : 14}M${m ? 56 : 35} 11h${m ? 30 : 24}" class="action-line"/></g>
  <g id="evidence-conflict"><path d="M-6-8L6 8M6-8L-6 8" class="cross"/></g>
  <g id="evidence-joined"><path d="M${m ? -41 : -24} 0H-14M14 0H${m ? 41 : 24}" class="action-line"/><circle r="12" class="action-accent"/>${check}</g>
</g>
<g id="action-differential">
  <title>Compare the feature profiles of candidate explanations A and B.</title>
  <g id="comparison-left"><rect x="${m ? -94 : -66}" y="-20" width="${m ? 72 : 48}" height="40" rx="5" class="plain"/>
    ${text(m ? -58 : -42, -3, 'A', 'action-label')}<path d="M${m ? -83 : -58} 6h${m ? 50 : 32}M${m ? -83 : -58} 14h${m ? 30 : 19}" class="action-line"/></g>
  <g id="comparison-right"><rect x="${m ? 22 : 18}" y="-20" width="${m ? 72 : 48}" height="40" rx="5" class="plain"/>
    ${text(m ? 58 : 42, -3, 'B', 'action-label')}<path d="M${m ? 33 : 26} 6h${m ? 30 : 19}M${m ? 33 : 26} 14h${m ? 50 : 32}" class="action-line"/></g>
  <g id="comparison-guide"><path d="M${m ? -94 : -66} 3H${m ? 94 : 66}M${m ? -94 : -66} 17H${m ? 94 : 66}" fill="none" stroke="#8059a5" stroke-width="1.6" stroke-dasharray="4 4"/>
  <path d="M-12 0H12M-12 0l5-5M-12 0l5 5M12 0l-5-5M12 0l-5 5" class="action-line"/></g>
</g>
<g id="action-knowledge">
  <g id="rule-placeholder"><rect x="${m ? -97 : -67}" y="-20" width="${m ? 89 : 63}" height="40" rx="5" class="plain action-dash"/>${text(m ? -52 : -35, 7, '?', 'action-label')}</g>
  <g id="rule-category"><rect x="${m ? -97 : -67}" y="-20" width="${m ? 89 : 63}" height="40" rx="5" class="action-cue"/>${text(m ? -52 : -35, 7, 'Rule', 'action-label')}</g>
  <path d="M${m ? 0 : 3} 0H${m ? 46 : 34}" class="action-line action-dash"/>
  <circle cx="${m ? 72 : 51}" cy="0" r="20" class="plain"/>
  <g id="rule-linked"><path d="M${m ? 0 : 3} 0H${m ? 50 : 31}" class="action-line"/><g transform="translate(${m ? 72 : 51} 0)">${check}</g></g>
</g>
</g>
<g id="error-codebook">
<rect x="${book.x - 5}" y="${book.y - (m ? 24 : 18)}" width="${book.w + 10}" height="${m ? 39 : 28}" class="local-region"/>
${text(book.x, book.y, 'Fixed error codebook', 'book-title', 'start')}${text(book.x + book.w, book.y, m ? '20 subtypes' : '4 families · 20 subtypes', 'small', 'end')}
${families.map((family, i) => {
  const x = book.x + i * (cellW + book.gap), center = x + cellW / 2;
  return `<g id="error-family-${i}" class="family-control" data-case="${i}" role="button" tabindex="0" aria-pressed="${i === 0}" aria-label="Play Case ${i + 1}: ${errorScenarios[i].name}"><title>Play Case ${i + 1}: ${errorScenarios[i].name} (${errorScenarios[i].code})</title><rect id="error-card-${i}" x="${x}" y="${book.cellY}" width="${cellW}" height="${book.cellH}" rx="7" class="family-card"/>
    ${family.title.map((s, j) => text(center, book.cellY + (m ? 29 : 24) + j * (m ? 26 : 20), s, 'family-name')).join('')}
    ${family.operation.map((s, j) => text(center, book.cellY + (m ? 88 : 72) + j * (m ? 22 : 17), m && i === 2 ? 'Compare' : s, 'family-operation')).join('')}
    ${Array.from({ length: 5 }, (_, k) => `<circle id="subtype-${i}-${k}" cx="${center + (k - 2) * (m ? 13 : 10)}" cy="${book.cellY + book.cellH - 11}" r="${m ? 2.8 : 2.1}" class="subtype-dot"/>`).join('')}</g>`;
}).join('')}
</g>
<g id="hint" transform="translate(${xy(c.hint)})"><rect id="hint-box" x="${m ? -160 : -116}" y="${m ? -23 : -20}" width="${m ? 320 : 232}" height="${m ? 46 : 40}" rx="7" class="hint-shape"/>
${text(0, m ? 7 : 5, 'Answer-free recovery cue', 'base', 'middle', 'hint-operation')}${text(0, m ? 46 : 40, 'Gold-blind auditor', 'small')}</g>
${line('hint-path', c.hintPath, 'draw-violet', 'arrow-violet')}
<g id="dataset" transform="translate(${dx} ${dy})">
<rect x="${m ? -84 : -100}" y="${m ? -54 : -46}" width="${m ? 168 : 200}" height="${m ? 108 : 92}" rx="10" class="panel"/>
${[-1, 0, 1].map((offset, i) => `<g transform="translate(${offset * (m ? 49 : 60)} 0)"><rect x="${m ? -22 : -26}" y="${m ? -38 : -34}" width="${m ? 44 : 52}" height="${m ? 76 : 68}" rx="6" class="plain"/>${icon(['ct', 'histology', 'ecg'][i], 0, -4, m ? 40 : 46)}${text(0, m ? 30 : 26, (m ? ['CT', 'Hist.', 'ECG'] : ['CT', 'Tissue', 'ECG'])[i], m ? 'tag-text' : 'small')}</g>`).join('')}
<g id="new-target" transform="translate(${m ? -49 : -60} 0)"><rect x="${m ? -22 : -26}" y="${m ? -38 : -34}" width="${m ? 44 : 52}" height="${m ? 76 : 68}" rx="6" class="active-target"/><use id="target-medical-icon" href="#medical-ct" x="${m ? -20 : -23}" y="${m ? -24 : -27}" width="${m ? 40 : 46}" height="${m ? 40 : 46}"/><g transform="translate(0 ${m ? 27 : 24})">${check}</g></g>
</g>
${m ? text(...c.datasetLabel, 'Medical', 'title') + text(c.datasetLabel[0], c.datasetLabel[1] + 28, 'supervision', 'title') : text(...c.datasetLabel, 'Medical supervision', 'title')}
${text(dx, m ? 866 : 570, '≤1 target / question', 'small')}
${line('target-path', c.targetPath, 'draw-blue', 'arrow-blue')}${line('data-path', c.dataPath, 'draw-blue', 'arrow-blue')}
${text((dx + tx) / 2, dy - 20, 'Dₜ₊₁', 'base')}
<g id="training" transform="translate(${tx} ${ty})"><circle r="35" class="sft"/>${text(0, 7, 'SFT', 'title')}</g>
<g id="base-model" transform="translate(${xy(c.base)})"><rect x="${m ? -88 : -67}" y="${m ? -22 : -19}" width="${m ? 176 : 134}" height="${m ? 44 : 38}" rx="6" class="plain"/>${text(0, m ? 7 : 5, 'Same base M₀', 'base')}</g>
${line('base-path', c.basePath, 'draw-blue', 'arrow-blue')}${line('model-path', c.modelPath, 'draw-blue', 'arrow-blue')}${text(...c.modelLabel, 'Mₜ₊₁', 'base')}
<g id="evaluation" transform="translate(${ex} ${ey})"><circle r="34" class="feedback-shape"/>${text(0, 7, m ? 'Eval.' : 'Assess', 'base')}${text(0, m ? 57 : -57, m ? 'Capability' : 'Capability assessment', m ? 'base' : 'small')}</g>
<g id="feedback" transform="translate(${xy(c.feedback)})"><rect x="${m ? -85 : -76}" y="-28" width="${m ? 170 : 152}" height="56" rx="7" class="feedback-bank"/>
${text(0, m ? -4 : -5, 'Fixed feedback', m ? 'tag-text' : 'base')}${text(0, m ? 20 : 16, 'Assessment only', 'small')}</g>
${line('feedback-path', c.feedbackPath, 'draw-violet', 'arrow-violet')}
<g id="capability-map"><rect x="${map.x}" y="${map.y}" width="${map.w}" height="${map.h}" rx="10" class="panel"/>
${text(map.x + 18, map.y + (m ? 29 : 25), 'Medical capability map', 'title', 'start')}${text(map.x + map.w - 16, map.y + (m ? 28 : 24), 'Fixed axes', 'small', 'end')}
${mapRows}${text(map.x + map.w / 2, map.y + map.h - (m ? 16 : 15), 'Disease labels stay in planning.', 'small')}</g>
${line('selection-path', c.selectionPath, 'draw-violet', 'arrow-violet')}${line('return-path', c.returnPath, 'draw-violet', 'arrow-violet')}
${m ? '' : text(80, 365, 'Next training question', 'small', 'start')}
<g id="repair-packet"><rect x="${m ? -10 : -16}" y="${m ? -12 : -18}" width="${m ? 20 : 32}" height="${m ? 24 : 36}" rx="4" class="active-target"/><use id="repair-packet-icon" href="#medical-ct" x="${m ? -9 : -14}" y="${m ? -10 : -16}" width="${m ? 18 : 28}" height="${m ? 18 : 28}"/><path d="M4 6l3 3 5-6" class="check"/></g>
<circle id="learning-packet" r="5" class="marker-blue"/><circle id="base-packet" r="5" class="marker-blue"/>
<circle id="feedback-packet" r="5" class="marker-violet"/>
<g id="question-packet"><use id="question-packet-icon" href="#medical-histology" x="${m ? -12 : -15.5}" y="${m ? -12 : -15.5}" width="${m ? 24 : 31}" height="${m ? 24 : 31}"/></g>
<circle id="rollback-packet" r="4" fill="#b58176"/>
</svg>`;
}

// Browser controls
const animationHost = document.getElementById('animation-canvas');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const narrowScreen = window.matchMedia('(max-width: 640px)');
const caseDuration = 12000;
const duration = caseDuration * errorScenarios.length;
const stageSeeks = [2550, 5250, 8550, 10650];
const stageTitles = [
  'Medical error diagnosis',
  'Knowledge-guided trajectory repair',
  'Supervision update and model training',
  'Capability assessment and question selection',
];
const playButton = document.getElementById('play-animation');
const stageButtons = [...document.querySelectorAll('[data-step]')];
const stageTitle = document.getElementById('stage-title');
const progressBar = document.getElementById('animation-progress');
const caseStatus = document.getElementById('case-status');
const caseSummary = document.getElementById('case-summary');
let svg, elements, pathLengths, layout, playing = !reducedMotion.matches;
let cursor = reducedMotion.matches ? stageSeeks[3] : 0;
let lastFrame = null;
let previousStage = -1;
let mountedCase = -1;
const clamp = x => Math.max(0, Math.min(1, x));
const between = (t, start, end) => clamp((t - start) / (end - start));
const ease = x => x * x * (3 - 2 * x);
const opacity = (id, value) => elements[id].setAttribute('opacity', String(clamp(value)));
function draw(id, progress) {
  const n = pathLengths[id];
  elements[id].style.strokeDasharray = `${n} ${n}`;
  elements[id].style.strokeDashoffset = String(n * (1 - clamp(progress)));
  const arrow = elements[id].dataset.arrow;
  if (arrow) elements[id].style.markerEnd = progress >= .98 ? `url(#${arrow})` : 'none';
}
function travel(id, pathId, progress, visible = true) {
  const point = elements[pathId].getPointAtLength(pathLengths[pathId] * clamp(progress));
  elements[id].setAttribute('transform', `translate(${point.x} ${point.y})`);
  opacity(id, visible ? 1 : 0);
}
function mountScene() {
  layout = narrowScreen.matches ? sceneLayouts.mobile : sceneLayouts.desktop;
  animationHost.innerHTML = buildScene(layout);
  svg = animationHost.querySelector('svg');
  elements = Object.fromEntries([...svg.querySelectorAll('[id]')].map(el => [el.id, el]));
  pathLengths = Object.fromEntries([...svg.querySelectorAll('path[id]')].map(el => [el.id, el.getTotalLength()]));
  mountedCase = -1;
  previousStage = -1;
  [...svg.querySelectorAll('[data-case]')].forEach((control, index) => {
    control.addEventListener('click', () => selectCase(index));
    control.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectCase(index);
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        const target = (index + (event.key === 'ArrowRight' ? 1 : 3)) % errorScenarios.length;
        selectCase(target);
        elements[`error-family-${target}`].focus();
      }
    });
  });
  render(cursor);
  document.getElementById('animation-controls').hidden = false;
}
function render(ms) {
  const time = Math.max(0, Math.min(duration - 1, ms));
  const caseIndex = Math.min(errorScenarios.length - 1, Math.floor(time / caseDuration));
  const scenario = errorScenarios[caseIndex];
  const localTime = time - caseIndex * caseDuration;
  // Reuse the reviewed 16-second lifecycle at a compact 12-second case pace.
  const t = localTime * 16000 / caseDuration;
  const phase = Math.min(3, Math.floor(t / 4000));
  const fresh = t >= 15400;
  const diagnosis = t >= 2950 && !fresh;
  const stageKey = caseIndex * 4 + phase;
  if (mountedCase !== caseIndex) {
    elements['diagnosis-path'].setAttribute('d', diagnosisRoute(layout, caseIndex));
    pathLengths['diagnosis-path'] = elements['diagnosis-path'].getTotalLength();
    elements['target-medical-icon'].setAttribute('href', `#medical-${scenario.icon}`);
    elements['repair-packet-icon'].setAttribute('href', `#medical-${scenario.icon}`);
    elements['question-packet-icon'].setAttribute('href', `#medical-${modalityIcons[scenario.next[0]]}`);
    elements['new-target'].setAttribute('transform', `translate(${(scenario.tags[0] - 1) * (layout.mobile ? 49 : 60)} 0)`);
    caseStatus.textContent = `Case ${caseIndex + 1}/4 · Schematic`;
    caseSummary.textContent = `${scenario.code} · ${scenario.summary}`;
    mountedCase = caseIndex;
  }
  if (stageKey !== previousStage) {
    stageTitle.textContent = stageTitles[phase];
    stageButtons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === phase)));
    previousStage = stageKey;
  }
  animationHost.dataset.phase = String(phase);
  animationHost.dataset.case = String(caseIndex);
  animationHost.dataset.scenario = scenario.key;
  animationHost.dataset.diagnosis = diagnosis ? scenario.code : '';
  const context = fresh ? scenario.next : scenario.tags;
  animationHost.dataset.context = `${modalityNames[context[0]]}-${anatomyNames[context[1]]}`.toLowerCase();
  progressBar.style.transform = `scaleX(${localTime / caseDuration})`;
  modalityIcons.forEach((name, index) => opacity(`question-${name}`, context[0] === index ? 1 : 0));
  elements['context-modality'].textContent = modalityNames[context[0]];
  elements['context-anatomy'].textContent = anatomyNames[context[1]];
  elements['student-model'].textContent = fresh ? 'Mₜ₊₁' : 'Mₜ';
  elements['student-model'].style.fontSize = fresh ? (layout.mobile ? '22px' : '21px') : '';
  const recovery = ease(between(t, 4200, 6100));
  opacity('reinspection-ring', caseIndex === 0 && t >= 4300 && t < 6200 ? 1 : 0);
  opacity('case-action', fresh ? 0 : 1);
  errorScenarios.forEach((entry, index) => {
    opacity(`action-${entry.key}`, index === caseIndex ? 1 : 0);
    elements[`error-family-${index}`].setAttribute('aria-pressed', String(index === caseIndex));
    elements[`error-card-${index}`].setAttribute('class', `family-card${index === caseIndex ? ' family-selected' : ''}${diagnosis && index === caseIndex ? ' family-active' : ''}`);
    for (let subtype = 0; subtype < 5; subtype++) {
      elements[`subtype-${index}-${subtype}`].setAttribute('class', diagnosis && index === caseIndex && subtype === entry.subtype ? 'subtype-dot active-subtype' : 'subtype-dot');
    }
  });
  elements['action-lens'].setAttribute('transform', `translate(${-recovery * (layout.mobile ? 38 : 28)} ${Math.sin(recovery * Math.PI) * -8})`);
  elements['evidence-left'].setAttribute('transform', `translate(${recovery * (layout.mobile ? 13 : 5)} 0)`);
  elements['evidence-right'].setAttribute('transform', `translate(${-recovery * (layout.mobile ? 13 : 5)} 0)`);
  opacity('evidence-conflict', 1 - recovery);
  opacity('evidence-joined', recovery);
  opacity('comparison-guide', recovery);
  elements['comparison-guide'].setAttribute('transform', `translate(0 ${-7 * (1 - recovery)})`);
  opacity('rule-placeholder', 1 - recovery);
  opacity('rule-category', recovery);
  elements['rule-category'].setAttribute('transform', `translate(0 ${-12 * (1 - recovery)})`);
  opacity('rule-linked', recovery);
  opacity('trace-past', fresh ? 0 : 1);
  opacity('trace-fresh', fresh ? 1 : 0);
  draw('prefix-path', between(t, 250, 1150));
  layout.prefix.forEach((_, i) => opacity(`prefix-${i}`, between(t, 450 + i * 360, 750 + i * 360)));
  draw('wrong-path', between(t, 1150, 2050));
  opacity('failed-branch', t < 4000 ? between(t, 1150, 1900) : .13 + .87 * (1 - between(t, 4000, 4750)));
  elements['failed-label'].textContent = t < 4000 ? (layout.mobile ? 'Failed suffix' : 'First error → failed suffix') : 'Discarded suffix';
  opacity('error-ring', t >= 2050 && t < 4400 ? 1 : 0);
  draw('diagnosis-path', between(t, 2100, 2950));
  opacity('diagnosis-path', t < 4250 ? 1 : 0);
  draw('rollback-path', between(t, 3300, 4550));
  opacity('rollback-path', t < 4800 ? 1 : 0);
  travel('rollback-packet', 'rollback-path', ease(between(t, 3300, 4550)), t > 3300 && t < 4550);
  opacity('safe-boundary', t >= 3300 && !fresh ? 1 : 0);
  elements['hint-operation'].textContent = t >= 4000 && !fresh ? scenario.cue : 'Answer-free recovery cue';
  elements['hint-box'].style.fill = t >= 4000 && t < 7900 ? '#f1eaf8' : '#fff';
  draw('hint-path', between(t, 4200, 5000));
  opacity('hint-path', t >= 4000 && t < 7600 ? 1 : 0);
  draw('correct-path', between(t, 5050, 6950));
  opacity('new-branch', t >= 4900 ? 1 : 0);
  layout.corrected.forEach((_, i) => opacity(`corrected-${i}`, between(t, 5100 + i * 650, 5600 + i * 650)));
  opacity('screen-check', between(t, 7700, 8250));
  elements['target-status-label'].textContent = t >= 8250 ? (layout.mobile ? 'Screened' : 'Screened target') : (layout.mobile ? 'Candidate' : 'Candidate target');
  opacity('target-track', fresh ? 0 : 1);
  opacity('target-path', fresh ? 0 : 1);
  const admission = between(t, 8350, 9700);
  draw('target-path', admission);
  travel('repair-packet', 'target-path', ease(admission), t >= 8350 && t < 9700);
  opacity('new-target', between(t, 9500, 9800));
  draw('data-path', between(t, 10000, 10750));
  draw('base-path', between(t, 10300, 11000));
  draw('model-path', between(t, 11000, 11800));
  travel('base-packet', 'base-path', ease(between(t, 10300, 11000)), t >= 10300 && t < 11000);
  if (t < 11000) travel('learning-packet', 'data-path', ease(between(t, 10000, 10750)), t >= 10000 && t < 10750);
  else travel('learning-packet', 'model-path', ease(between(t, 11000, 11800)), t >= 11000 && t < 11800);
  draw('feedback-path', between(t, 12000, 12600));
  draw('selection-path', between(t, 12600, 13400));
  if (t < 12600) travel('feedback-packet', 'feedback-path', ease(between(t, 12000, 12600)), t >= 12000 && t < 12600);
  else travel('feedback-packet', 'selection-path', ease(between(t, 12600, 13400)), t >= 12600 && t < 13400);
  const focus = ease(between(t, 13300, 14200));
  const initial = scenario.tags, next = scenario.next;
  initial.forEach((start, row) => {
    const position = start + (next[row] - start) * focus;
    elements[`tag-focus-${row}`].setAttribute('x', String(layout.map.x + layout.map.chipX + position * (layout.map.chipW + layout.map.gap)));
    elements[`tag-focus-${row}`].style.fill = focus > .5 ? '#efe9f7' : '#e5f1fa';
    elements[`tag-focus-${row}`].style.stroke = focus > .5 ? '#916ab3' : '#5999c0';
  });
  draw('return-path', between(t, 14300, 15400));
  travel('question-packet', 'return-path', ease(between(t, 14300, 15400)), t >= 14300 && t < 15400);
  playButton.textContent = playing ? 'Pause' : 'Play';
  playButton.setAttribute('aria-label', playing ? 'Pause the evolution schematic' : 'Play the evolution schematic');
  playButton.setAttribute('aria-pressed', String(playing));
}
function setPlaying(value) {
  playing = value;
  lastFrame = null;
  render(cursor);
}
function seek(ms) {
  playing = false;
  lastFrame = null;
  cursor = Math.max(0, Math.min(duration - 1, Number(ms) || 0));
  render(cursor);
}
function selectCase(index, autoPlay = !reducedMotion.matches) {
  const selected = Math.max(0, Math.min(errorScenarios.length - 1, Math.floor(Number(index) || 0)));
  cursor = selected * caseDuration + (reducedMotion.matches ? stageSeeks[3] : 0);
  setPlaying(Boolean(autoPlay) && !reducedMotion.matches);
}
function frame(now) {
  if (playing && !document.hidden) {
    if (lastFrame !== null) cursor = (cursor + Math.min(80, now - lastFrame)) % duration;
    render(cursor);
  }
  lastFrame = now;
  window.requestAnimationFrame(frame);
}
mountScene();
playButton.addEventListener('click', () => setPlaying(!playing));
stageButtons.forEach((b, i) => b.addEventListener('click', () => seek(Math.floor(cursor / caseDuration) * caseDuration + stageSeeks[i])));
narrowScreen.addEventListener('change', () => { previousStage = -1; mountScene(); });
reducedMotion.addEventListener('change', event => { if (event.matches) seek(Math.floor(cursor / caseDuration) * caseDuration + stageSeeks[3]); });
document.addEventListener('visibilitychange', () => { lastFrame = null; });
window.medEvoEvolution = { seek, play: () => setPlaying(true), pause: () => setPlaying(false), selectCase, duration, caseDuration, cases: errorScenarios.map(({ code, name }) => ({ code, name })), get currentTime() { return cursor; }, get currentCase() { return Math.floor(cursor / caseDuration); } };
window.requestAnimationFrame(frame);

const copyButton = document.getElementById('copy-citation');
copyButton.addEventListener('click', async () => {
  const citation = document.getElementById('bibtex');
  const status = document.getElementById('copy-status');
  try {
    await navigator.clipboard.writeText(citation.textContent);
    status.textContent = 'Copied';
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(citation);
    selection.removeAllRanges();
    selection.addRange(range);
    status.textContent = 'Selected. Press Ctrl+C or ⌘C.';
  }
});
