var employee = { name: '', initials: '', position: '', id: '', location: '', status: 'Active', metrics: { avgOrderValue: 0, aovTrend: '+0%', onTimeArrival: 0, feedback: 0 }, schedule: [], earnings: { total: 0, period: '', baseSalary: 0, commissions: 0, tips: null }, permissions: { pos: false, voidComps: false, inventoryView: false, reports: false, admin: false } };

(function() {
  var EMP_KEY = 'hr_employees';

  function getParam(name) { var m = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search); return m ? decodeURIComponent(m[1]) : null; }

  function render(emp) {
    if (!emp) return;
    if (!emp.schedule || !emp.schedule.length) {
      emp.schedule = [
        { date: 'Today, ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), shift: '16:00 - 00:00', role: 'Dinner Service', status: 'confirmed' },
        { date: 'Tomorrow, ' + new Date(Date.now() + 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), shift: '16:00 - 00:00', role: 'Dinner Service', status: 'confirmed' },
        { date: new Date(Date.now() + 2 * 86400000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }), shift: '10:00 - 18:00', role: 'Lunch Service', status: 'pending' }
      ];
    }
    if (!emp.earnings) {
      emp.earnings = { total: 1845.20, period: 'Oct 1 - Oct 15', baseSalary: 1200.00, commissions: 585.20, tips: null };
    }
    if (!emp.permissions) {
      emp.permissions = { pos: true, voidComps: false, inventoryView: true, reports: false, admin: false };
    }

    employee = JSON.parse(JSON.stringify(emp));

    var h1 = document.querySelector('.glass-card h1');
    if (h1) h1.textContent = emp.name;

    var statusSpan = document.querySelector('.glass-card .rounded-full.flex.items-center.gap-1.border');
    if (statusSpan) {
      var dot = statusSpan.querySelector('.w-2.h-2');
      statusSpan.innerHTML = '';
      if (dot) statusSpan.appendChild(dot);
      statusSpan.appendChild(document.createTextNode(' ' + emp.status));
    }

    var bodyMd = document.querySelectorAll('.glass-card .font-body-md');
    if (bodyMd[0]) bodyMd[0].textContent = emp.role + ' \u2022 ID: ' + emp.id;

    var locSpan = document.querySelector('.glass-card .font-body-sm.text-secondary');
    if (locSpan) {
      var icon = locSpan.querySelector('.material-symbols-outlined');
      locSpan.innerHTML = '';
      if (icon) locSpan.appendChild(icon);
      locSpan.appendChild(document.createTextNode(' ' + (emp.location || 'Main Dining Hall')));
    }

    var metricCards = document.querySelectorAll('.md\\:col-span-8.grid.grid-cols-1.sm\\:grid-cols-3.gap-md > div');
    if (metricCards.length >= 3) {
      var aovVal = metricCards[0].querySelector('h3');
      if (aovVal) aovVal.textContent = '$' + Number(emp.metrics.avgOrderValue || 0).toFixed(2);
      var aovTrend = metricCards[0].querySelector('.font-label-md.text-label-md');
      if (aovTrend) aovTrend.innerHTML = '<span class="material-symbols-outlined text-[14px]">trending_up</span> ' + (emp.metrics.aovTrend || '+0%');

      var arrivalVal = metricCards[1].querySelector('h3');
      if (arrivalVal) arrivalVal.textContent = (emp.metrics.onTimeArrival || 0) + '%';

      var feedbackVal = metricCards[2].querySelector('h3');
      if (feedbackVal) feedbackVal.textContent = emp.metrics.feedback || 0;
    }

    var stbody = document.querySelector('.col-span-1.sm\\:col-span-3 table tbody');
    if (stbody) {
      var sMap = { confirmed: { bg: 'bg-tertiary-container/10', text: 'text-tertiary-container', dot: 'bg-tertiary-container', label: 'Confirmed' }, pending: { bg: 'bg-surface-container-highest', text: 'text-on-surface-variant', dot: 'bg-outline', label: 'Pending' } };
      stbody.innerHTML = '';
      emp.schedule.forEach(function(s, i) {
        var cfg = sMap[s.status] || sMap['pending'];
        var tr = document.createElement('tr');
        tr.className = 'border-b border-surface-container-low hover:bg-surface-container-low transition-colors';
        tr.innerHTML = '<td class="py-3 px-4 font-body-sm text-body-sm text-on-surface">' + s.date + '</td><td class="py-3 px-4 font-data-mono text-data-mono text-on-surface-variant">' + s.shift + '</td><td class="py-3 px-4 font-body-sm text-body-sm text-on-surface-variant">' + s.role + '</td><td class="py-3 px-4 text-right"><span class="inline-flex items-center gap-1 px-2 py-1 rounded-full ' + cfg.bg + ' ' + cfg.text + ' font-label-md text-label-md schedule-status" data-idx="' + i + '"><span class="w-1.5 h-1.5 rounded-full ' + cfg.dot + '"></span> ' + cfg.label + '</span> <button class="delete-schedule text-on-surface-variant hover:text-error ml-1" data-idx="' + i + '" title="Remove"><span class="material-symbols-outlined text-[14px]">close</span></button></td>';
        stbody.appendChild(tr);
      });
      stbody.querySelectorAll('.delete-schedule').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var idx = parseInt(btn.dataset.idx);
          Utils.confirm('Remove this schedule entry?', function() {
            emp.schedule.splice(idx, 1);
            saveEmp(emp); render(emp); Utils.notify('Schedule entry removed', 'success');
          });
        });
      });
    }

    var earnCard = document.querySelector('.md\\:col-span-4 .space-y-md > div:first-child');
    if (earnCard) {
      var periodEl = earnCard.querySelector('.font-label-md.text-label-md.text-on-surface-variant');
      if (periodEl) periodEl.textContent = emp.earnings.period;
      var totalEl = earnCard.querySelector('h2');
      if (totalEl) totalEl.textContent = '$' + emp.earnings.total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      var earnItems = earnCard.querySelectorAll('.font-data-mono');
      if (earnItems[0]) earnItems[0].textContent = '$' + emp.earnings.baseSalary.toFixed(2);
      if (earnItems[1]) earnItems[1].textContent = '$' + emp.earnings.commissions.toFixed(2);
      if (earnItems[2]) earnItems[2].textContent = emp.earnings.tips === null ? 'Not tracked' : '$' + emp.earnings.tips.toFixed(2);
    }

    var toggles = document.querySelectorAll('.md\\:col-span-4 .space-y-4 input[type="checkbox"]');
    var permKeys = ['pos', 'voidComps', 'inventoryView', 'reports', 'admin'];
    toggles.forEach(function(t, i) {
      if (i < permKeys.length) t.checked = !!emp.permissions[permKeys[i]];
      t.addEventListener('change', function() {
        if (i < permKeys.length) {
          emp.permissions[permKeys[i]] = this.checked;
          saveEmp(emp);
          Utils.notify(permKeys[i] + ' permission ' + (this.checked ? 'enabled' : 'disabled'), 'info');
        }
      });
    });
  }

  function saveEmp(emp) {
    var all = Utils.storage.get(EMP_KEY, []);
    for (var i = 0; i < all.length; i++) { if (all[i].id === emp.id) { all[i] = emp; break; } }
    Utils.storage.set(EMP_KEY, all);
  }

  function init() {
    var id = getParam('id');
    var all = Utils.storage.get(EMP_KEY, []);
    var emp = id ? all.filter(function(e) { return e.id === id; })[0] : all[0];
    if (!emp && all.length) emp = all[0];
    if (!emp) return;

    if (!emp.metrics) emp.metrics = { avgOrderValue: 42.50, aovTrend: '+5.2%', onTimeArrival: 98.2, feedback: 4.8 };
    if (!emp.location) emp.location = 'Main Dining Hall';
    if (!emp.status) emp.status = 'Active';

    render(emp);

    var editBtn = Array.from(document.querySelectorAll('button')).find(function(b) { return b.textContent.trim() === 'Edit Profile'; });
    if (editBtn) editBtn.addEventListener('click', function() {
      Utils.prompt({ title: 'Edit Employee', fields: [
        { name: 'name', label: 'Full Name' }, { name: 'role', label: 'Position / Role' }, { name: 'email', label: 'Email' }, { name: 'phone', label: 'Phone' }
      ], data: { name: emp.name, role: emp.role, email: emp.email || '', phone: emp.phone || '' }, onSave: function(vals) {
        emp.name = vals.name; emp.role = vals.role; emp.email = vals.email; emp.phone = vals.phone;
        emp.initials = vals.name.split(' ').map(function(n) { return n[0]; }).join('').substring(0, 2).toUpperCase();
        saveEmp(emp); render(emp); Utils.notify('Employee updated', 'success');
      }});
    });

    var scheduleHeader = Array.from(document.querySelectorAll('h3')).find(function(h) { return h.textContent.trim() === 'Upcoming Schedule'; });
    if (scheduleHeader) {
      var parent = scheduleHeader.closest('.bg-surface-container');
      if (parent) {
        var viewBtn = parent.querySelector('button');
        if (viewBtn) {
          viewBtn.textContent = '';
          viewBtn.innerHTML = '<span class="material-symbols-outlined text-[18px]">add</span> Add Shift';
          viewBtn.addEventListener('click', function() {
            Utils.prompt({ title: 'Add Schedule Entry', fields: [
              { name: 'date', label: 'Date' }, { name: 'shift', label: 'Shift Time' }, { name: 'role', label: 'Role' },
              { name: 'status', label: 'Status', type: 'select', options: [{ value: 'confirmed', label: 'Confirmed' }, { value: 'pending', label: 'Pending' }] }
            ], data: { date: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }), shift: '09:00 - 17:00', role: emp.role }, onSave: function(vals) {
              emp.schedule.push({ date: vals.date, shift: vals.shift, role: vals.role, status: vals.status || 'pending' });
              saveEmp(emp); render(emp); Utils.notify('Schedule entry added', 'success');
            }});
          });
        }
      }
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
