import requests, os, json
from dotenv import load_dotenv

load_dotenv('.env.local')
TOKEN = os.getenv("META_ACCESS_TOKEN")
ACT = os.getenv("META_AD_ACCOUNT_ID")

API = "https://graph.facebook.com/v19.0"

# --------- CONFIGURAÇÃO ----------------------------------------------------
CPA_LIMITE = 40.0 # pausa conjuntos com CPA acima disso
GASTO_MINIMO = 15.0 # só analisa se gastou pelo menos isso
JANELA_DIAS = 3 # últimos X dias
# ---------------------------------------------------------------------------

def get_adsets_insights():
    r = requests.get(f"{API}/act_{ACT}/adsets",
    params={
        "access_token": TOKEN,
        "fields": "id,name,status,insights{spend,actions}",
        "effective_status": "['ACTIVE']",
        "date_preset": f"last_{JANELA_DIAS}_days"
    })
    return r.json().get("data", [])

def pausar_adset(adset_id, nome, motivo):
    r = requests.post(f"{API}/{adset_id}",
    params={
        "status": "PAUSED",
        "access_token": TOKEN
    })
    if r.status_code == 200:
        print(f"🛑 PAUSADO: {nome} | Motivo: {motivo}")
    else:
        print(f"❌ ERRO ao pausar {nome}: {r.json()}")

def executar_automacao():
    print(f"🔍 Buscando AdSets ativos (Últimos {JANELA_DIAS} dias)...")
    adsets = get_adsets_insights()
    
    if not adsets:
        print("Nenhum AdSet ativo encontrado com impressões nesses dias.")
        return

    for adset in adsets:
        nome = adset.get("name")
        adset_id = adset.get("id")
        insights_data = adset.get("insights", {}).get("data", [])
        
        if not insights_data:
            continue
            
        insights = insights_data[0]
        gasto = float(insights.get("spend", 0))
        
        if gasto < GASTO_MINIMO:
            continue
            
        compras = sum([int(a["value"]) for a in insights.get("actions", []) if a["action_type"] == "purchase"])
        
        cpa = gasto / compras if compras > 0 else gasto
        
        # Lógica de Pausa Automática
        if cpa > CPA_LIMITE:
            motivo = f"CPA alto (R$ {cpa:.2f}) > Limite (R$ {CPA_LIMITE:.2f})"
            pausar_adset(adset_id, nome, motivo)
        else:
            print(f"✅ SAUDÁVEL: {nome} | CPA: R$ {cpa:.2f}")

if __name__ == "__main__":
    executar_automacao()