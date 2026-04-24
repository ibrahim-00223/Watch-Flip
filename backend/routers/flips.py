from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Flip, Collection
from schemas import FlipCreate, FlipRead, FlipsResponse, FlipsSummary

router = APIRouter(prefix="/flips", tags=["flips"])


@router.get("", response_model=FlipsResponse)
def list_flips(db: Session = Depends(get_db)):
    flips = db.query(Flip).order_by(Flip.created_at.desc()).all()
    nb = len(flips)
    total_investi = sum(f.prix_achat for f in flips)
    total_degage = sum(f.prix_vente for f in flips)
    marge_moyenne = (
        sum(f.marge_nette for f in flips) / nb if nb > 0 else 0.0
    )
    summary = FlipsSummary(
        total_investi=round(total_investi, 2),
        total_degage=round(total_degage, 2),
        marge_moyenne=round(marge_moyenne, 2),
        nb_flips=nb,
    )
    return FlipsResponse(flips=flips, summary=summary)


@router.post("", response_model=FlipRead, status_code=201)
def create_flip(payload: FlipCreate, db: Session = Depends(get_db)):
    montre = db.query(Collection).filter(Collection.id == payload.montre_id).first()
    if not montre:
        raise HTTPException(status_code=404, detail="Montre introuvable")

    marge_brute = round(payload.prix_vente - payload.prix_achat, 2)
    marge_nette = round(payload.prix_vente - payload.prix_achat - payload.frais, 2)
    duree_jours = (payload.date_vente - payload.date_achat).days

    flip = Flip(
        **payload.model_dump(),
        marge_brute=marge_brute,
        marge_nette=marge_nette,
        duree_jours=duree_jours,
    )
    db.add(flip)

    # Mark watch as sold
    montre.statut = "vendu"
    db.commit()
    db.refresh(flip)
    return flip


@router.get("/{flip_id}", response_model=FlipRead)
def get_flip(flip_id: int, db: Session = Depends(get_db)):
    flip = db.query(Flip).filter(Flip.id == flip_id).first()
    if not flip:
        raise HTTPException(status_code=404, detail="Flip introuvable")
    return flip


@router.delete("/{flip_id}")
def delete_flip(flip_id: int, db: Session = Depends(get_db)):
    flip = db.query(Flip).filter(Flip.id == flip_id).first()
    if not flip:
        raise HTTPException(status_code=404, detail="Flip introuvable")
    db.delete(flip)
    db.commit()
    return {"ok": True}
