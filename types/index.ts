export type Plan = "free" | "pro"

export type WorkspaceMemberRole = "admin" | "member"

export type LeadStatus = "active" | "inactive" | "converted" | "lost"

export type DealStage =
  | "new_lead"
  | "contacted"
  | "proposal_sent"
  | "negotiation"
  | "closed_won"
  | "closed_lost"

export type ActivityType = "call" | "email" | "meeting" | "note"

export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  created_at: string
}

export interface Workspace {
  id: string
  name: string
  slug: string
  plan: Plan
  stripe_customer_id?: string
  stripe_subscription_id?: string
  created_at: string
}

export interface WorkspaceMember {
  id: string
  workspace_id: string
  user_id: string
  role: WorkspaceMemberRole
  user?: User
  created_at: string
}

export interface Lead {
  id: string
  workspace_id: string
  owner_id: string
  name: string
  email?: string
  phone?: string
  company?: string
  role?: string
  status: LeadStatus
  created_at: string
  updated_at: string
  owner?: User
}

export interface Deal {
  id: string
  workspace_id: string
  lead_id: string
  owner_id: string
  title: string
  value?: number
  stage: DealStage
  due_date?: string
  created_at: string
  updated_at: string
  lead?: Lead
  owner?: User
}

export interface Activity {
  id: string
  workspace_id: string
  lead_id: string
  author_id: string
  type: ActivityType
  description: string
  activity_date: string
  created_at: string
  author?: User
}

export type LeadFormData = {
  name: string
  email?: string
  phone?: string
  company?: string
  role?: string
  status: "active" | "inactive" | "converted" | "lost"
  owner_id: string
}

export interface Invite {
  id: string
  workspace_id: string
  email: string
  role: WorkspaceMemberRole
  token: string
  accepted_at?: string
  created_at: string
}
