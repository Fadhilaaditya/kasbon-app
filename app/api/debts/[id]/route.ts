import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { debtUpdateSchema } from '@/lib/validations/debt';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'ID transaksi tidak ditemukan' }, { status: 400 });
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Silakan login terlebih dahulu untuk mengubah data' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validationResult = debtUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      const firstErrorMessage = validationResult.error.issues[0]?.message || 'Data input tidak valid';
      return NextResponse.json({ error: firstErrorMessage }, { status: 400 });
    }

    const { is_settled, ...updateFields } = body;

    const payloadToUpdate: Record<string, unknown> = {};

    if (updateFields.type) payloadToUpdate.type = updateFields.type;
    if (updateFields.counterpart_name) payloadToUpdate.counterpart_name = updateFields.counterpart_name;
    if (updateFields.amount !== undefined) payloadToUpdate.amount = updateFields.amount;
    if (updateFields.due_date !== undefined) payloadToUpdate.due_date = updateFields.due_date;
    if (updateFields.note !== undefined) payloadToUpdate.note = updateFields.note;

    // Toggle or explicit update for status lunas (settled_at)
    if (is_settled !== undefined) {
      payloadToUpdate.settled_at = is_settled ? new Date().toISOString() : null;
    } else if (body.settled_at !== undefined) {
      payloadToUpdate.settled_at = body.settled_at;
    }

    const { data: updatedDebt, error } = await supabase
      .from('debts')
      .update(payloadToUpdate)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating debt:', error);
      return NextResponse.json(
        { error: 'Gagal mengupdate transaksi: ' + error.message },
        { status: 500 }
      );
    }

    if (!updatedDebt) {
      return NextResponse.json(
        { error: 'Transaksi tidak ditemukan atau Anda tidak memiliki akses' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Berhasil mengupdate transaksi', data: updatedDebt },
      { status: 200 }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'ID transaksi tidak ditemukan' }, { status: 400 });
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Silakan login terlebih dahulu untuk menghapus data' },
        { status: 401 }
      );
    }

    const { error } = await supabase
      .from('debts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting debt:', error);
      return NextResponse.json(
        { error: 'Gagal menghapus transaksi: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Berhasil menghapus transaksi' },
      { status: 200 }
    );
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
