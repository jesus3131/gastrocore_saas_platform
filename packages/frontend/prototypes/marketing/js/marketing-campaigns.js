var campaigns = [];
var STORAGE_KEY = 'mk_campaigns';

(function() {
  var SAMPLE = [
    { id: Utils.uid(), name: 'Welcome Feast Series', segment: 'New', status: 'Active', schedule: '2026-07-01', reach: 1200, conversions: 180, revenue: 8400, description: '3-email welcome sequence for new sign-ups.' },
    { id: Utils.uid(), name: 'VIP Birthday Rewards', segment: 'VIP', status: 'Active', schedule: '2026-06-15', reach: 340, conversions: 112, revenue: 5600, description: 'Exclusive birthday offers for VIP members.' },
    { id: Utils.uid(), name: 'Lapsed Diners Win-Back', segment: 'At-Risk', status: 'Active', schedule: '2026-06-20', reach: 2500, conversions: 375, revenue: 11250, description: 'Re-engagement campaign for inactive 60+ days.' },
    { id: Utils.uid(), name: 'Summer Happy Hour', segment: 'All Customers', status: 'Draft', schedule: '2026-07-10', reach: 8000, conversions: 0, revenue: 0, description: 'Seasonal promo for summer happy hour specials.' },
    { id: Utils.uid(), name: 'Loyalty Points Double', segment: 'Regular', status: 'Active', schedule: '2026-06-25', reach: 1800, conversions: 540, revenue: 16200, description: 'Double points on all dine-in orders.' },
    { id: Utils.uid(), name: 'New Menu Launch', segment: 'All Customers', status: 'Paused', schedule: '2026-06-28', reach: 5000, conversions: 620, revenue: 18600, description: 'Promotional push for new seasonal menu.' },
    { id: Utils.uid(), name: 'Holiday Campaign', segment: 'All Customers', status: 'Completed', schedule: '2025-12-01', reach: 12000, conversions: 2400, revenue: 72000, description: 'End-of-year holiday promotion.' },
    { id: Utils.uid(), name: 'Inactive Re-engage', segment: 'Inactive', status: 'Draft', schedule: '2026-07-15', reach: 4500, conversions: 0, revenue: 0, description: 'Targeted campaign for inactive 90+ days.' }
  ];

  var data = Utils.storage.get(STORAGE_KEY, null);
  if (!data || !data.length) { Utils.storage.set(STORAGE_KEY, SAMPLE); campaigns = SAMPLE.slice(); }
  else campaigns = data.slice();

  function computeKPIs() {
    var active = campaigns.filter(function(c) { return c.status === 'Active'; }).length;
    var totalReach = 0, totalConv = 0, totalRev = 0, convCount = 0;
    campaigns.forEach(function(c) {
      totalReach += Number(c.reach) || 0;
      totalRev += Number(c.revenue) || 0;
      if (Number(c.conversions) > 0) { totalConv += Number(c.conversions); convCount++; }
    });
    var convRate = convCount > 0 ? (totalConv / convCount) : 0;
    return { active: active, reach: totalReach, convRate: convRate, revenue: totalRev };
  }

  function renderKPIs() {
    var k = computeKPIs();
    var container = document.getElementById('kpiContainer');
    if (!container) return;
    var total = document.getElementById('totalCampaigns');
    if (total) total.textContent = campaigns.length;
    container.innerHTML =
      '<div class="bg-surface-container-lowest border border-surface-container-high rounded-xl p-md flex flex-col justify-between hover:-translate-y-px transition-transform duration-200">' +
        '<div class="flex justify-between items-start mb-md"><span class="font-body-sm text-body-sm text-on-surface-variant">Active Campaigns</span><span class="material-symbols-outlined text-[#1e3a8a] text-[20px]">campaign</span></div>' +
        '<div class="flex items-baseline gap-sm"><span class="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-data-mono">' + k.active + '</span></div>' +
      '</div>' +
      '<div class="bg-surface-container-lowest border border-surface-container-high rounded-xl p-md flex flex-col justify-between hover:-translate-y-px transition-transform duration-200">' +
        '<div class="flex justify-between items-start mb-md"><span class="font-body-sm text-body-sm text-on-surface-variant">Total Reach</span><span class="material-symbols-outlined text-[#1e3a8a] text-[20px]">visibility</span></div>' +
        '<div class="flex items-baseline gap-sm"><span class="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-data-mono">' + k.reach.toLocaleString() + '</span></div>' +
      '</div>' +
      '<div class="bg-surface-container-lowest border border-surface-container-high rounded-xl p-md flex flex-col justify-between hover:-translate-y-px transition-transform duration-200">' +
        '<div class="flex justify-between items-start mb-md"><span class="font-body-sm text-body-sm text-on-surface-variant">Conversion Rate</span><span class="material-symbols-outlined text-[#1e3a8a] text-[20px]">trending_up</span></div>' +
        '<div class="flex items-baseline gap-sm"><span class="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-data-mono">' + (k.convRate > 0 ? (k.convRate / campaigns.length * 100).toFixed(1) + '%' : '0%') + '</span></div>' +
      '</div>' +
      '<div class="bg-surface-container-lowest border border-surface-container-high rounded-xl p-md flex flex-col justify-between hover:-translate-y-px transition-transform duration-200">' +
        '<div class="flex justify-between items-start mb-md"><span class="font-body-sm text-body-sm text-on-surface-variant">Revenue Generated</span><span class="material-symbols-outlined text-[#1e3a8a] text-[20px]">payments</span></div>' +
        '<div class="flex items-baseline gap-sm"><span class="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface font-data-mono">' + Utils.formatCurrency(k.revenue) + '</span></div>' +
      '</div>';
  }

  function renderTable() {
    var tbody = document.getElementById('campaignTableBody');
    if (!tbody) return;
    var segFilter = document.getElementById('filterSegment');
    var statFilter = document.getElementById('filterStatus');
    var segVal = segFilter ? segFilter.value : '';
    var statVal = statFilter ? statFilter.value : '';
    var searchVal = document.getElementById('searchCampaigns') ? document.getElementById('searchCampaigns').value.toLowerCase() : '';
    var filtered = campaigns.filter(function(c) {
      if (segVal && c.segment !== segVal) return false;
      if (statVal && c.status !== statVal) return false;
      if (searchVal && c.name.toLowerCase().indexOf(searchVal) === -1) return false;
      return true;
    });
    var statusColors = { Active: 'bg-green-100 text-green-800', Draft: 'bg-gray-100 text-gray-600', Paused: 'bg-yellow-100 text-yellow-800', Completed: 'bg-blue-100 text-blue-800' };
    tbody.innerHTML = filtered.length === 0
      ? '<tr><td colspan="5" class="px-md py-8 text-center text-on-surface-variant">No campaigns found.</td></tr>'
      : filtered.map(function(c) {
          var sc = statusColors[c.status] || 'bg-gray-100 text-gray-600';
          return '<tr class="table-row-hover group transition-colors" data-id="' + c.id + '">' +
            '<td class="px-md py-3"><div><p class="font-semibold text-on-background">' + c.name + '</p><p class="text-on-surface-variant text-[12px] truncate max-w-[200px]">' + (c.description || '') + '</p></div></td>' +
            '<td class="px-md py-3"><span class="inline-flex px-2 py-1 rounded bg-secondary-container text-on-secondary-container font-label-md text-[10px] uppercase">' + c.segment + '</span></td>' +
            '<td class="px-md py-3"><span class="inline-flex items-center gap-1 px-2 py-1 rounded ' + sc + ' font-label-md text-[10px] uppercase"><span class="w-1.5 h-1.5 rounded-full ' + (c.status === 'Active' ? 'bg-green-500' : c.status === 'Paused' ? 'bg-yellow-500' : c.status === 'Completed' ? 'bg-blue-500' : 'bg-gray-400') + '"></span>' + c.status + '</span></td>' +
            '<td class="px-md py-3 text-on-surface-variant">' + Utils.formatDateShort(c.schedule) + '</td>' +
            '<td class="px-md py-3 text-right"><div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">' +
              '<button class="edit-btn p-1 text-on-surface-variant hover:text-[#1e3a8a] rounded hover:bg-surface-container-high" data-id="' + c.id + '" title="Edit"><span class="material-symbols-outlined text-[18px]">edit</span></button>' +
              '<button class="toggle-btn p-1 text-on-surface-variant hover:text-yellow-600 rounded hover:bg-surface-container-high" data-id="' + c.id + '" title="' + (c.status === 'Active' ? 'Pause' : 'Activate') + '"><span class="material-symbols-outlined text-[18px]">' + (c.status === 'Active' ? 'pause_circle' : 'play_circle') + '</span></button>' +
              '<button class="delete-btn p-1 text-on-surface-variant hover:text-red-600 rounded hover:bg-surface-container-high" data-id="' + c.id + '" title="Delete"><span class="material-symbols-outlined text-[18px]">delete</span></button>' +
            '</div></td>' +
          '</tr>';
        }).join('');
    attachTableEvents();
  }

  function attachTableEvents() {
    document.querySelectorAll('.edit-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = btn.dataset.id;
        var c = campaigns.find(function(x) { return x.id === id; });
        if (!c) return;
        showCampaignForm(c);
      });
    });
    document.querySelectorAll('.toggle-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = btn.dataset.id;
        var c = campaigns.find(function(x) { return x.id === id; });
        if (!c) return;
        c.status = c.status === 'Active' ? 'Paused' : 'Active';
        persistAndRender();
        Utils.notify('Campaign ' + (c.status === 'Active' ? 'activated' : 'paused'), 'info');
      });
    });
    document.querySelectorAll('.delete-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = btn.dataset.id;
        Utils.confirm('Delete this campaign?', function() {
          campaigns = campaigns.filter(function(x) { return x.id !== id; });
          persistAndRender();
          Utils.notify('Campaign deleted', 'success');
        });
      });
    });
  }

  function showCampaignForm(existing) {
    var isEdit = !!existing;
    var data = existing || { name: '', segment: 'All Customers', status: 'Draft', schedule: '', description: '', reach: 0, conversions: 0, revenue: 0 };
    var segments = ['All Customers','VIP','At-Risk','New','Regular','Inactive'];
    var statuses = ['Draft','Active','Paused','Completed'];
    var segOpts = segments.map(function(s) { return '<option value="' + s + '" ' + (data.segment === s ? 'selected' : '') + '>' + s + '</option>'; }).join('');
    var statOpts = statuses.map(function(s) { return '<option value="' + s + '" ' + (data.status === s ? 'selected' : '') + '>' + s + '</option>'; }).join('');
    var content =
      '<div class="space-y-3">' +
        '<div><label class="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label><input id="f-name" type="text" value="' + data.name + '" class="w-full border rounded-lg px-3 py-2 text-sm" /></div>' +
        '<div><label class="block text-sm font-medium text-gray-700 mb-1">Segment</label><select id="f-segment" class="w-full border rounded-lg px-3 py-2 text-sm">' + segOpts + '</select></div>' +
        '<div><label class="block text-sm font-medium text-gray-700 mb-1">Status</label><select id="f-status" class="w-full border rounded-lg px-3 py-2 text-sm">' + statOpts + '</select></div>' +
        '<div><label class="block text-sm font-medium text-gray-700 mb-1">Schedule Date</label><input id="f-schedule" type="date" value="' + (data.schedule || '') + '" class="w-full border rounded-lg px-3 py-2 text-sm" /></div>' +
        '<div><label class="block text-sm font-medium text-gray-700 mb-1">Reach (target count)</label><input id="f-reach" type="number" value="' + (data.reach || 0) + '" class="w-full border rounded-lg px-3 py-2 text-sm" /></div>' +
        '<div><label class="block text-sm font-medium text-gray-700 mb-1">Conversions</label><input id="f-conversions" type="number" value="' + (data.conversions || 0) + '" class="w-full border rounded-lg px-3 py-2 text-sm" /></div>' +
        '<div><label class="block text-sm font-medium text-gray-700 mb-1">Revenue Generated</label><input id="f-revenue" type="number" step="0.01" value="' + (data.revenue || 0) + '" class="w-full border rounded-lg px-3 py-2 text-sm" /></div>' +
        '<div><label class="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea id="f-description" class="w-full border rounded-lg px-3 py-2 text-sm" rows="2">' + (data.description || '') + '</textarea></div>' +
      '</div>';
    Utils.modal({
      title: isEdit ? 'Edit Campaign' : 'New Campaign',
      content: content,
      onConfirm: function() {
        var val = {
          name: document.getElementById('f-name').value,
          segment: document.getElementById('f-segment').value,
          status: document.getElementById('f-status').value,
          schedule: document.getElementById('f-schedule').value,
          reach: Number(document.getElementById('f-reach').value) || 0,
          conversions: Number(document.getElementById('f-conversions').value) || 0,
          revenue: Number(document.getElementById('f-revenue').value) || 0,
          description: document.getElementById('f-description').value
        };
        if (!val.name) { Utils.notify('Campaign name is required', 'error'); return; }
        if (isEdit) {
          Object.assign(existing, val);
        } else {
          val.id = Utils.uid();
          campaigns.push(val);
        }
        persistAndRender();
        Utils.notify(isEdit ? 'Campaign updated' : 'Campaign created', 'success');
      }
    });
  }

  function applyTemplate(tpl) {
    document.getElementById('f-name').value = tpl.name;
    document.getElementById('f-segment').value = tpl.segment;
    document.getElementById('f-status').value = tpl.status;
    document.getElementById('f-schedule').value = tpl.schedule;
    document.getElementById('f-reach').value = tpl.reach;
    document.getElementById('f-conversions').value = tpl.conversions;
    document.getElementById('f-revenue').value = tpl.revenue;
    document.getElementById('f-description').value = tpl.description;
  }

  function renderTemplates() {
    var cont = document.getElementById('templatesContainer');
    if (!cont) return;
    var tmpls = [
      { name: 'Welcome Series', segment: 'New', status: 'Draft', schedule: '', reach: 2000, conversions: 300, revenue: 9000, description: 'Automated welcome sequence for new customers.', icon: 'handshake' },
      { name: 'Loyalty Reward', segment: 'Regular', status: 'Draft', schedule: '', reach: 1500, conversions: 450, revenue: 13500, description: 'Reward program boost for regular diners.', icon: 'military_tech' },
      { name: 'Re-engagement', segment: 'At-Risk', status: 'Draft', schedule: '', reach: 3000, conversions: 400, revenue: 12000, description: 'Win-back campaign for at-risk customers.', icon: 'restart_alt' },
      { name: 'Seasonal Promo', segment: 'All Customers', status: 'Draft', schedule: '', reach: 8000, conversions: 1200, revenue: 36000, description: 'Seasonal promotion for all customers.', icon: 'celebration' }
    ];
    cont.innerHTML = tmpls.map(function(t) {
      return '<div class="template-card bg-surface-container-low border border-outline-variant rounded-lg p-md cursor-pointer hover:border-[#1e3a8a] hover:shadow transition-all" data-tpl=\'' + JSON.stringify(t).replace(/'/g, '&#39;') + '\'>' +
        '<div class="flex items-center gap-sm mb-sm">' +
          '<span class="material-symbols-outlined text-[#1e3a8a] text-[20px]">' + t.icon + '</span>' +
          '<h4 class="font-body-md text-body-md font-semibold text-on-surface">' + t.name + '</h4>' +
        '</div>' +
        '<p class="text-on-surface-variant text-xs mb-sm">' + t.description + '</p>' +
        '<div class="flex items-center gap-2 text-xs text-on-surface-variant">' +
          '<span class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">group</span>' + t.segment + '</span>' +
          '<span class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">visibility</span>' + t.reach.toLocaleString() + '</span>' +
        '</div>' +
      '</div>';
    }).join('');
    cont.querySelectorAll('.template-card').forEach(function(card) {
      card.addEventListener('click', function() {
        var tpl = JSON.parse(card.dataset.tpl);
        var content =
          '<div class="space-y-3">' +
            '<div><label class="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label><input id="f-name" type="text" value="' + tpl.name + '" class="w-full border rounded-lg px-3 py-2 text-sm" /></div>' +
            '<div><label class="block text-sm font-medium text-gray-700 mb-1">Segment</label><select id="f-segment" class="w-full border rounded-lg px-3 py-2 text-sm">' +
              ['All Customers','VIP','At-Risk','New','Regular','Inactive'].map(function(s) { return '<option value="' + s + '" ' + (tpl.segment === s ? 'selected' : '') + '>' + s + '</option>'; }).join('') +
            '</select></div>' +
            '<div><label class="block text-sm font-medium text-gray-700 mb-1">Status</label><select id="f-status" class="w-full border rounded-lg px-3 py-2 text-sm">' +
              ['Draft','Active','Paused','Completed'].map(function(s) { return '<option value="' + s + '" ' + (tpl.status === s ? 'selected' : '') + '>' + s + '</option>'; }).join('') +
            '</select></div>' +
            '<div><label class="block text-sm font-medium text-gray-700 mb-1">Schedule Date</label><input id="f-schedule" type="date" value="' + tpl.schedule + '" class="w-full border rounded-lg px-3 py-2 text-sm" /></div>' +
            '<div><label class="block text-sm font-medium text-gray-700 mb-1">Reach (target count)</label><input id="f-reach" type="number" value="' + tpl.reach + '" class="w-full border rounded-lg px-3 py-2 text-sm" /></div>' +
            '<div><label class="block text-sm font-medium text-gray-700 mb-1">Conversions</label><input id="f-conversions" type="number" value="' + tpl.conversions + '" class="w-full border rounded-lg px-3 py-2 text-sm" /></div>' +
            '<div><label class="block text-sm font-medium text-gray-700 mb-1">Revenue Generated</label><input id="f-revenue" type="number" step="0.01" value="' + tpl.revenue + '" class="w-full border rounded-lg px-3 py-2 text-sm" /></div>' +
            '<div><label class="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea id="f-description" class="w-full border rounded-lg px-3 py-2 text-sm" rows="2">' + tpl.description + '</textarea></div>' +
          '</div>';
        Utils.modal({
          title: 'Create from Template: ' + tpl.name,
          content: content,
          confirmText: 'Create Campaign',
          onConfirm: function() {
            var val = {
              id: Utils.uid(),
              name: document.getElementById('f-name').value,
              segment: document.getElementById('f-segment').value,
              status: document.getElementById('f-status').value,
              schedule: document.getElementById('f-schedule').value,
              reach: Number(document.getElementById('f-reach').value) || 0,
              conversions: Number(document.getElementById('f-conversions').value) || 0,
              revenue: Number(document.getElementById('f-revenue').value) || 0,
              description: document.getElementById('f-description').value
            };
            if (!val.name) { Utils.notify('Campaign name is required', 'error'); return; }
            campaigns.push(val);
            persistAndRender();
            Utils.notify('Campaign created from template', 'success');
          }
        });
      });
    });
  }

  function persistAndRender() {
    Utils.storage.set(STORAGE_KEY, campaigns);
    renderKPIs();
    renderTable();
    renderTemplates();
  }

  function init() {
    renderKPIs();
    renderTable();
    renderTemplates();
    document.getElementById('btnNewCampaign')?.addEventListener('click', function() { showCampaignForm(null); });
    document.getElementById('filterSegment')?.addEventListener('change', renderTable);
    document.getElementById('filterStatus')?.addEventListener('change', renderTable);
    document.getElementById('searchCampaigns')?.addEventListener('input', renderTable);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
