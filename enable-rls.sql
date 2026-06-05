-- 3. Configurar RLS (Row Level Security) (dashboard)
-- Execute este SQL no Supabase Dashboard (SQL Editor)

-- 1. admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins podem ver seus próprios dados" ON admin_users FOR SELECT USING (auth.uid() = id);

-- 2. campaigns
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins podem ver suas próprias campanhas" ON campaigns FOR SELECT USING (auth.uid() = admin_id);

-- 3. ad_sets
ALTER TABLE ad_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins podem ver seus próprios ad_sets" ON ad_sets FOR SELECT USING (auth.uid() = admin_id);

-- 4. ads
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins podem ver seus próprios ads" ON ads FOR SELECT USING (auth.uid() = admin_id);

-- 5. ads_metrics
ALTER TABLE ads_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins podem ver suas próprias métricas" ON ads_metrics FOR SELECT USING (auth.uid() = admin_id);

-- 6. meta_tokens
ALTER TABLE meta_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins podem gerenciar seus próprios tokens" ON meta_tokens FOR ALL USING (auth.uid() = admin_id);

-- Nota: Para o supabase.auth.signInWithPassword() funcionar, 
-- você precisa criar o usuário no painel "Authentication" do Supabase,
-- e depois inserir o MESMO ID na tabela admin_users!
