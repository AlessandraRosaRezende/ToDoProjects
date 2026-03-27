import { useState, useCallback, useEffect } from 'react'
import { Project, ProjectStatus, STATUS_CONFIG, ProjectLog } from '../types'
import { useProjects, deleteProject, usePeople } from '../hooks/useProjects'
import { ProjectCard } from '../components/ProjectCard'
import { ProjectForm } from '../components/ProjectForm'
import { PeopleManager } from '../components/PeopleManager'
import { UserModal } from '../components/UserModal'
import api from '../lib/api'

const STATUSES = Object.keys(STATUS_CONFIG) as ProjectStatus[]

export function Dashboard() {
  const [status, setStatus] = useState<ProjectStatus | ''>('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [peopleOpen, setPeopleOpen] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [logsMap, setLogsMap] = useState<Record<string, ProjectLog[]>>({})

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const { projects, loading, error, refetch } = useProjects({
    status: status || undefined,
    search: debouncedSearch || undefined,
  })
  const { people, refetch: refetchPeople } = usePeople()

  // Fetch logs for all projects (for preview on cards)
  useEffect(() => {
    if (!projects.length) return
    const run = async () => {
      const results: Record<string, ProjectLog[]> = {}
      await Promise.all(
        projects.map(async p => {
          try {
            const res = await api.get(`/api/project-logs/${p.id}`)
            results[p.id] = res.data.data ?? []
          } catch { results[p.id] = [] }
        })
      )
      setLogsMap(results)
    }
    run()
  }, [projects])

  const handleDelete = useCallback(async (id: string) => {
    await deleteProject(id); refetch()
  }, [refetch])

  const handleEdit = useCallback((p: Project) => {
    setEditProject(p); setFormOpen(true)
  }, [])

  const statusCounts = STATUSES.reduce((acc, s) => {
    acc[s] = projects.filter(p => p.status === s).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <UserModal />

      <header style={{
        borderBottom: '1px solid var(--border)', padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 60, background: 'var(--bg2)', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.02em', color: 'var(--text)' }}>◈ Follow-up</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', padding: '3px 8px', background: 'var(--bg4)', borderRadius: 6 }}>
            {loading ? '...' : `${projects.length} projetos`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setPeopleOpen(true)} style={{
            background: 'var(--bg4)', color: 'var(--text2)', border: '1px solid var(--border2)',
            borderRadius: 'var(--radius)', padding: '8px 14px', fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}>
            👥 Pessoas {people.length > 0 && <span style={{ fontSize: 11, opacity: 0.6 }}>({people.length})</span>}
          </button>
          <button onClick={() => { setEditProject(null); setFormOpen(true) }} style={{
            background: 'var(--accent)', color: '#fff', border: 'none',
            borderRadius: 'var(--radius)', padding: '8px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}>
            + Novo projeto
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px' }}>
        {/* Status pills */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          <div onClick={() => setStatus('')} style={{
            padding: '7px 14px', borderRadius: 'var(--radius)', cursor: 'pointer',
            background: status === '' ? 'var(--accent-light)' : 'var(--bg2)',
            border: `1px solid ${status === '' ? 'var(--accent)' : 'var(--border)'}`,
            fontSize: 12, fontWeight: 600, color: status === '' ? 'var(--accent)' : 'var(--text2)',
          }}>Todos ({projects.length})</div>
          {STATUSES.map(s => {
            const cfg = STATUS_CONFIG[s]; const active = status === s
            return (
              <div key={s} onClick={() => setStatus(active ? '' : s)} style={{
                padding: '7px 14px', borderRadius: 'var(--radius)', cursor: 'pointer',
                background: active ? cfg.bg : 'var(--bg2)',
                border: `1px solid ${active ? cfg.dot : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', gap: 7,
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: active ? cfg.color : 'var(--text2)' }}>{cfg.label}</span>
                <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 999, padding: '1px 7px', background: active ? cfg.dot : 'var(--bg4)', color: active ? '#fff' : 'var(--text3)' }}>
                  {statusCounts[s] ?? 0}
                </span>
              </div>
            )
          })}
        </div>

        {/* Search */}
        <div style={{ marginBottom: 24, position: 'relative' }}>
          <input
            placeholder="🔍  Buscar por projeto, subproduto ou observação..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '11px 16px', color: 'var(--text)', fontSize: 14, outline: 'none' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', fontSize: 16, background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
          )}
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text3)' }}>Carregando projetos...</div>}
        {!loading && error && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ color: 'var(--red)', marginBottom: 8 }}>{error}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>Verifique se o backend está rodando: <code style={{ background: 'var(--bg3)', padding: '2px 6px', borderRadius: 4 }}>cd backend && npm run dev</code></div>
          </div>
        )}
        {!loading && !error && projects.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text3)' }}>
            {search || status ? 'Nenhum projeto encontrado.' : 'Nenhum projeto ainda. Clique em "+ Novo projeto" para começar!'}
          </div>
        )}
        {!loading && !error && projects.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 14 }}>
            {projects.map(p => (
              <ProjectCard
                key={p.id} project={p}
                logs={logsMap[p.id] ?? []}
                people={people}
                onEdit={handleEdit} onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {formOpen && <ProjectForm project={editProject} onClose={() => { setFormOpen(false); setEditProject(null) }} onSaved={refetch} />}
      {peopleOpen && <PeopleManager people={people} onClose={() => setPeopleOpen(false)} onChanged={refetchPeople} />}
    </div>
  )
}