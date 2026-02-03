import { Link } from 'react-router-dom'
import { CheckCircleIcon, ShieldCheckIcon, ArrowRightIcon, SparklesIcon, ChartBarIcon, UsersIcon, HeartIcon, CurrencyDollarIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline'

const stats = [
  { label: 'Holistic framework', value: 'SOLAR health assessment' },
  { label: 'Five dimensions', value: 'Spiritual • Organisational • Love • Advancement • Resources' },
  { label: 'Data-driven', value: 'Track, measure, grow' },
]

const highlights = [
  {
    title: 'Measure what matters',
    copy: 'Move beyond attendance numbers. Assess spiritual vitality, governance health, care effectiveness, and growth momentum.',
    icon: ChartBarIcon,
  },
  {
    title: 'Pastoral insight at a glance',
    copy: 'See your church\'s health across all five SOLAR dimensions with clear KPIs and actionable assessments.',
    icon: UsersIcon,
  },
  {
    title: 'Grow with intention',
    copy: 'Identify strengths to celebrate and gaps to address. The SOLAR framework guides your leadership decisions.',
    icon: ShieldCheckIcon,
  },
]

const features = [
  { icon: SparklesIcon, title: 'Spiritual Vitality', desc: 'Assess worship engagement, discipleship programs, and spiritual growth indicators.' },
  { icon: BuildingOffice2Icon, title: 'Organisational Governance', desc: 'Evaluate leadership structures, decision-making, and operational effectiveness.' },
  { icon: HeartIcon, title: 'Love & Care', desc: 'Track pastoral care, member welfare, community outreach, and support systems.' },
  { icon: ChartBarIcon, title: 'Advancement', desc: 'Measure evangelism, church planting, training programs, and kingdom impact.' },
  { icon: CurrencyDollarIcon, title: 'Resources', desc: 'Steward finances, facilities, and human capital with clarity and accountability.' },
]

const steps = [
  'Create your account and invite your leadership team',
  'Complete your first SOLAR health assessment',
  'Review insights and create action plans for growth',
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 overflow-hidden">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-slate-950/80 border-b border-slate-800/50">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <SparklesIcon className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">ChurchSOLAR</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm text-slate-300 hover:text-white transition">Sign in</Link>
            <Link to="/register" className="text-sm bg-teal-500 hover:bg-teal-400 text-slate-900 font-semibold px-4 py-2 rounded-full transition shadow-lg shadow-teal-500/20">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      <header className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.35),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(168,85,247,0.35),transparent_30%),radial-gradient(circle_at_50%_60%,rgba(34,197,94,0.25),transparent_32%)]" aria-hidden="true" />
        <div className="mx-auto max-w-6xl px-6 pt-16 pb-12 lg:pt-24 lg:pb-16 relative">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-200/80">
            <SparklesIcon className="h-4 w-4" />
            Church Health Framework
          </div>
          <div className="mt-6 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
            <div className="space-y-8">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-slate-50">
                Measure your church's health. Grow with purpose.
              </h1>
              <p className="text-lg text-slate-200/80 max-w-2xl">
                The SOLAR framework helps you assess and strengthen five vital dimensions of church life—Spiritual vitality, Organisational governance, Love & care, Advancement, and Resources.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-full bg-teal-400 px-5 py-3 text-slate-900 font-semibold shadow-lg shadow-teal-500/30 hover:-translate-y-[1px] transition"
                >
                  Start for free
                  <ArrowRightIcon className="h-5 w-5" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 px-5 py-3 text-slate-100 hover:border-slate-500/80"
                >
                  I already have an account
                </Link>
              </div>
              <div className="grid sm:grid-cols-3 gap-4 pt-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-slate-800/70 bg-white/5 p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-slate-300/70">{stat.label}</p>
                    <p className="mt-2 text-sm font-semibold text-slate-50">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-teal-400/20 via-cyan-400/10 to-emerald-400/20 blur-3xl" aria-hidden="true" />
              <div className="relative rounded-3xl border border-slate-800/70 bg-white/5 p-6 shadow-2xl">
                <div className="flex items-center justify-between text-xs text-slate-300/80">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-400"></span>
                    Health Assessment
                  </div>
                  <span>Grade: B</span>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl bg-slate-900/60 border border-slate-800 px-4 py-3">
                    <p className="text-sm font-semibold text-indigo-200">SOLAR Health Score</p>
                    <p className="text-xs text-slate-300/70">Spiritual • Organisational • Love & Care • Advancement • Resources</p>
                    <div className="mt-3 grid grid-cols-5 gap-1 text-[10px] text-center">
                      {[{l:'S',v:78},{l:'O',v:72},{l:'L',v:85},{l:'A',v:65},{l:'R',v:70}].map(item => (
                        <div key={item.l} className="rounded-lg bg-slate-800/80 px-2 py-2 text-slate-200">
                          <div className="text-xs font-bold text-emerald-300">{item.v}%</div>
                          <div className="opacity-70">{item.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-900/60 border border-slate-800 px-4 py-3">
                    <p className="text-sm font-semibold text-teal-200">Overall Church Health</p>
                    <p className="text-xs text-slate-300/70">Combined assessment across all dimensions</p>
                    <div className="mt-3 h-2.5 w-full rounded-full bg-slate-800">
                      <div className="h-2.5 rounded-full bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 w-[74%]"></div>
                    </div>
                    <p className="mt-2 text-right text-xs text-emerald-300 font-semibold">74% Healthy</p>
                  </div>
                  <div className="rounded-2xl bg-slate-900/60 border border-slate-800 px-4 py-3">
                    <div className="flex items-center justify-between text-sm text-slate-200">
                      <div>
                        <p className="font-semibold">Key Insights</p>
                        <p className="text-xs text-slate-400">From your latest assessment</p>
                      </div>
                      <CheckCircleIcon className="h-5 w-5 text-teal-300" />
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-3 text-xs text-slate-200">
                      <div className="rounded-xl bg-slate-800/70 p-3">
                        <p className="text-slate-400">Strength</p>
                        <p className="text-base font-semibold text-emerald-300">L&C</p>
                      </div>
                      <div className="rounded-xl bg-slate-800/70 p-3">
                        <p className="text-slate-400">Focus</p>
                        <p className="text-base font-semibold text-amber-300">Adv.</p>
                      </div>
                      <div className="rounded-xl bg-slate-800/70 p-3">
                        <p className="text-slate-400">Trend</p>
                        <p className="text-base font-semibold text-teal-200">↑ 8%</p>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-xs text-slate-400">Sign up to run your first assessment.</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20 space-y-20">
        {/* Highlights */}
        <section className="grid md:grid-cols-3 gap-6">
          {highlights.map((item) => (
            <div key={item.title} className="group rounded-2xl border border-slate-800/70 bg-white/5 p-6 shadow-lg hover:bg-white/10 hover:border-teal-500/30 transition-all duration-300">
              <div className="flex items-center gap-3">
                <item.icon className="h-10 w-10 text-teal-300 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-lg font-semibold text-slate-50">{item.title}</h3>
              </div>
              <p className="mt-3 text-sm text-slate-200/80">{item.copy}</p>
            </div>
          ))}
        </section>

        {/* Features Grid */}
        <section className="text-center space-y-10">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-teal-200/80">The SOLAR Framework</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-50">Five dimensions of church health</h2>
            <p className="mt-3 text-slate-200/70 max-w-xl mx-auto">A comprehensive framework to assess, track, and strengthen every aspect of your church's vitality.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {features.map((f) => (
              <div key={f.title} className="group rounded-2xl border border-slate-800/50 bg-slate-900/50 p-6 text-left hover:border-teal-500/40 hover:shadow-xl hover:shadow-teal-500/5 transition-all duration-300">
                <f.icon className="h-8 w-8 text-teal-400 group-hover:text-teal-300 transition" />
                <h4 className="mt-4 font-semibold text-slate-50">{f.title}</h4>
                <p className="mt-2 text-sm text-slate-300/80">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="rounded-3xl border border-slate-800/70 bg-gradient-to-r from-slate-900 to-slate-950 p-10 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-teal-200/80">How it works</p>
              <h2 className="text-2xl font-bold text-slate-50">Start your health journey</h2>
              <p className="text-sm text-slate-200/80">Begin with a clean slate. Complete assessments, track progress over time, and make data-informed decisions for your church.</p>
            </div>
            <div className="grid gap-3 text-sm text-slate-100">
              {steps.map((step, idx) => (
                <div key={step} className="flex items-start gap-3 rounded-2xl border border-slate-800/70 bg-slate-900/70 px-4 py-3 hover:border-teal-500/30 transition-colors">
                  <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-teal-400/20 text-teal-200 font-semibold">
                    {idx + 1}
                  </div>
                  <p className="leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
          <div className="rounded-3xl border border-slate-800/70 bg-white/5 p-8 shadow-2xl">
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-teal-200/80">
              <ShieldCheckIcon className="h-5 w-5" />
              Security-first mindset
            </div>
            <h3 className="mt-4 text-2xl font-bold text-slate-50">Your assessments. Your insights. Your growth.</h3>
            <p className="mt-2 text-sm text-slate-200/80">Every assessment you complete builds your church's health history. Track trends, celebrate wins, and identify areas for intentional growth.</p>
            <ul className="mt-5 space-y-2 text-sm text-slate-100">
              <li className="flex items-center gap-2"><CheckCircleIcon className="h-5 w-5 text-teal-300" /> Role-based access for leadership and ministry teams</li>
              <li className="flex items-center gap-2"><CheckCircleIcon className="h-5 w-5 text-teal-300" /> Historical tracking to see progress over time</li>
              <li className="flex items-center gap-2"><CheckCircleIcon className="h-5 w-5 text-teal-300" /> Actionable insights for each SOLAR dimension</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-slate-800/70 bg-gradient-to-b from-teal-500/20 via-cyan-500/10 to-slate-900 p-8 shadow-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-900/70">Get started</p>
            <h4 className="mt-3 text-xl font-bold text-slate-900">Ready when you are</h4>
            <p className="mt-2 text-sm text-slate-900/80">Create your account, invite your leadership team, and run your first health assessment today.</p>
            <div className="mt-6 grid gap-3 text-sm text-slate-900">
              <div className="rounded-2xl bg-white/80 p-4">
                <p className="font-semibold">1. Sign up</p>
                <p className="text-slate-700">Create your church profile in under 2 minutes.</p>
              </div>
              <div className="rounded-2xl bg-white/80 p-4">
                <p className="font-semibold">2. Run assessment</p>
                <p className="text-slate-700">Complete the SOLAR questionnaire with your team.</p>
              </div>
              <div className="rounded-2xl bg-white/80 p-4">
                <p className="font-semibold">3. Grow together</p>
                <p className="text-slate-700">Review insights and create action plans for each dimension.</p>
              </div>
            </div>
            <Link
              to="/register"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-slate-50 font-semibold shadow-lg shadow-slate-900/30 hover:-translate-y-[1px] transition"
            >
              Create my account
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center py-10">
          <div className="rounded-3xl bg-gradient-to-r from-teal-500/20 via-emerald-500/20 to-cyan-500/20 border border-teal-500/30 p-12 shadow-2xl">
            <h2 className="text-3xl font-bold text-slate-50">Ready to measure what matters?</h2>
            <p className="mt-3 text-slate-200/80 max-w-xl mx-auto">Join churches using the SOLAR framework to assess their health, celebrate their strengths, and grow with intention.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link to="/register" className="inline-flex items-center gap-2 rounded-full bg-teal-400 px-6 py-3 text-slate-900 font-semibold shadow-lg shadow-teal-500/30 hover:-translate-y-[1px] transition">
                Start for free
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2 rounded-full border border-slate-600 px-6 py-3 text-slate-100 hover:border-slate-400 transition">
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 bg-slate-950">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
                  <SparklesIcon className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-lg">ChurchSOLAR</span>
              </div>
              <p className="text-sm text-slate-400">A comprehensive church health framework to assess, track, and strengthen your ministry.</p>
            </div>
            <div>
              <h5 className="font-semibold text-slate-200 mb-3">Product</h5>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><span className="hover:text-slate-200 cursor-pointer transition">Health Assessments</span></li>
                <li><span className="hover:text-slate-200 cursor-pointer transition">SOLAR Framework</span></li>
                <li><span className="hover:text-slate-200 cursor-pointer transition">Progress Tracking</span></li>
                <li><span className="hover:text-slate-200 cursor-pointer transition">Reports & Insights</span></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-slate-200 mb-3">Resources</h5>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><span className="hover:text-slate-200 cursor-pointer transition">Documentation</span></li>
                <li><span className="hover:text-slate-200 cursor-pointer transition">Help Center</span></li>
                <li><span className="hover:text-slate-200 cursor-pointer transition">Best Practices</span></li>
                <li><span className="hover:text-slate-200 cursor-pointer transition">Contact Support</span></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-slate-200 mb-3">Legal</h5>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><span className="hover:text-slate-200 cursor-pointer transition">Privacy Policy</span></li>
                <li><span className="hover:text-slate-200 cursor-pointer transition">Terms of Service</span></li>
                <li><span className="hover:text-slate-200 cursor-pointer transition">Data Security</span></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <p>© {new Date().getFullYear()} ChurchSOLAR. All rights reserved.</p>
            <p>Built with ❤️ for churches worldwide</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
