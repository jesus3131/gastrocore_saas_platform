document.addEventListener('DOMContentLoaded', function () {
  const STORAGE_KEY = 'analytics_data';
  const BRANCHES = ['Downtown Flagship', 'Westside Plaza', 'Airport Terminal C', 'Southcenter Mall', 'Northville Strip'];
  const BRANCH_INITS = { 'Downtown Flagship': 'DT', 'Westside Plaza': 'WP', 'Airport Terminal C': 'AP', 'Southcenter Mall': 'SO', 'Northville Strip': 'NV' };
  const CATEGORIES = ['Appetizers', 'Mains', 'Desserts', 'Beverages', 'Salads & Soups'];
  const MENU_ITEMS = [
    { name: 'Caesar Salad', category: 'Salads & Soups', price: 12.50, cost: 4.00 },
    { name: 'Beef Tenderloin', category: 'Mains', price: 42.00, cost: 16.80 },
    { name: 'Truffle Fries', category: 'Appetizers', price: 14.00, cost: 3.50 },
    { name: 'House Burger', category: 'Mains', price: 18.50, cost: 6.20 },
    { name: 'Chocolate Lava Cake', category: 'Desserts', price: 11.00, cost: 3.30 },
    { name: 'Signature Cocktail', category: 'Beverages', price: 16.00, cost: 4.00 },
    { name: 'Caprese Salad', category: 'Salads & Soups', price: 13.00, cost: 4.50 },
    { name: 'Grilled Salmon', category: 'Mains', price: 32.00, cost: 12.80 },
    { name: 'Bruschetta', category: 'Appetizers', price: 10.50, cost: 2.80 },
    { name: 'Tiramisu', category: 'Desserts', price: 9.50, cost: 2.80 },
    { name: 'Red Wine Glass', category: 'Beverages', price: 11.00, cost: 3.30 },
    { name: 'French Onion Soup', category: 'Salads & Soups', price: 10.00, cost: 3.00 },
    { name: 'Ribeye Steak', category: 'Mains', price: 45.00, cost: 18.00 },
    { name: 'Calamari', category: 'Appetizers', price: 13.50, cost: 4.00 },
    { name: 'Panna Cotta', category: 'Desserts', price: 8.50, cost: 2.50 },
    { name: 'Craft Beer', category: 'Beverages', price: 8.00, cost: 2.40 },
    { name: 'Lobster Bisque', category: 'Salads & Soups', price: 14.50, cost: 5.00 },
    { name: 'Chicken Parmesan', category: 'Mains', price: 21.00, cost: 7.50 },
    { name: 'Shrimp Cocktail', category: 'Appetizers', price: 16.00, cost: 6.00 },
    { name: 'Cheesecake', category: 'Desserts', price: 10.00, cost: 3.00 },
    { name: 'Espresso Martini', category: 'Beverages', price: 14.00, cost: 3.50 },
    { name: 'Greek Salad', category: 'Salads & Soups', price: 11.50, cost: 3.80 },
    { name: 'Lamb Chops', category: 'Mains', price: 38.00, cost: 15.20 },
    { name: 'Nachos', category: 'Appetizers', price: 12.00, cost: 3.50 },
    { name: 'Crème Brûlée', category: 'Desserts', price: 9.00, cost: 2.50 }
  ];

  function generateOrders(count) {
    const orders = [];
    const now = new Date();
    for (let i = 0; i < count; i++) {
      const orderDate = new Date(now);
      orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30));
      orderDate.setHours(Math.floor(Math.random() * 14) + 8, Math.floor(Math.random() * 60));
      const branch = BRANCHES[Math.floor(Math.random() * BRANCHES.length)];
      const itemCount = Math.floor(Math.random() * 4) + 1;
      const items = [];
      let total = 0;
      for (let j = 0; j < itemCount; j++) {
        const mi = MENU_ITEMS[Math.floor(Math.random() * MENU_ITEMS.length)];
        const qty = Math.floor(Math.random() * 3) + 1;
        items.push({ name: mi.name, category: mi.category, price: mi.price, cost: mi.cost, qty: qty });
        total += mi.price * qty;
      }
      const custId = 'C' + String(Math.floor(Math.random() * 200) + 1).padStart(4, '0');
      orders.push({ id: Utils.uid(), date: orderDate.toISOString(), branch, customer: custId, items, total: Math.round(total * 100) / 100 });
    }
    orders.sort((a, b) => new Date(a.date) - new Date(b.date));
    return orders;
  }

  function loadData() {
    let data = Utils.storage.get(STORAGE_KEY);
    if (!data || !data.orders || data.orders.length < 50) {
      data = { orders: generateOrders(55), menuItems: MENU_ITEMS };
      Utils.storage.set(STORAGE_KEY, data);
    }
    return data;
  }

  function saveData(data) {
    Utils.storage.set(STORAGE_KEY, data);
  }

  function getWeekNumber(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    return Math.min(Math.floor(diff / 7), 3);
  }

  function computeMetrics(orders, dateFrom, dateTo) {
    const filtered = orders.filter(o => {
      const d = o.date.slice(0, 10);
      return (!dateFrom || d >= dateFrom) && (!dateTo || d <= dateTo);
    });
    const totalRevenue = filtered.reduce((s, o) => s + o.total, 0);
    const totalOrders = filtered.length;
    const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const uniqueCust = new Set(filtered.map(o => o.customer)).size;
    const totalCost = filtered.reduce((s, o) => s + o.items.reduce((c, it) => c + it.cost * it.qty, 0), 0);
    return { totalRevenue, totalOrders, avgOrder, uniqueCust, totalCost, profit: totalRevenue - totalCost };
  }

  function computeWeekly(orders) {
    const weekly = [{ label: 'W1', budget: 0, actual: 0 }, { label: 'W2', budget: 0, actual: 0 }, { label: 'W3', budget: 0, actual: 0 }, { label: 'W4', budget: 0, actual: 0 }];
    const now = new Date();
    orders.forEach(o => {
      const wk = getWeekNumber(o.date);
      if (wk >= 0 && wk < 4) weekly[wk].actual += o.total;
    });
    const totalRev = weekly.reduce((s, w) => s + w.actual, 0);
    weekly.forEach(w => {
      const base = totalRev / 4;
      const variance = (Math.random() - 0.5) * base * 0.4;
      w.budget = Math.round((base + variance) * 100) / 100;
    });
    const maxVal = Math.max(...weekly.map(w => Math.max(w.actual, w.budget)), 1);
    weekly.forEach(w => { w.pctActual = Math.round((w.actual / maxVal) * 100); w.pctBudget = Math.round((w.budget / maxVal) * 100); });
    return weekly;
  }

  function computeLeaderboard(orders) {
    const byBranch = {};
    orders.forEach(o => {
      if (!byBranch[o.branch]) byBranch[o.branch] = { revenue: 0, orders: 0, cost: 0 };
      byBranch[o.branch].revenue += o.total;
      byBranch[o.branch].orders += 1;
      byBranch[o.branch].cost += o.items.reduce((c, it) => c + it.cost * it.qty, 0);
    });
    const target = BRANCHES.reduce((s, b) => s + (byBranch[b] ? byBranch[b].revenue : 0), 0) / BRANCHES.length;
    return BRANCHES.map(b => {
      const d = byBranch[b] || { revenue: 0, orders: 0, cost: 0 };
      const pctTarget = target > 0 ? ((d.revenue - target) / target * 100) : 0;
      const margin = d.revenue > 0 ? (d.revenue - d.cost) / d.revenue * 100 : 0;
      return { initials: BRANCH_INITS[b], name: b, revenue: d.revenue, vsTarget: pctTarget, margin, pos: pctTarget >= 0 };
    }).sort((a, b) => b.revenue - a.revenue);
  }

  function predictNextHour(orders) {
    const now = new Date();
    const currentHour = now.getHours();
    const hourBuckets = {};
    for (let h = 8; h <= 22; h++) hourBuckets[h] = { count: 0, revenue: 0, items: {} };
    orders.forEach(o => {
      const d = new Date(o.date);
      const h = d.getHours();
      if (hourBuckets[h]) { hourBuckets[h].count++; hourBuckets[h].revenue += o.total;
        o.items.forEach(it => { if (!hourBuckets[h].items[it.name]) hourBuckets[h].items[it.name] = 0; hourBuckets[h].items[it.name] += it.qty; }); }
    });
    const targetHour = currentHour < 8 ? 8 : (currentHour > 22 ? 22 : currentHour);
    const hist = hourBuckets[targetHour] || { count: 0, revenue: 0, items: {} };
    const dayOfWeek = now.getDay();
    const dayMultiplier = (dayOfWeek >= 5 ? 1.3 : dayOfWeek === 0 ? 0.7 : 1.0);
    const forecastOrders = Math.max(1, Math.round(hist.count * dayMultiplier * (1 + (Math.random() - 0.5) * 0.3)));
    const avgRevenue = hist.count > 0 ? hist.revenue / hist.count : 40;
    const topItems = Object.entries(hist.items).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, qty]) => ({ name, qty: Math.round(qty / Math.max(1, hist.count) * forecastOrders) }));
    if (topItems.length === 0) {
      const defaults = MENU_ITEMS.slice(0, 3);
      defaults.forEach(d => topItems.push({ name: d.name, qty: Math.floor(forecastOrders * 0.5) }));
    }
    return { forecastOrders, forecastRevenue: Utils.formatCurrency ? forecastOrders * avgRevenue : (forecastOrders * avgRevenue).toFixed(2), topItems };
  }

  function renderDashboard() {
    const data = loadData();
    let dateFrom = '', dateTo = '';
    const container = document.querySelector('.max-w-container-max') || document.querySelector('main > div') || document.querySelector('main') || document.body;
    if (container.closest('.max-w-container-max')) container.innerHTML = '';
    else {
      const wrapper = container.querySelector('.max-w-container-max') || container;
      wrapper.innerHTML = '';
    }

    const root = container.closest('.max-w-container-max') || container.querySelector('.max-w-container-max') || container;
    root.innerHTML = `
      <div class="p-4 md:p-lg lg:p-xl" style="max-width:1440px;margin:0 auto;width:100%">
        <div class="flex flex-col md:flex-row md:items-center justify-between mb-xl gap-4">
          <div>
            <h2 class="font-headline-lg text-on-surface" style="font-size:32px;font-weight:600">Business Intelligence Dashboard</h2>
            <p class="font-body-md text-on-surface-variant mt-xs">Enterprise Performance Overview</p>
          </div>
          <div class="flex flex-wrap items-center gap-md">
            <div class="flex items-center bg-surface-container-lowest border border-outline-variant rounded-lg p-xs">
              <span class="material-symbols-outlined text-on-surface-variant mr-xs" style="font-size:20px">calendar_today</span>
              <select id="bd-date-filter" class="bg-transparent border-none font-body-sm text-body-sm text-on-surface py-0 pl-0 pr-xl cursor-pointer" style="outline:none">
                <option value="30">Last 30 Days</option>
                <option value="7">Last 7 Days</option>
                <option value="90">This Quarter</option>
                <option value="0">Year to Date</option>
              </select>
            </div>
            <button id="bd-refetch" class="flex items-center px-md py-sm border border-outline bg-transparent text-secondary font-label-md rounded-lg hover:bg-surface-container-low transition-colors">
              <span class="material-symbols-outlined mr-xs" style="font-size:18px">refresh</span> Refresh Data
            </button>
            <button id="bd-add-order-btn" class="flex items-center px-md py-sm border border-outline bg-transparent text-secondary font-label-md rounded-lg hover:bg-surface-container-low transition-colors">
              <span class="material-symbols-outlined mr-xs" style="font-size:18px">add</span> Add Order
            </button>
          </div>
        </div>
        <div id="bd-kpi-row" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-md md:gap-lg mb-xl"></div>
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-lg">
          <div class="lg:col-span-8 flex flex-col gap-lg">
            <div id="bd-chart-card" class="bg-surface-container-lowest border border-surface-container-high rounded-xl overflow-hidden"></div>
            <div id="bd-leaderboard-card" class="bg-surface-container-lowest border border-surface-container-high rounded-xl overflow-hidden"></div>
          </div>
          <div id="bd-insights" class="lg:col-span-4"></div>
        </div>
      </div>
    `;

    const contentRoot = root.querySelector('.p-4') || root.firstElementChild;

    function refresh() {
      const filterVal = document.getElementById('bd-date-filter').value;
      const now = new Date();
      if (filterVal === '30') { dateFrom = new Date(now.getTime() - 30 * 86400000).toISOString().slice(0, 10); dateTo = now.toISOString().slice(0, 10); }
      else if (filterVal === '7') { dateFrom = new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10); dateTo = now.toISOString().slice(0, 10); }
      else if (filterVal === '90') { dateFrom = new Date(now.getTime() - 90 * 86400000).toISOString().slice(0, 10); dateTo = now.toISOString().slice(0, 10); }
      else { dateFrom = now.getFullYear() + '-01-01'; dateTo = now.toISOString().slice(0, 10); }

      const orders = (Utils.storage.get(STORAGE_KEY) || data).orders;
      const filtered = orders.filter(o => {
        const d = o.date.slice(0, 10);
        return d >= dateFrom && d <= dateTo;
      });
      const metrics = computeMetrics(filtered, '', '');
      const weekly = computeWeekly(filtered);
      const leaderboard = computeLeaderboard(filtered);
      const profit = metrics.totalRevenue - metrics.totalCost;

      document.getElementById('bd-kpi-row').innerHTML = `
        <div class="bg-surface-container-lowest border border-surface-container-high rounded-xl p-md flex flex-col justify-between hover:-translate-y-px transition-transform duration-200">
          <div class="flex justify-between items-start mb-md"><span class="font-body-sm text-body-sm text-on-surface-variant">Total System Revenue</span><span class="material-symbols-outlined text-primary" style="font-size:20px">payments</span></div>
          <div class="flex items-baseline gap-sm"><span class="font-headline-lg text-on-surface font-data-mono">${Utils.formatCurrency(metrics.totalRevenue)}</span></div>
        </div>
        <div class="bg-surface-container-lowest border border-surface-container-high rounded-xl p-md flex flex-col justify-between hover:-translate-y-px transition-transform duration-200">
          <div class="flex justify-between items-start mb-md"><span class="font-body-sm text-body-sm text-on-surface-variant">Avg. Order Value</span><span class="material-symbols-outlined text-secondary" style="font-size:20px">receipt_long</span></div>
          <div class="flex items-baseline gap-sm"><span class="font-headline-lg text-on-surface font-data-mono">${Utils.formatCurrency(metrics.avgOrder)}</span></div>
        </div>
        <div class="bg-surface-container-lowest border border-surface-container-high rounded-xl p-md flex flex-col justify-between hover:-translate-y-px transition-transform duration-200">
          <div class="flex justify-between items-start mb-md"><span class="font-body-sm text-body-sm text-on-surface-variant">Total Orders</span><span class="material-symbols-outlined text-secondary" style="font-size:20px">receipt</span></div>
          <div class="flex items-baseline gap-sm"><span class="font-headline-lg text-on-surface font-data-mono">${metrics.totalOrders}</span></div>
        </div>
        <div class="bg-surface-container-lowest border border-surface-container-high rounded-xl p-md flex flex-col justify-between hover:-translate-y-px transition-transform duration-200">
          <div class="flex justify-between items-start mb-md"><span class="font-body-sm text-body-sm text-on-surface-variant">Active Customers</span><span class="material-symbols-outlined text-primary" style="font-size:20px">group</span></div>
          <div class="flex items-baseline gap-sm"><span class="font-headline-lg text-on-surface font-data-mono">${metrics.uniqueCust}</span></div>
        </div>
      `;

      const maxBar = Math.max(...weekly.map(w => Math.max(w.pctActual, w.pctBudget)), 10);
      document.getElementById('bd-chart-card').innerHTML = `
        <div class="bg-surface-container-low px-md py-sm border-b border-surface-container-high flex justify-between items-center">
          <h3 class="font-headline-md text-on-surface" style="font-size:24px;font-weight:600">Revenue vs. Budget (${weekly[0].label}-${weekly[3].label})</h3>
        </div>
        <div class="p-md" style="height:300px">
          <div class="flex items-end justify-between px-xl h-full relative">
            <div class="absolute left-0 top-0 bottom-0 flex flex-col justify-between font-label-md text-label-md text-on-surface-variant text-right pr-2" style="width:60px">
              <span>${Utils.formatCurrency(maxBar * 1000)}</span>
              <span>${Utils.formatCurrency(maxBar * 600)}</span>
              <span>${Utils.formatCurrency(maxBar * 200)}</span>
              <span>$0</span>
            </div>
            ${weekly.map((w, i) => `
              <div class="flex flex-col items-center justify-end h-full" style="width:16%;margin-left:${i === 0 ? '70px' : '0'}">
                <div class="w-full bg-primary-fixed-dim rounded-t-sm transition-all" style="height:${Math.max(w.pctBudget, 2)}%;opacity:0.7"></div>
                <div class="w-2 bg-primary rounded-full z-10 shadow-sm transition-all" style="height:${Math.max(w.pctActual, 2)}%"></div>
                <span class="font-label-md text-label-md text-on-surface-variant mt-2">${w.label}</span>
              </div>
            `).join('')}
            <div class="absolute top-0 right-0 flex gap-md bg-surface-container-lowest/80 p-sm rounded border border-outline-variant/30" style="font-size:12px">
              <div class="flex items-center gap-xs"><div class="w-3 h-3 bg-primary rounded-full"></div><span>Actual</span></div>
              <div class="flex items-center gap-xs"><div class="w-3 h-3 bg-primary-fixed-dim rounded-sm"></div><span>Budget</span></div>
            </div>
          </div>
        </div>
      `;

      document.getElementById('bd-leaderboard-card').innerHTML = `
        <div class="bg-surface-container-low px-md py-sm border-b border-surface-container-high flex justify-between items-center">
          <h3 class="font-headline-md text-on-surface" style="font-size:24px;font-weight:600">Unit Performance Leaderboard</h3>
          <div class="flex gap-2">
            <button class="px-3 py-1 bg-primary text-on-primary rounded font-label-md">Top 5 (Rev)</button>
            <button class="px-3 py-1 bg-surface border border-outline text-on-surface rounded font-label-md">Sorted by Revenue</button>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-surface-bright border-b border-surface-container-high">
              <tr>
                <th class="px-md py-sm font-label-md text-label-md text-on-surface-variant">Branch</th>
                <th class="px-md py-sm font-label-md text-label-md text-on-surface-variant text-right">Revenue</th>
                <th class="px-md py-sm font-label-md text-label-md text-on-surface-variant text-right">Vs Target</th>
                <th class="px-md py-sm font-label-md text-label-md text-on-surface-variant text-right">Margin</th>
                <th class="px-md py-sm font-label-md text-label-md text-on-surface-variant text-center">Orders</th>
              </tr>
            </thead>
            <tbody class="font-body-sm text-body-sm text-on-surface font-data-mono">
              ${leaderboard.map((lb, idx) => `
                <tr class="border-b border-surface-container-high hover:bg-surface-container-low transition-colors ${idx % 2 === 0 ? 'bg-surface-container-lowest' : ''}">
                  <td class="px-md py-sm font-body-sm font-medium flex items-center gap-sm">
                    <div class="w-8 h-8 rounded bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs">${lb.initials}</div>
                    ${lb.name}
                  </td>
                  <td class="px-md py-sm text-right">${Utils.formatCurrency(lb.revenue)}</td>
                  <td class="px-md py-sm text-right ${lb.pos ? 'text-on-tertiary-container' : 'text-on-surface-variant'}">${lb.pos ? '+' : ''}${lb.vsTarget.toFixed(1)}%</td>
                  <td class="px-md py-sm text-right">${lb.margin.toFixed(1)}%</td>
                  <td class="px-md py-sm text-center">${filtered.filter(o => o.branch === lb.name).length}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      const prediction = predictNextHour(filtered);
      document.getElementById('bd-insights').innerHTML = `
        <div class="bg-primary text-on-primary rounded-xl overflow-hidden flex flex-col shadow-lg relative" style="min-height:300px">
          <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image:radial-gradient(circle at 100% 0%, #fff 0%, transparent 50%),radial-gradient(circle at 0% 100%, #fff 0%, transparent 50%)"></div>
          <div class="p-md border-b border-on-primary/10 flex items-center gap-sm z-10">
            <span class="material-symbols-outlined">lightbulb</span>
            <h3 class="font-headline-md">AI Executive Insights</h3>
            <span class="font-label-md bg-on-primary/20 px-2 py-1 rounded ml-auto">Live</span>
          </div>
          <div class="p-md flex-grow flex flex-col gap-md z-10 overflow-y-auto">
            <div class="bg-surface-container-lowest/10 backdrop-blur-sm p-sm rounded-lg border border-on-primary/20 flex gap-sm items-start">
              <span class="material-symbols-outlined text-tertiary-fixed mt-1">auto_awesome</span>
              <div><h4 class="font-body-md font-semibold mb-1">AI Predictive Ordering</h4>
              <p class="font-body-sm text-on-primary/80">Next hour forecast: <strong>${prediction.forecastOrders} orders</strong> ~${Utils.formatCurrency(prediction.forecastRevenue)}</p>
              <p class="font-body-sm text-on-primary/60 mt-1">Top prep: <strong>${prediction.topItems.slice(0, 3).map(i => i.name).join(', ')}</strong></p></div>
            </div>
            <div class="bg-surface-container-lowest/10 backdrop-blur-sm p-sm rounded-lg border border-on-primary/20 flex gap-sm items-start">
              <span class="material-symbols-outlined text-error-container mt-1">warning</span>
              <div><h4 class="font-body-md font-semibold mb-1">Revenue Analysis</h4>
              <p class="font-body-sm text-on-primary/80">Total revenue ${Utils.formatCurrency(metrics.totalRevenue)} across ${metrics.totalOrders} orders. Avg ticket ${Utils.formatCurrency(metrics.avgOrder)}.</p></div>
            </div>
            <div class="bg-surface-container-lowest/10 backdrop-blur-sm p-sm rounded-lg border border-on-primary/20 flex gap-sm items-start">
              <span class="material-symbols-outlined text-tertiary-fixed mt-1">stars</span>
              <div><h4 class="font-body-md font-semibold mb-1">Top Performer</h4>
              <p class="font-body-sm text-on-primary/80">${leaderboard[0] ? leaderboard[0].name : 'N/A'} leads with ${Utils.formatCurrency(leaderboard[0] ? leaderboard[0].revenue : 0)} in revenue.</p></div>
            </div>
            <div class="bg-surface-container-lowest/10 backdrop-blur-sm p-sm rounded-lg border border-on-primary/20 flex gap-sm items-start">
              <span class="material-symbols-outlined text-secondary-fixed mt-1">info</span>
              <div><h4 class="font-body-md font-semibold mb-1">Profit Margin</h4>
              <p class="font-body-sm text-on-primary/80">Net profit ${Utils.formatCurrency(profit)} (${metrics.totalRevenue > 0 ? (profit / metrics.totalRevenue * 100).toFixed(1) : 0}% margin).</p></div>
            </div>
          </div>
        </div>
      `;
    }

    refresh();

    document.getElementById('bd-date-filter').addEventListener('change', refresh);
    document.getElementById('bd-refetch').addEventListener('click', function () {
      const newData = { orders: generateOrders(55), menuItems: MENU_ITEMS };
      saveData(newData);
      Utils.notify('Data regenerated successfully', 'success');
      refresh();
    });
    document.getElementById('bd-add-order-btn').addEventListener('click', function () {
      Utils.prompt({
        title: 'Add New Order',
        fields: [
          { name: 'branch', label: 'Branch', type: 'select', options: BRANCHES.map(b => ({ label: b, value: b })) },
          { name: 'customer', label: 'Customer ID', type: 'text' },
          { name: 'total', label: 'Order Total', type: 'number' }
        ],
        onSave: function (vals) {
          const orders = Utils.storage.get(STORAGE_KEY).orders;
          orders.push({
            id: Utils.uid(),
            date: new Date().toISOString(),
            branch: vals.branch,
            customer: vals.customer || 'C' + String(Math.floor(Math.random() * 200) + 1).padStart(4, '0'),
            items: [{ name: 'Custom Item', category: 'Mains', price: parseFloat(vals.total) || 0, cost: (parseFloat(vals.total) || 0) * 0.4, qty: 1 }],
            total: parseFloat(vals.total) || 0
          });
          const data = Utils.storage.get(STORAGE_KEY);
          data.orders = orders;
          saveData(data);
          Utils.notify('Order added', 'success');
          refresh();
        }
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderDashboard);
  else renderDashboard();
});
