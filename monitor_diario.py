import requests, os, json
from dotenv import load_dotenv
from datetime import date, timedelta

# Carrega as variáveis do .env.local do Next.js
load_dotenv('.env.local')

TOKEN = os.getenv("META_ACCESS_TOKEN")
ACT = os.getenv("META_AD_ACCOUNT_ID")

API = "https://graph.facebook.com/v19.0"
ONTEM = str(date.today() - timedelta(days=1))

def get_insights():
    r = requests.get(
        f"{API}/act_{ACT}/insights",
        params={
            "access_token": TOKEN,
            "level": "campaign",
            "date_preset": "yesterday",
            "fields": "campaign_name,spend,impressions,clicks,ctr,cpc,actions",
            "filtering": json.dumps([{"field": "effective_status", "operator": "IN", "value": ["ACTIVE"]}])
        }
    )
    return r.json().get("data", [])

def formatar_relatorio(dados):
    linhas = [f"📊 RELATÓRIO META ADS — {ONTEM}\n"]
    if not dados:
        linhas.append("Nenhum dado encontrado para as campanhas ativas ontem.")
        return "\n".join(linhas)
        
    for c in dados:
        nome = c.get("campaign_name", "?")[:40]
        gasto = float(c.get("spend", 0))
        cliques = c.get("clicks", "0")
        ctr = float(c.get("ctr", 0))
        cpc = float(c.get("cpc", 0))
        compras = sum([int(a["value"]) for a in c.get("actions", []) if a["action_type"] == "purchase"])
        cpa = gasto / compras if compras > 0 else 0
        linhas.append(
            f"▶ {nome}\n"
            f" Gasto: R${gasto:.2f} | Cliques: {cliques} | CTR: {ctr:.1f}%\n"
            f" CPC: R${cpc:.2f} | Compras: {compras} | CPA: R${cpa:.2f}\n"
        )
    return "\n".join(linhas)

if __name__ == "__main__":
    dados = get_insights()
    relatorio = formatar_relatorio(dados)
    print(relatorio)
