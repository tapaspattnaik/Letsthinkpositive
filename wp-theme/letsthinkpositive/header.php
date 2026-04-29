<!doctype html>
<html <?php language_attributes(); ?>>
<head>
  <meta charset="<?php bloginfo( 'charset' ); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="A warm, immersive platform for mindset, spiritual wisdom, daily inspiration, and positive living.">
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?> >

<!-- NAV from original site -->
<nav class="nav">
  <div class="nav-logo" data-page="home">
    <svg viewBox="0 0 200 220" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="105" r="72" fill="none" stroke="#A8D8D0" stroke-width="1" opacity="0.5"/>
      <circle cx="100" cy="105" r="56" fill="none" stroke="#A8D8D0" stroke-width="1" opacity="0.6"/>
      <circle cx="100" cy="105" r="42" fill="#2D9B8A"/>
      <circle cx="100" cy="105" r="30" fill="#1A6B6B"/>
      <path d="M86 108 Q100 95 114 108" fill="none" stroke="#E8A020" stroke-width="3" stroke-linecap="round"/>
      <path d="M91 100 Q100 89 109 100" fill="none" stroke="#E8A020" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="100" cy="113" r="3.5" fill="white" opacity="0.9"/>
      <path d="M80 139 Q100 149 120 139" fill="none" stroke="#2D9B8A" stroke-width="2" stroke-linecap="round"/>
      <circle cx="85" cy="145" r="2" fill="#2D9B8A" opacity="0.6"/>
      <circle cx="100" cy="150" r="2" fill="#2D9B8A" opacity="0.6"/>
      <circle cx="115" cy="145" r="2" fill="#2D9B8A" opacity="0.6"/>
      <line x1="100" y1="63" x2="100" y2="32" stroke="#E8A020" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="100" cy="30" r="2.5" fill="#E8A020"/>
      <line x1="88" y1="65" x2="83" y2="38" stroke="#E8A020" stroke-width="2" stroke-linecap="round"/>
      <circle cx="82" cy="36" r="2" fill="#F5C96A"/>
      <line x1="112" y1="65" x2="117" y2="38" stroke="#E8A020" stroke-width="2" stroke-linecap="round"/>
      <circle cx="118" cy="36" r="2" fill="#F5C96A"/>
    </svg>
    <div class="nav-wordmark"><span class="wm-lets">lets</span><span class="wm-think">think</span><span class="wm-positive">positive</span></div>
  </div>

  <div class="nav-links">
    <a data-page="home"     class="active">Home</a>
    <a data-page="about">About</a>
    <a data-page="positive">Positive Thinking</a>
    <a data-page="daily">Daily Inspiration</a>
    <a data-page="spiritual">Spiritual Wisdom</a>
    <a data-page="videos">Videos</a>
    <a data-page="resources">Resources</a>
    <a data-page="community">Community</a>
    <a data-page="blog">Blog</a>
    <a data-page="contact" class="nav-cta">Contact</a>
  </div>

  <button class="nav-burger" aria-label="Menu">
    <span></span><span></span><span></span>
  </button>
</nav>

<div class="nav-mobile">
  <a data-page="home">Home</a>
  <a data-page="about">About</a>
  <a data-page="positive">Positive Thinking</a>
  <a data-page="daily">Daily Inspiration</a>
  <a data-page="spiritual">Spiritual Wisdom</a>
  <a data-page="videos">Videos</a>
  <a data-page="resources">Resources</a>
  <a data-page="community">Community</a>
  <a data-page="blog">Blog</a>
  <a data-page="contact">Contact</a>
</div>
