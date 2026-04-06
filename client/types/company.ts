export interface CompanyProfile {
    user_id: number;
    company_name: string;
    description: string | null;
    website_url: string | null;
    industry: string | null;
    location: string | null;
    logo_url: string | null;
    user: {
        email: string;
        created_at: string;
    };
}
