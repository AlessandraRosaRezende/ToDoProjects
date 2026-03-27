import React, { useState, useRef, useEffect } from 'react'
import { Person } from '../types'

interface Props {
  people: Person[]
  selected: string[]
  onChange: (owners: string[]) => void
}

export function OwnersSelect({ people, selected, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = (name: string) =>
    onChange(selected.includes(name) ? selected.filter(n => n !== name) : [...selected, name])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', background: 'var(--bg3)', border: '1px solid var(--border2)',
          borderRadius: 'var(--radius)', padding: '8px 12px',
          cursor: 'pointer', display: 'flex', flexWrap: 'wrap', gap: 6,
          minHeight: 42, alignItems: 'center',
        }}
      >
        {selected.length === 0 ? (
          <span style={{ fontSize: 14, color: 'var(--text3)' }}>Selecionar responsáveis...</span>
        ) : (
          selected.map(name => {
            const person = people.find(p => p.name === name)
            return (
              <span key={name} style={{
                fontSize: 12, fontWeight: 600, padding: '3px 10px',
                background: 'var(--accent-light)', color: 'var(--accent)',
                borderRadius: 999, display: 'flex', alignItems: 'center', gap: 5,
              }}>
                {name}
                <span onClick={e => { e.stopPropagation(); toggle(name) }} style={{ cursor: 'pointer', opacity: 0.7, fontSize: 11 }}>✕</span>
              </span>
            )
          })
        )}
        <span style={{ marginLeft: 'auto', color: 'var(--text3)', fontSize: 12 }}>▾</span>
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 200,
          background: 'var(--bg3)', border: '1px solid var(--border2)',
          borderRadius: 'var(--radius)', overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)', maxHeight: 240, overflowY: 'auto',
        }}>
          {people.length === 0 ? (
            <div style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text3)' }}>
              Nenhuma pessoa cadastrada. Adicione em "👥 Pessoas".
            </div>
          ) : (
            people.map(p => {
              const checked = selected.includes(p.name)
              return (
                <div key={p.id} onClick={() => toggle(p.name)} style={{
                  padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                  background: checked ? 'var(--accent-light)' : 'transparent',
                  borderBottom: '1px solid var(--border)',
                }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                    border: `2px solid ${checked ? 'var(--accent)' : 'var(--border2)'}`,
                    background: checked ? 'var(--accent)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, color: '#fff',
                  }}>
                    {checked && '✓'}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{p.udn_role}</div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}