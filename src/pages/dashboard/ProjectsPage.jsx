// Projects page — add, edit, display projects
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, ExternalLink, Image, Trash2, Edit2, FolderOpen } from 'lucide-react'
import { GithubIcon as Github } from '@/components/ui/SocialIcons'
import DashboardLayout from '@/layouts/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import { supabase } from '@/lib/supabase'
import { uploadProjectImage } from '@/lib/cloudinary'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

const emptyForm = {
  title: '', description: '', github_url: '', live_url: '',
  tech_stack: '', thumbnail_url: '', status: 'completed',
}

export default function ProjectsPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) fetchProjects() }, [user])

  async function fetchProjects() {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setProjects(data || [])
    setLoading(false)
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const result = await uploadProjectImage(file)
      setForm(f => ({ ...f, thumbnail_url: result.url }))
      toast.success('Image uploaded!')
    } catch (err) {
      toast.error(err.message)
    }
    setUploading(false)
  }

  async function handleSave() {
    if (!form.title.trim()) return toast.error('Project title is required')
    setSaving(true)

    const payload = {
      ...form,
      user_id: user.id,
      tech_stack: form.tech_stack.split(',').map(s => s.trim()).filter(Boolean),
    }

    let error
    if (editing) {
      ({ error } = await supabase.from('projects').update(payload).eq('id', editing))
    } else {
      ({ error } = await supabase.from('projects').insert(payload))
    }

    setSaving(false)
    if (error) return toast.error(error.message)
    toast.success(editing ? 'Project updated!' : 'Project added!')
    setShowForm(false)
    setEditing(null)
    setForm(emptyForm)
    fetchProjects()
  }

  function startEdit(project) {
    setForm({
      ...project,
      tech_stack: Array.isArray(project.tech_stack) ? project.tech_stack.join(', ') : project.tech_stack || '',
    })
    setEditing(project.id)
    setShowForm(true)
  }

  async function deleteProject(id) {
    if (!confirm('Delete this project?')) return
    await supabase.from('projects').delete().eq('id', id)
    toast.success('Project deleted')
    fetchProjects()
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">Projects</h1>
          <p className="text-white/40">Showcase your work to the world</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm) }}>
          <Plus size={18} /> Add Project
        </Button>
      </div>

      {/* Add/Edit form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <Card className="border border-violet-500/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  {editing ? 'Edit Project' : 'Add New Project'}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <Input
                  label="Project Title *"
                  placeholder="My Awesome App"
                  value={form.title}
                  onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-white/70">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
                  >
                    <option value="completed" className="bg-[#0a0a1f]">Completed</option>
                    <option value="in-progress" className="bg-[#0a0a1f]">In Progress</option>
                    <option value="concept" className="bg-[#0a0a1f]">Concept</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-white/70 block mb-1.5">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="What does this project do? What problem does it solve?"
                    className="w-full h-28 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 resize-none focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
                  />
                </div>

                <Input
                  label="Tech Stack (comma separated)"
                  placeholder="React, Node.js, PostgreSQL"
                  value={form.tech_stack}
                  onChange={(e) => setForm(f => ({ ...f, tech_stack: e.target.value }))}
                />
                <Input
                  label="GitHub URL"
                  placeholder="https://github.com/..."
                  value={form.github_url}
                  onChange={(e) => setForm(f => ({ ...f, github_url: e.target.value }))}
                  icon={<Github size={16} />}
                />
                <Input
                  label="Live Demo URL"
                  placeholder="https://myapp.com"
                  value={form.live_url}
                  onChange={(e) => setForm(f => ({ ...f, live_url: e.target.value }))}
                  icon={<ExternalLink size={16} />}
                />

                {/* Thumbnail upload */}
                <div>
                  <label className="text-sm font-medium text-white/70 block mb-1.5">Project Thumbnail</label>
                  <div className="flex gap-3">
                    {form.thumbnail_url && (
                      <img src={form.thumbnail_url} alt="" className="w-16 h-16 rounded-xl object-cover" />
                    )}
                    <label className="flex-1 border border-dashed border-white/10 rounded-xl px-4 py-3 text-white/30 hover:border-violet-500/50 cursor-pointer transition-colors flex items-center gap-2">
                      <Image size={16} />
                      {uploading ? 'Uploading...' : 'Upload image'}
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button onClick={handleSave} loading={saving}>
                  {editing ? 'Update Project' : 'Save Project'}
                </Button>
                <Button variant="ghost" onClick={() => { setShowForm(false); setEditing(null) }}>
                  Cancel
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass rounded-2xl h-64 skeleton" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <Card className="text-center py-20">
          <FolderOpen size={60} className="text-white/10 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No projects yet</h3>
          <p className="text-white/30 mb-6">Add your first project to showcase your work</p>
          <Button onClick={() => setShowForm(true)}>
            <Plus size={18} /> Add Your First Project
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass glass-hover rounded-2xl overflow-hidden group"
            >
              {/* Thumbnail */}
              <div className="relative h-40 bg-gradient-to-br from-violet-900/30 to-blue-900/30">
                {project.thumbnail_url ? (
                  <img src={project.thumbnail_url} alt={project.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FolderOpen size={40} className="text-white/10" />
                  </div>
                )}
                {/* Actions overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button onClick={() => startEdit(project)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => deleteProject(project.id)} className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
                <Badge color={project.status === 'completed' ? 'green' : project.status === 'in-progress' ? 'yellow' : 'white'} className="absolute top-3 left-3">
                  {project.status}
                </Badge>
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="text-white font-bold mb-1.5 truncate">{project.title}</h3>
                <p className="text-white/40 text-sm line-clamp-2 mb-3">{project.description}</p>

                {/* Tech stack */}
                {project.tech_stack?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(Array.isArray(project.tech_stack) ? project.tech_stack : []).slice(0, 4).map(tech => (
                      <Badge key={tech} color="purple">{tech}</Badge>
                    ))}
                  </div>
                )}

                {/* Links */}
                <div className="flex gap-2">
                  {project.github_url && (
                    <a href={project.github_url} target="_blank" rel="noreferrer">
                      <Button variant="ghost" size="sm">
                        <Github size={14} /> Code
                      </Button>
                    </a>
                  )}
                  {project.live_url && (
                    <a href={project.live_url} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm">
                        <ExternalLink size={14} /> Demo
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
