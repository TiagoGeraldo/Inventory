export type Inventory = {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
};

export type Item = {
  id: string;
  inventory_id: string;
  name: string;
  description?: string;
  quantity: number;
  location?: string;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      inventories: {
        Row: Inventory;
        Insert: Omit<Inventory, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Inventory, 'id' | 'created_at' | 'updated_at'>>;
      };
      items: {
        Row: Item;
        Insert: Omit<Item, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Item, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}; 