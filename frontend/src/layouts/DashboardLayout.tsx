import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import {
  HomeIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  UsersIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  SparklesIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  {
    name: 'SOLAR Health',
    icon: SparklesIcon,
    children: [
      { name: 'Dashboard', href: '/solar/dashboard', icon: ChartBarIcon },
      { name: 'Assessment', href: '/solar/assessment', icon: ClipboardDocumentCheckIcon },
    ],
  },
  {
    name: 'Finance',
    icon: BanknotesIcon,
    children: [
      { name: 'Income', href: '/finance/income', icon: ArrowTrendingUpIcon },
      { name: 'Expenses', href: '/finance/expenses', icon: ArrowTrendingDownIcon },
      { name: 'Reports', href: '/finance/reports', icon: ChartBarIcon },
    ],
  },
  { name: 'Members', href: '/members', icon: UsersIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    'SOLAR Health': true,
    'Finance': true,
  });
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 8.5V11h2v9h6v-5h4v5h6v-9h2V8.5L12 2zm0 2.5l7 4.5v1H5v-1l7-4.5z"/>
              </svg>
            </div>
            <span className="font-semibold text-gray-900">ChurchMS</span>
          </div>
          <button 
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setSidebarOpen(false)}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigation.map((item) => (
            item.children ? (
              <div key={item.name}>
                <button
                  onClick={() => toggleMenu(item.name)}
                  className="w-full sidebar-link justify-between"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </div>
                  <ChevronDownIcon className={`w-4 h-4 transition-transform ${expandedMenus[item.name] ? 'rotate-180' : ''}`} />
                </button>
                {expandedMenus[item.name] && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.name}
                        to={child.href}
                        className={({ isActive }) => 
                          `sidebar-link text-sm ${isActive ? 'active' : ''}`
                        }
                        onClick={() => setSidebarOpen(false)}
                      >
                        <child.icon className="w-4 h-4" />
                        {child.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) => 
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            )
          ))}
        </nav>

        {/* User section at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-700 font-medium">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-8">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 mr-4"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          
          <div className="flex-1">
            {/* Can add breadcrumbs or page title here */}
          </div>

          {/* Header right side */}
          <div className="flex items-center gap-4">
            <span className="badge badge-info capitalize">{user?.role?.replace('_', ' ')}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
