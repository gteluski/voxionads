'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface NotificationItem {
  title: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  time: string;
}

export default function NotificationsSection() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchRealData() {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const adminId = user.id;
        const list: NotificationItem[] = [];

        // 1. Buscar os tokens de ativos reais cadastrados
        const { data: tokenData } = await supabase
          .from('meta_tokens')
          .select('account_name, account_id, updated_at')
          .eq('admin_id', adminId)
          .order('updated_at', { ascending: false })
          .limit(1);

        if (tokenData && tokenData.length > 0) {
          const t = tokenData[0];
          list.push({
            title: 'Ativo Conectado',
            type: 'success',
            message: `Conta de anúncios "${t.account_name}" (${t.account_id}) está ativa.`,
            time: new Date(t.updated_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          });
        } else {
          list.push({
            title: 'Configuração',
            type: 'info',
            message: 'Nenhuma conta Meta conectada. Vá em configurações para vincular sua conta.',
            time: 'Aviso',
          });
        }

        // 2. Buscar logs de sincronização reais (sync_log)
        const { data: syncLogs } = await supabase
          .from('sync_log')
          .select('status, message, synced_at')
          .eq('admin_id', adminId)
          .order('synced_at', { ascending: false })
          .limit(3);

        if (syncLogs && syncLogs.length > 0) {
          syncLogs.forEach((log) => {
            list.push({
              title: log.status === 'SUCCESS' ? 'Sincronização OK' : 'Falha no Sync',
              type: log.status === 'SUCCESS' ? 'success' : 'error',
              message: log.message || 'Sincronização de campanhas concluída.',
              time: new Date(log.synced_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            });
          });
        }

        // 3. Buscar relatórios/alertas de IA críticos (reports)
        const { data: reportsData } = await supabase
          .from('reports')
          .select('overall_health, main_issues, generated_at')
          .eq('admin_id', adminId)
          .in('overall_health', ['warning', 'critical'])
          .order('generated_at', { ascending: false })
          .limit(2);

        if (reportsData && reportsData.length > 0) {
          reportsData.forEach((rep) => {
            if (rep.main_issues && rep.main_issues.length > 0) {
              list.push({
                title: rep.overall_health === 'critical' ? 'Alerta Crítico' : 'Alerta de Otimização',
                type: rep.overall_health === 'critical' ? 'error' : 'warning',
                message: rep.main_issues[0],
                time: new Date(rep.generated_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
              });
            }
          });
        }

        // Ordenação final: mais recentes primeiro (estimado por ordem de inserção)
        setNotifications(list.slice(0, 5));
      } catch (err) {
        console.error('Erro ao buscar notificações do Supabase:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRealData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="bg-[#1f1915] border border-[rgba(216,197,182,0.2)] rounded-2xl p-6 flex items-center justify-center min-h-[200px]">
        <div className="animate-spin text-[#f18535] text-2xl">⏳</div>
      </div>
    );
  }

  return (
    <div className="bg-[#1f1915] border border-[rgba(216,197,182,0.2)] rounded-2xl p-6 flex flex-col justify-between h-full">
      <div>
        <h3 className="text-[#f18535] text-lg font-bold mb-4 flex items-center gap-2">
          🔔 Notificações e Alertas Reais
        </h3>
        <div className="space-y-3">
          {notifications.map((notif, idx) => (
            <div key={idx} className="bg-[#31251f]/50 border border-[rgba(216,197,182,0.08)] p-2.5 rounded-lg">
              <div className="flex justify-between items-start mb-1">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  notif.type === 'success' ? 'bg-green-500/10 text-green-400' :
                  notif.type === 'warning' ? 'bg-yellow-500/10 text-yellow-400' :
                  notif.type === 'error' ? 'bg-red-500/10 text-red-400' :
                  'bg-blue-500/10 text-blue-400'
                }`}>
                  {notif.title}
                </span>
                <span className="text-[#d8c5b6]/40 text-[9px] font-mono">{notif.time}</span>
              </div>
              <p className="text-[#d8c5b6]/80 text-[11px] leading-relaxed">{notif.message}</p>
            </div>
          ))}
          {notifications.length === 0 && (
            <p className="text-sm text-[#d8c5b6]/50 text-center py-4">Nenhum alerta recente no sistema.</p>
          )}
        </div>
      </div>
    </div>
  );
}
