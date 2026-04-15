export type ProjectStatus =
  | 'EM DIA'
  | 'AGUARDANDO'
  | 'RETOMANDO'
  | 'CRÍTICO'
  | 'SUSPENSO'
  | 'CONCLUÍDO';

export interface Project {
  id: string;
  project: string;
  subproduct: string;
  status: ProjectStatus;
  next_steps: string;
  observations: string;
  deadline: string;
  owners: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Person {
  id: string;
  name: string;
  email: string;
  udn_role: string;
  created_at: string;
}

export interface ProjectLog {
  id: string;
  project_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export interface Comment {
  id: string;
  project_id: string;
  author_name: string;
  author_email: string;
  content: string;
  created_at: string;
}

export interface HistoryEntry {
  id: string;
  project_id: string;
  changed_by: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

export interface CreateProjectDto {
  project: string;
  subproduct: string;
  status: ProjectStatus;
  next_steps: string;
  observations: string;
  deadline: string;
  owners: string[];
  created_by: string;
}

export interface UpdateProjectDto extends Partial<Omit<CreateProjectDto, 'created_by'>> {
  updated_by: string;
}

export interface CreateCommentDto {
  project_id: string;
  author_name: string;
  author_email: string;
  content: string;
}
