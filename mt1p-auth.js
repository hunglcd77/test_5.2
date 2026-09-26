/* MT-1P Phase 5 — single shared authentication layer */
(function(){
  'use strict';
  const SUPABASE_URL='https://jaefczpoqjwivbswzfnd.supabase.co';
  const SUPABASE_KEY='sb_publishable_3q2cC0lyYxaMuv3Id8JVJg_Jw2YtpZp';
  const publicPage=document.body?.dataset.publicPage==='true';
  let client=null;
  let busy=false;

  function el(id){return document.getElementById(id)}
  function clean(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function error(msg){const e=el('loginError'); if(e)e.textContent=msg||'';}
  function setNav(profile,user){
    const n=el('navAuthState'); if(!n)return;
    if(profile&&user){
      n.hidden=false;
      n.innerHTML='<span class="mt5-role-badge">'+clean(profile.full_name||user.email||'')+' · '+clean(profile.role||'')+'</span><button type="button" id="navLogoutBtn">Đăng xuất</button>';
      el('navLogoutBtn')?.addEventListener('click',()=>el('authLogout')?.click());
    } else {n.hidden=true;n.innerHTML=''}
  }
  function lock(){
    const gate=el('authGate');
    if(gate && !publicPage) gate.hidden=false;
    const user=el('authUser'); if(user)user.hidden=true;
    window.MT1P_USER=null; document.body.dataset.mt1pRole=''; setNav(null,null);
  }
  function unlock(profile,user){
    const gate=el('authGate'); if(gate)gate.hidden=true;
    const box=el('authUser'); if(box)box.hidden=false;
    const name=el('authUserName'); if(name)name.textContent=(profile.full_name||user.email)+' · '+profile.role;
    window.MT1P_USER={id:user.id,email:user.email||'',full_name:profile.full_name||'',role:profile.role,status:profile.status};
    document.body.dataset.mt1pRole=profile.role||'';
    document.querySelectorAll('[data-role-only]').forEach(x=>{
      const roles=(x.dataset.roleOnly||'').split(',').map(v=>v.trim()).filter(Boolean);
      x.hidden=roles.length ? !roles.includes(profile.role) : false;
    });
    setNav(profile,user);
  }
  function getClient(){
    if(client)return client;
    if(!window.supabase?.createClient) throw new Error('Không tải được thư viện Supabase JS. Hãy kiểm tra kết nối/CDN.');
    client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'mt1p-supabase-auth-v5'}});
    window.MT1P_SUPABASE=client;
    return client;
  }
  async function readProfile(user){
    const c=getClient();
    let last=null;
    for(let i=0;i<3;i++){
      const {data,error:e}=await c.from('profiles').select('id,full_name,role,status').eq('id',user.id).maybeSingle();
      if(!e && data) return data;
      last=e||new Error('Không tìm thấy profiles');
      await new Promise(r=>setTimeout(r,250*(i+1)));
    }
    // Fallback: role RPC, useful when profile SELECT is briefly stale. Full profile is still required for status.
    try{
      const {data:role,error:re}=await c.rpc('get_my_role');
      if(!re && role){
        const r=String(Array.isArray(role)?role[0]?.get_my_role??role[0]:role).trim().toLowerCase();
        if(['admin','manager','staff','viewer'].includes(r)) return {id:user.id,full_name:user.email||'',role:r,status:'active'};
      }
    }catch(_){ }
    throw new Error('Auth thành công nhưng chưa đọc được quyền MT-1P. Kiểm tra profiles theo UUID: '+user.id+(last?.message? ' — '+last.message:''));
  }
  async function load(session,user){
    const c=getClient();
    if(!user){const r=await c.auth.getSession();session=r.data?.session||null;user=session?.user||null;}
    if(!user){lock();return false;}
    const profile=await readProfile(user);
    const role=String(profile.role||'').trim().toLowerCase();
    const status=String(profile.status||'').trim().toLowerCase();
    if(status!=='active') throw new Error('Tài khoản đã đăng nhập nhưng profiles.status = "'+profile.status+'", không phải active.');
    if(!['admin','manager','staff','viewer'].includes(role)) throw new Error('Role MT-1P không hợp lệ: '+profile.role);
    const normalized={...profile,role,status};
    unlock(normalized,user);
    try{await window.loadWaterPlantsFromSupabase?.()}catch(e){console.warn('[MT-1P] water_plants',e)}
    try{await window.loadTechnicalRecordsFromSupabase?.()}catch(e){console.warn('[MT-1P] technical_records',e)}
    window.dispatchEvent(new CustomEvent('mt1p:auth-ready',{detail:{user,profile:normalized}}));
    return true;
  }
  async function init(){
    try{
      const c=getClient();
      if(publicPage){
        // Public modules never block on authentication. Restore session silently if present.
        try{const r=await c.auth.getSession(); if(r.data?.session?.user) await load(r.data.session,r.data.session.user)}catch(e){console.warn('[MT-1P] public session',e)}
        return;
      }
      await load();
    }catch(e){console.error('[MT-1P] Auth init',e); error(e.message||'Không thể khởi tạo đăng nhập.'); lock();}
  }
  document.addEventListener('DOMContentLoaded',()=>{
    const form=el('loginForm'), btn=el('loginBtn'), logout=el('authLogout');
    form?.addEventListener('submit',async ev=>{
      ev.preventDefault(); if(busy)return; busy=true; error(''); if(btn){btn.disabled=true;btn.textContent='Đang đăng nhập…'}
      try{
        const email=el('loginUser')?.value.trim(), password=el('loginPass')?.value||'';
        if(!email||!password)throw new Error('Vui lòng nhập email và mật khẩu.');
        const {data,error:e}=await getClient().auth.signInWithPassword({email,password});
        if(e)throw new Error('Đăng nhập thất bại: '+e.message);
        if(!data?.user)throw new Error('Supabase Auth không trả về user sau khi đăng nhập.');
        await load(data.session||null,data.user);
        window.mt1pToast?.('Đăng nhập thành công','success');
        localStorage.setItem('mt1p_last_login',new Date().toISOString());
      }catch(e){console.error('[MT-1P] login',e);error(e.message||'Không thể đăng nhập.');lock();try{await getClient().auth.signOut()}catch(_){} }
      finally{busy=false;if(btn){btn.disabled=false;btn.textContent='Đăng nhập'}}
    });
    logout?.addEventListener('click',async()=>{try{await getClient().auth.signOut()}catch(e){console.error(e)}; if(el('loginPass'))el('loginPass').value='';error('');lock();window.mt1pToast?.('Đã đăng xuất','info')});
    init();
  });
})();
