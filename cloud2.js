(function initModal() {
  const overlay = document.getElementById('modalOverlay');
  const modalClose = document.getElementById('modalClose');
  const tabLogin = document.getElementById('tabLogin');
  const tabSignup = document.getElementById('tabSignup');
  const formLogin = document.getElementById('formLogin');
  const formSignup = document.getElementById('formSignup');
  const switchSignup = document.getElementById('switchSignup');
  const switchLogin = document.getElementById('switchLogin');
  
  document.querySelectorAll('#loginBtn, .btn-login').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      openModal('login');
    });
  });
  document.querySelectorAll('#signupBtn, .btn-signup').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      openModal('signup');
    });
  });
  
  function openModal(tab) {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    setTab(tab);
    document.body.style.overflow = 'hidden';
  }
  
  function closeModal() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  
  function setTab(which) {
    const isLogin = (which === 'login');
    if (tabLogin) tabLogin.classList.toggle('active', isLogin);
    if (tabSignup) tabSignup.classList.toggle('active', !isLogin);
    if (formLogin) formLogin.classList.toggle('active', isLogin);
    if (formSignup) formSignup.classList.toggle('active', !isLogin);
  }
  
  if (tabLogin) tabLogin.addEventListener('click', function() { setTab('login'); });
  if (tabSignup) tabSignup.addEventListener('click', function() { setTab('signup'); });
  if (switchSignup) switchSignup.addEventListener('click', function() { setTab('signup'); });
  if (switchLogin) switchLogin.addEventListener('click', function() { setTab('login'); });
  
  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (overlay) overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeModal();
  });
})();