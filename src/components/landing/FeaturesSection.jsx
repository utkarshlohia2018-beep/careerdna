// Features section — showcase all platform capabilities
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import {
  FileText, Globe, Video, Trophy, Brain, BarChart3,
  GitBranch, Link2, Sparkles, Shield, Zap, Users
} from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Resume',
    desc: 'Get your resume analyzed, improved, and ATS-scored by GPT-4. Stand out in every application.',
    color: 'from-violet-500 to-purple-600',
    glow: 'rgba(124, 58, 237, 0.3)',
  },
  {
    icon: Globe,
    title: 'Live Portfolio Website',
    desc: 'Your profile becomes a stunning public portfolio page. Share one link for everything.',
    color: 'from-blue-500 to-cyan-500',
    glow: 'rgba(37, 99, 235, 0.3)',
  },
  {
    icon: Video,
    title: 'Video Showcase',
    desc: 'Upload intro videos, project demos, and achievement clips. Show, don\'t just tell.',
    color: 'from-pink-500 to-rose-500',
    glow: 'rgba(236, 72, 153, 0.3)',
  },
  {
    icon: Trophy,
    title: 'Achievement Timeline',
    desc: 'Certificates, hackathons, internships, awards — displayed in a beautiful animated timeline.',
    color: 'from-amber-500 to-orange-500',
    glow: 'rgba(245, 158, 11, 0.3)',
  },
  {
    icon: GitBranch,
    title: 'Project Showcase',
    desc: 'Add GitHub links, live demos, tech stacks, screenshots, and project videos all in one place.',
    color: 'from-emerald-500 to-teal-500',
    glow: 'rgba(16, 185, 129, 0.3)',
  },
  {
    icon: BarChart3,
    title: 'Profile Analytics',
    desc: 'Track profile views, project clicks, video plays, and resume downloads in real-time.',
    color: 'from-cyan-500 to-blue-500',
    glow: 'rgba(6, 182, 212, 0.3)',
  },
  {
    icon: Sparkles,
    title: 'AI Bio Writer',
    desc: 'Generate compelling professional bios, cover letters, and career summaries with one click.',
    color: 'from-violet-500 to-pink-500',
    glow: 'rgba(124, 58, 237, 0.3)',
  },
  {
    icon: Shield,
    title: 'ATS Score Engine',
    desc: 'Know exactly how your resume performs with any ATS system. Get actionable improvement tips.',
    color: 'from-green-500 to-emerald-500',
    glow: 'rgba(34, 197, 94, 0.3)',
  },
  {
    icon: Zap,
    title: 'Instant Updates',
    desc: 'Edit your dashboard once. Your public profile updates everywhere, in real-time.',
    color: 'from-yellow-500 to-orange-500',
    glow: 'rgba(234, 179, 8, 0.3)',
  },
  {
    icon: Users,
    title: 'Interview Prep',
    desc: 'AI-generated interview questions tailored to your target role and skill set.',
    color: 'from-indigo-500 to-violet-500',
    glow: 'rgba(99, 102, 241, 0.3)',
  },
  {
    icon: Link2,
    title: 'One Public Link',
    desc: 'careerdna.app/u/yourname — share everything with recruiters in one professional URL.',
    color: 'from-rose-500 to-pink-500',
    glow: 'rgba(244, 63, 94, 0.3)',
  },
  {
    icon: FileText,
    title: 'PDF Resume Export',
    desc: 'Download a beautifully formatted, ATS-optimized PDF resume anytime.',
    color: 'from-teal-500 to-cyan-500',
    glow: 'rgba(20, 184, 166, 0.3)',
  },
]

function FeatureCard({ feature, index }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })
  const Icon = feature.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: (index % 3) * 0.1 }}
      className="group relative glass glass-hover rounded-2xl p-6 overflow-hidden"
    >
      {/* Background glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
        style={{ background: `radial-gradient(circle at 50% 50%, ${feature.glow}, transparent 70%)` }}
      />

      <div className="relative z-10">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={22} className="text-white" />
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-violet-300 transition-colors">
          {feature.title}
        </h3>
        <p className="text-white/40 text-sm leading-relaxed group-hover:text-white/60 transition-colors">
          {feature.desc}
        </p>
      </div>
    </motion.div>
  )
}

export default function FeaturesSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section id="features" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-violet-500/20 text-violet-300 text-sm mb-6">
            <Sparkles size={14} />
            Everything you need to stand out
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            Your Complete
            <span className="gradient-text"> Professional Arsenal</span>
          </h2>
          <p className="text-white/40 text-lg max-w-2xl mx-auto">
            CareerDNA replaces 10 different tools with one platform.
            AI-powered, beautiful, and built for serious professionals.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
