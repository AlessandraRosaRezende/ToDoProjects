# 📋 Follow-up System

Sistema de gestão de follow-up de projetos com dashboard compartilhado, histórico de alterações, comentários e perguntas respondidas por IA.

## Stack

| Camada | Tecnologia | Hospedagem gratuita |
|--------|-----------|---------------------|
| Banco  | PostgreSQL (Supabase) | supabase.com |
| Backend | Node.js + Express + TypeScript | render.com |
| Frontend | React + Vite + TypeScript | vercel.com |

---

## 🔑 Variáveis de ambiente

### Backend (`backend/.env`)
```
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
FRONTEND_URL=http://localhost:5173
PORT=3001
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:3001
```

---

## 🚀 Rodando localmente

```bash
# Terminal 1 — Backend
cd backend
cp .env.example .env        # preencha com suas credenciais
npm install
npm run dev                  # http://localhost:3001

# Terminal 2 — Frontend
cd frontend
cp .env.example .env         # ajuste VITE_API_URL se necessário
npm install
npm run dev                  # http://localhost:5173
```

---

## 🎯 Funcionalidades

- ✅ Dashboard com cards por projeto, filtro por status e busca
- ✅ Indicador ❓ nos cards que têm perguntas respondidas pela IA
- ✅ Criar, editar e excluir projetos
- ✅ Página de detalhes com 4 abas: Detalhes · Perguntas IA · Comentários · Histórico
- ✅ IA responde perguntas contextuais sobre cada projeto (Claude Sonnet)
- ✅ Comentários por projeto
- ✅ Histórico automático de todas as alterações (quem mudou o quê e quando)
- ✅ Identificação de usuário salva no localStorage

---

## 📁 Estrutura

```
followup-system/
├── supabase-schema.sql       # Execute no Supabase SQL Editor
├── backend/
│   ├── src/
│   │   ├── index.ts          # Servidor Express
│   │   ├── lib/supabase.ts   # Cliente Supabase
│   │   ├── routes/
│   │   │   ├── projects.ts   # CRUD projetos + histórico
│   │   │   └── comments.ts   # CRUD comentários
│   │   └── types/index.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Dashboard.tsx     # Lista de projetos
    │   │   └── ProjectDetail.tsx # Detalhes + abas
    │   ├── components/
    │   │   ├── ProjectCard.tsx   # Card do dashboard
    │   │   ├── ProjectForm.tsx   # Modal criar/editar
    │   │   ├── AskAI.tsx         # Perguntas à IA
    │   │   ├── CommentsSection.tsx
    │   │   ├── HistorySection.tsx
    │   │   ├── StatusBadge.tsx
    │   │   └── UserModal.tsx
    │   ├── hooks/useProjects.ts  # API calls
    │   ├── lib/
    │   │   ├── api.ts            # Axios client
    │   │   └── UserContext.tsx   # Nome/email do usuário
    │   └── types/index.ts
    ├── .env.example
    ├── package.json
    └── vite.config.ts
```
