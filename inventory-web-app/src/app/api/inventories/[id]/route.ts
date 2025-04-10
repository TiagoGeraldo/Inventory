import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    // First delete all items associated with this inventory
    const { error: itemsError } = await supabase
      .from('items')
      .delete()
      .eq('inventory_id', params.id);

    if (itemsError) throw itemsError;

    // Then delete the inventory itself
    const { error: inventoryError } = await supabase
      .from('inventories')
      .delete()
      .eq('id', params.id);

    if (inventoryError) throw inventoryError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const body = await request.json();

    const { error } = await supabase
      .from('inventories')
      .update({
        name: body.name,
        description: body.description,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 