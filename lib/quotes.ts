export interface Quote {
  text: string
  author: string
  category: string
}

export const QUOTES: Quote[] = [
  { text: 'The root of every action is a thought. Tend to your roots.',                             author: '— Tapas Pattanaik', category: 'Mindset'     },
  { text: "You don't need a cape to change the world. You just need to change one thought.",        author: '— Tapas Pattanaik', category: 'Inspiration' },
  { text: "A SuperbMan doesn't save the world. A SuperbMan listens — and that's often enough.",     author: '— Tapas Pattanaik', category: 'Connection'  },
  { text: 'Control your inner world, and the outer world changes with you.',                        author: '— Tapas Pattanaik', category: 'Mindset'     },
  { text: 'Positivity practised together is the most contagious force on earth.',                   author: '— Tapas Pattanaik', category: 'Community'   },
  { text: 'The hard days are not the end. They are the training ground.',                           author: '— Tapas Pattanaik', category: 'Resilience'  },
  { text: 'Every small positive thought is the beginning of something much bigger.',                author: '— Tapas Pattanaik', category: 'Growth'      },
  { text: 'Be the change you wish to see in the world.',                                            author: '— Mahatma Gandhi',  category: 'Wisdom'      },
  { text: "It always seems impossible until it's done.",                                            author: '— Nelson Mandela',  category: 'Courage'     },
  { text: 'Happiness is not something ready-made. It comes from your own actions.',                 author: '— Dalai Lama',      category: 'Wellbeing'   },
  { text: 'In the middle of difficulty lies opportunity.',                                          author: '— Albert Einstein', category: 'Resilience'  },
  { text: 'You are never too old to set another goal or to dream a new dream.',                     author: '— C.S. Lewis',      category: 'Inspiration' },
  { text: 'The secret of getting ahead is getting started.',                                        author: '— Mark Twain',      category: 'Habits'      },
  { text: 'First, think. Then dream. Then dare. Then do.',                                          author: '— Walt Disney',     category: 'Growth'      },
  { text: 'Peace comes from within. Do not seek it without.',                                       author: '— Buddha',          category: 'Spirituality'},
  { text: 'The mind is everything. What you think, you become.',                                    author: '— Buddha',          category: 'Mindset'     },
  { text: 'Yesterday is history, tomorrow is a mystery, today is a gift.',                          author: '— Eleanor Roosevelt',category: 'Mindfulness'},
  { text: 'You have power over your mind — not outside events. Realise this, and you will find strength.', author: '— Marcus Aurelius', category: 'Stoicism' },
  { text: 'The wound is the place where the Light enters you.',                                     author: '— Rumi',            category: 'Spirituality'},
  { text: 'Do not be embarrassed by your failures, learn from them and start again.',               author: '— Richard Branson', category: 'Resilience'  },
]

export function getDailyQuoteIndex(): number {
  return Math.floor(Date.now() / 86400000) % QUOTES.length
}
