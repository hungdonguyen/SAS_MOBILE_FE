export interface DisputeItem {
  id: string;
  studentName: string;
  studentId: string;
  classCode: string;
  sessionDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

let mockDisputes: DisputeItem[] = [
  {
    id: 'd1',
    studentName: 'Lê Minh Châu',
    studentId: '21110003',
    classCode: 'WP301',
    sessionDate: '2026-08-12',
    reason: 'Camera recognition missed my check-in due to low light at room A3-201.',
    status: 'pending',
    submittedAt: '2026-08-12 10:15',
  },
  {
    id: 'd2',
    studentName: 'Phạm Đức Dũng',
    studentId: '21110004',
    classCode: 'SE201',
    sessionDate: '2026-08-10',
    reason: 'Medical appointment letter attached. Requesting excused absence.',
    status: 'pending',
    submittedAt: '2026-08-10 14:30',
  },
  {
    id: 'd3',
    studentName: 'Bùi Anh Tuấn',
    studentId: '21110009',
    classCode: 'WP301',
    sessionDate: '2026-08-05',
    reason: 'Device battery died right before manual entry window closed.',
    status: 'approved',
    submittedAt: '2026-08-05 09:40',
  },
];

export const disputeService = {
  /**
   * Fetch attendance dispute requests
   * (Currently using mock store until backend disputes controller is deployed)
   */
  async getDisputes(): Promise<DisputeItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...mockDisputes]);
      }, 300);
    });
  },

  /**
   * Resolve an attendance appeal request
   */
  async resolveDispute(
    id: string,
    status: 'approved' | 'rejected',
    note?: string,
  ): Promise<DisputeItem> {
    return new Promise((resolve, reject) => {
      const idx = mockDisputes.findIndex((d) => d.id === id);
      if (idx === -1) {
        reject(new Error(`Dispute ${id} not found`));
        return;
      }
      mockDisputes[idx] = { ...mockDisputes[idx], status };
      resolve(mockDisputes[idx]);
    });
  },
};

export default disputeService;
