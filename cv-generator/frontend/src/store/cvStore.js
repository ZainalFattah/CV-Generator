import { create } from 'zustand'

export const useCVStore = create((set) => ({
  sessionId: localStorage.getItem('sessionId') || null,
  setSessionId: (id) => {
    localStorage.setItem('sessionId', id);
    set({ sessionId: id });
  },
  cvData: null,
  setCvData: (data) => set({ cvData: data }),
  completenessScore: 0,
  setCompletenessScore: (score) => set({ completenessScore: score }),
}));
