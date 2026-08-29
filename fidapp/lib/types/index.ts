export type SubscriptionStatus = "ACTIVE" | "INACTIVE" | "TRIAL";
export type ServiceVisibility = "PUBLIC" | "PRIVATE";
export type ModerationStatus = "PENDING" | "APPROVED" | "REJECTED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED";

export interface UserProfile {
  id: string;
  pseudo: string;
  email: string;
  createdAt: string;
}

export interface CompanyProfile {
  id: string;
  name: string;
  email: string;
  subscriptionStatus: SubscriptionStatus;
  createdAt: string;
}

export interface ServiceItem {
  id: string;
  companyId: string;
  companyName?: string;
  name: string;
  description: string;
  visibility: ServiceVisibility;
  category?: string;
  logoUrl?: string;
  createdAt: string;
  _count?: {
    subscriptions: number;
    feedbacks: number;
    updateAnnouncements: number;
  };
}

export interface FeedbackItem {
  id: string;
  subscriptionId: string;
  serviceId?: string;
  serviceName?: string;
  userPseudo?: string;
  userEmail?: string;
  content: string;
  moderationStatus: ModerationStatus;
  createdAt: string;
}

export interface UpdateAnnouncementItem {
  id: string;
  serviceId: string;
  serviceName?: string;
  title: string;
  message: string;
  sentAt: string;
}

export interface PaymentRecord {
  id: string;
  companyId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: "STRIPE" | "TMONEY" | "FLOOZ" | "PAYGATE_TOGO";
  planName: string;
  createdAt: string;
}
