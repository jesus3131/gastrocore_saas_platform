var geofences = [];
var STORAGE_KEY = 'mk_geofences';

(function() {
  var SAMPLE = [
    { id: Utils.uid(), name: 'Downtown Flagship Zone', lat: 25.7617, lng: -80.1918, radius: 500, status: 'Active', promotions: 'Lunch Special 20% off', address: '50 SE 3rd Ave, Miami, FL' },
    { id: Utils.uid(), name: 'South Beach Hotspot', lat: 25.7826, lng: -80.1340, radius: 300, status: 'Active', promotions: 'Happy Hour 2x1', address: '1200 Ocean Dr, Miami Beach, FL' },
    { id: Utils.uid(), name: 'Airport Terminal D', lat: 25.7933, lng: -80.2719, radius: 200, status: 'Active', promotions: 'Traveler Discount 15%', address: '4200 NW 21st St, Miami, FL' },
    { id: Utils.uid(), name: 'Brickell Business District', lat: 25.7634, lng: -80.1923, radius: 400, status: 'Paused', promotions: 'Corporate Lunch Menu', address: '1000 Brickell Ave, Miami, FL' },
    { id: Utils.uid(), name: 'Coral Gables Campus', lat: 25.7215, lng: -80.2794, radius: 600, status: 'Active', promotions: 'Student Discount 10%', address: '1320 S Dixie Hwy, Coral Gables, FL' }
  ];

  var data = Utils.storage.get(STORAGE_KEY, null);
  if (!data || !data.length) { Utils.storage.set(STORAGE_KEY, SAMPLE); geofences = SAMPLE.slice(); }
  else geofences = data.slice();

  var MAP_BOUNDS = { minLat: 25.70, maxLat: 25.82, minLng: -80.30, maxLng: -80.10 };

  function latLngToPercent(lat, lng) {
    var px = ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * 100;
    var py = ((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * 100;
    return { x: Math.min(95, Math.max(5, px)), y: Math.min(95, Math.max(5, py)) };
  }

  function computeKPIs() {
    var active = geofences.filter(function(g) { return g.status === 'Active'; }).length;
    var impressions = geofences.reduce(function(sum) { return sum + Math.floor(Math.random() * 500) + 100; }, 0);
    var redemptions = geofences.reduce(function(sum, g) {
      return sum + (g.status === 'Active' ? Math.floor(Math.random() * 80) + 10 : 0);
    }, 0);
    return { active: active, impressions: impressions, redemptions: redemptions };
  }

  function renderKPIs() {
    var k = computeKPIs();
    var container = document.getElementById('kpiContainer3');
    if (!container) return;
    container.innerHTML =
      '<div class="bg-surface-container-lowest border border-surface-container-high rounded-xl p-md flex flex-col justify-between hover:-translate-y-px transition-transform duration-200">' +
        '<div class="flex justify-between items-start mb-md"><span class="font-body-sm text-body-sm text-on-surface-variant">Active Geofences</span><span class="material-symbols-outlined text-[#1e3a8a] text-[20px]">location_on</span></div>' +
        '<div class="flex items-baseline gap-sm"><span class="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-data-mono">' + k.active + '</span></div>' +
      '</div>' +
      '<div class="bg-surface-container-lowest border border-surface-container-high rounded-xl p-md flex flex-col justify-between hover:-translate-y-px transition-transform duration-200">' +
        '<div class="flex justify-between items-start mb-md"><span class="font-body-sm text-body-sm text-on-surface-variant">Today\'s Impressions</span><span class="material-symbols-outlined text-[#1e3a8a] text-[20px]">visibility</span></div>' +
        '<div class="flex items-baseline gap-sm"><span class="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-data-mono">' + k.impressions.toLocaleString() + '</span></div>' +
      '</div>' +
      '<div class="bg-surface-container-lowest border border-surface-container-high rounded-xl p-md flex flex-col justify-between hover:-translate-y-px transition-transform duration-200">' +
        '<div class="flex justify-between items-start mb-md"><span class="font-body-sm text-body-sm text-on-surface-variant">Redemptions</span><span class="material-symbols-outlined text-[#1e3a8a] text-[20px]">redeem</span></div>' +
        '<div class="flex items-baseline gap-sm"><span class="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-data-mono">' + k.redemptions.toLocaleString() + '</span></div>' +
      '</div>';
  }

  function renderMarkers() {
    var container = document.getElementById('geofenceMarkers');
    if (!container) return;
    container.innerHTML = geofences.map(function(g) {
      var pos = latLngToPercent(g.lat, g.lng);
      var rPct = Math.min(15, Math.max(3, g.radius / 500));
      var isActive = g.status === 'Active';
      return '<div class="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group" style="left:' + pos.x + '%;top:' + pos.y + '%;z-index:10">' +
        '<div class="w-6 h-6 rounded-full ' + (isActive ? 'bg-[#1e3a8a]' : 'bg-gray-400') + ' flex items-center justify-center shadow-lg border-2 border-white relative">' +
          '<span class="material-symbols-outlined text-white text-[14px]" style="font-variation-settings:\'FILL\' 1">location_on</span>' +
        '</div>' +
        '<div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[' + (rPct * 10) + 'px] h-[' + (rPct * 10) + 'px] rounded-full ' + (isActive ? 'bg-[#1e3a8a]/20' : 'bg-gray-400/20') + ' border-2 border-dashed ' + (isActive ? 'border-[#1e3a8a]/30' : 'border-gray-400/30') + '" style="width:' + (rPct * 8) + 'px;height:' + (rPct * 8) + 'px;"></div>' +
        '<div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 whitespace-nowrap bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow text-xs font-medium hidden group-hover:block">' +
          g.name + ' (' + g.radius + 'm)' +
        '</div>' +
      '</div>';
    }).join('');
  }

  function renderList() {
    var list = document.getElementById('geofencesList');
    if (!list) return;
    var searchVal = document.getElementById('searchGeofences') ? document.getElementById('searchGeofences').value.toLowerCase() : '';
    var filtered = geofences.filter(function(g) {
      return searchVal === '' || g.name.toLowerCase().indexOf(searchVal) > -1 || g.address.toLowerCase().indexOf(searchVal) > -1;
    });
    list.innerHTML = filtered.length === 0
      ? '<div class="p-md text-center text-on-surface-variant">No geofences found.</div>'
      : filtered.map(function(g) {
          var isActive = g.status === 'Active';
          return '<div class="p-md border-b border-surface-container-high hover:bg-surface-container-low transition-colors group" data-id="' + g.id + '">' +
            '<div class="flex items-start justify-between mb-sm">' +
              '<div class="flex items-center gap-sm">' +
                '<div class="w-8 h-8 rounded-lg ' + (isActive ? 'bg-[#1e3a8a]' : 'bg-gray-400') + ' flex items-center justify-center"><span class="material-symbols-outlined text-white text-[16px]" style="font-variation-settings:\'FILL\' 1">location_on</span></div>' +
                '<div><h4 class="font-body-md text-body-md font-semibold text-on-surface">' + g.name + '</h4><p class="text-on-surface-variant text-xs">' + g.address + '</p></div>' +
              '</div>' +
              '<span class="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-label-md uppercase ' + (isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800') + '">' +
                '<span class="w-1.5 h-1.5 rounded-full ' + (isActive ? 'bg-green-500' : 'bg-yellow-500') + '"></span>' + g.status +
              '</span>' +
            '</div>' +
            '<div class="flex items-center gap-3 text-xs text-on-surface-variant mb-sm">' +
              '<span class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">radio_button_checked</span>' + g.radius + 'm radius</span>' +
              '<span class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">pin_drop</span>' + g.lat.toFixed(4) + ', ' + g.lng.toFixed(4) + '</span>' +
              '<span class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">confirmation_number</span>' + (g.promotions ? '1 promo' : '0 promos') + '</span>' +
            '</div>' +
            (g.promotions ? '<div class="inline-flex items-center gap-1 px-2 py-1 rounded bg-secondary-container text-on-secondary-container text-[10px] font-label-md">' + g.promotions + '</div>' : '') +
            '<div class="flex gap-1 mt-sm opacity-0 group-hover:opacity-100 transition-opacity">' +
              '<button class="edit-btn text-xs px-2 py-1 rounded border hover:bg-surface-container-high text-on-surface-variant" data-id="' + g.id + '">Edit</button>' +
              '<button class="toggle-btn text-xs px-2 py-1 rounded border hover:bg-surface-container-high text-on-surface-variant" data-id="' + g.id + '">' + (isActive ? 'Pause' : 'Activate') + '</button>' +
              '<button class="delete-btn text-xs px-2 py-1 rounded border hover:bg-red-100 text-red-600" data-id="' + g.id + '">Delete</button>' +
            '</div>' +
          '</div>';
        }).join('');
    attachListEvents();
  }

  function attachListEvents() {
    document.querySelectorAll('#geofencesList .edit-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = btn.dataset.id;
        var g = geofences.find(function(x) { return x.id === id; });
        if (!g) return;
        showGeofenceForm(g);
      });
    });
    document.querySelectorAll('#geofencesList .toggle-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = btn.dataset.id;
        var g = geofences.find(function(x) { return x.id === id; });
        if (!g) return;
        g.status = g.status === 'Active' ? 'Paused' : 'Active';
        persistAndRender();
        Utils.notify('Geofence ' + (g.status === 'Active' ? 'activated' : 'paused'), 'info');
      });
    });
    document.querySelectorAll('#geofencesList .delete-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = btn.dataset.id;
        Utils.confirm('Delete this geofence?', function() {
          geofences = geofences.filter(function(x) { return x.id !== id; });
          persistAndRender();
          Utils.notify('Geofence deleted', 'success');
        });
      });
    });
  }

  function showGeofenceForm(existing) {
    var isEdit = !!existing;
    var data = existing || { name: '', address: '', lat: 25.76, lng: -80.19, radius: 300, status: 'Active', promotions: '' };
    var content =
      '<div class="space-y-3">' +
        '<div><label class="block text-sm font-medium text-gray-700 mb-1">Zone Name</label><input id="gf-name" type="text" value="' + data.name + '" class="w-full border rounded-lg px-3 py-2 text-sm" /></div>' +
        '<div><label class="block text-sm font-medium text-gray-700 mb-1">Address</label><input id="gf-address" type="text" value="' + data.address + '" class="w-full border rounded-lg px-3 py-2 text-sm" /></div>' +
        '<div class="grid grid-cols-2 gap-2">' +
          '<div><label class="block text-sm font-medium text-gray-700 mb-1">Latitude</label><input id="gf-lat" type="number" step="0.0001" value="' + data.lat + '" class="w-full border rounded-lg px-3 py-2 text-sm" /></div>' +
          '<div><label class="block text-sm font-medium text-gray-700 mb-1">Longitude</label><input id="gf-lng" type="number" step="0.0001" value="' + data.lng + '" class="w-full border rounded-lg px-3 py-2 text-sm" /></div>' +
        '</div>' +
        '<div><label class="block text-sm font-medium text-gray-700 mb-1">Radius: <span id="radiusVal">' + data.radius + '</span>m</label>' +
          '<input id="gf-radius" type="range" min="50" max="5000" step="50" value="' + data.radius + '" class="w-full" oninput="document.getElementById(\'radiusVal\').textContent=this.value" /></div>' +
        '<div><label class="block text-sm font-medium text-gray-700 mb-1">Status</label><select id="gf-status" class="w-full border rounded-lg px-3 py-2 text-sm">' +
          '<option value="Active" ' + (data.status === 'Active' ? 'selected' : '') + '>Active</option>' +
          '<option value="Paused" ' + (data.status === 'Paused' ? 'selected' : '') + '>Paused</option>' +
        '</select></div>' +
        '<div><label class="block text-sm font-medium text-gray-700 mb-1">Active Promotion</label><input id="gf-promotions" type="text" value="' + data.promotions + '" class="w-full border rounded-lg px-3 py-2 text-sm" placeholder="e.g. Happy Hour 2x1" /></div>' +
      '</div>';
    Utils.modal({
      title: isEdit ? 'Edit Geofence' : 'New Geofence',
      content: content,
      confirmText: isEdit ? 'Save' : 'Create Geofence',
      onConfirm: function() {
        var val = {
          name: document.getElementById('gf-name').value,
          address: document.getElementById('gf-address').value,
          lat: Number(document.getElementById('gf-lat').value) || 25.76,
          lng: Number(document.getElementById('gf-lng').value) || -80.19,
          radius: Number(document.getElementById('gf-radius').value) || 300,
          status: document.getElementById('gf-status').value,
          promotions: document.getElementById('gf-promotions').value
        };
        if (!val.name) { Utils.notify('Zone name is required', 'error'); return; }
        if (isEdit) {
          Object.assign(existing, val);
        } else {
          val.id = Utils.uid();
          geofences.push(val);
        }
        persistAndRender();
        Utils.notify(isEdit ? 'Geofence updated' : 'Geofence created', 'success');
      }
    });
  }

  function persistAndRender() {
    Utils.storage.set(STORAGE_KEY, geofences);
    renderKPIs();
    renderMarkers();
    renderList();
  }

  function init() {
    renderKPIs();
    renderMarkers();
    renderList();
    document.getElementById('btnNewGeofence')?.addEventListener('click', function() { showGeofenceForm(null); });
    document.getElementById('searchGeofences')?.addEventListener('input', renderList);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
