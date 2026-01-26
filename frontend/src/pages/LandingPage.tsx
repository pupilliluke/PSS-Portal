import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  Users,
  Target,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Zap,
  Shield,
  ChevronRight,
  Star,
  Play,
  Phone,
  Mail,
  Globe,
  ArrowUpRight,
  PieChart,
  Activity,
  LineChart,
} from 'lucide-react'

// Animated counter hook
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
      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }
    requestAnimationFrame(step)
  }, [end, duration, hasStarted])

  return { count, setHasStarted }
}

// Mini chart component for stats cards
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

// Stats card component
function StatCard({
  icon: Icon,
  label,
  value,
  suffix = '',
  prefix = '',
  trend,
  trendLabel,
  chartData,
  color,
}: {
  icon: React.ElementType
  label: string
  value: number
  suffix?: string
  prefix?: string
  trend?: number
  trendLabel?: string
  chartData?: number[]
  color: string
}) {
  const { count, setHasStarted } = useCounter(value)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasStarted(true)
        }
      },
      { threshold: 0.1 }
    )

    const element = document.getElementById(`stat-${label.replace(/\s/g, '-')}`)
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [label, setHasStarted])

  return (
    <div
      id={`stat-${label.replace(/\s/g, '-')}`}
      className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-mint/50 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        {chartData && <MiniChart data={chartData} color={color} />}
      </div>
      <div className="space-y-1">
        <div className="text-3xl font-bold text-basalt">
          {prefix}
          {count.toLocaleString()}
          {suffix}
        </div>
        <div className="text-sm text-gray-500">{label}</div>
        {trend !== undefined && (
          <div className="flex items-center gap-1 text-sm">
            <span className={trend >= 0 ? 'text-eucalyptus' : 'text-red-500'}>
              {trend >= 0 ? '+' : ''}
              {trend}%
            </span>
            <span className="text-gray-400">{trendLabel}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// Feature card component
function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}) {
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

// Testimonial card component
function TestimonialCard({
  quote,
  author,
  role,
  company,
  image,
  rating,
}: {
  quote: string
  author: string
  role: string
  company: string
  image: string
  rating: number
}) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
          />
        ))}
      </div>
      <p className="text-gray-600 mb-6 leading-relaxed">"{quote}"</p>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mint to-eucalyptus flex items-center justify-center text-white font-semibold">
          {image}
        </div>
        <div>
          <div className="font-semibold text-basalt">{author}</div>
          <div className="text-sm text-gray-500">
            {role} at {company}
          </div>
        </div>
      </div>
    </div>
  )
}

// CRM Dashboard Preview Component
function DashboardPreview() {
  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-basalt px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/brand/icon.png" alt="PSS Logo" className="w-8 h-8" />
          <span className="text-white font-semibold">PSS LeadFlow</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-6 bg-mist">
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Leads', value: '2,847', change: '+12.5%', icon: Users },
            { label: 'Conversion Rate', value: '34.2%', change: '+8.1%', icon: TrendingUp },
            { label: 'Revenue', value: '$142K', change: '+23.4%', icon: BarChart3 },
            { label: 'Active Deals', value: '156', change: '+5.2%', icon: Target },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="w-5 h-5 text-eucalyptus" />
                <span className="text-xs text-green-500 font-medium">{stat.change}</span>
              </div>
              <div className="text-xl font-bold text-basalt">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-3 gap-4">
          {/* Line Chart */}
          <div className="col-span-2 bg-white rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-basalt">Lead Generation</span>
              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-mint" />
                  Qualified
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-eucalyptus" />
                  Converted
                </span>
              </div>
            </div>
            <div className="h-32 flex items-end justify-between gap-2">
              {[65, 45, 80, 55, 90, 70, 95, 85, 100, 75, 88, 92].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col gap-1">
                  <div
                    className="bg-mint/60 rounded-t"
                    style={{ height: `${h * 0.8}%` }}
                  />
                  <div
                    className="bg-eucalyptus rounded-b"
                    style={{ height: `${h * 0.4}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <span className="font-semibold text-basalt">Lead Sources</span>
            <div className="flex items-center justify-center my-4">
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke="#ACFADF"
                    strokeWidth="3"
                    strokeDasharray="40 60"
                    strokeDashoffset="0"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke="#065F46"
                    strokeWidth="3"
                    strokeDasharray="30 70"
                    strokeDashoffset="-40"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke="#1E293B"
                    strokeWidth="3"
                    strokeDasharray="20 80"
                    strokeDashoffset="-70"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke="#94A3B8"
                    strokeWidth="3"
                    strokeDasharray="10 90"
                    strokeDashoffset="-90"
                  />
                </svg>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              {[
                { label: 'Organic', value: '40%', color: '#ACFADF' },
                { label: 'Referral', value: '30%', color: '#065F46' },
                { label: 'Paid Ads', value: '20%', color: '#1E293B' },
                { label: 'Social', value: '10%', color: '#94A3B8' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.label}
                  </span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Pricing card component
function PricingCard({
  name,
  price,
  description,
  features,
  highlighted,
  cta,
}: {
  name: string
  price: string
  description: string
  features: string[]
  highlighted?: boolean
  cta: string
}) {
  return (
    <div
      className={`rounded-2xl p-8 ${
        highlighted
          ? 'bg-basalt text-white ring-4 ring-mint/50 scale-105'
          : 'bg-white border border-gray-200'
      }`}
    >
      {highlighted && (
        <div className="inline-block px-3 py-1 bg-mint text-eucalyptus text-xs font-semibold rounded-full mb-4">
          Most Popular
        </div>
      )}
      <h3 className={`text-xl font-bold ${highlighted ? 'text-white' : 'text-basalt'}`}>{name}</h3>
      <div className="mt-4 mb-2">
        <span className={`text-4xl font-bold ${highlighted ? 'text-white' : 'text-basalt'}`}>
          {price}
        </span>
        <span className={highlighted ? 'text-gray-300' : 'text-gray-500'}>/month</span>
      </div>
      <p className={`text-sm mb-6 ${highlighted ? 'text-gray-300' : 'text-gray-500'}`}>
        {description}
      </p>
      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            <CheckCircle2
              className={`w-5 h-5 ${highlighted ? 'text-mint' : 'text-eucalyptus'}`}
            />
            <span className={highlighted ? 'text-gray-200' : 'text-gray-600'}>{feature}</span>
          </li>
        ))}
      </ul>
      <button
        className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
          highlighted
            ? 'bg-mint text-eucalyptus hover:bg-mint/90'
            : 'bg-basalt text-white hover:bg-basalt/90'
        }`}
      >
        {cta}
      </button>
    </div>
  )
}

export function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/brand/icon.png" alt="PSS Logo" className="w-10 h-10" />
              <span className="text-xl font-bold text-basalt">Personal Software Solutions</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-basalt/70 hover:text-basalt transition-colors">
                Features
              </a>
              <a href="#stats" className="text-basalt/70 hover:text-basalt transition-colors">
                Results
              </a>
              <a href="#pricing" className="text-basalt/70 hover:text-basalt transition-colors">
                Pricing
              </a>
              <a
                href="#testimonials"
                className="text-basalt/70 hover:text-basalt transition-colors"
              >
                Testimonials
              </a>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/login" className="text-basalt/70 hover:text-basalt transition-colors">
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-basalt text-white px-5 py-2.5 rounded-xl hover:bg-basalt/90 transition-colors font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-mint/30 rounded-full text-eucalyptus text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                <span>Trusted by 10,000+ businesses</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-basalt leading-tight mb-6">
                Turn Cold Prospects Into{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-eucalyptus to-mint">
                  Real Leads
                </span>
              </h1>

              <p className="text-xl text-gray-500 mb-8 leading-relaxed">
                We help businesses generate qualified leads that convert. Our proven system
                delivers real results, not just vanity metrics.
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-8">
                <button className="flex items-center gap-2 bg-basalt text-white px-8 py-4 rounded-xl hover:bg-basalt/90 transition-all font-semibold group">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-basalt/20 text-basalt hover:border-basalt/40 transition-colors font-semibold">
                  <Play className="w-5 h-5" />
                  Watch Demo
                </button>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex -space-x-3">
                  {['JD', 'MK', 'AS', 'RJ', 'KL'].map((initials, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-mint to-eucalyptus flex items-center justify-center text-white text-xs font-semibold"
                    >
                      {initials}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">Rated 4.9/5 from 2,000+ reviews</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-10 -right-10 w-72 h-72 bg-mint/30 rounded-full blur-3xl" />
              <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-eucalyptus/20 rounded-full blur-3xl" />
              {/* Decorative cloud image */}
              <img
                src="/brand/Cloud-with-fingerprint.png"
                alt=""
                className="absolute -top-16 -right-16 w-32 h-32 opacity-20 hidden lg:block"
              />
              <div className="relative">
                <DashboardPreview />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logo Cloud */}
      <section className="py-12 bg-mist border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm text-gray-500 mb-8">
            Trusted by industry leaders worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-60">
            {['Acme Corp', 'TechFlow', 'CloudSync', 'DataPro', 'ScaleUp', 'GrowthHQ'].map(
              (company, i) => (
                <div key={i} className="text-xl font-bold text-basalt/50">
                  {company}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-basalt mb-4">
              Results That Speak for Themselves
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Our clients see measurable improvements in lead quality and conversion rates within
              the first 30 days.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Users}
              label="Leads Generated"
              value={847523}
              trend={34}
              trendLabel="vs last year"
              chartData={[30, 45, 35, 50, 40, 65, 55, 70, 60, 75, 80, 85]}
              color="#065F46"
            />
            <StatCard
              icon={TrendingUp}
              label="Conversion Rate"
              value={34}
              suffix="%"
              trend={12}
              trendLabel="improvement"
              chartData={[20, 22, 25, 23, 28, 26, 30, 29, 32, 31, 33, 34]}
              color="#ACFADF"
            />
            <StatCard
              icon={BarChart3}
              label="Revenue Generated"
              value={142}
              prefix="$"
              suffix="M+"
              trend={47}
              trendLabel="growth"
              chartData={[40, 50, 45, 60, 55, 70, 65, 80, 75, 90, 100, 110]}
              color="#065F46"
            />
            <StatCard
              icon={Target}
              label="Client Satisfaction"
              value={98}
              suffix="%"
              trend={5}
              trendLabel="vs industry avg"
              chartData={[92, 93, 94, 93, 95, 94, 96, 95, 97, 96, 98, 98]}
              color="#1E293B"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-mist">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-basalt mb-4">
              Everything You Need to Scale
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Our comprehensive platform gives you all the tools to attract, nurture, and convert
              leads at scale.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Target}
              title="Smart Lead Scoring"
              description="AI-powered scoring identifies your most promising prospects so you can focus on leads ready to convert."
            />
            <FeatureCard
              icon={LineChart}
              title="Pipeline Analytics"
              description="Real-time dashboards show exactly where your leads are and what's working in your funnel."
            />
            <FeatureCard
              icon={Zap}
              title="Automated Outreach"
              description="Set up intelligent sequences that nurture leads with personalized messages at scale."
            />
            <FeatureCard
              icon={PieChart}
              title="Attribution Tracking"
              description="Know exactly which channels and campaigns are driving your best leads and revenue."
            />
            <FeatureCard
              icon={Shield}
              title="Data Enrichment"
              description="Automatically enrich lead profiles with verified contact info and company insights."
            />
            <FeatureCard
              icon={Activity}
              title="Real-time Alerts"
              description="Get notified instantly when hot leads engage so you can strike while interest is high."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-basalt mb-4">
              How We Bring You Real Leads
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Our proven 3-step process delivers qualified leads that are ready to buy.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Identify Your Ideal Customer',
                description:
                  "We analyze your best customers and create detailed profiles of who you should be targeting.",
                icon: Users,
              },
              {
                step: '02',
                title: 'Launch Targeted Campaigns',
                description:
                  'Our team deploys multi-channel campaigns designed to attract and engage your ideal prospects.',
                icon: Target,
              },
              {
                step: '03',
                title: 'Deliver Qualified Leads',
                description:
                  'You receive warm, verified leads who have expressed genuine interest in your solution.',
                icon: CheckCircle2,
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-7xl font-bold text-mint/30 mb-4">{item.step}</div>
                <div className="w-14 h-14 rounded-2xl bg-mint/20 flex items-center justify-center mb-4">
                  <item.icon className="w-7 h-7 text-eucalyptus" />
                </div>
                <h3 className="text-xl font-bold text-basalt mb-3">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.description}</p>
                {i < 2 && (
                  <ChevronRight className="hidden md:block absolute top-1/2 -right-4 w-8 h-8 text-mint" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6 bg-mist">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-basalt mb-4">
              Loved by Growth Teams
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              See why thousands of businesses trust LeadFlow to power their growth.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <TestimonialCard
              quote="LeadFlow transformed our sales pipeline. We went from struggling to find qualified leads to having more opportunities than we can handle."
              author="Sarah Chen"
              role="VP of Sales"
              company="TechFlow"
              image="SC"
              rating={5}
            />
            <TestimonialCard
              quote="The quality of leads we get through LeadFlow is incredible. Our conversion rate has nearly doubled since we started."
              author="Michael Rodriguez"
              role="Growth Director"
              company="ScaleUp Inc"
              image="MR"
              rating={5}
            />
            <TestimonialCard
              quote="Finally, a lead gen solution that actually delivers. The ROI we've seen in just 3 months has been phenomenal."
              author="Emily Thompson"
              role="CEO"
              company="CloudSync"
              image="ET"
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-basalt mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Choose the plan that fits your needs. All plans include our core lead generation
              features.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-center max-w-5xl mx-auto">
            <PricingCard
              name="Starter"
              price="$299"
              description="Perfect for small teams just getting started"
              features={[
                'Up to 100 leads/month',
                'Basic lead scoring',
                'Email sequences',
                'Standard support',
              ]}
              cta="Start Free Trial"
            />
            <PricingCard
              name="Professional"
              price="$599"
              description="For growing teams that need more power"
              features={[
                'Up to 500 leads/month',
                'Advanced AI scoring',
                'Multi-channel campaigns',
                'CRM integrations',
                'Priority support',
              ]}
              highlighted
              cta="Start Free Trial"
            />
            <PricingCard
              name="Enterprise"
              price="Custom"
              description="For large organizations with custom needs"
              features={[
                'Unlimited leads',
                'Custom integrations',
                'Dedicated account manager',
                'SLA guarantee',
                'On-premise option',
              ]}
              cta="Contact Sales"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-basalt rounded-3xl p-12 text-center overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-mint/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-eucalyptus/20 rounded-full blur-3xl" />
            {/* Decorative cloud image */}
            <img
              src="/brand/Cloud.png"
              alt=""
              className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10"
            />

            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Ready to Get Real Leads?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of businesses that trust LeadFlow to fuel their growth. Start your
                free trial today.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button className="flex items-center gap-2 bg-mint text-eucalyptus px-8 py-4 rounded-xl hover:bg-mint/90 transition-all font-semibold group">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-white/20 text-white hover:border-white/40 transition-colors font-semibold">
                  Schedule a Demo
                  <ArrowUpRight className="w-5 h-5" />
                </button>
              </div>
              <p className="mt-6 text-sm text-gray-400">
                No credit card required. 14-day free trial.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-basalt text-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/brand/icon.png" alt="PSS Logo" className="w-10 h-10" />
                <span className="text-xl font-bold">PSS LeadFlow</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Personal Software Solutions - Helping businesses generate qualified leads that convert into real revenue.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Integrations
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Roadmap
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <a href="https://www.pssforyou.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    www.pssforyou.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  contact@pssforyou.com
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Contact us
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-gray-400">
              &copy; 2026 Personal Software Solutions. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
