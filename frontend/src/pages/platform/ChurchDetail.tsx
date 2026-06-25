import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { platformService } from '../../services/platformService';
import {
  ChevronLeftIcon,
  ArrowPathIcon,
  EyeIcon,
  TableCellsIcon,
} from '@heroicons/react/24/outline';

const fmt = (n: number | string) =>
  `R ${Number(n || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  const classes: Record<string, string> = {
    green: 'bg-green-50 border-green-200 text-green-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  };
  return (
    <div className={`rounded-xl border p-5 ${classes[color] || classes.blue}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-60">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function ReadOnlySummary({ summary }: { churchId: number; summary: any }) {
  const net_mtd = (summary?.income_mtd ?? 0) - (summary?.expenses_mtd ?? 0);
  const net_ytd = (summary?.income_ytd ?? 0) - (summary?.expenses_ytd ?? 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <SummaryCard label="Income MTD" value={fmt(summary?.income_mtd)} color="green" />
        <SummaryCard label="Expenses MTD" value={fmt(summary?.expenses_mtd)} color="red" />
        <SummaryCard label="Net MTD" value={fmt(net_mtd)} color={net_mtd >= 0 ? 'blue' : 'red'} />
        <SummaryCard label="Income YTD" value={fmt(summary?.income_ytd)} color="green" />
        <SummaryCard label="Expenses YTD" value={fmt(summary?.expenses_ytd)} color="red" />
        <SummaryCard label="Net YTD" value={fmt(net_ytd)} color={net_ytd >= 0 ? 'indigo' : 'red'} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-medium text-gray-500">Members</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{summary?.member_count ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm font-medium text-gray-500">Platform Users</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{summary?.user_count ?? 0}</p>
        </div>
      </div>
    </div>
  );
}

function DetailedView({ churchId }: { churchId: number }) {
  const today = new Date();
  const firstOfYear = `${today.getFullYear()}-01-01`;
  const todayStr = today.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstOfYear);
  const [endDate, setEndDate] = useState(todayStr);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await platformService.getChurchIncomeStatement(churchId, startDate, endDate);
      setData(res);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load income statement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      {/* Date filter */}
      <div className="flex flex-wrap items-center gap-3 bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500">From</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="input text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500">To</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="input text-sm"
          />
        </div>
        <button onClick={load} className="btn btn-primary text-sm">
          Apply
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <ArrowPathIcon className="w-7 h-7 text-indigo-500 animate-spin" />
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600 text-sm">{error}</div>
      )}

      {data && !loading && (
        <div className="space-y-6">
          {/* Summary boxes */}
          <div className="grid grid-cols-3 gap-4">
            <SummaryCard label="Total Income" value={fmt(data.summary?.total_income)} color="green" />
            <SummaryCard label="Total Expenses" value={fmt(data.summary?.total_expenses)} color="red" />
            <SummaryCard
              label="Net Income"
              value={fmt(data.summary?.net_income)}
              color={(data.summary?.net_income ?? 0) >= 0 ? 'indigo' : 'red'}
            />
          </div>

          {/* Income breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-3 bg-green-50 border-b border-green-100">
              <h3 className="text-sm font-semibold text-green-800">Income by Category</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <th className="px-6 py-2 text-left">Category</th>
                  <th className="px-6 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(data.income || []).map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-2.5 text-gray-700">{row.category}</td>
                    <td className="px-6 py-2.5 text-right text-green-600 font-medium">{fmt(row.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-green-50 font-semibold">
                  <td className="px-6 py-3 text-green-800">Total Income</td>
                  <td className="px-6 py-3 text-right text-green-700">{fmt(data.summary?.total_income)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Expenses breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-3 bg-red-50 border-b border-red-100">
              <h3 className="text-sm font-semibold text-red-800">Expenses by Category</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <th className="px-6 py-2 text-left">Category</th>
                  <th className="px-6 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(data.expenses || []).map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-2.5 text-gray-700">{row.category}</td>
                    <td className="px-6 py-2.5 text-right text-red-500 font-medium">{fmt(row.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-red-50 font-semibold">
                  <td className="px-6 py-3 text-red-800">Total Expenses</td>
                  <td className="px-6 py-3 text-right text-red-700">{fmt(data.summary?.total_expenses)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChurchDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const churchId = Number(id);

  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<'summary' | 'detailed'>('summary');

  useEffect(() => {
    setLoading(true);
    platformService.getChurchSummary(churchId)
      .then(d => setSummary(d))
      .catch(e => setError(e?.response?.data?.error || 'Failed to load church'))
      .finally(() => setLoading(false));
  }, [churchId]);

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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div>
        <button
          onClick={() => navigate('/platform')}
          className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 mb-3"
        >
          <ChevronLeftIcon className="w-4 h-4" /> Back to Platform
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{summary?.name}</h1>
            {summary?.denomination && (
              <p className="text-sm text-gray-500 mt-0.5">{summary.denomination}</p>
            )}
          </div>
        </div>
      </div>

      {/* View toggle */}
      <div className="flex gap-2 bg-white rounded-xl border border-gray-200 p-1 w-fit">
        <button
          onClick={() => setView('summary')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === 'summary'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <EyeIcon className="w-4 h-4" /> Read-Only Summary
        </button>
        <button
          onClick={() => setView('detailed')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === 'detailed'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <TableCellsIcon className="w-4 h-4" /> Full Detailed View
        </button>
      </div>

      {view === 'summary' ? (
        <ReadOnlySummary churchId={churchId} summary={summary} />
      ) : (
        <DetailedView churchId={churchId} />
      )}
    </div>
  );
}
