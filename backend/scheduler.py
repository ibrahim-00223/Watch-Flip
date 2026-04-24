import asyncio
import logging
from datetime import datetime, timezone

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from scrapers import scrape_leboncoin, scrape_vinted, scrape_chrono24
from analyzer import MistralAnalyzer

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()
analyzer = MistralAnalyzer()


async def run_alertes_job():
    """Executed every 24h: scrape all active alerts and save results."""
    from database import SessionLocal
    from models import Alerte, VeilleResultat

    logger.info("APScheduler: démarrage du job alertes")
    db = SessionLocal()
    try:
        alertes = db.query(Alerte).filter(Alerte.actif == True).all()
        logger.info(f"APScheduler: {len(alertes)} alerte(s) active(s)")

        for alerte in alertes:
            try:
                raw = await _scrape_for_alerte(alerte.keyword, alerte.source, alerte.prix_max)
                if not raw:
                    continue

                analyse = analyzer.analyser_resultats(alerte.keyword, raw)
                top_urls = {r.get("url") for r in analyse.get("top_sous_evaluees", [])}

                for item in raw:
                    res = VeilleResultat(
                        alerte_id=alerte.id,
                        titre=item["titre"],
                        prix=item["prix"],
                        url=item["url"],
                        source=item["source"],
                        keyword=alerte.keyword,
                        flag_sous_evalue=item["url"] in top_urls,
                        analyse_mistral=None,
                    )
                    db.add(res)

                alerte.derniere_execution = datetime.now(timezone.utc)
                db.commit()
                logger.info(f"Alerte {alerte.id} ({alerte.keyword}): {len(raw)} résultats sauvegardés")

            except Exception as e:
                logger.error(f"Erreur alerte {alerte.id}: {e}")
                db.rollback()

    finally:
        db.close()
    logger.info("APScheduler: job alertes terminé")


async def _scrape_for_alerte(keyword: str, source: str, prix_max: float) -> list[dict]:
    if source == "leboncoin":
        return await scrape_leboncoin(keyword, prix_max)
    elif source == "vinted":
        return await asyncio.to_thread(scrape_vinted, keyword, prix_max)
    elif source == "chrono24":
        return await asyncio.to_thread(scrape_chrono24, keyword, prix_max)
    return []
