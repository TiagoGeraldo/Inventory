import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    const supabase = createClient();

    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', params.itemId)
      .eq('inventory_id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 