export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ArticleCategory =
  | "model_release"
  | "funding"
  | "infrastructure"
  | "enterprise_ai"
  | "consumer_ai"
  | "regulation"
  | "research"
  | "open_source"
  | "chips"
  | "agents";

export type ArticleStatus = "raw" | "summarized" | "failed";

export interface Database {
  public: {
    Tables: {
      articles: {
        Row: {
          id: string;
          slug: string;
          title: string;
          source_name: string;
          source_url: string;
          canonical_url: string;
          author: string | null;
          published_at: string | null;
          raw_excerpt: string | null;
          summary: string | null;
          founder_insight: string | null;
          why_it_matters: string | null;
          startup_opportunities: string[];
          categories: ArticleCategory[];
          importance_score: number;
          signal_score: number;
          hash: string;
          status: ArticleStatus;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["articles"]["Row"]> & {
          title: string;
          source_name: string;
          source_url: string;
          canonical_url: string;
          slug: string;
          hash: string;
        };
        Update: Partial<Database["public"]["Tables"]["articles"]["Row"]>;
        Relationships: [];
      };
      feeds: {
        Row: {
          id: string;
          name: string;
          url: string;
          category_hint: ArticleCategory | null;
          active: boolean;
          last_fetched_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["feeds"]["Row"]> & {
          name: string;
          url: string;
        };
        Update: Partial<Database["public"]["Tables"]["feeds"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      article_status: ArticleStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type Article = Database["public"]["Tables"]["articles"]["Row"];
