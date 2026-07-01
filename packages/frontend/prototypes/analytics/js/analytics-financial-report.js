document.addEventListener('DOMContentLoaded', function () {
  const STORAGE_KEY = 'analytics_data';
  const CATEGORIES = ['Appetizers', 'Mains', 'Desserts', 'Beverages', 'Salads & Soups'];

  const INITIAL_WASTE = [
    { ing: 'Beef Tenderloin', theo: 4250, actual: 4890 },
    { ing: 'Avocado (Case)', theo: 850, actual: 1020 },
    { ing: 'Olive Oil (EVOO)', theo: 620, actual: 695 },
    { ing: 'Chicken Breast', theo: 1200, actual: 1180 },
    { ing: 'Butter Block', theo: 430, actual: 510 },
    { ing: 'Salmon Fillet', theo: 980, actual: 1050 }
  ];

  function loadData() {
    return Utils.storage.get(STORAGE_KEY) || { orders: [], menuItems: [] };
  }

  function saveData(data) {
    Utils.storage.set(STORAGE_KEY, data);
  }

  function loadWasteData() {
    return Utils.storage.get('analytics_waste') || INITIAL_WASTE;
  }

  function saveWasteData(data) {
    Utils.storage.set('analytics_waste', data);
  }

  function computeCategoryMetrics(orders) {
    const cats = {};
    CATEGORIES.forEach(c => { cats[c] = { revenue: 0, cost: 0, count: 0 }; });
    orders.forEach(o => {
      o.items.forEach(it => {
        const cat = it.category || 'Mains';
        if (!cats[cat]) cats[cat] = { revenue: 0, cost: 0, count: 0 };
        cats[cat].revenue += it.price * it.qty;
        cats[cat].cost += it.cost * it.qty;
        cats[cat].count += it.qty;
      });
    });
    return CATEGORIES.map(c => ({
      name: c,
      revenue: cats[c] ? cats[c].revenue : 0,
      cost: cats[c] ? cats[c].cost : 0,
      margin: cats[c] && cats[c].revenue > 0 ? ((cats[c].revenue - cats[c].cost) / cats[c].revenue * 100) : 0,
      count: cats[c] ? cats[c].count : 0
    }));
  }

  function computeBCGItems(orders) {
    const itemStats = {};
    const now = new Date();
    const halfCutoff = new Date(now.getTime() - 15 * 86400000).toISOString();
    orders.forEach(o => {
      o.items.forEach(it => {
        if (!itemStats[it.name]) itemStats[it.name] = { name: it.name, category: it.category || 'Mains', revenue: 0, cost: 0, qty: 0, recent: 0, total: 0 };
        const s = itemStats[it.name];
        s.revenue += it.price * it.qty;
        s.cost += it.cost * it.qty;
        s.qty += it.qty;
        s.total += it.price * it.qty;
        if (o.date >= halfCutoff) s.recent += it.price * it.qty;
      });
    });
    const items = Object.values(itemStats);
    if (items.length === 0) return { stars: [], cashCows: [], questionMarks: [], dogs: [] };
    const avgQty = items.reduce((s, i) => s + i.qty, 0) / items.length;
    const avgGrowth = items.reduce((s, i) => s + (i.recent / (i.total || 1)), 0) / items.length;
    const result = { stars: [], cashCows: [], questionMarks: [], dogs: [] };
    items.forEach(it => {
      const margin = it.revenue > 0 ? (it.revenue - it.cost) / it.revenue : 0;
      const volume = it.qty >= avgQty;
      const growth = (it.recent / (it.total || 1)) >= avgGrowth;
      const obj = { ...it, margin: margin * 100 };
      if (volume && growth) result.stars.push(obj);
      else if (volume && !growth) result.cashCows.push(obj);
      else if (!volume && growth) result.questionMarks.push(obj);
      else result.dogs.push(obj);
    });
    return result;
  }

  function renderReport() {
    const data = loadData();
    const wasteData = loadWasteData();
    const orders = data.orders || [];
    const totalRev = orders.reduce((s, o) => s + o.total, 0);
    const totalCost = orders.reduce((s, o) => s + o.items.reduce((c, it) => c + it.cost * it.qty, 0), 0);
    const profit = totalRev - totalCost;
    const foodCostPct = totalRev > 0 ? (totalCost / totalRev * 100) : 0;
    const totalWaste = wasteData.reduce((s, w) => s + (w.actual - w.theo), 0);
    const wastePct = totalCost > 0 ? (totalWaste / totalCost * 100) : 0;
    const catMetrics = computeCategoryMetrics(orders);
    const bcg = computeBCGItems(orders);

    const container = document.querySelector('.max-w-container-max') || document.querySelector('main') || document.body;
    const mainContent = container.closest('.max-w-container-max') || container.querySelector('.max-w-container-max') || container;
    mainContent.innerHTML = `
      <div style="max-width:1440px;margin:0 auto;width:100%" class="flex flex-col gap-lg md:gap-xl p-md md:p-xl">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-md">
          <div>
            <h2 class="font-headline-lg-mobile md:font-headline-lg text-on-surface mb-xs" style="font-size:32px;font-weight:600">Financial Performance & Profitability</h2>
            <p class="font-body-md text-secondary">Menu Engineering & Variance Analysis</p>
          </div>
          <div class="flex items-center gap-md">
            <button id="fr-add-waste-btn" class="flex items-center gap-sm bg-primary-container text-on-primary-container px-md py-2 rounded-lg font-label-md hover:opacity-90 transition-opacity">
              <span class="material-symbols-outlined" style="font-size:18px">add</span> Add Waste Entry
            </button>
            <button id="fr-refresh-btn" class="flex items-center gap-sm border border-outline text-secondary px-md py-2 rounded-lg font-label-md hover:bg-surface-container-low transition-colors">
              <span class="material-symbols-outlined" style="font-size:18px">refresh</span> Refresh
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-md">
          <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col gap-md shadow-sm hover:-translate-y-px transition-transform">
            <div class="flex justify-between items-start"><span class="font-label-md text-label-md text-secondary uppercase tracking-wider">Gross Revenue</span><span class="material-symbols-outlined text-outline">payments</span></div>
            <div><span class="font-display-lg text-display-lg text-on-surface font-data-mono">${Utils.formatCurrency(totalRev)}</span></div>
          </div>
          <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col gap-md shadow-sm hover:-translate-y-px transition-transform">
            <div class="flex justify-between items-start"><span class="font-label-md text-label-md text-secondary uppercase tracking-wider">Net Profit</span><span class="material-symbols-outlined text-outline">account_balance</span></div>
            <div><span class="font-display-lg text-display-lg text-on-surface font-data-mono ${profit >= 0 ? 'text-on-tertiary-container' : 'text-error'}">${Utils.formatCurrency(profit)}</span></div>
          </div>
          <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col gap-md shadow-sm hover:-translate-y-px transition-transform">
            <div class="flex justify-between items-start"><span class="font-label-md text-label-md text-secondary uppercase tracking-wider">Food Cost %</span><span class="material-symbols-outlined text-outline">kitchen</span></div>
            <div><span class="font-display-lg text-display-lg text-on-surface font-data-mono">${foodCostPct.toFixed(1)}%</span></div>
          </div>
          <div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col gap-md shadow-sm hover:-translate-y-px transition-transform">
            <div class="flex justify-between items-start"><span class="font-label-md text-label-md text-secondary uppercase tracking-wider">Waste %</span><span class="material-symbols-outlined text-outline">delete</span></div>
            <div><span class="font-display-lg text-display-lg text-on-surface font-data-mono ${wastePct > 5 ? 'text-error' : 'text-on-tertiary-container'}">${wastePct.toFixed(1)}%</span></div>
          </div>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-12 gap-lg">
          <div class="xl:col-span-12 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col">
            <div class="bg-surface-container-low px-lg py-md border-b border-outline-variant flex justify-between items-center">
              <h3 class="font-headline-md text-on-surface" style="font-size:18px;font-weight:600">Menu Engineering (BCG Matrix)</h3>
              <div class="flex items-center gap-md font-body-sm text-secondary" style="font-size:12px">
                <span class="flex items-center gap-1"><div class="w-3 h-3 rounded-full" style="background:#1e3a8a"></div> Stars</span>
                <span class="flex items-center gap-1"><div class="w-3 h-3 rounded-full" style="background:#27c38a"></div> Cash Cows</span>
                <span class="flex items-center gap-1"><div class="w-3 h-3 rounded-full" style="background:#b9c7e0"></div> Question Marks</span>
                <span class="flex items-center gap-1"><div class="w-3 h-3 rounded-full" style="background:#ba1a1a"></div> Dogs</span>
              </div>
            </div>
            <div class="p-lg relative" style="height:400px">
              <div class="absolute left-4 top-1/2 -translate-y-1/2 -rotate-90 font-label-md text-label-md text-secondary tracking-widest uppercase origin-center" style="font-size:12px">Profitability (Margin)</div>
              <div class="absolute bottom-4 left-1/2 -translate-x-1/2 font-label-md text-label-md text-secondary tracking-widest uppercase" style="font-size:12px">Popularity (Volume)</div>
              <div class="relative" style="width:85%;height:85%;margin:0 auto;border-left:2px solid #c5c5d3;border-bottom:2px solid #c5c5d3">
                <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div class="w-full h-px border-t border-dashed" style="border-color:#c5c5d3"></div>
                  <div class="h-full w-px border-l border-dashed absolute" style="border-color:#c5c5d3"></div>
                </div>
                <div class="absolute inset-0 grid grid-cols-2 grid-rows-2">
                  <div class="border-r border-b border-outline-variant/30 relative"><span class="absolute top-2 left-2 font-label-md text-secondary opacity-50" style="font-size:12px">Question Marks</span></div>
                  <div class="border-b border-outline-variant/30 relative"><span class="absolute top-2 right-2 font-label-md text-secondary opacity-50" style="font-size:12px">Stars</span></div>
                  <div class="border-r border-outline-variant/30 relative"><span class="absolute bottom-2 left-2 font-label-md text-secondary opacity-50" style="font-size:12px">Dogs</span></div>
                  <div class="relative"><span class="absolute bottom-2 right-2 font-label-md text-secondary opacity-50" style="font-size:12px">Cash Cows</span></div>
                </div>
                ${bcg.stars.map((it, i) => `
                  <div class="absolute flex flex-col items-center group cursor-pointer" style="top:${15 + i * 12}%;right:${10 + i * 8}%;z-index:10">
                    <div class="w-4 h-4 rounded-full shadow-md ring-4 ring-primary-container/20 group-hover:scale-125 transition-transform" style="background:#1e3a8a"></div>
                    <span class="mt-1 font-body-sm text-on-surface bg-surface-container-lowest px-2 py-0.5 rounded border border-outline-variant shadow-sm absolute top-5 whitespace-nowrap z-20 hidden group-hover:block" style="font-size:11px">${it.name}</span>
                  </div>
                `).join('')}
                ${bcg.cashCows.map((it, i) => `
                  <div class="absolute flex flex-col items-center group cursor-pointer" style="bottom:${20 + i * 12}%;right:${10 + i * 8}%;z-index:10">
                    <div class="w-4 h-4 rounded-full shadow-md ring-4 ring-tertiary-fixed-dim/30 group-hover:scale-125 transition-transform" style="background:#27c38a"></div>
                    <span class="mt-1 font-body-sm text-on-surface bg-surface-container-lowest px-2 py-0.5 rounded border border-outline-variant shadow-sm absolute bottom-5 whitespace-nowrap z-20 hidden group-hover:block" style="font-size:11px">${it.name}</span>
                  </div>
                `).join('')}
                ${bcg.questionMarks.map((it, i) => `
                  <div class="absolute flex flex-col items-center group cursor-pointer" style="top:${15 + i * 15}%;left:${10 + i * 8}%;z-index:10">
                    <div class="w-3 h-3 rounded-full shadow-md ring-4 ring-secondary-fixed-dim/30 group-hover:scale-125 transition-transform" style="background:#b9c7e0"></div>
                    <span class="mt-1 font-body-sm text-on-surface bg-surface-container-lowest px-2 py-0.5 rounded border border-outline-variant shadow-sm absolute top-4 whitespace-nowrap z-20 hidden group-hover:block" style="font-size:11px">${it.name}</span>
                  </div>
                `).join('')}
                ${bcg.dogs.map((it, i) => `
                  <div class="absolute flex flex-col items-center group cursor-pointer" style="bottom:${20 + i * 15}%;left:${10 + i * 8}%;z-index:10">
                    <div class="w-2 h-2 rounded-full shadow-md ring-4 ring-error/30 group-hover:scale-125 transition-transform" style="background:#ba1a1a"></div>
                    <span class="mt-1 font-body-sm text-on-surface bg-surface-container-lowest px-2 py-0.5 rounded border border-outline-variant shadow-sm absolute bottom-3 whitespace-nowrap z-20 hidden group-hover:block" style="font-size:11px">${it.name}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <div class="xl:col-span-5 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col">
            <div class="bg-surface-container-low px-lg py-md border-b border-outline-variant flex justify-between items-center">
              <h3 class="font-headline-md text-on-surface" style="font-size:18px;font-weight:600">Revenue & Cost by Category</h3>
            </div>
            <div class="p-lg flex-1 flex flex-col justify-center gap-md">
              ${catMetrics.map(cm => {
                const pct = catMetrics.reduce((s, c) => s + c.revenue, 0) > 0 ? (cm.revenue / catMetrics.reduce((s, c) => s + c.revenue, 0) * 100) : 0;
                return `
                  <div class="w-full">
                    <div class="flex justify-between font-body-sm mb-xs">
                      <span class="font-medium">${cm.name}</span>
                      <span class="font-data-mono">${cm.margin.toFixed(0)}% Margin</span>
                    </div>
                    <div class="w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
                      <div class="h-full rounded-full transition-all" style="width:${Math.max(pct, 2)}%;background:${['#1e3a8a','#27c38a','#b9c7e0','#ba1a1a','#d5e3fd'][catMetrics.indexOf(cm) % 5]}"></div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div class="xl:col-span-7 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col">
            <div class="bg-surface-container-low px-lg py-md border-b border-outline-variant flex justify-between items-center">
              <h3 class="font-headline-md text-on-surface" style="font-size:18px;font-weight:600">Waste & Variance Report</h3>
              <span class="bg-error-container text-on-error-container px-2 py-1 rounded font-label-md uppercase tracking-wider" style="font-size:11px">Top Impacts</span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-surface-bright border-b border-outline-variant text-secondary font-label-md uppercase tracking-wider" style="font-size:11px">
                    <th class="px-md py-sm font-semibold">Ingredient</th>
                    <th class="px-md py-sm font-semibold text-right">Theo Cost</th>
                    <th class="px-md py-sm font-semibold text-right">Actual Cost</th>
                    <th class="px-md py-sm font-semibold text-center">Variance %</th>
                    <th class="px-md py-sm font-semibold text-right">Financial Impact</th>
                    <th class="px-md py-sm font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody class="font-body-sm">
                  ${wasteData.map((w, idx) => {
                    const varPct = w.theo > 0 ? ((w.actual - w.theo) / w.theo * 100) : 0;
                    const impact = w.theo - w.actual;
                    const pos = impact >= 0;
                    return `
                      <tr class="border-b border-outline-variant/30 hover:bg-surface-container-highest/50 transition-colors">
                        <td class="px-md py-sm font-medium text-on-surface">${w.ing}</td>
                        <td class="px-md py-sm font-data-mono text-right">${Utils.formatCurrency(w.theo)}</td>
                        <td class="px-md py-sm font-data-mono text-right">${Utils.formatCurrency(w.actual)}</td>
                        <td class="px-md py-sm text-center">
                          <span class="inline-flex items-center gap-1 ${pos ? 'bg-tertiary-container/10 text-on-tertiary-container' : 'bg-error-container/50 text-error'} px-2 py-0.5 rounded font-data-mono" style="font-size:12px">
                            <span class="material-symbols-outlined" style="font-size:14px">${pos ? 'trending_down' : 'trending_up'}</span> ${Math.abs(varPct).toFixed(1)}%
                          </span>
                        </td>
                        <td class="px-md py-sm font-data-mono text-right ${pos ? 'text-on-tertiary-container' : 'text-error'}">${pos ? '+' : ''}${Utils.formatCurrency(impact)}</td>
                        <td class="px-md py-sm text-center">
                          <button class="fr-edit-waste text-secondary hover:text-primary transition-colors material-symbols-outlined" style="font-size:16px;cursor:pointer" data-idx="${idx}">edit</button>
                          <button class="fr-del-waste text-secondary hover:text-error transition-colors material-symbols-outlined" style="font-size:16px;cursor:pointer;margin-left:4px" data-idx="${idx}">delete</button>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
            <div class="px-lg py-sm border-t border-outline-variant/50 bg-surface-container-lowest text-right">
              <span class="font-label-md text-primary">Total Waste Impact: ${Utils.formatCurrency(totalWaste)}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    document.querySelectorAll('.fr-edit-waste').forEach(btn => {
      btn.addEventListener('click', function () {
        const idx = parseInt(this.dataset.idx);
        const waste = loadWasteData();
        const item = waste[idx];
        if (!item) return;
        Utils.prompt({
          title: 'Edit Waste Entry',
          fields: [
            { name: 'ing', label: 'Ingredient', type: 'text' },
            { name: 'theo', label: 'Theoretical Cost', type: 'number' },
            { name: 'actual', label: 'Actual Cost', type: 'number' }
          ],
          data: { ing: item.ing, theo: String(item.theo), actual: String(item.actual) },
          onSave: function (vals) {
            const w = loadWasteData();
            w[idx] = { ing: vals.ing, theo: parseFloat(vals.theo) || 0, actual: parseFloat(vals.actual) || 0 };
            saveWasteData(w);
            Utils.notify('Waste entry updated', 'success');
            renderReport();
          }
        });
      });
    });
    document.querySelectorAll('.fr-del-waste').forEach(btn => {
      btn.addEventListener('click', function () {
        const idx = parseInt(this.dataset.idx);
        Utils.confirm('Delete this waste entry?', function () {
          const w = loadWasteData();
          w.splice(idx, 1);
          saveWasteData(w);
          Utils.notify('Waste entry deleted', 'success');
          renderReport();
        });
      });
    });

    document.getElementById('fr-add-waste-btn').addEventListener('click', function () {
      Utils.prompt({
        title: 'Add Waste Entry',
        fields: [
          { name: 'ing', label: 'Ingredient', type: 'text' },
          { name: 'theo', label: 'Theoretical Cost', type: 'number' },
          { name: 'actual', label: 'Actual Cost', type: 'number' }
        ],
        onSave: function (vals) {
          const w = loadWasteData();
          w.push({ ing: vals.ing, theo: parseFloat(vals.theo) || 0, actual: parseFloat(vals.actual) || 0 });
          saveWasteData(w);
          Utils.notify('Waste entry added', 'success');
          renderReport();
        }
      });
    });

    document.getElementById('fr-refresh-btn').addEventListener('click', function () {
      Utils.notify('Report refreshed', 'info');
      renderReport();
    });
  }

  renderReport();
});
