// Premium resume PDF templates — resume.io style distinct layouts
import jsPDF from 'jspdf'

// ─── TEMPLATE METADATA ───────────────────────────────────────────────────────
export const RESUME_TEMPLATES = [
  {
    id: 'cascade',
    label: 'Cascade',
    desc: 'Dark sidebar + main',
    accent: '#1e3a5f',
    swatch: 'sidebar-left-dark',
  },
  {
    id: 'crisp',
    label: 'Crisp',
    desc: 'Modern two-column',
    accent: '#0d9488',
    swatch: 'sidebar-right-light',
  },
  {
    id: 'concept',
    label: 'Concept',
    desc: 'Colored header band',
    accent: '#7c3aed',
    swatch: 'header-band',
  },
  {
    id: 'diamond',
    label: 'Diamond',
    desc: 'Elegant centered',
    accent: '#b45309',
    swatch: 'centered-serif',
  },
  {
    id: 'iconic',
    label: 'Iconic',
    desc: 'Bold colored sidebar',
    accent: '#dc2626',
    swatch: 'sidebar-left-bold',
  },
]

// ─── COLOR HELPERS ────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)]
}

// ─── TEMPLATE 1: CASCADE — Dark left sidebar + light main right ──────────────
function renderCascade(data, accent) {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' })
  const pageW = 210, pageH = 297
  const sidebarW = 70
  const [ar, ag, ab] = hexToRgb(accent)

  // Sidebar background (full height)
  doc.setFillColor(ar, ag, ab)
  doc.rect(0, 0, sidebarW, pageH, 'F')

  // ── SIDEBAR (white text on dark) ──
  let sy = 18
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  const nameLines = doc.splitTextToSize(data.name || 'Your Name', sidebarW - 12)
  doc.text(nameLines, 6, sy)
  sy += nameLines.length * 7

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(220, 220, 235)
  const hLines = doc.splitTextToSize(data.headline || '', sidebarW - 12)
  doc.text(hLines, 6, sy)
  sy += hLines.length * 4 + 8

  const c = data.contact || {}
  const sidebarSection = (title) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(255, 255, 255)
    doc.text(title.toUpperCase(), 6, sy)
    doc.setDrawColor(255, 255, 255)
    doc.setLineWidth(0.3)
    doc.line(6, sy + 1.5, sidebarW - 6, sy + 1.5)
    sy += 5.5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.8)
    doc.setTextColor(230, 230, 245)
  }

  // Contact
  const contactItems = [
    c.email && ['Email', c.email],
    c.phone && ['Phone', c.phone],
    c.location && ['Location', c.location],
    c.linkedin && ['LinkedIn', c.linkedin.replace(/https?:\/\//, '')],
    c.github && ['GitHub', c.github.replace(/https?:\/\//, '')],
    c.website && ['Web', c.website.replace(/https?:\/\//, '')],
  ].filter(Boolean)

  if (contactItems.length) {
    sidebarSection('Contact')
    for (const [, v] of contactItems) {
      const ln = doc.splitTextToSize(v, sidebarW - 12)
      doc.text(ln, 6, sy)
      sy += ln.length * 3.5 + 1
    }
    sy += 4
  }

  // Skills
  if (data.skills?.length) {
    sidebarSection('Skills')
    for (const sk of data.skills.slice(0, 14)) {
      doc.text(`• ${sk}`, 6, sy)
      sy += 4
    }
    sy += 4
  }

  // Education in sidebar
  if (data.education?.length) {
    sidebarSection('Education')
    for (const edu of data.education) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(255, 255, 255)
      const dLines = doc.splitTextToSize(edu.degree || '', sidebarW - 12)
      doc.text(dLines, 6, sy)
      sy += dLines.length * 3.5
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      doc.setTextColor(220, 220, 235)
      const sLines = doc.splitTextToSize([edu.school, edu.year].filter(Boolean).join(' · '), sidebarW - 12)
      doc.text(sLines, 6, sy)
      sy += sLines.length * 3.5 + 3
    }
  }

  // ── MAIN AREA (dark text on white) ──
  const mx = sidebarW + 8
  const mw = pageW - mx - 10
  let my = 18

  const mainSection = (title) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(ar, ag, ab)
    doc.text(title.toUpperCase(), mx, my)
    doc.setDrawColor(ar, ag, ab)
    doc.setLineWidth(0.5)
    doc.line(mx, my + 1.5, mx + mw, my + 1.5)
    my += 6.5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.8)
    doc.setTextColor(50, 50, 55)
  }

  if (data.summary?.trim()) {
    mainSection('Profile')
    const lines = doc.splitTextToSize(data.summary, mw)
    doc.text(lines, mx, my)
    my += lines.length * 4 + 5
  }

  if (data.experience?.length) {
    mainSection('Experience')
    for (const exp of data.experience) {
      if (my > 275) break
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9.5)
      doc.setTextColor(30, 30, 35)
      doc.text(exp.title || '', mx, my)
      if (exp.duration) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7.5)
        doc.setTextColor(120, 120, 130)
        doc.text(exp.duration, mx + mw - doc.getTextWidth(exp.duration), my)
      }
      my += 4
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(8.5)
      doc.setTextColor(ar, ag, ab)
      doc.text(exp.company || '', mx, my)
      my += 4.5
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(50, 50, 55)
      for (const b of (exp.bullets || []).slice(0, 4)) {
        if (my > 278) break
        const bl = doc.splitTextToSize(`• ${b}`, mw - 2)
        doc.text(bl, mx + 1, my)
        my += bl.length * 3.6
      }
      my += 2.5
    }
  }

  if (data.projects?.filter(p => p.name).length > 0) {
    if (my < 250) {
      mainSection('Projects')
      for (const p of data.projects.filter(x => x.name).slice(0, 4)) {
        if (my > 280) break
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(9)
        doc.setTextColor(30, 30, 35)
        doc.text(p.name, mx, my)
        my += 4
        if (p.tech) {
          doc.setFont('helvetica', 'italic')
          doc.setFontSize(7.8)
          doc.setTextColor(ar, ag, ab)
          doc.text(p.tech, mx, my)
          my += 3.8
        }
        if (p.description) {
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(8.3)
          doc.setTextColor(60, 60, 65)
          const dl = doc.splitTextToSize(p.description, mw)
          doc.text(dl, mx, my)
          my += dl.length * 3.5
        }
        my += 2
      }
    }
  }

  return doc
}

// ─── TEMPLATE 2: CRISP — Light right sidebar + main left ─────────────────────
function renderCrisp(data, accent) {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' })
  const pageW = 210, pageH = 297
  const sidebarW = 65
  const sidebarX = pageW - sidebarW
  const [ar, ag, ab] = hexToRgb(accent)

  // Light sidebar
  doc.setFillColor(245, 247, 250)
  doc.rect(sidebarX, 0, sidebarW, pageH, 'F')

  // Accent vertical line
  doc.setFillColor(ar, ag, ab)
  doc.rect(sidebarX, 0, 1.2, pageH, 'F')

  // ── MAIN LEFT ──
  const mx = 14
  const mw = sidebarX - mx - 6
  let my = 22

  // Name + headline
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(24)
  doc.setTextColor(ar, ag, ab)
  doc.text(data.name || 'Your Name', mx, my)
  my += 8
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(80, 80, 90)
  doc.text(data.headline || '', mx, my)
  my += 8

  const mainSection = (title) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.setTextColor(ar, ag, ab)
    doc.text(title.toUpperCase(), mx, my)
    my += 1.5
    doc.setDrawColor(ar, ag, ab)
    doc.setLineWidth(0.6)
    doc.line(mx, my + 0.8, mx + 18, my + 0.8)
    my += 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.8)
    doc.setTextColor(50, 50, 55)
  }

  if (data.summary?.trim()) {
    mainSection('Profile')
    const lines = doc.splitTextToSize(data.summary, mw)
    doc.text(lines, mx, my)
    my += lines.length * 4 + 5
  }

  if (data.experience?.length) {
    mainSection('Experience')
    for (const exp of data.experience) {
      if (my > 275) break
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9.5)
      doc.setTextColor(30, 30, 35)
      doc.text(exp.title || '', mx, my)
      if (exp.duration) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7.5)
        doc.setTextColor(130, 130, 140)
        doc.text(exp.duration, mx + mw - doc.getTextWidth(exp.duration), my)
      }
      my += 4
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(ar, ag, ab)
      doc.text(exp.company || '', mx, my)
      my += 4.5
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(50, 50, 55)
      for (const b of (exp.bullets || []).slice(0, 4)) {
        if (my > 278) break
        const bl = doc.splitTextToSize(`• ${b}`, mw - 2)
        doc.text(bl, mx + 1, my)
        my += bl.length * 3.6
      }
      my += 2.5
    }
  }

  if (data.projects?.filter(p => p.name).length > 0 && my < 250) {
    mainSection('Projects')
    for (const p of data.projects.filter(x => x.name).slice(0, 3)) {
      if (my > 280) break
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(30, 30, 35)
      doc.text(p.name, mx, my)
      my += 4
      if (p.description) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8.3)
        doc.setTextColor(60, 60, 65)
        const dl = doc.splitTextToSize(p.description, mw)
        doc.text(dl, mx, my)
        my += dl.length * 3.5
      }
      my += 2
    }
  }

  // ── SIDEBAR RIGHT (light bg) ──
  const sx = sidebarX + 6
  const sw = sidebarW - 12
  let sy = 22

  const sideSection = (title) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9.5)
    doc.setTextColor(ar, ag, ab)
    doc.text(title.toUpperCase(), sx, sy)
    sy += 4.5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.8)
    doc.setTextColor(60, 60, 70)
  }

  const c = data.contact || {}
  const contactItems = [c.email, c.phone, c.location,
    c.linkedin?.replace(/https?:\/\//, ''),
    c.github?.replace(/https?:\/\//, ''),
    c.website?.replace(/https?:\/\//, '')].filter(Boolean)

  if (contactItems.length) {
    sideSection('Contact')
    for (const v of contactItems) {
      const ln = doc.splitTextToSize(v, sw)
      doc.text(ln, sx, sy)
      sy += ln.length * 3.4 + 1
    }
    sy += 4
  }

  if (data.skills?.length) {
    sideSection('Skills')
    for (const sk of data.skills.slice(0, 16)) {
      doc.text(`• ${sk}`, sx, sy)
      sy += 3.8
    }
    sy += 4
  }

  if (data.education?.length) {
    sideSection('Education')
    for (const edu of data.education) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(30, 30, 40)
      const dLines = doc.splitTextToSize(edu.degree || '', sw)
      doc.text(dLines, sx, sy)
      sy += dLines.length * 3.5
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      doc.setTextColor(80, 80, 90)
      const sLines = doc.splitTextToSize([edu.school, edu.year].filter(Boolean).join(' · '), sw)
      doc.text(sLines, sx, sy)
      sy += sLines.length * 3.4 + 3
    }
    sy += 2
  }

  if (data.certifications?.filter(Boolean).length) {
    sideSection('Certifications')
    for (const cert of data.certifications.filter(Boolean).slice(0, 6)) {
      const cl = doc.splitTextToSize(`• ${cert}`, sw)
      doc.text(cl, sx, sy)
      sy += cl.length * 3.6
    }
  }

  return doc
}

// ─── TEMPLATE 3: CONCEPT — Colored top band, single column ───────────────────
function renderConcept(data, accent) {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' })
  const pageW = 210
  const ml = 16, mr = 16
  const cW = pageW - ml - mr
  const [ar, ag, ab] = hexToRgb(accent)

  // Top colored band
  const bandH = 42
  doc.setFillColor(ar, ag, ab)
  doc.rect(0, 0, pageW, bandH, 'F')

  // Name
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(26)
  doc.setTextColor(255, 255, 255)
  doc.text(data.name || 'Your Name', ml, 18)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(240, 240, 250)
  doc.text(data.headline || '', ml, 26)

  // Contact row in band
  const c = data.contact || {}
  const contactParts = [c.email, c.phone, c.location,
    c.linkedin?.replace(/https?:\/\//, ''),
    c.github?.replace(/https?:\/\//, '')].filter(Boolean)
  doc.setFontSize(8)
  doc.setTextColor(230, 230, 245)
  doc.text(contactParts.join('  ·  ').substring(0, 130), ml, 35)

  let y = bandH + 10

  const section = (title) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10.5)
    doc.setTextColor(ar, ag, ab)
    doc.text(title.toUpperCase(), ml, y)
    doc.setDrawColor(ar, ag, ab)
    doc.setLineWidth(0.4)
    doc.line(ml + doc.getTextWidth(title.toUpperCase()) + 3, y - 0.8, pageW - mr, y - 0.8)
    y += 6
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(45, 45, 55)
  }

  if (data.summary?.trim()) {
    section('Profile')
    const lines = doc.splitTextToSize(data.summary, cW)
    doc.text(lines, ml, y)
    y += lines.length * 4.2 + 5
  }

  if (data.experience?.length) {
    section('Experience')
    for (const exp of data.experience) {
      if (y > 270) break
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(25, 25, 35)
      doc.text([exp.title, exp.company].filter(Boolean).join(' · '), ml, y)
      if (exp.duration) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7.8)
        doc.setTextColor(130, 130, 140)
        doc.text(exp.duration, pageW - mr - doc.getTextWidth(exp.duration), y)
      }
      y += 5
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.8)
      doc.setTextColor(50, 50, 60)
      for (const b of (exp.bullets || []).slice(0, 4)) {
        if (y > 278) break
        const bl = doc.splitTextToSize(`• ${b}`, cW - 2)
        doc.text(bl, ml + 1, y)
        y += bl.length * 3.7
      }
      y += 3
    }
  }

  // Two-column row: Skills | Education
  if (data.skills?.length || data.education?.length) {
    section('Skills & Education')
    const colW = (cW - 8) / 2
    const startY = y
    let leftY = y, rightY = y

    if (data.skills?.length) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8.5)
      doc.setTextColor(70, 70, 80)
      doc.text('Skills', ml, leftY)
      leftY += 4
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(50, 50, 60)
      const sText = data.skills.join(' · ')
      const sLines = doc.splitTextToSize(sText, colW)
      doc.text(sLines, ml, leftY)
      leftY += sLines.length * 3.6
    }

    if (data.education?.length) {
      const ex = ml + colW + 8
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8.5)
      doc.setTextColor(70, 70, 80)
      doc.text('Education', ex, rightY)
      rightY += 4
      for (const edu of data.education) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8.5)
        doc.setTextColor(30, 30, 40)
        const dl = doc.splitTextToSize(edu.degree || '', colW)
        doc.text(dl, ex, rightY)
        rightY += dl.length * 3.5
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7.8)
        doc.setTextColor(90, 90, 100)
        doc.text([edu.school, edu.year].filter(Boolean).join(' · '), ex, rightY)
        rightY += 4
      }
    }
    y = Math.max(leftY, rightY) + 5
  }

  if (data.projects?.filter(p => p.name).length > 0 && y < 260) {
    section('Projects')
    for (const p of data.projects.filter(x => x.name).slice(0, 3)) {
      if (y > 280) break
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(25, 25, 35)
      doc.text(p.name + (p.tech ? `  ·  ${p.tech}` : ''), ml, y)
      y += 4
      if (p.description) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8.5)
        doc.setTextColor(55, 55, 65)
        const dl = doc.splitTextToSize(p.description, cW)
        doc.text(dl, ml, y)
        y += dl.length * 3.6
      }
      y += 2
    }
  }

  return doc
}

// ─── TEMPLATE 4: DIAMOND — Elegant centered serif ────────────────────────────
function renderDiamond(data, accent) {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' })
  const pageW = 210
  const ml = 20, mr = 20
  const cW = pageW - ml - mr
  const [ar, ag, ab] = hexToRgb(accent)

  // Centered name with rules
  let y = 22
  doc.setFont('times', 'bold')
  doc.setFontSize(28)
  doc.setTextColor(30, 30, 40)
  const name = data.name || 'Your Name'
  doc.text(name, pageW / 2, y, { align: 'center' })
  y += 7

  doc.setFont('times', 'italic')
  doc.setFontSize(11)
  doc.setTextColor(ar, ag, ab)
  doc.text(data.headline || '', pageW / 2, y, { align: 'center' })
  y += 6

  // Double horizontal rule
  doc.setDrawColor(ar, ag, ab)
  doc.setLineWidth(0.6)
  doc.line(ml + 30, y, pageW - mr - 30, y)
  doc.setLineWidth(0.2)
  doc.line(ml + 30, y + 1.2, pageW - mr - 30, y + 1.2)
  y += 5

  // Contact centered
  const c = data.contact || {}
  const cParts = [c.email, c.phone, c.location,
    c.linkedin?.replace(/https?:\/\//, ''),
    c.github?.replace(/https?:\/\//, '')].filter(Boolean)
  doc.setFont('times', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(80, 80, 90)
  doc.text(cParts.join('  ·  ').substring(0, 130), pageW / 2, y, { align: 'center' })
  y += 9

  const section = (title) => {
    doc.setFont('times', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(ar, ag, ab)
    doc.text(title.toUpperCase(), pageW / 2, y, { align: 'center' })
    y += 1.5
    doc.setDrawColor(ar, ag, ab)
    doc.setLineWidth(0.3)
    const tw = doc.getTextWidth(title.toUpperCase())
    doc.line(pageW/2 - tw/2 - 2, y + 1, pageW/2 + tw/2 + 2, y + 1)
    y += 5.5
    doc.setFont('times', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(40, 40, 50)
  }

  if (data.summary?.trim()) {
    section('Profile')
    const lines = doc.splitTextToSize(data.summary, cW)
    doc.text(lines, ml, y)
    y += lines.length * 4.5 + 4
  }

  if (data.experience?.length) {
    section('Experience')
    for (const exp of data.experience) {
      if (y > 270) break
      doc.setFont('times', 'bold')
      doc.setFontSize(10.5)
      doc.setTextColor(30, 30, 40)
      doc.text(exp.title || '', ml, y)
      if (exp.duration) {
        doc.setFont('times', 'italic')
        doc.setFontSize(8.5)
        doc.setTextColor(120, 120, 130)
        doc.text(exp.duration, pageW - mr - doc.getTextWidth(exp.duration), y)
      }
      y += 4.5
      doc.setFont('times', 'italic')
      doc.setFontSize(9.5)
      doc.setTextColor(ar, ag, ab)
      doc.text(exp.company || '', ml, y)
      y += 4.5
      doc.setFont('times', 'normal')
      doc.setFontSize(9.5)
      doc.setTextColor(45, 45, 55)
      for (const b of (exp.bullets || []).slice(0, 4)) {
        if (y > 280) break
        const bl = doc.splitTextToSize(`• ${b}`, cW - 2)
        doc.text(bl, ml + 1, y)
        y += bl.length * 4
      }
      y += 3
    }
  }

  if (data.education?.length) {
    section('Education')
    for (const edu of data.education) {
      doc.setFont('times', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(30, 30, 40)
      doc.text(edu.degree || '', ml, y)
      if (edu.year) {
        doc.setFont('times', 'italic')
        doc.setFontSize(9)
        doc.setTextColor(120, 120, 130)
        doc.text(edu.year, pageW - mr - doc.getTextWidth(edu.year), y)
      }
      y += 4
      doc.setFont('times', 'italic')
      doc.setFontSize(9.5)
      doc.setTextColor(ar, ag, ab)
      doc.text(edu.school || '', ml, y)
      y += 6
    }
  }

  if (data.skills?.length) {
    section('Skills')
    doc.setFont('times', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(45, 45, 55)
    const sText = data.skills.join('  ·  ')
    const sLines = doc.splitTextToSize(sText, cW)
    doc.text(sLines, pageW / 2, y, { align: 'center' })
    y += sLines.length * 4.5 + 4
  }

  return doc
}

// ─── TEMPLATE 5: ICONIC — Bold colored left sidebar ──────────────────────────
function renderIconic(data, accent) {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' })
  const pageW = 210, pageH = 297
  const sidebarW = 80
  const [ar, ag, ab] = hexToRgb(accent)

  // Bold colored sidebar
  doc.setFillColor(ar, ag, ab)
  doc.rect(0, 0, sidebarW, pageH, 'F')

  // Photo placeholder circle
  doc.setFillColor(255, 255, 255)
  doc.circle(sidebarW / 2, 28, 14, 'F')
  doc.setFontSize(6)
  doc.setTextColor(ar, ag, ab)
  const initials = (data.name || 'YN').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text(initials, sidebarW / 2, 31, { align: 'center' })

  // Name below circle
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  const nameLines = doc.splitTextToSize(data.name || 'Your Name', sidebarW - 10)
  doc.text(nameLines, sidebarW / 2, 52, { align: 'center' })

  let sy = 52 + nameLines.length * 6 + 2
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(245, 245, 255)
  const hLines = doc.splitTextToSize(data.headline || '', sidebarW - 10)
  doc.text(hLines, sidebarW / 2, sy, { align: 'center' })
  sy += hLines.length * 4 + 6

  const sidebarSec = (title) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(255, 255, 255)
    doc.text(title.toUpperCase(), sidebarW / 2, sy, { align: 'center' })
    sy += 1.5
    doc.setDrawColor(255, 255, 255)
    doc.setLineWidth(0.3)
    doc.line(sidebarW / 2 - 12, sy + 1, sidebarW / 2 + 12, sy + 1)
    sy += 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.8)
    doc.setTextColor(245, 245, 255)
  }

  const c = data.contact || {}
  const contactItems = [c.email, c.phone, c.location,
    c.linkedin?.replace(/https?:\/\//, ''),
    c.github?.replace(/https?:\/\//, ''),
    c.website?.replace(/https?:\/\//, '')].filter(Boolean)

  if (contactItems.length) {
    sidebarSec('Contact')
    for (const v of contactItems) {
      const ln = doc.splitTextToSize(v, sidebarW - 10)
      doc.text(ln, sidebarW / 2, sy, { align: 'center' })
      sy += ln.length * 3.5 + 0.8
    }
    sy += 4
  }

  if (data.skills?.length) {
    sidebarSec('Skills')
    for (const sk of data.skills.slice(0, 12)) {
      doc.text(sk, sidebarW / 2, sy, { align: 'center' })
      sy += 3.8
    }
    sy += 4
  }

  if (data.education?.length) {
    sidebarSec('Education')
    for (const edu of data.education) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(255, 255, 255)
      const dLines = doc.splitTextToSize(edu.degree || '', sidebarW - 8)
      doc.text(dLines, sidebarW / 2, sy, { align: 'center' })
      sy += dLines.length * 3.5
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      doc.setTextColor(240, 240, 250)
      const sLines = doc.splitTextToSize([edu.school, edu.year].filter(Boolean).join(' · '), sidebarW - 8)
      doc.text(sLines, sidebarW / 2, sy, { align: 'center' })
      sy += sLines.length * 3.4 + 3
    }
  }

  // ── MAIN ──
  const mx = sidebarW + 10
  const mw = pageW - mx - 12
  let my = 22

  const mainSec = (title) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(ar, ag, ab)
    doc.text(title.toUpperCase(), mx, my)
    my += 2
    doc.setDrawColor(ar, ag, ab)
    doc.setLineWidth(1.2)
    doc.line(mx, my + 0.5, mx + 12, my + 0.5)
    my += 6
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(40, 40, 50)
  }

  if (data.summary?.trim()) {
    mainSec('Profile')
    const lines = doc.splitTextToSize(data.summary, mw)
    doc.text(lines, mx, my)
    my += lines.length * 4 + 5
  }

  if (data.experience?.length) {
    mainSec('Experience')
    for (const exp of data.experience) {
      if (my > 275) break
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(25, 25, 35)
      doc.text(exp.title || '', mx, my)
      my += 4
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8.8)
      doc.setTextColor(ar, ag, ab)
      doc.text(exp.company || '', mx, my)
      if (exp.duration) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7.8)
        doc.setTextColor(120, 120, 130)
        doc.text(exp.duration, mx + mw - doc.getTextWidth(exp.duration), my)
      }
      my += 4.5
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.8)
      doc.setTextColor(45, 45, 55)
      for (const b of (exp.bullets || []).slice(0, 4)) {
        if (my > 280) break
        const bl = doc.splitTextToSize(`• ${b}`, mw - 2)
        doc.text(bl, mx + 1, my)
        my += bl.length * 3.7
      }
      my += 2.5
    }
  }

  if (data.projects?.filter(p => p.name).length > 0 && my < 255) {
    mainSec('Projects')
    for (const p of data.projects.filter(x => x.name).slice(0, 3)) {
      if (my > 280) break
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9.5)
      doc.setTextColor(25, 25, 35)
      doc.text(p.name, mx, my)
      my += 4
      if (p.description) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8.5)
        doc.setTextColor(50, 50, 60)
        const dl = doc.splitTextToSize(p.description, mw)
        doc.text(dl, mx, my)
        my += dl.length * 3.6
      }
      my += 2
    }
  }

  return doc
}

// ─── MAIN DISPATCHER ─────────────────────────────────────────────────────────
export function renderResumeTemplate(templateId, data) {
  const template = RESUME_TEMPLATES.find(t => t.id === templateId) || RESUME_TEMPLATES[0]
  const accent = template.accent

  let doc
  switch (templateId) {
    case 'cascade': doc = renderCascade(data, accent); break
    case 'crisp':   doc = renderCrisp(data, accent);   break
    case 'concept': doc = renderConcept(data, accent); break
    case 'diamond': doc = renderDiamond(data, accent); break
    case 'iconic':  doc = renderIconic(data, accent);  break
    default:        doc = renderConcept(data, accent); break
  }

  // Footer
  doc.setFontSize(6.5)
  doc.setTextColor(160, 160, 175)
  doc.text('Created with CareerDNA  ·  careeerdna.netlify.app', 105, 292, { align: 'center' })

  return doc
}
