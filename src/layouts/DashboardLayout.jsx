// Dashboard layout with sidebar navigation
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, FileText, FolderOpen, Video,
  Trophy, BarChart3, Sparkles, Settings, LogOut,
  Zap, Menu, X, ExternalLink, ChevronRight, Bell
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: FileText, label: 'Resume', path: '/dashboard/resume' },
  { icon: FolderOpen, label: 'Projects', path: '/dashboard/projects' },
  { icon: Video, label: 'Videos', path: '/dashboard/videos' },
  { icon: Trophy, label: 'Achievements', path: '/dashboard/achievements' },
  { icon: BarChart3, label: 'Analytics', path: '/dashboard/analytics' },
  { icon: Sparkles, label: 'AI Tools', path: '/dashboard/ai-tools' },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
]

function Sidebar({ mobile = false, onClose }) {
  const { user, profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    toast.success('Signed out successfully')
    navigate('/')
  }

  const username = profile?.username || user?.email?.split('@')[0] || 'user'

  return (
    <div className={`flex flex-col h-full ${mobile ? 'p-4' : ''}`}>
      {/* Logo */}
      <div className="p-6 flex items-center justify-between border-b border-white/5">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
            <Zap size={15} className="text-white" fill="white" />
          </div>
          <span className="font-bold gradient-text">CareerDNA</span>
        </Link>
        {mobile && (
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X size={20} />
          </button>
        )}
      </div>

      {/* User profile mini */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
            {(profile?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-white truncate">
              {profile?.full_name || user?.email?.split('@')[0] || 'User'}
            </div>
            <div className="text-xs text-white/30 truncate">@{username}</div>
          </div>
          <ChevronRight size={14} className="text-white/20 flex-shrink-0 ml-auto" />
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path))

            return (
              <Link
                key={item.path + item.label}
                to={item.path}
                onClick={mobile ? onClose : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-violet-500/15 text-violet-300 border border-violet-500/20'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-violet-400' : 'group-hover:text-white/70'} />
                {item.label}
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom actions */}
      <div className="p-4 border-t border-white/5 space-y-2">
        {/* View public profile */}
        <a
          href={`/u/${username}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all group"
        >
          <ExternalLink size={18} className="group-hover:text-violet-400 transition-colors" />
          View Public Profile
        </a>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all group"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { profile, user } = useAuth()

  return (
    <div className="min-h-screen bg-[#050510] flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col bg-[#080818] border-r border-white/5 fixed left-0 top-0 bottom-0 z-40">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-[#080818] border-r border-white/5 z-50 overflow-y-auto"
            >
              <Sidebar mobile onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center justify-between px-4 py-4 border-b border-white/5 bg-[#080818] sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors"
          >
            <Menu size={22} />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
              <Zap size={13} className="text-white" fill="white" />
            </div>
            <span className="font-bold gradient-text text-sm">CareerDNA</span>
          </Link>
          <button className="p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white">
            <Bell size={20} />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
