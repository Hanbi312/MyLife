const { getStore, connectLambda } = require('@netlify/blobs');

exports.handler = async (event, context) => {
  connectLambda(event);

  const user = context.clientContext && context.clientContext.user;

  if (!user) {
    return { statusCode: 401, body: JSON.stringify({ error: '로그인이 필요합니다.' }) };
  }

  const store = getStore('life-hub-data');
  const key = user.sub;

  try {
    if (event.httpMethod === 'GET') {
      const value = await store.get(key);
      return { statusCode: 200, body: JSON.stringify({ value: value || null }) };
    }

    if (event.httpMethod === 'POST') {
      await store.set(key, event.body);
      return { statusCode: 200, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
