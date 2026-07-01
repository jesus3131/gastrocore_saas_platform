(function () {
  'use strict';

  var STORE_KEY = 'pos_table_map';
  var STATUSES = ['available', 'occupied', 'bill_requested', 'reserved'];

  function getDefaults() {
    return {
      rooms: [
        { id: Utils.uid(), name: 'Main Room' },
        { id: Utils.uid(), name: 'Terrace' },
        { id: Utils.uid(), name: 'VIP' },
        { id: Utils.uid(), name: 'Bar' }
      ],
      tables: [
        { id: Utils.uid(), name: 'Table 1', room: null, status: 'occupied', x: 4, y: 22, w: 110, h: 80, shape: 'rect', capacity: 4, waitstaff: null, time: '32m' },
        { id: Utils.uid(), name: 'Table 2', room: null, status: 'available', x: 22, y: 18, w: 85, h: 85, shape: 'round', capacity: 2, waitstaff: null, pax: 2 },
        { id: Utils.uid(), name: 'Table 3', room: null, status: 'bill_requested', x: 40, y: 22, w: 105, h: 85, shape: 'rect', capacity: 4, waitstaff: null, amount: 125.50 },
        { id: Utils.uid(), name: 'Table 4', room: null, status: 'reserved', x: 56, y: 18, w: 95, h: 95, shape: 'round', capacity: 4, waitstaff: null, time: '19:30' },
        { id: Utils.uid(), name: 'Table 5', room: null, status: 'occupied', x: 72, y: 22, w: 90, h: 80, shape: 'rect', capacity: 6, waitstaff: null, time: '1h 05m' },
        { id: Utils.uid(), name: 'Terrace 1', room: null, status: 'available', x: 4, y: 52, w: 85, h: 85, shape: 'round', capacity: 2, waitstaff: null, pax: 2 },
        { id: Utils.uid(), name: 'Terrace 2', room: null, status: 'occupied', x: 20, y: 50, w: 125, h: 80, shape: 'rect', capacity: 6, waitstaff: null, time: '1h 10m' },
        { id: Utils.uid(), name: 'Terrace 3', room: null, status: 'reserved', x: 44, y: 52, w: 85, h: 85, shape: 'round', capacity: 4, waitstaff: null, time: '21:00' },
        { id: Utils.uid(), name: 'VIP 1', room: null, status: 'occupied', x: 4, y: 28, w: 145, h: 90, shape: 'rect', capacity: 8, waitstaff: null, time: '1h 25m', vip: true },
        { id: Utils.uid(), name: 'VIP 2', room: null, status: 'reserved', x: 44, y: 32, w: 105, h: 100, shape: 'round', capacity: 6, waitstaff: null, time: '20:00' },
        { id: Utils.uid(), name: 'Bar 1', room: null, status: 'occupied', x: 4, y: 15, w: 90, h: 65, shape: 'rect', capacity: 2, waitstaff: null, time: '15m' },
        { id: Utils.uid(), name: 'Bar 2', room: null, status: 'available', x: 28, y: 15, w: 90, h: 65, shape: 'rect', capacity: 2, waitstaff: null, pax: 2 },
        { id: Utils.uid(), name: 'Bar 3', room: null, status: 'bill_requested', x: 52, y: 15, w: 90, h: 65, shape: 'rect', capacity: 2, waitstaff: null, amount: 68.00 }
      ],
      waitstaff: [
        { id: Utils.uid(), name: 'Carlos R.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdirmo-GPzye0bGXz4IW9fGlkDb3YE2YOAgVwuPBWzlTn4nza10h1li3o3ZJ0Cy4nvFowmPnwkU042TZ7MTFZlt-3jCVluRdsIf9OYYo1bEnWD8-0P4OapzVrSVVLnbGA6ddYdx-IkX4d6VyNwWcnkFnmcbyte2saLCPbALb3YJ_HWUXNa5LWTOpksOfJHTyDINbh-HNeJfXLN9vjxNhC1Qo3s2RC7lRsbMOT8BqYr1PD3YsNB_E7jkLgqdJxFMCphD7uaXZpbzdAl', alt: 'Small circular avatar of a friendly waiter wearing a black apron' },
        { id: Utils.uid(), name: 'Elena M.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9Ar3XVP_V2ySNdalnB4lVfXoxQVgDu65tH29B3BvKSDeQ4qDSGkx-zlOMwTcimy83HU8TGFM1IbRLNGMny5UM_5VrnlCxdRm2xNOnZDwk4d7H4PpDX6PLbgMT6RRFYc-nPvV68W5EBOhxDsYTwYKTeVxtYjonDwQTZQeBXYDEBeAvswwwY3Winl75wu54uGFqhHNknfDRNDMgBm0u_aB-yhy5Svxnt12B6OGqmr4azNccADHkSMBug9BFD4uo0jcejL6U5zzsxXUG', alt: 'Small circular avatar of a professional waitress wearing a black apron and white shirt' },
        { id: Utils.uid(), name: 'Miguel S.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA61SZNax6GIruBx0eIN4aaRUov03GKgiiXEIjD4Y5nqBBCON2UDmZS24r65AjxRLtfy7RAjxRx8hVg7WDRKKpuHPMOB8jht8cipBo_tC5jtiWeDNuhV-bJgDOeciId6Oq6PJVycBp9c0EoJCSOFAOAuziWkSvu7p43LezD_B2FNMaX46JR5un6y2O0ppctGYzn1HBivucQ0YHaNUiwIRhPvtm742456dvAvMj11mJaTHAJBPRZERGmDWkDdAwaU8O5fL5WwC5J8wSH', alt: 'Small circular avatar of a professional waiter in a black vest' },
        { id: Utils.uid(), name: 'Ana L.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDVt6qPitS08adJo6ah3KZGhqVkF5ClsOJAO7_k1wtUQL3yqFOa5-j24ySYFakZGnRfzzKCl4eo_Tfy4XCVmc8SQ7TlXMGz3bVjXcvlnYPAVPH6QHcHXdYiX3r5-GqGUQOdq0daUKyiwTh22jt5ExzMYQc_b6kXSVgXgMYsPLr8oDxCEyY8Dquz96ICqLmuJOHbF7uyFO58kroWFm1EEHJCkSYk2K4bOC1GZJCOApmGYEgt9f76b46oNzS_Ofz4YQDsASqdC0O_7Nxi', alt: 'Small circular avatar of a professional waitress with dark hair' }
      ],
      activeRoom: null,
      roomOrder: []
    };
  }

  var store = null;

  function loadStore() {
    var saved = Utils.storage.get(STORE_KEY);
    if (saved && saved.rooms && saved.tables && saved.waitstaff) {
      store = saved;
      if (!store.roomOrder) store.roomOrder = [];
      return;
    }
    var defs = getDefaults();
    var rooms = defs.rooms;
    store = {
      rooms: rooms,
      tables: defs.tables,
      waitstaff: defs.waitstaff,
      activeRoom: null,
      roomOrder: rooms.map(function (r) { return r.id; })
    };
    store.tables.forEach(function (t) {
      if (t.room === null) {
        var idx = store.tables.indexOf(t);
        if (idx < 5) t.room = rooms[0].id;
        else if (idx < 8) t.room = rooms[1].id;
        else if (idx < 10) t.room = rooms[2].id;
        else t.room = rooms[3].id;
      }
    });
    Utils.storage.set(STORE_KEY, store);
  }

  function saveStore() {
    Utils.storage.set(STORE_KEY, store);
  }

  function getRoom(id) {
    for (var i = 0; i < store.rooms.length; i++) {
      if (store.rooms[i].id === id) return store.rooms[i];
    }
    return null;
  }

  function getWaitstaff(id) {
    for (var i = 0; i < store.waitstaff.length; i++) {
      if (store.waitstaff[i].id === id) return store.waitstaff[i];
    }
    return null;
  }

  function getFilteredTables() {
    if (!store.activeRoom) return store.tables;
    return store.tables.filter(function (t) { return t.room === store.activeRoom; });
  }

  function getMetrics() {
    var tables = store.tables;
    var total = tables.length;
    var occupied = 0, available = 0, reserved = 0, billRequested = 0;
    var totalCap = 0, occCap = 0;
    for (var i = 0; i < tables.length; i++) {
      var t = tables[i];
      totalCap += t.capacity || 0;
      switch (t.status) {
        case 'occupied': occupied++; occCap += t.capacity || 0; break;
        case 'available': available++; break;
        case 'reserved': reserved++; break;
        case 'bill_requested': billRequested++; occCap += t.capacity || 0; break;
      }
    }
    return {
      total: total,
      occupied: occupied,
      available: available,
      reserved: reserved,
      billRequested: billRequested,
      occupancyPct: total ? Math.round((occupied + billRequested) / total * 100) : 0,
      totalCapacity: totalCap,
      occupiedCapacity: occCap
    };
  }

  function renderRoomFilters() {
    var container = document.getElementById('room-filters');
    if (!container) return;
    var allActive = !store.activeRoom;
    var html = '<button data-room="" class="px-4 py-1.5 rounded-md font-label-md text-label-md ' + (allActive ? 'bg-surface-container-lowest shadow-sm text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container/50') + '">All</button>';
    for (var i = 0; i < store.rooms.length; i++) {
      var r = store.rooms[i];
      var active = store.activeRoom === r.id;
      html += '<button data-room="' + r.id + '" class="px-4 py-1.5 rounded-md font-label-md text-label-md ' + (active ? 'bg-surface-container-lowest shadow-sm text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container/50') + '">' + r.name + '</button>';
    }
    container.innerHTML = html;
  }

  function renderTables() {
    var container = document.getElementById('tables-map');
    if (!container) return;
    var tables = getFilteredTables();
    if (!tables.length) {
      container.innerHTML = '<div class="absolute inset-0 flex items-center justify-center text-on-surface-variant font-body-md text-body-md">No tables in this area</div>';
      return;
    }
    var html = '';
    for (var i = 0; i < tables.length; i++) {
      var t = tables[i];
      var room = t.room ? getRoom(t.room) : null;
      var ws = t.waitstaff ? getWaitstaff(t.waitstaff) : null;
      var shapeClass = t.shape === 'round' ? 'rounded-full' : 'rounded-lg';
      var wsBadge = ws ? '<div class="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-surface-container-lowest border border-outline-variant rounded-full px-2 py-0.5 text-xs font-label-md text-on-surface-variant whitespace-nowrap shadow-sm">' + ws.name + '</div>' : '';
      var inner = '';
      var statusClass = '';
      switch (t.status) {
        case 'occupied':
          statusClass = 'bg-surface-container-lowest border-2 border-primary-container shadow-sm';
          inner = wsBadge;
          if (t.capacity) {
            inner += '<div class="absolute -top-2.5 -right-2.5 w-6 h-6 bg-primary-container rounded-full flex items-center justify-center text-on-primary border-2 border-surface-container-lowest shadow-sm"><span class="font-label-md text-[10px]">' + t.capacity + '</span></div>';
          }
          inner += '<span class="font-headline-md text-headline-md text-on-surface font-bold">' + t.name + '</span><div class="flex gap-2 mt-1">';
          if (t.time) inner += '<span class="font-data-mono text-data-mono text-primary bg-primary-container/10 px-2 py-0.5 rounded text-xs">' + t.time + '</span>';
          if (t.vip) inner += '<span class="font-data-mono text-data-mono text-on-surface-variant bg-surface-variant px-2 py-0.5 rounded text-xs">VIP</span>';
          inner += '</div>';
          break;
        case 'available':
          statusClass = 'bg-surface-container-lowest border border-outline-variant shadow-sm';
          inner = wsBadge + '<div class="absolute top-1.5 right-1.5 w-3 h-3 bg-tertiary-fixed-dim rounded-full shadow-sm"></div><span class="font-headline-md text-headline-md text-on-surface font-bold">' + t.name + '</span>';
          if (t.pax) inner += '<span class="font-label-md text-label-md text-on-surface-variant mt-1">' + t.pax + ' pax</span>';
          break;
        case 'bill_requested':
          statusClass = 'bg-surface-container-lowest border-2 border-yellow-500 shadow-sm pulse-yellow';
          inner = wsBadge + '<div class="absolute -top-2.5 -left-2.5 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white border-2 border-surface-container-lowest shadow-sm"><span class="material-symbols-outlined text-[14px]">receipt_long</span></div><span class="font-headline-md text-headline-md text-on-surface font-bold">' + t.name + '</span>';
          if (t.amount !== undefined) inner += '<span class="font-data-mono text-data-mono text-yellow-600 mt-1 font-bold">' + Utils.formatCurrency(t.amount) + '</span>';
          break;
        case 'reserved':
          statusClass = 'bg-surface-container border border-outline-variant opacity-80';
          inner = wsBadge + '<span class="material-symbols-outlined text-on-surface-variant mb-1">calendar_month</span><span class="font-headline-md text-headline-md text-on-surface-variant font-bold">' + t.name + '</span>';
          if (t.time) inner += '<span class="font-label-md text-label-md text-on-surface-variant mt-1">' + t.time + '</span>';
          break;
      }
      html += '<div class="absolute flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 ' + shapeClass + ' ' + statusClass + '" style="left:' + t.x + '%;top:' + t.y + '%;width:' + t.w + 'px;height:' + t.h + 'px;" data-table-id="' + t.id + '">' + inner + '</div>';
    }
    container.innerHTML = html;
  }

  function renderRoomStatus() {
    var container = document.getElementById('room-status');
    if (!container) return;
    var m = getMetrics();
    container.innerHTML = '<h2 class="font-headline-md text-headline-md-mobile text-on-surface font-bold mb-4">Room Status</h2><div class="grid grid-cols-2 gap-4 mb-6"><div class="flex flex-col"><span class="font-label-md text-label-md text-on-surface-variant mb-1">Occupancy</span><div class="flex items-end gap-1"><span class="font-headline-lg text-headline-lg-mobile font-bold text-primary">' + m.occupancyPct + '%</span><span class="font-body-sm text-body-sm text-on-surface-variant pb-1">/ ' + m.totalCapacity + ' pax</span></div></div><div class="flex flex-col"><span class="font-label-md text-label-md text-on-surface-variant mb-1">Tables</span><div class="flex items-end gap-1"><span class="font-headline-lg text-headline-lg-mobile font-bold text-on-surface">' + m.total + '</span></div></div></div><div class="space-y-3"><div class="flex justify-between items-center py-2 border-b border-outline-variant/50"><span class="font-body-sm text-body-sm text-on-surface">Occupied</span><span class="font-data-mono text-data-mono font-bold bg-primary-container/10 text-primary px-2 py-1 rounded">' + m.occupied + '</span></div><div class="flex justify-between items-center py-2 border-b border-outline-variant/50"><span class="font-body-sm text-body-sm text-on-surface">Available</span><span class="font-data-mono text-data-mono font-bold bg-tertiary-fixed-dim/10 text-on-surface px-2 py-1 rounded">' + m.available + '</span></div><div class="flex justify-between items-center py-2 border-b border-outline-variant/50"><span class="font-body-sm text-body-sm text-on-surface">Bill Requested</span><span class="font-data-mono text-data-mono font-bold bg-yellow-100 text-yellow-800 px-2 py-1 rounded">' + m.billRequested + '</span></div><div class="flex justify-between items-center py-2"><span class="font-body-sm text-body-sm text-on-surface">Reserved</span><span class="font-data-mono text-data-mono font-bold bg-surface-container px-2 py-1 rounded">' + m.reserved + '</span></div></div>';
  }

  function renderWaitstaff() {
    var container = document.getElementById('waitstaff-list');
    if (!container) return;
    var html = '';
    for (var i = 0; i < store.waitstaff.length; i++) {
      var w = store.waitstaff[i];
      var count = 0;
      for (var j = 0; j < store.tables.length; j++) {
        if (store.tables[j].waitstaff === w.id) count++;
      }
      html += '<div class="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-container transition-colors cursor-pointer border border-transparent hover:border-outline-variant/50" data-waitstaff-id="' + w.id + '"><div class="relative"><img class="w-10 h-10 rounded-full object-cover" alt="' + (w.alt || '') + '" src="' + w.image + '"><div class="absolute bottom-0 right-0 w-3 h-3 bg-tertiary-fixed-dim border-2 border-surface-container-lowest rounded-full"></div></div><div class="flex-1"><p class="font-body-sm text-body-sm font-semibold text-on-surface">' + w.name + '</p><p class="font-label-md text-label-md text-on-surface-variant">' + count + ' Table' + (count !== 1 ? 's' : '') + ' Active</p></div></div>';
    }
    container.innerHTML = html;
  }

  function render() {
    renderRoomFilters();
    renderTables();
    renderRoomStatus();
    renderWaitstaff();
  }

  function openTableModal(tableId) {
    var t = null;
    for (var i = 0; i < store.tables.length; i++) {
      if (store.tables[i].id === tableId) { t = store.tables[i]; break; }
    }
    if (!t) return;
    var roomName = '';
    if (t.room) {
      var rm = getRoom(t.room);
      if (rm) roomName = rm.name;
    }
    var statusRadios = '';
    for (var si = 0; si < STATUSES.length; si++) {
      var s = STATUSES[si];
      var checked = s === t.status ? ' checked' : '';
      statusRadios += '<label class="flex items-center gap-2 p-2 rounded hover:bg-surface-container cursor-pointer"><input type="radio" name="ts-' + tableId + '" value="' + s + '"' + checked + '><span class="font-label-md text-label-md text-on-surface capitalize">' + s.replace(/_/g, ' ') + '</span></label>';
    }
    var wsOptions = '<option value="">None</option>';
    for (var wi = 0; wi < store.waitstaff.length; wi++) {
      var w = store.waitstaff[wi];
      var sel = t.waitstaff === w.id ? ' selected' : '';
      wsOptions += '<option value="' + w.id + '"' + sel + '>' + w.name + '</option>';
    }
    var content = '<div class="space-y-4" data-table-edit-id="' + tableId + '"><div class="flex items-center justify-between"><span class="font-headline-md text-headline-md text-on-surface font-bold">' + t.name + '</span><span class="font-label-md text-label-md capitalize px-3 py-1 rounded-full bg-surface-container">' + roomName + '</span></div><div><p class="font-label-md text-label-md text-on-surface-variant mb-2">Change Status</p><div class="space-y-1">' + statusRadios + '</div></div><div><p class="font-label-md text-label-md text-on-surface-variant mb-2">Assign Waitstaff</p><select class="tw-select w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-md font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary">' + wsOptions + '</select></div><div class="flex gap-2 pt-2 border-t border-outline-variant/50"><button class="tw-edit-btn flex-1 px-3 py-2 border border-outline-variant rounded-md font-label-md text-label-md text-on-surface hover:bg-surface-container transition-colors">Edit</button><button class="tw-delete-btn flex-1 px-3 py-2 border border-error/30 rounded-md font-label-md text-label-md text-error hover:bg-error/5 transition-colors">Delete</button></div></div>';

    Utils.modal({
      title: 'Table Actions',
      content: content,
      confirmText: 'Save',
      cancelText: 'Cancel',
      onConfirm: function () {
        var body = document.querySelector('[data-table-edit-id]');
        if (!body) return;
        var id = body.getAttribute('data-table-edit-id');
        var table = null;
        for (var i = 0; i < store.tables.length; i++) {
          if (store.tables[i].id === id) { table = store.tables[i]; break; }
        }
        if (!table) return;
        var selRadio = body.querySelector('input[type="radio"]:checked');
        var selWS = body.querySelector('.tw-select');
        if (selRadio) table.status = selRadio.value;
        if (selWS) table.waitstaff = selWS.value || null;
        saveStore();
        render();
        Utils.notify('Table ' + table.name + ' updated', 'success');
      }
    });

    setTimeout(function () {
      var editBtn = document.querySelector('.tw-edit-btn');
      var deleteBtn = document.querySelector('.tw-delete-btn');
      if (editBtn) {
        editBtn.addEventListener('click', function () {
          openEditTable(tableId);
        });
      }
      if (deleteBtn) {
        deleteBtn.addEventListener('click', function () {
          Utils.confirm('Delete ' + t.name + '?', function () {
            store.tables = store.tables.filter(function (x) { return x.id !== tableId; });
            saveStore();
            render();
            Utils.notify('Table deleted', 'info');
          });
        });
      }
    }, 50);
  }

  function openEditTable(tableId) {
    var t = null;
    for (var i = 0; i < store.tables.length; i++) {
      if (store.tables[i].id === tableId) { t = store.tables[i]; break; }
    }
    if (!t) return;
    var roomOptions = '';
    for (var ri = 0; ri < store.rooms.length; ri++) {
      var r = store.rooms[ri];
      var sel = r.id === t.room ? ' selected' : '';
      roomOptions += '<option value="' + r.id + '"' + sel + '>' + r.name + '</option>';
    }
    var statusOptions = '';
    for (var si = 0; si < STATUSES.length; si++) {
      var s = STATUSES[si];
      sel = s === t.status ? ' selected' : '';
      statusOptions += '<option value="' + s + '"' + sel + '>' + s.replace(/_/g, ' ') + '</option>';
    }
    var shapeOpts = '<option value="rect"' + (t.shape === 'rect' ? ' selected' : '') + '>Rectangle</option><option value="round"' + (t.shape === 'round' ? ' selected' : '') + '>Round</option>';
    var content = '<form id="edit-table-form" class="space-y-4"><div><label class="font-label-md text-label-md text-on-surface-variant">Name</label><input name="name" value="' + t.name + '" required class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-md font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary"></div><div><label class="font-label-md text-label-md text-on-surface-variant">Room</label><select name="room" class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-md font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary">' + roomOptions + '</select></div><div><label class="font-label-md text-label-md text-on-surface-variant">Status</label><select name="status" class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-md font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary">' + statusOptions + '</select></div><div class="grid grid-cols-2 gap-4"><div><label class="font-label-md text-label-md text-on-surface-variant">Capacity</label><input name="capacity" type="number" min="1" value="' + (t.capacity || 2) + '" class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-md font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary"></div><div><label class="font-label-md text-label-md text-on-surface-variant">Shape</label><select name="shape" class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-md font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary">' + shapeOpts + '</select></div></div><div class="grid grid-cols-2 gap-4"><div><label class="font-label-md text-label-md text-on-surface-variant">X Position (%)</label><input name="x" type="number" min="0" max="100" step="0.1" value="' + t.x + '" class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-md font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary"></div><div><label class="font-label-md text-label-md text-on-surface-variant">Y Position (%)</label><input name="y" type="number" min="0" max="100" step="0.1" value="' + t.y + '" class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-md font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary"></div></div></form>';

    Utils.modal({
      title: 'Edit Table',
      content: content,
      confirmText: 'Save',
      cancelText: 'Cancel',
      onConfirm: function () {
        var form = document.getElementById('edit-table-form');
        if (!form) return;
        var fd = new FormData(form);
        var data = {};
        fd.forEach(function (v, k) { data[k] = v; });
        if (!data.name || !data.name.trim()) {
          Utils.notify('Table name is required', 'error');
          return;
        }
        t.name = data.name.trim();
        t.room = data.room;
        t.status = data.status;
        t.capacity = parseInt(data.capacity) || 2;
        t.shape = data.shape || 'rect';
        t.x = parseFloat(data.x) || 0;
        t.y = parseFloat(data.y) || 0;
        delete t.pax;
        delete t.time;
        delete t.amount;
        delete t.vip;
        if (t.status === 'available') t.pax = t.capacity;
        if (t.status === 'occupied') t.time = '0m';
        if (t.status === 'bill_requested') t.amount = 0;
        if (t.status === 'reserved') t.time = '--:--';
        t.w = t.shape === 'round' ? 85 : 100;
        t.h = t.shape === 'round' ? 85 : 75;
        saveStore();
        render();
        Utils.notify('Table updated', 'success');
      }
    });
  }

  function openAddTable() {
    var roomOptions = '';
    for (var ri = 0; ri < store.rooms.length; ri++) {
      roomOptions += '<option value="' + store.rooms[ri].id + '">' + store.rooms[ri].name + '</option>';
    }
    var statusOptions = '';
    for (var si = 0; si < STATUSES.length; si++) {
      statusOptions += '<option value="' + STATUSES[si] + '">' + STATUSES[si].replace(/_/g, ' ') + '</option>';
    }
    var content = '<form id="add-table-form" class="space-y-4"><div><label class="font-label-md text-label-md text-on-surface-variant">Name</label><input name="name" required class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-md font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary" placeholder="Table name"></div><div><label class="font-label-md text-label-md text-on-surface-variant">Room</label><select name="room" class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-md font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary">' + roomOptions + '</select></div><div><label class="font-label-md text-label-md text-on-surface-variant">Status</label><select name="status" class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-md font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary">' + statusOptions + '</select></div><div class="grid grid-cols-2 gap-4"><div><label class="font-label-md text-label-md text-on-surface-variant">Capacity</label><input name="capacity" type="number" min="1" value="2" class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-md font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary"></div><div><label class="font-label-md text-label-md text-on-surface-variant">Shape</label><select name="shape" class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-md font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary"><option value="rect">Rectangle</option><option value="round">Round</option></select></div></div><div class="grid grid-cols-2 gap-4"><div><label class="font-label-md text-label-md text-on-surface-variant">X Position (%)</label><input name="x" type="number" min="0" max="100" step="0.1" value="10" class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-md font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary"></div><div><label class="font-label-md text-label-md text-on-surface-variant">Y Position (%)</label><input name="y" type="number" min="0" max="100" step="0.1" value="20" class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-md font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary"></div></div></form>';

    Utils.modal({
      title: 'Add New Table',
      content: content,
      confirmText: 'Add',
      cancelText: 'Cancel',
      onConfirm: function () {
        var form = document.getElementById('add-table-form');
        if (!form) return;
        var fd = new FormData(form);
        var data = {};
        fd.forEach(function (v, k) { data[k] = v; });
        if (!data.name || !data.name.trim()) {
          Utils.notify('Table name is required', 'error');
          return;
        }
        var shape = data.shape || 'rect';
        var newTable = {
          id: Utils.uid(),
          name: data.name.trim(),
          room: data.room || store.rooms[0].id,
          status: data.status || 'available',
          capacity: parseInt(data.capacity) || 2,
          shape: shape,
          x: parseFloat(data.x) || 10,
          y: parseFloat(data.y) || 20,
          w: shape === 'round' ? 85 : 100,
          h: shape === 'round' ? 85 : 75,
          waitstaff: null
        };
        if (newTable.status === 'available') newTable.pax = newTable.capacity;
        if (newTable.status === 'occupied') newTable.time = '0m';
        if (newTable.status === 'bill_requested') newTable.amount = 0;
        if (newTable.status === 'reserved') newTable.time = '--:--';
        store.tables.push(newTable);
        saveStore();
        render();
        Utils.notify('Table ' + newTable.name + ' added', 'success');
      }
    });
  }

  function setupEventListeners() {
    var roomFilters = document.getElementById('room-filters');
    if (roomFilters) {
      roomFilters.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-room]');
        if (!btn) return;
        store.activeRoom = btn.getAttribute('data-room') || null;
        saveStore();
        render();
      });
    }

    var tablesMap = document.getElementById('tables-map');
    if (tablesMap) {
      tablesMap.addEventListener('click', function (e) {
        var el = e.target.closest('[data-table-id]');
        if (!el) return;
        openTableModal(el.getAttribute('data-table-id'));
      });
    }

    var wsList = document.getElementById('waitstaff-list');
    if (wsList) {
      wsList.addEventListener('click', function (e) {
        var el = e.target.closest('[data-waitstaff-id]');
        if (!el) return;
        var wsId = el.getAttribute('data-waitstaff-id');
        var ws = null;
        for (var i = 0; i < store.waitstaff.length; i++) {
          if (store.waitstaff[i].id === wsId) { ws = store.waitstaff[i]; break; }
        }
        if (!ws) return;
        var assigned = [];
        for (var j = 0; j < store.tables.length; j++) {
          if (store.tables[j].waitstaff === wsId) assigned.push(store.tables[j].name);
        }
        var msg = ws.name + ' has ' + assigned.length + ' table' + (assigned.length !== 1 ? 's' : '');
        if (assigned.length) msg += ': ' + assigned.join(', ');
        Utils.notify(msg, 'info');
      });
    }

    var toolbar = document.querySelector('#room-filters');
    if (toolbar) {
      var rightGroup = toolbar.parentElement ? toolbar.parentElement.querySelector('.flex.items-center.gap-4') : null;
      if (!rightGroup) {
        var parent = toolbar.parentElement;
        if (parent) {
          var allChildren = parent.children;
          for (var ci = 0; ci < allChildren.length; ci++) {
            if (allChildren[ci] !== toolbar && allChildren[ci].querySelector) {
              var possible = allChildren[ci].querySelector('.flex.items-center.gap-4');
              if (possible) { rightGroup = possible; break; }
              if (allChildren[ci].classList.contains('flex') && allChildren[ci].classList.contains('items-center')) {
                var spans = allChildren[ci].querySelectorAll('span');
                for (var spi = 0; spi < spans.length; spi++) {
                  if (spans[spi].textContent.indexOf('Available') >= 0) {
                    rightGroup = allChildren[ci].parentElement;
                    break;
                  }
                }
              }
            }
          }
        }
      }
      if (rightGroup) {
        var addBtn = document.createElement('button');
        addBtn.className = 'flex items-center justify-center p-2 rounded-md bg-primary text-on-primary hover:bg-primary/90 transition-colors shadow-sm';
        addBtn.id = 'add-table-btn';
        addBtn.title = 'Add Table';
        addBtn.innerHTML = '<span class="material-symbols-outlined text-sm">add</span>';
        addBtn.addEventListener('click', openAddTable);
        rightGroup.insertBefore(addBtn, rightGroup.firstChild);
      }
    }

    var allBtns = document.querySelectorAll('button');
    for (var bi = 0; bi < allBtns.length; bi++) {
      var btn = allBtns[bi];
      if (btn.textContent.indexOf('Walk-in') >= 0 || btn.textContent.indexOf('walk-in') >= 0) {
        if (btn.getAttribute('data-walkin-bound')) continue;
        btn.setAttribute('data-walkin-bound', '1');
        btn.addEventListener('click', function () {
          var roomOpts = '';
          for (var ri = 0; ri < store.rooms.length; ri++) {
            roomOpts += '<option value="' + store.rooms[ri].id + '">' + store.rooms[ri].name + '</option>';
          }
          var content = '<form id="walkin-form" class="space-y-4"><div><label class="font-label-md text-label-md text-on-surface-variant">Table</label><input name="name" required class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-md font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary" placeholder="Walk-in 1"></div><div><label class="font-label-md text-label-md text-on-surface-variant">Pax</label><input name="capacity" type="number" min="1" value="2" class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-md font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary"></div><div><label class="font-label-md text-label-md text-on-surface-variant">Room</label><select name="room" class="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-md font-body-sm text-body-sm text-on-surface focus:outline-none focus:border-primary">' + roomOpts + '</select></div></form>';
          Utils.modal({
            title: 'New Walk-in',
            content: content,
            confirmText: 'Add',
            cancelText: 'Cancel',
            onConfirm: function () {
              var form = document.getElementById('walkin-form');
              if (!form) return;
              var fd = new FormData(form);
              var d = {};
              fd.forEach(function (v, k) { d[k] = v; });
              if (!d.name || !d.name.trim()) {
                Utils.notify('Table name is required', 'error');
                return;
              }
              var nt = {
                id: Utils.uid(),
                name: d.name.trim(),
                room: d.room || store.rooms[0].id,
                status: 'occupied',
                x: 15,
                y: 30,
                w: 100,
                h: 75,
                shape: 'rect',
                capacity: parseInt(d.capacity) || 2,
                waitstaff: null,
                time: '0m'
              };
              store.tables.push(nt);
              saveStore();
              render();
              Utils.notify('Walk-in added', 'success');
            }
          });
        });
      }
    }
  }

  loadStore();
  render();
  setupEventListeners();

})();
