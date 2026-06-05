import React from 'react';

export const metadata = {
  title: 'Exclusão de Dados | Voxion Ads',
  description: 'Instruções de como remover seus dados do Voxion Ads e desvincular o Meta Ads.',
};

export default function DataDeletion() {
  return (
    <div className="min-h-screen bg-[#31251f] p-8 md:p-16 font-['Avenir'] text-[#d8c5b6]">
      <div className="max-w-4xl mx-auto bg-[#1f1915] border border-[rgba(216,197,182,0.2)] rounded-2xl p-8 md:p-12 shadow-2xl">
        
        <div className="flex flex-col items-center mb-12 text-center border-b border-[rgba(216,197,182,0.1)] pb-8">
          <span className="text-6xl mb-6 block">🗑️</span>
          <h1 className="text-3xl md:text-5xl font-bold text-[#f18535] mb-4 font-['Jetbrains_Mono'] tracking-tight">
            Instruções de Exclusão de Dados
          </h1>
          <p className="text-[#d8c5b6]/70">Saiba como remover permanentemente seus dados do nosso sistema.</p>
        </div>

        <div className="space-y-8 leading-relaxed">
          <section>
            <p className="text-[#d8c5b6]/90 text-lg mb-6">
              De acordo com o GDPR, LGPD e as Políticas da Plataforma Meta, você tem o direito de solicitar a exclusão completa e definitiva de todas as suas informações armazenadas na nossa plataforma. Siga os passos abaixo para desvincular o Meta e apagar seu registro.
            </p>
          </section>

          <section className="bg-[rgba(241,133,53,0.05)] border-l-4 border-[#f18535] p-6 rounded-r-lg">
            <h2 className="text-2xl font-bold text-[#f18535] mb-4">Método 1: Exclusão via Painel Voxion</h2>
            <ol className="list-decimal pl-5 space-y-3 text-[#d8c5b6]/90">
              <li>Faça login na plataforma Voxion Ads.</li>
              <li>Acesse o menu de <strong>Configurações</strong> localizado no canto superior direito do Dashboard.</li>
              <li>Vá até a sessão &quot;Conexão Meta Ads&quot; e clique no botão <strong>&quot;Desconectar Meta&quot;</strong>. Isso revogará o Access Token imediatamente no nosso banco de dados.</li>
              <li>Em seguida, vá até &quot;Zona de Perigo&quot; no final da página e clique em <strong>&quot;Excluir Minha Conta e Todos os Dados&quot;</strong>. Todos os seus relatórios e logs de sincronização serão apagados irreversivelmente.</li>
            </ol>
          </section>

          <section className="bg-[rgba(33,150,243,0.05)] border-l-4 border-[#2196F3] p-6 rounded-r-lg mt-8">
            <h2 className="text-2xl font-bold text-[#2196F3] mb-4">Método 2: Exclusão diretamente no Facebook</h2>
            <p className="text-[#d8c5b6]/90 mb-4">
              Se você preferir remover o acesso através da sua própria conta do Facebook sem precisar entrar na nossa plataforma, siga este passo a passo:
            </p>
            <ol className="list-decimal pl-5 space-y-3 text-[#d8c5b6]/90">
              <li>Acesse a sua conta do Facebook e clique na sua foto de perfil no canto superior direito.</li>
              <li>Vá para <strong>Configurações e Privacidade</strong> &gt; <strong>Configurações</strong>.</li>
              <li>No menu lateral esquerdo, role para baixo e clique em <strong>Aplicativos e Sites</strong>.</li>
              <li>Procure pelo aplicativo <strong>Voxion Ads</strong> na lista.</li>
              <li>Clique no botão <strong>Remover</strong> ao lado do aplicativo.</li>
              <li>Siga as instruções na tela. Opcionalmente, você pode marcar a caixa para excluir também todas as publicações, vídeos ou eventos que o aplicativo tenha feito em sua linha do tempo (nós não publicamos na sua linha do tempo, apenas lemos os dados de anúncios).</li>
            </ol>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-[#f18535] mb-4">Contato para Suporte de Exclusão</h2>
            <p className="text-[#d8c5b6]/90">
              Se você encontrar qualquer dificuldade nos métodos descritos acima, ou preferir que um administrador humano delete os seus dados por você, basta enviar um e-mail para nossa equipe de privacidade: <br/><br/>
              <strong>Email:</strong> contato@voxion.com.br <br/>
              Nós processaremos sua exclusão num prazo máximo de 48 horas úteis e enviaremos um comprovante da deleção.
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
