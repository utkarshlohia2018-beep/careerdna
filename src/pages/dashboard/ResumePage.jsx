// Resume page — resume.io style builder + uploader
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, FileText, Download, Sparkles, AlertCircle, CheckCircle,
  BarChart3, Loader2, Edit3, Save, X, User, CheckSquare, Plus, Trash2,
  Briefcase, GraduationCap, Code, Award, Wand2, FileEdit, FileUp,
  ChevronDown, ChevronUp,
} from 'lucide-react'
import DashboardLayout from '@/layouts/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import {
  analyzeResume, structureResumeForPDF, extractProfileFromResume, improveStructuredResume,
} from '@/lib/openai'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { RESUME_TEMPLATES, renderResumeTemplate } from '@/lib/resumeTemplates'
import toast from 'react-hot-toast'
import * as pdfjs from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

// ─── DEFAULT EMPTY RESUME STRUCTURE ──────────────────────────────────────────
const EMPTY_RESUME = {
  name: '', headline: '',
  contact: { email: '', phone: '', location: '', linkedin: '', github: '', website: '' },
  summary: '',
  experience: [{ title: '', company: '', duration: '', bullets: [''] }],
  education: [{ degree: '', school: '', year: '' }],
  skills: [],
  projects: [{ name: '', description: '', tech: '' }],
  certifications: [],
}

// ─── PDF EXTRACTOR ────────────────────────────────────────────────────────────
async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise
  const pageTexts = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    pageTexts.push(content.items.map(item => item.str).join(' '))
  }
  return pageTexts.join('\n\n')
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function ResumePage() {
  const { user, profile, refreshProfile } = useAuth()

  const [mode, setMode] = useState('upload') // 'upload' | 'builder'
  const [resumeData, setResumeData] = useState(EMPTY_RESUME)
  const [resumeText, setResumeText] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [templateId, setTemplateId] = useState('cascade')
  const [skillsInput, setSkillsInput] = useState('')

  // Loading
  const [parsing, setParsing] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [structuring, setStructuring] = useState(false)
  const [improving, setImproving] = useState(false)
  const [generatingPDF, setGenPDF] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)

  // UI
  const [dragOver, setDragOver] = useState(false)
  const [extractedProfile, setExtractedProfile] = useState(null)
  const [expandedSection, setExpandedSection] = useState('basics')

  const fileRef = useRef(null)

  // Pre-fill builder with user's profile data on first load
  useEffect(() => {
    if (profile && mode === 'builder' && !resumeData.name) {
      setResumeData(prev => ({
        ...prev,
        name: profile.full_name || '',
        headline: profile.headline || '',
        summary: profile.bio || '',
        contact: {
          ...prev.contact,
          email: user?.email || '',
          location: profile.location || '',
          linkedin: profile.linkedin || '',
          github: profile.github || '',
          website: profile.website || '',
        },
        skills: profile.skills?.length ? profile.skills : prev.skills,
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, profile])

  // Sync skills input
  useEffect(() => {
    setSkillsInput(resumeData.skills.join(', '))
  }, [resumeData.skills])

  // ── File upload (PDF/TXT → text → structured) ──
  async function handleFile(file) {
    if (!file) return
    const isPDF = file.type === 'application/pdf' || file.name.endsWith('.pdf')
    const isTXT = file.type.includes('text') || file.name.endsWith('.txt')
    if (!isPDF && !isTXT) return toast.error('Upload a PDF or TXT file')

    setParsing(true)
    try {
      let text = ''
      if (isPDF) {
        text = await extractTextFromPDF(file)
      } else {
        text = await file.text()
      }
      if (!text.trim()) {
        toast.error('Could not extract text from file')
        setParsing(false)
        return
      }
      setResumeText(text.trim())
      toast.success(`✅ Parsed — ${text.length.toLocaleString()} chars`)

      // Auto-structure immediately
      setStructuring(true)
      toast.loading('AI organizing your resume into sections…', { id: 'struct' })
      const structured = await structureResumeForPDF(text)
      toast.dismiss('struct')
      if (structured) {
        // Merge defaults to ensure all keys exist
        setResumeData({
          ...EMPTY_RESUME,
          ...structured,
          contact: { ...EMPTY_RESUME.contact, ...(structured.contact || {}) },
          experience: structured.experience?.length ? structured.experience : EMPTY_RESUME.experience,
          education: structured.education?.length ? structured.education : EMPTY_RESUME.education,
          projects: structured.projects?.length ? structured.projects : EMPTY_RESUME.projects,
          skills: structured.skills || [],
          certifications: structured.certifications || [],
        })
        toast.success('Resume structured! Review & edit below.')
        setMode('builder')
      } else {
        toast.error('Could not structure resume. You can still edit manually.')
      }
      setStructuring(false)
    } catch (err) {
      toast.error('File read failed: ' + err.message)
    }
    setParsing(false)
  }

  // ── ATS Analyze ──
  async function handleAnalyze() {
    const content = resumeText || JSON.stringify(resumeData)
    if (!content.trim()) return toast.error('Add resume content first')
    setAnalyzing(true)
    try {
      const result = await analyzeResume(content)
      setAnalysis(result)
      if (user) {
        await supabase.from('resumes').upsert({
          user_id: user.id,
          ats_score: result.score,
          content: content.substring(0, 5000),
          analysis: result,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
      }
      toast.success(`ATS Score: ${result.score}/100`)
    } catch (err) {
      toast.error(err.message || 'Analysis failed')
    }
    setAnalyzing(false)
  }

  // ── AI Improve structured data ──
  async function handleImprove() {
    if (!resumeData.name && !resumeData.summary && !resumeData.experience[0]?.title) {
      return toast.error('Add some resume content first')
    }
    setImproving(true)
    toast.loading('AI polishing every section…', { id: 'improve' })
    try {
      const improved = await improveStructuredResume(resumeData)
      setResumeData({
        ...EMPTY_RESUME,
        ...improved,
        contact: { ...EMPTY_RESUME.contact, ...(improved.contact || {}) },
      })
      toast.dismiss('improve')
      toast.success('✨ Resume polished by AI!')
    } catch (err) {
      toast.dismiss('improve')
      toast.error(err.message || 'Improve failed')
    }
    setImproving(false)
  }

  // ── Extract profile to dashboard ──
  async function handleSaveToProfile() {
    if (!user) return
    setSavingProfile(true)
    try {
      const payload = {
        id: user.id,
        email: user.email,
        full_name: resumeData.name || profile?.full_name || '',
        headline: resumeData.headline || profile?.headline || '',
        bio: resumeData.summary || profile?.bio || '',
        location: resumeData.contact.location || profile?.location || '',
        skills: resumeData.skills?.length ? resumeData.skills : (profile?.skills || []),
        linkedin: resumeData.contact.linkedin || profile?.linkedin || '',
        github: resumeData.contact.github || profile?.github || '',
        website: resumeData.contact.website || profile?.website || '',
        updated_at: new Date().toISOString(),
      }
      const { error } = await supabase.from('profiles').upsert(payload)
      if (error) throw error
      await refreshProfile()
      toast.success('✅ Saved to your dashboard profile!')
    } catch (err) {
      toast.error(err.message || 'Save failed')
    }
    setSavingProfile(false)
  }

  // ── Download premium PDF ──
  async function downloadPDF() {
    if (!resumeData.name) return toast.error('Add at least your name first')
    setGenPDF(true)
    try {
      // Apply skills input on the fly
      const finalData = {
        ...resumeData,
        skills: skillsInput.split(',').map(s => s.trim()).filter(Boolean),
      }
      const doc = renderResumeTemplate(templateId, finalData)
      const safeName = (resumeData.name || 'resume').replace(/\s+/g, '-').toLowerCase()
      doc.save(`${safeName}-${templateId}.pdf`)
      toast.success(`✅ Downloaded! (${RESUME_TEMPLATES.find(t => t.id === templateId)?.label} template)`)
    } catch (err) {
      toast.error('PDF generation failed: ' + err.message)
    }
    setGenPDF(false)
  }

  // ── Field helpers ──
  const updateField = (path, value) => {
    setResumeData(prev => {
      const next = { ...prev }
      const keys = path.split('.')
      let cur = next
      for (let i = 0; i < keys.length - 1; i++) {
        cur[keys[i]] = { ...cur[keys[i]] }
        cur = cur[keys[i]]
      }
      cur[keys[keys.length - 1]] = value
      return next
    })
  }
  const updateArrayItem = (arr, idx, field, value) => {
    setResumeData(prev => {
      const list = [...prev[arr]]
      list[idx] = { ...list[idx], [field]: value }
      return { ...prev, [arr]: list }
    })
  }
  const addItem = (arr, template) => {
    setResumeData(prev => ({ ...prev, [arr]: [...prev[arr], template] }))
  }
  const removeItem = (arr, idx) => {
    setResumeData(prev => ({ ...prev, [arr]: prev[arr].filter((_, i) => i !== idx) }))
  }
  const updateBullet = (expIdx, bIdx, value) => {
    setResumeData(prev => {
      const exps = [...prev.experience]
      const bullets = [...(exps[expIdx].bullets || [])]
      bullets[bIdx] = value
      exps[expIdx] = { ...exps[expIdx], bullets }
      return { ...prev, experience: exps }
    })
  }
  const addBullet = (expIdx) => {
    setResumeData(prev => {
      const exps = [...prev.experience]
      exps[expIdx] = { ...exps[expIdx], bullets: [...(exps[expIdx].bullets || []), ''] }
      return { ...prev, experience: exps }
    })
  }
  const removeBullet = (expIdx, bIdx) => {
    setResumeData(prev => {
      const exps = [...prev.experience]
      exps[expIdx] = { ...exps[expIdx], bullets: exps[expIdx].bullets.filter((_, i) => i !== bIdx) }
      return { ...prev, experience: exps }
    })
  }

  const SectionHeader = ({ id, icon: Icon, label, count }) => (
    <button
      onClick={() => setExpandedSection(expandedSection === id ? null : id)}
      className="w-full flex items-center justify-between py-3 px-1 hover:bg-white/[0.02] rounded-lg transition-colors"
    >
      <div className="flex items-center gap-2">
        <Icon size={15} className="text-violet-400" />
        <span className="text-white font-semibold text-sm">{label}</span>
        {count !== undefined && <span className="text-white/30 text-xs">({count})</span>}
      </div>
      {expandedSection === id ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
    </button>
  )

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">Resume Builder</h1>
          <p className="text-white/40">Premium resume.io-style templates · AI-polished · single page</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('upload')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
              mode === 'upload'
                ? 'bg-violet-500/20 border border-violet-500/40 text-violet-300'
                : 'border border-white/10 text-white/50 hover:text-white hover:border-white/20'
            }`}
          >
            <FileUp size={14} /> Upload Old Resume
          </button>
          <button
            onClick={() => setMode('builder')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
              mode === 'builder'
                ? 'bg-violet-500/20 border border-violet-500/40 text-violet-300'
                : 'border border-white/10 text-white/50 hover:text-white hover:border-white/20'
            }`}
          >
            <FileEdit size={14} /> Build from Scratch
          </button>
        </div>
      </div>

      {/* ── TEMPLATE PICKER ── */}
      <Card animate className="mb-6">
        <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
          <Sparkles size={14} className="text-violet-400" /> Choose Premium Template
        </h2>
        <p className="text-white/30 text-xs mb-4">Each template has a unique layout — sidebar, split, or centered</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {RESUME_TEMPLATES.map(t => (
            <button
              key={t.id}
              onClick={() => setTemplateId(t.id)}
              className={`rounded-xl p-3 border text-left transition-all group ${
                templateId === t.id
                  ? 'border-violet-500 bg-violet-500/10 ring-1 ring-violet-500/30'
                  : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
              }`}
            >
              <TemplatePreview swatch={t.swatch} accent={t.accent} active={templateId === t.id} />
              <p className={`text-xs font-bold mt-2 ${templateId === t.id ? 'text-white' : 'text-white/70'}`}>{t.label}</p>
              <p className="text-white/30 text-[10px]">{t.desc}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* ── UPLOAD MODE ── */}
      {mode === 'upload' && (
        <Card animate className="mb-6">
          <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <Upload size={16} className="text-violet-400" /> Upload Your Existing Resume
          </h2>
          <p className="text-white/40 text-sm mb-4">
            We&apos;ll parse it, structure it into sections, and let you edit + improve with AI.
          </p>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
            onClick={() => !parsing && !structuring && fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
              dragOver ? 'border-violet-500 bg-violet-500/10'
                : 'border-white/10 hover:border-violet-500/50 hover:bg-white/[0.02]'
            }`}
          >
            {(parsing || structuring) ? (
              <>
                <Loader2 size={42} className="text-violet-400 mx-auto mb-3 animate-spin" />
                <p className="text-violet-300 font-medium">
                  {parsing ? 'Reading PDF…' : 'AI structuring into sections…'}
                </p>
              </>
            ) : (
              <>
                <FileText size={42} className="text-white/20 mx-auto mb-3" />
                <p className="text-white/70 font-semibold">Drop your resume here or click to browse</p>
                <p className="text-white/30 text-xs mt-1">PDF or TXT · AI auto-extracts & structures all sections</p>
              </>
            )}
            <input ref={fileRef} type="file" accept=".pdf,.txt" className="hidden"
              onChange={(e) => handleFile(e.target.files[0])} />
          </div>
        </Card>
      )}

      {/* ── BUILDER FORM + PREVIEW ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* LEFT: Form */}
        <div className="space-y-2">
          <Card animate>
            {/* BASICS */}
            <SectionHeader id="basics" icon={User} label="Personal Info" />
            <AnimatePresence>
              {expandedSection === 'basics' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 pt-2 pb-3">
                    <Input
                      placeholder="Full Name"
                      value={resumeData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                    />
                    <Input
                      placeholder="Headline (e.g. Senior Frontend Engineer)"
                      value={resumeData.headline}
                      onChange={(e) => updateField('headline', e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="Email" value={resumeData.contact.email} onChange={(e) => updateField('contact.email', e.target.value)} />
                      <Input placeholder="Phone" value={resumeData.contact.phone} onChange={(e) => updateField('contact.phone', e.target.value)} />
                    </div>
                    <Input placeholder="Location (City, Country)" value={resumeData.contact.location} onChange={(e) => updateField('contact.location', e.target.value)} />
                    <Input placeholder="LinkedIn URL" value={resumeData.contact.linkedin} onChange={(e) => updateField('contact.linkedin', e.target.value)} />
                    <Input placeholder="GitHub URL" value={resumeData.contact.github} onChange={(e) => updateField('contact.github', e.target.value)} />
                    <Input placeholder="Website / Portfolio" value={resumeData.contact.website} onChange={(e) => updateField('contact.website', e.target.value)} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="border-t border-white/5">
              <SectionHeader id="summary" icon={FileText} label="Professional Summary" />
              <AnimatePresence>
                {expandedSection === 'summary' && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <textarea
                      value={resumeData.summary}
                      onChange={(e) => updateField('summary', e.target.value)}
                      placeholder="2-3 punchy sentences leading with your strongest qualification…"
                      className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-3 text-white/80 placeholder-white/20 text-sm resize-none focus:outline-none focus:border-violet-500/50 mt-2 mb-3"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* EXPERIENCE */}
            <div className="border-t border-white/5">
              <SectionHeader id="experience" icon={Briefcase} label="Experience" count={resumeData.experience.length} />
              <AnimatePresence>
                {expandedSection === 'experience' && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="space-y-3 pt-2 pb-3">
                      {resumeData.experience.map((exp, i) => (
                        <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 space-y-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-white/40 font-semibold">Job #{i + 1}</span>
                            {resumeData.experience.length > 1 && (
                              <button onClick={() => removeItem('experience', i)} className="text-white/30 hover:text-red-400">
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                          <Input placeholder="Job Title" value={exp.title} onChange={(e) => updateArrayItem('experience', i, 'title', e.target.value)} />
                          <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="Company" value={exp.company} onChange={(e) => updateArrayItem('experience', i, 'company', e.target.value)} />
                            <Input placeholder="Duration (Jan 2022 - Now)" value={exp.duration} onChange={(e) => updateArrayItem('experience', i, 'duration', e.target.value)} />
                          </div>
                          <div className="space-y-1.5">
                            <p className="text-xs text-white/40 font-semibold">Achievements / Bullets</p>
                            {exp.bullets.map((b, bi) => (
                              <div key={bi} className="flex gap-2">
                                <input
                                  value={b}
                                  onChange={(e) => updateBullet(i, bi, e.target.value)}
                                  placeholder="Action verb + measurable outcome + context"
                                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/80 placeholder-white/20 text-xs focus:outline-none focus:border-violet-500/50"
                                />
                                {exp.bullets.length > 1 && (
                                  <button onClick={() => removeBullet(i, bi)} className="text-white/30 hover:text-red-400 px-1">
                                    <X size={12} />
                                  </button>
                                )}
                              </div>
                            ))}
                            <button onClick={() => addBullet(i)} className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
                              <Plus size={11} /> Add bullet
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => addItem('experience', { title: '', company: '', duration: '', bullets: [''] })}
                        className="w-full border border-dashed border-white/10 rounded-xl py-2 text-xs text-white/50 hover:text-white hover:border-violet-500/30 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Plus size={13} /> Add Another Job
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* EDUCATION */}
            <div className="border-t border-white/5">
              <SectionHeader id="education" icon={GraduationCap} label="Education" count={resumeData.education.length} />
              <AnimatePresence>
                {expandedSection === 'education' && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="space-y-3 pt-2 pb-3">
                      {resumeData.education.map((edu, i) => (
                        <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-white/40 font-semibold">Degree #{i + 1}</span>
                            {resumeData.education.length > 1 && (
                              <button onClick={() => removeItem('education', i)} className="text-white/30 hover:text-red-400">
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                          <Input placeholder="Degree (B.S. Computer Science)" value={edu.degree} onChange={(e) => updateArrayItem('education', i, 'degree', e.target.value)} />
                          <div className="grid grid-cols-2 gap-2">
                            <Input placeholder="School" value={edu.school} onChange={(e) => updateArrayItem('education', i, 'school', e.target.value)} />
                            <Input placeholder="Year (2024)" value={edu.year} onChange={(e) => updateArrayItem('education', i, 'year', e.target.value)} />
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => addItem('education', { degree: '', school: '', year: '' })}
                        className="w-full border border-dashed border-white/10 rounded-xl py-2 text-xs text-white/50 hover:text-white hover:border-violet-500/30 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Plus size={13} /> Add Degree
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* SKILLS */}
            <div className="border-t border-white/5">
              <SectionHeader id="skills" icon={Sparkles} label="Skills" count={skillsInput.split(',').filter(s => s.trim()).length} />
              <AnimatePresence>
                {expandedSection === 'skills' && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="pt-2 pb-3 space-y-2">
                      <textarea
                        value={skillsInput}
                        onChange={(e) => setSkillsInput(e.target.value)}
                        onBlur={() => updateField('skills', skillsInput.split(',').map(s => s.trim()).filter(Boolean))}
                        placeholder="React, TypeScript, Node.js, PostgreSQL, AWS, …"
                        className="w-full h-20 bg-white/5 border border-white/10 rounded-xl p-3 text-white/80 placeholder-white/20 text-sm resize-none focus:outline-none focus:border-violet-500/50"
                      />
                      <p className="text-xs text-white/30">Comma-separated. Updates as you type.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* PROJECTS */}
            <div className="border-t border-white/5">
              <SectionHeader id="projects" icon={Code} label="Projects" count={resumeData.projects.filter(p => p.name).length} />
              <AnimatePresence>
                {expandedSection === 'projects' && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="space-y-3 pt-2 pb-3">
                      {resumeData.projects.map((p, i) => (
                        <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-3 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-white/40 font-semibold">Project #{i + 1}</span>
                            {resumeData.projects.length > 1 && (
                              <button onClick={() => removeItem('projects', i)} className="text-white/30 hover:text-red-400">
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                          <Input placeholder="Project Name" value={p.name} onChange={(e) => updateArrayItem('projects', i, 'name', e.target.value)} />
                          <Input placeholder="Tech Stack (React, Node, AWS…)" value={p.tech} onChange={(e) => updateArrayItem('projects', i, 'tech', e.target.value)} />
                          <textarea
                            value={p.description}
                            onChange={(e) => updateArrayItem('projects', i, 'description', e.target.value)}
                            placeholder="What it does and impact…"
                            className="w-full h-16 bg-white/5 border border-white/10 rounded-lg p-2.5 text-white/80 placeholder-white/20 text-xs resize-none focus:outline-none focus:border-violet-500/50"
                          />
                        </div>
                      ))}
                      <button
                        onClick={() => addItem('projects', { name: '', description: '', tech: '' })}
                        className="w-full border border-dashed border-white/10 rounded-xl py-2 text-xs text-white/50 hover:text-white hover:border-violet-500/30 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Plus size={13} /> Add Project
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* CERTIFICATIONS */}
            <div className="border-t border-white/5">
              <SectionHeader id="certs" icon={Award} label="Certifications" count={resumeData.certifications.filter(Boolean).length} />
              <AnimatePresence>
                {expandedSection === 'certs' && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="pt-2 pb-3">
                      <textarea
                        value={resumeData.certifications.join('\n')}
                        onChange={(e) => updateField('certifications', e.target.value.split('\n'))}
                        placeholder="One certification per line…&#10;AWS Solutions Architect Associate&#10;Google Cloud Professional"
                        className="w-full h-20 bg-white/5 border border-white/10 rounded-xl p-3 text-white/80 placeholder-white/20 text-sm resize-none focus:outline-none focus:border-violet-500/50"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Card>

          {/* Action buttons */}
          <Card animate delay={0.1}>
            <div className="space-y-2">
              <Button onClick={handleImprove} loading={improving} fullWidth>
                <Wand2 size={15} /> Polish Every Section with AI
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={handleAnalyze} loading={analyzing} variant="outline">
                  <BarChart3 size={14} /> ATS Score
                </Button>
                <Button onClick={handleSaveToProfile} loading={savingProfile} variant="outline">
                  <Save size={14} /> Save to Profile
                </Button>
              </div>
              <Button onClick={downloadPDF} loading={generatingPDF} fullWidth>
                <Download size={15} /> Download Premium PDF
              </Button>
            </div>
          </Card>
        </div>

        {/* RIGHT: Live Preview + ATS */}
        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          {/* Live Preview */}
          <Card animate>
            <h2 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText size={14} className="text-violet-400" /> Live Preview
              </span>
              <span className="text-white/40 text-xs font-normal">
                {RESUME_TEMPLATES.find(t => t.id === templateId)?.label}
              </span>
            </h2>
            <div className="bg-white rounded-xl overflow-hidden aspect-[210/297] shadow-2xl">
              <LivePreview data={resumeData} templateId={templateId} skillsText={skillsInput} />
            </div>
          </Card>

          {/* ATS Analysis */}
          {analysis && (
            <Card animate className="relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-white">ATS Analysis</h2>
                <Badge color={analysis.score >= 80 ? 'green' : analysis.score >= 60 ? 'yellow' : 'red'} dot>
                  {analysis.score}/100
                </Badge>
              </div>
              <div className="mb-3">
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${analysis.score}%` }}
                    transition={{ duration: 1 }}
                    className={`h-2 rounded-full ${
                      analysis.score >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        : analysis.score >= 60 ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                          : 'bg-gradient-to-r from-red-500 to-rose-500'
                    }`}
                  />
                </div>
              </div>
              {analysis.suggestions?.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-violet-400 mb-1.5">Top Suggestions</h3>
                  <ul className="space-y-1">
                    {analysis.suggestions.slice(0, 4).map((s, i) => (
                      <li key={i} className="text-white/50 text-xs flex items-start gap-1.5">
                        <span className="text-violet-400 mt-0.5">→</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.keywords?.length > 0 && (
                <div className="mt-3">
                  <h3 className="text-xs font-semibold text-yellow-400 mb-1.5">Missing Keywords</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.keywords.slice(0, 8).map((kw, i) => <Badge key={i} color="yellow">{kw}</Badge>)}
                  </div>
                </div>
              )}
            </Card>
          )}

          {extractedProfile && (
            <Card animate className="border border-violet-500/20 bg-violet-500/5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckSquare size={14} className="text-violet-400" /> Profile Data Detected
                </h3>
                <button onClick={() => setExtractedProfile(null)} className="text-white/30 hover:text-white">
                  <X size={14} />
                </button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

// ─── TEMPLATE PREVIEW THUMBNAIL ──────────────────────────────────────────────
function TemplatePreview({ swatch, accent, active }) {
  const ring = active ? `ring-2 ring-violet-400` : ''
  if (swatch === 'sidebar-left-dark') {
    return (
      <div className={`w-full aspect-[3/4] bg-white rounded-md overflow-hidden flex ${ring}`}>
        <div className="w-1/3" style={{ background: accent }}>
          <div className="p-1.5 space-y-1">
            <div className="h-1.5 bg-white/80 rounded-sm w-3/4" />
            <div className="h-0.5 bg-white/50 rounded-sm w-1/2" />
            <div className="h-0.5 bg-white/30 rounded-sm w-2/3 mt-2" />
            <div className="h-0.5 bg-white/30 rounded-sm w-1/2" />
          </div>
        </div>
        <div className="flex-1 p-1.5 space-y-1">
          <div className="h-1 rounded-sm w-1/3" style={{ background: accent }} />
          <div className="h-0.5 bg-gray-300 rounded-sm" />
          <div className="h-0.5 bg-gray-200 rounded-sm w-4/5" />
          <div className="h-1 rounded-sm w-1/2 mt-1.5" style={{ background: accent }} />
          <div className="h-0.5 bg-gray-300 rounded-sm" />
          <div className="h-0.5 bg-gray-200 rounded-sm w-3/4" />
        </div>
      </div>
    )
  }
  if (swatch === 'sidebar-right-light') {
    return (
      <div className={`w-full aspect-[3/4] bg-white rounded-md overflow-hidden flex ${ring}`}>
        <div className="flex-1 p-1.5 space-y-1">
          <div className="h-1.5 rounded-sm w-3/4" style={{ background: accent }} />
          <div className="h-0.5 bg-gray-200 rounded-sm w-1/2" />
          <div className="h-1 rounded-sm w-2/5 mt-2" style={{ background: accent }} />
          <div className="h-0.5 bg-gray-300 rounded-sm" />
          <div className="h-0.5 bg-gray-200 rounded-sm w-4/5" />
        </div>
        <div className="w-1/3 bg-gray-100 border-l-2 p-1.5 space-y-1" style={{ borderColor: accent }}>
          <div className="h-1 rounded-sm w-3/4" style={{ background: accent }} />
          <div className="h-0.5 bg-gray-300 rounded-sm w-2/3" />
          <div className="h-0.5 bg-gray-300 rounded-sm w-1/2" />
          <div className="h-0.5 bg-gray-300 rounded-sm w-3/4 mt-1.5" />
        </div>
      </div>
    )
  }
  if (swatch === 'header-band') {
    return (
      <div className={`w-full aspect-[3/4] bg-white rounded-md overflow-hidden ${ring}`}>
        <div className="h-1/4 p-1.5" style={{ background: accent }}>
          <div className="h-1.5 bg-white/80 rounded-sm w-2/3" />
          <div className="h-0.5 bg-white/50 rounded-sm w-1/2 mt-1" />
        </div>
        <div className="p-1.5 space-y-1">
          <div className="h-1 rounded-sm w-1/3" style={{ background: accent }} />
          <div className="h-0.5 bg-gray-300 rounded-sm" />
          <div className="h-0.5 bg-gray-200 rounded-sm w-4/5" />
          <div className="h-1 rounded-sm w-2/5 mt-1.5" style={{ background: accent }} />
          <div className="h-0.5 bg-gray-200 rounded-sm w-3/4" />
        </div>
      </div>
    )
  }
  if (swatch === 'centered-serif') {
    return (
      <div className={`w-full aspect-[3/4] bg-white rounded-md overflow-hidden p-2 ${ring}`}>
        <div className="text-center space-y-1">
          <div className="h-1.5 bg-gray-700 rounded-sm w-3/4 mx-auto" />
          <div className="h-0.5 rounded-sm w-1/2 mx-auto" style={{ background: accent }} />
          <div className="h-px mx-2" style={{ background: accent }} />
        </div>
        <div className="mt-2 space-y-1">
          <div className="h-0.5 rounded-sm w-1/4 mx-auto" style={{ background: accent }} />
          <div className="h-0.5 bg-gray-200 rounded-sm" />
          <div className="h-0.5 bg-gray-200 rounded-sm w-5/6" />
          <div className="h-0.5 rounded-sm w-1/4 mx-auto mt-1.5" style={{ background: accent }} />
          <div className="h-0.5 bg-gray-200 rounded-sm" />
        </div>
      </div>
    )
  }
  if (swatch === 'sidebar-left-bold') {
    return (
      <div className={`w-full aspect-[3/4] bg-white rounded-md overflow-hidden flex ${ring}`}>
        <div className="w-2/5 flex flex-col items-center p-1.5 space-y-1" style={{ background: accent }}>
          <div className="w-4 h-4 rounded-full bg-white mt-1" />
          <div className="h-1 bg-white/80 rounded-sm w-3/4" />
          <div className="h-0.5 bg-white/50 rounded-sm w-2/3" />
          <div className="h-0.5 bg-white/30 rounded-sm w-1/2 mt-1.5" />
        </div>
        <div className="flex-1 p-1.5 space-y-1">
          <div className="h-1 rounded-sm w-1/3" style={{ background: accent }} />
          <div className="h-0.5 bg-gray-300 rounded-sm" />
          <div className="h-0.5 bg-gray-200 rounded-sm w-4/5" />
          <div className="h-1 rounded-sm w-2/5 mt-1.5" style={{ background: accent }} />
          <div className="h-0.5 bg-gray-200 rounded-sm" />
        </div>
      </div>
    )
  }
  return null
}

// ─── LIVE HTML PREVIEW (matches PDF templates roughly) ───────────────────────
function LivePreview({ data, templateId, skillsText }) {
  const template = RESUME_TEMPLATES.find(t => t.id === templateId) || RESUME_TEMPLATES[0]
  const accent = template.accent
  const skills = skillsText.split(',').map(s => s.trim()).filter(Boolean)
  const c = data.contact || {}
  const contactList = [c.email, c.phone, c.location,
    c.linkedin?.replace(/https?:\/\//, ''),
    c.github?.replace(/https?:\/\//, ''),
    c.website?.replace(/https?:\/\//, '')].filter(Boolean)

  if (templateId === 'cascade') {
    return (
      <div className="w-full h-full flex text-[6px] leading-tight">
        <div className="w-[35%] p-2 text-white" style={{ background: accent }}>
          <div className="font-bold text-[10px] leading-tight">{data.name || 'Your Name'}</div>
          <div className="text-[7px] opacity-80 mt-1">{data.headline}</div>
          <div className="mt-3">
            <div className="font-bold uppercase text-[7px] border-b border-white/40 pb-0.5 mb-1">Contact</div>
            {contactList.map((v, i) => <div key={i} className="text-[6px] opacity-90 mb-0.5 break-all">{v}</div>)}
          </div>
          {skills.length > 0 && (
            <div className="mt-3">
              <div className="font-bold uppercase text-[7px] border-b border-white/40 pb-0.5 mb-1">Skills</div>
              {skills.slice(0, 10).map((s, i) => <div key={i} className="text-[6px] opacity-90">• {s}</div>)}
            </div>
          )}
          {data.education?.length > 0 && (
            <div className="mt-3">
              <div className="font-bold uppercase text-[7px] border-b border-white/40 pb-0.5 mb-1">Education</div>
              {data.education.map((e, i) => (
                <div key={i} className="mb-1.5">
                  <div className="text-[6.5px] font-bold">{e.degree}</div>
                  <div className="text-[6px] opacity-80">{[e.school, e.year].filter(Boolean).join(' · ')}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 p-2 text-gray-800">
          {data.summary && (
            <>
              <div className="font-bold uppercase text-[8px] border-b" style={{ color: accent, borderColor: accent }}>Profile</div>
              <div className="text-[6.5px] mt-1 mb-2">{data.summary}</div>
            </>
          )}
          {data.experience?.length > 0 && data.experience[0].title && (
            <>
              <div className="font-bold uppercase text-[8px] border-b" style={{ color: accent, borderColor: accent }}>Experience</div>
              {data.experience.filter(e => e.title).map((e, i) => (
                <div key={i} className="mt-1.5">
                  <div className="flex justify-between">
                    <span className="font-bold text-[7px]">{e.title}</span>
                    <span className="text-[6px] text-gray-500">{e.duration}</span>
                  </div>
                  <div className="italic text-[6.5px]" style={{ color: accent }}>{e.company}</div>
                  {e.bullets?.filter(Boolean).slice(0, 3).map((b, bi) => (
                    <div key={bi} className="text-[6px] mt-0.5">• {b}</div>
                  ))}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    )
  }

  if (templateId === 'crisp') {
    return (
      <div className="w-full h-full flex text-[6px] leading-tight bg-white">
        <div className="flex-1 p-2 text-gray-800">
          <div className="font-bold text-[12px]" style={{ color: accent }}>{data.name || 'Your Name'}</div>
          <div className="text-[7px] text-gray-600 mt-1">{data.headline}</div>
          {data.summary && (
            <>
              <div className="font-bold uppercase text-[7.5px] mt-2 mb-1" style={{ color: accent }}>Profile</div>
              <div className="text-[6.5px]">{data.summary}</div>
            </>
          )}
          {data.experience?.length > 0 && data.experience[0].title && (
            <>
              <div className="font-bold uppercase text-[7.5px] mt-2 mb-1" style={{ color: accent }}>Experience</div>
              {data.experience.filter(e => e.title).map((e, i) => (
                <div key={i} className="mt-1.5">
                  <div className="font-bold text-[7px]">{e.title}</div>
                  <div className="text-[6.5px]" style={{ color: accent }}>{e.company} · {e.duration}</div>
                  {e.bullets?.filter(Boolean).slice(0, 3).map((b, bi) => (
                    <div key={bi} className="text-[6px] mt-0.5">• {b}</div>
                  ))}
                </div>
              ))}
            </>
          )}
        </div>
        <div className="w-[30%] p-2 bg-gray-100 border-l-2" style={{ borderColor: accent }}>
          <div className="font-bold uppercase text-[7px] mb-1" style={{ color: accent }}>Contact</div>
          {contactList.map((v, i) => <div key={i} className="text-[6px] text-gray-700 break-all mb-0.5">{v}</div>)}
          {skills.length > 0 && (
            <>
              <div className="font-bold uppercase text-[7px] mt-2 mb-1" style={{ color: accent }}>Skills</div>
              {skills.slice(0, 10).map((s, i) => <div key={i} className="text-[6px] text-gray-700">• {s}</div>)}
            </>
          )}
          {data.education?.length > 0 && data.education[0].degree && (
            <>
              <div className="font-bold uppercase text-[7px] mt-2 mb-1" style={{ color: accent }}>Education</div>
              {data.education.filter(e => e.degree).map((e, i) => (
                <div key={i} className="mb-1">
                  <div className="font-bold text-[6.5px]">{e.degree}</div>
                  <div className="text-[6px] text-gray-600">{[e.school, e.year].filter(Boolean).join(' · ')}</div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    )
  }

  if (templateId === 'concept') {
    return (
      <div className="w-full h-full text-[6px] leading-tight bg-white">
        <div className="p-2 text-white" style={{ background: accent }}>
          <div className="font-bold text-[12px]">{data.name || 'Your Name'}</div>
          <div className="text-[7px] opacity-90">{data.headline}</div>
          <div className="text-[5.5px] opacity-80 mt-1">{contactList.join(' · ')}</div>
        </div>
        <div className="p-2 text-gray-800">
          {data.summary && (
            <>
              <div className="font-bold uppercase text-[7.5px] mb-1" style={{ color: accent }}>Profile</div>
              <div className="text-[6.5px] mb-2">{data.summary}</div>
            </>
          )}
          {data.experience?.length > 0 && data.experience[0].title && (
            <>
              <div className="font-bold uppercase text-[7.5px] mb-1" style={{ color: accent }}>Experience</div>
              {data.experience.filter(e => e.title).map((e, i) => (
                <div key={i} className="mt-1.5">
                  <div className="flex justify-between font-bold text-[7px]">
                    <span>{e.title} · {e.company}</span>
                    <span className="text-gray-500">{e.duration}</span>
                  </div>
                  {e.bullets?.filter(Boolean).slice(0, 3).map((b, bi) => (
                    <div key={bi} className="text-[6px] mt-0.5">• {b}</div>
                  ))}
                </div>
              ))}
            </>
          )}
          {(skills.length > 0 || data.education?.length > 0) && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {skills.length > 0 && (
                <div>
                  <div className="font-bold text-[6.5px] text-gray-700">Skills</div>
                  <div className="text-[6px]">{skills.join(' · ')}</div>
                </div>
              )}
              {data.education?.length > 0 && data.education[0].degree && (
                <div>
                  <div className="font-bold text-[6.5px] text-gray-700">Education</div>
                  {data.education.filter(e => e.degree).map((e, i) => (
                    <div key={i} className="text-[6px]">
                      <div className="font-bold">{e.degree}</div>
                      <div>{[e.school, e.year].filter(Boolean).join(' · ')}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (templateId === 'diamond') {
    return (
      <div className="w-full h-full text-[6px] leading-tight bg-white p-3 font-serif">
        <div className="text-center">
          <div className="font-bold text-[13px] text-gray-900">{data.name || 'Your Name'}</div>
          <div className="italic text-[8px] mt-0.5" style={{ color: accent }}>{data.headline}</div>
          <div className="border-t-2 mx-6 mt-1.5" style={{ borderColor: accent }} />
          <div className="border-t mx-6 mt-0.5" style={{ borderColor: accent }} />
          <div className="text-[5.5px] mt-1 text-gray-600">{contactList.join(' · ')}</div>
        </div>
        {data.summary && (
          <div className="mt-3">
            <div className="font-bold uppercase text-[7.5px] text-center" style={{ color: accent }}>Profile</div>
            <div className="text-[6.5px] mt-1 text-gray-800">{data.summary}</div>
          </div>
        )}
        {data.experience?.length > 0 && data.experience[0].title && (
          <div className="mt-2">
            <div className="font-bold uppercase text-[7.5px] text-center" style={{ color: accent }}>Experience</div>
            {data.experience.filter(e => e.title).map((e, i) => (
              <div key={i} className="mt-1.5">
                <div className="flex justify-between">
                  <span className="font-bold text-[7px]">{e.title}</span>
                  <span className="italic text-[6px] text-gray-500">{e.duration}</span>
                </div>
                <div className="italic text-[6.5px]" style={{ color: accent }}>{e.company}</div>
                {e.bullets?.filter(Boolean).slice(0, 3).map((b, bi) => (
                  <div key={bi} className="text-[6px] mt-0.5">• {b}</div>
                ))}
              </div>
            ))}
          </div>
        )}
        {skills.length > 0 && (
          <div className="mt-2">
            <div className="font-bold uppercase text-[7.5px] text-center" style={{ color: accent }}>Skills</div>
            <div className="text-[6.5px] mt-1 text-center text-gray-800">{skills.join(' · ')}</div>
          </div>
        )}
      </div>
    )
  }

  if (templateId === 'iconic') {
    const initials = (data.name || 'YN').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
    return (
      <div className="w-full h-full flex text-[6px] leading-tight bg-white">
        <div className="w-[38%] p-2 text-white text-center" style={{ background: accent }}>
          <div className="w-8 h-8 mx-auto rounded-full bg-white flex items-center justify-center mb-2">
            <span className="font-bold text-[10px]" style={{ color: accent }}>{initials}</span>
          </div>
          <div className="font-bold text-[9px]">{data.name || 'Your Name'}</div>
          <div className="text-[6.5px] opacity-90 mt-0.5">{data.headline}</div>
          <div className="mt-3">
            <div className="font-bold uppercase text-[7px] mb-1">Contact</div>
            <div className="w-6 h-px bg-white mx-auto mb-1" />
            {contactList.map((v, i) => <div key={i} className="text-[5.5px] opacity-90 break-all mb-0.5">{v}</div>)}
          </div>
          {skills.length > 0 && (
            <div className="mt-3">
              <div className="font-bold uppercase text-[7px] mb-1">Skills</div>
              <div className="w-6 h-px bg-white mx-auto mb-1" />
              {skills.slice(0, 8).map((s, i) => <div key={i} className="text-[6px] opacity-90">{s}</div>)}
            </div>
          )}
        </div>
        <div className="flex-1 p-2 text-gray-800">
          {data.summary && (
            <>
              <div className="font-bold uppercase text-[8px]" style={{ color: accent }}>Profile</div>
              <div className="w-5 h-0.5 mb-1" style={{ background: accent }} />
              <div className="text-[6.5px] mb-2">{data.summary}</div>
            </>
          )}
          {data.experience?.length > 0 && data.experience[0].title && (
            <>
              <div className="font-bold uppercase text-[8px]" style={{ color: accent }}>Experience</div>
              <div className="w-5 h-0.5 mb-1" style={{ background: accent }} />
              {data.experience.filter(e => e.title).map((e, i) => (
                <div key={i} className="mt-1.5">
                  <div className="font-bold text-[7px]">{e.title}</div>
                  <div className="flex justify-between text-[6.5px]" style={{ color: accent }}>
                    <span className="font-bold">{e.company}</span>
                    <span className="text-gray-500 font-normal">{e.duration}</span>
                  </div>
                  {e.bullets?.filter(Boolean).slice(0, 3).map((b, bi) => (
                    <div key={bi} className="text-[6px] mt-0.5">• {b}</div>
                  ))}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    )
  }

  return <div className="p-4 text-gray-400 text-xs">Select a template</div>
}
