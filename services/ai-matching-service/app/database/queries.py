from typing import List, Optional
from app.models.schemas import SkillRequirement, StudentSkill, ProjectEvidence

def fetch_task_requirements(cur, task_id: int) -> List[SkillRequirement]:
    cur.execute(
        """
        SELECT s.name, ts.level, ts.is_required 
        FROM task_skills ts
        JOIN skills s ON ts.skill_id = s.id
        WHERE ts.task_id = %s
        """,
        (task_id,),
    )
    return [
        SkillRequirement(
            skill_name=str(r[0]), required_level=int(r[1]), is_required=bool(r[2])
        )
        for r in cur.fetchall()
    ]

def fetch_task_owner_id(cur, task_id: int) -> Optional[int]:
    cur.execute("SELECT company_user_id FROM tasks WHERE id = %s", (task_id,))
    row = cur.fetchone()
    return int(row[0]) if row else None

def fetch_task_search_text(cur, task_id: int) -> str:
    cur.execute("SELECT title, description FROM tasks WHERE id = %s", (task_id,))
    row = cur.fetchone()
    return " ".join(str(part or "") for part in row) if row else ""

def fetch_student_skills(cur, student_user_id: int) -> List[StudentSkill]:
    cur.execute(
        """
        SELECT s.name, ss.level 
        FROM student_skills ss
        JOIN skills s ON ss.skill_id = s.id
        WHERE ss.student_user_id = %s
        """,
        (student_user_id,),
    )
    return [StudentSkill(skill_name=str(r[0]), level=int(r[1])) for r in cur.fetchall()]

def fetch_student_profile_text(cur, student_user_id: int) -> str:
    cur.execute("SELECT full_name, bio FROM student_profiles WHERE user_id = %s", (student_user_id,))
    row = cur.fetchone()
    return " ".join(str(part or "") for part in row) if row else ""

def fetch_student_completed_projects(cur, student_user_id: int) -> List[ProjectEvidence]:
    cur.execute(
        """
        SELECT t.title, t.description
        FROM submissions s
        JOIN tasks t ON s.task_id = t.id
        WHERE s.student_user_id = %s AND s.status = 'COMPLETED'
        """,
        (student_user_id,),
    )
    return [ProjectEvidence(title=str(r[0]), description=str(r[1] or "")) for r in cur.fetchall()]

def fetch_submission_content(cur, task_id: int, student_user_id: int) -> str:
    """Fetch the student's cover letter / submission text for semantic analysis."""
    cur.execute(
        "SELECT submission_content FROM submissions WHERE task_id = %s AND student_user_id = %s",
        (task_id, student_user_id),
    )
    row = cur.fetchone()
    return str(row[0] or "") if row else ""

def fetch_task_candidate_ids(cur, task_id: int) -> List[int]:
    cur.execute(
        "SELECT DISTINCT student_user_id FROM submissions WHERE task_id = %s",
        (task_id,),
    )
    return [int(r[0]) for r in cur.fetchall()]

def fetch_student_applied_task_ids(cur, student_user_id: int) -> List[int]:
    cur.execute("SELECT DISTINCT task_id FROM submissions WHERE student_user_id = %s", (student_user_id,))
    return [int(r[0]) for r in cur.fetchall()]

def fetch_recommended_task_ids(cur, student_user_id: int) -> List[int]:
    cur.execute(
        """
        SELECT id FROM tasks 
        WHERE id NOT IN (SELECT task_id FROM submissions WHERE student_user_id = %s)
        """, 
        (student_user_id,)
    )
    return [int(r[0]) for r in cur.fetchall()]
