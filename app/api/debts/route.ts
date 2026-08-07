import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { debtSchema } from '@/lib/validations/debt';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Silakan login terlebih dahulu untuk mengakses data ini' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // all | unsettled | settled
    const type = searchParams.get('type'); // all | owed_to_me | i_owe
    const search = searchParams.get('search'); // text query
    const sort = searchParams.get('sort'); // newest | oldest | amount_high | amount_low

    let query = supabase.from('debts').select('*').eq('user_id', user.id);

    // Apply status filter
    if (status === 'unsettled') {
      query = query.is('settled_at', null);
    } else if (status === 'settled') {
      query = query.not('settled_at', 'is', null);
    }

    // Apply type filter
    if (type === 'owed_to_me' || type === 'i_owe') {
      query = query.eq('type', type);
    }

    // Apply search filter
    if (search && search.trim().length > 0) {
      query = query.ilike('counterpart_name', `%${search.trim()}%`);
    }

    // Apply sorting
    if (sort === 'oldest') {
      query = query.order('created_at', { ascending: true });
    } else if (sort === 'amount_high') {
      query = query.order('amount', { ascending: false });
    } else if (sort === 'amount_low') {
      query = query.order('amount', { ascending: true });
    } else {
      // Default: newest first
      query = query.order('created_at', { ascending: false });
    }

    const { data: debts, error } = await query;

    if (error) {
      console.error('Error fetching debts:', error);
      return NextResponse.json(
        { error: 'Gagal mengambil data utang piutang: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: debts }, { status: 200 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Silakan login terlebih dahulu untuk menambah data' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validationResult = debtSchema.safeParse(body);

    if (!validationResult.success) {
      const firstErrorMessage = validationResult.error.issues[0]?.message || 'Data input tidak valid';
      return NextResponse.json({ error: firstErrorMessage }, { status: 400 });
    }

    const validatedData = validationResult.data;

    const { data: newDebt, error } = await supabase
      .from('debts')
      .insert({
        user_id: user.id,
        type: validatedData.type,
        counterpart_name: validatedData.counterpart_name,
        amount: validatedData.amount,
        due_date: validatedData.due_date || new Date().toISOString().split('T')[0],
        note: validatedData.note || null,
        settled_at: null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating debt:', error);
      return NextResponse.json(
        { error: 'Gagal menyimpan transaksi: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Berhasil mencatat transaksi baru', data: newDebt },
      { status: 201 }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
