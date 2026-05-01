export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ApplicationStatus =
  | "drafting"
  | "applied"
  | "aptitude"
  | "interview_1"
  | "interview_2"
  | "offer"
  | "rejected";

export type ApplicationEventType =
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "rejected"
  | "note";

export type DocumentType = "resume" | "cover_letter" | "portfolio" | "other";

export type AiFeedbackType =
  | "resume_review"
  | "cover_letter_review"
  | "interview_prep"
  | "general";

export type CalendarEventType =
  | "interview"
  | "deadline"
  | "follow_up"
  | "other";

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          website: string | null;
          industry: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          website?: string | null;
          industry?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          website?: string | null;
          industry?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      job_applications: {
        Row: {
          id: string;
          user_id: string;
          company_id: string | null;
          position: string;
          status: ApplicationStatus;
          job_url: string | null;
          salary_range: string | null;
          location: string | null;
          applied_at: string | null;
          deadline: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_id?: string | null;
          position: string;
          status?: ApplicationStatus;
          job_url?: string | null;
          salary_range?: string | null;
          location?: string | null;
          applied_at?: string | null;
          deadline?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_id?: string | null;
          position?: string;
          status?: ApplicationStatus;
          job_url?: string | null;
          salary_range?: string | null;
          location?: string | null;
          applied_at?: string | null;
          deadline?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      application_events: {
        Row: {
          id: string;
          application_id: string;
          event_type: ApplicationEventType;
          title: string;
          description: string | null;
          scheduled_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          event_type: ApplicationEventType;
          title: string;
          description?: string | null;
          scheduled_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          event_type?: ApplicationEventType;
          title?: string;
          description?: string | null;
          scheduled_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          application_id: string | null;
          folder_id: string | null;
          type: DocumentType;
          title: string;
          content: string | null;
          file_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          application_id?: string | null;
          folder_id?: string | null;
          type: DocumentType;
          title: string;
          content?: string | null;
          file_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          application_id?: string | null;
          folder_id?: string | null;
          type?: DocumentType;
          title?: string;
          content?: string | null;
          file_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      folders: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          emoji: string | null;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          emoji?: string | null;
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          emoji?: string | null;
          color?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      user_event_types: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      application_documents: {
        Row: {
          application_id: string;
          document_id: string;
          created_at: string;
        };
        Insert: {
          application_id: string;
          document_id: string;
          created_at?: string;
        };
        Update: {
          application_id?: string;
          document_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      essays: {
        Row: {
          id: string;
          user_id: string;
          company_name: string;
          job_title: string;
          jd_url: string | null;
          applied_date: string | null;
          deadline: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_name: string;
          job_title: string;
          jd_url?: string | null;
          applied_date?: string | null;
          deadline?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_name?: string;
          job_title?: string;
          jd_url?: string | null;
          applied_date?: string | null;
          deadline?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      essay_questions: {
        Row: {
          id: string;
          essay_id: string;
          order: number;
          content: string;
          char_limit: number;
          count_mode: "with_spaces" | "without_spaces";
          answer: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          essay_id: string;
          order?: number;
          content?: string;
          char_limit?: number;
          count_mode?: "with_spaces" | "without_spaces";
          answer?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          essay_id?: string;
          order?: number;
          content?: string;
          char_limit?: number;
          count_mode?: "with_spaces" | "without_spaces";
          answer?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      ai_feedback: {
        Row: {
          id: string;
          user_id: string;
          document_id: string | null;
          application_id: string | null;
          feedback_type: AiFeedbackType;
          prompt: string | null;
          response: string;
          model: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          document_id?: string | null;
          application_id?: string | null;
          feedback_type: AiFeedbackType;
          prompt?: string | null;
          response: string;
          model?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          document_id?: string | null;
          application_id?: string | null;
          feedback_type?: AiFeedbackType;
          prompt?: string | null;
          response?: string;
          model?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      calendar_events: {
        Row: {
          id: string;
          user_id: string;
          application_id: string | null;
          title: string;
          description: string | null;
          event_type: CalendarEventType;
          user_event_type_id: string | null;
          starts_at: string;
          ends_at: string | null;
          location: string | null;
          meeting_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          application_id?: string | null;
          title: string;
          description?: string | null;
          event_type: CalendarEventType;
          user_event_type_id?: string | null;
          starts_at: string;
          ends_at?: string | null;
          location?: string | null;
          meeting_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          application_id?: string | null;
          title?: string;
          description?: string | null;
          event_type?: CalendarEventType;
          user_event_type_id?: string | null;
          starts_at?: string;
          ends_at?: string | null;
          location?: string | null;
          meeting_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          user_id: string;
          onboarded_at: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          onboarded_at?: string | null;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          onboarded_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      usage_logs: {
        Row: {
          id: string;
          user_id: string | null;
          event: string;
          props: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          event: string;
          props?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          event?: string;
          props?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Convenience row types
export type Company = Database["public"]["Tables"]["companies"]["Row"];
export type JobApplication =
  Database["public"]["Tables"]["job_applications"]["Row"];
export type ApplicationEvent =
  Database["public"]["Tables"]["application_events"]["Row"];
export type Document = Database["public"]["Tables"]["documents"]["Row"];
export type Folder = Database["public"]["Tables"]["folders"]["Row"];
export type UserEventType = Database["public"]["Tables"]["user_event_types"]["Row"];
export type ApplicationDocument = Database["public"]["Tables"]["application_documents"]["Row"];
export type Essay = Database["public"]["Tables"]["essays"]["Row"];
export type EssayQuestion = Database["public"]["Tables"]["essay_questions"]["Row"];
export type AiFeedback = Database["public"]["Tables"]["ai_feedback"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type UsageLog = Database["public"]["Tables"]["usage_logs"]["Row"];
export type CalendarEvent =
  Database["public"]["Tables"]["calendar_events"]["Row"];
