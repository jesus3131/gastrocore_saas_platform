var directoryData = { enrolledCount: '0', segments: [], customers: [], showingFrom: 1, showingTo: 0, totalEntries: 0, currentPage: 1, totalPages: 1 };

(function() {
  var STORAGE_KEY = 'crm_customers', PAGE_SIZE = 10;
  var SAMPLE = [
    { id: 'CUST-001', name: 'Jane Doe', email: 'jane.doe@example.com', phone: '+1 (555) 012-3456', segment: 'VIP', totalSpent: 4250, visits: 24, points: 12500, lastVisit: '2025-06-20', tags: ['VIP', 'Regular'], avatar: null },
    { id: 'CUST-002', name: 'Michael Smith', email: 'm.smith@example.com', phone: '+1 (555) 023-4567', segment: 'VIP', totalSpent: 3180, visits: 18, points: 8200, lastVisit: '2025-06-18', tags: ['VIP'], avatar: null },
    { id: 'CUST-003', name: 'Sarah Jenkins', email: 'sarah.j@company.net', phone: '+1 (555) 034-5678', segment: 'At-Risk', totalSpent: 350, visits: 3, points: 450, lastVisit: '2025-03-15', tags: [], avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHpueHxXi2SoXXe_gQ_DJVgty_ukoQZg6neMVEP0AtT5yJWfnmU-HCrefKddwUtqZtBJ2-fDNCHE0ujGRm948JhsX68aYEK0yacCZdfRhyh3J9TnZcIfCil7Em2Kq2D212KxL7Kw648sPv7XYLSCTJkGU4mDxWjrq5isaIr6gyhAPJACkQS5o_mbxyfilIOwLFx1rDsM_k63Dnz9MmPZFILyzFtl3keIH060cIy_HTNi1CZN02-49cI4SG-EvlsejZVupEusm2liNv' },
    { id: 'CUST-004', name: 'David Rodriguez', email: 'david.r@example.com', phone: '+1 (555) 045-6789', segment: 'Regular', totalSpent: 620.75, visits: 7, points: 1100, lastVisit: '2025-06-10', tags: [], avatar: null },
    { id: 'CUST-005', name: 'Emily Chen', email: 'emily.chen@example.com', phone: '+1 (555) 056-7890', segment: 'New', totalSpent: 185, visits: 2, points: 320, lastVisit: '2025-06-24', tags: ['New'], avatar: null },
    { id: 'CUST-006', name: 'James Wilson', email: 'jwilson@example.com', phone: '+1 (555) 067-8901', segment: 'VIP', totalSpent: 5670, visits: 31, points: 18400, lastVisit: '2025-06-22', tags: ['VIP', 'Regular'], avatar: null },
    { id: 'CUST-007', name: 'Maria Garcia', email: 'maria.garcia@example.com', phone: '+1 (555) 078-9012', segment: 'Regular', totalSpent: 890, visits: 9, points: 2100, lastVisit: '2025-06-15', tags: [], avatar: null },
    { id: 'CUST-008', name: 'Robert Johnson', email: 'rjohnson@example.com', phone: '+1 (555) 089-0123', segment: 'At-Risk', totalSpent: 210, visits: 2, points: 380, lastVisit: '2025-02-28', tags: [], avatar: null },
    { id: 'CUST-009', name: 'Lisa Thompson', email: 'lisa.t@example.com', phone: '+1 (555) 090-1234', segment: 'New', totalSpent: 95.50, visits: 1, points: 150, lastVisit: '2025-06-25', tags: ['New'], avatar: null },
    { id: 'CUST-010', name: 'Thomas Brown', email: 'tbrown@example.com', phone: '+1 (555) 101-2345', segment: 'Regular', totalSpent: 1450, visits: 12, points: 3600, lastVisit: '2025-06-12', tags: [], avatar: null },
    { id: 'CUST-011', name: 'Amanda Lee', email: 'alee@example.com', phone: '+1 (555) 112-3456', segment: 'VIP', totalSpent: 7230, visits: 38, points: 21900, lastVisit: '2025-06-23', tags: ['VIP'], avatar: null },
    { id: 'CUST-012', name: 'Kevin Martinez', email: 'kmartinez@example.com', phone: '+1 (555) 123-4567', segment: 'Regular', totalSpent: 475, visits: 5, points: 890, lastVisit: '2025-06-08', tags: [], avatar: null },
    { id: 'CUST-013', name: 'Rachel Kim', email: 'rkim@example.com', phone: '+1 (555) 134-5678', segment: 'New', totalSpent: 67, visits: 1, points: 100, lastVisit: '2025-06-24', tags: ['New'], avatar: null },
    { id: 'CUST-014', name: 'Daniel White', email: 'dwhite@example.com', phone: '+1 (555) 145-6789', segment: 'At-Risk', totalSpent: 520, visits: 4, points: 780, lastVisit: '2025-01-20', tags: [], avatar: null },
    { id: 'CUST-015', name: 'Jessica Taylor', email: 'jtaylor@example.com', phone: '+1 (555) 156-7890', segment: 'Regular', totalSpent: 2340, visits: 16, points: 5800, lastVisit: '2025-06-19', tags: [], avatar: null },
    { id: 'CUST-016', name: 'Christopher Davis', email: 'cdavis@example.com', phone: '+1 (555) 167-8901', segment: 'VIP', totalSpent: 4890, visits: 27, points: 14200, lastVisit: '2025-06-21', tags: ['VIP'], avatar: null },
    { id: 'CUST-017', name: 'Megan Anderson', email: 'manderson@example.com', phone: '+1 (555) 178-9012', segment: 'Regular', totalSpent: 910, visits: 8, points: 2300, lastVisit: '2025-06-14', tags: [], avatar: null },
    { id: 'CUST-018', name: 'Ryan Moore', email: 'rmoore@example.com', phone: '+1 (555) 189-0123', segment: 'New', totalSpent: 134, visits: 2, points: 200, lastVisit: '2025-06-22', tags: ['New'], avatar: null },
    { id: 'CUST-019', name: 'Stephanie Clark', email: 'sclark@example.com', phone: '+1 (555) 190-1234', segment: 'At-Risk', totalSpent: 780, visits: 6, points: 1200, lastVisit: '2025-04-01', tags: [], avatar: null },
    { id: 'CUST-020', name: 'Andrew Lewis', email: 'alewis@example.com', phone: '+1 (555) 201-2345', segment: 'Regular', totalSpent: 1650, visits: 13, points: 4100, lastVisit: '2025-06-17', tags: [], avatar: null },
    { id: 'CUST-021', name: 'Laura Hall', email: 'lhall@example.com', phone: '+1 (555) 212-3456', segment: 'VIP', totalSpent: 9560, visits: 45, points: 28500, lastVisit: '2025-06-24', tags: ['VIP', 'Regular'], avatar: null },
    { id: 'CUST-022', name: 'Brandon Young', email: 'byoung@example.com', phone: '+1 (555) 223-4567', segment: 'Regular', totalSpent: 380, visits: 4, points: 650, lastVisit: '2025-06-05', tags: [], avatar: null }
  ];

  var customers = Utils.storage.get(STORAGE_KEY, null);
  if (!customers || !customers.length) { Utils.storage.set(STORAGE_KEY, SAMPLE); customers = SAMPLE.slice(); }

  var state = { page: 1, query: '', segment: '', sort: 'name', dir: 'asc' };

  function filtered() {
    var r = customers.slice();
    if (state.query) { var q = state.query.toLowerCase(); r = r.filter(function(c) { return c.name.toLowerCase().indexOf(q) > -1 || c.email.toLowerCase().indexOf(q) > -1 || c.phone.indexOf(q) > -1; }); }
    if (state.segment) { r = r.filter(function(c) { return c.segment === state.segment; }); }
    r.sort(function(a, b) {
      var va = a[state.sort], vb = b[state.sort];
      if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase(); }
      if (state.sort === 'totalSpent' || state.sort === 'visits' || state.sort === 'points') { va = Number(va); vb = Number(vb); }
      return va < vb ? (state.dir === 'asc' ? -1 : 1) : va > vb ? (state.dir === 'asc' ? 1 : -1) : 0;
    });
    return r;
  }

  function segCount(seg) { return customers.filter(function(c) { return c.segment === seg; }).length; }

  function render() {
    var f = filtered(), tp = Math.max(1, Math.ceil(f.length / PAGE_SIZE));
    if (state.page > tp) state.page = tp;
    var start = (state.page - 1) * PAGE_SIZE, end = Math.min(start + PAGE_SIZE, f.length), page = f.slice(start, end);
    var vip = segCount('VIP'), atr = segCount('At-Risk'), nw = segCount('New'), reg = customers.length - vip - atr - nw;
    var pct = function(n) { return customers.length > 0 ? Math.round(n / customers.length * 100) + '%' : '0%'; };
    directoryData = {
      enrolledCount: customers.length.toLocaleString(),
      segments: [
        { label: 'VIP Members', count: vip.toLocaleString(), change: pct(vip), changeClass: 'text-tertiary-container', icon: 'star', iconBg: 'bg-secondary-container', iconColor: 'text-primary-container', badge: vip > 0 ? { text: 'Active', color: '#166534', bg: '#dcfce7' } : null },
        { label: 'Regular', count: reg.toLocaleString(), change: pct(reg), changeClass: 'text-on-surface-variant', icon: 'local_cafe', iconBg: 'bg-surface-container-high', iconColor: 'text-on-surface-variant', badge: null },
        { label: 'At-Risk', count: atr.toLocaleString(), change: pct(atr), changeClass: 'text-[#991b1b]', icon: 'warning', iconBg: 'bg-[#fee2e2]', iconColor: 'text-[#991b1b]', badge: null },
        { label: 'New', count: nw.toLocaleString(), change: pct(nw), changeClass: 'text-tertiary-container', icon: 'fiber_new', iconBg: 'bg-surface-container-high', iconColor: 'text-on-surface-variant', badge: null }
      ],
      customers: page,
      showingFrom: f.length > 0 ? start + 1 : 0,
      showingTo: end,
      totalEntries: f.length,
      currentPage: state.page,
      totalPages: tp
    };

    var segEl = document.querySelector('[data-container="segments"]');
    if (segEl) {
      segEl.innerHTML = directoryData.segments.map(function(s) {
        var badgeHtml = s.badge ? '<span class="bg-[' + s.badge.bg + '] text-[' + s.badge.color + '] px-2 py-1 rounded font-label-md text-[10px] uppercase tracking-wider flex items-center gap-1"><span class="w-1.5 h-1.5 bg-[' + s.badge.color + '] rounded-full"></span> ' + s.badge.text + '</span>' : '';
        return '<div class="bg-surface-container-lowest border border-surface-container-high rounded-xl p-md flex flex-col justify-between hover:-translate-y-[2px] transition-transform duration-200 ambient-shadow">' +
          '<div class="flex justify-between items-start mb-md">' +
          '<div class="w-10 h-10 rounded-lg ' + s.iconBg + ' ' + s.iconColor + ' flex items-center justify-center">' +
          '<span class="material-symbols-outlined' + (s.icon === 'star' ? '" style="font-variation-settings: \'FILL\' 1;"' : '"') + '>' + s.icon + '</span>' +
          '</div>' + badgeHtml + '</div>' +
          '<div><p class="font-body-sm text-body-sm text-on-surface-variant mb-xs">' + s.label + '</p>' +
          '<div class="flex items-baseline gap-sm"><h3 class="font-headline-md text-headline-md">' + s.count + '</h3><span class="font-data-mono text-[12px] ' + s.changeClass + '">' + s.change + '</span></div></div></div>';
      }).join('');
    }

    ['enrolledCount','showingFrom','showingTo','totalEntries','currentPage','totalPages'].forEach(function(k) {
      var el = document.querySelector('[data-field="' + k + '"]');
      if (el) el.textContent = typeof directoryData[k] === 'number' ? directoryData[k].toLocaleString() : directoryData[k];
    });

    var rowEl = document.querySelector('[data-container="customerRows"]');
    if (!rowEl) return;
    rowEl.innerHTML = page.map(function(c) {
      var inits = c.name.split(' ').map(function(n) { return n[0]; }).join('').substring(0, 2).toUpperCase();
      var av = c.avatar ? '<img class="w-8 h-8 rounded-full object-cover" src="' + c.avatar + '"/>' : '<div class="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold text-xs">' + inits + '</div>';
      var sc = { VIP: 'bg-secondary-container text-on-secondary-container', Regular: 'bg-surface-container-high text-on-surface-variant', 'At-Risk': 'bg-[#fee2e2] text-[#991b1b]', New: 'bg-tertiary-container/10 text-tertiary-container' };
      var tc = sc[c.segment] || 'bg-surface-container-high text-on-surface-variant';
      var days = Math.floor((new Date() - new Date(c.lastVisit)) / 86400000);
      var lbl = days === 0 ? 'Today' : days === 1 ? 'Yesterday' : days + ' days ago';
      var lvc = c.segment === 'At-Risk' ? 'text-[#991b1b]' : '';
      return '<tr class="table-row-hover group transition-colors cursor-pointer" data-id="' + c.id + '">' +
        '<td class="px-md py-3"><div class="flex items-center gap-sm">' + av + '<div><p class="font-semibold text-on-background">' + c.name + '</p><p class="text-on-surface-variant text-[12px]">' + c.email + '</p></div></div></td>' +
        '<td class="px-md py-3"><span class="inline-flex items-center gap-1 px-2 py-1 rounded ' + tc + ' font-label-md text-[10px] uppercase">' + c.segment + '</span></td>' +
        '<td class="px-md py-3 ' + lvc + '">' + lbl + '</td>' +
        '<td class="px-md py-3 font-data-mono text-right">' + Utils.formatCurrency(c.totalSpent) + '</td>' +
        '<td class="px-md py-3 font-data-mono text-right text-tertiary-container">' + c.points.toLocaleString() + '</td>' +
        '<td class="px-md py-3 text-center"><button class="text-on-surface-variant hover:text-error delete-btn" data-id="' + c.id + '" title="Delete"><span class="material-symbols-outlined text-[20px]">delete</span></button></td>' +
        '</tr>';
    }).join('');

    rowEl.querySelectorAll('tr[data-id]').forEach(function(tr) {
      tr.addEventListener('click', function(e) { if (e.target.closest('.delete-btn')) return; window.location.href = 'crm-customer-profile.html?id=' + tr.dataset.id; });
    });
    rowEl.querySelectorAll('.delete-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) { e.stopPropagation(); var id = btn.dataset.id;
        Utils.confirm('Delete this customer permanently?', function() {
          customers = customers.filter(function(c) { return c.id !== id; }); Utils.storage.set(STORAGE_KEY, customers); Utils.notify('Customer deleted', 'success'); render();
        });
      });
    });
  }

  function init() {
    render();
    var addBtn = Array.from(document.querySelectorAll('button')).find(function(b) { return b.textContent.trim() === 'Add Customer'; });
    if (addBtn) addBtn.addEventListener('click', function() {
      Utils.prompt({ title: 'Add Customer', fields: [
        { name: 'name', label: 'Full Name' },
        { name: 'email', label: 'Email' },
        { name: 'phone', label: 'Phone' },
        { name: 'segment', label: 'Segment', type: 'select', options: [
          { value: 'Regular', label: 'Regular' }, { value: 'VIP', label: 'VIP' }, { value: 'New', label: 'New' }, { value: 'At-Risk', label: 'At-Risk' }
        ]}
      ], onSave: function(vals) {
        var c = { id: 'CUST-' + String(customers.length + 1).padStart(3, '0'), name: vals.name, email: vals.email, phone: vals.phone, segment: vals.segment || 'Regular', totalSpent: 0, visits: 0, points: 0, lastVisit: Utils.today(), tags: [], avatar: null };
        customers.push(c); Utils.storage.set(STORAGE_KEY, customers); Utils.notify('Customer added', 'success'); render();
      }});
    });

    var searchInput = document.querySelector('input[placeholder="Search by name, email, or phone..."]');
    if (searchInput) searchInput.addEventListener('input', function() { state.query = this.value; state.page = 1; render(); });

    var filterBtn = Array.from(document.querySelectorAll('button')).find(function(b) { return b.textContent.trim() === 'Filter'; });
    if (filterBtn) filterBtn.addEventListener('click', function() {
      Utils.modal({ title: 'Filter by Segment', content: '<div class="flex flex-wrap gap-2" id="seg-filter">' +
        ['All','VIP','Regular','At-Risk','New'].map(function(s) {
          return '<button class="px-3 py-1 rounded-full text-sm border ' + (state.segment === s || (s === 'All' && !state.segment) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100') + '" data-seg="' + s + '">' + s + '</button>';
        }).join('') + '</div>',
        confirmText: 'Apply', onConfirm: function() {
        var active = document.querySelector('#seg-filter .bg-blue-600');
        if (active) state.segment = active.dataset.seg === 'All' ? '' : active.dataset.seg;
        state.page = 1; render();
      }});
      setTimeout(function() {
        document.querySelectorAll('#seg-filter button').forEach(function(b) {
          b.addEventListener('click', function() {
            document.querySelectorAll('#seg-filter button').forEach(function(x) { x.className = 'px-3 py-1 rounded-full text-sm border bg-white text-gray-700 border-gray-300 hover:bg-gray-100'; });
            b.className = 'px-3 py-1 rounded-full text-sm border bg-blue-600 text-white border-blue-600';
          });
        });
      }, 50);
    });

    var sortBtn = Array.from(document.querySelectorAll('button')).find(function(b) { return b.textContent.trim() === 'Sort'; });
    if (sortBtn) sortBtn.addEventListener('click', function() {
      var fields = [{ value: 'name', label: 'Name' }, { value: 'totalSpent', label: 'Total Spent' }, { value: 'visits', label: 'Visits' }, { value: 'points', label: 'Points' }];
      Utils.modal({ title: 'Sort By', content: '<div class="space-y-2">' +
        fields.map(function(f) { return '<label class="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"><input type="radio" name="sort-field" value="' + f.value + '" ' + (state.sort === f.value ? 'checked' : '') + '> ' + f.label + '</label>'; }).join('') +
        '<hr><label class="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"><input type="radio" name="sort-dir" value="asc" ' + (state.dir === 'asc' ? 'checked' : '') + '> Ascending</label>' +
        '<label class="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"><input type="radio" name="sort-dir" value="desc" ' + (state.dir === 'desc' ? 'checked' : '') + '> Descending</label>' +
        '</div>', confirmText: 'Apply', onConfirm: function() {
        var sf = document.querySelector('input[name="sort-field"]:checked'); if (sf) state.sort = sf.value;
        var sd = document.querySelector('input[name="sort-dir"]:checked'); if (sd) state.dir = sd.value;
        render();
      }});
    });

    var pagBtns = document.querySelectorAll('.bg-surface-container-low button, .bg-surface-container-lowest button');
    var prevBtn, nextBtn;
    pagBtns.forEach(function(b) { var i = b.querySelector('.material-symbols-outlined'); if (i) { if (i.textContent.trim() === 'chevron_left') prevBtn = b; if (i.textContent.trim() === 'chevron_right') nextBtn = b; } });
    if (prevBtn) prevBtn.addEventListener('click', function() { if (state.page > 1) { state.page--; render(); } });
    if (nextBtn) nextBtn.addEventListener('click', function() { if (state.page < directoryData.totalPages) { state.page++; render(); } });

    state.page = 1; state.query = ''; state.segment = ''; state.sort = 'name'; state.dir = 'asc';
    customers = Utils.storage.get(STORAGE_KEY, SAMPLE);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
