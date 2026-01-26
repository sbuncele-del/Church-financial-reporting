import { useState } from 'react';
import { format, startOfYear, endOfYear, startOfMonth, endOfMonth } from 'date-fns';
import toast from 'react-hot-toast';
import {
  DocumentArrowDownIcon,
  ChartBarIcon,
  CalendarIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { reportsService } from '../../services/financeService';
import { formatCurrency } from '../../utils/currency';

type ReportType = 'income-statement' | 'monthly-comparison' | 'donor-statement';

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ReportType>('income-statement');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Date filters
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [year, setYear] = useState(new Date().getFullYear());

  const reports = [
    {
      id: 'income-statement' as ReportType,
      name: 'Income Statement',
      description: 'View income vs expenses for a period',
      icon: DocumentTextIcon,
    },
    {
      id: 'monthly-comparison' as ReportType,
      name: 'Monthly Comparison',
      description: 'Compare monthly financials for a year',
      icon: ChartBarIcon,
    },
  ];

  const generateReport = async () => {
    setLoading(true);
    try {
      let data;
      switch (selectedReport) {
        case 'income-statement':
          data = await reportsService.getIncomeStatement(startDate, endDate);
          break;
        case 'monthly-comparison':
          data = await reportsService.getMonthlyComparison(year);
          break;
        default:
          return;
      }
      setReportData(data);
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = async () => {
    try {
      const blob = await reportsService.exportTransactions(startDate, endDate, 'all');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${startDate}_${endDate}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Export downloaded');
    } catch (error) {
      toast.error('Failed to export');
    }
  };

  const setQuickDate = (period: 'thisMonth' | 'lastMonth' | 'thisYear') => {
    const now = new Date();
    switch (period) {
      case 'thisMonth':
        setStartDate(format(startOfMonth(now), 'yyyy-MM-dd'));
        setEndDate(format(endOfMonth(now), 'yyyy-MM-dd'));
        break;
      case 'lastMonth':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
        setStartDate(format(startOfMonth(lastMonth), 'yyyy-MM-dd'));
        setEndDate(format(endOfMonth(lastMonth), 'yyyy-MM-dd'));
        break;
      case 'thisYear':
        setStartDate(format(startOfYear(now), 'yyyy-MM-dd'));
        setEndDate(format(endOfYear(now), 'yyyy-MM-dd'));
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600">Generate and export financial reports</p>
        </div>
        <button onClick={exportToCSV} className="btn-secondary flex items-center gap-2">
          <DocumentArrowDownIcon className="w-5 h-5" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Selection */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="card-header">Select Report</h3>
            <div className="space-y-2">
              {reports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => {
                    setSelectedReport(report.id);
                    setReportData(null);
                  }}
                  className={`w-full p-4 rounded-lg border text-left transition-colors ${
                    selectedReport === report.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <report.icon className={`w-6 h-6 ${
                      selectedReport === report.id ? 'text-primary-600' : 'text-gray-400'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-900">{report.name}</p>
                      <p className="text-sm text-gray-500">{report.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="card">
            <h3 className="card-header flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Date Range
            </h3>
            
            {selectedReport === 'monthly-comparison' ? (
              <div>
                <label className="label">Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="input"
                >
                  {[2024, 2025, 2026].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setQuickDate('thisMonth')}
                    className="btn-secondary text-xs px-2 py-1"
                  >
                    This Month
                  </button>
                  <button
                    onClick={() => setQuickDate('lastMonth')}
                    className="btn-secondary text-xs px-2 py-1"
                  >
                    Last Month
                  </button>
                  <button
                    onClick={() => setQuickDate('thisYear')}
                    className="btn-secondary text-xs px-2 py-1"
                  >
                    This Year
                  </button>
                </div>
                <div>
                  <label className="label">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input"
                  />
                </div>
              </div>
            )}

            <button
              onClick={generateReport}
              disabled={loading}
              className="btn-primary w-full mt-4"
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>

        {/* Report Display */}
        <div className="lg:col-span-2">
          {!reportData ? (
            <div className="card h-full flex items-center justify-center min-h-[400px]">
              <div className="text-center text-gray-500">
                <ChartBarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Select a report and click Generate to view</p>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">{reportData.report_type}</h3>
                  <p className="text-sm text-gray-500">
                    {reportData.period?.start && reportData.period?.end
                      ? `${reportData.period.start} to ${reportData.period.end}`
                      : reportData.period?.start_date && reportData.period?.end_date
                      ? `${reportData.period.start_date} to ${reportData.period.end_date}`
                      : `Year ${reportData.year}`}
                  </p>
                </div>
                {reportData.generated_at && (
                  <span className="text-xs text-gray-400">
                    Generated: {format(new Date(reportData.generated_at), 'PPp')}
                  </span>
                )}
              </div>

              {/* Income Statement Report */}
              {selectedReport === 'income-statement' && (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-600">Total Income</p>
                      <p className="text-2xl font-bold text-green-700">
                        {formatCurrency(reportData.summary.total_income)}
                      </p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-red-600">Total Expenses</p>
                      <p className="text-2xl font-bold text-red-700">
                        {formatCurrency(reportData.summary.total_expenses)}
                      </p>
                    </div>
                    <div className={`p-4 rounded-lg ${
                      reportData.summary.net_income >= 0 ? 'bg-blue-50' : 'bg-orange-50'
                    }`}>
                      <p className={`text-sm ${
                        reportData.summary.net_income >= 0 ? 'text-blue-600' : 'text-orange-600'
                      }`}>Net Income</p>
                      <p className={`text-2xl font-bold ${
                        reportData.summary.net_income >= 0 ? 'text-blue-700' : 'text-orange-700'
                      }`}>
                        {formatCurrency(reportData.summary.net_income)}
                      </p>
                    </div>
                  </div>

                  {/* Income Details */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">Income by Category</h4>
                    {reportData.income.length > 0 ? (
                      <div className="space-y-2">
                        {reportData.income.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">{item.category}</span>
                            <span className="font-medium text-green-600">{formatCurrency(item.amount)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">No income recorded</p>
                    )}
                  </div>

                  {/* Expense Details */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">Expenses by Category</h4>
                    {reportData.expenses.length > 0 ? (
                      <div className="space-y-2">
                        {reportData.expenses.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">{item.category}</span>
                            <span className="font-medium text-red-600">{formatCurrency(item.amount)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">No expenses recorded</p>
                    )}
                  </div>
                </div>
              )}

              {/* Monthly Comparison Report */}
              {selectedReport === 'monthly-comparison' && (
                <div>
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Month</th>
                          <th className="text-right">Income</th>
                          <th className="text-right">Expenses</th>
                          <th className="text-right">Net</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {reportData.months.map((month: any) => (
                          <tr key={month.month}>
                            <td>{month.month_name}</td>
                            <td className="text-right text-green-600">{formatCurrency(month.income)}</td>
                            <td className="text-right text-red-600">{formatCurrency(month.expenses)}</td>
                            <td className={`text-right font-medium ${
                              month.net >= 0 ? 'text-blue-600' : 'text-orange-600'
                            }`}>
                              {formatCurrency(month.net)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr className="font-bold">
                          <td>TOTAL</td>
                          <td className="text-right text-green-600">{formatCurrency(reportData.totals.income)}</td>
                          <td className="text-right text-red-600">{formatCurrency(reportData.totals.expenses)}</td>
                          <td className={`text-right ${
                            reportData.totals.net >= 0 ? 'text-blue-600' : 'text-orange-600'
                          }`}>
                            {formatCurrency(reportData.totals.net)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
