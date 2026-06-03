import { apiClient } from "@/lib/api-client";

export interface School {
  id: string;
  schoolId: string;
  name: string;
  board: string;
  city: string;
  address: string;
  principalName: string | null;
  principalDesignation: string | null;
  principalEmail: string | null;
  principalPhone: string | null;
  coordinatorName: string;
  coordinatorEmail: string;
  coordinatorPhone: string;
  mouSignedDate: string;
  mouValidityStart: string;
  mouValidityEnd: string;
  tier: "SEEDING" | "GROW" | "THRIVE" | "CUSTOM";
  totalMouValue: number | null;
  assignedOpsManagerId: string | null;
  status: "PENDING_ONBOARDING" | "ACTIVE" | "INACTIVE" | "SUSPENDED";
  assignedOpsManager?: {
    id: string;
    phone?: string;
    username?: string;
    profile?: {
      displayName: string;
    };
  };
  programConfig?: SchoolProgramConfig;
  sessions?: SchoolSession[];
  teachers?: SchoolTeacher[];
  reports?: SchoolReport[];
  kitDispatches?: SchoolKitDispatch[];
  mediaAssets?: SchoolMediaAsset[];
  badge?: SchoolBadge;
  noticeBoardItems?: SchoolNoticeBoardItem[];
  _count?: {
    sessions: number;
    students: number;
    teachers: number;
  };
}

export interface SchoolProgramConfig {
  id: string;
  schoolId: string;
  gradesEnrolled: string[];
  sessionsPerGrade: number;
  totalStudentsContracted: number;
  teacherTrainingSessions: number;
  teacherTrainingDuration: "HALF_DAY" | "FULL_DAY";
  teacherTrainingModules: string[];
  parentWelcomeKit: boolean;
  parentWelcomeKitQuantity: number;
  reportingFrequency: string;
  certifiedSchoolBadge: boolean;
  mediaCoverageSupport: boolean;
  mediaCoverageTier: string | null;
  socialMediaContentPack: boolean;
  annualWellnessDay: boolean;
  annualWellnessDayDate: string | null;
  customDeliverables: any;
}

export interface SchoolSession {
  id: string;
  schoolId: string;
  grade: string;
  curriculumModule: string;
  proposedDate: string;
  proposedTime: string | null;
  venue: string | null;
  facilitatorId: string | null;
  status: "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "RESCHEDULED" | "CANCELLED";
  actualDate: string | null;
  studentHeadcount: number | null;
  attendanceRate: number | null;
  facilitatorNotes: string | null;
  publicNotes: string | null;
  photos: string[];
  school?: {
    id: string;
    schoolId: string;
    name: string;
    city: string;
    board: string;
  };
  facilitator?: {
    id: string;
    phone?: string;
    username?: string;
    profile?: {
      displayName: string;
    };
  };
}

export interface SchoolTeacher {
  id: string;
  schoolId: string;
  name: string;
  designation: string | null;
  email: string;
  phone: string | null;
  completedModules: string[];
  handbookDelivered: boolean;
}

export interface SchoolReport {
  id: string;
  schoolId: string;
  title: string;
  type: "QUARTERLY" | "SEMI_ANNUAL" | "ANNUAL_IMPACT";
  pdfUrl: string;
  opsCommentary: string | null;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
  downloadCount: number;
  createdAt: string;
}

export interface SchoolKitDispatch {
  id: string;
  schoolId: string;
  dispatchDate: string;
  carrier: string | null;
  trackingNumber: string | null;
  quantity: number;
  status: "DISPATCHED" | "IN_TRANSIT" | "DELIVERED" | "ACKNOWLEDGED";
  receiptDate: string | null;
  notes: string | null;
}

export interface SchoolMediaAsset {
  id: string;
  schoolId: string;
  title: string;
  type: "PR_ARTICLE" | "SOCIAL_PACK" | "PHOTO_GALLERY" | "IMPACT_VIDEO";
  fileUrl: string;
  thumbnailUrl: string | null;
  month: string | null;
  caption: string | null;
}

export interface SchoolBadge {
  id: string;
  schoolId: string;
  yearOfCertification: number;
  isFoundingSchool: boolean;
  badgeUrl: string;
  criteriaCompletion: number;
  issuedAt: string;
  renewsAt: string;
}

export interface SchoolNoticeBoardItem {
  id: string;
  schoolId: string;
  title: string;
  content: string;
  attachmentUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface SchoolStudent {
  id: string;
  schoolId: string;
  anonymizedId: string;
  grade: string;
  section: string | null;
  activationStatus: "PENDING" | "ACTIVATED" | "ACTIVE";
  activatedAt: string | null;
}

export const SchoolService = {
  /**
   * Registers a new school and provisions their coordinator account
   */
  async registerSchool(data: any): Promise<{ school: School; coordinatorUser: any; tempPassword: string }> {
    return apiClient.post<{ school: School; coordinatorUser: any; tempPassword: string }>("/school/register", data);
  },

  /**
   * List all schools with optional status/tier filters
   */
  async getSchools(filters?: { status?: string; tier?: string; search?: string }): Promise<School[]> {
    return apiClient.get<School[]>("/school", { params: filters });
  },

  /**
   * Fetch school by ID with related configs, schedules, and assets
   */
  async getSchoolById(id: string): Promise<School> {
    return apiClient.get<School>(`/school/${id}`);
  },

  /**
   * Configures MOU program parameters
   */
  async configureProgram(schoolId: string, configData: any): Promise<SchoolProgramConfig> {
    return apiClient.post<SchoolProgramConfig>(`/school/${schoolId}/config`, configData);
  },

  /**
   * Schedule physical sessions
   */
  async scheduleSession(schoolId: string, sessionData: any): Promise<SchoolSession> {
    return apiClient.post<SchoolSession>(`/school/${schoolId}/sessions`, sessionData);
  },

  /**
   * Update session details (reschedule)
   */
  async updateSession(sessionId: string, sessionData: any): Promise<SchoolSession> {
    return apiClient.put<SchoolSession>(`/school/sessions/${sessionId}`, sessionData);
  },

  /**
   * Mark session completed and enter actual metrics
   */
  async completeSession(sessionId: string, completionData: any): Promise<SchoolSession> {
    return apiClient.post<SchoolSession>(`/school/sessions/${sessionId}/complete`, completionData);
  },

  /**
   * Bulk import student roster lists from CSV
   */
  async importStudents(schoolId: string, studentsList: { grade: string; section?: string }[]): Promise<{ success: boolean; importedCount: number }> {
    return apiClient.post<{ success: boolean; importedCount: number }>(`/school/${schoolId}/students/import`, {
      students: studentsList,
    });
  },

  /**
   * Fetch DPDP-compliant aggregated wellness insights for school
   */
  async getWellnessInsights(schoolId: string): Promise<SchoolWellnessInsights> {
    return apiClient.get<SchoolWellnessInsights>(`/school/${schoolId}/wellness-insights`);
  },

  /**
   * Fetch all sessions across all schools for operations central calendar
   */
  async getAllSessions(filters?: { status?: string; grade?: string; search?: string }): Promise<SchoolSession[]> {
    return apiClient.get<SchoolSession[]>("/school/sessions/all", { params: filters });
  },
};

export interface GradeWellnessInsight {
  grade: string;
  totalCount: number;
  activeCount: number;
  locked: boolean;
  message?: string;
  moodDistribution?: {
    happy: number;
    calm: number;
    stressed: number;
    anxious: number;
    sad: number;
  };
  averageEnergyLevel?: number;
  averageSleepHours?: number;
  topSymptoms?: { name: string; percentage: number }[];
  moodTrend?: { day: string; positiveRate: number; negativeRate: number }[];
  lowMoodAlert?: boolean;
}

export interface SchoolWellnessInsights {
  schoolId: string;
  schoolName: string;
  totalActiveStudents: number;
  gradesInsights: GradeWellnessInsight[];
}

