/* 3050파크골프클럽 홈페이지 — app.js
   firebase-config.js 에 설정값이 있으면 Firebase(Firestore)로, 없으면 체험 모드(브라우저 저장)로 동작합니다. */
(function () {
'use strict';
var CLUB = { name: '3050파크골프클럽', bank: '새마을금고', account: '03040507777', holder: '3050파크골프(송현호)', band: 'https://www.band.us/band/100365563/post', kakao: 'https://open.kakao.com/o/glAz313h' };
var CFG = window.FIREBASE_CONFIG || {};
var DEMO = !CFG.apiKey;
var $app = document.getElementById('app');
var DEFAULT_ROLES = ['단장', '사무장', '총무', '경기위원', '고문', '정회원', '신입'];
var COLORS = ['#1F6B4A', '#2C5FA8', '#C42B21', '#6B4FA0', '#B7791F', '#0F4A37', '#A8456B'];

/* ---------- 유틸 ---------- */
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function nl(s) { return esc(s).replace(/\n/g, '<br>'); }
function pad(n) { return (n < 10 ? '0' : '') + n; }
function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
function av(name, size) { size = size || 40; var c = COLORS[hash(name || '?') % COLORS.length]; return '<div class="av" style="width:' + size + 'px;height:' + size + 'px;font-size:' + Math.round(size * .38) + 'px;background:' + c + '">' + esc((name || '?').charAt(0)) + '</div>'; }
var WD = ['일', '월', '화', '수', '목', '금', '토'];
function fdate(iso) { var d = new Date(iso); return d.getFullYear() + '.' + (d.getMonth() + 1) + '.' + d.getDate() + '(' + WD[d.getDay()] + ') ' + (d.getHours() < 12 ? '오전 ' : '오후 ') + (d.getHours() % 12 || 12) + ':' + pad(d.getMinutes()); }
function fshort(iso) { var d = new Date(iso); return d.getFullYear() + '.' + (d.getMonth() + 1) + '.' + d.getDate() + '(' + WD[d.getDay()] + ')'; }
function ago(ts) { var s = (Date.now() - ts) / 1000; if (s < 60) return '방금'; if (s < 3600) return Math.floor(s / 60) + '분 전'; if (s < 86400) return Math.floor(s / 3600) + '시간 전'; if (s < 604800) return Math.floor(s / 86400) + '일 전'; var d = new Date(ts); return (d.getMonth() + 1) + '.' + d.getDate(); }
function dday(iso) { var a = new Date(iso); a.setHours(0, 0, 0, 0); var b = new Date(); b.setHours(0, 0, 0, 0); var n = Math.round((a - b) / 86400000); return n === 0 ? 'D-DAY' : n > 0 ? 'D-' + n : '종료'; }
function ym(d) { d = d || new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1); }
function toast(m) { var t = document.getElementById('toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove('on'); }, 2400); }
function confetti(x, y) { var cs = ['#F2A541', '#1F6B4A', '#C42B21', '#2C5FA8', '#ffffff']; for (var i = 0; i < 26; i++) { var e = document.createElement('i'); e.className = 'confetti'; e.style.left = x + 'px'; e.style.top = y + 'px'; e.style.background = cs[i % cs.length]; e.style.setProperty('--dx', (Math.random() * 300 - 150) + 'px'); e.style.setProperty('--dy', (Math.random() * -260 + 60) + 'px'); document.body.appendChild(e); setTimeout(function (n) { n.remove(); }.bind(null, e), 1150); } }
var I = {
  bell: '<path d="M6 17V11a6 6 0 0 1 12 0v6l2 2H4z"/><path d="M10 21h4"/>',
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>', flag: '<path d="M6 21V4"/><path d="M6 4l12 4-12 5"/>',
  trophy: '<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4M12 14v4M8 21h8"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>', user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 15-5 16 0"/>',
  pin: '<path d="M12 21s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  won: '<path d="M4 7l3 10 3-10 2 10 2-10 3 10 3-10M3 11h18"/>', check: '<path d="M5 12l5 5 9-10"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
  heart: '<path d="M12 20s-8-5-8-11a4.500 4.500 0 0 1 8-2 4.500 4.500 0 0 1 8 2c0 6-8 11-8 11z"/>', image: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 16l5-5 5 5 3-3 5 5"/>',
  users: '<circle cx="9" cy="8" r="3.500"/><path d="M2 20c1-5 13-5 14 0"/><path d="M16 5a3.500 3.500 0 0 1 0 7M18 15c2 1 3.500 2.500 4 5"/>', plus: '<path d="M12 5v14M5 12h14"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>', copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>',
  shuffle: '<path d="M3 7h4l10 10h4M3 17h4l3-3M14 10l3-3h4M18 4l3 3-3 3M18 14l3 3-3 3"/>', pen: '<path d="M4 20l4-1L20 7l-3-3L5 16z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M16 16l5 5"/>', gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>', out: '<path d="M10 4H5v16h5M14 8l4 4-4 4M18 12H9"/>', back: '<path d="M19 12H5M11 6l-6 6 6 6"/>'
};
function ic(n, s) { s = s || 20; return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink:0">' + I[n] + '</svg>'; }

/* ---------- 데이터 계층 ---------- */
var Store;
function LocalStore() {
  var KEY = 'club3050_demo_v4';
  var db; try { db = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { db = null; }
  if (!db) { db = seed(); save(); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { } }
  function col(c) { return db[c] || (db[c] = {}); }
  return {
    init: function () { return Promise.resolve(); },
    get: function (c, id) { var d = col(c)[id]; return Promise.resolve(d ? Object.assign({ id: id }, d) : null); },
    list: function (c, o) { o = o || {}; var a = Object.keys(col(c)).map(function (id) { return Object.assign({ id: id }, col(c)[id]); }); if (o.where) a = a.filter(function (d) { return d[o.where[0]] === o.where[1]; }); if (o.orderBy) a.sort(function (x, y) { return (x[o.orderBy] > y[o.orderBy] ? 1 : -1) * (o.desc ? -1 : 1); }); if (o.limit) a = a.slice(0, o.limit); return Promise.resolve(a); },
    set: function (c, id, data, merge) { col(c)[id] = merge ? Object.assign({}, col(c)[id], data) : data; save(); return Promise.resolve(); },
    add: function (c, data) { var id = 'd' + Date.now() + Math.floor(Math.random() * 1000); col(c)[id] = data; save(); return Promise.resolve(id); },
    del: function (c, id) { delete col(c)[id]; save(); return Promise.resolve(); },
    getSession: function () { return Promise.resolve(localStorage.getItem(KEY + '_me')); },
    setSession: function (mid) { if (mid) localStorage.setItem(KEY + '_me', mid); else localStorage.removeItem(KEY + '_me'); return Promise.resolve(); },
    reset: function () { localStorage.removeItem(KEY); localStorage.removeItem(KEY + '_me'); }
  };
}
function FireStore() {
  var F, fs, uid;
  var V = '10.12.2', B = 'https://www.gstatic.com/firebasejs/' + V + '/';
  return {
    init: function () {
      return Promise.all([import(B + 'firebase-app.js'), import(B + 'firebase-auth.js'), import(B + 'firebase-firestore.js')]).then(function (m) {
        var app = m[0].initializeApp(CFG); F = m[2]; fs = F.getFirestore(app); var auth = m[1].getAuth(app);
        return new Promise(function (res, rej) { m[1].onAuthStateChanged(auth, function (u) { if (u) { uid = u.uid; res(); } else m[1].signInAnonymously(auth).catch(rej); }); });
      });
    },
    get: function (c, id) { return F.getDoc(F.doc(fs, c, id)).then(function (s) { return s.exists() ? Object.assign({ id: s.id }, s.data()) : null; }); },
    list: function (c, o) { o = o || {}; var q = [F.collection(fs, c)]; if (o.where) q.push(F.where(o.where[0], '==', o.where[1])); if (o.orderBy && !o.where) q.push(F.orderBy(o.orderBy, o.desc ? 'desc' : 'asc')); if (o.limit && !o.where) q.push(F.limit(o.limit)); return F.getDocs(F.query.apply(null, q)).then(function (s) { var a = s.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); }); if (o.where && o.orderBy) a.sort(function (x, y) { return (x[o.orderBy] > y[o.orderBy] ? 1 : -1) * (o.desc ? -1 : 1); }); return a; }); },
    set: function (c, id, data, merge) { return F.setDoc(F.doc(fs, c, id), data, { merge: !!merge }); },
    add: function (c, data) { return F.addDoc(F.collection(fs, c), data).then(function (r) { return r.id; }); },
    del: function (c, id) { return F.deleteDoc(F.doc(fs, c, id)); },
    getSession: function () { return F.getDoc(F.doc(fs, 'sessions', uid)).then(function (s) { return s.exists() ? s.data().memberId : null; }); },
    setSession: function (mid) { return mid ? F.setDoc(F.doc(fs, 'sessions', uid), { memberId: mid, at: Date.now() }) : F.deleteDoc(F.doc(fs, 'sessions', uid)); }
  };
}
function seed() {
  var names = ['김민준', '이서연', '박지훈', '최유진', '정현우', '강수아', '조은호', '윤지아', '장도윤', '임하린', '한시우', '오채원', '서준영', '신예린', '권태양', '황보라'];
  var ages = ['30대', '40대', '50대'];
  var members = {}, priv = {}, ids = [];
  names.forEach(function (n, i) { var l4 = String(1000 + i * 137).slice(-4); var id = n + '_' + l4; ids.push(id); members[id] = { name: n, last4: l4, age: ages[i % 3], region: '대구', status: 'approved', admin: i < 2, role: i === 0 ? '단장' : i === 1 ? '사무장' : i === 2 ? '총무' : i === 3 ? '경기위원' : '정회원', joinPaid: i % 5 !== 4, joined: Date.now() - (400 - i * 20) * 86400000 }; priv[id] = { phone: '010-0000-' + l4 }; });
  members['신청자_9999'] = { name: '신청자', last4: '9999', age: '30대', region: '대구', status: 'pending', admin: false, role: '신입', joinPaid: false, joined: Date.now(), ref: '김민준' }; priv['신청자_9999'] = { phone: '010-0000-9999' };
  function firstSun(y, m) { var d = new Date(y, m, 1, 9, 0); while (d.getDay() !== 0) d.setDate(d.getDate() + 1); return d; }
  var now = new Date(), next = firstSun(now.getFullYear(), now.getMonth()); if (next < now) next = firstSun(now.getFullYear(), now.getMonth() + 1);
  var prev = firstSun(next.getFullYear(), next.getMonth() - 1), prev2 = firstSun(next.getFullYear(), next.getMonth() - 2);
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T09:00'; }
  function scores(k) { var s = {}; ids.slice(0, 12).forEach(function (id, i) { var f = 60 + ((i * 7 + k * 3) % 11), b = 59 + ((i * 5 + k) % 12); s[id] = { f: f, b: b }; }); return s; }
  var events = {
    e1: { title: (prev2.getMonth() + 1) + '월 정기월례회', date: iso(prev2), place: '영천 웨스트우드 파크골프장', fee: '25,000원', cap: 40, deadline: '', memo: '', scores: scores(1), hio: '' },
    e2: { title: (prev.getMonth() + 1) + '월 정기월례회', date: iso(prev), place: '영천 웨스트우드 파크골프장', fee: '25,000원', cap: 40, deadline: '', memo: '', scores: scores(2), hio: '박지훈 · A코스 7번 홀' },
    e3: { title: (next.getMonth() + 1) + '월 정기월례회', date: iso(next), place: '영천 웨스트우드 파크골프장', fee: '25,000원', cap: 40, deadline: '', memo: '집결 후 조 편성 발표, 라운드 종료 후 점심 식사가 있습니다.', scores: {}, hio: '' }
  };
  var rsvps = {}, rsvpN = 0; ids.slice(1, 11).forEach(function (id) { rsvps['e3_' + id] = { eventId: 'e3', memberId: id, name: members[id].name, st: 'yes', paid: rsvpN++ % 3 !== 0, at: Date.now() }; });
  var t = Date.now();
  var posts = {
    p1: { cat: '공지', authorId: ids[1], name: '이서연', body: '가입비와 월례회 참가비는 아래 계좌로 입금 부탁드립니다.\n새마을금고 03040507777 · 예금주 3050파크골프(송현호)', at: t - 5 * 86400000, likes: [ids[0], ids[2]], cc: 0, pin: true },
    p2: { cat: '번개', authorId: ids[2], name: '박지훈', body: '이번 주 토요일 오전 번개 라운드 하실 분! 4명 모이면 출발합니다.', at: t - 7200000, likes: [ids[3]], cc: 1 },
    p3: { cat: '자유', authorId: ids[3], name: '최유진', body: '지난 월례회 너무 즐거웠어요. 다음 달에도 맑은 날씨 기원합니다!', at: t - 86400000, likes: [], cc: 0, img: 'assets/course.jpg' }
  };
  var comments = { c1: { postId: 'p2', authorId: ids[4], name: '정현우', body: '저 참석합니다!', at: t - 3600000 } };
  var photos = { ph1: { src: 'assets/group.jpg', cap: '6월 정기월례회 단체 사진', name: '운영진', authorId: ids[0], at: t - 9e9 }, ph2: { src: 'assets/course.jpg', cap: '맑은 날의 라운드', name: '최유진', authorId: ids[3], at: t - 8e8 }, ph3: { src: 'assets/course_wide.jpg', cap: '그린 위에서', name: '김민준', authorId: ids[0], at: t - 7e8 } };
  var dues = {}; var paid = {}; ids.forEach(function (id, i) { if (i % 4 !== 3) paid[id] = true; }); dues[ym()] = { paid: paid };
  var all = {}; ids.forEach(function (id) { all[id] = true; }); var pm = new Date(); pm.setMonth(pm.getMonth() - 1); dues[ym(pm)] = { paid: all };
  return { members: members, members_private: priv, events: events, rsvps: rsvps, posts: posts, comments: comments, photos: photos, dues: dues, settings: { club: { joinFee: '35,000원', eventFee: '25,000원', roles: DEFAULT_ROLES.slice() } } };
}

/* ---------- 상태 ---------- */
var S = { me: null, tab: 'home', sub: {}, members: [], events: [], eventId: null, settings: {}, notifs: [], gn: {} };
function isAdmin() { return S.me && S.me.admin === true; }
function roleList() { return (S.settings.roles && S.settings.roles.length) ? S.settings.roles : DEFAULT_ROLES; }
function acct() { var a = (S.settings && S.settings.acct) || {}; return { bank: a.bank || CLUB.bank, account: a.account || CLUB.account, holder: a.holder || CLUB.holder }; }
function links() { var l = (S.settings && S.settings.links) || {}; return { band: l.band || CLUB.band, kakao: l.kakao || CLUB.kakao }; }
function channelCard() { var l = links(); return '<section class="stack rv"><div class="sec"><h2>함께 소통하는 곳</h2></div><div class="px" style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px"><a class="card press" href="' + esc(l.kakao) + '" target="_blank" rel="noopener" style="padding:16px;display:flex;flex-direction:column;gap:8px;text-decoration:none;color:var(--ink)"><span style="width:44px;height:44px;border-radius:14px;background:#FEE500;color:#3A1D1D;display:flex;align-items:center;justify-content:center">' + ic('chat', 22) + '</span><span class="b">카카오톡 단톡방</span><span class="s12 mute">빠른 공지와 실시간 대화</span></a><a class="card press" href="' + esc(l.band) + '" target="_blank" rel="noopener" style="padding:16px;display:flex;flex-direction:column;gap:8px;text-decoration:none;color:var(--ink)"><span style="width:44px;height:44px;border-radius:14px;background:var(--mint);color:var(--g);display:flex;align-items:center;justify-content:center">' + ic('users', 22) + '</span><span class="b">네이버 밴드</span><span class="s12 mute">사진과 지난 소식 모아 보기</span></a></div></section>'; }
function joinFee() { return S.settings.joinFee || ''; }
function accountBox(note) { return '<div class="row" style="border-radius:16px;background:var(--bg);padding:14px"><div class="grow"><div class="s12 mute">' + acct().bank + ' · 예금주 ' + acct().holder + '</div><div class="disp" style="font-size:22px;letter-spacing:1px">' + acct().account + '</div>' + (note ? '<div class="s12 mute">' + note + '</div>' : '') + '</div><button type="button" class="btn sm" data-act="copyAcc">' + ic('copy', 16) + '계좌 복사</button></div>'; }
function mname(id) { if (S.gn[id]) return S.gn[id]; var m = S.members.filter(function (x) { return x.id === id; })[0]; return m ? m.name : id.split('_')[0]; }
function upcoming() { var n = Date.now() - 6 * 3600000; return S.events.filter(function (e) { return new Date(e.date).getTime() >= n; }).sort(function (a, b) { return a.date > b.date ? 1 : -1; }); }
function past() { var n = Date.now() - 6 * 3600000; return S.events.filter(function (e) { return new Date(e.date).getTime() < n; }).sort(function (a, b) { return a.date < b.date ? 1 : -1; }); }
function total(s) { return (Number(s.f) || 0) + (Number(s.b) || 0); }
function board(ev) { return Object.keys(ev.scores || {}).map(function (id) { var s = ev.scores[id]; return { id: id, name: mname(id), f: s.f, b: s.b, t: total(s), h: s.h }; }).filter(function (r) { return r.t > 0; }).sort(function (a, b) { function last(r, n) { return r.h ? r.h.slice(r.h.length - n).reduce(function (p, c) { return p + c; }, 0) : 0; } return a.t - b.t || a.b - b.b || last(a, 6) - last(b, 6) || last(a, 3) - last(b, 3); }); }
function scoredEvents() { return S.events.filter(function (e) { return board(e).length; }).sort(function (a, b) { return a.date < b.date ? 1 : -1; }); }
function lastScored() { return scoredEvents()[0]; }
function loadCore() {
  return Promise.all([Store.list('events'), Store.get('settings', 'club'), S.me ? Store.list('members') : Promise.resolve([])]).then(function (r) { S.events = r[0]; S.settings = r[1] || {}; S.members = r[2]; S.gn = {}; S.events.forEach(function (e) { Object.keys(e.guests || {}).forEach(function (k) { S.gn[k] = e.guests[k]; }); }); return loadNotifs(); });
}

/* ---------- 알림 ---------- */
var NICON = { event: 'flag', team: 'shuffle', result: 'trophy', notice: 'chat', join: 'user', member: 'check', pay: 'won', score: 'pen' };
function notify(to, type, title, body, tab, eventId) { return Store.add('notifs', { to: to, type: type, title: title, body: body || '', tab: tab || 'home', eventId: eventId || '', at: Date.now(), by: S.me ? S.me.id : '' }).catch(function () { }); }
function unreadCount() { var seen = (S.me && S.me.notifSeenAt) || 0; return (S.notifs || []).filter(function (n) { return n.at > seen && n.by !== S.me.id; }).length; }
function loadNotifs() {
  if (!S.me) { S.notifs = []; return Promise.resolve(); }
  return Store.list('notifs', { orderBy: 'at', desc: true, limit: 40 }).then(function (ns) {
    var prevTop = S.notifs && S.notifs[0] ? S.notifs[0].at : null;
    S.notifs = ns.filter(function (n) { return n.to === 'all' || n.to === S.me.id || (n.to === 'admins' && isAdmin()); });
    if (prevTop !== null && S.notifs[0] && S.notifs[0].at > prevTop && S.notifs[0].by !== S.me.id && 'Notification' in window && Notification.permission === 'granted') { try { new Notification(S.notifs[0].title, { body: S.notifs[0].body, icon: 'assets/logo.svg' }); } catch (e) { } }
    var b = document.querySelector('.bell'); if (b) { var n = unreadCount(), i = b.querySelector('i'); if (n && !i) b.insertAdjacentHTML('beforeend', '<i>' + (n > 9 ? '9+' : n) + '</i>'); else if (n && i) i.textContent = n > 9 ? '9+' : n; else if (!n && i) i.remove(); }
  }).catch(function () { S.notifs = S.notifs || []; });
}
setInterval(function () { if (S.me && !document.hidden) loadNotifs(); }, 120000);
document.addEventListener('visibilitychange', function () { if (S.me && !document.hidden) loadNotifs(); });

/* ---------- 코스 · 카풀 · 결산 · 대화 · 배지 ---------- */
var DEFAULT_COURSES = [{ name: 'A코스', pars: [3, 4, 3, 4, 5, 3, 4, 3, 4] }, { name: 'B코스', pars: [5, 4, 3, 3, 3, 3, 4, 4, 4] }, { name: 'C코스', pars: [3, 3, 3, 4, 4, 4, 5, 3, 4] }];
var DEFAULT_PLACE = '영천 웨스트우드 파크골프장';
function courseList() { return (S.settings.courses && S.settings.courses.length) ? S.settings.courses : DEFAULT_COURSES; }
function defaultPlace() { return S.settings.place === undefined ? DEFAULT_PLACE : S.settings.place; }
function segsOf(ev) { if (ev.segs && ev.segs.length) return ev.segs; var old = (ev.pars || '').split(',').map(function (x) { return parseInt(x, 10); }).filter(function (x) { return x >= 3 && x <= 5; }); if (old.length === 18) return [{ name: '전반', pars: old.slice(0, 9) }, { name: '후반', pars: old.slice(9) }]; var c = courseList(); return [c[0], c[1] || c[0]]; }
function parsOf(ev) { return segsOf(ev).reduce(function (p, s) { return p.concat(s.pars); }, []); }
function won(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '원'; }
function feeNum(s) { return parseInt(String(s || '').replace(/[^0-9]/g, ''), 10) || 0; }
function ledgerRows(ev, rs) { var paid = (rs || []).filter(function (r) { return r.st === 'yes' && r.paid; }).length, rows = []; if (feeNum(ev.fee) && paid) rows.push({ kind: 'in', label: '참가비 ' + paid + '명 × ' + ev.fee, amount: paid * feeNum(ev.fee), auto: true }); return rows.concat(ev.ledger || []); }
function ledgerSum(rows) { var i = 0, o = 0; rows.forEach(function (r) { if (r.kind === 'in') i += r.amount; else o += r.amount; }); return { i: i, o: o, b: i - o }; }
function ledgerHtml(ev, rs) { var rows = ledgerRows(ev, rs), s = ledgerSum(rows); return '<div class="px card" style="padding:6px 16px">' + (rows.length ? rows.map(function (r, i) { var idx = i - (rows[0] && rows[0].auto ? 1 : 0); return '<div class="row" style="padding:10px 0;border-bottom:1px solid var(--line)"><span class="chip ' + (r.kind === 'in' ? '' : 'rose') + '" style="padding:3px 8px">' + (r.kind === 'in' ? '수입' : '지출') + '</span><span class="grow s13">' + esc(r.label) + '</span><span class="b">' + won(r.amount) + '</span>' + (isAdmin() && !r.auto ? '<button class="icb" style="width:36px;height:36px" data-act="ledgerDel" data-id="' + ev.id + '" data-i="' + idx + '" aria-label="항목 삭제">' + ic('trash', 16) + '</button>' : '') + '</div>'; }).join('') : '<p class="mute s13" style="padding:14px 0;text-align:center">아직 입력된 내역이 없습니다.</p>') + '<div class="row" style="padding:12px 0;justify-content:space-between"><span class="s13 mute">수입 ' + won(s.i) + ' · 지출 ' + won(s.o) + '</span><span class="disp" style="font-size:20px;color:' + (s.b < 0 ? 'var(--red)' : 'var(--g)') + '">잔액 ' + won(s.b) + '</span></div></div>'; }
function carpoolHtml(ev, cps) {
  return '<section class="stack"><div class="sec"><h2>카풀</h2><button data-act="cpNew" data-id="' + ev.id + '">' + ic('plus', 14) + '카풀 제공하기</button></div>' + (cps.length ? '<div class="px stack">' + cps.map(function (c) { var riders = c.riders || [], mineIn = riders.some(function (r) { return r.id === S.me.id; }), isDriver = c.driverId === S.me.id, left = (c.seats || 0) - riders.length; return '<div class="card rv" style="padding:14px 16px;display:flex;flex-direction:column;gap:8px"><div class="row">' + av(c.name, 36) + '<div class="grow"><div class="b">' + esc(c.name) + ' <span class="s12 mute">운전</span></div><div class="s13 mute">' + esc(c.from) + ' 출발 · ' + esc(c.time || '시간 협의') + '</div></div><span class="chip ' + (left > 0 ? '' : 'rose') + '">' + (left > 0 ? left + '자리 남음' : '만석') + '</span></div>' + (c.memo ? '<p class="s13">' + nl(c.memo) + '</p>' : '') + (riders.length ? '<div class="row" style="flex-wrap:wrap;gap:6px">' + riders.map(function (r) { return '<span class="chip">' + esc(r.name) + '</span>'; }).join('') + '</div>' : '') + '<div class="row">' + (isDriver || isAdmin() ? '<button class="btn ghost sm" style="color:var(--red)" data-act="cpDel" data-id="' + c.id + '">카풀 취소</button>' : '') + (!isDriver ? (mineIn ? '<button class="btn ghost sm grow" data-act="cpRide" data-id="' + c.id + '" data-on="0">탑승 취소</button>' : '<button class="btn sm grow" data-act="cpRide" data-id="' + c.id + '" data-on="1"' + (left > 0 ? '' : ' disabled') + '>같이 타기</button>') : '') + '</div></div>'; }).join('') + '</div>' : '<p class="px mute s13">등록된 카풀이 없습니다. 차량을 가져오신다면 빈자리를 나눠 주세요.</p>') + '</section>';
}
function chatHtml(ev, msgs) {
  return '<section class="stack"><div class="sec"><h2>참가자 대화</h2><span class="s13 mute">' + msgs.length + '개</span></div><div class="px card" style="padding:14px 16px;display:flex;flex-direction:column;gap:12px">' + (msgs.length ? msgs.slice(-30).map(function (m) { return '<div class="row" style="align-items:flex-start">' + av(m.name, 30) + '<div class="grow"><div class="s12"><b>' + esc(m.name) + '</b> <span class="mute">' + ago(m.at) + '</span></div><div class="s13" style="font-size:14px">' + nl(m.body) + '</div></div>' + (m.authorId === S.me.id || isAdmin() ? '<button class="icb" style="width:32px;height:32px;border:0;background:none" data-act="chatDel" data-id="' + m.id + '" aria-label="메시지 삭제">' + ic('x', 14) + '</button>' : '') + '</div>'; }).join('') : '<p class="mute s13">집결 시간, 준비물, 식사 등 이 월례회에 관한 이야기를 나눠 보세요.</p>') + '<form id="fChat" class="row" data-ev="' + ev.id + '"><label class="sr" for="chatIn">메시지</label><input id="chatIn" class="inp grow" maxlength="300" placeholder="메시지를 입력하세요" required><button class="btn sm">보내기</button></form></div></section>';
}
function badgesOf(id) {
  var evs = scoredEvents(), mine = evs.filter(function (e) { return (e.scores || {})[id]; }), n = mine.length, best = n ? Math.min.apply(null, mine.map(function (e) { return total(e.scores[id]); })) : 0;
  var wins = mine.filter(function (e) { return board(e)[0] && board(e)[0].id === id; }).length, podium = mine.filter(function (e) { return board(e).slice(0, 3).some(function (r) { return r.id === id; }); }).length;
  var hio = mine.some(function (e) { return ((e.scores[id].h) || []).indexOf(1) >= 0; }), under = mine.some(function (e) { var h = e.scores[id].h; return h && h.length === parsOf(e).length && total(e.scores[id]) <= parsOf(e).reduce(function (p, c) { return p + c; }, 0); });
  return [['첫 라운드', n >= 1, 'flag'], ['5라운드 개근', n >= 5, 'check'], ['10라운드 달성', n >= 10, 'check'], ['월례회 우승', wins >= 1, 'trophy'], ['시상대 3회', podium >= 3, 'trophy'], ['홀인원', hio, 'flag'], ['이븐파 이하', under, 'heart']].map(function (b) { return { name: b[0], on: b[1], icon: b[2] }; });
}
function badgesHtml(id) { var bs = badgesOf(id), got = bs.filter(function (b) { return b.on; }).length; return '<section class="stack"><div class="sec"><h2>나의 배지</h2><span class="s13 mute">' + got + ' / ' + bs.length + '</span></div><div class="px" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">' + bs.map(function (b) { return '<div class="card" style="padding:12px 4px;display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;' + (b.on ? '' : 'opacity:.4') + '"><span style="width:40px;height:40px;border-radius:50%;background:' + (b.on ? 'var(--sun)' : 'var(--mint)') + ';color:var(--ink);display:flex;align-items:center;justify-content:center">' + ic(b.icon, 20) + '</span><span class="s12 b">' + b.name + '</span></div>'; }).join('') + '</div></section>'; }

/* ---------- 카톡 등 인앱 브라우저 탈출 · 홈 화면 설치 ---------- */
var UA = navigator.userAgent || '';
var IS_IOS = /iPhone|iPad|iPod/i.test(UA), IS_ANDROID = /Android/i.test(UA);
var IS_KAKAO = /KAKAOTALK/i.test(UA);
var IS_INAPP = IS_KAKAO || /NAVER\(inapp|BAND\/|Instagram|FBAN|FBAV|Line\/|DaumApps|everytimeApp/i.test(UA);
var IS_STANDALONE = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
var SITE_URL = 'https://www.3050club.co.kr/';
var deferredInstall = null;
window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferredInstall = e; var c = document.getElementById('installCard'); if (c) c.style.display = ''; });
window.addEventListener('appinstalled', function () { deferredInstall = null; try { localStorage.setItem('c3050_installed', '1'); } catch (e) { } var c = document.getElementById('installCard'); if (c) c.remove(); toast('홈 화면에 추가되었습니다'); });
var IS_SAMSUNG = /SamsungBrowser/i.test(UA);
if (IS_SAMSUNG && 'serviceWorker' in navigator) { navigator.serviceWorker.getRegistrations().then(function (rs) { rs.forEach(function (r) { r.unregister(); }); }).catch(function () { }); }
if (!IS_SAMSUNG && 'serviceWorker' in navigator && location.protocol === 'https:') { window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () { }); }); }
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
function openExternal() {
  if (IS_KAKAO) { location.href = 'kakaotalk://web/openExternal?url=' + encodeURIComponent(SITE_URL); return; }
  if (IS_ANDROID) { location.href = 'intent://www.3050club.co.kr/#Intent;scheme=https;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;end'; return; }
  copyText(SITE_URL, '주소를 복사했습니다. 사파리를 열고 주소창에 붙여넣어 주세요');
}
function inAppBar() {
  if (!IS_INAPP) return '';
  return '<div style="background:var(--ink);color:#fff;padding:12px 20px;display:flex;flex-direction:column;gap:8px"><div class="s13"><b>' + (IS_KAKAO ? '카카오톡' : '앱') + ' 안에서 보고 계십니다.</b> 이 창은 ' + (IS_KAKAO ? '카톡' : '앱') + '을 닫으면 함께 닫히고 로그인도 유지되지 않습니다.</div><button class="btn sun sm" data-act="openExternal">' + ic('arrow', 16) + (IS_IOS ? '사파리로 열고 홈 화면에 저장하기' : '인터넷 앱으로 열고 홈 화면에 저장하기') + '</button></div>';
}
function installCard() {
  if (IS_STANDALONE || IS_INAPP || lsGet('c3050_installed') === '1') return '';
  var snooze = Number(lsGet('c3050_install_later') || 0); if (Date.now() - snooze < 7 * 86400000) return '';
  if (!IS_IOS && !IS_ANDROID) return '';
  return '<section class="px card rv" id="installCard" style="padding:16px;display:flex;flex-direction:column;gap:10px"><div class="row" style="gap:12px"><img src="icon-192.png" alt="" style="width:52px;height:52px;border-radius:14px;border:1px solid var(--line)"><div class="grow"><div class="b">휴대폰 홈 화면에 저장하기</div><div class="s13 mute">앱처럼 아이콘을 눌러 바로 열 수 있습니다. 설치 파일이 아니라 바로가기라 용량을 차지하지 않습니다.</div></div></div><div class="row"><button class="btn grow" data-act="installApp">' + ic('plus', 16) + '홈 화면에 추가</button><button class="btn ghost" data-act="installLater">나중에</button></div></section>';
}
function installGuide() {
  var steps = IS_IOS
    ? ['화면 아래 가운데의 <b>공유 버튼</b>(네모에서 화살표가 위로 나온 모양)을 누릅니다.', '목록을 아래로 내려 <b>홈 화면에 추가</b>를 누릅니다.', '오른쪽 위 <b>추가</b>를 누르면 홈 화면에 3050클럽 아이콘이 생깁니다.']
    : /SamsungBrowser/i.test(UA)
      ? ['화면 아래 오른쪽의 <b>줄 3개(≡) 메뉴</b>를 누릅니다.', '<b>현재 페이지 추가</b>(+ 모양)를 누른 뒤 <b>홈 화면</b>을 고릅니다.', '<b>추가</b>를 누르면 홈 화면에 3050클럽 바로가기 아이콘이 생깁니다. (앱 설치가 아니라 바로가기라서 보안 경고가 뜨지 않습니다)']
      : ['화면 오른쪽 위의 <b>점 3개(⋮) 메뉴</b>를 누릅니다.', '<b>홈 화면에 추가</b> 또는 <b>앱 설치</b>를 누릅니다.', '<b>추가(설치)</b>를 누르면 홈 화면에 3050클럽 아이콘이 생깁니다.'];
  sheet('<h3>홈 화면에 저장하는 방법</h3><p class="s13 mute">' + (IS_IOS ? '아이폰 사파리' : /SamsungBrowser/i.test(UA) ? '삼성 인터넷' : '크롬') + ' 기준입니다. 한 번만 해 두면 다음부터는 아이콘만 누르면 됩니다.</p><div class="stack" style="gap:12px">' + steps.map(function (s, i) { return '<div class="row" style="align-items:flex-start;gap:12px"><span style="width:32px;height:32px;border-radius:50%;background:var(--sun);color:var(--ink);font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">' + (i + 1) + '</span><span style="padding-top:4px">' + s + '</span></div>'; }).join('') + '</div><button class="btn block" data-act="closeSheet">확인</button>');
}

/* ---------- 공통 UI ---------- */
function header(t1, t2, dark) {
  return '<header class="top' + (dark ? ' dark' : '') + '"><img src="assets/logo.svg" alt="3050파크골프클럽 로고"><div class="tt"><div class="t1">' + t1 + '</div><div class="t2">' + t2 + '</div></div>' +
    (S.me ? '<button class="icb bell" data-act="notifOpen" aria-label="알림">' + ic('bell') + (unreadCount() ? '<i>' + (unreadCount() > 9 ? '9+' : unreadCount()) + '</i>' : '') + '</button>' + (isAdmin() ? '<button class="icb" data-act="go" data-tab="' + (dark ? 'home' : 'admin') + '" aria-label="' + (dark ? '홈으로' : '운영진 관리') + '">' + ic(dark ? 'home' : 'gear') + '</button>' : '') : '<button class="btn sm" data-act="login">로그인</button>') + '</header>';
}
function navbar() {
  var items = [['home', 'home', '홈'], ['meet', 'flag', '월례회'], ['rank', 'trophy', '랭킹'], ['talk', 'chat', '소통'], ['my', 'user', '마이']];
  return '<nav class="nav" aria-label="하단 메뉴">' + items.map(function (i) { return '<button data-act="go" data-tab="' + i[0] + '" class="' + (S.tab === i[0] ? 'on' : '') + '"' + (S.tab === i[0] ? ' aria-current="page"' : '') + '>' + ic(i[1], 22) + '<span>' + i[2] + '</span></button>'; }).join('') + '</nav>';
}
function demoBar() { return DEMO ? '<div class="demo"><span>체험 모드 · 이 기기에만 저장되는 샘플 데이터입니다</span>' + (S.me ? '' : '<button data-act="demoLogin">운영진으로 체험</button>') + '</div>' : ''; }
function footer() { return '<div class="ft"><span class="b">' + CLUB.name + '</span><span>입금 계좌 ' + acct().bank + ' ' + acct().account + ' (예금주 ' + acct().holder + ')</span><span><a href="' + esc(links().kakao) + '" target="_blank" rel="noopener">카카오톡 단톡방</a> · <a href="' + esc(links().band) + '" target="_blank" rel="noopener">네이버 밴드</a> · www.3050club.co.kr</span></div>'; }
function sheet(html) {
  closeSheet();
  var bg = document.createElement('div'); bg.className = 'sheet-bg'; bg.id = 'sheetbg';
  bg.innerHTML = '<div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>' + html + '</div>';
  bg.addEventListener('click', function (e) { if (e.target === bg) closeSheet(); });
  document.body.appendChild(bg); document.body.style.overflow = 'hidden';
  requestAnimationFrame(function () { bg.classList.add('on'); var f = bg.querySelector('input,textarea,select'); if (f) setTimeout(function () { f.focus(); }, 350); });
}
function closeSheet() { var b = document.getElementById('sheetbg'); if (b) { b.remove(); document.body.style.overflow = ''; } }
function needLogin() { if (S.me) return false; openLogin(); return true; }
function gate(title, desc) {
  return '<div class="px card" style="padding:28px 22px;text-align:center;display:flex;flex-direction:column;gap:12px;align-items:center"><div style="color:var(--g)">' + ic('users', 36) + '</div><h2 class="disp" style="font-size:24px;color:var(--g)">' + title + '</h2><p class="mute s13">' + desc + '</p><div class="row" style="width:100%"><button class="btn grow" data-act="login">로그인</button><button class="btn ghost grow" data-act="join">가입 신청</button></div></div>';
}

/* ---------- 홈 ---------- */
var cdTimer;
function vHome() {
  var ev = upcoming()[0], h = header('3050 파크골프클럽', '30 · 40 · 50 파크골프를 사랑하는 분들의 모임');
  h += '<main><section class="px hero rv"><img src="assets/group.jpg" alt="정기월례회 단체 사진"><div class="in"><div class="row" style="gap:6px"><span class="chip sun">젊은 파크골프</span><span class="chip w">NEW CONCEPT</span></div><h1>함께 치면<br>더 즐겁다, 3050</h1><div class="row" style="gap:8px">' +
    (S.me ? '<button class="btn w grow" data-act="go" data-tab="talk">소통하러 가기</button>' : '<button class="btn w grow" data-act="join">가입 신청</button>') + '<button class="btn sun grow" data-act="go" data-tab="meet">월례회 보기' + ic('arrow', 16) + '</button></div></div></section>' + installCard();
  if (ev) {
    h += '<section class="px next rv" id="nextcard"><div class="row" style="justify-content:space-between"><span class="s13 b" style="color:#CFE6D6">다음 월례회</span><span class="chip sun">' + dday(ev.date) + '</span></div><div><div class="disp" style="font-size:28px;line-height:1.2">' + esc(ev.title) + '</div><div class="row s13" style="gap:6px;color:#E6F1E8;margin-top:6px">' + ic('clock', 16) + fdate(ev.date) + '</div><div class="row s13" style="gap:6px;color:#E6F1E8;margin-top:4px">' + ic('pin', 16) + esc(ev.place || '장소 추후 공지') + '</div></div>' +
      '<div class="cd" data-cd="' + esc(ev.date) + '"><div><b>--</b><span>일</span></div><div><b>--</b><span>시간</span></div><div><b>--</b><span>분</span></div><div><b>--</b><span>초</span></div></div><div id="homeRsvp"></div></section>';
  } else h += '<section class="px card rv" style="padding:20px;text-align:center"><p class="b">예정된 월례회가 곧 등록됩니다</p><p class="mute s13">매월 정기 라운드 일정을 이곳에서 확인하세요.</p></section>';
  h += '<section class="px quick rv"><button data-act="go" data-tab="meet">' + ic('shuffle', 24) + '조 편성</button><button data-act="go" data-tab="rank">' + ic('trophy', 24) + '랭킹</button><button data-act="go" data-tab="my">' + ic('won', 24) + '회비</button><button data-act="gallery">' + ic('image', 24) + '갤러리</button></section>';
  var ls = lastScored();
  if (ls && S.me) { var top3 = board(ls).slice(0, 3); h += '<section class="stack rv"><div class="sec"><h2>최근 월례회 TOP 3</h2><button data-act="go" data-tab="rank">전체 보기' + ic('arrow', 14) + '</button></div><div class="px card" style="padding:4px 16px">' + top3.map(function (r, i) { return '<div class="row" style="padding:12px 0;gap:12px;' + (i < 2 ? 'border-bottom:1px solid var(--line)' : '') + '"><span class="disp" style="font-size:22px;width:24px;color:' + (i ? 'var(--ink)' : 'var(--red)') + '">' + (i + 1) + '</span>' + av(r.name, 38) + '<div class="grow"><div class="b">' + esc(r.name) + '</div><div class="s12 mute">' + esc(ls.title) + '</div></div><span class="disp" style="font-size:22px;color:var(--g)">' + r.t + '</span></div>'; }).join('') + '</div></section>'; }
  h += '<section class="stack rv"><div class="sec"><h2>3050은 이런 모임입니다</h2></div><div class="px stack">' +
    [['users', '30 · 40 · 50 또래 모임', '비슷한 세대가 모여 편하게 즐기는 젊은 파크골프 동호회입니다.'], ['flag', '매월 정기 월례회', '참석 신청부터 조 편성, 스코어 기록까지 홈페이지에서 한 번에.'], ['chat', '회원 전용 소통 공간', '번개 라운드 모집, 사진 공유, 공지 확인을 회원끼리만.']].map(function (f) { return '<div class="card row" style="padding:16px;gap:14px;align-items:flex-start"><div style="width:44px;height:44px;border-radius:14px;background:var(--mint);color:var(--g);display:flex;align-items:center;justify-content:center;flex-shrink:0">' + ic(f[0], 22) + '</div><div><div class="b">' + f[1] + '</div><div class="s13 mute">' + f[2] + '</div></div></div>'; }).join('') + '</div></section>';
  h += channelCard();
  h += '<section class="stack rv"><div class="sec"><h2>갤러리</h2><button data-act="gallery">앨범 보기' + ic('arrow', 14) + '</button></div><div class="px g3"><img src="assets/course.jpg" alt="라운드 풍경" loading="lazy"><img src="assets/group.jpg" alt="정기월례회 단체 사진" loading="lazy"><img src="assets/course_wide.jpg" alt="필드 위 회원들" loading="lazy"></div></section>';
  if (!S.me) h += '<section class="px rv" style="background:var(--ink);color:#fff;border-radius:22px;padding:24px;display:flex;flex-direction:column;gap:12px"><h2 class="disp" style="font-size:26px;line-height:1.2">파크골프,<br>같이 시작해요</h2><p class="s13" style="color:#C9D3CD">가입 신청 후 운영진 승인이 완료되면 이름과 휴대폰 뒷자리만으로 간편하게 로그인할 수 있습니다.</p><button class="btn sun" data-act="join">가입 신청하기</button></section>';
  h += footer() + '</main>';
  return h;
}
function afterHome() {
  var ev = upcoming()[0]; if (!ev) return;
  tick(); clearInterval(cdTimer); cdTimer = setInterval(tick, 1000);
  function tick() { var el = document.querySelector('[data-cd]'); if (!el) return clearInterval(cdTimer); var d = Math.max(0, new Date(el.getAttribute('data-cd')) - Date.now()), b = el.querySelectorAll('b'), v = [Math.floor(d / 86400000), Math.floor(d / 3600000) % 24, Math.floor(d / 60000) % 60, Math.floor(d / 1000) % 60]; for (var i = 0; i < 4; i++) b[i].textContent = pad(v[i]); }
  var box = document.getElementById('homeRsvp');
  if (!S.me) { box.innerHTML = '<button class="btn w block" data-act="login">로그인하고 참석 신청</button>'; return; }
  Store.list('rsvps', { where: ['eventId', ev.id] }).then(function (rs) {
    var yes = rs.filter(function (r) { return r.st === 'yes'; }), mine = rs.filter(function (r) { return r.memberId === S.me.id; })[0];
    box.innerHTML = '<div class="row" style="margin-bottom:14px"><div class="row" style="gap:0">' + yes.slice(0, 4).map(function (r, i) { return '<div style="margin-left:' + (i ? -8 : 0) + 'px;border:2px solid var(--g);border-radius:50%">' + av(r.name, 30) + '</div>'; }).join('') + '</div><span class="s13 grow" style="color:#E6F1E8">' + yes.length + '명 참석' + (ev.cap ? ' · 정원 ' + ev.cap + '명' : '') + '</span></div>' +
      '<div class="row" style="gap:8px"><button class="btn ' + (mine && mine.st === 'yes' ? 'sun' : 'w') + ' grow" data-act="rsvp" data-ev="' + ev.id + '" data-st="yes">' + ic('check', 18) + (mine && mine.st === 'yes' ? '참석 신청 완료' : '참석할게요') + '</button><button class="btn line" data-act="rsvp" data-ev="' + ev.id + '" data-st="no"' + (mine && mine.st === 'no' ? ' style="background:var(--gd)"' : '') + '>불참</button></div>';
  });
}

/* ---------- 월례회 ---------- */
function vMeet() {
  var h = header('월례회', '정기 라운드 일정 · 참석 신청 · 조 편성');
  if (S.eventId) return h + '<main id="evDetail"><div class="spin"></div></main>';
  var sub = S.sub.meet || 'up', list = sub === 'up' ? upcoming() : past();
  h += '<main><div class="tabs"><button class="tab ' + (sub === 'up' ? 'on' : '') + '" data-act="sub" data-k="meet" data-v="up">예정</button><button class="tab ' + (sub === 'past' ? 'on' : '') + '" data-act="sub" data-k="meet" data-v="past">지난 월례회</button>' + (isAdmin() ? '<button class="tab" data-act="evEdit" style="margin-left:auto;color:var(--g);border-color:var(--g)">' + ic('plus', 14) + ' 월례회 등록</button>' : '') + '</div><div class="px stack">';
  if (!list.length) h += '<div class="card" style="padding:28px;text-align:center" class="mute">' + (sub === 'up' ? '예정된 월례회가 없습니다.' : '지난 월례회 기록이 없습니다.') + '</div>';
  list.forEach(function (e, i) {
    h += '<button class="card rv press" data-act="evOpen" data-id="' + e.id + '" style="padding:0;overflow:hidden;text-align:left;display:block;width:100%">' + (sub === 'up' && i === 0 ? '<img src="assets/course_wide.jpg" alt="" style="width:100%;height:150px;object-fit:cover">' : '') + '<div style="padding:16px;display:flex;flex-direction:column;gap:8px"><div class="row" style="gap:6px">' + (sub === 'up' ? '<span class="chip sun">' + dday(e.date) + '</span><span class="chip">신청 접수 중</span>' : '<span class="chip">' + (board(e).length ? '결과 등록' : '종료') + '</span>') + '</div><div class="disp" style="font-size:22px">' + esc(e.title) + '</div><div class="row s13 mute" style="gap:6px">' + ic('clock', 16) + fdate(e.date) + '</div><div class="row s13 mute" style="gap:6px">' + ic('pin', 16) + esc(e.place || '장소 추후 공지') + '</div></div></button>';
  });
  return h + '</div></main>';
}
function teamOf(ev, id) { var r = -1; (ev.teams || []).forEach(function (t, i) { if (t.m.indexOf(id) >= 0) r = i; }); return r; }
function cardId(ev, no) { return ev.id + '_g' + no; }
function cardState(c) { return !c ? ['미입력', 'rose'] : c.submitted ? ['제출 완료', ''] : ['입력 중', 'sun']; }
function afterMeet() {
  if (!S.eventId) return;
  var ev = S.events.filter(function (e) { return e.id === S.eventId; })[0], box = document.getElementById('evDetail');
  if (!ev) { S.eventId = null; return render(); }
  Promise.all([S.me ? Store.list('rsvps', { where: ['eventId', ev.id] }) : Promise.resolve([]), S.me ? Store.list('scorecards', { where: ['eventId', ev.id] }) : Promise.resolve([]), S.me ? Store.list('carpools', { where: ['eventId', ev.id], orderBy: 'at' }) : Promise.resolve([]), S.me ? Store.list('comments', { where: ['postId', 'ev_' + ev.id], orderBy: 'at' }) : Promise.resolve([])]).then(function (rr) {
    var rs = rr[0], cards = {}; rr[1].forEach(function (c) { cards[c.groupNo] = c; }); S._cards = cards; S._rsvps = rs;
    var yes = rs.filter(function (r) { return r.st === 'yes'; }), mine = S.me && rs.filter(function (r) { return r.memberId === S.me.id; })[0], st = mine ? mine.st : '', isUp = new Date(ev.date).getTime() >= Date.now() - 6 * 3600000, bd = board(ev);
    var full = ev.cap && yes.length >= ev.cap, locked = rr[1].length > 0, teams = ev.teams || [], pub = ev.teamsPub !== false, showTeams = teams.length && (pub || isAdmin());
    var stateChip = ev.done ? '<span class="chip">결과 확정</span>' : ev.closed ? '<span class="chip rose">신청 마감</span>' : full ? '<span class="chip rose">정원 마감</span>' : isUp ? '<span class="chip">신청 접수 중</span>' : '';
    var h = '<div class="px"><button class="btn ghost sm" data-act="evBack">' + ic('back', 16) + '목록</button></div><section class="px card" style="overflow:hidden"><img src="assets/course_wide.jpg" alt="파크골프장 전경" style="width:100%;height:170px;object-fit:cover"><div style="padding:18px;display:flex;flex-direction:column;gap:12px"><div class="row" style="gap:6px"><span class="chip sun">' + dday(ev.date) + '</span>' + stateChip + '</div><h1 class="disp" style="font-size:28px">' + esc(ev.title) + '</h1><div class="stack" style="gap:8px;font-size:14px"><div class="row" style="gap:8px"><span style="color:var(--g)">' + ic('clock', 18) + '</span>' + fdate(ev.date) + ' 집결</div><div class="row" style="gap:8px"><span style="color:var(--g)">' + ic('pin', 18) + '</span>' + esc(ev.place || '장소 추후 공지') + '</div>' + '<div class="row" style="gap:8px"><span style="color:var(--g)">' + ic('flag', 18) + '</span>' + parsOf(ev).length + '홀 · ' + esc(segsOf(ev).map(function (x) { return x.name; }).join(' → ')) + ' · PAR ' + parsOf(ev).reduce(function (p, c) { return p + c; }, 0) + '</div>' + (ev.fee ? '<div class="row" style="gap:8px"><span style="color:var(--g)">' + ic('won', 18) + '</span>참가비 ' + esc(ev.fee) + '</div>' : '') + (S.me ? '<div class="row" style="gap:8px"><span style="color:var(--g)">' + ic('users', 18) + '</span>' + yes.length + (ev.cap ? ' / ' + ev.cap : '') + '명 참석' + (ev.deadline ? ' · 신청 마감 ' + esc(ev.deadline) : '') + '</div>' : '') + '</div>' + (ev.memo ? '<p class="s13 mute">' + nl(ev.memo) + '</p>' : '') +
      (S.me && ev.cap ? '<div class="bar"><i style="width:0" data-w="' + Math.min(100, Math.round(yes.length / ev.cap * 100)) + '"></i></div>' : '');
    if (isUp && !ev.done) h += S.me ? '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">' + [['yes', '참석', 'check'], ['no', '불참', 'x'], ['maybe', '미정', 'clock']].map(function (o) { var dis = o[0] === 'yes' && st !== 'yes' && (ev.closed || full); return '<button class="btn ' + (st === o[0] ? '' : 'ghost') + '" data-act="rsvp" data-ev="' + ev.id + '" data-st="' + o[0] + '" aria-pressed="' + (st === o[0]) + '"' + (dis ? ' disabled' : '') + '>' + ic(o[2], 18) + (dis ? '마감' : o[1]) + '</button>'; }).join('') + '</div>' : '<button class="btn block" data-act="login">로그인하고 참석 신청</button>';
    if (S.me && st === 'yes' && ev.fee) h += '<div class="stack" style="gap:8px"><div class="row" style="justify-content:space-between"><span class="b s13">내 참가비 ' + esc(ev.fee) + '</span><span class="chip ' + (mine.paid ? '' : 'rose') + '">' + (mine.paid ? '입금 확인 완료' : '입금 확인 전') + '</span></div>' + (mine.paid ? '' : accountBox('입금자명은 회원 이름으로 부탁드립니다')) + '</div>';
    h += '</div></section>';
    if (isAdmin()) {
      var paidN = yes.filter(function (r) { return r.paid; }).length, subN = rr[1].filter(function (c) { return c.submitted; }).length;
      var steps = [['참가 신청', yes.length > 0, yes.length + '명'], ['입금 확인', yes.length > 0 && paidN === yes.length, paidN + '/' + yes.length], ['조 편성', teams.length > 0 && pub, teams.length ? teams.length + '개 조' + (pub ? '' : ' (미발표)') : '-'], ['스코어 제출', teams.length > 0 && subN === teams.length, subN + '/' + teams.length], ['결과 확정', !!ev.done, ev.done ? '완료' : '-']];
      var next = steps.filter(function (s) { return !s[1]; })[0];
      h += '<section class="stack"><div class="sec"><h2>운영 단계</h2><span class="s13 mute">' + (next ? '다음 작업: ' + next[0] : '모든 단계 완료') + '</span></div><div class="tabs">' + steps.map(function (s, i) { return '<span class="chip ' + (s[1] ? '' : 'rose') + '" style="padding:8px 12px">' + (i + 1) + '. ' + s[0] + ' ' + s[2] + '</span>'; }).join('') + '</div><div class="px" style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px">' +
        [['evEdit', 'pen', '월례회 수정'], ['rsvpAdd', 'plus', '참가자 직접 등록'], ['evClose', 'x', ev.closed ? '신청 다시 받기' : '신청 마감하기'], ['payOf', 'won', '참가비 확인'], ['teamAuto', 'shuffle', '조 자동 편성'], ['teamAddEmpty', 'plus', '빈 조 추가'], ['scoreEdit', 'pen', '간편 입력(합계만)'], ['finalize', 'trophy', '결과 확정']].map(function (b) { return '<button class="btn ghost sm" style="justify-content:flex-start" data-act="' + b[0] + '" data-id="' + ev.id + '">' + ic(b[1], 16) + b[2] + '</button>'; }).join('') + '</div></section>';
    }
    if (S.me) {
      h += '<section class="stack"><div class="sec"><h2>참석자 ' + yes.length + '명</h2>' + (isAdmin() && yes.length ? '<button data-act="copyList" data-id="' + ev.id + '">' + ic('copy', 14) + '명단 복사</button>' : '') + '</div>' + (yes.length ? '<div class="px" style="display:grid;grid-template-columns:repeat(5,1fr);gap:14px 6px">' + yes.map(function (r) { return '<div style="display:flex;flex-direction:column;align-items:center;gap:5px" class="rv">' + av(r.name, 46) + '<span class="s12 b">' + esc(r.name) + (r.guest ? '<span class="mute"> (외부)</span>' : '') + '</span></div>'; }).join('') + '</div>' : '<p class="px mute s13">아직 참석 신청한 회원이 없습니다. 첫 번째로 신청해 보세요.</p>') + '</section>';
      if (showTeams) {
        var un = yes.filter(function (r) { return teamOf(ev, r.memberId) < 0; });
        h += '<section class="stack"><div class="sec"><h2>조 편성</h2><button data-act="copyTeams" data-id="' + ev.id + '">' + ic('copy', 14) + '조편성 복사</button></div>' +
          (isAdmin() ? '<div class="px card" style="padding:12px 14px;display:flex;flex-direction:column;gap:10px"><div class="row" style="justify-content:space-between"><span class="s13 b">' + (pub ? '회원에게 발표된 조 편성입니다' : '아직 회원에게 보이지 않는 초안입니다') + '</span><span class="chip ' + (pub ? '' : 'rose') + '">' + (pub ? '발표됨' : '미발표') + '</span></div><p class="s12 mute">' + (locked ? '스코어 입력이 시작되어 조 편성이 잠겼습니다.' : '이름을 누르면 조장 지정·조 이동을 할 수 있습니다.') + '</p>' + (pub ? '' : '<button class="btn sm" data-act="teamPublish" data-id="' + ev.id + '">' + ic('check', 16) + '조 편성 발표하고 알림 보내기</button>') + '</div>' : '') +
          (isAdmin() && un.length ? '<div class="px card" style="padding:12px 14px"><div class="s13 b" style="color:var(--red);margin-bottom:8px">미배정 신청자 ' + un.length + '명</div><div class="row" style="flex-wrap:wrap;gap:6px">' + un.map(function (r) { return '<button class="chip rose" style="min-height:36px" data-act="teamMember" data-mid="' + esc(r.memberId) + '">' + esc(r.name) + '</button>'; }).join('') + '</div></div>' : '') +
          '<div class="px" style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px">' + teams.map(function (t, ti) {
            var c = cards[ti + 1], cs = cardState(c), canScore = !ev.done && (isAdmin() || (t.marker === S.me.id && !(c && c.submitted)));
            return '<div class="card team rv"><div class="row" style="justify-content:space-between"><span class="disp" style="font-size:18px;color:var(--g)">' + (ti + 1) + '조</span><span class="chip ' + cs[1] + '" style="padding:3px 8px">' + cs[0] + '</span></div>' + (t.tee ? '<span class="s12 mute">' + esc(t.tee) + '</span>' : '') + (t.m.length ? t.m.map(function (id) { return '<button class="m" ' + (isAdmin() && !locked ? 'data-act="teamMember" data-mid="' + esc(id) + '"' : 'disabled style="opacity:1"') + '>' + av(mname(id), 28) + '<span>' + esc(mname(id)) + '</span>' + (t.marker === id ? '<span class="chip sun" style="padding:2px 7px">조장</span>' : '') + (S.me.id === id ? '<span class="chip" style="padding:2px 7px">나</span>' : '') + '</button>'; }).join('') : '<span class="s12 mute">빈 조 — 미배정 신청자를 눌러 배정하세요</span>') +
              (t.m.length ? '<button class="btn ' + (canScore ? '' : 'ghost') + ' sm" data-act="cardOpen" data-id="' + ev.id + '" data-no="' + (ti + 1) + '">' + ic(canScore ? 'pen' : 'search', 14) + (canScore ? '스코어 입력' : '스코어 보기') + '</button>' : '') + '</div>';
          }).join('') + '</div><p class="px s12 mute">스코어는 각 조의 조장이 홀별로 입력해 제출하고, 운영진이 결과를 확정하면 랭킹에 반영됩니다.</p></section>';
      }
      if (bd.length) h += '<section class="stack"><div class="sec"><h2>대회 결과</h2><button data-act="rankOf" data-id="' + ev.id + '">랭킹에서 보기' + ic('arrow', 14) + '</button></div>' + rankTable(bd.slice(0, 5), 0) + (ev.hio ? '<div class="px card" style="padding:14px 16px"><span class="s12 b" style="color:var(--red)">홀인원</span><div class="b">' + esc(ev.hio) + '</div></div>' : '') + '</section>';
    }
    if (S.me) {
      if (!ev.done) h += carpoolHtml(ev, rr[2]);
      h += chatHtml(ev, rr[3]);
      if (isAdmin() || ev.ledgerPub) h += '<section class="stack"><div class="sec"><h2>결산 보고</h2>' + (isAdmin() ? '<button data-act="ledgerAdd" data-id="' + ev.id + '">' + ic('plus', 14) + '항목 추가</button>' : '') + '</div>' + ledgerHtml(ev, rs) + (isAdmin() ? '<div class="px row"><span class="chip ' + (ev.ledgerPub ? '' : 'rose') + '">' + (ev.ledgerPub ? '회원 공개 중' : '운영진만 보는 중') + '</span><button class="btn ghost sm grow" data-act="ledgerPub" data-id="' + ev.id + '">' + (ev.ledgerPub ? '공지 다시 올리기' : '회원에게 공개 · 공지 올리기') + '</button></div>' : '') + '</section>';
    }
    box.innerHTML = h; reveal();
    var fc = document.getElementById('fChat'); if (fc) fc.addEventListener('submit', function (e) { e.preventDefault(); var body = val('chatIn'); if (!body) return; Store.add('comments', { postId: 'ev_' + ev.id, authorId: S.me.id, name: S.me.name, body: body, at: Date.now() }).then(function () { render(true); }).catch(function () { toast('보내지 못했습니다'); }); });
    setTimeout(function () { var i = box.querySelector('.bar i'); if (i) i.style.width = i.getAttribute('data-w') + '%'; }, 80);
  });
}
function saveTeams(ev, msg) { return Store.set('events', ev.id, { teams: ev.teams, teamsPub: ev.teamsPub === true }, true).then(function () { closeSheet(); if (msg) toast(msg); render(true); }).catch(function () { toast('저장 권한이 없습니다'); }); }
function teamsText(ev) { return '[' + ev.title + ' 조 편성]\n' + fdate(ev.date) + (ev.place ? '\n' + ev.place : '') + '\n\n' + (ev.teams || []).map(function (t, i) { return (i + 1) + '조' + (t.tee ? ' (' + t.tee + ')' : '') + ': ' + t.m.map(function (id) { return mname(id) + (t.marker === id ? '(조장)' : ''); }).join(', '); }).join('\n'); }
function copyText(t, ok) { (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { toast(ok); }, function () { sheet('<h3>복사할 내용</h3><textarea class="inp" style="min-height:260px" readonly>' + esc(t) + '</textarea>'); }); }
function openCard(ev, no) {
  var t = ev.teams[no - 1], c = (S._cards || {})[no] || { scores: {} }, segs = segsOf(ev), pars = parsOf(ev), H = pars.length, editable = !ev.done && (isAdmin() || (t.marker === S.me.id && !c.submitted));
  function cell(id, hidx) { var v = (c.scores[id] || [])[hidx]; return editable ? '<input type="number" inputmode="numeric" min="1" max="10" class="sc" data-p="' + esc(id) + '" data-h="' + hidx + '" value="' + (v || '') + '" aria-label="' + esc(mname(id)) + ' ' + (hidx + 1) + '번째 홀">' : '<span class="sc ro" data-p="' + esc(id) + '" data-h="' + hidx + '">' + (v || '-') + '</span>'; }
  function seg(si) { var rows = ''; for (var i = 0; i < 9; i++) { var hx = si * 9 + i; rows += '<tr><th>' + (i + 1) + '</th><td class="par">' + pars[hx] + '</td>' + t.m.map(function (id) { return '<td>' + cell(id, hx) + '</td>'; }).join('') + '</tr>'; } return rows; }
  var head = '<tr><th>홀</th><th>PAR</th>' + t.m.map(function (id) { return '<th>' + esc(mname(id)) + '</th>'; }).join('') + '</tr>';
  sheet('<h3>' + no + '조 스코어카드</h3><p class="s13 mute">' + esc(ev.title) + ' · ' + H + '홀(' + esc(segs.map(function (s) { return s.name; }).join(' → ')) + ') · 조장 ' + esc(t.marker ? mname(t.marker) : '미지정') + (c.submitted ? ' · 제출 완료' : '') + '</p><div class="seg" id="scSeg">' + segs.map(function (s, i) { return '<button type="button" class="' + (i ? '' : 'on') + '" data-half="' + i + '">' + esc(s.name) + '</button>'; }).join('') + '</div><div style="overflow-x:auto">' + segs.map(function (s, i) { return '<table class="sct" id="scT' + i + '"' + (i ? ' style="display:none"' : '') + '><thead>' + head + '</thead><tbody>' + seg(i) + '</tbody></table>'; }).join('') + '</div><table class="sct"><tbody>' + segs.map(function (s, i) { return '<tr><th style="width:64px">' + esc(s.name) + '</th>' + t.m.map(function (id) { return '<td data-sum="' + i + '" data-p="' + esc(id) + '">-</td>'; }).join('') + '</tr>'; }).join('') + '<tr><th>합계</th>' + t.m.map(function (id) { return '<td class="b" style="color:var(--g)" data-sum="t" data-p="' + esc(id) + '">-</td>'; }).join('') + '</tr></tbody></table><p class="s12 mute">노란색 홀인원 · 초록색 버디 이하. 홀별 타수는 더블파까지만 입력됩니다.</p>' + (editable ? '<div class="row"><button class="btn ghost grow" id="scSave">임시 저장</button><button class="btn grow" id="scSubmit">제출하기</button></div>' : (isAdmin() && c.submitted && !ev.done ? '<button class="btn ghost block" id="scReopen">제출 취소하고 다시 입력</button>' : '')));
  var root = document.getElementById('sheetbg');
  function read() { var sc = {}; t.m.forEach(function (id) { sc[id] = []; for (var i = 0; i < H; i++) sc[id].push(0); }); root.querySelectorAll('.sc').forEach(function (el) { var v = Number(el.value !== undefined ? el.value : el.textContent) || 0, hx = +el.dataset.h; if (v > pars[hx] * 2) { v = pars[hx] * 2; if (el.value !== undefined) el.value = v; } sc[el.dataset.p][hx] = v; el.classList.toggle('hio', v === 1); el.classList.toggle('bd', v > 1 && v < pars[hx]); }); return sc; }
  function sums() { var sc = read(); root.querySelectorAll('[data-sum]').forEach(function (td) { var a = sc[td.dataset.p] || [], k = td.dataset.sum, v = 0; a.forEach(function (x, i) { if (k === 't' || Math.floor(i / 9) === +k) v += x; }); td.textContent = v || '-'; }); return sc; }
  sums(); root.addEventListener('input', sums);
  root.querySelectorAll('#scSeg button').forEach(function (b) { b.addEventListener('click', function () { root.querySelectorAll('#scSeg button').forEach(function (x) { x.classList.toggle('on', x === b); }); segs.forEach(function (s, i) { document.getElementById('scT' + i).style.display = String(i) === b.dataset.half ? '' : 'none'; }); }); });
  function save(submit) { var sc = sums(), miss = 0; t.m.forEach(function (id) { sc[id].forEach(function (v) { if (!v) miss++; }); }); if (submit && miss) return toast('아직 입력하지 않은 홀이 ' + miss + '개 있습니다'); if (submit && !confirm('제출하면 조장은 더 이상 수정할 수 없습니다. 제출할까요?')) return; Store.set('scorecards', cardId(ev, no), { eventId: ev.id, groupNo: no, markerId: t.marker || '', memberIds: t.m, scores: sc, submitted: !!submit, at: Date.now(), by: S.me.id }).then(function () { closeSheet(); toast(submit ? no + '조 스코어를 제출했습니다' : '임시 저장했습니다'); if (submit) notify('admins', 'score', no + '조 스코어 제출', ev.title + ' ' + no + '조 스코어카드가 제출되었습니다.', 'meet', ev.id); render(true); }).catch(function () { toast('저장 권한이 없습니다. 조장 또는 운영진만 입력할 수 있습니다'); }); }
  var a = document.getElementById('scSave'), b2 = document.getElementById('scSubmit'), r = document.getElementById('scReopen');
  if (a) a.addEventListener('click', function () { save(false); }); if (b2) b2.addEventListener('click', function () { save(true); });
  if (r) r.addEventListener('click', function () { Store.set('scorecards', cardId(ev, no), { submitted: false }, true).then(function () { closeSheet(); toast('다시 입력할 수 있습니다'); render(true); }); });
}
function autoTeams(ev, yesIds) {
  var avg = {}; past().forEach(function (e) { Object.keys(e.scores || {}).forEach(function (id) { var t = total(e.scores[id]); if (t) { (avg[id] = avg[id] || []).push(t); } }); });
  function a(id) { var x = avg[id]; return x ? x.reduce(function (p, c) { return p + c; }, 0) / x.length : 999; }
  var known = yesIds.filter(function (id) { return avg[id]; }).sort(function (x, y) { return a(x) - a(y); }), unk = yesIds.filter(function (id) { return !avg[id]; }).sort(function () { return Math.random() - .5; });
  var order = known.concat(unk), n = Math.max(1, Math.ceil(order.length / 4)), teams = []; for (var i = 0; i < n; i++) teams.push({ tee: (i + 1) + '번 홀 출발', m: [] });
  order.forEach(function (id, i) { var r = Math.floor(i / n), k = i % n; teams[r % 2 ? n - 1 - k : k].m.push(id); });
  return teams;
}

/* ---------- 랭킹 ---------- */
function rankTable(rows, offset, fcol) {
  return '<div class="px card" style="padding:10px 6px"><div class="rank-row s12 b mute" style="padding:6px 12px"><span>순위</span><span>회원</span><span style="text-align:center">' + (fcol ? fcol[0] : '전반') + '</span><span style="text-align:center">' + (fcol ? fcol[1] : '후반') + '</span><span style="text-align:right">' + (fcol ? fcol[2] : '합계') + '</span></div>' + rows.map(function (r, i) { return '<div class="rank-row rv' + (S.me && r.id === S.me.id ? ' me' : '') + '"><span class="disp mute" style="font-size:17px">' + (i + 1 + offset) + '</span><div class="row" style="gap:9px;min-width:0">' + av(r.name, 32) + '<span class="b" style="font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(r.name) + (S.me && r.id === S.me.id ? ' (나)' : '') + '</span></div><span class="s13 mute" style="text-align:center">' + r.f + '</span><span class="s13 mute" style="text-align:center">' + r.b + '</span><span class="disp" style="font-size:17px;text-align:right;color:var(--g)">' + r.t + '</span></div>'; }).join('') + '</div>';
}
function vRank() {
  var h = header('스코어 · 랭킹', '월례회 성적과 연간 누적 순위');
  if (!S.me) return h + '<main>' + gate('회원 전용 랭킹', '로그인하면 월례회 성적과 연간 순위를 볼 수 있습니다.') + '</main>';
  var sub = S.sub.rank || 'ev', scored = scoredEvents();
  h += '<main><div class="px seg">' + [['ev', '월례회별'], ['year', '연간 누적'], ['mine', '내 기록']].map(function (s) { return '<button class="' + (sub === s[0] ? 'on' : '') + '" data-act="sub" data-k="rank" data-v="' + s[0] + '">' + s[1] + '</button>'; }).join('') + '</div>';
  if (!scored.length) return h + '<div class="px card mute" style="padding:28px;text-align:center">아직 등록된 월례회 성적이 없습니다.<br>월례회가 끝나면 운영진이 스코어를 입력합니다.</div></main>';
  if (sub === 'ev') {
    var ev = scored.filter(function (e) { return e.id === S.sub.rankEv; })[0] || scored[0], bd = board(ev), p = [bd[1], bd[0], bd[2]], hs = [84, 116, 64];
    h += '<div class="tabs">' + scored.map(function (e) { return '<button class="tab ' + (e.id === ev.id ? 'on' : '') + '" data-act="sub" data-k="rankEv" data-v="' + e.id + '">' + esc(e.title) + '</button>'; }).join('') + '</div>' +
      '<section class="px" style="border-radius:24px;background:var(--g);padding:20px 16px 0;display:flex;flex-direction:column;gap:16px"><div class="row" style="justify-content:space-between;color:#fff"><span class="disp" style="font-size:20px">' + esc(ev.title) + '</span><span class="s12" style="color:#CFE6D6">' + fshort(ev.date) + '</span></div><div class="pod">' + p.map(function (r, i) { return r ? '<div>' + av(r.name, i === 1 ? 56 : 46) + '<span class="b" style="font-size:14px">' + esc(r.name) + '</span><div class="st' + (i === 1 ? ' first' : '') + '" style="height:' + hs[i] + 'px;animation-delay:' + (i === 1 ? 0 : .15) + 's"><span class="disp" style="font-size:30px;line-height:1">' + [2, 1, 3][i] + '</span><span class="s12 b">' + r.t + '타</span></div></div>' : '<div></div>'; }).join('') + '</div></section>' +
      (bd.length > 3 ? rankTable(bd.slice(3), 3) : '') + (ev.hio ? '<div class="px card" style="padding:16px"><span class="s12 b" style="color:var(--red)">홀인원</span><div class="disp" style="font-size:20px">' + esc(ev.hio) + '</div></div>' : '');
  } else if (sub === 'year') {
    var y = new Date().getFullYear(), agg = {};
    scored.filter(function (e) { return new Date(e.date).getFullYear() === y; }).forEach(function (e) { board(e).forEach(function (r) { var a = agg[r.id] = agg[r.id] || { id: r.id, name: r.name, n: 0, sum: 0, best: 999 }; a.n++; a.sum += r.t; a.best = Math.min(a.best, r.t); }); });
    var rows = Object.keys(agg).map(function (k) { var a = agg[k]; return { id: a.id, name: a.name, f: a.n, b: a.best, t: Math.round(a.sum / a.n * 10) / 10 }; }).sort(function (a, b) { return a.t - b.t; });
    h += '<p class="px s13 mute">' + y + '년 월례회 평균 타수 기준 순위입니다. 낮을수록 순위가 높습니다.</p>' + rankTable(rows, 0, ['참가', '최저', '평균']);
  } else {
    var mine = scored.map(function (e) { var bd = board(e), i = bd.map(function (r) { return r.id; }).indexOf(S.me.id); return i < 0 ? null : { e: e, r: bd[i], rank: i + 1, n: bd.length }; }).filter(Boolean);
    if (!mine.length) h += '<div class="px card mute" style="padding:28px;text-align:center">아직 내 기록이 없습니다. 다음 월례회에서 첫 기록을 남겨 보세요.</div>';
    else { var best = Math.min.apply(null, mine.map(function (m) { return m.r.t; })), mx = Math.max.apply(null, mine.map(function (m) { return m.r.t; }));
      h += '<section class="px" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">' + [[mine.length + '회', '참가'], [best + '타', '베스트'], [Math.round(mine.reduce(function (p, c) { return p + c.r.t; }, 0) / mine.length) + '타', '평균']].map(function (s) { return '<div class="card" style="padding:14px 0;text-align:center"><div class="disp" style="font-size:22px;color:var(--g)">' + s[0] + '</div><div class="s12 mute">' + s[1] + '</div></div>'; }).join('') + '</section><div class="px stack">' + mine.map(function (m) { return '<div class="card rv" style="padding:14px 16px;display:flex;flex-direction:column;gap:8px"><div class="row"><div class="grow"><div class="b">' + esc(m.e.title) + '</div><div class="s12 mute">' + fshort(m.e.date) + ' · ' + m.n + '명 중 ' + m.rank + '위</div></div><span class="disp" style="font-size:22px;color:var(--g)">' + m.r.t + '</span></div><div class="bar"><i style="width:' + Math.round((1 - (m.r.t - best) / Math.max(1, mx - best + 10)) * 100) + '%"></i></div></div>'; }).join('') + '</div>'; }
  }
  return h + '</main>';
}

/* ---------- 소통 ---------- */
var CATS = ['전체', '공지', '자유', '번개', '갤러리'];
function vTalk() {
  var h = header('소통', '공지 · 자유 · 번개 라운드 · 갤러리');
  if (!S.me) return h + '<main>' + gate('회원 전용 공간', '게시판과 갤러리는 승인된 회원만 이용할 수 있습니다.') + '</main>';
  var cat = S.sub.talk || '전체';
  h += '<main style="gap:16px"><div class="tabs">' + CATS.map(function (c) { return '<button class="tab ' + (cat === c ? 'on' : '') + '" data-act="sub" data-k="talk" data-v="' + c + '">' + c + '</button>'; }).join('') + '</div>' +
    '<div class="px row"><a class="btn ghost sm grow" style="background:#FEE500;border-color:#FEE500;color:#3A1D1D" href="' + esc(links().kakao) + '" target="_blank" rel="noopener">' + ic('chat', 16) + '카톡 단톡방 열기</a><a class="btn ghost sm grow" href="' + esc(links().band) + '" target="_blank" rel="noopener">' + ic('users', 16) + '밴드 열기</a></div><button class="px card row press" data-act="' + (cat === '갤러리' ? 'photoNew' : 'postNew') + '" style="padding:10px 12px;text-align:left">' + av(S.me.name, 36) + '<span class="grow mute" style="font-size:14px">' + (cat === '갤러리' ? '월례회·라운드 사진을 올려 주세요' : '회원들과 나누고 싶은 이야기를 적어주세요') + '</span><span style="width:44px;height:44px;border-radius:12px;background:var(--mint);color:var(--g);display:flex;align-items:center;justify-content:center">' + ic(cat === '갤러리' ? 'image' : 'pen', 20) + '</span></button><div id="feed"><div class="spin"></div></div></main>';
  return h;
}
function afterTalk() {
  if (!S.me) return; var cat = S.sub.talk || '전체', box = document.getElementById('feed');
  if (cat === '갤러리') return Store.list('photos', { orderBy: 'at', desc: true, limit: 30 }).then(function (ps) { S._photos = ps; box.innerHTML = ps.length ? '<div class="px g3">' + ps.map(function (p, i) { return '<button data-act="photoOpen" data-i="' + i + '" aria-label="' + esc(p.cap || '사진') + '" class="rv"><img src="' + esc(p.src) + '" alt="' + esc(p.cap || '') + '" loading="lazy"></button>'; }).join('') + '</div>' : '<p class="px mute" style="text-align:center;padding:30px 0">첫 사진을 올려 주세요.</p>'; reveal(); });
  Store.list('posts', { orderBy: 'at', desc: true, limit: 30 }).then(function (ps) {
    if (cat !== '전체') ps = ps.filter(function (p) { return p.cat === cat; });
    ps.sort(function (a, b) { return (b.pin ? 1 : 0) - (a.pin ? 1 : 0) || b.at - a.at; });
    box.innerHTML = ps.length ? '<div class="px stack" style="gap:12px">' + ps.map(postCard).join('') + '</div>' : '<p class="px mute" style="text-align:center;padding:30px 0">아직 글이 없습니다. 첫 글을 남겨 보세요.</p>'; reveal();
  });
}
function postCard(p) {
  var liked = (p.likes || []).indexOf(S.me.id) >= 0, mineOrAdmin = p.authorId === S.me.id || isAdmin();
  return '<article class="card rv" style="padding:16px;display:flex;flex-direction:column;gap:12px" id="post-' + p.id + '"><div class="row">' + av(p.name, 40) + '<div class="grow"><div class="b" style="font-size:14px">' + esc(p.name) + '</div><div class="s12 mute">' + (p.pin ? '고정됨' : ago(p.at)) + '</div></div><span class="chip ' + (p.cat === '공지' ? 'red' : p.cat === '번개' ? 'sun' : '') + '">' + esc(p.cat) + '</span></div><div style="line-height:1.6">' + nl(p.body) + '</div>' + (p.img ? '<img src="' + esc(p.img) + '" alt="게시글 사진" style="width:100%;max-height:320px;object-fit:cover;border-radius:16px" loading="lazy">' : '') +
    '<div class="row" style="gap:8px"><button class="btn ghost sm" style="border-radius:99px;' + (liked ? 'color:var(--red);border-color:var(--red)' : '') + '" data-act="like" data-id="' + p.id + '" aria-pressed="' + liked + '">' + ic('heart', 16) + '좋아요 ' + (p.likes || []).length + '</button><button class="btn ghost sm" style="border-radius:99px" data-act="cmOpen" data-id="' + p.id + '">' + ic('chat', 16) + '댓글 ' + (p.cc || 0) + '</button>' + (mineOrAdmin ? '<button class="icb" style="margin-left:auto" data-act="postDel" data-id="' + p.id + '" aria-label="글 삭제">' + ic('trash', 18) + '</button>' : '') + '</div></article>';
}
function shrink(file, max) {
  return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { var im = new Image(); im.onload = function () { var k = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', .72)); }; im.onerror = rej; im.src = r.result; }; r.onerror = rej; r.readAsDataURL(file); });
}

/* ---------- 마이 ---------- */
function vMy() {
  var h = header('마이페이지', '내 정보 · 가입비 · 참가비 · 회원 명부');
  if (!S.me) return h + '<main>' + gate('로그인이 필요합니다', '가입 승인 후 이름과 휴대폰 뒷자리 4자리로 로그인하세요.') + '</main>';
  return h + '<main id="myBox"><div class="spin"></div></main>';
}
function afterMy() {
  if (!S.me) return; var box = document.getElementById('myBox'), now = new Date(), months = [];
  for (var i = 4; i >= -1; i--) months.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
  Promise.all([Store.get('members', S.me.id), Store.list('rsvps', { where: ['memberId', S.me.id] })]).then(function (r) {
    if (r[0]) S.me = r[0];
    var myPays = r[1].filter(function (x) { return x.st === 'yes'; }).map(function (x) { return { r: x, e: S.events.filter(function (e) { return e.id === x.eventId; })[0] }; }).filter(function (x) { return x.e; }).sort(function (a, b) { return a.e.date < b.e.date ? 1 : -1; }).slice(0, 6);
    var att = r[1].filter(function (x) { return x.st === 'yes'; }).length, scored = S.events.filter(function (e) { return (e.scores || {})[S.me.id]; }), best = scored.length ? Math.min.apply(null, scored.map(function (e) { return total(e.scores[S.me.id]); })) : null, ls = lastScored(), myRank = ls ? board(ls).map(function (x) { return x.id; }).indexOf(S.me.id) + 1 : 0;
    var q = (S.sub.mq || '').trim(), list = S.members.filter(function (m) { return m.status === 'approved' && (!q || m.name.indexOf(q) >= 0); }).sort(function (a, b) { return (b.admin ? 1 : 0) - (a.admin ? 1 : 0) || (a.name > b.name ? 1 : -1); });
    box.innerHTML = '<section class="px" style="border-radius:24px;background:var(--g);color:#fff;padding:20px;display:flex;flex-direction:column;gap:16px"><div class="row" style="gap:14px">' + av(S.me.name, 60) + '<div class="grow"><div class="disp" style="font-size:24px">' + esc(S.me.name) + '</div><div class="row" style="gap:6px;margin-top:4px"><span class="chip w">' + esc(S.me.role || '정회원') + '</span>' + (S.me.age ? '<span class="chip dk">' + esc(S.me.age) + '</span>' : '') + '</div></div><button class="icb" style="background:transparent;border-color:#5C8C78;color:#fff" data-act="meEdit" aria-label="내 정보 수정">' + ic('pen', 18) + '</button></div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">' + [[myRank ? myRank + '위' : '-', '최근 순위'], [att + '회', '참석 신청'], [best ? best + '타' : '-', '베스트']].map(function (s) { return '<div style="background:var(--gd);border-radius:14px;padding:12px 0;text-align:center"><div class="disp" style="font-size:22px">' + s[0] + '</div><div style="font-size:11px;color:#CFE6D6">' + s[1] + '</div></div>'; }).join('') + '</div></section>' +
      '<section class="stack"><div class="sec"><h2>회비 납부 현황</h2></div><div class="px card" style="padding:16px;display:flex;flex-direction:column;gap:12px"><div class="row" style="justify-content:space-between"><div><div class="b">가입비' + (joinFee() ? ' ' + esc(joinFee()) : '') + '</div><div class="s12 mute">회원가입 시 1회 납부</div></div><span class="chip ' + (S.me.joinPaid ? '' : 'rose') + '">' + (S.me.joinPaid ? '납부 완료' : '입금 확인 전') + '</span></div>' + (myPays.length ? myPays.map(function (x) { return '<div class="row" style="justify-content:space-between;border-top:1px solid var(--line);padding-top:12px"><div><div class="b">' + esc(x.e.title) + '</div><div class="s12 mute">' + fshort(x.e.date) + (x.e.fee ? ' · 참가비 ' + esc(x.e.fee) : '') + '</div></div><span class="chip ' + (x.r.paid ? '' : 'rose') + '">' + (x.r.paid ? '납부 완료' : '입금 확인 전') + '</span></div>'; }).join('') : '<p class="s13 mute" style="border-top:1px solid var(--line);padding-top:12px">참석 신청한 월례회가 없습니다. 참가비는 월례회 참석 신청자만 납부합니다.</p>') + accountBox('입금 후 운영진이 확인하면 납부 현황에 반영됩니다') + '</div></section>' +
      badgesHtml(S.me.id) +
      '<section class="stack"><div class="sec"><h2>회원 명부</h2><span class="s13 mute">전체 ' + S.members.filter(function (m) { return m.status === 'approved'; }).length + '명</span></div><div class="px card row" style="padding:0 14px;border-radius:16px"><span class="mute">' + ic('search', 18) + '</span><label class="sr" for="mq">회원 검색</label><input id="mq" class="grow" style="min-height:48px;border:0;background:transparent;outline:none" placeholder="이름으로 회원 찾기" value="' + esc(q) + '"></div><div class="px card" style="padding:4px 16px" id="mlist">' + memberRows(list) + '</div></section>' +
      (IS_STANDALONE ? '' : '<div class="px"><button class="btn ghost block" data-act="' + (IS_INAPP ? 'openExternal' : 'installApp') + '">' + ic('plus', 16) + '휴대폰 홈 화면에 저장하기</button></div>') + '<div class="px row"><a class="btn ghost grow" href="' + esc(links().kakao) + '" target="_blank" rel="noopener">단톡방</a><a class="btn ghost grow" href="' + esc(links().band) + '" target="_blank" rel="noopener">밴드</a><button class="btn ghost grow" data-act="logout">' + ic('out', 18) + '로그아웃</button></div>' + footer();
    reveal();
    var inp = document.getElementById('mq'); inp.addEventListener('input', function () { S.sub.mq = inp.value; var qq = inp.value.trim(); document.getElementById('mlist').innerHTML = memberRows(S.members.filter(function (m) { return m.status === 'approved' && (!qq || m.name.indexOf(qq) >= 0); })); });
  });
}
function memberRows(list) { return list.length ? list.map(function (m, i) { return '<div class="row" style="padding:12px 0;gap:12px;' + (i < list.length - 1 ? 'border-bottom:1px solid var(--line)' : '') + '">' + av(m.name, 40) + '<div class="grow"><div class="b">' + esc(m.name) + '</div><div class="s12 mute">' + esc([m.age, m.region, m.joined ? new Date(m.joined).getFullYear() + '년 가입' : ''].filter(Boolean).join(' · ')) + '</div></div><span class="chip ' + (m.admin ? 'sun' : '') + '">' + esc(m.role || '정회원') + '</span></div>'; }).join('') : '<p class="mute s13" style="padding:16px 0;text-align:center">검색 결과가 없습니다.</p>'; }

/* ---------- 운영진 ---------- */
function vAdmin() {
  if (!isAdmin()) { S.tab = 'home'; return vHome(); }
  return header('운영진 관리', '회원 승인 · 가입비·참가비 · 월례회 운영', true) + '<main id="adBox" style="padding-top:18px"><div class="spin"></div></main>';
}
function afterAdmin() {
  if (!isAdmin()) return; var box = document.getElementById('adBox');
  var evs = upcoming().concat(past().slice(0, 5)), pev = evs.filter(function (e) { return e.id === S.sub.payEv; })[0] || evs[0];
  Promise.all([Store.list('members'), pev ? Store.list('rsvps', { where: ['eventId', pev.id] }) : Promise.resolve([]), Store.list('members_private')]).then(function (r) {
    S.members = r[0]; var ph = {}; r[2].forEach(function (p) { ph[p.id] = p.phone; });
    var yes = r[1].filter(function (x) { return x.st === 'yes'; }).sort(function (a, b) { return a.name > b.name ? 1 : -1; }), unpaid = yes.filter(function (x) { return !x.paid; });
    var pend = S.members.filter(function (m) { return m.status === 'pending'; }), ok = S.members.filter(function (m) { return m.status === 'approved'; }).sort(function (a, b) { return a.name > b.name ? 1 : -1; }), noJoin = ok.filter(function (m) { return !m.joinPaid; }), ev = upcoming()[0];
    box.innerHTML = '<section class="px" style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px">' + [['전체 회원', ok.length + '명', 'var(--ink)'], ['가입 대기', pend.length + '명', pend.length ? 'var(--red)' : 'var(--ink)'], ['참가비 미확인', unpaid.length + '명', unpaid.length ? 'var(--red)' : 'var(--g)'], ['가입비 미확인', noJoin.length + '명', noJoin.length ? 'var(--red)' : 'var(--g)']].map(function (s) { return '<div class="card rv" style="padding:16px"><div class="s12 b mute">' + s[0] + '</div><div class="disp" style="font-size:28px;color:' + s[2] + '">' + s[1] + '</div></div>'; }).join('') + '</section>' +
      '<section class="stack"><div class="sec"><h2>가입 승인 대기</h2></div><div class="px card" style="padding:2px 16px">' + (pend.length ? pend.map(function (m) { return '<div class="row" style="padding:12px 0;border-bottom:1px solid var(--line)">' + av(m.name, 38) + '<div class="grow"><div class="b" style="font-size:14px">' + esc(m.name) + '</div><div class="s12 mute">' + esc([ph[m.id], m.age, m.region, m.ref ? '추천 ' + m.ref : ''].filter(Boolean).join(' · ')) + '</div></div><button class="btn sm" data-act="approve" data-id="' + esc(m.id) + '">승인</button><button class="btn ghost sm" data-act="reject" data-id="' + esc(m.id) + '">거절</button></div>'; }).join('') : '<p class="mute s13" style="padding:16px 0;text-align:center">대기 중인 신청이 없습니다.</p>') + '</div></section>' +
      '<section class="stack" id="paySec"><div class="sec"><h2>월례회 참가비 확인</h2>' + (evs.length ? '<label class="sr" for="payEv">월례회 선택</label><select id="payEv" class="inp" style="width:auto;max-width:190px;min-height:44px">' + evs.map(function (e) { return '<option value="' + e.id + '"' + (pev && e.id === pev.id ? ' selected' : '') + '>' + esc(e.title) + '</option>'; }).join('') + '</select>' : '') + '</div>' + (pev ? '<p class="px s13 mute">' + fshort(pev.date) + ' · 참가비 ' + esc(pev.fee || '미설정') + ' · 참석 ' + yes.length + '명 중 ' + (yes.length - unpaid.length) + '명 확인</p>' : '') + '<div class="px card" style="padding:2px 16px">' + (yes.length ? yes.map(function (x) { var p = !!x.paid; return '<div class="row" style="padding:10px 0;border-bottom:1px solid var(--line)">' + av(x.name, 34) + '<div class="grow b" style="font-size:14px">' + esc(x.name) + '</div><span class="chip ' + (p ? '' : 'rose') + '">' + (p ? '완납' : '미확인') + '</span><button class="btn ' + (p ? 'ghost' : '') + ' sm" data-act="payToggle" data-id="' + esc(x.id) + '" data-p="' + (p ? 1 : 0) + '">' + (p ? '취소' : '입금 확인') + '</button></div>'; }).join('') : '<p class="mute s13" style="padding:16px 0;text-align:center">' + (pev ? '참석 신청자가 없습니다.' : '등록된 월례회가 없습니다.') + '</p>') + '</div></section>' +
      '<section class="stack"><div class="sec"><h2>가입비 확인</h2><span class="s13 mute">' + (joinFee() ? esc(joinFee()) : '금액 미설정') + '</span></div><div class="px card" style="padding:2px 16px">' + (noJoin.length ? noJoin.map(function (m) { return '<div class="row" style="padding:10px 0;border-bottom:1px solid var(--line)">' + av(m.name, 34) + '<div class="grow b" style="font-size:14px">' + esc(m.name) + '</div><span class="chip rose">미확인</span><button class="btn sm" data-act="joinPay" data-id="' + esc(m.id) + '" data-v="1">입금 확인</button></div>'; }).join('') : '<p class="mute s13" style="padding:16px 0;text-align:center">모든 회원의 가입비가 확인되었습니다.</p>') + '</div></section>' +
      '<section class="stack"><div class="sec"><h2>월례회 운영</h2></div><div class="px" style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px">' + [['plus', '월례회 등록', '일정·장소·참가비', 'evEdit', ''], ['shuffle', '조 편성 · 스코어', '다음 월례회 운영 화면', 'evOpenAdmin', ev ? ev.id : ''], ['trophy', '지난 월례회 결과', '스코어 확인 · 결과 확정', 'evOpenAdmin', (past()[0] || {}).id || ''], ['chat', '공지 올리기', '상단 고정 게시', 'postNew', '공지']].map(function (b) { return '<button class="card press" style="min-height:96px;padding:14px;display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;text-align:left" data-act="' + b[3] + '" data-id="' + b[4] + '" data-cat="' + b[4] + '"><span style="color:var(--g)">' + ic(b[0], 24) + '</span><span><span class="b" style="display:block">' + b[1] + '</span><span class="s12 mute">' + b[2] + '</span></span></button>'; }).join('') + '</div></section>' +
      '<section class="stack"><div class="sec"><h2>클럽 설정</h2></div><div class="px card" style="padding:4px 16px"><button class="row" style="padding:14px 0;border:0;border-bottom:1px solid var(--line);background:none;width:100%;text-align:left" data-act="feeEdit"><span style="color:var(--g)">' + ic('won', 22) + '</span><span class="grow"><span class="b" style="display:block">회비 · 계좌 설정</span><span class="s12 mute">가입비 ' + esc(joinFee() || '미설정') + ' · 월례회 기본 참가비 ' + esc(S.settings.eventFee || '미설정') + '</span></span>' + ic('arrow', 16) + '</button><button class="row" style="padding:14px 0;border:0;border-bottom:1px solid var(--line);background:none;width:100%;text-align:left" data-act="coursesEdit"><span style="color:var(--g)">' + ic('flag', 22) + '</span><span class="grow"><span class="b" style="display:block">코스 설정</span><span class="s12 mute">' + esc(defaultPlace() || '장소 미설정') + ' · ' + esc(courseList().map(function (c) { return c.name; }).join(' · ')) + '</span></span>' + ic('arrow', 16) + '</button><button class="row" style="padding:14px 0;border:0;border-bottom:1px solid var(--line);background:none;width:100%;text-align:left" data-act="linksEdit"><span style="color:var(--g)">' + ic('chat', 22) + '</span><span class="grow"><span class="b" style="display:block">소통 채널 설정</span><span class="s12 mute">카카오톡 단톡방 · 네이버 밴드 주소</span></span>' + ic('arrow', 16) + '</button><button class="row" style="padding:14px 0;border:0;background:none;width:100%;text-align:left" data-act="rolesEdit"><span style="color:var(--g)">' + ic('users', 22) + '</span><span class="grow"><span class="b" style="display:block">직책 설정</span><span class="s12 mute">' + esc(roleList().join(' · ')) + '</span></span>' + ic('arrow', 16) + '</button></div></section>' +
      '<section class="stack"><div class="sec"><h2>회원 관리</h2><span class="s13 mute">이름을 누르면 직책·권한 변경</span></div><div class="px card" style="padding:2px 16px">' + ok.map(function (m) { return '<button class="row" style="padding:10px 0;border:0;border-bottom:1px solid var(--line);background:none;width:100%;text-align:left" data-act="memEdit" data-id="' + esc(m.id) + '">' + av(m.name, 34) + '<span class="grow"><span class="b" style="font-size:14px;display:block">' + esc(m.name) + '</span><span class="s12 mute">' + esc(ph[m.id] || '') + (m.joinPaid ? '' : ' · 가입비 미확인') + '</span></span><span class="chip ' + (m.admin ? 'sun' : '') + '">' + esc(m.role || '정회원') + '</span></button>'; }).join('') + '</div></section>' + (DEMO ? '<div class="px"><button class="btn ghost block" data-act="demoReset">체험 데이터 초기화</button></div>' : '');
    reveal();
    var sel = document.getElementById('payEv'); if (sel) sel.addEventListener('change', function (e) { S.sub.payEv = e.target.value; afterAdmin(); });
    if (S.sub.payScroll) { S.sub.payScroll = false; var ps = document.getElementById('paySec'); if (ps) ps.scrollIntoView({ block: 'start' }); }
  });
}

/* ---------- 로그인 · 가입 ---------- */
function openLogin() {
  sheet('<h3>로그인</h3><p class="s13 mute">가입 승인된 회원은 이름과 휴대폰 뒷자리 4자리로 로그인합니다.</p><form id="fLogin" class="stack" style="gap:14px"><div class="field"><label for="ln">이름</label><input id="ln" class="inp" autocomplete="name" required></div><div class="field"><label for="l4">휴대폰 뒷자리 4자리</label><input id="l4" class="inp" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" required></div><button class="btn block">로그인</button><button type="button" class="btn ghost block" data-act="join">아직 회원이 아니신가요? 가입 신청</button></form>');
  document.getElementById('fLogin').addEventListener('submit', function (e) {
    e.preventDefault(); var id = document.getElementById('ln').value.trim() + '_' + document.getElementById('l4').value.trim();
    Store.get('members', id).then(function (m) {
      if (!m) return toast('일치하는 회원 정보가 없습니다');
      if (m.status !== 'approved') return toast('가입 승인 대기 중입니다. 운영진 승인 후 이용할 수 있습니다');
      return Store.setSession(id).then(function () { S.me = m; closeSheet(); toast(m.name + '님, 환영합니다'); return loadCore().then(render); });
    }).catch(function () { toast('로그인 중 오류가 발생했습니다'); });
  });
}
function openJoin() {
  sheet('<h3>가입 신청</h3><p class="s13 mute">신청 후 운영진이 승인하면 바로 이용할 수 있습니다.' + (joinFee() ? ' 가입비는 <b>' + esc(joinFee()) + '</b>이며, 월례회 참가비는 참석 신청한 회원만 납부합니다.' : '') + '</p><form id="fJoin" class="stack" style="gap:14px"><div class="field"><label for="jn">이름</label><input id="jn" class="inp" autocomplete="name" required maxlength="10"></div><div class="field"><label for="jp">휴대폰 번호</label><input id="jp" class="inp" inputmode="tel" autocomplete="tel" placeholder="010-0000-0000" required></div><div class="field"><label for="ja">연령대</label><select id="ja" class="inp"><option>30대</option><option>40대</option><option>50대</option><option>기타</option></select></div><div class="field"><label for="jr">활동 지역</label><input id="jr" class="inp" placeholder="예: 대구 수성구"></div><div class="field"><label for="jf">추천인 (선택)</label><input id="jf" class="inp"></div><label class="check"><input type="checkbox" id="jc" required><span><b>개인정보 수집·이용 동의 (필수)</b><br>수집 항목: 이름, 휴대폰 번호, 연령대, 활동 지역 / 목적: 회원 관리 및 월례회 운영 / 보유 기간: 회원 탈퇴 시까지. 휴대폰 번호는 운영진만 열람합니다.</span></label><button class="btn block">가입 신청하기</button></form>');
  document.getElementById('fJoin').addEventListener('submit', function (e) {
    e.preventDefault(); var name = document.getElementById('jn').value.trim().replace(/[_\/\s]/g, ''), phone = document.getElementById('jp').value.replace(/[^0-9]/g, '');
    if (phone.length < 10) return toast('휴대폰 번호를 정확히 입력해 주세요');
    var l4 = phone.slice(-4), id = name + '_' + l4;
    Store.get('members', id).then(function (ex) {
      if (ex) return toast(ex.status === 'approved' ? '이미 가입된 회원입니다. 로그인해 주세요' : '이미 신청되어 승인 대기 중입니다');
      return Store.set('members', id, { name: name, last4: l4, age: document.getElementById('ja').value, region: document.getElementById('jr').value.trim(), ref: document.getElementById('jf').value.trim(), status: 'pending', admin: false, role: roleList().indexOf('신입') >= 0 ? '신입' : roleList()[roleList().length - 1], joinPaid: false, joined: Date.now() })
        .then(function () { notify('admins', 'join', '새 가입 신청', name + '님이 가입을 신청했습니다.', 'admin', ''); return Store.set('members_private', id, { phone: phone.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3') }); })
        .then(function () { sheet('<div style="text-align:center;display:flex;flex-direction:column;gap:12px;align-items:center;padding:10px 0"><div class="pop" style="width:72px;height:72px;border-radius:50%;background:var(--mint);color:var(--g);display:flex;align-items:center;justify-content:center">' + ic('check', 36) + '</div><h3>신청이 접수되었습니다</h3><p class="s13 mute">운영진 승인 후 이름과 휴대폰 뒷자리(' + esc(l4) + ')로 로그인하실 수 있습니다.</p>' + (joinFee() ? '<div style="width:100%;text-align:left"><p class="b s13" style="margin-bottom:8px">가입비 ' + esc(joinFee()) + ' 입금 안내</p>' + accountBox('입금자명은 신청하신 이름으로 부탁드립니다') + '</div>' : '') + '<a class="btn block" style="background:#FEE500;color:#3A1D1D" href="' + esc(links().kakao) + '" target="_blank" rel="noopener">' + ic('chat', 16) + '카카오톡 단톡방 들어가기</a><button class="btn ghost block" data-act="closeSheet">확인</button></div>'); confetti(innerWidth / 2, innerHeight / 2); });
    }).catch(function () { toast('신청 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요'); });
  });
}

/* ---------- 액션 ---------- */
var swapSel = null;
var ACT = {
  go: function (d) { S.tab = d.tab; S.eventId = null; window.scrollTo(0, 0); render(); },
  sub: function (d) { S.sub[d.k] = d.v; if (d.k === 'rankEv') S.sub.rank = 'ev'; render(true); },
  login: openLogin, join: openJoin, closeSheet: closeSheet,
  gallery: function () { S.tab = 'talk'; S.sub.talk = '갤러리'; window.scrollTo(0, 0); render(); },
  demoLogin: function () { Store.list('members').then(function (ms) { var a = ms.filter(function (m) { return m.admin; })[0]; return Store.setSession(a.id).then(function () { S.me = a; toast('운영진(' + a.name + ')으로 체험합니다'); return loadCore().then(render); }); }); },
  demoReset: function () { Store.reset(); location.reload(); },
  logout: function () { Store.setSession(null).then(function () { S.me = null; S.tab = 'home'; S.members = []; toast('로그아웃되었습니다'); render(); }); },
  copyAcc: function () { var t = acct().account; (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { toast('계좌번호가 복사되었습니다'); }, function () { toast(acct().bank + ' ' + t); }); },
  evOpenAdmin: function (d) { if (!d.id) return toast('해당 월례회가 없습니다'); S.tab = 'meet'; S.eventId = d.id; window.scrollTo(0, 0); render(); },
  evOpen: function (d) { S.eventId = d.id; window.scrollTo(0, 0); render(); }, evBack: function () { S.eventId = null; render(); },
  rankOf: function (d) { S.tab = 'rank'; S.sub.rank = 'ev'; S.sub.rankEv = d.id; S.eventId = null; window.scrollTo(0, 0); render(); },
  rsvp: function (d, el, e) {
    if (needLogin()) return; var id = d.ev + '_' + S.me.id, evx = S.events.filter(function (x) { return x.id === d.ev; })[0] || {};
    if (d.st === 'yes' && evx.closed) return toast('참석 신청이 마감되었습니다. 운영진에게 문의해 주세요');
    if (d.st !== 'yes' && teamOf(evx, S.me.id) >= 0 && evx.teamsPub !== false) return toast('조 편성 이후의 참석 취소는 운영진에게 요청해 주세요');
    Store.set('rsvps', id, { eventId: d.ev, memberId: S.me.id, name: S.me.name, st: d.st, at: Date.now() }, true).then(function () { if (d.st === 'yes') { confetti(e.clientX || innerWidth / 2, e.clientY || innerHeight / 2); var fe = (S.events.filter(function (x) { return x.id === d.ev; })[0] || {}).fee; toast(fe ? '참석 신청 완료! 참가비 ' + fe + ' 입금 부탁드립니다' : '참석 신청 완료! 월례회에서 만나요'); } else toast(d.st === 'no' ? '불참으로 등록했습니다' : '미정으로 등록했습니다'); render(true); }).catch(function () { toast('저장하지 못했습니다'); });
  },
  evEdit: function (d) {
    var ev = S.events.filter(function (e) { return e.id === d.id; })[0] || {};
    sheet('<h3>' + (ev.id ? '월례회 수정' : '월례회 등록') + '</h3><form id="fEv" class="stack" style="gap:14px"><div class="field"><label for="et">제목</label><input id="et" class="inp" required value="' + esc(ev.title || '') + '" placeholder="예: 11월 정기월례회"></div><div class="field"><label for="ed">일시</label><input id="ed" type="datetime-local" class="inp" required value="' + esc(ev.date || '') + '"></div><div class="field"><label for="ep">장소</label><input id="ep" class="inp" value="' + esc(ev.id ? (ev.place || '') : defaultPlace()) + '" placeholder="구장명 · 집결 장소"></div><div class="row"><div class="field grow"><label for="ef">참가비</label><input id="ef" class="inp" value="' + esc(ev.fee || (ev.id ? '' : (S.settings.eventFee || ''))) + '" placeholder="예: 25,000원"></div><div class="field grow"><label for="ec">정원</label><input id="ec" type="number" class="inp" value="' + esc(ev.cap || 40) + '"></div></div><div class="field"><label for="el">신청 마감 (표시용)</label><input id="el" class="inp" value="' + esc(ev.deadline || '') + '" placeholder="예: 10.1(목)"></div><div class="field"><label>코스 구성 (9홀 단위 · 2개=18홀, 3개=27홀, 4개=36홀)</label><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px">' + [0, 1, 2, 3].map(function (i) { var cur = (ev.segs || [])[i], def = ev.segs ? (cur ? cur.name : '') : (i < 2 ? (courseList()[i] || courseList()[0]).name : ''); return '<select class="inp" id="eseg' + i + '" aria-label="' + (i + 1) + '번째 코스">' + (i >= 2 ? '<option value="">' + (i + 1) + '번째 없음</option>' : '') + courseList().map(function (c) { return '<option' + (c.name === def ? ' selected' : '') + '>' + esc(c.name) + '</option>'; }).join('') + '</select>'; }).join('') + '</div><span class="s12 mute">코스와 PAR는 운영진 관리 > 클럽 설정 > 코스 설정에서 바꿀 수 있습니다.</span></div><div class="field"><label for="em">안내 사항</label><textarea id="em" class="inp">' + esc(ev.memo || '') + '</textarea></div><button class="btn block">저장</button>' + (ev.id ? '<button type="button" class="btn ghost block" style="color:var(--red)" data-act="evDel" data-id="' + ev.id + '">이 월례회 삭제</button>' : '') + '</form>');
    document.getElementById('fEv').addEventListener('submit', function (e) { e.preventDefault(); var data = { title: val('et'), date: val('ed'), place: val('ep'), fee: val('ef'), cap: Number(val('ec')) || 0, deadline: val('el'), memo: val('em'), segs: [0, 1, 2, 3].map(function (i) { var n = val('eseg' + i); return courseList().filter(function (c) { return c.name === n; })[0]; }).filter(Boolean).map(function (c) { return { name: c.name, pars: c.pars.slice() }; }) }; var isNew = !ev.id; if (ev.id && Object.keys(S._cards || {}).length && JSON.stringify(data.segs) !== JSON.stringify(segsOf(ev))) return toast('스코어 입력이 시작되어 코스 구성을 바꿀 수 없습니다'); (ev.id ? Store.set('events', ev.id, data, true) : Store.add('events', Object.assign(data, { scores: {}, teams: [], hio: '' }))).then(function () { closeSheet(); toast('저장되었습니다'); if (isNew) notify('all', 'event', '새 월례회 등록', data.title + ' · ' + fdate(data.date) + (data.place ? ' · ' + data.place : '') + ' 참석 신청을 받습니다.', 'meet', ''); return loadCore().then(function () { S.tab = 'meet'; render(); }); }).catch(function () { toast('저장 권한이 없습니다'); }); });
  },
  evDel: function (d) { if (!confirm('이 월례회를 삭제할까요? 참석 신청과 성적도 함께 볼 수 없게 됩니다.')) return; Store.del('events', d.id).then(function () { closeSheet(); S.eventId = null; return loadCore().then(render); }); },
  teamAuto: function (d) {
    if (!d.id) return toast('예정된 월례회가 없습니다');
    var ev = S.events.filter(function (e) { return e.id === d.id; })[0];
    Promise.all([Store.list('rsvps', { where: ['eventId', d.id] }), Store.list('scorecards', { where: ['eventId', d.id] })]).then(function (r) {
      if (r[1].length) return toast('스코어 입력이 시작되어 조 편성을 바꿀 수 없습니다');
      var ids = r[0].filter(function (x) { return x.st === 'yes'; }).map(function (x) { return x.memberId; }); if (ids.length < 2) return toast('참석 신청자가 2명 이상이어야 합니다');
      if (ev.teams && ev.teams.length && !confirm('현재 신청자 ' + ids.length + '명을 4인 1조 기준으로 다시 편성할까요? 기존 조 편성은 지워집니다.')) return;
      var teams = autoTeams(ev, ids); teams.forEach(function (t) { t.marker = t.m[0] || ''; }); ev.teams = teams; ev.teamsPub = false;
      return Store.set('events', d.id, { teams: teams, teamsPub: false }, true).then(function () { S.tab = 'meet'; S.eventId = d.id; toast(teams.length + '개 조 초안을 만들었습니다. 확인 후 발표해 주세요'); render(); });
    });
  },
  teamAddEmpty: function (d) { var ev = S.events.filter(function (e) { return e.id === d.id; })[0]; if (Object.keys(S._cards || {}).length) return toast('스코어 입력이 시작되어 조 편성을 바꿀 수 없습니다'); ev.teams = ev.teams || []; ev.teams.push({ tee: (ev.teams.length + 1) + '번 홀 출발', m: [], marker: '' }); if (ev.teamsPub === undefined) ev.teamsPub = false; saveTeams(ev, (ev.teams.length) + '조를 추가했습니다'); },
  teamMember: function (d) {
    var ev = S.events.filter(function (e) { return e.id === S.eventId; })[0], id = d.mid, cur = teamOf(ev, id), t = cur >= 0 ? ev.teams[cur] : null;
    sheet('<h3>' + esc(mname(id)) + '</h3><p class="s13 mute">' + (t ? (cur + 1) + '조' + (t.marker === id ? ' · 조장' : '') : '미배정') + '</p><div class="stack">' + (t && t.marker !== id ? '<button class="btn block" data-act="teamMarker" data-mid="' + esc(id) + '">' + ic('flag', 16) + '이 조의 조장(스코어 입력 담당)으로 지정</button>' : '') + '<div class="s13 b">이동할 조</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">' + (ev.teams || []).map(function (x, i) { return '<button class="btn ' + (i === cur ? '' : 'ghost') + ' sm" data-act="teamMove" data-mid="' + esc(id) + '" data-to="' + i + '"' + (i === cur ? ' disabled' : '') + '>' + (i + 1) + '조 (' + x.m.length + '명)</button>'; }).join('') + '</div>' + (t ? '<button class="btn ghost block" style="color:var(--red)" data-act="teamMove" data-mid="' + esc(id) + '" data-to="-1">조에서 빼기 (미배정)</button>' : '') + '</div>');
  },
  teamMove: function (d) {
    var ev = S.events.filter(function (e) { return e.id === S.eventId; })[0], id = d.mid, to = +d.to;
    ev.teams.forEach(function (t) { var i = t.m.indexOf(id); if (i >= 0) { t.m.splice(i, 1); if (t.marker === id) t.marker = t.m[0] || ''; } });
    if (to >= 0) { ev.teams[to].m.push(id); if (!ev.teams[to].marker) ev.teams[to].marker = id; }
    ev.teams = ev.teams.filter(function (t, i) { return t.m.length || i === to; });
    saveTeams(ev, to >= 0 ? mname(id) + '님을 ' + (ev.teams.indexOf(ev.teams.filter(function (t) { return t.m.indexOf(id) >= 0; })[0]) + 1) + '조로 옮겼습니다' : '미배정으로 뺐습니다');
  },
  teamMarker: function (d) { var ev = S.events.filter(function (e) { return e.id === S.eventId; })[0], i = teamOf(ev, d.mid); if (i < 0) return; ev.teams[i].marker = d.mid; saveTeams(ev, mname(d.mid) + '님을 ' + (i + 1) + '조 조장으로 지정했습니다'); },
  teamPublish: function (d) { var ev = S.events.filter(function (e) { return e.id === d.id; })[0]; ev.teams = (ev.teams || []).filter(function (t) { return t.m.length; }); if (!ev.teams.length) return toast('편성된 조가 없습니다'); ev.teamsPub = true; saveTeams(ev, '조 편성을 발표했습니다').then(function () { notify('all', 'team', '조 편성 발표', ev.title + ' 조 편성이 발표되었습니다. 내 조와 조장을 확인하세요.', 'meet', ev.id); }); },
  copyTeams: function (d) { copyText(teamsText(S.events.filter(function (e) { return e.id === d.id; })[0]), '조 편성을 복사했습니다. 밴드·카톡에 붙여넣으세요'); },
  copyList: function (d) { var ev = S.events.filter(function (e) { return e.id === d.id; })[0], yes = (S._rsvps || []).filter(function (r) { return r.st === 'yes'; }); copyText('[' + ev.title + ' 참석자 ' + yes.length + '명]\n' + yes.map(function (r, i) { return (i + 1) + '. ' + r.name + (r.guest ? '(외부)' : '') + (ev.fee ? (r.paid ? ' ✓입금' : ' 미입금') : ''); }).join('\n'), '참석자 명단을 복사했습니다'); },
  evClose: function (d) { var ev = S.events.filter(function (e) { return e.id === d.id; })[0]; ev.closed = !ev.closed; Store.set('events', ev.id, { closed: ev.closed }, true).then(function () { toast(ev.closed ? '참석 신청을 마감했습니다' : '참석 신청을 다시 받습니다'); render(true); }); },
  rsvpAdd: function (d) {
    var ev = S.events.filter(function (e) { return e.id === d.id; })[0], have = (S._rsvps || []).filter(function (r) { return r.st === 'yes'; }).map(function (r) { return r.memberId; }), rest = S.members.filter(function (m) { return m.status === 'approved' && have.indexOf(m.id) < 0; }).sort(function (a, b) { return a.name > b.name ? 1 : -1; });
    sheet('<h3>참가자 직접 등록</h3><p class="s13 mute">전화·현장 접수 회원이나 외부 참가자를 운영진이 대신 등록합니다.</p><form id="fAdd" class="stack" style="gap:14px"><div class="field"><label for="am">회원 선택</label><select id="am" class="inp"><option value="">— 외부 참가자(아래에 이름 입력) —</option>' + rest.map(function (m) { return '<option value="' + esc(m.id) + '">' + esc(m.name) + '</option>'; }).join('') + '</select></div><div class="field"><label for="ag">외부 참가자 이름</label><input id="ag" class="inp" maxlength="10" placeholder="회원을 선택했다면 비워 두세요"></div><label class="check"><input type="checkbox" id="ap"><span><b>참가비 입금 확인됨</b></span></label><button class="btn block">등록</button></form>');
    document.getElementById('fAdd').addEventListener('submit', function (e) { e.preventDefault(); var mid = val('am'), gname = val('ag'); if (!mid && !gname) return toast('회원을 선택하거나 이름을 입력해 주세요'); var guest = !mid, id = guest ? 'guest' + Date.now() : mid, name = guest ? gname : mname(mid); var data = { eventId: ev.id, memberId: id, name: name, st: 'yes', paid: document.getElementById('ap').checked, at: Date.now(), by: S.me.id }; if (guest) data.guest = true; var p = Store.set('rsvps', ev.id + '_' + id, data); if (guest) { ev.guests = ev.guests || {}; ev.guests[id] = name; S.gn[id] = name; p = p.then(function () { return Store.set('events', ev.id, { guests: ev.guests }, true); }); } p.then(function () { closeSheet(); toast(name + '님을 등록했습니다'); render(true); }).catch(function () { toast('저장 권한이 없습니다'); }); });
  },
  coursesEdit: function () {
    sheet('<h3>코스 설정</h3><p class="s13 mute">월례회를 주로 여는 구장과 9홀 코스별 PAR입니다. 한 줄에 코스 하나씩 <b>코스명: PAR 9개</b> 형식으로 적어 주세요. 월례회 등록 때 이 코스들을 조합해 18·27·36홀을 구성합니다.</p><form id="fCourse" class="stack" style="gap:14px"><div class="field"><label for="cp">기본 장소</label><input id="cp" class="inp" value="' + esc(defaultPlace()) + '"></div><div class="field"><label for="cl">코스 목록</label><textarea id="cl" class="inp" style="min-height:150px">' + esc(courseList().map(function (c) { return c.name + ': ' + c.pars.join(','); }).join('\n')) + '</textarea></div><button class="btn block">저장</button><button type="button" class="btn ghost block" data-act="coursesReset">영천 웨스트우드 기본값으로 되돌리기</button></form>');
    document.getElementById('fCourse').addEventListener('submit', function (e) { e.preventDefault(); var bad = 0, list = document.getElementById('cl').value.split('\n').map(function (l) { return l.trim(); }).filter(Boolean).map(function (l) { var k = l.lastIndexOf(':'), name = (k > 0 ? l.slice(0, k) : '').trim(), pars = l.slice(k + 1).split(/[,\s]+/).map(function (x) { return parseInt(x, 10); }).filter(function (x) { return x >= 3 && x <= 5; }); if (!name || pars.length !== 9) bad++; return { name: name, pars: pars }; }); if (bad || !list.length) return toast('각 줄을 "코스명: PAR 9개(3~5)" 형식으로 입력해 주세요'); var data = { courses: list, place: val('cp') }; Store.set('settings', 'club', data, true).then(function () { Object.assign(S.settings, data); closeSheet(); toast('코스 설정을 저장했습니다'); afterAdmin(); }).catch(function () { toast('저장 권한이 없습니다'); }); });
  },
  coursesReset: function () { document.getElementById('cp').value = DEFAULT_PLACE; document.getElementById('cl').value = DEFAULT_COURSES.map(function (c) { return c.name + ': ' + c.pars.join(','); }).join('\n'); },
  cpNew: function (d) {
    sheet('<h3>카풀 제공하기</h3><form id="fCp" class="stack" style="gap:14px"><div class="field"><label for="cf">출발지</label><input id="cf" class="inp" required maxlength="30" placeholder="예: 수성구 범어역 3번 출구"></div><div class="row"><div class="field grow"><label for="ct">출발 시간</label><input id="ct" class="inp" maxlength="20" placeholder="예: 오전 7:40"></div><div class="field grow"><label for="cs">태울 수 있는 인원</label><select id="cs" class="inp"><option>1</option><option>2</option><option selected>3</option><option>4</option><option>5</option><option>6</option></select></div></div><div class="field"><label for="cm">메모 (선택)</label><input id="cm" class="inp" maxlength="80" placeholder="예: 트렁크에 백 4개 가능"></div><button class="btn block">등록</button></form>');
    document.getElementById('fCp').addEventListener('submit', function (e) { e.preventDefault(); Store.add('carpools', { eventId: d.id, driverId: S.me.id, name: S.me.name, from: val('cf'), time: val('ct'), seats: Number(val('cs')), memo: val('cm'), riders: [], at: Date.now() }).then(function () { closeSheet(); toast('카풀을 등록했습니다'); render(true); }).catch(function () { toast('등록하지 못했습니다'); }); });
  },
  cpRide: function (d) { Store.get('carpools', d.id).then(function (c) { if (!c) return; var rs = (c.riders || []).filter(function (r) { return r.id !== S.me.id; }); if (d.on === '1') { if (rs.length >= c.seats) return toast('이미 만석입니다'); rs.push({ id: S.me.id, name: S.me.name }); } return Store.set('carpools', d.id, { riders: rs }, true).then(function () { toast(d.on === '1' ? c.name + '님 차량에 탑승 신청했습니다' : '탑승을 취소했습니다'); render(true); }); }).catch(function () { toast('저장하지 못했습니다'); }); },
  cpDel: function (d) { if (!confirm('이 카풀을 취소할까요? 탑승 신청한 회원에게 따로 알려 주세요.')) return; Store.del('carpools', d.id).then(function () { toast('카풀을 취소했습니다'); render(true); }); },
  chatDel: function (d) { Store.del('comments', d.id).then(function () { render(true); }); },
  ledgerAdd: function (d) {
    sheet('<h3>결산 항목 추가</h3><p class="s13 mute">참가비 수입은 입금 확인된 인원으로 자동 계산됩니다. 그 밖의 수입·지출만 입력하세요.</p><form id="fLg" class="stack" style="gap:14px"><div class="field"><label for="lk">구분</label><select id="lk" class="inp"><option value="out">지출</option><option value="in">수입</option></select></div><div class="field"><label for="ll">내용</label><input id="ll" class="inp" required maxlength="40" placeholder="예: 구장 이용료, 점심 식대, 시상품, 찬조금"></div><div class="field"><label for="la">금액(원)</label><input id="la" class="inp" type="number" inputmode="numeric" required min="1"></div><button class="btn block">추가</button></form>');
    document.getElementById('fLg').addEventListener('submit', function (e) { e.preventDefault(); var ev = S.events.filter(function (x) { return x.id === d.id; })[0]; ev.ledger = (ev.ledger || []).concat([{ kind: val('lk'), label: val('ll'), amount: Number(val('la')) || 0 }]); Store.set('events', ev.id, { ledger: ev.ledger }, true).then(function () { closeSheet(); toast('추가했습니다'); render(true); }); });
  },
  ledgerDel: function (d) { var ev = S.events.filter(function (x) { return x.id === d.id; })[0]; ev.ledger = (ev.ledger || []).filter(function (r, i) { return i !== +d.i; }); Store.set('events', ev.id, { ledger: ev.ledger }, true).then(function () { render(true); }); },
  ledgerPub: function (d) {
    var ev = S.events.filter(function (x) { return x.id === d.id; })[0], rows = ledgerRows(ev, S._rsvps), s = ledgerSum(rows);
    if (!confirm('결산 내역을 회원에게 공개하고 공지로 올릴까요?')) return;
    var body = '[' + ev.title + ' 결산 보고]\n' + rows.map(function (r) { return (r.kind === 'in' ? '+ ' : '- ') + r.label + ' ' + won(r.amount); }).join('\n') + '\n\n수입 ' + won(s.i) + ' / 지출 ' + won(s.o) + '\n잔액 ' + won(s.b);
    Store.set('events', ev.id, { ledgerPub: true }, true).then(function () { ev.ledgerPub = true; return Store.add('posts', { cat: '공지', authorId: S.me.id, name: S.me.name, body: body, img: '', at: Date.now(), likes: [], cc: 0, pin: false }); }).then(function () { notify('all', 'notice', '결산 보고', ev.title + ' 결산 내역이 공개되었습니다.', 'meet', ev.id); toast('결산을 공개했습니다'); render(true); });
  },
  cardOpen: function (d) { var ev = S.events.filter(function (e) { return e.id === d.id; })[0]; openCard(ev, +d.no); },
  finalize: function (d) {
    var ev = S.events.filter(function (e) { return e.id === d.id; })[0];
    Store.list('scorecards', { where: ['eventId', ev.id] }).then(function (cs) {
      if (!cs.length) return toast('제출된 스코어카드가 없습니다. 조장이 스코어를 제출한 뒤 확정해 주세요');
      var sub = cs.filter(function (c) { return c.submitted; }), n = (ev.teams || []).length;
      if (!sub.length) return toast('아직 제출된 조가 없습니다');
      if (!confirm((sub.length < n ? '전체 ' + n + '개 조 중 ' + sub.length + '개 조만 제출되었습니다. 제출된 조만으로 ' : '') + '결과를 확정할까요? 랭킹에 반영되고 전체 회원에게 알림이 갑니다.')) return;
      var sc = {}, hio = [];
      sub.forEach(function (c) { Object.keys(c.scores || {}).forEach(function (id) { var hs = c.scores[id], f = 0, b = 0, full = true; var segs = segsOf(ev), cut = Math.ceil(segs.length / 2) * 9; if (hs.length !== segs.length * 9) full = false; hs.forEach(function (v, i) { if (!v) full = false; if (i < cut) f += v; else b += v; if (v === 1) hio.push(mname(id) + ' · ' + (segs[Math.floor(i / 9)] || {}).name + ' ' + (i % 9 + 1) + '번 홀'); }); if (full) sc[id] = { f: f, b: b, h: hs }; }); });
      return Store.get('events', ev.id).then(function (cur) { delete cur.id; cur.scores = sc; cur.done = true; if (hio.length) cur.hio = hio.join(', '); return Store.set('events', ev.id, cur); }).then(function () { toast('결과를 확정했습니다'); notify('all', 'result', '월례회 결과 발표', ev.title + ' 결과가 확정되었습니다. 랭킹에서 순위를 확인하세요.', 'rank', ev.id); return loadCore().then(function () { S.tab = 'rank'; S.sub.rank = 'ev'; S.sub.rankEv = ev.id; S.eventId = null; render(); }); });
    });
  },
  openExternal: function () { openExternal(); },
  installApp: function () { if (deferredInstall && !IS_SAMSUNG) { deferredInstall.prompt(); deferredInstall.userChoice.then(function (r) { if (r.outcome === 'accepted') lsSet('c3050_installed', '1'); deferredInstall = null; }); } else installGuide(); },
  installLater: function () { lsSet('c3050_install_later', String(Date.now())); var c = document.getElementById('installCard'); if (c) c.remove(); },
  notifOpen: function () {
    var list = S.notifs || [], seen = S.me.notifSeenAt || 0, perm = ('Notification' in window) ? Notification.permission : 'unsupported';
    sheet('<h3>알림</h3>' + (perm === 'default' ? '<button class="btn ghost block" data-act="notifPerm">' + ic('bell', 16) + '이 기기에서 알림 팝업 받기</button><p class="s12 mute">홈페이지를 열어 둔 동안 새 알림이 오면 기기 알림으로 알려드립니다.</p>' : '') + (list.length ? '<div class="stack" style="gap:0">' + list.map(function (n) { var nw = n.at > seen && n.by !== S.me.id; return '<button class="row" style="padding:12px 0;border:0;border-bottom:1px solid var(--line);background:none;width:100%;text-align:left;align-items:flex-start" data-act="notifGo" data-tab="' + esc(n.tab || 'home') + '" data-ev="' + esc(n.eventId || '') + '"><span style="width:40px;height:40px;border-radius:12px;background:' + (nw ? 'var(--sun)' : 'var(--mint)') + ';color:var(--ink);display:flex;align-items:center;justify-content:center;flex-shrink:0">' + ic(NICON[n.type] || 'bell', 20) + '</span><span class="grow"><span class="b" style="display:block">' + esc(n.title) + (nw ? ' <span class="chip red" style="padding:1px 7px">새 알림</span>' : '') + '</span><span class="s13" style="display:block">' + esc(n.body || '') + '</span><span class="s12 mute">' + ago(n.at) + '</span></span></button>'; }).join('') + '</div>' : '<p class="mute" style="text-align:center;padding:30px 0">아직 도착한 알림이 없습니다.</p>'));
    if (unreadCount()) { var now = Date.now(); S.me.notifSeenAt = now; Store.set('members', S.me.id, { notifSeenAt: now }, true).catch(function () { }); var bd = document.querySelector('.bell i'); if (bd) bd.remove(); }
  },
  notifGo: function (d) { closeSheet(); S.tab = d.tab === 'admin' && !isAdmin() ? 'home' : d.tab; S.eventId = d.tab === 'meet' && d.ev ? d.ev : null; if (d.tab === 'rank' && d.ev) { S.sub.rank = 'ev'; S.sub.rankEv = d.ev; } window.scrollTo(0, 0); render(); },
  notifPerm: function () { Notification.requestPermission().then(function (p) { toast(p === 'granted' ? '이 기기에서 알림 팝업을 받습니다' : '알림 권한이 허용되지 않았습니다'); ACT.notifOpen(); }); },
  scoreEdit: function (d) {
    var ev = S.events.filter(function (e) { return e.id === d.id; })[0]; if (!ev) return toast('월례회를 먼저 등록해 주세요');
    Store.list('rsvps', { where: ['eventId', ev.id] }).then(function (rs) {
      var ids = rs.filter(function (r) { return r.st === 'yes'; }).map(function (r) { return r.memberId; }); Object.keys(ev.scores || {}).forEach(function (id) { if (ids.indexOf(id) < 0) ids.push(id); });
      if (!ids.length) ids = S.members.filter(function (m) { return m.status === 'approved'; }).map(function (m) { return m.id; });
      sheet('<h3>스코어 입력</h3><p class="s13 mute">' + esc(ev.title) + ' · 전반/후반 타수를 입력하세요. 빈칸은 미참가로 처리됩니다.</p><form id="fSc" class="stack" style="gap:8px">' + ids.map(function (id) { var s = (ev.scores || {})[id] || {}; return '<div class="row" data-sid="' + esc(id) + '">' + av(mname(id), 32) + '<span class="grow b" style="font-size:14px">' + esc(mname(id)) + '</span><input class="inp" style="width:72px;min-height:44px;text-align:center" type="number" inputmode="numeric" placeholder="전반" aria-label="' + esc(mname(id)) + ' 전반" value="' + esc(s.f || '') + '"><input class="inp" style="width:72px;min-height:44px;text-align:center" type="number" inputmode="numeric" placeholder="후반" aria-label="' + esc(mname(id)) + ' 후반" value="' + esc(s.b || '') + '"></div>'; }).join('') + '<div class="field" style="margin-top:8px"><label for="hio">홀인원 기록 (선택)</label><input id="hio" class="inp" value="' + esc(ev.hio || '') + '" placeholder="예: 홍길동 · A코스 3번 홀"></div><button class="btn block">성적 저장</button></form>');
      document.getElementById('fSc').addEventListener('submit', function (e) { e.preventDefault(); var sc = {}; document.querySelectorAll('[data-sid]').forEach(function (r) { var i = r.querySelectorAll('input'), f = Number(i[0].value) || 0, b = Number(i[1].value) || 0; if (f + b > 0) sc[r.dataset.sid] = { f: f, b: b }; }); var data = { scores: sc, hio: val('hio') }; Store.get('events', ev.id).then(function (cur) { delete cur.id; return Store.set('events', ev.id, Object.assign(cur, data)); }).then(function () { closeSheet(); toast('성적이 저장되었습니다'); notify('all', 'result', '월례회 결과 발표', ev.title + ' 성적이 등록되었습니다. 랭킹에서 순위를 확인하세요.', 'rank', ev.id); return loadCore().then(function () { S.tab = 'rank'; S.sub.rank = 'ev'; S.sub.rankEv = ev.id; render(); }); }); });
    });
  },
  postNew: function (d) {
    if (needLogin()) return; var cats = CATS.slice(1, 4).filter(function (c) { return c !== '공지' || isAdmin(); }), pre = d.cat || (S.sub.talk && cats.indexOf(S.sub.talk) >= 0 ? S.sub.talk : '자유');
    sheet('<h3>글쓰기</h3><form id="fPost" class="stack" style="gap:14px"><div class="field"><label for="pc">분류</label><select id="pc" class="inp">' + cats.map(function (c) { return '<option' + (c === pre ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</select></div><div class="field"><label for="pb">내용</label><textarea id="pb" class="inp" required maxlength="2000" placeholder="번개 라운드 모집, 후기, 정보 공유 등 자유롭게 적어주세요"></textarea></div><div class="field"><label for="pi">사진 첨부 (선택)</label><input id="pi" type="file" accept="image/*" class="inp" style="padding:12px"></div><button class="btn block">등록</button></form>');
    document.getElementById('fPost').addEventListener('submit', function (e) { e.preventDefault(); var btn = e.target.querySelector('button.btn'); btn.disabled = true; var f = document.getElementById('pi').files[0]; (f ? shrink(f, 1100) : Promise.resolve('')).then(function (img) { var cat = val('pc'); return Store.add('posts', { cat: cat, authorId: S.me.id, name: S.me.name, body: val('pb'), img: img, at: Date.now(), likes: [], cc: 0, pin: cat === '공지' }).then(function (r) { if (cat === '공지') notify('all', 'notice', '새 공지', val('pb').slice(0, 60), 'talk', ''); return r; }); }).then(function () { closeSheet(); toast('등록되었습니다'); S.tab = 'talk'; S.sub.talk = '전체'; render(); }).catch(function () { btn.disabled = false; toast('등록하지 못했습니다'); }); });
  },
  postDel: function (d) { if (!confirm('이 글을 삭제할까요?')) return; Store.del('posts', d.id).then(function () { toast('삭제되었습니다'); render(true); }); },
  like: function (d, el) { Store.get('posts', d.id).then(function (p) { var l = p.likes || [], i = l.indexOf(S.me.id); if (i >= 0) l.splice(i, 1); else l.push(S.me.id); return Store.set('posts', d.id, { likes: l }, true).then(function () { p.likes = l; var n = document.getElementById('post-' + d.id); n.outerHTML = postCard(p); var nn = document.getElementById('post-' + d.id); nn.classList.add('in'); if (i < 0) nn.querySelector('[data-act=like]').classList.add('pop'); }); }); },
  cmOpen: function (d) {
    Store.list('comments', { where: ['postId', d.id], orderBy: 'at' }).then(function (cs) {
      sheet('<h3>댓글 ' + cs.length + '</h3><div class="stack" style="gap:14px">' + (cs.length ? cs.map(function (c) { return '<div class="row" style="align-items:flex-start">' + av(c.name, 34) + '<div class="grow"><div class="s13"><b>' + esc(c.name) + '</b> <span class="mute s12">' + ago(c.at) + '</span></div><div>' + nl(c.body) + '</div></div>' + (c.authorId === S.me.id || isAdmin() ? '<button class="icb" style="width:36px;height:36px" data-act="cmDel" data-id="' + c.id + '" data-post="' + d.id + '" aria-label="댓글 삭제">' + ic('trash', 16) + '</button>' : '') + '</div>'; }).join('') : '<p class="mute s13">첫 댓글을 남겨 보세요.</p>') + '</div><form id="fCm" class="row"><label class="sr" for="cb">댓글</label><input id="cb" class="inp grow" required maxlength="500" placeholder="댓글을 입력하세요"><button class="btn">등록</button></form>');
      document.getElementById('fCm').addEventListener('submit', function (e) { e.preventDefault(); Store.add('comments', { postId: d.id, authorId: S.me.id, name: S.me.name, body: val('cb'), at: Date.now() }).then(function () { return Store.set('posts', d.id, { cc: cs.length + 1 }, true); }).then(function () { ACT.cmOpen(d); afterTalk(); }); });
    });
  },
  cmDel: function (d) { Store.del('comments', d.id).then(function () { return Store.list('comments', { where: ['postId', d.post] }); }).then(function (cs) { return Store.set('posts', d.post, { cc: cs.length }, true); }).then(function () { ACT.cmOpen({ id: d.post }); afterTalk(); }); },
  photoNew: function () {
    sheet('<h3>사진 올리기</h3><form id="fPh" class="stack" style="gap:14px"><div class="field"><label for="hf">사진 선택</label><input id="hf" type="file" accept="image/*" class="inp" style="padding:12px" required></div><div class="field"><label for="hc">한 줄 설명</label><input id="hc" class="inp" maxlength="60" placeholder="예: 10월 월례회 단체 사진"></div><button class="btn block">올리기</button></form>');
    document.getElementById('fPh').addEventListener('submit', function (e) { e.preventDefault(); var btn = e.target.querySelector('button.btn'); btn.disabled = true; shrink(document.getElementById('hf').files[0], 1200).then(function (src) { return Store.add('photos', { src: src, cap: val('hc'), authorId: S.me.id, name: S.me.name, at: Date.now() }); }).then(function () { closeSheet(); toast('사진이 등록되었습니다'); render(true); }).catch(function () { btn.disabled = false; toast('업로드하지 못했습니다'); }); });
  },
  photoOpen: function (d) { var p = S._photos[+d.i], lb = document.createElement('div'); lb.className = 'lb'; lb.innerHTML = '<img src="' + esc(p.src) + '" alt="' + esc(p.cap || '') + '"><div style="text-align:center"><div class="b">' + esc(p.cap || '') + '</div><div class="s12" style="color:#C9D3CD">' + esc(p.name) + ' · ' + ago(p.at) + '</div></div><div class="row"><button class="btn w sm" data-x>닫기</button>' + (p.authorId === S.me.id || isAdmin() ? '<button class="btn red sm" data-del>삭제</button>' : '') + '</div>'; lb.addEventListener('click', function (e) { if (e.target.hasAttribute('data-del')) { if (confirm('이 사진을 삭제할까요?')) Store.del('photos', p.id).then(function () { lb.remove(); render(true); }); } else if (e.target === lb || e.target.hasAttribute('data-x')) lb.remove(); }); document.body.appendChild(lb); },
  meEdit: function () {
    sheet('<h3>내 정보 수정</h3><form id="fMe" class="stack" style="gap:14px"><div class="field"><label for="ma">연령대</label><select id="ma" class="inp">' + ['30대', '40대', '50대', '기타'].map(function (a) { return '<option' + (S.me.age === a ? ' selected' : '') + '>' + a + '</option>'; }).join('') + '</select></div><div class="field"><label for="mr">활동 지역</label><input id="mr" class="inp" value="' + esc(S.me.region || '') + '"></div><p class="s12 mute">이름·휴대폰 번호 변경은 운영진에게 요청해 주세요.</p><button class="btn block">저장</button></form>');
    document.getElementById('fMe').addEventListener('submit', function (e) { e.preventDefault(); var data = { age: val('ma'), region: val('mr') }; Store.set('members', S.me.id, data, true).then(function () { Object.assign(S.me, data); closeSheet(); toast('저장되었습니다'); return loadCore().then(render); }); });
  },
  approve: function (d) { Store.set('members', d.id, { status: 'approved', joined: Date.now() }, true).then(function () { toast(d.id.split('_')[0] + '님을 승인했습니다'); notify(d.id, 'member', '가입 승인 완료', '3050파크골프클럽 가입이 승인되었습니다. 월례회 참석 신청을 해보세요.', 'meet', ''); afterAdmin(); }); },
  reject: function (d) { if (!confirm('가입 신청을 거절하고 삭제할까요?')) return; Store.del('members', d.id).then(function () { return Store.del('members_private', d.id); }).then(afterAdmin); },
  payOf: function (d) { S.tab = 'admin'; S.sub.payEv = d.id; S.sub.payScroll = true; S.eventId = null; render(); },
  payToggle: function (d) { Store.set('rsvps', d.id, { paid: d.p !== '1' }, true).then(function () { toast(d.p === '1' ? '입금 확인을 취소했습니다' : '입금 확인 완료'); if (d.p !== '1' && d.id.indexOf('_guest') < 0) notify(d.id.slice(d.id.indexOf('_') + 1), 'pay', '참가비 입금 확인', '월례회 참가비 입금이 확인되었습니다.', 'my', ''); afterAdmin(); }).catch(function () { toast('저장 권한이 없습니다'); }); },
  joinPay: function (d) { Store.set('members', d.id, { joinPaid: d.v === '1' }, true).then(function () { toast(d.v === '1' ? '가입비 입금 확인 완료' : '가입비 확인을 취소했습니다'); if (d.v === '1') notify(d.id, 'pay', '가입비 입금 확인', '가입비 입금이 확인되었습니다. 감사합니다.', 'my', ''); closeSheet(); afterAdmin(); }).catch(function () { toast('저장 권한이 없습니다'); }); },
  feeEdit: function () {
    sheet('<h3>회비 · 계좌 설정</h3><p class="s13 mute">여기서 정한 금액이 가입 신청 화면과 월례회 등록 화면에 자동으로 표시됩니다. 월례회별 참가비는 월례회 등록·수정 화면에서 따로 바꿀 수 있습니다.</p><form id="fFee" class="stack" style="gap:14px"><div class="field"><label for="fj">가입비 (회원가입 시 1회)</label><input id="fj" class="inp" value="' + esc(S.settings.joinFee || '') + '" placeholder="예: 35,000원"></div><div class="field"><label for="fe">월례회 기본 참가비 (참석 신청자만 납부)</label><input id="fe" class="inp" value="' + esc(S.settings.eventFee || '') + '" placeholder="예: 25,000원"></div><div class="s13 b" style="margin-top:6px">입금 계좌</div><div class="field"><label for="ab">은행</label><input id="ab" class="inp" value="' + esc(acct().bank) + '"></div><div class="field"><label for="an">계좌번호 (숫자만)</label><input id="an" class="inp" inputmode="numeric" value="' + esc(acct().account) + '"></div><div class="field"><label for="ah">예금주</label><input id="ah" class="inp" value="' + esc(acct().holder) + '"></div><button class="btn block">저장</button></form>');
    document.getElementById('fFee').addEventListener('submit', function (e) { e.preventDefault(); var data = { joinFee: val('fj'), eventFee: val('fe'), acct: { bank: val('ab'), account: val('an').replace(/[^0-9-]/g, ''), holder: val('ah') } }; Store.set('settings', 'club', data, true).then(function () { Object.assign(S.settings, data); closeSheet(); toast('저장되었습니다'); afterAdmin(); }).catch(function () { toast('저장 권한이 없습니다'); }); });
  },
  linksEdit: function () {
    sheet('<h3>소통 채널 설정</h3><p class="s13 mute">홈페이지 곳곳의 단톡방·밴드 버튼이 이 주소로 연결됩니다. 단톡방을 새로 만들면 여기만 바꾸면 됩니다.</p><form id="fLinks" class="stack" style="gap:14px"><div class="field"><label for="lkk">카카오톡 단톡방(오픈채팅) 주소</label><input id="lkk" class="inp" inputmode="url" value="' + esc(links().kakao) + '"></div><div class="field"><label for="lkb">네이버 밴드 주소</label><input id="lkb" class="inp" inputmode="url" value="' + esc(links().band) + '"></div><button class="btn block">저장</button></form>');
    document.getElementById('fLinks').addEventListener('submit', function (e) { e.preventDefault(); var k = val('lkk'), b = val('lkb'); if (!/^https:\/\//.test(k) || !/^https:\/\//.test(b)) return toast('주소는 https:// 로 시작해야 합니다'); var data = { links: { kakao: k, band: b } }; Store.set('settings', 'club', data, true).then(function () { Object.assign(S.settings, data); closeSheet(); toast('저장되었습니다'); afterAdmin(); }).catch(function () { toast('저장 권한이 없습니다'); }); });
  },
  rolesEdit: function () {
    sheet('<h3>직책 설정</h3><p class="s13 mute">한 줄에 직책 하나씩 적어 주세요. 위에서부터 순서대로 표시됩니다. 이미 회원에게 지정된 직책명을 바꾸면 해당 회원의 직책은 회원 관리에서 다시 지정해 주세요.</p><form id="fRoles" class="stack" style="gap:14px"><div class="field"><label for="rl">직책 목록</label><textarea id="rl" class="inp" style="min-height:220px">' + esc(roleList().join('\n')) + '</textarea></div><button class="btn block">저장</button><button type="button" class="btn ghost block" data-act="rolesReset">기본값으로 되돌리기</button></form>');
    document.getElementById('fRoles').addEventListener('submit', function (e) { e.preventDefault(); var list = document.getElementById('rl').value.split('\n').map(function (x) { return x.trim(); }).filter(function (x, i, a) { return x && a.indexOf(x) === i; }).slice(0, 20); if (!list.length) return toast('직책을 하나 이상 입력해 주세요'); Store.set('settings', 'club', { roles: list }, true).then(function () { S.settings.roles = list; closeSheet(); toast('직책이 저장되었습니다'); afterAdmin(); }).catch(function () { toast('저장 권한이 없습니다'); }); });
  },
  rolesReset: function () { document.getElementById('rl').value = DEFAULT_ROLES.join('\n'); },
  memEdit: function (d) {
    var m = S.members.filter(function (x) { return x.id === d.id; })[0];
    sheet('<h3>' + esc(m.name) + ' 회원</h3><form id="fMem" class="stack" style="gap:14px"><div class="field"><label for="ro">직책</label><select id="ro" class="inp">' + roleList().concat(m.role && roleList().indexOf(m.role) < 0 ? [m.role] : []).map(function (r) { return '<option' + (m.role === r ? ' selected' : '') + '>' + esc(r) + '</option>'; }).join('') + '</select></div><label class="check"><input type="checkbox" id="ad"' + (m.admin ? ' checked' : '') + '><span><b>운영진 권한</b><br>회원 승인, 입금 확인, 월례회 등록·성적 입력, 클럽 설정이 가능합니다.</span></label><label class="check"><input type="checkbox" id="jp2"' + (m.joinPaid ? ' checked' : '') + '><span><b>가입비 납부 완료</b>' + (joinFee() ? '<br>가입비 ' + esc(joinFee()) : '') + '</span></label><button class="btn block">저장</button>' + (m.id !== S.me.id ? '<button type="button" class="btn ghost block" style="color:var(--red)" data-act="memOut" data-id="' + esc(m.id) + '">탈퇴 처리</button>' : '') + '</form>');
    document.getElementById('fMem').addEventListener('submit', function (e) { e.preventDefault(); if (m.id === S.me.id && !document.getElementById('ad').checked) return toast('본인의 운영진 권한은 해제할 수 없습니다'); Store.set('members', m.id, { role: val('ro'), admin: document.getElementById('ad').checked, joinPaid: document.getElementById('jp2').checked }, true).then(function () { closeSheet(); toast('저장되었습니다'); afterAdmin(); }); });
  },
  memOut: function (d) { if (!confirm('이 회원을 탈퇴 처리할까요? 회원 정보가 삭제됩니다.')) return; Store.del('members', d.id).then(function () { return Store.del('members_private', d.id); }).then(function () { closeSheet(); toast('탈퇴 처리되었습니다'); afterAdmin(); }); }
};
function val(id) { return document.getElementById(id).value.trim(); }
document.addEventListener('click', function (e) { var el = e.target.closest('[data-act]'); if (!el || el.disabled) return; var f = ACT[el.dataset.act]; if (f) { if (el.tagName === 'BUTTON' && el.type !== 'submit' || el.tagName !== 'BUTTON') e.preventDefault(); f(el.dataset, el, e); } });
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeSheet(); var lb = document.querySelector('.lb'); if (lb) lb.remove(); } });

/* ---------- 렌더 ---------- */
var VIEWS = { home: [vHome, afterHome], meet: [vMeet, afterMeet], rank: [vRank], talk: [vTalk, afterTalk], my: [vMy, afterMy], admin: [vAdmin, afterAdmin] };
var io;
function reveal() { if (!('IntersectionObserver' in window)) return document.querySelectorAll('.rv').forEach(function (n) { n.classList.add('in'); }); io = io || new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }); }, { rootMargin: '0px 0px -30px 0px' }); document.querySelectorAll('.rv:not(.in)').forEach(function (n, i) { n.style.transitionDelay = Math.min(i, 6) * 40 + 'ms'; io.observe(n); }); }
function render(keep) { var y = window.scrollY, v = VIEWS[S.tab] || VIEWS.home; swapSel = null; $app.innerHTML = demoBar() + inAppBar() + v[0]() + navbar(); if (v[1]) v[1](); reveal(); if (keep === true) window.scrollTo(0, y); }

Store = DEMO ? LocalStore() : FireStore();
Store.init().then(function () { return Store.getSession(); }).then(function (mid) { return mid ? Store.get('members', mid) : null; }).then(function (m) { if (m && m.status === 'approved') S.me = m; return loadCore(); }).then(render).catch(function (err) { console.error(err); $app.innerHTML = '<div style="padding:60px 24px;text-align:center"><h1 class="disp" style="font-size:24px;color:var(--g)">연결에 문제가 있습니다</h1><p class="mute" style="margin-top:8px">잠시 후 다시 시도해 주세요. 문제가 계속되면 firebase-config.js 설정과 Firestore 규칙을 확인해 주세요.</p></div>'; });
})();
