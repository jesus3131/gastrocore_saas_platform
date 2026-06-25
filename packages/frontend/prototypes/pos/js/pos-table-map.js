
  const roomFilters = [
    { name: "Main Room", icon: "table_restaurant", active: true },
    { name: "Terrace", icon: "deck", active: false },
    { name: "Bar", icon: "local_bar", active: false }
  ];
  const tables = [
    { name: "Mesa 1", status: "occupied", shape: "rect", pos: "top-24 left-32", size: "w-32 h-20", capacity: 4, time: "45m" },
    { name: "Mesa 2", status: "available", shape: "round", pos: "top-24 left-72", size: "w-24 h-24", pax: 2 },
    { name: "Mesa 3", status: "bill_requested", shape: "rect", pos: "top-24 right-48", size: "w-24 h-32", amount: 125.50 },
    { name: "Mesa 4", status: "reserved", shape: "round", pos: "top-64 left-48", size: "w-28 h-28", time: "19:30" },
    { name: "Mesa 12", status: "occupied", shape: "rect", pos: "top-72 right-32", size: "w-48 h-20", capacity: 8, time: "1h 15m", vip: true }
  ];
  const roomStatus = { occupancy: 68, totalCapacity: 120, avgTurnTime: "42m", activeOrders: 14, pendingBills: 3, upcomingReservations: 5 };
  const waitstaff = [
    { name: "Carlos R.", tablesActive: 4, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCdirmo-GPzye0bGXz4IW9fGlkDb3YE2YOAgVwuPBWzlTn4nza10h1li3o3ZJ0Cy4nvFowmPnwkU042TZ7MTFZlt-3jCVluRdsIf9OYYo1bEnWD8-0P4OapzVrSVVLnbGA6ddYdx-IkX4d6VyNwWcnkFnmcbyte2saLCPbALb3YJ_HWUXNa5LWTOpksOfJHTyDINbh-HNeJfXLN9vjxNhC1Qo3s2RC7lRsbMOT8BqYr1PD3YsNB_E7jkLgqdJxFMCphD7uaXZpbzdAl", alt: "Small circular avatar of a friendly waiter wearing a black apron. Neutral background, high quality professional headshot, bright lighting." },
    { name: "Elena M.", tablesActive: 3, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA9Ar3XVP_V2ySNdalnB4lVfXoxQVgDu65tH29B3BvKSDeQ4qDSGkx-zlOMwTcimy83HU8TGFM1IbRLNGMny5UM_5VrnlCxdRm2xNOnZDwk4d7H4PpDX6PLbgMT6RRFYc-nPvV68W5EBOhxDsYTwYKTeVxtYjonDwQTZQeBXYDEBeAvswwwY3Winl75wu54uGFqhHNknfDRNDMgBm0u_aB-yhy5Svxnt12B6OGqmr4azNccADHkSMBug9BFD4uo0jcejL6U5zzsxXUG", alt: "Small circular avatar of a professional waitress wearing a black apron and white shirt. Neutral background, high quality professional headshot, bright lighting." }
  ];



  function renderRoomFilters() {
    const c = document.getElementById('room-filters');
    if (!c) return;
    c.innerHTML = roomFilters.map(f => `<button class="px-4 py-1.5 rounded-md font-label-md text-label-md ${f.active ? 'bg-surface-container-lowest shadow-sm text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container/50'}">${f.name}</button>`).join('');
  }
  function renderTables() {
    const c = document.getElementById('tables-map');
    if (!c) return;
    c.innerHTML = tables.map(t => {
      if (t.status === 'occupied') {
        return `<div class="absolute ${t.pos} ${t.size} bg-surface-container-lowest border-2 border-primary-container rounded-lg flex flex-col items-center justify-center table-hover cursor-pointer relative shadow-sm"><div class="absolute -top-3 -right-3 w-6 h-6 bg-primary-container rounded-full flex items-center justify-center text-on-primary border-2 border-surface-container-lowest shadow-sm"><span class="font-label-md text-[10px]">${t.capacity}</span></div><span class="font-headline-md text-headline-md text-on-surface font-bold">${t.name}</span>${t.vip ? '<div class="flex gap-2 mt-1"><span class="font-data-mono text-data-mono text-primary-container bg-primary-container/10 px-2 py-0.5 rounded text-xs">' + t.time + '</span><span class="font-data-mono text-data-mono text-on-surface-variant bg-surface-variant px-2 py-0.5 rounded text-xs">VIP</span></div>' : '<span class="font-data-mono text-data-mono text-primary-container mt-1 bg-primary-container/10 px-2 py-0.5 rounded text-xs">' + t.time + '</span>'}</div>`;
      } else if (t.status === 'available') {
        return `<div class="absolute ${t.pos} ${t.size} bg-surface-container-lowest border border-outline-variant rounded-full flex flex-col items-center justify-center table-hover cursor-pointer relative"><div class="absolute top-1 right-1 w-3 h-3 bg-tertiary-fixed-dim rounded-full shadow-sm"></div><span class="font-headline-md text-headline-md text-on-surface font-bold">${t.name}</span><span class="font-label-md text-label-md text-on-surface-variant mt-1">${t.pax} pax</span></div>`;
      } else if (t.status === 'bill_requested') {
        return `<div class="absolute ${t.pos} ${t.size} bg-surface-container-lowest border-2 border-yellow-500 rounded-lg flex flex-col items-center justify-center table-hover cursor-pointer relative shadow-sm pulse-yellow"><div class="absolute -top-3 -left-3 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white border-2 border-surface-container-lowest shadow-sm"><span class="material-symbols-outlined text-[14px]">receipt_long</span></div><span class="font-headline-md text-headline-md text-on-surface font-bold">${t.name}</span><span class="font-data-mono text-data-mono text-yellow-600 mt-1 font-bold">$${t.amount.toFixed(2)}</span></div>`;
      } else if (t.status === 'reserved') {
        return `<div class="absolute ${t.pos} ${t.size} bg-surface-container border border-outline-variant rounded-full flex flex-col items-center justify-center table-hover cursor-pointer relative opacity-80"><span class="material-symbols-outlined text-on-surface-variant mb-1">calendar_month</span><span class="font-headline-md text-headline-md text-on-surface-variant font-bold">${t.name}</span><span class="font-label-md text-label-md text-on-surface-variant mt-1">${t.time}</span></div>`;
      }
      return '';
    }).join('');
  }
  function renderRoomStatus() {
    const c = document.getElementById('room-status');
    if (!c) return;
    c.innerHTML += '<div class="grid grid-cols-2 gap-4 mb-6"><div class="flex flex-col"><span class="font-label-md text-label-md text-on-surface-variant mb-1">Occupancy</span><div class="flex items-end gap-1"><span class="font-headline-lg text-headline-lg-mobile font-bold text-primary">' + roomStatus.occupancy + '%</span><span class="font-body-sm text-body-sm text-on-surface-variant pb-1">/ ' + roomStatus.totalCapacity + ' pax</span></div></div><div class="flex flex-col"><span class="font-label-md text-label-md text-on-surface-variant mb-1">Avg Turn Time</span><div class="flex items-end gap-1"><span class="font-headline-lg text-headline-lg-mobile font-bold text-on-surface">' + roomStatus.avgTurnTime + '</span></div></div></div><div class="space-y-3"><div class="flex justify-between items-center py-2 border-b border-outline-variant/50"><span class="font-body-sm text-body-sm text-on-surface">Active Orders</span><span class="font-data-mono text-data-mono font-bold bg-surface-container px-2 py-1 rounded">' + roomStatus.activeOrders + '</span></div><div class="flex justify-between items-center py-2 border-b border-outline-variant/50"><span class="font-body-sm text-body-sm text-on-surface">Pending Bills</span><span class="font-data-mono text-data-mono font-bold bg-yellow-100 text-yellow-800 px-2 py-1 rounded">' + roomStatus.pendingBills + '</span></div><div class="flex justify-between items-center py-2"><span class="font-body-sm text-body-sm text-on-surface">Upcoming Res. (1h)</span><span class="font-data-mono text-data-mono font-bold bg-surface-container px-2 py-1 rounded">' + roomStatus.upcomingReservations + '</span></div></div>';
  }
  function renderWaitstaff() {
    const c = document.getElementById('waitstaff-list');
    if (!c) return;
    c.innerHTML = waitstaff.map(w => '<div class="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container transition-colors cursor-pointer border border-transparent hover:border-outline-variant/50"><div class="relative"><img class="w-10 h-10 rounded-full object-cover" data-alt="' + w.alt + '" src="' + w.image + '"><div class="absolute bottom-0 right-0 w-3 h-3 bg-tertiary-fixed-dim border-2 border-surface-container-lowest rounded-full"></div></div><div class="flex-1"><p class="font-body-sm text-body-sm font-semibold text-on-surface">' + w.name + '</p><p class="font-label-md text-label-md text-on-surface-variant">' + w.tablesActive + ' Tables Active</p></div></div>').join('');
  }
  renderRoomFilters();
  renderTables();
  renderRoomStatus();
  renderWaitstaff();
