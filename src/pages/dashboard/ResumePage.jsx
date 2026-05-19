// Resume page — upload, analyze, improve, download
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, FileText, Download, Sparkles, AlertCircle, CheckCircle,
  BarChart3, RefreshCw, Palette, Loader2, Edit3, Save, X,
  User, CheckSquare
} from 'lucide-react'
import DashboardLayout from '@/layouts/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { analyzeResume, improveResume, structureResumeForPDF, extractProfileFromResume } from '@/lib/openai'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import * as pdfjs from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

// ─── PDF THEMES ──────────────────────────────────────────────────────────────
const RESUME_THEMES = [
  {
    id: 'classic',   label: 'Classic',   desc: 'Black & white',
    preview: 'bg-white border border-gray-200',
    headerBg: [255,255,255], headerText: [20,20,20],
    accentColor: [30,30,30], bodyText: [50,50,50], lineColor: [180,180,180],
    accentLine: [50,50,50],
  },
  {
    id: 'modern',    label: 'Modern',    desc: 'Violet header',
    preview: 'bg-gradient-to-r from-violet-600 to-purple-600',
    headerBg: [100,50,180], headerText: [255,255,255],
    accentColor: [100,50,180], bodyText: [30,30,30], lineColor: [180,150,230],
    accentLine: [100,50,180],
  },
  {
    id: 'executive', label: 'Executive', desc: 'Navy & gold',
    preview: 'bg-gradient-to-r from-blue-900 to-blue-700',
    headerBg: [15,40,90],    headerText: [255,255,255],
    accentColor: [15,40,90], bodyText: [20,20,60], lineColor: [180,160,100],
    accentLine: [15,40,90],
  },
  {
    id: 'minimal',   label: 'Minimal',   desc: 'Light & clean',
    preview: 'bg-gradient-to-r from-gray-200 to-gray-300',
    headerBg: [245,245,248], headerText: [30,30,30],
    accentColor: [80,80,90], bodyText: [60,60,70], lineColor: [200,200,210],
    accentLine: [80,80,90],
  },
  {
    id: 'bold',      label: 'Bold',      desc: 'Dark impact',
    preview: 'bg-gradient-to-r from-gray-900 to-gray-700',
    headerBg: [20,20,30],    headerText: [255,255,255],
    accentColor: [20,20,30], bodyText: [30,30,40], lineColor: [80,80,100],
    accentLine: [20,20,30],
  },
]

// ─── PDF TEXT EXTRACTOR ───────────────────────────────────────────────────────
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

// ─── PROFESSIONAL PDF RENDERER ────────────────────────────────────────────────
function renderProfessionalPDF(data, theme) {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' })
  const pageW = 210
  const ml = 14, mr = 14
  const cW = pageW - ml - mr
  let y = 0

  const [hr, hg, hb] = theme.headerBg
  const [ht_r, ht_g, ht_b] = theme.headerText
  const [ar, ag, ab] = theme.accentColor
  const [br, bg_, bb] = theme.bodyText

  // ── HEADER ──
  const headerH = 40
  doc.setFillColor(hr, hg, hb)
  doc.rect(0, 0, pageW, headerH, 'F')

  // Accent bottom border on header
  doc.setFillColor(...theme.lineColor)
  doc.rect(0, headerH, pageW, 0.8, 'F')

  doc.setTextColor(ht_r, ht_g, ht_b)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.text(data.name || 'Your Name', ml, 14)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  const htOpacity = theme.id === 'classic' || theme.id === 'minimal' ? [80, 80, 90] : [220, 220, 240]
  doc.setTextColor(...htOpacity)
  doc.text(data.headline || '', ml, 22)

  // Contact row
  const c = data.contact || {}
  const contactParts = [
    c.email, c.phone, c.location,
    c.linkedin ? c.linkedin.replace('https://','').replace('http://','') : '',
    c.github ? c.github.replace('https://','').replace('http://','') : '',
    c.website ? c.website.replace('https://','').replace('http://','') : '',
  ].filter(Boolean)

  doc.setFontSize(7.5)
  doc.setTextColor(...htOpacity)
  const contactLine = contactParts.join('  ·  ')
  doc.text(contactLine.substring(0, 110), ml, 30)

  y = headerH + 9

  // ── SECTION HEADER helper ──
  function sectionHeader(title) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(ar, ag, ab)
    doc.text(title.toUpperCase(), ml, y)
    const tw = doc.getTextWidth(title.toUpperCase())
    doc.setDrawColor(ar, ag, ab)
    doc.setLineWidth(0.4)
    doc.line(ml + tw + 2, y - 0.5, pageW - mr, y - 0.5)
    y += 5
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(br, bg_, bb)
    doc.setFontSize(8.5)
  }

  // ── SUMMARY ──
  if (data.summary?.trim()) {
    sectionHeader('Professional Summary')
    const lines = doc.splitTextToSize(data.summary, cW)
    doc.text(lines, ml, y)
    y += lines.length * 4 + 6
  }

  // ── EXPERIENCE ──
  if (data.experience?.length) {
    sectionHeader('Experience')
    for (const exp of data.experience) {
      if (y > 265) break
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(br, bg_, bb)
      const roleText = [exp.title, exp.company].filter(Boolean).join(' — ')
      doc.text(roleText, ml, y)
      if (exp.duration) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7.5)
        doc.setTextColor(130, 130, 140)
        doc.text(exp.duration, pageW - mr - doc.getTextWidth(exp.duration), y)
      }
      y += 4.5

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(br, bg_, bb)
      for (const bullet of (exp.bullets || []).slice(0, 4)) {
        if (y > 268) break
        const bulletLines = doc.splitTextToSize(`• ${bullet}`, cW - 3)
        doc.text(bulletLines, ml + 1, y)
        y += bulletLines.length * 3.8
      }
      y += 3
    }
    y += 1
  }

  // ── EDUCATION ──
  if (data.education?.length) {
    sectionHeader('Education')
    for (const edu of data.education) {
      if (y > 270) break
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(br, bg_, bb)
      doc.text(edu.degree || '', ml, y)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      const schoolLine = [edu.school, edu.year].filter(Boolean).join(' · ')
      doc.text(schoolLine, ml, y + 4)
      y += 10
    }
    y += 1
  }

  // ── SKILLS ──
  if (data.skills?.length) {
    sectionHeader('Skills')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    const skillText = data.skills.join('  ·  ')
    const skillLines = doc.splitTextToSize(skillText, cW)
    doc.text(skillLines, ml, y)
    y += skillLines.length * 4 + 5
  }

  // ── PROJECTS ──
  if (data.projects?.filter(p => p.name).length > 0) {
    sectionHeader('Projects')
    for (const proj of data.projects.filter(p => p.name)) {
      if (y > 268) break
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(br, bg_, bb)
      doc.text(proj.name, ml, y)
      y += 4
      if (proj.tech) {
        doc.setFont('helvetica', 'italic')
        doc.setFontSize(8)
        doc.setTextColor(110, 110, 120)
        doc.text(proj.tech, ml, y)
        y += 4
        doc.setTextColor(br, bg_, bb)
      }
      if (proj.description) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8.5)
        const descLines = doc.splitTextToSize(proj.description, cW)
        doc.text(descLines, ml, y)
        y += descLines.length * 3.8
      }
      y += 3
    }
  }

  // ── CERTIFICATIONS ──
  if (data.certifications?.filter(Boolean).length > 0) {
    sectionHeader('Certifications')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(br, bg_, bb)
    for (const cert of data.certifications.filter(Boolean)) {
      if (y > 273) break
      doc.text(`• ${cert}`, ml + 1, y)
      y += 4
    }
  }

  // ── FOOTER ──
  doc.setFontSize(6.5)
  doc.setTextColor(160, 160, 170)
  doc.text('Created with CareerDNA  ·  careeerdna.netlify.app', pageW / 2, 291, { align: 'center' })

  return doc
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function ResumePage() {
  const { user, profile, refreshProfile } = useAuth()

  // Core resume states
  const [resumeText, setResumeText]   = useState('')
  const [analysis, setAnalysis]       = useState(null)
  const [improved, setImproved]       = useState('')
  const [editingImproved, setEditing] = useState(false)
  const [editText, setEditText]       = useState('')

  // Loading states
  const [analyzing, setAnalyzing]     = useState(false)
  const [improving, setImproving]     = useState(false)
  const [parsing, setParsing]         = useState(false)
  const [generatingPDF, setGenPDF]    = useState(false)
  const [extracting, setExtracting]   = useState(false)
  const [savingProfile, setSavingPro] = useState(false)

  // UI states
  const [dragOver, setDragOver]         = useState(false)
  const [resumeTheme, setResumeTheme]   = useState('modern')
  const [extractedProfile, setExtracted] = useState(null)

  const fileRef = useRef(null)

  // ── File upload ──
  async function handleFile(file) {
    if (!file) return
    const isPDF = file.type === 'application/pdf' || file.name.endsWith('.pdf')
    const isTXT = file.type.includes('text') || file.name.endsWith('.txt')
    if (!isPDF && !isTXT) return toast.error('Please upload a PDF or TXT file')

    if (isPDF) {
      setParsing(true)
      try {
        const text = await extractTextFromPDF(file)
        if (!text.trim()) {
          toast.error('Could not extract text. Paste your resume text manually instead.')
        } else {
          setResumeText(text.trim())
          setExtracted(null)
          toast.success(`✅ PDF parsed — ${text.length.toLocaleString()} characters extracted`)
        }
      } catch {
        toast.error('PDF read failed. Please paste your resume text instead.')
      }
      setParsing(false)
    } else {
      const reader = new FileReader()
      reader.onload = (e) => {
        setResumeText(e.target.result)
        setExtracted(null)
        toast.success('Resume loaded!')
      }
      reader.readAsText(file)
    }
  }

  // ── ATS Analyze ──
  async function handleAnalyze() {
    if (!resumeText.trim()) return toast.error('Please upload or paste your resume first')
    setAnalyzing(true)
    try {
      const result = await analyzeResume(resumeText)
      setAnalysis(result)
      if (user) {
        await supabase.from('resumes').upsert({
          user_id: user.id,
          ats_score: result.score,
          content: resumeText.substring(0, 5000),
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

  // ── AI Improve ──
  async function handleImprove() {
    if (!resumeText.trim()) return toast.error('Please upload or paste your resume first')
    setImproving(true)
    try {
      const result = await improveResume(resumeText)
      setImproved(result)
      setEditText(result)
      setEditing(false)
      toast.success('Resume improved by AI!')
    } catch (err) {
      toast.error(err.message || 'Improvement failed')
    }
    setImproving(false)
  }

  // ── Extract profile from resume ──
  async function handleExtractProfile() {
    if (!resumeText.trim()) return toast.error('Upload or paste your resume first')
    setExtracting(true)
    try {
      const data = await extractProfileFromResume(resumeText)
      if (!data) throw new Error('Could not extract profile data')
      setExtracted(data)
      toast.success('Profile data extracted! Review and save below.')
    } catch (err) {
      toast.error(err.message || 'Extraction failed')
    }
    setExtracting(false)
  }

  // ── Save extracted profile to Supabase ──
  async function handleSaveProfile() {
    if (!extractedProfile || !user) return
    setSavingPro(true)
    try {
      const payload = {
        id: user.id,
        email: user.email,
        full_name: extractedProfile.full_name || profile?.full_name || '',
        headline: extractedProfile.headline || profile?.headline || '',
        bio: extractedProfile.bio || profile?.bio || '',
        location: extractedProfile.location || profile?.location || '',
        skills: extractedProfile.skills?.length ? extractedProfile.skills : (profile?.skills || []),
        linkedin: extractedProfile.linkedin || profile?.linkedin || '',
        github: extractedProfile.github || profile?.github || '',
        website: extractedProfile.website || profile?.website || '',
        updated_at: new Date().toISOString(),
      }
      const { error } = await supabase.from('profiles').upsert(payload)
      if (error) throw error
      await refreshProfile()
      setExtracted(null)
      toast.success('✅ Profile updated from resume!')
    } catch (err) {
      toast.error(err.message || 'Save failed')
    }
    setSavingPro(false)
  }

  // ── Download professional PDF ──
  async function downloadPDF() {
    const content = editingImproved ? editText : (improved || resumeText)
    if (!content.trim()) return toast.error('No resume content to download')

    const theme = RESUME_THEMES.find(t => t.id === resumeTheme) || RESUME_THEMES[0]
    setGenPDF(true)
    toast.loading('Structuring resume…', { id: 'pdf' })

    try {
      // Use AI to structure content into proper sections
      const structured = await structureResumeForPDF(content)

      if (!structured) {
        // Fallback: basic text PDF if AI fails
        toast.dismiss('pdf')
        const doc = new jsPDF()
        doc.setFontSize(11)
        doc.text(doc.splitTextToSize(content, 180), 15, 20)
        doc.save(`careerdna-resume-${theme.id}.pdf`)
        toast.success('PDF downloaded (basic layout)')
      } else {
        const doc = renderProfessionalPDF(structured, theme)
        doc.save(`careerdna-resume-${theme.id}.pdf`)
        toast.dismiss('pdf')
        toast.success(`✅ Professional resume downloaded! (${theme.label} theme)`)
      }
    } catch (err) {
      toast.dismiss('pdf')
      toast.error('PDF generation failed: ' + err.message)
    }
    setGenPDF(false)
  }

  const scoreColor = !analysis ? 'white'
    : analysis.score >= 80 ? 'green'
    : analysis.score >= 60 ? 'yellow' : 'red'

  const currentContent = editingImproved ? editText : improved

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-black text-white mb-1">Resume</h1>
        <p className="text-white/40">Upload → analyze ATS score → AI improve → download a professional PDF</p>
      </div>

      {/* ── PDF Theme Picker ── */}
      <Card animate className="mb-6">
        <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
          <Palette size={16} className="text-violet-400" /> Resume PDF Theme
        </h2>
        <p className="text-white/30 text-sm mb-3">Applied to your downloaded PDF</p>
        <div className="flex gap-3 flex-wrap">
          {RESUME_THEMES.map(theme => (
            <button
              key={theme.id}
              onClick={() => setResumeTheme(theme.id)}
              className={`rounded-xl p-3 border text-left transition-all min-w-[90px] ${
                resumeTheme === theme.id
                  ? 'border-violet-500 bg-violet-500/10 ring-1 ring-violet-500/30'
                  : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
              }`}
            >
              <div className={`w-full h-7 rounded-lg ${theme.preview} mb-2`} />
              <p className={`text-xs font-semibold ${resumeTheme === theme.id ? 'text-white' : 'text-white/60'}`}>{theme.label}</p>
              <p className="text-white/25 text-xs">{theme.desc}</p>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── LEFT: Upload + Paste ── */}
        <div className="space-y-4">
          {/* Drop zone */}
          <Card animate>
            <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Upload size={16} className="text-violet-400" /> Upload Resume
            </h2>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
              onClick={() => !parsing && fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-7 text-center cursor-pointer transition-all ${
                dragOver ? 'border-violet-500 bg-violet-500/10'
                : 'border-white/10 hover:border-violet-500/50 hover:bg-white/[0.02]'
              }`}
            >
              {parsing ? (
                <>
                  <Loader2 size={36} className="text-violet-400 mx-auto mb-2 animate-spin" />
                  <p className="text-violet-300 font-medium text-sm">Extracting text from PDF…</p>
                </>
              ) : (
                <>
                  <FileText size={36} className="text-white/20 mx-auto mb-2" />
                  <p className="text-white/60 font-medium text-sm">Drop your resume here</p>
                  <p className="text-white/30 text-xs mt-1">PDF or TXT — text is auto-extracted</p>
                </>
              )}
              <input ref={fileRef} type="file" accept=".pdf,.txt" className="hidden"
                onChange={(e) => handleFile(e.target.files[0])} />
            </div>
          </Card>

          {/* Paste area */}
          <Card animate delay={0.1}>
            <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <FileText size={16} className="text-blue-400" /> Or Paste Resume Text
            </h2>
            <textarea
              value={resumeText}
              onChange={(e) => { setResumeText(e.target.value); setExtracted(null) }}
              placeholder="Paste your resume content here…"
              className="w-full h-44 bg-white/5 border border-white/10 rounded-xl p-4 text-white/70 placeholder-white/20 text-sm resize-none focus:outline-none focus:border-violet-500/50 transition-all"
            />
            <div className="flex items-center justify-between mb-3">
              <p className="text-white/20 text-xs">{resumeText.length.toLocaleString()} characters</p>
              {resumeText.length > 100 && (
                <button
                  onClick={handleExtractProfile}
                  disabled={extracting}
                  className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors disabled:opacity-50"
                >
                  {extracting
                    ? <><Loader2 size={12} className="animate-spin" /> Extracting…</>
                    : <><User size={12} /> Auto-fill profile from resume</>
                  }
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAnalyze} loading={analyzing} fullWidth>
                <BarChart3 size={15} /> Analyze ATS
              </Button>
              <Button onClick={handleImprove} loading={improving} variant="outline" fullWidth>
                <Sparkles size={15} /> AI Improve
              </Button>
            </div>
          </Card>

          {/* ── Extracted Profile Preview ── */}
          <AnimatePresence>
            {extractedProfile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="border border-violet-500/20 bg-violet-500/5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <CheckSquare size={15} className="text-violet-400" />
                      Extracted from Resume
                    </h3>
                    <button onClick={() => setExtracted(null)} className="text-white/30 hover:text-white">
                      <X size={14} />
                    </button>
                  </div>

                  <div className="space-y-2 text-xs mb-4">
                    {extractedProfile.full_name && (
                      <div className="flex gap-2"><span className="text-white/30 w-20 flex-shrink-0">Name</span><span className="text-white/80">{extractedProfile.full_name}</span></div>
                    )}
                    {extractedProfile.headline && (
                      <div className="flex gap-2"><span className="text-white/30 w-20 flex-shrink-0">Headline</span><span className="text-white/80">{extractedProfile.headline}</span></div>
                    )}
                    {extractedProfile.location && (
                      <div className="flex gap-2"><span className="text-white/30 w-20 flex-shrink-0">Location</span><span className="text-white/80">{extractedProfile.location}</span></div>
                    )}
                    {extractedProfile.bio && (
                      <div className="flex gap-2"><span className="text-white/30 w-20 flex-shrink-0">Bio</span><span className="text-white/70 line-clamp-2">{extractedProfile.bio}</span></div>
                    )}
                    {extractedProfile.skills?.length > 0 && (
                      <div className="flex gap-2">
                        <span className="text-white/30 w-20 flex-shrink-0">Skills</span>
                        <span className="text-white/70">{extractedProfile.skills.slice(0,8).join(', ')}{extractedProfile.skills.length > 8 ? '…' : ''}</span>
                      </div>
                    )}
                  </div>

                  <Button onClick={handleSaveProfile} loading={savingProfile} size="sm" fullWidth>
                    <Save size={13} /> Save to Profile
                  </Button>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── RIGHT: Results ── */}
        <div className="space-y-4">
          {/* ATS Score */}
          {analysis && (
            <Card animate className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-blue-600/5" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-white">ATS Analysis</h2>
                  <Badge color={scoreColor} dot>Score: {analysis.score}/100</Badge>
                </div>

                <div className="mb-5">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-white/40">ATS Score</span>
                    <span className="text-white font-bold">{analysis.score}%</span>
                  </div>
                  <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${analysis.score}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-2.5 rounded-full ${
                        analysis.score >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        : analysis.score >= 60 ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                        : 'bg-gradient-to-r from-red-500 to-rose-500'
                      }`}
                    />
                  </div>
                </div>

                {analysis.strengths?.length > 0 && (
                  <div className="mb-3">
                    <h3 className="text-xs font-semibold text-emerald-400 mb-1.5 flex items-center gap-1">
                      <CheckCircle size={12} /> Strengths
                    </h3>
                    <ul className="space-y-1">
                      {analysis.strengths.map((s, i) => (
                        <li key={i} className="text-white/50 text-xs flex items-start gap-1.5">
                          <span className="text-emerald-400 mt-0.5">·</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.weaknesses?.length > 0 && (
                  <div className="mb-3">
                    <h3 className="text-xs font-semibold text-red-400 mb-1.5 flex items-center gap-1">
                      <AlertCircle size={12} /> Areas to Improve
                    </h3>
                    <ul className="space-y-1">
                      {analysis.weaknesses.map((w, i) => (
                        <li key={i} className="text-white/50 text-xs flex items-start gap-1.5">
                          <span className="text-red-400 mt-0.5">·</span> {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.suggestions?.length > 0 && (
                  <div className="mb-3">
                    <h3 className="text-xs font-semibold text-violet-400 mb-1.5 flex items-center gap-1">
                      <Sparkles size={12} /> Suggestions
                    </h3>
                    <ul className="space-y-1">
                      {analysis.suggestions.map((s, i) => (
                        <li key={i} className="text-white/50 text-xs flex items-start gap-1.5">
                          <span className="text-violet-400 mt-0.5">→</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {analysis.keywords?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-yellow-400 mb-1.5">Missing Keywords</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.keywords.map((kw, i) => <Badge key={i} color="yellow">{kw}</Badge>)}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Improved Resume */}
          {improved && (
            <Card animate>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles size={16} className="text-violet-400" /> AI-Improved Resume
                </h2>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => { setEditing(!editingImproved); setEditText(improved) }}
                    className={`p-1.5 rounded-lg transition-colors text-xs flex items-center gap-1 px-2 ${
                      editingImproved ? 'bg-violet-500/20 text-violet-300' : 'hover:bg-white/10 text-white/40 hover:text-white'
                    }`}
                  >
                    <Edit3 size={12} /> {editingImproved ? 'Editing' : 'Edit'}
                  </button>
                  <button
                    onClick={handleImprove}
                    disabled={improving}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                  >
                    {improving ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                  </button>
                </div>
              </div>

              {editingImproved ? (
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full h-72 bg-white/5 border border-violet-500/30 rounded-xl p-4 text-white/80 text-xs leading-relaxed resize-none focus:outline-none focus:border-violet-500/60 font-mono"
                />
              ) : (
                <div className="bg-white/[0.02] rounded-xl p-4 max-h-72 overflow-y-auto">
                  <pre className="text-white/60 text-xs leading-relaxed whitespace-pre-wrap font-mono">
                    {improved}
                  </pre>
                </div>
              )}

              <div className="mt-3">
                <Button
                  onClick={downloadPDF}
                  loading={generatingPDF}
                  fullWidth
                  size="sm"
                >
                  <Download size={14} />
                  {generatingPDF ? 'Building PDF…' : `Download Professional PDF (${RESUME_THEMES.find(t => t.id === resumeTheme)?.label})`}
                </Button>
              </div>
            </Card>
          )}

          {/* Download from original (if no improved yet but has text) */}
          {!improved && resumeText.length > 100 && (
            <Card animate delay={0.1}>
              <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <Download size={16} className="text-blue-400" /> Download as PDF
              </h2>
              <p className="text-white/30 text-sm mb-3">
                Download your current resume with the selected theme, or use AI Improve first for best results.
              </p>
              <Button onClick={downloadPDF} loading={generatingPDF} variant="outline" fullWidth size="sm">
                <Download size={14} />
                {generatingPDF ? 'Building PDF…' : `Download PDF (${RESUME_THEMES.find(t => t.id === resumeTheme)?.label})`}
              </Button>
            </Card>
          )}

          {/* Empty state */}
          {!analysis && !improved && resumeText.length <= 100 && (
            <Card animate delay={0.2} className="text-center py-12">
              <FileText size={44} className="text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">Upload or paste your resume to get started</p>
              <p className="text-white/20 text-xs mt-1">ATS score · AI improvement · professional PDF download</p>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
