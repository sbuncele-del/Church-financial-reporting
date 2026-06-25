import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import {
  HomeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  CurrencyDollarIcon,
  DocumentChartBarIcon,
  BuildingLibraryIcon,
  GlobeAltIcon,
  UsersIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  {
    name: '📊 Financial Health',
    icon: CurrencyDollarIcon,
    color: 'amber',
    children: [
      { name: 'Income', href: '/solar/resources/financial/income', icon: ArrowTrendingUpIcon },
      { name: 'Expenses', href: '/solar/resources/financial/expenses', icon: ArrowTrendingDownIcon },
      { name: 'Budget', href: '/solar/resources/financial/budget', icon: ChartBarIcon },
      { name: 'Reports', href: '/solar/resources/financial/reports', icon: DocumentChartBarIcon },
    ],
  },
  { name: 'Users', href: '/settings/users', icon: UsersIcon, adminOnly: true },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  { name: 'Help & Guide', href: '/help', icon: QuestionMarkCircleIcon },
];

const platformNavigation = [
  { name: "Platform Overview", href: '/platform', icon: GlobeAltIcon },
  { name: "All Organisations", href: '/platform', icon: BuildingLibraryIcon },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    '📊 Financial Health': true,
  });
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const isSuperAdmin = user?.role === 'super_admin';

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
            <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-[#0f172a]">
              <svg viewBox="0 0 64 64" className="w-10 h-10">
                <defs>
                  <linearGradient id="favbg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0f172a"/>
                    <stop offset="100%" stopColor="#1e3a8a"/>
                  </linearGradient>
                </defs>
                <rect width="64" height="64" rx="14" fill="url(#favbg)"/>
                <polygon points="32,9 21,25 32,25" fill="#f59e0b"/>
                <polygon points="32,9 32,25 43,25" fill="#d4af37"/>
                <polygon points="21,25 32,25 32,56" fill="#d4af37"/>
                <polygon points="32,25 43,25 32,56" fill="#b45309"/>
                <line x1="21" y1="25" x2="43" y2="25" stroke="#fef9ee" strokeWidth="1.2" strokeOpacity="0.8"/>
              </svg>
            </div>
            <div>
              <span className="font-semibold text-gray-900 text-sm leading-tight block">Church Excellence</span>
              {!isSuperAdmin && user?.church_name && (
                <span className="text-xs text-gray-400 leading-tight block truncate max-w-[140px]">{user.church_name}</span>
              )}
              {isSuperAdmin && (
                <span className="text-xs text-indigo-500 leading-tight block">God's Eye Platform</span>
              )}
            </div>
          </div>
          <button 
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setSidebarOpen(false)}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
          {isSuperAdmin ? (
            // Platform / God's Eye nav for super admin
            <>
              <div className="px-3 py-1.5 mb-2">
                <span className="text-xs font-semibold text-indigo-500 uppercase tracking-widest">
                  God's Eye Platform
                </span>
              </div>
              {platformNavigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </NavLink>
              ))}
            </>
          ) : (
            // Standard church user nav
            navigation.filter((item: any) => !item.adminOnly || user?.role === 'admin').map((item) => (
              item.children ? (
                <div key={item.name}>
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className="w-full sidebar-link justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${expandedMenus[item.name] ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedMenus[item.name] && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-100 pl-2">
                      {item.children.map((child: any) => (
                        child.isSubMenu ? (
                          <div key={child.name}>
                            <button
                              onClick={() => toggleMenu(child.name)}
                              className="w-full sidebar-link justify-between text-xs py-1.5"
                            >
                              <span className="font-medium text-gray-700">📊 {child.name}</span>
                              <ChevronDownIcon className={`w-3 h-3 transition-transform ${expandedMenus[child.name] ? 'rotate-180' : ''}`} />
                            </button>
                            {expandedMenus[child.name] && (
                              <div className="ml-3 mt-1 space-y-1 border-l border-gray-200 pl-2">
                                {child.children.map((subChild: any) => (
                                  <NavLink
                                    key={subChild.name}
                                    to={subChild.href}
                                    className={({ isActive }) =>
                                      `sidebar-link text-xs py-1.5 ${isActive ? 'active' : ''}`
                                    }
                                    onClick={() => setSidebarOpen(false)}
                                  >
                                    <subChild.icon className="w-3.5 h-3.5" />
                                    {subChild.name}
                                  </NavLink>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <NavLink
                            key={child.name}
                            to={child.href}
                            className={({ isActive }) =>
                              `sidebar-link text-xs py-1.5 ${isActive ? 'active' : ''}`
                            }
                            onClick={() => setSidebarOpen(false)}
                          >
                            <child.icon className="w-4 h-4" />
                            {child.name}
                          </NavLink>
                        )
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
            ))
          )}
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
