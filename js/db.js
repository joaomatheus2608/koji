// ========================================================
// KOJI SUSHI - CAMADA DE DADOS HÍBRIDA (CLOUD + LOCAL CACHE)
// Todas as credenciais do Supabase ficam seguras na Netlify (Server-side).
// Se o site rodar offline ou sem a Netlify Function, opera 100% via localStorage.
// ========================================================

(function() {
  const STORAGE_KEYS = {
    SETTINGS: 'koji_settings',
    HOURS: 'koji_hours',
    CATEGORIES: 'koji_categories',
    PRODUCTS: 'koji_products',
    OPTIONALS: 'koji_optionals',
    PROMOTIONS: 'koji_promotions',
    ORDERS: 'koji_orders',
    USERS: 'koji_users',
    ADDRESSES: 'koji_addresses',
    NEIGHBORHOODS: 'koji_neighborhoods',
    COURIERS: 'koji_couriers',
    CASH_CLOSINGS: 'koji_cash_closings',
    DATA_VERSION: 'koji_version_key'
  };

  // ----------------------------------------
  // Helpers de localStorage
  // ----------------------------------------
  function getStored(key, fallback) {
    try {
      const val = localStorage.getItem(key);
      if (!val) return fallback;
      const parsed = JSON.parse(val);
      if (Array.isArray(fallback) && fallback.length > 0 && (!Array.isArray(parsed) || parsed.length === 0)) {
        return fallback;
      }
      return parsed !== undefined && parsed !== null ? parsed : fallback;
    } catch {
      return fallback;
    }
  }

  function setStored(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn(`Erro ao salvar no localStorage [${key}]:`, e);
    }
  }

  function generateId(prefix = '') {
    if (window.crypto && window.crypto.randomUUID) {
      try { return window.crypto.randomUUID(); } catch {}
    }
    return `${prefix ? prefix + '-' : ''}${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  // ----------------------------------------
  // Helper central de chamada segura à Netlify Function
  // ----------------------------------------
  async function api(action, options = {}) {
    const { method = 'GET', body } = options;
    const url = `/.netlify/functions/api?action=${encodeURIComponent(action)}`;
    const fetchOptions = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body) fetchOptions.body = JSON.stringify(body);

    try {
      const res = await fetch(url, fetchOptions);
      if (!res.ok) return null;
      const json = await res.json();
      if (json && json.configured === false) return null;
      return json.data !== undefined ? json.data : json;
    } catch (e) {
      // Fallback silencioso para o modo local
      return null;
    }
  }

  // ----------------------------------------
  // Inicialização com dados padrão
  // ----------------------------------------
  function initDefaults() {
    const currentVersion = localStorage.getItem(STORAGE_KEYS.DATA_VERSION);
    if (currentVersion !== 'koji_v2_0') {
      setStored(STORAGE_KEYS.SETTINGS, window.INITIAL_SETTINGS || {});
      setStored(STORAGE_KEYS.HOURS, window.INITIAL_OPERATING_HOURS || []);
      setStored(STORAGE_KEYS.CATEGORIES, window.INITIAL_CATEGORIES || []);
      setStored(STORAGE_KEYS.PRODUCTS, window.INITIAL_PRODUCTS || []);
      setStored(STORAGE_KEYS.OPTIONALS, window.INITIAL_OPTIONALS || []);
      setStored(STORAGE_KEYS.NEIGHBORHOODS, window.INITIAL_NEIGHBORHOODS || []);
      setStored(STORAGE_KEYS.COURIERS, window.INITIAL_COURIERS || []);
      localStorage.setItem(STORAGE_KEYS.DATA_VERSION, 'koji_v2_0');
    }

    const checkArrayOrFill = (key, initial) => {
      try {
        const val = localStorage.getItem(key);
        if (!val || val === '[]' || val === 'null') {
          setStored(key, initial || []);
        }
      } catch {
        setStored(key, initial || []);
      }
    };

    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      setStored(STORAGE_KEYS.SETTINGS, window.INITIAL_SETTINGS || {});
    }
    checkArrayOrFill(STORAGE_KEYS.HOURS, window.INITIAL_OPERATING_HOURS || []);
    checkArrayOrFill(STORAGE_KEYS.CATEGORIES, window.INITIAL_CATEGORIES || []);
    checkArrayOrFill(STORAGE_KEYS.PRODUCTS, window.INITIAL_PRODUCTS || []);
    checkArrayOrFill(STORAGE_KEYS.OPTIONALS, window.INITIAL_OPTIONALS || []);
    checkArrayOrFill(STORAGE_KEYS.NEIGHBORHOODS, window.INITIAL_NEIGHBORHOODS || []);
    checkArrayOrFill(STORAGE_KEYS.COURIERS, window.INITIAL_COURIERS || []);
    if (!localStorage.getItem(STORAGE_KEYS.PROMOTIONS))    setStored(STORAGE_KEYS.PROMOTIONS,    window.INITIAL_PROMOTIONS || []);
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS))        setStored(STORAGE_KEYS.ORDERS,        []);
    if (!localStorage.getItem(STORAGE_KEYS.USERS))         setStored(STORAGE_KEYS.USERS,         []);
    if (!localStorage.getItem(STORAGE_KEYS.ADDRESSES))     setStored(STORAGE_KEYS.ADDRESSES,     []);
    if (!localStorage.getItem(STORAGE_KEYS.CASH_CLOSINGS)) setStored(STORAGE_KEYS.CASH_CLOSINGS, []);
  }

  initDefaults();

  const db = {
    // ----------------------------------------
    // COMPRESSÃO E UPLOAD DE IMAGEM
    // ----------------------------------------
    async compressImageFile(file, maxWidth = 400, maxHeight = 400, quality = 0.75) {
      return new Promise((resolve) => {
        if (!file || !file.type || !file.type.startsWith('image/')) {
          return resolve(null);
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            let width = img.width;
            let height = img.height;

            if (width > maxWidth || height > maxHeight) {
              if (width > height) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
              } else {
                width = Math.round((width * maxHeight) / height);
                height = maxHeight;
              }
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            let dataUrl = canvas.toDataURL('image/webp', quality);
            if (!dataUrl.startsWith('data:image/webp')) {
              dataUrl = canvas.toDataURL('image/jpeg', quality);
            }
            resolve(dataUrl);
          };
          img.onerror = () => resolve(e.target.result || null);
          img.src = e.target.result;
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    },

    async uploadImage(file) {
      if (!file) return null;
      const compressed = await this.compressImageFile(file, 400, 400, 0.75);
      return compressed;
    },

    // ----------------------------------------
    // 0. BOOTSTRAP UNIFICADO
    // ----------------------------------------
    async getBootstrap() {
      const cloudData = await api('get-bootstrap');
      if (cloudData && cloudData.settings) {
        setStored(STORAGE_KEYS.SETTINGS, cloudData.settings);
        setStored(STORAGE_KEYS.HOURS, cloudData.hours);
        setStored(STORAGE_KEYS.CATEGORIES, cloudData.categories);
        setStored(STORAGE_KEYS.PRODUCTS, cloudData.products);
        setStored(STORAGE_KEYS.OPTIONALS, cloudData.optionals);
        setStored(STORAGE_KEYS.NEIGHBORHOODS, cloudData.neighborhoods);
        setStored(STORAGE_KEYS.COURIERS, cloudData.couriers);
        setStored(STORAGE_KEYS.PROMOTIONS, cloudData.promotions || []);
        return cloudData;
      }

      return {
        settings: getStored(STORAGE_KEYS.SETTINGS, window.INITIAL_SETTINGS || {}),
        hours: getStored(STORAGE_KEYS.HOURS, window.INITIAL_OPERATING_HOURS || []),
        categories: getStored(STORAGE_KEYS.CATEGORIES, window.INITIAL_CATEGORIES || []),
        products: getStored(STORAGE_KEYS.PRODUCTS, window.INITIAL_PRODUCTS || []),
        optionals: getStored(STORAGE_KEYS.OPTIONALS, window.INITIAL_OPTIONALS || []),
        neighborhoods: getStored(STORAGE_KEYS.NEIGHBORHOODS, window.INITIAL_NEIGHBORHOODS || []),
        couriers: getStored(STORAGE_KEYS.COURIERS, window.INITIAL_COURIERS || []),
        promotions: getStored(STORAGE_KEYS.PROMOTIONS, [])
      };
    },

    // ----------------------------------------
    // 1. CONFIGURAÇÕES
    // ----------------------------------------
    async getSettings() {
      const cloud = await api('get-settings');
      if (cloud) {
        setStored(STORAGE_KEYS.SETTINGS, cloud);
        return cloud;
      }
      return getStored(STORAGE_KEYS.SETTINGS, window.INITIAL_SETTINGS || {});
    },

    async updateSettings(newSettings) {
      const current = getStored(STORAGE_KEYS.SETTINGS, window.INITIAL_SETTINGS || {});
      const updated = { ...current, ...newSettings, id: 'store-settings', updated_at: new Date().toISOString() };
      setStored(STORAGE_KEYS.SETTINGS, updated);
      await api('update-settings', { method: 'POST', body: updated });
      return updated;
    },

    async verifyAdminPassword(password) {
      const cloudRes = await api('admin-login', { method: 'POST', body: { password } });
      if (cloudRes && cloudRes.success) return cloudRes;

      // Fallback local se a nuvem ainda não estiver configurada
      const settings = getStored(STORAGE_KEYS.SETTINGS, window.INITIAL_SETTINGS || {});
      const expected = String(settings.admin_password_hash || '').trim();
      const input = String(password || '').trim();

      if (expected && input === expected) {
        return { success: true, token: `local_admin_${Date.now()}` };
      }
      return { success: false, error: 'Senha administrativa incorreta.' };
    },

    // ----------------------------------------
    // 2. HORÁRIOS DE FUNCIONAMENTO
    // ----------------------------------------
    async getOperatingHours() {
      const cloud = await api('get-hours');
      if (cloud && cloud.length > 0) {
        setStored(STORAGE_KEYS.HOURS, cloud);
        return cloud;
      }
      return getStored(STORAGE_KEYS.HOURS, window.INITIAL_OPERATING_HOURS || []);
    },

    async updateOperatingHours(hours) {
      setStored(STORAGE_KEYS.HOURS, hours);
      await api('update-hours', { method: 'POST', body: { hours } });
      return hours;
    },

    // ----------------------------------------
    // 3. CATEGORIAS
    // ----------------------------------------
    async getCategories() {
      const cloud = await api('get-categories');
      if (cloud && cloud.length > 0) {
        setStored(STORAGE_KEYS.CATEGORIES, cloud);
        return cloud;
      }
      const list = getStored(STORAGE_KEYS.CATEGORIES, window.INITIAL_CATEGORIES || []);
      return (list && list.length > 0 ? list : (window.INITIAL_CATEGORIES || [])).slice().sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    },

    async saveCategory(cat) {
      const list = getStored(STORAGE_KEYS.CATEGORIES, window.INITIAL_CATEGORIES || []);
      const saved = { ...cat, id: cat.id || generateId('cat'), order_index: Number(cat.order_index) || 0 };
      const idx = list.findIndex(c => String(c.id) === String(saved.id));
      if (idx >= 0) list[idx] = saved; else list.push(saved);
      setStored(STORAGE_KEYS.CATEGORIES, list);
      await api('save-category', { method: 'POST', body: saved });
      return saved;
    },

    async deleteCategory(id) {
      const list = getStored(STORAGE_KEYS.CATEGORIES, window.INITIAL_CATEGORIES || []).filter(c => String(c.id) !== String(id));
      setStored(STORAGE_KEYS.CATEGORIES, list);
      await api('delete-category', { method: 'POST', body: { id } });
      return true;
    },

    // ----------------------------------------
    // 4. PRODUTOS
    // ----------------------------------------
    async getProducts() {
      const cloud = await api('get-products');
      if (cloud && cloud.length > 0) {
        setStored(STORAGE_KEYS.PRODUCTS, cloud);
        return cloud;
      }
      const list = getStored(STORAGE_KEYS.PRODUCTS, window.INITIAL_PRODUCTS || []);
      return (list && list.length > 0 ? list : (window.INITIAL_PRODUCTS || [])).slice().sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    },

    async saveProduct(prod) {
      const list = getStored(STORAGE_KEYS.PRODUCTS, window.INITIAL_PRODUCTS || []);
      const saved = {
        ...prod,
        id: prod.id || generateId('prod'),
        price: Number(prod.price) || 0,
        promo_price: prod.promo_price !== null && prod.promo_price !== undefined && prod.promo_price !== '' ? Number(prod.promo_price) : null,
        order_index: Number(prod.order_index) || 0,
        is_available: prod.is_available !== undefined ? Boolean(prod.is_available) : true
      };
      const idx = list.findIndex(p => String(p.id) === String(saved.id));
      if (idx >= 0) list[idx] = saved; else list.push(saved);
      setStored(STORAGE_KEYS.PRODUCTS, list);
      await api('save-product', { method: 'POST', body: saved });
      return saved;
    },

    async toggleProductAvailability(id, isAvailable) {
      const list = getStored(STORAGE_KEYS.PRODUCTS, window.INITIAL_PRODUCTS || []);
      const p = list.find(it => String(it.id) === String(id));
      if (p) {
        p.is_available = Boolean(isAvailable);
        setStored(STORAGE_KEYS.PRODUCTS, list);
      }
      await api('save-product', { method: 'POST', body: { id, is_available: Boolean(isAvailable) } });
      return p;
    },

    async deleteProduct(id) {
      const list = getStored(STORAGE_KEYS.PRODUCTS, window.INITIAL_PRODUCTS || []).filter(p => String(p.id) !== String(id));
      setStored(STORAGE_KEYS.PRODUCTS, list);
      await api('delete-product', { method: 'POST', body: { id } });
      return true;
    },

    // ----------------------------------------
    // 5. ADICIONAIS / OPCIONAIS
    // ----------------------------------------
    async getOptionals() {
      const cloud = await api('get-optionals');
      if (cloud && cloud.length > 0) {
        setStored(STORAGE_KEYS.OPTIONALS, cloud);
        return cloud;
      }
      const list = getStored(STORAGE_KEYS.OPTIONALS, window.INITIAL_OPTIONALS || []);
      return list && list.length > 0 ? list : (window.INITIAL_OPTIONALS || []);
    },

    async saveOptional(opt) {
      const list = getStored(STORAGE_KEYS.OPTIONALS, window.INITIAL_OPTIONALS || []);
      const saved = { ...opt, id: opt.id || generateId('opt'), price: Number(opt.price) || 0 };
      const idx = list.findIndex(o => String(o.id) === String(saved.id));
      if (idx >= 0) list[idx] = saved; else list.push(saved);
      setStored(STORAGE_KEYS.OPTIONALS, list);
      await api('save-optional', { method: 'POST', body: saved });
      return saved;
    },

    async deleteOptional(id) {
      const list = getStored(STORAGE_KEYS.OPTIONALS, window.INITIAL_OPTIONALS || []).filter(o => String(o.id) !== String(id));
      setStored(STORAGE_KEYS.OPTIONALS, list);
      await api('delete-optional', { method: 'POST', body: { id } });
      return true;
    },

    // ----------------------------------------
    // 6. PROMOÇÕES
    // ----------------------------------------
    async getPromotions() {
      return getStored(STORAGE_KEYS.PROMOTIONS, []);
    },

    // ----------------------------------------
    // 7. BAIRROS E TAXAS DE ENTREGA
    // ----------------------------------------
    async getNeighborhoods() {
      const cloud = await api('get-neighborhoods');
      if (cloud && cloud.length > 0) {
        setStored(STORAGE_KEYS.NEIGHBORHOODS, cloud);
        return cloud;
      }
      const list = getStored(STORAGE_KEYS.NEIGHBORHOODS, window.INITIAL_NEIGHBORHOODS || []);
      return list && list.length > 0 ? list : (window.INITIAL_NEIGHBORHOODS || []);
    },

    async saveNeighborhood(n) {
      const list = getStored(STORAGE_KEYS.NEIGHBORHOODS, window.INITIAL_NEIGHBORHOODS || []);
      const saved = { ...n, id: n.id || generateId('neigh'), delivery_fee: Number(n.delivery_fee) || 0 };
      const idx = list.findIndex(b => String(b.id) === String(saved.id));
      if (idx >= 0) list[idx] = saved; else list.push(saved);
      setStored(STORAGE_KEYS.NEIGHBORHOODS, list);
      await api('save-neighborhood', { method: 'POST', body: saved });
      return saved;
    },

    async deleteNeighborhood(id) {
      const list = getStored(STORAGE_KEYS.NEIGHBORHOODS, window.INITIAL_NEIGHBORHOODS || []).filter(b => String(b.id) !== String(id));
      setStored(STORAGE_KEYS.NEIGHBORHOODS, list);
      await api('delete-neighborhood', { method: 'POST', body: { id } });
      return true;
    },

    // ----------------------------------------
    // 8. ENTREGADORES
    // ----------------------------------------
    async getCouriers() {
      const cloud = await api('get-couriers');
      if (cloud && cloud.length > 0) {
        setStored(STORAGE_KEYS.COURIERS, cloud);
        return cloud;
      }
      const list = getStored(STORAGE_KEYS.COURIERS, window.INITIAL_COURIERS || []);
      return list && list.length > 0 ? list : (window.INITIAL_COURIERS || []);
    },

    async saveCourier(c) {
      const list = getStored(STORAGE_KEYS.COURIERS, window.INITIAL_COURIERS || []);
      const saved = { ...c, id: c.id || generateId('cour') };
      const idx = list.findIndex(cour => String(cour.id) === String(saved.id));
      if (idx >= 0) list[idx] = saved; else list.push(saved);
      setStored(STORAGE_KEYS.COURIERS, list);
      await api('save-courier', { method: 'POST', body: saved });
      return saved;
    },

    async deleteCourier(id) {
      const list = getStored(STORAGE_KEYS.COURIERS, window.INITIAL_COURIERS || []).filter(c => String(c.id) !== String(id));
      setStored(STORAGE_KEYS.COURIERS, list);
      await api('delete-courier', { method: 'POST', body: { id } });
      return true;
    },

    // ----------------------------------------
    // 9. PEDIDOS
    // ----------------------------------------
    async getOrders() {
      const cloud = await api('get-orders');
      if (cloud && Array.isArray(cloud)) {
        setStored(STORAGE_KEYS.ORDERS, cloud);
        return cloud;
      }
      const list = getStored(STORAGE_KEYS.ORDERS, []);
      return list.slice().sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    },

    async createOrder(orderPayload) {
      const list = getStored(STORAGE_KEYS.ORDERS, []);
      const nextNum = list.length > 0 ? (Math.max(...list.map(o => Number(o.order_number) || 0)) + 1) : 1001;

      const addr = orderPayload.delivery_address || {};
      const street = addr.street || orderPayload.address_street || '';
      const number = addr.number || orderPayload.address_number || '';
      const neighborhood = addr.neighborhood || orderPayload.address_neighborhood || '';
      const complement = addr.complement || orderPayload.address_complement || '';
      const reference = addr.reference || orderPayload.address_reference || '';

      const generatedId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : ('ord_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9));

      const newOrder = {
        ...orderPayload,
        id: orderPayload.id || generatedId,
        order_number: Number(orderPayload.order_number) || nextNum,
        address_street: street,
        address_number: number,
        address_neighborhood: neighborhood,
        address_complement: complement,
        address_reference: reference,
        delivery_address: orderPayload.delivery_address || (street ? { street, number, neighborhood, complement, reference } : null),
        items: Array.isArray(orderPayload.items) ? orderPayload.items : [],
        created_at: orderPayload.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: orderPayload.status || 'novo'
      };

      list.unshift(newOrder);
      setStored(STORAGE_KEYS.ORDERS, list);

      try {
        localStorage.setItem('koji_orders_ping', Date.now().toString());
        window.dispatchEvent(new CustomEvent('koji_order_change', { detail: newOrder }));
      } catch {}

      // Tenta salvar na nuvem em background
      api('create-order', { method: 'POST', body: newOrder }).catch(() => null);

      return newOrder;
    },

    async updateOrderStatus(orderId, status, notes = null, courierName = null) {
      const list = getStored(STORAGE_KEYS.ORDERS, []);
      const order = list.find(o => String(o.id) === String(orderId));
      if (order) {
        order.status = status;
        order.updated_at = new Date().toISOString();
        if (notes !== null) order.notes = notes;
        if (courierName !== null) order.courier_name = courierName;
        setStored(STORAGE_KEYS.ORDERS, list);
      }

      try {
        localStorage.setItem('koji_orders_ping', Date.now().toString());
        window.dispatchEvent(new CustomEvent('koji_order_change', { detail: { id: orderId, status } }));
      } catch {}

      const updates = { id: orderId, status, updated_at: new Date().toISOString() };
      if (notes !== null) updates.notes = notes;
      if (courierName !== null) updates.courier_name = courierName;
      api('update-order', { method: 'POST', body: updates }).catch(() => null);

      return order;
    },

    async deleteOrder(orderId) {
      let list = getStored(STORAGE_KEYS.ORDERS, []);
      list = list.filter(o => String(o.id) !== String(orderId));
      setStored(STORAGE_KEYS.ORDERS, list);

      try {
        localStorage.setItem('koji_orders_ping', Date.now().toString());
        window.dispatchEvent(new CustomEvent('koji_order_change', { detail: { id: orderId, deleted: true } }));
      } catch {}

      api('delete-orders', { method: 'POST', body: { ids: [orderId] } }).catch(() => null);
      return true;
    },

    async clearAllOrders() {
      setStored(STORAGE_KEYS.ORDERS, []);

      try {
        localStorage.setItem('koji_orders_ping', Date.now().toString());
        window.dispatchEvent(new CustomEvent('koji_order_change', { detail: { cleared: true } }));
      } catch {}

      api('delete-orders', { method: 'POST', body: {} }).catch(() => null);
      return true;
    },

    // ----------------------------------------
    // 10. CLIENTES
    // ----------------------------------------
    async getUserByPhone(phone) {
      const clean = String(phone).replace(/\D/g, '');
      const cloud = await api('get-user-by-phone', { query: `phone=${clean}` });
      if (cloud) return cloud;

      const users = getStored(STORAGE_KEYS.USERS, []);
      return users.find(u => String(u.phone).replace(/\D/g, '') === clean) || null;
    },

    async saveUser(userData) {
      const users = getStored(STORAGE_KEYS.USERS, []);
      const saved = {
        ...userData,
        id: userData.id || generateId('user'),
        phone: String(userData.phone).replace(/\D/g, ''),
        created_at: userData.created_at || new Date().toISOString()
      };

      const idx = users.findIndex(u => u.phone === saved.phone || String(u.id) === String(saved.id));
      if (idx >= 0) users[idx] = saved; else users.push(saved);
      setStored(STORAGE_KEYS.USERS, users);

      api('save-user', { method: 'POST', body: saved }).catch(() => null);
      return saved;
    },

    // ----------------------------------------
    // 11. ENDEREÇOS
    // ----------------------------------------
    async getUserAddresses(userId) {
      const cloud = await api('get-user-addresses', { query: `user_id=${userId}` });
      if (cloud && Array.isArray(cloud) && cloud.length > 0) return cloud;

      const addresses = getStored(STORAGE_KEYS.ADDRESSES, []);
      return addresses.filter(a => String(a.user_id) === String(userId));
    },

    async saveAddress(addrData) {
      const list = getStored(STORAGE_KEYS.ADDRESSES, []);
      const saved = { ...addrData, id: addrData.id || generateId('addr'), created_at: new Date().toISOString() };
      const idx = list.findIndex(a => String(a.id) === String(saved.id));
      if (idx >= 0) list[idx] = saved; else list.push(saved);
      setStored(STORAGE_KEYS.ADDRESSES, list);
      return saved;
    },

    async deleteAddress(id) {
      const list = getStored(STORAGE_KEYS.ADDRESSES, []).filter(a => String(a.id) !== String(id));
      setStored(STORAGE_KEYS.ADDRESSES, list);
      return true;
    },

    // ----------------------------------------
    // 12. FECHAMENTO DE CAIXA
    // ----------------------------------------
    async getCashClosings() {
      const cloud = await api('get-cash-closings');
      if (cloud && Array.isArray(cloud)) {
        setStored(STORAGE_KEYS.CASH_CLOSINGS, cloud);
        return cloud;
      }
      return getStored(STORAGE_KEYS.CASH_CLOSINGS, []);
    },

    async saveCashClosing(cashData) {
      const list = getStored(STORAGE_KEYS.CASH_CLOSINGS, []);
      const saved = { ...cashData, id: cashData.id || generateId('cash'), created_at: new Date().toISOString() };
      const idx = list.findIndex(c => c.date_ref === saved.date_ref || String(c.id) === String(saved.id));
      if (idx >= 0) list[idx] = saved; else list.push(saved);
      setStored(STORAGE_KEYS.CASH_CLOSINGS, list);

      api('save-cash-closing', { method: 'POST', body: saved }).catch(() => null);
      return saved;
    }
  };

  window.db = db;
})();
