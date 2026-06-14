# 5-Email Welcome Sequence — LetsThinkPositive

> Goal: turn a signup into a *habit* in 14 days. The single metric that matters: did they log a mood or journal entry 3+ times in week 1? Users who do almost never churn.
>
> Infrastructure note: the app already sends a Day-0 welcome email via Nodemailer + Hostinger SMTP. This sequence extends it. Sending can be driven by a daily cron (server.js or Hostinger cron) checking `user.createdAt` offsets — same pattern as the weekly digest.
>
> Voice rules: warm, brief, zero guilt. Never "you haven't…" — always "whenever you're ready…". One CTA per email. Plain-text feel beats heavy HTML for deliverability and intimacy (keep the existing light template, single button).

---

## Sequence Overview

| # | Send | Trigger | Job of the email | CTA |
|---|---|---|---|---|
| 1 | Day 0, instant | signup | Make them feel they belong; one tiny first step | Log first mood |
| 2 | Day 1 | +24h | Show the fastest "wow" — 2-minute calm | Try breathing tool |
| 3 | Day 3 | +72h | Introduce the habit loop (streaks, challenges) | Start a challenge |
| 4 | Day 7 | +7d | Make it social — tribe & circles | Find your tribe |
| 5 | Day 14 | +14d | Reflect + ask for feedback (reply!) | Reply with one word |

Skip-logic (nice-to-have, not required for v1):
- If user already logged a mood before email 2 → swap CTA to journal
- If user already in a challenge before email 3 → swap to badge/streak explainer

---

## Email 1 — Welcome (Day 0, immediately after signup)

**Subject:** Welcome to your calm corner, {firstName} 🌿
**Preheader:** One tiny step today — that's all.

```
Hi {firstName},

Welcome to Lets Think Positive — where every thought begins with hope.

You now have a quiet corner of the internet that's entirely yours:
a place to track how you feel, breathe through hard moments,
collect small gratitudes, and build gentler days.

No ads. No paywalls. No pressure. Just you, at your pace.

If you do one thing today, make it this — it takes 10 seconds:

        [ Log your first mood → ]

That single tap starts your streak and teaches the app how
to support you. Tomorrow I'll show you my favourite 2-minute
trick for instant calm.

So glad you're here,
Tapas
Lets Think Positive

P.S. This is a real inbox. Hit reply anytime — I read everything.
```

**CTA link:** `/mood?utm_source=email&utm_campaign=welcome1`

---

## Email 2 — The 2-Minute Wow (Day 1)

**Subject:** The 2-minute reset I use every single day
**Preheader:** Inhale 4… hold 7… exhale 8.

```
Hi {firstName},

Quick one today.

When my thoughts start racing — before a difficult call,
or at 1am when sleep won't come — I use the 4-7-8 breath:

   Inhale for 4 seconds
   Hold for 7
   Exhale slowly for 8
   Repeat 4 times

That long exhale flips a literal switch in your nervous system
(the vagus nerve) from "alert" to "at ease". Two minutes, anywhere,
no one even knows you're doing it.

We built a guided version with gentle visuals and optional
rain sounds, so you don't have to count:

        [ Breathe with me — 2 minutes → ]

Save it for your next overwhelmed moment. It'll be there.

Breathing easier,
Tapas

P.S. Pair it with a calming soundscape — rain + distant
thunder is the community favourite.
```

**CTA link:** `/breathing?utm_source=email&utm_campaign=welcome2`

---

## Email 3 — The Habit Loop (Day 3)

**Subject:** Why 1 sentence a day beats 1 hour a week
**Preheader:** The gentle science of streaks.

```
Hi {firstName},

Here's the most useful thing I know about feeling better:

   Consistency beats intensity. Every time.

One gratitude sentence a day does more than an hour of
journaling once a month. Three mindful breaths daily beat
a yearly meditation retreat.

That's why everything here is built around tiny daily wins:

   🔥 Streaks — log anything today, your flame grows
   🏅 Badges — small milestones, genuinely earned
   🏆 Challenges — one tiny prompt a day, with a finish line

The easiest place to start is the 7-Day Mindfulness Challenge:
one two-minute practice each day, for one week. That's the
whole commitment.

        [ Start your 7-day challenge → ]

Day 1 takes two minutes. Future-you is already grateful.

One day at a time,
Tapas
```

**CTA link:** `/challenges?utm_source=email&utm_campaign=welcome3`

---

## Email 4 — Find Your People (Day 7)

**Subject:** Wellness is easier with witnesses 💛
**Preheader:** Meet your tribe (they're lovely).

```
Hi {firstName},

A week ago you joined Lets Think Positive. However your week
went — perfectly imperfect counts — I want to show you the
part most people discover last, and love most:

   The community.

🌿 Your Tribe — follow people whose journeys resonate;
   cheer each other's streaks
🔒 Circles — small private groups around shared goals
   (better sleep, gratitude, mindful parenting…)
🙏 The Gratitude Wall — a public stream of small good things;
   genuinely the happiest place on the internet
✍️ The Blog — real stories from members, and you can
   write your own

You don't have to post anything. Lurking is a love language.
But when you're ready, even one "me too" comment makes this
place warmer for everyone.

        [ See what the community is sharing → ]

Glad you're one of us,
Tapas
```

**CTA link:** `/community?utm_source=email&utm_campaign=welcome4`

---

## Email 5 — Reflect & Reply (Day 14)

**Subject:** Two weeks in — one tiny question
**Preheader:** Your answer shapes what we build next.

```
Hi {firstName},

Two weeks ago you joined us. I'd love to know — honestly:

   How's it going?

Reply with one word if that's all you've got. "Good", "meh",
"confused", "calmer" — all genuinely useful, all read by a
real human (me).

If you've been finding your rhythm: wonderful. Your profile
now shows your Personal Wellness Index — one gentle score
that connects your moods, sleep and habits:

        [ See your wellness snapshot → ]

If you haven't been back since signing up — no guilt, truly.
Life is a lot. The door's open whenever you need a calm
corner, and your account will be right here.

Either way, thank you for giving this a chance.

With gratitude,
Tapas
Lets Think Positive

P.S. If LTP has helped even a little, forwarding this to one
friend who needs a gentler internet would mean the world.
```

**CTA link:** `/profile?utm_source=email&utm_campaign=welcome5`

---

## Implementation Notes (for the dev task later)

1. **Schema:** add `welcomeEmailStage Int @default(0)` to `User` (0 = only welcome sent) — or a `SentEmail` log table if preferring idempotency by lookup
2. **Cron:** daily job (same mechanism as weekly digest) selects users where
   `createdAt` crosses the 1/3/7/14-day threshold AND stage < target → send + increment
3. **Unsubscribe:** sequence respects the existing email-preferences flag; add
   `emailWelcomeSeq Boolean @default(true)` if granular control is wanted
4. **Templates:** reuse the existing branded wrapper (logo header, teal button,
   footer with unsubscribe). Body stays plain and personal.
5. **From:** `Tapas at Lets Think Positive <hello@letsthinkpositive.com>` — person + brand beats brand alone for opens

## Success Metrics

| Email | Open target | Click target |
|---|---|---|
| 1 (Day 0) | 60–70% | 25%+ |
| 2 (Day 1) | 45–55% | 15%+ |
| 3 (Day 3) | 40–50% | 12%+ |
| 4 (Day 7) | 35–45% | 10%+ |
| 5 (Day 14) | 35–45% | 8%+ replies are the real metric |

North star: **% of new users with 3+ active days in week 1.** Measure before/after enabling the sequence.
