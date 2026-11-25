/* Bộ quy tắc "Soi cùng Cô Kỹ" – chạy hoàn toàn trên máy người dùng.
   Mọi mẫu (re) viết cho chữ đã bỏ dấu, chữ thường (xem norm() trong app.js), vì chữ đọc từ ảnh hay sai dấu.
   Nguồn: chương trình BS. Trần Văn Phúc (số 0060, 0061, 0122, 0127, 0141), NIH ODS, NCCIH, Mayo Clinic, MSKCC,
   Cục An toàn thực phẩm, AAD, Stiftung Warentest – xem các bài trên bepcoky.com/kiem-chung/. */
const BAI = {
  huongdan: ['https://bepcoky.com/kiem-chung/huong-dan-mua-va-bao-quan.html', '7 bước xác thực và cách giữ hàng không hỏng'],
  gluta12: ['https://bepcoky.com/kiem-chung/glutathion-12000mg.html', '"Glutathion 12000mg": con số to trên hộp'],
  combo: ['https://bepcoky.com/kiem-chung/combo-glutathion-vitamin-e-c.html', 'Combo 3 hộp: khi cộng dồn thành quá liều'],
  moi: ['https://bepcoky.com/kiem-chung/u-duong-moi-lip-care.html', 'Hũ ủ môi: dưỡng ẩm thì được, "giảm thâm" thì khoan'],
  anhthao: ['https://bepcoky.com/kiem-chung/dau-hoa-anh-thao-nat-form.html', 'Dầu hoa anh thảo và lời hứa "cân bằng nội tiết"'],
  srm: ['https://bepcoky.com/kiem-chung/neutrogena-calme-curcuma.html', 'Sữa rửa mặt nghệ xách tay'],
  warnke: ['https://bepcoky.com/kiem-chung/glutathione-warnke-500mg.html', 'Glutathione "xước vỏ tặng giá lỗ"'],
  manhae: ['https://bepcoky.com/kiem-chung/manhae-menopause.html', '"Nội tiết tố VIP" mà hộp ghi "không hormone"'],
  rang: ['https://bepcoky.com/kiem-chung/kem-danh-rang-perlweiss.html', 'Kem đánh răng "trắng hơn 4 tông"'],
};

/* Cờ: cat = nhóm, w = mức nặng (3 = rất nặng), why = vì sao, bai = bài liên quan */
const CO = [
  // Lời hứa thần kỳ
  {cat:'hua', w:2, re:/\b(100 ?%|tuyet doi|cam ket hieu qua|hieu qua ngay|thay ro sau \d+|chi sau \d+ (ngay|tuan)|sau \d+ ngay|cap toc|than (duoc|ky|thanh)|ky dieu|vinh vien|dut diem|tan goc|tan tan)/, t:'Hứa hẹn tuyệt đối hoặc quá nhanh', why:'Sản phẩm thật hiếm khi dám hứa "100%", "vĩnh viễn", "sau 7 ngày". Cơ thể mỗi người một khác, kết quả không thể bảo đảm.'},
  {cat:'hua', w:3, re:/(trang bat tong|bat tong|trang sau \d+|tam trang|kem tron|kich trang|trang cap toc)/, t:'"Trắng bật tông", "kích trắng"', why:'Trắng quá nhanh thường do chất tẩy mạnh. Kem trộn trôi nổi từng bị phát hiện có corticoid, thủy ngân – dùng lâu mỏng da, nhiễm độc.'},
  {cat:'hua', w:2, re:/(het nam|sach nam|tri nam|xoa nam|het mun|tri mun|het tham|xoa tham|xoa nhan|het nhan|tre hoa|cai lao hoan dong|tre ra \d+)/, t:'Hứa "hết nám, hết mụn, hết nhăn"', why:'Nám là bệnh da liễu, cần bác sĩ và kem chống nắng mỗi ngày. Viên uống hay kem thường chỉ được nói "hỗ trợ".', bai:['gluta12','manhae']},
  {cat:'hua', w:3, re:/(giam \d+ ?(kg|ky|can)|khong can an kieng|khong can tap|dot mo cap toc|tan mo|giam can cap toc|ep can)/, t:'Hứa giảm cân nhanh, không cần ăn kiêng', why:'Một số sản phẩm giảm cân cấp tốc từng bị phát hiện trộn chất cấm như sibutramine, hại tim mạch. Giảm cân bền vững cần ăn uống, vận động.'},
  {cat:'hua', w:2, re:/(tang chieu cao|cao vuot troi|tang size|no nguc|bo nao|tang iq|thong minh vuot troi|sinh ly (manh|tra)|nuoc noi|nc noi|chuyen ay)/, t:'Hứa tăng chiều cao, bổ não, sinh lý', why:'"Không có thuốc bổ não", không viên nào tăng IQ hay chiều cao người đã hết tuổi lớn (BS. Trần Văn Phúc, số 0060).'},
  {cat:'hua', w:1, re:/(khong tac dung phu|khong co tac dung phu|an toan tuyet doi|lanh tinh 100|ai dung cung duoc|moi lua tuoi)/, t:'"Không có tác dụng phụ", "ai dùng cũng được"', why:'Thứ gì có tác dụng thì đều có thể có tác dụng phụ, nhất là với bà bầu, trẻ em, người đang dùng thuốc.'},
  // Nói như thuốc chữa bệnh
  {cat:'benh', w:3, re:/(chua (khoi|benh|tri|dut)|dieu tri|dac tri|khoi benh|khoi han|thay the thuoc|thay thuoc|bo thuoc|ngung thuoc|phong chong ung thu|chua ung thu|diet te bao ung thu|ha duong huyet|chua tieu duong|chua cao huyet ap|chua gut|chua xuong khop|chua da day|chua vo sinh)/, t:'Nói như thuốc chữa bệnh', why:'Thực phẩm chức năng chỉ được nói "hỗ trợ", "cải thiện". Thấy "chữa khỏi", "điều trị dứt điểm", "phòng chống ung thư" là quảng cáo sai (BS. Trần Văn Phúc, số 0060). Không bao giờ tự bỏ thuốc bác sĩ kê.'},
  {cat:'benh', w:2, re:/(thai doc|detox|giai doc gan|thanh loc co the|kiem hoa|kiem hoa mau|mau axit|thai doc ruot)/, t:'"Thải độc", "kiềm hóa máu"', why:'Cơ thể đã có hệ giải độc: ruột chặn, gan xử lý, thận thải. Trà "thải độc" phần lớn là thuốc nhuận tràng; ăn uống không làm máu kiềm hay axit hơn (số 0061, 0127).'},
  {cat:'benh', w:2, re:/(can bang noi tiet|noi tiet to|bu noi tiet|tang noi tiet|estrogen tu nhien|noi tiet to nu)/, t:'Hứa "cân bằng nội tiết tố"', why:'Chưa có nghiên cứu cho thấy viên uống thông thường "cân bằng" được hormone. Rối loạn kinh nguyệt, bốc hỏa nặng nên đi khám phụ khoa.', bai:['anhthao','manhae']},
  // Mượn uy tín
  {cat:'uytin', w:2, re:/\b(fda|fda approved|chung nhan fda|dat chuan fda|fda hoa ky)\b/, t:'Logo hay chữ "FDA"', why:'FDA Mỹ không phê duyệt thực phẩm bổ sung trước khi bán. Hàng bán ở Việt Nam cần số công bố của Cục An toàn thực phẩm, không phải logo FDA.', bai:['gluta12']},
  {cat:'uytin', w:1, re:/\b(gmp|cgmp|haccp|iso ?\d{3,5})\b/, t:'Con dấu GMP, ISO tự in', why:'GMP là tiêu chuẩn nhà máy, không bảo đảm từng lô hàng. Dấu tự in không tra được thì không có giá trị.'},
  {cat:'uytin', w:2, re:/(bac si khuyen dung|bac si khuyen|chuyen gia khuyen|duoc si khuyen|bac si (tin dung|chung nhan)|kol|nguoi noi tieng)/, t:'"Bác sĩ khuyên dùng" không có tên tuổi', why:'Dùng danh nghĩa bác sĩ, lời cảm ơn bệnh nhân để quảng cáo là vi phạm. Danh xưng chỉ có nghĩa khi tra được người đó là ai.'},
  {cat:'uytin', w:1, re:/(nano|kim cuong|diamond|cong nghe (nhat|my|duc|han|thuy si|phap)|nhap khau nguyen hop|cong nghe doc quyen|premium|cao cap|dong vip|hang vip)/, t:'Chữ "nano", "kim cương", "công nghệ Nhật/Mỹ", "VIP"', why:'Những chữ này nghe sang nhưng không đi kèm con số nào để kiểm tra. Hãy đọc mặt sau hộp: thành phần, hàm lượng mỗi viên.', bai:['gluta12']},
  {cat:'uytin', w:1, re:/(gian hang chinh hang|chinh hang 100|cam ket chinh hang|hang auth|hang chuan auth)/, t:'Tự ghi "chính hãng"', why:'Chữ "chính hãng" người bán tự in lên ảnh không chứng minh được gì. Cần hóa đơn, nhà phân phối chính thức, số công bố.'},
  // Thúc mua, đánh cảm xúc
  {cat:'giuc', w:2, re:/(chi con \d+|con \d+ hop|so luong co han|sap het|het hang|xa kho|xa lo|ban lo|gia lo|tang gia lo|cuu (e|em) |xuoc vo|meo hop|mop hop|can date|date gan|sale soc|gio vang|chot don|nhanh tay|keo het|dat ngay|mua ngay)/, t:'Giục mua gấp, đánh vào lòng thương', why:'"Chỉ còn 20 hộp", "xước vỏ bán lỗ" làm mình mua vội. Hộp xước có thể đã bị va đập, nóng, ẩm trên đường; hàng cận date phải xem kỹ hạn.', bai:['warnke']},
  {cat:'giuc', w:1, re:/(inbox|ib (gia|em|ngay)|ib\b|nhan tin de biet gia|lien he de biet gia|gia trong ib)/, t:'Giấu giá, bảo "inbox"', why:'Giấu giá để tư vấn riêng, dễ bị đẩy giá hoặc chèo kéo mua combo.'},
  {cat:'giuc', w:1, re:/(combo \d+ hop|mua \d+ tang \d+|mua \d+ hop tang|lieu trinh \d+ hop|combo (sang|trang|dep))/, t:'Bán theo combo, liệu trình nhiều hộp', why:'Combo nhiều hộp làm mình uống cộng dồn nhiều chất cùng lúc. Hãy cộng lượng từng chất trước khi mua.', bai:['combo']},
  // Kênh mua khó kiểm tra
  {cat:'kenh', w:1, re:/(xach tay|hang order|order (duc|phap|my|nhat|uc|han)|hang (duc|phap|my|nhat|uc|han) xach tay|noi dia (nhat|trung|han)|hang noi dia|hang duc|hang phap|hang my)/, t:'Hàng xách tay, order', why:'Hàng xách tay thường không có nhãn phụ tiếng Việt, khó biết thật giả, không rõ bảo quản trên đường về.', bai:['huongdan']},
  // Món ăn, mẹo chữa bệnh
  {cat:'mon', w:2, re:/(uong luc doi|uong khi doi|moi sang (uong|an)|sau \d+ (ngay|tuan) (gan|mo mau|duong huyet|huyet ap|da)|mo mau ve so|duong huyet ve|gan sach|sach gan|tay mo|tan soi|tri soi|tri ho|tri mat ngu|tri dau da day|xung khac|ky nhau|sinh ra thach tin|thach tin)/, t:'Món ăn, mẹo uống "chữa" bệnh', why:'Món ăn ngon thì cứ nấu vì ngon, nhưng đừng thay thuốc. Tự hỏi ba câu: chất gì? bao nhiêu? ai đã chứng minh? Tin "thực phẩm xung khắc sinh thạch tín" là sai (số 0036, 0038).'},
];

/* Dấu hiệu tốt */
const TOT = [
  {re:/(khong phai la thuoc|khong (co )?\S{1,5} ?dung thay the thuoc)/, t:'Có dòng "không phải là thuốc, không thay thế thuốc chữa bệnh" – quảng cáo thực phẩm chức năng bắt buộc có dòng này.'},
  {re:/(\d{2,6}\s?\/\s?\d{4}\s?\/\s?(dksp|ycbs|xnqc)|so cong bo|so dang ky|so dksp|so tiep nhan|\/cbmp|cbmp-|so phieu cong bo)/, t:'Có số công bố, số đăng ký – hãy tra lại trên cổng của Cục An toàn thực phẩm (thực phẩm chức năng) hoặc Cục Quản lý Dược (mỹ phẩm).'},
  {re:/(nha san xuat|san xuat (boi|tai)|manufactured|hergestellt|fabrique|made in|produit en|cong ty chiu trach nhiem|nhap khau (boi|va phan phoi))/, t:'Có thông tin nhà sản xuất hoặc đơn vị chịu trách nhiệm.'},
  {re:/(thanh phan|ingredients|zutaten|composition|ingredients:|moi vien (chua|co))/, t:'Có ghi thành phần – hãy đọc hàm lượng mỗi viên, không chỉ con số to ở mặt trước.'},
  {re:/(han su dung|hsd|nsx|exp\b|lot\b|so lo|mindestens haltbar)/, t:'Có hạn dùng hoặc số lô – nhớ đối chiếu hộp với lọ.'},
  {re:/(khong dung cho|than trong|phu nu co thai|tre em duoi|hoi y kien bac si|khuyen cao)/, t:'Có cảnh báo, khuyến cáo cho người cần thận trọng.'},
];

/* Thành phần: re trên chữ bỏ dấu; note; ai = những nhóm cần cẩn thận */
const TP = [
  {k:'glutathion', re:/glutathi?on/, t:'Glutathione', note:'Uống glutathione để sáng da: nghiên cứu còn ít, kết quả không đều, hiệu quả (nếu có) mất khi ngừng. Tiêm truyền glutathione để trắng da: không nên.', bai:['gluta12','warnke']},
  {k:'collagen', re:/collag[e]?n|collagene/, t:'Collagen', note:'Các nghiên cứu về da thường dùng vài gam collagen thủy phân mỗi ngày. Viên chỉ vài trăm mg thì khó tạo khác biệt – xem lượng mỗi ngày.', bai:['anhthao']},
  {k:'anhthao', re:/(hoa anh thao|evening primrose|onagre|nachtkerze)/, t:'Dầu hoa anh thảo', note:'Chưa đủ bằng chứng cho bệnh nào, kể cả tiền kinh nguyệt, mãn kinh (NCCIH). Có thể tăng nguy cơ chảy máu khi dùng cùng thuốc chống đông; ngừng 2 tuần trước phẫu thuật.', ai:['bau','thuoc','dongkinh'], bai:['anhthao']},
  {k:'luuly', re:/(luu ly|borage|bourrache|borretsch)/, t:'Dầu lưu ly (borage)', note:'Có thể chứa alkaloid pyrrolizidine hại gan – chỉ dùng loại được chứng nhận không có chất này. Người bệnh gan, bà bầu, mẹ cho con bú tránh dùng lâu (MSKCC).', ai:['bau','gan','thuoc'], bai:['manhae']},
  {k:'dansam', re:/dan sam|danshen|salvia miltiorrhiza/, t:'Đan sâm', note:'Có thể làm tăng tác dụng thuốc chống đông như warfarin.', ai:['thuoc','bau'], bai:['gluta12']},
  {k:'ongchua', re:/sua ong chua|royal jelly|gelee royale/, t:'Sữa ong chúa', note:'Có thể gây dị ứng ở người cơ địa hen, dị ứng.', ai:['diung']},
  {k:'dauca', re:/(dau ca|fish oil|huile de poisson|omega ?3|giap xac|crustace|krill)/, t:'Dầu cá, omega-3, chiết xuất giáp xác', note:'Người dị ứng cá, tôm cua cần đọc kỹ. Liều cao có thể ảnh hưởng đông máu.', ai:['diung','thuoc']},
  {k:'sat', re:/(\bsat ?\(|\bsat (fumarat|sulfat|gluconat|bisglycinat|nguyen to|ii|iii)|\biron\b|\beisen\b|\bfer\b|bo sung sat|vien sat)/, t:'Sắt', note:'Chỉ bổ sung sắt khi xét nghiệm thấy thiếu thật. Viên sắt là nguyên nhân ngộ độc thường gặp ở trẻ nhỏ – cất xa tầm tay trẻ.', ai:['tre']},
  {k:'biotin', re:/biotin|vitamin b7|vitamin h\b/, t:'Biotin', note:'Biotin liều cao có thể làm sai kết quả một số xét nghiệm (tuyến giáp, tim). Báo bác sĩ khi đi xét nghiệm.', ai:['thuoc']},
  {k:'nmn', re:/\bnmn\b|nad\+|nicotinamide mononucleotide/, t:'NMN, NAD+', note:'Thị trường NMN như "ma trận": nhiều sản phẩm không đạt hàm lượng ghi nhãn; lợi ích ở người chưa rõ (BS. Trần Văn Phúc, số 0138–0139).'},
  {k:'nhuantrang', re:/(ta diep|senna|dai hoang|rhubarb|phan tan diep|cascara)/, t:'Tả diệp, đại hoàng (chất nhuận tràng)', note:'Trà "thải độc", "giảm cân" hay có các vị này – thực chất là nhuận tràng, dùng lâu gây mất nước, rối loạn điện giải.', ai:['bau','tre']},
  {k:'cam', re:/(sibutramin|phenolphthalein|dexamethason|corticoid|betamethason|clobetasol|thuy ngan|mercury|hydroquinon|tretinoin)/, t:'Chất cấm hoặc thuốc kê đơn', note:'Đây là thuốc hoặc chất cấm, không được có trong thực phẩm chức năng, mỹ phẩm thông thường. Thấy tên này thì đừng dùng.', nang:3},
  {k:'tio2', re:/(titanium dioxide|titandioxid|ci ?77891|\be171\b)/, t:'Titanium dioxide (E171, CI 77891)', note:'EU cấm E171 trong thực phẩm từ 2022. Với kem đánh răng, Stiftung Warentest khuyên chọn loại không có chất tạo màu này.', bai:['rang']},
  {k:'fluor', re:/(fluor|fluorid|natriumfluorid|sodium fluoride|monofluorophosphat)/, t:'Fluor', note:'Tốt: kem đánh răng có fluor giúp ngừa sâu răng.', tot:true},
  {k:'ngam', re:/(toi ngam dau|ot ngam dau|ngam dau an)/, t:'Tỏi, ớt ngâm dầu', note:'Để ở nhiệt độ phòng có nguy cơ ngộ độc botulinum. Làm ít, để tủ lạnh, dùng nhanh.'},
  {k:'matong', re:/mat ong/, t:'Mật ong', note:'Không cho trẻ dưới 1 tuổi ăn mật ong dưới mọi dạng.', ai:['tre']},
  {k:'ruou', re:/(ruou ngam|ruou thuoc|ngam ruou)/, t:'Rượu ngâm', note:'Quả thối, mốc, bình nhựa, rượu không nhãn có nguy cơ methanol (số 0044).'},
  {k:'chanh', re:/(nuoc chanh|chanh mat ong|chanh am)/, t:'Nước chanh', note:'Nước chanh không chữa bách bệnh, không đốt mỡ, không chữa ung thư; người đau dạ dày uống lúc đói dễ cồn cào (số 0061).'},
  {k:'bakingsoda', re:/(baking soda|thuoc muoi)/, t:'Baking soda', note:'Đắp lên da làm khô rát, phá lớp bảo vệ da. Cho vào nồi luộc rau, nấu cháo làm mất vitamin B1, B2.'},
];

/* Mức tối đa an toàn mỗi ngày cho người lớn (UL), NIH ODS / IOM; B6 thêm mốc EFSA. */
const UL = [
  {k:'vitc', re:/(vitamin c|ascorbic|ascorbat|vit c)/, t:'Vitamin C', ul:2000, unit:'mg', tre:'trẻ 1–3 tuổi 400 mg, 4–8 tuổi 650 mg', note:'Thừa dễ tiêu chảy, tăng nguy cơ sỏi thận ở người có nguy cơ.', bai:['combo']},
  {k:'vite', re:/(vitamin e|tocopher|vit e)/, t:'Vitamin E', ul:1000, unit:'mg', iu:[1100,1500], note:'Mức trần đặt ra vì nguy cơ dễ chảy máu; cẩn thận khi dùng thuốc chống đông.', bai:['combo']},
  {k:'vitd', re:/(vitamin d3?|cholecalciferol|vit d)/, t:'Vitamin D', ul:100, unit:'mcg', iuPer:40, note:'Mức trần 4.000 IU (100 mcg) mỗi ngày; liều cao kéo dài cần xét nghiệm, có bác sĩ theo dõi.'},
  {k:'vita', re:/(vitamin a\b|retinol|retinyl|vit a\b)/, t:'Vitamin A', ul:3000, unit:'mcg', iuPer:3.33, note:'Mức trần 3.000 mcg (khoảng 10.000 IU) mỗi ngày; bà bầu đặc biệt không dùng liều cao.', ai:['bau']},
  {k:'b6', re:/(vitamin b6|pyridox|vit b6)/, t:'Vitamin B6', ul:100, unit:'mg', ul2:'EFSA (2023) đặt mức trần thấp hơn nhiều: 12 mg/ngày', note:'Dùng liều cao kéo dài có thể gây tê bì chân tay.'},
  {k:'kem', re:/\b(kem|zinc|zink)\b(?! (danh rang|duong|chong nang|tron|boi|body|face|nen|lot))/, t:'Kẽm', ul:40, unit:'mg', note:'Thừa kẽm lâu ngày gây thiếu đồng. Cộng cả kẽm trong các viên khác.'},
  {k:'sat', re:/\b(sat|iron|fer|eisen)\b/, t:'Sắt', ul:45, unit:'mg', note:'Chỉ bổ sung khi thiếu thật.'},
  {k:'magie', re:/(magie|magnesium)/, t:'Magie (từ viên bổ sung)', ul:350, unit:'mg', note:'Tính theo magie nguyên tố, không phải cả hợp chất. Người bệnh thận cần bác sĩ.'},
  {k:'canxi', re:/(canxi|calci|calcium)/, t:'Canxi', ul:2500, unit:'mg', note:'Tính theo canxi nguyên tố, cộng cả từ thức ăn.'},
  {k:'folic', re:/(axit folic|acid folic|folic acid|vitamin b9)/, t:'Axit folic (dạng tổng hợp)', ul:1000, unit:'mcg', note:'Thừa có thể che lấp thiếu B12.'},
  {k:'selen', re:/(selen|selenium)/, t:'Selen', ul:400, unit:'mcg', note:'Thừa selen gây rụng tóc, giòn móng.'},
];

/* Loại sản phẩm */
const LOAI = [
  {k:'tpcn', re:/(vien (uong|nang|nen|sui)|thuc pham (bao ve suc khoe|chuc nang|bo sung)|capsule|tablet|softgel|gelule|kapsel|tablett|\d+ ?vien|vitamin|uong \d|ngay \d ?vien)/},
  {k:'mypham', re:/(kem (duong|chong nang|tron|body|face|danh rang)|serum|toner|son (duong|moi)|u moi|mat na|sua rua mat|tay trang|tay da chet|lotion|cream|creme|zahnpasta|zahncreme|mousse|gel rua|duong da|duong am)/},
  {k:'mon', re:/\b(mon an|cach nau|cong thuc nau|nau (canh|chao|nuoc)|luoc|ninh|ham (xuong|ga|thit)|sac (uong|nuoc)|nuoc la|la (oi|tia to|ngai cuu|sen|vong)|ngam (dau|mat ong|ruou)|uong luc doi|an luc doi|moi sang uong)\b/},
];

var SOI_RULES = {BAI, CO, TOT, TP, UL, LOAI};
if (typeof module !== 'undefined') module.exports = SOI_RULES;
