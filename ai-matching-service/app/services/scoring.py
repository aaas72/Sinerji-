"""
Intelligent Scoring Engine – v3 (Semantic-first, no hard binary filter).

Philosophy
----------
The old engine was a binary gate: fail one required skill → score = 0.
This engine treats matching as a *continuous* problem:

  1. Skill Compatibility Score  (40 % of alpha weight)
     For every required skill, the model searches the student's skill list
     using *semantic embeddings*. A student who knows "Vue.js" gets
     partial credit for a "React" requirement because they are semantically
     close frontend frameworks. Level difference further scales the credit.

  2. Profile / Portfolio Semantic Score  (60 % of alpha weight)
     The student's bio, major, interests, and completed project texts are
     compared against the full task description using transformer embeddings.
     This rewards domain experience even when exact skill names differ.

  3. Final Fusion
     final = alpha × skill_score + (1 - alpha) × semantic_score

  No student ever receives a hard-zero due to a missing skill alias.
  Missing *required* skills reduce the score smoothly via a configurable
  penalty curve, and are reported transparently in the reasons list.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple

from app.models.domain import (
    ProjectEvidence,
    SkillRequirement,
    StudentSkill,
)
from app.services.semantic import (
    best_skill_match,
    semantic_similarity,
    skill_semantic_similarity,
)
from app.skill_ontology import expand_student_implied_skills
from app.utils import canonicalize_skill_name, clamp_100

# ── Tuneable thresholds ───────────────────────────────────────────────────────

# Similarity above which a student skill is counted as a full semantic match.
SKILL_FULL_MATCH_THRESHOLD = 0.82

# Similarity above which the student gets *partial* credit (semantic proximity).
SKILL_PARTIAL_MATCH_THRESHOLD = 0.55

# Maximum level gap allowed before applying a soft penalty (not a hard reject).
SOFT_LEVEL_GAP_PENALTY_THRESHOLD = 1

# When a required skill is completely missing, penalise by this fraction of its weight.
# 0.0 = no credit at all, 0.25 = 25 % of full credit (encourages close-enough students).
MISSING_REQUIRED_SKILL_CREDIT = 0.0
MISSING_PREFERRED_SKILL_CREDIT = 0.15

# Semantic profile stage weights (must sum to 1.0)
PROFILE_WEIGHT = 0.35
PROJECT_WEIGHT = 0.50
COMPLETION_WEIGHT = 0.15

# Project portfolio: normalise against this count for "completion factor"
PORTFOLIO_NORM_SIZE = 5

# Hard Filter: Minimum percentage of mandatory skills required to pass [0.0 - 1.0]
MANDATORY_THRESHOLD = 0.85


# ── Stage 1: Intelligent Skill Compatibility ──────────────────────────────────

def _skill_satisfaction(
    req: SkillRequirement,
    student_skill_name: str,
    student_level: int,
    similarity: float,
) -> float:
    """
    Compute how well one student skill satisfies one task requirement.

    Returns a value in [0, 1].
    - similarity ≥ FULL threshold  → level-scaled satisfaction
    - PARTIAL ≤ similarity < FULL  → partial credit scaled by similarity
    - similarity < PARTIAL         → minimal credit (treated as missing)
    """
    level_ratio = min(student_level / max(req.required_level, 1), 1.0)

    if similarity >= SKILL_FULL_MATCH_THRESHOLD:
        # Full semantic match – only penalise for significant level gap
        if student_level < req.required_level - SOFT_LEVEL_GAP_PENALTY_THRESHOLD:
            # Soft penalty: scale proportionally, never zero
            return max(0.3, level_ratio)
        return level_ratio

    if similarity >= SKILL_PARTIAL_MATCH_THRESHOLD:
        # Partial match – scale by both similarity and level
        return similarity * level_ratio

    return 0.0


def evaluate_skill_compatibility(
    required: List[SkillRequirement],
    student_map: Dict[str, StudentSkill],
) -> Dict[str, Any]:
    """
    Intelligently score how compatible a student's skills are with a task.

    Three matching pathways are tried for each required skill, and the
    best result across all three is used:

      1. Exact / alias match  → similarity = 1.0
      2. Ontology implication → confidence from the skill knowledge graph
                                e.g. student has Django → satisfies Python req
      3. Semantic embedding   → transformer cosine similarity
                                e.g. React ≈ Vue.js

    The score for each skill = _skill_satisfaction(best_similarity, level_ratio)
    Weights: required_level × (1.5 if is_required else 0.8)
    """
    if not required:
        return {
            "score": 100.0,
            "skill_details": [],
            "missing_required": [],
            "partially_matched": [],
        }

    student_raw_names = [sk.skill_name for sk in student_map.values()]

    # Pre-build the implied-skill expansion once for this student
    # implied_map: {canonical_required_skill → (confidence, source_skill_name, source_level)}
    implied_map = expand_student_implied_skills(student_map)

    weighted_sum = 0.0
    total_weight = 0.0
    skill_details: List[Dict[str, Any]] = []
    missing_required: List[str] = []
    partially_matched: List[str] = []

    for req in required:
        req_key = canonicalize_skill_name(req.skill_name)
        weight = float(req.required_level) * (1.5 if req.is_required else 0.8)
        total_weight += weight

        # ── Pathway 1: Exact / alias match ─────────────────────────────────
        exact_match: Optional[StudentSkill] = student_map.get(req_key)
        if exact_match is not None:
            satisfaction = _skill_satisfaction(
                req, exact_match.skill_name, exact_match.level, 1.0
            )
            weighted_sum += satisfaction * weight
            skill_details.append({
                "required": req.skill_name,
                "matched_to": exact_match.skill_name,
                "match_type": "exact",
                "similarity": 1.0,
                "student_level": exact_match.level,
                "required_level": req.required_level,
                "satisfaction": round(satisfaction, 3),
            })
            continue

        # ── Pathway 2: Ontology implication ────────────────────────────────
        # The student doesn't have the skill explicitly, but one of their
        # skills implies it through the knowledge graph.
        ontology_result = implied_map.get(req_key)
        ontology_confidence: float = 0.0
        ontology_source: Optional[str] = None
        ontology_level: int = 0
        if ontology_result is not None:
            ontology_confidence, ontology_source, ontology_level = ontology_result

        # ── Pathway 3: Semantic embedding similarity ────────────────────────
        best_sem_name, best_sem_sim = best_skill_match(req.skill_name, student_raw_names)
        sem_student_level = 0
        if best_sem_name is not None and best_sem_sim >= SKILL_PARTIAL_MATCH_THRESHOLD:
            sem_canon = canonicalize_skill_name(best_sem_name)
            sem_sk = student_map.get(sem_canon)
            if sem_sk is None:
                for sk in student_map.values():
                    if sk.skill_name == best_sem_name:
                        sem_sk = sk
                        break
            sem_student_level = sem_sk.level if sem_sk else 3

        # ── Choose best pathway ─────────────────────────────────────────────
        ontology_sat = 0.0
        if ontology_confidence >= SKILL_PARTIAL_MATCH_THRESHOLD:
            ontology_sat = _skill_satisfaction(
                req, ontology_source or "", ontology_level, ontology_confidence
            )

        sem_sat = 0.0
        if best_sem_name and best_sem_sim >= SKILL_PARTIAL_MATCH_THRESHOLD:
            sem_sat = _skill_satisfaction(req, best_sem_name, sem_student_level, best_sem_sim)

        if ontology_sat == 0.0 and sem_sat == 0.0:
            # ── No meaningful match across all pathways ─────────────────────
            fallback_credit = (
                MISSING_REQUIRED_SKILL_CREDIT
                if req.is_required
                else MISSING_PREFERRED_SKILL_CREDIT
            )
            weighted_sum += fallback_credit * weight
            if req.is_required:
                missing_required.append(req.skill_name)
            skill_details.append({
                "required": req.skill_name,
                "matched_to": None,
                "match_type": "missing",
                "similarity": round(max(ontology_confidence, best_sem_sim or 0.0), 3),
                "student_level": 0,
                "required_level": req.required_level,
                "satisfaction": fallback_credit,
            })

        elif ontology_sat >= sem_sat:
            # Ontology pathway wins
            weighted_sum += ontology_sat * weight
            match_type = (
                "ontology_strong"
                if ontology_confidence >= SKILL_FULL_MATCH_THRESHOLD
                else "ontology_partial"
            )
            skill_details.append({
                "required": req.skill_name,
                "matched_to": ontology_source,
                "match_type": match_type,
                "ontology_confidence": round(ontology_confidence, 3),
                "student_level": ontology_level,
                "required_level": req.required_level,
                "satisfaction": round(ontology_sat, 3),
            })
            if match_type == "ontology_partial":
                partially_matched.append(
                    f"{req.skill_name} (implied by {ontology_source}, conf={ontology_confidence:.2f})"
                )

        else:
            # Semantic pathway wins
            weighted_sum += sem_sat * weight
            match_type = (
                "semantic_full"
                if best_sem_sim >= SKILL_FULL_MATCH_THRESHOLD
                else "semantic_partial"
            )
            skill_details.append({
                "required": req.skill_name,
                "matched_to": best_sem_name,
                "match_type": match_type,
                "similarity": round(best_sem_sim, 3),
                "student_level": sem_student_level,
                "required_level": req.required_level,
                "satisfaction": round(sem_sat, 3),
            })
            if match_type == "semantic_partial":
                partially_matched.append(
                    f"{req.skill_name} -> {best_sem_name} (sim={best_sem_sim:.2f})"
                )

    raw_score = 0.0 if total_weight == 0 else (weighted_sum / total_weight) * 100.0
    score = max(0.0, min(100.0, raw_score))

    return {
        "score": score,
        "skill_details": skill_details,
        "missing_required": missing_required,
        "partially_matched": partially_matched,
    }


# ── Stage 2: Profile & Portfolio Semantic Relevance ───────────────────────────

def evaluate_semantic_stage(
    task_text: str,
    profile_text: str,
    projects: List[ProjectEvidence],
) -> Dict[str, Any]:
    """
    Measure how contextually relevant a student is to a task.

    Components:
      - Profile similarity:       student bio / major / interests vs task
      - Project portfolio:        completed project descriptions vs task
      - Completion factor:        rewards breadth of experience
    """
    profile_score = semantic_similarity(task_text, profile_text)

    project_scored: List[Dict[str, Any]] = []
    for project in projects:
        sim = semantic_similarity(task_text, project.text)
        project_scored.append({
            "task_id": project.task_id,
            "title": project.title,
            "similarity": round(sim * 100.0, 2),
        })

    project_scored.sort(key=lambda x: x["similarity"], reverse=True)
    top_projects = project_scored[:2]

    if not projects:
        # No portfolio → fall back to profile only
        semantic_score = profile_score * 100.0
    else:
        avg_project_sim = (
            sum(float(p["similarity"]) for p in project_scored) / len(project_scored)
        )
        completion_factor = min(len(projects) / PORTFOLIO_NORM_SIZE, 1.0) * 100.0
        semantic_score = (
            profile_score * (PROFILE_WEIGHT * 100.0)
            + (avg_project_sim / 100.0) * (PROJECT_WEIGHT * 100.0)
            + (completion_factor / 100.0) * (COMPLETION_WEIGHT * 100.0)
        )

    return {
        "semantic_score": max(0.0, min(100.0, semantic_score)),
        "top_projects": top_projects,
        "profile_similarity": round(profile_score * 100.0, 2),
    }


# ── Stage 3: Final Score Fusion ───────────────────────────────────────────────

def calculate_score(
    alpha: float,
    required_skills: List[SkillRequirement],
    student_skills: Dict[str, StudentSkill],
    task_text: str,
    student_profile_text: str,
    projects: List[ProjectEvidence],
) -> Dict[str, Any]:
    """
    Fuse skill compatibility and semantic relevance into a final score.

    Final = alpha × skill_score + (1 - alpha) × semantic_score

    Key differences from the old engine:
    - No binary hard-filter gate.  Missing skills reduce score, not zero it.
    - Semantic stage always runs, even when skill coverage is low.
    - Skill matching uses embeddings → understands skill family relationships.
    """
    if not task_text and not required_skills:
        return {
            "score": 0,
            "hard_score": 0.0,
            "semantic_score": 0.0,
            "breakdown": {
                "skill_score": 0.0,
                "semantic_score": 0.0,
                "alpha": round(alpha, 2),
                "profile_similarity": 0.0,
            },
            "reasons": ["Task not found or has no data to rank against."],
            "top_projects": [],
            "missing_skills": [],
            "skill_details": [],
            "filtered": False,
        }

    # ── Stage 1 ────────────────────────────────────────────────────────────────
    compat = evaluate_skill_compatibility(required_skills, student_skills)
    skill_score = compat["score"]

    # ── Hard Filter Gate ──────────────────────────────────────────────────────
    mandatory_reqs = [r for r in required_skills if r.is_required]
    filtered = False
    if mandatory_reqs:
        missing_count = len(compat["missing_required"])
        # In v3 compat, we should also consider skills that matched very poorly
        # but for simplicity and parity with v2, we use missing_required.
        met_count = len(mandatory_reqs) - missing_count
        success_rate = met_count / len(mandatory_reqs)
        if success_rate < MANDATORY_THRESHOLD:
            filtered = True
            print(f"[GATE] Student REJECTED: {met_count}/{len(mandatory_reqs)} skills ({success_rate:.2f} < {MANDATORY_THRESHOLD})")
        else:
            print(f"[GATE] Student PASSED: {met_count}/{len(mandatory_reqs)} skills ({success_rate:.2f} >= {MANDATORY_THRESHOLD})")

    if filtered:
        return {
            "score": 0,
            "hard_score": round(skill_score, 2),
            "semantic_score": 0.0,
            "breakdown": {
                "skill_score": round(skill_score, 2),
                "semantic_score": 0.0,
                "alpha": round(alpha, 2),
                "filtered": 1.0,
            },
            "reasons": [f"Missing too many mandatory skills ({len(compat['missing_required'])} missing)."],
            "top_projects": [],
            "missing_skills": compat["missing_required"],
            "skill_details": compat["skill_details"],
            "strengths": [],
            "weaknesses": [f"Missing mandatory skill: {req}" for req in compat["missing_required"]],
            "filtered": True,
        }

    # ── Stage 2 ────────────────────────────────────────────────────────────────
    sem_stage = evaluate_semantic_stage(task_text, student_profile_text, projects)
    semantic_score = sem_stage["semantic_score"]

    # ── Fusion ─────────────────────────────────────────────────────────────────
    final_score = clamp_100(alpha * skill_score + (1.0 - alpha) * semantic_score)

    # ── Build human-readable reasons ───────────────────────────────────────────
    reasons: List[str] = []

    if compat["missing_required"]:
        reasons.append(
            f"Missing required skills: {', '.join(compat['missing_required'])}"
        )
    if compat["partially_matched"]:
        reasons.append(
            f"Semantically matched (partial credit): {'; '.join(compat['partially_matched'])}"
        )
    if not reasons:
        reasons.append(
            f"Strong match — skill compatibility {skill_score:.0f}%, "
            f"semantic relevance {semantic_score:.0f}%."
        )
    elif final_score > 0:
        reasons.append(
            f"Overall skill compatibility: {skill_score:.0f}%, "
            f"semantic relevance: {semantic_score:.0f}%."
        )

    # ── Analysis (Strengths & Weaknesses) ──────────────────────────────────────
    strengths = []
    weaknesses = []

    # Analyze skills
    for detail in compat["skill_details"]:
        req = detail["required"]
        if detail["match_type"] == "exact":
            strengths.append(f"Strong mastery of {req} (Exact match)")
        elif detail.get("satisfaction", 0) > 0.7:
            strengths.append(f"Good competence in {req} via {detail.get('matched_to', 'direct skill')}")
        elif detail["match_type"] == "missing":
            weaknesses.append(f"Missing mandatory skill: {req}")
        elif detail.get("satisfaction", 0) < 0.4:
            weaknesses.append(f"Weak connection to {req} (Similarity: {int(detail.get('similarity', 0)*100)}%)")

    # Analyze projects
    top_projects = sem_stage["top_projects"]
    if top_projects:
        best_proj = top_projects[0]
        if best_proj["similarity"] > 80:
            strengths.append(f"Excellent portfolio evidence: '{best_proj['title']}'")

    return {
        "score": final_score,
        "hard_score": round(skill_score, 2),
        "semantic_score": round(semantic_score, 2),
        "breakdown": {
            "skill_score": round(skill_score, 2),
            "semantic_score": round(semantic_score, 2),
            "alpha": round(alpha, 2),
            "profile_similarity": sem_stage["profile_similarity"],
        },
        "reasons": reasons,
        "top_projects": top_projects,
        "missing_skills": compat["missing_required"],
        "skill_details": compat["skill_details"],
        "strengths": strengths[:4],
        "weaknesses": weaknesses[:4],
        "filtered": False,  # No hard filter – score is always meaningful
    }


# ── Convenience wrapper ───────────────────────────────────────────────────────

def score_student_against_task(
    cur,
    task_id: int,
    student_user_id: int,
    alpha: float,
) -> Dict[str, Any]:
    """Fetch all data for one student × one task, then score intelligently."""
    from app.repositories.student_repo import (
        fetch_student_completed_projects,
        fetch_student_profile_text,
        fetch_student_skills,
    )
    from app.repositories.task_repo import fetch_task_required_skills, fetch_task_text

    required_skills = fetch_task_required_skills(cur, task_id)
    student_skills_map = fetch_student_skills(cur, student_user_id)
    task_text = fetch_task_text(cur, task_id)
    student_profile_text = fetch_student_profile_text(cur, student_user_id)
    projects = fetch_student_completed_projects(cur, student_user_id)

    return calculate_score(
        alpha, required_skills, student_skills_map, task_text, student_profile_text, projects
    )
