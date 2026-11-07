// ========================================================
// KOJI SUSHI - DADOS OFICIAIS DO CARDÁPIO & SISTEMA
// Endereço: Rua Argentina, 150 — Santo Aleixo, Jaboatão dos Guararapes - PE
// Horário: Terça a Quinta 18h às 22:30 • Sexta a Domingo 18h às 23h (Segunda fechado)
// ========================================================

const INITIAL_SETTINGS = {
  id: "store-settings",
  name: "Koji Sushi",
  slogan: "O melhor sushi delivery de Jaboatão!",
  address: "Rua Argentina, 150 — Santo Aleixo, Jaboatão dos Guararapes - PE",
  whatsapp: "5581986460274",
  instagram: "@kojisushidelivery",
  delivery_fee: 7.00,
  min_order_value: 0.00,
  store_status_mode: "auto",
  closed_message: "Estamos fechados no momento. Horário: Terça a Quinta das 18:00 às 22:30 • Sexta a Domingo das 18:00 às 23:00 (Segunda-feira fechado).",
  admin_password_hash: "kojiomelhor",
  pix_key: "5581986460274",
  pix_type: "Telefone",
  pix_beneficiary: "Koji Sushi"
};

const INITIAL_OPERATING_HOURS = [
  { day_of_week: 0, day_name: "Domingo", open_time: "18:00", close_time: "23:00", open_time2: null, close_time2: null, is_open: true },
  { day_of_week: 1, day_name: "Segunda-feira", open_time: "18:00", close_time: "22:30", open_time2: null, close_time2: null, is_open: false },
  { day_of_week: 2, day_name: "Terça-feira", open_time: "18:00", close_time: "22:30", open_time2: null, close_time2: null, is_open: true },
  { day_of_week: 3, day_name: "Quarta-feira", open_time: "18:00", close_time: "22:30", open_time2: null, close_time2: null, is_open: true },
  { day_of_week: 4, day_name: "Quinta-feira", open_time: "18:00", close_time: "22:30", open_time2: null, close_time2: null, is_open: true },
  { day_of_week: 5, day_name: "Sexta-feira", open_time: "18:00", close_time: "23:00", open_time2: null, close_time2: null, is_open: true },
  { day_of_week: 6, day_name: "Sábado", open_time: "18:00", close_time: "23:00", open_time2: null, close_time2: null, is_open: true }
];

const INITIAL_CATEGORIES = [
  { id: "cat-combos", name: "Combos & Barcas", slug: "combos-barcas", order_index: 1, is_active: true },
  { id: "cat-temakis", name: "Temakis", slug: "temakis", order_index: 2, is_active: true },
  { id: "cat-cariocas", name: "Cariocas & Cariocões", slug: "cariocas-cariocoes", order_index: 3, is_active: true },
  { id: "cat-especiais", name: "Especiais, Joys & Supremos", slug: "especiais-joys", order_index: 4, is_active: true },
  { id: "cat-uramakis", name: "Uramakis & Hossomakis", slug: "uramakis-hossomakis", order_index: 5, is_active: true },
  { id: "cat-bebidas", name: "Bebidas", slug: "bebidas", order_index: 6, is_active: true }
];

const INITIAL_OPTIONALS = [
  { id: "opt-shoyu", name: "Shoyu Extra", price: 2.00, is_active: true, target: "all", applicable_category_ids: [], order_index: 1 },
  { id: "opt-teriaki", name: "Teriaki Extra", price: 2.50, is_active: true, target: "all", applicable_category_ids: [], order_index: 2 },
  { id: "opt-wasabi", name: "Wasabi", price: 2.00, is_active: true, target: "all", applicable_category_ids: [], order_index: 3 },
  { id: "opt-gengibre", name: "Gengibre", price: 2.00, is_active: true, target: "all", applicable_category_ids: [], order_index: 4 },
  { id: "opt-cream-cheese", name: "Cream Cheese Extra", price: 3.50, is_active: true, target: "all", applicable_category_ids: [], order_index: 5 },
  { id: "opt-hashi", name: "Par de Hashi Extra", price: 1.00, is_active: true, target: "all", applicable_category_ids: [], order_index: 6 }
];

const INITIAL_PROMOTIONS = [];

const INITIAL_NEIGHBORHOODS = [
  { id: "bairro-34", name: "Santo Aleixo (Centro)", delivery_fee: 7.00, is_active: true, order_index: 1 },
  { id: "bairro-35", name: "Santo Aleixo (Após Nazareno)", delivery_fee: 9.00, is_active: true, order_index: 2 },
  { id: "bairro-14", name: "Lote 56 (Terminal)", delivery_fee: 7.00, is_active: true, order_index: 3 },
  { id: "bairro-15", name: "Lote 56 (Casinhas)", delivery_fee: 10.00, is_active: true, order_index: 4 },
  { id: "bairro-16", name: "Lote 92", delivery_fee: 7.00, is_active: true, order_index: 5 },
  { id: "bairro-17", name: "Lote 92 (Colônia dos Padres)", delivery_fee: 8.00, is_active: true, order_index: 6 },
  { id: "bairro-12", name: "Engenho Velho", delivery_fee: 7.00, is_active: true, order_index: 7 },
  { id: "bairro-4", name: "Bulhões", delivery_fee: 6.00, is_active: true, order_index: 8 },
  { id: "bairro-5", name: "Cascata", delivery_fee: 7.00, is_active: true, order_index: 9 },
  { id: "bairro-18", name: "Tenda", delivery_fee: 6.00, is_active: true, order_index: 10 },
  { id: "bairro-19", name: "Malvinas", delivery_fee: 7.00, is_active: true, order_index: 11 },
  { id: "bairro-22", name: "Moenda", delivery_fee: 6.00, is_active: true, order_index: 12 },
  { id: "bairro-27", name: "Padre Roma", delivery_fee: 7.00, is_active: true, order_index: 13 },
  { id: "bairro-28", name: "Quadro", delivery_fee: 7.00, is_active: true, order_index: 14 },
  { id: "bairro-2", name: "Alto da Fábrica", delivery_fee: 6.00, is_active: true, order_index: 15 },
  { id: "bairro-13", name: "Floriano", delivery_fee: 10.00, is_active: true, order_index: 16 },
  { id: "bairro-21", name: "Manassu", delivery_fee: 10.00, is_active: true, order_index: 17 },
  { id: "bairro-32", name: "Retiro", delivery_fee: 12.00, is_active: true, order_index: 18 },
  { id: "bairro-36", name: "Socorro (Antes da Granja)", delivery_fee: 8.00, is_active: true, order_index: 19 },
  { id: "bairro-37", name: "Socorro (Entrada da Granja)", delivery_fee: 10.00, is_active: true, order_index: 20 },
  { id: "bairro-38", name: "Suassuna (Portaria)", delivery_fee: 10.00, is_active: true, order_index: 21 },
  { id: "bairro-39", name: "Suassuna (Porta do Apartamento)", delivery_fee: 12.00, is_active: true, order_index: 22 },
  { id: "bairro-29", name: "Vila Natal (Na Portaria)", delivery_fee: 7.00, is_active: true, order_index: 23 },
  { id: "bairro-30", name: "Vila Natal (No Apartamento)", delivery_fee: 10.00, is_active: true, order_index: 24 },
  { id: "bairro-1", name: "Alphaville", delivery_fee: 15.00, is_active: true, order_index: 25 },
  { id: "bairro-3", name: "Alto do Vento", delivery_fee: 15.00, is_active: true, order_index: 26 },
  { id: "bairro-7", name: "Cavaleiro (Antes da Estação)", delivery_fee: 15.00, is_active: true, order_index: 27 },
  { id: "bairro-8", name: "Cavaleiro (Bairros)", delivery_fee: 20.00, is_active: true, order_index: 28 },
  { id: "bairro-6", name: "Coqueiral", delivery_fee: 20.00, is_active: true, order_index: 29 },
  { id: "bairro-9", name: "Curado 1 / 2 / 3 / 4", delivery_fee: 20.00, is_active: true, order_index: 30 },
  { id: "bairro-10", name: "Dois Carneiros (Até Fund. Bradesco / Yapoatam)", delivery_fee: 15.00, is_active: true, order_index: 31 },
  { id: "bairro-11", name: "Dois Carneiros (Após Fund. Bradesco)", delivery_fee: 20.00, is_active: true, order_index: 32 },
  { id: "bairro-20", name: "Marcos Freire", delivery_fee: 20.00, is_active: true, order_index: 33 },
  { id: "bairro-23", name: "Muribeca", delivery_fee: 20.00, is_active: true, order_index: 34 },
  { id: "bairro-26", name: "Pacheco", delivery_fee: 20.00, is_active: true, order_index: 35 },
  { id: "bairro-24", name: "Zumbi do Pacheco", delivery_fee: 20.00, is_active: true, order_index: 36 },
  { id: "bairro-25", name: "URs / Ibura", delivery_fee: 20.00, is_active: true, order_index: 37 },
  { id: "bairro-33", name: "Sancho", delivery_fee: 20.00, is_active: true, order_index: 38 }
];

const INITIAL_COURIERS = [
  { id: "cour-1", name: "Entregador Padrão", phone: "81999999999", is_active: true }
];

// ========================================================
// PRODUTOS OFICIAIS DO KOJI SUSHI (49 ITENS)
// ========================================================
const INITIAL_PRODUCTS = [
  // ------------------------------------------------------
  // 1. COMBOS & BARCAS
  // ------------------------------------------------------
  {
    id: "prod-combo-25",
    category_id: "cat-combos",
    name: "Combo 25 Peças",
    description: "Variedade selecionada com 25 peças fresquinhas e crocantes do Koji Sushi.",
    price: 37.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 1
  },
  {
    id: "prod-combo-30",
    category_id: "cat-combos",
    name: "Combo 30 Peças",
    description: "Combinação equilibrada com 30 peças preparadas na hora com o melhor sabor oriental.",
    price: 37.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 2
  },
  {
    id: "prod-combo-hot",
    category_id: "cat-combos",
    name: "Combo Hot",
    description: "Para os amantes de sushis quentinhos e empanados crocantes.",
    price: 37.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 3
  },
  {
    id: "prod-combo-promocional",
    category_id: "cat-combos",
    name: "Combo Promocional",
    description: "Combo especial com excelente custo-benefício e sabor inconfundível.",
    price: 38.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 4
  },
  {
    id: "prod-combo-misto",
    category_id: "cat-combos",
    name: "Combo Misto",
    description: "Mix perfeito entre peças naturais e empanadas.",
    price: 37.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 5
  },
  {
    id: "prod-combo-skin",
    category_id: "cat-combos",
    name: "Combo Skin",
    description: "Seleção especial com o toque crocante do salmão skin e cream cheese.",
    price: 38.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 6
  },
  {
    id: "prod-combo-natural",
    category_id: "cat-combos",
    name: "Combo Natural",
    description: "Peças naturais e frescas, valorizando o sabor autêntico dos peixes.",
    price: 37.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 7
  },
  {
    id: "prod-combo-saki",
    category_id: "cat-combos",
    name: "Combo Saki",
    description: "Combo saboroso com peças selecionadas no capricho.",
    price: 39.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 8
  },
  {
    id: "prod-combo-kani",
    category_id: "cat-combos",
    name: "Combo Kani",
    description: "Combinação especial destacando o kani kama em deliciosas preparações.",
    price: 41.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 9
  },
  {
    id: "prod-combo-cheasse",
    category_id: "cat-combos",
    name: "Combo Cheasse",
    description: "Feito para quem adora a cremosidade do cream cheese em cada peça.",
    price: 44.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 10
  },
  {
    id: "prod-combo-tem",
    category_id: "cat-combos",
    name: "Combo Tem",
    description: "Combinação prática e saborosa do cardápio Koji Sushi.",
    price: 44.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 11
  },
  {
    id: "prod-combo-40",
    category_id: "cat-combos",
    name: "Combo 40 Peças",
    description: "Fartura de sabor com 40 peças: camarão, kani, salmão e crocância.",
    price: 44.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 12
  },
  {
    id: "prod-combo-40-especial",
    category_id: "cat-combos",
    name: "Combo 40 Peças Especial",
    description: "40 peças selecionadas especiais com camarão, salmão e kani.",
    price: 49.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 13
  },
  {
    id: "prod-combo-salmao",
    category_id: "cat-combos",
    name: "Combo Salmão",
    description: "Dedicado aos apaixonados por salmão fresco e de alta qualidade.",
    price: 51.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 14
  },
  {
    id: "prod-combo-mix",
    category_id: "cat-combos",
    name: "Combo Mix",
    description: "Variedade completa com o melhor do cardápio Koji.",
    price: 53.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 15
  },
  {
    id: "prod-combo-especial",
    category_id: "cat-combos",
    name: "Combo Especial",
    description: "Peças especiais com salmão filadélfia, kani, camarão e temaki (escolha entre hot ou natural).",
    price: 54.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 16
  },
  {
    id: "prod-combo-koji",
    category_id: "cat-combos",
    name: "Combo Koji",
    description: "O combo assinatura da casa: salmão, kani, camarão e muito capricho.",
    price: 58.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 17
  },
  {
    id: "prod-combo-50",
    category_id: "cat-combos",
    name: "Combo 50 Peças",
    description: "Mega combo com 50 peças fartas e deliciosas para compartilhar.",
    price: 58.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 18
  },
  {
    id: "prod-casadinha-salmao",
    category_id: "cat-combos",
    name: "Casadinha de Salmão",
    description: "Dupla harmonia de salmão com toque especial da casa.",
    price: 29.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 19
  },
  {
    id: "prod-barca-super-koji",
    category_id: "cat-combos",
    name: "Barca Super Koji",
    description: "Apresentação em barca caprichada, farta e completa do Koji Sushi.",
    price: 65.00,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 20
  },

  // ------------------------------------------------------
  // 2. TEMAKIS & COMBOS DE TEMAKI
  // ------------------------------------------------------
  {
    id: "prod-temaki-skin",
    category_id: "cat-temakis",
    name: "Temaki de Skin",
    description: "Cone crocante de alga nori, arroz temperado, salmão skin frito e cream cheese.",
    price: 18.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 21
  },
  {
    id: "prod-temaki-kani",
    category_id: "cat-temakis",
    name: "Temaki de Kani",
    description: "Cone de alga recheado de arroz, kani kama desfiado e cream cheese.",
    price: 20.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 22
  },
  {
    id: "prod-temaki-hot-crock-camarao",
    category_id: "cat-temakis",
    name: "Temaki Hot Crock de Camarão",
    description: "Temaki frito ultracrocante recheado com camarão e cream cheese.",
    price: 21.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 23
  },
  {
    id: "prod-temaki-hot-crock-salmao",
    category_id: "cat-temakis",
    name: "Temaki Hot Crock de Salmão",
    description: "Temaki empanado crocante recheado com salmão suculento e cream cheese.",
    price: 22.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 24
  },
  {
    id: "prod-temaki-salmao-filadelfia",
    category_id: "cat-temakis",
    name: "Temaki Salmão Filadélfia",
    description: "O clássico favorito: cubos de salmão fresco, cebolinha e cream cheese.",
    price: 23.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 25
  },
  {
    id: "prod-combo-3-temakis",
    category_id: "cat-temakis",
    name: "Combo 3 Temakis",
    description: "Trio de temakis com recheios tradicionais deliciosos.",
    price: 44.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 26
  },
  {
    id: "prod-combo-3-temakis-especial",
    category_id: "cat-temakis",
    name: "Combo 3 Temakis Especial",
    description: "Trio especial com recheios nobres e generosos.",
    price: 54.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 27
  },

  // ------------------------------------------------------
  // 3. CARIOCAS & CARIOCÕES
  // ------------------------------------------------------
  {
    id: "prod-carioca",
    category_id: "cat-cariocas",
    name: "Carioca (10 unidades)",
    description: "Enrolado frito e crocante com recheio tradicional e toque especial.",
    price: 18.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 28
  },
  {
    id: "prod-hot-crock",
    category_id: "cat-cariocas",
    name: "Hot Crock",
    description: "Sushi empanado com casquinha crocante irresistível.",
    price: 17.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 29
  },
  {
    id: "prod-hot-holl",
    category_id: "cat-cariocas",
    name: "Hot Roll (10 unidades)",
    description: "O clássico hot roll quentinho e crocante com molho especial.",
    price: 21.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 30
  },
  {
    id: "prod-cariocao-skin",
    category_id: "cat-cariocas",
    name: "Cariocão de Skin",
    description: "Mega cariocão de arroz recheado de skin crocante e cream cheese.",
    price: 20.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 31
  },
  {
    id: "prod-cariocao-kani",
    category_id: "cat-cariocas",
    name: "Cariocão de Kani",
    description: "Cariocão generoso de arroz recheado de kani e cream cheese.",
    price: 21.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 32
  },
  {
    id: "prod-cariocao-camarao",
    category_id: "cat-cariocas",
    name: "Cariocão de Camarão",
    description: "Cariocão especial com recheio farto de camarão e cream cheese.",
    price: 23.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 33
  },
  {
    id: "prod-cariocao-camarao-empanado",
    category_id: "cat-cariocas",
    name: "Cariocão de Camarão Empanado",
    description: "Cariocão crocante coberto com camarões empanados crocantes e molho especial.",
    price: 24.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 34
  },
  {
    id: "prod-cariocao-misto",
    category_id: "cat-cariocas",
    name: "Cariocão Misto",
    description: "Cariocão gigante com mix completo de recheios.",
    price: 29.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 35
  },

  // ------------------------------------------------------
  // 4. ESPECIAIS, JOYS & SUPREMOS
  // ------------------------------------------------------
  {
    id: "prod-kani-cheasse",
    category_id: "cat-especiais",
    name: "Kani Cheasse",
    description: "Lâminas de kani recheadas com cream cheese e toque especial.",
    price: 11.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 36
  },
  {
    id: "prod-koji-boll",
    category_id: "cat-especiais",
    name: "Koji Boll",
    description: "Bolinhas crocantes de arroz com recheio especial da casa Koji.",
    price: 19.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 37
  },
  {
    id: "prod-koji-boll-ebi",
    category_id: "cat-especiais",
    name: "Koji Boll Ebi",
    description: "Bolinhas de arroz nobres finalizadas com camarões e molho especial.",
    price: 24.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 38
  },
  {
    id: "prod-joy",
    category_id: "cat-especiais",
    name: "Joy de Salmão",
    description: "Lâmina de salmão envolvendo arroz, coberta com salmão batidinho e cream cheese.",
    price: 23.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 39
  },
  {
    id: "prod-eby-joy",
    category_id: "cat-especiais",
    name: "Eby Joy",
    description: "Joy especial finalizado com camarão e cream cheese maçaricado.",
    price: 23.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 40
  },
  {
    id: "prod-sushi-trufado",
    category_id: "cat-especiais",
    name: "Sushi Trufado (5 unidades)",
    description: "Sushis maçaricados delicadamente finalizados com azeite trufado e flor de sal.",
    price: 23.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 41
  },
  {
    id: "prod-sunomono-trad",
    category_id: "cat-especiais",
    name: "Sunomono Tradicional",
    description: "Salada refrescante de pepino agridoce com kani, salmão e gergelim.",
    price: 31.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 42
  },
  {
    id: "prod-sunomono-esp",
    category_id: "cat-especiais",
    name: "Sunomono Especial",
    description: "Sunomono especial caprichado na taça com salmão fresco, camarão, kani e gergelim.",
    price: 34.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 43
  },
  {
    id: "prod-supremo-camarao",
    category_id: "cat-especiais",
    name: "Supremo de Camarão",
    description: "Prato especial premium com fartura de camarão maçaricado e molhos nobres.",
    price: 53.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 44
  },
  {
    id: "prod-supremo-salmao",
    category_id: "cat-especiais",
    name: "Supremo de Salmão",
    description: "Prato especial premium com fatias nobres de salmão maçaricado e cream cheese.",
    price: 56.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 45
  },

  // ------------------------------------------------------
  // 5. URAMAKIS & HOSSOMAKIS & NIGUIRIS
  // ------------------------------------------------------
  {
    id: "prod-uramaki-koji",
    category_id: "cat-uramakis",
    name: "Uramaki Koji (10 unidades)",
    description: "Uramaki exclusivo da casa finalizado com crocante cebola empanada.",
    price: 17.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 46
  },
  {
    id: "prod-hossomaki",
    category_id: "cat-uramakis",
    name: "Hossomaki (10 unidades)",
    description: "Enrolado tradicional fino com alga por fora e salmão fresco.",
    price: 18.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 47
  },
  {
    id: "prod-niguiri",
    category_id: "cat-uramakis",
    name: "Niguiri de Salmão (unidades)",
    description: "Arroz moldado à mão coberto com lâmina de salmão fresco.",
    price: 19.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 48
  },
  {
    id: "prod-uramaki-massaricado",
    category_id: "cat-uramakis",
    name: "Uramaki Maçaricado (10 unidades)",
    description: "Uramaki coberto com lâmina de salmão maçaricado, cebolinha e molho especial.",
    price: 23.90,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 49
  },

  // ------------------------------------------------------
  // 6. BEBIDAS
  // ------------------------------------------------------
  {
    id: "prod-coca-lata",
    category_id: "cat-bebidas",
    name: "Coca-Cola Lata 350ml",
    description: "Gelada.",
    price: 6.00,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 50
  },
  {
    id: "prod-coca-zero-lata",
    category_id: "cat-bebidas",
    name: "Coca-Cola Zero Lata 350ml",
    description: "Gelada.",
    price: 6.00,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 51
  },
  {
    id: "prod-guarana-lata",
    category_id: "cat-bebidas",
    name: "Guaraná Antarctica Lata 350ml",
    description: "Gelada.",
    price: 6.00,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 52
  },
  {
    id: "prod-agua-sem-gas",
    category_id: "cat-bebidas",
    name: "Água Mineral 500ml",
    description: "Sem gás.",
    price: 4.00,
    image_url: "logo.jpg",
    is_promo: false,
    is_active: true,
    is_available: true,
    order_index: 53
  }
];

// Exporta globalmente para o navegador
window.INITIAL_SETTINGS = INITIAL_SETTINGS;
window.INITIAL_OPERATING_HOURS = INITIAL_OPERATING_HOURS;
window.INITIAL_CATEGORIES = INITIAL_CATEGORIES;
window.INITIAL_OPTIONALS = INITIAL_OPTIONALS;
window.INITIAL_PROMOTIONS = INITIAL_PROMOTIONS;
window.INITIAL_NEIGHBORHOODS = INITIAL_NEIGHBORHOODS;
window.INITIAL_COURIERS = INITIAL_COURIERS;
window.INITIAL_PRODUCTS = INITIAL_PRODUCTS;
