import {
  HomeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  DocumentChartBarIcon,
  UsersIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';

interface SectionProps {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  children: React.ReactNode;
}

function Section({ icon: Icon, iconColor, title, children }: SectionProps) {
  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconColor}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
        {children}
      </div>
    </div>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-blue-800 text-sm">
      <span className="font-semibold">Tip: </span>{children}
    </div>
  );
}

function RoleBadge({ role, color }: { role: string; color: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {role}
    </span>
  );
}

export default function Help() {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <QuestionMarkCircleIcon className="w-7 h-7 text-primary-600" />
          Help & User Guide
        </h1>
        <p className="text-gray-600 mt-1">Everything you need to know about Church Excellence financial management.</p>
      </div>

      {/* Dashboard */}
      <Section icon={HomeIcon} iconColor="bg-primary-600" title="Dashboard">
        <p>
          The <strong>Dashboard</strong> is your financial overview at a glance. It shows:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Total Income</strong> — all approved income recorded this month</li>
          <li><strong>Total Expenses</strong> — all expense entries this month</li>
          <li><strong>Net Balance</strong> — income minus expenses; green means surplus, red means deficit</li>
          <li><strong>Recent Transactions</strong> — last 10 income and expense entries</li>
        </ul>
        <Tip>Check the dashboard every Sunday after service to confirm tithes and offerings were captured correctly.</Tip>
      </Section>

      {/* Income */}
      <Section icon={ArrowTrendingUpIcon} iconColor="bg-green-600" title="Income">
        <p>Record all money coming into the church here — tithes, offerings, donations, and any other income.</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Click <strong>Record Income</strong> to add a new entry</li>
          <li>Choose the correct <strong>Category</strong> (e.g. Tithes, Sunday Offering, Building Fund)</li>
          <li>Enter the <strong>Amount</strong>, <strong>Date</strong>, and <strong>Payer</strong> details</li>
          <li>Add a <strong>Reference Number</strong> (receipt or bank ref) for audit trails</li>
        </ul>
        <Tip>Always record income on the day it's received, not the day it's deposited into the bank.</Tip>
      </Section>

      {/* Expenses */}
      <Section icon={ArrowTrendingDownIcon} iconColor="bg-red-600" title="Expenses">
        <p>Record all money leaving the church — salaries, utilities, maintenance, and ministry expenses.</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Click <strong>Record Expense</strong> and fill in the category, payee, amount, and date</li>
          <li>Include the <strong>Invoice Number</strong> and <strong>Reference Number</strong> for documentation</li>
        </ul>

        <div className="space-y-2 mt-2">
          <p className="font-medium text-gray-900">Understanding Expense Status</p>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="badge badge-warning">Pending</span>
            <span>Recorded but not yet approved. This shows for entries added by non-admin users, or before the approval workflow.</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <span className="badge badge-success flex items-center gap-1 w-fit">
              <CheckCircleIcon className="w-3 h-3" /> Approved
            </span>
            <span>The expense has been reviewed and approved by an Admin or Finance user. It is included in financial reports.</span>
          </div>
        </div>

        <div className="flex items-start gap-2 mt-2">
          <ClockIcon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p>
            <strong>How to approve a pending expense:</strong> Admin and Finance users will see a green{' '}
            <CheckCircleIcon className="w-4 h-4 inline text-green-600" /> tick button next to pending expenses.
            Click it to approve. New expenses recorded by Admin or Finance are auto-approved immediately.
          </p>
        </div>

        <Tip>Keep every invoice or receipt and attach the reference number when recording. This simplifies your annual audit.</Tip>
      </Section>

      {/* Budget */}
      <Section icon={ChartBarIcon} iconColor="bg-amber-600" title="Budget">
        <p>
          The <strong>Budget</strong> section allows leadership to set annual financial targets and compare them against actuals.
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Create a new budget for the current financial year</li>
          <li>Add budget line items for both income and expense categories</li>
          <li>The system compares budgeted vs. actual figures so you can see variances</li>
          <li>Only Admin users can approve a budget</li>
        </ul>
        <Tip>Set your budget at the start of each year and review it quarterly against actuals in the Reports section.</Tip>
      </Section>

      {/* Reports */}
      <Section icon={DocumentChartBarIcon} iconColor="bg-purple-600" title="Reports">
        <p>
          Generate financial reports to understand where the church stands financially.
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>Income Statement</strong> — income vs. expenses for a selected period</li>
          <li><strong>Category Breakdown</strong> — see which categories contribute most to income/expenses</li>
          <li><strong>Monthly Trend</strong> — track how finances change over time</li>
        </ul>
        <ol className="list-decimal list-inside space-y-1 ml-2 mt-2">
          <li>Select a <strong>Report Type</strong> from the dropdown</li>
          <li>Choose a <strong>Date Range</strong> (or pick a preset like "This Month")</li>
          <li>Click <strong>Generate Report</strong></li>
        </ol>
        <Tip>Run the Income Statement before every board/trustees meeting to give leadership an accurate financial picture.</Tip>
      </Section>

      {/* Users */}
      <Section icon={UsersIcon} iconColor="bg-indigo-600" title="Users (Admin only)">
        <p>
          Manage who has access to your church's financial data. Only <strong>Admin</strong> users can access this section.
        </p>

        <div className="space-y-2 mt-1">
          <p className="font-medium text-gray-900">Roles & Permissions</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2">Role</th>
                  <th className="text-left px-3 py-2">What they can do</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-3 py-2"><RoleBadge role="Admin" color="bg-purple-100 text-purple-700" /></td>
                  <td className="px-3 py-2">Full access — income, expenses, budget, reports, users, settings</td>
                </tr>
                <tr>
                  <td className="px-3 py-2"><RoleBadge role="Finance" color="bg-blue-100 text-blue-700" /></td>
                  <td className="px-3 py-2">Record and approve income & expenses, view reports and budget</td>
                </tr>
                <tr>
                  <td className="px-3 py-2"><RoleBadge role="Leader" color="bg-amber-100 text-amber-700" /></td>
                  <td className="px-3 py-2">View-only access to dashboard and reports</td>
                </tr>
                <tr>
                  <td className="px-3 py-2"><RoleBadge role="Member" color="bg-gray-100 text-gray-700" /></td>
                  <td className="px-3 py-2">View dashboard summary only</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
          <li>Click <strong>Add User</strong> to create a new login for a team member</li>
          <li>Use the <strong>Edit</strong> button to change someone's name, role, or activate/deactivate their account</li>
          <li>Use <strong>Reset Password</strong> to set a new password for a user who is locked out</li>
        </ul>
        <Tip>Deactivate a user instead of deleting them — this preserves the audit trail of entries they recorded.</Tip>
      </Section>

      {/* Settings */}
      <Section icon={Cog6ToothIcon} iconColor="bg-gray-600" title="Settings">
        <p>Update your church profile details such as the church name, contact information, and financial year settings.</p>
        <Tip>Keep your church name and contact details up to date — they appear on generated reports.</Tip>
      </Section>

      {/* Security */}
      <Section icon={ShieldCheckIcon} iconColor="bg-teal-600" title="Security & Access">
        <p>Church Excellence takes data security seriously:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>All passwords are encrypted and never stored in plain text</li>
          <li>Each church's data is completely isolated — no other church can see your records</li>
          <li>Sessions expire automatically for security</li>
          <li>If you forget your password, contact your church Admin to reset it via the Users section</li>
        </ul>
        <Tip>Only give Admin access to people who genuinely need it. Finance role is sufficient for bookkeepers.</Tip>
      </Section>

      {/* Footer */}
      <div className="text-center text-sm text-gray-400 py-4">
        Church Excellence — Built for Kingdom stewardship
      </div>
    </div>
  );
}
