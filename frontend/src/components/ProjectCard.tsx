import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Project, ProjectLog, Person } from '../types'
import { StatusBadge } from './StatusBadge'
import { ProjectLogsSection } from './ProjectLogsSection'

interface Props {
  project: Project
  logs: ProjectLog[]
  people: Person[]
  onEdit: (p: Project) => void
  onDelete: (id: string) => void
}

export function ProjectCard({ project, logs, people, onEdit, onDelete }: Props) {
  const navigate = useNavigate()

  const confirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`Excluir "${project.project}"?`)) onDelete(project.id)
  }

  const ownerDetails = (project.owners ?? []).map(name => {
    const person = people.find(p => p.name === name)
    return { name, udn_role: person?.udn_role ?? '' }
  })

  return (
    <div
      style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: '20px 22px',
        display: 'flex', flexDirection: 'column', gap: 10,
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border2)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)' }}
    >
      {/* Title */}
      <div>
        <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.3, marginBottom: 3 }}>{project.project}</div>
        <div style={{ fontSize: 12, color: 'var(--text2)' }}>{project.subproduct}</div>
      </div>

      {/* Status */}
      <div><StatusBadge status={project.status} size="sm" /></div>

      {/* Owners with udn_role */}
      {ownerDetails.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {ownerDetails.map(o => (
            <div key={o.name} style={{
              padding: '5px 11px',
              background: 'var(--bg4)', borderRadius: 8,
              border: '1px solid var(--border2)',
              lineHeight: 1.35,
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{o.name}</div>
              {o.udn_role && (
                <div style={{ fontSize: 10, color: 'var(--text3)' }}>{o.udn_role}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Next steps */}
      {project.next_steps && (
        <div style={{
          fontSize: 12, color: 'var(--text2)', lineHeight: 1.6,
          padding: '9px 12px', background: 'var(--bg3)', borderRadius: 8,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          <span style={{ fontWeight: 700, color: 'var(--text3)', fontSize: 10, letterSpacing: '0.06em' }}>PRÓX. PASSOS · </span>
          {project.next_steps}
        </div>
      )}

      {/* Latest log preview */}
      <ProjectLogsSection
        projectId={project.id}
        logs={logs}
        onChanged={() => { }}
        compact
      />

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
        <div style={{ fontSize: 11, color: 'var(--text3)' }}>🗓 {project.deadline || 'Sem prazo'}</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Btn label="Detalhes" onClick={() => navigate(`/project/${project.id}`)} primary />
          <Btn label="Editar" onClick={e => { e.stopPropagation(); onEdit(project) }} />
          <Btn label="✕" onClick={confirmDelete} danger />
        </div>
      </div>
    </div>
  )
}

function Btn({ label, onClick, primary, danger }: {
  label: string; onClick: (e: React.MouseEvent) => void; primary?: boolean; danger?: boolean
}) {
  return (
    <button onClick={onClick} style={{
      fontSize: 11, fontWeight: 600, padding: '5px 10px', borderRadius: 7,
      border: '1px solid var(--border2)',
      background: primary ? 'var(--accent)' : 'var(--bg4)',
      color: primary ? '#fff' : danger ? 'var(--red)' : 'var(--text2)',
      cursor: 'pointer',
    }}>{label}</button>
  )
}