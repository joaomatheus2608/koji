// ========================================================
// KOJI SUSHI - NETLIFY FUNCTION (API SERVER-SIDE)
// Todas as chamadas ao Supabase passam por aqui.
// Nenhuma credencial do Supabase é exposta no navegador.
// As variáveis de ambiente devem ser configuradas no painel da Netlify.
// ========================================================

const rawUrl = process.env.SUPABASE_URL || '';
const SUPABASE_URL = rawUrl.trim().replace(/\/+$/, '');
const SUPABASE_KEY = (
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON ||
  process.env.SUPABASE_KEY ||
  ''
).trim();

function isConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}

function supabaseHeaders() {
  return {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };
}

async function supabaseFetch(path, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { ...supabaseHeaders(), ...(options.headers || {}) }
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch {}
  if (!res.ok) {
    throw new Error(data?.message || data?.error || `Supabase error ${res.status}`);
  }
  return data;
}

exports.handler = async function (event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: JSON.stringify({ message: 'OK' }) };
  }

  const query = event.queryStringParameters || {};
  const action = query.action || '';
  const method = event.httpMethod;

  let body = {};
  if (event.body) {
    try { body = JSON.parse(event.body); } catch {}
  }

  const respond = (status, data) => ({
    statusCode: status,
    headers,
    body: JSON.stringify(data)
  });

  // Se as chaves ainda não foram configuradas na Netlify
  if (!isConfigured()) {
    return respond(200, {
      configured: false,
      message: 'Supabase ainda não configurado nas variáveis de ambiente da Netlify. Operando via cache local.',
      data: null
    });
  }

  try {
    // ----------------------------------------------------
    // 0. BOOTSTRAP UNIFICADO (Carrega tudo em 1 requisição)
    // ----------------------------------------------------
    if (action === 'get-bootstrap') {
      const [settings, hours, categories, products, optionals, neighborhoods, couriers, promotions] = await Promise.all([
        supabaseFetch('/settings?limit=1').catch(() => []),
        supabaseFetch('/operating_hours?order=day_of_week.asc').catch(() => []),
        supabaseFetch('/categories?order=order_index.asc').catch(() => []),
        supabaseFetch('/products?order=order_index.asc').catch(() => []),
        supabaseFetch('/optionals?order=order_index.asc').catch(() => []),
        supabaseFetch('/neighborhoods?order=order_index.asc').catch(() => []),
        supabaseFetch('/couriers?order=name.asc').catch(() => []),
        supabaseFetch('/promotions?is_active=eq.true').catch(() => [])
      ]);

      const storeSettings = Array.isArray(settings) ? settings[0] : settings;
      return respond(200, {
        configured: true,
        data: {
          settings: storeSettings || null,
          hours: hours || [],
          categories: categories || [],
          products: products || [],
          optionals: optionals || [],
          neighborhoods: neighborhoods || [],
          couriers: couriers || [],
          promotions: promotions || []
        }
      });
    }

    // ----------------------------------------------------
    // 1. CONFIGURAÇÕES & LOGIN ADMIN
    // ----------------------------------------------------
    if (action === 'get-settings') {
      const data = await supabaseFetch('/settings?limit=1');
      return respond(200, { data: Array.isArray(data) ? data[0] : data });
    }

    if (action === 'update-settings' && method === 'POST') {
      const data = await supabaseFetch('/settings?id=eq.store-settings', {
        method: 'PATCH',
        body: JSON.stringify(body)
      });
      return respond(200, { data: Array.isArray(data) ? data[0] : data });
    }

    if (action === 'admin-login' && method === 'POST') {
      const inputPass = String(body.password || '').trim();
      if (!inputPass) {
        return respond(400, { success: false, error: 'Senha não informada.' });
      }
      const data = await supabaseFetch('/settings?select=admin_password_hash&limit=1');
      const storeSettings = Array.isArray(data) ? data[0] : data;
      const expectedPass = String(storeSettings?.admin_password_hash || '').trim();

      if (!expectedPass) {
        return respond(500, { success: false, error: 'Senha não configurada no banco.' });
      }
      if (inputPass === expectedPass) {
        return respond(200, { success: true, token: `token_${Date.now()}` });
      }
      return respond(401, { success: false, error: 'Senha incorreta.' });
    }

    // ----------------------------------------------------
    // 2. HORÁRIOS DE FUNCIONAMENTO
    // ----------------------------------------------------
    if (action === 'get-hours') {
      const data = await supabaseFetch('/operating_hours?order=day_of_week.asc');
      return respond(200, { data });
    }

    if (action === 'update-hours' && method === 'POST') {
      const hoursList = body.hours || [];
      for (const h of hoursList) {
        await supabaseFetch(`/operating_hours?day_of_week=eq.${h.day_of_week}`, {
          method: 'PATCH',
          body: JSON.stringify(h)
        }).catch(() => null);
      }
      return respond(200, { data: hoursList });
    }

    // ----------------------------------------------------
    // 3. CATEGORIAS
    // ----------------------------------------------------
    if (action === 'get-categories') {
      const data = await supabaseFetch('/categories?order=order_index.asc');
      return respond(200, { data });
    }

    if (action === 'save-category' && method === 'POST') {
      const cat = body;
      const res = await supabaseFetch('/categories', {
        method: 'POST',
        headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify(cat)
      });
      return respond(200, { data: Array.isArray(res) ? res[0] : res });
    }

    if (action === 'delete-category' && (method === 'DELETE' || method === 'POST')) {
      const id = body.id || query.id;
      await supabaseFetch(`/categories?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
      return respond(200, { success: true });
    }

    // ----------------------------------------------------
    // 4. PRODUTOS
    // ----------------------------------------------------
    if (action === 'get-products') {
      const data = await supabaseFetch('/products?order=order_index.asc');
      return respond(200, { data });
    }

    if (action === 'save-product' && method === 'POST') {
      const prod = body;
      const res = await supabaseFetch('/products', {
        method: 'POST',
        headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify(prod)
      });
      return respond(200, { data: Array.isArray(res) ? res[0] : res });
    }

    if (action === 'delete-product' && (method === 'DELETE' || method === 'POST')) {
      const id = body.id || query.id;
      await supabaseFetch(`/products?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
      return respond(200, { success: true });
    }

    // ----------------------------------------------------
    // 5. ADICIONAIS / OPCIONAIS
    // ----------------------------------------------------
    if (action === 'get-optionals') {
      const data = await supabaseFetch('/optionals?order=order_index.asc');
      return respond(200, { data });
    }

    if (action === 'save-optional' && method === 'POST') {
      const opt = body;
      const res = await supabaseFetch('/optionals', {
        method: 'POST',
        headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify(opt)
      });
      return respond(200, { data: Array.isArray(res) ? res[0] : res });
    }

    if (action === 'delete-optional' && (method === 'DELETE' || method === 'POST')) {
      const id = body.id || query.id;
      await supabaseFetch(`/optionals?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
      return respond(200, { success: true });
    }

    // ----------------------------------------------------
    // 6. BAIRROS E TAXAS
    // ----------------------------------------------------
    if (action === 'get-neighborhoods') {
      const data = await supabaseFetch('/neighborhoods?order=order_index.asc');
      return respond(200, { data });
    }

    if (action === 'save-neighborhood' && method === 'POST') {
      const neigh = body;
      const res = await supabaseFetch('/neighborhoods', {
        method: 'POST',
        headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify(neigh)
      });
      return respond(200, { data: Array.isArray(res) ? res[0] : res });
    }

    if (action === 'delete-neighborhood' && (method === 'DELETE' || method === 'POST')) {
      const id = body.id || query.id;
      await supabaseFetch(`/neighborhoods?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
      return respond(200, { success: true });
    }

    // ----------------------------------------------------
    // 7. ENTREGADORES
    // ----------------------------------------------------
    if (action === 'get-couriers') {
      const data = await supabaseFetch('/couriers?order=name.asc');
      return respond(200, { data });
    }

    if (action === 'save-courier' && method === 'POST') {
      const cour = body;
      const res = await supabaseFetch('/couriers', {
        method: 'POST',
        headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify(cour)
      });
      return respond(200, { data: Array.isArray(res) ? res[0] : res });
    }

    if (action === 'delete-courier' && (method === 'DELETE' || method === 'POST')) {
      const id = body.id || query.id;
      await supabaseFetch(`/couriers?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
      return respond(200, { success: true });
    }

    // ----------------------------------------------------
    // 8. PEDIDOS
    // ----------------------------------------------------
    if (action === 'get-orders') {
      const data = await supabaseFetch('/orders?order=created_at.desc&limit=100');
      return respond(200, { data });
    }

    if (action === 'create-order' && method === 'POST') {
      const order = body;
      const res = await supabaseFetch('/orders', {
        method: 'POST',
        body: JSON.stringify(order)
      });
      return respond(200, { data: Array.isArray(res) ? res[0] : res });
    }

    if (action === 'update-order' && method === 'POST') {
      const { id, ...updates } = body;
      const res = await supabaseFetch(`/orders?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      });
      return respond(200, { data: Array.isArray(res) ? res[0] : res });
    }

    if (action === 'delete-orders' && method === 'POST') {
      const ids = body.ids || [];
      if (ids.length > 0) {
        for (const id of ids) {
          await supabaseFetch(`/orders?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => null);
        }
      } else {
        await supabaseFetch('/orders', { method: 'DELETE' }).catch(() => null);
      }
      return respond(200, { success: true });
    }

    // ----------------------------------------------------
    // 9. CLIENTES E ENDEREÇOS
    // ----------------------------------------------------
    if (action === 'get-user-by-phone') {
      const phone = query.phone || '';
      const data = await supabaseFetch(`/users?phone=eq.${encodeURIComponent(phone)}&limit=1`);
      return respond(200, { data: Array.isArray(data) ? data[0] : data });
    }

    if (action === 'save-user' && method === 'POST') {
      const user = body;
      const res = await supabaseFetch('/users', {
        method: 'POST',
        headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify(user)
      });
      return respond(200, { data: Array.isArray(res) ? res[0] : res });
    }

    if (action === 'get-user-addresses') {
      const userId = query.user_id || '';
      const data = await supabaseFetch(`/user_addresses?user_id=eq.${encodeURIComponent(userId)}`);
      return respond(200, { data: data || [] });
    }

    // ----------------------------------------------------
    // 10. FECHAMENTO DE CAIXA
    // ----------------------------------------------------
    if (action === 'get-cash-closings') {
      const data = await supabaseFetch('/cash_closings?order=date_ref.desc');
      return respond(200, { data: data || [] });
    }

    if (action === 'save-cash-closing' && method === 'POST') {
      const closing = body;
      const res = await supabaseFetch('/cash_closings', {
        method: 'POST',
        headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify(closing)
      });
      return respond(200, { data: Array.isArray(res) ? res[0] : res });
    }

    return respond(404, { error: `Ação desconhecida: ${action}` });
  } catch (error) {
    console.error('API Error:', error);
    return respond(500, { error: error.message || 'Erro interno no servidor' });
  }
};
