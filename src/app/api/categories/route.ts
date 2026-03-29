import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

const INITIAL_CATEGORIES = [
  { name: '食費', type: 'expense' },
  { name: '交通費', type: 'expense' },
  { name: '日用品', type: 'expense' },
  { name: 'エンタメ', type: 'expense' },
  { name: '固定費', type: 'expense' },
  { name: 'その他', type: 'expense' },
  { name: '給料', type: 'income' },
  { name: 'お小遣い', type: 'income' },
  { name: '臨時収入', type: 'income' }
];

export async function GET(request: Request) {
  try {
    const MOCK_USER_ID = process.env.MOCK_USER_ID || 'test-user-id';
    
    const snapshot = await db.collection('categories').where('userId', '==', MOCK_USER_ID).get();
    let categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Auto-create initial categories if empty
    if (categories.length === 0) {
      const batch = db.batch();
      categories = INITIAL_CATEGORIES.map(({ name, type }) => {
        const docRef = db.collection('categories').doc();
        const data = { userId: MOCK_USER_ID, name, type, createdAt: new Date() };
        batch.set(docRef, data);
        return { id: docRef.id, ...data };
      });
      await batch.commit();
    }

    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error('Error fetching categories', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const MOCK_USER_ID = process.env.MOCK_USER_ID || 'test-user-id';

    const newCategory = {
      userId: MOCK_USER_ID,
      name: body.name,
      type: body.type || 'expense',
      createdAt: new Date(),
    };

    const docRef = await db.collection('categories').add(newCategory);

    return NextResponse.json({ id: docRef.id, ...newCategory }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
