import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { name, description, quantity, location } = await request.json();

    const { data, error } = await supabase
      .from('items')
      .insert([
        {
          inventory_id: params.id,
          name,
          description,
          quantity,
          location,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    const { itemId, ...updates } = await request.json();

    const { data, error } = await supabase
      .from('items')
      .update(updates)
      .eq('id', itemId)
      .eq('inventory_id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 