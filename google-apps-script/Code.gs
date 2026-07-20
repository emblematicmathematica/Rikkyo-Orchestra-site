const RECIPIENTS = {
  support: 'rikkyo.univ.symphony@gmail.com',
  performance: 'rikkyo.univ.symphony@gmail.com',
  tickets: 'rikkyo.orch.ticket.2025@gmail.com',
};

const FORM_TITLES = {
  support: 'ご寄付',
  performance: '依頼演奏',
  tickets: 'チケット',
};

const FIELD_LABELS = {
  name: 'お名前',
  email: 'メールアドレス',
  support_type: 'ご寄付の種別',
  event_name: '催し名',
  desired_date: '開催希望日',
  venue: '会場',
  ensemble: 'ご希望編成',
  ticket_topic: 'ご用件',
  concert_name: '対象公演',
  message: '内容',
};

const FORM_FIELDS = {
  support: ['name', 'email', 'support_type', 'message'],
  performance: ['name', 'email', 'event_name', 'desired_date', 'venue', 'ensemble', 'message'],
  tickets: ['name', 'email', 'ticket_topic', 'concert_name', 'message'],
};

function jsonOutput_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function cleanSingleLine_(value) {
  return String(value || '').replace(/[\r\n]+/g, ' ').trim();
}

function cleanMessage_(value) {
  return String(value || '').replace(/\r\n?/g, '\n').trim();
}

function doGet() {
  return jsonOutput_({ ok: true, service: 'rikkyo-orchestra-form-mailer' });
}

function doPost(e) {
  try {
    const expectedSecret = PropertiesService.getScriptProperties().getProperty('WEBHOOK_SECRET');
    const payload = JSON.parse(e.postData.contents || '{}');
    if (!expectedSecret || payload.secret !== expectedSecret) {
      return jsonOutput_({ ok: false, error: 'forbidden' });
    }

    const formType = cleanSingleLine_(payload.formType);
    const recipient = RECIPIENTS[formType];
    const fields = FORM_FIELDS[formType];
    if (!recipient || !fields) {
      return jsonOutput_({ ok: false, error: 'invalid_form_type' });
    }

    const name = cleanSingleLine_(payload.name);
    const replyTo = cleanSingleLine_(payload.email);
    if (!name || !replyTo || !cleanMessage_(payload.message)) {
      return jsonOutput_({ ok: false, error: 'missing_required_fields' });
    }
    if (MailApp.getRemainingDailyQuota() < 1) {
      return jsonOutput_({ ok: false, error: 'daily_quota_exceeded' });
    }

    const lines = [
      'ウェブサイトのフォームから新しい送信がありました。',
      '',
      `受付種別: ${FORM_TITLES[formType]}`,
      `受信日時: ${Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd HH:mm:ss')}`,
      '',
    ];

    fields.forEach((field) => {
      const value = field === 'message' ? cleanMessage_(payload[field]) : cleanSingleLine_(payload[field]);
      if (value) lines.push(`${FIELD_LABELS[field]}:\n${value}\n`);
    });

    lines.push('このメールへ返信すると、フォームに入力されたメールアドレスへ返信できます。');

    MailApp.sendEmail({
      to: recipient,
      subject: `【ウェブサイト】${FORM_TITLES[formType]}フォーム - ${name}`,
      body: lines.join('\n'),
      name: '立教大学交響楽団ウェブサイト',
      replyTo,
    });

    return jsonOutput_({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonOutput_({ ok: false, error: 'internal_error' });
  }
}
