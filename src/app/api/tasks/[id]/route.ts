import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updateData = {
      ...body,
      updatedAt: new Date(),
    };

    const docRef = db.collection('tasks').doc(id);
    await docRef.update(updateData);

    return NextResponse.json({ success: true, ...updateData });
  } catch (error) {
    console.error('Error updating task', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const docRef = db.collection('tasks').doc(id);
    await docRef.delete();

    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    console.error('Error deleting task', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
