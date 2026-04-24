import type { StateCreator } from 'zustand';
import type { ApprovalRecord } from '@/types';

export interface ApprovalsSlice {
  approvals: ApprovalRecord[];
  addApproval: (record: ApprovalRecord) => void;
  updateApproval: (id: string, patch: Partial<ApprovalRecord>) => void;

  // Selectors
  getLatestApprovalForProject: (projectId: string) => ApprovalRecord | undefined;
  getApprovalHistoryForProject: (projectId: string) => ApprovalRecord[];
}

export const createApprovalsSlice: StateCreator<ApprovalsSlice, [], [], ApprovalsSlice> = (
  set,
  get,
) => ({
  approvals: [],

  addApproval: (record) => {
    set((state) => ({ approvals: [...state.approvals, record] }));
  },

  updateApproval: (id, patch) => {
    set((state) => ({
      approvals: state.approvals.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    }));
  },

  getLatestApprovalForProject: (projectId) => {
    const list = get()
      .approvals.filter((a) => a.projectId === projectId)
      .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
    return list[0];
  },

  getApprovalHistoryForProject: (projectId) =>
    get()
      .approvals.filter((a) => a.projectId === projectId)
      .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1)),
});
