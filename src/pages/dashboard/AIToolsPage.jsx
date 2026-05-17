// AI Tools page — all AI-powered career features
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles, FileText, Mail, HelpCircle, TrendingUp,
  Brain, ChevronRight, Loader2, Copy, Check, RefreshCw
} from 'lucide-react'
import DashboardLayout from '@/layouts/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import {
  generateBio, generateCoverLetter,
  generateInterviewQuestions, analyzeSkillGap, getCareerSuggestions
} from '@/lib/openai'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied!')
  }
  return (
    <button onClick={copy} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
    </button>
  )
}

function ResultBox({ content, onRegenerate }) {
  if (!content) return null
  const text = typeof content === 'string' ? content : JSON.stringify(content, null, 2)
  return (
    <div className="mt-4 bg-white/[0.02] rounded-xl p-4 border border-white/5 relative">
      <div className="flex items-center justify-between mb-3">
        <Badge color="green" dot>AI Generated</Badge>
        <div className="flex gap-1">
          {onRegenerate && (
            <button onClick={onRegenerate} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
              <RefreshCw size={14} />
            </button>
          )}
          <CopyButton text={text} />
        </div>
      </div>
      <pre className="text-white/60 text-sm whitespace-pre-wrap font-sans leading-relaxed">
        {text}
      </pre>
    </div>
  )
}

// Bio Generator tool
function BioGenerator() {
  const [form, setForm] = useState({ name: '', skills: '', experience: '', education: '' })
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  async function generate() {
    if (!form.name) return toast.error('Please enter your name')
    setLoading(true)
    try {
      const res = await generateBio({
        name: form.name,
        skills: form.skills.split(',').map(s => s.trim()),
        experience: form.experience,
        education: form.education,
        projects: [],
      })
      setResult(res)
    } catch (e) { toast.error(e.message) }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <Input label="Your Name" placeholder="Alex Johnson" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
        <Input label="Key Skills (comma separated)" placeholder="React, Python, ML" value={form.skills} onChange={e => setForm(f => ({...f, skills: e.target.value}))} />
        <Input label="Years of Experience" placeholder="3 years in software development" value={form.experience} onChange={e => setForm(f => ({...f, experience: e.target.value}))} />
        <Input label="Education" placeholder="B.Tech CSE, IIT Delhi" value={form.education} onChange={e => setForm(f => ({...f, education: e.target.value}))} />
      </div>
      <Button onClick={generate} loading={loading}>
        <Sparkles size={16} /> Generate Bio
      </Button>
      <ResultBox content={result} onRegenerate={generate} />
    </div>
  )
}

// Cover Letter Generator
function CoverLetterGenerator() {
  const [form, setForm] = useState({ name: '', jobTitle: '', company: '', skills: '', experience: '' })
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  async function generate() {
    if (!form.name || !form.jobTitle) return toast.error('Please fill name and job title')
    setLoading(true)
    try {
      const res = await generateCoverLetter({ ...form, skills: form.skills.split(',') })
      setResult(res)
    } catch (e) { toast.error(e.message) }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <Input label="Your Name" placeholder="Alex Johnson" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
        <Input label="Job Title Applying For" placeholder="Senior Product Designer" value={form.jobTitle} onChange={e => setForm(f => ({...f, jobTitle: e.target.value}))} />
        <Input label="Company Name" placeholder="Google, Stripe, Notion..." value={form.company} onChange={e => setForm(f => ({...f, company: e.target.value}))} />
        <Input label="Key Skills" placeholder="React, Leadership, Design" value={form.skills} onChange={e => setForm(f => ({...f, skills: e.target.value}))} />
        <div className="md:col-span-2">
          <label className="text-sm font-medium text-white/70 block mb-1.5">Your Experience</label>
          <textarea value={form.experience} onChange={e => setForm(f => ({...f, experience: e.target.value}))} placeholder="Brief experience summary..." className="w-full h-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 resize-none focus:outline-none focus:border-violet-500/50" />
        </div>
      </div>
      <Button onClick={generate} loading={loading}><Mail size={16} /> Generate Cover Letter</Button>
      <ResultBox content={result} onRegenerate={generate} />
    </div>
  )
}

// Interview Prep
function InterviewPrep() {
  const [form, setForm] = useState({ jobTitle: '', skills: '' })
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [openIdx, setOpenIdx] = useState(null)

  async function generate() {
    if (!form.jobTitle) return toast.error('Please enter a job title')
    setLoading(true)
    try {
      const res = await generateInterviewQuestions(form.jobTitle, form.skills.split(',').map(s => s.trim()))
      setQuestions(res)
    } catch (e) { toast.error(e.message) }
    setLoading(false)
  }

  const typeColor = (type) => type === 'technical' ? 'blue' : type === 'behavioral' ? 'green' : 'purple'

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <Input label="Target Job Title" placeholder="Frontend Engineer" value={form.jobTitle} onChange={e => setForm(f => ({...f, jobTitle: e.target.value}))} />
        <Input label="Key Skills" placeholder="React, TypeScript, CSS" value={form.skills} onChange={e => setForm(f => ({...f, skills: e.target.value}))} />
      </div>
      <Button onClick={generate} loading={loading}><HelpCircle size={16} /> Generate 10 Questions</Button>
      {questions.length > 0 && (
        <div className="space-y-3 mt-2">
          {questions.map((q, i) => (
            <div key={i} className="glass rounded-xl overflow-hidden border border-white/5 hover:border-violet-500/20 transition-colors">
              <button onClick={() => setOpenIdx(openIdx === i ? null : i)} className="w-full flex items-center gap-3 p-4 text-left">
                <span className="text-white/20 text-sm font-mono w-6 flex-shrink-0">{i+1}.</span>
                <span className="text-white text-sm flex-1">{q.question}</span>
                <Badge color={typeColor(q.type)}>{q.type}</Badge>
                <ChevronRight size={14} className={`text-white/30 transition-transform flex-shrink-0 ${openIdx === i ? 'rotate-90' : ''}`} />
              </button>
              {openIdx === i && (
                <div className="px-4 pb-4 border-t border-white/5 pt-3">
                  <p className="text-white/50 text-sm leading-relaxed">{q.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Career Suggestions
function CareerSuggestions() {
  const [form, setForm] = useState({ skills: '', experience: '', education: '' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  async function generate() {
    if (!form.skills) return toast.error('Please enter your skills')
    setLoading(true)
    try {
      const res = await getCareerSuggestions({ skills: form.skills.split(','), experience: form.experience, education: form.education })
      setResult(res)
    } catch (e) { toast.error(e.message) }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <Input label="Current Skills" placeholder="Python, ML, Data Analysis" value={form.skills} onChange={e => setForm(f => ({...f, skills: e.target.value}))} />
        <Input label="Experience Level" placeholder="3 years as Data Analyst" value={form.experience} onChange={e => setForm(f => ({...f, experience: e.target.value}))} />
        <Input label="Education" placeholder="B.Sc Statistics" value={form.education} onChange={e => setForm(f => ({...f, education: e.target.value}))} />
      </div>
      <Button onClick={generate} loading={loading}><TrendingUp size={16} /> Get Career Suggestions</Button>
      {result && (
        <div className="space-y-3">
          {result.topRecommendation && (
            <div className="glass rounded-xl p-4 border border-violet-500/20">
              <p className="text-violet-300 text-sm font-semibold mb-1">Top Recommendation</p>
              <p className="text-white/70">{result.topRecommendation}</p>
            </div>
          )}
          {result.suggestions?.map((s, i) => (
            <div key={i} className="glass rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                {s.match}%
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">{s.role}</p>
                <p className="text-white/40 text-sm">{s.reason}</p>
                {s.salary && <p className="text-emerald-400 text-xs mt-1">{s.salary}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Tool tabs config
const TOOLS = [
  { id: 'bio', label: 'Bio Writer', icon: Sparkles, component: BioGenerator, desc: 'AI-powered professional bio' },
  { id: 'cover', label: 'Cover Letter', icon: Mail, component: CoverLetterGenerator, desc: 'Tailored cover letters' },
  { id: 'interview', label: 'Interview Prep', icon: HelpCircle, component: InterviewPrep, desc: '10 interview Q&As' },
  { id: 'career', label: 'Career Advice', icon: TrendingUp, component: CareerSuggestions, desc: 'Role suggestions' },
]

export default function AIToolsPage() {
  const [activeTool, setActiveTool] = useState('bio')
  const ActiveComponent = TOOLS.find(t => t.id === activeTool)?.component || BioGenerator

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-1">AI Tools</h1>
        <p className="text-white/40">Supercharge your career with AI-powered tools</p>
      </div>

      {/* Tool selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {TOOLS.map((tool) => {
          const Icon = tool.icon
          const active = activeTool === tool.id
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`glass rounded-xl p-4 text-left transition-all ${
                active
                  ? 'border border-violet-500/40 bg-violet-500/10'
                  : 'border border-white/5 hover:border-white/10 hover:bg-white/[0.02]'
              }`}
            >
              <Icon size={20} className={`mb-2 ${active ? 'text-violet-400' : 'text-white/30'}`} />
              <p className={`font-semibold text-sm ${active ? 'text-white' : 'text-white/60'}`}>{tool.label}</p>
              <p className="text-white/20 text-xs mt-0.5">{tool.desc}</p>
            </button>
          )
        })}
      </div>

      {/* Active tool */}
      <Card animate>
        <div className="flex items-center gap-3 mb-6">
          {(() => {
            const tool = TOOLS.find(t => t.id === activeTool)
            const Icon = tool?.icon || Sparkles
            return (
              <>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                  <Icon size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{tool?.label}</h2>
                  <p className="text-white/40 text-sm">{tool?.desc}</p>
                </div>
              </>
            )
          })()}
        </div>

        <ActiveComponent />
      </Card>

      {/* API Key notice */}
      <div className="mt-6 glass rounded-xl p-4 border border-yellow-500/20 flex items-start gap-3">
        <Brain size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-yellow-300 text-sm font-medium">OpenAI API Key Required</p>
          <p className="text-white/40 text-xs mt-1">
            AI tools require your OpenAI API key in the .env file. Using gpt-4o-mini for cost efficiency.
            Typical cost: under $0.01 per generation.
          </p>
        </div>
      </div>
    </DashboardLayout>
  )
}
