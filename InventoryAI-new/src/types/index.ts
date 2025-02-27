export interface User {
  id: string;
  email: string;
  created_at: string;
  last_login?: string;
  settings?: Record<string, any>;
}

export interface Inventory {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  created_at: string;
  updated_at: string;
  last_accessed: string;
  item_count: number;
}

export interface Category {
  id: string;
  inventory_id: string;
  name: string;
  color: string;
  icon: string;
  created_at: string;
}

export interface Item {
  id: string;
  inventory_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  quantity: number;
  unit: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  last_checked: string;
  alert_threshold?: number | null;
  alert_enabled: boolean;
}

export interface ItemHistory {
  id: string;
  item_id: string;
  quantity_change: number;
  previous_quantity: number;
  new_quantity: number;
  action_type: 'create' | 'update' | 'delete';
  notes?: string;
  created_at: string;
  created_by?: string;
}

export interface ItemAttachment {
  id: string;
  item_id: string;
  file_url: string;
  file_type: string;
  file_name: string;
  created_at: string;
  created_by?: string;
} 