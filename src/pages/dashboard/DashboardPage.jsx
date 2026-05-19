// Dashboard home page — overview with stats, analytics, quick actions
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Eye, Download, MousePointer, Play, ArrowRight,
  Sparkles, FileText, FolderOpen, Video, Trophy,
  TrendingUp, BarChart3, AlertCircle, CheckCircle, Camera
} from 'lucide-react'
import DashboardLayout from '@/layouts/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

// Each item has a path so incomplete items are clickable
const completionItems = [
  { key: 'photo',    label: 'Add profile photo',   points: 10, path: '/dashboard/settings', icon: Camera },
  { key: 'bio',      label: 'Add your bio',         points: 15, path: '/dashboard/settings', icon: FileText },
  { key: 'skills',   label: 'Add skills',           points: 10, path: '/dashboard/settings', icon: Sparkles },
  { key: 'projects', label: 'Add a project',        points: 20, path: '/dashboard/projects', icon: FolderOpen },
  { key: 'resume',   label: 'Upload & analyze resume', points: 25, path: '/dashboard/resume', icon: BarChart3 },
  { key: 'video',    label: 'Upload intro video',   points: 20, path: '/dashboard/videos',   icon: Video },
]

const quickActions = [
  { icon: FileText, label: 'Analyze Resume', desc: 'Get ATS score', path: '/dashboard/resume', color: 'from-violet-500 to-purple-600' },
  { icon: FolderOpen, label: 'Add Project', desc: 'Showcase work', path: '/dashboard/projects', color: 'from-blue-500 to-cyan-500' },
  { icon: Video, label: 'Upload Video', desc: 'Show yourself', path: '/dashboard/videos', color: 'from-pink-500 to-rose-500' },
  { icon: Sparkles, label: 'AI Tools', desc: 'AI career boost', path: '/dashboard/ai-tools', color: 'from-amber-500 to-orange-500' },
]

const AI_TIPS = [
  'Add quantifiable achievements to your resume. "Increased revenue by 30%" beats "improved performance". Recruiters scan for numbers.',
  'Keep your profile headline specific. "React Engineer @ Startups | Open to work" gets 3× more recruiter clicks than generic titles.',
  'Upload a 60-second intro video. Profiles with videos get 5× more recruiter engagement than those without.',
  'Add 8–12 skills to your profile. Recruiter search filters match on skills — more skills = more discoverability.',
  'Link your GitHub to projects. Recruiters verify technical work; a live demo or repo link doubles your credibility.',
]

function StatCard({ icon: Icon, label, value, color, delay }) {
  return (
    <Card animate delay={delay} className="relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br ${color} opacity-10 blur-2xl`} />
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-white/40 text-sm mb-1">{label}</p>
          <p className="text-3xl font-black text-white">{value}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </Card>
  )
}

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const [stats, setStats]               = useState({ views: 0, downloads: 0, clicks: 0, plays: 0 })
  const [atsScore, setAtsScore]         = useState(null)
  const [completedItems, setCompletedItems] = useState([])
  const [tipIndex]                      = useState(() => Math.floor(Math.random() * AI_TIPS.length))
  const [dataLoaded, setDataLoaded]     = useState(false)

  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there'
  const username  = profile?.username || user?.email?.split('@')[0] || 'yourname'

  const totalPoints    = completionItems.reduce((sum, i) => sum + i.points, 0)
  const earnedPoints   = completionItems.filter(i => completedItems.includes(i.key)).reduce((sum, i) => sum + i.points, 0)
  const completionPct  = Math.round((earnedPoints / totalPoints) * 100)

  useEffect(() => {
    if (user) fetchDashboardData()
  }, [user, profile])

  async function fetchDashboardData() {
    // Fetch everything in parallel — single round-trip
    const [analyticsRes, projectsRes, videosRes, resumeRes] = await Promise.all([
      supabase.from('analytics').select('type, count').eq('user_id', user.id),
      supabase.from('projects').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('videos').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('resumes').select('ats_score').eq('user_id', user.id).maybeSingle(),
    ])

    // Stats
    if (analyticsRes.data?.length) {
      const s = { views: 0, downloads: 0, clicks: 0, plays: 0 }
      analyticsRes.data.forEach(r => { s[r.type] = r.count || 0 })
      setStats(s)
    }

    // ATS score
    if (resumeRes.data?.ats_score) setAtsScore(resumeRes.data.ats_score)

    // Completion — combine profile data + fetched counts
    const done = []
    if (profile?.avatar_url) done.push('photo')
    if (profile?.bio?.trim()) done.push('bio')
    if (profile?.skills?.length > 0) done.push('skills')
    if ((projectsRes.count ?? 0) > 0) done.push('projects')
    if (resumeRes.data?.ats_score) done.push('resume')
    if ((videosRes.count ?? 0) > 0) done.push('video')
    setCompletedItems(done)
    setDataLoaded(true)
  }

  return (
    <DashboardLayout>
      {/* Welcome header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-black text-white mb-1"
        >
          Hey, {firstName} 👋
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-white/40">
          Your CareerDNA profile is live at{' '}
          <a href={`/u/${username}`} target="_blank" rel="noreferrer"
            className="text-violet-400 hover:text-violet-300 transition-colors font-medium">
            careerdna.netlify.app/u/{username}
          </a>
        </motion.p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Eye}          label="Profile Views"      value={stats.views}     color="from-violet-500 to-purple-600" delay={0} />
        <StatCard icon={Download}     label="Resume Downloads"   value={stats.downloads} color="from-blue-500 to-cyan-500"     delay={0.1} />
        <StatCard icon={MousePointer} label="Project Clicks"     value={stats.clicks}    color="from-pink-500 to-rose-500"     delay={0.2} />
        <StatCard icon={Play}         label="Video Plays"        value={stats.plays}     color="from-amber-500 to-orange-500"  delay={0.3} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">

          {/* Profile Completion */}
          <Card animate delay={0.2}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">Profile Completion</h2>
                <p className="text-white/40 text-sm">
                  {completionPct === 100
                    ? '🎉 Profile complete! Recruiters can find you.'
                    : `${earnedPoints}/${totalPoints} pts — complete your profile to attract recruiters`}
                </p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black gradient-text">{dataLoaded ? `${completionPct}%` : '…'}</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-white/5 rounded-full h-2 mb-5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPct}%` }}
                transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                className={`h-2 rounded-full ${
                  completionPct === 100
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                    : 'bg-gradient-to-r from-violet-500 to-blue-500'
                }`}
              />
            </div>

            {/* Checklist — incomplete items are links, done items show strikethrough */}
            <div className="space-y-2">
              {completionItems.map((item) => {
                const done = completedItems.includes(item.key)
                const Icon = item.icon
                const row = (
                  <div className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    done
                      ? 'bg-emerald-500/5 border border-emerald-500/10'
                      : 'bg-white/[0.02] border border-white/5 hover:border-violet-500/20 hover:bg-white/[0.04] cursor-pointer'
                  }`}>
                    {done
                      ? <CheckCircle size={18} className="text-emerald-400 flex-shrink-0" />
                      : <Icon size={18} className="text-white/20 flex-shrink-0" />
                    }
                    <span className={`text-sm flex-1 ${done ? 'text-white/40 line-through' : 'text-white/70'}`}>
                      {item.label}
                    </span>
                    <Badge color={done ? 'green' : 'white'}>+{item.points} pts</Badge>
                    {!done && <ArrowRight size={14} className="text-white/20 flex-shrink-0" />}
                  </div>
                )
                return done
                  ? <div key={item.key}>{row}</div>
                  : <Link key={item.key} to={item.path}>{row}</Link>
              })}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card animate delay={0.3}>
            <h2 className="text-lg font-bold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link key={action.label} to={action.path}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="glass glass-hover rounded-xl p-4 flex items-center gap-3 cursor-pointer group"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        <Icon size={18} className="text-white" />
                      </div>
                      <div>
                        <div className="text-white text-sm font-semibold">{action.label}</div>
                        <div className="text-white/30 text-xs">{action.desc}</div>
                      </div>
                    </motion.div>
                  </Link>
                )
              })}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* ATS Score Card */}
          <Card animate delay={0.4} className="text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-blue-600/10" />
            <div className="relative z-10">
              <div className="text-white/40 text-sm mb-3 flex items-center justify-center gap-1.5">
                <BarChart3 size={14} /> ATS Resume Score
              </div>

              <div className="relative inline-flex items-center justify-center mb-4">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                  <motion.circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke="url(#scoreGrad)" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    initial={{ strokeDashoffset: `${2 * Math.PI * 42}` }}
                    animate={{ strokeDashoffset: `${2 * Math.PI * 42 * (1 - (atsScore || 0) / 100)}` }}
                    transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                  />
                  <defs>
                    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute text-center">
                  <div className="text-3xl font-black gradient-text">{atsScore ?? '--'}</div>
                  <div className="text-white/30 text-xs">/100</div>
                </div>
              </div>

              <p className="text-white/40 text-xs mb-4">
                {atsScore
                  ? atsScore >= 80 ? '🎉 Excellent! Top ATS score.'
                  : atsScore >= 60 ? '👍 Good — some improvements possible.'
                  : '⚠️ Needs improvement.'
                  : 'Analyze your resume to get a score'}
              </p>

              <Link to="/dashboard/resume">
                <Button variant="outline" size="sm" fullWidth>
                  {atsScore ? 'Improve Score' : 'Analyze Resume'}
                  <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </Card>

          {/* AI Tip — rotates each visit */}
          <Card animate delay={0.5} className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Sparkles size={14} className="text-white" />
                </div>
                <span className="text-sm font-semibold text-white">AI Career Tip</span>
              </div>
              <p className="text-white/50 text-sm leading-relaxed mb-4">{AI_TIPS[tipIndex]}</p>
              <Link to="/dashboard/ai-tools">
                <Button variant="ghost" size="sm" fullWidth>
                  Get More AI Insights <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </Card>

          {/* Profile link */}
          <Card animate delay={0.6}>
            <h3 className="text-sm font-semibold text-white mb-3">Your Public Link</h3>
            <div className="bg-white/5 rounded-xl p-3 flex items-center gap-2 mb-3">
              <span className="text-white/30 text-xs flex-1 truncate">
                /u/{username}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/u/${username}`)
                  toast.success('Link copied!')
                }}
                className="text-violet-400 hover:text-violet-300 text-xs font-medium flex-shrink-0 transition-colors"
              >
                Copy
              </button>
            </div>
            <a href={`/u/${username}`} target="_blank" rel="noreferrer">
              <Button variant="secondary" size="sm" fullWidth>
                Preview Profile
              </Button>
            </a>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
