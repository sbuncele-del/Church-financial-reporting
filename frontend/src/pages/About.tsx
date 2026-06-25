import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ArrowRightIcon, ArrowLeftIcon, SparklesIcon, BuildingOffice2Icon, HeartIcon, ChartBarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'

const solarDimensions = [
  {
    letter: 'S',
    name: 'Spiritual Vitality',
    icon: SparklesIcon,
    color: 'from-purple-500 to-violet-600',
    description: 'Assess worship engagement, discipleship programs, prayer life, and spiritual growth indicators across the congregation.',
  },
  {
    letter: 'O',
    name: 'Organisational Governance',
    icon: BuildingOffice2Icon,
    color: 'from-blue-500 to-cyan-600',
    description: 'Evaluate leadership structures, decision-making processes, policies, and operational effectiveness.',
  },
  {
    letter: 'L',
    name: 'Love & Care',
    icon: HeartIcon,
    color: 'from-pink-500 to-rose-600',
    description: 'Track pastoral care, member welfare, community outreach, family support, and care ministry effectiveness.',
  },
  {
    letter: 'A',
    name: 'Advancement',
    icon: ChartBarIcon,
    color: 'from-green-500 to-emerald-600',
    description: 'Measure evangelism efforts, church planting, training programs, digital mission, and kingdom impact.',
  },
  {
    letter: 'R',
    name: 'Resources',
    icon: CurrencyDollarIcon,
    color: 'from-amber-500 to-orange-600',
    description: 'Steward finances, facilities, human capital, and assets with clarity, accountability, and wisdom.',
  },
]

export default function About() {
  return (
    <>
    <Helmet>
      <title>About the SOLAR Framework | Church Excellence</title>
      <meta name="description" content="The SOLAR Church Health Framework helps South African churches assess and grow across five dimensions: Spiritual Vitality, Organisational Governance, Love & Care, Advancement, and Resources." />
      <link rel="canonical" href="https://churchexc.org/about" />
    </Helmet>
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-lg bg-slate-950/80 border-b border-slate-800/50">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <SparklesIcon className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Church Excellence</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm text-slate-300 hover:text-white transition">Sign in</Link>
            <Link to="/register" className="text-sm bg-teal-500 hover:bg-teal-400 text-slate-900 font-semibold px-4 py-2 rounded-full transition shadow-lg shadow-teal-500/20">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-16">
        {/* Back link */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition mb-8">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to home
        </Link>

        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-50">The SOLAR Framework</h1>
          <p className="mt-4 text-lg text-slate-200/80 max-w-2xl mx-auto">
            A comprehensive model for assessing and strengthening church health across five vital dimensions.
          </p>
        </header>

        {/* What is SOLAR */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-50 mb-4">What is SOLAR?</h2>
          <p className="text-slate-200/80 leading-relaxed">
            SOLAR is a holistic church health assessment framework designed to help church leadership 
            understand, measure, and improve the overall vitality of their ministry. Rather than focusing 
            on a single metric like attendance or giving, SOLAR examines five interconnected dimensions 
            that together paint a complete picture of church health.
          </p>
          <p className="mt-4 text-slate-200/80 leading-relaxed">
            Each letter in SOLAR represents a critical area of church life: <strong className="text-teal-300">S</strong>piritual Vitality, 
            <strong className="text-teal-300"> O</strong>rganisational Governance, <strong className="text-teal-300">L</strong>ove & Care, 
            <strong className="text-teal-300"> A</strong>dvancement, and <strong className="text-teal-300">R</strong>esources.
          </p>
        </section>

        {/* Five Dimensions */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-50 mb-8">The Five Dimensions</h2>
          <div className="space-y-6">
            {solarDimensions.map((dim) => (
              <div key={dim.letter} className="rounded-2xl border border-slate-800/70 bg-white/5 p-6 hover:bg-white/10 transition">
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${dim.color} flex items-center justify-center shadow-lg`}>
                    <span className="text-2xl font-bold text-white">{dim.letter}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-50 flex items-center gap-2">
                      <dim.icon className="h-5 w-5 text-teal-300" />
                      {dim.name}
                    </h3>
                    <p className="mt-2 text-slate-200/80">{dim.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why SOLAR */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-slate-50 mb-4">Why use SOLAR?</h2>
          <ul className="space-y-3 text-slate-200/80">
            <li className="flex items-start gap-3">
              <span className="text-teal-400 mt-1">•</span>
              <span><strong className="text-slate-100">Holistic view:</strong> Move beyond single metrics to see the full picture of church health.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-teal-400 mt-1">•</span>
              <span><strong className="text-slate-100">Data-driven decisions:</strong> Make informed choices based on measurable indicators.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-teal-400 mt-1">•</span>
              <span><strong className="text-slate-100">Track progress:</strong> Monitor improvements over time with regular assessments.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-teal-400 mt-1">•</span>
              <span><strong className="text-slate-100">Identify gaps:</strong> Discover areas that need attention before they become problems.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-teal-400 mt-1">•</span>
              <span><strong className="text-slate-100">Celebrate strengths:</strong> Recognise and build on what the church is doing well.</span>
            </li>
          </ul>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="rounded-3xl bg-gradient-to-r from-teal-500/20 via-emerald-500/20 to-cyan-500/20 border border-teal-500/30 p-10 shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-50">Ready to assess church health?</h2>
            <p className="mt-3 text-slate-200/80 max-w-lg mx-auto">
              Start with financial health tracking and expand to other SOLAR dimensions as they become available.
            </p>
            <div className="mt-6">
              <Link to="/register" className="inline-flex items-center gap-2 rounded-full bg-teal-400 px-6 py-3 text-slate-900 font-semibold shadow-lg shadow-teal-500/30 hover:-translate-y-[1px] transition">
                Get started free
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 bg-slate-950">
        <div className="mx-auto max-w-5xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center">
              <SparklesIcon className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-slate-400">Church Excellence</span>
          </div>
          <p>© {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </footer>
    </div>
    </>
  )
}
