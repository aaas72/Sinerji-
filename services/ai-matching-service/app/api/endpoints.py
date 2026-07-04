from fastapi import APIRouter, HTTPException # type: ignore
from typing import List
from app.models.schemas import (
    MatchRequest, TaskMatchResponse, CandidateScore,
    StudentMatchRequest, StudentMatchResponse, TaskScore,
    SingleMatchRequest, SingleMatchResponse
)
from app.database.connection import db_cursor
from app.database.queries import (
    fetch_student_skills, fetch_student_profile_text, fetch_student_completed_projects,
    fetch_task_requirements, fetch_task_owner_id, fetch_submission_content, fetch_task_candidate_ids,
    fetch_task_search_text, fetch_student_applied_task_ids, fetch_recommended_task_ids
)
from app.services.matching import score_student_against_task
from app.services.ontology import ensure_ontology_table, load_ontology_cache
from app.core.config import DEFAULT_ALPHA, DEFAULT_TOP_K, DEFAULT_MIN_SCORE

router = APIRouter(prefix="/api/v1")

@router.post("/match/rank-task-candidates", response_model=TaskMatchResponse)
async def match_task_candidates(payload: MatchRequest):
    alpha = DEFAULT_ALPHA if payload.alpha is None else float(payload.alpha)
    top_k = DEFAULT_TOP_K if payload.top_k is None else int(payload.top_k)
    
    with db_cursor() as cur:
        ensure_ontology_table(cur)
        ontology_cache = load_ontology_cache(cur)  # ONE query instead of 160+
        candidate_ids = fetch_task_candidate_ids(cur, payload.task_id)
        task_text = fetch_task_search_text(cur, payload.task_id)
        
        ranked: List[CandidateScore] = []
        filtered_out = 0
        
        for student_user_id in candidate_ids:
            result = score_student_against_task(
                cur, payload.task_id, student_user_id, alpha, task_text, ontology_cache
            )
            if result["filtered"]:
                filtered_out += 1
                continue
            
            ranked.append(CandidateScore(
                student_user_id=student_user_id,
                score=result["score"],
                filtered=False,
                reasons=result["reasons"],
                explanation=result.get("explanation"),
                top_projects=result["top_projects"]
            ))
            
    ranked.sort(key=lambda x: x.score, reverse=True)
    return TaskMatchResponse(
        task_id=payload.task_id,
        candidates=ranked[:top_k],
        filtered_out=filtered_out
    )

@router.post("/match/recommend-tasks", response_model=StudentMatchResponse)
async def match_student_tasks(payload: StudentMatchRequest):
    alpha = DEFAULT_ALPHA if payload.alpha is None else float(payload.alpha)
    min_score = DEFAULT_MIN_SCORE if payload.min_score is None else float(payload.min_score)
    
    with db_cursor() as cur:
        ensure_ontology_table(cur)
        ontology_cache = load_ontology_cache(cur)
        task_ids = fetch_recommended_task_ids(cur, payload.student_user_id)
        ranked: List[TaskScore] = []
        
        for task_id in task_ids:
            result = score_student_against_task(
                cur, task_id, payload.student_user_id, alpha,
                ontology_cache=ontology_cache
            )
            if result["filtered"] or result["score"] < min_score:
                continue
                
            ranked.append(TaskScore(
                task_id=task_id,
                score=result["score"],
                reasons=result["reasons"],
                explanation=result.get("explanation")
            ))
            
    ranked.sort(key=lambda x: x.score, reverse=True)
    return StudentMatchResponse(
        student_user_id=payload.student_user_id,
        tasks=ranked
    )

@router.post("/match/score-student-task", response_model=SingleMatchResponse)
async def match_single_pair(payload: SingleMatchRequest):
    alpha = DEFAULT_ALPHA if payload.alpha is None else float(payload.alpha)
    
    with db_cursor() as cur:
        ensure_ontology_table(cur)
        ontology_cache = load_ontology_cache(cur)
        result = score_student_against_task(
            cur, payload.task_id, payload.student_user_id, alpha,
            ontology_cache=ontology_cache
        )
        
    return SingleMatchResponse(
        task_id=payload.task_id,
        student_user_id=payload.student_user_id,
        score=result["score"],
        filtered=result["filtered"],
        reasons=result["reasons"],
        explanation=result.get("explanation"),
        semantic_details=result["semantic_details"]
    )

@router.post("/ontology/sync-skills")
async def sync_ontology_skills():
    """Fetch all skills in the database and pre-populate their ontology parents."""
    from app.services.ontology import get_skill_parents
    
    with db_cursor() as cur:
        ensure_ontology_table(cur)
        cur.execute("SELECT name FROM skills")
        skills = [str(row[0]) for row in cur.fetchall()]
        
        synced_count = 0
        ontology_cache = {}
        
        for skill_name in skills:
            get_skill_parents(cur, skill_name, ontology_cache)
            synced_count += 1
            
    return {
        "status": "success",
        "message": f"Successfully synced and pre-calculated parents for {synced_count} skills in the ontology cache.",
        "skills_processed": synced_count
    }
