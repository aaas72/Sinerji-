export interface Submission {
    id: number;
    task_id: number;
    student_user_id: number;
    submission_content: string | null;
    status: string | null; // 'pending' | 'approved' | 'rejected'
    submitted_at: string;
    proposed_budget?: string | null;
    estimated_delivery_days?: number | null;
    ai_match_score?: number | null;
    ai_match_details?: {
        score: number;
        hard_score?: number;
        semantic_score?: number;
        reasons?: string[];
        missing_skills?: string[];
        top_projects?: Array<{ task_id: number; title: string; similarity: number }>;
        skill_details?: Array<{
            required: string;
            matched_to: string | null;
            match_type: string;
            similarity: number;
            student_level: number;
            required_level: number;
            satisfaction: number;
        }>;
    } | null;
    student: {
        user_id: number;
        full_name: string;
        university?: string | null;
        bio?: string | null;
        user: {
            email: string;
        };
    };
    review?: {
        submission_id: number;
        rating: number | null;
        feedback: string | null;
    } | null;
}
