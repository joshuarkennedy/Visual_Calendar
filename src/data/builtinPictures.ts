import type { Picture } from '../types'

/**
 * A curated starter bank of picture-icons for common daily-life tasks.
 *
 * These use large emoji so they are colorful, instantly recognizable and
 * render crisply at any size — ideal before caregivers upload their own
 * personalized photos. Each has a suggested accessible color.
 */
interface Seed {
  id: string
  name: string
  emoji: string
  color: string
  category: string
}

const SEEDS: Seed[] = [
  // Hygiene
  { id: 'bi-brush-teeth', name: 'Brush teeth', emoji: '🦷', color: '#14b8a6', category: 'Hygiene' },
  { id: 'bi-shower', name: 'Take a shower', emoji: '🚿', color: '#3b82f6', category: 'Hygiene' },
  { id: 'bi-bath', name: 'Take a bath', emoji: '🛁', color: '#3b82f6', category: 'Hygiene' },
  { id: 'bi-wash-hands', name: 'Wash hands', emoji: '🧼', color: '#14b8a6', category: 'Hygiene' },
  { id: 'bi-toilet', name: 'Use the toilet', emoji: '🚽', color: '#6366f1', category: 'Hygiene' },
  { id: 'bi-hair', name: 'Brush hair', emoji: '💇', color: '#a855f7', category: 'Hygiene' },

  // Getting ready
  { id: 'bi-get-dressed', name: 'Get dressed', emoji: '👕', color: '#f97316', category: 'Getting ready' },
  { id: 'bi-pajamas', name: 'Put on pajamas', emoji: '🩳', color: '#6366f1', category: 'Getting ready' },
  { id: 'bi-shoes', name: 'Put on shoes', emoji: '👟', color: '#a16207', category: 'Getting ready' },
  { id: 'bi-coat', name: 'Put on coat', emoji: '🧥', color: '#a16207', category: 'Getting ready' },

  // Meals
  { id: 'bi-breakfast', name: 'Breakfast', emoji: '🥣', color: '#eab308', category: 'Meals' },
  { id: 'bi-lunch', name: 'Lunch', emoji: '🥪', color: '#f97316', category: 'Meals' },
  { id: 'bi-dinner', name: 'Dinner', emoji: '🍽️', color: '#ef4444', category: 'Meals' },
  { id: 'bi-snack', name: 'Snack', emoji: '🍎', color: '#22c55e', category: 'Meals' },
  { id: 'bi-drink', name: 'Drink water', emoji: '🥤', color: '#3b82f6', category: 'Meals' },

  // Health
  { id: 'bi-medication', name: 'Take medication', emoji: '💊', color: '#ef4444', category: 'Health' },
  { id: 'bi-doctor', name: 'Doctor visit', emoji: '🩺', color: '#ec4899', category: 'Health' },
  { id: 'bi-dentist', name: 'Dentist', emoji: '🪥', color: '#14b8a6', category: 'Health' },
  { id: 'bi-exercise', name: 'Exercise', emoji: '🤸', color: '#22c55e', category: 'Health' },
  { id: 'bi-rest', name: 'Rest', emoji: '🛋️', color: '#a855f7', category: 'Health' },

  // School & work
  { id: 'bi-school', name: 'Go to school', emoji: '🏫', color: '#3b82f6', category: 'School & work' },
  { id: 'bi-bus', name: 'Take the bus', emoji: '🚌', color: '#eab308', category: 'School & work' },
  { id: 'bi-homework', name: 'Homework', emoji: '📚', color: '#6366f1', category: 'School & work' },
  { id: 'bi-reading', name: 'Reading time', emoji: '📖', color: '#f97316', category: 'School & work' },
  { id: 'bi-work', name: 'Work', emoji: '💼', color: '#64748b', category: 'School & work' },

  // Home
  { id: 'bi-clean', name: 'Tidy up', emoji: '🧹', color: '#14b8a6', category: 'Home' },
  { id: 'bi-laundry', name: 'Laundry', emoji: '🧺', color: '#3b82f6', category: 'Home' },
  { id: 'bi-pet', name: 'Feed the pet', emoji: '🐶', color: '#a16207', category: 'Home' },
  { id: 'bi-shopping', name: 'Go shopping', emoji: '🛒', color: '#f97316', category: 'Home' },

  // Fun & social
  { id: 'bi-play', name: 'Play time', emoji: '🧸', color: '#ec4899', category: 'Fun & social' },
  { id: 'bi-outside', name: 'Go outside', emoji: '🌳', color: '#22c55e', category: 'Fun & social' },
  { id: 'bi-tv', name: 'Watch TV', emoji: '📺', color: '#6366f1', category: 'Fun & social' },
  { id: 'bi-music', name: 'Music', emoji: '🎵', color: '#a855f7', category: 'Fun & social' },
  { id: 'bi-family', name: 'Family visit', emoji: '👨‍👩‍👧', color: '#ec4899', category: 'Fun & social' },
  { id: 'bi-friends', name: 'See friends', emoji: '🧑‍🤝‍🧑', color: '#f97316', category: 'Fun & social' },
  { id: 'bi-park', name: 'Go to the park', emoji: '🛝', color: '#22c55e', category: 'Fun & social' },

  // Sleep & routine
  { id: 'bi-wake-up', name: 'Wake up', emoji: '☀️', color: '#eab308', category: 'Sleep & routine' },
  { id: 'bi-bedtime', name: 'Bedtime', emoji: '🛏️', color: '#6366f1', category: 'Sleep & routine' },
  { id: 'bi-nap', name: 'Nap time', emoji: '😴', color: '#a855f7', category: 'Sleep & routine' },
  { id: 'bi-nighttime', name: 'Night time', emoji: '🌙', color: '#1f2937', category: 'Sleep & routine' },
]

export const BUILTIN_PICTURES: Picture[] = SEEDS.map((s) => ({
  ...s,
  kind: 'emoji' as const,
  builtIn: true,
}))

export const BUILTIN_CATEGORIES = Array.from(
  new Set(BUILTIN_PICTURES.map((p) => p.category)),
)
