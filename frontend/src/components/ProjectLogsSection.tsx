import React, { useState } from 'react'
import { ProjectLog } from '../types'
import { addProjectLog, deleteProjectLog } from '../hooks/useProjects'
import { useUser } from '../lib/UserContext'

interface Props {
  projectId: string
  logs: ProjectLog[]
  onChanged: () => void
  compact?: boolean   // true = usado no card do dashboard (só preview)
}

export function ProjectLogsSection({ projectId, logs, onChanged, compact = false }: Props) {
  const { user } = useUser()
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!text.trim()) return
    setSaving(true)
    try {
      await addProjectLog({
        project_id: projectId,
        author_name: user?.name ?? 'Anônimo',
        content: text.trim(),
      })
      setText('')
      onChanged()
    } finally { setSaving(false) }
  }

  const remove = async (id: string) => {
    if (!confirm('Remover esta entrada do histórico?')) return
    await deleteProjectLog(id)
    onChanged()
  }

  if (compact) {
    // Preview mode: just the latest entry + count
    if (logs.length === 0) return null
    const latest = logs[0]
    return (
      <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5, padding: '8px 12px', background: 'var(--bg3)', borderRadius: 8, borderLeft: '2px solid var(--border2)' }}>
        <span style={{ fontWeight: 700, color: 'var(--text3)', fontSize: 10, letterSpacing: '0.06em' }}>ÚLTIMO HISTÓRICO · </span>
        <span style={{ color: 'var(--text3)', fontSize: 10 }}>{latest.author_name} · {new Date(latest.created_at).toLocaleDateString('pt-BR')}</span>
        <div style={{ marginTop: 3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {latest.content}
        </div>
        {logs.length > 1 && (
          <div style={{ marginTop: 4, fontSize: 10, color: 'var(--text3)' }}>+ {logs.length - 1} entrada{logs.length > 2 ? 's' : ''} anterior{logs.length > 2 ? 'es' : ''}</div>
        )}
      </div>
    )
  }

  // Full mode: all logs + input
  return (
    <div>
      {/* Input */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input
          style={{
            flex: 1, background: 'var(--bg3)', border: '1px solid var(--border2)',
            borderRadius: 'var(--radius)', padding: '10px 14px',
            color: 'var(--text)', fontSize: 13, outline: 'none',
          }}
          placeholder="Adicionar entrada ao histórico..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && submit()}
          disabled={saving}
        />
        <button
          onClick={submit}
          disabled={saving || !text.trim()}
          style={{
            background: 'var(--accent)', color: '#fff', border: 'none',
            borderRadius: 'var(--radius)', padding: '0 16px',
            fontWeight: 600, fontSize: 13, cursor: 'pointer',
            opacity: saving || !text.trim() ? 0.5 : 1,
          }}
        >
          {saving ? '...' : '+ Adicionar'}
        </button>
      </div>

      {/* Entries — newest first */}
      {logs.length === 0 ? (
        <div style={{ fontSize: 13, color: 'var(--text3)', textAlign: 'center', padding: '24px 0' }}>
          Nenhuma entrada no histórico ainda.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {logs.map((log, i) => (
            <div key={log.id} style={{
              display: 'flex', gap: 14, paddingBottom: 16,
              paddingLeft: 0,
              position: 'relative',
            }}>
              {/* Timeline line */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: i === 0 ? 'var(--accent-light)' : 'var(--bg4)',
                  border: `2px solid ${i === 0 ? 'var(--accent)' : 'var(--border2)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: i === 0 ? 'var(--accent)' : 'var(--text3)',
                  fontWeight: 700, fontSize: 12, flexShrink: 0,
                }}>
                  {log.author_name.slice(0, 1).toUpperCase()}
                </div>
                {i < logs.length - 1 && (
                  <div style={{ width: 1, flex: 1, minHeight: 16, background: 'var(--border)', marginTop: 4 }} />
                )}
              </div>

              {/* Content */}
              <div style={{ flex: 1, paddingTop: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{log.author_name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                      {new Date(log.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button
                      onClick={() => remove(log.id)}
                      style={{ fontSize: 10, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, padding: '2px 4px' }}
                    >✕</button>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {log.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}