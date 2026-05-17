// How it works — 3 simple steps
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { UserPlus, Sparkles, Share2, ArrowRight } from 'lucide-react'

const steps = [
  {
    num: '01',
    icon: UserPlus,
    title: 'Create Your Profile',
    desc: 'Sign up and fill in your experience, skills, education, and projects. Takes less than 10 minutes.',
    color: 'from-violet-500 to-purple-600',
    detail: 'No design skills needed. Our AI helps you write better descriptions automatically.',
  },
  {
    num: '02',
    icon: Sparkles,
    title: 'Let AI Enhance It',
    desc: 'Our AI analyzes your profile, scores your resume, writes your bio, and suggests improvements.',
    color: 'from-blue-500 to-cyan-500',
    detail: 'Powered by GPT-4o. Optimized for ATS systems used by top companies.',
  },
  {
    num: '03',
    icon: Share2,
    title: 'Share Your Link',
    desc: 'Get your unique careerdna.app/u/yourname link. Share it everywhere — LinkedIn, email, applications.',
    color: 'from-pink-500 to-rose-500',
    detail: 'Real-time updates. Every change you make reflects instantly on your public profile.',
  },
]

export default function HowItWorksSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section id="how-it-works" className="py-32 relative">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-violet-600/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-blue-500/20 text-blue-300 text-sm mb-6">
            <ArrowRight size={14} />
            Three steps to a better career
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Get Started in
            <span className="gradient-text"> Minutes</span>
          </h2>
          <p className="text-white/40 text-lg max-w-xl mx-auto">
            No complicated setup. No design expertise needed. Just sign up and let AI do the heavy lifting.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px bg-gradient-to-r from-violet-500/30 via-blue-500/30 to-pink-500/30" />

          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: i * 0.2 }}
                className="relative text-center group"
              >
                {/* Step number */}
                <div className="relative inline-block mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto relative z-10 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={28} className="text-white" />
                  </div>
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.color} blur-xl opacity-30 group-hover:opacity-50 transition-opacity`} />
                  {/* Step number badge */}
                  <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-[#050510] border border-white/10 flex items-center justify-center text-xs font-bold text-white/50 z-20">
                    {i + 1}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-white/50 mb-4 leading-relaxed">{step.desc}</p>
                <p className="text-white/30 text-sm italic">{step.detail}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
