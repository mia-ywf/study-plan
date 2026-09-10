const fs = require('fs');
const html = fs.readFileSync(process.argv[2], 'utf8');
const js = html.slice(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'));
const els = {};
const mk = () => ({
  textContent: '', innerHTML: '', value: '', style: {},
  classList: { add() {}, remove() {}, contains() { return false; } },
  addEventListener() {}, appendChild() {}, setAttribute() {}, getAttribute() { return null; },
  closest() { return null; }, options: { length: 0 }
});
global.document = { getElementById: id => (els[id] = els[id] || mk()), querySelectorAll: () => [], querySelector: () => mk(), createElement: () => mk(), body: mk(), addEventListener() {} };
global.localStorage = { getItem: () => null, setItem() {} };
global.window = {};

const NL = String.fromCharCode(10);
const test = [
  'setTimeout(function(){',
  '  render();',
  '  var cal = els.cal.innerHTML;',
  '  var first = cal.slice(0, cal.indexOf(\'</div><div class="day">\') + 6);',
  '  console.log(first.split(\'<div class="subline\').join(NL + \'  <div class="subline\').replace(/></g, ">" + NL + "<"));',
  '  console.log(NL + "--- 今日计划卡 ---");',
  '  console.log(els.todayList.innerHTML.replace(/></g, ">" + NL + "<"));',
  '}, 50);'
].join(NL);

new Function('els', 'NL', js + test)(els, NL);
