// TypeScript interfaces for Doula Management System

export interface Doula {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  profile_photo_url: string | null;
  years_experience: number | null;
  specialties: string[] | null;
  certifications: string[] | null;
  bio: string | null;
  contract_status: 'pending' | 'signed' | 'not_sent';
  contract_signed_at?: string | null;
  certifications_files?: string[] | null;
  created_at: string;
}

export interface AssignedClient {
  id: string;
  doula_id: string;
  client_name: string;
  due_date: string;
  status: string; // active, delivered, postpartum
  last_note?: string;
  next_visit?: string;
}

export interface Visit {
  id: string;
  doula_id: string;
  client_id: string;
  visit_date: string;
  visit_type: string;
  status: 'scheduled' | 'completed' | 'overdue';
}

export interface DoulaNote {
  id: string;
  doula_id: string;
  client_id: string;
  content: string;
  created_at: string;
  status: 'normal' | 'overdue';
}

export interface ActivityLog {
  id: string;
  doula_id: string;
  action: string;
  created_at: string;
}

