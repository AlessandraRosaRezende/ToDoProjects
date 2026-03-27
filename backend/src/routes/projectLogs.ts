import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

// GET logs for a project (newest first)
router.get('/:projectId', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { data, error } = await supabase
      .from('project_logs')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST add log entry
router.post('/', async (req: Request, res: Response) => {
  try {
    const { project_id, author_name, content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Conteúdo obrigatório' });
    const { data, error } = await supabase
      .from('project_logs')
      .insert([{ project_id, author_name, content: content.trim() }])
      .select().single();
    if (error) throw error;
    res.status(201).json({ data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE log entry
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('project_logs').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Entrada removida' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;