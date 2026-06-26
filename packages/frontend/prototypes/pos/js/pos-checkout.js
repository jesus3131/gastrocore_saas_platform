(function () {
  const TAX_RATE = 0.16;

  let order = null;
  let splitMode = 'equal';
  let splitPeople = 2;
  let splitAssignments = [];
  let customAmounts = [];
  let selectedPayment = 'tarjeta';

  const PAYMENT_METHODS = {
    efectivo: { icon: 'payments', label: 'Efectivo' },
    tarjeta: { icon: 'credit_card', label: 'Tarjeta de Crédito' },
    transferencia: { icon: 'account_balance', label: 'Transferencia' },
    wallet: { icon: 'wallet', label: 'Wallet Digital' }
  };

  const seedOrder = {
    id: Utils.uid(),
    number: 4092,
    table: 'Mesa 12',
    customer: 'Carlos M.',
    items: [
      { id: Utils.uid(), name: 'Hamburguesa Gourmet', price: 24.50, qty: 2, modifiers: ['Sin cebolla', 'Extra queso'] },
      { id: Utils.uid(), name: 'Coca Cola Zero', price: 5.00, qty: 2, modifiers: [] }
    ],
    createdAt: new Date().toISOString(),
    status: 'open'
  };

  function calcOrder() {
    const subtotal = order.items.reduce((s, i) => s + i.price * i.qty, 0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }

  function calcSplit() {
    const { total } = calcOrder();
    if (splitMode === 'equal') {
      const pp = total / splitPeople;
      return { people: splitPeople, perPerson: [pp], mode: 'equal', label: `Dividido en ${splitPeople} personas` };
    }
    if (splitMode === 'items') {
      const counts = splitAssignments.length || splitPeople;
      const personTotals = Array.from({ length: counts }, () => 0);
      let assignedTotal = 0;
      splitAssignments.forEach((itemIds, pi) => {
        itemIds.forEach(id => {
          const item = order.items.find(i => i.id === id);
          if (item) { personTotals[pi] += item.price * item.qty; assignedTotal += item.price * item.qty; }
        });
      });
      const unassigned = total - assignedTotal;
      const extraPer = unassigned / counts;
      const perPerson = personTotals.map(v => v + extraPer);
      return { people: counts, perPerson, mode: 'items', label: `Dividido por artículos — ${counts} personas` };
    }
    if (splitMode === 'custom') {
      const counts = Math.max(customAmounts.length, 1);
      const assigned = customAmounts.reduce((s, v) => s + v, 0);
      const remaining = total - assigned;
      const extraPer = remaining / counts;
      const perPerson = customAmounts.map(v => v + extraPer);
      return { people: counts, perPerson, mode: 'custom', label: `Montos personalizados — ${counts} personas` };
    }
    return { people: 1, perPerson: [total], mode: 'equal', label: '' };
  }

  function formatModifiers(mods) {
    if (!mods || !mods.length) return '';
    return mods.map(m => typeof m === 'string' ? m : (m.text || (m.type === 'add' ? '+' : '-') + ' ' + (m.label || ''))).filter(Boolean).join(', ');
  }

  function saveOrderToStorage() {
    if (order && order !== seedOrder) {
      Utils.storage.set('pos_current_order', order);
    }
  }

  function loadOrder() {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('orderId');
    if (orderId) {
      const orders = Utils.storage.get('pos_orders', []);
      order = orders.find(o => o.id === orderId);
    }
    if (!order) {
      order = Utils.storage.get('pos_current_order', null);
    }
    if (!order) {
      order = JSON.parse(JSON.stringify(seedOrder));
    }
    splitAssignments = [ [], [] ];
    customAmounts = [0, 0];
    renderAll();
  }

  function renderHeader() {
    const el = document.getElementById('checkout-header-info');
    if (!el) return;
    el.textContent = (order.table || 'Mesa') + ' • Comanda #' + (order.number || '—');
  }

  function renderCheckoutItems() {
    const c = document.getElementById('checkout-items');
    if (!c) return;
    if (!order.items || order.items.length === 0) {
      c.innerHTML = '<div class="flex flex-col items-center justify-center py-12 text-on-surface-variant"><span class="material-symbols-outlined text-4xl mb-2">shopping_cart</span><p class="font-body-md">No hay items en esta orden</p></div>';
      return;
    }
    c.innerHTML = order.items.map((item, idx) => {
      const mods = formatModifiers(item.modifiers);
      return `<div class="bg-surface p-3 rounded-lg border border-outline-variant flex items-start gap-3 ${mods ? 'border-l-4 border-l-primary' : ''}">
        <div class="flex flex-col items-center gap-1 min-w-[48px]">
          <button class="qty-up w-8 h-8 rounded-lg bg-surface-container-hover flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors" data-idx="${idx}"><span class="material-symbols-outlined text-[18px]">add</span></button>
          <span class="font-data-mono text-data-mono font-bold text-on-surface">${item.qty}</span>
          <button class="qty-down w-8 h-8 rounded-lg bg-surface-container-hover flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors" data-idx="${idx}"><span class="material-symbols-outlined text-[18px]">remove</span></button>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-start gap-2">
            <span class="font-body-md text-body-md font-medium text-on-surface truncate">${item.name}</span>
            <span class="font-data-mono text-data-mono text-on-surface shrink-0">${Utils.formatCurrency(item.price * item.qty)}</span>
          </div>
          ${mods ? `<p class="font-body-sm text-body-sm text-on-surface-variant mt-1">${mods}</p>` : ''}
        </div>
        <button class="remove-item text-on-surface-variant hover:text-error transition-colors p-1 self-start" data-idx="${idx}"><span class="material-symbols-outlined text-[18px]">close</span></button>
      </div>`;
    }).join('');
    c.querySelectorAll('.qty-up').forEach(btn => btn.addEventListener('click', () => updateQty(parseInt(btn.dataset.idx), 1)));
    c.querySelectorAll('.qty-down').forEach(btn => btn.addEventListener('click', () => updateQty(parseInt(btn.dataset.idx), -1)));
    c.querySelectorAll('.remove-item').forEach(btn => btn.addEventListener('click', () => removeItem(parseInt(btn.dataset.idx))));
  }

  function renderCheckoutTotals() {
    const c = document.getElementById('checkout-totals');
    if (!c) return;
    const fin = calcOrder();
    c.innerHTML = `<div class="space-y-sm mb-md">
      <div class="flex justify-between text-on-surface-variant">
        <span class="font-body-sm text-body-sm">Subtotal</span>
        <span class="font-data-mono text-data-mono">${Utils.formatCurrency(fin.subtotal)}</span>
      </div>
      <div class="flex justify-between text-on-surface-variant">
        <span class="font-body-sm text-body-sm">IVA (16%)</span>
        <span class="font-data-mono text-data-mono">${Utils.formatCurrency(fin.tax)}</span>
      </div>
    </div>
    <div class="flex justify-between items-center py-sm border-t border-surface-variant">
      <span class="font-headline-md text-headline-md text-on-surface">Total</span>
      <span class="font-headline-md text-headline-md font-data-mono text-primary">${Utils.formatCurrency(fin.total)}</span>
    </div>`;
  }

  function renderSplitBill() {
    const c = document.getElementById('split-bill');
    if (!c) return;
    const split = calcSplit();
    const isSingle = split.perPerson.length === 1;
    let detail = '';
    if (!isSingle && split.perPerson.length > 1) {
      detail = split.perPerson.map((pp, i) => `<span class="font-body-sm text-body-sm text-on-surface-variant">Persona ${i + 1}: <span class="font-data-mono text-data-mono text-primary">${Utils.formatCurrency(pp)}</span></span>`).join('');
    }
    c.innerHTML = `<div class="flex items-center gap-sm"><span class="material-symbols-outlined text-on-surface-variant">group</span><span class="font-body-md text-body-md text-on-surface">${split.label}</span></div>
      <div class="flex items-baseline gap-sm">
        <span class="font-data-mono text-data-mono text-primary font-semibold">${isSingle ? Utils.formatCurrency(split.perPerson[0]) + ' / persona' : ''}</span>
        ${detail ? '<div class="flex flex-col">' + detail + '</div>' : ''}
      </div>`;
  }

  function renderMontoCobrar() {
    const el = document.getElementById('monto-cobrar');
    if (!el) return;
    const fin = calcOrder();
    el.textContent = Utils.formatCurrency(fin.total);
  }

  function updateQty(idx, delta) {
    if (!order || !order.items[idx]) return;
    const newQty = order.items[idx].qty + delta;
    if (newQty <= 0) {
      order.items.splice(idx, 1);
    } else {
      order.items[idx].qty = newQty;
    }
    saveOrderToStorage();
    renderAll();
  }

  function removeItem(idx) {
    if (!order || !order.items[idx]) return;
    Utils.confirm('¿Eliminar este item de la orden?', () => {
      order.items.splice(idx, 1);
      saveOrderToStorage();
      renderAll();
    });
  }

  function setSplitEqual() {
    splitMode = 'equal';
    Utils.prompt({
      title: 'Dividir en partes iguales',
      fields: [{ name: 'people', label: 'Número de personas', type: 'number' }],
      data: { people: String(splitPeople) },
      onSave: (vals) => {
        splitPeople = Math.max(1, parseInt(vals.people) || 1);
        renderAll();
      }
    });
  }

  function setSplitItems() {
    splitMode = 'items';
    const items = order.items || [];
    if (items.length === 0) { Utils.notify('No hay items para asignar', 'warning'); return; }
    let html = '<div class="space-y-4">';
    const counts = Math.max(splitAssignments.length, 2);
    for (let p = 0; p < counts; p++) {
      html += `<div class="border-b border-surface-variant pb-3 mb-3"><p class="font-body-md text-body-md font-medium text-on-surface mb-2">Persona ${p + 1}</p>`;
      items.forEach((item, idx) => {
        const checked = splitAssignments[p] && splitAssignments[p].includes(item.id) ? 'checked' : '';
        html += `<label class="flex items-center gap-2 py-1 cursor-pointer"><input type="checkbox" id="split-p${p}-i${idx}" value="${item.id}" ${checked} class="rounded border-outline-variant text-primary"><span class="font-body-sm text-body-sm text-on-surface">${item.name} x${item.qty}</span></label>`;
      });
      html += '</div>';
    }
    html += '</div>';
    Utils.modal({
      title: 'Dividir por artículos',
      content: html,
      confirmText: 'Aplicar',
      onConfirm: () => {
        const newAssignments = [];
        for (let p = 0; p < counts; p++) {
          const ids = [];
          items.forEach((item, idx) => {
            const cb = document.getElementById(`split-p${p}-i${idx}`);
            if (cb && cb.checked) ids.push(item.id);
          });
          newAssignments.push(ids);
        }
        splitAssignments = newAssignments;
        renderAll();
      }
    });
  }

  function setSplitCustom() {
    splitMode = 'custom';
    const fin = calcOrder();
    const counts = Math.max(customAmounts.length, splitPeople);
    const fields = [];
    for (let i = 0; i < counts; i++) {
      fields.push({ name: `p${i}`, label: `Persona ${i + 1}`, type: 'number' });
    }
    const data = {};
    for (let i = 0; i < counts; i++) {
      data[`p${i}`] = String(customAmounts[i] || '');
    }
    Utils.prompt({
      title: `Montos personalizados — Total: ${Utils.formatCurrency(fin.total)}`,
      fields,
      data,
      onSave: (vals) => {
        customAmounts = fields.map(f => parseFloat(vals[f.name]) || 0);
        splitPeople = counts;
        renderAll();
      }
    });
  }

  function processPayment() {
    const fin = calcOrder();
    if (!order.items || order.items.length === 0) {
      Utils.notify('La orden no tiene items para cobrar', 'warning');
      return;
    }

    const methodInfo = PAYMENT_METHODS[selectedPayment] || { icon: 'credit_card', label: 'Tarjeta' };

    function doPayment(amountReceived) {
      const txn = {
        id: 'TXN-' + Utils.uid().slice(0, 8).toUpperCase(),
        orderId: order.id,
        orderNumber: order.number,
        table: order.table,
        customer: order.customer,
        total: fin.total,
        subtotal: fin.subtotal,
        tax: fin.tax,
        method: methodInfo,
        paymentMethod: selectedPayment,
        received: amountReceived || fin.total,
        change: amountReceived ? Math.max(0, amountReceived - fin.total) : 0,
        date: new Date().toISOString(),
        billing: {
          ruc: (document.getElementById('billing-ruc') || {}).value || '',
          name: (document.getElementById('billing-name') || {}).value || '',
          email: (document.getElementById('billing-email') || {}).value || ''
        },
        split: { mode: splitMode, people: splitPeople },
        items: JSON.parse(JSON.stringify(order.items)),
        status: 'completed'
      };

      const transactions = Utils.storage.get('pos_transactions', []);
      transactions.push(txn);
      Utils.storage.set('pos_transactions', transactions);

      Utils.storage.remove('pos_current_order');

      const orders = Utils.storage.get('pos_orders', []);
      const oi = orders.findIndex(o => o.id === order.id);
      if (oi !== -1) { orders.splice(oi, 1); Utils.storage.set('pos_orders', orders); }

      Utils.storage.set('last_transaction', txn);

      Utils.notify('Pago completado — Comanda #' + order.number);
      window.location.href = 'pos-payment-success.html?txnId=' + txn.id;
    }

    if (selectedPayment === 'efectivo') {
      Utils.prompt({
        title: 'Pago en Efectivo',
        fields: [{ name: 'received', label: 'Monto recibido', type: 'number' }],
        data: { received: String(fin.total) },
        onSave: (vals) => {
          const received = parseFloat(vals.received) || 0;
          if (received < fin.total) {
            Utils.notify('El monto recibido es menor al total a cobrar', 'error');
            return;
          }
          const change = received - fin.total;
          Utils.notify(`Cambio: ${Utils.formatCurrency(change)}`, 'info');
          doPayment(received);
        }
      });
    } else {
      doPayment(fin.total);
    }
  }

  function handlePaymentMethodChange(radio, idx) {
    const methods = ['efectivo', 'tarjeta', 'transferencia', 'wallet'];
    radio.value = methods[idx];
    radio.addEventListener('change', () => {
      if (radio.checked) selectedPayment = radio.value;
    });
    if (radio.checked) selectedPayment = radio.value;
  }

  function bindEvents() {
    const allButtons = document.querySelectorAll('button');
    allButtons.forEach(btn => {
      const txt = btn.textContent.trim();
      if (txt.includes('Igualitario')) btn.addEventListener('click', setSplitEqual);
      else if (txt.includes('Por Artículos') || txt.includes('Artículos')) btn.addEventListener('click', setSplitItems);
      else if (txt.includes('Personalizado')) btn.addEventListener('click', setSplitCustom);
      else if (txt.includes('Finalizar') || txt.includes('Cerrar Mesa')) btn.addEventListener('click', processPayment);
    });

    document.querySelectorAll('input[name="payment_method"]').forEach(handlePaymentMethodChange);
  }

  function renderAll() {
    renderHeader();
    renderCheckoutItems();
    renderCheckoutTotals();
    renderSplitBill();
    renderMontoCobrar();
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadOrder();
    bindEvents();
  });
})();
