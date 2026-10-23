# 🎂 Hướng Dẫn Thay Ảnh, Nhạc & Lời Chúc Cực Dễ

Chào mừng bạn đến với dự án **Vũ Trụ Kỷ Niệm 3D (Birthday Galaxy 3D)**!
Website được thiết kế để chạy trực tiếp ngay khi mở file `index.html` mà không cần cài đặt phần mềm phức tạp.

---

## 📂 Cấu Trúc Thư Mục

```text
birthday-galaxy-3d/
├── index.html                  # File giao diện chính (Nhấn đúp chuột để mở web)
├── config.js                   # ⭐ File cấu hình Tên, Ngày sinh, Lời chúc, Danh sách Ảnh & Nhạc
├── style.css                   # Giao diện 3D, hiệu ứng ánh sáng vàng ấm áp
├── script.js                   # Bộ xử lý 3D Galaxy, thổi nến Micro, pháo hoa & máy đĩa than
└── assets/
    ├── images/                 # 📸 Thư mục chứa 24+ bức ảnh kỷ niệm (anh-01.jpg -> anh-24.jpg)
    └── music/                  # 🎵 Thư mục chứa file nhạc nền (.mp3, .wav)
```

---

## 🖼️ 3 Cách Thay Ảnh Của Gia Đình Bạn

### Cách 1: Nhanh nhất — Không cần sửa bất kỳ dòng code nào!
1. Mở thư mục `assets/images/`.
2. Chuẩn bị các bức ảnh gia đình của bạn và đặt tên đè lên các file có sẵn: `anh-01.jpg`, `anh-02.jpg`, ..., `anh-24.jpg`.
3. Tải lại trang web (`F5`) là toàn bộ ảnh trong **Dải Ngân Hà 3D** và **Tường Ảnh Polaroid** sẽ tự động đổi sang ảnh của bạn!

### Cách 2: Thêm 30, 50 hoặc 100+ bức ảnh tùy thích trong `config.js`
1. Chép toàn bộ ảnh mới của bạn vào thư mục `assets/images/` (ví dụ: `gia-dinh-1.jpg`, `du-lich-2.png`...).
2. Mở file `config.js` bằng Notepad hoặc VS Code.
3. Kéo xuống mục `quickExtraPhotos` và điền tên file vào:
   ```js
   quickExtraPhotos: [
     "assets/images/gia-dinh-1.jpg",
     "assets/images/du-lich-2.png",
     "assets/images/sinh-nhat-3.jpg"
   ],
   ```
   Hoặc chỉnh sửa trực tiếp tiêu đề (`title`), ngày tháng (`date`) và lời nhắn mặt sau (`note`) của từng tấm ảnh trong danh sách `photos: [...]`.

### Cách 3: Chọn ảnh & nhạc trực tiếp ngay trên giao diện Web
- Mở trang web lên, nhấn nút **⚙️ Thêm Ảnh & Nhạc** ở góc trên bên phải màn hình.
- Tại đây bạn có thể chọn hàng chục bức ảnh và bài hát `.mp3` từ máy tính để xem trước ngay lập tức!

---

## 🎵 Cách Thay Nhạc Nền (Máy Đĩa Than Vinyl)

1. Chép file nhạc `.mp3` hoặc `.wav` bạn yêu thích vào thư mục `assets/music/` (ví dụ: `khuc-hat-mung-sinh-nhat.mp3`).
2. Mở file `config.js`, tìm phần `playlist` và thêm bài hát của bạn lên đầu danh sách:
   ```js
   playlist: [
     {
       title: "Khúc Hát Mừng Sinh Nhật",
       artist: "Gia Đình Yêu Thương",
       src: "assets/music/khuc-hat-mung-sinh-nhat.mp3",
       cover: "assets/images/anh-01.jpg"
     },
   ]
   ```

---

## ✏️ Cách Đổi Tên Người Nhận & Nội Dung Bức Thư Tay

Mở file `config.js` và sửa các dòng đầu tiên:
- `recipientName`: Tên người thân được chúc mừng (VD: `"Mẹ Yêu Quý"`, `"Bố Kính Yêu"`, `"Chị Hai Thương Yêu"`...).
- `recipientSubtitle`: Câu đề tặng bên dưới tên.
- `birthdayDate`: Ngày tháng năm sinh nhật.
- `letter`: Nội dung bức thư nằm trong phong bì sáp vàng.
- `familyWishes`: Các thẻ lời chúc từ từng thành viên trong gia đình.
