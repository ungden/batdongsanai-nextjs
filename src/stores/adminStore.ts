"use client";

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools, persist } from 'zustand/middleware';
import type { FormattedAnalysis } from '@/types/analysis';

// --- TYPES ---

export type AiModel = "google/gemini-2.5-pro" | "google/gemini-2.5-flash" | "anthropic/claude-3.5-sonnet";

interface ResearchState {
  projectId: string | null;
  rawContent: string;
  formattedContent: FormattedAnalysis | null;
  isVip: boolean;
  model: AiModel;
  // Job-related state
  jobId: string | null;
  jobStatus: 'idle' | 'running' | 'completed' | 'failed';
  jobResult: any | null;
}

interface AdminState {
  research: ResearchState;
  actions: {
    // Research Actions
    setResearchProjectId: (id: string | null) => void;
    setResearchRawContent: (content: string) => void;
    setResearchFormattedContent: (content: FormattedAnalysis | null) => void;
    setResearchIsVip: (isVip: boolean) => void;
    setResearchModel: (model: AiModel) => void;
    resetResearchState: () => void;
  };
}

const initialResearchState: ResearchState = {
  projectId: null,
  rawContent: '',
  formattedContent: null,
  isVip: false,
  model: 'google/gemini-2.5-flash',
  jobId: null,
  jobStatus: 'idle',
  jobResult: null,
};

// --- STORE ---

export const useAdminStore = create<AdminState>()(
  devtools(
    persist(
      immer((set) => ({
        research: initialResearchState,
        actions: {
          // --- Research Actions ---
          setResearchProjectId: (id) => set((state) => { state.research.projectId = id; }),
          setResearchRawContent: (content) => set((state) => { state.research.rawContent = content; }),
          setResearchFormattedContent: (content) => set((state) => { state.research.formattedContent = content; }),
          setResearchIsVip: (isVip) => set((state) => { state.research.isVip = isVip; }),
          setResearchModel: (model) => set((state) => { state.research.model = model; }),
          resetResearchState: () => set({ research: initialResearchState }),
        },
      })),
      {
        name: 'propertyhub-admin-storage',
        skipHydration: true,
        partialize: (state) => ({
          research: {
            projectId: state.research.projectId,
            rawContent: state.research.rawContent,
            formattedContent: state.research.formattedContent,
            isVip: state.research.isVip,
            model: state.research.model,
          }
        }),
      }
    )
  )
);

// --- SELECTORS ---
export const useResearchState = () => useAdminStore((state) => state.research);
export const useAdminActions = () => useAdminStore((state) => state.actions);