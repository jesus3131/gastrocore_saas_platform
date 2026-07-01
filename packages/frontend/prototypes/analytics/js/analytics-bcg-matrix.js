document.addEventListener('DOMContentLoaded', function () {
  const STORAGE_KEY = 'analytics_data';
  const BCG_STORAGE_KEY = 'analytics_bcg_data';

  const MENU_ITEMS_FIXED = [
    { name: 'Salmón Glaseado', category: 'Plato Fuerte', cost: 8.50, price: 28.00, margin: 70 },
    { name: 'Risotto de Hongos', category: 'Plato Fuerte', cost: 4.20, price: 22.00, margin: 81 },
    { name: 'Hamburguesa Clásica', category: 'Plato Fuerte', cost: 5.00, price: 16.00, margin: 69 },
    { name: 'Ensalada César', category: 'Entradas', cost: 3.00, price: 12.00, margin: 75 },
    { name: 'Gaseosas', category: 'Bebidas', cost: 0.80, price: 3.50, margin: 77 },
    { name: 'Ceviche Vegano', category: 'Entradas', cost: 4.50, price: 14.00, margin: 68 },
    { name: 'Tarta de Higo', category: 'Postres', cost: 3.20, price: 11.00, margin: 71 },
    { name: 'Sopa de Cebolla', category: 'Entradas', cost: 2.50, price: 9.00, margin: 72 },
    { name: 'Carpaccio Zucchini', category: 'Entradas', cost: 3.80, price: 12.00, margin: 68 },
    { name: 'Copa de Malbec', category: 'Bebidas', cost: 1.50, price: 9.00, margin: 83 },
    { name: 'Volcán de Chocolate', category: 'Postres', cost: 2.10, price: 11.00, margin: 81 },
    { name: 'Limonada Menta', category: 'Bebidas', cost: 0.80, price: 5.50, margin: 85 }
  ];

  const PEAK_HOURS_FIXED = [
    { time: '13:00 - 15:00', label: 'Alta (85%)', width: 85 },
    { time: '16:00 - 18:00', label: 'Baja (20%)', width: 20 },
    { time: '19:00 - 21:00', label: 'Crítica (98%)', width: 98 },
    { time: '22:00 - 23:30', label: 'Media (45%)', width: 45 }
  ];

  function loadData() {
    let bcgData = Utils.storage.get(BCG_STORAGE_KEY);
    if (!bcgData || !bcgData.menuItems || !bcgData.peakHours) {
      bcgData = { menuItems: JSON.parse(JSON.stringify(MENU_ITEMS_FIXED)), peakHours: JSON.parse(JSON.stringify(PEAK_HOURS_FIXED)) };
      Utils.storage.set(BCG_STORAGE_KEY, bcgData);
    }
    return bcgData;
  }

  function saveData(data) {
    Utils.storage.set(BCG_STORAGE_KEY, data);
  }

  function getSalesData() {
    const ad = Utils.storage.get(STORAGE_KEY);
    if (!ad || !ad.orders) return {};
    const sales = {};
    ad.orders.forEach(o => {
      o.items.forEach(it => {
        if (!sales[it.name]) sales[it.name] = { qty: 0, revenue: 0 };
        sales[it.name].qty += it.qty;
        sales[it.name].revenue += it.price * it.qty;
      });
    });
    return sales;
  }

  function classifyBCG(menuItems) {
    const sales = getSalesData();
    const totalQty = Object.values(sales).reduce((s, v) => s + v.qty, 0);
    const avgQty = Object.keys(sales).length > 0 ? totalQty / Object.keys(sales).length : 5;
    const itemsWithSales = menuItems.map(mi => {
      const s = sales[mi.name] || { qty: Math.floor(Math.random() * 30) + 1, revenue: mi.price * (Math.floor(Math.random() * 30) + 1) };
      const growth = mi.margin > 75 ? (Math.random() * 30 + 10) : (Math.random() * 20 - 5);
      return { ...mi, salesQty: s.qty, salesRevenue: s.revenue, growth };
    });
    const maxQty = Math.max(...itemsWithSales.map(i => i.salesQty), 1);
    itemsWithSales.forEach(i => { i.volumeShare = i.salesQty / maxQty; });
    return {
      stars: itemsWithSales.filter(i => i.salesQty >= avgQty && i.growth >= 10).sort((a, b) => b.salesQty - a.salesQty),
      questionMarks: itemsWithSales.filter(i => i.salesQty < avgQty && i.growth >= 10).sort((a, b) => b.growth - a.growth),
      cashCows: itemsWithSales.filter(i => i.salesQty >= avgQty && i.growth < 10).sort((a, b) => b.salesQty - a.salesQty),
      dogs: itemsWithSales.filter(i => i.salesQty < avgQty && i.growth < 10).sort((a, b) => b.growth - a.growth)
    };
  }

  function render() {
    const bcgData = loadData();
    const mi = bcgData.menuItems;
    const ph = bcgData.peakHours;
    const bcg = classifyBCG(mi);
    const orders = (Utils.storage.get(STORAGE_KEY) || { orders: [] }).orders;
    const totalRev = orders.reduce((s, o) => s + o.total, 0);
    const totalOrders = orders.length;
    const avgOrder = totalOrders > 0 ? totalRev / totalOrders : 0;
    const topDishes = [...mi].sort((a, b) => (b.price - b.cost) - (a.price - a.cost)).slice(0, 5);

    const body = document.body;
    body.className = 'bg-surface text-on-surface font-body-md text-body-md m-0 p-0 flex min-h-screen';
    body.innerHTML = `
      <aside class="bg-surface-container border-r border-outline-variant h-screen w-64 fixed left-0 top-0 flex flex-col py-md px-sm z-50">
        <div class="flex items-center gap-sm mb-lg px-sm">
          <div class="w-10 h-10 rounded-lg bg-surface-container-lowest border border-outline-variant flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-primary" style="font-size:24px">restaurant</span>
          </div>
          <div>
            <h1 class="font-headline-md font-bold text-primary" style="font-size:20px">RestoPro</h1>
            <p class="font-label-md text-label-md text-on-surface-variant">Administrador</p>
          </div>
        </div>
        <nav class="flex-1 overflow-y-auto">
          <ul class="flex flex-col gap-xs">
            <li><a class="flex items-center gap-sm px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors" href="#"><span class="material-symbols-outlined">point_of_sale</span><span>POS</span></a></li>
            <li><a class="flex items-center gap-sm px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors" href="#"><span class="material-symbols-outlined">inventory_2</span><span>Inventario</span></a></li>
            <li><a class="flex items-center gap-sm px-md py-sm rounded-lg bg-secondary-container text-on-secondary-container font-bold transition-transform" href="#"><span class="material-symbols-outlined filled">analytics</span><span>Analítica</span></a></li>
            <li><a class="flex items-center gap-sm px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors" href="#"><span class="material-symbols-outlined">badge</span><span>Personal</span></a></li>
            <li><a class="flex items-center gap-sm px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors" href="#"><span class="material-symbols-outlined">settings</span><span>Configuración</span></a></li>
          </ul>
        </nav>
        <div class="mt-auto pt-md">
          <button id="bcg-new-item" class="w-full bg-primary-container text-on-primary py-sm rounded-lg font-label-md hover:opacity-90 transition-opacity flex items-center justify-center gap-sm">
            <span class="material-symbols-outlined" style="font-size:18px">add</span> Nuevo Plato
          </button>
        </div>
      </aside>
      <div class="flex-1 ml-64 flex flex-col min-h-screen">
        <header class="bg-surface-container-lowest border-b border-outline-variant sticky top-0 z-40 flex justify-between items-center h-16 px-lg">
          <div class="flex items-center gap-lg">
            <nav class="flex gap-md">
              <a class="text-primary font-bold border-b-2 border-primary py-sm font-label-md" href="#">Matriz BCG</a>
              <a class="text-on-surface-variant hover:text-on-surface py-sm font-label-md hover:bg-surface-container-high rounded-lg px-sm" href="#">Análisis de Menú</a>
              <a class="text-on-surface-variant hover:text-on-surface py-sm font-label-md hover:bg-surface-container-high rounded-lg px-sm" href="#">Rendimiento</a>
            </nav>
          </div>
          <div class="flex items-center gap-md">
            <button id="bcg-refresh" class="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full p-sm transition-colors"><span class="material-symbols-outlined">refresh</span></button>
            <button class="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full p-sm transition-colors"><span class="material-symbols-outlined">notifications</span></button>
            <div class="w-8 h-8 rounded-full overflow-hidden border border-outline-variant ml-sm" style="background:#d5e3fd;display:flex;align-items:center;justify-content:center">
              <span class="material-symbols-outlined text-primary" style="font-size:18px">person</span>
            </div>
          </div>
        </header>
        <main class="p-lg gap-lg flex flex-col">
          <div class="flex justify-between items-end mb-sm">
            <div>
              <h2 class="font-headline-lg text-headline-lg text-on-surface">Matriz BCG de Menú</h2>
              <p class="font-body-md text-body-md text-on-surface-variant mt-xs">Clasificación de platos por volumen de ventas y crecimiento</p>
            </div>
            <div class="flex gap-sm">
              <button id="bcg-edit-hours" class="border border-outline text-on-surface px-md py-sm rounded-lg font-label-md flex items-center gap-xs hover:bg-surface-container transition-colors">
                <span class="material-symbols-outlined" style="font-size:18px">schedule</span> Editar Horas
              </button>
              <button class="border border-outline text-on-surface px-md py-sm rounded-lg font-label-md flex items-center gap-xs hover:bg-surface-container transition-colors">
                <span class="material-symbols-outlined" style="font-size:18px">download</span> Exportar
              </button>
            </div>
          </div>

          <div id="bcg-metrics" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-md"></div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-md mt-md">
            <div class="lg:col-span-2 bg-surface-container-lowest border border-surface-container rounded-lg flex flex-col overflow-hidden">
              <div class="bg-surface-container-low px-md py-sm border-b border-surface-container flex justify-between items-center">
                <h3 class="font-headline-md text-on-surface" style="font-size:18px">Matriz BCG</h3>
                <span class="material-symbols-outlined text-outline-variant">info</span>
              </div>
              <div class="p-md flex-1 flex flex-col relative" style="min-height:400px">
                <div class="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 origin-center text-on-surface-variant font-label-md tracking-wider" style="font-size:12px">CRECIMIENTO</div>
                <div class="pl-lg pb-lg h-full flex flex-col gap-xs relative">
                  <div class="grid grid-cols-2 grid-rows-2 h-full gap-xs relative">
                    <div class="rounded-lg p-sm relative flex flex-col" style="background:#f0f9ff;border:1px solid #bae6fd">
                      <div class="flex justify-between items-start mb-sm"><span class="font-label-md" style="color:#0369a1;font-size:12px">ESTRELLA</span><span class="material-symbols-outlined" style="color:#38bdf8">star</span></div>
                      <ul class="text-body-sm font-body-sm" style="color:#0c4a6e" id="bcg-star-list">
                        ${bcg.stars.length ? bcg.stars.map(s => `<li style="list-style:disc;margin-left:16px">${s.name}</li>`).join('') : '<li style="color:#999">Sin elementos</li>'}
                      </ul>
                    </div>
                    <div class="rounded-lg p-sm relative flex flex-col" style="background:#fefce8;border:1px solid #fef08a">
                      <div class="flex justify-between items-start mb-sm"><span class="font-label-md" style="color:#a16207;font-size:12px">INTERROGANTE</span><span class="material-symbols-outlined" style="color:#facc15">help_outline</span></div>
                      <ul class="text-body-sm font-body-sm" style="color:#713f12" id="bcg-question-list">
                        ${bcg.questionMarks.length ? bcg.questionMarks.map(s => `<li style="list-style:disc;margin-left:16px">${s.name}</li>`).join('') : '<li style="color:#999">Sin elementos</li>'}
                      </ul>
                    </div>
                    <div class="rounded-lg p-sm relative flex flex-col" style="background:#f0fdf4;border:1px solid #bbf7d0">
                      <div class="flex justify-between items-start mb-sm"><span class="font-label-md" style="color:#15803d;font-size:12px">VACA LECHERA</span><span class="material-symbols-outlined" style="color:#4ade80">pets</span></div>
                      <ul class="text-body-sm font-body-sm" style="color:#14532d" id="bcg-cash-list">
                        ${bcg.cashCows.length ? bcg.cashCows.map(s => `<li style="list-style:disc;margin-left:16px">${s.name}</li>`).join('') : '<li style="color:#999">Sin elementos</li>'}
                      </ul>
                    </div>
                    <div class="rounded-lg p-sm relative flex flex-col" style="background:#fef2f2;border:1px solid #fecaca">
                      <div class="flex justify-between items-start mb-sm"><span class="font-label-md" style="color:#b91c1c;font-size:12px">PERRO</span><span class="material-symbols-outlined" style="color:#f87171">close</span></div>
                      <ul class="text-body-sm font-body-sm" style="color:#7f1d1d" id="bcg-dog-list">
                        ${bcg.dogs.length ? bcg.dogs.map(s => `<li style="list-style:disc;margin-left:16px">${s.name}</li>`).join('') : '<li style="color:#999">Sin elementos</li>'}
                      </ul>
                    </div>
                  </div>
                  <div class="text-center text-on-surface-variant font-label-md tracking-wider" style="font-size:12px">PARTICIPACIÓN (VOLUMEN)</div>
                </div>
              </div>
            </div>

            <div class="bg-surface-container-lowest border border-surface-container rounded-lg flex flex-col overflow-hidden">
              <div class="bg-surface-container-low px-md py-sm border-b border-surface-container flex justify-between items-center">
                <h3 class="font-headline-md text-on-surface" style="font-size:18px">Horas Pico (Hoy)</h3>
                <span class="material-symbols-outlined text-outline-variant">schedule</span>
              </div>
              <div class="p-md flex-1 flex flex-col justify-center gap-md">
                ${ph.map(h => {
                  const isCritical = h.width >= 95;
                  const bgClass = isCritical ? 'bg-error' : (h.width >= 60 ? 'bg-primary-container' : (h.width >= 30 ? 'bg-secondary-fixed-dim' : 'bg-primary-fixed-dim'));
                  return `
                    <div>
                      <div class="flex justify-between text-body-sm font-body-sm mb-xs">
                        <span class="text-on-surface font-semibold">${h.time}</span>
                        <span class="text-on-surface-variant">${h.label}</span>
                      </div>
                      <div class="w-full bg-surface-container-high rounded-full h-2 overflow-hidden relative">
                        ${isCritical ? '<div class="absolute inset-0 bg-error opacity-20 animate-pulse"></div>' : ''}
                        <div class="${bgClass} h-2 rounded-full relative z-10 transition-all" style="width:${h.width}%"></div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>

          <div class="bg-surface-container-lowest border border-surface-container rounded-lg flex flex-col overflow-hidden mt-md mb-lg">
            <div class="bg-surface-container-low px-md py-sm border-b border-surface-container flex justify-between items-center">
              <h3 class="font-headline-md text-on-surface" style="font-size:18px">Top 5 Platos más Rentables</h3>
              <button class="text-primary text-body-sm font-label-md hover:underline">Ver Menú Completo</button>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-surface-container">
                    <th class="py-sm px-md font-label-md text-label-md text-on-surface-variant uppercase bg-surface-container-lowest">Plato</th>
                    <th class="py-sm px-md font-label-md text-label-md text-on-surface-variant uppercase bg-surface-container-lowest">Categoría</th>
                    <th class="py-sm px-md font-label-md text-label-md text-on-surface-variant uppercase bg-surface-container-lowest text-right">Costo</th>
                    <th class="py-sm px-md font-label-md text-label-md text-on-surface-variant uppercase bg-surface-container-lowest text-right">Precio</th>
                    <th class="py-sm px-md font-label-md text-label-md text-on-surface-variant uppercase bg-surface-container-lowest text-right">Margen Neto</th>
                    <th class="py-sm px-md font-label-md text-label-md text-on-surface-variant uppercase bg-surface-container-lowest text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody class="font-body-sm text-body-sm text-on-surface divide-y divide-surface-container">
                  ${topDishes.map((d, idx) => {
                    const marginVal = d.price > 0 ? ((d.price - d.cost) / d.price * 100) : 0;
                    const marginDol = d.price - d.cost;
                    return `
                      <tr class="hover:bg-surface-container-low transition-colors ${idx % 2 === 0 ? '' : 'bg-surface-container-lowest'}">
                        <td class="py-sm px-md font-medium">${d.name}</td>
                        <td class="py-sm px-md text-on-surface-variant">${d.category}</td>
                        <td class="py-sm px-md text-right font-data-mono">${Utils.formatCurrency(d.cost)}</td>
                        <td class="py-sm px-md text-right font-data-mono">${Utils.formatCurrency(d.price)}</td>
                        <td class="py-sm px-md text-right text-on-tertiary-container font-semibold font-data-mono">${marginVal.toFixed(0)}% (${Utils.formatCurrency(marginDol)})</td>
                        <td class="py-sm px-md text-center">
                          <button class="bcg-edit-dish text-secondary hover:text-primary transition-colors material-symbols-outlined" style="font-size:16px;cursor:pointer" data-idx="${idx}">edit</button>
                          <button class="bcg-del-dish text-secondary hover:text-error transition-colors material-symbols-outlined" style="font-size:16px;cursor:pointer;margin-left:4px" data-idx="${idx}">delete</button>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    `;

    const totalProfit = mi.reduce((s, d) => s + (d.price - d.cost) * (Math.floor(Math.random() * 20) + 5), 0);
    document.getElementById('bcg-metrics').innerHTML = `
      <div class="bg-surface-container-lowest border border-surface-container rounded-lg p-md flex flex-col justify-between hover:-translate-y-px transition-transform">
        <div class="flex justify-between items-start mb-md"><span class="font-body-sm text-body-sm text-on-surface-variant uppercase">Rentabilidad Total</span><span class="material-symbols-outlined text-primary">payments</span></div>
        <div><span class="font-headline-lg text-on-surface">${Utils.formatCurrency(totalProfit)}</span></div>
      </div>
      <div class="bg-surface-container-lowest border border-surface-container rounded-lg p-md flex flex-col justify-between hover:-translate-y-px transition-transform">
        <div class="flex justify-between items-start mb-md"><span class="font-body-sm text-body-sm text-on-surface-variant uppercase">Ticket Promedio</span><span class="material-symbols-outlined text-secondary">receipt_long</span></div>
        <div><span class="font-headline-lg text-on-surface">${Utils.formatCurrency(avgOrder || 42.50)}</span><p class="font-body-sm text-on-surface-variant mt-xs">Objetivo: $45.00</p></div>
      </div>
      <div class="bg-surface-container-lowest border border-surface-container rounded-lg p-md flex flex-col justify-between hover:-translate-y-px transition-transform">
        <div class="flex justify-between items-start mb-md"><span class="font-body-sm text-body-sm text-on-surface-variant uppercase">Platos en Menú</span><span class="material-symbols-outlined text-secondary">menu_book</span></div>
        <div><span class="font-headline-lg text-on-surface">${mi.length}</span></div>
      </div>
      <div class="bg-surface-container-lowest border border-surface-container rounded-lg p-md flex flex-col justify-between hover:-translate-y-px transition-transform">
        <div class="flex justify-between items-start mb-md"><span class="font-body-sm text-body-sm text-on-surface-variant uppercase">Órdenes Totales</span><span class="material-symbols-outlined text-primary">receipt</span></div>
        <div><span class="font-headline-lg text-on-surface">${totalOrders || 82}</span><p class="font-body-sm text-on-surface-variant mt-xs">En el período</p></div>
      </div>
    `;

    document.getElementById('bcg-new-item').addEventListener('click', function () {
      const cats = [...new Set(MENU_ITEMS_FIXED.map(m => m.category))];
      Utils.prompt({
        title: 'Agregar Nuevo Plato',
        fields: [
          { name: 'name', label: 'Nombre del Plato', type: 'text' },
          { name: 'category', label: 'Categoría', type: 'select', options: cats.map(c => ({ label: c, value: c })) },
          { name: 'cost', label: 'Costo de Producción ($)', type: 'number' },
          { name: 'price', label: 'Precio de Venta ($)', type: 'number' }
        ],
        onSave: function (vals) {
          const d = Utils.storage.get(BCG_STORAGE_KEY);
          d.menuItems.push({ name: vals.name, category: vals.category, cost: parseFloat(vals.cost) || 0, price: parseFloat(vals.price) || 0, margin: 0 });
          saveData(d);
          Utils.notify('Plato agregado exitosamente', 'success');
          render();
        }
      });
    });

    document.getElementById('bcg-refresh').addEventListener('click', function () {
      Utils.notify('Datos actualizados', 'info');
      render();
    });

    document.getElementById('bcg-edit-hours').addEventListener('click', function () {
      const d = Utils.storage.get(BCG_STORAGE_KEY);
      const phData = d.peakHours;
      Utils.prompt({
        title: 'Editar Horas Pico',
        fields: phData.map((h, i) => ({ name: 'ph_' + i, label: h.time + ' (%)', type: 'number' })),
        data: phData.reduce((o, h, i) => { o['ph_' + i] = String(h.width); return o; }, {}),
        onSave: function (vals) {
          const dt = Utils.storage.get(BCG_STORAGE_KEY);
          dt.peakHours = dt.peakHours.map((h, i) => {
            const w = parseInt(vals['ph_' + i]);
            const num = isNaN(w) ? h.width : Math.min(100, Math.max(0, w));
            return { time: h.time, width: num, label: num >= 95 ? 'Crítica (' + num + '%)' : (num >= 60 ? 'Alta (' + num + '%)' : (num >= 30 ? 'Media (' + num + '%)' : 'Baja (' + num + '%)')) };
          });
          saveData(dt);
          Utils.notify('Horas pico actualizadas', 'success');
          render();
        }
      });
    });

    topDishes.forEach((d, idx) => {
      const editBtn = document.querySelectorAll('.bcg-edit-dish')[idx];
      const delBtn = document.querySelectorAll('.bcg-del-dish')[idx];
      if (editBtn) {
        editBtn.addEventListener('click', function () {
          const bd = Utils.storage.get(BCG_STORAGE_KEY);
          const item = bd.menuItems[idx];
          if (!item) return;
          Utils.prompt({
            title: 'Editar Plato',
            fields: [
              { name: 'name', label: 'Nombre', type: 'text' },
              { name: 'category', label: 'Categoría', type: 'select', options: [...new Set(MENU_ITEMS_FIXED.map(m => m.category))].map(c => ({ label: c, value: c })) },
              { name: 'cost', label: 'Costo ($)', type: 'number' },
              { name: 'price', label: 'Precio ($)', type: 'number' }
            ],
            data: { name: item.name, category: item.category, cost: String(item.cost), price: String(item.price) },
            onSave: function (vals) {
              const bd2 = Utils.storage.get(BCG_STORAGE_KEY);
              bd2.menuItems[idx] = { name: vals.name, category: vals.category, cost: parseFloat(vals.cost) || 0, price: parseFloat(vals.price) || 0, margin: 0 };
              saveData(bd2);
              Utils.notify('Plato actualizado', 'success');
              render();
            }
          });
        });
      }
      if (delBtn) {
        delBtn.addEventListener('click', function () {
          Utils.confirm('¿Eliminar "' + d.name + '" del menú?', function () {
            const bd = Utils.storage.get(BCG_STORAGE_KEY);
            bd.menuItems.splice(idx, 1);
            saveData(bd);
            Utils.notify('Plato eliminado', 'success');
            render();
          });
        });
      }
    });
  }

  render();
});
