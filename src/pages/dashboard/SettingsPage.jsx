// Settings page — profile, appearance, links, privacy
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Link2, Eye, EyeOff, Camera, Save, Trash2, Globe } from 'lucide-react'
import { GithubIcon as Github, LinkedinIcon as Linkedin, TwitterIcon as Twitter } from '@/components/ui/SocialIcons'
import DashboardLayout from '@/layouts/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { supabase } from '@/lib/supabase'
import { uploadProfileImage } from '@/lib/cloudinary'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

const THEMES = [
  { id: 'dark',     label: 'Dark Minimal',   gradient: 'from-gray-900 to-gray-800',      dot: 'bg-violet-400' },
  { id: 'purple',   label: 'Purple Aurora',  gradient: 'from-violet-900 to-fuchsia-800', dot: 'bg-fuchsia-400' },
  { id: 'ocean',    label: 'Ocean Blue',     gradient: 'from-blue-900 to-cyan-800',       dot: 'bg-cyan-400' },
  { id: 'midnight', label: 'Midnight',       gradient: 'from-slate-900 to-slate-800',    dot: 'bg-slate-400' },
  { id: 'forest',   label: 'Forest Green',   gradient: 'from-emerald-900 to-teal-800',   dot: 'bg-emerald-400' },
  { id: 'sunset',   label: 'Sunset',         gradient: 'from-rose-900 to-orange-800',    dot: 'bg-orange-400' },
]

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth()
  const [form, setForm] = useState({
    full_name: '',
    username: '',
    bio: '',
    headline: '',
    location: '',
    website: '',
    github: '',
    linkedin: '',
    twitter: '',
    is_public: true,
    theme: 'dark',
    avatar_url: '',
    skills: '',
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        headline: profile.headline || '',
        location: profile.location || '',
        website: profile.website || '',
        github: profile.github || '',
        linkedin: profile.linkedin || '',
        twitter: profile.twitter || '',
        is_public: profile.is_public !== false,
        theme: profile.theme || 'dark',
        avatar_url: profile.avatar_url || '',
        skills: Array.isArray(profile.skills) ? profile.skills.join(', ') : profile.skills || '',
      })
    } else if (user) {
      setForm(f => ({
        ...f,
        full_name: user.user_metadata?.full_name || '',
        username: user.email?.split('@')[0] || '',
      }))
    }
  }, [profile, user])

  async function handleAvatarUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const result = await uploadProfileImage(file)
      setForm(f => ({ ...f, avatar_url: result.url }))
      toast.success('Photo uploaded!')
    } catch (err) {
      toast.error(err.message)
    }
    setUploading(false)
  }

  async function handleSave() {
    if (!form.username.trim()) return toast.error('Username is required')
    // Simple username validation
    if (!/^[a-zA-Z0-9_-]+$/.test(form.username)) {
      return toast.error('Username can only contain letters, numbers, - and _')
    }

    setSaving(true)

    const payload = {
      id: user.id,
      ...form,
      skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      email: user.email,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('profiles')
      .upsert(payload)

    setSaving(false)

    if (error) {
      if (error.message.includes('duplicate') || error.message.includes('unique')) {
        toast.error('Username already taken. Please choose another.')
      } else {
        toast.error(error.message)
      }
      return
    }

    await refreshProfile()
    toast.success('Settings saved!')
  }

  async function handleDeleteAccount() {
    const confirmed = confirm('Are you absolutely sure? This will permanently delete your account and all data.')
    if (!confirmed) return
    const confirmed2 = confirm('Last chance! Type YES to confirm deletion.')
    if (!confirmed2) return

    toast.error('Account deletion — please contact support@careerdna.app')
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-1">Settings</h1>
        <p className="text-white/40">Manage your profile, appearance, and account</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile photo */}
        <Card animate>
          <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <User size={18} className="text-violet-400" /> Profile Photo
          </h2>
          <div className="flex items-center gap-5">
            <div className="relative">
              {form.avatar_url ? (
                <img src={form.avatar_url} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-3xl font-black text-white">
                  {form.full_name.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div>
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" as="span" disabled={uploading}>
                  <Camera size={14} /> {uploading ? 'Uploading...' : 'Upload Photo'}
                </Button>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
              <p className="text-white/30 text-xs mt-2">JPG, PNG, GIF up to 10MB</p>
            </div>
          </div>
        </Card>

        {/* Basic info */}
        <Card animate delay={0.1}>
          <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <User size={18} className="text-blue-400" /> Basic Information
          </h2>
          <div className="space-y-4">
            <Input label="Full Name" placeholder="Alex Johnson" value={form.full_name} onChange={e => setForm(f => ({...f, full_name: e.target.value}))} />
            <Input
              label="Username"
              placeholder="alexjohnson"
              value={form.username}
              onChange={e => setForm(f => ({...f, username: e.target.value.toLowerCase()}))}
              hint={`Your public URL will be: careerdna.app/u/${form.username || 'username'}`}
            />
            <Input label="Professional Headline" placeholder="Full-Stack Engineer | Building at Scale" value={form.headline} onChange={e => setForm(f => ({...f, headline: e.target.value}))} />
            <div>
              <label className="text-sm font-medium text-white/70 block mb-1.5">Bio</label>
              <textarea value={form.bio} onChange={e => setForm(f => ({...f, bio: e.target.value}))} placeholder="Tell recruiters about yourself..." className="w-full h-32 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 resize-none focus:outline-none focus:border-violet-500/50" />
            </div>
            <Input label="Skills (comma separated)" placeholder="React, Python, Figma, Node.js" value={form.skills} onChange={e => setForm(f => ({...f, skills: e.target.value}))} />
            <Input label="Location" placeholder="San Francisco, CA" value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} />
          </div>
        </Card>

        {/* Social links */}
        <Card animate delay={0.2}>
          <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <Link2 size={18} className="text-cyan-400" /> Social Links
          </h2>
          <div className="space-y-4">
            <Input label="Website" placeholder="https://yourwebsite.com" value={form.website} onChange={e => setForm(f => ({...f, website: e.target.value}))} icon={<Globe size={16} />} />
            <Input label="GitHub" placeholder="https://github.com/username" value={form.github} onChange={e => setForm(f => ({...f, github: e.target.value}))} icon={<Github size={16} />} />
            <Input label="LinkedIn" placeholder="https://linkedin.com/in/username" value={form.linkedin} onChange={e => setForm(f => ({...f, linkedin: e.target.value}))} icon={<Linkedin size={16} />} />
            <Input label="Twitter / X" placeholder="https://twitter.com/username" value={form.twitter} onChange={e => setForm(f => ({...f, twitter: e.target.value}))} icon={<Twitter size={16} />} />
          </div>
        </Card>

        {/* Portfolio theme */}
        <Card animate delay={0.3}>
          <h2 className="text-lg font-bold text-white mb-1">Portfolio Theme</h2>
          <p className="text-white/30 text-sm mb-5">Choose how your public profile looks to recruiters</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {THEMES.map(theme => (
              <button
                key={theme.id}
                onClick={() => setForm(f => ({...f, theme: theme.id}))}
                className={`rounded-xl p-3 border transition-all text-left ${
                  form.theme === theme.id
                    ? 'border-violet-500 bg-violet-500/10 ring-1 ring-violet-500/30'
                    : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
                }`}
              >
                <div className={`w-full h-10 rounded-lg bg-gradient-to-r ${theme.gradient} mb-2 relative overflow-hidden`}>
                  <div className={`absolute bottom-1.5 right-1.5 w-3 h-3 rounded-full ${theme.dot} shadow-lg`} />
                </div>
                <div className="flex items-center gap-1.5">
                  {form.theme === theme.id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                  )}
                  <p className={`text-sm font-medium truncate ${form.theme === theme.id ? 'text-white' : 'text-white/60'}`}>
                    {theme.label}
                  </p>
                </div>
              </button>
            ))}
          </div>
          <p className="text-white/20 text-xs mt-3">Save settings for the theme to apply to your public profile link</p>
        </Card>

        {/* Privacy */}
        <Card animate delay={0.4}>
          <h2 className="text-lg font-bold text-white mb-5">Privacy</h2>
          <div
            onClick={() => setForm(f => ({...f, is_public: !f.is_public}))}
            className="flex items-center justify-between p-4 rounded-xl cursor-pointer hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              {form.is_public ? <Eye size={18} className="text-emerald-400" /> : <EyeOff size={18} className="text-white/30" />}
              <div>
                <p className="text-white font-medium">Public Profile</p>
                <p className="text-white/30 text-sm">{form.is_public ? 'Anyone with your link can view your profile' : 'Your profile is hidden from everyone'}</p>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full transition-all ${form.is_public ? 'bg-violet-500' : 'bg-white/10'} relative`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${form.is_public ? 'left-6' : 'left-0.5'}`} />
            </div>
          </div>
        </Card>

        {/* Save button */}
        <Button onClick={handleSave} loading={saving} size="lg" fullWidth>
          <Save size={18} /> Save All Changes
        </Button>

        {/* Danger zone */}
        <Card animate delay={0.5} className="border border-red-500/20">
          <h2 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
            <Trash2 size={18} /> Danger Zone
          </h2>
          <p className="text-white/40 text-sm mb-4">Permanently delete your account and all associated data. This cannot be undone.</p>
          <Button variant="danger" onClick={handleDeleteAccount}>Delete My Account</Button>
        </Card>
      </div>
    </DashboardLayout>
  )
}
