import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { platformService } from '../../services/platformService';
import {
  BuildingLibraryIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ScaleIcon,
  ChevronRightIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const fmt = (n: number | string) =>
  `R ${Number(n || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: string;
  icon: any;
  color: string;
  sub?: string;
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
  };
  return (
    <div className={`rounded-xl border p-5 flex items-start gap-4 ${colors[color] || colors.blue}`}>
      <div className="mt-0.5">
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</p>
        <p className="text-2xl font-bold mt-0.5">{value}</p>
        {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function PlatformDashboard() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<any>(null);
  const [churches, setChurches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [ov, ch] = await Promise.all([
        platformService.getOverview(),
        platformService.getChurches(),
      ]);
      setOverview(ov);
      setChurches(ch.churches || []);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load platform data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <ArrowPathIcon className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-600 font-medium">{error}</p>
        <button onClick={load} className="mt-3 btn btn-secondary text-sm">Retry</button>
      </div>
    );
  }

  const net = (overview?.income_ytd ?? 0) - (overview?.expenses_ytd ?? 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">God's Eye Platform</h1>
          <p className="text-sm text-gray-500 mt-0.5">Platform-wide overview across all registered organisations</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 btn btn-secondary text-sm">
          <ArrowPathIcon className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Aggregate stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          label="Total Organisations"
          value={String(overview?.total_churches ?? 0)}
          icon={BuildingLibraryIcon}
          color="purple"
        />
        <StatCard
          label="Total Members"
          value={String(overview?.total_members ?? 0)}
          icon={UsersIcon}
          color="blue"
          sub={`${overview?.total_users ?? 0} platform users`}
        />
        <StatCard
          label="Income YTD"
          value={fmt(overview?.income_ytd)}
          icon={ArrowTrendingUpIcon}
          color="green"
          sub={`MTD: ${fmt(overview?.income_mtd)}`}
        />
        <StatCard
          label="Expenses YTD"
          value={fmt(overview?.expenses_ytd)}
          icon={ArrowTrendingDownIcon}
          color="red"
          sub={`MTD: ${fmt(overview?.expenses_mtd)}`}
        />
        <StatCard
          label="Net YTD"
          value={fmt(net)}
          icon={ScaleIcon}
          color={net >= 0 ? 'green' : 'red'}
          sub={`MTD net: ${fmt((overview?.income_mtd ?? 0) - (overview?.expenses_mtd ?? 0))}`}
        />
      </div>

      {/* Organisations table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">All Organisations</h2>
          <span className="text-sm text-gray-400">{churches.length} registered</span>
        </div>

        {churches.length === 0 ? (
          <div className="py-12 text-center text-gray-400">No organisations registered yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-6 py-3 text-left">Organisation</th>
                  <th className="px-6 py-3 text-right">Members</th>
                  <th className="px-6 py-3 text-right">Income MTD</th>
                  <th className="px-6 py-3 text-right">Expenses MTD</th>
                  <th className="px-6 py-3 text-right">Net MTD</th>
                  <th className="px-6 py-3 text-right">Income YTD</th>
                  <th className="px-6 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {churches.map((ch) => {
                  const net_mtd = (ch.income_mtd ?? 0) - (ch.expenses_mtd ?? 0);
                  return (
                    <tr key={ch.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{ch.name}</p>
                          {ch.denomination && (
                            <p className="text-xs text-gray-400">{ch.denomination}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-600">{ch.member_count ?? 0}</td>
                      <td className="px-6 py-4 text-right text-green-600 font-medium">
                        {fmt(ch.income_mtd)}
                      </td>
                      <td className="px-6 py-4 text-right text-red-500 font-medium">
                        {fmt(ch.expenses_mtd)}
                      </td>
                      <td className={`px-6 py-4 text-right font-semibold ${net_mtd >= 0 ? 'text-indigo-600' : 'text-orange-500'}`}>
                        {fmt(net_mtd)}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-600">{fmt(ch.income_ytd)}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => navigate(`/platform/church/${ch.id}`)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                        >
                          View <ChevronRightIcon className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
