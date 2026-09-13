export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string; sku: string; slug: string; name: string; category: string;
          category_id: string; price: number; original_price: number | null; short_description: string;
          description: string; seo_description: string; colors: string[];
          occasions: string[]; tags: string[]; available: boolean; preorder: boolean;
          featured: boolean; bestseller: boolean; lead_time: string | null;
          sort_order: number; is_active: boolean; created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; sku: string; slug: string; name: string; category?: string;
          category_id: string; price: number; original_price?: number | null; short_description: string;
          description: string; seo_description: string; colors?: string[];
          occasions?: string[]; tags?: string[]; available?: boolean; preorder?: boolean;
          featured?: boolean; bestseller?: boolean; lead_time?: string | null;
          sort_order?: number; is_active?: boolean; created_at?: string; updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [{
          foreignKeyName: "products_category_id_fkey";
          columns: ["category_id"];
          isOneToOne: false;
          referencedRelation: "categories";
          referencedColumns: ["id"];
        }];
      };
      product_images: {
        Row: {
          id: string; product_id: string; image_url: string; storage_path: string;
          alt_text: string; sort_order: number; is_thumbnail: boolean; created_at: string;
        };
        Insert: {
          id?: string; product_id: string; image_url: string; storage_path: string;
          alt_text: string; sort_order?: number; is_thumbnail?: boolean; created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_images"]["Insert"]>;
        Relationships: [{
          foreignKeyName: "product_images_product_id_fkey";
          columns: ["product_id"];
          isOneToOne: false;
          referencedRelation: "products";
          referencedColumns: ["id"];
        }];
      };
      invoices: {
        Row: {
          id: string; invoice_number: string; invoice_date: string; due_date: string | null;
          customer_name: string; customer_whatsapp: string; customer_address: string | null;
          status: "draft" | "issued" | "cancelled"; payment_status: "unpaid" | "paid";
          payment_method: string | null; paid_at: string | null; notes: string | null;
          subtotal: number; discount: number; delivery_fee: number; other_fee: number;
          grand_total: number; created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; invoice_number: string; invoice_date?: string; due_date?: string | null;
          customer_name: string; customer_whatsapp: string; customer_address?: string | null;
          status?: "draft" | "issued" | "cancelled"; payment_status?: "unpaid" | "paid";
          payment_method?: string | null; paid_at?: string | null; notes?: string | null;
          subtotal?: number; discount?: number; delivery_fee?: number; other_fee?: number;
          grand_total?: number; created_at?: string; updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["invoices"]["Insert"]>;
        Relationships: [];
      };
      invoice_items: {
        Row: {
          id: string; invoice_id: string; product_id: string | null; product_name: string;
          description: string | null; qty: number; unit_price: number; line_total: number;
          sort_order: number; created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; invoice_id: string; product_id?: string | null; product_name: string;
          description?: string | null; qty: number; unit_price: number; line_total: number;
          sort_order?: number; created_at?: string; updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["invoice_items"]["Insert"]>;
        Relationships: [{
          foreignKeyName: "invoice_items_invoice_id_fkey";
          columns: ["invoice_id"];
          isOneToOne: false;
          referencedRelation: "invoices";
          referencedColumns: ["id"];
        }, {
          foreignKeyName: "invoice_items_product_id_fkey";
          columns: ["product_id"];
          isOneToOne: false;
          referencedRelation: "products";
          referencedColumns: ["id"];
        }];
      };
      invoice_settings: {
        Row: {
          id: string; business_name: string; business_address: string | null; business_whatsapp: string | null;
          business_email: string | null; bank_name: string | null; bank_account_number: string | null;
          bank_account_name: string | null; payment_note: string | null; footer_note: string | null;
          created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; business_name?: string; business_address?: string | null; business_whatsapp?: string | null;
          business_email?: string | null; bank_name?: string | null; bank_account_number?: string | null;
          bank_account_name?: string | null; payment_note?: string | null; footer_note?: string | null;
          created_at?: string; updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["invoice_settings"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_invoice: {
        Args: { p_invoice_date: string; p_due_date: string | null; p_customer_name: string; p_customer_whatsapp: string; p_customer_address: string | null; p_discount: number; p_delivery_fee: number; p_other_fee: number; p_notes: string | null; p_items: Json; };
        Returns: { id: string; invoice_number: string; grand_total: number; }[];
      };
      update_invoice_draft: {
        Args: { p_invoice_id: string; p_invoice_date: string; p_due_date: string | null; p_customer_name: string; p_customer_whatsapp: string; p_customer_address: string | null; p_discount: number; p_delivery_fee: number; p_other_fee: number; p_notes: string | null; p_items: Json; };
        Returns: { id: string; invoice_number: string; grand_total: number; }[];
      };
      issue_invoice: { Args: { p_invoice_id: string }; Returns: { id: string; invoice_number: string; grand_total: number; }[]; };
      cancel_invoice: { Args: { p_invoice_id: string }; Returns: { id: string; invoice_number: string; grand_total: number; }[]; };
      mark_invoice_paid: { Args: { p_invoice_id: string; p_payment_method?: string | null }; Returns: { id: string; invoice_number: string; grand_total: number; }[]; };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
