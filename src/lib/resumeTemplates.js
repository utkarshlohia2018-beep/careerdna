// Premium resume PDF templates — resume.io style with adaptive single-page sizing
import jsPDF from 'jspdf'

// ─── TEMPLATE METADATA ───────────────────────────────────────────────────────
export const RESUME_TEMPLATES = [
  { id: 'cascade', label: 'Cascade', desc: 'Dark sidebar + main',  accent: '#1e3a5f', swatch: 'sidebar-left-dark' },
  { id: 'crisp',   label: 'Crisp',   desc: 'Modern two-column',    accent: '#0d9488', swatch: 'sidebar-right-light' },
  { id: 'concept', label: 'Concept', desc: 'Colored header band',  accent: '#7c3aed', swatch: 'header-band' },
  { id: 'diamond', label: 'Diamond', desc: 'Elegant centered',     accent: '#b45309', swatch: 'centered-serif' },
  { id: 'iconic',  label: 'Iconic',  desc: 'Bold colored sidebar', accent: '#dc2626', swatch: 'sidebar-left-bold' },
]

const hexToRgb = (hex) => {
  const h = hex.replace('#', '')
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)]
}

// ─── DENSITY / SCALE ─────────────────────────────────────────────────────────
// Estimate total content "lines" to determine how aggressively to shrink everything
function computeDensity(data) {
  const expCount   = data.experience?.filter(e => e.title)?.length || 0
  const expBullets = (data.experience || []).reduce((s, e) =>
    s + Math.min(e.bullets?.filter(Boolean).length || 0, 5), 0)
  const expLines   = expCount * 2.5 + expBullets   // title+company+bullets
  const sumLines   = Math.ceil((data.summary?.length || 0) / 95)
  const eduCount   = data.education?.filter(e => e.degree)?.length || 0
  const eduLines   = eduCount * 2
  const skillCount = data.skills?.filter(Boolean).length || 0
  const skillLines = Math.max(1, Math.ceil(skillCount / 7))
  const projCount  = data.projects?.filter(p => p.name)?.length || 0
  const projDescLn = (data.projects || []).filter(p => p.name)
    .reduce((s, p) => s + Math.ceil((p.description?.length || 0) / 95), 0)
  const projLines  = projCount * 2 + projDescLn
  const certCount  = data.certifications?.filter(Boolean).length || 0
  const sectionGaps = [sumLines, expLines, eduLines, skillLines, projLines]
    .filter(n => n > 0).length * 2.5
  return sumLines + expLines + eduLines + skillLines + projLines + certCount + sectionGaps
}

// Map density → scale factor. Calibrated so ~32 "lines" = scale 1.0
function getScale(data) {
  const d = computeDensity(data)
  if (d < 22) return 1.10   // very sparse — comfortable
  if (d < 30) return 1.02
  if (d < 38) return 0.96
  if (d < 46) return 0.90
  if (d < 54) return 0.84
  if (d < 62) return 0.78
  return 0.74               // very dense — packed
}

// Build a scaled sizing object — use these everywhere in templates
function buildSizes(scale) {
  return {
    name:        Math.round(22 * scale * 10) / 10,
    nameLg:      Math.round(26 * scale * 10) / 10,
    headline:    Math.round(11 * scale * 10) / 10,
    section:     Math.round(11 * scale * 10) / 10,
    sectionSm:   Math.round(9.5 * scale * 10) / 10,
    body:        Math.round(9.2 * scale * 10) / 10,
    role:        Math.round(10 * scale * 10) / 10,
    company:     Math.round(9 * scale * 10) / 10,
    bullet:      Math.round(8.8 * scale * 10) / 10,
    small:       Math.round(8 * scale * 10) / 10,
    tiny:        Math.round(7.3 * scale * 10) / 10,
    micro:       Math.round(6.6 * scale * 10) / 10,
    lineH:       4.3 * scale,
    bulletLH:    3.8 * scale,
    sectionGap:  5.5 * scale,
    itemGap:     3.2 * scale,
    sideLine:    3.6 * scale,
    headerH:     scale > 1 ? 42 : Math.max(34, 40 * scale),
    sidebarW:    Math.max(60, 72 * Math.min(scale, 1.0)),
  }
}

// ─── TEMPLATE 1: CASCADE ─────────────────────────────────────────────────────
function renderCascade(data, accent) {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' })
  const pageW = 210, pageH = 297
  const scale = getScale(data)
  const S = buildSizes(scale)
  const sidebarW = S.sidebarW
  const [ar, ag, ab] = hexToRgb(accent)

  doc.setFillColor(ar, ag, ab)
  doc.rect(0, 0, sidebarW, pageH, 'F')

  // ── SIDEBAR ──
  let sy = 16
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(S.name * 0.9)
  const nameLines = doc.splitTextToSize(data.name || 'Your Name', sidebarW - 10)
  doc.text(nameLines, 5, sy)
  sy += nameLines.length * S.lineH * 1.4

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(S.headline * 0.85)
  doc.setTextColor(220, 220, 235)
  const hLines = doc.splitTextToSize(data.headline || '', sidebarW - 10)
  doc.text(hLines, 5, sy)
  sy += hLines.length * S.lineH + S.sectionGap

  const sideSection = (title) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(S.sectionSm * 0.85)
    doc.setTextColor(255, 255, 255)
    doc.text(title.toUpperCase(), 5, sy)
    doc.setDrawColor(255, 255, 255)
    doc.setLineWidth(0.3)
    doc.line(5, sy + 1.3, sidebarW - 5, sy + 1.3)
    sy += S.itemGap + 2
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(S.tiny)
    doc.setTextColor(230, 230, 245)
  }

  const c = data.contact || {}
  const cItems = [c.email, c.phone, c.location,
    c.linkedin?.replace(/https?:\/\//, ''),
    c.github?.replace(/https?:\/\//, ''),
    c.website?.replace(/https?:\/\//, '')].filter(Boolean)

  if (cItems.length) {
    sideSection('Contact')
    for (const v of cItems) {
      if (sy > pageH - 8) break
      const ln = doc.splitTextToSize(v, sidebarW - 10)
      doc.text(ln, 5, sy)
      sy += ln.length * S.sideLine + 0.6
    }
    sy += S.sectionGap * 0.6
  }

  if (data.skills?.length) {
    sideSection('Skills')
    const maxSkills = Math.floor((pageH - sy - 60) / S.sideLine)
    for (const sk of data.skills.slice(0, Math.max(8, maxSkills))) {
      if (sy > pageH - 12) break
      doc.text(`• ${sk}`, 5, sy)
      sy += S.sideLine
    }
    sy += S.sectionGap * 0.6
  }

  if (data.education?.length && sy < pageH - 30) {
    sideSection('Education')
    for (const edu of data.education.filter(e => e.degree)) {
      if (sy > pageH - 12) break
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(S.tiny)
      doc.setTextColor(255, 255, 255)
      const dLines = doc.splitTextToSize(edu.degree, sidebarW - 10)
      doc.text(dLines, 5, sy)
      sy += dLines.length * S.sideLine
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(S.micro)
      doc.setTextColor(220, 220, 235)
      const sLines = doc.splitTextToSize([edu.school, edu.year].filter(Boolean).join(' · '), sidebarW - 10)
      doc.text(sLines, 5, sy)
      sy += sLines.length * S.sideLine + 2
    }
  }

  // ── MAIN ──
  const mx = sidebarW + 7
  const mw = pageW - mx - 9
  let my = 18
  const maxY = pageH - 10

  const mainSection = (title) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(S.section)
    doc.setTextColor(ar, ag, ab)
    doc.text(title.toUpperCase(), mx, my)
    doc.setDrawColor(ar, ag, ab)
    doc.setLineWidth(0.5)
    doc.line(mx, my + 1.3, mx + mw, my + 1.3)
    my += S.lineH + 1.5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(S.body)
    doc.setTextColor(50, 50, 55)
  }

  if (data.summary?.trim()) {
    mainSection('Profile')
    const lines = doc.splitTextToSize(data.summary, mw)
    doc.text(lines, mx, my)
    my += lines.length * S.lineH + S.itemGap
  }

  if (data.experience?.filter(e => e.title).length) {
    mainSection('Experience')
    for (const exp of data.experience.filter(e => e.title)) {
      if (my > maxY - 10) break
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(S.role)
      doc.setTextColor(30, 30, 35)
      doc.text(exp.title, mx, my)
      if (exp.duration) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(S.tiny)
        doc.setTextColor(120, 120, 130)
        doc.text(exp.duration, mx + mw - doc.getTextWidth(exp.duration), my)
      }
      my += S.lineH * 0.9
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(S.company)
      doc.setTextColor(ar, ag, ab)
      doc.text(exp.company || '', mx, my)
      my += S.lineH
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(S.bullet)
      doc.setTextColor(50, 50, 55)
      const bullets = (exp.bullets || []).filter(Boolean).slice(0, 5)
      for (const b of bullets) {
        if (my > maxY - 4) break
        const bl = doc.splitTextToSize(`• ${b}`, mw - 2)
        doc.text(bl, mx + 1, my)
        my += bl.length * S.bulletLH
      }
      my += S.itemGap * 0.7
    }
  }

  if (data.projects?.filter(p => p.name).length && my < maxY - 15) {
    mainSection('Projects')
    for (const p of data.projects.filter(x => x.name).slice(0, 4)) {
      if (my > maxY - 8) break
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(S.role * 0.95)
      doc.setTextColor(30, 30, 35)
      doc.text(p.name, mx, my)
      my += S.lineH * 0.9
      if (p.tech) {
        doc.setFont('helvetica', 'italic')
        doc.setFontSize(S.small)
        doc.setTextColor(ar, ag, ab)
        doc.text(p.tech, mx, my)
        my += S.lineH * 0.9
      }
      if (p.description) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(S.bullet)
        doc.setTextColor(60, 60, 65)
        const dl = doc.splitTextToSize(p.description, mw)
        doc.text(dl, mx, my)
        my += dl.length * S.bulletLH
      }
      my += S.itemGap * 0.6
    }
  }

  return doc
}

// ─── TEMPLATE 2: CRISP ───────────────────────────────────────────────────────
function renderCrisp(data, accent) {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' })
  const pageW = 210, pageH = 297
  const scale = getScale(data)
  const S = buildSizes(scale)
  const sidebarW = Math.max(58, 65 * Math.min(scale, 1))
  const sidebarX = pageW - sidebarW
  const [ar, ag, ab] = hexToRgb(accent)

  doc.setFillColor(245, 247, 250)
  doc.rect(sidebarX, 0, sidebarW, pageH, 'F')
  doc.setFillColor(ar, ag, ab)
  doc.rect(sidebarX, 0, 1.2, pageH, 'F')

  // ── MAIN ──
  const mx = 14
  const mw = sidebarX - mx - 6
  let my = 20
  const maxY = pageH - 10

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(S.nameLg)
  doc.setTextColor(ar, ag, ab)
  doc.text(data.name || 'Your Name', mx, my)
  my += S.lineH * 1.7
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(S.headline)
  doc.setTextColor(80, 80, 90)
  doc.text(data.headline || '', mx, my)
  my += S.lineH * 1.6

  const mainSection = (title) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(S.section)
    doc.setTextColor(ar, ag, ab)
    doc.text(title.toUpperCase(), mx, my)
    my += 1.5
    doc.setDrawColor(ar, ag, ab)
    doc.setLineWidth(0.6)
    doc.line(mx, my + 0.6, mx + 16, my + 0.6)
    my += S.lineH + 0.8
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(S.body)
    doc.setTextColor(50, 50, 55)
  }

  if (data.summary?.trim()) {
    mainSection('Profile')
    const lines = doc.splitTextToSize(data.summary, mw)
    doc.text(lines, mx, my)
    my += lines.length * S.lineH + S.itemGap
  }

  if (data.experience?.filter(e => e.title).length) {
    mainSection('Experience')
    for (const exp of data.experience.filter(e => e.title)) {
      if (my > maxY - 10) break
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(S.role)
      doc.setTextColor(30, 30, 35)
      doc.text(exp.title, mx, my)
      if (exp.duration) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(S.tiny)
        doc.setTextColor(130, 130, 140)
        doc.text(exp.duration, mx + mw - doc.getTextWidth(exp.duration), my)
      }
      my += S.lineH * 0.9
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(S.company)
      doc.setTextColor(ar, ag, ab)
      doc.text(exp.company || '', mx, my)
      my += S.lineH
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(S.bullet)
      doc.setTextColor(50, 50, 55)
      for (const b of (exp.bullets || []).filter(Boolean).slice(0, 5)) {
        if (my > maxY - 4) break
        const bl = doc.splitTextToSize(`• ${b}`, mw - 2)
        doc.text(bl, mx + 1, my)
        my += bl.length * S.bulletLH
      }
      my += S.itemGap * 0.7
    }
  }

  if (data.projects?.filter(p => p.name).length && my < maxY - 15) {
    mainSection('Projects')
    for (const p of data.projects.filter(x => x.name).slice(0, 3)) {
      if (my > maxY - 8) break
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(S.role * 0.95)
      doc.setTextColor(30, 30, 35)
      doc.text(p.name, mx, my)
      my += S.lineH * 0.9
      if (p.description) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(S.bullet)
        doc.setTextColor(60, 60, 65)
        const dl = doc.splitTextToSize(p.description, mw)
        doc.text(dl, mx, my)
        my += dl.length * S.bulletLH
      }
      my += S.itemGap * 0.6
    }
  }

  // ── SIDEBAR ──
  const sx = sidebarX + 5
  const sw = sidebarW - 10
  let sy = 20

  const sideSection = (title) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(S.sectionSm)
    doc.setTextColor(ar, ag, ab)
    doc.text(title.toUpperCase(), sx, sy)
    sy += S.lineH + 0.5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(S.tiny)
    doc.setTextColor(60, 60, 70)
  }

  const c = data.contact || {}
  const cItems = [c.email, c.phone, c.location,
    c.linkedin?.replace(/https?:\/\//, ''),
    c.github?.replace(/https?:\/\//, ''),
    c.website?.replace(/https?:\/\//, '')].filter(Boolean)

  if (cItems.length) {
    sideSection('Contact')
    for (const v of cItems) {
      if (sy > pageH - 10) break
      const ln = doc.splitTextToSize(v, sw)
      doc.text(ln, sx, sy)
      sy += ln.length * S.sideLine + 0.6
    }
    sy += S.sectionGap * 0.6
  }

  if (data.skills?.length) {
    sideSection('Skills')
    for (const sk of data.skills.slice(0, 16)) {
      if (sy > pageH - 10) break
      const sl = doc.splitTextToSize(`• ${sk}`, sw)
      doc.text(sl, sx, sy)
      sy += sl.length * S.sideLine + 0.2
    }
    sy += S.sectionGap * 0.6
  }

  if (data.education?.length && sy < pageH - 20) {
    sideSection('Education')
    for (const edu of data.education.filter(e => e.degree)) {
      if (sy > pageH - 12) break
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(S.tiny)
      doc.setTextColor(30, 30, 40)
      const dLines = doc.splitTextToSize(edu.degree, sw)
      doc.text(dLines, sx, sy)
      sy += dLines.length * S.sideLine
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(S.micro)
      doc.setTextColor(80, 80, 90)
      const sLines = doc.splitTextToSize([edu.school, edu.year].filter(Boolean).join(' · '), sw)
      doc.text(sLines, sx, sy)
      sy += sLines.length * S.sideLine + 2
    }
    sy += S.sectionGap * 0.5
  }

  if (data.certifications?.filter(Boolean).length && sy < pageH - 12) {
    sideSection('Certifications')
    for (const cert of data.certifications.filter(Boolean).slice(0, 5)) {
      if (sy > pageH - 8) break
      const cl = doc.splitTextToSize(`• ${cert}`, sw)
      doc.text(cl, sx, sy)
      sy += cl.length * S.sideLine
    }
  }

  return doc
}

// ─── TEMPLATE 3: CONCEPT ─────────────────────────────────────────────────────
function renderConcept(data, accent) {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' })
  const pageW = 210, pageH = 297
  const scale = getScale(data)
  const S = buildSizes(scale)
  const ml = 16, mr = 16
  const cW = pageW - ml - mr
  const [ar, ag, ab] = hexToRgb(accent)
  const maxY = pageH - 10

  const bandH = S.headerH
  doc.setFillColor(ar, ag, ab)
  doc.rect(0, 0, pageW, bandH, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(S.nameLg)
  doc.setTextColor(255, 255, 255)
  doc.text(data.name || 'Your Name', ml, bandH * 0.4)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(S.headline)
  doc.setTextColor(240, 240, 250)
  doc.text(data.headline || '', ml, bandH * 0.6)

  const c = data.contact || {}
  const cParts = [c.email, c.phone, c.location,
    c.linkedin?.replace(/https?:\/\//, ''),
    c.github?.replace(/https?:\/\//, '')].filter(Boolean)
  doc.setFontSize(S.small)
  doc.setTextColor(230, 230, 245)
  doc.text(cParts.join('  ·  ').substring(0, 140), ml, bandH * 0.83)

  let y = bandH + 8

  const section = (title) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(S.section)
    doc.setTextColor(ar, ag, ab)
    doc.text(title.toUpperCase(), ml, y)
    doc.setDrawColor(ar, ag, ab)
    doc.setLineWidth(0.4)
    doc.line(ml + doc.getTextWidth(title.toUpperCase()) + 3, y - 0.6, pageW - mr, y - 0.6)
    y += S.lineH + 1
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(S.body)
    doc.setTextColor(45, 45, 55)
  }

  if (data.summary?.trim()) {
    section('Profile')
    const lines = doc.splitTextToSize(data.summary, cW)
    doc.text(lines, ml, y)
    y += lines.length * S.lineH + S.itemGap
  }

  if (data.experience?.filter(e => e.title).length) {
    section('Experience')
    for (const exp of data.experience.filter(e => e.title)) {
      if (y > maxY - 10) break
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(S.role)
      doc.setTextColor(25, 25, 35)
      doc.text([exp.title, exp.company].filter(Boolean).join(' · '), ml, y)
      if (exp.duration) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(S.small)
        doc.setTextColor(130, 130, 140)
        doc.text(exp.duration, pageW - mr - doc.getTextWidth(exp.duration), y)
      }
      y += S.lineH
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(S.bullet)
      doc.setTextColor(50, 50, 60)
      for (const b of (exp.bullets || []).filter(Boolean).slice(0, 5)) {
        if (y > maxY - 4) break
        const bl = doc.splitTextToSize(`• ${b}`, cW - 2)
        doc.text(bl, ml + 1, y)
        y += bl.length * S.bulletLH
      }
      y += S.itemGap * 0.7
    }
  }

  if ((data.skills?.length || data.education?.filter(e => e.degree).length) && y < maxY - 12) {
    section('Skills & Education')
    const colW = (cW - 8) / 2
    let leftY = y, rightY = y

    if (data.skills?.length) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(S.small)
      doc.setTextColor(70, 70, 80)
      doc.text('Skills', ml, leftY)
      leftY += S.lineH * 0.9
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(S.bullet)
      doc.setTextColor(50, 50, 60)
      const sLines = doc.splitTextToSize(data.skills.join(' · '), colW)
      doc.text(sLines, ml, leftY)
      leftY += sLines.length * S.bulletLH
    }

    if (data.education?.filter(e => e.degree).length) {
      const ex = ml + colW + 8
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(S.small)
      doc.setTextColor(70, 70, 80)
      doc.text('Education', ex, rightY)
      rightY += S.lineH * 0.9
      for (const edu of data.education.filter(e => e.degree)) {
        if (rightY > maxY - 4) break
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(S.small)
        doc.setTextColor(30, 30, 40)
        const dl = doc.splitTextToSize(edu.degree, colW)
        doc.text(dl, ex, rightY)
        rightY += dl.length * S.sideLine
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(S.tiny)
        doc.setTextColor(90, 90, 100)
        doc.text([edu.school, edu.year].filter(Boolean).join(' · '), ex, rightY)
        rightY += S.lineH * 0.9
      }
    }
    y = Math.max(leftY, rightY) + S.itemGap
  }

  if (data.projects?.filter(p => p.name).length && y < maxY - 12) {
    section('Projects')
    for (const p of data.projects.filter(x => x.name).slice(0, 3)) {
      if (y > maxY - 6) break
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(S.role * 0.95)
      doc.setTextColor(25, 25, 35)
      doc.text(p.name + (p.tech ? `  ·  ${p.tech}` : ''), ml, y)
      y += S.lineH * 0.9
      if (p.description) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(S.bullet)
        doc.setTextColor(55, 55, 65)
        const dl = doc.splitTextToSize(p.description, cW)
        doc.text(dl, ml, y)
        y += dl.length * S.bulletLH
      }
      y += S.itemGap * 0.6
    }
  }

  return doc
}

// ─── TEMPLATE 4: DIAMOND ─────────────────────────────────────────────────────
function renderDiamond(data, accent) {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' })
  const pageW = 210, pageH = 297
  const scale = getScale(data)
  const S = buildSizes(scale)
  const ml = 20, mr = 20
  const cW = pageW - ml - mr
  const [ar, ag, ab] = hexToRgb(accent)
  const maxY = pageH - 10

  let y = 22
  doc.setFont('times', 'bold')
  doc.setFontSize(S.nameLg * 1.05)
  doc.setTextColor(30, 30, 40)
  doc.text(data.name || 'Your Name', pageW / 2, y, { align: 'center' })
  y += S.lineH * 1.5

  doc.setFont('times', 'italic')
  doc.setFontSize(S.headline)
  doc.setTextColor(ar, ag, ab)
  doc.text(data.headline || '', pageW / 2, y, { align: 'center' })
  y += S.lineH

  doc.setDrawColor(ar, ag, ab)
  doc.setLineWidth(0.6)
  doc.line(ml + 30, y, pageW - mr - 30, y)
  doc.setLineWidth(0.2)
  doc.line(ml + 30, y + 1.2, pageW - mr - 30, y + 1.2)
  y += S.lineH

  const c = data.contact || {}
  const cParts = [c.email, c.phone, c.location,
    c.linkedin?.replace(/https?:\/\//, ''),
    c.github?.replace(/https?:\/\//, '')].filter(Boolean)
  doc.setFont('times', 'normal')
  doc.setFontSize(S.small)
  doc.setTextColor(80, 80, 90)
  doc.text(cParts.join('  ·  ').substring(0, 130), pageW / 2, y, { align: 'center' })
  y += S.lineH * 1.6

  const section = (title) => {
    doc.setFont('times', 'bold')
    doc.setFontSize(S.section)
    doc.setTextColor(ar, ag, ab)
    doc.text(title.toUpperCase(), pageW / 2, y, { align: 'center' })
    y += 1.5
    doc.setDrawColor(ar, ag, ab)
    doc.setLineWidth(0.3)
    const tw = doc.getTextWidth(title.toUpperCase())
    doc.line(pageW/2 - tw/2 - 2, y + 1, pageW/2 + tw/2 + 2, y + 1)
    y += S.lineH + 0.5
    doc.setFont('times', 'normal')
    doc.setFontSize(S.body)
    doc.setTextColor(40, 40, 50)
  }

  if (data.summary?.trim()) {
    section('Profile')
    const lines = doc.splitTextToSize(data.summary, cW)
    doc.text(lines, ml, y)
    y += lines.length * S.lineH + S.itemGap
  }

  if (data.experience?.filter(e => e.title).length) {
    section('Experience')
    for (const exp of data.experience.filter(e => e.title)) {
      if (y > maxY - 10) break
      doc.setFont('times', 'bold')
      doc.setFontSize(S.role)
      doc.setTextColor(30, 30, 40)
      doc.text(exp.title, ml, y)
      if (exp.duration) {
        doc.setFont('times', 'italic')
        doc.setFontSize(S.small)
        doc.setTextColor(120, 120, 130)
        doc.text(exp.duration, pageW - mr - doc.getTextWidth(exp.duration), y)
      }
      y += S.lineH * 0.95
      doc.setFont('times', 'italic')
      doc.setFontSize(S.company)
      doc.setTextColor(ar, ag, ab)
      doc.text(exp.company || '', ml, y)
      y += S.lineH
      doc.setFont('times', 'normal')
      doc.setFontSize(S.bullet)
      doc.setTextColor(45, 45, 55)
      for (const b of (exp.bullets || []).filter(Boolean).slice(0, 5)) {
        if (y > maxY - 4) break
        const bl = doc.splitTextToSize(`• ${b}`, cW - 2)
        doc.text(bl, ml + 1, y)
        y += bl.length * S.bulletLH
      }
      y += S.itemGap * 0.7
    }
  }

  if (data.education?.filter(e => e.degree).length && y < maxY - 10) {
    section('Education')
    for (const edu of data.education.filter(e => e.degree)) {
      if (y > maxY - 6) break
      doc.setFont('times', 'bold')
      doc.setFontSize(S.role)
      doc.setTextColor(30, 30, 40)
      doc.text(edu.degree, ml, y)
      if (edu.year) {
        doc.setFont('times', 'italic')
        doc.setFontSize(S.small)
        doc.setTextColor(120, 120, 130)
        doc.text(edu.year, pageW - mr - doc.getTextWidth(edu.year), y)
      }
      y += S.lineH * 0.9
      doc.setFont('times', 'italic')
      doc.setFontSize(S.company)
      doc.setTextColor(ar, ag, ab)
      doc.text(edu.school || '', ml, y)
      y += S.lineH * 1.3
    }
  }

  if (data.skills?.length && y < maxY - 10) {
    section('Skills')
    doc.setFont('times', 'normal')
    doc.setFontSize(S.body)
    doc.setTextColor(45, 45, 55)
    const sLines = doc.splitTextToSize(data.skills.join('  ·  '), cW)
    doc.text(sLines, pageW / 2, y, { align: 'center' })
    y += sLines.length * S.lineH + S.itemGap
  }

  return doc
}

// ─── TEMPLATE 5: ICONIC ──────────────────────────────────────────────────────
function renderIconic(data, accent) {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' })
  const pageW = 210, pageH = 297
  const scale = getScale(data)
  const S = buildSizes(scale)
  const sidebarW = Math.max(70, 80 * Math.min(scale, 1))
  const [ar, ag, ab] = hexToRgb(accent)
  const maxY = pageH - 10

  doc.setFillColor(ar, ag, ab)
  doc.rect(0, 0, sidebarW, pageH, 'F')

  const circleR = 13 * Math.min(scale, 1)
  doc.setFillColor(255, 255, 255)
  doc.circle(sidebarW / 2, circleR + 12, circleR, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(S.section * 1.3)
  doc.setTextColor(ar, ag, ab)
  const initials = (data.name || 'YN').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
  doc.text(initials, sidebarW / 2, circleR + 14.5, { align: 'center' })

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(S.section * 1.25)
  let sy = (circleR + 12) + circleR + 6
  const nameLines = doc.splitTextToSize(data.name || 'Your Name', sidebarW - 8)
  doc.text(nameLines, sidebarW / 2, sy, { align: 'center' })
  sy += nameLines.length * S.lineH * 1.3

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(S.small)
  doc.setTextColor(245, 245, 255)
  const hLines = doc.splitTextToSize(data.headline || '', sidebarW - 8)
  doc.text(hLines, sidebarW / 2, sy, { align: 'center' })
  sy += hLines.length * S.lineH + S.sectionGap * 0.8

  const sidebarSec = (title) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(S.sectionSm)
    doc.setTextColor(255, 255, 255)
    doc.text(title.toUpperCase(), sidebarW / 2, sy, { align: 'center' })
    sy += 1.5
    doc.setDrawColor(255, 255, 255)
    doc.setLineWidth(0.3)
    doc.line(sidebarW / 2 - 10, sy + 1, sidebarW / 2 + 10, sy + 1)
    sy += S.lineH
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(S.tiny)
    doc.setTextColor(245, 245, 255)
  }

  const c = data.contact || {}
  const cItems = [c.email, c.phone, c.location,
    c.linkedin?.replace(/https?:\/\//, ''),
    c.github?.replace(/https?:\/\//, ''),
    c.website?.replace(/https?:\/\//, '')].filter(Boolean)

  if (cItems.length) {
    sidebarSec('Contact')
    for (const v of cItems) {
      if (sy > pageH - 8) break
      const ln = doc.splitTextToSize(v, sidebarW - 8)
      doc.text(ln, sidebarW / 2, sy, { align: 'center' })
      sy += ln.length * S.sideLine + 0.4
    }
    sy += S.sectionGap * 0.5
  }

  if (data.skills?.length) {
    sidebarSec('Skills')
    for (const sk of data.skills.slice(0, 12)) {
      if (sy > pageH - 10) break
      doc.text(sk, sidebarW / 2, sy, { align: 'center' })
      sy += S.sideLine
    }
    sy += S.sectionGap * 0.5
  }

  if (data.education?.filter(e => e.degree).length && sy < pageH - 20) {
    sidebarSec('Education')
    for (const edu of data.education.filter(e => e.degree)) {
      if (sy > pageH - 10) break
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(S.tiny)
      doc.setTextColor(255, 255, 255)
      const dLines = doc.splitTextToSize(edu.degree, sidebarW - 8)
      doc.text(dLines, sidebarW / 2, sy, { align: 'center' })
      sy += dLines.length * S.sideLine
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(S.micro)
      doc.setTextColor(240, 240, 250)
      const sLines = doc.splitTextToSize([edu.school, edu.year].filter(Boolean).join(' · '), sidebarW - 8)
      doc.text(sLines, sidebarW / 2, sy, { align: 'center' })
      sy += sLines.length * S.sideLine + 1.5
    }
  }

  // ── MAIN ──
  const mx = sidebarW + 9
  const mw = pageW - mx - 12
  let my = 20

  const mainSec = (title) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(S.section * 1.1)
    doc.setTextColor(ar, ag, ab)
    doc.text(title.toUpperCase(), mx, my)
    my += 2
    doc.setDrawColor(ar, ag, ab)
    doc.setLineWidth(1.2)
    doc.line(mx, my + 0.5, mx + 12, my + 0.5)
    my += S.lineH
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(S.body)
    doc.setTextColor(40, 40, 50)
  }

  if (data.summary?.trim()) {
    mainSec('Profile')
    const lines = doc.splitTextToSize(data.summary, mw)
    doc.text(lines, mx, my)
    my += lines.length * S.lineH + S.itemGap
  }

  if (data.experience?.filter(e => e.title).length) {
    mainSec('Experience')
    for (const exp of data.experience.filter(e => e.title)) {
      if (my > maxY - 10) break
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(S.role)
      doc.setTextColor(25, 25, 35)
      doc.text(exp.title, mx, my)
      my += S.lineH * 0.9
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(S.company)
      doc.setTextColor(ar, ag, ab)
      doc.text(exp.company || '', mx, my)
      if (exp.duration) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(S.small)
        doc.setTextColor(120, 120, 130)
        doc.text(exp.duration, mx + mw - doc.getTextWidth(exp.duration), my)
      }
      my += S.lineH
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(S.bullet)
      doc.setTextColor(45, 45, 55)
      for (const b of (exp.bullets || []).filter(Boolean).slice(0, 5)) {
        if (my > maxY - 4) break
        const bl = doc.splitTextToSize(`• ${b}`, mw - 2)
        doc.text(bl, mx + 1, my)
        my += bl.length * S.bulletLH
      }
      my += S.itemGap * 0.7
    }
  }

  if (data.projects?.filter(p => p.name).length && my < maxY - 12) {
    mainSec('Projects')
    for (const p of data.projects.filter(x => x.name).slice(0, 3)) {
      if (my > maxY - 6) break
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(S.role * 0.95)
      doc.setTextColor(25, 25, 35)
      doc.text(p.name, mx, my)
      my += S.lineH * 0.9
      if (p.description) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(S.bullet)
        doc.setTextColor(50, 50, 60)
        const dl = doc.splitTextToSize(p.description, mw)
        doc.text(dl, mx, my)
        my += dl.length * S.bulletLH
      }
      my += S.itemGap * 0.6
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

  doc.setFontSize(6.5)
  doc.setTextColor(160, 160, 175)
  doc.text('Created with CareerDNA  ·  careeerdna.netlify.app', 105, 292, { align: 'center' })

  return doc
}
