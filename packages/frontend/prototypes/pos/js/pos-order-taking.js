const menuItems = [
  { id: 'm1', name: "Hamburguesa Gourmet Clásica", price: 18.50, category: "main", soldOut: false, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop" },
  { id: 'm2', name: "Ribeye Steak 400g", price: 34.00, category: "main", soldOut: false, image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=300&fit=crop" },
  { id: 'm3', name: "Salmón a la Parrilla", price: 26.00, category: "main", soldOut: true, image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop" },
  { id: 'm4', name: "Ensalada César con Pollo", price: 14.50, category: "main", soldOut: false, image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400&h=300&fit=crop" },
  { id: 'm5', name: "Pasta Carbonara Artesanal", price: 19.00, category: "main", soldOut: false, image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=300&fit=crop" },
  { id: 'm6', name: "Coca Cola Zero", price: 3.50, category: "drinks", soldOut: false, image: "https://images.unsplash.com/photo-1629203851122-3726ec8e81d5?w=400&h=300&fit=crop" },
  { id: 'm7', name: "Limonada Natural", price: 4.00, category: "drinks", soldOut: false, image: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&h=300&fit=crop" },
  { id: 'm8', name: "Cerveza Artesanal IPA", price: 6.50, category: "drinks", soldOut: false, image: "https://images.unsplash.com/photo-1608270586620-8d2b2f043e1b?w=400&h=300&fit=crop" },
  { id: 'm9', name: "Nachos con Queso", price: 9.00, category: "starters", soldOut: false, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop" },
  { id: 'm10', name: "Alitas BBQ", price: 11.00, category: "starters", soldOut: false, image: "https://images.unsplash.com/photo-1608039829572-9f18a1f5a0b3?w=400&h=300&fit=crop" },
  { id: 'm11', name: "Tiramisú", price: 7.50, category: "desserts", soldOut: false, image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop" },
  { id: 'm12', name: "Flan de Caramelo", price: 6.00, category: "desserts", soldOut: false, image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop" }
];

const categories = [
  { name: "Main Courses", icon: "lunch_dining", key: "main" },
  { name: "Drinks", icon: "local_drink", key: "drinks" },
  { name: "Starters", icon: "tapas", key: "starters" },
  { name: "Desserts", icon: "cake", key: "desserts" }
];

const allOrders = Utils.storage.get('pos_orders', []);
let currentOrder = Utils.storage.get('pos_current_order', null);
let activeCategory = 'main';
let orderCounter = Utils.storage.get('pos_order_counter', 4092);

function nextOrderNumber() { orderCounter++; Utils.storage.set('pos_order_counter', orderCounter); return orderCounter }

function getOrder() {
  if (!currentOrder) {
    currentOrder = {
      id: Utils.uid(), number: nextOrderNumber(), table: 'Mesa 12', customer: 'Carlos M.',
      items: [], createdAt: new Date().toISOString(), status: 'open'
    };
    saveOrder();
  }
  return currentOrder;
}

function saveOrder() {
  Utils.storage.set('pos_current_order', currentOrder);
  renderAll();
}

function calcOrder(order) {
  const subtotal = order.items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = subtotal * 0.16;
  const total = subtotal + tax;
  return { subtotal, tax, total, itemCount: order.items.reduce((s, i) => s + i.qty, 0) };
}

function addToOrder(itemId) {
  const item = menuItems.find(m => m.id === itemId);
  if (!item || item.soldOut) return;
  const order = getOrder();
  const existing = order.items.find(i => i.menuItemId === itemId && i.modifiers.length === 0);
  if (existing) { existing.qty++; saveOrder(); return }
  order.items.push({ id: Utils.uid(), menuItemId: itemId, name: item.name, price: item.price, qty: 1, modifiers: [] });
  saveOrder();
  Utils.notify(`${item.name} agregado`);
}

function updateQty(itemId, delta) {
  const order = getOrder();
  const idx = order.items.findIndex(i => i.id === itemId);
  if (idx === -1) return;
  const newQty = order.items[idx].qty + delta;
  if (newQty <= 0) { order.items.splice(idx, 1) }
  else { order.items[idx].qty = newQty }
  saveOrder();
}

function addModifier(itemId) {
  Utils.prompt({
    title: 'Agregar Modificador',
    fields: [
      { name: 'text', label: 'Descripción' },
      { name: 'type', label: 'Tipo', type: 'select', options: [{ value: 'add', label: 'Agregar' }, { value: 'remove', label: 'Quitar' }] }
    ],
    onSave: (vals) => {
      const order = getOrder();
      const item = order.items.find(i => i.id === itemId);
      if (item) { item.modifiers.push(vals); saveOrder() }
    }
  });
}

function removeModifier(itemId, modIdx) {
  const order = getOrder();
  const item = order.items.find(i => i.id === itemId);
  if (item) { item.modifiers.splice(modIdx, 1); saveOrder() }
}

function sendToKitchen() {
  const order = getOrder();
  if (order.items.length === 0) { Utils.notify('Agrega items a la orden', 'warning'); return }
  order.status = 'sent';
  order.sentAt = new Date().toISOString();
  allOrders.push({ ...order });
  Utils.storage.set('pos_orders', allOrders);
  currentOrder = null;
  Utils.storage.remove('pos_current_order');
  Utils.notify(`Comanda #${order.number} enviada a cocina`);
  renderAll();
}

function newOrder() {
  currentOrder = null;
  Utils.storage.remove('pos_current_order');
  Utils.notify('Nueva orden creada', 'info');
  renderAll();
}

function changeCustomer() {
  Utils.prompt({
    title: 'Datos del Cliente',
    fields: [
      { name: 'table', label: 'Mesa', value: getOrder().table },
      { name: 'customer', label: 'Cliente', value: getOrder().customer }
    ],
    onSave: (vals) => { const o = getOrder(); o.table = vals.table; o.customer = vals.customer; saveOrder() }
  });
}

function renderCategories() {
  const c = document.getElementById('category-filter');
  if (!c) return;
  c.innerHTML = categories.map(cat =>
    `<button class="cat-btn flex items-center gap-2 px-md py-2 rounded-full ${cat.key === activeCategory ? 'bg-primary-container text-on-primary-container border border-primary-container' : 'bg-surface text-on-surface border border-outline-variant hover:bg-surface-container-low'} font-label-md text-label-md whitespace-nowrap transition-colors touch-target" data-cat="${cat.key}"><span class="material-symbols-outlined text-[18px]">${cat.icon}</span> ${cat.name}</button>`
  ).join('');
  c.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => { activeCategory = btn.dataset.cat; renderAll() });
  });
}

function renderMenuItems() {
  const c = document.getElementById('menu-grid');
  if (!c) return;
  const filtered = menuItems.filter(m => m.category === activeCategory);
  c.innerHTML = filtered.map(item =>
    `<button class="menu-item flex flex-col text-left bg-surface rounded-lg border border-outline-variant overflow-hidden hover:border-primary hover:-translate-y-px transition-all" data-id="${item.id}">
      <div class="w-full h-32 bg-surface-container-highest relative">
        ${item.soldOut ? '<div class="absolute inset-0 bg-[#ffdada] flex items-center justify-center opacity-80 z-10"><span class="font-label-md text-label-md text-on-error-container font-bold px-2 py-1 bg-white/90 rounded">Agotado</span></div>' : ''}
        <img class="w-full h-full object-cover ${item.soldOut ? 'grayscale opacity-50' : 'hover:scale-105 transition-transform duration-300'}" src="${item.image}">
      </div>
      <div class="p-3 flex flex-col gap-1 flex-1 ${item.soldOut ? 'opacity-70' : ''}">
        <span class="font-body-sm text-body-sm text-on-surface font-medium line-clamp-2">${item.name}</span>
        <div class="mt-auto flex justify-between items-end pt-2">
          <span class="font-data-mono text-data-mono ${item.soldOut ? 'text-on-surface-variant' : 'text-primary font-semibold'}">$${item.price.toFixed(2)}</span>
        </div>
      </div>
    </button>`
  ).join('');
  c.querySelectorAll('.menu-item').forEach(btn => {
    btn.addEventListener('click', () => addToOrder(btn.dataset.id));
  });
}

function renderTicketHeader() {
  const c = document.getElementById('ticket-header');
  if (!c) return;
  const order = getOrder();
  c.innerHTML = `
    <div class="flex justify-between items-center mb-1">
      <h2 class="font-headline-md text-headline-md text-on-surface font-bold">Comanda #${order.number}</h2>
      <span class="font-label-md text-label-md text-on-surface-variant bg-surface-container px-2 py-1 rounded">${order.table}</span>
    </div>
    <div class="flex items-center gap-2 text-on-surface-variant">
      <span class="material-symbols-outlined text-[16px]">person</span>
      <span class="font-body-sm text-body-sm cursor-pointer hover:text-primary" id="change-customer">${order.customer}</span>
    </div>`;
  document.getElementById('change-customer')?.addEventListener('click', changeCustomer);
}

function renderOrderItems() {
  const c = document.getElementById('order-items');
  if (!c) return;
  const order = getOrder();
  if (order.items.length === 0) {
    c.innerHTML = '<div class="flex flex-col items-center justify-center py-12 text-on-surface-variant"><span class="material-symbols-outlined text-4xl mb-2">shopping_cart</span><span class="font-body-md">Selecciona productos del menú</span></div>';
    return;
  }
  c.innerHTML = order.items.map(item => {
    const m = item.modifiers && item.modifiers.length;
    return `<div class="bg-surface p-3 rounded border border-outline-variant flex gap-3 ${m ? 'relative overflow-hidden' : ''}">
      ${m ? '<div class="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>' : ''}
      <div class="flex flex-col items-center justify-start gap-1">
        <button class="qty-up w-8 h-8 rounded bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"><span class="material-symbols-outlined text-[18px]">add</span></button>
        <span class="font-data-mono text-data-mono font-bold">${item.qty}</span>
        <button class="qty-down w-8 h-8 rounded bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"><span class="material-symbols-outlined text-[18px]">remove</span></button>
      </div>
      <div class="flex-1 flex flex-col">
        <div class="flex justify-between items-start">
          <span class="font-body-md text-body-md text-on-surface font-medium">${item.name}</span>
          <span class="font-data-mono text-data-mono text-on-surface">$${(item.price * item.qty).toFixed(2)}</span>
        </div>
        ${m ? '<ul class="mt-1 space-y-1">' + item.modifiers.map((mod, mi) =>
          `<li class="font-label-md text-label-md ${mod.type === 'remove' ? 'text-error' : 'text-green-600'} flex items-center gap-1">
            <span class="material-symbols-outlined text-[12px]">${mod.type === 'remove' ? 'close' : 'add'}</span> ${mod.text}
            <button class="mod-remove ml-1 text-gray-400 hover:text-error" data-mi="${mi}"><span class="material-symbols-outlined text-[12px]">close</span></button>
          </li>`
        ).join('') + '</ul>' : ''}
        <button class="add-mod mt-1 text-xs text-primary hover:underline flex items-center gap-1" data-id="${item.id}">
          <span class="material-symbols-outlined text-[14px]">add_circle</span> Modificador
        </button>
      </div>
    </div>`;
  }).join('');
  c.querySelectorAll('.qty-up').forEach((btn, i) => btn.addEventListener('click', () => updateQty(order.items[i]?.id, 1)));
  c.querySelectorAll('.qty-down').forEach((btn, i) => btn.addEventListener('click', () => updateQty(order.items[i]?.id, -1)));
  c.querySelectorAll('.add-mod').forEach(btn => btn.addEventListener('click', () => addModifier(btn.dataset.id)));
  c.querySelectorAll('.mod-remove').forEach(btn => {
    const mi = parseInt(btn.dataset.mi);
    const parent = btn.closest('div[class*="bg-surface"]');
    const idx = Array.from(c.children).indexOf(parent);
    btn.addEventListener('click', () => removeModifier(order.items[idx]?.id, mi));
  });
}

function renderFinancialSummary() {
  const c = document.getElementById('financial-summary');
  if (!c) return;
  const order = getOrder();
  const fin = calcOrder(order);
  c.innerHTML = `
    <div class="space-y-2 mb-4">
      <div class="flex justify-between items-center text-on-surface-variant">
        <span class="font-body-sm text-body-sm">Subtotal</span>
        <span class="font-data-mono text-data-mono">$${fin.subtotal.toFixed(2)}</span>
      </div>
      <div class="flex justify-between items-center text-on-surface-variant">
        <span class="font-body-sm text-body-sm">Impuestos (16%)</span>
        <span class="font-data-mono text-data-mono">$${fin.tax.toFixed(2)}</span>
      </div>
      <div class="flex justify-between items-center text-on-surface-variant">
        <span class="font-body-sm text-body-sm">Items</span>
        <span class="font-data-mono text-data-mono">${fin.itemCount}</span>
      </div>
      <div class="flex justify-between items-center pt-2 border-t border-outline-variant mt-2">
        <span class="font-headline-md text-headline-md text-on-surface font-bold">Total</span>
        <span class="font-headline-md text-headline-md font-data-mono text-primary font-bold">$${fin.total.toFixed(2)}</span>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-sm">
      <button id="btn-new-order" class="col-span-1 h-12 rounded flex items-center justify-center gap-2 border border-outline text-on-surface font-body-sm text-body-sm hover:bg-surface-container transition-colors touch-target">
        <span class="material-symbols-outlined text-[20px]">add</span> Nueva
      </button>
      <button class="col-span-1 h-12 rounded flex items-center justify-center gap-2 bg-[#1e3a8a]/10 text-primary border border-primary/20 font-body-sm text-body-sm font-medium hover:bg-[#1e3a8a]/20 transition-colors touch-target">
        <span class="material-symbols-outlined text-[20px]">receipt_long</span> Imprimir
      </button>
      <button id="btn-send-kitchen" class="col-span-2 h-14 rounded flex items-center justify-center gap-2 bg-primary text-on-primary font-body-md text-body-md font-bold hover:bg-primary/90 transition-colors shadow-sm touch-target mt-1">
        <span class="material-symbols-outlined">send</span> Enviar a Cocina
      </button>
      <button id="btn-pay" class="col-span-2 h-14 rounded flex items-center justify-center gap-2 bg-green-600 text-white font-body-md text-body-md font-bold hover:bg-green-700 transition-colors shadow-sm touch-target">
        <span class="material-symbols-outlined">payments</span> Cobrar
      </button>
    </div>`;
  document.getElementById('btn-new-order')?.addEventListener('click', newOrder);
  document.getElementById('btn-send-kitchen')?.addEventListener('click', sendToKitchen);
  document.getElementById('btn-pay')?.addEventListener('click', () => {
    const order = getOrder();
    if (order.items.length === 0) { Utils.notify('Agrega items a la orden', 'warning'); return }
    window.location.href = 'pos-checkout.html?orderId=' + order.id;
  });
}

function renderAll() {
  renderCategories();
  renderMenuItems();
  renderTicketHeader();
  renderOrderItems();
  renderFinancialSummary();
}

document.addEventListener('DOMContentLoaded', renderAll);
