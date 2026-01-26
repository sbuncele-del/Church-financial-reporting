import { useAuthStore } from '../stores/authStore';

export default function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and church settings</p>
      </div>

      {/* Profile Section */}
      <div className="card">
        <h3 className="card-header">Profile Information</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-2xl text-primary-700 font-medium">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </span>
            </div>
            <div>
              <p className="font-semibold text-lg">{user?.first_name} {user?.last_name}</p>
              <p className="text-gray-500">{user?.email}</p>
              <span className="badge badge-info capitalize mt-1">{user?.role?.replace('_', ' ')}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div>
              <label className="label">First Name</label>
              <input
                type="text"
                className="input"
                defaultValue={user?.first_name}
                disabled
              />
            </div>
            <div>
              <label className="label">Last Name</label>
              <input
                type="text"
                className="input"
                defaultValue={user?.last_name}
                disabled
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                defaultValue={user?.email}
                disabled
              />
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                type="tel"
                className="input"
                defaultValue={user?.phone || ''}
                placeholder="Not set"
                disabled
              />
            </div>
          </div>
        </div>
      </div>

      {/* Account Section */}
      <div className="card">
        <h3 className="card-header">Account Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium">Change Password</p>
              <p className="text-sm text-gray-500">Update your password regularly for security</p>
            </div>
            <button className="btn-secondary" disabled>Change</button>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
            </div>
            <button className="btn-secondary" disabled>Enable</button>
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-gray-500">Receive email updates about important activity</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked disabled />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Church Settings (Admin only) */}
      {(user?.role === 'admin' || user?.role === 'super_admin') && (
        <div className="card">
          <h3 className="card-header">Church Settings</h3>
          <p className="text-gray-500 text-sm mb-4">
            These settings affect the entire organization.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Currency</label>
              <select className="input" defaultValue="USD" disabled>
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
              </select>
            </div>
            <div>
              <label className="label">Fiscal Year Start</label>
              <select className="input" defaultValue="1" disabled>
                <option value="1">January</option>
                <option value="4">April</option>
                <option value="7">July</option>
                <option value="10">October</option>
              </select>
            </div>
            <div>
              <label className="label">Timezone</label>
              <select className="input" defaultValue="America/New_York" disabled>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Danger Zone */}
      <div className="card border-red-200">
        <h3 className="card-header text-red-600">Danger Zone</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Delete Account</p>
            <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
          </div>
          <button className="btn-danger" disabled>Delete Account</button>
        </div>
      </div>
    </div>
  );
}
