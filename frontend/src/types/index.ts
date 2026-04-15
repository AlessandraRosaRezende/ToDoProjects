export type ProjectStatus =
  | '🟢 EM DIA'
  | '🔵 AGUARDANDO'
  | '🟡 RETOMANDO'
  | '🔴 CRÍTICO'
  | '⚪ SUSPENSO'
  | '🟣 CONCLUÍDO'

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
 '🟢 EM DIA':     { label: 'PREVISTO',   color: '#16a34a', bg: 'rgba(22,163,74,0.14)',    dot: '#22c55e' },
 '🔵 AGUARDANDO': { label: 'AGUARDANDO', color: '#0369a1', bg: 'rgba(14,165,233,0.14)',   dot: '#38bdf8' },
 '🟡 RETOMANDO':  { label: 'RETOMANDO',  color: '#a16207', bg: 'rgba(234,179,8,0.14)',    dot: '#facc15' },
 '🔴 CRÍTICO':    { label: 'CRÍTICO',    color: '#b91c1c', bg: 'rgba(220,38,38,0.14)',    dot: '#ef4444' },
 '⚪ SUSPENSO':   { label: 'SUSPENSO',   color: '#4b5563', bg: 'rgba(107,114,128,0.14)', dot: '#9ca3af' },
 '🟣 CONCLUÍDO':  { label: 'CONCLUÍDO',  color: '#7e22ce', bg: 'rgba(126,34,206,0.14)',   dot: '#a855f7' },
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