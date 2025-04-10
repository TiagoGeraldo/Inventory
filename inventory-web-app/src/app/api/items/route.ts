import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const body = await request.json();

    const { error } = await supabase
      .from('items')
      .insert({
        name: body.name,
        description: body.description,
        quantity: body.quantity,
        inventory_id: body.inventory_id,
        location: body.location,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = createClient();
    const body = await request.json();

    const { error } = await supabase
      .from('items')
      .update({
        name: body.name,
        description: body.description,
        quantity: body.quantity,
        location: body.location,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 