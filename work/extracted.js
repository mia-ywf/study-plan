
const K='study_os_v2';const iso=()=>new Date().toISOString().slice(0,10);const add=(s,n)=>{let d=new Date(s+'T12:00:00');d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};const fdate=s=>{let d=new Date(s+'T12:00:00');return (d.getMonth()+1)+'/'+d.getDate()};const wd=s=>['日','一','二','三','四','五','六'][new Date(s+'T12:00:00').getDay()];const id=()=>Math.random().toString(36).slice(2,9);const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

const semesterEnd='2026-11-05';
const weeklyClasses={
  0:[{s:'14:00',e:'15:45',n:'市场营销',r:'M207'},{s:'16:05',e:'17:50',n:'市场营销',r:'M207'}],
  1:[{s:'08:00',e:'09:45',n:'物联网系统',r:'M401'},{s:'10:05',e:'11:50',n:'操作系统',r:'N333'},{s:'14:00',e:'15:45',n:'体育（网球）',r:''},{s:'16:05',e:'17:50',n:'计算机网络',r:'N331'}],
  2:[{s:'16:05',e:'17:50',n:'并行计算',r:'M203'}],
  3:[{s:'08:00',e:'09:45',n:'物联网系统',r:'M401'},{s:'10:05',e:'11:50',n:'操作系统',r:'N333'},{s:'14:00',e:'15:45',n:'计算机网络',r:'N331'}],
  4:[{s:'16:05',e:'17:50',n:'并行计算',r:'M203'}],
  5:[{s:'10:05',e:'11:50',n:'操作系统',r:'N333'},{s:'14:00',e:'15:45',n:'计算机网络',r:'N331'}],
  6:[]
};
function classesFor(d){return d<=semesterEnd?(weeklyClasses[new Date(d+'T12:00:00').getDay()]||[]):[]}
function classHourTotal(d){return classesFor(d).reduce((a,c)=>{let [sh,sm]=c.s.split(':').map(Number),[eh,em]=c.e.split(':').map(Number);return a+(eh*60+em-sh*60-sm)/60},0)}

function tmpl(){let b=iso();let T=(title,cat,days,h,pri,start=0,note='')=>({id:id(),title,category:cat,due:add(b,days),hours:h,priority:pri,start:add(b,start),note,done:0});return {settings:{weekday:6,weekend:8,buffer:1},tasks:[T('408：数据结构复盘 + 真题基础','408',70,32,5,0,'上学期已学过：重建考研框架、经典题型与错题'),T('408：组成原理复盘 + 真题基础','408',85,38,5,0,'上学期已学过：补考研细节并开始真题'),T('课程+408：操作系统同步学习','408',58,32,5,0,'本学期正在上课：课程内容直接整理成408笔记'),T('课程+408：计算机网络同步学习','408',58,28,5,0,'本学期正在上课：课程内容直接整理成408笔记'),T('操作系统课程考试冲刺','408',58,14,5,30,'十月底/十一月初考试，考前集中复习并沉淀408笔记'),T('计算机网络课程考试冲刺','408',58,14,5,30,'十月底/十一月初考试，考前集中复习并沉淀408笔记'),T('数学一：基础阶段','数学',150,100,5,0,'高数为主，线代/概率穿插'),T('英语一：词汇 + 阅读习惯','英语',175,70,4,0,'长期小剂量，服务考研英语'),T('Java基础 + 面向对象','项目',35,35,4,0,'先能独立写，再做Spring'),T('Spring Boot + MySQL 项目V1','项目',105,60,4,15,'完成一个可运行后端项目'),T('Redis + Linux + Git','项目',120,30,4,45,'边学边接入项目'),T('算法基础：数组/链表/哈希/树','算法',135,40,3,0,'每周3-5小时'),T('六级刷分：真题与听力','六级',95,25,2,40,'和考研英语复用')],alloc:{}}}
let S=(()=>{try{let x=JSON.parse(localStorage.getItem(K)); if(!x||!Array.isArray(x.tasks)||!x.settings)return tmpl(); x.alloc=x.alloc||{}; return x}catch(e){return tmpl()}})();let filter='all',edit=null;
function save(){localStorage.setItem(K,JSON.stringify(S))}function cap(d){let x=new Date(d+'T12:00:00').getDay();return (x===0||x===6?+S.settings.weekend:+S.settings.weekday)-+S.settings.buffer}
function plan(){
  const btn=document.getElementById('planBtn'),status=document.getElementById('planStatus');
  try{
    if(btn){btn.disabled=true;btn.textContent='⏳ 正在重排…';}
    if(status) status.textContent='正在根据截止日期、优先级和每日容量重新计算…';
    let start=iso(),A={};
    for(let i=0;i<180;i++)A[add(start,i)]=[];
    let ts=(S.tasks||[]).filter(t=>!t.done).slice().sort((a,b)=>{
      let da=(new Date(a.due)-new Date(start))/86400000,db=(new Date(b.due)-new Date(start))/86400000;
      let ca=(a.category==='408'&&da<=65?14:0)+(a.category==='项目'&&da>65?4:0);
      let cb=(b.category==='408'&&db<=65?14:0)+(b.category==='项目'&&db>65?4:0);
      let ua=(+a.priority||0)*20+Math.max(0,70-da)+ca;
      let ub=(+b.priority||0)*20+Math.max(0,70-db)+cb;
      return ub-ua;
    });
    let rem={};ts.forEach(t=>rem[t.id]=Math.max(0,+t.hours||0)*(1-(+t.done||0)));
    for(let t of ts){
      let need=rem[t.id];
      for(let i=0;i<180&&need>.05;i++){
        let d=add(start,i); if(d<t.start||d>t.due)continue;
        let used=A[d].reduce((x,y)=>x+y.h,0),room=Math.max(0,cap(d)-used); if(room<=.05)continue;
        let chunk=Math.min(need,room,2.5); A[d].push({id:t.id,h:Math.round(chunk*4)/4}); need-=chunk;
      }
    }
    S.alloc=A;save();render();
    const left=Object.entries(rem).filter(([_,h])=>h>.05).length;
    if(status) status.textContent=left?`已重排，但有 ${left} 个任务在当前时间容量下无法完全排入。`:`✅ 已重排 · ${new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})}`;
  }catch(err){
    console.error(err);
    if(status) status.textContent='❌ 重排失败：'+(err?.message||'未知错误');
    alert('智能重排遇到错误：\n'+(err?.message||err));
  }finally{
    if(btn){btn.disabled=false;btn.textContent='✨ 智能重排';}
  }
}
function items(d){return (S.alloc[d]||[]).map(x=>({...x,t:S.tasks.find(t=>t.id===x.id)})).filter(x=>x.t)}
function render(){
 let c=document.getElementById('cal');c.innerHTML='';
 for(let i=0;i<7;i++){
   let d=add(iso(),i), a=items(d), cs=classesFor(d), e=document.createElement('div');
   e.className='day';
   e.innerHTML=`<b>${fdate(d)}</b><div class="dow">周${wd(d)} · ${classHourTotal(d).toFixed(1)}h课程</div>`;
   if(cs.length){e.innerHTML+=`<div class="class-head">固定课</div>`;cs.forEach(x=>e.innerHTML+=`<div class="class-chip"><b>${esc(x.n)}</b><br><span>${x.s}-${x.e}${x.r?' · '+esc(x.r):''}</span></div>`) }
   if(a.length){e.innerHTML+=`<div class="class-head">学习</div>`;a.forEach(x=>e.innerHTML+=`<div class="chip ${x.t.done?'done':''}">${esc(x.t.title)}<br><span class="muted">${x.h}h · ${x.t.category}</span></div>`)}
   if(!cs.length&&!a.length)e.innerHTML+='<div class="muted" style="margin-top:10px">暂无安排</div>';
   c.appendChild(e)
 }
 let a=items(iso()),tl=document.getElementById('todayList');
 tl.innerHTML=a.length?a.map(x=>`<div class="task"><input type="checkbox" ${x.t.done?'checked':''} onchange="done('${x.t.id}',this.checked)"><div><h4>${esc(x.t.title)}</h4><p>${esc(x.t.note||'')} <span class="tag">${x.t.category}</span></p></div><div class="right"><b>${x.h}h</b><small>P${x.t.priority}</small></div></div>`).join(''):'<div class="muted">今天还没有安排，点击“智能重排”。</div>';
 document.getElementById('stoday').textContent=a.reduce((s,x)=>s+x.h,0).toFixed(1)+'h';
 document.getElementById('sback').textContent=S.tasks.filter(t=>!t.done).length;
 document.getElementById('sdone').textContent=(S.tasks.length?Math.round(S.tasks.filter(t=>t.done).length/S.tasks.length*100):0)+'%';
 let u=S.tasks.filter(t=>!t.done).slice().sort((a,b)=>new Date(a.due)-new Date(b.due));
 document.getElementById('sdue').textContent=u[0]?fdate(u[0].due):'--';
 document.getElementById('line').textContent=new Date().toLocaleDateString('zh-CN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})+' · 今日固定课程 '+classHourTotal(iso()).toFixed(1)+'h · 自习容量约 '+Math.max(0,cap(iso())).toFixed(1)+'h';
 document.getElementById('up').innerHTML=u.slice(0,7).map(t=>`<div class="task"><div><span class="tag">${t.category}</span></div><div><h4>${esc(t.title)}</h4><p>截止 ${fdate(t.due)} · 剩余 ${(t.hours*(1-(+t.done||0))).toFixed(1)}h</p></div><div class="right"><b>P${t.priority}</b></div></div>`).join('');
 [['408','p408','b408'],['项目','ppro','bpro'],['算法','pcode','bcode']].forEach(([cat,p,b])=>{let T=S.tasks.filter(t=>t.category===cat),v=T.reduce((x,t)=>x+t.hours,0),z=T.reduce((x,t)=>x+t.hours*(+t.done||0),0),q=v?Math.round(z/v*100):0;document.getElementById(p).textContent=q+'%';document.getElementById(b).style.width=q+'%'});
 renderTasks();
}
function done(i,c){let t=S.tasks.find(t=>t.id===i);t.done=c?1:0;save();plan()}function renderTasks(){
 let a=S.tasks.filter(t=>filter==='all'||(filter==='todo'&&!t.done)||(filter==='done'&&t.done)).slice().sort((x,y)=>new Date(x.due)-new Date(y.due));
 document.getElementById('taskList').innerHTML=a.length?a.map(t=>`<div class="task"><input type="checkbox" ${t.done?'checked':''} onchange="done('${t.id}',this.checked)"><div><h4>${esc(t.title)}</h4><p><span class="tag">${t.category}</span> · 截止 ${fdate(t.due)} · ${t.hours}h · P${t.priority}${t.note?' · '+esc(t.note):''}</p></div><div class="right"><button type="button" class="btn" data-edit-id="${t.id}">编辑</button> <button type="button" class="btn danger" data-delete-id="${t.id}">删除</button></div></div>`).join(''):'<div class="muted">没有符合条件的任务。</div>';
}
function openModal(i=null){edit=i;let t=i&&S.tasks.find(t=>t.id===i);document.getElementById('mt').textContent=t?'编辑任务':'新任务';document.getElementById('f1').value=t?.title||'';document.getElementById('f2').value=t?.category||'408';document.getElementById('f3').value=t?.due||add(iso(),30);document.getElementById('f4').value=t?.hours||2;document.getElementById('f5').value=t?.priority||3;document.getElementById('f6').value=t?.start||iso();document.getElementById('f7').value=t?.note||'';document.getElementById('modal').classList.add('show')}
function closeModal(){document.getElementById('modal').classList.remove('show')}
function removeTask(i){
  const idx=S.tasks.findIndex(x=>x.id===i);
  if(idx<0){alert('删除失败：找不到这个任务。');return false}
  const removed=S.tasks[idx];
  S.tasks.splice(idx,1);
  S.alloc={};
  save();
  render();
  const status=document.getElementById('planStatus');
  if(status) status.textContent='✅ 已删除：'+removed.title+' · 计划需要重新分配时请点击“智能重排”';
  return true;
}
function view(v,b){document.querySelectorAll('.nav button').forEach(x=>x.classList.remove('on'));b.classList.add('on');['dash','tasks','settings'].forEach(x=>document.getElementById(x).style.display=x===v?'block':'none');document.getElementById('pt').textContent=v==='dash'?'今日学习中枢':v==='tasks'?'任务库':'学习设置';if(v==='settings'){document.getElementById('weekday').value=S.settings.weekday;document.getElementById('weekend').value=S.settings.weekend;document.getElementById('buffer').value=S.settings.buffer}}
function saveSet(){S.settings.weekday=+document.getElementById('weekday').value;S.settings.weekend=+document.getElementById('weekend').value;S.settings.buffer=+document.getElementById('buffer').value;save();plan()}function reset(){if(confirm('恢复默认任务模板？会替换当前任务库。')){let x=tmpl();S.settings=x.settings;S.tasks=x.tasks;S.alloc={};save();plan()}}document.getElementById('taskList').addEventListener('click',function(ev){
  const del=ev.target.closest('[data-delete-id]');
  if(del){
    ev.preventDefault(); ev.stopPropagation();
    const id=del.getAttribute('data-delete-id');
    removeTask(id);
    return;
  }
  const editBtn=ev.target.closest('[data-edit-id]');
  if(editBtn){
    ev.preventDefault();
    openModal(editBtn.getAttribute('data-edit-id'));
  }
});
if(!Object.keys(S.alloc||{}).length)plan();else render();

