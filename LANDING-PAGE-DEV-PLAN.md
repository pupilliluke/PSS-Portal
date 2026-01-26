# Landing Page Development Plan

A comprehensive guide to building a modern, conversion-focused landing page using React, Vite, Tailwind CSS, and TypeScript.

---

## Table of Contents

1. [Project Setup](#1-project-setup)
2. [Tech Stack](#2-tech-stack)
3. [Color Scheme & Branding](#3-color-scheme--branding)
4. [File Structure](#4-file-structure)
5. [Component Architecture](#5-component-architecture)
6. [Section Breakdown](#6-section-breakdown)
7. [Reusable Components](#7-reusable-components)
8. [Animations & Interactions](#8-animations--interactions)
9. [Responsive Design](#9-responsive-design)
10. [Performance Optimization](#10-performance-optimization)
11. [Implementation Checklist](#11-implementation-checklist)

---

## 1. Project Setup

### Initialize Project

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
```

### Install Dependencies

```bash
# Core dependencies
npm install react-router-dom lucide-react clsx tailwind-merge class-variance-authority

# Tailwind CSS v4
npm install tailwindcss @tailwindcss/postcss autoprefixer postcss
```

### Configuration Files

**vite.config.ts**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
  },
})
```

**postcss.config.js**
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

**tsconfig.json** (add paths)
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## 2. Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| Framework | React 19 | UI components |
| Build Tool | Vite 7 | Fast bundling & HMR |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS 4 | Utility-first CSS |
| Icons | Lucide React | Consistent icon set |
| Routing | React Router DOM | Navigation |
| Utilities | clsx, tailwind-merge | Class composition |

---

## 3. Color Scheme & Branding

### Define CSS Variables (index.css)

```css
@import "tailwindcss";
@config "../tailwind.config.js";

@layer base {
  :root {
    /* Primary Brand Colors */
    --color-mint: #ACFADF;        /* Light accent - highlights, badges */
    --color-basalt: #1E293B;      /* Dark primary - text, nav, footer */
    --color-eucalyptus: #065F46;  /* Deep green - CTAs, icons */
    --color-mist: #F1F5F9;        /* Light gray - backgrounds */
  }
}
```

### Tailwind Config (tailwind.config.js)

```javascript
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        mint: "var(--color-mint)",
        basalt: "var(--color-basalt)",
        eucalyptus: "var(--color-eucalyptus)",
        mist: "var(--color-mist)",
      },
      fontFamily: {
        sans: ["Segoe UI", "-apple-system", "BlinkMacSystemFont", "Roboto", "sans-serif"],
      },
    },
  },
}
```

### Color Usage Guide

| Color | Hex | Usage |
|-------|-----|-------|
| Mint | `#ACFADF` | Badges, highlights, accent backgrounds, hover states |
| Basalt | `#1E293B` | Primary text, navigation, footer, primary buttons |
| Eucalyptus | `#065F46` | Icons, secondary buttons, links, gradient accents |
| Mist | `#F1F5F9` | Section backgrounds, card backgrounds |

---

## 4. File Structure

```
frontend/
├── public/
│   └── brand/
│       ├── icon.png          # Logo icon (40x40)
│       ├── Cloud.png         # Decorative assets
│       └── Cloud-with-fingerprint.png
├── src/
│   ├── components/
│   │   └── ui/
│   │       └── button.tsx    # Reusable button component
│   ├── pages/
│   │   └── LandingPage.tsx   # Main landing page
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

---

## 5. Component Architecture

### Page Structure

```
LandingPage
├── Navigation (sticky)
├── Hero Section
│   ├── Badge
│   ├── Headline + Subheadline
│   ├── CTA Buttons
│   ├── Social Proof (avatars + rating)
│   └── Dashboard Preview (visual)
├── Logo Cloud
├── Stats Section
│   └── StatCard (x4)
├── Features Section
│   └── FeatureCard (x6)
├── How It Works Section
│   └── Step Cards (x3)
├── Testimonials Section
│   └── TestimonialCard (x3)
├── Pricing Section
│   └── PricingCard (x3)
├── CTA Section (final)
└── Footer
```

---

## 6. Section Breakdown

### 6.1 Navigation

**Requirements:**
- Fixed position with transparent → solid background on scroll
- Logo + company name on left
- Navigation links (anchor links to sections)
- Sign In + Get Started buttons on right

**Key Features:**
- `useEffect` with scroll listener to toggle `isScrolled` state
- Conditional classes: `bg-transparent` → `bg-white/95 backdrop-blur-md shadow-sm`
- Hidden on mobile (md:flex for nav links)

```tsx
const [isScrolled, setIsScrolled] = useState(false)

useEffect(() => {
  const handleScroll = () => setIsScrolled(window.scrollY > 20)
  window.addEventListener('scroll', handleScroll)
  return () => window.removeEventListener('scroll', handleScroll)
}, [])
```

### 6.2 Hero Section

**Layout:** 2-column grid (text left, visual right)

**Left Column:**
- Trust badge (e.g., "Trusted by 10,000+ businesses")
- H1 headline with gradient text span
- Subheadline paragraph
- CTA buttons (primary + secondary with icon)
- Social proof (stacked avatars + star rating)

**Right Column:**
- Decorative blur circles (absolute positioned)
- Dashboard preview component (mock UI)

### 6.3 Logo Cloud

**Purpose:** Build trust with company logos

```tsx
<section className="py-12 bg-mist border-y border-gray-100">
  <p className="text-center text-sm text-gray-500 mb-8">
    Trusted by industry leaders worldwide
  </p>
  <div className="flex flex-wrap items-center justify-center gap-12 opacity-60">
    {['Company1', 'Company2', ...].map((company) => (
      <div key={company} className="text-xl font-bold text-basalt/50">
        {company}
      </div>
    ))}
  </div>
</section>
```

### 6.4 Stats Section

**Layout:** 4-column grid with animated counter cards

**Each StatCard displays:**
- Icon with colored background
- Animated number (counts up on scroll into view)
- Label
- Trend indicator (+X%)
- Mini bar chart

### 6.5 Features Section

**Layout:** 3-column grid

**Each FeatureCard displays:**
- Icon in colored container
- Title
- Description

### 6.6 How It Works

**Layout:** 3-column with step numbers and connecting arrows

**Each step:**
- Large step number (01, 02, 03) as background
- Icon
- Title
- Description
- Arrow pointing to next (except last)

### 6.7 Testimonials

**Layout:** 3-column grid

**Each TestimonialCard displays:**
- Star rating (filled/empty stars)
- Quote text
- Author info (avatar, name, role, company)

### 6.8 Pricing

**Layout:** 3-column with middle card highlighted

**Each PricingCard displays:**
- Plan name
- Price + period
- Description
- Feature list with checkmarks
- CTA button

**Highlighted card:**
- "Most Popular" badge
- Different background color
- Scale transform (scale-105)
- Ring highlight

### 6.9 Final CTA

**Design:** Dark background card with gradient blur accents

```tsx
<section className="py-20 px-6">
  <div className="max-w-4xl mx-auto">
    <div className="relative bg-basalt rounded-3xl p-12 text-center overflow-hidden">
      {/* Decorative blurs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-mint/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-eucalyptus/20 rounded-full blur-3xl" />

      <div className="relative z-10">
        <h2>Ready to Get Started?</h2>
        <p>Description text...</p>
        <div className="flex gap-4 justify-center">
          {/* CTA buttons */}
        </div>
      </div>
    </div>
  </div>
</section>
```

### 6.10 Footer

**Layout:** 4-column grid

**Columns:**
1. Logo + company description
2. Product links
3. Company links
4. Contact info (website, email, phone)

**Bottom bar:** Copyright + legal links

---

## 7. Reusable Components

### 7.1 Animated Counter Hook

```tsx
function useCounter(end: number, duration: number = 2000, startOnView: boolean = true) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(!startOnView)

  useEffect(() => {
    if (!hasStarted) return

    let startTime: number
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [end, duration, hasStarted])

  return { count, setHasStarted }
}
```

### 7.2 Mini Chart Component

```tsx
function MiniChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  return (
    <div className="flex items-end gap-0.5 h-8">
      {data.map((value, i) => (
        <div
          key={i}
          className="w-1.5 rounded-full transition-all duration-300"
          style={{
            height: `${((value - min) / range) * 100}%`,
            minHeight: '4px',
            backgroundColor: color,
            opacity: 0.3 + (i / data.length) * 0.7,
          }}
        />
      ))}
    </div>
  )
}
```

### 7.3 StatCard Component

```tsx
interface StatCardProps {
  icon: React.ElementType
  label: string
  value: number
  suffix?: string
  prefix?: string
  trend?: number
  trendLabel?: string
  chartData?: number[]
  color: string
}

function StatCard({ icon: Icon, label, value, suffix, prefix, trend, trendLabel, chartData, color }: StatCardProps) {
  const { count, setHasStarted } = useCounter(value)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setHasStarted(true)
      },
      { threshold: 0.1 }
    )
    const element = document.getElementById(`stat-${label.replace(/\s/g, '-')}`)
    if (element) observer.observe(element)
    return () => observer.disconnect()
  }, [label, setHasStarted])

  return (
    <div id={`stat-${label.replace(/\s/g, '-')}`} className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-mint/50 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        {chartData && <MiniChart data={chartData} color={color} />}
      </div>
      <div className="space-y-1">
        <div className="text-3xl font-bold text-basalt">
          {prefix}{count.toLocaleString()}{suffix}
        </div>
        <div className="text-sm text-gray-500">{label}</div>
        {trend !== undefined && (
          <div className="flex items-center gap-1 text-sm">
            <span className={trend >= 0 ? 'text-eucalyptus' : 'text-red-500'}>
              {trend >= 0 ? '+' : ''}{trend}%
            </span>
            <span className="text-gray-400">{trendLabel}</span>
          </div>
        )}
      </div>
    </div>
  )
}
```

### 7.4 FeatureCard Component

```tsx
function FeatureCard({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="group p-6 rounded-2xl bg-white border border-gray-100 hover:border-mint/50 hover:shadow-lg transition-all duration-300">
      <div className="w-12 h-12 rounded-xl bg-mint/20 flex items-center justify-center mb-4 group-hover:bg-mint/30 transition-colors">
        <Icon className="w-6 h-6 text-eucalyptus" />
      </div>
      <h3 className="text-lg font-semibold text-basalt mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </div>
  )
}
```

### 7.5 TestimonialCard Component

```tsx
function TestimonialCard({ quote, author, role, company, image, rating }: {
  quote: string
  author: string
  role: string
  company: string
  image: string  // Initials for avatar
  rating: number
}) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
        ))}
      </div>
      <p className="text-gray-600 mb-6 leading-relaxed">"{quote}"</p>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mint to-eucalyptus flex items-center justify-center text-white font-semibold">
          {image}
        </div>
        <div>
          <div className="font-semibold text-basalt">{author}</div>
          <div className="text-sm text-gray-500">{role} at {company}</div>
        </div>
      </div>
    </div>
  )
}
```

### 7.6 PricingCard Component

```tsx
function PricingCard({ name, price, description, features, highlighted, cta }: {
  name: string
  price: string
  description: string
  features: string[]
  highlighted?: boolean
  cta: string
}) {
  return (
    <div className={`rounded-2xl p-8 ${
      highlighted
        ? 'bg-basalt text-white ring-4 ring-mint/50 scale-105'
        : 'bg-white border border-gray-200'
    }`}>
      {highlighted && (
        <div className="inline-block px-3 py-1 bg-mint text-eucalyptus text-xs font-semibold rounded-full mb-4">
          Most Popular
        </div>
      )}
      <h3 className={`text-xl font-bold ${highlighted ? 'text-white' : 'text-basalt'}`}>{name}</h3>
      <div className="mt-4 mb-2">
        <span className={`text-4xl font-bold ${highlighted ? 'text-white' : 'text-basalt'}`}>{price}</span>
        <span className={highlighted ? 'text-gray-300' : 'text-gray-500'}>/month</span>
      </div>
      <p className={`text-sm mb-6 ${highlighted ? 'text-gray-300' : 'text-gray-500'}`}>{description}</p>
      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            <CheckCircle2 className={`w-5 h-5 ${highlighted ? 'text-mint' : 'text-eucalyptus'}`} />
            <span className={highlighted ? 'text-gray-200' : 'text-gray-600'}>{feature}</span>
          </li>
        ))}
      </ul>
      <button className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
        highlighted
          ? 'bg-mint text-eucalyptus hover:bg-mint/90'
          : 'bg-basalt text-white hover:bg-basalt/90'
      }`}>
        {cta}
      </button>
    </div>
  )
}
```

---

## 8. Animations & Interactions

### Scroll-Triggered Animations

Use IntersectionObserver to trigger animations when elements enter viewport:

```tsx
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in')
        }
      })
    },
    { threshold: 0.1 }
  )

  document.querySelectorAll('.animate-on-scroll').forEach((el) => {
    observer.observe(el)
  })

  return () => observer.disconnect()
}, [])
```

### Hover Effects

```css
/* Card hover */
.hover:shadow-lg
.hover:border-mint/50
.transition-all duration-300

/* Button hover with icon animation */
.group-hover:translate-x-1 transition-transform

/* Icon container hover */
.group-hover:bg-mint/30 transition-colors
```

### Tailwind Animation Config

```javascript
// tailwind.config.js
keyframes: {
  "fade-in": {
    "0%": { opacity: "0", transform: "translateY(-4px)" },
    "100%": { opacity: "1", transform: "translateY(0)" },
  },
},
animation: {
  "fade-in": "fade-in 0.15s ease-out",
},
```

---

## 9. Responsive Design

### Breakpoint Strategy

| Breakpoint | Width | Layout Changes |
|------------|-------|----------------|
| Mobile | < 768px | Single column, stacked sections |
| Tablet | 768px+ | 2-column grids |
| Desktop | 1024px+ | Full multi-column layouts |

### Common Patterns

```tsx
// Grid columns
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

// Hero two-column
<div className="grid lg:grid-cols-2 gap-12 items-center">

// Stats four-column
<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

// Hide on mobile
<div className="hidden md:flex">

// Font size responsive
<h1 className="text-4xl lg:text-6xl font-bold">
```

---

## 10. Performance Optimization

### Image Optimization

- Use WebP format for images
- Lazy load images below the fold
- Use appropriate sizes (40x40 for logos, etc.)

### Code Splitting

```tsx
// Lazy load non-critical pages
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))

// Wrap in Suspense
<Suspense fallback={<PageLoader />}>
  <DashboardPage />
</Suspense>
```

### CSS Optimization

- Tailwind purges unused CSS in production
- Use CSS variables for theme colors
- Minimize custom CSS

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 11. Implementation Checklist

### Phase 1: Setup
- [ ] Initialize Vite + React + TypeScript project
- [ ] Install dependencies (react-router-dom, lucide-react, tailwindcss)
- [ ] Configure Tailwind with custom colors
- [ ] Set up path aliases (@/)
- [ ] Add brand assets to public folder

### Phase 2: Core Components
- [ ] Create useCounter hook
- [ ] Create MiniChart component
- [ ] Create StatCard component
- [ ] Create FeatureCard component
- [ ] Create TestimonialCard component
- [ ] Create PricingCard component

### Phase 3: Landing Page Sections
- [ ] Navigation with scroll effect
- [ ] Hero section with dashboard preview
- [ ] Logo cloud
- [ ] Stats section
- [ ] Features section
- [ ] How it works section
- [ ] Testimonials section
- [ ] Pricing section
- [ ] Final CTA section
- [ ] Footer

### Phase 4: Polish
- [ ] Add hover animations
- [ ] Add scroll-triggered animations
- [ ] Test responsive breakpoints
- [ ] Optimize images
- [ ] Test reduced motion preference
- [ ] Cross-browser testing

### Phase 5: Content
- [ ] Replace placeholder text with real copy
- [ ] Add real testimonials
- [ ] Update pricing information
- [ ] Add real company logos (with permission)
- [ ] Update contact information

---

## Quick Start Template

Copy this to start a new landing page:

```tsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Star, Users, TrendingUp, Target, BarChart3 } from 'lucide-react'

export function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}>
        {/* Nav content */}
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        {/* Hero content */}
      </section>

      {/* Add remaining sections... */}
    </div>
  )
}
```

---

## Icons Used (Lucide React)

```tsx
import {
  TrendingUp,    // Stats, growth
  Users,         // Team, customers
  Target,        // Goals, precision
  BarChart3,     // Analytics
  CheckCircle2,  // Feature lists, success
  ArrowRight,    // CTAs
  Zap,           // Speed, power
  Shield,        // Security
  ChevronRight,  // Navigation
  Star,          // Ratings
  Play,          // Video CTAs
  Phone,         // Contact
  Mail,          // Contact
  Globe,         // Website
  ArrowUpRight,  // External links
  PieChart,      // Analytics
  Activity,      // Real-time
  LineChart,     // Trends
} from 'lucide-react'
```

---

*Document created for Personal Software Solutions landing page development. Adapt colors, content, and components as needed for each project.*
