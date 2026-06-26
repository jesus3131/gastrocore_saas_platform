(function() {
  var CHANNELS_KEY = 'int_channels';
  var MAPPINGS_KEY = 'int_menu_mappings';

  var DEFAULT_CHANNELS = [
    { id: 'ch_rappi', name: 'Rappi', type: 'delivery', apiKey: 'rp_live_xxxx', enabled: true, markup: 18, bgColor: '#FF6F00', textColor: '#fff', initials: 'RA', connected: true },
    { id: 'ch_uber', name: 'Uber Eats', type: 'delivery', apiKey: 'ue_live_xxxx', enabled: true, markup: 15, bgColor: '#000000', textColor: '#fff', initials: 'UE', connected: true },
    { id: 'ch_didi', name: 'Didi Food', type: 'delivery', apiKey: '', enabled: false, markup: 12, bgColor: '#FF6600', textColor: '#fff', initials: 'DF', connected: false },
    { id: 'ch_mp', name: 'Mercado Pago', type: 'payment', apiKey: '', enabled: false, markup: 8, bgColor: '#009EE3', textColor: '#fff', initials: 'MP', connected: false }
  ];

  var DEFAULT_MAPPINGS = [
    { id: 'map_1', localCategory: 'Appetizers & Starters', items: 12, platformCategory: 'Starters', mapped: true },
    { id: 'map_2', localCategory: 'Main Courses - Burgers', items: 8, platformCategory: 'Burgers', mapped: true },
    { id: 'map_3', localCategory: 'Seasonal Specials (Summer)', items: 4, platformCategory: '', mapped: false },
    { id: 'map_4', localCategory: 'Beverages & Sodas', items: 15, platformCategory: 'Beverages', mapped: true },
    { id: 'map_5', localCategory: 'Desserts', items: 6, platformCategory: '', mapped: false }
  ];

  function seed() {
    if (!Utils.storage.get(CHANNELS_KEY)) Utils.storage.set(CHANNELS_KEY, DEFAULT_CHANNELS);
    if (!Utils.storage.get(MAPPINGS_KEY)) Utils.storage.set(MAPPINGS_KEY, DEFAULT_MAPPINGS);
  }

  function getChannels() { return Utils.storage.get(CHANNELS_KEY, []); }
  function saveChannels(c) { Utils.storage.set(CHANNELS_KEY, c); }
  function getMappings() { return Utils.storage.get(MAPPINGS_KEY, []); }
  function saveMappings(m) { Utils.storage.set(MAPPINGS_KEY, m); }

  var EDITING_CHANNEL_ID = null;

  function renderChannels() {
    var grid = document.querySelector('.grid.grid-cols-1\\.md\\:grid-cols-2\\.lg\\:grid-cols-3\\.xl\\:grid-cols-4');
    if (!grid) return;
    grid.innerHTML = '';
    var channels = getChannels();
    channels.forEach(function(ch, idx) {
      var card = document.createElement('div');
      card.className = 'bg-surface-container-lowest border border-outline-variant rounded-xl p-6 relative overflow-hidden transition-all hover:shadow-md';
      var statusBadge = ch.connected
        ? '<div class="absolute top-0 right-0 p-3"><div class="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Connected</div></div>'
        : '<div class="absolute top-0 right-0 p-3"><div class="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1">Disconnected</div></div>';
      var idText = ch.apiKey ? 'API: ' + ch.apiKey.slice(0, 10) + '...' : 'Not configured';
      var syncHtml = ch.connected
        ? '<div class="flex justify-between items-center py-2 border-t border-outline-variant/30"><span class="text-label-md font-label-md text-on-surface-variant">Enabled</span><label class="relative inline-flex items-center cursor-pointer"><input type="checkbox" ' + (ch.enabled ? 'checked' : '') + ' class="sr-only peer channel-toggle" data-id="' + ch.id + '"/><div class="w-9 h-5 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\'\'] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div></label></div>'
        : '<div class="flex justify-between items-center py-2 border-t border-outline-variant/30"><span class="text-label-md font-label-md text-outline">Enabled</span><label class="relative inline-flex items-center cursor-pointer opacity-50"><input type="checkbox" class="sr-only peer" disabled/><div class="w-9 h-5 bg-outline-variant rounded-full after:content-[\'\'] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-4 after:w-4"></div></label></div>';
      var btnHtml = ch.connected
        ? '<button class="channel-disconnect w-full bg-red-50 text-red-600 border border-red-200 py-2 rounded-lg text-label-md font-label-md hover:bg-red-100 transition-colors" data-id="' + ch.id + '">Disconnect</button>'
        : '<button class="channel-connect w-full bg-primary-container text-on-primary py-2 rounded-lg text-label-md font-label-md hover:opacity-90 transition-opacity" data-id="' + ch.id + '">Connect Account</button>';
      var editHtml = '<button class="channel-edit w-full bg-surface text-primary border border-outline-variant py-2 rounded-lg text-label-md font-label-md hover:bg-surface-container-high transition-colors mt-2" data-id="' + ch.id + '">Edit Config</button>';
      card.innerHTML = statusBadge + '<div class="flex items-center gap-4 mb-4"><div class="w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style="background:' + ch.bgColor + '"><span style="color:' + ch.textColor + ';font-weight:bold;font-size:1.25rem">' + ch.initials + '</span></div><div><h3 class="text-headline-md font-headline-md text-on-surface leading-tight">' + ch.name + '</h3><p class="text-body-sm font-body-sm text-on-surface-variant">' + idText + '</p></div></div><div class="space-y-1">' + syncHtml + btnHtml + editHtml + '</div>';
      grid.appendChild(card);
    });

    grid.querySelectorAll('.channel-toggle').forEach(function(el) {
      el.addEventListener('change', function() {
        var channels = getChannels();
        for (var i = 0; i < channels.length; i++) {
          if (channels[i].id === this.dataset.id) { channels[i].enabled = this.checked; break; }
        }
        saveChannels(channels);
        Utils.notify((this.checked ? 'Enabled' : 'Disabled') + ' channel');
      });
    });

    grid.querySelectorAll('.channel-connect').forEach(function(el) {
      el.addEventListener('click', function() {
        var channels = getChannels();
        for (var i = 0; i < channels.length; i++) {
          if (channels[i].id === this.dataset.id) {
            Utils.prompt({
              title: 'Connect ' + channels[i].name,
              fields: [
                { name: 'apiKey', label: 'API Key', type: 'text' }
              ],
              onSave: function(vals) {
                channels[i].apiKey = vals.apiKey || channels[i].name.toLowerCase() + '_live_' + Utils.uid().slice(0, 8);
                channels[i].connected = true;
                channels[i].enabled = true;
                saveChannels(channels);
                renderChannels();
                Utils.notify(channels[i].name + ' connected');
              }
            });
            break;
          }
        }
      });
    });

    grid.querySelectorAll('.channel-disconnect').forEach(function(el) {
      el.addEventListener('click', function() {
        var id = this.dataset.id;
        Utils.confirm('Are you sure you want to disconnect this channel?', function() {
          var channels = getChannels();
          for (var i = 0; i < channels.length; i++) {
            if (channels[i].id === id) { channels[i].connected = false; channels[i].enabled = false; channels[i].apiKey = ''; break; }
          }
          saveChannels(channels);
          renderChannels();
          Utils.notify('Channel disconnected');
        });
      });
    });

    grid.querySelectorAll('.channel-edit').forEach(function(el) {
      el.addEventListener('click', function() {
        var channels = getChannels();
        var ch = null;
        for (var i = 0; i < channels.length; i++) {
          if (channels[i].id === this.dataset.id) { ch = channels[i]; break; }
        }
        if (!ch) return;
        EDITING_CHANNEL_ID = ch.id;
        Utils.prompt({
          title: 'Edit ' + ch.name,
          fields: [
            { name: 'name', label: 'Provider Name', type: 'text' },
            { name: 'type', label: 'Type', type: 'select', options: [{ value: 'delivery', label: 'Delivery' }, { value: 'payment', label: 'Payment' }] },
            { name: 'apiKey', label: 'API Key', type: 'text' },
            { name: 'markup', label: 'Markup/Discount Rate (%)', type: 'number' }
          ],
          data: { name: ch.name, type: ch.type, apiKey: ch.apiKey, markup: ch.markup },
          onSave: function(vals) {
            for (var i = 0; i < channels.length; i++) {
              if (channels[i].id === EDITING_CHANNEL_ID) {
                channels[i].name = vals.name;
                channels[i].type = vals.type;
                channels[i].apiKey = vals.apiKey;
                channels[i].markup = parseFloat(vals.markup) || 0;
                var p = getPlatformInfo(vals.name);
                channels[i].initials = p.initials;
                channels[i].bgColor = p.color;
                channels[i].textColor = '#fff';
                break;
              }
            }
            saveChannels(channels);
            renderChannels();
            renderMappings();
            Utils.notify('Channel updated');
          }
        });
      });
    });
  }

  function getPlatformInfo(name) {
    var map = { 'Rappi': { initials: 'RA', color: '#FF6F00' }, 'Uber Eats': { initials: 'UE', color: '#000000' }, 'Didi Food': { initials: 'DF', color: '#FF6600' }, 'Mercado Pago': { initials: 'MP', color: '#009EE3' } };
    return map[name] || { initials: name.slice(0,2).toUpperCase(), color: '#888' };
  }

  function renderMappings() {
    var tbody = document.querySelector('.overflow-x-auto table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    var mappings = getMappings();
    var channels = getChannels();
    var activeChannel = null;
    for (var i = 0; i < channels.length; i++) {
      if (channels[i].connected && channels[i].enabled) { activeChannel = channels[i]; break; }
    }
    var channelName = activeChannel ? activeChannel.name : 'Platform';

    // Update heading
    var heading = document.querySelector('h3 .material-symbols-outlined');
    if (heading) {
      var h3 = heading.closest('h3');
      if (h3) h3.innerHTML = '<span class="material-symbols-outlined text-primary">sync_alt</span> Menu Mapping: ' + channelName;
    }

    mappings.forEach(function(m) {
      var tr = document.createElement('tr');
      tr.className = 'hover:bg-surface-container-lowest transition-colors group' + (!m.mapped ? ' bg-red-50' : '');
      var selectHtml = '';
      var categories = ['Starters', 'Burgers', 'Beverages', 'Specials', 'Limited Time Offers', 'Snacks', 'Sandwiches', 'Mains', 'Drinks', 'Desserts'];
      if (m.mapped) {
        selectHtml = '<select class="mapping-select w-full bg-surface border border-outline-variant rounded-md py-1.5 px-3 text-body-sm font-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary" data-id="' + m.id + '">' + categories.map(function(c) { return '<option value="' + c + '" ' + (c === m.platformCategory ? 'selected' : '') + '>' + c + '</option>'; }).join('') + '</select>';
      } else {
        selectHtml = '<select class="mapping-select w-full bg-surface border border-red-300 rounded-md py-1.5 px-3 text-body-sm font-body-sm text-on-surface focus:border-red-500 focus:ring-1 focus:ring-red-500" data-id="' + m.id + '"><option disabled selected value="">Select category...</option>' + categories.map(function(c) { return '<option value="' + c + '">' + c + '</option>'; }).join('') + '</select>';
      }
      var statusHtml = m.mapped
        ? '<span class="inline-flex items-center gap-1 text-green-600 text-label-md font-label-md"><span class="material-symbols-outlined text-[16px]">check_circle</span> Mapped</span>'
        : '<span class="inline-flex items-center gap-1 text-red-500 text-label-md font-label-md"><span class="material-symbols-outlined text-[16px]">error</span> Unmapped</span>';
      tr.innerHTML = '<td class="px-6 py-4 font-medium text-on-surface">' + m.localCategory + '</td><td class="px-6 py-4 text-on-surface-variant text-data-mono font-data-mono">' + m.items + '</td><td class="px-6 py-4">' + selectHtml + '</td><td class="px-6 py-4 text-right">' + statusHtml + ' <button class="mapping-delete text-red-400 hover:text-red-600 ml-2 text-[16px]" data-id="' + m.id + '">&times;</button></td>';
      tbody.appendChild(tr);
    });

    // Add row for new mapping
    var addTr = document.createElement('tr');
    addTr.className = 'border-t-2 border-dashed border-outline-variant';
    addTr.innerHTML = '<td class="px-6 py-4"><input id="new-map-category" class="w-full border border-outline-variant rounded-md py-1.5 px-3 text-body-sm font-body-sm" placeholder="New category name..."/></td><td class="px-6 py-4 text-data-mono font-data-mono">0</td><td class="px-6 py-4"><button id="add-mapping-btn" class="bg-primary-container text-on-primary px-3 py-1.5 rounded-lg text-label-md font-label-md hover:opacity-90">Add Mapping</button></td><td class="px-6 py-4"></td>';
    tbody.appendChild(addTr);

    tbody.querySelectorAll('.mapping-select').forEach(function(el) {
      el.addEventListener('change', function() {
        var mappings = getMappings();
        for (var i = 0; i < mappings.length; i++) {
          if (mappings[i].id === this.dataset.id) {
            mappings[i].platformCategory = this.value;
            mappings[i].mapped = !!this.value;
            break;
          }
        }
        saveMappings(mappings);
        renderMappings();
        Utils.notify('Mapping updated');
      });
    });

    tbody.querySelectorAll('.mapping-delete').forEach(function(el) {
      el.addEventListener('click', function() {
        var id = this.dataset.id;
        Utils.confirm('Delete this mapping?', function() {
          var mappings = getMappings().filter(function(m) { return m.id !== id; });
          saveMappings(mappings);
          renderMappings();
          Utils.notify('Mapping deleted');
        });
      });
    });

    var addBtn = document.getElementById('add-mapping-btn');
    if (addBtn) {
      addBtn.addEventListener('click', function() {
        var input = document.getElementById('new-map-category');
        if (!input || !input.value.trim()) { Utils.notify('Enter a category name', 'error'); return; }
        var mappings = getMappings();
        mappings.push({ id: Utils.uid(), localCategory: input.value.trim(), items: 0, platformCategory: '', mapped: false });
        saveMappings(mappings);
        renderMappings();
        Utils.notify('Mapping added');
      });
    }
  }

  function renderMarkup() {
    var markupInput = document.querySelector('input[type="number"]');
    if (!markupInput) return;
    var channels = getChannels();
    var active = null;
    for (var i = 0; i < channels.length; i++) {
      if (channels[i].connected && channels[i].enabled) { active = channels[i]; break; }
    }
    if (active) markupInput.value = active.markup;
    markupInput.addEventListener('change', function() {
      var channels = getChannels();
      var val = parseFloat(this.value) || 0;
      for (var i = 0; i < channels.length; i++) {
        if (channels[i].connected && channels[i].enabled) { channels[i].markup = val; break; }
      }
      saveChannels(channels);
      Utils.notify('Markup rate updated');
    });
  }

  function setupAddChannel() {
    var btn = document.querySelector('.w-full.bg-primary-container.text-on-primary.font-label-md');
    if (!btn) {
      // try finding the "New Integration" button
      var allBtns = document.querySelectorAll('button');
      for (var i = 0; i < allBtns.length; i++) {
        if (allBtns[i].textContent.trim().indexOf('New Integration') >= 0) { btn = allBtns[i]; break; }
      }
    }
    if (!btn) return;
    btn.addEventListener('click', function() {
      Utils.prompt({
        title: 'Add New Channel',
        fields: [
          { name: 'name', label: 'Provider Name', type: 'text' },
          { name: 'type', label: 'Integration Type', type: 'select', options: [{ value: 'delivery', label: 'Delivery' }, { value: 'payment', label: 'Payment' }] },
          { name: 'apiKey', label: 'API Key', type: 'text' }
        ],
        onSave: function(vals) {
          if (!vals.name.trim()) { Utils.notify('Name is required', 'error'); return; }
          var channels = getChannels();
          var pi = getPlatformInfo(vals.name);
          channels.push({
            id: Utils.uid(),
            name: vals.name,
            type: vals.type || 'delivery',
            apiKey: vals.apiKey || '',
            enabled: true,
            markup: 10,
            bgColor: pi.color,
            textColor: '#fff',
            initials: pi.initials,
            connected: !!vals.apiKey
          });
          saveChannels(channels);
          renderChannels();
          Utils.notify('Channel added');
        }
      });
    });
  }

  // Global variables for inline script compatibility
  window.channelIntegrations = [];
  window.menuMappings = [];

  document.addEventListener('DOMContentLoaded', function() {
    seed();
    renderChannels();
    renderMappings();
    renderMarkup();
    setupAddChannel();

    // Save Mapping button
    var saveBtn = document.querySelector('button:contains("Save Mapping")');
    if (!saveBtn) {
      var buttons = document.querySelectorAll('button');
      for (var i = 0; i < buttons.length; i++) {
        if (buttons[i].textContent.trim() === 'Save Mapping') { saveBtn = buttons[i]; break; }
      }
    }
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        Utils.notify('Mapping configuration saved', 'success');
      });
    }
  });
})();
