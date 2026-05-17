// Analytics page — profile views, downloads, clicks with charts
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'
import { Eye, Download, MousePointer, Play, TrendingUp, Calendar, BarChart3 } from 'lucide-react'
import DashboardLayout from '@/layouts/DashboardLayout'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

// Generate placeholder analytics data for demo
function generateMockData(days = 14) {
  return Array.from({ length: days }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (days - 1 - i))
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      views: Math.floor(Math.random() * 50) + 5,
      downloads: Math.floor(Math.random() * 10),
      clicks: Math.floor(Math.random() * 30) + 2,
      plays: Math.floor(Math.random() * 20),
    }
  })
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-xl p-3 border border-white/10 text-xs">
      <p className="text-white/60 mb-2">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [data, setData] = useState(generateMockData())
  const [period, setPeriod] = useState('14d')
  const [loading, setLoading] = useState(false)

  const totals = data.reduce((acc, d) => ({
    views: acc.views + d.views,
    downloads: acc.downloads + d.downloads,
    clicks: acc.clicks + d.clicks,
    plays: acc.plays + d.plays,
  }), { views: 0, downloads: 0, clicks: 0, plays: 0 })

  const statCards = [
    { icon: Eye, label: 'Profile Views', value: totals.views, color: 'from-violet-500 to-purple-600', change: '+23%' },
    { icon: Download, label: 'Resume Downloads', value: totals.downloads, color: 'from-blue-500 to-cyan-500', change: '+8%' },
    { icon: MousePointer, label: 'Project Clicks', value: totals.clicks, color: 'from-pink-500 to-rose-500', change: '+15%' },
    { icon: Play, label: 'Video Plays', value: totals.plays, color: 'from-amber-500 to-orange-500', change: '+31%' },
  ]

  function changePeriod(p) {
    setPeriod(p)
    const days = p === '7d' ? 7 : p === '30d' ? 30 : 14
    setData(generateMockData(days))
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">Analytics</h1>
          <p className="text-white/40">Track how your profile is performing</p>
        </div>
        <div className="flex gap-2">
          {['7d', '14d', '30d'].map(p => (
            <button
              key={p}
              onClick={() => changePeriod(p)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                period === p
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              {p === '7d' ? '7 Days' : p === '14d' ? '2 Weeks' : '30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} animate delay={i * 0.1} className="relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 blur-2xl rounded-full`} />
              <div className="relative z-10">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                  <Icon size={18} className="text-white" />
                </div>
                <p className="text-white/40 text-xs mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-emerald-400 text-xs mt-1 flex items-center gap-0.5">
                  <TrendingUp size={10} /> {stat.change} vs prev
                </p>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Views chart */}
        <Card animate delay={0.2}>
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Eye size={18} className="text-violet-400" /> Profile Views
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="views" stroke="#7c3aed" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* All metrics bar chart */}
        <Card animate delay={0.3}>
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 size={18} className="text-blue-400" /> Activity Overview
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.slice(-7)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="views" fill="#7c3aed" radius={[4,4,0,0]} />
              <Bar dataKey="clicks" fill="#2563eb" radius={[4,4,0,0]} />
              <Bar dataKey="plays" fill="#ec4899" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Traffic sources / insights */}
      <Card animate delay={0.4}>
        <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
          <TrendingUp size={18} className="text-emerald-400" /> Insights
        </h2>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { label: 'Best performing day', value: 'Tuesday', note: 'Most profile views' },
            { label: 'Most clicked project', value: 'Project #1', note: 'Based on your data' },
            { label: 'Profile completion', value: '65%', note: 'Complete it to get more views' },
          ].map(insight => (
            <div key={insight.label} className="bg-white/[0.02] rounded-xl p-4 border border-white/5">
              <p className="text-white/30 text-xs mb-2">{insight.label}</p>
              <p className="text-white text-xl font-bold mb-1">{insight.value}</p>
              <p className="text-white/20 text-xs">{insight.note}</p>
            </div>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  )
}
