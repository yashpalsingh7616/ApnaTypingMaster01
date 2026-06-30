// ============================================================
// firebase.js — Firebase Realtime DB + Auth Module
// Include as: <script type="module" src="firebase.js"></script>
// MUST come AFTER shared.js
// ============================================================
import { initializeApp }            from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, onValue, set, update, get, serverTimestamp, runTransaction }
                                    from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, signOut }
                                    from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAJcKdAYz2SRA75XtDB_VQZEzvoCK8WdUQ",
    authDomain: "apna-typing-master-pro-af16d.firebaseapp.com",
    databaseURL: "https://apna-typing-master-pro-af16d-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "apna-typing-master-pro-af16d",
    storageBucket: "apna-typing-master-pro-af16d.firebasestorage.app",
    messagingSenderId: "727800871355",
    appId: "1:727800871355:web:97bc57c93e6514372fac9e",
    measurementId: "G-6CNL0V0BPS"
  };

let fbApp, db, auth, fbOk = false;
try {
  fbApp = initializeApp(firebaseConfig);
  db    = getDatabase(fbApp);
  auth  = getAuth(fbApp);
  fbOk  = true;
} catch(e){ console.error('Firebase init error:', e); }

// ── UI helpers ───────────────────────────────────────────────
function showLoader(msg){
  let el=document.getElementById('fbLoader');
  if(!el){ el=document.createElement('div'); el.id='fbLoader';
    el.style.cssText='position:fixed;bottom:18px;right:18px;background:#1a5276;color:#fff;padding:10px 18px;border-radius:8px;font-size:13px;font-weight:600;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,0.4);'; document.body.appendChild(el); }
  el.textContent='🔄 '+msg; el.style.display='block';
}
function hideLoader(){ const el=document.getElementById('fbLoader'); if(el) el.style.display='none'; }
function toast(msg,ok=true){
  let el=document.getElementById('fbToast');
  if(!el){ el=document.createElement('div'); el.id='fbToast';
    el.style.cssText='position:fixed;bottom:18px;right:18px;padding:10px 18px;border-radius:8px;font-size:13px;font-weight:600;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,0.4);max-width:320px;'; document.body.appendChild(el); }
  el.style.background=ok?'#27ae60':'#e74c3c'; el.style.color='#fff';
  el.textContent=msg; el.style.display='block';
  setTimeout(()=>{ el.style.display='none'; }, ok?3500:6000);
}
window.showFbToast = toast;
window.showFbLoader = showLoader;
window.hideFbLoader = hideLoader;

// ── DB Path helper ───────────────────────────────────────────
function tabPath(tab){
  if(tab===0) return 'passages/normal/english';
  if(tab===1) return 'passages/normal/hindi';
  if(tab===2) return 'passages/live/english';
  if(tab===3) return 'passages/live/hindi';
  return 'passages/normal/numbers';
}

// ── Read: Listen to all passage paths ───────────────────────
function listenAll(){
  if(!fbOk){ toast('❌ Firebase connect nahi ho paya.',false); return; }
  showLoader('Firebase se passages load ho rahe hain...');
  const paths=[
    {p:'passages/normal/english', t:()=>window.PASS.english},
    {p:'passages/normal/hindi',   t:()=>window.PASS.hindi},
    {p:'passages/normal/numbers', t:()=>window.PASS.numbers},
    {p:'passages/live/english',   t:()=>window.LIVE_PASS.english},
    {p:'passages/live/hindi',     t:()=>window.LIVE_PASS.hindi},
  ];
  let done=0;
  const safetyTimer=setTimeout(()=>{ if(done<paths.length){ hideLoader(); toast('⚠️ Firebase timeout. Internet check karein.',false); }},10000);
  paths.forEach(({p,t})=>{
    onValue(ref(db,p),(snap)=>{
      const arr=t(); arr.length=0;
      if(snap.exists()){ Object.keys(snap.val()).map(Number).sort((a,b)=>a-b).forEach(k=>arr.push(snap.val()[k])); }
      done++;
      if(done===paths.length){
        clearTimeout(safetyTimer); hideLoader();
        if(typeof window.updateTabCounts==='function') window.updateTabCounts();
        if(typeof window.renderAdmTab==='function') window.renderAdmTab(window.admCurrentTab);
        if(typeof window.buildDd==='function') window.buildDd();
      }
    },(err)=>{ clearTimeout(safetyTimer); hideLoader(); toast('❌ Load error: '+err.message,false); });
  });
}

// ── Write: Save array to Firebase ───────────────────────────
function saveTab(tab, retry=0){
  if(!fbOk){ toast('❌ Firebase ready nahi hai.',false); return; }
  const path=tabPath(tab);
  let arr;
  if(tab===0) arr=window.PASS.english;
  else if(tab===1) arr=window.PASS.hindi;
  else if(tab===2) arr=window.LIVE_PASS.english;
  else if(tab===3) arr=window.LIVE_PASS.hindi;
  else arr=window.PASS.numbers;
  const obj={}; arr.forEach((p,i)=>{ obj[String(i)]=p; });
  showLoader('Firebase mein save ho raha hai...');
  set(ref(db,path),obj)
    .then(()=>{ hideLoader(); toast('✅ Firebase mein save ho gaya!'); })
    .catch(err=>{ hideLoader();
      if(retry<1){ setTimeout(()=>saveTab(tab,retry+1),1500); return; }
      toast('❌ Save NAHI hua: '+err.message,false);
    });
}
window.saveArrayToFirebase = saveTab;

// ── Admin Auth ───────────────────────────────────────────────
window.fbAdminSignIn = function(email, password){
  if(!fbOk) return Promise.reject(new Error('Firebase not ready'));
  return signInWithEmailAndPassword(auth, email, password)
    .catch(err=>{ toast('❌ Login fail: '+err.message,false); throw err; });
};
window.fbAdminSignOut = function(){
  if(!fbOk||!auth) return;
  signOut(auth).catch(e=>console.error(e));
};

// ════════════════════════════════════════════════════════════
// ANALYTICS / USER TRACKING SYSTEM
// Firebase paths:
//   users/{emailKey}        → {name,email,examPref,signupAt,lastLoginAt,loginCount,isPro,plan,proExpiry}
//   activeSessions/{devId}  → {lastSeen, userEmail|null}   (auto-expires via lastSeen check)
//   payments/{pushId}       → {email,name,plan,amount,date,status}
//   dailyStats/{yyyy-mm-dd} → {signups,logins,testsCompleted}
// ════════════════════════════════════════════════════════════

const HEARTBEAT_MS = 60000; // active user = seen in last 2 min

// ── Record a new signup ──────────────────────────────────────
window.fbTrackSignup = function(name, email, examPref){
  if(!fbOk) return;
  const key = window.emailToKey(email);
  const userRef = ref(db, 'users/'+key);
  get(userRef).then(snap=>{
    if(snap.exists()){
      // already exists — treat as login instead
      window.fbTrackLogin(email);
      return;
    }
    set(userRef, {
      name: name||'', email: email||'', examPref: examPref||'',
      signupAt: Date.now(), lastLoginAt: Date.now(),
      loginCount: 1, isPro: false, plan: null, proExpiry: null
    });
    const today = new Date().toISOString().slice(0,10);
    runTransaction(ref(db,'dailyStats/'+today+'/signups'), (cur)=>(cur||0)+1);
  }).catch(err=>console.error('signup track error',err));
};

// ── Record a login (existing user) ───────────────────────────
window.fbTrackLogin = function(email){
  if(!fbOk||!email) return;
  const key = window.emailToKey(email);
  const userRef = ref(db, 'users/'+key);
  get(userRef).then(snap=>{
    if(snap.exists()){
      const cur = snap.val();
      update(userRef, {
        lastLoginAt: Date.now(),
        loginCount: (cur.loginCount||0)+1
      });
    } else {
      // user logged in but no record (e.g. quick demo login) — create minimal record
      set(userRef, {
        name: email.split('@')[0], email, examPref:'',
        signupAt: Date.now(), lastLoginAt: Date.now(),
        loginCount: 1, isPro:false, plan:null, proExpiry:null
      });
    }
    const today = new Date().toISOString().slice(0,10);
    runTransaction(ref(db,'dailyStats/'+today+'/logins'), (cur)=>(cur||0)+1);
  }).catch(err=>console.error('login track error',err));
};

// ── Mark a Pro purchase ──────────────────────────────────────
window.fbTrackPayment = function(email, name, planKey, amount){
  if(!fbOk) return;
  const payRef = ref(db, 'payments/' + Date.now() + '_' + Math.random().toString(36).slice(2,8));
  set(payRef, {
    email: email||'', name: name||'', plan: planKey||'',
    amount: amount||0, date: Date.now(),
    dateStr: new Date().toLocaleString('en-IN'), status:'success'
  });
  if(email){
    const key = window.emailToKey(email);
    const expiryDays = planKey==='yearly'?365:planKey==='quarterly'?90:30;
    update(ref(db,'users/'+key), {
      isPro: true, plan: planKey,
      proExpiry: Date.now() + expiryDays*86400000
    });
  }
};

// ── Active session heartbeat (anonymous device, no login required) ──
window.fbStartHeartbeat = function(){
  if(!fbOk) return;
  const devId = window.getDeviceId();
  const sessRef = ref(db, 'activeSessions/'+devId);
  function beat(){
    set(sessRef, {
      lastSeen: Date.now(),
      userEmail: (window.APP && window.APP.loggedIn) ? window.APP.email : null,
      userName: (window.APP && window.APP.loggedIn) ? window.APP.name : 'Guest',
      isPro: (window.APP && window.APP.isPro) || false
    }).catch(()=>{});
  }
  beat();
  setInterval(beat, HEARTBEAT_MS);
  window.addEventListener('beforeunload', ()=>{
    try{ set(sessRef, null); }catch(e){}
  });
};

// ── ADMIN: read full analytics snapshot ──────────────────────
window.fbGetAnalytics = function(callback){
  if(!fbOk){ callback({error:'Firebase not ready'}); return; }
  Promise.all([
    get(ref(db,'users')),
    get(ref(db,'payments')),
    get(ref(db,'activeSessions')),
    get(ref(db,'dailyStats'))
  ]).then(([usersSnap, paySnap, sessSnap, statsSnap])=>{
    const users = usersSnap.exists() ? usersSnap.val() : {};
    const payments = paySnap.exists() ? Object.values(paySnap.val()) : [];
    const sessions = sessSnap.exists() ? sessSnap.val() : {};
    const dailyStats = statsSnap.exists() ? statsSnap.val() : {};

    const usersArr = Object.values(users);
    const totalUsers = usersArr.length;
    const proUsers = usersArr.filter(u=>u.isPro && u.proExpiry > Date.now()).length;
    const totalRevenue = payments.reduce((sum,p)=>sum+(p.amount||0),0);
    const totalPayments = payments.length;

    // Active = heartbeat within last 3 minutes
    const cutoff = Date.now() - (HEARTBEAT_MS*3);
    const activeArr = Object.values(sessions).filter(s=>s.lastSeen > cutoff);
    const activeCount = activeArr.length;
    const activeLoggedIn = activeArr.filter(s=>s.userEmail).length;
    const activeGuests = activeCount - activeLoggedIn;

    // Login-only users = signed up but isPro false
    const freeUsers = totalUsers - proUsers;

    callback({
      totalUsers, proUsers, freeUsers,
      totalRevenue, totalPayments,
      activeCount, activeLoggedIn, activeGuests,
      users: usersArr.sort((a,b)=>(b.signupAt||0)-(a.signupAt||0)),
      payments: payments.sort((a,b)=>(b.date||0)-(a.date||0)),
      dailyStats
    });
  }).catch(err=>{ console.error('analytics read error',err); callback({error:err.message}); });
};

// ── ADMIN: live-listen to analytics (auto refresh) ───────────
window.fbListenAnalytics = function(callback){
  if(!fbOk){ callback({error:'Firebase not ready'}); return; }
  const refresh = ()=>window.fbGetAnalytics(callback);
  onValue(ref(db,'users'), refresh);
  onValue(ref(db,'payments'), refresh);
  onValue(ref(db,'activeSessions'), refresh);
};

// ── Override admin functions to also sync Firebase ──────────
window.addEventListener('DOMContentLoaded',()=>{
  const _add=window.admAddPassage, _del=window.admDelPassage,
        _save=window.admSaveEdit,  _up=window.admMoveUp;

  if(typeof _add==='function'){
    window.admAddPassage=function(tab){
      const {key}=window.getAdmArr(tab);
      const ta=document.getElementById('newPassInput_'+key);
      if(!ta||ta.value.trim().length<10){ _add(tab); return; }
      _add(tab); saveTab(tab);
    };
  }
  if(typeof _del==='function'){
    window.admDelPassage=function(tab,idx){
      if(!confirm('Is passage ko delete karein?')) return;
      const {arr}=window.getAdmArr(tab); arr.splice(idx,1);
      if(typeof window.updateTabCounts==='function') window.updateTabCounts();
      if(typeof window.renderAdmTab==='function') window.renderAdmTab(tab);
      if(typeof window.showAdmToast==='function') window.showAdmToast('🗑️ Delete ho gaya!');
      if(document.getElementById('ctrlEx')&&typeof window.buildDd==='function') window.buildDd();
      saveTab(tab);
    };
  }
  if(typeof _save==='function'){
    window.admSaveEdit=function(tab,idx){
      const {arr,key}=window.getAdmArr(tab);
      const ta=document.getElementById('editTa_'+key+'_'+idx); if(!ta) return;
      const text=ta.value.trim();
      if(!text||text.length<10){ if(typeof window.showAdmToast==='function') window.showAdmToast('❌ Too short!','error'); return; }
      arr[idx]=text;
      if(typeof window.renderAdmTab==='function') window.renderAdmTab(tab);
      if(typeof window.showAdmToast==='function') window.showAdmToast('✅ Passage update ho gaya!');
      if(document.getElementById('ctrlEx')&&typeof window.buildDd==='function') window.buildDd();
      saveTab(tab);
    };
  }
  if(typeof _up==='function'){
    window.admMoveUp=function(tab,idx){
      if(idx===0) return;
      const {arr}=window.getAdmArr(tab); [arr[idx-1],arr[idx]]=[arr[idx],arr[idx-1]];
      if(typeof window.renderAdmTab==='function') window.renderAdmTab(tab);
      if(typeof window.showAdmToast==='function') window.showAdmToast('↑ Reorder ho gaya!');
      saveTab(tab);
    };
  }

  // JSON Import button injection for admin page
  const _rTab=window.renderAdmTab;
  if(typeof _rTab==='function'){
    window.renderAdmTab=function(n){
      _rTab(n);
      const head=document.querySelector('.adm-section-head');
      if(head&&!head.querySelector('#fbImportBtn')){
        const btn=document.createElement('button');
        btn.id='fbImportBtn';
        btn.innerHTML='📥 JSON se Import';
        btn.style.cssText='padding:6px 14px;background:#2471a3;border:none;border-radius:8px;color:#fff;font-size:12px;cursor:pointer;font-family:\'DM Sans\',sans-serif;margin-right:8px;';
        btn.onclick=()=>{
          const inp=document.createElement('input'); inp.type='file'; inp.accept='.json';
          inp.onchange=(e)=>{
            const file=e.target.files[0]; if(!file) return;
            const reader=new FileReader();
            reader.onload=(ev)=>{
              try {
                const data=JSON.parse(ev.target.result);
                const norm=data.normal||{}, live=data.live||{};
                if(norm.english){window.PASS.english=norm.english; saveTab(0);}
                if(norm.hindi)  {window.PASS.hindi=norm.hindi;     saveTab(1);}
                if(live.english){window.LIVE_PASS.english=live.english; saveTab(2);}
                if(live.hindi)  {window.LIVE_PASS.hindi=live.hindi;     saveTab(3);}
                if(norm.numbers){window.PASS.numbers=norm.numbers; saveTab(4);}
                if(typeof window.updateTabCounts==='function') window.updateTabCounts();
                if(typeof window.renderAdmTab==='function') window.renderAdmTab(window.admCurrentTab);
                toast('✅ Import ho gaya aur Firebase mein save ho raha hai!');
              } catch(err){ toast('❌ JSON parse error: '+err.message,false); }
            };
            reader.readAsText(file);
          };
          inp.click();
        };
        head.insertBefore(btn, head.firstChild);
      }
    };
  }

  // Export JSON
  window.admExportJSON=function(){
    const data={normal:{english:window.PASS.english,hindi:window.PASS.hindi,numbers:window.PASS.numbers},live:{english:window.LIVE_PASS.english,hindi:window.LIVE_PASS.hindi},exportedAt:new Date().toISOString(),version:'v7'};
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
    a.download='apna_passages_'+Date.now()+'.json'; a.click();
    if(typeof window.showAdmToast==='function') window.showAdmToast('✅ Export ho gaya!');
  };

  // Start listening
  listenAll();

  // Start active-session heartbeat (every page, tracks Guest + logged-in users)
  window.fbStartHeartbeat();
});
