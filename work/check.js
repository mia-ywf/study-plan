const fs = require('fs');
const file = process.argv[2];
const html = fs.readFileSync(file, 'utf8');
const js = html.slice(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'));

const mkEl = () => ({
  textContent: '', innerHTML: '', value: '', disabled: false, checked: false, files: [],
  style: {}, options: { length: 0 },
  classList: { add() {}, remove() {}, contains() { return false; } },
  addEventListener() {}, appendChild() {}, removeChild() {}, click() {},
  setAttribute() {}, getAttribute() { return null; }, closest() { return null; }
});
global.document = {
  getElementById: () => mkEl(), querySelectorAll: () => [], querySelector: () => mkEl(),
  createElement: () => mkEl(), body: mkEl(), addEventListener() {}
};
global.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = v; }, removeItem(k) { delete this._d[k]; } };
global.window = {};
global.alert = () => {};
global.confirm = () => true;

const test = `
setTimeout(() => {
  const problems = [];
  const r = computePlan();
  const maxPer = Math.round((+S.settings.maxPerDayPerTask || 2.5) * 60);
  const minUnit = Math.min(90, Math.max(10, Math.round(+S.settings.minUnit || 25)));

  // 1) 单日总量不得超过那天可用容量
  r.days.forEach(day => {
    if (day.used > day.cap + 0.01) problems.push('OVER CAP ' + day.d + ': ' + day.used + ' > ' + day.cap);
    const sum = r.alloc[day.d].reduce((a, b) => a + b.m, 0);
    if (Math.abs(sum - day.used) > 0.01) problems.push('SUM MISMATCH ' + day.d);
    if (day.used > day.free + 0.01) problems.push('OVER FREE ' + day.d);
    const seen = new Set();
    r.alloc[day.d].forEach(b => {
      if (seen.has(b.id)) problems.push('DUPLICATE ROW ' + day.d + ' ' + b.id);
      seen.add(b.id);
      if (b.m < minUnit) problems.push('BELOW MIN UNIT ' + day.d + ' ' + b.m + 'min');
      if (b.m > maxPer + 0.01) problems.push('OVER TASK DAILY CAP ' + day.d + ' ' + b.m + 'min');
      if (Math.abs(b.h * 60 - b.m) > 1e-9) problems.push('H/M MISMATCH ' + day.d);
    });
  });

  // 2) 总量不得超过任务剩余时长；不得排到最早开始之前 / 截止之后
  const hoursPlaced = {};
  Object.keys(r.alloc).forEach(d => r.alloc[d].forEach(b => { hoursPlaced[b.id] = (hoursPlaced[b.id] || 0) + b.m / 60; }));
  S.tasks.filter(t => !t.done).forEach(t => {
    if ((hoursPlaced[t.id] || 0) > t.hours + 0.51) problems.push('OVER PLACED ' + t.title + ' ' + hoursPlaced[t.id].toFixed(2) + '/' + t.hours);
  });
  Object.keys(r.alloc).forEach(d => r.alloc[d].forEach(b => {
    const t = S.tasks.find(x => x.id === b.id);
    if (!t) { problems.push('ORPHAN ROW ' + b.id); return; }
    if (d < t.start) problems.push('BEFORE START ' + t.title + ' ' + d);
    if (d > t.due && d !== TODAY) problems.push('AFTER DUE ' + t.title + ' ' + d);
    if (t.done) problems.push('PLACED DONE TASK ' + t.title);
  }));

  console.log('=== 排程验证 ===');
  console.log('问题数: ' + problems.length);
  problems.slice(0, 20).forEach(p => console.log('  ! ' + p));

  console.log('\\n=== 前 7 天安排 ===');
  for (let i = 0; i < 7; i++) {
    const d = addDays(TODAY, i);
    const cls = classesFor(d).map(c => c.s + '-' + c.e + ' ' + c.n).join(' | ');
    const gs = {};
    r.alloc[d].forEach(b => {
      const t = S.tasks.find(x => x.id === b.id);
      (gs[t.category] = gs[t.category] || []).push(b.m + 'min ' + t.title.slice(0, 16));
    });
    console.log('\\n' + d + ' 周' + WD[dow(d)] + '  可用 ' + (freeMinutes(d) / 60).toFixed(1) + 'h  计划 ' + (r.days[i].used / 60).toFixed(1) + 'h');
    if (cls) console.log('   课: ' + cls);
    Object.keys(gs).forEach(c => console.log('   [' + c + '] ' + gs[c].join(' ; ')));
  }

  console.log('\\n=== 排不下的任务（截止日在 120 天内） ===');
  const hard = r.unplaced.filter(u => !u.beyond && !u.tail);
  console.log(hard.length ? hard.map(u => u.title + ' 差 ' + u.deficit + 'h').join('\\n') : '(无)');
  console.log('\\n=== 超出 120 天窗口、按月推进 ===');
  const soft = r.unplaced.filter(u => u.beyond);
  console.log(soft.length ? soft.map(u => u.title + ' 还剩 ' + u.deficit + 'h（截止 ' + u.due + '）').join('\\n') : '(无)');
  const tail = r.unplaced.filter(u => !u.beyond && u.tail);
  console.log('取整零头: ' + (tail.length ? tail.map(u => u.title + ' 剩 ' + u.deficit + 'h').join(' / ') : '(无)'));

  const sizes = [];
  Object.keys(r.alloc).forEach(d => r.alloc[d].forEach(b => sizes.push(b.m)));
  sizes.sort((a, b) => a - b);
  console.log('\\n每天条目数 平均 ' + (sizes.length / 120).toFixed(1) + ' 条 · 单元时长 平均 ' + (sizes.reduce((a, b) => a + b, 0) / sizes.length).toFixed(0) + ' 分钟 · 最短 ' + sizes[0] + ' · 最长 ' + sizes[sizes.length - 1]);
  const busy = r.days.filter(x => x.used > 0);
  console.log('有安排的天数 ' + busy.length + ' / ' + r.days.length + ' · 平均每天 ' + (busy.reduce((a, x) => a + x.used, 0) / busy.length / 60).toFixed(1) + 'h');

  const totalFree = r.days.reduce((a, x) => a + x.cap, 0) / 60;
  const totalUsed = r.days.reduce((a, x) => a + x.used, 0) / 60;
  const need = S.tasks.filter(t => !t.done).reduce((a, t) => a + t.hours, 0);
  console.log('120 天可用 ' + totalFree.toFixed(0) + 'h / 已排 ' + totalUsed.toFixed(0) + 'h / 任务总量 ' + need.toFixed(0) + 'h');
}, 60);
`;

new Function(js + test)();
