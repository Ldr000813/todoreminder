import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  try {
    const MOCK_USER_ID = process.env.MOCK_USER_ID || 'test-user-id';
    
    let query = db.collection('transactions').where('userId', '==', MOCK_USER_ID);
    
    if (date) {
      query = query.where('date', '==', date);
    }

    const snapshot = await query.get();
    let transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Sort by createdAt descending
    transactions.sort((a: any, b: any) => {
      const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
      const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
      return timeB - timeA;
    });

    return NextResponse.json({ transactions });
  } catch (error: any) {
    console.error('Error fetching transactions', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const MOCK_USER_ID = process.env.MOCK_USER_ID || 'test-user-id';

    const newTransaction = {
      userId: MOCK_USER_ID,
      amount: Number(body.amount),
      type: body.type, // 'income' or 'expense'
      categoryId: body.categoryId,
      categoryName: body.categoryName || '',
      note: body.note || '',
      date: body.date, 
      createdAt: new Date(),
    };

    const docRef = await db.collection('transactions').add(newTransaction);

    return NextResponse.json({ id: docRef.id, ...newTransaction }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating transaction', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
