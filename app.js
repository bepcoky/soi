/* Giao diện "Soi cùng Cô Kỹ". Đọc chữ từ ảnh bằng Tesseract.js chạy ngay trên máy (thư mục ocr/). */
(function () {
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
  const txt = $('#txt');

  /* ---------- lựa chọn (chip) ---------- */
  document.querySelectorAll('.chips').forEach(g => g.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (g.dataset.one) g.querySelectorAll('button').forEach(o => o.setAttribute('aria-pressed', o === b));
    else b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true');
  }));
  const pick = id => [...document.querySelectorAll(`#${id} button[aria-pressed=true]`)].map(b => b.dataset.v);

  /* ---------- đọc chữ từ ảnh ---------- */
  let workerP = null, queue = Promise.resolve(), nImg = 0;
  const abs = p => new URL(p, location.href).href;
  function loadScript(src) { return new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => no(new Error('Không tải được ' + src)); document.head.appendChild(s); }); }
  function msg(t, pct) { $('#ocrBox').hidden = false; $('#ocrMsg').textContent = t; if (pct != null) $('#ocrBar').style.width = Math.round(pct * 100) + '%'; }
  function getWorker() {
    if (!workerP) workerP = (window.Tesseract ? Promise.resolve() : loadScript('ocr/tesseract.min.js')).then(() =>
      Tesseract.createWorker(['vie', 'eng'], 1, {
        workerPath: abs('ocr/worker.min.js'), corePath: abs('ocr/'), langPath: abs('ocr/lang'), gzip: true,
        logger: m => {
          if (m.status === 'recognizing text') msg(`Đang đọc chữ… ${Math.round(m.progress * 100)}%`, m.progress);
          else if (/loading|initializ/.test(m.status)) msg('Đang chuẩn bị bộ đọc chữ (lần đầu hơi lâu)…', m.progress * 0.3);
        }
      })).catch(e => { workerP = null; throw e; });
    return workerP;
  }
  function shrink(file) { // thu nhỏ ảnh quá to cho đọc nhanh hơn, vẫn đủ nét
    return new Promise(ok => {
      const img = new Image(), u = URL.createObjectURL(file);
      img.onload = () => {
        const k = Math.min(1, 2200 / Math.max(img.width, img.height));
        if (k === 1) { ok(file); return; }
        const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u); c.toBlob(b => ok(b || file), 'image/jpeg', 0.92);
      };
      img.onerror = () => ok(file); img.src = u;
    });
  }
  function addFiles(files) {
    [...files].filter(f => /^image\//.test(f.type)).forEach(f => {
      const k = ++nImg, u = URL.createObjectURL(f);
      const fig = document.createElement('figure'); fig.innerHTML = `<img src="${u}" alt="Ảnh ${k}"><button type="button" aria-label="Bỏ ảnh ${k}">✕</button>`;
      fig.querySelector('button').onclick = () => { fig.remove(); URL.revokeObjectURL(u); };
      $('#thumbs').appendChild(fig);
      queue = queue.then(async () => {
        try {
          msg(`Ảnh ${k}: đang chuẩn bị…`, 0.02);
          const w = await getWorker(); const { data } = await w.recognize(await shrink(f));
          const t = (data.text || '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
          txt.value = (txt.value.trim() ? txt.value.trim() + '\n\n' : '') + `[Ảnh ${k}]\n` + (t || '(không đọc được chữ – thử chụp gần, rõ hơn)');
          msg(`Đã đọc xong ảnh ${k}. Sửa lại chữ nếu cần rồi bấm Soi.`, 1);
        } catch (e) {
          msg('Chưa đọc được ảnh: ' + (navigator.onLine ? 'thử lại hoặc gõ chữ vào ô bên dưới.' : 'lần đầu cần có mạng để tải bộ đọc chữ.'), 0);
        }
      });
    });
  }
  $('#fCam').addEventListener('change', e => { addFiles(e.target.files); e.target.value = ''; });
  $('#fPick').addEventListener('change', e => { addFiles(e.target.files); e.target.value = ''; });
  $('#bType').addEventListener('click', () => { txt.focus(); txt.scrollIntoView({block: 'center', behavior: 'smooth'}); });
  // dán ảnh từ bộ nhớ tạm (máy tính)
  addEventListener('paste', e => { const f = [...(e.clipboardData?.files || [])]; if (f.length) { addFiles(f); e.preventDefault(); } });

  /* ---------- 7 bước ---------- */
  const STEPS = ['Tìm được tên <b>nhà sản xuất</b> và công ty chịu trách nhiệm trên nhãn', 'Tra được <b>số công bố</b> (thực phẩm chức năng) hoặc <b>số phiếu công bố</b> (mỹ phẩm), tên khớp với hộp', 'Hàng nhập có <b>nhãn phụ tiếng Việt</b>', 'Đọc <b>mặt sau hộp</b>: mỗi viên bao nhiêu, uống mấy viên, có chất nào trùng với viên khác đang uống', 'Con dấu kiểm định tra được trên trang của chính tổ chức đó (logo FDA, GMP tự in không tính)', 'Hộp khớp với trang của hãng; số lô, hạn dùng trên hộp khớp với lọ', 'Mua ở nơi có <b>hóa đơn</b>, đổi trả được'];
  $('#chk').innerHTML = STEPS.map((s, i) => `<label><input type="checkbox"><span>${i + 1}. ${s}</span></label>`).join('');

  /* ---------- soi ---------- */
  const CAT = {hua: 'Lời hứa cần soi', benh: 'Nói như thuốc chữa bệnh', uytin: 'Mượn uy tín', giuc: 'Giục mua, đánh cảm xúc', kenh: 'Kênh mua khó kiểm tra', mon: 'Món ăn, mẹo dân gian'};
  const LV = {
    dung: ['v-dung', 'Chưa nên mua, chưa nên làm theo', 'Có dấu hiệu nặng hoặc nhiều dấu hiệu thổi phồng. Hỏi người bán cho rõ, tra số công bố, hỏi bác sĩ, dược sĩ trước đã.'],
    can: ['v-can', 'Cân nhắc kỹ', 'Có vài điểm cần làm rõ. Làm đủ 7 bước kiểm tra bên dưới rồi hãy quyết.'],
    on: ['v-on', 'Chưa thấy cờ đỏ rõ ràng', 'Vẫn nên tra số công bố, đọc mặt sau hộp và tự hỏi: mình có thật sự cần không?']
  };
  const LOAI = {tpcn: 'viên uống, thực phẩm chức năng', mypham: 'mỹ phẩm', mon: 'món ăn, mẹo dân gian', khac: 'chưa rõ loại'};
  let last = null;

  $('#bGo').addEventListener('click', () => {
    const t = txt.value;
    const r = SOI.analyze(t, {loai: pick('cLoai')[0], ai: pick('cAi'), kenh: pick('cKenh')[0]});
    const out = $('#out');
    if (r.empty) { out.innerHTML = `<div class="card"><p>Chưa có chữ để soi. Chụp ảnh, chọn ảnh hoặc gõ nội dung vào ô ở bước 1 nhé.</p></div>`; out.scrollIntoView({behavior: 'smooth'}); return; }
    const lv = LV[r.level]; let h = `<div class="card"><span class="tag">Kết quả soi · ${LOAI[r.loai] || ''}</span><div class="verdict ${lv[0]}"><b>${lv[1]}</b>${lv[2]}</div>`;
    const groups = {};
    r.flags.forEach(f => (groups[f.cat] = groups[f.cat] || []).push(f));
    if (r.flags.length) {
      h += `<h3>🚩 ${r.flags.length} dấu hiệu cần cẩn thận</h3>`;
      for (const c in groups) h += groups[c].map(f => `<div class="item ${f.w >= 2 ? 'bad' : 'warn'}"><b>${esc(f.t)}</b>${f.q.length ? `<q>${f.q.map(esc).join(' · ')}</q>` : ''}<p>${esc(f.why)}</p></div>`).join('');
    }
    if (r.nums.length) h += `<h3>🧮 Tính lại con số</h3>` + r.nums.map(x => `<div class="item ${x.warn ? 'bad' : 'warn'}"><b>${esc(x.t)}</b><p>${esc(x.s)}</p></div>`).join('');
    if (r.tp.length) h += `<h3>🧪 Thành phần cần biết</h3>` + r.tp.map(x => `<div class="item ${x.tot ? 'good' : 'warn'}"><b>${esc(x.t)}</b><p>${esc(x.note)}</p></div>`).join('');
    if (r.cautions.length) h += `<h3>👪 Ai cần cẩn thận</h3><ul class="clean">${[...new Set(r.cautions)].map(c => `<li>${esc(c)}</li>`).join('')}</ul>`;
    if (r.missing.length) h += `<h3>❓ Còn thiếu thông tin</h3><ul class="clean">${r.missing.map(c => `<li>${esc(c)}</li>`).join('')}</ul>`;
    if (r.good.length) h += `<h3>✅ Điểm tốt thấy được</h3>` + r.good.map(g => `<div class="item good"><p>${esc(g)}</p></div>`).join('');
    if (r.loai === 'mon') h += `<h3>🍲 Với món ăn, mẹo dân gian</h3><ul class="clean"><li>Chất gì? Bao nhiêu? Ai đã chứng minh – nghiên cứu trên người hay chỉ "người quen kể"?</li><li>Ngon, lành thì cứ nấu vì ngon. Đừng bỏ thuốc, bỏ đi khám vì tin món ăn chữa được bệnh.</li><li>Đồ tự làm: nước ép làm đủ dùng trong ngày; tỏi, ớt ngâm dầu để tủ lạnh, dùng nhanh; không cho trẻ dưới 1 tuổi ăn mật ong.</li></ul>`;
    h += `<h3>📖 Bài Cô Kỹ đã soi</h3><ul class="clean">${r.bai.map(b => `<li><a href="${b[0]}">${esc(b[1])}</a></li>`).join('')}</ul>`;
    h += `<div class="acts"><button class="btn" type="button" id="bZalo">Gửi Cô Kỹ soi giúp qua Zalo</button><button class="btn ghost" type="button" id="bCopy">Chép kết quả</button><button class="btn ghost" type="button" id="bNew">Soi món khác</button></div><p class="note" id="actMsg"></p>`;
    h += `<p class="note">Máy soi theo danh sách dấu hiệu, có thể bỏ sót hoặc bắt nhầm. Không thay lời khuyên của bác sĩ, dược sĩ.</p></div>`;
    out.innerHTML = h; last = {r, t};
    out.scrollIntoView({behavior: 'smooth', block: 'start'});
    $('#bCopy').onclick = () => copy(summary(), 'Đã chép kết quả.');
    $('#bZalo').onclick = async () => { await copy(summary(true), 'Đã chép nội dung. Mở Zalo, dán vào tin nhắn và gửi kèm ảnh nhé.'); setTimeout(() => window.open('https://zalo.me/0342668311', '_blank', 'noopener'), 400); };
    $('#bNew').onclick = () => { txt.value = ''; $('#thumbs').innerHTML = ''; $('#ocrBox').hidden = true; out.innerHTML = ''; scrollTo({top: 0, behavior: 'smooth'}); };
  });
  function summary(forKy) {
    if (!last) return '';
    const {r, t} = last; const L = [];
    if (forKy) L.push('Cô Kỹ ơi, soi giúp em cái này với:', t.trim().slice(0, 600), '');
    L.push(`Kết quả máy soi: ${LV[r.level][1]}`);
    r.flags.forEach(f => L.push('- ' + f.t + (f.q.length ? ` ("${f.q[0]}")` : '')));
    r.nums.forEach(x => L.push('- ' + x.s.replace(/^⚠️ /, '')));
    if (!forKy) L.push('', 'Soi bằng ứng dụng Soi cùng Cô Kỹ: https://soi.bepcoky.com/');
    return L.join('\n');
  }
  async function copy(s, ok) {
    try { await navigator.clipboard.writeText(s); $('#actMsg').textContent = ok; }
    catch (e) { $('#actMsg').textContent = 'Máy không cho chép tự động – bạn bôi đen ô chữ ở bước 1 để chép nhé.'; }
  }

  /* ---------- cài đặt, chạy offline ---------- */
  let dp = null;
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); dp = e; $('#btnInstall').classList.add('on'); });
  $('#btnInstall').addEventListener('click', () => { if (dp) { dp.prompt(); dp.userChoice.finally(() => { dp = null; $('#btnInstall').classList.remove('on'); }); } });
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
  if (ios && !standalone) { const b = $('#btnInstall'); b.classList.add('on'); b.onclick = () => $('#s4').scrollIntoView({behavior: 'smooth'}); }
  if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)) addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  $('#bPre').addEventListener('click', async () => {
    const files = ['ocr/tesseract.min.js', 'ocr/worker.min.js', 'ocr/tesseract-core-simd-lstm.wasm.js', 'ocr/tesseract-core-lstm.wasm.js', 'ocr/tesseract-core-relaxedsimd-lstm.wasm.js', 'ocr/lang/vie.traineddata.gz', 'ocr/lang/eng.traineddata.gz'];
    let n = 0; $('#preMsg').textContent = 'Đang tải…';
    try { for (const f of files) { const res = await fetch(f); if (!res.ok) throw 0; if ('caches' in window) (await caches.open('soi-ocr')).put(f, res); n++; $('#preMsg').textContent = `Đang tải… ${n}/${files.length}`; } $('#preMsg').textContent = 'Xong – giờ đọc ảnh được cả khi không có mạng.'; }
    catch (e) { $('#preMsg').textContent = 'Chưa tải được, thử lại khi có mạng.'; }
  });
})();
