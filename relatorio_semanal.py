import anthropic
import os
import csv
from dotenv import load_dotenv

# Carrega variáveis do .env.local
load_dotenv('.env.local', override=True)

client = anthropic.Anthropic(
    api_key=os.getenv("ANTHROPIC_API_KEY", "").strip()
)

def ler_csv(arquivo):
    with open(arquivo, encoding="utf-8") as f:
        return f.read()

def gerar_relatorio(dados_csv):
    prompt = f"""
    Analise esses dados de negócio da última semana e gere um relatório executivo.
    Inclua: principais métricas, variação em relação à semana anterior,
    3 pontos de atenção e 3 recomendações de ação imediata.
    Seja direto e objetivo. Use dados concretos.
    DADOS:
    {dados_csv}
    """
    
    resp = client.messages.create(
        model="claude-3-haiku-20240307", # Alterado para Haiku para compatibilidade
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}]
    )
    
    return resp.content[0].text

if __name__ == "__main__":
    try:
        dados = ler_csv("dados_semana.csv")
        relatorio = gerar_relatorio(dados)
        
        # Salva o relatório
        with open("relatorio.txt", "w", encoding="utf-8") as f:
            f.write(relatorio)
            
        print("✅ Relatório salvo em relatorio.txt")
    except FileNotFoundError:
        print("❌ Erro: Arquivo 'dados_semana.csv' não encontrado. Crie o arquivo e tente novamente.")