import asyncio
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Alerte, VeilleResultat
from schemas import AlerteCreate, AlerteRead, AlerteUpdate
from scrapers import scrape_leboncoin, scrape_vinted, scrape_chrono24
from analyzer import MistralAnalyzer

router = APIRouter(prefix="/alertes", tags=["alertes"])
analyzer = MistralAnalyzer()


@router.get("", response_model=list[AlerteRead])
def list_alertes(db: Session = Depends(get_db)):
    return db.query(Alerte).order_by(Alerte.created_at.desc()).all()


@router.post("", response_model=AlerteRead, status_code=201)
def create_alerte(payload: AlerteCreate, db: Session = Depends(get_db)):
    alerte = Alerte(**payload.model_dump())
    db.add(alerte)
    db.commit()
    db.refresh(alerte)
    return alerte


@router.put("/{alerte_id}", response_model=AlerteRead)
def update_alerte(
    alerte_id: int, payload: AlerteUpdate, db: Session = Depends(get_db)
):
    alerte = db.query(Alerte).filter(Alerte.id == alerte_id).first()
    if not alerte:
        raise HTTPException(status_code=404, detail="Alerte introuvable")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(alerte, field, value)
    db.commit()
    db.refresh(alerte)
    return alerte


@router.delete("/{alerte_id}")
def delete_alerte(alerte_id: int, db: Session = Depends(get_db)):
    alerte = db.query(Alerte).filter(Alerte.id == alerte_id).first()
    if not alerte:
        raise HTTPException(status_code=404, detail="Alerte introuvable")
    db.delete(alerte)
    db.commit()
    return {"ok": True}


@router.post("/{alerte_id}/run")
async def run_alerte(alerte_id: int, db: Session = Depends(get_db)):
    alerte = db.query(Alerte).filter(Alerte.id == alerte_id).first()
    if not alerte:
        raise HTTPException(status_code=404, detail="Alerte introuvable")

    raw = await _run_scrape_for_source(alerte.keyword, alerte.source, alerte.prix_max)

    analyse = analyzer.analyser_resultats(alerte.keyword, raw)

    top_urls = {r.get("url") for r in analyse.get("top_sous_evaluees", [])}
    saved = 0
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
        saved += 1

    alerte.derniere_execution = datetime.now(timezone.utc)
    db.commit()
    return {"resultats_sauvegardes": saved}


async def _run_scrape_for_source(keyword: str, source: str, prix_max: float) -> list[dict]:
    if source == "leboncoin":
        return await scrape_leboncoin(keyword, prix_max)
    elif source == "vinted":
        return await asyncio.to_thread(scrape_vinted, keyword, prix_max)
    elif source == "chrono24":
        return await asyncio.to_thread(scrape_chrono24, keyword, prix_max)
    return []
