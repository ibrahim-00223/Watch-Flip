import os
import random
import time

import requests


def scrape_vinted(keyword: str, prix_max: float) -> list[dict]:
    session_cookie = os.getenv("VINTED_SESSION_COOKIE", "")

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/122.0.0.0 Safari/537.36"
        ),
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "fr-FR,fr;q=0.9",
        "Referer": "https://www.vinted.fr/",
        "Cookie": session_cookie,
    }

    params = {
        "search_text": keyword,
        "price_to": int(prix_max),
        "per_page": 20,
        "catalog_ids": 2478,  # montres Vinted FR
        "currency": "EUR",
    }

    time.sleep(random.uniform(2, 5))

    try:
        resp = requests.get(
            "https://www.vinted.fr/api/v2/catalog/items",
            headers=headers,
            params=params,
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()
    except Exception:
        return []

    results = []
    for item in data.get("items", []):
        try:
            prix = float(item.get("price", {}).get("amount", 0) if isinstance(item.get("price"), dict) else item.get("price", 0))
            if prix <= 0 or prix > prix_max:
                continue
            results.append(
                {
                    "titre": item.get("title", ""),
                    "prix": prix,
                    "url": f"https://www.vinted.fr/items/{item['id']}",
                    "source": "vinted",
                }
            )
        except Exception:
            continue

    return results
