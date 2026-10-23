/**
 * ============================================================================
 * VŨ TRỤ KỶ NIỆM 3D - MAIN INTERACTIVE ENGINE
 * ============================================================================
 */

(function () {
  "use strict";

  const CFG = window.BIRTHDAY_CONFIG || {};

  // Chuẩn bị danh sách ảnh (kết hợp photos + quickExtraPhotos)
  const allPhotos = [...(CFG.photos || [])];
  if (Array.isArray(CFG.quickExtraPhotos)) {
    CFG.quickExtraPhotos.forEach((src, i) => {
      allPhotos.push({
        src,
        title: `Khoảnh Khắc Đáng Nhớ #${allPhotos.length + 1}`,
        date: "Kỷ niệm Gia đình",
        category: "ky-niem",
        note: "Mỗi bức ảnh là một mảnh ghép yêu thương trong vũ trụ kỷ niệm của gia đình mình."
      });
    });
  }

  const playlist = [...(CFG.playlist || [])];
  const familyWishes = [...(CFG.familyWishes || [])];
  const candleWishes = CFG.candleWishes || [
    "Sức khỏe dồi dào, bình an",
    "Niềm vui ngập tràn mỗi ngày",
    "Gia đình sum vầy hạnh phúc",
    "Vạn sự hanh thông như ý",
    "Mọi ước nguyện đều thành sự thật"
  ];

  // Trạng thái ứng dụng
  const state = {
    currentStage: "stage-cake",
    litCandles: candleWishes.length,
    totalCandles: candleWishes.length,
    hasTransitionedToGalaxy: false,
    micActive: false,
    micStream: null,
    micAnimId: null,

    // 3D Galaxy state
    galaxyMode: "helix", // 'helix' | 'ring' | 'sphere'
    rotX: -8,
    rotY: 0,
    zoomZ: -230,
    autoRotate: true,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    dragMoved: false,

    // Lightbox & Slideshow
    lightboxIndex: 0,
    slideshowTimer: null,

    // Audio / Vinyl Player
    trackIndex: 0,
    isPlaying: false,
    audioCtx: null,

    // Letter Typewriter
    envelopeOpened: false,
    typingTimer: null,

    // Starfield Warp
    warpSpeed: 1
  };

  // ==========================================================================
  // 1. KHỞI TẠO NỘI DUNG TỪ CONFIG.JS
  // ==========================================================================
  function initConfigContent() {
    setText("hero-badge", CFG.heroBadge || "✨ CHÚC MỪNG SINH NHẬT ✨");
    setText("hero-recipient-name", CFG.recipientName || "Người Thân Yêu Quý");
    setText("hero-recipient-subtitle", CFG.recipientSubtitle || "");
    setText("hero-birthday-date", CFG.birthdayDate || "23 • 10");
    setText("cake-topper-text", CFG.cakeCenterText || "Happy Birthday");
    setText("nav-recipient-tag", CFG.recipientName || "Mừng Sinh Nhật");
    setText("core-recipient-name", CFG.recipientName || "Gia Đình Yêu Thương");

    // Điền sẵn vào form tùy chỉnh nhanh
    const nameIn = document.getElementById("input-recipient-name");
    const subIn = document.getElementById("input-recipient-sub");
    const dateIn = document.getElementById("input-birthday-date");
    if (nameIn) nameIn.value = CFG.recipientName || "";
    if (subIn) subIn.value = CFG.recipientSubtitle || "";
    if (dateIn) dateIn.value = CFG.birthdayDate || "";

    // Khởi tạo Thư tay
    if (CFG.letter) {
      setText("letter-greeting", CFG.letter.greeting || "Gửi người thân yêu quý,");
      setText("letter-closing", CFG.letter.closing || "Thương chúc sinh nhật hạnh phúc,");
      setText("letter-signature", CFG.letter.signature || "Đại Gia Đình ❤️");
    }

    updatePhotoCountBadges();
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function updatePhotoCountBadges() {
    setText("galaxy-count-badge", String(allPhotos.length));
    setText("count-all", String(allPhotos.length));
  }

  // Nạp & Lưu dữ liệu đa tầng (Hỗ trợ LocalStorage + URL Hash Nén cho Vercel + Cloud API /api/storage + Xuất file config.js)
  const STORAGE_KEY = "BIRTHDAY_GALAXY_PHOTOS_V3";
  const FULL_STATE_KEY = "BIRTHDAY_GALAXY_FULL_STATE_V3";
  let saveToastTimer = null;
  let saveApiTimer = null;

  function showSaveToast(toastMsg = "💾 Đã tự động lưu nội dung!") {
    const toast = document.getElementById("autosave-toast");
    if (toast) {
      toast.textContent = toastMsg;
      toast.classList.remove("hidden");
      if (saveToastTimer) clearTimeout(saveToastTimer);
      saveToastTimer = setTimeout(() => {
        toast.classList.add("hidden");
      }, 2200);
    }
  }

  function buildFullStatePayload() {
    return {
      updatedAt: Date.now(),
      recipientName: CFG.recipientName || "Người Thân Yêu Quý",
      recipientSubtitle: CFG.recipientSubtitle || "",
      birthdayDate: CFG.birthdayDate || "23 • 10 • 2026",
      photos: allPhotos,
      letter: CFG.letter || {},
      familyWishes: familyWishes
    };
  }

  function applyStatePayload(data) {
    if (!data || typeof data !== "object") return;
    if (typeof data.updatedAt === "number") state.lastUpdatedAt = data.updatedAt;
    if (typeof data.recipientName === "string") CFG.recipientName = data.recipientName;
    if (typeof data.recipientSubtitle === "string") CFG.recipientSubtitle = data.recipientSubtitle;
    if (typeof data.birthdayDate === "string") CFG.birthdayDate = data.birthdayDate;

    if (data.letter && typeof data.letter === "object") {
      CFG.letter = { ...(CFG.letter || {}), ...data.letter };
    }

    if (Array.isArray(data.familyWishes) && data.familyWishes.length > 0) {
      familyWishes.length = 0;
      data.familyWishes.forEach((w) => familyWishes.push(w));
    }

    if (Array.isArray(data.photos)) {
      const mapBySrc = new Map();
      data.photos.forEach((item) => {
        if (item && item.src) mapBySrc.set(item.src, item);
      });
      allPhotos.forEach((p, idx) => {
        const s = mapBySrc.get(p.src) || data.photos[idx];
        if (s) {
          if (typeof s.title === "string") p.title = s.title;
          if (typeof s.date === "string") p.date = s.date;
          if (typeof s.note === "string") p.note = s.note;
          if (typeof s.overlayText === "string") p.overlayText = s.overlayText;
          if (typeof s.category === "string") p.category = s.category;
          if (typeof s.rotation === "number") p.rotation = s.rotation;
        }
      });
    }
  }

  // Nén & Giải nén trạng thái thành chuỗi Base64URL gọn nhẹ trên thanh địa chỉ Vercel (#s=...)
  async function compressStateToToken(stateObj) {
    // Chỉ lưu phần dữ liệu chữ gọn nhẹ để URL ngắn nhất có thể
    const compact = {
      t: stateObj.updatedAt || Date.now(),
      n: stateObj.recipientName,
      s: stateObj.recipientSubtitle,
      d: stateObj.birthdayDate,
      l: stateObj.letter,
      w: stateObj.familyWishes,
      p: (stateObj.photos || []).map((p) => [
        p.title || "",
        p.date || "",
        p.note || "",
        p.overlayText || "",
        p.category || "ky-niem",
        p.rotation || 0
      ])
    };
    const jsonBytes = new TextEncoder().encode(JSON.stringify(compact));
    if (typeof CompressionStream !== "undefined") {
      const cs = new CompressionStream("deflate-raw");
      const writer = cs.writable.getWriter();
      writer.write(jsonBytes);
      writer.close();
      const compressedBuf = await new Response(cs.readable).arrayBuffer();
      const bytes = new Uint8Array(compressedBuf);
      let bin = "";
      for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
      return "z." + btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    } else {
      let bin = "";
      for (let i = 0; i < jsonBytes.length; i++) bin += String.fromCharCode(jsonBytes[i]);
      return "u." + btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }
  }

  async function decompressTokenToState(token) {
    if (!token || typeof token !== "string") return null;
    const isDeflated = token.startsWith("z.");
    const rawB64 = (isDeflated || token.startsWith("u.") ? token.slice(2) : token)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const pad = rawB64.length % 4 === 0 ? "" : "=".repeat(4 - (rawB64.length % 4));
    const bin = atob(rawB64 + pad);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);

    let jsonStr = "";
    if (isDeflated && typeof DecompressionStream !== "undefined") {
      const ds = new DecompressionStream("deflate-raw");
      const writer = ds.writable.getWriter();
      writer.write(bytes);
      writer.close();
      const decompressedBuf = await new Response(ds.readable).arrayBuffer();
      jsonStr = new TextDecoder().decode(decompressedBuf);
    } else {
      jsonStr = new TextDecoder().decode(bytes);
    }

    const compact = JSON.parse(jsonStr);
    const expandedPhotos = allPhotos.map((orig, idx) => {
      const row = compact.p && compact.p[idx];
      if (!row) return orig;
      return {
        ...orig,
        title: row[0],
        date: row[1],
        note: row[2],
        overlayText: row[3],
        category: row[4] || orig.category,
        rotation: row[5] || 0
      };
    });

    return {
      updatedAt: compact.t || 0,
      recipientName: compact.n,
      recipientSubtitle: compact.s,
      birthdayDate: compact.d,
      letter: compact.l,
      familyWishes: compact.w,
      photos: expandedPhotos
    };
  }

  function loadSavedPhotoEdits() {
    try {
      const rawFull = localStorage.getItem(FULL_STATE_KEY);
      if (rawFull) {
        applyStatePayload(JSON.parse(rawFull));
        return;
      }
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        applyStatePayload({ photos: JSON.parse(raw) });
      }
    } catch (_) {}
  }

  async function loadCloudOrUrlStateOnBoot() {
    // 1. Đọc từ URL Hash (#s=...) nếu có
    try {
      const hash = window.location.hash || "";
      const match = hash.match(/[#&]s=([^&]+)/);
      if (match && match[1]) {
        const decoded = await decompressTokenToState(decodeURIComponent(match[1]));
        if (decoded) {
          // Chỉ ghi đè nếu bản trong URL mới hơn hoặc máy khách chưa có dữ liệu localStorage
          const localTime = state.lastUpdatedAt || 0;
          const urlTime = decoded.updatedAt || 0;
          if (urlTime >= localTime || localTime === 0) {
            applyStatePayload(decoded);
            try {
              localStorage.setItem( STORAGE_KEY, JSON.stringify(allPhotos));
              localStorage.setItem(FULL_STATE_KEY, JSON.stringify(decoded));
            } catch (_) {}
            refreshAllViewsFromState();
          } else {
            // Bản trong localStorage mới hơn -> cập nhật ngược lại lên URL
            const freshPayload = buildFullStatePayload();
            const freshToken = await compressStateToToken(freshPayload);
            if (freshToken) window.history.replaceState(null, "", `#s=${freshToken}`);
          }
          return;
        }
      } else if (state.lastUpdatedAt) {
        // Nếu URL chưa có #s= nhưng localStorage đã có bản lưu -> tự động gắn lên URL luôn
        const freshPayload = buildFullStatePayload();
        const freshToken = await compressStateToToken(freshPayload);
        if (freshToken) window.history.replaceState(null, "", `#s=${freshToken}`);
      }
    } catch (_) {}

    // 2. Nếu đang chạy trên localhost thì kiểm tra thêm dữ liệu trên đĩa
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      try {
        const resp = await fetch("/api/storage", { cache: "no-store" });
        if (resp.ok) {
          const data = await resp.json();
          if (data && data.ok && data.state) {
            const cloudTime = data.state.updatedAt || 0;
            const localTime = state.lastUpdatedAt || 0;
            if (cloudTime > localTime) {
              applyStatePayload(data.state);
              refreshAllViewsFromState();
            }
          }
        }
      } catch (_) {}
    }
  }

  function refreshAllViewsFromState() {
    initConfigContent();
    renderGalaxyCards();
    renderPolaroidAlbum(getActiveAlbumFilter());
    fillFullLetterText();
    renderFamilyWishes();
  }

  function persistPhotoEdits(toastMsg = "💾 Đã tự động lưu nội dung!") {
    const payload = buildFullStatePayload();
    state.lastUpdatedAt = payload.updatedAt;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allPhotos));
      localStorage.setItem(FULL_STATE_KEY, JSON.stringify(payload));
    } catch (_) {}

    showSaveToast(toastMsg);

    // Tự động cập nhật mã nén trên thanh địa chỉ URL (#s=...) sau 100ms
    if (saveApiTimer) clearTimeout(saveApiTimer);
    saveApiTimer = setTimeout(async () => {
      try {
        const token = await compressStateToToken(payload);
        if (token) {
          window.history.replaceState(null, "", `#s=${token}`);
        }
      } catch (_) {}

      // Nếu đang chạy trên localhost thì đồng bộ luôn vào config.js
      if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        fetch("/api/storage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }).catch(() => {});
      }
    }, 100);
  }

  async function copyShareableVercelLink() {
    const payload = buildFullStatePayload();
    state.lastUpdatedAt = payload.updatedAt;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allPhotos));
      localStorage.setItem(FULL_STATE_KEY, JSON.stringify(payload));
      const token = await compressStateToToken(payload);
      const shareUrl = `${window.location.origin}${window.location.pathname}#s=${token}`;
      window.history.replaceState(null, "", `#s=${token}`);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      }
      showSaveToast("✅ Đã Lưu & Copy Link! Tải lại trang (F5) hoặc gửi link này đều giữ nguyên 100%!");
    } catch (err) {
      showSaveToast("💾 Đã lưu vào trình duyệt!");
    }
  }

  function exportConfigJsFile() {
    const payload = buildFullStatePayload();
    const configObj = {
      recipientName: payload.recipientName,
      recipientSubtitle: payload.recipientSubtitle,
      birthdayDate: payload.birthdayDate,
      heroBadge: CFG.heroBadge || "✨ CHÚC MỪNG SINH NHẬT • HAPPY BIRTHDAY ✨",
      cakeCenterText: CFG.cakeCenterText || "Happy Birthday",
      candleWishes: candleWishes,
      playlist: playlist,
      photos: allPhotos,
      quickExtraPhotos: [],
      letter: payload.letter,
      familyWishes: payload.familyWishes
    };
    const fileContent =
      "/**\n * FILE CẤU HÌNH WEBSITE SINH NHẬT - ĐÃ CẬP NHẬT TRỰC TIẾP TỪ GIAO DIỆN WEB\n */\n\nwindow.BIRTHDAY_CONFIG = " +
      JSON.stringify(configObj, null, 2) +
      ";\n";
    const blob = new Blob([fileContent], { type: "application/javascript;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "config.js";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSaveToast("📥 Đã tải file config.js mới nhất về máy!");
  }

  function syncSingleCardUI(idx) {
    const p = allPhotos[idx];
    if (!p) return;
    // Cập nhật tại chỗ trên thẻ 3D Galaxy (không dựng lại DOM)
    const gCard = document.querySelector(`.galaxy-card[data-index="${idx}"]`);
    if (gCard) {
      const cap = gCard.querySelector(".galaxy-card-caption");
      if (cap) cap.textContent = p.title || "";
      const media = gCard.querySelector("img, video");
      if (media) {
        media.style.transform = p.rotation ? `rotate(${p.rotation}deg)` : "";
      }
    }
    // Cập nhật tại chỗ trên thẻ Gallery (không dựng lại 44 thẻ khi đang gõ phím trên điện thoại)
    const pWrap = document.querySelector(`.polaroid-img-wrap[data-idx="${idx}"]`);
    const pCard = pWrap ? pWrap.closest(".polaroid-card") : null;
    if (pCard) {
      const frontTitle = pCard.querySelector(".polaroid-title");
      const backTitle = pCard.querySelector(".polaroid-back-title");
      const backNote = pCard.querySelector(".polaroid-back-note");
      const dateTag = pCard.querySelector(".polaroid-date-tag");
      const overlayTag = pCard.querySelector(".photo-onscreen-caption");
      const media = pCard.querySelector(".polaroid-img-wrap img, .polaroid-img-wrap video");
      if (frontTitle && document.activeElement !== frontTitle) frontTitle.textContent = p.title || "";
      if (backTitle && document.activeElement !== backTitle) backTitle.textContent = p.title || "";
      if (backNote && document.activeElement !== backNote) backNote.textContent = p.note || "";
      if (dateTag && document.activeElement !== dateTag) {
        dateTag.textContent = isVideoItem(p) ? `▶ VIDEO • ${p.date || "Kỷ niệm"}` : (p.date || "Kỷ niệm");
      }
      if (overlayTag && document.activeElement !== overlayTag) overlayTag.textContent = p.overlayText || "";
      if (media) media.style.transform = p.rotation ? `rotate(${p.rotation}deg)` : "";
    }
  }

  function rotatePhotoByIndex(idx) {
    const p = allPhotos[idx];
    if (!p) return;
    p.rotation = ((p.rotation || 0) + 90) % 360;
    syncSingleCardUI(idx);
    renderPolaroidAlbum(getActiveAlbumFilter());
    if (!document.getElementById("lightbox-modal").classList.contains("hidden") && state.lightboxIndex === idx) {
      updateLightboxContent();
    }
    persistPhotoEdits("🔄 Đã xoay và lưu chiều bức hình!");
    // Gọi API xoay file vật lý nếu dùng server.py
    fetch("/api/rotate-photo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ src: p.src })
    }).catch(() => {});
  }

  function getActiveAlbumFilter() {
    const activePill = document.querySelector(".filter-pill.active");
    return activePill ? activePill.dataset.filter : "all";
  }

  // ==========================================================================
  // 2. ÂM THANH HIỆU ỨNG NHẸ NHÀNG (WEB AUDIO CHIMES & SPARKLES)
  // ==========================================================================
  function getAudioContext() {
    if (!state.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        state.audioCtx = new AudioContextClass();
      }
    }
    if (state.audioCtx && state.audioCtx.state === "suspended") {
      state.audioCtx.resume();
    }
    return state.audioCtx;
  }

  function playMagicChime(freqBase = 523.25) {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const freqs = [freqBase, freqBase * 1.25, freqBase * 1.5, freqBase * 2];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(f, now + idx * 0.06);
        gain.gain.setValueAtTime(0.001, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.08, now + idx * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.9);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.95);
      });
    } catch (_) {}
  }

  // ==========================================================================
  // 3. CHUYỂN CẢNH (STAGE NAVIGATION)
  // ==========================================================================
  function switchStage(targetId) {
    state.currentStage = targetId;
    document.querySelectorAll(".stage-section").forEach((sec) => {
      sec.classList.toggle("active", sec.id === targetId);
    });
    document.querySelectorAll(".stage-tab").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.target === targetId);
    });

    if (targetId === "stage-letter" && !state.envelopeOpened) {
      // Nhắc nhẹ mở phong bì
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function initNavigation() {
    document.querySelectorAll(".stage-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        switchStage(btn.dataset.target);
      });
    });

    const homeBtn = document.getElementById("brand-home-btn");
    if (homeBtn) {
      homeBtn.addEventListener("click", () => switchStage("stage-cake"));
    }
  }

  // ==========================================================================
  // 4. CẢNH 1: BÁNH KEM 3D & THỔI NẾN (CLICK + MICROPHONE BLOW SENSOR)
  // ==========================================================================
  function renderCandles() {
    const row = document.getElementById("candles-row");
    if (!row) return;
    row.innerHTML = "";
    state.totalCandles = candleWishes.length;
    state.litCandles = candleWishes.length;

    candleWishes.forEach((wishText, idx) => {
      const candle = document.createElement("div");
      candle.className = "candle-item";
      candle.dataset.index = String(idx);
      candle.title = `Cột sáng #0${idx + 1}: ${wishText}`;
      candle.innerHTML = `
        <div class="candle-flame-wrap">
          <div class="candle-flame"></div>
          <div class="candle-smoke"></div>
        </div>
        <div class="candle-wick"></div>
        <div class="candle-stick"></div>
      `;
      candle.addEventListener("click", (e) => {
        e.stopPropagation();
        extinguishSingleCandle(idx, true);
      });
      // Hỗ trợ vuốt ngón tay ngang qua các cột sáng trên Mobile
      candle.addEventListener("pointerenter", (e) => {
        if (e.buttons === 1 || e.pointerType === "touch") {
          extinguishSingleCandle(idx, true);
        }
      });
      row.appendChild(candle);
    });

    updateCandlesStatusUI();
  }

  function extinguishSingleCandle(idx, fromUserClick = false) {
    const row = document.getElementById("candles-row");
    if (!row) return;
    const candle = row.querySelector(`.candle-item[data-index="${idx}"]`);
    if (!candle || candle.classList.contains("extinguished")) return;

    candle.classList.add("extinguished");
    state.litCandles = Math.max(0, state.litCandles - 1);

    const wish = candleWishes[idx] || "Sức khỏe & Bình an";
    const toast = document.getElementById("wish-toast");
    if (toast) {
      toast.textContent = `0${idx + 1} // ${wish.toUpperCase()}`;
    }

    playMagicChime(440 + idx * 65);
    updateCandlesStatusUI();

    if (fromUserClick) {
      spawnFireworkBurst(window.innerWidth * (0.3 + Math.random() * 0.4), window.innerHeight * 0.28);
    }

    if (state.litCandles === 0) {
      onAllCandlesBlownOut();
    }
  }

  function blowAllCandlesSequence() {
    if (!state.isPlaying) {
      playCurrentTrack();
    }

    const row = document.getElementById("candles-row");
    if (!row) return;
    const unlit = Array.from(row.querySelectorAll(".candle-item:not(.extinguished)"));

    if (unlit.length === 0) {
      switchStage("stage-galaxy");
      launchCelebrationSalvo();
      return;
    }

    unlit.forEach((el, i) => {
      const idx = Number(el.dataset.index);
      setTimeout(() => {
        extinguishSingleCandle(idx, false);
      }, i * 130);
    });
  }

  function onAllCandlesBlownOut() {
    stopMicBlowDetection();
    const toast = document.getElementById("wish-toast");
    if (toast) {
      toast.innerHTML = "✦ ĐANG MỞ KHÔNG GIAN LƯU TRỮ 3D...";
    }

    const relightBtn = document.getElementById("btn-relight-candles");
    if (relightBtn) relightBtn.classList.remove("hidden");

    const blowText = document.getElementById("btn-blow-text");
    if (blowText) blowText.textContent = "BƯỚC VÀO KHÔNG GIAN 3D";

    launchCelebrationSalvo();
    state.warpSpeed = 16;
    setTimeout(() => {
      state.warpSpeed = 1;
    }, 1600);

    if (!state.hasTransitionedToGalaxy) {
      state.hasTransitionedToGalaxy = true;
      setTimeout(() => {
        switchStage("stage-galaxy");
        launchCelebrationSalvo();
      }, 1250);
    }
  }

  function relightAllCandles() {
    document.querySelectorAll(".candle-item").forEach((c) => {
      c.classList.remove("extinguished");
    });
    state.litCandles = state.totalCandles;
    state.hasTransitionedToGalaxy = false;
    updateCandlesStatusUI();
    setText("wish-toast", "CHẠM VÀO CÁC CỘT SÁNG HOẶC KÍCH HOẠT CỔNG KHÔNG GIAN 3D");
    setText("btn-blow-text", "KHÁM PHÁ KHÔNG GIAN 3D");
    const relightBtn = document.getElementById("btn-relight-candles");
    if (relightBtn) relightBtn.classList.add("hidden");
  }

  function updateCandlesStatusUI() {
    setText("lit-candles-count", `${state.litCandles} / ${state.totalCandles}`);
  }

  // Cảm biến âm thanh qua Microphone (Hỗ trợ tự động bật sau 10 giây kể từ khi web tải xong)
  let autoMicInterval = null;

  function clearAutoMicTimer() {
    if (autoMicInterval) {
      clearInterval(autoMicInterval);
      autoMicInterval = null;
    }
  }

  function scheduleAutoMicStart(seconds = 10) {
    clearAutoMicTimer();
    let remaining = seconds;
    const micLabel = document.getElementById("mic-btn-label");
    if (micLabel && !state.micActive) {
      micLabel.textContent = `Cảm biến âm thanh (${remaining}s)`;
    }

    autoMicInterval = setInterval(() => {
      // Nếu người dùng đã chuyển cảnh, đã tắt hết nến hoặc đã bật mic thủ công thì dừng đếm ngược
      if (state.micActive || state.litCandles === 0 || state.currentStage !== "stage-cake") {
        clearAutoMicTimer();
        return;
      }
      remaining--;
      if (remaining > 0) {
        if (micLabel) micLabel.textContent = `Cảm biến âm thanh (${remaining}s)`;
      } else {
        clearAutoMicTimer();
        startMicBlowDetection(true);
      }
    }, 1000);
  }

  async function toggleMicBlowDetection() {
    clearAutoMicTimer();
    if (state.micActive) {
      stopMicBlowDetection();
      return;
    }
    await startMicBlowDetection(false);
  }

  async function startMicBlowDetection(isAutoTriggered = false) {
    if (state.micActive) return;

    const micBtn = document.getElementById("btn-mic-blow");
    const micLabel = document.getElementById("mic-btn-label");
    const meterBox = document.getElementById("mic-meter-box");
    const toast = document.getElementById("wish-toast");

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Mic not supported");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      state.micStream = stream;
      state.micActive = true;

      if (micBtn) micBtn.classList.add("listening");
      if (micLabel) micLabel.textContent = "Đang nghe hơi thổi... (Dừng)";
      if (meterBox) meterBox.classList.remove("hidden");
      if (toast) {
        toast.textContent = "🎙️ CẢM BIẾN ĐÃ BẬT — HÃY THỔI NHẸ VÀO MÀN HÌNH ĐỂ TẮT NẾN!";
      }

      const ctx = getAudioContext();
      if (ctx && ctx.state === "suspended") {
        ctx.resume().catch(() => {});
        const resumeOnTouch = () => {
          if (ctx.state === "suspended") ctx.resume().catch(() => {});
        };
        window.addEventListener("pointerdown", resumeOnTouch, { once: true, passive: true });
        window.addEventListener("touchstart", resumeOnTouch, { once: true, passive: true });
      }

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const data = new Uint8Array(analyser.frequencyBinCount);
      let blowFrames = 0;

      function checkBreath() {
        if (!state.micActive) return;
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < 36; i++) sum += data[i];
        const avg = sum / 36;
        const pct = Math.min(100, Math.round((avg / 145) * 100));

        const fill = document.getElementById("mic-meter-fill");
        const txt = document.getElementById("mic-level-text");
        if (fill) fill.style.width = `${pct}%`;
        if (txt) txt.textContent = `${pct}%`;

        const flames = document.querySelectorAll(".candle-flame");
        if (pct > 42) {
          flames.forEach((f) => f.classList.add("blowing"));
          blowFrames++;
          if (blowFrames > 7) {
            blowAllCandlesSequence();
            blowFrames = 0;
          }
        } else {
          flames.forEach((f) => f.classList.remove("blowing"));
          blowFrames = Math.max(0, blowFrames - 1);
        }

        state.micAnimId = requestAnimationFrame(checkBreath);
      }
      checkBreath();
    } catch (err) {
      if (micLabel) micLabel.textContent = "Cảm biến âm thanh";
      if (isAutoTriggered) {
        // Trên một số trình duyệt di động (iOS Safari) chặn gọi Mic tự động nếu chưa chạm màn hình:
        // Tự động bật ngay ở cú chạm đầu tiên của người dùng!
        if (toast) {
          toast.textContent = "CHẠM NHẸ MÀN HÌNH ĐỂ BẬT MIC THỔI NẾN HOẶC MỞ KHÔNG GIAN 3D";
        }
        const retryOnFirstGesture = () => {
          if (!state.micActive && state.litCandles > 0 && state.currentStage === "stage-cake") {
            startMicBlowDetection(false);
          }
        };
        window.addEventListener("pointerdown", retryOnFirstGesture, { once: true, passive: true });
      } else if (toast) {
        toast.textContent = "NHẤN NÚT 'KHÁM PHÁ KHÔNG GIAN 3D' BÊN DƯỚI ĐỂ BẮT ĐẦU";
      }
    }
  }

  function stopMicBlowDetection() {
    clearAutoMicTimer();
    state.micActive = false;
    if (state.micAnimId) cancelAnimationFrame(state.micAnimId);
    if (state.micStream) {
      state.micStream.getTracks().forEach((t) => t.stop());
      state.micStream = null;
    }
    const micBtn = document.getElementById("btn-mic-blow");
    const micLabel = document.getElementById("mic-btn-label");
    const meterBox = document.getElementById("mic-meter-box");
    if (micBtn) micBtn.classList.remove("listening");
    if (micLabel) micLabel.textContent = "Cảm biến âm thanh";
    if (meterBox) meterBox.classList.add("hidden");
  }

  function isVideoItem(item) {
    if (!item) return false;
    return item.type === "video" || /\.(mp4|webm|mov|ogg)$/i.test(item.src || "");
  }

  function getThumbSrc(photo) {
    if (!photo || !photo.src) return "";
    if (photo.thumb) return photo.thumb;
    const match = photo.src.match(/^assets\/images\/(ky-niem-\d+)\.(jpg|jpeg|png|mp4|webm)$/i);
    if (match) {
      return `assets/images/thumbs/${match[1]}.jpg`;
    }
    return photo.src;
  }

  // ==========================================================================
  // 5. CẢNH 2: KHÔNG GIAN 3D ĐA CHIỀU (VORTEX / TIME TUNNEL / ORBIT / SPHERE)
  //    Tối ưu hóa tỷ lệ khung hình dọc Mobile & cảm ứng đa điểm (Pinch & Inertia)
  // ==========================================================================
  function renderGalaxyCards() {
    const holder = document.getElementById("galaxy-cards-holder");
    if (!holder) return;
    holder.innerHTML = "";

    allPhotos.forEach((photo, idx) => {
      const card = document.createElement("div");
      card.className = "galaxy-card";
      card.dataset.index = String(idx);
      const isVid = isVideoItem(photo);
      const rotStyle = photo.rotation ? `style="transform: rotate(${photo.rotation}deg)"` : "";
      const thumbUrl = getThumbSrc(photo);
      // Dùng ảnh Thumbnail nhẹ (30KB) cho toàn bộ 44 thẻ 3D (kể cả video) để GPU Mobile mượt 60fps & không chớp tắt
      const mediaHtml = `<img src="${thumbUrl}" ${rotStyle} alt="${escapeHtml(photo.title)}" decoding="async" />`;
      const numStr = String(idx + 1).padStart(2, "0");
      const badgeLabel = isVid ? `▶ VIDEO` : numStr;
      const overlayHtml = photo.overlayText
        ? `<div class="photo-onscreen-caption" style="pointer-events:none;font-size:0.62rem;padding:2px 6px;bottom:24px;">${escapeHtml(photo.overlayText)}</div>`
        : "";

      card.innerHTML = `
        <span class="galaxy-card-badge">${badgeLabel}</span>
        ${mediaHtml}
        ${overlayHtml}
        <div class="galaxy-card-caption">${escapeHtml(photo.title)}</div>
      `;

      card.addEventListener("click", (e) => {
        e.stopPropagation();
        if (state.dragMoved) return;
        openLightbox(idx);
      });

      holder.appendChild(card);
    });

    applyGalaxyLayout(state.galaxyMode, false);
  }

  let layoutTransTimer = null;

  function applyGalaxyLayout(mode, animateTransition = false) {
    state.galaxyMode = mode;
    document.querySelectorAll(".mode-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.mode === mode);
    });

    const sceneEl = document.getElementById("galaxy-scene");
    if (sceneEl && animateTransition) {
      sceneEl.classList.add("layout-transitioning");
      if (layoutTransTimer) clearTimeout(layoutTransTimer);
      layoutTransTimer = setTimeout(() => {
        sceneEl.classList.remove("layout-transitioning");
      }, 680);
    }

    const cards = document.querySelectorAll(".galaxy-card");
    const count = cards.length;
    if (count === 0) return;

    const isMobile = window.innerWidth <= 768;
    const coreEl = document.getElementById("galaxy-core");
    if (coreEl) {
      coreEl.style.opacity = mode === "tunnel" ? "0.15" : "1";
    }

    cards.forEach((card, i) => {
      let transformStr = "";

      if (mode === "helix") {
        // Trên Mobile: Xoắn ốc dọc 4 tầng ôm vừa màn hình dọc điện thoại
        const rings = isMobile ? 4 : 3;
        const ringIdx = i % rings;
        const itemsInRing = Math.ceil(count / rings);
        const posInRing = Math.floor(i / rings);
        const angle = (posInRing / itemsInRing) * 360 + ringIdx * (180 / itemsInRing);
        const radius = isMobile ? 280 + ringIdx * 75 : 490 + ringIdx * 145;
        const vSpread = isMobile ? 155 : 210;
        const yOffset = (ringIdx - (rings - 1) / 2) * vSpread + Math.sin(i * 0.9) * 18;
        transformStr = `rotateY(${angle.toFixed(2)}deg) translateZ(${radius}px) translateY(${yOffset.toFixed(1)}px)`;
      } else if (mode === "tunnel") {
        // ĐƯỜNG HẦM THỜI GIAN 3D (Time Tunnel): Bay dọc trục Z xuyên qua 44 bức ảnh
        const lane = i % 6;
        const angleRad = (lane / 6) * Math.PI * 2 + i * 0.35;
        const tunnelRadius = isMobile ? 165 : 290;
        const x = Math.cos(angleRad) * tunnelRadius;
        const y = Math.sin(angleRad) * tunnelRadius;
        const z = 500 - i * 155;
        transformStr = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px)`;
      } else if (mode === "ring") {
        const angle = (i / count) * 360;
        const cardSpacing = isMobile ? 132 : 170;
        const radius = Math.max(isMobile ? 340 : 520, Math.round((count * cardSpacing) / (2 * Math.PI)));
        transformStr = `rotateY(${angle.toFixed(2)}deg) translateZ(${radius}px)`;
      } else if (mode === "sphere") {
        const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
        const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
        const radius = isMobile ? 340 : 560;
        const rotYDeg = ((theta * 180) / Math.PI) % 360;
        const rotXDeg = 90 - (phi * 180) / Math.PI;
        transformStr = `rotateY(${rotYDeg.toFixed(2)}deg) rotateX(${rotXDeg.toFixed(2)}deg) translateZ(${radius}px)`;
      }

      card.style.transform = transformStr;
    });
  }

  function initGalaxyInteractions() {
    const viewport = document.getElementById("galaxy-viewport");
    const scene = document.getElementById("galaxy-scene");
    if (!viewport || !scene) return;

    // Đặt khoảng cách camera mặc định tối ưu cho màn hình dọc Mobile
    if (window.innerWidth <= 768) {
      state.zoomZ = -290;
    }

    let velX = 0;
    let velY = 0;
    let tunnelOffsetZ = 0;
    let pinchStartDist = 0;
    let pinchStartZoom = state.zoomZ;

    function updateSceneTransform() {
      if (state.galaxyMode === "tunnel") {
        scene.style.transform = `translateZ(${(state.zoomZ + tunnelOffsetZ).toFixed(1)}px) rotateX(${(state.rotX * 0.25).toFixed(2)}deg) rotateZ(${(state.rotY * 0.08).toFixed(2)}deg)`;
      } else {
        scene.style.transform = `translateZ(${state.zoomZ.toFixed(1)}px) rotateX(${state.rotX.toFixed(2)}deg) rotateY(${state.rotY.toFixed(2)}deg)`;
      }
    }

    // Vòng lặp 60fps có quán tính (Inertia) mượt như iOS
    function animateGalaxy() {
      if (state.currentStage === "stage-galaxy") {
        if (!state.isDragging) {
          if (Math.abs(velX) > 0.01 || Math.abs(velY) > 0.01) {
            state.rotY += velX;
            state.rotX = Math.max(-52, Math.min(52, state.rotX + velY));
            velX *= 0.93;
            velY *= 0.93;
            updateSceneTransform();
          } else if (state.autoRotate) {
            if (state.galaxyMode === "tunnel") {
              tunnelOffsetZ += 2.2;
              if (tunnelOffsetZ > 44 * 155) tunnelOffsetZ = -400;
            } else {
              state.rotY += 0.18;
            }
            updateSceneTransform();
          }
        }
      }
      requestAnimationFrame(animateGalaxy);
    }
    requestAnimationFrame(animateGalaxy);

    // Kéo 1 ngón tay / chuột để xoay & bay trong không gian 3D
    viewport.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".galaxy-bottom-hud") || e.target.closest(".galaxy-top-bar")) return;
      state.isDragging = true;
      state.dragMoved = false;
      state.dragStartX = e.clientX;
      state.dragStartY = e.clientY;
      velX = 0;
      velY = 0;
    });

    window.addEventListener("pointermove", (e) => {
      if (!state.isDragging) return;
      const dx = e.clientX - state.dragStartX;
      const dy = e.clientY - state.dragStartY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        state.dragMoved = true;
      }

      if (state.galaxyMode === "tunnel") {
        tunnelOffsetZ += dy * 2.5;
        state.rotY += dx * 0.15;
      } else {
        velX = dx * 0.34;
        velY = -dy * 0.24;
        state.rotY += velX;
        state.rotX = Math.max(-52, Math.min(52, state.rotX + velY));
      }

      state.dragStartX = e.clientX;
      state.dragStartY = e.clientY;
      updateSceneTransform();
    });

    window.addEventListener("pointerup", () => {
      state.isDragging = false;
    });

    // Hỗ trợ chụm 2 ngón tay (Pinch-to-Zoom) trên màn hình cảm ứng Mobile
    viewport.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length === 2) {
          state.isDragging = false;
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          pinchStartDist = Math.hypot(dx, dy);
          pinchStartZoom = state.zoomZ;
        }
      },
      { passive: true }
    );

    viewport.addEventListener(
      "touchmove",
      (e) => {
        if (e.touches.length === 2 && pinchStartDist > 0) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          const dist = Math.hypot(dx, dy);
          const delta = (dist - pinchStartDist) * 1.8;
          state.zoomZ = Math.max(-950, Math.min(420, pinchStartZoom + delta));
          updateSceneTransform();
        }
      },
      { passive: true }
    );

    // Cuộn chuột thu phóng hoặc bay dọc đường hầm
    viewport.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        if (state.galaxyMode === "tunnel") {
          tunnelOffsetZ = Math.max(-600, Math.min(44 * 155, tunnelOffsetZ + e.deltaY * 1.1));
        } else {
          state.zoomZ = Math.max(-950, Math.min(420, state.zoomZ - e.deltaY * 0.6));
        }
        updateSceneTransform();
      },
      { passive: false }
    );

    // Các nút chuyển chế độ 3D
    document.querySelectorAll(".mode-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        tunnelOffsetZ = 0;
        state.rotX = btn.dataset.mode === "tunnel" ? 0 : -8;
        applyGalaxyLayout(btn.dataset.mode, true);
        updateSceneTransform();
        playMagicChime(587.33);
      });
    });

    // Nút HUD dưới
    const btnAuto = document.getElementById("btn-toggle-autorotate");
    if (btnAuto) {
      btnAuto.addEventListener("click", () => {
        state.autoRotate = !state.autoRotate;
        btnAuto.innerHTML = state.autoRotate
          ? `<span id="autorotate-label">⏸ TẠM DỪNG XOAY</span>`
          : `<span id="autorotate-label">▶ TỰ ĐỘNG XOAY</span>`;
      });
    }

    const btnZoomIn = document.getElementById("btn-zoom-in");
    if (btnZoomIn) {
      btnZoomIn.addEventListener("click", () => {
        if (state.galaxyMode === "tunnel") tunnelOffsetZ += 260;
        else state.zoomZ = Math.min(420, state.zoomZ + 120);
        updateSceneTransform();
      });
    }

    const btnZoomOut = document.getElementById("btn-zoom-out");
    if (btnZoomOut) {
      btnZoomOut.addEventListener("click", () => {
        if (state.galaxyMode === "tunnel") tunnelOffsetZ -= 260;
        else state.zoomZ = Math.max(-950, state.zoomZ - 120);
        updateSceneTransform();
      });
    }

    const btnRandom = document.getElementById("btn-random-memory");
    if (btnRandom) {
      btnRandom.addEventListener("click", () => {
        const randIdx = Math.floor(Math.random() * allPhotos.length);
        state.rotY = -(randIdx / allPhotos.length) * 360;
        updateSceneTransform();
        setTimeout(() => openLightbox(randIdx), 380);
      });
    }

    const btnSlideshow = document.getElementById("btn-start-slideshow");
    if (btnSlideshow) {
      btnSlideshow.addEventListener("click", () => {
        openLightbox(0);
        startSlideshow();
      });
    }
  }

  // ==========================================================================
  // 6. CẢNH 3: TƯỜNG ẢNH POLAROID & BỘ LỌC ALBUM
  // ==========================================================================
  function renderPolaroidAlbum(filter = "all") {
    const grid = document.getElementById("polaroid-grid");
    if (!grid) return;
    grid.innerHTML = "";

    allPhotos.forEach((photo, idx) => {
      if (filter !== "all" && photo.category !== filter) return;

      const isVid = isVideoItem(photo);
      const rotStyle = photo.rotation ? `style="transform: rotate(${photo.rotation}deg)"` : "";
      const thumbUrl = getThumbSrc(photo);
      const mediaHtml = `<img src="${thumbUrl}" ${rotStyle} alt="${escapeHtml(photo.title)}" loading="lazy" decoding="async" />`;
      const dateBadgeText = isVid ? `▶ VIDEO • ${photo.date || "Kỷ niệm"}` : (photo.date || "Kỷ niệm");

      const card = document.createElement("div");
      card.className = "polaroid-card";
      card.innerHTML = `
        <div class="polaroid-inner">
          <div class="polaroid-front">
            <div class="polaroid-img-wrap" data-idx="${idx}">
              <span
                class="polaroid-date-tag polaroid-editable"
                contenteditable="true"
                spellcheck="false"
                title="Nhấp để sửa ngày chụp trực tiếp"
              >${escapeHtml(dateBadgeText)}</span>

              <button class="polaroid-zoom-btn" type="button" title="Phóng to ảnh">⤢</button>
              <button class="polaroid-rotate-btn" type="button" title="Xoay ảnh 90°">↻</button>

              ${mediaHtml}

              <div
                class="photo-onscreen-caption"
                contenteditable="true"
                spellcheck="false"
                data-placeholder="+ Gõ chữ lên hình..."
                title="Nhấp để viết chữ nổi trực tiếp lên bức hình"
              >${escapeHtml(photo.overlayText || "")}</div>
            </div>
            <div class="polaroid-footer">
              <span
                class="polaroid-title polaroid-editable"
                contenteditable="true"
                spellcheck="false"
                title="Nhấp để sửa tiêu đề bức hình"
              >${escapeHtml(photo.title)}</span>
              <button class="btn-flip-card" type="button">⇄ Lật</button>
            </div>
          </div>
          <div class="polaroid-back">
            <div class="polaroid-back-ornament">${String(idx + 1).padStart(2, "0")} // ARCHIVE</div>
            <div>
              <h4
                class="polaroid-back-title polaroid-editable"
                contenteditable="true"
                spellcheck="false"
                title="Nhấp để sửa tiêu đề"
              >${escapeHtml(photo.title)}</h4>
              <p
                class="polaroid-back-note polaroid-editable"
                contenteditable="true"
                spellcheck="false"
                title="Nhấp để sửa câu chuyện / lời nhắn của bức hình"
              >${escapeHtml(photo.note || "")}</p>
            </div>
            <div class="polaroid-back-actions">
              <button class="btn-flip-card" type="button">↩ Ảnh</button>
              <button class="btn-flip-card btn-zoom-back" type="button" data-idx="${idx}">⤢ Xem lớn</button>
            </div>
          </div>
        </div>
      `;

      // Ngăn click vào các vùng sửa chữ làm mở Lightbox
      card.querySelectorAll("[contenteditable='true']").forEach((editEl) => {
        editEl.addEventListener("click", (e) => e.stopPropagation());
        editEl.addEventListener("keydown", (e) => {
          if (e.key === "Enter" && !editEl.classList.contains("polaroid-back-note")) {
            e.preventDefault();
            editEl.blur();
          }
        });
      });

      // Sửa ngày trực tiếp trên ảnh
      const dateEl = card.querySelector(".polaroid-date-tag");
      if (dateEl) {
        dateEl.addEventListener("input", () => {
          photo.date = dateEl.textContent.trim();
          persistPhotoEdits();
        });
      }

      // Sửa chữ nổi trực tiếp trên mặt ảnh
      const overlayEl = card.querySelector(".photo-onscreen-caption");
      if (overlayEl) {
        overlayEl.addEventListener("input", () => {
          photo.overlayText = overlayEl.textContent.trim();
          syncSingleCardUI(idx);
          persistPhotoEdits();
        });
      }

      // Sửa tiêu đề mặt trước & mặt sau đồng bộ
      const frontTitleEl = card.querySelector(".polaroid-title");
      const backTitleEl = card.querySelector(".polaroid-back-title");
      if (frontTitleEl) {
        frontTitleEl.addEventListener("input", () => {
          photo.title = frontTitleEl.textContent.trim();
          if (backTitleEl) backTitleEl.textContent = photo.title;
          syncSingleCardUI(idx);
          persistPhotoEdits();
        });
      }
      if (backTitleEl) {
        backTitleEl.addEventListener("input", () => {
          photo.title = backTitleEl.textContent.trim();
          if (frontTitleEl) frontTitleEl.textContent = photo.title;
          syncSingleCardUI(idx);
          persistPhotoEdits();
        });
      }

      // Sửa lời nhắn mặt sau
      const backNoteEl = card.querySelector(".polaroid-back-note");
      if (backNoteEl) {
        backNoteEl.addEventListener("input", () => {
          photo.note = backNoteEl.textContent.trim();
          persistPhotoEdits();
        });
      }

      // Nút xoay ảnh 90°
      const rotBtn = card.querySelector(".polaroid-rotate-btn");
      if (rotBtn) {
        rotBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          rotatePhotoByIndex(idx);
        });
      }

      // Nút phóng to ảnh
      const zoomBtn = card.querySelector(".polaroid-zoom-btn");
      if (zoomBtn) {
        zoomBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          openLightbox(idx);
        });
      }

      // Mở lightbox khi nhấn vào vùng ảnh trống
      const imgWrap = card.querySelector(".polaroid-img-wrap");
      if (imgWrap) {
        imgWrap.addEventListener("click", () => openLightbox(idx));
      }

      const zoomBackBtn = card.querySelector(".btn-zoom-back");
      if (zoomBackBtn) {
        zoomBackBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          openLightbox(idx);
        });
      }

      // Nút lật mặt trước / mặt sau Polaroid
      card.querySelectorAll(".btn-flip-card:not(.btn-zoom-back)").forEach((b) => {
        b.addEventListener("click", (e) => {
          e.stopPropagation();
          card.classList.toggle("flipped");
          playMagicChime(659.25);
        });
      });

      grid.appendChild(card);
    });
  }

  function initAlbumControls() {
    // Mặc định bật chế độ sửa trực tiếp trên ảnh
    document.body.classList.add("direct-edit-enabled");

    const toggleEditBtn = document.getElementById("btn-toggle-edit-mode");
    if (toggleEditBtn) {
      toggleEditBtn.addEventListener("click", () => {
        const enabled = document.body.classList.toggle("direct-edit-enabled");
        toggleEditBtn.classList.toggle("active-edit-pill", enabled);
        toggleEditBtn.textContent = enabled
          ? "✎ Sửa trực tiếp: BẬT"
          : "👁 Chế độ xem";
      });
    }

    const clearSampleBtn = document.getElementById("btn-clear-sample-text");
    if (clearSampleBtn) {
      clearSampleBtn.addEventListener("click", () => {
        allPhotos.forEach((p, i) => {
          p.title = `Khoảnh khắc #${String(i + 1).padStart(2, "0")}`;
          p.note = "Chạm để viết ghi chú cho bức hình này...";
          p.overlayText = "";
        });
        renderGalaxyCards();
        renderPolaroidAlbum(getActiveAlbumFilter());
        persistPhotoEdits("✓ Đã đặt lại chữ mẫu trên tất cả ảnh");
      });
    }

    document.querySelectorAll(".filter-pill").forEach((pill) => {
      pill.addEventListener("click", () => {
        document.querySelectorAll(".filter-pill").forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");
        renderPolaroidAlbum(pill.dataset.filter);
      });
    });

    const flipAllBtn = document.getElementById("btn-flip-all-polaroids");
    let allFlipped = false;
    if (flipAllBtn) {
      flipAllBtn.addEventListener("click", () => {
        allFlipped = !allFlipped;
        document.querySelectorAll(".polaroid-card").forEach((c) => {
          c.classList.toggle("flipped", allFlipped);
        });
      });
    }
  }

  // ==========================================================================
  // 7. CẢNH 4: BỨC THƯ SÁP VÀNG & GÓC LỜI CHÚC GIA ĐÌNH
  // ==========================================================================
  function initEnvelopeAndLetter() {
    const wrapper = document.getElementById("envelope-wrapper");
    const openBtn = document.getElementById("btn-open-envelope");
    const skipBtn = document.getElementById("btn-skip-typing");
    const replayBtn = document.getElementById("btn-replay-typing");

    // Hiển thị sẵn nội dung mờ trước khi mở
    fillFullLetterText();

    if (openBtn && wrapper) {
      openBtn.addEventListener("click", () => {
        wrapper.classList.add("opened");
        state.envelopeOpened = true;
        playMagicChime(523.25);
        spawnFireworkBurst(window.innerWidth * 0.5, window.innerHeight * 0.3);
        startLetterTypewriter();
      });
    }

    if (skipBtn) {
      skipBtn.addEventListener("click", () => {
        if (state.typingTimer) clearInterval(state.typingTimer);
        fillFullLetterText();
      });
    }

    if (replayBtn) {
      replayBtn.addEventListener("click", () => {
        startLetterTypewriter();
      });
    }
  }

  function fillFullLetterText() {
    const bodyEl = document.getElementById("letter-body-content");
    if (!bodyEl) return;
    const paras = (CFG.letter && CFG.letter.paragraphs) || [];
    bodyEl.innerHTML = paras.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
  }

  function startLetterTypewriter() {
    const bodyEl = document.getElementById("letter-body-content");
    if (!bodyEl) return;
    if (state.typingTimer) clearInterval(state.typingTimer);

    const paras = (CFG.letter && CFG.letter.paragraphs) || [];
    bodyEl.innerHTML = paras.map(() => `<p></p>`).join("");
    const pNodes = Array.from(bodyEl.querySelectorAll("p"));

    let pIdx = 0;
    let charIdx = 0;

    state.typingTimer = setInterval(() => {
      if (pIdx >= paras.length) {
        clearInterval(state.typingTimer);
        return;
      }
      const currentText = paras[pIdx];
      pNodes[pIdx].textContent = currentText.slice(0, charIdx + 1);
      charIdx += 2; // Gõ mượt 2 ký tự/nhịp
      if (charIdx >= currentText.length) {
        pNodes[pIdx].textContent = currentText;
        pIdx++;
        charIdx = 0;
      }
    }, 24);
  }

  function renderFamilyWishes() {
    const grid = document.getElementById("wishes-grid");
    if (!grid) return;
    grid.innerHTML = "";

    familyWishes.forEach((w) => {
      const card = document.createElement("div");
      card.className = "wish-card";
      card.innerHTML = `
        <div class="wish-card-top">
          <div class="wish-avatar">${escapeHtml(w.avatar || "💖")}</div>
          <div>
            <div class="wish-sender">${escapeHtml(w.sender)}</div>
            <div class="wish-role">${escapeHtml(w.role || "Gia đình yêu thương")}</div>
          </div>
        </div>
        <p class="wish-message">"${escapeHtml(w.message)}"</p>
      `;
      grid.appendChild(card);
    });
  }

  // ==========================================================================
  // 8. MÁY PHÁT NHẠC ĐĨA THAN CỔ ĐIỂN (VINYL RECORD PLAYER)
  // ==========================================================================
  function initVinylPlayer() {
    const audio = document.getElementById("bg-audio");
    const playerEl = document.getElementById("vinyl-player");
    const playBtn = document.getElementById("btn-play-pause");
    const prevBtn = document.getElementById("btn-prev-track");
    const nextBtn = document.getElementById("btn-next-track");
    const volSlider = document.getElementById("volume-slider");
    const collapseBtn = document.getElementById("btn-toggle-vinyl-panel");
    const turntableEl = playerEl ? playerEl.querySelector(".vinyl-turntable") : null;

    // Tự động thu gọn Vinyl Player trên Mobile để không che vùng 3D
    if (playerEl && window.innerWidth <= 768) {
      playerEl.classList.add("collapsed");
    }

    loadTrack(0, false);

    if (turntableEl) {
      turntableEl.addEventListener("click", () => {
        if (state.isPlaying) {
          pauseCurrentTrack();
        } else {
          playCurrentTrack();
        }
      });
    }

    if (playBtn) {
      playBtn.addEventListener("click", () => {
        if (state.isPlaying) {
          pauseCurrentTrack();
        } else {
          playCurrentTrack();
        }
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        const nextIdx = (state.trackIndex - 1 + playlist.length) % playlist.length;
        loadTrack(nextIdx, true);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        const nextIdx = (state.trackIndex + 1) % playlist.length;
        loadTrack(nextIdx, true);
      });
    }

    if (volSlider && audio) {
      volSlider.addEventListener("input", () => {
        audio.volume = Number(volSlider.value);
      });
    }

    if (collapseBtn && playerEl) {
      collapseBtn.addEventListener("click", () => {
        playerEl.classList.toggle("collapsed");
      });
    }

    if (audio) {
      audio.addEventListener("ended", () => {
        const nextIdx = (state.trackIndex + 1) % playlist.length;
        loadTrack(nextIdx, true);
      });
    }
  }

  function loadTrack(idx, autoPlay = false) {
    if (playlist.length === 0) return;
    state.trackIndex = idx;
    const item = playlist[idx];
    const audio = document.getElementById("bg-audio");
    const coverImg = document.getElementById("vinyl-cover-img");

    setText("track-title", item.title || "Nhạc Sinh Nhật");
    setText("track-artist", item.artist || "Giai Điệu Ấm Áp");
    if (coverImg && item.cover) coverImg.src = item.cover;

    if (audio && item.src) {
      audio.src = item.src;
      audio.loop = playlist.length === 1;
      if (autoPlay) {
        playCurrentTrack();
      }
    }
  }

  function playCurrentTrack() {
    const audio = document.getElementById("bg-audio");
    const playerEl = document.getElementById("vinyl-player");
    const playBtn = document.getElementById("btn-play-pause");
    if (!audio) return;

    audio
      .play()
      .then(() => {
        state.isPlaying = true;
        if (playerEl) playerEl.classList.add("playing");
        if (playBtn) playBtn.textContent = "⏸";
      })
      .catch(() => {
        // Nếu trình duyệt chặn tự phát trước khi click
      });
  }

  function pauseCurrentTrack() {
    const audio = document.getElementById("bg-audio");
    const playerEl = document.getElementById("vinyl-player");
    const playBtn = document.getElementById("btn-play-pause");
    if (audio) audio.pause();
    state.isPlaying = false;
    if (playerEl) playerEl.classList.remove("playing");
    if (playBtn) playBtn.textContent = "▶";
  }

  // ==========================================================================
  // 9. CINEMA LIGHTBOX & SLIDESHOW TOÀN MÀN HÌNH
  // ==========================================================================
  function openLightbox(index) {
    if (allPhotos.length === 0) return;
    state.lightboxIndex = (index + allPhotos.length) % allPhotos.length;
    const modal = document.getElementById("lightbox-modal");
    if (modal) modal.classList.remove("hidden");
    updateLightboxContent();
  }

  function closeLightbox() {
    stopSlideshow();
    const vid = document.getElementById("lightbox-video");
    if (vid) {
      vid.pause();
      vid.removeAttribute("src");
    }
    const modal = document.getElementById("lightbox-modal");
    if (modal) modal.classList.add("hidden");
  }

  function updateLightboxContent() {
    const item = allPhotos[state.lightboxIndex];
    if (!item) return;
    const img = document.getElementById("lightbox-img");
    const vid = document.getElementById("lightbox-video");
    const isVid = isVideoItem(item);
    const rotTransform = item.rotation ? `rotate(${item.rotation}deg)` : "";

    if (isVid) {
      if (img) img.classList.add("hidden");
      if (vid) {
        vid.classList.remove("hidden");
        vid.poster = "assets/images/ky-niem-40-poster.jpg";
        vid.src = item.src;
        vid.style.transform = rotTransform;
        vid.play().catch(() => {});
      }
    } else {
      if (vid) {
        vid.pause();
        vid.classList.add("hidden");
      }
      if (img) {
        img.classList.remove("hidden");
        img.src = item.src;
        img.style.transform = rotTransform;
      }
    }
    setText("lightbox-index", `${state.lightboxIndex + 1} / ${allPhotos.length}`);
    setText("lightbox-date", item.date || "Kỷ niệm Gia đình");
    setText("lightbox-title", item.title || `Kỷ niệm #${state.lightboxIndex + 1}`);
    setText("lightbox-note", item.note || "");
    setText("lightbox-overlay-text", item.overlayText || "");

    const catSelect = document.getElementById("lightbox-category-select");
    if (catSelect) {
      catSelect.value = item.category || "ky-niem";
    }
  }

  function startSlideshow() {
    stopSlideshow();
    const btn = document.getElementById("btn-lightbox-slideshow");
    if (btn) btn.textContent = "⏸️ Dừng tự động chuyển ảnh";
    state.slideshowTimer = setInterval(() => {
      state.lightboxIndex = (state.lightboxIndex + 1) % allPhotos.length;
      updateLightboxContent();
    }, 3200);
  }

  function stopSlideshow() {
    if (state.slideshowTimer) {
      clearInterval(state.slideshowTimer);
      state.slideshowTimer = null;
    }
    const btn = document.getElementById("btn-lightbox-slideshow");
    if (btn) btn.textContent = "▶️ Tự động chuyển ảnh (Slideshow)";
  }

  function initLightboxEvents() {
    const closeBtn = document.getElementById("btn-close-lightbox");
    const backdrop = document.getElementById("lightbox-backdrop");
    const prevBtn = document.getElementById("btn-lightbox-prev");
    const nextBtn = document.getElementById("btn-lightbox-next");
    const slideBtn = document.getElementById("btn-lightbox-slideshow");
    const rotateBtn = document.getElementById("btn-lightbox-rotate");

    // Các trường sửa trực tiếp trong Lightbox
    const lbDate = document.getElementById("lightbox-date");
    const lbTitle = document.getElementById("lightbox-title");
    const lbNote = document.getElementById("lightbox-note");
    const lbOverlay = document.getElementById("lightbox-overlay-text");
    const lbCat = document.getElementById("lightbox-category-select");

    if (lbDate) {
      lbDate.addEventListener("input", () => {
        const item = allPhotos[state.lightboxIndex];
        if (!item) return;
        item.date = lbDate.textContent.trim();
        syncSingleCardUI(state.lightboxIndex);
        persistPhotoEdits();
      });
    }

    if (lbTitle) {
      lbTitle.addEventListener("input", () => {
        const item = allPhotos[state.lightboxIndex];
        if (!item) return;
        item.title = lbTitle.textContent.trim();
        syncSingleCardUI(state.lightboxIndex);
        persistPhotoEdits();
      });
    }

    if (lbNote) {
      lbNote.addEventListener("input", () => {
        const item = allPhotos[state.lightboxIndex];
        if (!item) return;
        item.note = lbNote.textContent.trim();
        syncSingleCardUI(state.lightboxIndex);
        persistPhotoEdits();
      });
    }

    if (lbOverlay) {
      lbOverlay.addEventListener("input", () => {
        const item = allPhotos[state.lightboxIndex];
        if (!item) return;
        item.overlayText = lbOverlay.textContent.trim();
        syncSingleCardUI(state.lightboxIndex);
        persistPhotoEdits();
      });
    }

    if (lbCat) {
      lbCat.addEventListener("change", () => {
        const item = allPhotos[state.lightboxIndex];
        if (!item) return;
        item.category = lbCat.value;
        renderPolaroidAlbum(getActiveAlbumFilter());
        persistPhotoEdits();
      });
    }

    if (rotateBtn) {
      rotateBtn.addEventListener("click", () => {
        rotatePhotoByIndex(state.lightboxIndex);
      });
    }

    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
    if (backdrop) backdrop.addEventListener("click", closeLightbox);
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        state.lightboxIndex = (state.lightboxIndex - 1 + allPhotos.length) % allPhotos.length;
        updateLightboxContent();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        state.lightboxIndex = (state.lightboxIndex + 1) % allPhotos.length;
        updateLightboxContent();
      });
    }
    if (slideBtn) {
      slideBtn.addEventListener("click", () => {
        if (state.slideshowTimer) stopSlideshow();
        else startSlideshow();
      });
    }

    window.addEventListener("keydown", (e) => {
      const modal = document.getElementById("lightbox-modal");
      if (!modal || modal.classList.contains("hidden")) return;
      // Không chuyển ảnh khi đang gõ chữ trong ô contenteditable
      if (e.target && (e.target.isContentEditable || e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) {
        if (e.key === "Escape") e.target.blur();
        return;
      }
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") {
        state.lightboxIndex = (state.lightboxIndex - 1 + allPhotos.length) % allPhotos.length;
        updateLightboxContent();
      }
      if (e.key === "ArrowRight") {
        state.lightboxIndex = (state.lightboxIndex + 1) % allPhotos.length;
        updateLightboxContent();
      }
    });

    // Hỗ trợ vuốt trái / phải (Touch Swipe) trên Mobile trong khung ảnh Lightbox
    const lbFrame = document.querySelector(".lightbox-img-frame");
    if (lbFrame) {
      let touchStartX = 0;
      let touchStartY = 0;
      lbFrame.addEventListener(
        "touchstart",
        (e) => {
          if (e.touches.length === 1) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
          }
        },
        { passive: true }
      );
      lbFrame.addEventListener(
        "touchend",
        (e) => {
          if (e.changedTouches.length === 1) {
            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = e.changedTouches[0].clientY - touchStartY;
            if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.3) {
              if (dx < 0) {
                state.lightboxIndex = (state.lightboxIndex + 1) % allPhotos.length;
              } else {
                state.lightboxIndex = (state.lightboxIndex - 1 + allPhotos.length) % allPhotos.length;
              }
              updateLightboxContent();
            }
          }
        },
        { passive: true }
      );
    }
  }

  // ==========================================================================
  // 10. TẢI THÊM ẢNH / NHẠC TRỰC TIẾP TRÊN TRÌNH DUYỆT (CUSTOMIZER)
  // ==========================================================================
  function handleUploadPhotos(fileList, replaceExisting = false) {
    if (!fileList || fileList.length === 0) return;
    if (replaceExisting) {
      allPhotos.length = 0;
    }

    const categories = ["sum-vay", "ky-niem", "du-lich", "nu-cuoi"];
    Array.from(fileList).forEach((file, idx) => {
      const url = URL.createObjectURL(file);
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      allPhotos.push({
        src: url,
        title: cleanName || `Khoảnh Khắc Gia Đình #${allPhotos.length + 1}`,
        date: "Ảnh Gia Đình",
        category: categories[idx % categories.length],
        note: "Khoảnh khắc yêu thương đáng nhớ được lưu giữ trong Vũ Trụ Kỷ Niệm 3D."
      });
    });

    updatePhotoCountBadges();
    renderGalaxyCards();
    renderPolaroidAlbum("all");
    playMagicChime(659.25);
    launchCelebrationSalvo();
  }

  function handleUploadMusic(fileList) {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    const url = URL.createObjectURL(file);
    const cleanTitle = file.name.replace(/\.[^/.]+$/, "");
    playlist.unshift({
      title: cleanTitle,
      artist: "Nhạc Bạn Đã Chọn",
      src: url,
      cover: allPhotos[0] ? allPhotos[0].src : "assets/images/anh-01.jpg"
    });
    loadTrack(0, true);
  }

  function initModalsAndUploads() {
    const customModal = document.getElementById("customizer-modal");
    const openCustomBtn = document.getElementById("btn-open-customizer");
    const closeCustomBtn = document.getElementById("btn-close-customizer");

    if (openCustomBtn && customModal) {
      openCustomBtn.addEventListener("click", () => customModal.classList.remove("hidden"));
    }
    if (closeCustomBtn && customModal) {
      closeCustomBtn.addEventListener("click", () => customModal.classList.add("hidden"));
    }

    // Input chọn thêm ảnh
    const quickPhotoIn = document.getElementById("quick-photo-input");
    if (quickPhotoIn) {
      quickPhotoIn.addEventListener("change", (e) => handleUploadPhotos(e.target.files, false));
    }

    const modalPhotoIn = document.getElementById("modal-photo-input");
    if (modalPhotoIn) {
      modalPhotoIn.addEventListener("change", (e) => {
        handleUploadPhotos(e.target.files, false);
        if (customModal) customModal.classList.add("hidden");
        switchStage("stage-galaxy");
      });
    }

    const modalReplaceIn = document.getElementById("modal-replace-photos-input");
    if (modalReplaceIn) {
      modalReplaceIn.addEventListener("change", (e) => {
        handleUploadPhotos(e.target.files, true);
        if (customModal) customModal.classList.add("hidden");
        switchStage("stage-galaxy");
      });
    }

    // Input chọn nhạc
    const quickMusicIn = document.getElementById("quick-music-input");
    if (quickMusicIn) {
      quickMusicIn.addEventListener("change", (e) => handleUploadMusic(e.target.files));
    }
    const modalMusicIn = document.getElementById("modal-music-input");
    if (modalMusicIn) {
      modalMusicIn.addEventListener("change", (e) => {
        handleUploadMusic(e.target.files);
        if (customModal) customModal.classList.add("hidden");
      });
    }

    // Form cập nhật tên người nhận
    const infoForm = document.getElementById("quick-info-form");
    if (infoForm) {
      infoForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const newName = document.getElementById("input-recipient-name").value.trim();
        const newSub = document.getElementById("input-recipient-sub").value.trim();
        const newDate = document.getElementById("input-birthday-date").value.trim();
        if (newName) {
          CFG.recipientName = newName;
          setText("hero-recipient-name", newName);
          setText("nav-recipient-tag", newName);
          setText("core-recipient-name", newName);
        }
        if (newSub) {
          CFG.recipientSubtitle = newSub;
          setText("hero-recipient-subtitle", newSub);
        }
        if (newDate) {
          CFG.birthdayDate = newDate;
          setText("hero-birthday-date", newDate);
        }
        if (customModal) customModal.classList.add("hidden");
        persistPhotoEdits("💾 Đã lưu thông tin người nhận!");
        launchCelebrationSalvo();
      });
    }

    // Chỉnh sửa trực tiếp Tên người nhận, lời đề tặng, ngày sinh và bức thư ngay trên trang
    const heroNameEl = document.getElementById("hero-recipient-name");
    if (heroNameEl) {
      heroNameEl.addEventListener("input", () => {
        CFG.recipientName = heroNameEl.textContent.trim();
        setText("nav-recipient-tag", CFG.recipientName);
        setText("core-recipient-name", CFG.recipientName);
        persistPhotoEdits();
      });
    }

    const heroSubEl = document.getElementById("hero-recipient-subtitle");
    if (heroSubEl) {
      heroSubEl.addEventListener("input", () => {
        CFG.recipientSubtitle = heroSubEl.textContent.trim();
        persistPhotoEdits();
      });
    }

    const heroDateEl = document.getElementById("hero-birthday-date");
    if (heroDateEl) {
      heroDateEl.addEventListener("input", () => {
        CFG.birthdayDate = heroDateEl.textContent.trim();
        persistPhotoEdits();
      });
    }

    const letterGreetEl = document.getElementById("letter-greeting");
    if (letterGreetEl) {
      letterGreetEl.addEventListener("input", () => {
        CFG.letter = CFG.letter || {};
        CFG.letter.greeting = letterGreetEl.textContent.trim();
        persistPhotoEdits();
      });
    }

    const letterBodyEl = document.getElementById("letter-body-content");
    if (letterBodyEl) {
      letterBodyEl.addEventListener("input", () => {
        CFG.letter = CFG.letter || {};
        const paras = Array.from(letterBodyEl.querySelectorAll("p"))
          .map((p) => p.textContent.trim())
          .filter(Boolean);
        CFG.letter.paragraphs = paras.length > 0 ? paras : [letterBodyEl.textContent.trim()];
        persistPhotoEdits();
      });
    }

    const letterCloseEl = document.getElementById("letter-closing");
    if (letterCloseEl) {
      letterCloseEl.addEventListener("input", () => {
        CFG.letter = CFG.letter || {};
        CFG.letter.closing = letterCloseEl.textContent.trim();
        persistPhotoEdits();
      });
    }

    const letterSigEl = document.getElementById("letter-signature");
    if (letterSigEl) {
      letterSigEl.addEventListener("input", () => {
        CFG.letter = CFG.letter || {};
        CFG.letter.signature = letterSigEl.textContent.trim();
        persistPhotoEdits();
      });
    }

    // Các nút Lưu & Lấy Link Vercel / Tải file config.js / Cloud Sync
    ["btn-quick-save-vercel", "btn-copy-share-link", "btn-modal-copy-link"].forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener("click", () => {
          copyShareableVercelLink();
        });
      }
    });

    ["btn-export-config", "btn-modal-download-config"].forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener("click", () => {
          exportConfigJsFile();
        });
      }
    });

    const cloudSyncBtn = document.getElementById("btn-modal-cloud-sync");
    if (cloudSyncBtn) {
      cloudSyncBtn.addEventListener("click", async () => {
        const payload = buildFullStatePayload();
        try {
          const resp = await fetch("/api/storage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          const resData = await resp.json();
          if (resData && resData.ok) {
            showSaveToast(`☁️ Đã lưu thành công lên Cloud (${resData.provider || "server"})!`);
          } else {
            await copyShareableVercelLink();
          }
        } catch (_) {
          await copyShareableVercelLink();
        }
      });
    }

    // Modal thêm lời chúc gia đình
    const wishModal = document.getElementById("wish-modal");
    const openWishBtn = document.getElementById("btn-add-wish-modal");
    const closeWishBtn = document.getElementById("btn-close-wish-modal");
    const wishForm = document.getElementById("add-wish-form");

    if (openWishBtn && wishModal) {
      openWishBtn.addEventListener("click", () => wishModal.classList.remove("hidden"));
    }
    if (closeWishBtn && wishModal) {
      closeWishBtn.addEventListener("click", () => wishModal.classList.add("hidden"));
    }
    if (wishForm) {
      wishForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const sender = document.getElementById("wish-sender-input").value.trim();
        const role = document.getElementById("wish-role-input").value.trim();
        const message = document.getElementById("wish-message-input").value.trim();
        if (sender && message) {
          familyWishes.unshift({
            sender,
            role: role || "Gửi ngàn yêu thương",
            avatar: "💝",
            message
          });
          renderFamilyWishes();
          wishForm.reset();
          if (wishModal) wishModal.classList.add("hidden");
          persistPhotoEdits("💝 Đã đăng & lưu lời chúc mới!");
          launchCelebrationSalvo();
        }
      });
    }
  }

  // ==========================================================================
  // 11. CANVAS NỀN VŨ TRỤ SAO VÀNG (STARFIELD) & PHÁO HOA (FIREWORKS)
  //     Tối ưu tiết kiệm GPU cho Mobile (Tự động ngủ khi không dùng)
  // ==========================================================================
  function initStarfieldCanvas() {
    const canvas = document.getElementById("starfield-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    window.addEventListener("resize", () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    });

    const isMobile = window.innerWidth <= 768;
    const starCount = isMobile ? 60 : 160;

    const stars = Array.from({ length: starCount }, () => ({
      x: (Math.random() - 0.5) * w * 2,
      y: (Math.random() - 0.5) * h * 2,
      z: Math.random() * 1000 + 50,
      size: Math.random() * 1.6 + 0.5,
      color: Math.random() > 0.35 ? "#f5e6c8" : "#d4a359"
    }));

    function drawStars() {
      // Trên Mobile: Tạm dừng vẽ sao nền khi đang cuộn xem lưới ảnh (stage-album) hoặc đọc thư để cuộn mượt 120Hz
      if (isMobile && (state.currentStage === "stage-album" || state.currentStage === "stage-letter")) {
        requestAnimationFrame(drawStars);
        return;
      }

      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;

      ctx.fillStyle = "#f5e6c8";
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.z -= 0.7 * state.warpSpeed;
        if (s.z <= 10) {
          s.z = 1000;
          s.x = (Math.random() - 0.5) * w * 2;
          s.y = (Math.random() - 0.5) * h * 2;
        }

        const k = 420 / s.z;
        const px = cx + s.x * k;
        const py = cy + s.y * k;

        if (px >= 0 && px <= w && py >= 0 && py <= h) {
          const r = Math.max(0.5, s.size * k * 0.5);
          ctx.globalAlpha = Math.min(0.85, 1 - s.z / 1050);
          ctx.fillRect(px, py, r * 1.6, r * 1.6);
        }
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(drawStars);
    }
    requestAnimationFrame(drawStars);
  }

  // Hệ thống Pháo Hoa & Kim Tuyến Vàng (Chỉ chạy loop khi có hạt pháo hoa, tự tắt hẳn khi xong)
  const fireworkParticles = [];
  let fireworksRunning = false;
  let startFireworksLoop = null;

  function spawnFireworkBurst(x, y) {
    const palette = ["#f5e6c8", "#e5cfa3", "#d4a359", "#ffffff"];
    const count = window.innerWidth <= 768 ? 28 : 48;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.2;
      const speed = 2.0 + Math.random() * 5.5;
      fireworkParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.0,
        alpha: 1,
        decay: 0.018 + Math.random() * 0.014,
        size: 2 + Math.random() * 2.2,
        color: palette[Math.floor(Math.random() * palette.length)]
      });
    }
    if (startFireworksLoop) startFireworksLoop();
  }

  function launchCelebrationSalvo() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    spawnFireworkBurst(w * 0.5, h * 0.26);
    setTimeout(() => spawnFireworkBurst(w * 0.25, h * 0.32), 220);
    setTimeout(() => spawnFireworkBurst(w * 0.75, h * 0.3), 440);
    playMagicChime(523.25);
  }

  function initFireworksCanvas() {
    const canvas = document.getElementById("fireworks-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    window.addEventListener("resize", () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    });

    function loopFireworks() {
      if (fireworkParticles.length === 0) {
        fireworksRunning = false;
        ctx.clearRect(0, 0, w, h);
        canvas.classList.remove("active");
        return;
      }

      ctx.clearRect(0, 0, w, h);
      for (let i = fireworkParticles.length - 1; i >= 0; i--) {
        const p = fireworkParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.07;
        p.vx *= 0.985;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          fireworkParticles.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(loopFireworks);
    }

    startFireworksLoop = function () {
      if (!fireworksRunning && fireworkParticles.length > 0) {
        fireworksRunning = true;
        canvas.classList.add("active");
        requestAnimationFrame(loopFireworks);
      }
    };
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ==========================================================================
  // 12. KHỞI CHẠY TOÀN BỘ WEBSITE
  // ==========================================================================
  document.addEventListener("DOMContentLoaded", () => {
    loadSavedPhotoEdits();
    initConfigContent();
    initNavigation();
    renderCandles();
    renderGalaxyCards();
    initGalaxyInteractions();
    renderPolaroidAlbum("all");
    initAlbumControls();
    initEnvelopeAndLetter();
    renderFamilyWishes();
    initVinylPlayer();
    initLightboxEvents();
    initModalsAndUploads();
    initStarfieldCanvas();
    initFireworksCanvas();
    loadCloudOrUrlStateOnBoot();

    // Sự kiện nút Thổi Nến & Pháo Hoa
    const blowAllBtn = document.getElementById("btn-blow-all");
    if (blowAllBtn) {
      blowAllBtn.addEventListener("click", blowAllCandlesSequence);
    }

    const relightBtn = document.getElementById("btn-relight-candles");
    if (relightBtn) {
      relightBtn.addEventListener("click", relightAllCandles);
    }

    const micBtn = document.getElementById("btn-mic-blow");
    if (micBtn) {
      micBtn.addEventListener("click", toggleMicBlowDetection);
    }

    const fwBtn = document.getElementById("btn-launch-fireworks");
    if (fwBtn) {
      fwBtn.addEventListener("click", launchCelebrationSalvo);
    }

    // Mở khóa sẵn AudioContext ngay khi người dùng chạm nhẹ lần đầu
    window.addEventListener(
      "pointerdown",
      () => {
        getAudioContext();
      },
      { once: true, passive: true }
    );

    // Sau khi trang web tải xong hoàn toàn: đếm ngược 10 giây rồi tự động bật Cảm biến âm thanh
    if (document.readyState === "complete") {
      scheduleAutoMicStart(10);
    } else {
      window.addEventListener("load", () => scheduleAutoMicStart(10), { once: true });
    }

    // Bắn pháo hoa nhẹ chào mừng khi mới vào trang
    setTimeout(() => {
      spawnFireworkBurst(window.innerWidth * 0.5, window.innerHeight * 0.25);
    }, 600);
  });
})();
