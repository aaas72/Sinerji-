export interface TaskSkill {
    task_id: number;
    skill_id: number;
    skill: {
        id: number;
        name: string;
    };
}

export interface Task {
    [x: string]: any;
    id: number;
    company_user_id: number;
    title: string;
    description: string | null;
    reward_amount: string | null;
    reward_type: string | null;
    detail_title: string | null;
    detail_body: string | null;
    status: string | null;
    deadline: string | null; // ISO string
    created_at?: string; // ISO string
    reward_value?: number;
    location?: string | null;
    employment_type?: string | null;
    is_easy_apply?: boolean;
    company: {
        company_name: string;
        website_url?: string | null;
        description?: string | null;
        logo_url?: string | null;
    };
    requiredSkills: TaskSkill[];
    _count?: {
        submissions: number;
    };
}

export interface TaskFilters {
    search?: string;
    category?: string;
}
