<?php
get_header();
?>

<div id="site-content">
<div id="page-home" class="page">

  <!-- Hero -->
  <section class="hero">
    <div class="hero-bg"></div>
    <div class="hero-inner">
      <div class="hero-content anim-up">
        <div class="label">Welcome to letsthinkpositive.com</div>
        <h1 class="display">You don't need a cape<br>to change the <em>world.</em><br>Just change one <strong>thought.</strong></h1>
        <p class="hero-sub">A warm, immersive platform for mindset, spiritual wisdom, daily inspiration, and real human connection. No toxic positivity. Just one good thought — every single day.</p>
        <div class="hero-actions">
          <button class="btn" data-page="daily">Today's Inspiration</button>
          <button class="btn btn-outline" data-page="community">Join the Community</button>
        </div>
      </div>
      <div class="anim-up delay-3">
        <div class="hero-card">
          <div class="day-badge">Today's Thought</div>
          <p class="q-text" id="hero-q-text">"The root of every action is a thought. Tend to your roots."</p>
          <div class="q-author" id="hero-q-author">— Tapas Pattanaik</div>
          <div class="q-refresh">
            <span class="q-cat-badge" id="hero-q-cat">Mindset</span>
            <button class="q-next-btn" onclick="nextQuote()">Next thought →</button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Stats -->
  <div class="stats-bar">
    <div class="stats-bar-inner">
      <div class="stat-item"><div class="stat-num">30+</div><div class="stat-lbl">Daily quotes loaded</div></div>
      <div class="stat-item"><div class="stat-num">5</div><div class="stat-lbl">Content categories</div></div>
      <div class="stat-item"><div class="stat-num">∞</div><div class="stat-lbl">Thoughts to share</div></div>
      <div class="stat-item"><div class="stat-num">1</div><div class="stat-lbl">Community, growing together</div></div>
    </div>
  </div>

  <!-- Mission -->
  <section class="section bg-ivory2">
    <div class="wrap">
      <div class="grid-2" style="gap:72px">
        <div>
          <div class="amber-line"></div>
          <div class="label">Our Mission</div>
          <h2 class="display" style="font-size:clamp(1.8rem,3.5vw,2.8rem);margin:12px 0 20px;line-height:1.15">To create a space where every thought begins with hope.</h2>
          <p style="font-size:1rem;line-height:1.8;opacity:.75;margin-bottom:20px;font-weight:300">letsthinkpositive.com was born from a simple but profound belief — that the quality of a person's life is deeply connected to the quality of their thinking. Not positive thinking as a denial of reality, but as a deliberate, practised discipline.</p>
          <p style="font-size:1rem;line-height:1.8;opacity:.75;margin-bottom:28px;font-weight:300">This platform is for the working professional who feels stuck. For the student who doubts whether they are enough. For anyone who has ever woken up and wondered if things could be different.</p>
          <button class="btn btn-teal" data-page="about">Read Our Story</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="quote-block">
            <p class="q-text">"We cannot always control what happens around us. But we can always control what happens inside us."</p>
            <div class="q-author">Tapas Pattanaik <span class="q-cat">Mindset</span></div>
          </div>
          <div style="background:white;border-radius:16px;padding:24px 28px;border:1px solid rgba(168,216,208,0.3)">
            <div class="label" style="margin-bottom:12px">What you'll find here</div>
            <div style="display:flex;flex-direction:column;gap:10px">
              <div style="display:flex;gap:10px;align-items:center;font-size:.88rem;opacity:.8"><span style="font-size:1.1rem">🧠</span> Mental Wellness &amp; Mindset</div>
              <div style="display:flex;gap:10px;align-items:center;font-size:.88rem;opacity:.8"><span style="font-size:1.1rem">🕉️</span> Spiritual Wisdom &amp; Hindu Philosophy</div>
              <div style="display:flex;gap:10px;align-items:center;font-size:.88rem;opacity:.8"><span style="font-size:1.1rem">☀</span> Daily Inspiration &amp; Affirmations</div>
              <div style="display:flex;gap:10px;align-items:center;font-size:.88rem;opacity:.8"><span style="font-size:1.1rem">💼</span> Career &amp; Professional Growth</div>
              <div style="display:flex;gap:10px;align-items:center;font-size:.88rem;opacity:.8"><span style="font-size:1.1rem">🌱</span> Life Coaching &amp; Habits</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Pillars -->
  <section class="section">
    <div class="wrap">
      <div class="section-head">
        <div class="amber-line"></div>
        <div class="label">Four Ways We Grow Together</div>
        <h2 class="display">Everything this platform<br><em style="color:var(--deep-teal)">is built around</em></h2>
      </div>
      <div class="pillars-grid">
        <div class="pillar-card">
          <div class="pillar-icon">🧠</div>
          <h3>Mental Wellness &amp; Mindset</h3>
          <p>Your thoughts are the most powerful thing you own. We help you understand, challenge, and gently retrain them.</p>
        </div>
        <div class="pillar-card">
          <div class="pillar-icon">💼</div>
          <h3>Career &amp; Professional Growth</h3>
          <p>We bring clarity, confidence, and purpose into your professional life — because mindset at work matters most.</p>
        </div>
        <div class="pillar-card">
          <div class="pillar-icon">🌱</div>
          <h3>Life Coaching &amp; Habits</h3>
          <p>Big change doesn't happen in one moment. It happens in the small, repeated choices you make every single day.</p>
        </div>
        <div class="pillar-card">
          <div class="pillar-icon">🎓</div>
          <h3>Student Motivation</h3>
          <p>Students deserve someone who takes their inner world as seriously as their exam results. We are here for that.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Latest from blog -->
  <section class="section bg-ivory2">
    <div class="wrap">
      <div class="section-head" style="display:flex;justify-content:space-between;align-items:flex-end;flex-wrap:wrap;gap:16px">
        <div>
          <div class="amber-line"></div>
          <div class="label">Fresh from the community</div>
          <h2 class="display">Latest Thoughts</h2>
        </div>
        <button class="btn btn-outline" data-page="blog">View All Posts</button>
      </div>
      <div class="posts-grid">
        <div class="card">
          <div class="card-img">🦸</div>
          <div class="card-body">
            <div class="card-label">Mindset</div>
            <h3 class="card-title">The Day I Stopped Looking for Superman</h3>
            <p class="card-excerpt">As a kid, I wanted to be saved by a superhero. As an adult, I realised the world doesn't need more heroes — it needs more people who will just sit down and listen.</p>
          </div>
          <div class="card-foot"><span style="font-size:.75rem;opacity:.5">Tapas Pattanaik</span><a data-page="blog">Read more →</a></div>
        </div>
        <div class="card">
          <div class="card-img">🙈</div>
          <div class="card-body">
            <div class="card-label">Mindset</div>
            <h3 class="card-title">What Gandhi's 3 Monkeys Taught Me About Modern Life</h3>
            <p class="card-excerpt">See no evil, hear no evil, speak no evil. I grew up with those three monkeys on the wall. Then life happened — and I understood them completely differently.</p>
          </div>
          <div class="card-foot"><span style="font-size:.75rem;opacity:.5">Tapas Pattanaik</span><a data-page="blog">Read more →</a></div>
        </div>
        <div class="card">
          <div class="card-img">💭</div>
          <div class="card-body">
            <div class="card-label">Career</div>
            <h3 class="card-title">Why Your Thoughts Are the Only Thing You Actually Own</h3>
            <p class="card-excerpt">They can take your job, your money, even your health. But not this. The difference between those who rebuild and those who collapse was never the circumstances.</p>
          </div>
          <div class="card-foot"><span style="font-size:.75rem;opacity:.5">Tapas Pattanaik</span><a data-page="blog">Read more →</a></div>
        </div>
      </div>
    </div>
  </section>

  <!-- Newsletter -->
  <div class="newsletter-band">
    <h2 class="display">One thought a day.<br>That's all it takes.</h2>
    <p>Sign up and every morning you'll receive one daily quote, delivered quietly to your inbox. No noise. No spam. Just one thought to carry with you.</p>
    <div class="nl-form">
      <input type="email" placeholder="Your email address">
      <button class="btn btn-white">Subscribe →</button>
    </div>
    <p class="nl-note">Join readers from across India and the world who start their morning here.</p>
    <p class="nl-success">✓ Welcome. Your first thought is on its way soon.</p>
  </div>

  <!-- Footer -->
  
</div><!-- /page-home -->


<!-- ══════════════════════════════════════════
     PAGE 2 — ABOUT
══════════════════════════════════════════ -->
<div id="page-about" class="page">
  <div class="page-hero">
    <div class="wrap">
      <div class="label">Our Story</div>
      <h1 class="display">From Superman to SuperbMan</h1>
      <p>The real story behind letsthinkpositive.com — built by someone who went through the hard days and decided to hold the door open for others.</p>
    </div>
  </div>

  <section class="section">
    <div class="wrap">
      <div class="about-story">
        <div class="about-photo-block">
          <div class="about-photo" style="overflow:hidden;"><img src="<?php echo get_stylesheet_directory_uri(); ?>/assets/images/tapas.jpg" alt="Tapas Pattanaik" style="width:100%;height:100%;object-fit:cover;"></div>
          <p class="about-photo-caption">Tapas Pattanaik — IT Professional & Mindset Explorer</p>
        </div>
        <div class="about-text">
          <div class="amber-line"></div>
          <h2 class="display">I used to want<br>to be <em style="color:var(--deep-teal)">Superman.</em></h2>
          <p>Not metaphorically — I mean I genuinely, as a small kid, believed that the answer to the world's problems was a superhero. Someone with the power to fix everything, save everyone, and make the bad things stop.</p>
          <p>It took me a long time — and some genuinely hard seasons of life — to understand something important: Superman is a fantasy. A beautiful one, but a fantasy all the same.</p>
          <blockquote>"What the world actually needs is something far more human. It needs SuperbMen and SuperbWomen. People who cannot fly or stop bullets — but who can sit with someone in their pain and not flinch."</blockquote>
          <p>I grew up watching Mahatma Gandhi's three monkeys — see no evil, hear no evil, speak no evil. As a child it seemed simple. As an adult navigating a corporate career, personal struggles, and the constant noise of modern life, I understood it differently.</p>
          <p>I spent years in the corporate IT world. I've sat in high-pressure meetings, navigated office politics, faced moments where I questioned everything I thought I knew about myself. I've also sat with friends at 2am who had nowhere else to turn.</p>
          <p>What I learned from all of it: the quality of your life is almost entirely determined by the quality of your thinking. Not your circumstances. Not your salary. Not your job title. <strong>Your thinking.</strong></p>
          <p style="margin-top:24px"><em style="font-family:'Cormorant Garamond',serif;font-size:1.05rem;color:var(--deep-teal)">"letsthinkpositive.com is the platform I wish had existed when I needed it most."</em></p>
          <p style="margin-top:20px;font-weight:500">— Tapas Pattanaik</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Why Positivity Matters -->
  <section class="section bg-ivory2">
    <div class="wrap">
      <div class="section-head" style="text-align:center;max-width:600px;margin:0 auto 56px">
        <div class="amber-line" style="margin:0 auto 16px"></div>
        <div class="label">Why It Matters</div>
        <h2 class="display">Positivity is not pretending.<br><em style="color:var(--deep-teal)">It is choosing.</em></h2>
        <p>Not a motivational poster slogan. Something I have lived, tested, failed at, and slowly — imperfectly — learned to practice.</p>
      </div>
      <div class="values-grid">
        <div class="value-card"><div class="value-icon">🎧</div><h3>Listen First</h3><p>A SuperbMan listens — really listens — without thinking about what to say next. That is the rarest and most powerful thing you can offer.</p></div>
        <div class="value-card"><div class="value-icon">💪</div><h3>Stay Down, Then Rise</h3><p>We don't pretend the hard days aren't hard. We just refuse to stay down. That decision — to get up one more time — is everything.</p></div>
        <div class="value-card"><div class="value-icon">🧠</div><h3>Control Your Mind</h3><p>Controlling your thoughts is not weakness — it is the most courageous discipline there is. The inner world shapes the outer world.</p></div>
        <div class="value-card"><div class="value-icon">🤝</div><h3>Make People Feel Seen</h3><p>A SuperbMan makes the people around them feel seen, heard, and less alone. That is not soft. That is transformative.</p></div>
        <div class="value-card"><div class="value-icon">🌱</div><h3>Start From One Thought</h3><p>Everything — every movement, every better world — starts from one person deciding to think differently. Let that person be you today.</p></div>
        <div class="value-card"><div class="value-icon">🌊</div><h3>Pass It On</h3><p>A SuperbMan passes it on. One ripple reaches another, and another. That is how change actually spreads — quietly, through human connection.</p></div>
      </div>
    </div>
  </section>

  <!-- Vision & Mission -->
  <section class="section">
    <div class="wrap">
      <div class="vision-block">
        <div class="label">Our Vision</div>
        <h2 class="display">A world where every person has<br>access to the tools to think positively,<br>live purposefully, and <em>grow without limits.</em></h2>
        <p style="margin-top:20px">Regardless of age, background, or circumstance. Beginning in English, with a heart that speaks Hindi, and a spirit that belongs to no single culture — because the desire to grow and hope is not a cultural trait. It is a human one.</p>
      </div>
    </div>
  </section>

  
</div><!-- /page-about -->


<!-- ══════════════════════════════════════════
     PAGE 3 — POSITIVE THINKING
══════════════════════════════════════════ -->
<div id="page-positive" class="page">
  <div class="page-hero">
    <div class="wrap">
      <div class="label">The Core of Everything</div>
      <h1 class="display">Positive Thinking</h1>
      <p>Practical, honest, evidence-backed content on mindset, overcoming negativity, gratitude, self-confidence, and the habits of successful people.</p>
    </div>
  </div>

  <section class="section">
    <div class="wrap">
      <div class="category-nav">
        <span class="tag active" data-cat="all">All</span>
        <span class="tag" data-cat="mindset">🧠 Mindset</span>
        <span class="tag" data-cat="negativity">⚡ Overcoming Negativity</span>
        <span class="tag" data-cat="gratitude">🙏 Gratitude Practice</span>
        <span class="tag" data-cat="confidence">💪 Self Confidence</span>
        <span class="tag" data-cat="habits">🌱 Success Habits</span>
      </div>

      <div class="pt-grid">
        <div class="pt-card" data-cat="mindset">
          <div class="pt-card-head" style="background:linear-gradient(135deg,var(--tranquil-pale),#D4EDE8)">🧠</div>
          <div class="pt-card-body">
            <div class="pt-card-cat">Mindset</div>
            <h3>The Day I Stopped Looking for Superman</h3>
            <p>What the world needs isn't more heroes. It needs more people willing to just sit down, shut up, and truly listen.</p>
            <span class="read-link">Read Article</span>
          </div>
        </div>
        <div class="pt-card" data-cat="mindset">
          <div class="pt-card-head" style="background:linear-gradient(135deg,#E8F4F0,var(--tranquil-pale))">🙈</div>
          <div class="pt-card-body">
            <div class="pt-card-cat">Mindset</div>
            <h3>Gandhi's 3 Monkeys in the Age of Social Media</h3>
            <p>Ancient wisdom for a world drowning in noise. You can't filter the world — but you can filter your response to it.</p>
            <span class="read-link">Read Article</span>
          </div>
        </div>
        <div class="pt-card" data-cat="negativity">
          <div class="pt-card-head" style="background:linear-gradient(135deg,#FFF4E0,#FFE8B0)">⚡</div>
          <div class="pt-card-body">
            <div class="pt-card-cat">Overcoming Negativity</div>
            <h3>When Everything Goes Wrong At Once</h3>
            <p>A practical guide to staying grounded when the ground disappears. The strategy that actually works in real life.</p>
            <span class="read-link">Read Article</span>
          </div>
        </div>
        <div class="pt-card" data-cat="gratitude">
          <div class="pt-card-head" style="background:linear-gradient(135deg,#F0F8E8,#E4F2D8)">🙏</div>
          <div class="pt-card-body">
            <div class="pt-card-cat">Gratitude Practice</div>
            <h3>The 3-Minute Morning Practice That Changed Everything</h3>
            <p>Not journaling. Not affirmations. Something simpler, more honest, and more powerful than either.</p>
            <span class="read-link">Read Article</span>
          </div>
        </div>
        <div class="pt-card" data-cat="confidence">
          <div class="pt-card-head" style="background:linear-gradient(135deg,#E8F0FF,#D8E8FF)">💪</div>
          <div class="pt-card-body">
            <div class="pt-card-cat">Self Confidence</div>
            <h3>Confidence Is Not a Personality Trait. It Is a Practice.</h3>
            <p>You were not born confident or unconfident. You learned one or the other. Here's how to unlearn the wrong lesson.</p>
            <span class="read-link">Read Article</span>
          </div>
        </div>
        <div class="pt-card" data-cat="habits">
          <div class="pt-card-head" style="background:linear-gradient(135deg,#F8F0E8,#F0E4D4)">🌱</div>
          <div class="pt-card-body">
            <div class="pt-card-cat">Success Habits</div>
            <h3>I Changed One Thing Every Morning. Six Months Later, Everything Was Different.</h3>
            <p>The smallest habit that quietly rewired how I face every day. No 5am wake-ups. No cold showers.</p>
            <span class="read-link">Read Article</span>
          </div>
        </div>
        <div class="pt-card" data-cat="negativity">
          <div class="pt-card-head" style="background:linear-gradient(135deg,#FFE8E8,#FFD4D4)">🔥</div>
          <div class="pt-card-body">
            <div class="pt-card-cat">Overcoming Negativity</div>
            <h3>Why Negative People Aren't Your Problem — Your Response Is</h3>
            <p>The only person whose reactions you control is you. Here is how to protect your mental space without closing your heart.</p>
            <span class="read-link">Read Article</span>
          </div>
        </div>
        <div class="pt-card" data-cat="confidence">
          <div class="pt-card-head" style="background:linear-gradient(135deg,#EEE8FF,#E4D8FF)">✨</div>
          <div class="pt-card-body">
            <div class="pt-card-cat">Self Confidence</div>
            <h3>The Letter to Every Student Who Feels Already Behind</h3>
            <p>You are not behind. You are on your timeline. And it is unfolding exactly as it should. This post is for you.</p>
            <span class="read-link">Read Article</span>
          </div>
        </div>
        <div class="pt-card" data-cat="habits">
          <div class="pt-card-head" style="background:linear-gradient(135deg,#E8FAF0,#D4F4E4)">📈</div>
          <div class="pt-card-body">
            <div class="pt-card-cat">Success Habits</div>
            <h3>Small, Consistent, Deliberate — The Only Formula You Need</h3>
            <p>Transformation doesn't live in dramatic decisions. It lives in the small thoughts you choose to keep, every single day.</p>
            <span class="read-link">Read Article</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <div class="newsletter-band">
    <h2 class="display">New articles every week.</h2>
    <p>Get the latest Positive Thinking content delivered straight to your inbox.</p>
    <div class="nl-form">
      <input type="email" placeholder="Your email address">
      <button class="btn btn-white">Subscribe →</button>
    </div>
    <p class="nl-note">No spam. Unsubscribe anytime.</p>
    <p class="nl-success">✓ You're subscribed. See you in your inbox.</p>
  </div>

  
</div><!-- /page-positive -->


<!-- ══════════════════════════════════════════
     PAGE 4 — DAILY INSPIRATION
══════════════════════════════════════════ -->
<div id="page-daily" class="page">
  <div class="daily-hero">
    <div class="wrap" style="text-align:center">
      <div class="label" style="color:var(--soft-gold);margin-bottom:14px">Fresh Every Morning</div>
      <h1 class="display" style="font-size:clamp(2rem,5vw,3.8rem);margin-bottom:16px;color:white">Daily Inspiration</h1>
      <p style="opacity:.75;font-weight:300;max-width:500px;margin:0 auto;line-height:1.75;color:white">One quote, one affirmation, one story. Delivered daily to carry with you into your day.</p>
    </div>
  </div>

  <!-- Featured daily quote -->
  <section class="section">
    <div class="wrap">
      <div class="section-head" style="text-align:center">
        <div class="amber-line" style="margin:0 auto 16px"></div>
        <div class="label">Today's Featured Quote</div>
      </div>
      <div class="featured-quote-card">
        <div class="fq-label">☀ Today's Thought</div>
        <p class="fq-text" id="fq-text">"The root of every action is a thought. Tend to your roots."</p>
        <div class="fq-author" id="fq-author">— Tapas Pattanaik</div>
        <div class="fq-actions">
          <span class="tag" id="fq-cat">Mindset</span>
          <button class="btn" style="margin-left:auto" onclick="nextQuote()">Next Quote →</button>
        </div>
      </div>
    </div>
  </section>

  <!-- Affirmations -->
  <section class="section bg-ivory2">
    <div class="wrap">
      <div class="section-head">
        <div class="amber-line"></div>
        <div class="label">Morning Affirmations</div>
        <h2 class="display">Start your day with<br><em style="color:var(--deep-teal)">these truths</em></h2>
        <p>Repeat these to yourself. Slowly. Deliberately. They work not because they are magic — but because repetition shapes belief.</p>
      </div>
      <div class="affirmations-grid">
        <div class="affirmation-card"><div class="af-num">01</div><p>I am capable of handling whatever today brings me.</p></div>
        <div class="affirmation-card"><div class="af-num">02</div><p>My thoughts are mine. I choose which ones I keep.</p></div>
        <div class="affirmation-card"><div class="af-num">03</div><p>I am not behind. I am exactly where I need to be.</p></div>
        <div class="affirmation-card"><div class="af-num">04</div><p>Every difficult moment is teaching me something I need.</p></div>
        <div class="affirmation-card"><div class="af-num">05</div><p>I bring calm into every room I enter.</p></div>
        <div class="affirmation-card"><div class="af-num">06</div><p>My presence has value. My voice deserves to be heard.</p></div>
      </div>
    </div>
  </section>

  <!-- Short Stories -->
  <section class="section">
    <div class="wrap">
      <div class="section-head">
        <div class="amber-line"></div>
        <div class="label">2-Minute Stories</div>
        <h2 class="display">Motivational Thoughts<br><em style="color:var(--deep-teal)">from real lives</em></h2>
      </div>
      <div class="stories-list">
        <div class="story-card">
          <h3>The Bamboo Tree</h3>
          <p>For four years, the bamboo tree shows nothing above the ground. Nothing. The farmer waters it, tends it, believes in it — and sees nothing. In the fifth year, the bamboo grows 80 feet in six weeks. Was it growing in those first four years? Absolutely. It was building roots deep enough to support what was coming. Your unseen effort is never wasted.</p>
          <div class="story-meta">2 min read · Habits & Growth</div>
        </div>
        <div class="story-card">
          <h3>The Two Wolves</h3>
          <p>A grandfather told his grandson: "Inside each of us, two wolves are always fighting. One is filled with anger, envy, greed, and fear. The other is filled with peace, love, hope, and kindness." The boy asked, "Which wolf wins?" The grandfather replied: "The one you feed." What are you feeding today?</p>
          <div class="story-meta">2 min read · Mindset</div>
        </div>
        <div class="story-card">
          <h3>The Cracked Pot</h3>
          <p>An old woman carried water each day with two pots — one perfect, one cracked. The cracked pot always arrived half-empty and apologised daily. One day the woman said: "Look at the beautiful flowers growing only on your side of the path. I knew about your crack, so I planted seeds there. Every day you've watered them." Your flaws are not failures. They are where something grows.</p>
          <div class="story-meta">2 min read · Self Confidence</div>
        </div>
      </div>
    </div>
  </section>

  <div class="newsletter-band">
    <h2 class="display">One thought. Every morning.</h2>
    <p>The daily quote, an affirmation, and a short story — delivered quietly to your inbox every day.</p>
    <div class="nl-form">
      <input type="email" placeholder="Your email address">
      <button class="btn btn-white">Get Daily Inspiration →</button>
    </div>
    <p class="nl-note">Free forever. Unsubscribe anytime.</p>
    <p class="nl-success">✓ You're in. Your first inspiration arrives tomorrow morning.</p>
  </div>

  
</div><!-- /page-daily -->


<!-- ══════════════════════════════════════════
     PAGE 5 — SPIRITUAL WISDOM
══════════════════════════════════════════ -->
<div id="page-spiritual" class="page">
  <div class="spiritual-hero">
    <div class="wrap">
      <div class="label" style="color:var(--soft-gold);margin-bottom:14px">Ancient Wisdom for Modern Life</div>
      <h1 class="display" style="color:white">Spiritual Wisdom</h1>
      <p>Teachings from the Bhagavad Gita, Hindu philosophy, Dharma, and the Puranas — reframed for the challenges of modern living.</p>
    </div>
  </div>

  <!-- Bhagavad Gita -->
  <section class="section">
    <div class="wrap">
      <div class="section-head">
        <div class="amber-line"></div>
        <div class="label">Bhagavad Gita Wisdom</div>
        <h2 class="display">Timeless verses for<br><em style="color:var(--deep-teal)">today's struggles</em></h2>
      </div>
      <div class="grid-3">
        <div class="gita-card">
          <div class="verse-ref">Chapter 2, Verse 47</div>
          <p class="verse-text">"You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions."</p>
          <p class="verse-meaning">Do your work with full heart and zero attachment to the outcome. The effort is yours. The result belongs to the universe. This one verse eliminates anxiety at its root.</p>
        </div>
        <div class="gita-card">
          <div class="verse-ref">Chapter 6, Verse 5</div>
          <p class="verse-text">"Elevate yourself through the power of your mind, and do not degrade yourself, for the mind can be the friend and also the enemy of the self."</p>
          <p class="verse-meaning">Your mind is either your greatest ally or your harshest enemy. The choice of which it becomes is entirely yours. That is the most empowering truth in the Gita.</p>
        </div>
        <div class="gita-card">
          <div class="verse-ref">Chapter 3, Verse 27</div>
          <p class="verse-text">"All actions are performed by the qualities of nature. One who is deluded by ego thinks, 'I am the doer.'"</p>
          <p class="verse-meaning">Releasing the ego from every outcome creates a kind of freedom nothing else can. You can work harder when you stop needing the credit. This is the paradox that changes everything.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Philosophy tabs -->
  <section class="section bg-ivory2">
    <div class="wrap">
      <div class="section-head">
        <div class="amber-line"></div>
        <div class="label">Hindu Philosophy</div>
        <h2 class="display">Ancient paths to<br><em style="color:var(--deep-teal)">inner peace</em></h2>
      </div>
      <div class="philosophy-tabs">
        <span class="phil-tab active" data-phil="all">All</span>
        <span class="phil-tab" data-phil="dharma">Dharma</span>
        <span class="phil-tab" data-phil="karma">Karma</span>
        <span class="phil-tab" data-phil="meditation">Meditation</span>
        <span class="phil-tab" data-phil="puranas">Puranas</span>
      </div>
      <div class="spiritual-grid">
        <div class="spiritual-card" data-phil="dharma"><div class="s-icon">⚖️</div><h3>Dharma — Your Sacred Duty</h3><p>Dharma is not religion. It is your specific, personal duty — the role only you can play in this lifetime. Discovering it is the most important work you can do.</p></div>
        <div class="spiritual-card" data-phil="karma"><div class="s-icon">🔄</div><h3>Karma — Action &amp; Return</h3><p>Every thought is a seed. Every action is a plant. What you tend in the garden of your mind will eventually bloom — for better or worse. Karma begins with thought.</p></div>
        <div class="spiritual-card" data-phil="meditation"><div class="s-icon">🧘</div><h3>Dhyana — The Still Mind</h3><p>Meditation is not the absence of thought. It is the practice of watching thoughts without being carried away by them. Five minutes a day changes everything.</p></div>
        <div class="spiritual-card" data-phil="puranas"><div class="s-icon">📖</div><h3>Stories from the Puranas</h3><p>The ancient Puranas are not mythology — they are psychology wrapped in story. Each tale is a map of the human mind and heart, drawn thousands of years ago.</p></div>
        <div class="spiritual-card" data-phil="dharma"><div class="s-icon">🌸</div><h3>Ahimsa — Non-Violence of Mind</h3><p>Non-violence begins not in actions but in thoughts. The most violent thing most people do is the way they speak to themselves. Ahimsa starts there.</p></div>
        <div class="spiritual-card" data-phil="meditation"><div class="s-icon">🕯️</div><h3>Santosha — Contentment</h3><p>Contentment is not settling. It is the radical act of being fully present with what is, while still moving toward what can be. The rarest and richest state.</p></div>
      </div>
    </div>
  </section>

  <!-- Meditation section -->
  <section class="section bg-teal" style="padding:90px 0">
    <div class="wrap" style="text-align:center">
      <div class="amber-line" style="margin:0 auto 16px"></div>
      <div class="label" style="color:var(--soft-gold)">Begin Right Now</div>
      <h2 class="display" style="font-size:clamp(1.8rem,3.5vw,2.8rem);margin:12px 0 20px;color:white">A Simple Meditation for<br><em>This Exact Moment</em></h2>
      <p style="color:white;opacity:.8;max-width:520px;margin:0 auto 36px;font-weight:300;line-height:1.75">You do not need an app. You do not need a mat. You need thirty seconds and the willingness to simply be still.</p>
      <div style="background:rgba(255,255,255,0.08);border-radius:20px;padding:36px;max-width:600px;margin:0 auto;text-align:left;border:1px solid rgba(168,216,208,0.2)">
        <div style="display:flex;flex-direction:column;gap:16px">
          <div style="display:flex;gap:16px;align-items:flex-start;color:white">
            <span style="font-size:1.4rem;min-width:36px">1️⃣</span>
            <p style="font-size:.95rem;opacity:.88;line-height:1.7"><strong>Breathe in for 4 counts.</strong> Feel the air enter. Notice it is real. You are real. This moment is real.</p>
          </div>
          <div style="display:flex;gap:16px;align-items:flex-start;color:white">
            <span style="font-size:1.4rem;min-width:36px">2️⃣</span>
            <p style="font-size:.95rem;opacity:.88;line-height:1.7"><strong>Hold for 4 counts.</strong> Everything you were worried about still exists. But right now, in this breath, it does not have you.</p>
          </div>
          <div style="display:flex;gap:16px;align-items:flex-start;color:white">
            <span style="font-size:1.4rem;min-width:36px">3️⃣</span>
            <p style="font-size:.95rem;opacity:.88;line-height:1.7"><strong>Exhale for 4 counts.</strong> Release. Not the situation — just your grip on it for this one moment. That is enough. That is everything.</p>
          </div>
        </div>
        <p style="color:var(--soft-gold);font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1rem;margin-top:24px;opacity:.9">"Repeat three times. You have just meditated. Welcome."</p>
      </div>
    </div>
  </section>

  
</div><!-- /page-spiritual -->


<!-- ══════════════════════════════════════════
     PAGE 6 — VIDEOS
══════════════════════════════════════════ -->
<div id="page-videos" class="page">
  <div class="page-hero">
    <div class="wrap">
      <div class="label">Watch &amp; Listen</div>
      <h1 class="display">Videos &amp; YouTube</h1>
      <p>Some things are better said out loud. Real conversations about mindset, career, spirituality, and the small shifts that change everything.</p>
    </div>
  </div>

  <!-- Channel CTA -->
  <section class="section bg-dark" style="padding:72px 0;text-align:center">
    <div class="wrap">
      <div class="label" style="color:var(--soft-gold);margin-bottom:14px">Our YouTube Channel</div>
      <h2 class="display" style="color:white;font-size:clamp(1.8rem,3.5vw,2.8rem);margin-bottom:16px">Subscribe for weekly conversations<br><em style="color:var(--tranquil)">that go deeper than most</em></h2>
      <p style="color:white;opacity:.7;max-width:480px;margin:0 auto 32px;font-weight:300;line-height:1.7">Not a performance. Not a production. A real conversation — between Tapas and you, and everyone in this community who has something genuine to say.</p>
      <a href="https://youtube.com/@letsthinkpositive" target="_blank" class="btn">Subscribe on YouTube →</a>
    </div>
  </section>

  <!-- Latest videos -->
  <section class="section">
    <div class="wrap">
      <div class="section-head">
        <div class="amber-line"></div>
        <div class="label">Latest Videos</div>
        <h2 class="display">Conversations worth<br><em style="color:var(--deep-teal)">watching</em></h2>
      </div>
      <div class="video-grid">
        <div class="video-card">
          <div class="video-thumb"><div class="play-btn">▶</div></div>
          <div class="video-card-body">
            <div class="video-cat">Mindset</div>
            <h3>How One Thought Can Change the Direction of a Day</h3>
            <p>The practical science and spiritual truth behind why your first conscious thought of the morning matters so much.</p>
          </div>
        </div>
        <div class="video-card">
          <div class="video-thumb" style="background:linear-gradient(135deg,#0D3333,#1A6B6B)"><div class="play-btn">▶</div></div>
          <div class="video-card-body">
            <div class="video-cat">Spiritual Wisdom</div>
            <h3>Bhagavad Gita Chapter 2 — What It Actually Means for Your Career</h3>
            <p>Karma yoga isn't philosophy. It is the most practical management advice ever written, 5,000 years ago.</p>
          </div>
        </div>
        <div class="video-card">
          <div class="video-thumb" style="background:linear-gradient(135deg,#1A3A1A,#2D6B2D)"><div class="play-btn">▶</div></div>
          <div class="video-card-body">
            <div class="video-cat">Life Coaching</div>
            <h3>The 3 Habits I Built That Compounded Into a Different Life</h3>
            <p>Small, consistent, deliberate. The framework that actually works — and why motivation is completely overrated.</p>
          </div>
        </div>
        <div class="video-card">
          <div class="video-thumb" style="background:linear-gradient(135deg,#3A1A0D,#6B3A1A)"><div class="play-btn">▶</div></div>
          <div class="video-card-body">
            <div class="video-cat">Student Life</div>
            <h3>To the Student Who Feels Already Behind Everyone Else</h3>
            <p>A direct, warm message for anyone comparing their chapter 1 to someone else's chapter 20.</p>
          </div>
        </div>
        <div class="video-card">
          <div class="video-thumb" style="background:linear-gradient(135deg,#1A1A3A,#2D2D6B)"><div class="play-btn">▶</div></div>
          <div class="video-card-body">
            <div class="video-cat">Daily Thought</div>
            <h3>60 Seconds: Tend to Your Roots</h3>
            <p>A one-minute reflection on today's quote. Short enough to watch between meetings. Powerful enough to stay with you all day.</p>
          </div>
        </div>
        <div class="video-card">
          <div class="video-thumb" style="background:linear-gradient(135deg,#2B1A0D,#6B4A1A)"><div class="play-btn">▶</div></div>
          <div class="video-card-body">
            <div class="video-cat">Career</div>
            <h3>Why Your Mindset at Work Is Your Most Important Qualification</h3>
            <p>After 20+ years in IT, here is the one thing that separated the people who thrived from those who merely survived.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  
</div><!-- /page-videos -->


<!-- ══════════════════════════════════════════
     PAGE 7 — RESOURCES
══════════════════════════════════════════ -->
<div id="page-resources" class="page">
  <div class="page-hero">
    <div class="wrap">
      <div class="label">Curated Carefully</div>
      <h1 class="display">Resources</h1>
      <p>Books, guides, trackers, and courses that Tapas has personally found valuable. Nothing recommended that hasn't been lived with.</p>
    </div>
  </div>

  <section class="section">
    <div class="wrap">
      <div class="resource-category">
        <div class="amber-line"></div>
        <div class="label">Reading List</div>
        <h2 style="font-size:1.6rem;margin:10px 0 24px;color:var(--deep-teal)" class="display">Books on Positive Thinking</h2>
        <div class="resources-grid">
          <div class="resource-card"><div class="resource-icon">📚</div><div class="resource-info"><div class="resource-type">Book</div><h3>Man's Search for Meaning</h3><p>Viktor Frankl. The foundational text on finding meaning in suffering. If one book were required reading for all of humanity, this would be it.</p></div></div>
          <div class="resource-card"><div class="resource-icon">📖</div><div class="resource-info"><div class="resource-type">Book</div><h3>The Power of Now</h3><p>Eckhart Tolle. How to escape the prison of the thinking mind and return to the present moment where life actually happens.</p></div></div>
          <div class="resource-card"><div class="resource-icon">📕</div><div class="resource-info"><div class="resource-type">Book</div><h3>Atomic Habits</h3><p>James Clear. The science of small changes. The most practical book on building the daily habits that compound into an extraordinary life.</p></div></div>
          <div class="resource-card"><div class="resource-icon">📗</div><div class="resource-info"><div class="resource-type">Book</div><h3>The Bhagavad Gita (Eknath Easwaran)</h3><p>The clearest, most accessible translation for a modern reader. Ancient wisdom that feels like it was written last week.</p></div></div>
          <div class="resource-card"><div class="resource-icon">📘</div><div class="resource-info"><div class="resource-type">Book</div><h3>Mindset — Carol Dweck</h3><p>The research behind growth vs. fixed mindset. Reading this changes how you interpret every failure and every success.</p></div></div>
          <div class="resource-card"><div class="resource-icon">📙</div><div class="resource-info"><div class="resource-type">Book</div><h3>Think and Grow Rich</h3><p>Napoleon Hill. Dated in places, timeless in its core principle: the thought precedes the thing. Every time. Without exception.</p></div></div>
        </div>
      </div>

      <div class="resource-category">
        <div class="amber-line"></div>
        <div class="label">Practice Tools</div>
        <h2 style="font-size:1.6rem;margin:10px 0 24px;color:var(--deep-teal)" class="display">Meditation &amp; Inner Work Guides</h2>
        <div class="resources-grid">
          <div class="resource-card"><div class="resource-icon">🧘</div><div class="resource-info"><div class="resource-type">Free Guide</div><h3>The 5-Minute Morning Practice</h3><p>Our own guide to starting every morning with intention. Three questions, one breath, and one chosen thought for the day.</p></div></div>
          <div class="resource-card"><div class="resource-icon">🎧</div><div class="resource-info"><div class="resource-type">App</div><h3>Insight Timer (Free)</h3><p>The world's largest library of free guided meditations. Over 100,000 sessions. No subscription required for the core library.</p></div></div>
          <div class="resource-card"><div class="resource-icon">✍️</div><div class="resource-info"><div class="resource-type">Practice</div><h3>The Gratitude Journal Method</h3><p>Three things you're grateful for. Written by hand. Every morning. Simple, ancient, and more effective than almost anything else.</p></div></div>
        </div>
      </div>

      <div class="resource-category">
        <div class="amber-line"></div>
        <div class="label">Track Your Progress</div>
        <h2 style="font-size:1.6rem;margin:10px 0 24px;color:var(--deep-teal)" class="display">Habit Trackers</h2>
        <div class="resources-grid">
          <div class="resource-card"><div class="resource-icon">📊</div><div class="resource-info"><div class="resource-type">Free Download</div><h3>30-Day Positivity Tracker</h3><p>Track your daily positive thought, gratitude entry, and one act of kindness. See your month transform on paper.</p></div></div>
          <div class="resource-card"><div class="resource-icon">🗓️</div><div class="resource-info"><div class="resource-type">App</div><h3>Habitica (Free)</h3><p>Turns your habits into a game. Surprisingly effective for building the consistency that matters most. Especially good for students.</p></div></div>
          <div class="resource-card"><div class="resource-icon">✅</div><div class="resource-info"><div class="resource-type">Method</div><h3>The Don't Break the Chain Method</h3><p>Jerry Seinfeld's famous technique. A calendar, a red marker, and one rule: don't break the chain. Works for anything.</p></div></div>
        </div>
      </div>
    </div>
  </section>

  
</div><!-- /page-resources -->


<!-- ══════════════════════════════════════════
     PAGE 8 — COMMUNITY
══════════════════════════════════════════ -->
<div id="page-community" class="page">
  <div class="page-hero">
    <div class="wrap">
      <div class="label">You Belong Here</div>
      <h1 class="display">Our Community</h1>
      <p>Real people choosing hope, one thought at a time. Share your story, join the 30-day challenge, and become part of something that spreads through genuine human connection.</p>
    </div>
  </div>

  <!-- 30-Day Challenge -->
  <section class="section">
    <div class="wrap">
      <div class="challenge-banner">
        <div>
          <div class="label" style="color:rgba(255,255,255,0.8);margin-bottom:14px">Join Thousands Already Doing This</div>
          <h2 class="display">The 30-Day Positivity Challenge</h2>
          <p style="margin:16px 0 28px;opacity:.9;font-weight:300;line-height:1.75">One positive thought, written and shared, every single day for 30 days. No complex rules. No equipment. Just you, a thought, and the decision to keep going.</p>
          <button class="btn btn-white" data-page="contact">Join the Challenge →</button>
        </div>
        <div style="text-align:center;padding:0 20px">
          <div style="font-family:'DM Serif Display',serif;font-size:5rem;opacity:.8;line-height:1">30</div>
          <div style="font-size:.85rem;opacity:.8;font-weight:500">days of change</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Reader contributions -->
  <section class="section bg-ivory2">
    <div class="wrap">
      <div class="section-head">
        <div class="amber-line"></div>
        <div class="label">From Our Community</div>
        <h2 class="display">Reader Stories &amp;<br><em style="color:var(--deep-teal)">Contributions</em></h2>
        <p>Real people. Real turning points. Shared here because someone else needed to hear them.</p>
      </div>
      <div class="contributions-grid">
        <div class="contribution-card">
          <div class="contrib-avatar">A</div>
          <h3>The Morning I Decided to Stop Fighting Myself</h3>
          <p>I had been at war with my own mind for three years. Anxiety, self-doubt, the constant feeling of being behind. The turning point wasn't dramatic. It was just one morning where I chose a different thought.</p>
          <div class="contrib-meta">Ananya S. · Bangalore · Mindset</div>
        </div>
        <div class="contribution-card">
          <div class="contrib-avatar" style="background:linear-gradient(135deg,var(--warm-amber),var(--soft-gold))">R</div>
          <h3>How Bhagavad Gita Verse 2.47 Saved My Career</h3>
          <p>I was obsessed with the outcome of every project, every review, every promotion decision. Then I read about karma yoga. And I finally understood what it meant to just do the work.</p>
          <div class="contrib-meta">Rajesh M. · Mumbai · Career &amp; Spiritual</div>
        </div>
        <div class="contribution-card">
          <div class="contrib-avatar" style="background:linear-gradient(135deg,#6B2D6B,#9B2D9B)">P</div>
          <h3>A Letter to My 19-Year-Old Self</h3>
          <p>You are not behind. You are not failing. You are not too quiet or too loud or too much or not enough. You are exactly who you need to be, right now, learning exactly what you need to learn.</p>
          <div class="contrib-meta">Priya K. · Delhi · Student Life</div>
        </div>
        <div class="contribution-card">
          <div class="contrib-avatar" style="background:linear-gradient(135deg,#2D6B4A,#2D9B6B)">V</div>
          <h3>The Habit That Changed My Mornings</h3>
          <p>Three minutes. Every morning, before I check my phone. I write one thing I'm grateful for, one thing I'm choosing to think positively about, and one small action I will take today. That's the whole practice.</p>
          <div class="contrib-meta">Vikram T. · Chennai · Habits</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Submit story -->
  <section class="section">
    <div class="wrap">
      <div class="submit-story">
        <div style="font-size:2.5rem;margin-bottom:16px">📝</div>
        <h3>Your Story Deserves to Be Heard</h3>
        <p>Have you been through something that changed the way you think? Have you discovered a habit, a mindset shift, or a small practice that quietly made a big difference?<br>Write it down. Send it to us. If it is genuine and comes from the heart — it has a home here.</p>
        <button class="btn" data-page="contact">Share Your Story →</button>
        <p style="font-size:.78rem;opacity:.5;margin-top:16px">Posts should be 400–1200 words · Written in English · From personal experience · No promotional content</p>
      </div>
    </div>
  </section>

  
</div><!-- /page-community -->


<!-- ══════════════════════════════════════════
     PAGE 9 — BLOG
══════════════════════════════════════════ -->
<div id="page-blog" class="page">
  <div class="page-hero">
    <div class="wrap">
      <div class="label">Real Words from Real Lives</div>
      <h1 class="display">The Blog</h1>
      <p>Every post here comes from a real human being who has something genuine to say. Stories, insights, and ideas to shift your thinking.</p>
    </div>
  </div>

  <section class="section">
    <div class="wrap">
      <div class="blog-layout">
        <div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:36px">
            <span class="tag active">All</span>
            <span class="tag">Mindset</span>
            <span class="tag">Career</span>
            <span class="tag">Wellness</span>
            <span class="tag">Student Life</span>
            <span class="tag">Spiritual</span>
            <span class="tag">Habits</span>
          </div>
          <div class="blog-list">
            <div class="blog-post-card">
              <div class="blog-post-img">🦸</div>
              <div class="blog-post-body">
                <div class="post-cat">Mindset</div>
                <h3>The Day I Stopped Looking for Superman (And Found Something Better)</h3>
                <p>As a kid, I wanted to be saved by a superhero. As an adult, I realised the world doesn't need more heroes — it needs more people who will just sit down, shut up, and listen.</p>
                <div class="post-meta">Tapas Pattanaik · 7 min read</div>
              </div>
            </div>
            <div class="blog-post-card">
              <div class="blog-post-img">🙈</div>
              <div class="blog-post-body">
                <div class="post-cat">Mindset</div>
                <h3>What Gandhi's 3 Monkeys Taught Me About Living in a World Full of Noise</h3>
                <p>I grew up with those three monkeys on the wall. See no evil. Hear no evil. Speak no evil. I used to think it was simple. Then life happened.</p>
                <div class="post-meta">Tapas Pattanaik · 6 min read</div>
              </div>
            </div>
            <div class="blog-post-card">
              <div class="blog-post-img">💭</div>
              <div class="blog-post-body">
                <div class="post-cat">Career</div>
                <h3>They Can Take Your Job, Your Money, Even Your Health. But Not This.</h3>
                <p>I've watched people lose almost everything — and rebuild. The difference was never the circumstances. It was always the thinking.</p>
                <div class="post-meta">Tapas Pattanaik · 8 min read</div>
              </div>
            </div>
            <div class="blog-post-card">
              <div class="blog-post-img">🎓</div>
              <div class="blog-post-body">
                <div class="post-cat">Student Life</div>
                <h3>You Are Not Behind. You Are Exactly Where You Need to Be.</h3>
                <p>Somewhere right now, a student is comparing their chapter 1 to someone else's chapter 20. This post is for them.</p>
                <div class="post-meta">Tapas Pattanaik · 5 min read</div>
              </div>
            </div>
            <div class="blog-post-card">
              <div class="blog-post-img">🌅</div>
              <div class="blog-post-body">
                <div class="post-cat">Habits</div>
                <h3>I Changed One Thing Every Morning. Six Months Later, Everything Was Different.</h3>
                <p>I'm not going to tell you to wake up at 5am or take cold showers. I'm going to tell you about the three minutes that quietly rewired how I face every day.</p>
                <div class="post-meta">Tapas Pattanaik · 6 min read</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <aside class="blog-sidebar">
          <div class="sidebar-widget">
            <h3>Today's Quote</h3>
            <p class="sidebar-quote">"The root of every action is a thought. Tend to your roots."</p>
            <div class="sidebar-author">— Tapas Pattanaik</div>
          </div>
          <div class="sidebar-widget">
            <h3>Browse by Topic</h3>
            <div class="sidebar-tags">
              <span class="tag">Mindset</span>
              <span class="tag">Career</span>
              <span class="tag">Wellness</span>
              <span class="tag">Students</span>
              <span class="tag">Habits</span>
              <span class="tag">Gratitude</span>
              <span class="tag">Spiritual</span>
              <span class="tag">Leadership</span>
            </div>
          </div>
          <div class="sidebar-widget">
            <h3>Subscribe</h3>
            <p style="font-size:.82rem;opacity:.65;margin-bottom:14px;line-height:1.6">New posts delivered quietly to your inbox. No spam.</p>
            <div style="display:flex;flex-direction:column;gap:8px">
              <input type="email" placeholder="Your email" style="padding:10px 14px;border:1.5px solid var(--tranquil);border-radius:50px;font-family:'DM Sans',sans-serif;font-size:.85rem;outline:none;color:var(--grounded-dark);background:var(--ivory)">
              <button class="btn" style="width:100%;justify-content:center">Subscribe</button>
            </div>
          </div>
          <div class="sidebar-widget">
            <h3>Submit a Post</h3>
            <p style="font-size:.82rem;opacity:.65;margin-bottom:14px;line-height:1.6">Have something genuine to share? Our team reviews every submission.</p>
            <button class="btn btn-outline" style="width:100%;justify-content:center" data-page="contact">Submit Your Story →</button>
          </div>
        </aside>
      </div>
    </div>
  </section>

  
</div><!-- /page-blog -->


<!-- ══════════════════════════════════════════
     PAGE 10 — CONTACT
══════════════════════════════════════════ -->
<div id="page-contact" class="page">
  <div class="page-hero">
    <div class="wrap">
      <div class="label">We'd Love to Hear From You</div>
      <h1 class="display">Get in Touch</h1>
      <p>Whether you have a question, a story to share, an idea, or you simply want to say hello — there is a real person on the other side of this form.</p>
    </div>
  </div>

  <section class="section">
    <div class="wrap">
      <div class="contact-layout">

        <div class="contact-form-card">
          <div class="amber-line"></div>
          <div class="label" style="margin-bottom:20px">Send Us a Message</div>
          <div id="contact-form-inner">
            <div class="form-group">
              <label>Your name</label>
              <input type="text" id="cf-name" placeholder="What should we call you?">
            </div>
            <div class="form-group">
              <label>Your email address</label>
              <input type="email" id="cf-email" placeholder="We'll reply here — promise">
            </div>
            <div class="form-group">
              <label>What's on your mind?</label>
              <select id="cf-subject">
                <option value="">Select a topic...</option>
                <option>A story I'd like to share</option>
                <option>Collaboration idea</option>
                <option>Question about content</option>
                <option>30-Day Challenge</option>
                <option>Just saying hello</option>
                <option>Something else</option>
              </select>
            </div>
            <div class="form-group">
              <label>Your message</label>
              <textarea id="cf-message" placeholder="Write freely — there's no wrong thing to say here"></textarea>
            </div>
            <button class="btn" id="contact-submit" style="width:100%;justify-content:center">Send it →</button>
          </div>
          <div id="contact-success" style="display:none;text-align:center;padding:32px 0">
            <div style="font-size:3rem;margin-bottom:16px">🙏</div>
            <h3 style="font-family:'DM Serif Display',serif;font-size:1.4rem;margin-bottom:10px;color:var(--deep-teal)">Thank you. We're genuinely glad you reached out.</h3>
            <p style="font-size:.9rem;opacity:.7;line-height:1.7">Your message has found its way to us. We will read it carefully and get back to you within 24–48 hours.</p>
            <p style="font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1rem;color:var(--growth-teal);margin-top:20px">"You took one small step. That is how every great journey begins."</p>
          </div>
        </div>

        <div class="contact-info">
          <div class="amber-line"></div>
          <h2 class="display">Real people.<br><em style="color:var(--deep-teal)">Real responses.</em></h2>
          <p>We read every message. We respond to every one. It might take us 24–48 hours depending on the day, but we will get back to you — personally, warmly, without a templated auto-response.</p>
          <div class="contact-methods">
            <div class="contact-method">
              <div class="cm-icon">📧</div>
              <div><div class="cm-label">Email</div><div class="cm-value">connect@letsthinkpositive.com</div></div>
            </div>
            <div class="contact-method">
              <div class="cm-icon">▶</div>
              <div><div class="cm-label">YouTube</div><div class="cm-value">youtube.com/@letsthinkpositive</div></div>
            </div>
            <div class="contact-method">
              <div class="cm-icon">📷</div>
              <div><div class="cm-label">Instagram</div><div class="cm-value">@letsthinkpositive</div></div>
            </div>
            <div class="contact-method">
              <div class="cm-icon">💼</div>
              <div><div class="cm-label">LinkedIn</div><div class="cm-value">Tapas Pattanaik</div></div>
            </div>
          </div>
          <div class="social-row" style="margin-top:24px">
            <a href="https://youtube.com/@letsthinkpositive" target="_blank" class="social-btn">▶ YouTube</a>
            <a href="https://instagram.com/letsthinkpositive" target="_blank" class="social-btn">📷 Instagram</a>
            <a href="https://linkedin.com/in/tapaspattanaik" target="_blank" class="social-btn">💼 LinkedIn</a>
          </div>
          <div style="margin-top:32px;padding:20px 24px;background:var(--ivory-2);border-radius:14px;border:1px solid rgba(168,216,208,0.3)">
            <div class="label" style="margin-bottom:8px">Response Times</div>
            <p style="font-size:.85rem;line-height:1.7;opacity:.7">General messages: within 24–48 hours<br>Blog submissions: up to 5 working days for editorial review<br>Collaboration requests: 3–5 working days</p>
          </div>
        </div>

      </div>
    </div>
  </section>

  
</div><!-- /page-contact -->
</div>

<?php
get_footer();
?>


