/* Movikids · Landing interactiva (HU 01-48 core). Estado en memoria, sin backend. */
'use strict';
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const h = (t, p = {}, ...k) => { const e = document.createElement(t);
  for (const [a, v] of Object.entries(p)) (a in e && !a.includes('-')) ? e[a] = v : e.setAttribute(a, v);
  k.forEach(x => e.append(x)); return e; };
const fm = m => { m = Math.max(0, Math.round(m)); return m >= 60 ? `${m / 60 | 0} h${m % 60 ? ' ' + (m % 60) + ' min' : ''}` : `${m} min`; };
const say = t => { if (S.voice && 'speechSynthesis' in window) { const u = new SpeechSynthesisUtterance(t); u.lang = 'es-PE'; u.rate = .9; u.pitch = 1.2; speechSynthesis.speak(u); } };
const L = ['L', 'M', 'M', 'J', 'V', 'S', 'D'], mailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

const S = {
  acct: { mail: 'padre@movikids.app', pw: 'movikids1' }, in: false, tok: false, saved: true, fresh: false,
  kid: { nick: 'Lucho', age: 6 }, limit: 120, used: 70, extra: 0, pending: { min: 10 }, paused: false, done: false,
  streak: 5, points: 120, use: [70, 95, 60, 120, 80, 45, 110], cl: [':)', ':)', ':|', ':)', ':(', ':|', ':)'],
  days: ['✓', '✓', '✓', '✓', '✓', '✗', '—'], voice: true, notify: true, night: { on: true, from: '21:00', to: '07:00' },
  rules: { 'Terminar la tarea': 1, 'Terminar de comer': 1, 'Ordenar los juguetes': 0, 'Cepillarse los dientes': 0 },
  acts: { 'Dibujar': 1, 'Jugar con la pelota': 1, 'Jugar con juguetes': 0, 'Ayudar en casa': 0, 'Escuchar un cuento': 0, 'Jugar con muñecas': 1 },
  cg: [], nt: [{ t: 'terminó su tiempo de hoy', s: 'Dentro del límite', w: 'Ahora' }, { t: 'terminó su tiempo de hoy', s: 'Con 10 min extra aprobados', w: 'Ayer' }],
  code: null, exp: 0, age: null, draft: 60
};
S.kids = [S.kid]; S.cur = 0; S.adding = false; // varios niños: el estado de cada uno se guarda en su objeto (ver stash/load)
const T = { home: 'Movikids', registro: 'Crear cuenta', login: 'Iniciar sesión', forgot: 'Recuperar acceso', forgotok: 'Revisa tu correo', reset: 'Nueva contraseña', consent: 'Aviso de privacidad', perfil: 'Perfil del niño', limite: 'Límite diario',
  inicio: 'Dashboard', control: 'Control de tiempo', informes: 'Informes', descanso: 'Horario de descanso', reglas: 'Reglas del hogar', cuidadores: 'Cuidadores', notif: 'Notificaciones', privacidad: 'Privacidad', config: 'Configuración', nino: 'Vista del niño' };
const KV = ['inicio', 'control', 'informes', 'notif', 'config', 'nino']; // vistas que dependen del niño elegido
const AUTH = ['home', 'registro', 'login', 'forgot', 'forgotok', 'reset', 'consent', 'perfil', 'limite'];
const total = () => S.limit + S.extra, left = () => Math.max(0, total() - S.used), calm = () => S.cl.filter(x => x === ':)').length;
const sel = o => Object.keys(o).filter(k => o[k]);
const byAge = a => a <= 5 ? 0 : a <= 7 ? 1 : 2;
const msgs = { // HU-44: avisos adaptados a la edad
  warn: n => [`¡${n}, ya casi! Quedan 5 minutitos.`, `${n}, quedan 5 minutos. Vamos guardando lo que haces.`, `${n}, quedan 5 minutos de pantalla. Termina lo que haces y guarda tu avance.`],
  rest: n => [`¡Hora de descansar, ${n}! Vamos a jugar sin pantalla.`, `Terminó tu tiempo de hoy, ${n}. Elige una actividad.`, `Tu tiempo de hoy terminó, ${n}. Elige una actividad sin pantalla y vuelve mañana.`]
};
const reset = () => Object.assign(S, { used: 0, extra: 0, pending: null, streak: 0, points: 0, cl: [], days: Array(7).fill('—'), use: Array(7).fill(0), done: false, paused: false, nt: [] });

/* ---------- Navegación ---------- */
function go(v) {
  if (!AUTH.includes(v) && !S.in) v = 'login';
  if (v === 'reset') { $('#f-res').hidden = !S.tok; $('#n-exp').hidden = S.tok; }
  $$('.view').forEach(e => e.classList.toggle('on', e.id === 'v-' + v));
  document.body.classList.toggle('auth', AUTH.includes(v));
  $$('#side [data-go]').forEach(b => b.dataset.go === v ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current'));
  syncNav(v);
  $('#kids').hidden = !KV.includes(v);
  $('#ttl').textContent = T[v]; render(); scrollTo(0, 0);
  const f = v === 'home' ? $('#v-home h2') : $('#ttl'); f.tabIndex = -1; f.focus({ preventScroll: true });
}
document.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) go(b.dataset.go); });

/* ---------- Menú desplegable en móvil (heurísticas de Nielsen: estado visible, control del usuario, reconocer antes que recordar) ---------- */
const side = $('#side'), navT = $('#navtoggle');
function setNav(open, back) {
  side.classList.toggle('open', open); navT.setAttribute('aria-expanded', String(open));
  if (!open && back) navT.focus();
}
function syncNav(v) { // muestra en el botón la sección actual y cierra la lista
  const cur = $('#side [data-go="' + v + '"]'); setNav(false);
  if (!cur) return;
  $('#nt-txt').textContent = cur.textContent.trim();
  $('#nt-ico').innerHTML = cur.querySelector('svg').outerHTML;
}
navT.addEventListener('click', () => setNav(!side.classList.contains('open')));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && side.classList.contains('open')) setNav(false, true); });
document.addEventListener('click', e => { if (side.classList.contains('open') && !e.target.closest('#side')) setNav(false); });
matchMedia('(min-width:901px)').addEventListener('change', () => setNav(false));
document.addEventListener('click', e => { const b = e.target.closest('[data-eye]'); if (b) { const i = $('#' + b.dataset.eye); i.type = i.type === 'password' ? 'text' : 'password'; } });

/* ---------- Diálogo accesible reutilizable ---------- */
const dlg = $('#dlg'); let cb = null;
function ask(t, p, ok, fn, solo) { $('#d-t').textContent = t; $('#d-p').textContent = p; $('#d-ok').textContent = ok; $('#d-cancel').hidden = !!solo; cb = fn; dlg.showModal(); }
$('#d-ok').onclick = () => { dlg.close(); if (cb) cb(); }; $('#d-cancel').onclick = () => dlg.close();

/* ---------- Render ---------- */
function render() {
  renderKids();
  const val = { kid: S.kid.nick, used: S.used, limit: S.limit, left: left(), streak: S.streak, points: S.points, extra: S.extra, calm: calm() };
  $$('[data-b]').forEach(e => { let v = val[e.dataset.b]; const f = e.dataset.f;
    e.textContent = f === 'min' ? fm(v) : f === 'yn' ? (v > 0 ? `sí (${v} min)` : 'no') : v; });
  const txt = `Usaste ${fm(S.used)} de ${fm(total())} · Te quedan ${fm(left())}`;
  $('#rep').textContent = $('#rep2').textContent = txt;
  const pct = Math.min(100, Math.round(S.used / total() * 100)); $('#pg-i').style.width = pct + '%'; $('#pg').setAttribute('aria-valuenow', pct);
  $('#rep-s').textContent = left() > 0 ? 'Estado: dentro del límite' : 'Estado: terminó el tiempo de hoy';
  $('#paused').hidden = !S.paused;
  const r = S.pending; $('#req').textContent = r ? `${S.kid.nick} pidió «un ratito más»: ${r.min} min. Le quedan ${left()} min.` : 'Sin solicitudes pendientes.';
  $('#req-y').disabled = $('#req-n').disabled = !r;
  $('#l-v').textContent = S.draft; $('#l-bar').style.width = (S.draft - 30) / 150 * 100 + '%';
  $('#k-rules').textContent = sel(S.rules).join(', ').toLowerCase() || 'sin condiciones';
  const row = (arr, fn) => arr.map(fn);
  $('#days-p').replaceChildren(...row(S.days, (d, i) => h('p', {}, L[i], h('b', {}, d))));
  $('#days-k').replaceChildren(...row(S.days, (d, i) => h('p', {}, L[i], h('b', {}, d))));
  $('#days-c').replaceChildren(...row(S.cl.length ? S.cl : Array(7).fill('—'), (d, i) => h('p', {}, L[i], h('b', {}, d))));
  $('#cl-sum').replaceChildren(...[[':)', 'Cierres tranquilos'], [':|', 'Con molestia'], [':(', 'Con rabieta']].map(([k, n]) => h('p', { className: 'stat' }, h('b', {}, `${k} ${S.cl.filter(x => x === k).length}`), n)));
  // HU-28 barras
  const max = Math.max(S.limit, ...S.use) * 1.1, names = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  $('#bars').setAttribute('aria-label', 'Uso diario frente al límite: ' + S.use.map((u, i) => `${names[i]} ${fm(u)}`).join(', ') + `. Límite: ${fm(S.limit)}.`);
  $('#bars').replaceChildren(...S.use.map((u, i) => h('div', { style: `height:${u / max * 100}%` }, h('span', {}, L[i]))), h('hr', { style: `bottom:${S.limit / max * 100}%`, title: 'Límite diario' }));
  const avg = S.use.reduce((a, b) => a + b, 0) / 7, diff = Math.round(avg - 63);
  $('#wk').replaceChildren(...[[fm(avg), 'Promedio diario'], [(diff >= 0 ? 'Subió ' : 'Bajó ') + fm(Math.abs(diff)), 'Frente a la semana anterior'], [S.use.filter(u => u >= S.limit).length + ' día(s)', 'Con el tiempo completo usado']].map(([a, b]) => h('p', { className: 'stat' }, h('b', {}, a), b)));
  $('#rules').replaceChildren(...Object.keys(S.rules).map(k => h('label', { className: 'chk' }, h('input', { type: 'checkbox', checked: !!S.rules[k], onchange: ev => tog(S.rules, k, ev.target, 3, 0, '#r-m') }), k)));
  $('#acts').replaceChildren(...Object.keys(S.acts).map(k => h('label', { className: 'chk' }, h('input', { type: 'checkbox', checked: !!S.acts[k], onchange: ev => tog(S.acts, k, ev.target, 99, 2, '#a-m') }), k)));
  $('#r-prev').textContent = `Hoy: ${fm(S.limit)} · Primero: ${sel(S.rules).join(', ').toLowerCase() || '—'}`;
  $('#cu-list').replaceChildren(h('li', {}, 'Tú (titular)', h('small', {}, 'Edita el límite diario')), ...S.cg.map((c, i) => h('li', {}, h('span', {}, c.name, h('small', {}, 'Ve límite, tiempo restante y reglas; recibe solicitudes')), h('button', { className: 'btn sec', onclick: () => ask('¿Quitar a este cuidador?', 'Dejará de acceder a las reglas del hogar y de recibir solicitudes del niño.', 'Quitar cuidador', () => { S.cg.splice(i, 1); render(); }) }, 'Quitar'))));
  const nts = S.notify ? S.nt : [];
  $('#nt-list').replaceChildren(...(nts.length ? nts.map(n => h('li', {}, h('span', {}, `${S.kid.nick} ${n.t}`, h('small', {}, n.s)), n.w)) : [h('li', {}, 'Sin avisos todavía.')]));
  const sub5 = t => { let [a, b] = t.split(':').map(Number); a = (a * 60 + b - 5 + 1440) % 1440; return `${String(a / 60 | 0).padStart(2, '0')}:${String(a % 60).padStart(2, '0')}`; };
  $('#n-a').textContent = sub5(S.night.from); $('#n-b').textContent = `${S.night.from} – ${S.night.to}`;
}
function tog(o, k, box, max, min, msg) { // HU-39 máx. 3 · HU-42 mín. 2
  const n = sel(o).length + (box.checked ? 1 : -1);
  if (box.checked && n > max) { box.checked = false; $(msg).textContent = `Máximo ${max} condiciones.`; return; }
  if (!box.checked && n < min) { box.checked = true; $(msg).textContent = `Deben quedar al menos ${min} activas.`; return; }
  o[k] = box.checked ? 1 : 0; $(msg).textContent = ''; render();
}

/* ---------- HU-01 Registro · HU-02 Login · HU-31 Recuperación ---------- */
$('#f-reg').onsubmit = e => { e.preventDefault(); const m = $('#r-mail').value.trim(), p = $('#r-pw').value, er = $('#r-err');
  if (!mailOk(m)) return er.textContent = 'Escribe un correo válido, por ejemplo nombre@gmail.com.';
  if (p.length < 8) return er.textContent = 'La contraseña debe tener al menos 8 caracteres.';
  er.textContent = ''; S.acct = { mail: m, pw: p }; S.in = true; S.saved = false; S.fresh = true; go('consent'); };
$('#f-log').onsubmit = e => { e.preventDefault(); const m = $('#l-mail').value.trim(), p = $('#l-pw').value, er = $('#l-err');
  if (!mailOk(m) || !p) return er.textContent = 'Completa tu correo y tu contraseña.';
  if (m !== S.acct.mail || p !== S.acct.pw) return er.textContent = 'Correo o contraseña incorrectos. Revisa los datos e inténtalo de nuevo.';
  er.textContent = ''; S.in = true; go(S.saved ? 'inicio' : 'consent'); };
$('#f-for').onsubmit = e => { e.preventDefault(); const er = $('#o-err');
  if (!mailOk($('#o-mail').value.trim())) return er.textContent = 'Escribe un correo válido.';
  er.textContent = ''; S.tok = true; go('forgotok'); }; // misma respuesta exista o no la cuenta
$('#f-res').onsubmit = e => { e.preventDefault(); const a = $('#n-pw').value, b = $('#n-pw2').value, er = $('#n-err');
  if (a.length < 8) return er.textContent = 'La contraseña debe tener al menos 8 caracteres.';
  if (a !== b) return er.textContent = 'Las contraseñas no coinciden.';
  er.textContent = ''; S.acct.pw = a; S.tok = false; ask('Contraseña actualizada', 'Ya puedes iniciar sesión con tu nueva contraseña.', 'Ir a iniciar sesión', () => go('login'), true); };

/* ---------- HU-09 Consentimiento ---------- */
$('#c-yes').onclick = () => { if (!$('#c-ok').checked) return $('#c-err').textContent = 'Marca la casilla para dar tu consentimiento.'; $('#c-err').textContent = ''; go('perfil'); };
$('#c-no').onclick = () => ask('Sin consentimiento no podemos continuar', 'No se crea el perfil del niño ni se guardan sus datos.', 'Entendido', () => go('registro'), true);

/* ---------- HU-04 Perfil · HU-03 Código ---------- */
$('#p-age').replaceChildren(...[4, 5, 6, 7, 8, 9].map(a => h('button', { type: 'button', className: 'chip', textContent: a, 'aria-pressed': 'false', onclick: ev => { S.age = a; $$('#p-age .chip').forEach(c => c.setAttribute('aria-pressed', String(c === ev.currentTarget))); } })));
let timer; const gen = () => { S.code = String(1000 + Math.random() * 9000 | 0); S.exp = Date.now() + 15 * 60e3; $('#code').textContent = S.code.split('').join(' '); $('#code').setAttribute('aria-label', 'Código ' + S.code.split('').join(' ')); clearInterval(timer); tick(); timer = setInterval(tick, 1000); };
const tick = () => { const s = Math.max(0, Math.round((S.exp - Date.now()) / 1000)); $('#code-t').textContent = s ? `Vence en ${String(s / 60 | 0).padStart(2, '0')}:${String(s % 60).padStart(2, '0')} (válido 15 minutos)` : 'El código venció. Genera uno nuevo.'; };
/* ---------- Varios niños: guardar, elegir y añadir ---------- */
const PER = ['limit', 'used', 'extra', 'pending', 'paused', 'done', 'streak', 'points', 'use', 'cl', 'days', 'code', 'exp', 'nt'];
const stash = () => { const k = S.kids[S.cur]; if (k) PER.forEach(p => k[p] = S[p]); }; // guarda el estado del niño activo en su perfil
const load = i => { S.cur = i; S.kid = S.kids[i]; PER.forEach(p => { if (p in S.kid) S[p] = S.kid[p]; }); }; // carga el estado del niño elegido
const dup = (n, pool) => pool.some(k => k.nick.toLowerCase() === n.toLowerCase());
function resetKidView() {
  $('#rest').hidden = true; $('#k-t').textContent = 'Pantalla del niño';
  $('#k-m').replaceChildren('Tiempo restante: ', h('b', { 'data-b': 'left', 'data-f': 'min' }));
  $$('[data-cl]').forEach(x => x.setAttribute('aria-checked', String(x.dataset.cl === S.cl[6])));
  ['#cl-msg', '#req-m', '#renew-m', '#d-msg', '#a-msg', '#e-ok', '#e-err', '#d-err'].forEach(q => { const e = $(q); if (e) e.textContent = ''; });
}
function fillEdit() { $('#e-nick').value = S.kid.nick; $('#e-age').value = S.kid.age || 6; }
let kSig = '';
function renderKids() { // chips de niños + "Añadir niño"; solo se reconstruyen si cambian (así no se pierde el foco)
  const sig = S.kids.map(k => k.nick).join('|') + '#' + S.cur; if (sig === kSig) return; kSig = sig;
  $('#kids').replaceChildren(...S.kids.map((k, i) => h('button', { type: 'button', className: 'chip' + (i === S.cur ? ' on' : ''), 'aria-pressed': String(i === S.cur), onclick: () => pick(i) }, k.nick)),
    h('button', { type: 'button', className: 'chip add', onclick: () => openProfile(true) }, '+ Añadir niño'));
}
function pick(i) {
  if (i === S.cur) return; stash(); load(i); resetKidView(); fillEdit(); render();
  $('#kids-m').textContent = `Mostrando el panel de ${S.kid.nick}.`; const on = $('#kids [aria-pressed=true]'); if (on) on.focus();
}
function openProfile(adding) { // adding = true: se conserva el niño actual y se crea uno nuevo
  if (adding) { stash(); S.code = null; S.exp = 0; }
  S.adding = adding; S.age = null; clearInterval(timer);
  $('#p-nick').value = ''; $$('#p-age .chip').forEach(c => c.setAttribute('aria-pressed', 'false')); $('#p-err').textContent = '';
  $('#code').textContent = '– – – –'; $('#code').setAttribute('aria-label', 'Código de vinculación'); $('#code-t').textContent = 'Guarda el perfil para generar el código.';
  $('#p-cancel').hidden = !adding; $('#p-t').textContent = adding ? 'Añade a otro hijo y vincula' : 'Registra a tu hijo y vincula';
  go('perfil'); $('#p-nick').focus();
}
$('#p-cancel').onclick = () => { S.adding = false; clearInterval(timer); load(S.cur); go('inicio'); };
$('#f-per').onsubmit = e => { e.preventDefault(); const n = $('#p-nick').value.trim(), er = $('#p-err');
  if (!n || n.length > 20) return er.textContent = 'Escribe un apodo de 1 a 20 caracteres.';
  if (!S.age) return er.textContent = 'Elige la edad del niño (4 a 9 años).';
  const create = S.adding || S.fresh || !S.kids.length;
  if (dup(n, S.fresh ? [] : create ? S.kids : S.kids.filter(k => k !== S.kid))) return er.textContent = 'Ya tienes un niño con ese apodo. Elige otro para distinguirlos.';
  er.textContent = '';
  if (create) { // HU-04: el niño nuevo se guarda y los anteriores se conservan
    if (S.fresh) { S.kids = []; S.cur = 0; } else if (S.kids.length) stash();
    S.kid = { nick: n, age: S.age }; S.kids.push(S.kid); S.cur = S.kids.length - 1;
    reset(); S.limit = S.draft = 60; S.fresh = false; S.adding = false; $('#p-cancel').hidden = true; resetKidView();
  } else { S.kid.nick = n; S.kid.age = S.age; }
  S.saved = true; gen(); };
$('#regen').onclick = () => S.saved && !S.adding ? gen() : $('#p-err').textContent = 'Primero guarda el perfil del niño.';
$('#share').onclick = () => S.code ? ask('Código para vincular', `Introduce este código en la app del niño: ${S.code}. Es numérico, de 4 dígitos y válido durante 15 minutos.`, 'Volver al código', null, true) : $('#p-err').textContent = 'Primero guarda el perfil del niño.';
$('#p-next').onclick = () => S.code ? go('limite') : $('#p-err').textContent = 'Guarda el perfil y vincula antes de continuar.';

/* ---------- HU-06 Límite inicial ---------- */
$('#l-m').onclick = () => { S.draft = Math.max(30, S.draft - 15); render(); }; $('#l-p').onclick = () => { S.draft = Math.min(180, S.draft + 15); render(); };
$('#l-go').onclick = () => { S.limit = S.draft; go('inicio'); };

/* ---------- HU-10 Informe · HU-40 Cierre · HU-26 Pausa · HU-29 Solicitud ---------- */
$$('[data-cl]').forEach(b => b.onclick = () => { S.cl[6] = b.dataset.cl; $$('[data-cl]').forEach(x => x.setAttribute('aria-checked', String(x === b))); $('#cl-msg').textContent = 'Cierre registrado. Aparece en el informe diario y el historial semanal.'; render(); });
$('#cl-skip').onclick = () => { $$('[data-cl]').forEach(x => x.setAttribute('aria-checked', 'false')); $('#cl-msg').textContent = 'Omitido. Puedes registrarlo más tarde.'; };
$('#pause').onclick = () => ask('¿Pausar ahora?', 'La mascota acompañará al niño en un cierre amable de hasta 30 segundos. El tiempo restante se conserva.', 'Confirmar pausa', () => { S.paused = true; render(); });
$('#resume').onclick = () => { S.paused = false; render(); };
$('#req-y').onclick = () => { S.extra += S.pending.min; $('#req-m').textContent = `Tiempo extra aprobado: se suman ${S.pending.min} min al día de hoy. No se acumula para mañana.`; S.pending = null; render(); };
$('#req-n').onclick = () => { S.pending = null; $('#req-m').textContent = 'Solicitud respondida: no se añade tiempo extra y el cierre continúa con normalidad.'; render(); };

/* ---------- HU-08 Límite · HU-32 Renovación ---------- */
$$('[data-adj] .chip').forEach(c => c.onclick = () => { const i = c.parentNode.dataset.adj === '1' ? '#a-up' : '#a-dn'; if (c.dataset.v) $(i).value = c.dataset.v; else $(i).focus(); });
$('#a-yes').onclick = () => { const n = parseInt($('#a-up').value), m = $('#a-msg'); m.hidden = false;
  if (!(n > 0) || S.limit + n > 480) return m.textContent = 'Escribe minutos entre 1 y ' + (480 - S.limit) + '.';
  S.limit += n; render(); m.textContent = `Listo: el tiempo restante pasa a ${fm(left())}.`; };
$('#d-yes').onclick = () => { const n = parseInt($('#a-dn').value), m = $('#d-msg');
  if (!(n > 0) || S.limit - n < 15) return m.textContent = 'El límite no puede quedar por debajo de 15 min.';
  S.limit -= n; render(); m.textContent = S.used > total() ? 'Límite reducido: el tiempo restante será 0 y el niño pasa al cierre amable.' : `Límite reducido a ${fm(S.limit)}. Tiempo restante: ${fm(left())}.`; };
$('#renew').onclick = () => { S.used = 0; S.extra = 0; S.done = false; render(); $('#renew-m').textContent = `Nuevo día: el tiempo vuelve a ${fm(S.limit)}.`; };

/* ---------- HU-28 / 17 / 18 / 19 / 40 Informes ---------- */
$$('[data-tab]').forEach(t => t.onclick = () => { $$('[data-tab]').forEach(x => x.setAttribute('aria-selected', String(x === t))); $$('.tp').forEach(p => p.hidden = p.id !== 't-' + t.dataset.tab); });

/* ---------- HU-35 Descanso nocturno ---------- */
$('#n-on').onchange = e => { $('#n-from').disabled = $('#n-to').disabled = !e.target.checked; };
$('#n-save').onclick = () => { const a = $('#n-from').value, b = $('#n-to').value, er = $('#n-e');
  if (!a || !b || a === b) return er.textContent = 'Elige una hora de inicio y otra de fin distintas.';
  er.textContent = ''; S.night = { on: $('#n-on').checked, from: a, to: b }; render(); $('#n-m').textContent = S.night.on ? `Horario guardado: de ${a} a ${b}.` : 'Horario desactivado.'; };

/* ---------- HU-39 Reglas · HU-42 Actividades ---------- */
const addTo = (o, inp, msg, max) => { const v = $(inp).value.trim(), m = $(msg);
  if (!v || v.length > 30) return m.textContent = 'Escribe un texto de 1 a 30 caracteres.';
  if (Object.keys(o).some(k => k.toLowerCase() === v.toLowerCase())) return m.textContent = 'Ya existe en la lista.';
  o[v] = max && sel(o).length >= max ? 0 : 1; $(inp).value = ''; m.textContent = `Agregado: ${v}.`; render(); };
$('#r-add').onclick = () => addTo(S.rules, '#r-new', '#r-m', 3); $('#a-add').onclick = () => addTo(S.acts, '#a-new', '#a-m', 0);
$('#rl-save').onclick = () => { $('#rl-m').textContent = `Reglas guardadas. ${S.kid.nick} las verá en su panel con íconos.`; };

/* ---------- HU-24 Cuidadores ---------- */
$('#cu-go').onclick = () => { const n = $('#cu-n').value.trim(); if (!n) return $('#cu-e').textContent = 'Escribe el nombre del cuidador.';
  $('#cu-e').textContent = ''; const t = Array.from({ length: 6 }, () => 'abcdefghjkmnpqrstuvwxyz23456789'[Math.random() * 31 | 0]).join('');
  S.cg.push({ name: n }); $('#cu-link').textContent = `movikids.app/invitar/${t}`; $('#cu-box').hidden = false; $('#cu-n').value = ''; render(); };
$('#cu-copy').onclick = () => navigator.clipboard?.writeText($('#cu-link').textContent).then(() => $('#cu-m').textContent = 'Enlace copiado.', () => $('#cu-m').textContent = 'Copia el enlace manualmente.');

/* ---------- HU-27 / HU-38 Notificaciones ---------- */
$('#nt-end').onchange = e => { S.notify = e.target.checked; render(); };
$('#nt-voice').onchange = e => { S.voice = e.target.checked; if (S.voice) say('Hola, soy tu mascota. Te avisaré con calma.'); };

/* ---------- HU-47 / HU-09 Privacidad ---------- */
$('#pv-rights').onclick = () => ask('Tus derechos sobre los datos', 'Puedes solicitar acceso, rectificación, cancelación y oposición al tratamiento de los datos del niño. Escribe a privacidad@movikids.app.', 'Volver a privacidad', null, true);
$('#pv-aviso').onclick = () => ask('Aviso de privacidad', 'Datos: apodo, edad, tiempos de uso y rachas. Finalidad: gestionar el cierre del tiempo de pantalla. Acceso: tú y, si lo autorizas, el psicólogo. Derechos: acceso, rectificación, cancelación y oposición.', 'Volver a privacidad', null, true);

/* ---------- HU-25 Editar · HU-44 · HU-33 Eliminar · HU-48 Cerrar sesión ---------- */
$('#e-age').replaceChildren(...[4, 5, 6, 7, 8, 9].map(a => h('option', { value: a, textContent: a + ' años' })));
document.querySelector('[data-go=config]').addEventListener('click', fillEdit);
$('#f-ed').onsubmit = e => { e.preventDefault(); const n = $('#e-nick').value.trim(), a = +$('#e-age').value;
  if (!n || n.length > 20) return $('#e-err').textContent = 'El apodo debe tener de 1 a 20 caracteres.';
  if (a < 4 || a > 9) return $('#e-err').textContent = 'Error: la edad debe estar entre 4 y 9 años.';
  if (dup(n, S.kids.filter(k => k !== S.kid))) return $('#e-err').textContent = 'Ya tienes un niño con ese apodo. Elige otro.';
  $('#e-err').textContent = ''; S.kid.nick = n; S.kid.age = a; render(); $('#e-ok').textContent = 'Cambios guardados. La mascota ajustó sus mensajes a la nueva edad.'; };
$('#d-go').onclick = () => { if ($('#d-pw').value !== S.acct.pw) return $('#d-err').textContent = 'Contraseña incorrecta: la acción se canceló.';
  $('#d-err').textContent = ''; $('#d-pw').value = ''; const gone = S.kid.nick; S.kids.splice(S.cur, 1);
  if (S.kids.length) { // quedan otros niños: se conservan y se muestra el primero
    load(0); resetKidView(); fillEdit(); render();
    return ask('Perfil de ' + gone + ' eliminado', 'Se eliminaron su historial, sus rachas, sus puntos y el vínculo del dispositivo. Los demás perfiles se conservan. Enviamos una confirmación a tu correo.', 'Volver al panel', () => go('inicio'), true); }
  reset(); S.saved = false; S.code = null; S.kid = { nick: 'Niño', age: null }; S.age = null; S.fresh = false; S.cur = 0; resetKidView();
  ask('Perfil del niño eliminado', 'Se eliminaron el historial, las rachas, los puntos y el vínculo del dispositivo. Enviamos una confirmación a tu correo.', 'Añadir otro niño', () => openProfile(false), true); };
const logout = () => ask('¿Confirmas cerrar sesión?', 'El panel queda protegido. Las reglas y el temporizador del niño siguen activos aunque cierres tu sesión.', 'Sí, cerrar sesión', () => { S.in = false; go('login'); });
$('#out').onclick = $('#logout').onclick = logout;

/* ---------- HU-12 / 15 / 17 / 18 / 19 / 38 / 44 · Vista del niño ---------- */
const kid = (t, m) => { $('#k-t').textContent = t; $('#k-m').textContent = m; say(m); };
$('#k-5').onclick = () => { S.used = Math.max(S.used, total() - 5); render(); kid('¡Aviso amable!', msgs.warn(S.kid.nick)[byAge(S.kid.age || 6)]); };
$('#k-more').onclick = () => { if (S.pending) return kid('Ya lo pedimos', 'Ya avisamos a tu papá o mamá. Espera su respuesta.'); S.pending = { min: 10 }; render(); kid('¡Pedido enviado!', 'Le preguntamos a tu papá o mamá si hay un ratito más.'); };
$('#k-end').onclick = () => { S.used = total(); if (S.notify) S.nt.unshift({ t: 'terminó su tiempo de hoy', s: S.extra ? `Con ${S.extra} min extra aprobados` : 'Dentro del límite', w: 'Ahora' });
  const a = sel(S.acts).slice(0, 3); kid('Pantalla de descanso', msgs.rest(S.kid.nick)[byAge(S.kid.age || 6)]);
  $('#rest').hidden = false; $('#rest-t').textContent = 'Actividades sin pantalla:'; $('#rest-a').replaceChildren(...a.map(x => h('li', {}, x))); render(); $('#k-ok').focus(); };
$('#k-ok').onclick = () => { if (!S.done) { S.done = true; S.streak++; S.points += 10; S.days[6] = '✓'; } render(); kid('¡Muy bien!', `¡Cerraste con calma, ${S.kid.nick}! +10 puntos. Tu racha es de ${S.streak} días.`); };
$('#k-no').onclick = () => { S.streak = 0; S.days[6] = '✗'; render(); kid('No pasa nada', `No pasa nada, ${S.kid.nick}. Mañana lo intentamos juntos. No perdiste tus puntos.`); };

go('home');
