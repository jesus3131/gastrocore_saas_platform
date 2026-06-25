
  const checkoutInfo = { table: "Mesa 12", orderNumber: 4092 };
  const checkoutItems = [
    { name: "Hamburguesa Gourmet", qty: 2, price: 24.50, modifiers: ["Sin cebolla", "Extra queso"] },
    { name: "Coca Cola Zero", qty: 2, price: 5.00, modifiers: [] }
  ];
  const checkoutTotals = { subtotal: 29.50, vatRate: "12%", vat: 3.54, tipRate: "10%", tip: 2.95, total: 35.99 };
  const splitBill = { people: 2, perPerson: 17.99 };
  const billingData = { ruc: "0928374651001", businessName: "Juan Pérez Delgado", email: "juan.perez@email.com" };



  document.getElementById('checkout-header-info').textContent = checkoutInfo.table + ' • Comanda #' + checkoutInfo.orderNumber;
  function renderCheckoutItems() {
    const c = document.getElementById('checkout-items');
    if (!c) return;
    c.innerHTML = checkoutItems.map(item => '<div class="flex justify-between items-start py-sm border-b border-surface-variant/50"><div class="flex gap-sm"><span class="font-data-mono text-data-mono text-on-surface-variant bg-surface-container py-xs px-sm rounded">' + item.qty + 'x</span><div><p class="font-body-md text-body-md font-medium text-on-surface">' + item.name + '</p>' + (item.modifiers.length ? '<p class="font-body-sm text-body-sm text-on-surface-variant">' + item.modifiers.join(', ') + '</p>' : '') + '</div></div><span class="font-data-mono text-data-mono text-on-surface">$' + item.price.toFixed(2) + '</span></div>').join('');
  }
  function renderCheckoutTotals() {
    const c = document.getElementById('checkout-totals');
    if (!c) return;
    c.innerHTML = '<div class="space-y-sm mb-md"><div class="flex justify-between text-on-surface-variant"><span class="font-body-sm text-body-sm">Subtotal</span><span class="font-data-mono text-data-mono">$' + checkoutTotals.subtotal.toFixed(2) + '</span></div><div class="flex justify-between text-on-surface-variant"><span class="font-body-sm text-body-sm">IVA (' + checkoutTotals.vatRate + ')</span><span class="font-data-mono text-data-mono">$' + checkoutTotals.vat.toFixed(2) + '</span></div><div class="flex justify-between text-on-surface-variant"><span class="font-body-sm text-body-sm">Propina (' + checkoutTotals.tipRate + ')</span><span class="font-data-mono text-data-mono">$' + checkoutTotals.tip.toFixed(2) + '</span></div></div><div class="flex justify-between items-center py-sm border-t border-surface-variant"><span class="font-headline-md text-headline-md text-on-surface">Total</span><span class="font-headline-md text-headline-md font-data-mono text-primary">$' + checkoutTotals.total.toFixed(2) + '</span></div>';
  }
  function renderSplitBill() {
    const c = document.getElementById('split-bill');
    if (!c) return;
    c.innerHTML = '<div class="flex items-center gap-sm"><span class="material-symbols-outlined text-on-surface-variant">group</span><span class="font-body-md text-body-md text-on-surface">Dividido en ' + splitBill.people + ' personas</span></div><span class="font-data-mono text-data-mono text-primary font-semibold">$' + splitBill.perPerson.toFixed(2) + ' / persona</span>';
  }
  document.getElementById('billing-ruc').value = billingData.ruc;
  document.getElementById('billing-name').value = billingData.businessName;
  document.getElementById('billing-email').value = billingData.email;
  document.getElementById('monto-cobrar').textContent = '$' + splitBill.perPerson.toFixed(2);
  renderCheckoutItems();
  renderCheckoutTotals();
  renderSplitBill();
