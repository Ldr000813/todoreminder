import nodemailer from 'nodemailer';

// If users want to use SendGrid in the future, they would construct a different transporter.
// For SMTP (e.g. Gmail), we just use Nodemailer.
export async function sendDailyReport(email: string, date: string, tasks: any[]) {
  const doneTasks = tasks.filter(t => t.status === 'DONE');
  const incompleteTasks = tasks.filter(t => t.status !== 'DONE');
  const completionRate = tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0;

  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #4f46e5;">✨ ${date} のタスクレポート</h2>
      <p style="font-size: 16px;">今日のタスク完了率: <strong style="color: #0f172a; font-size: 20px;">${completionRate}%</strong> (${doneTasks.length} / ${tasks.length}件)</p>
      
      <hr style="border: 1px solid #e2e8f0; margin: 20px 0;" />
      
      <h3 style="color: #10b981;">✅ 完了したタスク</h3>
      <ul style="line-height: 1.6;">
        ${doneTasks.map(t => `<li style="color: #475569;">${t.title}</li>`).join('') || '<li style="color: #94a3b8;">なし</li>'}
      </ul>

      <h3 style="color: #f59e0b; margin-top: 30px;">📝 未完了タスク（未着手・進行中）</h3>
      <ul style="line-height: 1.6;">
        ${incompleteTasks.map(t => `<li style="color: #475569; font-weight: bold;">${t.title} <span style="font-weight: normal; font-size: 13px; color: #94a3b8;">[${t.status === 'IN_PROGRESS' ? '進行中' : 'TODO'}]</span></li>`).join('') || '<li style="color: #94a3b8;">なし</li>'}
      </ul>
      
      <p style="margin-top: 40px; font-size: 14px; color: #64748b;">明日のタスクも整理しておきましょう！<br/>TaskFlow アプリより自動送信</p>
    </div>
  `;

  // 環境変数から SMTP の設定を読み込む
  const { SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_USER || !SMTP_PASS) {
      console.warn("SMTP_USER or SMTP_PASS is not set. Simulating email send (No real email sent).");
      return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"TaskFlow" <${SMTP_USER}>`,
    to: email,
    subject: `【日次レポート】${date}のタスク進捗のお知らせ`,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully: ' + info.response);
  } catch (error) {
    console.error('Error sending email via Nodemailer:', error);
  }
}
