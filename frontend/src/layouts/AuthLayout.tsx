import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
            <svg className="w-10 h-10 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 8.5V11h2v9h6v-5h4v5h6v-9h2V8.5L12 2zm0 2.5l7 4.5v1H5v-1l7-4.5zM11 5v2h2V5h-2z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Church Management</h1>
          <p className="text-primary-200 mt-1">Church management made simple</p>
        </div>
        
        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <Outlet />
        </div>
        
        {/* Footer */}
        <p className="text-center text-primary-200 text-sm mt-6">
          © 2024 Church Management System
        </p>
      </div>
    </div>
  );
}
