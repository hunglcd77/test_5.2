(function(){
  'use strict';
  const $=(s,r=document)=>r.querySelector(s);
  const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));

  function escapeHtml(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

  function injectQuickButton(){
    if($('#mt1p4QuickBtn')) return;
    const b=document.createElement('button');
    b.id='mt1p4QuickBtn'; b.className='mt1p4-quick-fab'; b.type='button';
    b.setAttribute('aria-label','Mở Tìm nhanh'); b.innerHTML='<span>⌕</span><b>Tìm nhanh</b><kbd>⌘K</kbd>';
    document.body.appendChild(b);
    b.addEventListener('click',openQuick);
  }

  function createQuickModal(){
    if($('#mt1p4QuickModal')) return;
    const m=document.createElement('div');
    m.id='mt1p4QuickModal'; m.className='mt1p4-modal'; m.hidden=true;
    m.innerHTML=`<div class="mt1p4-modal-backdrop" data-close-quick></div><div class="mt1p4-modal-panel mt1p4-command" role="dialog" aria-modal="true" aria-labelledby="mt1p4QuickTitle"><div class="mt1p4-modal-head"><div><span class="mt1p4-kicker">MT-1P · TÌM NHANH</span><h2 id="mt1p4QuickTitle">Tìm mọi thứ trong hệ thống</h2></div><button class="mt1p4-close" type="button" data-close-quick aria-label="Đóng">×</button></div><div class="mt1p4-command-input"><span>⌕</span><input id="mt1p4QuickInput" type="search" autocomplete="off" placeholder="Nhập NM01, tên nhà máy, hồ sơ, phụ lục…"><kbd>ESC</kbd></div><div id="mt1p4QuickResults" class="mt1p4-command-results"></div><div class="mt1p4-command-foot"><span>Enter để mở · Esc để đóng</span><a href="quick.html">Mở trang Tìm nhanh đầy đủ →</a></div></div>`;
    document.body.appendChild(m);
    $$('[data-close-quick]',m).forEach(x=>x.addEventListener('click',closeQuick));
    $('#mt1p4QuickInput',m).addEventListener('input',()=>renderQuickResults($('#mt1p4QuickInput').value));
    $('#mt1p4QuickInput',m).addEventListener('keydown',e=>{if(e.key==='Escape')closeQuick(); if(e.key==='Enter'){const first=$('.mt1p4-result-item',m); if(first) first.click();}});
  }

  function openQuick(){
    createQuickModal(); const m=$('#mt1p4QuickModal'); m.hidden=false; document.body.classList.add('mt1p4-modal-open');
    const i=$('#mt1p4QuickInput'); i.value=''; renderQuickResults(''); setTimeout(()=>i.focus(),30);
  }
  function closeQuick(){const m=$('#mt1p4QuickModal'); if(!m)return; m.hidden=true; document.body.classList.remove('mt1p4-modal-open');}

  function collectQuickData(q){
    const needle=(q||'').trim().toLocaleLowerCase('vi-VN');
    const items=[
      ['🔍','Tra cứu công khai','Danh mục 28 nhà máy · không cần đăng nhập','lookup.html'],
      ['⚡','Tìm nhanh','Tra cứu theo từ khóa, mẫu biểu, nhà máy','quick.html'],
      ['🏭','Danh mục nhà máy','Quản lý và tra cứu danh mục nhà máy','plants.html'],
      ['📁','Hồ sơ kỹ thuật','Số liệu kỹ thuật, nước thải, bùn, CTNH','technical.html'],
      ['📄','Phụ lục & biểu mẫu','Kho biểu mẫu ĐTM · GPMT · ĐKMT','appendix.html']
    ];
    $$('a[href]').forEach(a=>{
      const href=a.getAttribute('href')||''; const text=(a.textContent||'').replace(/\s+/g,' ').trim();
      if(!text||href.startsWith('#')||href.startsWith('javascript:'))return;
      if(/^(index|lookup|quick|plants|technical|appendix)\.html/.test(href)) return;
      items.push(['↗',text,'Liên kết trong hệ thống',href]);
    });
    const rows=$$('#publicLookupBody tr, #plantRegistry tr');
    rows.forEach((r,idx)=>{
      const cells=$$('td',r).map(x=>(x.textContent||'').replace(/\s+/g,' ').trim()).filter(Boolean);
      if(cells.length>=2){
        const code=cells[0], name=cells[1]; items.push(['🏭',`${code} · ${name}`,cells.slice(2,6).join(' · '),'plants.html#plants']);
      }
    });
    const unique=[]; const seen=new Set();
    items.forEach(x=>{const key=x[1]+'|'+x[3]; if(!seen.has(key)){seen.add(key); if(!needle || x.join(' ').toLocaleLowerCase('vi-VN').includes(needle))unique.push(x);}});
    return unique.slice(0,14);
  }

  function renderQuickResults(q){
    const el=$('#mt1p4QuickResults'); if(!el)return;
    const rows=collectQuickData(q);
    if(!rows.length){el.innerHTML='<div class="mt1p4-empty">Không tìm thấy kết quả phù hợp.</div>';return;}
    el.innerHTML=rows.map(x=>`<button type="button" class="mt1p4-result-item" data-href="${escapeHtml(x[3])}"><span class="mt1p4-result-icon">${x[0]}</span><span><strong>${escapeHtml(x[1])}</strong><small>${escapeHtml(x[2])}</small></span><span class="mt1p4-arrow">→</span></button>`).join('');
    $$('.mt1p4-result-item',el).forEach(b=>b.addEventListener('click',()=>{const h=b.dataset.href; if(h) location.href=h;}));
  }

  function injectDashboard(){
    if(location.pathname.endsWith('/lookup.html')||location.pathname.endsWith('/quick.html')||location.pathname.endsWith('/plants.html')||location.pathname.endsWith('/technical.html')||location.pathname.endsWith('/appendix.html')) return;
    if($('#mt1p4Dashboard')) return;
    const hero=$('#home'); if(!hero)return;
    const s=document.createElement('section'); s.id='mt1p4Dashboard'; s.className='mt1p4-dashboard card';
    s.innerHTML=`<div class="mt1p4-dash-head"><div><span class="mt1p4-kicker">TỔNG QUAN MT-1P</span><h2>Trung tâm điều khiển</h2><p>Truy cập nhanh các module và theo dõi trạng thái dữ liệu hiện có.</p></div><button class="mt1p4-outline" type="button" id="mt1p4DashQuick">⌕ Tìm nhanh</button></div><div class="mt1p4-metrics"><div class="mt1p4-metric"><span>Nhà máy</span><strong id="mt1p4StatPlants">—</strong><small>Danh mục hiện có</small></div><div class="mt1p4-metric"><span>Tra cứu công khai</span><strong>24/7</strong><small>Không cần đăng nhập</small></div><div class="mt1p4-metric"><span>Quyền hiện tại</span><strong id="mt1p4StatRole">Khách</strong><small id="mt1p4StatStatus">Chưa đăng nhập</small></div><div class="mt1p4-metric"><span>Phiên bản</span><strong>5.5.2</strong><small>Step 4 · Dashboard</small></div></div><div class="mt1p4-module-grid"><a href="lookup.html"><span>🔍</span><b>Tra cứu</b><small>Danh mục công khai</small></a><a href="quick.html"><span>⚡</span><b>Tìm nhanh</b><small>Command search</small></a><a href="plants.html"><span>🏭</span><b>Nhà máy</b><small>Danh mục & hồ sơ</small></a><a href="technical.html"><span>📁</span><b>Hồ sơ kỹ thuật</b><small>Số liệu & cập nhật</small></a><a href="appendix.html"><span>📄</span><b>Phụ lục</b><small>Biểu mẫu & nguồn</small></a></div></section>`;
    hero.insertAdjacentElement('afterend',s);
    $('#mt1p4DashQuick').addEventListener('click',openQuick);
    updateDashboard();
    const body=$('#publicLookupBody'); if(body){new MutationObserver(updateDashboard).observe(body,{childList:true});}
    document.addEventListener('mt1p4:auth',updateDashboard);
  }

  function updateDashboard(){
    const stat=$('#mt1p4StatPlants'); if(stat){const rows=$$('#publicLookupBody tr').filter(r=>$$('td',r).length); stat.textContent=rows.length?String(rows.length):'28';}
    const role=$('#mt1p4StatRole'),status=$('#mt1p4StatStatus');
    const u=window.MT1P_USER;
    if(u){role.textContent=String(u.profile?.role||u.role||'').toUpperCase()||'Đã đăng nhập';status.textContent='Tài khoản đang hoạt động';}
  }

  function injectPlantModal(){
    if(!$('#plantRegistry'))return;
    if(!$('#mt1p4PlantModal')){
      const m=document.createElement('div');m.id='mt1p4PlantModal';m.className='mt1p4-modal';m.hidden=true;
      m.innerHTML=`<div class="mt1p4-modal-backdrop" data-close-plant></div><div class="mt1p4-modal-panel" role="dialog" aria-modal="true"><div class="mt1p4-modal-head"><div><span class="mt1p4-kicker">NHÀ MÁY · XEM NHANH</span><h2 id="mt1p4PlantTitle">Hồ sơ nhà máy</h2></div><button class="mt1p4-close" type="button" data-close-plant>×</button></div><div id="mt1p4PlantBody" class="mt1p4-plant-detail"></div><div class="mt1p4-modal-actions"><a class="mt1p4-primary" id="mt1p4PlantOpen" href="technical.html">Mở hồ sơ kỹ thuật →</a><button class="mt1p4-outline" type="button" data-close-plant>Đóng</button></div></div>`;
      document.body.appendChild(m); $$('[data-close-plant]',m).forEach(x=>x.addEventListener('click',closePlant));
    }
    decoratePlantRows();
    const reg=$('#plantRegistry'); if(reg && !reg.dataset.mt1p4Observed){reg.dataset.mt1p4Observed='1'; new MutationObserver(()=>decoratePlantRows()).observe(reg,{childList:true});}
  }
  function decoratePlantRows(){
    $$('#plantRegistry tr').forEach(tr=>{
      if(tr.dataset.mt1p4Decorated||$$('td',tr).length<2)return;
      const cells=$$('td',tr); const last=cells[cells.length-1]; if(!last)return;
      const b=document.createElement('button');b.type='button';b.className='mt1p4-view-btn';b.textContent='Xem nhanh';b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openPlant(tr);});
      last.appendChild(b); tr.dataset.mt1p4Decorated='1';
    });
  }
  function openPlant(tr){
    const cells=$$('td',tr).map(c=>(c.textContent||'').replace(/\s+/g,' ').trim());
    if(cells.length<2)return;
    const code=cells[0],name=cells[1],title=$('#mt1p4PlantTitle'),body=$('#mt1p4PlantBody'),link=$('#mt1p4PlantOpen');
    title.textContent=`${code} · ${name}`;
    const labels=['Mã nhà máy','Nhà máy / địa điểm','Công suất','Nguồn nước','Nước thải','Bùn thải','CTNH','Tình trạng hồ sơ'];
    body.innerHTML=labels.map((l,i)=>`<div class="mt1p4-detail-row"><span>${l}</span><strong>${escapeHtml(cells[i]||'—')}</strong></div>`).join('');
    if(link){link.href=`technical.html?plant=${encodeURIComponent(code)}`;}
    const m=$('#mt1p4PlantModal');m.hidden=false;document.body.classList.add('mt1p4-modal-open');
  }
  function closePlant(){const m=$('#mt1p4PlantModal');if(m){m.hidden=true;document.body.classList.remove('mt1p4-modal-open');}}

  function mobileEnhancements(){
    document.documentElement.classList.add('mt1p4-ready');
    const nav=$('.mt1p-step1-nav');
    if(nav && !$('#mt1p4MenuHint')){const h=document.createElement('span');h.id='mt1p4MenuHint';h.textContent='← Vuốt để xem thêm';h.className='mt1p4-menu-hint';nav.appendChild(h);}
  }

  function bindKeys(){
    document.addEventListener('keydown',e=>{
      if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openQuick();}
      if(e.key==='Escape'){closeQuick();closePlant();}
    });
  }

  document.addEventListener('DOMContentLoaded',()=>{
    injectQuickButton(); createQuickModal(); injectDashboard(); injectPlantModal(); mobileEnhancements(); bindKeys();
    setTimeout(()=>{if(window.MT1P_USER) updateDashboard();},1000);
  });
  window.addEventListener('mt1p-auth-ready',()=>{updateDashboard();document.dispatchEvent(new Event('mt1p4:auth'));});
})();
