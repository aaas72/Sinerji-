import google.generativeai as genai  # type: ignore
from typing import List, Dict, Optional
from app.core.config import GEMINI_API_KEY, SKILL_ALIASES
from app.core.skill_taxonomy import SKILL_TAXONOMY
from app.core.logger import logger

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    _genai_model = genai.GenerativeModel("gemini-flash-latest")
else:
    _genai_model = None


def canonicalize_skill_name(name: str) -> str:
    normalized = (name or "").strip().lower()
    return SKILL_ALIASES.get(normalized, normalized)


def ensure_ontology_table(cur):
    """Ensure the skill_ontology table exists in the database."""
    cur.execute("""
        CREATE TABLE IF NOT EXISTS skill_ontology (
            id SERIAL PRIMARY KEY,
            skill_name VARCHAR(255) NOT NULL,
            parent_name VARCHAR(255) NOT NULL,
            UNIQUE(skill_name, parent_name)
        )
    """)


def load_ontology_cache(cur) -> Dict[str, List[str]]:
    """Load ALL ontology mappings into memory in a single query."""
    cur.execute("SELECT skill_name, parent_name FROM skill_ontology")
    cache: Dict[str, List[str]] = {}
    for row in cur.fetchall():
        cache.setdefault(str(row[0]), []).append(str(row[1]))
    return cache


def _lookup_local_taxonomy(skill_key: str) -> List[str]:
    """Check the in-memory SKILL_TAXONOMY dictionary (zero latency)."""
    return SKILL_TAXONOMY.get(skill_key, [])


def _infer_via_gemini(skill_name: str) -> List[str]:
    """Fallback: ask Gemini for truly unknown skills only."""
    if not _genai_model:
        return []
    prompt = (
        f"Given the technology/skill '{skill_name}', what are its broader parent "
        "technologies, languages, or categories? Return ONLY a comma-separated "
        "list of lowercase strings. Example: 'Django' -> 'python, back-end, web development'."
    )
    try:
        response = _genai_model.generate_content(prompt)
        text = response.text.strip().lower()
        return [p.strip() for p in text.replace(".", "").split(",") if p.strip()]
    except Exception as e:
        logger.error(f"Gemini inference failed for {skill_name}: {e}")
        return []


def get_skill_parents(
    cur, skill_name: str, cache: Optional[Dict[str, List[str]]] = None
) -> List[str]:
    """
    Resolve skill parents using a 3-tier strategy:
      1. In-memory request cache  (fastest)
      2. Local SKILL_TAXONOMY     (fast, no DB/network)
      3. Database skill_ontology  (cached from previous runs)
      4. Gemini API fallback      (only for truly unknown skills, result is cached)
    """
    skill_key = canonicalize_skill_name(skill_name)

    # ── Tier 1: request-level in-memory cache ──
    if cache is not None and skill_key in cache:
        return cache[skill_key]

    # ── Tier 2: local taxonomy dictionary ──
    local = _lookup_local_taxonomy(skill_key)
    if local:
        if cache is not None:
            cache[skill_key] = local
        return local

    # ── Tier 3: database (previously cached results) ──
    cur.execute("SELECT parent_name FROM skill_ontology WHERE skill_name = %s", (skill_key,))
    rows = cur.fetchall()
    if rows:
        parents = [str(r[0]) for r in rows]
        if cache is not None:
            cache[skill_key] = parents
        return parents

    # ── Tier 4: Gemini API (last resort, result gets cached in DB) ──
    logger.info(f"[ONTOLOGY] Unknown skill '{skill_key}' — asking Gemini")
    parents = _infer_via_gemini(skill_key)
    for p in parents:
        try:
            cur.execute(
                "INSERT INTO skill_ontology (skill_name, parent_name) VALUES (%s, %s) ON CONFLICT DO NOTHING",
                (skill_key, p),
            )
        except Exception as e:
            logger.error(f"Failed to cache ontology for {skill_key} -> {p}: {e}")
    if cache is not None:
        cache[skill_key] = parents
    return parents
