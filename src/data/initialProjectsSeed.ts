import { Project } from "@/types/project";

// This file is for seeding purposes only and should not be imported into components.
export const initialProjectsSeed: Omit<Project, 'warnings'>[] = [
  // ... (300 projects array will be here)
  { id: 'proj-1', name: 'Vinhomes Ocean Park 1 (Gia Lâm)', location: "Đang cập nhật", city: "Đang cập nhật", district: "Đang cập nhật", developer: "Đang cập nhật", image: "/placeholder.svg", legalScore: 0, status: "warning", priceRange: "Đang cập nhật", pricePerSqm: 0, completionDate: "Đang cập nhật" },
  { id: 'proj-2', name: 'Vinhomes Ocean Park 2 - The Empire (Hưng Yên)', location: "Đang cập nhật", city: "Đang cập nhật", district: "Đang cập nhật", developer: "Đang cập nhật", image: "/placeholder.svg", legalScore: 0, status: "warning", priceRange: "Đang cập nhật", pricePerSqm: 0, completionDate: "Đang cập nhật" },
  // ... and so on for all 300 projects
  { id: 'proj-300', name: 'Hon Thom Paradise Island (Đảo Thiên Đường)', location: "Đang cập nhật", city: "Đang cập nhật", district: "Đang cập nhật", developer: "Đang cập nhật", image: "/placeholder.svg", legalScore: 0, status: "warning", priceRange: "Đang cập nhật", pricePerSqm: 0, completionDate: "Đang cập nhật" },
];