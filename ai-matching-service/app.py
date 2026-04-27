from __future__ import annotations

import math
import os
import re
from collections import Counter
from contextlib import contextmanager
from dataclasses import dataclass
from typing import Any, Dict, List, Optional
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

import psycopg
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

load_dotenv()

def normalize_database_url(raw_url: str) -> str:
    """Strip Prisma-specific params (e.g. schema) not understood by psycopg."""
    parts = urlsplit(raw_url)
    query_items = [(k, v) for k, v in parse_qsl(parts.query, keep_blank_values=True) if k.lower() != "schema"]
    normalized_query = urlencode(query_items)
    return urlunsplit((parts.scheme, parts.netloc, parts.path, normalized_query, parts.fragment))


DATABASE_URL = normalize_database_url((os.getenv("DATABASE_URL") or "").strip())
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is required for AI matching microservice")

DEFAULT_ALPHA = float(os.getenv("MATCHING_DEFAULT_ALPHA", "0.7"))
DEFAULT_TOP_K = int(os.getenv("MATCHING_DEFAULT_TOP_K", "20"))
DEFAULT_MIN_SCORE = float(os.getenv("MATCHING_DEFAULT_MIN_SCORE", "0"))
REQUIRED_LEVEL_GAP_TOLERANCE = int(os.getenv("MATCHING_REQUIRED_SKILL_GAP_TOLERANCE", "0"))
SEMANTIC_MODEL_NAME = (os.getenv("MATCHING_SEMANTIC_MODEL", "sentence-transformers/all-MiniLM-L6-v2") or "").strip()
SEMANTIC_ENABLED = (os.getenv("MATCHING_ENABLE_SEMANTIC", "true") or "true").strip().lower() == "true"

if DEFAULT_ALPHA < 0 or DEFAULT_ALPHA > 1:
    raise RuntimeError("MATCHING_DEFAULT_ALPHA must be between 0 and 1")
if DEFAULT_TOP_K <= 0:
    raise RuntimeError("MATCHING_DEFAULT_TOP_K must be > 0")

app = FastAPI(title="Sinerji AI Matching Microservice", version="2.0.0")


class MatchRequestBase(BaseModel):
    alpha: Optional[float] = Field(default=None, ge=0.0, le=1.0)
    top_k: Optional[int] = Field(default=None, gt=0)
    min_score: Optional[float] = Field(default=None, ge=0.0, le=100.0)


class ScoreStudentTaskRequest(MatchRequestBase):
    task_id: int = Field(gt=0)
    student_user_id: int = Field(gt=0)


class RankTaskCandidatesRequest(MatchRequestBase):
    task_id: int = Field(gt=0)
    company_user_id: int = Field(gt=0)


class RecommendTasksRequest(MatchRequestBase):
    student_user_id: int = Field(gt=0)


class CandidateScore(BaseModel):
    student_user_id: int
    score: int
    hard_score: float
    semantic_score: float
    breakdown: Dict[str, float]
    reasons: List[str]
    top_projects: List[Dict[str, Any]]
    missing_skills: List[str]


class TaskScore(BaseModel):
    task_id: int
    score: int
    hard_score: float
    semantic_score: float
    breakdown: Dict[str, float]
    reasons: List[str]
    top_projects: List[Dict[str, Any]]
    missing_skills: List[str]


@dataclass
class SkillRequirement:
    skill_name: str
    required_level: int
    is_required: bool


@dataclass
class StudentSkill:
    skill_name: str
    level: int


@dataclass
class ProjectEvidence:
    task_id: int
    title: str
    text: str


@dataclass
class HardFilterResult:
    passed: bool
    score: float
    missing_skills: List[str]
    below_level_skills: List[str]


WORD_RE = re.compile(r"[a-zA-Z0-9_\-\+\.]+")
SKILL_ALIASES = {
    "reactjs": "react",
    "react.js": "react",
    "node": "node.js",
    "nodejs": "node.js",
    "ts": "typescript",
    "js": "javascript",
    "py": "python",
}

_semantic_model = None
_semantic_model_error = None


@contextmanager
def db_cursor():
    with psycopg.connect(DATABASE_URL) as conn:
        with conn.cursor() as cur:
            yield cur


def clamp_100(value: float) -> int:
    return max(0, min(100, int(round(value))))


def tokenize(text: str) -> Counter:
    tokens = [t.lower() for t in WORD_RE.findall(text or "") if len(t) > 1]
    return Counter(tokens)


def cosine_similarity_bow(a: Counter, b: Counter) -> float:
    if not a or not b:
        return 0.0
    common = set(a).intersection(b)
    dot = sum(a[token] * b[token] for token in common)
    norm_a = math.sqrt(sum(v * v for v in a.values()))
    norm_b = math.sqrt(sum(v * v for v in b.values()))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return max(0.0, min(1.0, dot / (norm_a * norm_b)))


def canonicalize_skill_name(skill_name: str) -> str:
    normalized = (skill_name or "").strip().lower()
    return SKILL_ALIASES.get(normalized, normalized)


def get_semantic_model():
    global _semantic_model
    global _semantic_model_error

    if not SEMANTIC_ENABLED:
        return None
    if _semantic_model_error is not None:
        return None
    if _semantic_model is not None:
        return _semantic_model

    try:
        from sentence_transformers import SentenceTransformer

        _semantic_model = SentenceTransformer(SEMANTIC_MODEL_NAME)
        return _semantic_model
    except Exception as ex:
        _semantic_model_error = ex
        return None


def semantic_similarity(task_text: str, target_text: str) -> float:
    task_text = (task_text or "").strip()
    target_text = (target_text or "").strip()
    if not task_text or not target_text:
        return 0.0

    model = get_semantic_model()
    if model is None:
        # Fallback for environments where sentence-transformers is not available.
        return cosine_similarity_bow(tokenize(task_text), tokenize(target_text))

    embeddings = model.encode([task_text, target_text], normalize_embeddings=True)
    task_embedding = embeddings[0]
    target_embedding = embeddings[1]

    dot = float(sum(float(a) * float(b) for a, b in zip(task_embedding, target_embedding)))
    return max(0.0, min(1.0, dot))


def parse_runtime_params(payload: MatchRequestBase) -> Dict[str, float | int]:
    alpha = DEFAULT_ALPHA if payload.alpha is None else float(payload.alpha)
    top_k = DEFAULT_TOP_K if payload.top_k is None else int(payload.top_k)
    min_score = DEFAULT_MIN_SCORE if payload.min_score is None else float(payload.min_score)
    return {
        "alpha": max(0.0, min(1.0, alpha)),
        "top_k": max(1, top_k),
        "min_score": max(0.0, min(100.0, min_score)),
    }


def fetch_task_owner(cur, task_id: int) -> int | None:
    cur.execute("SELECT company_user_id FROM tasks WHERE id = %s", (task_id,))
    row = cur.fetchone()
    return int(row[0]) if row else None


def fetch_task_required_skills(cur, task_id: int) -> List[SkillRequirement]:
    cur.execute(
        """
        SELECT s.name, COALESCE(ts.level, 3), COALESCE(ts.is_required, true)
        FROM task_skills ts
        JOIN skills s ON s.id = ts.skill_id
        WHERE ts.task_id = %s
        """,
        (task_id,),
    )
    return [
        SkillRequirement(skill_name=str(r[0]), required_level=int(r[1]), is_required=bool(r[2]))
        for r in cur.fetchall()
    ]


def fetch_task_text(cur, task_id: int) -> str:
    cur.execute(
        """
        SELECT COALESCE(title, ''), COALESCE(description, ''), COALESCE(detail_title, ''), COALESCE(detail_body, '')
        FROM tasks
        WHERE id = %s
        """,
        (task_id,),
    )
    row = cur.fetchone()
    if not row:
        return ""
    return " ".join(str(part or "") for part in row)


def fetch_open_task_ids(cur) -> List[int]:
    cur.execute("SELECT id FROM tasks WHERE LOWER(COALESCE(status, '')) = 'open'")
    return [int(r[0]) for r in cur.fetchall()]


def fetch_student_skills(cur, student_user_id: int) -> Dict[str, StudentSkill]:
    cur.execute(
        """
        SELECT s.name, COALESCE(ss.level, 3)
        FROM student_skills ss
        JOIN skills s ON s.id = ss.skill_id
        WHERE ss.student_user_id = %s
        """,
        (student_user_id,),
    )
    result: Dict[str, StudentSkill] = {}
    for row in cur.fetchall():
        raw_name = str(row[0]).strip()
        key = canonicalize_skill_name(raw_name)
        result[key] = StudentSkill(skill_name=raw_name, level=int(row[1]))
    return result


def fetch_student_profile_text(cur, student_user_id: int) -> str:
    cur.execute(
        """
        SELECT
            COALESCE(full_name, ''),
            COALESCE(bio, ''),
            COALESCE(major, ''),
            COALESCE(categories_of_interest, ''),
            COALESCE(github_url, ''),
            COALESCE(website_url, '')
        FROM student_profiles
        WHERE user_id = %s
        """,
        (student_user_id,),
    )
    row = cur.fetchone()
    if not row:
        return ""
    return " ".join(str(part or "") for part in row)


def fetch_student_completed_projects(cur, student_user_id: int) -> List[ProjectEvidence]:
    cur.execute(
        """
        SELECT
            t.id,
            COALESCE(t.title, ''),
            COALESCE(t.description, ''),
            COALESCE(s.submission_content, '')
        FROM submissions s
        JOIN tasks t ON t.id = s.task_id
        WHERE s.student_user_id = %s
          AND LOWER(COALESCE(s.status, '')) IN ('approved', 'completed', 'done')
        """,
        (student_user_id,),
    )
    projects: List[ProjectEvidence] = []
    for row in cur.fetchall():
        task_id = int(row[0])
        title = str(row[1] or "")
        text = " ".join(str(part or "") for part in row[1:])
        projects.append(ProjectEvidence(task_id=task_id, title=title, text=text))
    return projects


def fetch_task_candidate_ids(cur, task_id: int) -> List[int]:
    cur.execute("SELECT DISTINCT student_user_id FROM submissions WHERE task_id = %s", (task_id,))
    return [int(r[0]) for r in cur.fetchall()]


def evaluate_hard_filter(required: List[SkillRequirement], student_map: Dict[str, StudentSkill]) -> HardFilterResult:
    if not required:
        return HardFilterResult(passed=True, score=100.0, missing_skills=[], below_level_skills=[])

    weighted_sum = 0.0
    total_weight = 0.0
    missing_skills: List[str] = []
    below_level_skills: List[str] = []

    for req in required:
        req_key = canonicalize_skill_name(req.skill_name)
        student_skill = student_map.get(req_key)

        weight = float(req.required_level) * (1.25 if req.is_required else 0.75)
        total_weight += weight

        if student_skill is None:
            if req.is_required:
                missing_skills.append(req.skill_name)
            continue

        if req.is_required and student_skill.level + REQUIRED_LEVEL_GAP_TOLERANCE < req.required_level:
            below_level_skills.append(
                f"{req.skill_name} (required={req.required_level}, student={student_skill.level})"
            )

        level_ratio = min(float(student_skill.level) / max(float(req.required_level), 1.0), 1.0)
        weighted_sum += level_ratio * weight

    score = 0.0 if total_weight == 0 else max(0.0, min(100.0, (weighted_sum / total_weight) * 100.0))
    passed = len(missing_skills) == 0 and len(below_level_skills) == 0
    return HardFilterResult(
        passed=passed,
        score=score,
        missing_skills=missing_skills,
        below_level_skills=below_level_skills,
    )


def evaluate_semantic_stage(task_text: str, profile_text: str, projects: List[ProjectEvidence]) -> Dict[str, Any]:
    profile_score = semantic_similarity(task_text, profile_text)

    project_scored: List[Dict[str, Any]] = []
    for project in projects:
        sim = semantic_similarity(task_text, project.text)
        project_scored.append(
            {
                "task_id": project.task_id,
                "title": project.title,
                "similarity": round(sim * 100.0, 2),
            }
        )

    project_scored.sort(key=lambda x: x["similarity"], reverse=True)
    top_projects = project_scored[:2]
    avg_project_similarity = 0.0
    if project_scored:
        avg_project_similarity = sum(float(item["similarity"]) for item in project_scored) / len(project_scored)

    completion_factor = min(len(projects) / 5.0, 1.0) * 100.0
    semantic_score = (
        profile_score * 30.0
        + (avg_project_similarity / 100.0) * 55.0
        + (completion_factor / 100.0) * 15.0
    )

    return {
        "semantic_score": max(0.0, min(100.0, semantic_score)),
        "top_projects": top_projects,
        "profile_similarity": round(profile_score * 100.0, 2),
    }


def score_student_against_task(
    cur,
    task_id: int,
    student_user_id: int,
    alpha: float,
) -> Dict[str, Any]:
    required_skills = fetch_task_required_skills(cur, task_id)
    student_skills = fetch_student_skills(cur, student_user_id)
    task_text = fetch_task_text(cur, task_id)
    student_profile_text = fetch_student_profile_text(cur, student_user_id)
    projects = fetch_student_completed_projects(cur, student_user_id)

    if not task_text and not required_skills:
        raise HTTPException(status_code=404, detail="Task not found or not rankable")

    hard_result = evaluate_hard_filter(required_skills, student_skills)
    reasons: List[str] = []
    if hard_result.missing_skills:
        reasons.append(f"Missing required skills: {', '.join(hard_result.missing_skills)}")
    if hard_result.below_level_skills:
        reasons.append(f"Required skill levels not met: {', '.join(hard_result.below_level_skills)}")

    if not hard_result.passed:
        return {
            "score": 0,
            "hard_score": round(hard_result.score, 2),
            "semantic_score": 0.0,
            "breakdown": {
                "hard_score": round(hard_result.score, 2),
                "semantic_score": 0.0,
                "alpha": round(alpha, 2),
                "filtered": 1.0,
            },
            "reasons": reasons,
            "top_projects": [],
            "missing_skills": hard_result.missing_skills,
            "filtered": True,
        }

    semantic_stage = evaluate_semantic_stage(task_text, student_profile_text, projects)
    semantic_score = float(semantic_stage["semantic_score"])
    final_score = clamp_100((alpha * hard_result.score) + ((1.0 - alpha) * semantic_score))

    if not reasons:
        reasons.append("Passed hard filtering and semantic analysis.")

    return {
        "score": final_score,
        "hard_score": round(hard_result.score, 2),
        "semantic_score": round(semantic_score, 2),
        "breakdown": {
            "hard_score": round(hard_result.score, 2),
            "semantic_score": round(semantic_score, 2),
            "alpha": round(alpha, 2),
            "profile_similarity": float(semantic_stage["profile_similarity"]),
            "filtered": 0.0,
        },
        "reasons": reasons,
        "top_projects": semantic_stage["top_projects"],
        "missing_skills": [],
        "filtered": False,
    }


@app.get("/health")
def health() -> Dict[str, str]:
    model_ready = get_semantic_model() is not None
    return {
        "status": "ok",
        "semantic": "enabled" if SEMANTIC_ENABLED else "disabled",
        "semantic_model_loaded": "yes" if model_ready else "no",
    }


@app.post("/api/v1/match/score-student-task")
def score_student_task(payload: ScoreStudentTaskRequest) -> Dict[str, object]:
    params = parse_runtime_params(payload)
    alpha = float(params["alpha"])

    with db_cursor() as cur:
        result = score_student_against_task(cur, payload.task_id, payload.student_user_id, alpha)

    return {
        "task_id": payload.task_id,
        "student_user_id": payload.student_user_id,
        **result,
    }


@app.post("/api/v1/match/rank-task-candidates")
def rank_task_candidates(payload: RankTaskCandidatesRequest) -> Dict[str, object]:
    params = parse_runtime_params(payload)
    alpha = float(params["alpha"])
    top_k = int(params["top_k"])
    min_score = float(params["min_score"])

    with db_cursor() as cur:
        owner = fetch_task_owner(cur, payload.task_id)
        if owner is None:
            raise HTTPException(status_code=404, detail="Task not found")
        if owner != payload.company_user_id:
            raise HTTPException(status_code=403, detail="Company is not authorized for this task")

        candidate_ids = fetch_task_candidate_ids(cur, payload.task_id)
        ranked: List[CandidateScore] = []
        filtered_out = 0

        for student_user_id in candidate_ids:
            result = score_student_against_task(cur, payload.task_id, student_user_id, alpha)
            if result["filtered"]:
                filtered_out += 1
                continue
            if result["score"] < min_score:
                continue

            ranked.append(
                CandidateScore(
                    student_user_id=student_user_id,
                    score=int(result["score"]),
                    hard_score=float(result["hard_score"]),
                    semantic_score=float(result["semantic_score"]),
                    breakdown=dict(result["breakdown"]),
                    reasons=list(result["reasons"]),
                    top_projects=list(result["top_projects"]),
                    missing_skills=list(result["missing_skills"]),
                )
            )

        ranked.sort(key=lambda item: item.score, reverse=True)
        ranked = ranked[:top_k]

    return {
        "task_id": payload.task_id,
        "alpha": alpha,
        "top_k": top_k,
        "min_score": min_score,
        "filtered_out": filtered_out,
        "candidates": [item.model_dump() for item in ranked],
    }


@app.post("/api/v1/match/recommend-tasks")
def recommend_tasks(payload: RecommendTasksRequest) -> Dict[str, object]:
    params = parse_runtime_params(payload)
    alpha = float(params["alpha"])
    top_k = int(params["top_k"])
    min_score = float(params["min_score"])

    with db_cursor() as cur:
        task_ids = fetch_open_task_ids(cur)
        ranked: List[TaskScore] = []

        for task_id in task_ids:
            result = score_student_against_task(cur, task_id, payload.student_user_id, alpha)
            if result["filtered"]:
                continue
            if result["score"] < min_score:
                continue

            ranked.append(
                TaskScore(
                    task_id=task_id,
                    score=int(result["score"]),
                    hard_score=float(result["hard_score"]),
                    semantic_score=float(result["semantic_score"]),
                    breakdown=dict(result["breakdown"]),
                    reasons=list(result["reasons"]),
                    top_projects=list(result["top_projects"]),
                    missing_skills=list(result["missing_skills"]),
                )
            )

        ranked.sort(key=lambda item: item.score, reverse=True)
        ranked = ranked[:top_k]

    return {
        "student_user_id": payload.student_user_id,
        "alpha": alpha,
        "top_k": top_k,
        "min_score": min_score,
        "tasks": [item.model_dump() for item in ranked],
    }
