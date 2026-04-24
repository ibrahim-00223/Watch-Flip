import asyncio
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import VeilleResultat
from schemas import VeilleManuelleRequest, VeilleScrapedResponse, MistralAnalyse, VeilleResultatRead
from scrapers import scrape_leboncoin, scrape_vinted, scrape_chrono24
from analyzer import MistralAnalyzer

router = APIRouter(prefix="/veille", tags=["veille"])
analyzer = MistralAnalyzer()


@router.post("/scrape", response_model=VeilleScrapedResponse)
async def scrape_manual(payload: VeilleManuelleRequest, db: Session = Depends(get_db)):
    raw: list[dict] = []

    tasks = []
    sync_scrapers = []

    if "leboncoin" in payload.sources:
        tasks.append(scrape_leboncoin(payload.keyword, payload.prix_max))
    if "vinted" in payload.sources:
        sync_scrapers.append(("vinted", scrape_vinted))
    if "chrono24" in payload.sources:
        sync_scrapers.append(("chrono24", scrape_chrono24))

    # Run async scraper
    if tasks:
        results = await asyncio.gather(*tasks, return_exceptions=True)
        for r in results:
            if isinstance(r, list):
                raw.extend(r)

    # Run sync scrapers in threads
    for _, fn in sync_scrapers:
        try:
            result = await asyncio.to_thread(fn, payload.keyword, payload.prix_max)
            raw.extend(result)
        except Exception:
            pass

    # Mistral batch analysis
    analyse_dict = analyzer.analyser_resultats(payload.keyword, raw)
    analyse = MistralAnalyse(**{
        k: analyse_dict.get(k, v)
        for k, v in MistralAnalyse().model_dump().items()
    })

    top_urls = {r.get("url") for r in analyse_dict.get("top_sous_evaluees", [])}

    # Save to DB
    saved_rows = []
    for item in raw:
        res = VeilleResultat(
            alerte_id=None,
            titre=item["titre"],
            prix=item["prix"],
            url=item["url"],
            source=item["source"],
            keyword=payload.keyword,
            flag_sous_evalue=item["url"] in top_urls,
            analyse_mistral=None,
        )
        db.add(res)
        db.flush()
        saved_rows.append(res)

    db.commit()
    for r in saved_rows:
        db.refresh(r)

    return VeilleScrapedResponse(
        resultats=[VeilleResultatRead.model_validate(r) for r in saved_rows],
        analyse=analyse,
        nb_resultats=len(saved_rows),
    )


@router.get("/resultats", response_model=list[VeilleResultatRead])
def list_resultats(
    alerte_id: Optional[int] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    q = db.query(VeilleResultat)
    if alerte_id is not None:
        q = q.filter(VeilleResultat.alerte_id == alerte_id)
    return q.order_by(VeilleResultat.date_scraping.desc()).limit(limit).all()
