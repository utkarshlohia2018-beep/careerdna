// Pricing section — three tiers
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Check, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'

const plans = [
  {
    name: 'Free',
    price: 0,
    desc: 'Perfect for getting started',
    color: 'from-white/10 to-white/5',
    features: [
      'Public profile page',
      'Up to 3 projects',
      '1 intro video',
      'ATS score check',
      'Basic analytics',
      'Resume upload',
    ],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    name: 'Pro',
    price: 9,
    desc: 'For serious job seekers',
    color: 'from-violet-600 to-blue-600',
    features: [
      'Everything in Free',
      'Unlimited projects',
      'Unlimited videos',
      'AI bio generator',
      'AI resume improver',
      'Cover letter AI',
      'Interview prep AI',
      'Advanced analytics',
      'Custom username',
      'Priority support',
    ],
    cta: 'Start Pro — $9/mo',
    popular: true,
  },
  {
    name: 'Team',
    price: 29,
    desc: 'For agencies & bootcamps',
    color: 'from-cyan-600 to-teal-600',
    features: [
      'Everything in Pro',
      'Up to 10 team members',
      'Shared portfolio templates',
      'Team analytics dashboard',
      'White-label option',
      'API access',
      'Dedicated support',
    ],
    cta: 'Start Team Plan',
    popular: false,
  },
]

export default function PricingSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <section id="pricing" className="py-32 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-violet-500/20 text-violet-300 text-sm mb-6">
            <Zap size={14} />
            Simple, transparent pricing
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Invest In
            <span className="gradient-text"> Your Career</span>
          </h2>
          <p className="text-white/40 text-lg">
            Start free. Upgrade when you're ready. Cancel anytime.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 items-center">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className={`relative rounded-2xl overflow-hidden ${
                plan.popular
                  ? 'bg-gradient-to-br from-violet-600/20 to-blue-600/20 border border-violet-500/40 scale-105'
                  : 'glass border border-white/8'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
              )}

              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-violet-500/30 border border-violet-500/50 text-violet-300 text-xs font-semibold">
                  Most Popular
                </div>
              )}

              <div className="p-8">
                {/* Plan name & price */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-white/40 text-sm mb-4">{plan.desc}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-5xl font-black text-white">${plan.price}</span>
                    <span className="text-white/40 mb-2">/month</span>
                  </div>
                </div>

                {/* CTA button */}
                <Link to="/signup" className="block mb-8">
                  <Button
                    variant={plan.popular ? 'primary' : 'secondary'}
                    fullWidth
                    size="md"
                  >
                    {plan.cta}
                  </Button>
                </Link>

                {/* Features list */}
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        plan.popular ? 'bg-violet-500/30' : 'bg-white/5'
                      }`}>
                        <Check size={11} className={plan.popular ? 'text-violet-300' : 'text-white/40'} />
                      </div>
                      <span className="text-white/60">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Money-back guarantee */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="text-center text-white/30 text-sm mt-10"
        >
          ✓ 14-day money-back guarantee &nbsp;·&nbsp; ✓ No credit card required for Free &nbsp;·&nbsp; ✓ Cancel anytime
        </motion.p>
      </div>
    </section>
  )
}
