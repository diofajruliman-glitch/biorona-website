export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string; sku: string; slug: string; name: string; category: string;
          price: number; original_price: number | null; short_description: string;
          description: string; seo_description: string; colors: string[];
          occasions: string[]; tags: string[]; available: boolean; preorder: boolean;
          featured: boolean; bestseller: boolean; lead_time: string | null;
          sort_order: number; is_active: boolean; created_at: string; updated_at: string;
        };
        Insert: {
          id?: string; sku: string; slug: string; name: string; category: string;
          price: number; original_price?: number | null; short_description: string;
          description: string; seo_description: string; colors?: string[];
          occasions?: string[]; tags?: string[]; available?: boolean; preorder?: boolean;
          featured?: boolean; bestseller?: boolean; lead_time?: string | null;
          sort_order?: number; is_active?: boolean; created_at?: string; updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
