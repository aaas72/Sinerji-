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
