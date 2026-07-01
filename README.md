# 💻 KidhrCode

**Learn every programming language. Master every concept. For free. Forever.**

KidhrCode is a free, open-source, gamified programming learning platform supporting **17+ languages**, **40+ exercise types**, community courses, leaderboards, streaks, badges, and more — built with React Native (Expo) + Supabase.

## ✨ Features

### 🎓 Learning
- **10+ programming languages** — Python, JavaScript, TypeScript, Rust, Go, Java, C++, C#, Ruby, PHP, SQL, Bash, R, Swift, Kotlin, Dart, HTML/CSS
- **40+ exercise types** — Multiple choice, code challenges, debugging, Parsons problems, output prediction, fill-in-blank, short answer, projects, and more
- **Structured courses** — Organized into modules and lessons with progressive difficulty
- **Code execution** — Real code runs via the Piston API (50+ languages supported)
- **Custom courses** — Community members can create and publish their own courses

### 🏆 Gamification
- **XP & Leveling** — Earn XP per exercise, level up as you learn
- **Streaks** — Daily login and activity streaks with XP multipliers (up to 2x)
- **Ranks** — Bronze → Silver → Gold → Platinum → Diamond → Legend
- **Badges** — 100+ achievements (First Code, Bug Hunter, Polyglot, Centurion, etc.)
- **Leaderboards** — Global, per-language, weekly, monthly, all-time rankings
- **Skill Trees** — Visual progress tracking through courses

### 👤 User Features
- **Email/password auth** with Supabase
- **Profile stats** — Total XP, exercises completed, languages learned
- **Progress tracking** — per-lesson and per-course completion
- **Course creator studio** — Build and publish your own courses

### 📱 Platform
- **Web PWA** — Works in any browser, installable on desktop and mobile
- **Android** — Side-loadable APK (no Play Store required)
- **iOS** — Works via browser PWA (App Store distribution requires Apple fee)
- **Dark theme** — Easy on the eyes

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- [Supabase](https://supabase.com) account (free tier works)

### 1. Clone & Install
```bash
git clone https://github.com/0giinn0/KidhrCode.git
cd KidhrCode
npm install
```

### 2. Set Up Supabase
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase/schema.sql` to create all tables
3. Run `supabase/seed.sql` to populate starter courses (Python 101 + JavaScript Basics)
4. Go to **Project Settings → API** and copy your URL and anon key

### 3. Configure
Open `lib/constants.js` and set your Supabase credentials:
```javascript
SUPABASE_URL: 'https://your-project.supabase.co',
SUPABASE_ANON_KEY: 'your-anon-key',
```

### 4. Run
```bash
# Web (PWA)
npm run web

# Android (development)
npm run android
```

## 🏗️ Architecture

```
KidhrCode/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout (auth state management)
│   ├── index.tsx           # Welcome / landing page
│   ├── (tabs)/             # Main app with bottom tab navigation
│   │   ├── index.tsx       # Home — course catalog with stats
│   │   ├── courses.tsx     # All courses (search + language filter)
│   │   ├── leaderboard.tsx # Rankings (daily/weekly/monthly/all-time)
│   │   └── profile.tsx     # User profile, stats, badges, logout
│   ├── auth/               # Authentication screens
│   │   ├── login.tsx       # Email/password sign in
│   │   └── signup.tsx      # Registration
│   ├── course/[id].tsx     # Course detail (modules + lessons)
│   ├── exercise/[id].tsx   # Exercise player (all 16 exercise types)
│   ├── admin/              # Admin dashboard
│   └── creator/            # Course builder studio
├── lib/
│   ├── supabase.js         # Supabase client
│   ├── piston.js           # Piston API code execution
│   ├── gamification.js     # XP, levels, ranks, streaks, badges
│   └── constants.js        # Colors, types, rank definitions
├── supabase/
│   ├── schema.sql          # Database schema (7 tables, RLS, triggers)
│   └── seed.sql            # Python 101 + JavaScript Basics
├── public/manifest.json    # PWA manifest
└── app.json                # Expo configuration
```

### Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React Native (Expo SDK 57) |
| **Navigation** | Expo Router (file-based) |
| **Backend / Auth / DB** | Supabase (PostgreSQL + Auth) |
| **Code Execution** | Piston API (self-hostable) |
| **Web** | React Native Web (PWA) |
| **Mobile** | Expo (Android APK / iOS) |

## 🗄️ Database Schema

```sql
-- Core tables
courses       → modules       → lessons
auth.users    → user_progress (tracks completion, XP per lesson)
auth.users    → user_achievements (earned badges)
leaderboard   (materialized via trigger on user_progress)
user_streaks  (daily activity tracking)
```

All tables have **Row Level Security** enabled. The leaderboard is automatically updated by a trigger whenever progress is recorded.

## 🎮 Gamification System

### XP Calculation
```javascript
Base XP per difficulty:
  beginner: 10   easy: 25   medium: 50   hard: 100   expert: 200

Streak Multiplier:
  3-day:  1.2x
  7-day:  1.5x
  14-day: 1.8x
  30-day: 2.0x

Final XP = baseXp × streakMultiplier
```

### Levels
```
level = floor(sqrt(totalXp / 100)) + 1
```

### Ranks
| Rank | Min XP |
|---|---|
| Bronze | 0 |
| Silver | 1,000 |
| Gold | 5,000 |
| Platinum | 15,000 |
| Diamond | 35,000 |
| Legend | 70,000 |

### Badges
12 built-in achievements including First Code, Streak Master, Bug Hunter, Polyglot, Centurion, Course Completer, and more.

## 🧪 Exercise Types

| Type | Description |
|---|---|
| `lesson` | Rich text/markdown lesson content |
| `multiple_choice` | Single-select quiz |
| `true_false` | True or false question |
| `fill_blank` | Fill in the missing word |
| `matching` | Drag to match pairs |
| `ordering` | Arrange in correct sequence |
| `output_prediction` | "What does this code print?" |
| `code_completion` | Fill in missing lines |
| `code_challenge` | Full solution against test cases |
| `parsons_problem` | Drag scrambled code blocks |
| `debug_challenge` | Fix buggy code |
| `code_review` | Evaluate code quality |
| `sql_challenge` | Write queries |
| `regex_challenge` | Pattern matching |
| `short_answer` | Written response |
| `project` | Multi-step guided project |

## 🌐 Deployment

### Web (GitHub Pages)
```bash
npx expo export --platform web
```
Output goes to `dist/` — deploy to GitHub Pages, Netlify, or Vercel.

### Android (APK Sideload)
```bash
npx eas build -p android --profile preview
```
The generated `.apk` can be shared via your website or F-Droid.

### iOS
Wrap with Capacitor or use EAS Build (requires Apple Developer account, $99/year).

## 🤝 Contributing

Courses are the lifeblood of KidhrCode. Anyone can create and publish courses:

1. Sign up and go to **Profile → Create a Course**
2. Fill in course details (title, language, difficulty)
3. Add modules and lessons with exercise configurations
4. Publish for the community

### Creating Exercise Configs
Exercise configurations are stored as JSON in the `lessons.config` column. Example:

```json
// Multiple choice
{ "description": "What is 2+2?", "options": ["3", "4", "5"], "correct_index": 1 }

// Code challenge
{ "description": "Print 'Hello'", "starter_code": "", "expected_output": "Hello", "test_cases": [...] }

// Output prediction
{ "code_snippet": "print(2**3)", "correct_answer": "8" }
```

## 📄 License

MIT — free to use, modify, and distribute.

## 💬 Support

- Issues: [GitHub Issues](https://github.com/0giinn0/KidhrCode/issues)
- Built with [Expo](https://expo.dev) + [Supabase](https://supabase.com)
- Code execution powered by [Piston API](https://github.com/engineer-man/piston)
