export interface Skill {
    id: number;
    name: string;
}

export interface StudentSkill {
    skill_id: number;
    student_user_id: number;
    skill: Skill;
    category: string;
    level: number;
}

export interface StudentProfile {
    user_id: number;
    full_name: string;
    university: string | null;
    bio: string | null;
    phone: string | null;
    linkedin_url: string | null;
    github_url: string | null;
    twitter_url: string | null;
    website_url: string | null;
    major?: string | null;
    graduation_year?: number | null;
    availability_status?: string | null;
    categories_of_interest?: string | null;
    skills: StudentSkill[];
    recommendations?: any[]; // We can define a proper type for Recommendation later if needed
    submissions?: any[]; // We can define a proper type for Submission later if needed
    user: {
        email: string;
        role: string;
        created_at: string;
    };
}

export interface UpdateProfileData {
    full_name?: string;
    university?: string;
    bio?: string;
    phone?: string;
    linkedin_url?: string;
    github_url?: string;
    twitter_url?: string;
    website_url?: string;
    major?: string;
    graduation_year?: number;
    availability_status?: string;
    categories_of_interest?: string;
}
