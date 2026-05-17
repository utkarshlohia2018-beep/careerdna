// Sign up page
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Zap, ArrowRight, Check } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

const perks = [
  'Free forever — no credit card',
  'AI-powered resume analysis',
  'Live public profile link',
]

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!fullName || !email || !password) return toast.error('Please fill in all fields')
    if (password.length < 8) return toast.error('Password must be at least 8 characters')

    setLoading(true)
    const { error } = await signUp(email, password, fullName)
    setLoading(false)

    if (error) {
      toast.error(error.message || 'Failed to create account')
    } else {
      toast.success('Account created! Check your email to verify.')
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
              <Zap size={20} className="text-white" fill="white" />
            </div>
            <span className="text-2xl font-bold gradient-text">CareerDNA</span>
          </Link>
          <h1 className="text-3xl font-black text-white mb-2">Create your identity</h1>
          <p className="text-white/40">Join 50,000+ professionals</p>
        </div>

        {/* Perks */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {perks.map((perk) => (
            <div key={perk} className="flex items-center gap-1.5 text-xs text-white/50">
              <Check size={12} className="text-violet-400" />
              {perk}
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="glass rounded-2xl p-8 border border-white/8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Full name"
              type="text"
              placeholder="Alex Johnson"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              icon={<User size={16} />}
              required
            />
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={16} />}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={16} />}
              required
              hint="At least 8 characters"
            />

            <Button type="submit" loading={loading} fullWidth size="lg" className="mt-2">
              Create Free Account
              <ArrowRight size={16} />
            </Button>
          </form>

          <p className="text-center text-white/20 text-xs mt-4">
            By signing up, you agree to our{' '}
            <a href="#" className="text-white/40 hover:text-white">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-white/40 hover:text-white">Privacy Policy</a>
          </p>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5" />
            </div>
            <div className="relative text-center">
              <span className="bg-[#0a0a1f] px-3 text-white/20 text-sm">or</span>
            </div>
          </div>

          <p className="text-center text-white/40 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Sign in →
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
