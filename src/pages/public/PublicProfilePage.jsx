// Public profile page — the live portfolio visible to recruiters
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MapPin, Globe, Mail,
  Download, Play, ExternalLink, Trophy, Calendar,
  Eye, Zap, Star, Award, Briefcase, BookOpen
} from 'lucide-react'
import { GithubIcon as Github, LinkedinIcon as Linkedin, TwitterIcon as Twitter } from '@/components/ui/SocialIcons'
import { supabase } from '@/lib/supabase'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

// Theme config — all class names are complete strings so Tailwind includes them
const PROFILE_THEMES = {
  dark: {
    pageBg: 'bg-[#050510]',
    heroGlow: 'bg-violet-600/10',
    accentText: 'text-violet-400',
    accentGradient: 'from-violet-500 to-blue-600',
    iconGradient: 'from-violet-500 to-blue-500',
    badgeColor: 'purple',
    navBg: 'bg-black/40',
    statGradient: 'gradient-text',
  },
  purple: {
    pageBg: 'bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-950',
    heroGlow: 'bg-fuchsia-600/15',
    accentText: 'text-fuchsia-400',
    accentGradient: 'from-fuchsia-500 to-purple-600',
    iconGradient: 'from-fuchsia-500 to-purple-600',
    badgeColor: 'purple',
    navBg: 'bg-violet-950/60',
    statGradient: 'gradient-text',
  },
  ocean: {
    pageBg: 'bg-gradient-to-br from-blue-950 via-cyan-900 to-teal-950',
    heroGlow: 'bg-cyan-600/10',
    accentText: 'text-cyan-400',
    accentGradient: 'from-cyan-500 to-blue-600',
    iconGradient: 'from-cyan-500 to-blue-500',
    badgeColor: 'blue',
    navBg: 'bg-blue-950/60',
    statGradient: 'gradient-text',
  },
  midnight: {
    pageBg: 'bg-gradient-to-br from-slate-950 via-gray-950 to-slate-900',
    heroGlow: 'bg-slate-500/10',
    accentText: 'text-slate-300',
    accentGradient: 'from-slate-400 to-gray-500',
    iconGradient: 'from-slate-500 to-gray-600',
    badgeColor: 'white',
    navBg: 'bg-slate-950/60',
    statGradient: 'gradient-text',
  },
  forest: {
    pageBg: 'bg-gradient-to-br from-emerald-950 via-green-950 to-teal-950',
    heroGlow: 'bg-emerald-600/10',
    accentText: 'text-emerald-400',
    accentGradient: 'from-emerald-500 to-teal-600',
    iconGradient: 'from-emerald-500 to-teal-500',
    badgeColor: 'green',
    navBg: 'bg-emerald-950/60',
    statGradient: 'gradient-text',
  },
  sunset: {
    pageBg: 'bg-gradient-to-br from-rose-950 via-orange-950 to-amber-950',
    heroGlow: 'bg-orange-600/10',
    accentText: 'text-orange-400',
    accentGradient: 'from-orange-500 to-rose-600',
    iconGradient: 'from-orange-500 to-rose-500',
    badgeColor: 'yellow',
    navBg: 'bg-rose-950/60',
    statGradient: 'gradient-text',
  },
}

function SkeletonLoader() {
  return (
    <div className="min-h-screen bg-[#050510] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="glass rounded-3xl p-8">
          <div className="flex gap-6">
            <div className="w-24 h-24 rounded-2xl skeleton" />
            <div className="flex-1 space-y-3">
              <div className="h-8 w-48 skeleton rounded-xl" />
              <div className="h-4 w-64 skeleton rounded" />
              <div className="h-4 w-32 skeleton rounded" />
            </div>
          </div>
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="glass rounded-2xl p-6 h-40 skeleton" />
        ))}
      </div>
    </div>
  )
}

const achievementIcon = (type) => {
  const icons = { certificate: Award, hackathon: Trophy, internship: Briefcase, award: Star, workshop: BookOpen }
  return icons[type] || Award
}

export default function PublicProfilePage() {
  const { username } = useParams()
  const [profile, setProfile] = useState(null)
  const [projects, setProjects] = useState([])
  const [videos, setVideos] = useState([])
  const [achievements, setAchievements] = useState([])
  const [resume, setResume] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [playingVideo, setPlayingVideo] = useState(null)

  useEffect(() => {
    if (username) fetchProfileData()
  }, [username])

  async function fetchProfileData() {
    // Find user by username
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()

    if (error || !profileData) {
      setNotFound(true)
      setLoading(false)
      return
    }

    if (!profileData.is_public) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setProfile(profileData)

    // Fetch all related data in parallel
    const [projectsRes, videosRes, achievementsRes, resumeRes] = await Promise.all([
      supabase.from('projects').select('*').eq('user_id', profileData.id).order('created_at', { ascending: false }),
      supabase.from('videos').select('*').eq('user_id', profileData.id).order('created_at', { ascending: false }),
      supabase.from('achievements').select('*').eq('user_id', profileData.id).order('date', { ascending: false }),
      supabase.from('resumes').select('ats_score').eq('user_id', profileData.id).single(),
    ])

    setProjects(projectsRes.data || [])
    setVideos(videosRes.data || [])
    setAchievements(achievementsRes.data || [])
    setResume(resumeRes.data)

    setLoading(false)

    // Track profile view in background (don't block render)
    supabase.rpc('increment_view', { profile_id: profileData.id }).catch(() => {})
  }

  if (loading) return <SkeletonLoader />

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#050510] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-8xl mb-6">🔍</div>
          <h1 className="text-3xl font-black text-white mb-3">Profile not found</h1>
          <p className="text-white/40 mb-6">@{username} doesn't exist or has a private profile</p>
          <Link to="/">
            <Button>Back to CareerDNA</Button>
          </Link>
        </div>
      </div>
    )
  }

  const skills = Array.isArray(profile.skills) ? profile.skills : []
  const introVideo = videos.find(v => v.type === 'intro')
  const t = PROFILE_THEMES[profile.theme] || PROFILE_THEMES.dark

  return (
    <div className={`min-h-screen ${t.pageBg}`}>
      {/* Grid background */}
      <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 py-3 px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
            <Zap size={13} className="text-white" fill="white" />
          </div>
          <span className="font-bold gradient-text text-sm">CareerDNA</span>
        </Link>
        <Link to="/signup">
          <Button size="sm">Create Your Profile</Button>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-24 pb-16 relative z-10">
        {/* Hero card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8 mb-6 relative overflow-hidden"
        >
          <div className={`absolute top-0 right-0 w-64 h-64 ${t.heroGlow} rounded-full blur-3xl`} />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.full_name} className="w-24 h-24 rounded-2xl object-cover" />
              ) : (
                <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${t.accentGradient} flex items-center justify-center text-4xl font-black text-white`}>
                  {profile.full_name?.charAt(0) || '?'}
                </div>
              )}
              {/* Online indicator */}
              <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#050510] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-black text-white mb-1">{profile.full_name}</h1>
              {profile.headline && (
                <p className={`${t.accentText} font-medium mb-2`}>{profile.headline}</p>
              )}
              {profile.location && (
                <p className="text-white/40 text-sm flex items-center gap-1 justify-center md:justify-start mb-3">
                  <MapPin size={13} /> {profile.location}
                </p>
              )}

              {/* Bio */}
              {profile.bio && (
                <p className="text-white/60 text-sm leading-relaxed mb-4 max-w-lg">{profile.bio}</p>
              )}

              {/* Social links */}
              <div className="flex gap-3 flex-wrap justify-center md:justify-start">
                {profile.website && <a href={profile.website} target="_blank" rel="noreferrer" className="p-2 rounded-lg glass hover:bg-white/10 text-white/40 hover:text-white transition-colors"><Globe size={16} /></a>}
                {profile.github && <a href={profile.github} target="_blank" rel="noreferrer" className="p-2 rounded-lg glass hover:bg-white/10 text-white/40 hover:text-white transition-colors"><Github size={16} /></a>}
                {profile.linkedin && <a href={profile.linkedin} target="_blank" rel="noreferrer" className="p-2 rounded-lg glass hover:bg-white/10 text-white/40 hover:text-white transition-colors"><Linkedin size={16} /></a>}
                {profile.twitter && <a href={profile.twitter} target="_blank" rel="noreferrer" className="p-2 rounded-lg glass hover:bg-white/10 text-white/40 hover:text-white transition-colors"><Twitter size={16} /></a>}
                <a href={`mailto:${profile.email}`} className="p-2 rounded-lg glass hover:bg-white/10 text-white/40 hover:text-white transition-colors"><Mail size={16} /></a>
              </div>
            </div>

            {/* ATS Score */}
            {resume?.ats_score && (
              <div className="flex-shrink-0 text-center glass rounded-2xl p-5">
                <div className="text-4xl font-black gradient-text mb-1">{resume.ats_score}</div>
                <div className="text-white/30 text-xs mb-3">ATS Score</div>
                <div className="w-full bg-white/5 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                    style={{ width: `${resume.ats_score}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="mt-6 pt-6 border-t border-white/5 relative z-10">
              <div className="flex flex-wrap gap-2">
                {skills.map(skill => (
                  <Badge key={skill} color={t.badgeColor}>{skill}</Badge>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Projects', value: projects.length, icon: '🚀' },
            { label: 'Videos', value: videos.length, icon: '🎥' },
            { label: 'Achievements', value: achievements.length, icon: '🏆' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.2 }}
              className="glass rounded-2xl p-4 text-center"
            >
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-black gradient-text">{stat.value}</div>
              <div className="text-white/30 text-xs">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Intro video */}
        {introVideo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl overflow-hidden mb-6"
          >
            <div className="p-5 border-b border-white/5">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Play size={18} className={t.accentText} /> Introduction Video
              </h2>
            </div>
            <div className="relative aspect-video bg-black">
              {playingVideo === introVideo.id ? (
                <video src={introVideo.video_url} controls autoPlay className="w-full h-full" />
              ) : (
                <>
                  {introVideo.thumbnail_url && (
                    <img src={introVideo.thumbnail_url} alt="" className="w-full h-full object-cover opacity-60" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={() => setPlayingVideo(introVideo.id)}
                      className={`w-20 h-20 rounded-full bg-gradient-to-br ${t.accentGradient} opacity-90 backdrop-blur-sm flex items-center justify-center hover:opacity-100 transition-all hover:scale-105`}
                    >
                      <Play size={32} className="text-white ml-2" fill="white" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl overflow-hidden mb-6"
          >
            <div className="p-5 border-b border-white/5">
              <h2 className="text-xl font-bold text-white">Projects</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4 p-5">
              {projects.map((project) => (
                <div key={project.id} className="glass glass-hover rounded-xl overflow-hidden">
                  {project.thumbnail_url && (
                    <img src={project.thumbnail_url} alt={project.title} className="w-full h-36 object-cover" />
                  )}
                  <div className="p-4">
                    <h3 className="text-white font-bold mb-1">{project.title}</h3>
                    {project.description && <p className="text-white/40 text-sm mb-3 line-clamp-2">{project.description}</p>}
                    {project.tech_stack?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {project.tech_stack.slice(0, 4).map(tech => (
                          <Badge key={tech} color="purple">{tech}</Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      {project.github_url && (
                        <a href={project.github_url} target="_blank" rel="noreferrer">
                          <Button variant="ghost" size="sm"><Github size={13} /> Code</Button>
                        </a>
                      )}
                      {project.live_url && (
                        <a href={project.live_url} target="_blank" rel="noreferrer">
                          <Button variant="outline" size="sm"><ExternalLink size={13} /> Demo</Button>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Other videos */}
        {videos.filter(v => v.type !== 'intro').length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-2xl overflow-hidden mb-6"
          >
            <div className="p-5 border-b border-white/5">
              <h2 className="text-xl font-bold text-white">Project Videos</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4 p-5">
              {videos.filter(v => v.type !== 'intro').map((video) => (
                <div key={video.id} className="relative rounded-xl overflow-hidden aspect-video bg-black cursor-pointer" onClick={() => setPlayingVideo(video.id)}>
                  {playingVideo === video.id ? (
                    <video src={video.video_url} controls autoPlay className="w-full h-full" />
                  ) : (
                    <>
                      {video.thumbnail_url && <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover opacity-60" />}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-black/50 border border-white/20 flex items-center justify-center hover:bg-violet-600/60 transition-all mb-2">
                          <Play size={20} className="text-white ml-1" fill="white" />
                        </div>
                        <p className="text-white text-sm font-medium">{video.title}</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass rounded-2xl overflow-hidden mb-6"
          >
            <div className="p-5 border-b border-white/5">
              <h2 className="text-xl font-bold text-white">Achievements</h2>
            </div>
            <div className="p-5 space-y-3">
              {achievements.map((item) => {
                const Icon = achievementIcon(item.type)
                return (
                  <div key={item.id} className="flex items-start gap-4 p-4 glass rounded-xl">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.iconGradient} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold">{item.title}</h3>
                      {item.organization && <p className={`${t.accentText} text-sm`}>{item.organization}</p>}
                      {item.date && <p className="text-white/30 text-xs flex items-center gap-1 mt-0.5"><Calendar size={10} /> {new Date(item.date + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>}
                      {item.description && <p className="text-white/40 text-sm mt-1">{item.description}</p>}
                    </div>
                    {item.credential_url && (
                      <a href={item.credential_url} target="_blank" rel="noreferrer" className="text-violet-400 hover:text-violet-300 flex-shrink-0">
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* CTA — encourage others to create profile */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center py-8"
        >
          <p className="text-white/20 text-sm mb-3">Built with</p>
          <Link to="/signup">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-violet-500/20 text-violet-300 text-sm hover:border-violet-500/40 transition-all">
              <Zap size={14} className="text-violet-400" fill="currentColor" />
              <span className="font-bold">CareerDNA</span>
              <span className="text-white/30">— Create your free profile →</span>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
