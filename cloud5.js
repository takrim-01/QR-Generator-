/* TOAST */
let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toast.classList.remove('show');
  }, 3000);
}

/* SMOOTH SCROLL */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const href = link.getAttribute('href');

      if (href === '#') return; // 🚨 IMPORTANT FIX

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const nav = document.getElementById('navbar');
      const navH = nav ? nav.offsetHeight : 0;

      const top = target.getBoundingClientRect().top + window.scrollY - navH - 16;

      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });
})();

/* ACTIVE NAV */
(function initActiveNav() {
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');
  const navH      = 80;

  function update() {
    let current = '';
    sections.forEach(function (sec) {
      if (window.scrollY + navH + 80 >= sec.offsetTop) {
        current = sec.id;
      }
    });
    navLinks.forEach(function (link) {
      const href = link.getAttribute('href').replace('#', '');
      link.style.color = href === current ? 'var(--accent)' : '';
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();
/*Login Button*/
const profileBtn = document.getElementById("profileBtn");
const dropdown = document.getElementById("profileDropdown");

if (profileBtn && dropdown) {
  profileBtn.addEventListener("click", () => {
    dropdown.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (!profileBtn.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove("open");
    }
  });
}
/* QR + BARCODE READER */
(function initQRReader() {

  const resultBox = document.getElementById("readerResult");
  const uploadBtn = document.getElementById("uploadBtn");
  const fileInput = document.getElementById("qrFile");

  // 📷 CAMERA SCANNER
  const html5QrCode = new Html5Qrcode("readerCamera");

  function onScanSuccess(decodedText) {
    const entry = document.createElement("div");
entry.className = "scan-item";
entry.innerHTML = `<strong>Result:</strong> ${decodedText}`;

resultBox.appendChild(entry);
  }

  function onScanError(err) {
    // ignore frequent errors
  }

  // 📁 IMAGE SCAN
  uploadBtn.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    html5QrCode.scanFile(file, true)
      .then(decodedText => {
        const entry = document.createElement("div");
entry.className = "scan-item";
entry.innerHTML = `<strong>Result:</strong> ${decodedText}`;

resultBox.prepend(entry);
      })
      .catch(err => {
        const entry = document.createElement("div");
entry.className = "scan-item error";
entry.textContent = "No QR/Barcode found";

resultBox.prepend(entry);
      });
  });

})();