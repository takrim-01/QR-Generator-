/* ══════════════════════════════════════════════
   QR GENERATOR
══════════════════════════════════════════════ */
(function initGenerator() {

  // ── State ──
  var currentType = 'url';
  var imageData   = '';   // raw base64 (for logo overlay)
  var imageUrl    = '';   // hosted URL (for image QR)
  var qrGenerated = false;

  // ── Elements ──
  var generateBtn = document.getElementById('generateBtn');
  var qrCanvas    = document.getElementById('qrCanvas');
  var placeholder = document.getElementById('previewPlaceholder');
  var downloadRow = document.getElementById('downloadRow');
  var dlPng       = document.getElementById('dlPng');
  var dlSvg       = document.getElementById('dlSvg');
  var copyBtn     = document.getElementById('copyBtn');
  var fgColor     = document.getElementById('fgColor');
  var bgColor     = document.getElementById('bgColor');
  var fgHex       = document.getElementById('fgHex');
  var bgHex       = document.getElementById('bgHex');
  var qrSize      = document.getElementById('qrSize');
  var sizeVal     = document.getElementById('sizeVal');
  var heroCanvas  = document.getElementById('heroQr');
  var imageInput  = document.getElementById('imageInput');
  var imageDrop   = document.getElementById('imageDrop');
  var imageName   = document.getElementById('imageName');
  var imageStatus = document.getElementById('imageStatus');
  var imgbbKey    = document.getElementById('imgbbKey');

  // ── Safety check ──
  if (!generateBtn || !qrCanvas) {
    console.error('QRCraft: generateBtn or qrCanvas not found in DOM');
    return;
  }

  // ── Image upload → ImgBB → URL → QR ──
  // QR codes cannot store raw image data (limit is ~2953 bytes).
  // We upload the image to ImgBB (free host) and encode the returned URL instead.
  function setStatus(msg, color) {
    if (imageStatus) { imageStatus.textContent = msg; imageStatus.style.color = color || '#78716C'; }
  }

  function uploadToImgBB(file, callback) {
    var key = imgbbKey ? imgbbKey.value.trim() : '';
    if (!key) {
      callback(null, 'Please enter your ImgBB API key above. Get one free at api.imgbb.com');
      return;
    }

    var reader = new FileReader();
    reader.onload = function (e) {
      // ImgBB expects base64 without the data:...;base64, prefix
      var base64 = e.target.result.split(',')[1];
      var formData = new FormData();
      formData.append('key', key);
      formData.append('image', base64);
      formData.append('name', file.name.replace(/\.[^.]+$/, ''));

      setStatus('Uploading image…', '#6366F1');

      fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData
      })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data && data.success && data.data && data.data.url) {
          callback(data.data.url, null);
        } else {
          var msg = (data && data.error && data.error.message) ? data.error.message : 'Upload failed. Check your API key.';
          callback(null, msg);
        }
      })
      .catch(function () {
        callback(null, 'Network error — could not reach ImgBB.');
      });
    };
    reader.readAsDataURL(file);
  }

  function handleImageFile(file) {
    if (imageName) imageName.textContent = file.name;
    imageUrl = '';
    imageData = '';
    uploadToImgBB(file, function (url, err) {
      if (err) {
        setStatus('✗ ' + err, '#dc2626');
        return;
      }
      imageUrl  = url;
      setStatus('✓ Uploaded — ready to generate!', '#16a34a');
      if (qrGenerated) doGenerate();
    });
  }

  if (imageDrop && imageInput) {
    imageDrop.addEventListener('click', function () { imageInput.click(); });

    imageInput.addEventListener('change', function () {
      var file = this.files[0];
      if (!file) return;
      handleImageFile(file);
    });

    imageDrop.addEventListener('dragover', function (e) {
      e.preventDefault();
      imageDrop.style.borderColor = 'var(--accent)';
    });
    imageDrop.addEventListener('dragleave', function () {
      imageDrop.style.borderColor = '';
    });
    imageDrop.addEventListener('drop', function (e) {
      e.preventDefault();
      imageDrop.style.borderColor = '';
      var file = e.dataTransfer.files[0];
      if (!file) return;
      handleImageFile(file);
    });
  }

  // ── Tabs ──
  document.querySelectorAll('.gen-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.gen-tab').forEach(function (t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      currentType = tab.dataset.type;
      document.querySelectorAll('.tab-panel').forEach(function (p) {
        p.classList.remove('active');
      });
      var panel = document.getElementById('panel-' + currentType);
      if (panel) panel.classList.add('active');
      tab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });
  });

  // ── Colour pickers ──
  if (fgColor && fgHex) {
    fgColor.addEventListener('input', function () {
      fgHex.textContent = fgColor.value;
      if (qrGenerated) doGenerate();
    });
  }
  if (bgColor && bgHex) {
    bgColor.addEventListener('input', function () {
      bgHex.textContent = bgColor.value;
      if (qrGenerated) doGenerate();
    });
  }

  // ── Size slider ──
  if (qrSize && sizeVal) {
    qrSize.addEventListener('input', function () {
      sizeVal.textContent = qrSize.value;
      if (qrGenerated) doGenerate();
    });
  }

  // ── ECC radios ──
  document.querySelectorAll('[name="ecc"]').forEach(function (r) {
    r.addEventListener('change', function () {
      if (qrGenerated) doGenerate();
    });
  });

  // ── Live regen on input fields ──
  var liveFields = '#urlInput,#textInput,#wifiSsid,#wifiPass,#wifiSec,#vcName,#vcPhone,#vcEmail,#vcCompany,#emailTo,#emailSubject,#emailBody';
  document.querySelectorAll(liveFields).forEach(function (el) {
    el.addEventListener('input', function () {
      if (qrGenerated) doGenerate();
    });
  });

  // ── Build QR content string ──
  function buildContent() {
    switch (currentType) {
      case 'url': {
        var el = document.getElementById('urlInput');
        return (el && el.value.trim()) ? el.value.trim() : 'https://qrcraft.app';
      }
      case 'text': {
        var el = document.getElementById('textInput');
        return (el && el.value.trim()) ? el.value.trim() : 'Hello, World!';
      }
      case 'wifi': {
        var ssid = document.getElementById('wifiSsid');
        var pass = document.getElementById('wifiPass');
        var sec  = document.getElementById('wifiSec');
        return 'WIFI:T:' + (sec ? sec.value : 'WPA') +
               ';S:' + (ssid ? ssid.value.trim() : '') +
               ';P:' + (pass ? pass.value : '') + ';;';
      }
      case 'vcard': {
        var name    = document.getElementById('vcName');
        var phone   = document.getElementById('vcPhone');
        var email   = document.getElementById('vcEmail');
        var company = document.getElementById('vcCompany');
        return 'BEGIN:VCARD\nVERSION:3.0\nFN:' + (name    ? name.value.trim()    : '') +
               '\nTEL:'   + (phone   ? phone.value.trim()   : '') +
               '\nEMAIL:' + (email   ? email.value.trim()   : '') +
               '\nORG:'   + (company ? company.value.trim() : '') + '\nEND:VCARD';
      }
      case 'email': {
        var to      = document.getElementById('emailTo');
        var subject = document.getElementById('emailSubject');
        var body    = document.getElementById('emailBody');
        return 'mailto:' + (to ? to.value.trim() : '') +
               '?subject=' + encodeURIComponent(subject ? subject.value.trim() : '') +
               '&body='    + encodeURIComponent(body    ? body.value.trim()    : '');
      }
      case 'image': {
        if (!imageUrl) { setStatus('Upload an image first', '#dc2626'); return null; }
        return imageUrl;
      }
      default:
        return 'https://qrcraft.app';
    }
  }

  // ── Get ECC level ──
  // Force H (highest error correction) in image mode — compressed image data needs max redundancy
  function getECC() {
    if (currentType === 'image') return 'H';
    var checked = document.querySelector('[name="ecc"]:checked');
    return checked ? checked.value : 'M';
  }

  // ── Core draw — returns a Promise ──
  function drawQR(canvasEl, content, size, fg, bg, ecc) {
    return new Promise(function (resolve) {

      var eccMap = {
        L: QRCode.CorrectLevel.L,
        M: QRCode.CorrectLevel.M,
        Q: QRCode.CorrectLevel.Q,
        H: QRCode.CorrectLevel.H
      };

      // Off-screen container for QRCode.js to render into
      var tempDiv = document.createElement('div');
      tempDiv.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:' + size + 'px;height:' + size + 'px;';
      document.body.appendChild(tempDiv);

      new QRCode(tempDiv, {
        text:         content,
        width:        size,
        height:       size,
        colorDark:    fg,
        colorLight:   bg,
        correctLevel: eccMap[ecc] || QRCode.CorrectLevel.M
      });

      function cleanup() {
        if (tempDiv.parentNode) tempDiv.parentNode.removeChild(tempDiv);
      }

      function copyToCanvas(source) {
        canvasEl.width  = size;
        canvasEl.height = size;
        var ctx = canvasEl.getContext('2d');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(source, 0, 0, size, size);
        cleanup();

        // Overlay logo if uploaded
        if (!imageData) { resolve(); return; }

        var logo = new Image();
        logo.onload = function () {
          var logoSize = size * 0.22;
          var x = (size - logoSize) / 2;
          var y = (size - logoSize) / 2;
          ctx.fillStyle = bg || '#ffffff';
          ctx.fillRect(x - 6, y - 6, logoSize + 12, logoSize + 12);
          ctx.drawImage(logo, x, y, logoSize, logoSize);
          resolve();
        };
        logo.onerror = function () { resolve(); };
        logo.src = imageData;
      }

      // Poll until QRCode.js has produced its inner canvas or img
      function poll() {
        var inner = tempDiv.querySelector('canvas');
        if (inner) { copyToCanvas(inner); return; }

        var img = tempDiv.querySelector('img');
        if (img) {
          if (img.complete && img.naturalWidth > 0) {
            copyToCanvas(img);
          } else {
            img.onload  = function () { copyToCanvas(img); };
            img.onerror = function () { cleanup(); resolve(); };
          }
          return;
        }
        setTimeout(poll, 10);
      }

      setTimeout(poll, 0);
    });
  }

  // ── Main generate action ──
  function doGenerate() {
    var content = buildContent();
    if (!content) { generateBtn.disabled = false; generateBtn.textContent = "Generate QR Code"; return; }
    var maxSize = window.innerWidth <= 768
      ? Math.min(parseInt(qrSize ? qrSize.value : 300, 10), window.innerWidth - 80)
      : parseInt(qrSize ? qrSize.value : 300, 10);
    var fg  = fgColor ? fgColor.value : '#000000';
    var bg  = bgColor ? bgColor.value : '#ffffff';
    var ecc = getECC();

    drawQR(qrCanvas, content, maxSize, fg, bg, ecc).then(function () {
      qrGenerated = true;

      qrCanvas.style.display = 'block';
      if (placeholder) placeholder.style.display = 'none';
      if (downloadRow) downloadRow.style.display  = 'flex';

      // Pop-in animation
      qrCanvas.style.transition = 'transform .4s cubic-bezier(.34,1.56,.64,1)';
      qrCanvas.style.transform  = 'scale(.85)';
      requestAnimationFrame(function () { qrCanvas.style.transform = 'scale(1)'; });

      // Restore button
      generateBtn.disabled  = false;
      generateBtn.innerHTML =
        '<svg viewBox="0 0 20 20" fill="none">' +
        '<rect x="3"  y="3"  width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.8"/>' +
        '<rect x="11" y="3"  width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.8"/>' +
        '<rect x="3"  y="11" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.8"/>' +
        '<rect x="11" y="11" width="3" height="3" rx="0.5" fill="currentColor"/>' +
        '<rect x="14" y="11" width="3" height="3" rx="0.5" fill="currentColor"/>' +
        '<rect x="11" y="14" width="3" height="3" rx="0.5" fill="currentColor"/>' +
        '<rect x="14" y="14" width="3" height="3" rx="0.5" fill="currentColor"/>' +
        '</svg> Generate QR Code';

      if (typeof showToast === 'function') showToast('QR code generated! 🎉');

      if (window.innerWidth <= 768) {
        var panel = document.querySelector('.gen-preview-panel');
        if (panel) setTimeout(function () { panel.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
      }
    });
  }

  // ── Generate button click ──
  generateBtn.addEventListener('click', function () {
    generateBtn.disabled    = true;
    generateBtn.textContent = 'Generating…';
    doGenerate();
  });

  // ── Download PNG ──
  if (dlPng) {
    dlPng.addEventListener('click', function () {
      var a = document.createElement('a');
      a.download = 'qrcraft-code.png';
      a.href = qrCanvas.toDataURL('image/png');
      a.click();
      if (typeof showToast === 'function') showToast('PNG downloaded ✓');
    });
  }

  // ── Download SVG ──
  if (dlSvg) {
    dlSvg.addEventListener('click', function () {
      var size = qrSize ? parseInt(qrSize.value, 10) : 300;
      var data = qrCanvas.toDataURL('image/png');
      var svg  = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="' + size + '" height="' + size + '">' +
                 '<image href="' + data + '" width="' + size + '" height="' + size + '"/></svg>';
      var blob = new Blob([svg], { type: 'image/svg+xml' });
      var url  = URL.createObjectURL(blob);
      var a    = document.createElement('a');
      a.download = 'qrcraft-code.svg';
      a.href = url;
      a.click();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      if (typeof showToast === 'function') showToast('SVG downloaded ✓');
    });
  }

  // ── Copy to clipboard ──
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      qrCanvas.toBlob(function (blob) {
        if (!blob) { if (typeof showToast === 'function') showToast('Copy failed'); return; }
        try {
          navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
            .then(function ()  { if (typeof showToast === 'function') showToast('Copied to clipboard ✓'); })
            .catch(function () { if (typeof showToast === 'function') showToast('Copy not supported in this browser'); });
        } catch (e) {
          if (typeof showToast === 'function') showToast('Copy not supported in this browser');
        }
      });
    });
  }

  // ── Hero preview QR on page load ──
  window.addEventListener('load', function () {
    if (typeof QRCode !== 'undefined' && heroCanvas) {
      drawQR(heroCanvas, 'https://qrcraft.app', 180, '#1C1917', '#FFFFFF', 'M');
    }
  });

})();

/* ══════════════════════════════════════════════
   QR / BARCODE SCANNER
══════════════════════════════════════════════ */
(function initScanner() {

  var scanInput  = document.getElementById('qrFile');
  var uploadBtn  = document.getElementById('uploadBtn');
  var scanResult = document.getElementById('readerResult');

  if (!uploadBtn || !scanInput) return;

  uploadBtn.addEventListener('click', function () { scanInput.click(); });

  scanInput.addEventListener('change', function () {
    var file = this.files[0];
    if (!file) return;
    scanFile(file);
  });

  uploadBtn.addEventListener('dragover', function (e) {
    e.preventDefault();
    uploadBtn.style.borderColor = 'var(--accent)';
  });
  uploadBtn.addEventListener('dragleave', function () {
    uploadBtn.style.borderColor = '';
  });
  uploadBtn.addEventListener('drop', function (e) {
    e.preventDefault();
    uploadBtn.style.borderColor = '';
    var file = e.dataTransfer.files[0];
    if (!file) return;
    scanFile(file);
  });

  function scanFile(file) {
    if (scanResult) scanResult.innerHTML = 'Scanning…';
    Html5Qrcode.scanFile(file, false)
      .then(function (decoded) {
        if (scanResult) {
          scanResult.innerHTML =
            '<div style="padding:16px;border-radius:16px;background:#f5f5f4;word-break:break-word;">' +
            '<strong>Result:</strong><br><br>' + decoded + '</div>';
        }
        if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
          window.open(decoded, '_blank');
        }
      })
      .catch(function () {
        if (scanResult) {
          scanResult.innerHTML =
            '<div style="padding:16px;border-radius:16px;background:#fef2f2;color:#dc2626;">No QR or Barcode detected.</div>';
        }
      });
  }

})();
