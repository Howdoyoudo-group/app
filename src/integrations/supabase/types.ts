export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      adzuna_run_log: {
        Row: {
          created_at: string
          duration_ms: number | null
          errors: Json
          finished_at: string | null
          id: string
          industries: string[] | null
          started_at: string
          sweeps: Json
          total_errors: number
          total_jobs_returned: number
          total_requests: number
          trigger_source: string | null
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          errors?: Json
          finished_at?: string | null
          id?: string
          industries?: string[] | null
          started_at?: string
          sweeps?: Json
          total_errors?: number
          total_jobs_returned?: number
          total_requests?: number
          trigger_source?: string | null
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          errors?: Json
          finished_at?: string | null
          id?: string
          industries?: string[] | null
          started_at?: string
          sweeps?: Json
          total_errors?: number
          total_jobs_returned?: number
          total_requests?: number
          trigger_source?: string | null
        }
        Relationships: []
      }
      ai_usage_log: {
        Row: {
          function_name: string
          id: string
          used_at: string
          user_id: string
        }
        Insert: {
          function_name: string
          id?: string
          used_at?: string
          user_id: string
        }
        Update: {
          function_name?: string
          id?: string
          used_at?: string
          user_id?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          description: string | null
          id: string
          industry: string
          published_at: string | null
          scraped_at: string
          source: string
          title: string
          url: string
        }
        Insert: {
          description?: string | null
          id?: string
          industry: string
          published_at?: string | null
          scraped_at?: string
          source: string
          title: string
          url: string
        }
        Update: {
          description?: string | null
          id?: string
          industry?: string
          published_at?: string | null
          scraped_at?: string
          source?: string
          title?: string
          url?: string
        }
        Relationships: []
      }
      ats_detection_results: {
        Row: {
          ats_type: string | null
          board_slug: string | null
          career_url: string
          company: string
          detected_at: string | null
          final_url: string | null
          id: string
          in_scraper: boolean | null
          industry: string
          notes: string | null
          wd_site: string | null
          wd_tenant: string | null
          wd_version: string | null
        }
        Insert: {
          ats_type?: string | null
          board_slug?: string | null
          career_url: string
          company: string
          detected_at?: string | null
          final_url?: string | null
          id?: string
          in_scraper?: boolean | null
          industry: string
          notes?: string | null
          wd_site?: string | null
          wd_tenant?: string | null
          wd_version?: string | null
        }
        Update: {
          ats_type?: string | null
          board_slug?: string | null
          career_url?: string
          company?: string
          detected_at?: string | null
          final_url?: string | null
          id?: string
          in_scraper?: boolean | null
          industry?: string
          notes?: string | null
          wd_site?: string | null
          wd_tenant?: string | null
          wd_version?: string | null
        }
        Relationships: []
      }
      badge_lessons: {
        Row: {
          body_markdown: string
          generated_at: string
          id: string
          industry: string
          slot: number
          source_links: Json
          title: string
        }
        Insert: {
          body_markdown: string
          generated_at?: string
          id?: string
          industry: string
          slot: number
          source_links?: Json
          title: string
        }
        Update: {
          body_markdown?: string
          generated_at?: string
          id?: string
          industry?: string
          slot?: number
          source_links?: Json
          title?: string
        }
        Relationships: []
      }
      badge_progress: {
        Row: {
          id: string
          industry: string
          lessons_completed: number[]
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          industry: string
          lessons_completed?: number[]
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          industry?: string
          lessons_completed?: number[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      badge_questions: {
        Row: {
          correct_index: number
          explanation: string | null
          generated_at: string
          id: string
          industry: string
          options: Json
          question: string
        }
        Insert: {
          correct_index: number
          explanation?: string | null
          generated_at?: string
          id?: string
          industry: string
          options: Json
          question: string
        }
        Update: {
          correct_index?: number
          explanation?: string | null
          generated_at?: string
          id?: string
          industry?: string
          options?: Json
          question?: string
        }
        Relationships: []
      }
      breaking_news: {
        Row: {
          fetched_at: string
          id: string
          industry: string
          published_at: string | null
          source: string
          title: string
          url: string
        }
        Insert: {
          fetched_at?: string
          id?: string
          industry: string
          published_at?: string | null
          source: string
          title: string
          url: string
        }
        Update: {
          fetched_at?: string
          id?: string
          industry?: string
          published_at?: string | null
          source?: string
          title?: string
          url?: string
        }
        Relationships: []
      }
      canonical_roles: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          id: string
          role_category: string
          role_subcategory: string | null
          role_type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          role_category: string
          role_subcategory?: string | null
          role_type: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          role_category?: string
          role_subcategory?: string | null
          role_type?: string
        }
        Relationships: []
      }
      career_profiles: {
        Row: {
          advice: string | null
          bio: string | null
          career_stage: string | null
          company: string
          created_at: string
          how_they_got_the_job: string | null
          id: string
          industry: string
          job_title: string
          name: string
          photo_url: string | null
          podcast_episode: string | null
          related_jobs_tag: string | null
          salary_range: string | null
          skills_required: string[] | null
          typical_day: string | null
          years_experience: number | null
        }
        Insert: {
          advice?: string | null
          bio?: string | null
          career_stage?: string | null
          company: string
          created_at?: string
          how_they_got_the_job?: string | null
          id?: string
          industry: string
          job_title: string
          name: string
          photo_url?: string | null
          podcast_episode?: string | null
          related_jobs_tag?: string | null
          salary_range?: string | null
          skills_required?: string[] | null
          typical_day?: string | null
          years_experience?: number | null
        }
        Update: {
          advice?: string | null
          bio?: string | null
          career_stage?: string | null
          company?: string
          created_at?: string
          how_they_got_the_job?: string | null
          id?: string
          industry?: string
          job_title?: string
          name?: string
          photo_url?: string | null
          podcast_episode?: string | null
          related_jobs_tag?: string | null
          salary_range?: string | null
          skills_required?: string[] | null
          typical_day?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      coach_plan_tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          detail: string | null
          id: string
          link: string | null
          role_slug: string | null
          source: string
          status: string
          task_type: string
          title: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          detail?: string | null
          id?: string
          link?: string | null
          role_slug?: string | null
          source?: string
          status?: string
          task_type: string
          title: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          detail?: string | null
          id?: string
          link?: string | null
          role_slug?: string | null
          source?: string
          status?: string
          task_type?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      company_profiles: {
        Row: {
          about: string | null
          awards: Json | null
          careers_url: string | null
          company_id: string
          cover_image_url: string | null
          created_at: string
          culture: string | null
          custom_blocks: Json | null
          id: string
          instagram_url: string | null
          linkedin_url: string | null
          locations: string[] | null
          logo_url: string | null
          mission: string | null
          perks: string[] | null
          press_mentions: Json | null
          sustainability: string | null
          tagline: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          about?: string | null
          awards?: Json | null
          careers_url?: string | null
          company_id: string
          cover_image_url?: string | null
          created_at?: string
          culture?: string | null
          custom_blocks?: Json | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          locations?: string[] | null
          logo_url?: string | null
          mission?: string | null
          perks?: string[] | null
          press_mentions?: Json | null
          sustainability?: string | null
          tagline?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          about?: string | null
          awards?: Json | null
          careers_url?: string | null
          company_id?: string
          cover_image_url?: string | null
          created_at?: string
          culture?: string | null
          custom_blocks?: Json | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          locations?: string[] | null
          logo_url?: string | null
          mission?: string | null
          perks?: string[] | null
          press_mentions?: Json | null
          sustainability?: string | null
          tagline?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "employer_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_enquiries: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string | null
        }
        Relationships: []
      }
      contact_requests: {
        Row: {
          candidate_user_id: string
          company_id: string
          created_at: string
          details_shared: boolean
          employer_read_at: string | null
          employer_user_id: string
          id: string
          message: string | null
          replied_at: string | null
          reply_message: string | null
          responded_at: string | null
          status: string
        }
        Insert: {
          candidate_user_id: string
          company_id: string
          created_at?: string
          details_shared?: boolean
          employer_read_at?: string | null
          employer_user_id: string
          id?: string
          message?: string | null
          replied_at?: string | null
          reply_message?: string | null
          responded_at?: string | null
          status?: string
        }
        Update: {
          candidate_user_id?: string
          company_id?: string
          created_at?: string
          details_shared?: boolean
          employer_read_at?: string | null
          employer_user_id?: string
          id?: string
          message?: string | null
          replied_at?: string | null
          reply_message?: string | null
          responded_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "employer_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_briefings: {
        Row: {
          briefing_date: string
          generated_at: string
          id: string
          industry: string
          main_news: string | null
          people: string | null
          source_links: Json
          takeaway: string | null
        }
        Insert: {
          briefing_date?: string
          generated_at?: string
          id?: string
          industry: string
          main_news?: string | null
          people?: string | null
          source_links?: Json
          takeaway?: string | null
        }
        Update: {
          briefing_date?: string
          generated_at?: string
          id?: string
          industry?: string
          main_news?: string | null
          people?: string | null
          source_links?: Json
          takeaway?: string | null
        }
        Relationships: []
      }
      daily_digest_runs: {
        Row: {
          completed_at: string | null
          id: string
          run_date: string
          started_at: string
          status: string
          subscribers_count: number | null
        }
        Insert: {
          completed_at?: string | null
          id?: string
          run_date: string
          started_at?: string
          status?: string
          subscribers_count?: number | null
        }
        Update: {
          completed_at?: string | null
          id?: string
          run_date?: string
          started_at?: string
          status?: string
          subscribers_count?: number | null
        }
        Relationships: []
      }
      dismissed_candidates: {
        Row: {
          candidate_user_id: string
          company_id: string
          created_at: string
          dismissed_by: string
          id: string
          reason: string | null
        }
        Insert: {
          candidate_user_id: string
          company_id: string
          created_at?: string
          dismissed_by: string
          id?: string
          reason?: string | null
        }
        Update: {
          candidate_user_id?: string
          company_id?: string
          created_at?: string
          dismissed_by?: string
          id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dismissed_candidates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "employer_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      dismissed_jobs: {
        Row: {
          dismissed_at: string
          id: string
          job_id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          dismissed_at?: string
          id?: string
          job_id: string
          reason?: string | null
          user_id: string
        }
        Update: {
          dismissed_at?: string
          id?: string
          job_id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      earned_badges: {
        Row: {
          earned_at: string
          id: string
          industry: string
          score: number
          user_id: string
          visible_to_employers: boolean
        }
        Insert: {
          earned_at?: string
          id?: string
          industry: string
          score: number
          user_id: string
          visible_to_employers?: boolean
        }
        Update: {
          earned_at?: string
          id?: string
          industry?: string
          score?: number
          user_id?: string
          visible_to_employers?: boolean
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      employer_ai_summaries: {
        Row: {
          candidate_user_id: string
          company_id: string
          created_at: string
          employer_user_id: string
          id: string
          match_score: number | null
          summary: string
        }
        Insert: {
          candidate_user_id: string
          company_id: string
          created_at?: string
          employer_user_id: string
          id?: string
          match_score?: number | null
          summary: string
        }
        Update: {
          candidate_user_id?: string
          company_id?: string
          created_at?: string
          employer_user_id?: string
          id?: string
          match_score?: number | null
          summary?: string
        }
        Relationships: [
          {
            foreignKeyName: "employer_ai_summaries_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "employer_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      employer_companies: {
        Row: {
          created_at: string
          featured: boolean
          featured_rank: number | null
          id: string
          industry: string | null
          is_active: boolean
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          featured?: boolean
          featured_rank?: number | null
          id?: string
          industry?: string | null
          is_active?: boolean
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          featured?: boolean
          featured_rank?: number | null
          id?: string
          industry?: string | null
          is_active?: boolean
          name?: string
          slug?: string
        }
        Relationships: []
      }
      employer_enquiries: {
        Row: {
          company_name: string
          contact_name: string
          created_at: string
          email: string
          id: string
          industry: string | null
          message: string | null
          package_interest: string
          phone: string | null
          status: string
        }
        Insert: {
          company_name: string
          contact_name: string
          created_at?: string
          email: string
          id?: string
          industry?: string | null
          message?: string | null
          package_interest?: string
          phone?: string | null
          status?: string
        }
        Update: {
          company_name?: string
          contact_name?: string
          created_at?: string
          email?: string
          id?: string
          industry?: string | null
          message?: string | null
          package_interest?: string
          phone?: string | null
          status?: string
        }
        Relationships: []
      }
      employer_users: {
        Row: {
          company_id: string
          contact_name: string | null
          created_at: string
          id: string
          job_title: string | null
          user_id: string
        }
        Insert: {
          company_id: string
          contact_name?: string | null
          created_at?: string
          id?: string
          job_title?: string | null
          user_id: string
        }
        Update: {
          company_id?: string
          contact_name?: string | null
          created_at?: string
          id?: string
          job_title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employer_users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "employer_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      industry_events: {
        Row: {
          created_at: string
          date_label: string | null
          description: string | null
          ends_on: string | null
          event_type: string | null
          fetched_at: string
          id: string
          industry: string
          location: string | null
          organizer: string | null
          source: string | null
          starts_on: string | null
          title: string
          url: string
        }
        Insert: {
          created_at?: string
          date_label?: string | null
          description?: string | null
          ends_on?: string | null
          event_type?: string | null
          fetched_at?: string
          id?: string
          industry: string
          location?: string | null
          organizer?: string | null
          source?: string | null
          starts_on?: string | null
          title: string
          url: string
        }
        Update: {
          created_at?: string
          date_label?: string | null
          description?: string | null
          ends_on?: string | null
          event_type?: string | null
          fetched_at?: string
          id?: string
          industry?: string
          location?: string | null
          organizer?: string | null
          source?: string | null
          starts_on?: string | null
          title?: string
          url?: string
        }
        Relationships: []
      }
      industry_health_log: {
        Row: {
          checks: Json
          created_at: string
          duration_ms: number | null
          finished_at: string | null
          id: string
          industries_checked: number
          industries_refetched: number
          industries_unhealthy: number
          started_at: string
          trigger_source: string | null
        }
        Insert: {
          checks?: Json
          created_at?: string
          duration_ms?: number | null
          finished_at?: string | null
          id?: string
          industries_checked?: number
          industries_refetched?: number
          industries_unhealthy?: number
          started_at?: string
          trigger_source?: string | null
        }
        Update: {
          checks?: Json
          created_at?: string
          duration_ms?: number | null
          finished_at?: string | null
          id?: string
          industries_checked?: number
          industries_refetched?: number
          industries_unhealthy?: number
          started_at?: string
          trigger_source?: string | null
        }
        Relationships: []
      }
      industry_videos: {
        Row: {
          channel: string | null
          channel_id: string | null
          description: string | null
          duration_seconds: number | null
          fetched_at: string
          id: string
          industry: string
          published_at: string | null
          title: string
          view_count: number | null
          window_tag: string
          youtube_id: string
        }
        Insert: {
          channel?: string | null
          channel_id?: string | null
          description?: string | null
          duration_seconds?: number | null
          fetched_at?: string
          id?: string
          industry: string
          published_at?: string | null
          title: string
          view_count?: number | null
          window_tag?: string
          youtube_id: string
        }
        Update: {
          channel?: string | null
          channel_id?: string | null
          description?: string | null
          duration_seconds?: number | null
          fetched_at?: string
          id?: string
          industry?: string
          published_at?: string | null
          title?: string
          view_count?: number | null
          window_tag?: string
          youtube_id?: string
        }
        Relationships: []
      }
      job_matches: {
        Row: {
          algorithm_version: number
          computed_at: string
          job_id: string
          match_kind: string
          score: number
          semantic_score: number | null
          user_id: string
        }
        Insert: {
          algorithm_version?: number
          computed_at?: string
          job_id: string
          match_kind?: string
          score: number
          semantic_score?: number | null
          user_id: string
        }
        Update: {
          algorithm_version?: number
          computed_at?: string
          job_id?: string
          match_kind?: string
          score?: number
          semantic_score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_matches_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_shares: {
        Row: {
          company: string | null
          id: string
          job_id: string
          job_title: string | null
          read_at: string | null
          share_link: string | null
          shared_at: string
          shared_by: string
          shared_with: string
        }
        Insert: {
          company?: string | null
          id?: string
          job_id: string
          job_title?: string | null
          read_at?: string | null
          share_link?: string | null
          shared_at?: string
          shared_by: string
          shared_with: string
        }
        Update: {
          company?: string | null
          id?: string
          job_id?: string
          job_title?: string | null
          read_at?: string | null
          share_link?: string | null
          shared_at?: string
          shared_by?: string
          shared_with?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_shares_shared_by_fkey"
            columns: ["shared_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_shares_shared_with_fkey"
            columns: ["shared_with"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_tracker_actions: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          description: string
          due_date: string | null
          id: string
          tracker_item_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description: string
          due_date?: string | null
          id?: string
          tracker_item_id: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string
          due_date?: string | null
          id?: string
          tracker_item_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_tracker_actions_tracker_item_id_fkey"
            columns: ["tracker_item_id"]
            isOneToOne: false
            referencedRelation: "job_tracker_items"
            referencedColumns: ["id"]
          },
        ]
      }
      job_tracker_contacts: {
        Row: {
          company: string | null
          contact_info: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          relationship: string | null
          role: string | null
          status: string
          tracker_item_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company?: string | null
          contact_info?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          relationship?: string | null
          role?: string | null
          status?: string
          tracker_item_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string | null
          contact_info?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          relationship?: string | null
          role?: string | null
          status?: string
          tracker_item_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_tracker_contacts_tracker_item_id_fkey"
            columns: ["tracker_item_id"]
            isOneToOne: false
            referencedRelation: "job_tracker_items"
            referencedColumns: ["id"]
          },
        ]
      }
      job_tracker_items: {
        Row: {
          company: string
          created_at: string
          follow_up_date: string | null
          id: string
          industry: string | null
          job_id: string | null
          location: string | null
          next_action: string | null
          notes: string | null
          opportunity_type: string
          salary: string | null
          sort_order: number
          status: string
          title: string | null
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          company: string
          created_at?: string
          follow_up_date?: string | null
          id?: string
          industry?: string | null
          job_id?: string | null
          location?: string | null
          next_action?: string | null
          notes?: string | null
          opportunity_type?: string
          salary?: string | null
          sort_order?: number
          status?: string
          title?: string | null
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          company?: string
          created_at?: string
          follow_up_date?: string | null
          id?: string
          industry?: string | null
          job_id?: string | null
          location?: string | null
          next_action?: string | null
          notes?: string | null
          opportunity_type?: string
          salary?: string | null
          sort_order?: number
          status?: string
          title?: string | null
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_tracker_items_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          ai_confidence: number | null
          ai_role_category: string | null
          ai_role_subcategory: string | null
          apply_url: string | null
          career_level: string | null
          classified_at: string | null
          company: string
          company_logo: string | null
          country: string
          created_at: string
          description: string | null
          embedding: string | null
          expires_at: string | null
          featured: boolean | null
          id: string
          industry: string | null
          job_traits: Json | null
          location: string | null
          needs_review: boolean | null
          partner_source: string | null
          posted_by: string | null
          role_category: string | null
          salary: string | null
          salary_max: number | null
          salary_min: number | null
          scraped_at: string
          source_url: string | null
          tags: string[] | null
          title: string
          type: string | null
          url: string
          value_chain_stage: string | null
          work_mode: string | null
        }
        Insert: {
          ai_confidence?: number | null
          ai_role_category?: string | null
          ai_role_subcategory?: string | null
          apply_url?: string | null
          career_level?: string | null
          classified_at?: string | null
          company: string
          company_logo?: string | null
          country?: string
          created_at?: string
          description?: string | null
          embedding?: string | null
          expires_at?: string | null
          featured?: boolean | null
          id?: string
          industry?: string | null
          job_traits?: Json | null
          location?: string | null
          needs_review?: boolean | null
          partner_source?: string | null
          posted_by?: string | null
          role_category?: string | null
          salary?: string | null
          salary_max?: number | null
          salary_min?: number | null
          scraped_at?: string
          source_url?: string | null
          tags?: string[] | null
          title: string
          type?: string | null
          url: string
          value_chain_stage?: string | null
          work_mode?: string | null
        }
        Update: {
          ai_confidence?: number | null
          ai_role_category?: string | null
          ai_role_subcategory?: string | null
          apply_url?: string | null
          career_level?: string | null
          classified_at?: string | null
          company?: string
          company_logo?: string | null
          country?: string
          created_at?: string
          description?: string | null
          embedding?: string | null
          expires_at?: string | null
          featured?: boolean | null
          id?: string
          industry?: string | null
          job_traits?: Json | null
          location?: string | null
          needs_review?: boolean | null
          partner_source?: string | null
          posted_by?: string | null
          role_category?: string | null
          salary?: string | null
          salary_max?: number | null
          salary_min?: number | null
          scraped_at?: string
          source_url?: string | null
          tags?: string[] | null
          title?: string
          type?: string | null
          url?: string
          value_chain_stage?: string | null
          work_mode?: string | null
        }
        Relationships: []
      }
      liked_jobs: {
        Row: {
          created_at: string
          id: string
          job_id: string
          liked_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          liked_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          liked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      member_connections: {
        Row: {
          accepted_at: string | null
          created_at: string
          id: string
          message: string | null
          recipient_id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          message?: string | null
          recipient_id: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          message?: string | null
          recipient_id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      member_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          read_at: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      mentor_requests: {
        Row: {
          created_at: string
          id: string
          industry: string | null
          mentee_id: string
          mentor_id: string
          message: string
          responded_at: string | null
          response_note: string | null
          role: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          industry?: string | null
          mentee_id: string
          mentor_id: string
          message: string
          responded_at?: string | null
          response_note?: string | null
          role?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          industry?: string | null
          mentee_id?: string
          mentor_id?: string
          message?: string
          responded_at?: string | null
          response_note?: string | null
          role?: string | null
          status?: string
        }
        Relationships: []
      }
      ncs_role_catalog: {
        Row: {
          fetched_at: string | null
          ncs_entry_routes: Json | null
          ncs_hours: string | null
          ncs_qualifications: string | null
          ncs_related_roles: Json | null
          ncs_restrictions: string | null
          ncs_salary_experienced: number | null
          ncs_salary_starter: number | null
          ncs_sector: string | null
          ncs_skills: Json | null
          ncs_slug: string
          ncs_tasks: Json | null
          ncs_url: string
          ncs_video_url: string | null
          ncs_work_pattern: string | null
          scrape_error: string | null
          scrape_status: string
          title: string
        }
        Insert: {
          fetched_at?: string | null
          ncs_entry_routes?: Json | null
          ncs_hours?: string | null
          ncs_qualifications?: string | null
          ncs_related_roles?: Json | null
          ncs_restrictions?: string | null
          ncs_salary_experienced?: number | null
          ncs_salary_starter?: number | null
          ncs_sector?: string | null
          ncs_skills?: Json | null
          ncs_slug: string
          ncs_tasks?: Json | null
          ncs_url: string
          ncs_video_url?: string | null
          ncs_work_pattern?: string | null
          scrape_error?: string | null
          scrape_status?: string
          title: string
        }
        Update: {
          fetched_at?: string | null
          ncs_entry_routes?: Json | null
          ncs_hours?: string | null
          ncs_qualifications?: string | null
          ncs_related_roles?: Json | null
          ncs_restrictions?: string | null
          ncs_salary_experienced?: number | null
          ncs_salary_starter?: number | null
          ncs_sector?: string | null
          ncs_skills?: Json | null
          ncs_slug?: string
          ncs_tasks?: Json | null
          ncs_url?: string
          ncs_video_url?: string | null
          ncs_work_pattern?: string | null
          scrape_error?: string | null
          scrape_status?: string
          title?: string
        }
        Relationships: []
      }
      ops_health_snapshots: {
        Row: {
          checked_at: string
          id: string
          total_jobs: number
        }
        Insert: {
          checked_at?: string
          id?: string
          total_jobs: number
        }
        Update: {
          checked_at?: string
          id?: string
          total_jobs?: number
        }
        Relationships: []
      }
      pinned_industry_employers: {
        Row: {
          active: boolean
          company_name: string
          created_at: string
          id: string
          industry: string
          logo_url: string | null
          media_type: string | null
          media_url: string | null
          rank: number
          tagline: string | null
          updated_at: string
          url: string | null
          why_work_here: string[]
        }
        Insert: {
          active?: boolean
          company_name: string
          created_at?: string
          id?: string
          industry: string
          logo_url?: string | null
          media_type?: string | null
          media_url?: string | null
          rank?: number
          tagline?: string | null
          updated_at?: string
          url?: string | null
          why_work_here?: string[]
        }
        Update: {
          active?: boolean
          company_name?: string
          created_at?: string
          id?: string
          industry?: string
          logo_url?: string | null
          media_type?: string | null
          media_url?: string | null
          rank?: number
          tagline?: string | null
          updated_at?: string
          url?: string | null
          why_work_here?: string[]
        }
        Relationships: []
      }
      podcast_episodes: {
        Row: {
          audio_url: string | null
          created_at: string
          description: string | null
          duration_seconds: number | null
          id: string
          industry: string
          published_at: string | null
          script: string | null
          status: string
          title: string
          voice_id: string | null
        }
        Insert: {
          audio_url?: string | null
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          industry: string
          published_at?: string | null
          script?: string | null
          status?: string
          title: string
          voice_id?: string | null
        }
        Update: {
          audio_url?: string | null
          created_at?: string
          description?: string | null
          duration_seconds?: number | null
          id?: string
          industry?: string
          published_at?: string | null
          script?: string | null
          status?: string
          title?: string
          voice_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accept_messages: boolean
          career_level: string | null
          community_chat_agreed_at: string | null
          community_chat_joined: boolean
          created_at: string
          date_of_birth: string | null
          employer_visibility_opt_in: boolean
          full_name: string | null
          home_address: string | null
          home_town: string | null
          home_town_blurb: string | null
          howdy_memory: string[]
          howdy_tour_completed_at: string | null
          id: string
          industry_interests: string[] | null
          job_preferences: Json | null
          location_preference: string | null
          member_bio: string | null
          member_directory_opt_in: boolean
          mentor_bio: string | null
          mentor_offers: string[] | null
          mentor_opt_in: boolean
          newsletter_industries: string[] | null
          phone: string | null
          photo_url: string | null
          preference_embedded_at: string | null
          preference_embedding: string | null
          public_handle: string | null
          public_profile_opt_in: boolean
          riasec_scores: Json | null
          role_preferences: string[] | null
          salary_expectation: string | null
          share_details_default: boolean
          understand_me_results: Json | null
          updated_at: string
          whatsapp_frequency: string
          whatsapp_last_sent_at: string | null
          whatsapp_number: string | null
          whatsapp_opt_in: boolean
          whatsapp_verified_at: string | null
          work_values: Json | null
        }
        Insert: {
          accept_messages?: boolean
          career_level?: string | null
          community_chat_agreed_at?: string | null
          community_chat_joined?: boolean
          created_at?: string
          date_of_birth?: string | null
          employer_visibility_opt_in?: boolean
          full_name?: string | null
          home_address?: string | null
          home_town?: string | null
          home_town_blurb?: string | null
          howdy_memory?: string[]
          howdy_tour_completed_at?: string | null
          id: string
          industry_interests?: string[] | null
          job_preferences?: Json | null
          location_preference?: string | null
          member_bio?: string | null
          member_directory_opt_in?: boolean
          mentor_bio?: string | null
          mentor_offers?: string[] | null
          mentor_opt_in?: boolean
          newsletter_industries?: string[] | null
          phone?: string | null
          photo_url?: string | null
          preference_embedded_at?: string | null
          preference_embedding?: string | null
          public_handle?: string | null
          public_profile_opt_in?: boolean
          riasec_scores?: Json | null
          role_preferences?: string[] | null
          salary_expectation?: string | null
          share_details_default?: boolean
          understand_me_results?: Json | null
          updated_at?: string
          whatsapp_frequency?: string
          whatsapp_last_sent_at?: string | null
          whatsapp_number?: string | null
          whatsapp_opt_in?: boolean
          whatsapp_verified_at?: string | null
          work_values?: Json | null
        }
        Update: {
          accept_messages?: boolean
          career_level?: string | null
          community_chat_agreed_at?: string | null
          community_chat_joined?: boolean
          created_at?: string
          date_of_birth?: string | null
          employer_visibility_opt_in?: boolean
          full_name?: string | null
          home_address?: string | null
          home_town?: string | null
          home_town_blurb?: string | null
          howdy_memory?: string[]
          howdy_tour_completed_at?: string | null
          id?: string
          industry_interests?: string[] | null
          job_preferences?: Json | null
          location_preference?: string | null
          member_bio?: string | null
          member_directory_opt_in?: boolean
          mentor_bio?: string | null
          mentor_offers?: string[] | null
          mentor_opt_in?: boolean
          newsletter_industries?: string[] | null
          phone?: string | null
          photo_url?: string | null
          preference_embedded_at?: string | null
          preference_embedding?: string | null
          public_handle?: string | null
          public_profile_opt_in?: boolean
          riasec_scores?: Json | null
          role_preferences?: string[] | null
          salary_expectation?: string | null
          share_details_default?: boolean
          understand_me_results?: Json | null
          updated_at?: string
          whatsapp_frequency?: string
          whatsapp_last_sent_at?: string | null
          whatsapp_number?: string | null
          whatsapp_opt_in?: boolean
          whatsapp_verified_at?: string | null
          work_values?: Json | null
        }
        Relationships: []
      }
      role_metadata: {
        Row: {
          cp_career_progression: Json | null
          cp_description: string | null
          cp_entry_routes: Json | null
          cp_fetched_at: string | null
          cp_growth: string | null
          cp_professional_bodies: Json | null
          cp_related_roles: Json | null
          cp_requirements: string | null
          cp_salary_max: number | null
          cp_salary_min: number | null
          cp_skills: Json | null
          cp_url: string | null
          cp_work_environment: string | null
          fetched_at: string | null
          ncs_entry_routes: Json | null
          ncs_hours: string | null
          ncs_qualifications: string | null
          ncs_related_roles: Json | null
          ncs_salary_experienced: number | null
          ncs_salary_starter: number | null
          ncs_skills: Json | null
          ncs_tasks: Json | null
          ncs_url: string | null
          ncs_video_url: string | null
          ncs_work_pattern: string | null
          se_synced_at: string | null
          slug: string
        }
        Insert: {
          cp_career_progression?: Json | null
          cp_description?: string | null
          cp_entry_routes?: Json | null
          cp_fetched_at?: string | null
          cp_growth?: string | null
          cp_professional_bodies?: Json | null
          cp_related_roles?: Json | null
          cp_requirements?: string | null
          cp_salary_max?: number | null
          cp_salary_min?: number | null
          cp_skills?: Json | null
          cp_url?: string | null
          cp_work_environment?: string | null
          fetched_at?: string | null
          ncs_entry_routes?: Json | null
          ncs_hours?: string | null
          ncs_qualifications?: string | null
          ncs_related_roles?: Json | null
          ncs_salary_experienced?: number | null
          ncs_salary_starter?: number | null
          ncs_skills?: Json | null
          ncs_tasks?: Json | null
          ncs_url?: string | null
          ncs_video_url?: string | null
          ncs_work_pattern?: string | null
          se_synced_at?: string | null
          slug: string
        }
        Update: {
          cp_career_progression?: Json | null
          cp_description?: string | null
          cp_entry_routes?: Json | null
          cp_fetched_at?: string | null
          cp_growth?: string | null
          cp_professional_bodies?: Json | null
          cp_related_roles?: Json | null
          cp_requirements?: string | null
          cp_salary_max?: number | null
          cp_salary_min?: number | null
          cp_skills?: Json | null
          cp_url?: string | null
          cp_work_environment?: string | null
          fetched_at?: string | null
          ncs_entry_routes?: Json | null
          ncs_hours?: string | null
          ncs_qualifications?: string | null
          ncs_related_roles?: Json | null
          ncs_salary_experienced?: number | null
          ncs_salary_starter?: number | null
          ncs_skills?: Json | null
          ncs_tasks?: Json | null
          ncs_url?: string | null
          ncs_video_url?: string | null
          ncs_work_pattern?: string | null
          se_synced_at?: string | null
          slug?: string
        }
        Relationships: []
      }
      role_riasec_profiles: {
        Row: {
          created_at: string
          description: string | null
          display_name: string
          id: string
          riasec_code: string
          riasec_scores: Json
          role_category: string
          typical_traits: string[] | null
          work_values: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          riasec_code: string
          riasec_scores: Json
          role_category: string
          typical_traits?: string[] | null
          work_values: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          riasec_code?: string
          riasec_scores?: Json
          role_category?: string
          typical_traits?: string[] | null
          work_values?: Json
        }
        Relationships: []
      }
      role_se_mapping: {
        Row: {
          match_method: string | null
          match_score: number | null
          se_level: number | null
          se_occ_code: string | null
          se_occ_name: string | null
          se_route: string | null
          slug: string
          synced_at: string
        }
        Insert: {
          match_method?: string | null
          match_score?: number | null
          se_level?: number | null
          se_occ_code?: string | null
          se_occ_name?: string | null
          se_route?: string | null
          slug: string
          synced_at?: string
        }
        Update: {
          match_method?: string | null
          match_score?: number | null
          se_level?: number | null
          se_occ_code?: string | null
          se_occ_name?: string | null
          se_route?: string | null
          slug?: string
          synced_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_se_mapping_slug_fkey"
            columns: ["slug"]
            isOneToOne: true
            referencedRelation: "role_metadata"
            referencedColumns: ["slug"]
          },
        ]
      }
      role_skills: {
        Row: {
          broad_domain: string | null
          display_order: number | null
          id: string
          se_ksb_ref: string | null
          skill_area: string | null
          skill_title: string
          skill_type: string | null
          slug: string
          source: string
          synced_at: string
        }
        Insert: {
          broad_domain?: string | null
          display_order?: number | null
          id?: string
          se_ksb_ref?: string | null
          skill_area?: string | null
          skill_title: string
          skill_type?: string | null
          slug: string
          source: string
          synced_at?: string
        }
        Update: {
          broad_domain?: string | null
          display_order?: number | null
          id?: string
          se_ksb_ref?: string | null
          skill_area?: string | null
          skill_title?: string
          skill_type?: string | null
          slug?: string
          source?: string
          synced_at?: string
        }
        Relationships: []
      }
      saved_feed_items: {
        Row: {
          created_at: string
          id: string
          item_key: string
          item_type: string
          payload: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_key: string
          item_type: string
          payload?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_key?: string
          item_type?: string
          payload?: Json
          user_id?: string
        }
        Relationships: []
      }
      saved_jobs: {
        Row: {
          created_at: string
          id: string
          job_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          user_id?: string
        }
        Relationships: []
      }
      scrape_jobs_cursor: {
        Row: {
          id: boolean
          last_index: number
          updated_at: string
        }
        Insert: {
          id?: boolean
          last_index?: number
          updated_at?: string
        }
        Update: {
          id?: boolean
          last_index?: number
          updated_at?: string
        }
        Relationships: []
      }
      sent_newsletters: {
        Row: {
          briefing_date: string
          html: string
          id: string
          industry: string
          recipient_email: string
          sent_at: string
          subject: string
        }
        Insert: {
          briefing_date?: string
          html: string
          id?: string
          industry: string
          recipient_email: string
          sent_at?: string
          subject: string
        }
        Update: {
          briefing_date?: string
          html?: string
          id?: string
          industry?: string
          recipient_email?: string
          sent_at?: string
          subject?: string
        }
        Relationships: []
      }
      serpapi_usage: {
        Row: {
          count: number
          month: string
          updated_at: string
        }
        Insert: {
          count?: number
          month: string
          updated_at?: string
        }
        Update: {
          count?: number
          month?: string
          updated_at?: string
        }
        Relationships: []
      }
      skill_course_lessons: {
        Row: {
          body_markdown: string
          course_id: string
          id: string
          slot: number
          title: string
        }
        Insert: {
          body_markdown: string
          course_id: string
          id?: string
          slot: number
          title: string
        }
        Update: {
          body_markdown?: string
          course_id?: string
          id?: string
          slot?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_course_lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "skill_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_course_progress: {
        Row: {
          completed_at: string | null
          course_id: string
          id: string
          lessons_completed: number[] | null
          passed: boolean | null
          score: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          id?: string
          lessons_completed?: number[] | null
          passed?: boolean | null
          score?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          id?: string
          lessons_completed?: number[] | null
          passed?: boolean | null
          score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_course_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "skill_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_course_questions: {
        Row: {
          correct_index: number
          course_id: string
          explanation: string | null
          id: string
          options: Json
          question: string
        }
        Insert: {
          correct_index: number
          course_id: string
          explanation?: string | null
          id?: string
          options: Json
          question: string
        }
        Update: {
          correct_index?: number
          course_id?: string
          explanation?: string | null
          id?: string
          options?: Json
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_course_questions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "skill_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_courses: {
        Row: {
          course_title: string
          focus_skills: string[]
          generated_at: string | null
          id: string
          role_slug: string
          role_title: string
          status: string
          user_id: string
        }
        Insert: {
          course_title?: string
          focus_skills?: string[]
          generated_at?: string | null
          id?: string
          role_slug: string
          role_title: string
          status?: string
          user_id: string
        }
        Update: {
          course_title?: string
          focus_skills?: string[]
          generated_at?: string | null
          id?: string
          role_slug?: string
          role_title?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      source_health_log: {
        Row: {
          broken: Json
          broken_count: number
          checked_at: string
          id: number
          source_type: string
          working_count: number
        }
        Insert: {
          broken?: Json
          broken_count: number
          checked_at?: string
          id?: never
          source_type: string
          working_count: number
        }
        Update: {
          broken?: Json
          broken_count?: number
          checked_at?: string
          id?: never
          source_type?: string
          working_count?: number
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          industry_interests: string[] | null
          job_preferences: Json | null
          name: string
          newsletter_industries: string[] | null
          phone: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          industry_interests?: string[] | null
          job_preferences?: Json | null
          name: string
          newsletter_industries?: string[] | null
          phone?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          industry_interests?: string[] | null
          job_preferences?: Json | null
          name?: string
          newsletter_industries?: string[] | null
          phone?: string | null
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      team_docs: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          folder: string
          id: string
          sort_order: number
          title: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          folder?: string
          id?: string
          sort_order?: number
          title: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          folder?: string
          id?: string
          sort_order?: number
          title?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      title_variants: {
        Row: {
          canonical_role_id: string
          created_at: string
          id: string
          source: string | null
          variant_title: string
        }
        Insert: {
          canonical_role_id: string
          created_at?: string
          id?: string
          source?: string | null
          variant_title: string
        }
        Update: {
          canonical_role_id?: string
          created_at?: string
          id?: string
          source?: string | null
          variant_title?: string
        }
        Relationships: [
          {
            foreignKeyName: "title_variants_canonical_role_id_fkey"
            columns: ["canonical_role_id"]
            isOneToOne: false
            referencedRelation: "canonical_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_interactions: {
        Row: {
          company_slug: string | null
          created_at: string
          id: string
          industry: string | null
          interaction_type: string
          job_id: string | null
          metadata: Json | null
          user_id: string
        }
        Insert: {
          company_slug?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          interaction_type: string
          job_id?: string | null
          metadata?: Json | null
          user_id: string
        }
        Update: {
          company_slug?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          interaction_type?: string
          job_id?: string | null
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      user_reports: {
        Row: {
          context: string | null
          created_at: string
          details: string | null
          id: string
          reason: string
          reported_user_id: string
          reporter_id: string
          resolution_note: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          context?: string | null
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reported_user_id: string
          reporter_id: string
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          context?: string | null
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reported_user_id?: string
          reporter_id?: string
          resolution_note?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_skill_ratings: {
        Row: {
          evidenced: boolean
          id: string
          rating: number
          skill_id: string
          source: string
          updated_at: string
          user_id: string
        }
        Insert: {
          evidenced?: boolean
          id?: string
          rating: number
          skill_id: string
          source?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          evidenced?: boolean
          id?: string
          rating?: number
          skill_id?: string
          source?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_skill_ratings_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "role_skills"
            referencedColumns: ["id"]
          },
        ]
      }
      user_target_roles: {
        Row: {
          id: string
          role_slug: string
          set_at: string
          user_id: string
        }
        Insert: {
          id?: string
          role_slug: string
          set_at?: string
          user_id: string
        }
        Update: {
          id?: string
          role_slug?: string
          set_at?: string
          user_id?: string
        }
        Relationships: []
      }
      validate_cursor: {
        Row: {
          id: boolean
          last_id: string | null
          updated_at: string
        }
        Insert: {
          id?: boolean
          last_id?: string | null
          updated_at?: string
        }
        Update: {
          id?: boolean
          last_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      whatsapp_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          payload: Json | null
          phone_e164: string
          status: string
          template_name: string
          twilio_message_sid: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          payload?: Json | null
          phone_e164: string
          status: string
          template_name: string
          twilio_message_sid?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          payload?: Json | null
          phone_e164?: string
          status?: string
          template_name?: string
          twilio_message_sid?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      whatsapp_verifications: {
        Row: {
          attempts: number
          code: string
          consumed_at: string | null
          created_at: string
          expires_at: string
          id: string
          phone_e164: string
          user_id: string
        }
        Insert: {
          attempts?: number
          code: string
          consumed_at?: string | null
          created_at?: string
          expires_at: string
          id?: string
          phone_e164: string
          user_id: string
        }
        Update: {
          attempts?: number
          code?: string
          consumed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          phone_e164?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_delete_user: { Args: { _user_id: string }; Returns: undefined }
      admin_list_users: {
        Args: { _limit?: number; _offset?: number; _search?: string }
        Returns: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_admin: boolean
          is_employer: boolean
          is_premium: boolean
          is_subscribed: boolean
        }[]
      }
      admin_set_admin: {
        Args: { _is_admin: boolean; _user_id: string }
        Returns: undefined
      }
      admin_set_mailing_list: {
        Args: { _subscribed: boolean; _user_id: string }
        Returns: undefined
      }
      admin_set_premium: {
        Args: { _is_premium: boolean; _user_id: string }
        Returns: undefined
      }
      are_members_connected: {
        Args: { _a: string; _b: string }
        Returns: boolean
      }
      check_email_exists: { Args: { p_email: string }; Returns: boolean }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_employer_company_id: { Args: { _user_id: string }; Returns: string }
      get_full_name_by_email: { Args: { p_email: string }; Returns: string }
      get_industry_follower_counts: {
        Args: never
        Returns: {
          follower_count: number
          industry: string
        }[]
      }
      get_live_job_counts_by_industry: {
        Args: never
        Returns: {
          count: number
          industry: string
        }[]
      }
      get_member_directory: {
        Args: {
          _industry?: string
          _limit?: number
          _offset?: number
          _search?: string
        }
        Returns: {
          career_level: string
          created_at: string
          full_name: string
          home_town: string
          id: string
          industry_interests: string[]
          member_bio: string
          mentor_opt_in: boolean
          photo_url: string
          role_preferences: string[]
        }[]
      }
      get_member_profile: {
        Args: { _id: string }
        Returns: {
          career_level: string
          created_at: string
          full_name: string
          home_town: string
          home_town_blurb: string
          id: string
          industry_interests: string[]
          member_bio: string
          mentor_bio: string
          mentor_offers: string[]
          mentor_opt_in: boolean
          photo_url: string
          riasec_scores: Json
          role_preferences: string[]
          work_values: Json
        }[]
      }
      get_mentor_directory: {
        Args: {
          _industry?: string
          _limit?: number
          _offset?: number
          _role?: string
          _search?: string
        }
        Returns: {
          career_level: string
          created_at: string
          full_name: string
          home_town: string
          id: string
          industry_interests: string[]
          mentor_bio: string
          mentor_offers: string[]
          photo_url: string
          role_preferences: string[]
        }[]
      }
      get_owner_insights: { Args: never; Returns: Json }
      get_premium_member_ids: {
        Args: { _ids: string[] }
        Returns: {
          user_id: string
        }[]
      }
      get_public_member_preview: {
        Args: { _industry?: string; _limit?: number }
        Returns: {
          created_at: string
          first_name: string
          home_town: string
          id: string
          industry_interests: string[]
          photo_url: string
        }[]
      }
      get_public_profile: {
        Args: { _handle: string }
        Returns: {
          career_level: string
          full_name: string
          home_town: string
          home_town_blurb: string
          id: string
          industry_interests: string[]
          job_preferences: Json
          location_preference: string
          photo_url: string
          riasec_scores: Json
          role_preferences: string[]
          understand_me_results: Json
          work_values: Json
        }[]
      }
      get_replied_candidate_email: {
        Args: { _candidate_id: string }
        Returns: string
      }
      get_total_member_count: { Args: never; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_public_handle_available: {
        Args: { _exclude_user_id?: string; _handle: string }
        Returns: boolean
      }
      match_jobs_semantic: {
        Args: { p_job_ids: string[]; p_user_id: string }
        Returns: {
          job_id: string
          similarity: number
        }[]
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      ops_health_check: { Args: never; Returns: Json }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      top_jobs_semantic: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          job_id: string
          similarity: number
        }[]
      }
    }
    Enums: {
      app_role: "employer" | "admin" | "premium" | "superadmin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["employer", "admin", "premium", "superadmin"],
    },
  },
} as const
