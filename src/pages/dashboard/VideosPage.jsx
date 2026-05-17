// Videos page — upload and manage videos
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Video, Play, Trash2, Plus, X, Loader2 } from 'lucide-react'
import DashboardLayout from '@/layouts/DashboardLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import { uploadVideo } from '@/lib/cloudinary'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

const VIDEO_TYPES = [
  { value: 'intro', label: 'Introduction', color: 'purple' },
  { value: 'project', label: 'Project Demo', color: 'blue' },
  { value: 'achievement', label: 'Achievement', color: 'green' },
  { value: 'presentation', label: 'Presentation', color: 'cyan' },
]

export default function VideosPage() {
  const { user } = useAuth()
  const [videos, setVideos] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [form, setForm] = useState({ title: '', description: '', type: 'intro' })
  const [pendingFile, setPendingFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState(null)
  const fileRef = useRef(null)

  useEffect(() => { if (user) fetchVideos() }, [user])

  async function fetchVideos() {
    const { data } = await supabase
      .from('videos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setVideos(data || [])
    setLoading(false)
  }

  function handleFileSelect(e) {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('video/')) return toast.error('Please select a video file')
    if (file.size > 100 * 1024 * 1024) return toast.error('Video must be under 100MB')
    setPendingFile(file)
    if (!form.title) setForm(f => ({ ...f, title: file.name.replace(/\.[^/.]+$/, '') }))
    setShowForm(true)
  }

  async function handleUpload() {
    if (!pendingFile) return toast.error('Please select a video first')
    if (!form.title.trim()) return toast.error('Please add a title')

    setUploading(true)
    setUploadProgress(10)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(p => Math.min(p + 15, 85))
      }, 1000)

      const result = await uploadVideo(pendingFile)
      clearInterval(progressInterval)
      setUploadProgress(95)

      const { error } = await supabase.from('videos').insert({
        user_id: user.id,
        title: form.title,
        description: form.description,
        type: form.type,
        video_url: result.url,
        thumbnail_url: result.thumbnail,
        duration: result.duration,
        public_id: result.publicId,
      })

      if (error) throw error

      setUploadProgress(100)
      toast.success('Video uploaded successfully!')
      setShowForm(false)
      setPendingFile(null)
      setForm({ title: '', description: '', type: 'intro' })
      fetchVideos()
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    }
    setUploading(false)
    setUploadProgress(0)
  }

  async function deleteVideo(id) {
    if (!confirm('Delete this video?')) return
    await supabase.from('videos').delete().eq('id', id)
    toast.success('Video deleted')
    fetchVideos()
  }

  function formatDuration(seconds) {
    if (!seconds) return ''
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-1">Videos</h1>
          <p className="text-white/40">Showcase yourself with video — the most powerful proof of work</p>
        </div>
        <Button onClick={() => fileRef.current?.click()}>
          <Plus size={18} /> Upload Video
        </Button>
        <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={handleFileSelect} />
      </div>

      {/* Upload form */}
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
                <h2 className="text-xl font-bold text-white">Upload Video</h2>
                <button onClick={() => { setShowForm(false); setPendingFile(null) }} className="text-white/40 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              {pendingFile && (
                <div className="bg-white/[0.03] rounded-xl p-4 mb-5 flex items-center gap-4">
                  <Video size={32} className="text-violet-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-white font-medium truncate">{pendingFile.name}</p>
                    <p className="text-white/30 text-sm">{(pendingFile.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-5 mb-5">
                <Input label="Video Title *" placeholder="My Introduction" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-white/70">Video Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm(f => ({ ...f, type: e.target.value }))}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500/50"
                  >
                    {VIDEO_TYPES.map(t => (
                      <option key={t.value} value={t.value} className="bg-[#0a0a1f]">{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-white/70 block mb-1.5">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="What is this video about?"
                    className="w-full h-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 resize-none focus:outline-none focus:border-violet-500/50"
                  />
                </div>
              </div>

              {/* Upload progress */}
              {uploading && (
                <div className="mb-5">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/40">Uploading to Cloudinary...</span>
                    <span className="text-white">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      animate={{ width: `${uploadProgress}%` }}
                      className="h-2 bg-gradient-to-r from-violet-500 to-blue-500 rounded-full"
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={handleUpload} loading={uploading} disabled={!pendingFile}>
                  <Upload size={16} /> Upload Video
                </Button>
                <Button variant="ghost" onClick={() => { setShowForm(false); setPendingFile(null) }}>Cancel</Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3].map(i => <div key={i} className="glass rounded-2xl h-56 skeleton" />)}
        </div>
      ) : videos.length === 0 ? (
        <Card className="text-center py-20">
          <Video size={60} className="text-white/10 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No videos yet</h3>
          <p className="text-white/30 mb-6">Upload an introduction video to stand out from other candidates</p>
          <Button onClick={() => fileRef.current?.click()}>
            <Upload size={18} /> Upload Your First Video
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {videos.map((video, i) => {
            const typeInfo = VIDEO_TYPES.find(t => t.value === video.type) || VIDEO_TYPES[0]
            return (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl overflow-hidden group"
              >
                {/* Video thumbnail */}
                <div className="relative h-44 bg-gradient-to-br from-violet-900/30 to-blue-900/30">
                  {video.thumbnail_url && (
                    <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                  )}
                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {playing === video.id ? (
                      <video
                        src={video.video_url}
                        controls
                        autoPlay
                        className="absolute inset-0 w-full h-full object-cover"
                        onEnded={() => setPlaying(null)}
                      />
                    ) : (
                      <button
                        onClick={() => setPlaying(video.id)}
                        className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-violet-600/60 transition-all group-hover:scale-110"
                      >
                        <Play size={22} className="text-white ml-1" fill="white" />
                      </button>
                    )}
                  </div>

                  {/* Duration badge */}
                  {video.duration && (
                    <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/60 text-white text-xs">
                      {formatDuration(video.duration)}
                    </div>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={() => deleteVideo(video.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/40"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-white font-semibold truncate">{video.title}</h3>
                    <Badge color={typeInfo.color} className="flex-shrink-0 text-xs">
                      {typeInfo.label}
                    </Badge>
                  </div>
                  {video.description && (
                    <p className="text-white/30 text-xs line-clamp-2">{video.description}</p>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}
