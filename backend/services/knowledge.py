import json
from dataclasses import dataclass
from typing import Dict, Any, Optional
from pathlib import Path

@dataclass
class KnowledgeBase:
    # canonical ingredient -> metadata
    items: Dict[str, Dict[str, Any]]
    # synonym -> canonical ingredient
    synonyms: Dict[str, str]

    @staticmethod
    def load_default() -> "KnowledgeBase":
        data_path = Path(__file__).resolve().parent.parent / "data" / "ingredients_knowledge.json"
        data = json.loads(data_path.read_text(encoding="utf-8"))

        items = {}
        for it in data["ingredients"]:
            items[it["name"].lower()] = it

        synonyms = {}
        for k, v in data.get("synonyms", {}).items():
            synonyms[k.lower()] = v.lower()

        return KnowledgeBase(items=items, synonyms=synonyms)

    def resolve(self, raw_name: str) -> str:
        n = raw_name.strip().lower()
        if n in self.items:
            return n
        if n in self.synonyms:
            return self.synonyms[n]
        # heuristic: remove extra spaces
        n2 = " ".join(n.split())
        if n2 in self.items:
            return n2
        if n2 in self.synonyms:
            return self.synonyms[n2]
        return n2

    def get(self, canonical: str) -> Optional[Dict[str, Any]]:
        return self.items.get(canonical.lower())
