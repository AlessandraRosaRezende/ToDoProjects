import React, { useState, useEffect } from 'react'
import { Project, ProjectStatus, ProjectLog, STATUS_CONFIG } from '../types'
import { createProject, updateProject, usePeople, addProjectLog, deleteProjectLog } from '../hooks/useProjects'
import { useUser } from '../lib/UserContext'
import { OwnersSelect } from './OwnersSelect'
import api from '../lib/api'

interface Props {
  project?: Project | null
  onClose: () => void
  onSaved: () => void
}

const STATUSES = Object.keys(STATUS_CONFIG) as ProjectStatus[]

export function ProjectForm({ project, onClose, onSaved }: Props) {
  const { user } = useUser()
  const { people } = usePeople()

  const [form, setForm] = useState({
    project: project?.project ?? '',
    subproduct: project?.subproduct ?? '',
    status: (project?.status ?? '🔵 AGUARDANDO') as ProjectStatus,
    next_steps: project?.next_steps ?? '',
    observations: project?.observations ?? '',
    deadline: project?.deadline ?? '',
    owners: project?.owners ?? [],
  })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  // Histórico — só para projetos existentes
  const [logs, setLogs] = useState<ProjectLog[]>([])
  const [logText, setLogText] = useState('')
  const [addingLog, setAddingLog] = useState(false)

  useEffect(() => {
    if (!project?.id) return
    api.get(`/api/project-logs/${project.id}`)
      .then(res => setLogs(res.data.data ?? []))
      .catch(() => { })
  }, [project?.id])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const set = (k: string, v: string | string[]) => setForm(f => ({ ...f, [k]: v }))

  const submitLog = async () => {
    if (!logText.trim() || !project?.id) return
    setAddingLog(true)
    try {
      const newLog = await addProjectLog({
        project_id: project.id,
        author_name: user?.name ?? 'Anônimo',
        content: logText.trim(),
      })
      setLogs(prev => [newLog, ...prev])
      setLogText('')
    } finally { setAddingLog(false) }
  }

  const removeLog = async (id: string) => {
    if (!confirm('Remover esta entrada?')) return
    await deleteProjectLog(id)
    setLogs(prev => prev.filter(l => l.id !== id))
  }

  const submit = async () => {
    if (!form.project.trim() || !form.subproduct.trim()) {
      setErr('Projeto e subproduto são obrigatórios')
      return
    }
    setSaving(true); setErr('')
    try {
      if (project) {
        await updateProject(project.id, { ...form, updated_by: user?.name ?? 'Anônimo' })
      } else {
        await createProject({ ...form, created_by: user?.name ?? 'Anônimo' })
      }
      onSaved(); onClose()
    } catch (e: any) {
      setErr(e.message ?? 'Erro ao salvar')
    } finally { setSaving(false) }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 500, backdropFilter: 'blur(3px)',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border2)',
        borderRadius: 'var(--radius-lg)',
        width: project ? 900 : 580,
        maxWidth: '96vw',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 24px 60px rgba(0,0,0,0.7)',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 28px', borderBottom: '1px solid var(--border)', flexShrink: 0,
        }}>
          <div style={{ fontSize: 17, fontWeight: 700 }}>
            {project ? `Editar: ${project.project}` : 'Novo projeto'}
          </div>
          <button onClick={onClose} style={{ color: 'var(--text3)', fontSize: 20, background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>

        {/* Body — two columns when editing */}
        <div style={{
          display: 'flex', flex: 1, overflow: 'hidden',
        }}>

          {/* Left: project fields */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '24px 28px',
            borderRight: project ? '1px solid var(--border)' : 'none',
            display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            <Field label="Projeto / Frente *">
              <input style={inp} value={form.project} onChange={e => set('project', e.target.value)} placeholder="Ex: WhiteWall (Blip)" />
            </Field>

            <Field label="Subproduto / Descrição *">
              <input style={inp} value={form.subproduct} onChange={e => set('subproduct', e.target.value)} placeholder="Ex: Atendimento Digital (MG e Nacional)" />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Status">
                <select style={inp} value={form.status} onChange={e => set('status', e.target.value)}>
                  {STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                </select>
              </Field>
              <Field label="Prazo / Sprint">
                <input style={inp} value={form.deadline} onChange={e => set('deadline', e.target.value)} placeholder="Ex: 30/03/26" />
              </Field>
            </div>

            <Field label="Responsáveis">
              <OwnersSelect people={people} selected={form.owners} onChange={owners => set('owners', owners)} />
            </Field>

            <Field label="Próximos Passos">
              <textarea
                style={{ ...inp, minHeight: 90, resize: 'vertical' }}
                value={form.next_steps}
                onChange={e => set('next_steps', e.target.value)}
                placeholder="O que deve ser feito em seguida..."
              />
            </Field>

            <Field label="Observações / Impedimentos">
              <textarea
                style={{ ...inp, minHeight: 90, resize: 'vertical' }}
                value={form.observations}
                onChange={e => set('observations', e.target.value)}
                placeholder="Contexto, impedimentos, notas..."
              />
            </Field>

            {err && (
              <div style={{ fontSize: 12, color: 'var(--red)', padding: '8px 12px', background: 'var(--red-bg)', borderRadius: 8 }}>
                {err}
              </div>
            )}
          </div>

          {/* Right: histórico — only when editing */}
          {project && (
            <div style={{
              width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
            }}>
              {/* Log input */}
              <div style={{ padding: '20px 20px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.06em', marginBottom: 10 }}>
                  HISTÓRICO DO PROJETO
                </div>
                <textarea
                  style={{
                    ...inp, minHeight: 72, resize: 'none', fontSize: 13,
                    width: '100%', display: 'block', marginBottom: 8,
                  }}
                  placeholder="Registrar nova entrada..."
                  value={logText}
                  onChange={e => setLogText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submitLog()
                  }}
                  disabled={addingLog}
                />
                <button
                  onClick={submitLog}
                  disabled={addingLog || !logText.trim()}
                  style={{
                    width: '100%', background: !logText.trim() ? 'var(--bg4)' : 'var(--accent)',
                    color: !logText.trim() ? 'var(--text3)' : '#fff',
                    border: 'none', borderRadius: 'var(--radius)',
                    padding: '9px 0', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                    transition: 'background 0.15s, color 0.15s',
                    opacity: addingLog ? 0.6 : 1,
                  }}
                >
                  {addingLog ? 'Adicionando...' : '+ Adicionar entrada'}
                </button>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 5, textAlign: 'right' }}>
                  Cmd+Enter para enviar
                </div>
              </div>

              {/* Log list */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
                {logs.length === 0 ? (
                  <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', paddingTop: 32 }}>
                    Nenhuma entrada ainda
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {logs.map((log, i) => (
                      <div key={log.id} style={{ display: 'flex', gap: 10, paddingBottom: 14, position: 'relative' }}>
                        {/* Timeline */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                          <div style={{
                            width: 26, height: 26, borderRadius: '50%',
                            background: i === 0 ? 'var(--accent-light)' : 'var(--bg4)',
                            border: `2px solid ${i === 0 ? 'var(--accent)' : 'var(--border2)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: i === 0 ? 'var(--accent)' : 'var(--text3)',
                            fontWeight: 700, fontSize: 11, flexShrink: 0,
                          }}>
                            {log.author_name.slice(0, 1).toUpperCase()}
                          </div>
                          {i < logs.length - 1 && (
                            <div style={{ width: 1, flex: 1, minHeight: 12, background: 'var(--border)', marginTop: 3 }} />
                          )}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, paddingTop: 3, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)' }}>{log.author_name}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                              <span style={{ fontSize: 10, color: 'var(--text3)' }}>
                                {new Date(log.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                {' '}
                                {new Date(log.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <button
                                onClick={() => removeLog(log.id)}
                                title="Remover entrada"
                                style={{ fontSize: 10, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', padding: '1px 3px', opacity: 0.5, lineHeight: 1 }}
                              >✕</button>
                            </div>
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {log.content}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', gap: 10, justifyContent: 'flex-end',
          padding: '16px 28px', borderTop: '1px solid var(--border)', flexShrink: 0,
        }}>
          <button onClick={onClose} style={{ ...btn, background: 'var(--bg4)', color: 'var(--text2)' }}>Cancelar</button>
          <button onClick={submit} disabled={saving} style={{ ...btn, background: 'var(--accent)', color: '#fff', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Salvando...' : project ? 'Salvar alterações' : 'Criar projeto'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>
        {label.toUpperCase()}
      </label>
      {children}
    </div>
  )
}

const inp: React.CSSProperties = {
  width: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)',
  borderRadius: 'var(--radius)', padding: '10px 12px',
  color: 'var(--text)', fontSize: 14, outline: 'none',
}

const btn: React.CSSProperties = {
  padding: '10px 22px', borderRadius: 'var(--radius)',
  fontWeight: 600, fontSize: 13, cursor: 'pointer', border: 'none',
}