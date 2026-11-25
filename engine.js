/* Bộ máy soi: nhận chữ (gõ hoặc đọc từ ảnh) + vài lựa chọn, trả kết quả có cấu trúc. Không gửi gì ra ngoài. */
(function (root) {
  const R = (typeof module !== 'undefined') ? require('./rules.js') : root.SOI_RULES;
  const {BAI, CO, TOT, TP, UL, LOAI} = R;

  // Bỏ dấu, chữ thường, gộp khoảng trắng; giữ bản đồ vị trí để trích lại đúng chữ gốc.
  function norm(s) {
    s = (s || '').normalize('NFC');
    let out = '', map = [], sp = true;
    for (let i = 0; i < s.length; i++) {
      if (/[:*.'’`´^]/.test(s[i]) && /\p{L}/u.test(s[i - 1] || '') && /\p{L}/u.test(s[i + 1] || '')) continue; // "ná:m", "n*m" – chữ chèn ký tự để né bộ lọc
      let c = s[i].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
      if (/[\s|_~`]/.test(c) || c === ' ') { if (!sp) { out += ' '; map.push(i); sp = true; } continue; }
      for (const ch of c) { out += ch; map.push(i); }
      sp = false;
    }
    return {n: out, map, src: s};
  }
  function snip(T, a, b) {
    const s = T.map[Math.max(0, a)], e = (T.map[Math.min(T.map.length - 1, b - 1)] ?? s) + 1;
    return T.src.slice(s, e).replace(/\s+/g, ' ').trim();
  }
  function allMatches(re, n, max = 3) {
    const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g'); const out = []; let m;
    while ((m = g.exec(n)) && out.length < max) { out.push([m.index, m.index + m[0].length]); if (m[0] === '') g.lastIndex++; }
    return out;
  }
  function num(str) { // "1.000" -> 1000 ; "2,5" -> 2.5 ; "12000" -> 12000
    str = str.trim();
    if (/^\d{1,3}([.,]\d{3})+$/.test(str)) return +str.replace(/[.,]/g, '');
    return +str.replace(',', '.');
  }
  const fmt = x => (Math.round(x * 10) / 10).toLocaleString('vi-VN');

  function perDay(n) {
    let m = n.match(/(?:ngay|moi ngay) (?:uong )?(\d) ?(?:vien|vien nang|capsule|vien\/lan)/) || n.match(/(\d) ?vien ?(?:\/|moi|mot|1) ?ngay/) ||
            n.match(/(\d) ?vien ?x ?(\d) ?lan/) || n.match(/(\d) ?(?:capsules?|tablets?|gelules?|tabletten|kapseln) (?:par jour|per day|taglich|a day|daily)/);
    if (!m) return null;
    return m[2] ? (+m[1]) * (+m[2]) : +m[1];
  }

  function analyze(text, opt = {}) {
    const T = norm(text), n = T.n, ai = opt.ai || [];
    const res = {flags: [], good: [], tp: [], nums: [], cautions: [], missing: [], bai: new Set(['huongdan']), loai: null, score: 0, strong: false};
    if (n.replace(/[^a-z0-9]/g, '').length < 8) { res.empty = true; return res; }

    // Loại sản phẩm
    const cnt = LOAI.map(l => [l.k, allMatches(l.re, n, 9).length]).sort((a, b) => b[1] - a[1]);
    res.loai = opt.loai && opt.loai !== 'tu' ? opt.loai : (cnt[0][1] ? cnt[0][0] : 'khac');

    // Cờ đỏ (che dòng bắt buộc "không phải là thuốc, không thay thế thuốc chữa bệnh" để khỏi bắt nhầm)
    const nf = n.replace(/(khong (co )?\S{1,5} ?dung thay the thuoc( chua benh)?|khong phai la thuoc|khong thay the thuoc( chua benh)?)/g, m => ' '.repeat(m.length));
    for (const c of CO) {
      const hits = allMatches(c.re, nf, 3);
      if (!hits.length) continue;
      res.flags.push({cat: c.cat, t: c.t, why: c.why, w: c.w, q: [...new Set(hits.map(h => snip(T, h[0], h[1])))]});
      res.score += c.w; if (c.w >= 3) res.strong = true;
      (c.bai || []).forEach(b => res.bai.add(b));
    }
    if (opt.kenh === 'xachtay' && !res.flags.some(f => f.cat === 'kenh')) {
      const k = CO.find(c => c.cat === 'kenh'); res.flags.push({cat: 'kenh', t: k.t, why: k.why, w: 1, q: ['(bạn chọn: mua qua Facebook, Zalo, xách tay)']}); res.score += 1;
    }
    // Mâu thuẫn: "nội tiết" nhưng hộp ghi không hormone
    if (/(noi tiet|hormone)/.test(n) && /(sans hormone|khong (chua )?hormone|hormone[- ]free|without hormone|ohne hormone)/.test(n)) {
      res.flags.push({cat: 'benh', t: 'Lời rao mâu thuẫn với chính cái hộp', why: 'Người bán nói "nội tiết tố", nhưng nhãn ghi không chứa hormone. Hãy tin mặt sau hộp hơn lời rao.', w: 2, q: []}); res.score += 2; res.bai.add('manhae');
    }
    if (/glutathi?on/.test(n) && /(tiem|truyen|chich)/.test(n)) {
      res.flags.push({cat: 'benh', t: 'Tiêm, truyền glutathione', why: 'Không nên tiêm, truyền glutathione để trắng da. FDA Mỹ chưa cho phép thuốc tiêm nào để làm trắng da; sản phẩm tiêm trôi nổi có thể chứa tạp chất có hại.', w: 3, q: []}); res.score += 3; res.strong = true;
    }
    if (res.loai === 'tpcn' && /(trang da|lam trang)/.test(n)) {
      res.flags.push({cat: 'hua', t: 'Viên uống hứa "trắng da"', why: 'Chưa có viên uống nào được chứng minh làm trắng da bền vững. Nắng là thủ phạm chính của sạm da – kem chống nắng mỗi ngày hiệu quả hơn.', w: 1, q: []}); res.score += 1; res.bai.add('gluta12');
    }

    // Dấu hiệu tốt
    for (const g of TOT) if (g.re.test(n)) res.good.push(g.t);

    // Thành phần
    for (const p of TP) {
      if (!p.re.test(n)) continue;
      res.tp.push({t: p.t, note: p.note, tot: !!p.tot});
      if (p.nang) { res.score += p.nang; res.strong = true; }
      (p.bai || []).forEach(b => res.bai.add(b));
      (p.ai || []).forEach(g => { if (ai.includes(g)) res.cautions.push(`${p.t}: ${p.note}`); });
    }

    // Con số
    const daily = perDay(n);
    const countM = n.match(/(\d{2,3}) ?(vien|capsules?|tablets?|gelules?|tabletten|kapseln|softgels?|caps)\b/);
    const count = countM ? +countM[1] : null;
    // a) con số to có thể là tổng cả hộp
    for (const [a, b] of allMatches(/(\d[\d.,]{2,})\s?mg\b/, n, 6)) {
      const raw = n.slice(a, b).match(/[\d.,]+/)[0], v = num(raw);
      const before = n.slice(Math.max(0, a - 14), a);
      if (v >= 2000 && count && !/moi vien|1 vien|per (tablet|capsule)|pro tablette/.test(before)) {
        const pct = n.slice(Math.max(0, a - 25), b + 25).match(/(\d{1,2}) ?%/);
        let s = `"${snip(T, a, b)}" với hộp ${count} viên: nếu ${fmt(v)} mg là của cả hộp thì mỗi viên chỉ khoảng ${fmt(v / count)} mg.`;
        if (pct) s += ` Nếu đó là nguyên liệu ${pct[1]}% thì hoạt chất thật mỗi viên chỉ khoảng ${fmt(v / count * pct[1] / 100)} mg.`;
        res.nums.push({t: 'Con số to trên hộp', s, warn: true}); res.score += 1; res.bai.add('gluta12');
        break;
      }
    }
    // b) so với mức tối đa an toàn
    for (const u of UL) {
      for (const [a, b] of allMatches(u.re, n, 4)) {
        const win = n.slice(b, b + 45);
        const m = win.match(/^(?:(?!vitamin|vit |\+)[^0-9]){0,25}?(\d[\d.,]*)\s?(mg|mcg|µg|ug|iu|ui|g)\b/);
        if (!m) continue;
        let v = num(m[1]), unit = m[2], amount = v, label = `${m[1]} ${m[2].toUpperCase()}`, over = null;
        if (unit === 'g') { amount = v * 1000; unit = 'mg'; }
        if (/^(µg|ug)$/.test(unit)) unit = 'mcg';
        if (u.unit === 'mcg' && unit === 'mg') amount *= 1000;
        if (u.unit === 'mg' && unit === 'mcg') amount /= 1000;
        if (/^(iu|ui)$/.test(unit)) {
          if (u.iu) { amount = null; over = v > u.iu[1] ? 'qua' : v > u.iu[0] ? 'co-the' : null; }
          else if (u.iuPer) amount = u.k === 'vita' ? v * 0.3 : v / u.iuPer;
          else amount = null;
        }
        const d = daily || 1;
        let s = `Ghi ${label}.`;
        if (amount != null) {
          const tot = amount * d;
          if (tot > u.ul) over = 'qua';
          s += daily ? ` Uống ${daily} viên/ngày thì khoảng ${fmt(tot)} ${u.unit}, mức tối đa an toàn cho người lớn là ${fmt(u.ul)} ${u.unit}/ngày.` : ` Mức tối đa an toàn cho người lớn là ${fmt(u.ul)} ${u.unit}/ngày (tính cả thức ăn và các viên khác).`;
          if (!over && tot >= u.ul * 0.95) { s += ' Đã CHẠM mức tối đa – chưa tính thức ăn và các viên khác đang uống.'; over = 'cham'; }
          else if (!over && tot >= u.ul * 0.5) s += ' Đã khá gần mức tối đa – nhớ cộng các viên khác đang uống.';
        } else if (u.iu) {
          s += ` Mức tối đa cho người lớn khoảng ${u.iu[0].toLocaleString('vi-VN')} IU (vitamin E tổng hợp) hoặc ${u.iu[1].toLocaleString('vi-VN')} IU (tự nhiên) mỗi ngày.`;
          if (daily && daily > 1) { const t = v * daily; over = t > u.iu[1] ? 'qua' : t > u.iu[0] ? 'co-the' : over; s += ` Uống ${daily} viên/ngày là ${t.toLocaleString('vi-VN')} IU.`; }
          s += ' Nếu con số này là của cả hộp thì hỏi lại người bán mỗi viên bao nhiêu.';
        }
        if (over === 'qua') s = '⚠️ ' + s + ' Có thể VƯỢT mức tối đa nếu đây là lượng mỗi viên/ngày.';
        if (over === 'co-the') s = '⚠️ ' + s + ' Có thể vượt mức tối đa, tùy dạng vitamin.';
        if (over === 'cham') s = '⚠️ ' + s;
        if (u.ul2) s += ` ${u.ul2}.`;
        s += ' ' + u.note;
        if (ai.includes('tre') && u.tre) s += ` Với trẻ em mức tối đa thấp hơn nhiều: ${u.tre}.`;
        res.nums.push({t: u.t, s, warn: !!over});
        if (over === 'qua') { res.score += 3; res.strong = true; } else if (over === 'cham') res.score += 1; else if (over) res.score += 2;
        (u.bai || []).forEach(x => res.bai.add(x));
        break;
      }
    }

    // Thiếu gì
    if (res.loai === 'tpcn') {
      if (!res.good.some(g => g.startsWith('Có dòng'))) res.missing.push('Chưa thấy dòng "Thực phẩm này không phải là thuốc, không có tác dụng thay thế thuốc chữa bệnh" – quảng cáo thực phẩm chức năng bắt buộc phải có.');
      if (!res.good.some(g => g.startsWith('Có số'))) res.missing.push('Chưa thấy số công bố sản phẩm. Hỏi người bán số công bố rồi tra trên cổng của Cục An toàn thực phẩm.');
      if (!res.good.some(g => g.includes('nhà sản xuất'))) res.missing.push('Chưa thấy tên nhà sản xuất. Không rõ ai làm ra thì chưa có cách kiểm tra.');
    }
    if (res.loai === 'mypham' && !res.good.some(g => g.startsWith('Có số'))) res.missing.push('Chưa thấy số phiếu công bố mỹ phẩm. Hỏi người bán rồi tra trên hệ thống của Cục Quản lý Dược.');
    if (res.loai === 'mypham' && /(danh rang|\brang\b|zahn|tooth|dentifrice)/.test(n)) res.bai.add('rang');
    if (res.loai === 'mypham' && /(u moi|son (duong|moi)|duong moi|\blip\b)/.test(n)) res.bai.add('moi');
    if (res.loai === 'mypham' && /(rua mat|nettoyant|cleanser|mousse)/.test(n)) res.bai.add('srm');

    // Ai cần cẩn thận
    const AI = {bau: 'Đang mang thai hoặc cho con bú: hỏi bác sĩ trước khi dùng bất kỳ viên uống, thảo dược nào.',
      tre: 'Trẻ em: không dùng sản phẩm cho người lớn; mức tối đa an toàn của trẻ thấp hơn nhiều.',
      thuoc: 'Đang dùng thuốc hoặc có bệnh: mang hộp sản phẩm đến hỏi bác sĩ, dược sĩ; không tự ngừng, không tự đổi thuốc đang dùng.',
      gan: 'Có bệnh gan: tránh tự dùng thảo dược, viên uống liều cao khi chưa hỏi bác sĩ.',
      diung: 'Hay dị ứng: đọc kỹ thành phần (cá, tôm cua, đậu nành, sữa ong chúa, hương liệu); mỹ phẩm thì thử trước ở vùng da nhỏ.',
      dongkinh: 'Bị động kinh: hỏi bác sĩ trước khi dùng dầu hoa anh thảo, dầu lưu ly.'};
    ai.forEach(g => AI[g] && res.cautions.unshift(AI[g]));

    res.level = (res.strong || res.score >= 5) ? 'dung' : res.score >= 2 ? 'can' : 'on';
    res.bai = [...res.bai].map(k => BAI[k]).filter(Boolean);
    return res;
  }

  const API = {norm, analyze};
  if (typeof module !== 'undefined') module.exports = API; else root.SOI = API;
})(typeof window !== 'undefined' ? window : globalThis);
