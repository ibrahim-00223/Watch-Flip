import random
import time
import urllib.parse

import requests
from bs4 import BeautifulSoup


def scrape_chrono24(keyword: str, prix_max: float) -> list[dict]:
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/122.0.0.0 Safari/537.36"
        ),
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }

    encoded = urllib.parse.quote_plus(keyword)
    url = (
        f"https://www.chrono24.fr/search/index.htm"
        f"?query={encoded}&maxPrice={int(prix_max)}&dosearch=1&redirectToSearchIndex=1"
    )

    time.sleep(random.uniform(2, 5))

    try:
        resp = requests.get(url, headers=headers, timeout=20)
        resp.raise_for_status()
    except Exception:
        return []

    soup = BeautifulSoup(resp.text, "lxml")
    items = soup.select(".article-item-container")[:20]

    results = []
    for item in items:
        try:
            titre_el = item.select_one(".article-title")
            prix_el = item.select_one(".price")
            link_el = item.select_one("a[href]")

            if not (titre_el and prix_el and link_el):
                continue

            prix_str = (
                prix_el.get_text(strip=True)
                .replace("\xa0", "")
                .replace(" ", "")
                .replace("€", "")
                .replace(".", "")
                .replace(",", ".")
            )
            prix = float(prix_str)

            if prix > prix_max:
                continue

            href = link_el["href"]
            if href.startswith("/"):
                href = "https://www.chrono24.fr" + href

            results.append(
                {
                    "titre": titre_el.get_text(strip=True),
                    "prix": prix,
                    "url": href,
                    "source": "chrono24",
                }
            )
        except Exception:
            continue

    return results
