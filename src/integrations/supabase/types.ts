export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          id: string
        }
        Update: {
          created_at?: string | null
          id?: string
        }
        Relationships: []
      }
      customer_keywords: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          keyword: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          keyword: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          keyword?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          id: string | null
          name: string
        }
        Insert: {
          created_at?: string
          id?: string | null
          name: string
        }
        Update: {
          created_at?: string
          id?: string | null
          name?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          bid_id: number | null
          created_at: string | null
          file_name: string | null
          file_type: string | null
          file_url: string | null
          id: string
          source_tag: string | null
        }
        Insert: {
          bid_id?: number | null
          created_at?: string | null
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          source_tag?: string | null
        }
        Update: {
          bid_id?: number | null
          created_at?: string | null
          file_name?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          source_tag?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_keywords: string[] | null
          username: string | null
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
          user_keywords?: string[] | null
          username?: string | null
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_keywords?: string[] | null
          username?: string | null
        }
        Relationships: []
      }
      tender_documents: {
        Row: {
          bid_id: number | null
          created_at: string | null
          doc_name: string | null
          doc_url: string | null
          id: string
          page_number: number | null
        }
        Insert: {
          bid_id?: number | null
          created_at?: string | null
          doc_name?: string | null
          doc_url?: string | null
          id?: string
          page_number?: number | null
        }
        Update: {
          bid_id?: number | null
          created_at?: string | null
          doc_name?: string | null
          doc_url?: string | null
          id?: string
          page_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tender_documents_bid_id_fkey"
            columns: ["bid_id"]
            isOneToOne: false
            referencedRelation: "tenders_gem"
            referencedColumns: ["bid_id"]
          },
        ]
      }
      tender_interactions: {
        Row: {
          bid_placed: boolean | null
          bid_remaining: boolean | null
          created_at: string
          id: string
          interaction_type: string
          tender_id: number
          user_id: string | null
        }
        Insert: {
          bid_placed?: boolean | null
          bid_remaining?: boolean | null
          created_at?: string
          id?: string
          interaction_type: string
          tender_id: number
          user_id?: string | null
        }
        Update: {
          bid_placed?: boolean | null
          bid_remaining?: boolean | null
          created_at?: string
          id?: string
          interaction_type?: string
          tender_id?: number
          user_id?: string | null
        }
        Relationships: []
      }
      tender_type_keywords: {
        Row: {
          created_at: string
          id: string
          keyword: string
          tender_type_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          keyword: string
          tender_type_id: string
        }
        Update: {
          created_at?: string
          id?: string
          keyword?: string
          tender_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tender_type_keywords_tender_type_id_fkey"
            columns: ["tender_type_id"]
            isOneToOne: false
            referencedRelation: "tender_types"
            referencedColumns: ["id"]
          },
        ]
      }
      tender_types: {
        Row: {
          created_at: string
          display_name: string
          icon: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          icon: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          icon?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      tenders_cppp: {
        Row: {
          created_at: string | null
          department: string | null
          end_date: string | null
          id: number
          link: string | null
          location: string | null
          open_date: string | null
          serial_no: string | null
          start_date: string | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          end_date?: string | null
          id?: number
          link?: string | null
          location?: string | null
          open_date?: string | null
          serial_no?: string | null
          start_date?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          end_date?: string | null
          id?: number
          link?: string | null
          location?: string | null
          open_date?: string | null
          serial_no?: string | null
          start_date?: string | null
          title?: string | null
        }
        Relationships: []
      }
      tenders_gem: {
        Row: {
          bid_id: number | null
          bid_number: string | null
          bid_url: string | null
          category: string | null
          city: string | null
          created_at: string | null
          department: string | null
          download_url: string | null
          end_date: string | null
          id: number
          ministry: string | null
          quantity: number | null
          start_date: string | null
        }
        Insert: {
          bid_id?: number | null
          bid_number?: string | null
          bid_url?: string | null
          category?: string | null
          city?: string | null
          created_at?: string | null
          department?: string | null
          download_url?: string | null
          end_date?: string | null
          id?: number
          ministry?: string | null
          quantity?: number | null
          start_date?: string | null
        }
        Update: {
          bid_id?: number | null
          bid_number?: string | null
          bid_url?: string | null
          category?: string | null
          city?: string | null
          created_at?: string | null
          department?: string | null
          download_url?: string | null
          end_date?: string | null
          id?: number
          ministry?: string | null
          quantity?: number | null
          start_date?: string | null
        }
        Relationships: []
      }
      tenders_mmp: {
        Row: {
          created_at: string | null
          department: string | null
          end_date: string | null
          id: number
          link: string | null
          location: string | null
          open_date: string | null
          serial_no: string | null
          start_date: string | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          end_date?: string | null
          id?: number
          link?: string | null
          location?: string | null
          open_date?: string | null
          serial_no?: string | null
          start_date?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          end_date?: string | null
          id?: number
          link?: string | null
          location?: string | null
          open_date?: string | null
          serial_no?: string | null
          start_date?: string | null
          title?: string | null
        }
        Relationships: []
      }
      tenders_state: {
        Row: {
          created_at: string | null
          department: string | null
          end_date: string | null
          id: number
          link: string | null
          location: string | null
          open_date: string | null
          serial_no: string | null
          start_date: string | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          end_date?: string | null
          id?: number
          link?: string | null
          location?: string | null
          open_date?: string | null
          serial_no?: string | null
          start_date?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          end_date?: string | null
          id?: number
          link?: string | null
          location?: string | null
          open_date?: string | null
          serial_no?: string | null
          start_date?: string | null
          title?: string | null
        }
        Relationships: []
      }
      user_bids: {
        Row: {
          bid_amount: number
          created_at: string
          id: string
          notes: string | null
          tender_id: number
          updated_at: string
          user_id: string
        }
        Insert: {
          bid_amount: number
          created_at?: string
          id?: string
          notes?: string | null
          tender_id: number
          updated_at?: string
          user_id: string
        }
        Update: {
          bid_amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          tender_id?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_bids_tender_id_fkey"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "tenders_gem"
            referencedColumns: ["id"]
          },
        ]
      }
      user_documents: {
        Row: {
          document_type: string
          file_name: string
          file_path: string
          id: string
          uploaded_at: string | null
          user_id: string
          verified: boolean | null
        }
        Insert: {
          document_type: string
          file_name: string
          file_path: string
          id?: string
          uploaded_at?: string | null
          user_id: string
          verified?: boolean | null
        }
        Update: {
          document_type?: string
          file_name?: string
          file_path?: string
          id?: string
          uploaded_at?: string | null
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      tender_bid_status: {
        Row: {
          bid_placed_count: number | null
          bid_remaining_count: number | null
          has_bid_placed: boolean | null
          has_bid_remaining: boolean | null
          tender_id: number | null
        }
        Relationships: []
      }
      tender_interaction_counts: {
        Row: {
          download_count: number | null
          tender_id: number | null
          total_count: number | null
          whatsapp_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_filtered_tenders: {
        Args: {
          p_user_id: string
          p_page?: number
          p_page_size?: number
          p_ministry?: string
          p_department?: string
          p_search?: string
          p_start_date?: string
          p_end_date?: string
          p_use_keywords?: boolean
        }
        Returns: {
          id: number
          bid_id: number
          bid_number: string
          category: string
          quantity: number
          ministry: string
          department: string
          start_date: string
          end_date: string
          download_url: string
          bid_url: string
          total_count: number
        }[]
      }
      get_user_keywords: {
        Args: { p_user_id: string }
        Returns: string[]
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      update_user_keywords: {
        Args: { p_user_id: string; p_keywords: string[] }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
