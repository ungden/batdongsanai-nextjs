import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Project {
  id: string;
  name: string;
  developer: string;
  location: string;
  pricePerSqm: number;
  totalUnits: number;
  completionDate: string;
  imageUrl?: string;
  type?: string;
  [key: string]: any;
}

interface CompareStore {
  compareList: Project[];
  addToCompare: (project: Project) => boolean;
  removeFromCompare: (projectId: string) => void;
  clearCompare: () => void;
  isInCompare: (projectId: string) => boolean;
  canAddMore: () => boolean;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      compareList: [],

      addToCompare: (project: Project) => {
        const { compareList } = get();

        // Max 4 projects
        if (compareList.length >= 4) {
          return false;
        }

        // Check if already in list
        if (compareList.find((p) => p.id === project.id)) {
          return false;
        }

        set({ compareList: [...compareList, project] });
        return true;
      },

      removeFromCompare: (projectId: string) => {
        set((state) => ({
          compareList: state.compareList.filter((p) => p.id !== projectId),
        }));
      },

      clearCompare: () => {
        set({ compareList: [] });
      },

      isInCompare: (projectId: string) => {
        return get().compareList.some((p) => p.id === projectId);
      },

      canAddMore: () => {
        return get().compareList.length < 4;
      },
    }),
    {
      name: 'compare-storage',
    }
  )
);
