// Database types — manually kept in sync with supabase/schema.sql
// For generated types run: npx supabase gen types typescript --project-id <ref>

export type ModerationStatus = "pending" | "approved" | "rejected";

export interface ProfileRow {
  id: string;
  display_name: string;
  created_at: string;
}

export interface SesizareRow {
  id: string;
  code: string;
  user_id: string | null;
  author_name: string;
  author_email: string | null;
  tip: string;
  titlu: string;
  locatie: string;
  sector: string;
  lat: number;
  lng: number;
  descriere: string;
  formal_text: string | null;
  status: string;
  imagini: string[];
  publica: boolean;
  moderation_status: ModerationStatus;
  resolved_at: string | null;
  resolved_by_author: boolean;
  resolved_photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SesizareFeedRow extends SesizareRow {
  upvotes: number;
  downvotes: number;
  voturi_net: number;
  nr_comentarii: number;
  verif_da: number;
  verif_nu: number;
}

export interface SesizareVerificationRow {
  sesizare_id: string;
  user_id: string;
  agrees: boolean;
  created_at: string;
}

export interface SesizareVoteRow {
  sesizare_id: string;
  user_id: string;
  value: -1 | 1;
  created_at: string;
}

export interface SesizareCommentRow {
  id: string;
  sesizare_id: string;
  user_id: string | null;
  author_name: string;
  body: string;
  created_at: string;
}

export interface SesizareTimelineRow {
  id: string;
  sesizare_id: string;
  event_type: string;
  description: string | null;
  created_at: string;
}

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Partial<ProfileRow> & { id: string };
        Update: Partial<ProfileRow>;
        Relationships: [];
      };
      sesizari: {
        Row: SesizareRow;
        Insert: Omit<SesizareRow, "id" | "created_at" | "updated_at" | "moderation_status" | "status"> & {
          id?: string;
          moderation_status?: ModerationStatus;
          status?: string;
          created_at?: string;
        };
        Update: Partial<SesizareRow>;
        Relationships: [];
      };
      sesizare_votes: {
        Row: SesizareVoteRow;
        Insert: Omit<SesizareVoteRow, "created_at"> & { created_at?: string };
        Update: Partial<SesizareVoteRow>;
        Relationships: [];
      };
      sesizare_comments: {
        Row: SesizareCommentRow;
        Insert: Omit<SesizareCommentRow, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<SesizareCommentRow>;
        Relationships: [];
      };
      sesizare_timeline: {
        Row: SesizareTimelineRow;
        Insert: Omit<SesizareTimelineRow, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<SesizareTimelineRow>;
        Relationships: [];
      };
      sesizare_verifications: {
        Row: SesizareVerificationRow;
        Insert: Omit<SesizareVerificationRow, "created_at"> & { created_at?: string };
        Update: Partial<SesizareVerificationRow>;
        Relationships: [];
      };
    };
    Views: {
      sesizari_feed: {
        Row: SesizareFeedRow;
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
