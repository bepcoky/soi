const {analyze}=require('../engine.js');
const S={
 gluta:`v.+ ( ÂN MP PHARCO | GIAN HÀNG CHÍNH HÃNG | LỰA CHỌN CHAM SOC SẮC ĐẸP ĐƯỢC NHIEU PHU NỮ YÊU THÍCH | Glutathion 12000mg “9o : FDA Nano Soft Capsule Diamond collagen nano Trong 60 viên | Thực phẩm bao vệ? sức khỏe Sản phẩm không phải là Thuốc. Không có fac dụng thay thế Thuốc.`,
 combo:`COMBO 3 HỘP SÁNG MỊN ĐẸP TỪ BEN TRONG Combo gồm: 01 Glutathion + 01 Vitamin E Đỏ + 01 Vitamin C | Vitamin E đỏ 4000 IU hộp 60 viên, uống 1 viên x 2 lần/ngày. Vitamin C 1000mg ngày 2 viên. GMP sản xuất đạt chuẩn, an toàn hiệu quả`,
 manhae:`Đúng là nội tiết tố dong VIP có khác Ngày 1v hỗ trợ can | bằng cơ thể khỏe, da sángg mịn, hết ná:m sa:m, nc nôi tràn | tré 1! manhaé Ménopause Sans hormones`,
 warnke:`cứu e về được 1 it viên trắng da mà bay thé nào xước. | vò vài hộp e tặng giá lỗ ah, 100vien uống 100 ngày. | co 20 hộp thôi ah L-Glutathion 500mg Nahrungsergänzungsmittel 100 Tabletten`,
 mon:`Nước lá ổi uống lúc đói mỗi sáng, sau 7 ngày mỡ máu về số, gan sạch, chữa tiểu đường không cần thuốc`,
 good:`Thực phẩm bảo vệ sức khỏe Vitamin C 500mg. Số công bố 1234/2023/ĐKSP. Nhà sản xuất: Công ty ABC. Thành phần: Vitamin C 500mg. HSD 2027. Thực phẩm này không phải là thuốc và không có tác dụng thay thế thuốc chữa bệnh. Ngày 1 viên.`,
 kem:`Kem body kích trắng bật tông sau 7 ngày, an toàn tuyệt đối, xách tay Hàn, chỉ còn 5 hộp`,
};
for(const [k,t] of Object.entries(S)){const r=analyze(t,{ai:k==='combo'?['tre']:[]});console.log('\n##',k,r.loai,r.level,'score',r.score);r.flags.forEach(f=>console.log(' F',f.t,'|',f.q.join(' / ')));r.nums.forEach(x=>console.log(' N',x.s.slice(0,230)));r.tp.forEach(x=>console.log(' T',x.t));r.missing.forEach(x=>console.log(' M',x.slice(0,60)));console.log(' good',r.good.length,'bai',r.bai.map(b=>b[1].slice(0,20)).join('; '))}
