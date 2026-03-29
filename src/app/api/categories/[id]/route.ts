import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.collection('categories').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting category', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
