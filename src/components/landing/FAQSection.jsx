// FAQ section
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ChevronDown, HelpCircle } from 'lucide-react'

const faqs = [
  {
    q: 'What is CareerDNA exactly?',
    a: 'CareerDNA is an AI-powered professional identity platform. Think of it as a living resume + portfolio + video showcase + analytics dashboard — all accessible through one public link. It goes way beyond a static PDF resume.',
  },
  {
    q: 'How does the AI resume analysis work?',
    a: 'We use OpenAI\'s GPT-4o-mini to analyze your resume text. It checks for ATS compatibility, keyword density, action verbs, quantifiable achievements, and overall structure. You get a score from 0-100 with specific improvement suggestions.',
  },
  {
    q: 'Can recruiters see my profile without me sending a link?',
    a: 'Not by default. Your profile is only visible to people who have your link (careerdna.app/u/yourname). You can also set your profile to private anytime from Settings.',
  },
  {
    q: 'What happens to my videos? Where are they stored?',
    a: 'Videos are stored securely on Cloudinary, a professional media platform used by thousands of companies. They are private to your account and only accessible via your public profile if you make them visible.',
  },
  {
    q: 'Does this replace LinkedIn?',
    a: 'Not exactly — LinkedIn is a network. CareerDNA is your professional identity hub. You can link your CareerDNA profile on LinkedIn to give recruiters a much richer view of your work. They complement each other.',
  },
  {
    q: 'Is my data safe?',
    a: 'Yes. We use Supabase for our database (SOC 2 compliant) and implement row-level security so your data can only be accessed by you. We never sell your data.',
  },
  {
    q: 'Can I use it for free forever?',
    a: 'Yes! The Free plan has no time limit. You get a public profile, up to 3 projects, 1 intro video, and basic ATS scoring. Upgrade to Pro when you want the full AI feature suite.',
  },
  {
    q: 'How is this different from a personal website?',
    a: 'Personal websites take hours to build and maintain. CareerDNA works in minutes — just fill in your information and the AI does the rest. Plus it has built-in ATS analysis, analytics, and video features that no simple website builder offers.',
  },
]

function FAQItem({ item, index }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass rounded-xl overflow-hidden border border-white/5 hover:border-violet-500/20 transition-colors"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <span className="text-white font-medium pr-4">{item.q}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0 text-violet-400"
        >
          <ChevronDown size={18} />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <p className="px-5 pb-5 text-white/50 text-sm leading-relaxed border-t border-white/5 pt-3">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FAQSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section className="py-32 relative">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-cyan-500/20 text-cyan-300 text-sm mb-6">
            <HelpCircle size={14} />
            Got questions?
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Frequently Asked
            <span className="gradient-text"> Questions</span>
          </h2>
        </motion.div>

        <div className="flex flex-col gap-3">
          {faqs.map((item, i) => (
            <FAQItem key={i} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
