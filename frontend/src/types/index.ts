export type ProjectStatus =
  | '🟢 EM DIA'
  | '🔵 AGUARDANDO'
  | '🟡 RETOMANDO'
  | '🔴 CRÍTICO'
  | '⚪ SUSPENSO'

export interface Project {
  id: string
  project: string
  subproduct: string
  status: ProjectStatus
  next_steps: string
  observations: string
  deadline: string
  owners: string[]
  created_by: string
  created_at: string
  updated_at: string
}

export interface ProjectDetail extends Project {
  comments: Comment[]
  history: HistoryEntry[]
  logs: ProjectLog[]
}

export interface Person {
  id: string
  name: string
  email: string
  udn_role: string
  created_at: string
}

export interface ProjectLog {
  id: string
  project_id: string
  author_name: string
  content: string
  created_at: string
}

export interface Comment {
  id: string
  project_id: string
  author_name: string
  author_email: string
  content: string
  created_at: string
}

export interface HistoryEntry {
  id: string
  project_id: string
  changed_by: string
  field_name: string
  old_value: string | null
  new_value: string | null
  created_at: string
}

export const STATUS_CONFIG: Record<ProjectStatus, {
  label: string; color: string; bg: string; dot: string
}> = {
  '🟢 EM DIA':     { label: 'EM DIA',     color: '#16a34a', bg: 'rgba(22,163,74,0.14)',   dot: '#22c55e' },
  '🔵 AGUARDANDO': { label: 'AGUARDANDO', color: '#2563eb', bg: 'rgba(37,99,235,0.14)',   dot: '#3b82f6' },
  '🟡 RETOMANDO':  { label: 'RETOMANDO',  color: '#d97706', bg: 'rgba(217,119,6,0.14)',   dot: '#f59e0b' },
  '🔴 CRÍTICO':    { label: 'CRÍTICO',    color: '#dc2626', bg: 'rgba(220,38,38,0.14)',   dot: '#ef4444' },
  '⚪ SUSPENSO':   { label: 'SUSPENSO',   color: '#6b7280', bg: 'rgba(107,114,128,0.14)', dot: '#9ca3af' },
}

export const FIELD_LABELS: Record<string, string> = {
  project: 'Projeto',
  subproduct: 'Subproduto',
  status: 'Status',
  next_steps: 'Próximos Passos',
  observations: 'Observações',
  deadline: 'Prazo',
  owners: 'Responsáveis',
}