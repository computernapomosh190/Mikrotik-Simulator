import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useState, type ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Trophy,
  Award,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Menu,
  X,
  Globe,
  Server,
} from 'lucide-react';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/courses', label: 'Courses', icon: BookOpen },
  { to: '/labs', label: 'Labs', icon: Server },
  { to: '/achievements', label: 'Achievements', icon: Trophy },
  { to: '/certificates', label: 'Certificates', icon: Award },
  { to: '/leaderboard', label: 'Leaderboard', icon: Globe },
];

export function Layout({ children }: { children?: ReactNode }) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-navy-900">
      <header className="fixed top-0 left-0 right-0 h-16 bg-navy-800 border-b border-navy-700 z-50 lg:pl-64">
        <div className="flex items-center justify-between h-full px-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-navy-700 transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-3 lg:hidden">
            <GraduationCap className="w-6 h-6 text-primary-500" />
            <span className="font-semibold text-white">MikroTik Lab</span>
          </div>

          <div className="flex-1 hidden lg:block">
            <h1 className="text-lg font-semibold text-gray-100">
              {NAV_LINKS.find(l => location.pathname.startsWith(l.to))?.label || 'MikroTik Lab Simulator'}
            </h1>
          </div>

          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-navy-700 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-teal flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-white">{profile?.displayName || profile?.username}</p>
                <p className="text-xs text-gray-400">Level {profile?.currentLevel || 1}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>

            {profileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-navy-800 border border-navy-700 rounded-lg shadow-xl z-50 overflow-hidden">
                  <div className="p-3 border-b border-navy-700">
                    <p className="font-medium text-white">{profile?.displayName || profile?.username}</p>
                    <p className="text-sm text-gray-400">{profile?.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 text-xs bg-primary-500/20 text-primary-400 rounded-full">
                        {profile?.role}
                      </span>
                      <span className="text-xs text-gray-500">
                        {profile?.totalLabsCompleted || 0} labs completed
                      </span>
                    </div>
                  </div>
                  <div className="py-1">
                    <NavLink
                      to="/settings"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-navy-700 hover:text-white transition-colors"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </NavLink>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-navy-700 hover:text-white transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-navy-800 border-r border-navy-700 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 h-16 px-6 border-b border-navy-700">
          <GraduationCap className="w-8 h-8 text-primary-500" />
          <div>
            <h1 className="font-bold text-white">MikroTik Lab</h1>
            <p className="text-xs text-gray-400">Simulator Platform</p>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-500/10 text-primary-400 border-l-2 border-primary-500'
                    : 'text-gray-300 hover:bg-navy-700 hover:text-white'
                }`
              }
            >
              <link.icon className="w-5 h-5" />
              <span className="font-medium">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {profile && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-navy-700 bg-navy-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-teal flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{profile.displayName || profile.username}</p>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Trophy className="w-3 h-3 text-accent-orange" />
                  <span>{profile.rating || 0} pts</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="lg:pl-64 pt-16 min-h-screen">
        {children ?? <Outlet />}
      </main>
    </div>
  );
}
