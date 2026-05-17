// Testimonials — social proof section
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Software Engineer at Google',
    avatar: 'PS',
    color: 'from-violet-500 to-purple-600',
    text: 'CareerDNA completely changed how I present myself. My ATS score went from 62 to 94 in one afternoon. Got 3 interview calls the next week.',
    stars: 5,
  },
  {
    name: 'Marcus Johnson',
    role: 'Product Designer at Airbnb',
    avatar: 'MJ',
    color: 'from-blue-500 to-cyan-500',
    text: 'The portfolio page is insane. I shared my CareerDNA link in my LinkedIn bio and recruiters started messaging me within days. Zero effort needed.',
    stars: 5,
  },
  {
    name: 'Aisha Patel',
    role: 'Data Scientist at Meta',
    avatar: 'AP',
    color: 'from-pink-500 to-rose-500',
    text: 'I was skeptical of AI tools but CareerDNA is legitimately good. The AI bio it wrote for me sounded exactly like me, just 10x better.',
    stars: 5,
  },
  {
    name: 'David Chen',
    role: 'Full-Stack Dev at Stripe',
    avatar: 'DC',
    color: 'from-emerald-500 to-teal-500',
    text: 'Replaced my Notion page, resume PDF, and GitHub profile with one CareerDNA link. Interviewers literally say "wow" when I share it.',
    stars: 5,
  },
  {
    name: 'Sarah Kim',
    role: 'UX Lead at Apple',
    avatar: 'SK',
    color: 'from-amber-500 to-orange-500',
    text: 'The video showcase feature is brilliant. I uploaded my design process videos and projects — it tells a story no PDF resume ever could.',
    stars: 5,
  },
  {
    name: 'Rohan Mehta',
    role: 'ML Engineer at OpenAI',
    avatar: 'RM',
    color: 'from-indigo-500 to-violet-500',
    text: 'Interview prep AI is underrated. Generated 40 role-specific questions for my ML interviews. Nailed all of them. Offer letter came in 2 weeks.',
    stars: 5,
  },
]

function TestimonialCard({ testimonial, index }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: (index % 3) * 0.1 }}
      className="glass glass-hover rounded-2xl p-6 flex flex-col gap-4"
    >
      {/* Stars */}
      <div className="flex gap-1">
        {Array.from({ length: testimonial.stars }).map((_, i) => (
          <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
        ))}
      </div>

      {/* Quote */}
      <div className="relative">
        <Quote size={20} className="text-violet-500/30 mb-2" />
        <p className="text-white/60 text-sm leading-relaxed">"{testimonial.text}"</p>
      </div>

      {/* Author */}
      <div className="flex items-center gap-3 pt-2 border-t border-white/5">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-sm font-bold text-white flex-shrink-0`}>
          {testimonial.avatar}
        </div>
        <div>
          <div className="text-white font-semibold text-sm">{testimonial.name}</div>
          <div className="text-white/30 text-xs">{testimonial.role}</div>
        </div>
      </div>
    </motion.div>
  )
}

export default function TestimonialsSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-amber-500/20 text-amber-300 text-sm mb-6">
            <Star size={14} className="fill-amber-400 text-amber-400" />
            Loved by 50,000+ professionals
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Real People,
            <span className="gradient-text"> Real Results</span>
          </h2>
          <p className="text-white/40 text-lg">
            Don't take our word for it. See what professionals are saying.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <TestimonialCard key={t.name} testimonial={t} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
