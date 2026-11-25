# Soi cùng Cô Kỹ – https://soi.bepcoky.com

Ứng dụng web cài được lên điện thoại (PWA) giúp người đọc **chậm lại một nhịp trước khi xuống tiền**: chụp ảnh hoặc dán chữ quảng cáo, nhãn sản phẩm, bài "món này chữa bệnh kia" → ứng dụng đọc chữ ngay trên máy → chỉ ra dấu hiệu cần cẩn thận, tính lại con số trên hộp, so với mức tối đa an toàn, dẫn tới bài kiểm chứng trên bepcoky.com.

Thuộc hệ Bếp Cô Kỹ (Trần Thị Kỹ). Trang chính: https://bepcoky.com – kho `tranthiky/tranthiky.github.io`.

## Nguyên tắc không đổi
- **Ảnh và chữ của người dùng xử lý trên máy họ**, không tải lên đâu, không lưu trên trang. Nếu sau này thêm tính năng gửi lên máy chủ (vd "Hỏi AI kỹ hơn") phải xin đồng ý từng lần và sửa lời cam kết trên trang.
- Bộ máy là **quy tắc có nguồn**, không phải AI; không hứa "chính xác"; luôn nhắc không thay bác sĩ, dược sĩ.
- Không nêu tên người bán cá nhân; nêu tên hãng chỉ khi có bài kiểm chứng đã đăng.

## Cấu trúc
| Tệp | Việc |
|---|---|
| `index.html` | Giao diện (một trang), CSS trong tệp |
| `app.js` | Chọn/chụp ảnh, đọc chữ (Tesseract.js), lựa chọn, hiển thị kết quả, cài đặt, gửi Zalo |
| `engine.js` | Bộ máy soi: chuẩn hóa chữ (bỏ dấu, bỏ ký tự chèn "ná:m"), cờ đỏ, thành phần, tính con số, mức tối đa, kết luận 3 mức |
| `rules.js` | **Bộ quy tắc** – sửa ở đây là chính. Mẫu viết cho chữ không dấu, chữ thường |
| `sw.js` | Service worker: vỏ ứng dụng ưu tiên mạng; bộ đọc chữ lưu lần đầu dùng |
| `manifest.webmanifest`, `icons/` | Cài lên điện thoại |
| `ocr/` | Tesseract.js 7 + lõi WASM (lstm, simd-lstm, relaxedsimd-lstm) + dữ liệu `vie`, `eng` (best_int). Giấy phép Apache-2.0 (`ocr/LICENSE-tesseract.txt`) |
| `tests/test-engine.js` | 7 mẫu thử bộ máy: `node tests/test-engine.js` |
| `CNAME` | `soi.bepcoky.com` |

## Sửa và phát hành
1. Sửa `rules.js` / `engine.js` / giao diện.
2. Chạy `node tests/test-engine.js` – kết luận của 7 mẫu không được đổi ngoài ý muốn.
3. **Tăng `SHELL` trong `sw.js`** (vd `soi-shell-v3`) và ghi `CHANGELOG.md`.
4. Đẩy `main` → GitHub Pages tự chạy (1–2 phút). Điện thoại nhận bản mới khi mở ứng dụng lúc có mạng.

## Tên miền
Cloudflare (tài khoản anh Dũng): CNAME `soi` → `tranthiky.github.io`, DNS only (mây xám). GitHub Pages: Source `main` / root, Custom domain `soi.bepcoky.com`, Enforce HTTPS.
