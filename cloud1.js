'use strict';

/* LOADING SCREEN */
(function initLoader() {
  const loader = document.getElementById('loader');
  
  window.addEventListener('load', function() {
    setTimeout(function() {
      loader.classList.add('hide');
      loader.addEventListener('transitionend', function() {
        loader.remove();
      }, { once: true });
    }, 2200);
  });
})();

/* NAVBAR */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  
  window.addEventListener('scroll', function() {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });
  
  hamburger.addEventListener('click', function(e) {
    e.stopPropagation();
    const open = hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
    mobileMenu.setAttribute('aria-hidden', !open);
  });
  
  mobileLinks.forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.stopPropagation();
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    });
  });
  
  document.addEventListener('click', function(e) {
    if (!navbar.contains(e.target) && hamburger.classList.contains('open')) {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
    }
  });
})();