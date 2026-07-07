const { getStore } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  // Netlify Identity로 로그인한 사용자 정보는 context.clientContext.user에 자동으로 들어옵니다.
  const user = context.clientContext && context.clientContext.user;

  if (!user) {
    return { statusCode: 401, body: JSON.stringify({ error: '로그인이 필요합니다.' }) };
  }

  const store = getStore('life-hub-data');
  const key = user.sub; // 사용자별 고유 ID를 키로 사용 (다른 사람 데이터와 절대 섞이지 않음)

  try {
    if (event.httpMethod === 'GET') {
      const value = await store.get(key);
      return { statusCode: 200, body: JSON.stringify({ value: value || null }) };
    }

    if (event.httpMethod === 'POST') {
      // event.body 자체가 이미 JSON 문자열이므로 그대로 저장
      await store.set(key, event.body);
      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
