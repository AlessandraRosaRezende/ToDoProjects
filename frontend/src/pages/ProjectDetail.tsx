import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProject } from '../hooks/useProjects'
import { StatusBadge } from '../components/StatusBadge'
import { CommentsSection } from '../components/CommentsSection'
import { HistorySection } from '../components/HistorySection'
import { ProjectForm } from '../components/ProjectForm'
import { UserModal } from '../components/UserModal'
import { FIELD_LABELS, STATUS_CONFIG } from '../types'

type Tab = 'info' | 'comentarios' | 'historico'

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { project, loading, error, refetch } = useProject(id)
  const [tab, setTab] = useState<Tab>('info')
  const [editOpen, setEditOpen] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  const commentCount = project?.comments.filter(c => !c.content.startsWith('❓')).length ?? 0

  const exportPDF = () => {
    if (!project) return
    setPdfLoading(true)

    const statusCfg = STATUS_CONFIG[project.status]
    const owners = project.owners?.join(', ') || '—'
    const now = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<title>Follow-up – ${project.project}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', system-ui, sans-serif; background: #fff; color: #1a1a1a; font-size: 13px; line-height: 1.6; }
  .page { max-width: 780px; margin: 0 auto; padding: 48px 48px 64px; }

  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; padding-bottom: 24px; border-bottom: 2px solid #f0f0f0; }
  .logo { font-size: 13px; font-weight: 700; color: #888; letter-spacing: 0.1em; }
  .date { font-size: 11px; color: #aaa; }

  h1 { font-size: 26px; font-weight: 800; color: #0f0f11; letter-spacing: -0.02em; margin-bottom: 4px; }
  .subproduct { font-size: 14px; color: #666; margin-bottom: 20px; }

  .badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 14px; border-radius: 999px; font-size: 11px; font-weight: 800; letter-spacing: 0.07em; margin-bottom: 24px; background: ${statusCfg.bg}; color: ${statusCfg.color}; }
  .badge-dot { width: 7px; height: 7px; border-radius: 50%; background: ${statusCfg.dot}; }

  .meta-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 32px; padding: 20px; background: #f9f9f9; border-radius: 12px; }
  .meta-label { font-size: 9px; font-weight: 800; color: #aaa; letter-spacing: 0.1em; margin-bottom: 4px; text-transform: uppercase; }
  .meta-value { font-size: 13px; color: #333; font-weight: 500; }

  .section { margin-bottom: 28px; }
  .section-label { font-size: 9px; font-weight: 800; color: #aaa; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 10px; }
  .section-content { font-size: 13px; color: #333; line-height: 1.8; padding: 16px; background: #f9f9f9; border-radius: 10px; white-space: pre-wrap; }
  .section-content.next { border-left: 3px solid #3b82f6; }
  .section-content.obs { border-left: 3px solid #f59e0b; }

  .owners { display: flex; flex-wrap: wrap; gap: 8px; }
  .owner-chip { font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 999px; background: #f0f0f0; color: #444; }

  .comments { margin-bottom: 28px; }
  .comment { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; }
  .comment-meta { display: flex; justify-content: space-between; margin-bottom: 4px; }
  .comment-author { font-size: 12px; font-weight: 700; color: #333; }
  .comment-date { font-size: 11px; color: #aaa; }
  .comment-body { font-size: 12px; color: #555; line-height: 1.6; }

  .history { margin-bottom: 28px; }
  .history-row { display: flex; gap: 12px; align-items: baseline; padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 12px; color: #555; }
  .history-who { font-weight: 700; color: #333; min-width: 100px; }
  .history-field { color: #7c6af7; }
  .history-date { margin-left: auto; color: #aaa; white-space: nowrap; }

  .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #f0f0f0; display: flex; justify-content: space-between; font-size: 10px; color: #ccc; }

  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { padding: 24px; }
  }
</style>
</head>
<body>
<div class="page">

  <div class="header">
    <div class="logo">◈ FOLLOW-UP SYSTEM</div>
    <div class="date">Gerado em ${now}</div>
  </div>

  <h1>${project.project}</h1>
  <div class="subproduct">${project.subproduct}</div>
  <div class="badge"><span class="badge-dot"></span>${statusCfg.label}</div>

  <div class="meta-grid">
    <div><div class="meta-label">Prazo / Sprint</div><div class="meta-value">${project.deadline || '—'}</div></div>
    <div><div class="meta-label">Criado por</div><div class="meta-value">${project.created_by}</div></div>
    <div><div class="meta-label">Última atualização</div><div class="meta-value">${new Date(project.updated_at).toLocaleDateString('pt-BR')}</div></div>
  </div>

  ${owners !== '—' ? `
  <div class="section">
    <div class="section-label">Responsáveis</div>
    <div class="owners">${(project.owners ?? []).map(n => `<span class="owner-chip">${n}</span>`).join('')}</div>
  </div>` : ''}

  ${project.next_steps ? `
  <div class="section">
    <div class="section-label">Próximos Passos / Ação Requerida</div>
    <div class="section-content next">${project.next_steps}</div>
  </div>` : ''}

  ${project.observations ? `
  <div class="section">
    <div class="section-label">Observações / Impedimentos</div>
    <div class="section-content obs">${project.observations}</div>
  </div>` : ''}

  ${project.comments.filter(c => !c.content.startsWith('❓')).length > 0 ? `
  <div class="section">
    <div class="section-label">Comentários (${project.comments.filter(c => !c.content.startsWith('❓')).length})</div>
    <div class="comments">
      ${project.comments.filter(c => !c.content.startsWith('❓')).map(c => `
      <div class="comment">
        <div class="comment-meta">
          <span class="comment-author">${c.author_name}</span>
          <span class="comment-date">${new Date(c.created_at).toLocaleString('pt-BR')}</span>
        </div>
        <div class="comment-body">${c.content}</div>
      </div>`).join('')}
    </div>
  </div>` : ''}

  ${project.history.length > 0 ? `
  <div class="section">
    <div class="section-label">Histórico de Alterações (${project.history.length})</div>
    <div class="history">
      ${project.history.slice(0, 20).map(h => `
      <div class="history-row">
        <span class="history-who">${h.changed_by}</span>
        <span>alterou</span>
        <span class="history-field">${FIELD_LABELS[h.field_name] ?? h.field_name}</span>
        ${h.old_value ? `<span style="color:#aaa">${h.old_value} → ${h.new_value}</span>` : ''}
        <span class="history-date">${new Date(h.created_at).toLocaleDateString('pt-BR')}</span>
      </div>`).join('')}
    </div>
  </div>` : ''}

  <div class="footer">
    <span>◈ Follow-up System</span>
    <span>${project.project} · ${project.subproduct}</span>
  </div>
</div>
<script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }</script>
</body>
</html>`

    const win = window.open('', '_blank')
    if (win) {
      win.document.write(html)
      win.document.close()
    }
    setTimeout(() => setPdfLoading(false), 1000)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}>
      Carregando...
    </div>
  )

  if (error || !project) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ color: 'var(--red)' }}>{error ?? 'Projeto não encontrado'}</div>
      <button onClick={() => navigate('/')} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
        ← Voltar
      </button>
    </div>
  )

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'info', label: 'Detalhes' },
    { id: 'comentarios', label: 'Comentários', count: commentCount },
    { id: 'historico', label: 'Histórico', count: project.history.length },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <UserModal />

      <header style={{
        borderBottom: '1px solid var(--border)', padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 60, background: 'var(--bg2)', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/')} style={{ color: 'var(--text2)', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer' }}>
            ← Dashboard
          </button>
          <span style={{ color: 'var(--border2)' }}>/</span>
          <span style={{ fontWeight: 700, fontSize: 14 }}>{project.project}</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={exportPDF}
            disabled={pdfLoading}
            style={{
              background: 'var(--bg4)', color: 'var(--text2)', border: '1px solid var(--border2)',
              borderRadius: 'var(--radius)', padding: '8px 14px', fontWeight: 600, fontSize: 13,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {pdfLoading ? '⏳' : '📄'} Exportar PDF
          </button>
          <button
            onClick={() => setEditOpen(true)}
            style={{
              background: 'var(--bg4)', color: 'var(--text2)', border: '1px solid var(--border2)',
              borderRadius: 'var(--radius)', padding: '8px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer',
            }}
          >
            Editar
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px' }}>

        {/* Hero */}
        <div style={{
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: 28, marginBottom: 16,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.2, marginBottom: 6, letterSpacing: '-0.02em' }}>
                {project.project}
              </div>
              <div style={{ fontSize: 14, color: 'var(--text2)' }}>{project.subproduct}</div>
            </div>
            <StatusBadge status={project.status} />
          </div>

          {/* Owners */}
          {project.owners && project.owners.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.07em', marginBottom: 8 }}>RESPONSÁVEIS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {project.owners.map(name => (
                  <span key={name} style={{
                    fontSize: 12, fontWeight: 600, padding: '4px 12px',
                    background: 'var(--accent-light)', color: 'var(--accent)',
                    borderRadius: 999,
                  }}>{name}</span>
                ))}
              </div>
            </div>
          )}

          <div style={{ height: 1, background: 'var(--border)', margin: '16px 0' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <InfoBlock label="Prazo / Sprint" value={project.deadline || '—'} />
            <InfoBlock label="Criado por" value={project.created_by} />
            <InfoBlock label="Atualizado em" value={new Date(project.updated_at).toLocaleDateString('pt-BR')} />
          </div>
        </div>

        {/* Content blocks */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          <ContentBlock label="Próximos Passos" value={project.next_steps} accent="var(--blue)" />
          <ContentBlock label="Observações / Impedimentos" value={project.observations} accent="var(--yellow)" />
        </div>

        {/* Tabs */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 8px', background: 'var(--bg3)' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: '14px 14px', fontSize: 13, fontWeight: 600,
                color: tab === t.id ? 'var(--text)' : 'var(--text3)',
                borderBottom: `2px solid ${tab === t.id ? 'var(--accent)' : 'transparent'}`,
                background: 'none', border: 'none', borderRadius: 0,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                marginBottom: -1,
              }}>
                {t.label}
                {t.count !== undefined && t.count > 0 && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, borderRadius: 999, padding: '1px 6px',
                    background: tab === t.id ? 'var(--accent)' : 'var(--bg4)',
                    color: tab === t.id ? '#fff' : 'var(--text3)',
                  }}>{t.count}</span>
                )}
              </button>
            ))}
          </div>

          <div style={{ padding: 24 }}>
            {tab === 'info' && (
              <div>
                <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: project.history.length > 0 ? 16 : 0 }}>
                  Veja os detalhes completos acima. Use as abas para comentar ou consultar o histórico de alterações.
                </p>
                {project.history.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.06em', marginBottom: 10 }}>ÚLTIMAS ALTERAÇÕES</div>
                    {project.history.slice(0, 4).map(h => (
                      <div key={h.id} style={{ fontSize: 12, color: 'var(--text3)', display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ color: 'var(--text2)', fontWeight: 600 }}>{h.changed_by}</span>
                        <span>alterou</span>
                        <span style={{ color: 'var(--accent)' }}>{FIELD_LABELS[h.field_name] ?? h.field_name}</span>
                        <span>em {new Date(h.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    ))}
                    {project.history.length > 4 && (
                      <button onClick={() => setTab('historico')} style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: 4 }}>
                        Ver tudo ({project.history.length}) →
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
            {tab === 'comentarios' && (
              <CommentsSection projectId={project.id} comments={project.comments} onAdded={refetch} />
            )}
            {tab === 'historico' && (
              <HistorySection history={project.history} />
            )}
          </div>
        </div>
      </main>

      {editOpen && (
        <ProjectForm project={project} onClose={() => setEditOpen(false)} onSaved={refetch} />
      )}
    </div>
  )
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.07em', marginBottom: 4 }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: 13, color: 'var(--text2)' }}>{value}</div>
    </div>
  )
}

function ContentBlock({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderLeft: `3px solid ${accent}`, borderRadius: 'var(--radius-lg)', padding: 20,
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.07em', marginBottom: 10 }}>{label.toUpperCase()}</div>
      <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
        {value || <span style={{ fontStyle: 'italic', color: 'var(--text3)' }}>Não informado</span>}
      </div>
    </div>
  )
}