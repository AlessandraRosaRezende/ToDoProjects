import { useState, useEffect, useCallback } from 'react'
import api from '../lib/api'
import { Project, ProjectDetail, ProjectStatus, Person, ProjectLog } from '../types'

interface Filters {
  status?: ProjectStatus
  search?: string
}

export function useProjects(filters: Filters = {}) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const params = new URLSearchParams()
      if (filters.status) params.set('status', filters.status)
      if (filters.search) params.set('search', filters.search)
      const res = await api.get(`/api/projects?${params.toString()}`)
      setProjects(res.data.data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar projetos. Verifique se o backend está rodando.')
    } finally {
      setLoading(false)
    }
  }, [filters.status, filters.search])

  useEffect(() => { fetchProjects() }, [fetchProjects])
  return { projects, loading, error, refetch: fetchProjects }
}

export function useProject(id: string | undefined) {
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProject = useCallback(async () => {
    if (!id) return
    setLoading(true); setError(null)
    try {
      const [projectRes, logsRes] = await Promise.all([
        api.get(`/api/projects/${id}`),
        api.get(`/api/project-logs/${id}`),
      ])
      setProject({ ...projectRes.data.data, logs: logsRes.data.data ?? [] })
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar projeto')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchProject() }, [fetchProject])
  return { project, loading, error, refetch: fetchProject }
}

export function usePeople() {
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPeople = useCallback(async () => {
    try {
      const res = await api.get('/api/people')
      setPeople(res.data.data)
    } catch { setPeople([]) } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchPeople() }, [fetchPeople])
  return { people, loading, refetch: fetchPeople }
}

export async function createProject(data: Omit<Project, 'id' | 'created_at' | 'updated_at'>) {
  const res = await api.post('/api/projects', data)
  return res.data.data as Project
}

export async function updateProject(id: string, data: Partial<Project> & { updated_by: string }) {
  const res = await api.put(`/api/projects/${id}`, data)
  return res.data.data as Project
}

export async function deleteProject(id: string) {
  await api.delete(`/api/projects/${id}`)
}

export async function addComment(data: {
  project_id: string; author_name: string; author_email: string; content: string
}) {
  const res = await api.post('/api/comments', data)
  return res.data.data
}

export async function createPerson(data: { name: string; email: string; udn_role: string }) {
  const res = await api.post('/api/people', data)
  return res.data.data as Person
}

export async function updatePerson(id: string, data: Partial<Person>) {
  const res = await api.put(`/api/people/${id}`, data)
  return res.data.data as Person
}

export async function deletePerson(id: string) {
  await api.delete(`/api/people/${id}`)
}

export async function addProjectLog(data: {
  project_id: string; author_name: string; content: string
}) {
  const res = await api.post('/api/project-logs', data)
  return res.data.data as ProjectLog
}

export async function deleteProjectLog(id: string) {
  await api.delete(`/api/project-logs/${id}`)
}