/**
 * ============================================================================
 * 🎂 FILE CẤU HÌNH WEBSITE SINH NHẬT - VŨ TRỤ KỶ NIỆM 3D 🎂
 * ============================================================================
 * Đã tích hợp trọn bộ 44 bức ảnh & video kỷ niệm thật của bạn!
 * Bạn có thể sửa Tên người nhận, Ngày sinh hoặc Lời chúc bên dưới bất cứ lúc nào.
 * ============================================================================
 */

window.BIRTHDAY_CONFIG = {
  // 1. THÔNG TIN CHÍNH CỦA NGƯỜI NHẬN
  recipientName: "Người Thân Yêu Quý",
  recipientSubtitle: "Điểm tựa ấm áp & yêu thương nhất của cả gia đình",
  birthdayDate: "23 • 10 • 2026",
  heroBadge: "✨ CHÚC MỪNG SINH NHẬT • HAPPY BIRTHDAY ✨",
  cakeCenterText: "Happy Birthday",

  // 5 ngọn nến đại diện cho 5 lời ước nguyện tốt đẹp nhất dành tặng người thân
  candleWishes: [
    "Sức khỏe dồi dào, dẻo dai",
    "Tâm an vạn sự bình an",
    "Nụ cười luôn nở trên môi",
    "Gia đình sum vầy hạnh phúc",
    "Mọi điều ước đều thành sự thật"
  ],

  // 2. DANH SÁCH NHẠC NỀN (MÁY PHÁT ĐĨA THAN VINYL)
  playlist: [
    {
      title: "Happy Birthday (Warm Piano & Music Box)",
      artist: "Giai Điệu Sinh Nhật Ấm Áp",
      src: "assets/music/01-happy-birthday-warm-piano.wav",
      cover: "assets/images/ky-niem-01.jpg"
    },
    {
      title: "Giai Điệu Gia Đình Yêu Thương",
      artist: "Bản Hòa Tấu Bình Yên",
      src: "assets/music/02-gia-dinh-yeu-thuong.wav",
      cover: "assets/images/ky-niem-02.jpg"
    }
  ],

  // 3. DANH SÁCH 44 BỨC ẢNH & VIDEO KỶ NIỆM THẬT CỦA BẠN
  // Danh mục (category): "sum-vay" (Sum vầy), "du-lich" (Hành trình), "ky-niem" (Kỷ niệm), "nu-cuoi" (Nụ cười)
  photos: [
    {
      src: "assets/images/ky-niem-01.jpg",
      title: "Buổi Sáng Bình Yên",
      date: "09/01/2025",
      category: "sum-vay",
      note: "Khoảnh khắc bình yên mở đầu ngày mới tràn ngập năng lượng và niềm vui."
    },
    {
      src: "assets/images/ky-niem-02.jpg",
      title: "Nắng Chiều Ấm Áp",
      date: "08/01/2025",
      category: "du-lich",
      note: "Dưới ánh nắng chiều dịu dàng, mỗi phút giây bên nhau đều thật đáng trân quý."
    },
    {
      src: "assets/images/ky-niem-03.jpg",
      title: "Hành Trình Đáng Nhớ",
      date: "08/01/2025",
      category: "du-lich",
      note: "Cùng nhau lưu lại những bước chân trên mọi nẻo đường kỷ niệm."
    },
    {
      src: "assets/images/ky-niem-04.jpg",
      title: "Rạng Rỡ Bên Nhau",
      date: "08/01/2025",
      category: "nu-cuoi",
      note: "Nụ cười rạng ngời xua tan mọi mệt mỏi, mang lại bình yên cho cả nhà."
    },
    {
      src: "assets/images/ky-niem-05.jpg",
      title: "Đêm Thu Sum Họp",
      date: "05/10/2024",
      category: "sum-vay",
      note: "Đêm tháng 10 ấm cúng với biết bao câu chuyện vui và tiếng cười giòn tan."
    },
    {
      src: "assets/images/ky-niem-06.jpg",
      title: "Khoảnh Khắc Thân Thương",
      date: "Kỷ niệm Gia đình",
      category: "sum-vay",
      note: "Nơi bình yên nhất trên thế gian luôn là nơi có gia đình mình bên cạnh."
    },
    {
      src: "assets/images/ky-niem-07.jpg",
      title: "Nụ Cười Yêu Thương",
      date: "Kỷ niệm Đẹp",
      category: "nu-cuoi",
      note: "Ánh mắt và nụ cười ấm áp luôn là món quà vô giá của đại gia đình."
    },
    {
      src: "assets/images/ky-niem-08.jpg",
      title: "Phút Giây Hạnh Phúc",
      date: "Ngày Đặc Biệt",
      category: "ky-niem",
      note: "Thời gian trôi qua nhưng những ký ức đẹp đẽ này sẽ còn mãi với năm tháng."
    },
    {
      src: "assets/images/ky-niem-09.jpg",
      title: "Tình Thân Gắn Kết",
      date: "Kỷ niệm Gia đình",
      category: "sum-vay",
      note: "Cảm ơn vì đã luôn là điểm tựa vững chắc và dịu dàng của mọi người."
    },
    {
      src: "assets/images/ky-niem-10.jpg",
      title: "Dấu Ấn Thời Gian",
      date: "Mùa Yêu Thương",
      category: "ky-niem",
      note: "Mỗi bức hình là một trang nhật ký sống động ngập tràn tình yêu thương."
    },
    {
      src: "assets/images/ky-niem-11.jpg",
      title: "Trọn Vẹn Niềm Vui",
      date: "Khoảnh khắc Quý giá",
      category: "nu-cuoi",
      note: "Chúc người thân yêu luôn giữ mãi vẻ tươi trẻ và nụ cười rạng rỡ như thế này."
    },
    {
      src: "assets/images/ky-niem-12.jpg",
      title: "Chiều Xuân Sum Vầy",
      date: "11/02/2024",
      category: "sum-vay",
      note: "Không khí sum họp ngày đầu năm mới ngập tràn may mắn và tiếng cười."
    },
    {
      src: "assets/images/ky-niem-13.jpg",
      title: "Đón Xuân An Lành",
      date: "11/02/2024",
      category: "sum-vay",
      note: "Những ngày đầu xuân quây quần bên nhau, chúc nhau vạn sự bình an."
    },
    {
      src: "assets/images/ky-niem-14.jpg",
      title: "Chiều Tháng Năm Dịu Dàng",
      date: "03/05/2024",
      category: "du-lich",
      note: "Gió chiều mát rượi và những khoảnh khắc thư thái tuyệt vời bên người thân."
    },
    {
      src: "assets/images/ky-niem-15.jpg",
      title: "Nắng Sớm Trong Lành",
      date: "04/05/2024",
      category: "du-lich",
      note: "Buổi sáng tháng 5 ngập tràn ánh nắng và niềm hứng khởi trên hành trình mới."
    },
    {
      src: "assets/images/ky-niem-16.jpg",
      title: "Khám Phá Cùng Nhau",
      date: "04/05/2024",
      category: "du-lich",
      note: "Đi đâu cũng được, miễn là chúng ta cùng đi với nhau."
    },
    {
      src: "assets/images/ky-niem-17.jpg",
      title: "Đêm Hội Ngộ Ấm Áp",
      date: "11/02/2024",
      category: "sum-vay",
      note: "Ánh đèn lung linh đêm đoàn viên, lưu giữ trọn vẹn hơi ấm gia đình."
    },
    {
      src: "assets/images/ky-niem-18.jpg",
      title: "Niềm Vui Đêm Xuân",
      date: "11/02/2024",
      category: "nu-cuoi",
      note: "Khoảnh khắc sẻ chia niềm vui và những lời chúc tốt đẹp nhất."
    },
    {
      src: "assets/images/ky-niem-19.jpg",
      title: "Giáng Sinh An Lành",
      date: "24/12/2023",
      category: "ky-niem",
      note: "Buổi sáng ngày lễ Giáng Sinh ấm áp giữa tiết trời se lạnh cuối năm."
    },
    {
      src: "assets/images/ky-niem-20.jpg",
      title: "Tháng Mười Hai Dịu Êm",
      date: "03/12/2023",
      category: "ky-niem",
      note: "Những ngày cuối năm thảnh thơi, bình dị mà đong đầy hạnh phúc."
    },
    {
      src: "assets/images/ky-niem-21.jpg",
      title: "Sớm Mai Trong Trẻo",
      date: "26/01/2023",
      category: "du-lich",
      note: "Khởi đầu ngày mới thật nhẹ nhàng giữa khung cảnh thiên nhiên tươi đẹp."
    },
    {
      src: "assets/images/ky-niem-22.jpg",
      title: "Ký Ức Đẹp Tháng Giêng",
      date: "26/01/2023",
      category: "ky-niem",
      note: "Một trong những kỷ niệm tuyệt đẹp đầu năm luôn in đậm trong tim."
    },
    {
      src: "assets/images/ky-niem-23.jpg",
      title: "Kỷ Niệm Xưa Đáng Quý",
      date: "Hoài niệm Đẹp",
      category: "ky-niem",
      note: "Nhìn lại những bức hình kỷ niệm để thấy chúng ta đã có biết bao ngày tháng tuyệt vời."
    },
    {
      src: "assets/images/ky-niem-24.jpg",
      title: "Hoàng Hôn Tháng Năm",
      date: "03/05/2024",
      category: "du-lich",
      note: "Khoảnh khắc chiều tà lãng mạn và yên bình trong chuyến đi đáng nhớ."
    },
    {
      src: "assets/images/ky-niem-25.jpg",
      title: "Chiều Thảnh Thơi",
      date: "03/05/2024",
      category: "nu-cuoi",
      note: "Tận hưởng từng làn gió mát và bầu không khí trong lành."
    },
    {
      src: "assets/images/ky-niem-26.jpg",
      title: "Bình Minh Rực Rỡ",
      date: "13/04/2024",
      category: "du-lich",
      note: "Đón ánh bình minh sớm mai với nguồn năng lượng tươi mới, căng tràn."
    },
    {
      src: "assets/images/ky-niem-27.jpg",
      title: "Chiều Tháng Tư Dịu Mát",
      date: "12/04/2024",
      category: "du-lich",
      note: "Những bước chân thong dong ngắm nhìn cảnh đẹp chiều tháng tư."
    },
    {
      src: "assets/images/ky-niem-28.jpg",
      title: "Khoảnh Khắc Đáng Nhớ",
      date: "12/04/2024",
      category: "ky-niem",
      note: "Lưu giữ trọn vẹn khung hình rạng rỡ trong chuyến hành trình tháng tư."
    },
    {
      src: "assets/images/ky-niem-29.jpg",
      title: "Nụ Cười Chiều Nắng",
      date: "12/04/2024",
      category: "nu-cuoi",
      note: "Chỉ cần nhìn thấy nụ cười ấy là bao nhiêu niềm vui lại ùa về."
    },
    {
      src: "assets/images/ky-niem-30.jpg",
      title: "Hành Trình Hạnh Phúc",
      date: "12/04/2024",
      category: "du-lich",
      note: "Thêm một kỷ niệm thật đẹp trên hành trình khám phá những vùng đất mới."
    },
    {
      src: "assets/images/ky-niem-31.jpg",
      title: "Trưa Thu Ấm Áp",
      date: "12/09/2026",
      category: "sum-vay",
      note: "Khoảnh khắc sum họp gần gũi, giản dị mà tràn đầy tình thương yêu."
    },
    {
      src: "assets/images/ky-niem-32.jpg",
      title: "Ngày Vui Bên Nhau",
      date: "12/09/2026",
      category: "nu-cuoi",
      note: "Những phút giây trò chuyện rôm rả và tiếng cười ngập tràn không gian."
    },
    {
      src: "assets/images/ky-niem-33.jpg",
      title: "Tháng Ba Rạng Ngời",
      date: "07/03/2026",
      category: "nu-cuoi",
      note: "Sắc xuân tháng ba tô điểm thêm cho những khoảnh khắc tuyệt đẹp của gia đình."
    },
    {
      src: "assets/images/ky-niem-34.jpg",
      title: "Phút Giây Quây Quần",
      date: "07/03/2026",
      category: "sum-vay",
      note: "Hạnh phúc đong đầy trong từng ánh mắt và nụ cười thân thương."
    },
    {
      src: "assets/images/ky-niem-35.jpg",
      title: "Kỷ Niệm Tháng Ba",
      date: "07/03/2026",
      category: "ky-niem",
      note: "Mỗi lần gặp gỡ, mỗi lần chụp chung một tấm hình đều là một kỷ niệm quý."
    },
    {
      src: "assets/images/ky-niem-36.jpg",
      title: "Niềm Vui Sum Họp",
      date: "07/03/2026",
      category: "sum-vay",
      note: "Chúc cho đại gia đình mình lúc nào cũng đông vui, gắn kết như thế này."
    },
    {
      src: "assets/images/ky-niem-37.jpg",
      title: "Chiều Đầu Xuân",
      date: "18/02/2026",
      category: "du-lich",
      note: "Không khí trong lành, tươi mới của những ngày du xuân đáng nhớ."
    },
    {
      src: "assets/images/ky-niem-38.jpg",
      title: "Du Xuân Bình An",
      date: "18/02/2026",
      category: "du-lich",
      note: "Cầu chúc một năm mới bình an, sức khỏe dồi dào và vạn sự hanh thông."
    },
    {
      src: "assets/images/ky-niem-39.jpg",
      title: "Nụ Cười Tháng Hai",
      date: "02/02/2026",
      category: "nu-cuoi",
      note: "Khung hình ngập tràn sự tươi tắn và nguồn năng lượng tích cực."
    },
    {
      src: "assets/images/ky-niem-40.mp4",
      type: "video",
      title: "🎬 Thước Phim Timelapse Kỷ Niệm",
      date: "14/09/2025",
      category: "du-lich",
      note: "Thước phim chuyển động sống động ghi lại khoảnh khắc tuyệt đẹp của hành trình!"
    },
    {
      src: "assets/images/ky-niem-41.jpg",
      title: "Chiều Cuối Hạ",
      date: "30/08/2025",
      category: "ky-niem",
      note: "Ánh nắng dịu dàng những ngày cuối tháng tám lưu giữ biết bao cảm xúc."
    },
    {
      src: "assets/images/ky-niem-42.jpg",
      title: "Kỳ Nghỉ Lễ Đáng Nhớ",
      date: "30/04/2025",
      category: "du-lich",
      note: "Chuyến đi dịp lễ 30/4 tràn đầy niềm vui và những trải nghiệm mới mẻ."
    },
    {
      src: "assets/images/ky-niem-43.jpg",
      title: "Đêm Hè Lung Linh",
      date: "22/07/2024",
      category: "sum-vay",
      note: "Buổi tối mùa hè ấm cúng, cùng nhau tận hưởng những giây phút thư giãn."
    },
    {
      src: "assets/images/ky-niem-44.jpg",
      title: "Trọn Vẹn Yêu Thương",
      date: "04/05/2024",
      category: "nu-cuoi",
      note: "Khép lại chuỗi hành trình bằng nụ cười rạng rỡ — Chúc mừng sinh nhật thật hạnh phúc!"
    }
  ],

  quickExtraPhotos: [],

  // 4. BỨC THƯ TAY GIA ĐÌNH (HIỆU ỨNG MỞ PHONG BÌ SÁP VÀNG & ĐÁNH CHỮ)
  letter: {
    greeting: "Gửi người thân yêu quý nhất của gia đình mình,",
    paragraphs: [
      "Hôm nay là một ngày thật đặc biệt — ngày đánh dấu thêm một mùa sinh nhật ý nghĩa trong hành trình cuộc đời. Giữa bộn bề nhịp sống, cả nhà muốn dành tặng bạn một 'Vũ Trụ Kỷ Niệm' nhỏ bé này, nơi lưu giữ trọn vẹn 44 khoảnh khắc và thước phim bình dị nhưng vô giá mà chúng ta đã cùng nhau đi qua từ năm 2023 đến nay.",
      "Cảm ơn bạn vì đã luôn là điểm tựa ấm áp, luôn dành sự quan tâm, bao dung và tình yêu thương trọn vẹn cho gia đình. Mỗi nụ cười, mỗi bữa cơm sum vầy, mỗi chuyến đi cùng nhau đều là những viên ngọc quý lấp lánh trong ký ức của tất cả mọi người.",
      "Bước sang tuổi mới, chẳng mong gì hơn ngoài việc chúc bạn luôn có thật nhiều Sức Khỏe, tâm hồn luôn An Nhiên, mỗi sớm mai thức dậy đều ngập tràn Năng Lượng và Niềm Vui. Dù ở bất cứ đâu, gia đình mình vẫn luôn ở bên cạnh, yêu thương và tự hào về bạn rất nhiều!"
    ],
    closing: "Thương chúc sinh nhật thật ấm áp và hạnh phúc,",
    signature: "Đại Gia Đình Yêu Thương ❤️"
  },

  // 5. GÓC LỜI CHÚC TỪ CÁC THÀNH VIÊN TRONG GIA ĐÌNH
  familyWishes: [
    {
      sender: "Lời chúc Sức Khỏe & Bình An",
      role: "Từ cả đại gia đình",
      avatar: "🌟",
      message: "Chúc tuổi mới luôn dồi dào sức khỏe, tinh thần thư thái, mọi dự định đều thuận buồm xuôi gió và luôn rạng rỡ như ánh mặt trời!"
    },
    {
      sender: "Lời chúc Niềm Vui Mỗi Ngày",
      role: "Gửi ngàn yêu thương",
      avatar: "🎂",
      message: "Cảm ơn vì đã luôn mang lại tiếng cười và sự ấm áp cho ngôi nhà mình. Chúc mỗi ngày trong năm mới đều là một ngày lễ ngập tràn niềm vui!"
    },
    {
      sender: "Lời chúc Sum Vầy & Hạnh Phúc",
      role: "Kỷ niệm đáng nhớ",
      avatar: "🏡",
      message: "Mong gia đình mình sẽ có thêm thật nhiều chuyến đi chơi xa, chụp thêm hàng trăm bức ảnh kỷ niệm để làm đầy hơn nữa dải ngân hà yêu thương này!"
    },
    {
      sender: "Lời chúc Thành Công & Như Ý",
      role: "Tuổi mới rực rỡ",
      avatar: "🥂",
      message: "Tuổi mới thêm nhiều may mắn, vạn sự hanh thông, luôn giữ vững ngọn lửa nhiệt huyết và tận hưởng trọn vẹn từng khoảnh khắc tuyệt đẹp của cuộc sống!"
    }
  ]
};
