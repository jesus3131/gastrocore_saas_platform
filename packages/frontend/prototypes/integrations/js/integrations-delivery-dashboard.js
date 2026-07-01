(function() {
  var STORAGE_KEY = 'int_delivery_orders';
  var PLATFORMS = [
    { name: 'Rappi', initials: 'RA', color: '#FF6F00', icon: 'Rappi' },
    { name: 'Uber Eats', initials: 'UE', color: '#000000', icon: 'UberEats' },
    { name: 'Didi Food', initials: 'DF', color: '#FF6600', icon: 'DidiFood' },
    { name: 'Mercado Pago', initials: 'MP', color: '#009EE3', icon: 'MercadoPago' }
  ];
  var CUSTOMERS = ['Carlos Gómez', 'María López', 'Juan Pérez', 'Ana Torres', 'Pedro Sánchez', 'Laura Ruiz', 'Diego Ramírez', 'Sofía Herrera', 'Miguel Ángel', 'Valentina Ortiz'];
  var MENU_ITEMS = [
    ['1x Truffle Burger', '1x Sweet Potato Fries'],
    ['2x Margherita Pizza', '1x Garlic Knots'],
    ['1x Chicken Caesar Salad', '1x Iced Tea'],
    ['3x Beef Tacos', '2x Guacamole'],
    ['1x Pasta Alfredo', '1x Garlic Bread'],
    ['2x Sushi Rolls', '1x Miso Soup'],
    ['1x Grilled Salmon', '1x Rice', '1x Vegetables'],
    ['1x Club Sandwich', '1x French Fries'],
    ['2x Fish & Chips', '1x Coleslaw'],
    ['1x Steak', '1x Baked Potato'],
    ['3x Chicken Wings', '1x Blue Cheese'],
    ['1x Veggie Burger', '1x Onion Rings'],
    ['2x Pad Thai', '1x Spring Rolls'],
    ['1x Lamb Chops', '1x Mint Sauce'],
    ['1x Chocolate Lava Cake', '1x Ice Cream']
  ];

  function seed() {
    if (Utils.storage.get(STORAGE_KEY)) return;
    var orders = [];
    var now = Date.now();
    var statusPool = ['new','new','new','new','new','preparing','preparing','preparing','preparing','preparing','outForDelivery','outForDelivery','outForDelivery','outForDelivery','outForDelivery'];
    for (var i = 0; i < 18; i++) {
      var p = PLATFORMS[i % PLATFORMS.length];
      var createdAt = new Date(now - Math.random() * 7200000 - i * 120000);
      var prepStart = statusPool[i % statusPool.length] !== 'new' ? new Date(createdAt.getTime() + Math.random() * 300000).toISOString() : null;
      var deliveredAt = statusPool[i % statusPool.length] === 'outForDelivery' ? new Date((prepStart ? new Date(prepStart).getTime() : createdAt.getTime()) + 600000 + Math.random() * 600000).toISOString() : null;
      orders.push({
        id: Utils.uid(),
        platform: p.name,
        customerName: CUSTOMERS[i % CUSTOMERS.length],
        items: MENU_ITEMS[i % MENU_ITEMS.length],
        total: Math.round((Math.random() * 800 + 120) * 100) / 100,
        status: statusPool[i % statusPool.length],
        createdAt: createdAt.toISOString(),
        prepStart: prepStart,
        deliveredAt: deliveredAt
      });
    }
    Utils.storage.set(STORAGE_KEY, orders);
  }

  function getOrders() { return Utils.storage.get(STORAGE_KEY, []); }
  function saveOrders(o) { Utils.storage.set(STORAGE_KEY, o); }

  function timeElapsed(iso) {
    if (!iso) return '';
    var diff = Date.now() - new Date(iso).getTime();
    var m = Math.floor(diff / 60000);
    if (m < 60) return m + 'm';
    var h = Math.floor(m / 60);
    return h + 'h ' + (m % 60) + 'm';
  }

  function getPlatformInfo(name) {
    for (var i = 0; i < PLATFORMS.length; i++) {
      if (PLATFORMS[i].name === name) return PLATFORMS[i];
    }
    return { name: name, initials: name.slice(0,2).toUpperCase(), color: '#888', icon: name };
  }

  function renderKanban() {
    var orders = getOrders();
    var statusMap = { new: 'new', preparing: 'preparing', outForDelivery: 'outForDelivery' };
    var columns = document.querySelectorAll('.col-span-12\\.lg\\:col-span-8 .grid.grid-cols-1\\.md\\:grid-cols-3 > div');
    if (!columns || columns.length < 3) return;

    var colKeys = ['new', 'preparing', 'outForDelivery'];
    colKeys.forEach(function(key, idx) {
      var col = columns[idx];
      if (!col) return;
      var cardContainer = col.querySelector('.p-4\\.space-y-4');
      var badge = col.querySelector('.bg-primary-container\\.rounded-full');
      var filtered = orders.filter(function(o) { return o.status === key; });
      if (badge) badge.textContent = filtered.length;
      if (!cardContainer) return;
      cardContainer.innerHTML = '';
      filtered.forEach(function(order) {
        var pi = getPlatformInfo(order.platform);
        var elapsed = timeElapsed(order.status === 'outForDelivery' ? order.deliveredAt : (order.status === 'preparing' ? order.prepStart : order.createdAt));
        var card = document.createElement('div');
        card.className = 'bg-surface-container-lowest border border-outline-variant rounded-lg p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-transform cursor-pointer';
        card.setAttribute('data-order-id', order.id);
        card.innerHTML = '<div class="flex justify-between items-start mb-3"><div class="flex items-center gap-2"><div class="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold" style="background:' + pi.color + '">' + pi.initials + '</div><span class="text-data-mono font-data-mono text-on-surface font-bold">' + order.customerName + '</span></div><span class="bg-surface-container-high text-label-md font-label-md px-2 py-1 rounded-md flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">' + (order.status === 'outForDelivery' ? 'moped' : 'timer') + '</span> ' + elapsed + '</span></div><div class="text-body-sm font-body-sm text-on-surface-variant mb-2">' + order.items.join(', ') + '</div><div class="flex justify-between items-center"><span class="text-data-mono font-data-mono text-primary font-bold">' + Utils.formatCurrency(order.total) + '</span><span class="text-label-md font-label-md text-on-surface-variant">' + order.platform + '</span></div>';
        card.addEventListener('click', function() { showOrderDetail(order.id); });
        cardContainer.appendChild(card);
      });
    });

    renderAnalytics(orders);
  }

  function renderAnalytics(orders) {
    var volContainer = document.querySelector('.space-y-5');
    if (volContainer) {
      volContainer.innerHTML = '';
      var counts = {};
      orders.forEach(function(o) { counts[o.platform] = (counts[o.platform] || 0) + 1; });
      var total = orders.length || 1;
      var sorted = Object.keys(counts).sort(function(a, b) { return counts[b] - counts[a]; });
      sorted.forEach(function(name) {
        var pct = Math.round(counts[name] / total * 100);
        var pi = getPlatformInfo(name);
        var div = document.createElement('div');
        div.className = 'flex items-center justify-between';
        div.innerHTML = '<div class="flex items-center gap-3"><div class="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center text-[11px] font-bold">' + pi.initials + '</div><span class="text-body-md font-body-md text-on-surface-variant">' + name + '</span></div><div class="flex items-center gap-3 w-1/2"><div class="h-2 bg-primary-container rounded-full" style="width:' + pct + '%;"></div><span class="text-data-mono font-data-mono text-on-surface">' + pct + '%</span></div>';
        volContainer.appendChild(div);
      });
    }

    var prepGrid = document.querySelector('.grid.grid-cols-2\\.gap-4');
    if (prepGrid) {
      prepGrid.innerHTML = '';
      var prepTimes = {};
      var prepCounts = {};
      orders.forEach(function(o) {
        if (o.status !== 'new' && o.prepStart && o.createdAt) {
          var diff = (new Date(o.prepStart).getTime() - new Date(o.createdAt).getTime()) / 60000;
          if (!prepTimes[o.platform]) { prepTimes[o.platform] = 0; prepCounts[o.platform] = 0; }
          prepTimes[o.platform] += diff;
          prepCounts[o.platform]++;
        }
      });
      var avgTotal = 0, avgCount = 0;
      Object.keys(prepTimes).forEach(function(k) {
        var avg = Math.round(prepTimes[k] / prepCounts[k]);
        avgTotal += prepTimes[k]; avgCount += prepCounts[k];
        var div = document.createElement('div');
        div.className = 'bg-surface p-4 rounded-lg border border-outline-variant text-center';
        div.innerHTML = '<span class="block text-label-md font-label-md text-on-surface-variant mb-1">' + k + '</span><span class="text-headline-md font-headline-md text-primary">' + avg + 'm</span>';
        prepGrid.appendChild(div);
      });
      var overall = avgCount ? Math.round(avgTotal / avgCount) : 0;
      var div = document.createElement('div');
      div.className = 'bg-surface p-4 rounded-lg border border-outline-variant text-center col-span-2';
      div.innerHTML = '<span class="block text-label-md font-label-md text-on-surface-variant mb-1">Global Average</span><span class="text-display-lg font-display-lg text-on-surface">' + overall + 'm</span>';
      prepGrid.appendChild(div);
    }
  }

  function showOrderDetail(orderId) {
    var orders = getOrders();
    var order = null;
    for (var i = 0; i < orders.length; i++) {
      if (orders[i].id === orderId) { order = orders[i]; break; }
    }
    if (!order) return;
    var pi = getPlatformInfo(order.platform);
    var statusLabels = { new: '🆕 New', preparing: '👨‍🍳 Preparing', outForDelivery: '🛵 Out for Delivery' };
    var statusActions = { new: 'preparing', preparing: 'outForDelivery', outForDelivery: 'outForDelivery' };
    var btnHtml = '';
    if (order.status !== 'outForDelivery') {
      var nextLabel = order.status === 'new' ? 'Move to Preparing' : 'Mark as Out for Delivery';
      btnHtml = '<button class="mt-3 w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700" id="order-status-btn">' + nextLabel + '</button>';
    }
    Utils.modal({
      title: 'Order Details - ' + order.customerName,
      content: '<div class="space-y-3"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold" style="background:' + pi.color + '">' + pi.initials + '</div><div><p class="font-semibold">' + order.platform + '</p><p class="text-sm text-gray-500">' + (statusLabels[order.status] || order.status) + '</p></div></div><hr><div><p class="font-semibold mb-1">Items:</p><ul class="list-disc list-inside text-sm text-gray-600">' + order.items.map(function(it) { return '<li>' + it + '</li>'; }).join('') + '</ul></div><div class="flex justify-between"><span class="text-gray-500">Total:</span><span class="font-bold">' + Utils.formatCurrency(order.total) + '</span></div><div class="flex justify-between"><span class="text-gray-500">Created:</span><span>' + Utils.formatDate(order.createdAt) + '</span></div>' + (order.prepStart ? '<div class="flex justify-between"><span class="text-gray-500">Prep Started:</span><span>' + Utils.formatDate(order.prepStart) + '</span></div>' : '') + btnHtml + '</div>',
      onConfirm: function() { /* handled by button */ }
    });
    setTimeout(function() {
      var btn = document.getElementById('order-status-btn');
      if (btn) {
        btn.addEventListener('click', function() {
          var updated = getOrders();
          for (var j = 0; j < updated.length; j++) {
            if (updated[j].id === orderId) {
              if (updated[j].status === 'new') {
                updated[j].status = 'preparing';
                updated[j].prepStart = new Date().toISOString();
              } else if (updated[j].status === 'preparing') {
                updated[j].status = 'outForDelivery';
                updated[j].deliveredAt = new Date().toISOString();
              }
              break;
            }
          }
          saveOrders(updated);
          var overlay = document.getElementById('modal-overlay');
          if (overlay) overlay.remove();
          renderKanban();
          Utils.notify('Status updated');
        });
      }
    }, 50);
  }

  function addRefreshButton() {
    var header = document.querySelector('.col-span-12\\.lg\\:col-span-8 h2');
    if (!header) return;
    if (document.getElementById('refresh-orders-btn')) return;
    var btn = document.createElement('button');
    btn.id = 'refresh-orders-btn';
    btn.className = 'bg-primary-container text-on-primary text-label-md font-label-md py-2 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1';
    btn.innerHTML = '<span class="material-symbols-outlined text-[18px]">refresh</span> Refresh';
    btn.addEventListener('click', function() { renderKanban(); Utils.notify('Orders refreshed', 'info'); });
    header.parentNode.style.display = 'flex';
    header.parentNode.style.justifyContent = 'space-between';
    header.parentNode.style.alignItems = 'center';
    header.parentNode.appendChild(btn);
  }

  function addTimerBadge() {
    var header = document.querySelector('.col-span-12\\.lg\\:col-span-8 h2');
    if (!header || document.getElementById('auto-refresh-badge')) return;
    var badge = document.createElement('span');
    badge.id = 'auto-refresh-badge';
    badge.className = 'text-label-md font-label-md text-on-surface-variant ml-3';
    badge.textContent = '⏱ auto-refresh 30s';
    header.parentNode.appendChild(badge);
  }

  // Global variables for inline script compatibility
  window.deliveryOrders = { new: [], preparing: [], outForDelivery: [] };
  window.channelVolume = [];
  window.prepTimes = [];

  document.addEventListener('DOMContentLoaded', function() {
    seed();
    renderKanban();
    addRefreshButton();
    addTimerBadge();
    setInterval(function() { renderKanban(); }, 30000);
  });
})();
