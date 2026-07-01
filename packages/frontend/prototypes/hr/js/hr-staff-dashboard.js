var staffSummary = { totalEmployees: 0, newHires: 0, activeShifts: 0, totalCommissions: 0, pendingApprovals: 0 };
var staffRoster = [];
var shiftTimeline = [];
var commissionItems = [];

(function() {
  var EMP_KEY = 'hr_employees', SHIFT_KEY = 'hr_shifts', COMM_KEY = 'hr_commissions';

  var sampleEmployees = [
    { id: 'EMP-001', name: 'Maria Vasquez', initials: 'MV', role: 'Head Waiter', status: 'clocked-in', performance: 4.9, email: 'maria.v@example.com', phone: '+1 (555) 301-0001' },
    { id: 'EMP-002', name: 'James Chen', initials: 'JC', role: 'Sous Chef', status: 'clocked-in', performance: 4.7, email: 'james.c@example.com', phone: '+1 (555) 301-0002' },
    { id: 'EMP-003', name: 'Sarah Adams', initials: 'SA', role: 'Floor Manager', status: 'off', performance: 4.8, email: 'sarah.a@example.com', phone: '+1 (555) 301-0003' },
    { id: 'EMP-004', name: 'Robert Jones', initials: 'RJ', role: 'Bartender', status: 'late', performance: 4.2, email: 'robert.j@example.com', phone: '+1 (555) 301-0004' },
    { id: 'EMP-005', name: 'Elena Rodriguez', initials: 'ER', role: 'Senior Waitstaff', status: 'clocked-in', performance: 4.8, email: 'elena.r@example.com', phone: '+1 (555) 301-0005' },
    { id: 'EMP-006', name: 'David Kim', initials: 'DK', role: 'Line Cook', status: 'clocked-in', performance: 4.5, email: 'david.k@example.com', phone: '+1 (555) 301-0006' },
    { id: 'EMP-007', name: 'Lisa Park', initials: 'LP', role: 'Hostess', status: 'off', performance: 4.6, email: 'lisa.p@example.com', phone: '+1 (555) 301-0007' },
    { id: 'EMP-008', name: 'Michael Torres', initials: 'MT', role: 'Dishwasher', status: 'off', performance: 4.1, email: 'michael.t@example.com', phone: '+1 (555) 301-0008' },
    { id: 'EMP-009', name: 'Jessica Brown', initials: 'JB', role: 'Server', status: 'clocked-in', performance: 4.4, email: 'jessica.b@example.com', phone: '+1 (555) 301-0009' },
    { id: 'EMP-010', name: 'Thomas Lee', initials: 'TL', role: 'Bartender', status: 'late', performance: 4.3, email: 'thomas.l@example.com', phone: '+1 (555) 301-0010' },
    { id: 'EMP-011', name: 'Amanda White', initials: 'AW', role: 'Server', status: 'off', performance: 4.7, email: 'amanda.w@example.com', phone: '+1 (555) 301-0011' },
    { id: 'EMP-012', name: 'Chris Martin', initials: 'CM', role: 'Line Cook', status: 'clocked-in', performance: 4.6, email: 'chris.m@example.com', phone: '+1 (555) 301-0012' },
    { id: 'EMP-013', name: 'Stephanie Clark', initials: 'SC', role: 'Hostess', status: 'off', performance: 4.5, email: 'stephanie.c@example.com', phone: '+1 (555) 301-0013' },
    { id: 'EMP-014', name: 'Daniel Wright', initials: 'DW', role: 'Dishwasher', status: 'clocked-in', performance: 4.0, email: 'daniel.w@example.com', phone: '+1 (555) 301-0014' },
    { id: 'EMP-015', name: 'Rachel Kim', initials: 'RK', role: 'Server', status: 'off', performance: 4.8, email: 'rachel.k@example.com', phone: '+1 (555) 301-0015' },
    { id: 'EMP-016', name: 'Kevin Nguyen', initials: 'KN', role: 'Sous Chef', status: 'late', performance: 4.4, email: 'kevin.n@example.com', phone: '+1 (555) 301-0016' },
    { id: 'EMP-017', name: 'Megan Taylor', initials: 'MT', role: 'Server', status: 'clocked-in', performance: 4.6, email: 'megan.t@example.com', phone: '+1 (555) 301-0017' },
    { id: 'EMP-018', name: 'Brian Adams', initials: 'BA', role: 'Barback', status: 'off', performance: 4.2, email: 'brian.a@example.com', phone: '+1 (555) 301-0018' },
    { id: 'EMP-019', name: 'Laura Hall', initials: 'LH', role: 'Floor Manager', status: 'clocked-in', performance: 4.9, email: 'laura.h@example.com', phone: '+1 (555) 301-0019' },
    { id: 'EMP-020', name: 'Jason Moore', initials: 'JM', role: 'Line Cook', status: 'off', performance: 4.3, email: 'jason.m@example.com', phone: '+1 (555) 301-0020' },
    { id: 'EMP-021', name: 'Olivia Davis', initials: 'OD', role: 'Hostess', status: 'off', performance: 4.7, email: 'olivia.d@example.com', phone: '+1 (555) 301-0021' },
    { id: 'EMP-022', name: 'Carlos Ruiz', initials: 'CR', role: 'Dishwasher', status: 'clocked-in', performance: 4.1, email: 'carlos.r@example.com', phone: '+1 (555) 301-0022' }
  ];

  var sampleShifts = [
    { id: 'sft-1', time: '08:00 - 16:00', label: 'Morning Prep & Service', desc: '4 Kitchen, 2 Front of House', initials: ['JC', 'DK'], extra: '+2', active: false },
    { id: 'sft-2', time: '15:00 - 23:00', label: 'Evening Peak Service', desc: '6 Kitchen, 8 Front of House', initials: ['MV', 'SA'], extra: '+12', active: true },
    { id: 'sft-3', time: '10:00 - 18:00', label: 'Mid-Day Coverage', desc: '3 Kitchen, 4 Front of House', initials: ['ER', 'JB'], extra: '+5', active: false },
    { id: 'sft-4', time: '06:00 - 14:00', label: 'Early Prep Shift', desc: '2 Kitchen, 1 Manager', initials: ['CM', 'LH'], extra: '+1', active: true },
    { id: 'sft-5', time: '17:00 - 01:00', label: 'Late Night', desc: '2 Bartenders, 3 Servers', initials: ['RJ', 'TL'], extra: '+3', active: false },
    { id: 'sft-6', time: '11:00 - 19:00', label: 'Lunch Service', desc: '3 Kitchen, 5 Front of House', initials: ['MT', 'AW'], extra: '+6', active: true },
    { id: 'sft-7', time: '07:00 - 15:00', label: 'Opening Team', desc: '2 Kitchen, 2 Host', initials: ['DK', 'SC'], extra: '+2', active: false },
    { id: 'sft-8', time: '14:00 - 22:00', label: 'Prep & Setup', desc: '3 Kitchen, 3 Servers', initials: ['KN', 'RK'], extra: '+4', active: false },
    { id: 'sft-9', time: '09:00 - 17:00', label: 'Admin & Inventory', desc: '1 Manager, 1 Admin', initials: ['SA'], extra: '+1', active: false },
    { id: 'sft-10', time: '16:00 - 00:00', label: 'Dinner Service', desc: '5 Kitchen, 6 Front of House', initials: ['MV', 'JC', 'ER'], extra: '+8', active: true }
  ];

  var sampleCommissions = [
    { id: 'com-1', name: 'Maria Vasquez', reason: 'Wine Upsell Target Reached', amount: 125.00, status: 'pending', date: '2025-06-20' },
    { id: 'com-2', name: 'David Kim', reason: 'Private Event Gratuity Share', amount: 340.50, status: 'pending', date: '2025-06-19' },
    { id: 'com-3', name: 'Elena Rodriguez', reason: 'Top Seller Monthly Bonus', amount: 200.00, status: 'pending', date: '2025-06-18' },
    { id: 'com-4', name: 'James Chen', reason: 'Catering Event Premium', amount: 450.00, status: 'pending', date: '2025-06-21' },
    { id: 'com-5', name: 'Laura Hall', reason: 'Team Performance Bonus', amount: 175.00, status: 'pending', date: '2025-06-22' }
  ];

  var employees = Utils.storage.get(EMP_KEY, null);
  if (!employees || !employees.length) { Utils.storage.set(EMP_KEY, sampleEmployees); employees = sampleEmployees.slice(); }
  var shifts = Utils.storage.get(SHIFT_KEY, null);
  if (!shifts || !shifts.length) { Utils.storage.set(SHIFT_KEY, sampleShifts); shifts = sampleShifts.slice(); }
  var commissions = Utils.storage.get(COMM_KEY, null);
  if (!commissions || !commissions.length) { Utils.storage.set(COMM_KEY, sampleCommissions); commissions = sampleCommissions.slice(); }

  var selectedCommissions = {};

  function updateStaffSummary() {
    var active = employees.filter(function(e) { return e.status !== 'off'; }).length;
    var todayShifts = shifts.filter(function(s) { return s.active; }).length;
    var pendingComms = commissions.filter(function(c) { return c.status === 'pending'; });
    var pendingTotal = pendingComms.reduce(function(s, c) { return s + c.amount; }, 0);
    var newHires = 3;

    staffSummary = {
      totalEmployees: employees.length,
      newHires: newHires,
      activeShifts: todayShifts,
      totalCommissions: pendingTotal,
      pendingApprovals: pendingComms.length
    };
    staffRoster = employees.map(function(e) { return { initials: e.initials, name: e.name, role: e.role, status: e.status, performance: e.performance, id: e.id }; });
    shiftTimeline = shifts.map(function(s) { return { time: s.time, label: s.label, description: s.desc, initials: s.initials, extra: s.extra, active: s.active, id: s.id }; });
    commissionItems = commissions.filter(function(c) { return c.status === 'pending'; }).map(function(c) { return { id: c.id, name: c.name, reason: c.reason, amount: c.amount, date: c.date }; });
  }

  function renderStaffTable() {
    var sections = document.querySelectorAll('section');
    if (!sections[1]) return;
    var tbody = sections[1].querySelector('tbody');
    if (!tbody) return;
    var statusMap = { 'clocked-in': { bg: 'bg-tertiary/10', text: 'text-tertiary', dot: 'bg-tertiary', label: 'Clocked In' }, 'off': { bg: 'bg-surface-variant', text: 'text-on-surface-variant', dot: 'bg-outline', label: 'Off' }, 'late': { bg: 'bg-error-container', text: 'text-on-error-container', dot: 'bg-error', label: 'Late' } };
    tbody.innerHTML = '';
    employees.forEach(function(m) {
      var s = statusMap[m.status] || statusMap['off'];
      var av = m.status === 'off' ? 'bg-surface-variant text-on-surface-variant' : 'bg-secondary-container text-on-secondary-container';
      var nc = m.status === 'off' ? 'text-on-surface-variant' : '';
      var rc = m.status === 'off' ? 'text-on-surface-variant' : '';
      var tr = document.createElement('tr');
      tr.className = 'border-b border-outline-variant/50 hover:bg-surface-container-low transition-colors group';
      tr.innerHTML = '<td class="px-md py-sm flex items-center gap-3"><div class="w-8 h-8 rounded-full ' + av + ' flex items-center justify-center font-bold text-xs">' + m.initials + '</div><span class="font-medium ' + nc + '">' + m.name + '</span></td><td class="px-md py-sm ' + rc + '">' + m.role + '</td><td class="px-md py-sm"><span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ' + s.bg + ' ' + s.text + ' font-label-md text-[10px] uppercase"><span class="w-1.5 h-1.5 rounded-full ' + s.dot + '"></span> ' + s.label + '</span></td><td class="px-md py-sm text-right font-data-mono">' + m.performance + ' / 5.0</td><td class="px-md py-sm text-center"><button class="text-secondary hover:text-primary delete-staff opacity-0 group-hover:opacity-100 transition-opacity" data-id="' + m.id + '" title="Delete"><span class="material-symbols-outlined text-[18px]">delete</span></button></td>';
      tr.addEventListener('click', function(e) { if (e.target.closest('.delete-staff')) return; window.location.href = 'hr-employee-profile.html?id=' + m.id; });
      tbody.appendChild(tr);
    });
    tbody.querySelectorAll('.delete-staff').forEach(function(btn) {
      btn.addEventListener('click', function(e) { e.stopPropagation();
        Utils.confirm('Delete this employee?', function() {
          var id = btn.dataset.id;
          employees = employees.filter(function(e) { return e.id !== id; });
          Utils.storage.set(EMP_KEY, employees);
          updateStaffSummary(); renderAll(); Utils.notify('Employee deleted', 'success');
        });
      });
    });
  }

  function renderShifts() {
    var sections = document.querySelectorAll('section');
    if (!sections[2]) return;
    var tc = sections[2].querySelector('.p-md');
    if (!tc) return;
    tc.innerHTML = '';
    shifts.forEach(function(e) {
      var bc = e.active ? 'border-primary' : 'border-tertiary-container';
      var tmc = e.active ? 'font-data-mono text-body-sm text-primary font-bold' : 'font-data-mono text-body-sm text-on-surface-variant';
      var cc = e.active ? 'flex-1 bg-primary-container/5 py-2 px-3 rounded border border-primary/20 flex justify-between items-center shadow-sm' : 'flex-1 bg-surface py-2 px-3 rounded border border-outline-variant/50 flex justify-between items-center';
      var pulse = e.active ? '<div class="absolute -left-[5px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary animate-pulse"></div>' : '';
      var ah = '';
      e.initials.forEach(function(i) { ah += '<div class="w-6 h-6 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-[10px] border border-surface">' + i + '</div>'; });
      ah += '<div class="w-6 h-6 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center text-[10px] border border-surface">' + e.extra + '</div>';
      var div = document.createElement('div');
      div.className = 'flex items-center gap-md border-l-2 ' + bc + ' pl-sm py-1 relative';
      div.innerHTML = pulse + '<div class="w-24 flex-shrink-0 ' + tmc + '">' + e.time + '</div><div class="' + cc + '"><div><span class="font-label-md text-label-md text-on-surface block">' + e.label + '</span><span class="font-body-sm text-body-sm text-on-surface-variant">' + e.desc + '</span></div><div class="flex -space-x-2">' + ah + '</div></div>';
      tc.appendChild(div);
    });
  }

  function renderCommissions() {
    var sections = document.querySelectorAll('section');
    if (!sections[3]) return;
    var cc2 = sections[3].querySelector('.flex-1.overflow-y-auto');
    if (!cc2) return;
    var pending = commissions.filter(function(c) { return c.status === 'pending'; });
    cc2.innerHTML = '';
    pending.forEach(function(item) {
      var checked = selectedCommissions[item.id] ? ' checked' : '';
      var d = document.createElement('div');
      d.className = 'border border-outline-variant rounded p-3 hover:border-primary-container/50 transition-colors bg-surface relative overflow-hidden group';
      d.innerHTML = '<div class="absolute top-0 left-0 w-1 h-full bg-tertiary-container"></div><div class="pl-2 flex justify-between items-start mb-2"><div><h4 class="font-label-md text-label-md text-on-surface">' + item.name + '</h4><p class="font-body-sm text-[11px] text-on-surface-variant">' + item.reason + '</p></div><div class="flex items-center gap-2"><input type="checkbox" class="bulk-check" data-id="' + item.id + '"' + checked + '><span class="font-data-mono text-body-md font-bold text-on-surface">$' + item.amount.toFixed(2) + '</span></div></div><div class="pl-2 flex gap-2 mt-3"><button class="flex-1 bg-surface-variant hover:bg-surface-container-highest text-on-surface-variant font-label-md text-[11px] py-1.5 rounded transition-colors approve-one" data-id="' + item.id + '">Approve</button><button class="flex-1 bg-error-container text-on-error-container font-label-md text-[11px] py-1.5 rounded hover:opacity-80 transition-opacity reject-one" data-id="' + item.id + '">Reject</button></div>';
      cc2.appendChild(d);
    });
    cc2.querySelectorAll('.approve-one').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = btn.dataset.id;
        for (var i = 0; i < commissions.length; i++) { if (commissions[i].id === id) { commissions[i].status = 'approved'; break; } }
        Utils.storage.set(COMM_KEY, commissions);
        delete selectedCommissions[id];
        updateStaffSummary(); renderAll(); Utils.notify('Commission approved', 'success');
      });
    });
    cc2.querySelectorAll('.reject-one').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var id = btn.dataset.id;
        for (var i = 0; i < commissions.length; i++) { if (commissions[i].id === id) { commissions[i].status = 'rejected'; break; } }
        Utils.storage.set(COMM_KEY, commissions);
        delete selectedCommissions[id];
        updateStaffSummary(); renderAll(); Utils.notify('Commission rejected', 'info');
      });
    });
    cc2.querySelectorAll('.bulk-check').forEach(function(cb) {
      cb.addEventListener('change', function() {
        if (this.checked) selectedCommissions[this.dataset.id] = true;
        else delete selectedCommissions[this.dataset.id];
        updateBulkBtn();
      });
    });
    updateBulkBtn();
  }

  function updateBulkBtn() {
    var sections = document.querySelectorAll('section');
    if (!sections[3]) return;
    var ab = sections[3].querySelector('button.border-outline, button.border');
    if (!ab) return;
    var count = Object.keys(selectedCommissions).length;
    if (count > 0) {
      ab.innerHTML = '<span class="material-symbols-outlined text-[18px]">fact_check</span> Approve Selected (' + count + ')';
    } else {
      var pending = commissions.filter(function(c) { return c.status === 'pending'; }).length;
      ab.innerHTML = '<span class="material-symbols-outlined text-[18px]">fact_check</span> Bulk Approve All (' + pending + ')';
    }
  }

  function updateMetrics() {
    var sections = document.querySelectorAll('section');
    if (!sections[0]) return;
    var metricValues = sections[0].querySelectorAll('.font-data-mono.text-display-lg');
    var metricSubtexts = sections[0].querySelectorAll('.font-body-sm');
    if (metricValues[0]) metricValues[0].textContent = staffSummary.totalEmployees;
    if (metricValues[1]) metricValues[1].textContent = staffSummary.activeShifts;
    if (metricValues[2]) metricValues[2].textContent = '$' + staffSummary.totalCommissions.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    var icon0 = metricSubtexts[0]?.querySelector('.material-symbols-outlined');
    if (metricSubtexts[0]) { metricSubtexts[0].innerHTML = ''; if (icon0) metricSubtexts[0].appendChild(icon0); metricSubtexts[0].appendChild(document.createTextNode(' +' + staffSummary.newHires + ' this month')); }
    if (metricSubtexts[1]) metricSubtexts[1].textContent = 'Currently clocked in';
    if (metricSubtexts[2]) metricSubtexts[2].textContent = 'Pending approval: ' + staffSummary.pendingApprovals;
  }

  function renderAll() {
    updateMetrics();
    renderStaffTable();
    renderShifts();
    renderCommissions();
  }

  function init() {
    updateStaffSummary();
    renderAll();

    var sections = document.querySelectorAll('section');

    if (sections[3]) {
      var ab = sections[3].querySelector('button.border-outline, button.border');
      if (ab) ab.addEventListener('click', function() {
        var ids = Object.keys(selectedCommissions);
        if (ids.length === 0) {
          commissions.filter(function(c) { return c.status === 'pending'; }).forEach(function(c) { c.status = 'approved'; });
        } else {
          ids.forEach(function(id) {
            for (var i = 0; i < commissions.length; i++) { if (commissions[i].id === id) { commissions[i].status = 'approved'; break; } }
          });
          selectedCommissions = {};
        }
        Utils.storage.set(COMM_KEY, commissions);
        updateStaffSummary(); renderAll(); Utils.notify('Commissions approved', 'success');
      });
    }

    var addStaffBtn = Array.from(document.querySelectorAll('button')).find(function(b) { return b.textContent.trim() === 'Add Staff'; });
    if (addStaffBtn) addStaffBtn.addEventListener('click', function() {
      Utils.prompt({ title: 'Add Staff Member', fields: [
        { name: 'name', label: 'Full Name' }, { name: 'role', label: 'Role' }, { name: 'email', label: 'Email' }, { name: 'phone', label: 'Phone' }
      ], onSave: function(vals) {
        var inits = vals.name.split(' ').map(function(n) { return n[0]; }).join('').substring(0, 2).toUpperCase();
        var id = 'EMP-' + String(employees.length + 1).padStart(3, '0');
        employees.push({ id: id, name: vals.name, initials: inits, role: vals.role, status: 'off', performance: 4.0, email: vals.email, phone: vals.phone });
        Utils.storage.set(EMP_KEY, employees);
        updateStaffSummary(); renderAll(); Utils.notify('Staff added', 'success');
      }});
    });

    var addShiftBtn = Array.from(document.querySelectorAll('button')).find(function(b) { return b.textContent.trim() === 'View Full Calendar'; });
    if (addShiftBtn) {
      addShiftBtn.textContent = '';
      addShiftBtn.innerHTML = '<span class="material-symbols-outlined text-[18px]">add</span> Add Shift';
      addShiftBtn.addEventListener('click', function() {
        Utils.prompt({ title: 'Add Shift', fields: [
          { name: 'label', label: 'Shift Label' }, { name: 'time', label: 'Time Range (e.g. 09:00 - 17:00)' }, { name: 'desc', label: 'Description', type: 'textarea' }
        ], onSave: function(vals) {
          var id = 'sft-' + Utils.uid();
          shifts.push({ id: id, time: vals.time, label: vals.label, desc: vals.desc, initials: ['ST'], extra: '+0', active: false });
          Utils.storage.set(SHIFT_KEY, shifts);
          updateStaffSummary(); renderShifts(); Utils.notify('Shift added', 'success');
        }});
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
