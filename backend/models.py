from sqlalchemy import Column, Integer, String, Float, Date, Boolean, DateTime, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Collection(Base):
    __tablename__ = "collection"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(200), nullable=False)
    marque = Column(String(100), nullable=False)
    reference = Column(String(100), nullable=True)
    prix_achat = Column(Float, nullable=False)
    date_achat = Column(Date, nullable=False)
    etat = Column(String(50), nullable=False)
    statut = Column(String(20), default="en_stock", nullable=False)
    notes = Column(Text, nullable=True)
    photo_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    flips = relationship("Flip", back_populates="montre")


class Flip(Base):
    __tablename__ = "flips"

    id = Column(Integer, primary_key=True, index=True)
    montre_id = Column(Integer, ForeignKey("collection.id"), nullable=False)
    prix_achat = Column(Float, nullable=False)
    prix_vente = Column(Float, nullable=False)
    plateforme_achat = Column(String(100), nullable=False)
    plateforme_vente = Column(String(100), nullable=False)
    date_achat = Column(Date, nullable=False)
    date_vente = Column(Date, nullable=False)
    frais = Column(Float, default=0.0, nullable=False)
    marge_brute = Column(Float, nullable=False)
    marge_nette = Column(Float, nullable=False)
    duree_jours = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    montre = relationship("Collection", back_populates="flips")


class Alerte(Base):
    __tablename__ = "alertes"

    id = Column(Integer, primary_key=True, index=True)
    keyword = Column(String(200), nullable=False)
    source = Column(String(20), nullable=False)
    prix_max = Column(Float, nullable=False)
    actif = Column(Boolean, default=True, nullable=False)
    derniere_execution = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    resultats = relationship("VeilleResultat", back_populates="alerte")


class VeilleResultat(Base):
    __tablename__ = "veille_resultats"

    id = Column(Integer, primary_key=True, index=True)
    alerte_id = Column(Integer, ForeignKey("alertes.id"), nullable=True)
    titre = Column(String(500), nullable=False)
    prix = Column(Float, nullable=False)
    url = Column(String(1000), nullable=False)
    source = Column(String(20), nullable=False)
    keyword = Column(String(200), nullable=True)
    date_scraping = Column(DateTime(timezone=True), server_default=func.now())
    analyse_mistral = Column(JSON, nullable=True)
    flag_sous_evalue = Column(Boolean, default=False, nullable=False)

    alerte = relationship("Alerte", back_populates="resultats")
