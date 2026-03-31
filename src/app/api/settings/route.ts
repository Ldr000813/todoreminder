import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const MOCK_USER_ID = process.env.MOCK_USER_ID || 'test-user-id';
    
    const docRef = db.collection('userSettings').doc(MOCK_USER_ID);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ settings: { strategyText: '' } });
    }

    return NextResponse.json({ settings: doc.data() });
  } catch (error: any) {
    console.error('Error fetching settings', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { strategyText } = body;
    const MOCK_USER_ID = process.env.MOCK_USER_ID || 'test-user-id';

    const docRef = db.collection('userSettings').doc(MOCK_USER_ID);
    await docRef.set({ strategyText, updatedAt: new Date() }, { merge: true });

    return NextResponse.json({ success: true, strategyText });
  } catch (error: any) {
    console.error('Error updating settings', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
