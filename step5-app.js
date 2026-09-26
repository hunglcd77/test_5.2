
/* MT-1P Phase 5 — UX, audit, export, command palette */
(function(){
'use strict';
function toast(msg,type='info'){const host=document.getElementById('mt1pToast');if(!host)return;const d=document.createElement('div');d.className='mt5-toast '+type;d.textContent=msg;host.appendChild(d);setTimeout(()=>d.remove(),3000)}
window.mt1pToast=toast;
function audit(action,meta={}){try{const k='mt1p_audit_v5';const a=JSON.parse(localStorage.getItem(k)||'[]');a.unshift({time:new Date().toISOString(),page:location.pathname,action,role:document.body.dataset.mt1pRole||'',...meta});localStorage.setItem(k,JSON.stringify(a.slice(0,200)))}catch(_){} }
function csvCell(v){return '"'+String(v??'').replace(/"/g,'""')+'"'}
function exportTable(table,name='mt1p-data.csv'){if(!table)return;const rows=[...table.querySelectorAll('tr')].map(tr=>[...tr.cells].map(c=>c.innerText.trim()));if(!rows.length)return;const csv='\ufeff'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download=name;a.click();URL.revokeObjectURL(a.href);audit('export_csv',{name});toast('Đã xuất dữ liệu CSV','success')}
function addExportButtons(){
 document.querySelectorAll('table').forEach((t,i)=>{if(t.closest('.mt5-command'))return;if(t.dataset.mt5Export)return;t.dataset.mt5Export='1';const b=document.createElement('button');b.type='button';b.className='mt5-tool-btn';b.textContent='Xuất bảng CSV';b.addEventListener('click',()=>exportTable(t,'mt1p-table-'+(i+1)+'.csv'));const host=t.parentElement?.parentElement||t.parentElement;if(host&&!host.querySelector('.mt5-toolbar')){const bar=document.createElement('div');bar.className='mt5-toolbar';bar.appendChild(b);host.insertBefore(bar,t.parentElement)}else host?.querySelector('.mt5-toolbar')?.appendChild(b)})}
function commandPalette(){
 if(document.getElementById('mt5CommandBackdrop'))return;
 const back=document.createElement('div');back.id='mt5CommandBackdrop';back.innerHTML='<div class="mt5-command" role="dialog" aria-modal="true" aria-label="Tìm nhanh"><input id="mt5CommandInput" placeholder="Tìm module, nhà máy, hồ sơ..." autocomplete="off"><div class="mt5-command-list" id="mt5CommandList"></div></div>';document.body.appendChild(back);
 const input=back.querySelector('#mt5CommandInput'),list=back.querySelector('#mt5CommandList');
 const items=[...document.querySelectorAll('.mt1p-step1-nav .nav-item')].map(a=>({label:a.textContent.trim(),href:a.getAttribute('href')}));
 function render(q=''){list.innerHTML=items.filter(x=>x.label.toLowerCase().includes(q.toLowerCase())).map(x=>'<a class="mt5-command-item" href="'+x.href+'"><span>'+x.label+'</span><span>→</span></a>').join('')||'<div class="mt5-command-item">Không có kết quả</div>'}
 function open(){back.classList.add('open');input.value='';render();setTimeout(()=>input.focus(),0);audit('open_command_palette')}
 function close(){back.classList.remove('open')}
 window.mt1pOpenQuick=open;
 input.addEventListener('input',()=>render(input.value));back.addEventListener('click',e=>{if(e.target===back)close()});document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();open()}if(e.key==='Escape')close()});
}
function enhanceNav(){const nav=document.querySelector('.mt1p-step1-nav');if(!nav)return;if(!nav.querySelector('[data-quick-command]')){const b=document.createElement('button');b.type='button';b.dataset.quickCommand='1';b.className='nav-item';b.textContent='⚡ Tìm nhanh';b.style.border='0';b.style.background='transparent';b.addEventListener('click',()=>window.mt1pOpenQuick?.());nav.insertBefore(b,nav.querySelector('.nav-spacer')||null)} }
function init(){commandPalette();enhanceNav();addExportButtons();audit('page_view');window.addEventListener('mt1p:auth-ready',e=>{audit('login',{user:e.detail?.user?.email,role:e.detail?.profile?.role});toast('Đăng nhập thành công','success')});document.addEventListener('click',e=>{const a=e.target.closest('a.nav-item');if(a)audit('navigation',{to:a.getAttribute('href')})});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
