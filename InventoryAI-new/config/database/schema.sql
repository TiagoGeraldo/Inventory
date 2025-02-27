-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (be careful with this in production)
DROP TABLE IF EXISTS item_attachments CASCADE;
DROP TABLE IF EXISTS item_history CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS inventories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    settings JSONB DEFAULT '{}'::jsonb
);

-- Create inventories table
CREATE TABLE inventories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT DEFAULT 'box',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    item_count INTEGER DEFAULT 0,
    CONSTRAINT item_count_non_negative CHECK (item_count >= 0)
);

-- Create categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_id UUID NOT NULL REFERENCES inventories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#000000',
    icon TEXT DEFAULT 'tag',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(inventory_id, name)
);

-- Create items table
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_id UUID NOT NULL REFERENCES inventories(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_checked TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    alert_threshold INTEGER,
    alert_enabled BOOLEAN DEFAULT false,
    CONSTRAINT quantity_non_negative CHECK (quantity >= 0)
);

-- Create item history table
CREATE TABLE item_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    quantity_change INTEGER NOT NULL,
    previous_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    action_type TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create item attachments table
CREATE TABLE item_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_inventories_user_id ON inventories(user_id);
CREATE INDEX idx_inventories_last_accessed ON inventories(last_accessed);
CREATE INDEX idx_items_inventory_id ON items(inventory_id);
CREATE INDEX idx_items_category_id ON items(category_id);
CREATE INDEX idx_categories_inventory_id ON categories(inventory_id);
CREATE INDEX idx_item_history_item_id ON item_history(item_id);
CREATE INDEX idx_item_attachments_item_id ON item_attachments(item_id);

-- Drop and recreate the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Insert the new user into our users table
    INSERT INTO public.users (id, email, created_at, last_login)
    VALUES (
        NEW.id,
        NEW.email,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    );
    
    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- If user already exists, just return
        RETURN NEW;
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error in handle_new_user: %', SQLERRM;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies for users table
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "System can create user profiles" ON users;

CREATE POLICY "Enable read access for own profile"
    ON users FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Enable update access for own profile"
    ON users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Enable insert access for own profile"
    ON users FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.inventories TO authenticated;
GRANT ALL ON public.categories TO authenticated;
GRANT ALL ON public.items TO authenticated;
GRANT ALL ON public.item_history TO authenticated;
GRANT ALL ON public.item_attachments TO authenticated;

-- Update trigger for inventory item count
CREATE OR REPLACE FUNCTION update_inventory_item_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE inventories 
        SET item_count = item_count + 1
        WHERE id = NEW.inventory_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE inventories 
        SET item_count = item_count - 1
        WHERE id = OLD.inventory_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER items_count_trigger
    AFTER INSERT OR DELETE ON items
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_item_count();

-- Enable RLS (Row Level Security)
ALTER TABLE inventories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies for inventories table
CREATE POLICY "Users can view their own inventories"
ON inventories FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own inventories"
ON inventories FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventories"
ON inventories FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inventories"
ON inventories FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create policies for items table
CREATE POLICY "Users can view items in their inventories"
ON items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM inventories
    WHERE inventories.id = items.inventory_id
    AND inventories.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create items in their inventories"
ON items FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM inventories
    WHERE inventories.id = inventory_id
    AND inventories.user_id = auth.uid()
  )
);

-- Enable RLS for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for item_history table
CREATE POLICY "Users can view history of items in their inventories"
ON item_history FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM items
    JOIN inventories ON items.inventory_id = inventories.id
    WHERE items.id = item_history.item_id
    AND inventories.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create history for items in their inventories"
ON item_history FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM items
    JOIN inventories ON items.inventory_id = inventories.id
    WHERE items.id = item_id
    AND inventories.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update history of items in their inventories"
ON item_history FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM items
    JOIN inventories ON items.inventory_id = inventories.id
    WHERE items.id = item_history.item_id
    AND inventories.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete history of items in their inventories"
ON item_history FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM items
    JOIN inventories ON items.inventory_id = inventories.id
    WHERE items.id = item_history.item_id
    AND inventories.user_id = auth.uid()
  )
);

-- Enable RLS on item_attachments table
ALTER TABLE item_attachments ENABLE ROW LEVEL SECURITY;

-- Policy for inserting attachments
CREATE POLICY "Users can insert attachments for items in their inventories"
ON item_attachments FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM items
    JOIN inventories ON items.inventory_id = inventories.id
    WHERE items.id = item_attachments.item_id
    AND inventories.user_id = auth.uid()
  )
);

-- Policy for viewing attachments
CREATE POLICY "Users can view attachments for items in their inventories"
ON item_attachments FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM items
    JOIN inventories ON items.inventory_id = inventories.id
    WHERE items.id = item_attachments.item_id
    AND inventories.user_id = auth.uid()
  )
);

-- Policy for updating attachments
CREATE POLICY "Users can update attachments for items in their inventories"
ON item_attachments FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM items
    JOIN inventories ON items.inventory_id = inventories.id
    WHERE items.id = item_attachments.item_id
    AND inventories.user_id = auth.uid()
  )
);

-- Policy for deleting attachments
CREATE POLICY "Users can delete attachments for items in their inventories"
ON item_attachments FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM items
    JOIN inventories ON items.inventory_id = inventories.id
    WHERE items.id = item_attachments.item_id
    AND inventories.user_id = auth.uid()
  )
);

-- Update items table RLS policies
CREATE POLICY "Users can update their own items"
ON items FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM inventories
    WHERE inventories.id = items.inventory_id
    AND inventories.user_id::text = auth.uid()::text
  )
);

-- Update item_attachments table RLS policies
DROP POLICY IF EXISTS "Users can insert attachments for items in their inventories" ON item_attachments;
DROP POLICY IF EXISTS "Users can view attachments for items in their inventories" ON item_attachments;
DROP POLICY IF EXISTS "Users can update attachments for items in their inventories" ON item_attachments;
DROP POLICY IF EXISTS "Users can delete attachments for items in their inventories" ON item_attachments;

CREATE POLICY "Users can insert attachments for items in their inventories"
ON item_attachments FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM items
    JOIN inventories ON items.inventory_id = inventories.id
    WHERE items.id = item_attachments.item_id
    AND inventories.user_id::text = auth.uid()::text
  )
);

CREATE POLICY "Users can view attachments for items in their inventories"
ON item_attachments FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM items
    JOIN inventories ON items.inventory_id = inventories.id
    WHERE items.id = item_attachments.item_id
    AND inventories.user_id::text = auth.uid()::text
  )
);

-- Add storage bucket policies if not already present
INSERT INTO storage.buckets (id, name, public) 
VALUES ('item-attachments', 'item-attachments', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload attachments"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'item-attachments' AND 
  (storage.foldername(name))[1]::text = auth.uid()::text
);

CREATE POLICY "Users can view attachments"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'item-attachments'
);

-- Similar policies for other tables... 