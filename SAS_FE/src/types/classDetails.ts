export type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused';

export type CheckInMethod = 'AI' | 'Manual' | 'QRCode' | 'NFC' | '—';

export interface StudentAttendanceRecord {
  id: string; // e.g. "21110001"
  studentName: string; // e.g. "Nguyễn Văn An"
  email: string; // e.g. "an.nv@eiu.edu.vn"
  avatarInitials: string; // e.g. "NA"
  device: string; // e.g. "iPhone 15"
  checkInTime: string; // e.g. "07:32"
  method: CheckInMethod;
  status: AttendanceStatus;
}

export interface ClassSession {
  id: string;
  date: string; // e.g. "2026-08-12"
  dayOfWeek: string; // e.g. "Thứ 5"
  timeRange: string; // e.g. "07:30 - 09:30"
  presentCount: number;
  lateCount: number;
  absentCount: number;
  excusedCount: number;
  attendanceRate: number; // percentage, e.g. 88
}

export interface ClassDetailsData {
  classId: string; // e.g. "WP301"
  subjectName: string; // e.g. "Web Programming"
  room: string; // e.g. "A3-201"
  scheduleInfo: string; // e.g. "Thứ 3, Thứ 5 • 07:30 - 09:30"
  totalEnrolled: number;
  sessions: ClassSession[];
  students: StudentAttendanceRecord[];
}
