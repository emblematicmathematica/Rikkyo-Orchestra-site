const FORM_RULES = {
  support: {
    required: ['name', 'email', 'support_type', 'message'],
    allowed: ['name', 'email', 'support_type', 'message'],
  },
  performance: {
    required: ['name', 'email', 'event_name', 'desired_date', 'venue', 'message'],
    allowed: ['name', 'email', 'event_name', 'desired_date', 'venue', 'ensemble', 'message'],
  },
  tickets: {
    required: ['name', 'email', 'ticket_topic', 'message'],
    allowed: ['name', 'email', 'ticket_topic', 'concert_name', 'message'],
  },
};

const FIELD_LIMITS = {
  name: 100,
  email: 254,
  support_type: 40,
  event_name: 150,
  desired_date: 100,
  venue: 200,
  ensemble: 150,
  ticket_topic: 80,
  concert_name: 150,
  message: 3000,
};

const DATABASE_FIELDS = [
  'support_type',
  'event_name',
  'desired_date',
  'venue',
  'ensemble',
  'ticket_topic',
  'concert_name',
];

function jsonResponse(body, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function cleanValue(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateSubmission(input) {
  const formType = cleanValue(input.form_type);
  const rule = FORM_RULES[formType];
  if (!rule) return { error: 'フォームの種類を確認できませんでした。' };

  if (cleanValue(input.website)) return { spam: true };
  if (cleanValue(input.privacy_consent) !== '同意する') {
    return { error: '個人情報の取り扱いへの同意が必要です。' };
  }

  const data = { form_type: formType };
  for (const field of rule.allowed) {
    const value = cleanValue(input[field]);
    if (rule.required.includes(field) && !value) {
      return { error: '必須項目を入力してください。' };
    }
    if (value.length > FIELD_LIMITS[field]) {
      return { error: '入力文字数が上限を超えています。' };
    }
    if (field !== 'message' && /[\r\n]/.test(value)) {
      return { error: '入力内容を確認してください。' };
    }
    data[field] = value;
  }

  if (!isValidEmail(data.email)) {
    return { error: 'メールアドレスを確認してください。' };
  }

  return { data };
}

async function parseBody(request) {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > 16_000) throw new Error('payload_too_large');

  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return request.json();
  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    return Object.fromEntries(await request.formData());
  }
  throw new Error('unsupported_content_type');
}

async function saveInquiry(db, data) {
  const optionalValues = DATABASE_FIELDS.map((field) => data[field] || null);
  const result = await db.prepare(`
    INSERT INTO inquiries (
      form_type, name, email, support_type, event_name, desired_date,
      venue, ensemble, ticket_topic, concert_name, message
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    data.form_type,
    data.name,
    data.email,
    ...optionalValues,
    data.message,
  ).run();
  return result.meta.last_row_id;
}

async function updateNotificationStatus(db, inquiryId, status, error = null) {
  const notifiedAt = status === 'sent' ? new Date().toISOString() : null;
  await db.prepare(`
    UPDATE inquiries
    SET notification_status = ?, notified_at = ?, notification_error = ?
    WHERE id = ?
  `).bind(status, notifiedAt, error, inquiryId).run();
}

async function sendGmailNotification(env, data) {
  if (!env.GMAIL_WEBHOOK_URL || !env.GMAIL_WEBHOOK_SECRET) {
    throw new Error('gmail_webhook_not_configured');
  }

  const response = await fetch(env.GMAIL_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: env.GMAIL_WEBHOOK_SECRET,
      formType: data.form_type,
      name: data.name,
      email: data.email,
      support_type: data.support_type,
      event_name: data.event_name,
      desired_date: data.desired_date,
      venue: data.venue,
      ensemble: data.ensemble,
      ticket_topic: data.ticket_topic,
      concert_name: data.concert_name,
      message: data.message,
    }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.ok) {
    throw new Error(result.error || `gmail_webhook_${response.status}`);
  }
}

async function handleInquiry(request, env) {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get('origin');
  if (origin && origin !== requestUrl.origin) {
    return jsonResponse({ ok: false, message: 'このページからは送信できません。' }, 403);
  }

  try {
    const input = await parseBody(request);
    const result = validateSubmission(input);
    if (result.spam) return jsonResponse({ ok: true });
    if (result.error) return jsonResponse({ ok: false, message: result.error }, 400);

    const inquiryId = await saveInquiry(env.INQUIRIES_DB, result.data);
    let notificationStatus = 'sent';
    let notificationError = null;
    try {
      await sendGmailNotification(env, result.data);
    } catch (error) {
      notificationStatus = 'failed';
      notificationError = error instanceof Error ? error.message : 'unknown_error';
      const errorCode = notificationError;
      console.error('Gmail notification failed', errorCode);
    }
    try {
      await updateNotificationStatus(
        env.INQUIRIES_DB,
        inquiryId,
        notificationStatus,
        notificationError?.slice(0, 200) || null,
      );
    } catch (statusError) {
      console.error('Notification status update failed', statusError);
    }
    return jsonResponse({ ok: true, message: '送信しました。お問い合わせありがとうございます。' }, 201);
  } catch (error) {
    if (error instanceof Error && error.message === 'payload_too_large') {
      return jsonResponse({ ok: false, message: '入力内容が長すぎます。' }, 413);
    }
    if (error instanceof Error && error.message === 'unsupported_content_type') {
      return jsonResponse({ ok: false, message: '送信形式を確認できませんでした。' }, 415);
    }
    console.error('Inquiry submission failed', error);
    return jsonResponse({ ok: false, message: '送信できませんでした。時間をおいてもう一度お試しください。' }, 500);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/inquiries') {
      if (request.method !== 'POST') {
        return jsonResponse({ ok: false, message: 'このURLはフォーム送信専用です。' }, 405);
      }
      return handleInquiry(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
