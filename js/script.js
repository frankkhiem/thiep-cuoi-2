// ======= CẤU HÌNH — sửa tại đây =======
const CONFIG = {
  // Thời điểm đếm ngược (Lễ Vu Quy): năm, tháng (1-12), ngày, giờ, phút
  weddingDate: new Date(2026, 11, 6, 10, 30, 0), // 06/12/2026 10:30
  // Tên hiển thị khi link không kèm tên khách (thiệp mời chung)
  defaultGuest: "Bạn",
};

// ======= TÊN KHÁCH MỜI THEO LINK =======
// Thiệp mời chung:   https://ten-mien/
// Mời đích danh:     https://ten-mien/?khach=Anh+Nam  (hoặc ?ten=... hoặc gọn: ?Anh+Nam)
(function setGuestName() {
  const params = new URLSearchParams(window.location.search);
  let guest = (params.get("khach") || params.get("ten") || "").trim();

  // Dạng gọn ?Anh+Nam (không có dấu =)
  if (!guest && window.location.search.length > 1 && !window.location.search.includes("=")) {
    guest = decodeURIComponent(window.location.search.slice(1).replace(/\+/g, " ")).trim();
  }

  const name = guest || CONFIG.defaultGuest;
  document.getElementById("guest-name-cover").textContent = name;
  document.querySelectorAll(".guest-name").forEach((el) => (el.textContent = name));
})();

// ======= MỞ THIỆP =======
const cover = document.getElementById("cover");
const invitation = document.getElementById("invitation");
const music = document.getElementById("bg-music");
const musicBtn = document.getElementById("music-btn");

function openInvitation() {
  if (cover.classList.contains("opening")) return;
  cover.classList.add("opening"); // chạy animation phong bì

  // Phát nhạc nền (trình duyệt chỉ cho phép sau khi người dùng bấm)
  music.play().then(() => musicBtn.classList.add("playing")).catch(() => {
    musicBtn.classList.add("muted"); // không có file nhạc hoặc bị chặn
  });

  // Đợi phong bì mở xong rồi hiện thiệp
  setTimeout(() => {
    invitation.hidden = false;
    musicBtn.hidden = false;
    scrollBtn.hidden = false;
    startAutoScroll();
    cover.classList.add("closed");
    AOS.init({ duration: 900, once: true, offset: 80 });
  }, 2100);
}

document.getElementById("open-btn").addEventListener("click", openInvitation);
document.getElementById("envelope").addEventListener("click", openInvitation);

// ======= MỪNG CƯỚI (QR) =======
const giftScreen = document.getElementById("gift-screen");
document.getElementById("gift-open").addEventListener("click", () => {
  giftScreen.hidden = false;
  giftScreen.scrollTop = 0;
});
document.getElementById("gift-back").addEventListener("click", () => (giftScreen.hidden = true));

// ======= LỜI CHÚC (RSVP) =======
// Chưa có nơi nhận dữ liệu: chỉ hiện thông báo cảm ơn.
const rsvpForm = document.getElementById("rsvp-form");
const rsvpAttend = rsvpForm.elements["attend"];
const rsvpNo = [...rsvpAttend].find((cb) => cb.value === "khong");
const rsvpYes = [...rsvpAttend].filter((cb) => cb !== rsvpNo);

// "Không thể tham dự" loại trừ hai lựa chọn còn lại
rsvpAttend.forEach((cb) => cb.addEventListener("change", () => {
  if (cb === rsvpNo && cb.checked) rsvpYes.forEach((y) => (y.checked = false));
  if (cb !== rsvpNo && cb.checked) rsvpNo.checked = false;
  document.getElementById("rsvp-error").hidden = true;
}));

rsvpForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const picked = [...rsvpAttend].some((cb) => cb.checked);
  document.getElementById("rsvp-error").hidden = picked;
  if (!picked) return;
  rsvpForm.querySelector(".rsvp-submit").hidden = true;
  document.getElementById("rsvp-thanks").hidden = false;
});

// ======= BẬT / TẮT NHẠC =======
musicBtn.addEventListener("click", () => {
  if (music.paused) {
    music.play().then(() => {
      musicBtn.classList.add("playing");
      musicBtn.classList.remove("muted");
    }).catch(() => {});
  } else {
    music.pause();
    musicBtn.classList.remove("playing");
    musicBtn.classList.add("muted");
  }
});

// ======= TỰ ĐỘNG CUỘN =======
const scrollBtn = document.getElementById("scroll-btn");
const AUTO_SCROLL_SPEED = 40; // px mỗi giây
let autoScrollId = null;
let autoScrollPos = 0;
let autoScrollLast = 0;

function autoScrollStep(ts) {
  const dt = autoScrollLast ? (ts - autoScrollLast) / 1000 : 0;
  autoScrollLast = ts;
  autoScrollPos += AUTO_SCROLL_SPEED * dt;
  window.scrollTo(0, autoScrollPos);
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
    stopAutoScroll();
    return;
  }
  autoScrollId = requestAnimationFrame(autoScrollStep);
}

function startAutoScroll() {
  if (autoScrollId) return;
  autoScrollPos = window.scrollY;
  autoScrollLast = 0;
  document.documentElement.style.scrollBehavior = "auto"; // smooth scrolling cancels each frame's scrollTo on mobile
  scrollBtn.classList.add("playing");
  scrollBtn.classList.remove("muted");
  autoScrollId = requestAnimationFrame(autoScrollStep);
}

function stopAutoScroll() {
  cancelAnimationFrame(autoScrollId);
  autoScrollId = null;
  document.documentElement.style.scrollBehavior = "";
  scrollBtn.classList.remove("playing");
  scrollBtn.classList.add("muted");
}

scrollBtn.addEventListener("click", () => (autoScrollId ? stopAutoScroll() : startAutoScroll()));

// Người dùng tự cuộn thì dừng tự động cuộn
["wheel", "touchmove"].forEach((ev) =>
  window.addEventListener(ev, () => { if (autoScrollId) stopAutoScroll(); }, { passive: true })
);

// ======= ĐẾM NGƯỢC =======
(function startCountdown() {
  const el = {
    days: document.getElementById("cd-days"),
    hours: document.getElementById("cd-hours"),
    mins: document.getElementById("cd-mins"),
    secs: document.getElementById("cd-secs"),
  };

  function tick() {
    const diff = CONFIG.weddingDate - new Date();
    if (diff <= 0) {
      el.days.textContent = el.hours.textContent = el.mins.textContent = el.secs.textContent = "0";
      return;
    }
    el.days.textContent = Math.floor(diff / 86400000);
    el.hours.textContent = Math.floor(diff / 3600000) % 24;
    el.mins.textContent = Math.floor(diff / 60000) % 60;
    el.secs.textContent = Math.floor(diff / 1000) % 60;
    setTimeout(tick, 1000);
  }
  tick();
})();

// ======= SLIDER ẢNH KHOẢNH KHẮC =======
(function albumSlider() {
  const imgs = [...document.querySelectorAll(".gallery img")];
  if (!imgs.length) return;

  const box = document.createElement("div");
  box.className = "lightbox";
  box.hidden = true;
  box.innerHTML = `
    <button class="lb-btn lb-close" aria-label="Đóng">&times;</button>
    <button class="lb-btn lb-prev" aria-label="Ảnh trước">&#10094;</button>
    <img class="lb-img" alt="" />
    <button class="lb-btn lb-next" aria-label="Ảnh sau">&#10095;</button>`;
  document.body.appendChild(box);

  const view = box.querySelector(".lb-img");
  let current = 0;

  function show(i, dir = 1) {
    current = (i + imgs.length) % imgs.length;
    view.src = imgs[current].src;
    view.alt = imgs[current].alt;
    view.style.setProperty("--dir", dir > 0 ? "40px" : "-40px");
    view.classList.remove("lb-in");
    void view.offsetWidth;
    view.classList.add("lb-in");
  }
  function open(i) {
    show(i);
    box.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function close() {
    box.hidden = true;
    document.body.style.overflow = "";
  }

  imgs.forEach((img, i) => img.addEventListener("click", () => open(i)));
  box.querySelector(".lb-close").addEventListener("click", close);
  box.querySelector(".lb-prev").addEventListener("click", (e) => { e.stopPropagation(); show(current - 1, -1); });
  box.querySelector(".lb-next").addEventListener("click", (e) => { e.stopPropagation(); show(current + 1, 1); });
  box.addEventListener("click", (e) => { if (e.target === box) close(); });
  document.addEventListener("keydown", (e) => {
    if (box.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(current - 1, -1);
    if (e.key === "ArrowRight") show(current + 1, 1);
  });

  // Vuốt trái/phải trên điện thoại
  let startX = null;
  box.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    startX = null;
    if (Math.abs(dx) > 40) show(current + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  });
})();
