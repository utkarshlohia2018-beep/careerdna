// Full-page loading screen shown while app initializes
import { motion } from 'framer-motion'

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-[#050510] flex items-center justify-center z-50">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative flex flex-col items-center gap-6"
      >
        {/* Logo */}
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center"
          >
            <span className="text-2xl font-black text-white">C</span>
          </motion.div>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 blur-xl opacity-50" />
        </div>

        {/* Brand name */}
        <div className="text-center">
          <h1 className="text-2xl font-bold gradient-text">CareerDNA</h1>
          <p className="text-white/30 text-sm mt-1">Loading your identity...</p>
        </div>

        {/* Loading dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              className="w-2 h-2 rounded-full bg-violet-500"
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
