// Forgot password page
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Zap, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { resetPassword } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) return toast.error('Please enter your email')

    setLoading(true)
    const { error } = await resetPassword(email)
    setLoading(false)

    if (error) {
      toast.error(error.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
              <Zap size={20} className="text-white" fill="white" />
            </div>
            <span className="text-2xl font-bold gradient-text">CareerDNA</span>
          </Link>

          {sent ? (
            <>
              <CheckCircle size={48} className="text-emerald-400 mx-auto mb-4" />
              <h1 className="text-3xl font-black text-white mb-2">Check your email</h1>
              <p className="text-white/40">We sent a reset link to <span className="text-white">{email}</span></p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-black text-white mb-2">Reset password</h1>
              <p className="text-white/40">Enter your email and we'll send you a reset link</p>
            </>
          )}
        </div>

        <div className="glass rounded-2xl p-8 border border-white/8">
          {sent ? (
            <div className="flex flex-col gap-4 text-center">
              <p className="text-white/40 text-sm">
                Didn't receive it? Check your spam folder or try again.
              </p>
              <Button onClick={() => setSent(false)} variant="secondary" fullWidth>
                Try another email
              </Button>
              <Link to="/login">
                <Button variant="ghost" fullWidth>
                  <ArrowLeft size={16} />
                  Back to login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail size={16} />}
                required
              />
              <Button type="submit" loading={loading} fullWidth size="lg">
                Send Reset Link
              </Button>
              <Link to="/login">
                <Button variant="ghost" fullWidth>
                  <ArrowLeft size={16} />
                  Back to login
                </Button>
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}
