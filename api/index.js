// ========================================================
// KOJI SUSHI - VERCEL SERVERLESS FUNCTION API
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

module.exports = async function handler(req, res) {
  // Configuração CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ message: 'OK' });
  }

  const query = req.query || {};
  const action = query.action || '';
  const method = req.method;
  const body = req.body || {};

  // Se o Supabase não estiver configurado nas variáveis de ambiente da Vercel
  if (!isConfigured()) {
    return res.status(200).json({
      configured: false,
      message: 'Supabase ainda não configurado nas variáveis de ambiente da Vercel. Operando via cache local.',
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
      return res.status(200).json({
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
      return res.status(200).json({ data: Array.isArray(data) ? data[0] : data });
    }

    if (action === 'update-settings' && method === 'POST') {
      const data = await supabaseFetch('/settings?id=eq.store-settings', {
        method: 'PATCH',
        body: JSON.stringify(body)
      });
      return res.status(200).json({ data: Array.isArray(data) ? data[0] : data });
    }

    if (action === 'admin-login' && method === 'POST') {
      const inputPass = String(body.password || '').trim();
      if (!inputPass) {
        return res.status(400).json({ success: false, error: 'Senha não informada.' });
      }
      const data = await supabaseFetch('/settings?select=admin_password_hash&limit=1');
      const storeSettings = Array.isArray(data) ? data[0] : data;
      const expectedPass = String(storeSettings?.admin_password_hash || '').trim();

      if (!expectedPass) {
        return res.status(500).json({ success: false, error: 'Senha não configurada no banco.' });
      }
      if (inputPass === expectedPass) {
        return res.status(200).json({ success: true, token: `token_${Date.now()}` });
      }
      return res.status(401).json({ success: false, error: 'Senha incorreta.' });
    }

    // ----------------------------------------------------
    // 2. HORÁRIOS DE FUNCIONAMENTO
    // ----------------------------------------------------
    if (action === 'get-hours') {
      const data = await supabaseFetch('/operating_hours?order=day_of_week.asc');
      return res.status(200).json({ data });
    }

    if (action === 'update-hours' && method === 'POST') {
      const hoursList = body.hours || [];
      for (const h of hoursList) {
        await supabaseFetch(`/operating_hours?day_of_week=eq.${h.day_of_week}`, {
          method: 'PATCH',
          body: JSON.stringify(h)
        }).catch(() => null);
      }
      return res.status(200).json({ data: hoursList });
    }

    // ----------------------------------------------------
    // 3. CATEGORIAS
    // ----------------------------------------------------
    if (action === 'get-categories') {
      const data = await supabaseFetch('/categories?order=order_index.asc');
      return res.status(200).json({ data });
    }

    if (action === 'save-category' && method === 'POST') {
      const cat = body;
      const result = await supabaseFetch('/categories', {
        method: 'POST',
        headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify(cat)
      });
      return res.status(200).json({ data: Array.isArray(result) ? result[0] : result });
    }

    if (action === 'delete-category' && (method === 'DELETE' || method === 'POST')) {
      const id = body.id || query.id;
      await supabaseFetch(`/categories?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
      return res.status(200).json({ success: true });
    }

    // ----------------------------------------------------
    // 4. PRODUTOS
    // ----------------------------------------------------
    if (action === 'get-products') {
      const data = await supabaseFetch('/products?order=order_index.asc');
      return res.status(200).json({ data });
    }

    if (action === 'save-product' && method === 'POST') {
      const prod = body;
      const result = await supabaseFetch('/products', {
        method: 'POST',
        headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify(prod)
      });
      return res.status(200).json({ data: Array.isArray(result) ? result[0] : result });
    }

    if (action === 'delete-product' && (method === 'DELETE' || method === 'POST')) {
      const id = body.id || query.id;
      await supabaseFetch(`/products?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
      return res.status(200).json({ success: true });
    }

    // ----------------------------------------------------
    // 5. ADICIONAIS / OPCIONAIS
    // ----------------------------------------------------
    if (action === 'get-optionals') {
      const data = await supabaseFetch('/optionals?order=order_index.asc');
      return res.status(200).json({ data });
    }

    if (action === 'save-optional' && method === 'POST') {
      const opt = body;
      const result = await supabaseFetch('/optionals', {
        method: 'POST',
        headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify(opt)
      });
      return res.status(200).json({ data: Array.isArray(result) ? result[0] : result });
    }

    if (action === 'delete-optional' && (method === 'DELETE' || method === 'POST')) {
      const id = body.id || query.id;
      await supabaseFetch(`/optionals?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
      return res.status(200).json({ success: true });
    }

    // ----------------------------------------------------
    // 6. BAIRROS E TAXAS
    // ----------------------------------------------------
    if (action === 'get-neighborhoods') {
      const data = await supabaseFetch('/neighborhoods?order=order_index.asc');
      return res.status(200).json({ data });
    }

    if (action === 'save-neighborhood' && method === 'POST') {
      const neigh = body;
      const result = await supabaseFetch('/neighborhoods', {
        method: 'POST',
        headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify(neigh)
      });
      return res.status(200).json({ data: Array.isArray(result) ? result[0] : result });
    }

    if (action === 'delete-neighborhood' && (method === 'DELETE' || method === 'POST')) {
      const id = body.id || query.id;
      await supabaseFetch(`/neighborhoods?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
      return res.status(200).json({ success: true });
    }

    // ----------------------------------------------------
    // 7. ENTREGADORES
    // ----------------------------------------------------
    if (action === 'get-couriers') {
      const data = await supabaseFetch('/couriers?order=name.asc');
      return res.status(200).json({ data });
    }

    if (action === 'save-courier' && method === 'POST') {
      const cour = body;
      const result = await supabaseFetch('/couriers', {
        method: 'POST',
        headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify(cour)
      });
      return res.status(200).json({ data: Array.isArray(result) ? result[0] : result });
    }

    if (action === 'delete-courier' && (method === 'DELETE' || method === 'POST')) {
      const id = body.id || query.id;
      await supabaseFetch(`/couriers?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
      return res.status(200).json({ success: true });
    }

    // ----------------------------------------------------
    // 8. PEDIDOS
    // ----------------------------------------------------
    if (action === 'get-orders') {
      const data = await supabaseFetch('/orders?order=created_at.desc&limit=100');
      return res.status(200).json({ data });
    }

    if (action === 'create-order' && method === 'POST') {
      const order = body;
      const result = await supabaseFetch('/orders', {
        method: 'POST',
        body: JSON.stringify(order)
      });
      return res.status(200).json({ data: Array.isArray(result) ? result[0] : result });
    }

    if (action === 'update-order' && method === 'POST') {
      const { id, ...updates } = body;
      const result = await supabaseFetch(`/orders?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      });
      return res.status(200).json({ data: Array.isArray(result) ? result[0] : result });
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
      return res.status(200).json({ success: true });
    }

    // ----------------------------------------------------
    // 9. CLIENTES E ENDEREÇOS
    // ----------------------------------------------------
    if (action === 'get-user-by-phone') {
      const phone = query.phone || '';
      const data = await supabaseFetch(`/users?phone=eq.${encodeURIComponent(phone)}&limit=1`);
      return res.status(200).json({ data: Array.isArray(data) ? data[0] : data });
    }

    if (action === 'save-user' && method === 'POST') {
      const user = body;
      const result = await supabaseFetch('/users', {
        method: 'POST',
        headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify(user)
      });
      return res.status(200).json({ data: Array.isArray(result) ? result[0] : result });
    }

    if (action === 'get-user-addresses') {
      const userId = query.user_id || '';
      const data = await supabaseFetch(`/user_addresses?user_id=eq.${encodeURIComponent(userId)}`);
      return res.status(200).json({ data: data || [] });
    }

    // ----------------------------------------------------
    // 10. FECHAMENTO DE CAIXA
    // ----------------------------------------------------
    if (action === 'get-cash-closings') {
      const data = await supabaseFetch('/cash_closings?order=date_ref.desc');
      return res.status(200).json({ data: data || [] });
    }

    if (action === 'save-cash-closing' && method === 'POST') {
      const closing = body;
      const result = await supabaseFetch('/cash_closings', {
        method: 'POST',
        headers: { 'Prefer': 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify(closing)
      });
      return res.status(200).json({ data: Array.isArray(result) ? result[0] : result });
    }

    return res.status(404).json({ error: `Ação desconhecida: ${action}` });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Erro interno no servidor' });
  }
};
