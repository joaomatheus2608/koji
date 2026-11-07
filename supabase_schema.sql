-- ========================================================
-- KOJI SUSHI - SCHEMA E DADOS INICIAIS DO SUPABASE
-- Execute este script completo no SQL Editor do seu Supabase Dashboard:
-- https://supabase.com/dashboard/project/_/sql
-- ========================================================

-- 1. HABILITAR EXTENSOES NECESSARIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CRIACAO DAS TABELAS
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'store-settings',
    name TEXT NOT NULL DEFAULT 'Koji Sushi',
    slogan TEXT DEFAULT 'O melhor sushi delivery de Jaboatão!',
    address TEXT DEFAULT 'Rua Argentina, 150 - Santo Aleixo, Jaboatão dos Guararapes - PE',
    whatsapp TEXT DEFAULT '5581986460274',
    instagram TEXT DEFAULT '@kojisushidelivery',
    delivery_fee NUMERIC(10,2) DEFAULT 7.00,
    min_order_value NUMERIC(10,2) DEFAULT 0.00,
    store_status_mode TEXT DEFAULT 'auto',
    closed_message TEXT DEFAULT 'Estamos fechados no momento. Horário: Terça a Quinta das 18:00 às 22:30 | Sexta a Domingo das 18:00 às 23:00 (Segunda-feira fechado).',
    admin_password_hash TEXT DEFAULT 'admin',
    pix_key TEXT DEFAULT '5581986460274',
    pix_type TEXT DEFAULT 'Telefone',
    pix_beneficiary TEXT DEFAULT 'Koji Sushi',
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.operating_hours (
    id SERIAL PRIMARY KEY,
    day_of_week INTEGER NOT NULL UNIQUE CHECK (day_of_week BETWEEN 0 AND 6),
    day_name TEXT NOT NULL,
    open_time TEXT NOT NULL DEFAULT '18:00',
    close_time TEXT NOT NULL DEFAULT '22:30',
    open_time2 TEXT DEFAULT NULL,
    close_time2 TEXT DEFAULT NULL,
    is_open BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    price NUMERIC(10,2) DEFAULT 0.00,
    price_p NUMERIC(10,2) DEFAULT 0.00,
    price_m NUMERIC(10,2) DEFAULT 0.00,
    price_g NUMERIC(10,2) DEFAULT 0.00,
    has_sizes BOOLEAN DEFAULT false,
    sizes JSONB DEFAULT '[]'::jsonb,
    image_url TEXT,
    is_promo BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    is_available BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    sales_channel TEXT DEFAULT 'todos',
    promo_price NUMERIC(10,2) DEFAULT 0.00,
    promo_days JSONB DEFAULT '[]'::jsonb,
    monday_price NUMERIC(10,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.optionals (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC(10,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    target TEXT DEFAULT 'all',
    applicable_category_ids JSONB DEFAULT '[]'::jsonb,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.neighborhoods (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 7.00,
    delivery_time_min INTEGER DEFAULT 60,
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.couriers (
    id TEXT PRIMARY KEY DEFAULT ('cour-' || substr(md5(random()::text), 1, 8)),
    name TEXT NOT NULL,
    phone TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    role TEXT DEFAULT 'client',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.user_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    street TEXT NOT NULL,
    number TEXT NOT NULL,
    neighborhood TEXT NOT NULL,
    complement TEXT,
    reference TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number BIGSERIAL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    order_type TEXT DEFAULT 'delivery',
    address_street TEXT,
    address_number TEXT,
    address_neighborhood TEXT,
    address_complement TEXT,
    address_reference TEXT,
    delivery_address JSONB,
    payment_method TEXT NOT NULL,
    change_for NUMERIC(10,2),
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(10,2) NOT NULL,
    delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total NUMERIC(10,2) NOT NULL,
    status TEXT DEFAULT 'novo',
    notes TEXT,
    courier_id TEXT REFERENCES public.couriers(id) ON DELETE SET NULL,
    courier_name TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.cash_closings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date_ref DATE NOT NULL UNIQUE,
    total_revenue NUMERIC(10,2) DEFAULT 0.00,
    orders_count INTEGER DEFAULT 0,
    delivery_fees_total NUMERIC(10,2) DEFAULT 0.00,
    dinheiro_total NUMERIC(10,2) DEFAULT 0.00,
    pix_total NUMERIC(10,2) DEFAULT 0.00,
    cartao_total NUMERIC(10,2) DEFAULT 0.00,
    breakdown JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 3. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operating_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.optionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neighborhoods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_closings ENABLE ROW LEVEL SECURITY;

-- Politicas Publicas de Leitura
CREATE POLICY "Public read settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Public read hours" ON public.operating_hours FOR SELECT USING (true);
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public read optionals" ON public.optionals FOR SELECT USING (true);
CREATE POLICY "Public read neighborhoods" ON public.neighborhoods FOR SELECT USING (true);
CREATE POLICY "Public read couriers" ON public.couriers FOR SELECT USING (true);
CREATE POLICY "Public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Public update orders" ON public.orders FOR UPDATE USING (true);

-- Permissoes Totais para Service Role
CREATE POLICY "Service role full access settings" ON public.settings FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access hours" ON public.operating_hours FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access categories" ON public.categories FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access products" ON public.products FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access optionals" ON public.optionals FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access neighborhoods" ON public.neighborhoods FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access couriers" ON public.couriers FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access users" ON public.users FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access addresses" ON public.user_addresses FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access orders" ON public.orders FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access cash" ON public.cash_closings FOR ALL USING (auth.role() = 'service_role');

-- 4. REALTIME
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.orders; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.settings; EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.products; EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- 5. DADOS INICIAIS (SEED DATA - KOJI SUSHI)
INSERT INTO public.settings (id, name, slogan, address, whatsapp, instagram, delivery_fee, min_order_value, store_status_mode, closed_message, admin_password_hash, pix_key, pix_type, pix_beneficiary)
VALUES ('store-settings', 'Koji Sushi', 'O melhor sushi delivery de Jaboatão!', 'Rua Argentina, 150 - Santo Aleixo, Jaboatão dos Guararapes - PE', '5581986460274', '@kojisushidelivery', 7.00, 0.00, 'auto', 'Estamos fechados no momento. Horário: Terça a Quinta das 18:00 às 22:30 | Sexta a Domingo das 18:00 às 23:00 (Segunda-feira fechado).', 'admin', '5581986460274', 'Telefone', 'Koji Sushi')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address, whatsapp = EXCLUDED.whatsapp, pix_key = EXCLUDED.pix_key;

INSERT INTO public.operating_hours (day_of_week, day_name, open_time, close_time, open_time2, close_time2, is_open) VALUES
    (0, 'Domingo', '18:00', '23:00', NULL, NULL, true),
    (1, 'Segunda-feira', '18:00', '22:30', NULL, NULL, false),
    (2, 'Terça-feira', '18:00', '22:30', NULL, NULL, true),
    (3, 'Quarta-feira', '18:00', '22:30', NULL, NULL, true),
    (4, 'Quinta-feira', '18:00', '22:30', NULL, NULL, true),
    (5, 'Sexta-feira', '18:00', '23:00', NULL, NULL, true),
    (6, 'Sábado', '18:00', '23:00', NULL, NULL, true)
ON CONFLICT (day_of_week) DO UPDATE SET open_time = EXCLUDED.open_time, close_time = EXCLUDED.close_time, is_open = EXCLUDED.is_open;

INSERT INTO public.categories (id, name, slug, order_index, is_active) VALUES
    ('cat-combos', 'Combos & Barcas', 'combos-barcas', 1, true),
    ('cat-temakis', 'Temakis', 'temakis', 2, true),
    ('cat-cariocas', 'Cariocas & Cariocões', 'cariocas-cariocoes', 3, true),
    ('cat-especiais', 'Especiais, Joys & Supremos', 'especiais-joys', 4, true),
    ('cat-uramakis', 'Uramakis & Hossomakis', 'uramakis-hossomakis', 5, true),
    ('cat-bebidas', 'Bebidas', 'bebidas', 6, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug, order_index = EXCLUDED.order_index;

INSERT INTO public.optionals (id, name, price, is_active, order_index) VALUES
    ('opt-shoyu', 'Shoyu Extra', 2.00, true, 1),
    ('opt-teriaki', 'Teriaki Extra', 2.50, true, 2),
    ('opt-wasabi', 'Wasabi', 2.00, true, 3),
    ('opt-gengibre', 'Gengibre', 2.00, true, 4),
    ('opt-cream-cheese', 'Cream Cheese Extra', 3.50, true, 5),
    ('opt-hashi', 'Par de Hashi Extra', 1.00, true, 6)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price;

INSERT INTO public.neighborhoods (id, name, delivery_fee, is_active, order_index) VALUES
    ('bairro-34', 'Santo Aleixo (Centro)', 7.00, true, 1),
    ('bairro-35', 'Santo Aleixo (Após Nazareno)', 9.00, true, 2),
    ('bairro-14', 'Lote 56 (Terminal)', 7.00, true, 3),
    ('bairro-15', 'Lote 56 (Casinhas)', 10.00, true, 4),
    ('bairro-16', 'Lote 92', 7.00, true, 5),
    ('bairro-17', 'Lote 92 (Colônia dos Padres)', 8.00, true, 6),
    ('bairro-12', 'Engenho Velho', 7.00, true, 7),
    ('bairro-4', 'Bulhões', 6.00, true, 8),
    ('bairro-5', 'Cascata', 7.00, true, 9),
    ('bairro-18', 'Tenda', 6.00, true, 10),
    ('bairro-19', 'Malvinas', 7.00, true, 11),
    ('bairro-22', 'Moenda', 6.00, true, 12),
    ('bairro-27', 'Padre Roma', 7.00, true, 13),
    ('bairro-28', 'Quadro', 7.00, true, 14),
    ('bairro-2', 'Alto da Fábrica', 6.00, true, 15),
    ('bairro-13', 'Floriano', 10.00, true, 16),
    ('bairro-21', 'Manassu', 10.00, true, 17),
    ('bairro-32', 'Retiro', 12.00, true, 18),
    ('bairro-36', 'Socorro (Antes da Granja)', 8.00, true, 19),
    ('bairro-37', 'Socorro (Entrada da Granja)', 10.00, true, 20),
    ('bairro-38', 'Suassuna (Portaria)', 10.00, true, 21),
    ('bairro-39', 'Suassuna (Porta do Apartamento)', 12.00, true, 22),
    ('bairro-29', 'Vila Natal (Na Portaria)', 7.00, true, 23),
    ('bairro-30', 'Vila Natal (No Apartamento)', 10.00, true, 24),
    ('bairro-1', 'Alphaville', 15.00, true, 25),
    ('bairro-3', 'Alto do Vento', 15.00, true, 26),
    ('bairro-7', 'Cavaleiro (Antes da Estação)', 15.00, true, 27),
    ('bairro-8', 'Cavaleiro (Bairros)', 20.00, true, 28),
    ('bairro-6', 'Coqueiral', 20.00, true, 29),
    ('bairro-9', 'Curado 1 / 2 / 3 / 4', 20.00, true, 30),
    ('bairro-10', 'Dois Carneiros (Até Fund. Bradesco / Yapoatam)', 15.00, true, 31),
    ('bairro-11', 'Dois Carneiros (Após Fund. Bradesco)', 20.00, true, 32),
    ('bairro-20', 'Marcos Freire', 20.00, true, 33),
    ('bairro-23', 'Muribeca', 20.00, true, 34),
    ('bairro-26', 'Pacheco', 20.00, true, 35),
    ('bairro-24', 'Zumbi do Pacheco', 20.00, true, 36),
    ('bairro-25', 'URs / Ibura', 20.00, true, 37),
    ('bairro-33', 'Sancho', 20.00, true, 38)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, delivery_fee = EXCLUDED.delivery_fee;

INSERT INTO public.couriers (id, name, phone, is_active) VALUES ('cour-1', 'Entregador 01', '5581986460274', true) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.products (id, category_id, name, description, price, image_url, is_promo, is_active, is_available, order_index) VALUES
    ('prod-combo-25', 'cat-combos', 'Combo 25 Peças', 'Variedade selecionada com 25 peças fresquinhas e crocantes do Koji Sushi.', 37.90, 'logo.jpg', false, true, true, 1),
    ('prod-combo-30', 'cat-combos', 'Combo 30 Peças', 'Combinação equilibrada com 30 peças preparadas na hora com o melhor sabor oriental.', 37.90, 'logo.jpg', false, true, true, 2),
    ('prod-combo-hot', 'cat-combos', 'Combo Hot', 'Para os amantes de sushis quentinhos e empanados crocantes.', 37.90, 'logo.jpg', false, true, true, 3),
    ('prod-combo-promocional', 'cat-combos', 'Combo Promocional', 'Combo especial com excelente custo-benefício e sabor inconfundível.', 38.90, 'logo.jpg', false, true, true, 4),
    ('prod-combo-misto', 'cat-combos', 'Combo Misto', 'Mix perfeito entre peças naturais e empanadas.', 37.90, 'logo.jpg', false, true, true, 5),
    ('prod-combo-skin', 'cat-combos', 'Combo Skin', 'Seleção especial com o toque crocante do salmão skin e cream cheese.', 38.90, 'logo.jpg', false, true, true, 6),
    ('prod-combo-natural', 'cat-combos', 'Combo Natural', 'Peças naturais e frescas, valorizando o sabor autêntico dos peixes.', 37.90, 'logo.jpg', false, true, true, 7),
    ('prod-combo-saki', 'cat-combos', 'Combo Saki', 'Combo saboroso com peças selecionadas no capricho.', 39.90, 'logo.jpg', false, true, true, 8),
    ('prod-combo-kani', 'cat-combos', 'Combo Kani', 'Combinação especial destacando o kani kama em deliciosas preparações.', 41.90, 'logo.jpg', false, true, true, 9),
    ('prod-combo-cheasse', 'cat-combos', 'Combo Cheasse', 'Feito para quem adora a cremosidade do cream cheese em cada peça.', 44.90, 'logo.jpg', false, true, true, 10),
    ('prod-combo-tem', 'cat-combos', 'Combo Tem', 'Combinação prática e saborosa do cardápio Koji Sushi.', 44.90, 'logo.jpg', false, true, true, 11),
    ('prod-combo-40', 'cat-combos', 'Combo 40 Peças', 'Fartura de sabor com 40 peças: camarão, kani, salmão e crocância.', 44.90, 'logo.jpg', false, true, true, 12),
    ('prod-combo-40-especial', 'cat-combos', 'Combo 40 Peças Especial', '40 peças selecionadas especiais com camarão, salmão e kani.', 49.90, 'logo.jpg', false, true, true, 13),
    ('prod-combo-salmao', 'cat-combos', 'Combo Salmão', 'Dedicado aos apaixonados por salmão fresco e de alta qualidade.', 51.90, 'logo.jpg', false, true, true, 14),
    ('prod-combo-mix', 'cat-combos', 'Combo Mix', 'Variedade completa com o melhor do cardápio Koji.', 53.90, 'logo.jpg', false, true, true, 15),
    ('prod-combo-especial', 'cat-combos', 'Combo Especial', 'Peças especiais com salmão filadélfia, kani, camarão e temaki (escolha entre hot ou natural).', 54.90, 'logo.jpg', false, true, true, 16),
    ('prod-combo-koji', 'cat-combos', 'Combo Koji', 'O combo assinatura da casa: salmão, kani, camarão e muito capricho.', 58.90, 'logo.jpg', false, true, true, 17),
    ('prod-combo-50', 'cat-combos', 'Combo 50 Peças', 'Mega combo com 50 peças fartas e deliciosas para compartilhar.', 58.90, 'logo.jpg', false, true, true, 18),
    ('prod-casadinha-salmao', 'cat-combos', 'Casadinha de Salmão', 'Dupla harmonia de salmão com toque especial da casa.', 29.90, 'logo.jpg', false, true, true, 19),
    ('prod-barca-super-koji', 'cat-combos', 'Barca Super Koji', 'Apresentação em barca caprichada, farta e completa do Koji Sushi.', 65.00, 'logo.jpg', false, true, true, 20),
    ('prod-temaki-skin', 'cat-temakis', 'Temaki de Skin', 'Cone crocante de alga nori, arroz temperado, salmão skin frito e cream cheese.', 18.90, 'logo.jpg', false, true, true, 21),
    ('prod-temaki-kani', 'cat-temakis', 'Temaki de Kani', 'Cone de alga recheado de arroz, kani kama desfiado e cream cheese.', 20.90, 'logo.jpg', false, true, true, 22),
    ('prod-temaki-hot-crock-camarao', 'cat-temakis', 'Temaki Hot Crock de Camarão', 'Temaki frito ultracrocante recheado com camarão e cream cheese.', 21.90, 'logo.jpg', false, true, true, 23),
    ('prod-temaki-hot-crock-salmao', 'cat-temakis', 'Temaki Hot Crock de Salmão', 'Temaki empanado crocante recheado com salmão suculento e cream cheese.', 22.90, 'logo.jpg', false, true, true, 24),
    ('prod-temaki-salmao-filadelfia', 'cat-temakis', 'Temaki Salmão Filadélfia', 'O clássico favorito: cubos de salmão fresco, cebolinha e cream cheese.', 23.90, 'logo.jpg', false, true, true, 25),
    ('prod-combo-3-temakis', 'cat-temakis', 'Combo 3 Temakis', 'Trio de temakis com recheios tradicionais deliciosos.', 44.90, 'logo.jpg', false, true, true, 26),
    ('prod-combo-3-temakis-especial', 'cat-temakis', 'Combo 3 Temakis Especial', 'Trio especial com recheios nobres e generosos.', 54.90, 'logo.jpg', false, true, true, 27),
    ('prod-carioca', 'cat-cariocas', 'Carioca (10 unidades)', 'Enrolado frito e crocante com recheio tradicional e toque especial.', 18.90, 'logo.jpg', false, true, true, 28),
    ('prod-hot-crock', 'cat-cariocas', 'Hot Crock', 'Sushi empanado com casquinha crocante irresistível.', 17.90, 'logo.jpg', false, true, true, 29),
    ('prod-hot-holl', 'cat-cariocas', 'Hot Roll (10 unidades)', 'O clássico hot roll quentinho e crocante com molho especial.', 21.90, 'logo.jpg', false, true, true, 30),
    ('prod-cariocao-skin', 'cat-cariocas', 'Cariocão de Skin', 'Mega cariocão de arroz recheado de skin crocante e cream cheese.', 20.90, 'logo.jpg', false, true, true, 31),
    ('prod-cariocao-kani', 'cat-cariocas', 'Cariocão de Kani', 'Cariocão generoso de arroz recheado de kani e cream cheese.', 21.90, 'logo.jpg', false, true, true, 32),
    ('prod-cariocao-camarao', 'cat-cariocas', 'Cariocão de Camarão', 'Cariocão especial com recheio farto de camarão e cream cheese.', 23.90, 'logo.jpg', false, true, true, 33),
    ('prod-cariocao-camarao-empanado', 'cat-cariocas', 'Cariocão de Camarão Empanado', 'Cariocão crocante coberto com camarões empanados crocantes e molho especial.', 24.90, 'logo.jpg', false, true, true, 34),
    ('prod-cariocao-misto', 'cat-cariocas', 'Cariocão Misto', 'Cariocão gigante com mix completo de recheios.', 29.90, 'logo.jpg', false, true, true, 35),
    ('prod-kani-cheasse', 'cat-especiais', 'Kani Cheasse', 'Lâminas de kani recheadas com cream cheese e toque especial.', 11.90, 'logo.jpg', false, true, true, 36),
    ('prod-koji-boll', 'cat-especiais', 'Koji Boll', 'Bolinhas crocantes de arroz com recheio especial da casa Koji.', 19.90, 'logo.jpg', false, true, true, 37),
    ('prod-koji-boll-ebi', 'cat-especiais', 'Koji Boll Ebi', 'Bolinhas de arroz nobres finalizadas com camarões e molho especial.', 24.90, 'logo.jpg', false, true, true, 38),
    ('prod-joy', 'cat-especiais', 'Joy de Salmão', 'Lâmina de salmão envolvendo arroz, coberta com salmão batidinho e cream cheese.', 23.90, 'logo.jpg', false, true, true, 39),
    ('prod-eby-joy', 'cat-especiais', 'Eby Joy', 'Joy especial finalizado com camarão e cream cheese maçaricado.', 23.90, 'logo.jpg', false, true, true, 40),
    ('prod-sushi-trufado', 'cat-especiais', 'Sushi Trufado (5 unidades)', 'Sushis maçaricados delicadamente finalizados com azeite trufado e flor de sal.', 23.90, 'logo.jpg', false, true, true, 41),
    ('prod-sunomono-trad', 'cat-especiais', 'Sunomono Tradicional', 'Salada refrescante de pepino agridoce com kani, salmão e gergelim.', 31.90, 'logo.jpg', false, true, true, 42),
    ('prod-sunomono-esp', 'cat-especiais', 'Sunomono Especial', 'Sunomono especial caprichado na taça com salmão fresco, camarão, kani e gergelim.', 34.90, 'logo.jpg', false, true, true, 43),
    ('prod-supremo-camarao', 'cat-especiais', 'Supremo de Camarão', 'Prato especial premium com fartura de camarão maçaricado e molhos nobres.', 53.90, 'logo.jpg', false, true, true, 44),
    ('prod-supremo-salmao', 'cat-especiais', 'Supremo de Salmão', 'Prato especial premium com fatias nobres de salmão maçaricado e cream cheese.', 56.90, 'logo.jpg', false, true, true, 45),
    ('prod-uramaki-koji', 'cat-uramakis', 'Uramaki Koji (10 unidades)', 'Uramaki exclusivo da casa finalizado com crocante cebola empanada.', 17.90, 'logo.jpg', false, true, true, 46),
    ('prod-hossomaki', 'cat-uramakis', 'Hossomaki (10 unidades)', 'Enrolado tradicional fino com alga por fora e salmão fresco.', 18.90, 'logo.jpg', false, true, true, 47),
    ('prod-niguiri', 'cat-uramakis', 'Niguiri de Salmão (unidades)', 'Arroz moldado à mão coberto com lâmina de salmão fresco.', 19.90, 'logo.jpg', false, true, true, 48),
    ('prod-uramaki-massaricado', 'cat-uramakis', 'Uramaki Maçaricado (10 unidades)', 'Uramaki coberto com lâmina de salmão maçaricado, cebolinha e molho especial.', 23.90, 'logo.jpg', false, true, true, 49),
    ('prod-coca-lata', 'cat-bebidas', 'Coca-Cola Lata 350ml', 'Gelada.', 6.00, 'logo.jpg', false, true, true, 50),
    ('prod-coca-zero-lata', 'cat-bebidas', 'Coca-Cola Zero Lata 350ml', 'Gelada.', 6.00, 'logo.jpg', false, true, true, 51),
    ('prod-guarana-lata', 'cat-bebidas', 'Guaraná Antarctica Lata 350ml', 'Gelada.', 6.00, 'logo.jpg', false, true, true, 52),
    ('prod-agua-sem-gas', 'cat-bebidas', 'Água Mineral 500ml', 'Sem gás.', 4.00, 'logo.jpg', false, true, true, 53)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price, image_url = EXCLUDED.image_url, category_id = EXCLUDED.category_id;