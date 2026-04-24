from datetime import date, datetime
from typing import Optional, Any
from pydantic import BaseModel


# ── Collection ────────────────────────────────────────────────────────────────

class CollectionCreate(BaseModel):
    nom: str
    marque: str
    reference: Optional[str] = None
    prix_achat: float
    date_achat: date
    etat: str
    statut: str = "en_stock"
    notes: Optional[str] = None
    photo_url: Optional[str] = None


class CollectionUpdate(BaseModel):
    nom: Optional[str] = None
    marque: Optional[str] = None
    reference: Optional[str] = None
    prix_achat: Optional[float] = None
    date_achat: Optional[date] = None
    etat: Optional[str] = None
    statut: Optional[str] = None
    notes: Optional[str] = None
    photo_url: Optional[str] = None


class CollectionRead(BaseModel):
    id: int
    nom: str
    marque: str
    reference: Optional[str]
    prix_achat: float
    date_achat: date
    etat: str
    statut: str
    notes: Optional[str]
    photo_url: Optional[str]
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}


# ── Flips ─────────────────────────────────────────────────────────────────────

class FlipCreate(BaseModel):
    montre_id: int
    prix_achat: float
    prix_vente: float
    plateforme_achat: str
    plateforme_vente: str
    date_achat: date
    date_vente: date
    frais: float = 0.0


class FlipRead(BaseModel):
    id: int
    montre_id: int
    prix_achat: float
    prix_vente: float
    plateforme_achat: str
    plateforme_vente: str
    date_achat: date
    date_vente: date
    frais: float
    marge_brute: float
    marge_nette: float
    duree_jours: int
    created_at: Optional[datetime]
    montre: Optional[CollectionRead] = None

    model_config = {"from_attributes": True}


class FlipsSummary(BaseModel):
    total_investi: float
    total_degage: float
    marge_moyenne: float
    nb_flips: int


class FlipsResponse(BaseModel):
    flips: list[FlipRead]
    summary: FlipsSummary


# ── Alertes ───────────────────────────────────────────────────────────────────

class AlerteCreate(BaseModel):
    keyword: str
    source: str
    prix_max: float
    actif: bool = True


class AlerteUpdate(BaseModel):
    keyword: Optional[str] = None
    source: Optional[str] = None
    prix_max: Optional[float] = None
    actif: Optional[bool] = None


class AlerteRead(BaseModel):
    id: int
    keyword: str
    source: str
    prix_max: float
    actif: bool
    derniere_execution: Optional[datetime]
    created_at: Optional[datetime]

    model_config = {"from_attributes": True}


# ── Veille ────────────────────────────────────────────────────────────────────

class VeilleManuelleRequest(BaseModel):
    keyword: str
    sources: list[str]
    prix_max: float


class VeilleResultatRead(BaseModel):
    id: int
    alerte_id: Optional[int]
    titre: str
    prix: float
    url: str
    source: str
    keyword: Optional[str]
    date_scraping: Optional[datetime]
    analyse_mistral: Optional[Any]
    flag_sous_evalue: bool

    model_config = {"from_attributes": True}


class MistralAnalyse(BaseModel):
    prix_median: float = 0.0
    prix_moyen: float = 0.0
    top_sous_evaluees: list[dict] = []
    recommandation: str = ""
    nb_analyses: int = 0


class VeilleScrapedResponse(BaseModel):
    resultats: list[VeilleResultatRead]
    analyse: MistralAnalyse
    nb_resultats: int
