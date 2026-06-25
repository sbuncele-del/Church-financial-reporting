import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowRightIcon, ChartBarIcon, CurrencyDollarIcon, DocumentChartBarIcon, ShieldCheckIcon, CheckCircleIcon, UserGroupIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline'

export default function Landing() {
  return (
    <>
    <Helmet>
      <title>Church Excellence | Free Church Financial Management Software — South Africa</title>
      <meta name="description" content="Free church financial management software for South African churches. Track tithes, offerings, expenses, budgets and generate reports. 100% free. No credit card needed." />
      <link rel="canonical" href="https://churchexc.org/" />
    </Helmet>
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 overflow-hidden">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-slate-950/80 border-b border-slate-800/50">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 8.5V11h2v9h6v-5h4v5h6v-9h2V8.5L12 2zm0 2.5l7 4.5v1H5v-1l7-4.5z"/>
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight">Church Excellence</span>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <Link to="/about" className="text-sm text-slate-300 hover:text-white transition">About SOLAR</Link>
            <Link to="/login" className="text-sm text-slate-300 hover:text-white transition">Sign in</Link>
            <Link to="/register" className="text-sm bg-teal-500 hover:bg-teal-400 text-slate-900 font-semibold px-5 py-2.5 rounded-full transition shadow-lg shadow-teal-500/20">
              Get Started Free
            </Link>
          </div>
          {/* Mobile CTA */}
          <div className="sm:hidden flex items-center gap-3">
            <Link to="/login" className="text-sm text-slate-300">Sign in</Link>
            <Link to="/register" className="text-sm bg-teal-500 text-slate-900 font-semibold px-4 py-2 rounded-full">
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.4),transparent_40%),radial-gradient(circle_at_80%_10%,rgba(45,212,191,0.3),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(168,85,247,0.2),transparent_40%)]" aria-hidden="true" />
        <div className="mx-auto max-w-5xl px-6 pt-16 pb-14 lg:pt-24 lg:pb-20 relative text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-sm mb-8">
            <CheckCircleIcon className="h-4 w-4" />
            Trusted by churches across South Africa
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-white tracking-tight">
            Church financial management<br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent">made simple</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Track income, manage expenses, plan budgets, and generate financial reports — all in one platform built specifically for churches.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-full bg-teal-400 px-7 py-3.5 text-slate-900 font-bold text-lg shadow-xl shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-[2px] transition-all duration-200"
            >
              Start for free
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded-full border border-slate-600/70 px-7 py-3.5 text-slate-200 hover:border-slate-400/80 hover:bg-white/5 transition-all duration-200"
            >
              Learn about SOLAR
            </Link>
          </div>
        </div>
      </header>

      {/* Social Proof Strip */}
      <div className="border-y border-slate-800/50 bg-slate-900/30">
        <div className="mx-auto max-w-5xl px-6 py-6 flex flex-wrap justify-center gap-8 sm:gap-16 text-center">
          <div>
            <p className="text-2xl font-bold text-teal-300">100%</p>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Free to use</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-teal-300">40+</p>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Expense categories</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-teal-300">ZAR</p>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">South African Rand</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-teal-300">SSL</p>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Secured & encrypted</p>
          </div>
        </div>
      </div>

      {/* Features */}
      <main className="mx-auto max-w-5xl px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white">Everything your church needs</h2>
          <p className="mt-3 text-slate-400 max-w-xl mx-auto">Powerful financial tools designed with churches in mind — from tithes and offerings to pastoral salaries and ministry budgets.</p>
        </div>

        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="group rounded-2xl border border-slate-800/70 bg-white/[0.03] p-7 hover:bg-white/[0.07] hover:border-teal-500/30 transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-teal-500/10 flex items-center justify-center mb-5">
              <ChartBarIcon className="h-6 w-6 text-teal-300" />
            </div>
            <h3 className="text-lg font-semibold text-white">Track Income</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">Record tithes, offerings, donations, and all income sources. Categorise every rand that enters the church.</p>
          </div>
          <div className="group rounded-2xl border border-slate-800/70 bg-white/[0.03] p-7 hover:bg-white/[0.07] hover:border-teal-500/30 transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-teal-500/10 flex items-center justify-center mb-5">
              <CurrencyDollarIcon className="h-6 w-6 text-teal-300" />
            </div>
            <h3 className="text-lg font-semibold text-white">Manage Expenses</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">40+ pre-built expense categories: pastoral salaries, utilities, ministry costs, maintenance, and more.</p>
          </div>
          <div className="group rounded-2xl border border-slate-800/70 bg-white/[0.03] p-7 hover:bg-white/[0.07] hover:border-teal-500/30 transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-teal-500/10 flex items-center justify-center mb-5">
              <ShieldCheckIcon className="h-6 w-6 text-teal-300" />
            </div>
            <h3 className="text-lg font-semibold text-white">Plan Budgets</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">Set annual budgets, allocate funds per category, and monitor actual spending against planned amounts.</p>
          </div>
          <div className="group rounded-2xl border border-slate-800/70 bg-white/[0.03] p-7 hover:bg-white/[0.07] hover:border-teal-500/30 transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-teal-500/10 flex items-center justify-center mb-5">
              <DocumentChartBarIcon className="h-6 w-6 text-teal-300" />
            </div>
            <h3 className="text-lg font-semibold text-white">Generate Reports</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">Income statements, expense breakdowns, and budget variance reports — ready for church leadership.</p>
          </div>
          <div className="group rounded-2xl border border-slate-800/70 bg-white/[0.03] p-7 hover:bg-white/[0.07] hover:border-teal-500/30 transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-teal-500/10 flex items-center justify-center mb-5">
              <UserGroupIcon className="h-6 w-6 text-teal-300" />
            </div>
            <h3 className="text-lg font-semibold text-white">Role-Based Access</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">Admins, finance officers, and leaders each see exactly what they need. Secure and accountable.</p>
          </div>
          <div className="group rounded-2xl border border-slate-800/70 bg-white/[0.03] p-7 hover:bg-white/[0.07] hover:border-teal-500/30 transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-teal-500/10 flex items-center justify-center mb-5">
              <ClipboardDocumentCheckIcon className="h-6 w-6 text-teal-300" />
            </div>
            <h3 className="text-lg font-semibold text-white">SOLAR Framework</h3>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">Assess overall church health across Spiritual, Organisational, Love & Care, Advancement, and Resources.</p>
          </div>
        </section>

        {/* How It Works */}
        <section className="mt-24">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white">Get started in 3 steps</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto h-14 w-14 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-xl font-bold text-slate-900 shadow-lg shadow-teal-500/20">1</div>
              <h3 className="mt-4 text-lg font-semibold text-white">Register your church</h3>
              <p className="mt-2 text-sm text-slate-400">Create a free account and enter your church name. Categories are auto-generated.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-14 w-14 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-xl font-bold text-slate-900 shadow-lg shadow-teal-500/20">2</div>
              <h3 className="mt-4 text-lg font-semibold text-white">Record transactions</h3>
              <p className="mt-2 text-sm text-slate-400">Log income and expenses as they happen. Everything is categorised automatically.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto h-14 w-14 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-xl font-bold text-slate-900 shadow-lg shadow-teal-500/20">3</div>
              <h3 className="mt-4 text-lg font-semibold text-white">View reports & budgets</h3>
              <p className="mt-2 text-sm text-slate-400">Generate financial reports and track budget performance in real time.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-24 text-center">
          <div className="rounded-3xl bg-gradient-to-r from-teal-500/15 via-emerald-500/15 to-cyan-500/15 border border-teal-500/25 p-12 shadow-2xl">
            <h2 className="text-3xl font-bold text-white">Ready to bring clarity to your church finances?</h2>
            <p className="mt-4 text-lg text-slate-300 max-w-lg mx-auto">
              Join churches across South Africa using Church Excellence for financial transparency and accountability.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link to="/register" className="inline-flex items-center gap-2 rounded-full bg-teal-400 px-7 py-3.5 text-slate-900 font-bold shadow-xl shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-[2px] transition-all duration-200">
                Create free account
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2 rounded-full border border-slate-600 px-7 py-3.5 text-slate-200 hover:border-slate-400 transition">
                Sign in to your account
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 bg-slate-950">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
                <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 8.5V11h2v9h6v-5h4v5h6v-9h2V8.5L12 2zm0 2.5l7 4.5v1H5v-1l7-4.5z"/>
                </svg>
              </div>
              <span className="font-semibold text-slate-400">Church Excellence</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link to="/about" className="hover:text-slate-300 transition">About SOLAR</Link>
              <span className="text-slate-700">|</span>
              <a href="mailto:support@churchexc.co.za" className="hover:text-slate-300 transition">Contact</a>
              <span className="text-slate-700">|</span>
              <p>&copy; {new Date().getFullYear()} Church Excellence</p>
            </div>
          </div>
          <div className="mt-6 border-t border-slate-800/50 pt-6 text-center">
            <p className="text-xs text-slate-600">
              Powered by{' '}
              <span className="font-semibold tracking-wide text-slate-500">Masaphokati Technologies</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
    </>
  )
}
