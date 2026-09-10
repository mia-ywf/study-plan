const fs = require('fs');
const html = fs.readFileSync(process.argv[2], 'utf8');
const js = html.slice(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'));

const els = {};
function mkEl(id) {
  return {
    id: id || '', textContent: '', innerHTML: '', value: '', disabled: false, checked: false,
    files: [], style: {}, options: { length: 0 }, tagName: 'DIV',
    classList: { _s: new Set(), add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); }, contains(c) { return this._s.has(c); } },
    addEventListener() {}, appendChild() {}, removeChild() {}, click() {},
    setAttribute() {}, getAttribute() { return null; }, closest() { return null; }, scrollTo() {}
  };
}
global.document = {
  getElementById: id => (els[id] = els[id] || mkEl(id)),
  querySelector: () => mkEl('q'),
  querySelectorAll: () => [],
  createElement: () => mkEl('new'),
  body: mkEl('body'),
  addEventListener() {}
};
global.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = v; }, removeItem(k) { delete this._d[k]; } };
global.window = { scrollTo() {} };
global.URL = { createObjectURL: () => 'blob:x', revokeObjectURL() {} };
global.Blob = class { constructor() {} };
global.FileReader = class { readAsText() {} };
global.alert = m => console.log('[alert] ' + m);
global.confirm = () => true;

const test = `
setTimeout(() => {
  const out = [];
  const ok = (name, cond, extra) => out.push((cond ? 'PASS  ' : 'FAIL  ') + name + (extra ? '  -> ' + extra : ''));
  try {
    render();
    ok('render() 无异常', true);
    ok('任务库已渲染', els.taskList.innerHTML.indexOf('data-delete-id') > 0);
    ok('未来7天日历已渲染', (els.cal.innerHTML.match(/class="day"/g) || []).length === 7);
    ok('今日计划按方向分组', (els.todayList.innerHTML.match(/class="catgrp"/g) || []).length >= 3, (els.todayList.innerHTML.match(/<span>([^<]+)<\\/span><span>([^<]+)<\\/span>/g) || []).slice(0, 4).join(' '));
    ok('日历按方向给出每日时长', (els.cal.innerHTML.match(/<i style="color:#/g) || []).length >= 7 && els.cal.innerHTML.indexOf('自习') > 0 && !/\\d\\d:\\d\\d–\\d\\d:\\d\\d<\\/i>/.test(els.cal.innerHTML), (els.cal.innerHTML.match(/计划 [\\d.]+h \\/ 可用 [\\d.]+h/g) || []).slice(0, 3).join(' | '));
    ok('顶部统计有数值', els.stoday.textContent !== '' && els.sdue.textContent !== '', els.stoday.textContent + ' / ' + els.sdue.textContent);

    view('settings', mkElProxy());
    ok('设置表单已填充时间窗', els.tAvail.value.indexOf('19:00-22:00') > 0);
    ok('设置表单已填充课表', els.tClasses.value.indexOf('操作系统') > 0);

    saveSettings();
    ok('保存设置成功', els.setMsg.textContent.indexOf('✅') === 0, els.setMsg.textContent);

    // 时间窗解析的往返一致性
    const back = parseAvail(availToText(S.avail));
    ok('时间窗往返一致', JSON.stringify(back) === JSON.stringify(S.avail));
    const cb = parseClasses(classesToText(S.classes));
    ok('课表往返一致', JSON.stringify(cb) === JSON.stringify(S.classes));

    // 非法输入要报错而不是崩
    let msg = '';
    els.tAvail.value = '一 19:00';
    try { parseAvail(els.tAvail.value); } catch (e) { msg = e.message; }
    ok('非法时间窗有可读报错', msg.indexOf('看不懂') >= 0, msg);
    els.tAvail.value = availToText(S.avail);

    // 改任务时长后应清空旧排程并重排
    const t0 = S.tasks[0];
    t0.hours = 10;
    openModal(t0.id);
    els.f1.value = '测试任务改名';
    els.f4.value = '8';
    saveTask();
    ok('编辑任务生效', S.tasks[0].title === '测试任务改名' && S.tasks[0].hours === 8);
    ok('编辑后清理了旧排程', Object.keys(S.alloc).length === 0);

    // 完成 / 删除 / 撤销
    toggleDone(t0.id, true);
    ok('标记完成生效', S.tasks.find(t => t.id === t0.id).done === 1);
    toggleDone(t0.id, false);
    ok('取消完成生效', S.tasks.find(t => t.id === t0.id).done === 0);

    const before = S.tasks.length;
    removeTask(t0.id);
    ok('删除生效', S.tasks.length === before - 1);
    ok('删除后旧排程被清空并触发重排', els.toast.classList.contains('show'), els.toastMsg.textContent);

    const undoBtn = els.toastBtn;
    undoBtn.onclick();
    ok('撤销删除恢复任务', S.tasks.length === before && S.tasks.some(t => t.id === t0.id));

    // 新增任务
    openModal();
    els.f1.value = '新任务测试';
    els.f4.value = '3';
    els.f3.value = addDays(TODAY, 9);
    saveTask();
    ok('新增任务生效', S.tasks.some(t => t.title === '新任务测试'));

    // 临时加一节排在可用窗口里的课，可用时间应当立刻减少 1 小时
    const d0 = TODAY, k0 = dow(d0);
    const freeBefore = freeMinutes(d0);
    els.tClasses.value = classesToText(S.classes) + '\\n周' + WD[k0] + ' 19:00-20:00 临时考试课';
    saveSettings();
    const freeAfter = freeMinutes(d0);
    ok('插入固定课后可用时间减少 60 分钟', freeBefore - freeAfter === 60, freeBefore / 60 + 'h -> ' + freeAfter / 60 + 'h');
    els.tClasses.value = classesToText(DEF_CLASSES);
    saveSettings();
    ok('课表还原', freeMinutes(d0) === freeBefore, freeMinutes(d0) / 60 + 'h');

    // 存储往返
    const raw = localStorage.getItem('study_os_v3');
    ok('已写入本地存储', !!raw && JSON.parse(raw).tasks.length === S.tasks.length);

    // v2 旧数据迁移
    localStorage.getItem = k => k === 'study_os_v2' ? JSON.stringify({ settings: { weekday: 6, weekend: 8, buffer: 1 }, tasks: [{ id: 'x1', title: '旧任务', category: '408', due: '2026-12-01', hours: 12, priority: 5, start: '2026-09-01', note: '', done: 0 }] }) : null;
    const migrated = load();
    ok('v2 数据能迁移', migrated.tasks.length === 1 && migrated.tasks[0].title === '旧任务', migrated.tasks.length + ' tasks, reserve=' + migrated.settings.reserve);
    ok('迁移后有时间窗', (migrated.avail[1] || []).length > 0 && (migrated.classes[1] || []).length > 0);
  } catch (e) {
    out.push('FAIL  抛出异常: ' + e.message + '\\n' + e.stack.split('\\n').slice(0, 4).join('\\n'));
  }
  console.log(out.join('\\n'));
  console.log('\\n失败数: ' + out.filter(x => x.startsWith('FAIL')).length);
}, 80);
function mkElProxy(){ return { classList:{add(){},remove(){}} }; }
`;

new Function('els', js + test)(els);
