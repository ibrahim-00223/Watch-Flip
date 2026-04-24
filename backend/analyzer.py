import json
import os

from mistralai import Mistral


SYSTEM_PROMPT = (
    "Tu es un expert en montres d'occasion et en achat-revente (flipping) de montres vintage. "
    "Tu analyses des annonces de vente de montres et identifies les meilleures opportunités. "
    "Tu réponds UNIQUEMENT en JSON valide, sans markdown, sans texte autour."
)


class MistralAnalyzer:
    def __init__(self):
        self.client = Mistral(api_key=os.getenv("MISTRAL_API_KEY", ""))

    def analyser_resultats(self, keyword: str, resultats: list[dict]) -> dict:
        if not resultats:
            return self._fallback()

        listings_text = "\n".join(
            f"- {r['titre']} | {r['prix']}€ | {r['source']} | {r['url']}"
            for r in resultats
        )

        user_prompt = (
            f"Voici {len(resultats)} annonces pour \"{keyword}\" :\n\n"
            f"{listings_text}\n\n"
            "Analyse ces annonces et réponds en JSON avec exactement cette structure :\n"
            "{\n"
            '  "prix_median": <float>,\n'
            '  "prix_moyen": <float>,\n'
            '  "top_sous_evaluees": [\n'
            '    {"titre": "...", "prix": <float>, "url": "...", "raison": "..."}\n'
            "  ],\n"
            '  "recommandation": "<2-3 phrases sur la tendance du marché et la meilleure opportunité>",\n'
            '  "nb_analyses": <int>\n'
            "}\n\n"
            "top_sous_evaluees : maximum 3 annonces, les plus sous-évaluées par rapport au marché. "
            "Si aucune annonce n'est clairement sous-évaluée, retourne une liste vide."
        )

        try:
            response = self.client.chat.complete(
                model="mistral-large-latest",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.2,
                response_format={"type": "json_object"},
            )
            content = response.choices[0].message.content
            return json.loads(content)
        except Exception:
            return self._fallback()

    @staticmethod
    def _fallback() -> dict:
        return {
            "prix_median": 0.0,
            "prix_moyen": 0.0,
            "top_sous_evaluees": [],
            "recommandation": "Analyse Mistral indisponible.",
            "nb_analyses": 0,
        }
