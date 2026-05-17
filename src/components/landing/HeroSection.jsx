// Hero section — the first thing visitors see
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ArrowRight, Play, Star, Users, Briefcase } from 'lucide-react'
import Button from '@/components/ui/Button'

// Floating stat cards shown in the hero
const stats = [
  { icon: Users, label: 'Professionals', value: '50K+', color: 'from-violet-500 to-purple-600' },
  { icon: Star, label: 'ATS Score avg.', value: '94%', color: 'from-blue-500 to-cyan-500' },
  { icon: Briefcase, label: 'Jobs Landed', value: '12K+', color: 'from-pink-500 to-rose-500' },
]

// Mouse-following glow effect
function MouseGlow() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 })
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 })

  useEffect(() => {
    const handleMouse = (e) => {
      mouseX.set(e.clientX - 300)
      mouseY.set(e.clientY - 300)
    }
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [mouseX, mouseY])

  return (
    <motion.div
      style={{ x: springX, y: springY }}
      className="pointer-events-none fixed top-0 left-0 w-[600px] h-[600px] rounded-full opacity-[0.15] blur-3xl bg-gradient-radial from-violet-600 to-transparent z-0"
    />
  )
}

// Animated background orbs
function BackgroundOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl animate-float" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-cyan-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
    </div>
  )
}

// Floating stat card
function StatCard({ stat, delay, className }) {
  const Icon = stat.icon
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: 'easeOut' }}
      className={`glass rounded-2xl p-4 flex items-center gap-3 animate-float ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center flex-shrink-0`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <div className="text-lg font-bold text-white">{stat.value}</div>
        <div className="text-xs text-white/40">{stat.label}</div>
      </div>
    </motion.div>
  )
}

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden grid-bg">
      <MouseGlow />
      <BackgroundOrbs />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050510] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-violet-500/30 text-violet-300 text-sm font-medium mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          AI-Powered Professional Identity Platform
          <ArrowRight size={14} />
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[1.05] tracking-tight mb-6"
        >
          Your Resume Was
          <br />
          <span className="gradient-text">Never Meant</span>
          <br />
          To Stay Static.
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Build your living professional identity. AI-powered resume, live portfolio,
          project showcase, and career insights — all in one link.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link to="/signup">
            <Button size="xl" className="group relative overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">
                Create Your CareerDNA
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </Button>
          </Link>
          <button
            onClick={() => document.querySelector('#demo')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-2 px-8 py-4 text-white/70 hover:text-white transition-colors text-base font-medium"
          >
            <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:border-violet-500/50 transition-colors">
              <Play size={14} fill="currentColor" />
            </div>
            View Demo
          </button>
        </motion.div>

        {/* Floating stat cards */}
        <div className="relative flex flex-wrap justify-center gap-4 mb-16">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} delay={0.5 + i * 0.15} />
          ))}
        </div>

        {/* Browser mockup / profile preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="relative max-w-4xl mx-auto"
        >
          {/* Glow behind mockup */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-blue-600/20 to-cyan-600/20 rounded-3xl blur-3xl scale-95" />

          {/* Browser chrome */}
          <div className="relative glass rounded-2xl overflow-hidden border border-white/10">
            {/* Browser top bar */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <div className="flex-1 bg-white/5 rounded-lg px-3 py-1 text-white/30 text-xs text-left">
                careerdna.app/u/yourname
              </div>
            </div>

            {/* Mock profile preview */}
            <div className="p-8 bg-gradient-to-br from-[#0a0a1f] to-[#050510]">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-3xl font-black text-white">
                    AD
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#050510] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  </div>
                </div>
                {/* Info */}
                <div className="text-left flex-1">
                  <h3 className="text-2xl font-bold text-white mb-1">Alex Designs</h3>
                  <p className="text-violet-400 font-medium mb-3">Full-Stack Engineer & UI Designer</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {['React', 'Node.js', 'Figma', 'TypeScript', 'AWS'].map(skill => (
                      <span key={skill} className="px-3 py-1 rounded-full bg-violet-500/15 text-violet-300 text-xs border border-violet-500/30">
                        {skill}
                      </span>
                    ))}
                  </div>
                  {/* Stats row */}
                  <div className="flex gap-6">
                    {[
                      { v: '12', l: 'Projects' },
                      { v: '8', l: 'Videos' },
                      { v: '94', l: 'ATS Score' },
                    ].map(s => (
                      <div key={s.l} className="text-center">
                        <div className="text-xl font-bold gradient-text">{s.v}</div>
                        <div className="text-white/30 text-xs">{s.l}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* ATS badge */}
                <div className="glass rounded-xl p-4 text-center min-w-[100px]">
                  <div className="text-3xl font-black gradient-text">94</div>
                  <div className="text-white/40 text-xs mt-1">ATS Score</div>
                  <div className="mt-2 w-full bg-white/5 rounded-full h-1.5">
                    <div className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 w-[94%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
