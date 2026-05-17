// CTA + Footer section
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Link } from 'react-router-dom'
import { ArrowRight, Zap, Mail } from 'lucide-react'
import { GithubIcon as Github, LinkedinIcon as Linkedin, TwitterIcon as Twitter } from '@/components/ui/SocialIcons'
import Button from '@/components/ui/Button'

export default function CTASection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <>
      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/15 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-pink-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-violet-500/30 text-violet-300 text-sm mb-8">
              <Zap size={14} className="fill-violet-400 text-violet-400" />
              Start free — no credit card needed
            </div>

            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
              Build Your
              <br />
              <span className="gradient-text">Living Identity</span>
              <br />
              Today.
            </h2>

            <p className="text-white/40 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              Join 50,000+ professionals who replaced their static resumes
              with a dynamic CareerDNA profile.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button size="xl" className="group">
                  Create Your CareerDNA
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/u/demo">
                <Button variant="secondary" size="xl">
                  View Demo Profile
                </Button>
              </Link>
            </div>

            <p className="text-white/20 text-sm mt-6">
              Free forever · No credit card · Setup in 5 minutes
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
                  <Zap size={18} className="text-white" fill="white" />
                </div>
                <span className="text-xl font-bold gradient-text">CareerDNA</span>
              </div>
              <p className="text-white/30 text-sm leading-relaxed mb-4">
                The AI-powered living professional identity platform.
              </p>
              <div className="flex gap-3">
                {[Twitter, Linkedin, Github, Mail].map((Icon, i) => (
                  <div key={i} className="w-9 h-9 rounded-lg glass flex items-center justify-center hover:bg-white/10 cursor-pointer transition-colors">
                    <Icon size={16} className="text-white/40 hover:text-white transition-colors" />
                  </div>
                ))}
              </div>
            </div>

            {/* Product links */}
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-white font-semibold mb-4 text-sm">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-white/30 hover:text-white text-sm transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/20 text-sm">
              © 2025 CareerDNA. All rights reserved.
            </p>
            <p className="text-white/20 text-sm">
              Made with ❤️ for professionals worldwide
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
