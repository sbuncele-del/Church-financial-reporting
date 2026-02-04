import { Link } from 'react-router-dom'
import { ArrowRightIcon, ChartBarIcon, CurrencyDollarIcon, DocumentChartBarIcon, ShieldCheckIcon, SparklesIcon } from '@heroicons/react/24/outline'

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
          <div className="flex items-center gap-6">
            <Link to="/about" className="text-sm text-slate-300 hover:text-white transition">About SOLAR</Link>
            <Link to="/login" className="text-sm text-slate-300 hover:text-white transition">Sign in</Link>
            <Link to="/register" className="text-sm bg-teal-500 hover:bg-teal-400 text-slate-900 font-semibold px-4 py-2 rounded-full transition shadow-lg shadow-teal-500/20">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.35),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(168,85,247,0.35),transparent_30%)]" aria-hidden="true" />
        <div className="mx-auto max-w-5xl px-6 pt-20 pb-16 lg:pt-28 lg:pb-20 relative text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-slate-50">
            Measure the health of the church
          </h1>
          <p className="mt-6 text-lg text-slate-200/80 max-w-2xl mx-auto">
            The SOLAR framework helps churches assess and strengthen their ministry across five vital dimensions—starting with financial health.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-full bg-teal-400 px-6 py-3 text-slate-900 font-semibold shadow-lg shadow-teal-500/30 hover:-translate-y-[1px] transition"
            >
              Start for free
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 px-6 py-3 text-slate-100 hover:border-slate-500/80 transition"
            >
              Sign in to account
            </Link>
          </div>
        </div>
      </header>

      {/* Features */}
      <main className="mx-auto max-w-5xl px-6 pb-20">
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-2xl border border-slate-800/70 bg-white/5 p-6 hover:bg-white/10 transition">
            <ChartBarIcon className="h-10 w-10 text-teal-300" />
            <h3 className="mt-4 text-lg font-semibold text-slate-50">Track Income</h3>
            <p className="mt-2 text-sm text-slate-200/80">Record tithes, offerings, donations and all income sources with ease.</p>
          </div>
          <div className="rounded-2xl border border-slate-800/70 bg-white/5 p-6 hover:bg-white/10 transition">
            <CurrencyDollarIcon className="h-10 w-10 text-teal-300" />
            <h3 className="mt-4 text-lg font-semibold text-slate-50">Manage Expenses</h3>
            <p className="mt-2 text-sm text-slate-200/80">Categorise and track all church expenditures for full transparency.</p>
          </div>
          <div className="rounded-2xl border border-slate-800/70 bg-white/5 p-6 hover:bg-white/10 transition">
            <ShieldCheckIcon className="h-10 w-10 text-teal-300" />
            <h3 className="mt-4 text-lg font-semibold text-slate-50">Plan Budgets</h3>
            <p className="mt-2 text-sm text-slate-200/80">Set annual budgets and monitor spending against planned allocations.</p>
          </div>
          <div className="rounded-2xl border border-slate-800/70 bg-white/5 p-6 hover:bg-white/10 transition">
            <DocumentChartBarIcon className="h-10 w-10 text-teal-300" />
            <h3 className="mt-4 text-lg font-semibold text-slate-50">Generate Reports</h3>
            <p className="mt-2 text-sm text-slate-200/80">Create financial statements and reports for leadership and accountability.</p>
          </div>
        </section>

        {/* Simple CTA */}
        <section className="mt-16 text-center">
          <div className="rounded-3xl bg-gradient-to-r from-teal-500/20 via-emerald-500/20 to-cyan-500/20 border border-teal-500/30 p-10 shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-50">Ready to get started?</h2>
            <p className="mt-3 text-slate-200/80 max-w-lg mx-auto">
              Join churches using this tool to manage finances with clarity, accountability, and peace of mind.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link to="/register" className="inline-flex items-center gap-2 rounded-full bg-teal-400 px-6 py-3 text-slate-900 font-semibold shadow-lg shadow-teal-500/30 hover:-translate-y-[1px] transition">
                Create free account
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <Link to="/about" className="inline-flex items-center gap-2 rounded-full border border-slate-600 px-6 py-3 text-slate-100 hover:border-slate-400 transition">
                Learn about SOLAR
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-slate-800/50 bg-slate-950">
        <div className="mx-auto max-w-5xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
              <SparklesIcon className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-slate-400">ChurchSOLAR</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-slate-300 transition">About SOLAR</Link>
            <span>•</span>
            <p>© {new Date().getFullYear()} All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
