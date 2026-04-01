import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');

  try {
    const MOCK_USER_ID = process.env.MOCK_USER_ID || 'test-user-id';
    
    // Firestore composite indexを避けるため、orderByを外しメモリ上でソートします
    let query = db.collection('tasks').where('userId', '==', MOCK_USER_ID);
    
    if (date) {
      query = query.where('date', '==', date);
    }

    const snapshot = await query.get();
    let tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // 日時ソート（orderプロパティの昇順）
    tasks.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

    return NextResponse.json({ tasks });
  } catch (error: any) {
    console.error('Error fetching tasks', error);
    // 開発用にエラーメッセージを返す
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, memo, date, status, order } = body;
    const MOCK_USER_ID = process.env.MOCK_USER_ID || 'test-user-id';
    const { v4: uuidv4 } = require('uuid');

    const newTask = {
      taskId: uuidv4(),
      userId: MOCK_USER_ID,
      title,
      memo: memo || '',
      status: status || 'TODO',
      date,
      order: order || 0,
      failureReason: body.failureReason || '',
      bulkId: body.bulkId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection('tasks').add(newTask);

    return NextResponse.json({ id: docRef.id, ...newTask }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating task', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const bulkId = searchParams.get('bulkId');
  
  if (!bulkId) {
    return NextResponse.json({ error: 'Missing bulkId' }, { status: 400 });
  }

  try {
    const MOCK_USER_ID = process.env.MOCK_USER_ID || 'test-user-id';
    const snapshot = await db.collection('tasks')
      .where('userId', '==', MOCK_USER_ID)
      .where('bulkId', '==', bulkId)
      .get();
      
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();

    return NextResponse.json({ success: true, deletedCount: snapshot.docs.length });
  } catch (error: any) {
    console.error('Error in bulk delete:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
