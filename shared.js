// ============================================================
// shared.js — Global State, Data, Firebase Config
// Include in EVERY page:
//   <script src="shared.js"></script>
//   <script type="module" src="firebase.js"></script>
// ============================================================

// ── App State ───────────────────────────────────────────────
window.APP = {
  loggedIn:false, name:'', email:'', isPro:false, plan:'monthly',
  lang:'english', idx:0, running:false, timer:null, timeLeft:600,
  corr:0, err:0, total:0,
  pendingLang:null, pendingIsRule:false, pendingLayout:null,
  activeExamKey:null, backspaceCount:0, isLiveMode:false,
  hindiLayout:null, currentLiveTest:null
};

// ── Plans ───────────────────────────────────────────────────
window.PLANS_DATA = {
  monthly:  {base:126.27, gst:22.73, total:149, label:'Pro Monthly',   days:30},
  quarterly:{base:295.76, gst:53.24, total:349, label:'Pro 3-Monthly', days:90},
  yearly:   {base:847.46, gst:151.54,total:999, label:'Pro Yearly',    days:365}
};

// ── Passages (fallback; Firebase overwrites these) ──────────
window.PASS = {
  english:[
    "Afterwards it became known by all and was reported to the king. He called the bad minister before him and said, I have investigated and found that you have done a criminal act. Word of it has spread and you have dishonoured yourself here in Benares. So it would be better for you to go and live somewhere else. You may take all your wealth and your family. Go wherever you like and live happily there. Learn from this lesson. Then the minister took his family and all his belongings to the city of Kosala. Since he was very clever indeed, he worked his way up and became a minister of the king of Kosala as well.",
    "Education is the most powerful weapon which you can use to change the world. It is through knowledge and learning that individuals gain the tools necessary to improve their lives and contribute meaningfully to society. A well-educated population forms the backbone of any thriving democracy and enables citizens to make informed decisions."
  ],
  hindi:[
    "जिसकी मंजूरी बाईबल में दी गयी और जिस जिद से वे अपनी वापसी में फिलिस्तीन को चाहने लगे हैं। क्यों नही वे, पृथ्वी के दुसरे लोगों से प्रेम करते हैं, उस देश को अपना घर बनाते जहाँ पर उनका जन्म हुआ।",
    "भारत एक विविधताओं से भरा देश है जहाँ अनेक धर्म, भाषाएँ और संस्कृतियाँ एक साथ फलती-फूलती हैं। यहाँ के लोगों में एकता और भाईचारे की भावना सदियों से विद्यमान है।"
  ],
  numbers:[
    "1234 5678 9012 3456 7890 1122 3344 5566 7788 9900 1357 2468 1020 3040 5060 7080 9010",
    "100 200 300 400 500 600 700 800 900 1000 1100 1200 1300 1400 1500 1600 1700 1800 1900 2000"
  ]
};

window.LIVE_PASS = {
  english:[
    "The Uttar Pradesh Subordinate Services Selection Commission conducts recruitment examinations for various posts in the state government. Candidates appearing for these posts must demonstrate proficiency in both English and Hindi typing. The minimum speed required for English typing is thirty words per minute. Regular practice is essential to achieve this target.",
    "The Uttar Pradesh Police department is one of the largest police forces in the country. It plays a crucial role in maintaining law and order across the state. Candidates selected for the post of Sub Inspector are required to undergo rigorous training at the police academy.",
    "Indian Railways is one of the largest employers in the world and conducts the NTPC examination to recruit candidates for various non technical positions. Typing speed is a mandatory requirement for most of these posts.",
    "The Staff Selection Commission Combined Graduate Level examination is one of the most prestigious competitive examinations in India. The typing test for SSC CGL requires candidates to achieve a minimum speed of thirty five words per minute in English."
  ],
  hindi:[
    "उत्तर प्रदेश अधीनस्थ सेवा चयन आयोग राज्य सरकार के विभिन्न विभागों में भर्ती के लिए परीक्षाएँ आयोजित करता है। हिंदी टाइपिंग में न्यूनतम गति पच्चीस शब्द प्रति मिनट निर्धारित की गई है।",
    "उत्तर प्रदेश की सरकारी नौकरियों में हिंदी टाइपिंग एक महत्वपूर्ण कौशल है। कृतिदेव फ़ॉन्ट में टाइपिंग का अभ्यास प्रतिदिन करना चाहिए।",
    "उत्तर प्रदेश पुलिस विभाग में उप निरीक्षक के पद पर भर्ती के लिए लिखित परीक्षा शारीरिक परीक्षण और टाइपिंग कौशल परीक्षा आयोजित की जाती है। नियमित अभ्यास से गति और सटीकता दोनों में सुधार होता है।",
    "मध्य प्रदेश पुलिस विभाग में सहायक उप निरीक्षक के पद पर भर्ती एक सम्मानजनक अवसर है। इस पद के लिए हिंदी टाइपिंग की परीक्षा तीस मिनट की होती है।"
  ]
};

window.LIVE_SCHEDULE = [
  {id:1, exam:"UPSSSC 2026",     lang:"English",               timeSlot:"06:00 AM - 10:00 PM", free:true, duration:5,  backspace:"Limited Backspace", passKey:'english', passIdx:0},
  {id:2, exam:"UPSSSC 2026",     lang:"Hindi → Mangal Unicode", timeSlot:"06:00 AM - 10:00 PM",free:true, duration:5,  backspace:"Limited Backspace", passKey:'hindi',   passIdx:0},
  {id:3, exam:"UPSSSC 2026",     lang:"Hindi → Krutidev",      timeSlot:"06:00 AM - 10:00 PM", free:true, duration:5,  backspace:"Limited Backspace", passKey:'hindi',   passIdx:1},
  {id:4, exam:"UP Police ASI/SI",lang:"Hindi → Mangal Unicode", timeSlot:"06:00 AM - 11:00 PM",free:true, duration:15, backspace:"Fully Allowed",     passKey:'hindi',   passIdx:2},
  {id:5, exam:"UP Police ASI/SI",lang:"English",                timeSlot:"06:00 AM - 11:00 PM", free:true, duration:15, backspace:"Fully Allowed",     passKey:'english', passIdx:1},
  {id:6, exam:"RRB NTPC",        lang:"English",                timeSlot:"07:00 AM - 10:00 PM", free:true, duration:10, backspace:"Limited Backspace", passKey:'english', passIdx:2},
  {id:7, exam:"MP Police ASI",   lang:"Hindi → Mangal Unicode", timeSlot:"11:00 AM - 03:00 PM",free:true, duration:30, backspace:"Fully Allowed",     passKey:'hindi',   passIdx:3},
  {id:8, exam:"SSC CGL",         lang:"English",                timeSlot:"08:00 AM - 11:00 PM", free:true, duration:10, backspace:"Word-by-Word",      passKey:'english', passIdx:3}
];

window.EXAM_PROFILES = {
  'SSC CGL':       { engWPM:35, hinWPM:30, time:10, backspace:'Word-by-Word', netFormula:'ssc'   },
  'SSC CHSL':      { engWPM:35, hinWPM:30, time:10, backspace:'Word-by-Word', netFormula:'ssc'   },
  'RRB NTPC':      { engWPM:30, hinWPM:25, time:10, backspace:'Limited',      netFormula:'rrb'   },
  'UP Police ASI/SI':{ engWPM:25,hinWPM:25,time:15, backspace:'Fully Allowed',netFormula:'upsssc'},
  'UPSSSC 2026':   { engWPM:30, hinWPM:25, time:5,  backspace:'Limited',      netFormula:'upsssc'},
  'MP Police ASI': { engWPM:30, hinWPM:25, time:30, backspace:'Fully Allowed',netFormula:'upsssc'},
  'Allahabad HC':  { engWPM:35, hinWPM:30, time:10, backspace:'Limited',      netFormula:'court' }
};

window.EXAM_RULES = {
  ssc_eng:    {name:'SSC CGL — English',    time:10, lang:'english', backspace:'word', highlight:'none',  minWPM:35, info:['⏱ 10 Min','🎯 35 WPM','⌫ Word-by-Word']},
  ssc_hindi:  {name:'SSC CGL — Hindi',      time:10, lang:'hindi',   backspace:'word', highlight:'none',  minWPM:30, info:['⏱ 10 Min','🎯 30 WPM','⌫ Word-by-Word']},
  chsl_eng:   {name:'SSC CHSL — English',   time:10, lang:'english', backspace:'word', highlight:'none',  minWPM:35, info:['⏱ 10 Min','🎯 35 WPM']},
  chsl_hindi: {name:'SSC CHSL — Hindi',     time:10, lang:'hindi',   backspace:'word', highlight:'none',  minWPM:30, info:['⏱ 10 Min','🎯 30 WPM']},
  rrb_eng:    {name:'RRB NTPC — English',   time:10, lang:'english', backspace:'full', highlight:'none',  minWPM:30, info:['⏱ 10 Min','🎯 30 WPM']},
  rrb_hindi:  {name:'RRB NTPC — Hindi',     time:10, lang:'hindi',   backspace:'full', highlight:'none',  minWPM:25, info:['⏱ 10 Min','🎯 25 WPM']},
  upsssc_eng: {name:'UPSSSC — English',     time:10, lang:'english', backspace:'word', highlight:'none',  minWPM:30, info:['⏱ 5-10 Min','🎯 30 WPM']},
  upsssc_hindi:{name:'UPSSSC — Hindi',      time:10, lang:'hindi',   backspace:'word', highlight:'none',  minWPM:25, info:['⏱ 5-10 Min','🎯 25 WPM']},
  ahc_hindi:  {name:'Allahabad HC — Hindi', time:10, lang:'hindi',   backspace:'word', highlight:'error', minWPM:30, info:['⏱ 10 Min','🎯 30 WPM']},
  ahc_eng:    {name:'Allahabad HC — English',time:10,lang:'english', backspace:'word', highlight:'error', minWPM:35, info:['⏱ 10 Min','🎯 35 WPM']}
};

window.liveResults = [];
let admLoggedIn = false;
window.getAdmLoggedIn = () => admLoggedIn;
window.setAdmLoggedIn = (v) => { admLoggedIn = v; };
window.admCurrentTab = 0;
window.admView = 'analytics'; // 'analytics' or 'passages' — which screen shows after admin login

// ── Unique anonymous device ID (for active-user tracking, no login needed) ──
window.getDeviceId = function(){
  try {
    let id = localStorage.getItem('atm_device_id');
    if(!id){
      id = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,10);
      localStorage.setItem('atm_device_id', id);
    }
    return id;
  } catch(e){
    if(!window._fallbackDeviceId) window._fallbackDeviceId = 'dev_' + Date.now() + '_' + Math.random().toString(36).slice(2,10);
    return window._fallbackDeviceId;
  }
};

// Safe key for Firebase (no dots/# etc allowed in keys) — used to store user by email
window.emailToKey = function(email){
  return (email||'').toLowerCase().replace(/[.#$\[\]\/]/g, '_');
};

window.calcNet = function(gross, errors, backspaceCount, formula){
  if(formula==='ssc')    return Math.max(0, gross - (errors * 10));
  if(formula==='rrb')    return Math.max(0, gross - (errors * 2));
  if(formula==='upsssc') return Math.max(0, gross - errors);
  if(formula==='court')  return Math.max(0, gross - (errors * 5));
  return Math.max(0, gross - errors);
};

// ── Session save/load (sessionStorage — same tab) ──────────
window.saveSession = function(){
  try {
    sessionStorage.setItem('atm', JSON.stringify({
      loggedIn:APP.loggedIn, name:APP.name, email:APP.email, isPro:APP.isPro,
      liveResults:window.liveResults
    }));
  } catch(e){}
};
window.loadSession = function(){
  try {
    const s = JSON.parse(sessionStorage.getItem('atm')||'{}');
    if(s.loggedIn){ APP.loggedIn=true; APP.name=s.name||''; APP.email=s.email||''; APP.isPro=s.isPro||false; }
    if(s.liveResults) window.liveResults = s.liveResults;
  } catch(e){}
};

window.escHtml = function(str){ return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); };
