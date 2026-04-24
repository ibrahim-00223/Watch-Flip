import asyncio
import random
import urllib.parse

from playwright.async_api import async_playwright


async def scrape_leboncoin(keyword: str, prix_max: float) -> list[dict]:
    encoded = urllib.parse.quote_plus(keyword)
    url = (
        f"https://www.leboncoin.fr/recherche"
        f"?text={encoded}&prix_max={int(prix_max)}&locations="
    )

    results = []

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                user_agent=(
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/122.0.0.0 Safari/537.36"
                ),
                viewport={"width": 1280, "height": 800},
                locale="fr-FR",
            )
            page = await context.new_page()

            # Random delay before request
            await asyncio.sleep(random.uniform(2, 5))

            try:
                await page.goto(url, wait_until="domcontentloaded", timeout=30000)
                await page.wait_for_timeout(2000)

                # Try multiple known selectors
                listing_selectors = [
                    "[data-qa-id='aditem_container']",
                    "article[data-test-id='ad']",
                    "li[data-test-id='ad']",
                ]

                items = []
                for selector in listing_selectors:
                    items = await page.query_selector_all(selector)
                    if items:
                        break

                for item in items[:20]:
                    try:
                        titre_el = await item.query_selector(
                            "[data-qa-id='aditem_title'], h3, h2"
                        )
                        prix_el = await item.query_selector(
                            "[data-qa-id='aditem_price'], [data-test-id='price']"
                        )
                        link_el = await item.query_selector("a[href]")

                        if not (titre_el and prix_el and link_el):
                            continue

                        titre = (await titre_el.inner_text()).strip()
                        prix_raw = (await prix_el.inner_text()).strip()
                        href = await link_el.get_attribute("href")

                        prix_str = (
                            prix_raw.replace("\xa0", "")
                            .replace(" ", "")
                            .replace("€", "")
                            .replace(".", "")
                            .replace(",", ".")
                        )
                        prix = float(prix_str)

                        if prix > prix_max:
                            continue

                        if href and not href.startswith("http"):
                            href = "https://www.leboncoin.fr" + href

                        results.append(
                            {
                                "titre": titre,
                                "prix": prix,
                                "url": href,
                                "source": "leboncoin",
                            }
                        )
                    except Exception:
                        continue

            finally:
                await browser.close()

    except Exception:
        pass

    return results
