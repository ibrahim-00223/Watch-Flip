from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Collection
from schemas import CollectionCreate, CollectionRead, CollectionUpdate

router = APIRouter(prefix="/collection", tags=["collection"])


@router.get("", response_model=list[CollectionRead])
def list_collection(
    statut: Optional[str] = None,
    marque: Optional[str] = None,
    db: Session = Depends(get_db),
):
    q = db.query(Collection)
    if statut:
        q = q.filter(Collection.statut == statut)
    if marque:
        q = q.filter(Collection.marque == marque)
    return q.order_by(Collection.created_at.desc()).all()


@router.post("", response_model=CollectionRead, status_code=201)
def create_montre(payload: CollectionCreate, db: Session = Depends(get_db)):
    montre = Collection(**payload.model_dump())
    db.add(montre)
    db.commit()
    db.refresh(montre)
    return montre


@router.get("/{montre_id}", response_model=CollectionRead)
def get_montre(montre_id: int, db: Session = Depends(get_db)):
    montre = db.query(Collection).filter(Collection.id == montre_id).first()
    if not montre:
        raise HTTPException(status_code=404, detail="Montre introuvable")
    return montre


@router.put("/{montre_id}", response_model=CollectionRead)
def update_montre(
    montre_id: int, payload: CollectionUpdate, db: Session = Depends(get_db)
):
    montre = db.query(Collection).filter(Collection.id == montre_id).first()
    if not montre:
        raise HTTPException(status_code=404, detail="Montre introuvable")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(montre, field, value)
    db.commit()
    db.refresh(montre)
    return montre


@router.delete("/{montre_id}")
def delete_montre(montre_id: int, db: Session = Depends(get_db)):
    montre = db.query(Collection).filter(Collection.id == montre_id).first()
    if not montre:
        raise HTTPException(status_code=404, detail="Montre introuvable")
    db.delete(montre)
    db.commit()
    return {"ok": True}
