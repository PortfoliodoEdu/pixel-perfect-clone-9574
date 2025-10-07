# 🚀 Guia de Migração: Lovable Cloud → Supabase Auto-hospedado

## 📋 Pré-requisitos

- [ ] Conta no Supabase (https://supabase.com)
- [ ] Node.js instalado (v18+)
- [ ] Supabase CLI instalado
- [ ] Acesso ao projeto atual no Lovable Cloud
- [ ] Backup de todos os dados importantes

---

## 🔧 Instalação do Supabase CLI

```bash
# Instalar globalmente
npm install -g supabase

# Verificar instalação
supabase --version
```

---

## 📦 Passo 1: Criar Projeto Supabase

1. Acesse https://supabase.com/dashboard
2. Clique em "New Project"
3. Configure:
   - **Nome do projeto**: Prime Capital
   - **Database Password**: [Anote esta senha!]
   - **Região**: Escolha a mais próxima dos usuários
4. Aguarde a criação (~2 minutos)

---

## 🔗 Passo 2: Conectar ao Projeto

```bash
# Na pasta raiz do projeto
cd seu-projeto-prime-capital

# Inicializar configuração do Supabase (se necessário)
supabase init

# Conectar ao projeto criado
supabase link --project-ref SEU_PROJECT_ID
```

**Onde encontrar o Project ID:**
- Dashboard Supabase → Settings → General → Reference ID

---

## 🗄️ Passo 3: Aplicar Migrações do Banco

```bash
# Verificar migrações disponíveis
ls supabase/migrations/

# Aplicar TODAS as migrações
supabase db push

# Verificar se foi aplicado corretamente
supabase db diff
```

**⚠️ IMPORTANTE:** Suas migrações estão em:
- `supabase/migrations/` (todas numeradas)
- Elas contêm:
  - Tabelas (profiles, solicitacoes, planos, etc.)
  - RLS Policies (segurança)
  - Functions (has_role, triggers)
  - Constraints e índices

---

## 📤 Passo 4: Migrar Dados Existentes

### 4.1. Exportar dados do Lovable Cloud

**Opção A: Via SQL (recomendado)**
```bash
# Conectar ao Lovable Cloud temporariamente
SUPABASE_URL=https://tqsshqhmzcwchdwenfqi.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Exportar dados (use ferramenta de backup ou script)
# Exemplo de tabelas para exportar:
- profiles
- user_roles
- planos
- planos_adquiridos
- solicitacoes
- historico_observacoes
- user_documents
```

**Opção B: Via código**
Crie um script Node.js para exportar e importar dados:

```javascript
// export-data.js
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const oldSupabase = createClient(OLD_URL, OLD_KEY);
const newSupabase = createClient(NEW_URL, NEW_SERVICE_ROLE_KEY);

async function exportData() {
  const tables = ['profiles', 'user_roles', 'planos', 'planos_adquiridos', 
                  'solicitacoes', 'historico_observacoes', 'user_documents'];
  
  for (const table of tables) {
    const { data } = await oldSupabase.from(table).select('*');
    fs.writeFileSync(`backup_${table}.json`, JSON.stringify(data, null, 2));
    console.log(`✅ Exported ${table}: ${data.length} rows`);
  }
}

exportData();
```

### 4.2. Importar dados no novo Supabase

```javascript
// import-data.js
async function importData() {
  const tables = ['profiles', 'user_roles', 'planos', 'planos_adquiridos', 
                  'solicitacoes', 'historico_observacoes', 'user_documents'];
  
  for (const table of tables) {
    const data = JSON.parse(fs.readFileSync(`backup_${table}.json`));
    const { error } = await newSupabase.from(table).insert(data);
    if (error) console.error(`❌ Error importing ${table}:`, error);
    else console.log(`✅ Imported ${table}: ${data.length} rows`);
  }
}

importData();
```

---

## 📁 Passo 5: Recriar Storage Buckets

```sql
-- No SQL Editor do Supabase Dashboard, execute:

-- 1. Criar buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('documentos', 'documentos', false),
  ('fotos-perfil', 'fotos-perfil', true);

-- 2. Aplicar políticas RLS do bucket 'documentos'
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documentos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documentos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documentos'
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 3. Aplicar políticas RLS do bucket 'fotos-perfil'
CREATE POLICY "Anyone can view profile photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'fotos-perfil');

CREATE POLICY "Users can upload their own profile photo"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'fotos-perfil'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own profile photo"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'fotos-perfil'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 5.1. Migrar arquivos do storage

```javascript
// migrate-storage.js
async function migrateStorage() {
  const buckets = ['documentos', 'fotos-perfil'];
  
  for (const bucket of buckets) {
    // Listar arquivos antigos
    const { data: files } = await oldSupabase.storage.from(bucket).list();
    
    for (const file of files) {
      // Baixar arquivo
      const { data: blob } = await oldSupabase.storage
        .from(bucket)
        .download(file.name);
      
      // Upload no novo bucket
      await newSupabase.storage
        .from(bucket)
        .upload(file.name, blob);
      
      console.log(`✅ Migrated ${bucket}/${file.name}`);
    }
  }
}
```

---

## ⚡ Passo 6: Deploy das Edge Functions

```bash
# Fazer deploy de cada função
supabase functions deploy log-activity --no-verify-jwt
supabase functions deploy audit-log --no-verify-jwt
supabase functions deploy setup-admin --no-verify-jwt

# Verificar se foram deployadas
supabase functions list
```

---

## 🔐 Passo 7: Configurar Secrets

```bash
# Adicionar secrets necessários para as Edge Functions
supabase secrets set SUPABASE_URL=https://SEU_PROJETO.supabase.co
supabase secrets set SUPABASE_ANON_KEY=sua_anon_key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
supabase secrets set SUPABASE_DB_URL=sua_db_url

# Verificar secrets configurados
supabase secrets list
```

**Onde encontrar as keys:**
- Dashboard → Settings → API → Project URL
- Dashboard → Settings → API → anon/public key
- Dashboard → Settings → API → service_role key (⚠️ mantenha em segredo!)

---

## 🌐 Passo 8: Atualizar Código da Aplicação

### 8.1. Atualizar variáveis de ambiente

Crie um arquivo `.env.local` (ou configure no seu serviço de hospedagem):

```env
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua_anon_key_aqui
VITE_SUPABASE_PROJECT_ID=seu_project_id
```

### 8.2. Verificar configuração do cliente

O arquivo `src/integrations/supabase/client.ts` já está configurado para ler essas variáveis:

```typescript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
```

**✅ Não precisa alterar código!** Apenas as variáveis de ambiente.

---

## 🔒 Passo 9: Configurar Autenticação

### 9.1. Configurar URLs de redirecionamento

Dashboard → Authentication → URL Configuration:

```
Site URL: https://seu-dominio.com
Redirect URLs: 
  - https://seu-dominio.com
  - http://localhost:5173 (para desenvolvimento)
```

### 9.2. Habilitar proteção de senha vazada (recomendado)

Dashboard → Authentication → Policies → Enable "Leaked Password Protection"

### 9.3. Configurar Email Templates (opcional)

Dashboard → Authentication → Email Templates

Personalize:
- Confirm Signup
- Reset Password
- Magic Link

---

## 🧪 Passo 10: Testar a Migração

### 10.1. Teste local

```bash
# Iniciar Supabase localmente
supabase start

# Aplicar migrações localmente
supabase db reset

# Rodar aplicação
npm run dev
```

### 10.2. Checklist de testes

- [ ] Login funciona
- [ ] Signup funciona
- [ ] Dashboard carrega corretamente
- [ ] Traders conseguem ver seus planos
- [ ] Traders conseguem fazer solicitações (saque, quinzenal, segunda chance)
- [ ] Admin consegue ver todas as solicitações
- [ ] Admin consegue atualizar timeline
- [ ] Admin consegue gerenciar traders
- [ ] Upload de documentos funciona
- [ ] Upload de foto de perfil funciona
- [ ] Linha do tempo aparece corretamente
- [ ] Notificações funcionam

### 10.3. Verificar segurança

```bash
# Rodar linter de segurança do Supabase
supabase db lint

# Verificar RLS policies
supabase db diff
```

---

## 🚀 Passo 11: Deploy em Produção

### 11.1. Build da aplicação

```bash
# Criar build de produção
npm run build

# Testar build localmente
npm run preview
```

### 11.2. Deploy (escolha uma plataforma)

**Vercel:**
```bash
vercel --prod
```

**Netlify:**
```bash
netlify deploy --prod
```

**Outras opções:**
- Cloudflare Pages
- AWS Amplify
- Railway
- Render

### 11.3. Configurar variáveis de ambiente no host

No painel do seu serviço de hospedagem, adicione:
```
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua_anon_key
VITE_SUPABASE_PROJECT_ID=seu_project_id
```

---

## 📊 Passo 12: Monitoramento Pós-Migração

### 12.1. Verificar logs

```bash
# Ver logs do banco de dados
supabase db logs

# Ver logs das Edge Functions
supabase functions logs log-activity
supabase functions logs audit-log
```

### 12.2. Monitorar métricas

Dashboard → Reports:
- Database usage
- Auth users
- API requests
- Storage usage

---

## 🔄 Rollback (se necessário)

Se algo der errado, você pode voltar temporariamente ao Lovable Cloud:

```env
# .env.local
VITE_SUPABASE_URL=https://tqsshqhmzcwchdwenfqi.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ⚠️ Troubleshooting Comum

### Problema: RLS policies bloqueando acesso

**Solução:**
```sql
-- Verificar policies ativas
SELECT * FROM pg_policies WHERE tablename = 'nome_da_tabela';

-- Desabilitar temporariamente para debug (NÃO EM PRODUÇÃO!)
ALTER TABLE nome_da_tabela DISABLE ROW LEVEL SECURITY;
```

### Problema: Edge Functions não funcionam

**Solução:**
```bash
# Verificar logs
supabase functions logs nome-funcao

# Testar localmente
supabase functions serve

# Redeploy
supabase functions deploy nome-funcao --no-verify-jwt
```

### Problema: Auth redirecionando errado

**Solução:**
- Verificar Site URL e Redirect URLs no Dashboard
- Verificar `emailRedirectTo` no código de signup
- Limpar cookies e localStorage do navegador

### Problema: Storage retorna 404

**Solução:**
```sql
-- Verificar se buckets existem
SELECT * FROM storage.buckets;

-- Verificar policies do storage
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
```

---

## 📝 Checklist Final

Antes de considerar a migração completa:

- [ ] Todas as tabelas migradas com dados
- [ ] RLS policies funcionando
- [ ] Edge Functions deployadas
- [ ] Storage buckets criados com policies
- [ ] Arquivos migrados
- [ ] Auth configurado (URLs, templates)
- [ ] Variáveis de ambiente atualizadas
- [ ] Testes completos realizados
- [ ] Aplicação deployada em produção
- [ ] Monitoramento configurado
- [ ] Backup do Lovable Cloud mantido (por 30 dias)

---

## 🆘 Suporte

**Documentação Supabase:**
- https://supabase.com/docs

**Comunidade:**
- Discord: https://discord.supabase.com
- GitHub: https://github.com/supabase/supabase

**Problemas com a migração?**
- Verifique os logs: `supabase db logs`
- Teste localmente: `supabase start`
- Revise as RLS policies

---

## 💡 Dicas Finais

1. **Faça a migração em etapas** - Não tente fazer tudo de uma vez
2. **Teste localmente primeiro** - Use `supabase start`
3. **Mantenha backup** - Não delete dados do Lovable Cloud imediatamente
4. **Documente mudanças** - Anote o que funcionou/não funcionou
5. **Use staging** - Teste em ambiente de staging antes de produção

---

## 🔐 Passo EXTRA: Configurar Backup e Restauração (CRÍTICO!)

**⚠️ MUITO IMPORTANTE:** Mesmo com backup da Hostinger, você PRECISA de backup próprio do PostgreSQL!

### Por que?

- ✅ Snapshot da Hostinger = servidor inteiro (pode restaurar banco corrompido)
- ✅ Backup PostgreSQL = dados transacionais e consistentes
- ✅ Redundância: Local + Nuvem + Hostinger = 3 camadas de proteção

### Scripts Prontos

Todos os scripts de backup estão em `scripts/`:

```bash
scripts/
├── backup-database.sh      # Backup diário do PostgreSQL
├── backup-storage.sh        # Backup dos arquivos (fotos, docs)
├── backup-to-cloud.sh       # Upload para Google Drive/Dropbox/S3
├── restore-database.sh      # Restaurar banco de dados
├── test-restore.sh          # Testar se backup funciona
└── README.md                # Documentação completa
```

### Configuração Rápida (5 minutos)

**1. Preparar ambiente**
```bash
# No servidor Hostinger via SSH
sudo mkdir -p /home/backups/supabase
sudo chown $USER:$USER /home/backups/supabase

# Copiar scripts
sudo cp scripts/*.sh /usr/local/bin/
sudo chmod +x /usr/local/bin/*.sh
```

**2. Configurar senha PostgreSQL**
```bash
echo "localhost:5432:*:postgres:SUA_SENHA" > ~/.pgpass
chmod 600 ~/.pgpass
```

**3. Automatizar com Cron**
```bash
crontab -e
```

Adicionar:
```bash
# Backup diário às 2h
0 2 * * * /usr/local/bin/backup-database.sh >> /home/backups/supabase/cron.log 2>&1

# Backup storage às 3h
0 3 * * * /usr/local/bin/backup-storage.sh >> /home/backups/supabase/cron.log 2>&1

# Upload nuvem às 4h
0 4 * * * /usr/local/bin/backup-to-cloud.sh >> /home/backups/supabase/cron.log 2>&1

# Teste mensal (dia 1 às 5h)
0 5 1 * * /usr/local/bin/test-restore.sh >> /home/backups/supabase/cron.log 2>&1
```

**4. Configurar upload para nuvem (opcional mas recomendado)**
```bash
# Instalar Rclone
curl https://rclone.org/install.sh | sudo bash

# Configurar Google Drive, Dropbox, S3, etc
rclone config
```

### Teste Manual

```bash
# Testar backup
/usr/local/bin/backup-database.sh

# Testar restauração (sem afetar produção)
/usr/local/bin/test-restore.sh

# Ver logs
tail -f /home/backups/supabase/backup.log
```

### Monitoramento

**Verificar se backups estão funcionando:**
```bash
# Listar backups
ls -lh /home/backups/supabase/

# Ver últimos logs
tail -20 /home/backups/supabase/backup.log

# Verificar espaço
df -h /home/backups
```

### O que cada backup faz?

| Tipo | O que salva | Retenção | Tamanho estimado |
|------|-------------|----------|------------------|
| PostgreSQL | Tabelas, RLS, functions | 7 dias | ~10-50MB |
| Storage | Fotos, documentos | 7 dias | Varia |
| Nuvem | Cópia de tudo | Ilimitado | Mesmo |
| Hostinger | Servidor inteiro | Conforme plano | GB |

### Restaurar em Caso de Desastre

```bash
# 1. Listar backups disponíveis
ls -lh /home/backups/supabase/supabase_db_*.backup.gz

# 2. Restaurar (CUIDADO: substitui dados!)
sudo /usr/local/bin/restore-database.sh /home/backups/supabase/supabase_db_20250107.backup.gz

# 3. Verificar se funcionou
psql -U postgres -c "SELECT COUNT(*) FROM profiles;"
```

### Checklist de Segurança de Backup

- [ ] Backup automático diário configurado
- [ ] Upload para nuvem funcionando
- [ ] Teste de restauração mensal agendado
- [ ] Logs sendo monitorados
- [ ] Espaço em disco monitorado (não encher!)
- [ ] Múltiplas cópias (local + nuvem + hostinger)
- [ ] Documentação de como restaurar
- [ ] Senha do PostgreSQL segura no `.pgpass`

### 📚 Documentação Completa

Veja `scripts/README.md` para:
- ✅ Instruções detalhadas de cada script
- ✅ Troubleshooting comum
- ✅ Configuração de alertas
- ✅ Boas práticas
- ✅ Opções de nuvem (Google Drive, S3, Dropbox, etc)

---

**Última atualização:** 2025-10-07  
**Versão:** 1.1 (+ Seção de Backup)  
**Projeto:** Prime Capital - Sistema de Trading
