import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

router.get('/', async (_req, res: Response) => {
  try {
    const { data, error } = await supabase.from('people').select('*').order('name');
    if (error) throw error;
    res.json({ data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, udn_role } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Nome obrigatório' });
    if (!udn_role?.trim()) return res.status(400).json({ error: 'UDN/Cargo/Área obrigatório' });
    const { data, error } = await supabase
      .from('people')
      .insert([{ name: name.trim(), email: email?.trim() ?? '', udn_role: udn_role.trim() }])
      .select().single();
    if (error) throw error;
    res.status(201).json({ data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, udn_role } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Nome obrigatório' });
    if (!udn_role?.trim()) return res.status(400).json({ error: 'UDN/Cargo/Área obrigatório' });
    const { data, error } = await supabase
      .from('people')
      .update({ name: name.trim(), email: email?.trim() ?? '', udn_role: udn_role.trim() })
      .eq('id', id).select().single();
    if (error) throw error;
    res.json({ data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('people').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Pessoa removida' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;