import React from 'react';

export const metadata = {
  title: 'Termos de Serviço | Voxion Ads',
  description: 'Termos de Serviço do sistema Voxion Ads.',
};

export default function TermosServico() {
  return (
    <div className="min-h-screen bg-[#31251f] p-8 md:p-16 font-['Avenir'] text-[#d8c5b6]">
      <div className="max-w-4xl mx-auto bg-[#1f1915] border border-[rgba(216,197,182,0.2)] rounded-2xl p-8 md:p-12 shadow-2xl">
        
        <div className="flex flex-col items-center mb-12 text-center border-b border-[rgba(216,197,182,0.1)] pb-8">
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/voxion-ads-logo.svg" alt="Voxion Ads" className="h-20 w-auto mb-6" />
          <h1 className="text-3xl md:text-5xl font-bold text-[#f18535] mb-4 font-['Jetbrains_Mono'] tracking-tight">
            Termos de Serviço
          </h1>
          <p className="text-[#d8c5b6]/70">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        <div className="space-y-8 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-[#f18535] mb-4">1. Aceitação dos Termos</h2>
            <p className="text-[#d8c5b6]/90">
              Ao acessar e utilizar a plataforma Voxion Ads, você concorda expressamente com estes Termos de Serviço. A plataforma oferece uma interface analítica para a gestão e visualização de campanhas de tráfego pago integradas via plataformas de terceiros, como o Meta Ads.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#f18535] mb-4">2. Uso da Plataforma</h2>
            <p className="text-[#d8c5b6]/90">
              A licença concedida para o uso da Voxion Ads é pessoal, intransferível e para uso estritamente corporativo ou administrativo relacionado às suas contas de anúncios. Você concorda em não tentar aplicar engenharia reversa, hackear, contornar ou explorar vulnerabilidades de nossa API ou do banco de dados (Supabase).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#f18535] mb-4">3. Integrações e API de Terceiros</h2>
            <p className="text-[#d8c5b6]/90">
              O Voxion Ads utiliza a Graph API do Meta (Facebook) para exibir os dados estatísticos e financeiros da sua conta. Nós não nos responsabilizamos por quedas no serviço do Meta, limites de rate-limit atingidos pela sua conta ou discrepâncias vindas diretamente do servidor original de anúncios. O usuário deve manter o compliance com as Políticas de Publicidade do Meta.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#f18535] mb-4">4. Isenção de Responsabilidade</h2>
            <p className="text-[#d8c5b6]/90">
              O sistema fornece inteligência analítica para otimizar suas métricas (ROI, CPA, CTR). No entanto, não garantimos aumento de faturamento ou resultados operacionais exatos. As decisões de aumentar orçamento, pausar ou alterar campanhas continuam sendo de total responsabilidade do gestor da conta.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-[#f18535] mb-4">5. Modificação dos Termos</h2>
            <p className="text-[#d8c5b6]/90">
              A Voxion Studio reserva-se o direito de alterar, modificar ou substituir estes Termos de Serviço a qualquer momento. Caso as alterações sejam significativas, enviaremos um aviso na plataforma ou via e-mail.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-[rgba(216,197,182,0.1)] text-center text-sm text-[#d8c5b6]/50">
          <p>© {new Date().getFullYear()} Voxion Studio. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}
