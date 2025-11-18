
export interface Project {
  id: string;
  name: string;
  location: string;
  developer: string;
  image: string;
  legalScore: number;
  status: "good" | "warning" | "danger";
  priceRange: string;
  pricePerSqm: number;
  completionDate: string;
  warnings: string[];
  city: string;
  district: string;
  description?: string;
  amenities?: string[];
  totalUnits?: number;
  soldUnits?: number;
  floors?: number;
  apartmentTypes?: string[];
  gallery?: string[];
  launchPrice?: number;
  launchDate?: string;
  currentPrice?: number;
  priceHistory?: Array<{ date: string; price: number }>;
  averageRentalPrice?: string; // Changed to range format
  rentalYield?: number;
  badges?: ("hot" | "new" | "featured" | "discount")[];
}
