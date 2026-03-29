import nodemailer from 'nodemailer';

export async function sendDailyReport(email: string, date: string, tasks: any[], transactions: any[] = []) {
  // Task calculations
  const doneTasks = tasks.filter(t => t.status === 'DONE');
  const failedTasks = tasks.filter(t => t.status === 'FAILED');
  const incompleteTasks = tasks.filter(t => t.status === 'TODO' || t.status === 'IN_PROGRESS');
  const completionRate = tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0;

  // Money calculations
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const netAmount = totalIncome - totalExpense;

  const expensesByCategory = transactions.filter(t => t.type === 'expense').reduce((acc, t) => {
    acc[t.categoryName] = (acc[t.categoryName] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  // --- Gemini AI ---
  let aiAdviceHtml = '';
  if (process.env.GEMINI_API_KEY) {
    try {
      const promptText = `
あなたは優秀なタイムマネジメント・コーチAIです。ユーザーの1日のタスクと収支結果を分析し、励ましと具体的なアドバイスを2〜3つの段落で完結に示してください。です・ます調のフレンドリーな口調でお願いします。

【本日の実行結果】
日付: ${date}

[タスク]
完了率: ${completionRate}% (${doneTasks.length}/${tasks.length}件)
✅ 完了タスク: ${doneTasks.map(t => t.title).join(', ') || 'なし'}
📝 未完了タスク: ${incompleteTasks.map(t => t.title).join(', ') || 'なし'}
❌ 失敗タスクと原因:
${failedTasks.map(t => `- タスク: ${t.title} (原因: ${t.failureReason || '未記入'})`).join('\n') || 'なし'}

[収支]
収入: +${totalIncome}円
支出: -${totalExpense}円
収支合計: ${netAmount >= 0 ? '+' : ''}${netAmount}円
📊 支出内訳: ${Object.entries(expensesByCategory).map(([cat, amt]) => `${cat}: ${amt}円`).join(', ') || 'なし'}

特に失敗した原因がある場合はそれを踏まえ、またお金の使い方の傾向も含めた明日の改善に向けた優しいアドバイスを含めてください。結果が良ければ大いに褒めてください。内容はHTMLタグを含まないプレーンテキストで出力してください。
`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        })
      });

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (aiResponse) {
        const formattedAdvice = aiResponse.replace(/\n/g, '<br/>');
        aiAdviceHtml = `
          <div style="background-color: #f8fafc; border-left: 4px solid #6366f1; padding: 16px; margin-top: 30px; border-radius: 0 8px 8px 0;">
            <p style="color: #4338ca; font-weight: bold; margin-top: 0; font-size: 14px; letter-spacing: 0.5px;">🤖 AIコーチからのアドバイス</p>
            <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-bottom: 0;">
              ${formattedAdvice}
            </p>
          </div>
        `;
      }
    } catch (error) {
      console.error('Failed to get Gemini analysis:', error);
      aiAdviceHtml = '';
    }
  }

  // --- HTML作成 ---
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #4f46e5;">✨ ${date} のデイリーレポート</h2>
      
      ${aiAdviceHtml}

      <hr style="border: 1px solid #e2e8f0; margin: 20px 0;" />
      
      <h3 style="color: #4f46e5;">💰 本日の収支サマリー</h3>
      <div style="display: flex; gap: 10px; margin-bottom: 20px;">
        <div style="flex: 1; background-color: #ecfdf5; padding: 15px; border-radius: 8px;">
          <div style="color: #059669; font-size: 13px; font-weight: bold;">収入</div>
          <div style="color: #059669; font-size: 18px; font-weight: bold;">+${totalIncome.toLocaleString()}円</div>
        </div>
        <div style="flex: 1; background-color: #fff1f2; padding: 15px; border-radius: 8px;">
          <div style="color: #e11d48; font-size: 13px; font-weight: bold;">支出</div>
          <div style="color: #e11d48; font-size: 18px; font-weight: bold;">-${totalExpense.toLocaleString()}円</div>
        </div>
      </div>
      <p style="font-size: 16px; font-weight: bold;">収支合計: <span style="color: ${netAmount >= 0 ? '#10b981' : '#e11d48'}">${netAmount >= 0 ? '+' : ''}${netAmount.toLocaleString()}円</span></p>
      
      ${Object.keys(expensesByCategory).length > 0 ? `
      <h4 style="color: #64748b; margin-top: 20px; font-size: 14px;">支出の内訳 (割合)</h4>
      <ul style="line-height: 1.6;">
        ${Object.entries(expensesByCategory)
          .sort((a: any, b: any) => b[1] - a[1])
          .map(([cat, amt]: [string, any]) => {
            const percent = Math.round((amt / totalExpense) * 100);
            return '<li style="color: #475569;">' + cat + ': ' + Number(amt).toLocaleString() + '円 (' + percent + '%)</li>';
          }).join('')}
      </ul>
      ` : ''}

      <hr style="border: 1px solid #e2e8f0; margin: 30px 0;" />

      <h3 style="color: #4f46e5;">📋 タスクサマリー</h3>
      <p style="font-size: 14px;">完了率: <strong style="color: #0f172a; font-size: 16px;">${completionRate}%</strong> (${doneTasks.length} / ${tasks.length}件)</p>
      
      <h4 style="color: #10b981; margin-top: 20px;">✅ 完了</h4>
      <ul style="line-height: 1.6; padding-left: 20px; margin-top: 5px;">
        ${doneTasks.map(t => `<li style="color: #475569;">${t.title}</li>`).join('') || '<li style="color: #94a3b8;">なし</li>'}
      </ul>

      <h4 style="color: #f59e0b; margin-top: 20px;">📝 未完了（未着手・進行中）</h4>
      <ul style="line-height: 1.6; padding-left: 20px; margin-top: 5px;">
        ${incompleteTasks.map(t => `<li style="color: #475569; font-weight: bold;">${t.title} <span style="font-weight: normal; font-size: 13px; color: #94a3b8;">[${t.status === 'IN_PROGRESS' ? '進行中' : 'TODO'}]</span></li>`).join('') || '<li style="color: #94a3b8;">なし</li>'}
      </ul>
      
      ${failedTasks.length > 0 ? `
      <h4 style="color: #e11d48; margin-top: 20px;">❌ 失敗・未達</h4>
      <ul style="line-height: 1.6; list-style-type: none; padding-left: 0;">
        ${failedTasks.map(t => `
          <li style="background-color: #fff1f2; border: 1px solid #fecdd3; padding: 12px; border-radius: 8px; margin-bottom: 10px;">
            <div style="color: #9f1239; font-weight: bold; text-decoration: line-through;">${t.title}</div>
            <div style="color: #be123c; font-size: 13px; margin-top: 4px;"><strong>原因:</strong> ${t.failureReason || '未記入'}</div>
          </li>
        `).join('')}
      </ul>
      ` : ''}
      
      <p style="margin-top: 40px; font-size: 14px; text-align: center; color: #64748b;">明日の準備も整えて良い一日を！<br/>TaskFlow アプリより自動送信</p>
    </div>
  `;

  const { SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_USER || !SMTP_PASS) {
      console.warn("SMTP_USER or SMTP_PASS is not set. Simulating email send.");
      return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  const mailOptions = {
    from: `"TaskFlow" <${SMTP_USER}>`,
    to: email,
    subject: `【日次レポート】${date}のタスクと収支サマリー`,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully: ' + info.response);
  } catch (error) {
    console.error('Error sending email via Nodemailer:', error);
  }
}
