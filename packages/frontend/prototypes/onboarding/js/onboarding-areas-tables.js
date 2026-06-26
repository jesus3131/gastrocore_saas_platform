(function() {
  var STORAGE_KEY = 'onboarding_areas';

  var TYPE_CONFIG = {
    dining: { icon: 'restaurant', color: 'border-primary', bg: 'bg-primary-fixed bg-opacity-20', textColor: 'text-primary', label: 'Dining' },
    bar: { icon: 'local_bar', color: 'border-secondary', bg: 'bg-secondary-fixed bg-opacity-20', textColor: 'text-secondary', label: 'Bar' },
    terrace: { icon: 'deck', color: 'border-tertiary', bg: 'bg-tertiary-fixed bg-opacity-20', textColor: 'text-tertiary', label: 'Terrace' },
    private: { icon: 'meeting_room', color: 'border-outline', bg: 'bg-surface-variant bg-opacity-50', textColor: 'text-on-surface-variant', label: 'Private Room' }
  };

  function load() {
    return Utils.storage.get(STORAGE_KEY, []);
  }

  function save(areas) {
    Utils.storage.set(STORAGE_KEY, areas);
    renderAll(areas);
  }

  function getArea(areas, id) {
    for (var i = 0; i < areas.length; i++) { if (areas[i].id === id) return areas[i]; }
    return null;
  }

  function addArea(areas, data) {
    areas.push({
      id: Utils.uid(),
      name: data.name,
      type: data.type || 'dining',
      tables: [],
      x: data.x || 40, y: data.y || 40,
      width: data.width || 220, height: data.height || 180
    });
    save(areas);
  }

  function editArea(areas, id, data) {
    var a = getArea(areas, id);
    if (!a) return;
    if (data.name !== undefined) a.name = data.name;
    if (data.type !== undefined) a.type = data.type;
    if (data.x !== undefined) a.x = data.x;
    if (data.y !== undefined) a.y = data.y;
    if (data.width !== undefined) a.width = data.width;
    if (data.height !== undefined) a.height = data.height;
    save(areas);
  }

  function deleteArea(areas, id) {
    for (var i = 0; i < areas.length; i++) {
      if (areas[i].id === id) { areas.splice(i, 1); break; }
    }
    save(areas);
  }

  function addTable(areas, areaId, data) {
    var a = getArea(areas, areaId);
    if (!a) return;
    a.tables.push({
      id: Utils.uid(),
      label: data.label,
      capacity: data.capacity || 2,
      x: data.x || 20, y: data.y || 20
    });
    save(areas);
  }

  function editTable(areas, areaId, tableId, data) {
    var a = getArea(areas, areaId);
    if (!a) return;
    for (var i = 0; i < a.tables.length; i++) {
      if (a.tables[i].id === tableId) {
        if (data.label !== undefined) a.tables[i].label = data.label;
        if (data.capacity !== undefined) a.tables[i].capacity = data.capacity;
        if (data.x !== undefined) a.tables[i].x = data.x;
        if (data.y !== undefined) a.tables[i].y = data.y;
        break;
      }
    }
    save(areas);
  }

  function deleteTable(areas, areaId, tableId) {
    var a = getArea(areas, areaId);
    if (!a) return;
    for (var i = 0; i < a.tables.length; i++) {
      if (a.tables[i].id === tableId) { a.tables.splice(i, 1); break; }
    }
    save(areas);
  }

  function metrics(areas) {
    var totalAreas = areas.length;
    var totalTables = 0;
    var totalCapacity = 0;
    for (var i = 0; i < areas.length; i++) {
      totalTables += areas[i].tables.length;
      for (var j = 0; j < areas[i].tables.length; j++) {
        totalCapacity += areas[i].tables[j].capacity;
      }
    }
    return { totalAreas: totalAreas, totalTables: totalTables, totalCapacity: totalCapacity };
  }

  function renderAll(areas) {
    renderMetrics(areas);
    renderCards(areas);
    renderMap(areas);
  }

  function renderMetrics(areas) {
    var container = document.getElementById('metrics-bar');
    if (!container) {
      container = document.createElement('div');
      container.id = 'metrics-bar';
      container.className = 'flex gap-md px-md py-sm bg-surface-container-lowest border-b border-outline-variant';
      var header = document.querySelector('.bg-surface > .bg-surface-container-lowest');
      if (header && header.parentNode) {
        header.parentNode.insertBefore(container, header.nextSibling);
      } else {
        var areaCards = document.getElementById('area-cards');
        if (areaCards && areaCards.parentNode) {
          areaCards.parentNode.insertBefore(container, areaCards);
        }
      }
    }
    var m = metrics(areas);
    container.innerHTML =
      '<span class="font-data-mono text-data-mono text-primary">' + m.totalAreas + '</span>' +
      '<span class="font-label-md text-label-md text-secondary">Areas</span>' +
      '<span class="font-data-mono text-data-mono text-primary">' + m.totalTables + '</span>' +
      '<span class="font-label-md text-label-md text-secondary">Tables</span>' +
      '<span class="font-data-mono text-data-mono text-primary">' + m.totalCapacity + '</span>' +
      '<span class="font-label-md text-label-md text-secondary">Capacity</span>';
  }

  function renderCards(areas) {
    var container = document.getElementById('area-cards');
    if (!container) return;
    if (areas.length === 0) {
      container.innerHTML = '<div class="text-center py-lg text-secondary font-body-sm text-body-sm">No areas configured yet. Click + to add one.</div>';
      return;
    }
    container.innerHTML = areas.map(function(a) {
      var tc = TYPE_CONFIG[a.type] || TYPE_CONFIG.dining;
      var tableCount = a.tables.length;
      var cap = 0;
      for (var i = 0; i < a.tables.length; i++) cap += a.tables[i].capacity;
      return '<div class="border border-outline-variant rounded-lg p-md bg-surface-container-lowest relative group hover:-translate-y-[2px] transition-transform" data-id="' + a.id + '">' +
        '<div class="flex justify-between items-start mb-sm">' +
          '<div class="flex items-center gap-sm">' +
            '<div class="w-8 h-8 rounded ' + tc.bg + ' flex items-center justify-center ' + tc.textColor + '"><span class="material-symbols-outlined text-[20px]">' + tc.icon + '</span></div>' +
            '<div><h4 class="font-label-md text-body-md font-semibold">' + a.name + '</h4><span class="font-label-md text-label-md text-secondary">' + tc.label + '</span></div>' +
          '</div>' +
          '<div class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-xs">' +
            '<button class="edit-area text-secondary hover:text-primary p-xs"><span class="material-symbols-outlined text-[18px]">edit</span></button>' +
            '<button class="delete-area text-secondary hover:text-error p-xs"><span class="material-symbols-outlined text-[18px]">delete</span></button>' +
          '</div>' +
        '</div>' +
        '<div class="flex gap-sm text-secondary font-label-md text-label-md">' +
          '<span>' + tableCount + ' tables</span>' +
          '<span>' + cap + ' capacity</span>' +
        '</div>' +
        '<div class="mt-sm pt-sm border-t border-outline-variant">' +
          '<button class="add-table text-primary font-label-md text-label-md hover:underline flex items-center gap-xs"><span class="material-symbols-outlined text-[16px]">add</span> Add Table</button>' +
          '<div class="mt-sm flex flex-col gap-xs" data-tables="' + a.id + '">' + a.tables.map(function(t) {
            return '<div class="flex justify-between items-center px-sm py-xs bg-surface rounded border border-outline-variant" data-table-id="' + t.id + '">' +
              '<span class="font-data-mono text-data-mono text-body-sm">' + t.label + ' <span class="text-secondary">(' + t.capacity + 'pax)</span></span>' +
              '<div class="flex gap-xs">' +
                '<button class="edit-table text-secondary hover:text-primary p-xs"><span class="material-symbols-outlined text-[14px]">edit</span></button>' +
                '<button class="delete-table text-secondary hover:text-error p-xs"><span class="material-symbols-outlined text-[14px]">close</span></button>' +
              '</div>' +
            '</div>';
          }).join('') + '</div>' +
        '</div>' +
      '</div>';
    }).join('');
    attachCardEvents(areas);
  }

  function attachCardEvents(areas) {
    var container = document.getElementById('area-cards');
    if (!container) return;
    container.querySelectorAll('.edit-area').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var id = btn.closest('[data-id]').getAttribute('data-id');
        promptEditArea(areas, id);
      });
    });
    container.querySelectorAll('.delete-area').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var id = btn.closest('[data-id]').getAttribute('data-id');
        Utils.confirm('Delete this area and all its tables?', function() { deleteArea(areas, id); });
      });
    });
    container.querySelectorAll('.add-table').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var areaId = btn.closest('[data-id]').getAttribute('data-id');
        promptAddTable(areas, areaId);
      });
    });
    container.querySelectorAll('.edit-table').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var areaId = btn.closest('[data-id]').getAttribute('data-id');
        var tableId = btn.closest('[data-table-id]').getAttribute('data-table-id');
        promptEditTable(areas, areaId, tableId);
      });
    });
    container.querySelectorAll('.delete-table').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var areaId = btn.closest('[data-id]').getAttribute('data-id');
        var tableId = btn.closest('[data-table-id]').getAttribute('data-table-id');
        Utils.confirm('Delete this table?', function() { deleteTable(areas, areaId, tableId); });
      });
    });
  }

  function renderMap(areas) {
    var container = document.getElementById('map-zones');
    if (!container) return;
    if (areas.length === 0) {
      container.innerHTML = '<div class="absolute inset-0 flex items-center justify-center text-secondary font-body-sm text-body-sm">Add areas to see the layout preview</div>';
      return;
    }
    container.innerHTML = areas.map(function(a) {
      var tc = TYPE_CONFIG[a.type] || TYPE_CONFIG.dining;
      var tableHtml = a.tables.map(function(t) {
        return '<div class="absolute flex items-center justify-center bg-white border border-outline rounded shadow-sm" style="width:44px;height:36px;top:' + t.y + 'px;left:' + t.x + 'px;cursor:move;" title="' + t.label + ' (' + t.capacity + ' pax)">' +
          '<span class="font-data-mono text-data-mono text-[10px] text-on-surface">' + t.label + '</span>' +
        '</div>';
      }).join('');
      return '<div class="absolute rounded-lg flex flex-col items-center justify-center overflow-hidden" style="top:' + a.y + 'px;left:' + a.x + 'px;width:' + a.width + 'px;height:' + a.height + 'px;border:2px dashed ' + getBorderColor(a.type) + ';background:' + getBgColor(a.type) + '">' +
        '<span class="font-label-md text-body-md font-bold" style="color:' + getTextColor(a.type) + '">' + a.name + '</span>' +
        '<span class="font-data-mono text-data-mono text-body-sm text-secondary">' + a.tables.length + ' tables</span>' +
        tableHtml +
      '</div>';
    }).join('');
  }

  function getBorderColor(type) { var map = { dining: '#1e3a8a', bar: '#6b21a8', terrace: '#047857', private: '#6b7280' }; return map[type] || '#1e3a8a'; }
  function getBgColor(type) { var map = { dining: 'rgba(30,58,138,0.08)', bar: 'rgba(107,33,168,0.08)', terrace: 'rgba(4,120,87,0.08)', private: 'rgba(107,114,128,0.08)' }; return map[type] || 'rgba(30,58,138,0.08)'; }
  function getTextColor(type) { var map = { dining: '#1e3a8a', bar: '#6b21a8', terrace: '#047857', private: '#6b7280' }; return map[type] || '#1e3a8a'; }

  function promptAddArea(areas) {
    Utils.prompt({
      title: 'Add Service Area',
      fields: [
        { name: 'name', label: 'Area Name', type: 'text' },
        { name: 'type', label: 'Area Type', type: 'select', options: [
          { value: 'dining', label: 'Dining Room' },
          { value: 'bar', label: 'Bar' },
          { value: 'terrace', label: 'Terrace' },
          { value: 'private', label: 'Private Room' }
        ]}
      ],
      onSave: function(vals) {
        if (!vals.name.trim()) { Utils.notify('Area name is required.', 'error'); return; }
        addArea(areas, { name: vals.name.trim(), type: vals.type });
        Utils.notify('Area added.', 'success');
      }
    });
  }

  function promptEditArea(areas, id) {
    var a = getArea(areas, id);
    if (!a) return;
    Utils.prompt({
      title: 'Edit Area',
      fields: [
        { name: 'name', label: 'Area Name', type: 'text' },
        { name: 'type', label: 'Area Type', type: 'select', options: [
          { value: 'dining', label: 'Dining Room' },
          { value: 'bar', label: 'Bar' },
          { value: 'terrace', label: 'Terrace' },
          { value: 'private', label: 'Private Room' }
        ]}
      ],
      data: { name: a.name, type: a.type },
      onSave: function(vals) {
        if (!vals.name.trim()) { Utils.notify('Area name is required.', 'error'); return; }
        editArea(areas, id, { name: vals.name.trim(), type: vals.type });
        Utils.notify('Area updated.', 'success');
      }
    });
  }

  function promptAddTable(areas, areaId) {
    var a = getArea(areas, areaId);
    if (!a) return;
    Utils.prompt({
      title: 'Add Table to ' + a.name,
      fields: [
        { name: 'label', label: 'Table Label', type: 'text' },
        { name: 'capacity', label: 'Capacity (seats)', type: 'number' }
      ],
      onSave: function(vals) {
        if (!vals.label.trim()) { Utils.notify('Table label is required.', 'error'); return; }
        addTable(areas, areaId, { label: vals.label.trim(), capacity: parseInt(vals.capacity) || 2 });
        Utils.notify('Table added.', 'success');
      }
    });
  }

  function promptEditTable(areas, areaId, tableId) {
    var a = getArea(areas, areaId);
    if (!a) return;
    var t = null;
    for (var i = 0; i < a.tables.length; i++) { if (a.tables[i].id === tableId) { t = a.tables[i]; break; } }
    if (!t) return;
    Utils.prompt({
      title: 'Edit Table',
      fields: [
        { name: 'label', label: 'Table Label', type: 'text' },
        { name: 'capacity', label: 'Capacity (seats)', type: 'number' }
      ],
      data: { label: t.label, capacity: t.capacity },
      onSave: function(vals) {
        if (!vals.label.trim()) { Utils.notify('Table label is required.', 'error'); return; }
        editTable(areas, areaId, tableId, { label: vals.label.trim(), capacity: parseInt(vals.capacity) || 2 });
        Utils.notify('Table updated.', 'success');
      }
    });
  }

  function quickSetup(areas) {
    var templates = {
      dining: { tables: ['T1','T2','T3','T4','T5','T6'], cap: 4, cols: 3, rows: 2, w: 50, h: 40 },
      bar: { tables: ['B1','B2','B3','B4'], cap: 2, cols: 2, rows: 2, w: 40, h: 35 },
      terrace: { tables: ['T1','T2','T3','T4'], cap: 4, cols: 2, rows: 2, w: 50, h: 40 },
      private: { tables: ['P1'], cap: 8, cols: 1, rows: 1, w: 60, h: 50 }
    };
    for (var i = 0; i < areas.length; i++) {
      var a = areas[i];
      if (a.tables.length > 0) continue;
      var tpl = templates[a.type] || templates.dining;
      var idx = 0;
      for (var r = 0; r < tpl.rows; r++) {
        for (var c = 0; c < tpl.cols; c++) {
          if (idx >= tpl.tables.length) break;
          a.tables.push({
            id: Utils.uid(),
            label: tpl.tables[idx],
            capacity: tpl.cap,
            x: 20 + c * (tpl.w + 10),
            y: 20 + r * (tpl.h + 10)
          });
          idx++;
        }
      }
    }
    save(areas);
    Utils.notify('Quick setup complete for empty areas.', 'success');
  }

  function findBtn(text) {
    return Array.from(document.querySelectorAll('button')).filter(function(b) {
      return b.textContent.replace(/[\n\r]/g, '').trim().indexOf(text) === 0;
    })[0];
  }

  function init() {
    var areas = load();
    renderAll(areas);

    var addBtn = document.querySelector('.bg-surface-container-lowest .material-symbols-outlined:first-child');
    if (addBtn) {
      var parentBtn = addBtn.closest('button');
      if (parentBtn) parentBtn.addEventListener('click', function() { promptAddArea(areas); });
    }

    var toggle = document.getElementById('quickSetupToggle');
    if (toggle) {
      toggle.addEventListener('change', function() {
        if (toggle.checked) { quickSetup(areas); }
      });
    }

    var backBtn = findBtn('Back');
    if (backBtn) backBtn.addEventListener('click', function() { window.location.href = 'onboarding-business-profile.html'; });

    var saveBtn = findBtn('Save as Draft');
    if (saveBtn) saveBtn.addEventListener('click', function() { save(areas); Utils.notify('Draft saved.', 'success'); });

    var contBtn = findBtn('Continue');
    if (contBtn) contBtn.addEventListener('click', function() {
      save(areas);
      window.location.href = 'onboarding-module-activation.html';
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
