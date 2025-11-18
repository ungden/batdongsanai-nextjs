export interface Developer {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  establishedYear?: number;
  website?: string;
  hotline?: string;
  email?: string;
  address?: string;
  totalProjects: number;
  completedProjects: number;
  avgLegalScore: number;
  avgRating?: number;
  specialties?: string[];
}