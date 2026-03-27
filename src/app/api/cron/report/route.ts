import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase-admin';
import { sendDailyReport } from '@/lib/email';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  // Validate request via CRON_SECRET if it's set
  const authHeader = request.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const jstTime = toZonedTime(now, 'Asia/Tokyo');
    const todayStr = format(jstTime, 'yyyy-MM-dd');

    const usersSnapshot = await db.collection('users').where('reportEnabled', '==', true).get();
    
    // Fallback if users empty, to let me mock sending to a default address
    if (usersSnapshot.empty && process.env.MOCK_USER_EMAIL) {
       console.log('Sending mock email to ' + process.env.MOCK_USER_EMAIL);
       const tasksSnapshot = await db.collection('tasks')
          .where('date', '==', todayStr)
          .get();
       const tasks = tasksSnapshot.docs.map(doc => doc.data());
       await sendDailyReport(process.env.MOCK_USER_EMAIL, todayStr, tasks);
    }

    const sendPromises = usersSnapshot.docs.map(async (userDoc) => {
      const userData = userDoc.data();
      
      const tasksSnapshot = await db.collection('tasks')
        .where('userId', '==', userDoc.id)
        .where('date', '==', todayStr)
        .get();

      const tasks = tasksSnapshot.docs.map(doc => doc.data());
      
      if (userData.email) {
        await sendDailyReport(userData.email, todayStr, tasks);
      }
    });

    await Promise.all(sendPromises);

    return NextResponse.json({ success: true, message: `Report sent to ${usersSnapshot.size} users.` });
  } catch (error) {
    console.error('Error in cron/report:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
