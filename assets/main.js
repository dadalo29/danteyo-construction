(function () {
  // Menu mobile
  var bur = document.querySelector('.burger'), mn = document.getElementById('mnav');
  if (bur && mn) {
    bur.addEventListener('click', function () {
      var o = mn.classList.toggle('open');
      bur.setAttribute('aria-expanded', o);
      bur.setAttribute('aria-label', o ? 'Fermer le menu' : 'Ouvrir le menu');
    });
  }

  // Apparitions au défilement
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    els.forEach(function (el) { obs.observe(el); });
  } else { els.forEach(function (el) { el.classList.add('in'); }); }

  // Filtres des références
  var fl = document.querySelector('.filters');
  if (fl) {
    var bs = fl.querySelectorAll('button'), cards = document.querySelectorAll('.rgrid [data-cat]');
    bs.forEach(function (b) {
      b.addEventListener('click', function () {
        bs.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        var c = b.getAttribute('data-f');
        cards.forEach(function (k) { k.style.display = (c === 'Tous' || k.getAttribute('data-cat') === c) ? '' : 'none'; });
      });
    });
  }

  // Diaporama des réalisations
  var sl = document.querySelector('[data-slider]');
  if (sl) {
    var data = JSON.parse(sl.getAttribute('data-slider')), i = 0;
    var im = sl.querySelector('img'), tit = sl.querySelector('.cap b'), pl = sl.querySelector('.cap div span'), cnt = sl.querySelector('.cnt');
    var tb = document.querySelectorAll('.thumbs button');
    var show = function (k) {
      i = (k + data.length) % data.length;
      im.style.opacity = 0;
      setTimeout(function () { im.src = data[i][0]; im.alt = data[i][1]; im.style.opacity = 1; }, 160);
      tit.textContent = data[i][1]; pl.textContent = data[i][2]; cnt.textContent = (i + 1) + ' / ' + data.length;
      tb.forEach(function (b, j) { b.classList.toggle('on', j === i); });
    };
    tb.forEach(function (b, k) { b.addEventListener('click', function () { show(k); }); });
    document.querySelectorAll('[data-go]').forEach(function (b) {
      b.addEventListener('click', function () { show(i + (+b.getAttribute('data-go'))); });
    });
  }

  // Estimateur (barème indicatif à valider par Danteyo)
  var surf = document.getElementById('surf');
  if (surf) {
    var rates = { 'Économique': 160000, 'Moyen': 230000, 'Haut standing': 360000 };
    var regs = ['Dakar', 'Thiès', 'Diourbel', 'Fatick', 'Kaffrine', 'Kaolack', 'Kédougou', 'Kolda', 'Louga', 'Matam', 'Saint-Louis', 'Sédhiou', 'Tambacounda', 'Ziguinchor'];
    var lvls = ['RDC', 'R+1', 'R+2', 'R+3'], lv = 1, st = 'Moyen';
    var go = [['Travaux préparatoires', .05], ['Fondations', .15], ['Élévation & structure', .25], ['Réseaux (câblage, tuyauterie)', .10]];
    var so = [['Électricité', .08], ['Sanitaires', .08], ['Carrelage', .09], ['Menuiserie', .10], ['Peinture', .05], ['Étanchéité', .05]];
    var sel = document.getElementById('reg');
    sel.innerHTML = regs.map(function (r) { return '<option>' + r + '</option>'; }).join('');
    var pills = function (id, arr, cur, cb) {
      var el = document.getElementById(id);
      el.innerHTML = arr.map(function (a) { return '<button type="button" class="pill" aria-pressed="' + (a === cur) + '">' + a + '</button>'; }).join('');
      el.querySelectorAll('button').forEach(function (b, k) {
        b.onclick = function () {
          el.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
          b.setAttribute('aria-pressed', 'true'); cb(arr[k], k); calc();
        };
      });
    };
    var q = new URLSearchParams(location.search);
    if (q.get('s')) surf.value = q.get('s');
    if (q.get('lv')) lv = Math.max(0, Math.min(3, +q.get('lv')));
    if (q.get('st') && rates[q.get('st')]) st = q.get('st');
    pills('lv', lvls, lvls[lv], function (a, k) { lv = k; });
    pills('st', Object.keys(rates), st, function (a) { st = a; });
    var fmt = function (v) { return v.toLocaleString('fr-FR').replace(/ | /g, ' '); };
    var money = function (v) { return fmt(Math.round(v / 100000) * 100000) + ' FCFA'; };
    var line = function (p, t) { return '<div><span>' + p[0] + '</span><b>' + money(t * p[1]) + '</b></div>'; };
    var calc = function () {
      var s = +surf.value, r = sel.value, c = r === 'Dakar' ? 1 : (r === 'Thiès' ? .96 : .93), ts = s * (lv + 1), t = ts * rates[st] * c;
      document.getElementById('surfOut').textContent = s + ' m²';
      document.getElementById('tsurf').textContent = ts;
      document.getElementById('tot').textContent = money(t);
      document.getElementById('pm').textContent = fmt(Math.round(t / ts / 1000) * 1000) + ' FCFA';
      document.getElementById('lines').innerHTML =
        '<div class="t"><span>Gros œuvre</span><b>' + money(t * .55) + '</b></div>' + go.map(function (p) { return line(p, t); }).join('') +
        '<div class="t" style="margin-top:8px"><span>Second œuvre</span><b>' + money(t * .45) + '</b></div>' + so.map(function (p) { return line(p, t); }).join('');
      var cta = document.getElementById('est-cta');
      if (cta) cta.href = 'contact.html?type=' + encodeURIComponent('Construction d’une villa') + '&msg=' + encodeURIComponent('Estimation en ligne : ' + s + ' m² au sol, ' + lvls[lv] + ', standing ' + st.toLowerCase() + ', région ' + r + ' — ' + ts + ' m² habitables, environ ' + money(t) + '. Je souhaite un devis détaillé.');
    };
    surf.addEventListener('input', calc); sel.addEventListener('change', calc); calc();
  }

  // Formulaire de contact (maquette)
  var cf = document.getElementById('cform');
  if (cf) {
    var q2 = new URLSearchParams(location.search), msg = document.getElementById('f-msg');
    if (q2.get('msg') && msg) msg.value = q2.get('msg');
    if (q2.get('type')) { var ft = document.getElementById('f-type'); if (ft) ft.value = q2.get('type'); }
    var field = function (id) { return document.getElementById(id); };
    var check = function (id, ok) { var f = field(id).closest('.f'); f.classList.toggle('invalid', !ok); field(id).setAttribute('aria-invalid', !ok); return ok; };
    var compose = function () {
      return 'Bonjour DANTEYO CONSTRUCTION,\n\nNom : ' + field('f-nom').value + '\nTéléphone : ' + field('f-tel').value + '\nEmail : ' + field('f-mail').value +
        '\nProjet : ' + field('f-type').value + '\n\n' + field('f-msg').value;
    };
    var valid = function () {
      var a = check('f-nom', field('f-nom').value.trim().length > 1);
      var b = check('f-mail', /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(field('f-mail').value.trim()));
      if (!a) field('f-nom').focus(); else if (!b) field('f-mail').focus();
      return a && b;
    };
    cf.addEventListener('submit', function (e) {
      e.preventDefault(); if (!valid()) return;
      window.open('https://wa.me/221784737690?text=' + encodeURIComponent(compose()), '_blank', 'noopener');
      document.getElementById('sent').style.display = 'block';
    });
    var mb = document.getElementById('f-mailbtn');
    if (mb) mb.addEventListener('click', function () {
      if (!valid()) return;
      location.href = 'mailto:contact@danteyoconstruction.com?subject=' + encodeURIComponent('Demande de devis — ' + field('f-type').value) + '&body=' + encodeURIComponent(compose());
    });
  }
})();

(function () {
  // Héro en diaporama
  var hs = document.querySelectorAll('.hs'), hi = document.querySelectorAll('.hframe img'), hl = document.querySelectorAll('.hframe .lab'), hd = document.querySelectorAll('.hdots button');
  if (hs.length) {
    var cur = 0, timer;
    var go = function (k) {
      cur = (k + hs.length) % hs.length;
      hs.forEach(function (s, j) { s.classList.toggle('on', j === cur); });
      hi.forEach(function (s, j) { s.classList.toggle('on', j === cur); });
      hl.forEach(function (s, j) { s.style.display = j === cur ? '' : 'none'; });
      hd.forEach(function (s, j) { s.setAttribute('aria-current', j === cur ? 'true' : 'false'); });
    };
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var paused = reduce, pb = document.querySelector('.hpause'), hero = document.querySelector('.hero2');
    var stop = function () { clearInterval(timer); timer = null; };
    var start = function () { stop(); if (!paused) timer = setInterval(function () { go(cur + 1); }, 6500); };
    var setPaused = function (p) {
      paused = p; if (pb) { pb.setAttribute('aria-label', p ? 'Lancer le défilement' : 'Mettre en pause le défilement'); pb.innerHTML = p
        ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M7 5l12 7-12 7z"/></svg>'
        : '<svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>'; }
      start();
    };
    if (pb) pb.addEventListener('click', function () { setPaused(!paused); });
    if (hero) {
      hero.addEventListener('mouseenter', stop); hero.addEventListener('mouseleave', start);
      hero.addEventListener('focusin', stop); hero.addEventListener('focusout', start);
    }
    hd.forEach(function (b, k) { b.addEventListener('click', function () { go(k); start(); }); });
    go(0); setPaused(paused);
  }

  // Compteurs animés
  var cs = document.querySelectorAll('[data-count]');
  if (cs.length && 'IntersectionObserver' in window) {
    var ob = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; ob.unobserve(e.target);
        var el = e.target, end = +el.getAttribute('data-count'), pre = el.getAttribute('data-pre') || '', suf = el.getAttribute('data-suf') || '', dec = +(el.getAttribute('data-dec') || 0), t0 = null;
        var f = function (t) {
          if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1400), v = end * (1 - Math.pow(1 - p, 3));
          el.textContent = pre + v.toLocaleString('fr-FR', { minimumFractionDigits: dec, maximumFractionDigits: dec }).replace(/ | /g, ' ') + suf;
          if (p < 1) requestAnimationFrame(f);
        };
        requestAnimationFrame(f);
      });
    }, { threshold: .4 });
    cs.forEach(function (c) { ob.observe(c); });
  }
})();
