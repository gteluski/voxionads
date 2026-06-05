import React from 'react';

export const metadata = {
  title: 'Política de Privacidade | Voxion Ads',
  description: 'Política de privacidade e termos de uso do sistema Voxion Ads.',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#31251f] p-8 md:p-16 font-['Avenir'] text-[#d8c5b6]">
      <div className="max-w-4xl mx-auto bg-[#1f1915] border border-[rgba(216,197,182,0.2)] rounded-2xl p-8 md:p-12 shadow-2xl">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-12 text-center border-b border-[rgba(216,197,182,0.1)] pb-8">
          <img src="/voxion-ads-logo.svg" alt="Voxion Ads" className="h-20 w-auto mb-6" />
          <h1 className="text-3xl md:text-5xl font-bold text-[#f18535] mb-4 font-['Jetbrains_Mono'] tracking-tight">
            Política de Privacidade
          </h1>
          <p className="text-[#d8c5b6]/70">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        {/* Content */}
        <div className="space-y-8 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-[#f18535] mb-4">1. Introdução</h2>
            <p className="text-[#d8c5b6]/90">
              A Voxion Ads leva a sua privacidade a sério. Esta Política de Privacidade explica como coletamos, usamos, compartilhamos e protegemos as suas informações pessoais e os dados oriundos das plataformas de anúncios conectadas ao nosso sistema (como o Meta Ads).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#f18535] mb-4">2. Coleta de Dados via APIs de Terceiros</h2>
            <p className="text-[#d8c5b6]/90 mb-3">
              Ao utilizar a plataforma Voxion Ads para gerenciar suas campanhas, você pode optar por conectar suas contas de publicidade (como Meta/Facebook Ads). Para realizar esta integração, nós solicitamos permissões através do protocolo seguro OAuth para acessar:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-[#d8c5b6]/80">
              <li>Métricas de campanhas (investimento, cliques, impressões, alcance, conversões).</li>
              <li>Estrutura das suas contas de anúncios (Nomes de campanhas, conjuntos de anúncios e identificadores de conta).</li>
              <li>Tokens de acesso necessários exclusivamente para a sincronização contínua desses relatórios.</li>
            </ul>
            <p className="text-[#d8c5b6]/90 mt-3">
              Estes dados são armazenados de forma criptografada e não são compartilhados com terceiros sob nenhuma circunstância.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#f18535] mb-4">3. Uso das Informações</h2>
            <p className="text-[#d8c5b6]/90">
              As informações que coletamos são utilizadas exclusivamente para o funcionamento do painel administrativo Voxion Ads. Elas permitem que o sistema gere relatórios de inteligência automatizada, calcule o ROI, CPA e centralize os dados para facilitar a sua tomada de decisão estratégica em campanhas de tráfego pago.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#f18535] mb-4">4. Segurança dos Dados</h2>
            <p className="text-[#d8c5b6]/90">
              Nossa infraestrutura, operada sob a tecnologia Supabase, emprega rigorosos métodos de segurança em nível de banco de dados (Row Level Security - RLS). Todos os Tokens do Meta Ads são criptografados antes de serem armazenados no banco. Apenas o administrador autenticado tem permissão de visualizar e sincronizar os próprios dados.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#f18535] mb-4">5. Retenção e Exclusão</h2>
            <p className="text-[#d8c5b6]/90">
              Você possui controle total sobre os seus dados. Caso deseje desconectar sua conta Meta, nosso sistema invalidará imediatamente os tokens e excluirá o acesso em nossa base. Da mesma forma, caso solicite o encerramento do seu acesso à plataforma Voxion Ads, todos os relatórios vinculados à sua conta serão expurgados do nosso sistema de forma irreversível.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#f18535] mb-4">6. Contato</h2>
            <p className="text-[#d8c5b6]/90">
              Se você tiver dúvidas, sugestões ou solicitações relativas a esta política e à proteção de seus dados, por favor entre em contato conosco pelos canais oficiais de suporte da Voxion Studio.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-[rgba(216,197,182,0.1)] text-center text-sm text-[#d8c5b6]/50">
          <p>© {new Date().getFullYear()} Voxion Studio. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}
