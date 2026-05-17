// Achievements page — certificates, awards, hackathons in a timeline
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Trophy, Award, Briefcase, BookOpen, Star, Trash2, Edit2, Calendar } from 'lucide-react'
import DashboardLayout from '@/layouts/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

const ACHIEVEMENT_TYPES = [
  { value: 'certificate', label: 'Certificate', icon: Award, color: 'purple' },
  { value: 'hackathon', label: 'Hackathon', icon: Trophy, color: 'yellow' },
  { value: 'internship', label: 'Internship', icon: Briefcase, color: 'blue' },
  { value: 'award', label: 'Award', icon: Star, color: 'amber' },
  { value: 'workshop', label: 'Workshop', icon: BookOpen, color: 'green' },
  { value: 'course', label: 'Course', icon: BookOpen, color: 'cyan' },
]

const emptyForm = {
  title: '', organization: '', date: '', type: 'certificate', description: '', credential_url: '',
}

export default function AchievementsPage() {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) fetchAchievements() }, [user])

  async function fetchAchievements() {
    const { data } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
    setAchievements(data || [])
    setLoading(false)
  }

  async function handleSave() {
    if (!form.title.trim()) return toast.error('Title is required')
    setSaving(true)

    const payload = { ...form, user_id: user.id }
    let error

    if (editing) {
      ({ error } = await supabase.from('achievements').update(payload).eq('id', editing))
    } else {
      ({ error } = await supabase.from('achievements').insert(payload))
    }

    setSaving(false)
    if (error) return toast.error(error.message)
    toast.success(editing ? 'Achievement updated!' : 'Achievement added!')
    setShowForm(false)
    setEditing(null)
    setForm(emptyForm)
    fetchAchievements()
  }

  function startEdit(item) {
    setForm(item)
    setEditing(item.id)
    setShowForm(true)
  }

  async function deleteItem(id) {
    if (!confirm('Delete this achievement?')) return
    await supabase.from('achievements').delete().eq('id', id)
    toast.success('Achievement deleted')
    fetchAchievements()
  }

  const typeInfo = (type) => ACHIEVEMENT_TYPES.find(t => t.value === type) || ACHIEVEMENT_TYPES[0]

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">Achievements</h1>
          <p className="text-white/40">Your certificates, awards, and milestones</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm) }}>
          <Plus size={18} /> Add Achievement
        </Button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <Card className="border border-violet-500/20">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-white">{editing ? 'Edit' : 'Add'} Achievement</h2>
                <button onClick={() => { setShowForm(false); setEditing(null) }} className="text-white/40 hover:text-white"><X size={20} /></button>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <Input label="Title *" placeholder="Google Cloud Professional Certificate" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                <Input label="Organization" placeholder="Google, Coursera, IIT..." value={form.organization} onChange={e => setForm(f => ({ ...f, organization: e.target.value }))} />

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-white/70">Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500/50">
                    {ACHIEVEMENT_TYPES.map(t => <option key={t.value} value={t.value} className="bg-[#0a0a1f]">{t.label}</option>)}
                  </select>
                </div>

                <Input label="Date" type="month" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-white/70 block mb-1.5">Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What did you learn or achieve?" className="w-full h-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 resize-none focus:outline-none focus:border-violet-500/50" />
                </div>

                <div className="md:col-span-2">
                  <Input label="Credential / Certificate URL" placeholder="https://credential.link/..." value={form.credential_url} onChange={e => setForm(f => ({ ...f, credential_url: e.target.value }))} />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button onClick={handleSave} loading={saving}>{editing ? 'Update' : 'Save'} Achievement</Button>
                <Button variant="ghost" onClick={() => { setShowForm(false); setEditing(null) }}>Cancel</Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline */}
      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="glass rounded-2xl h-24 skeleton" />)}
        </div>
      ) : achievements.length === 0 ? (
        <Card className="text-center py-20">
          <Trophy size={60} className="text-white/10 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No achievements yet</h3>
          <p className="text-white/30 mb-6">Add your certificates, hackathons, and awards</p>
          <Button onClick={() => setShowForm(true)}><Plus size={18} /> Add First Achievement</Button>
        </Card>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-violet-500/50 via-blue-500/30 to-transparent" />

          <div className="space-y-4">
            {achievements.map((item, i) => {
              const info = typeInfo(item.type)
              const Icon = info.icon
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex gap-6 group"
                >
                  {/* Timeline dot */}
                  <div className="relative flex-shrink-0 w-16 flex items-start justify-center pt-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center z-10 ${
                      info.color === 'purple' ? 'from-violet-500 to-purple-600' :
                      info.color === 'yellow' ? 'from-yellow-500 to-amber-600' :
                      info.color === 'blue' ? 'from-blue-500 to-cyan-500' :
                      info.color === 'green' ? 'from-emerald-500 to-teal-500' :
                      'from-cyan-500 to-blue-500'
                    }`}>
                      <Icon size={18} className="text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 glass glass-hover rounded-2xl p-5 relative">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-white font-bold">{item.title}</h3>
                          <Badge color={info.color}>{info.label}</Badge>
                        </div>
                        {item.organization && (
                          <p className="text-violet-400 text-sm font-medium mb-1">{item.organization}</p>
                        )}
                        {item.date && (
                          <p className="text-white/30 text-xs flex items-center gap-1 mb-2">
                            <Calendar size={11} />
                            {new Date(item.date + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </p>
                        )}
                        {item.description && <p className="text-white/40 text-sm">{item.description}</p>}
                        {item.credential_url && (
                          <a href={item.credential_url} target="_blank" rel="noreferrer" className="text-violet-400 text-xs hover:text-violet-300 mt-2 inline-block">
                            View Credential →
                          </a>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button onClick={() => startEdit(item)} className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"><Edit2 size={14} /></button>
                        <button onClick={() => deleteItem(item.id)} className="p-2 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
