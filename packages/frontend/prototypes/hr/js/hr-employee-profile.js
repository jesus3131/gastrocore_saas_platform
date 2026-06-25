
const employee = {
  name: "Elena Rodriguez",
  initials: "ER",
  position: "Senior Waitstaff",
  id: "EMP-4092",
  location: "Main Dining Hall",
  status: "Active",
  metrics: { avgOrderValue: 42.50, aovTrend: "+5.2%", onTimeArrival: 98.2, feedback: 4.8 },
  schedule: [
    { date: "Today, Oct 24", shift: "16:00 - 00:00", role: "Dinner Service", status: "confirmed" },
    { date: "Tomorrow, Oct 25", shift: "16:00 - 00:00", role: "Dinner Service", status: "confirmed" },
    { date: "Fri, Oct 26", shift: "10:00 - 18:00", role: "Lunch Service", status: "pending" }
  ],
  earnings: { total: 1845.20, period: "Oct 1 - Oct 15", baseSalary: 1200.00, commissions: 585.20, tips: null },
  permissions: { pos: true, voidComps: false, inventoryView: true }
};



(function() {
  // Profile header
  document.querySelector('.glass-card h1').textContent = employee.name;
  var statusSpan = document.querySelector('.glass-card .rounded-full.flex.items-center.gap-1.border');
  if (statusSpan) {
    var dot = statusSpan.querySelector('.w-2.h-2');
    statusSpan.innerHTML = '';
    if (dot) statusSpan.appendChild(dot);
    statusSpan.appendChild(document.createTextNode(' ' + employee.status));
  }
  var bodyMd = document.querySelectorAll('.glass-card .font-body-md');
  if (bodyMd[0]) bodyMd[0].textContent = employee.position + ' \u2022 ID: ' + employee.id;
  var locSpan = document.querySelector('.glass-card .font-body-sm.text-secondary');
  if (locSpan) {
    var icon = locSpan.querySelector('.material-symbols-outlined');
    locSpan.innerHTML = '';
    if (icon) locSpan.appendChild(icon);
    locSpan.appendChild(document.createTextNode(' ' + employee.location));
  }

  // Metrics cards
  var metricCards = document.querySelectorAll('.md\\:col-span-8.grid.grid-cols-1.sm\\:grid-cols-3.gap-md > div');
  var aovValue = metricCards[0].querySelector('h3');
  if (aovValue) aovValue.textContent = '$' + employee.metrics.avgOrderValue.toFixed(2);
  var aovTrend = metricCards[0].querySelector('.font-label-md.text-label-md');
  if (aovTrend) aovTrend.innerHTML = '<span class="material-symbols-outlined text-[14px]">trending_up</span> ' + employee.metrics.aovTrend;

  var arrivalValue = metricCards[1].querySelector('h3');
  if (arrivalValue) arrivalValue.textContent = employee.metrics.onTimeArrival + '%';

  var feedbackVal = metricCards[2].querySelector('h3');
  if (feedbackVal) feedbackVal.textContent = employee.metrics.feedback;
  var feedbackSub = metricCards[2].querySelector('.font-label-md');
  if (feedbackSub && feedbackSub.textContent.trim() === 'Top 10%') { /* keep hardcoded */ }

  // Schedule
  var stbody = document.querySelector('.col-span-1.sm\\:col-span-3 table tbody');
  var sMap = { confirmed: { bg: 'bg-tertiary-container/10', text: 'text-tertiary-container', dot: 'bg-tertiary-container', label: 'Confirmed' }, pending: { bg: 'bg-surface-container-highest', text: 'text-on-surface-variant', dot: 'bg-outline', label: 'Pending' } };
  employee.schedule.forEach(function(s) {
    var cfg = sMap[s.status] || sMap['pending'];
    var tr = document.createElement('tr');
    tr.className = 'border-b border-surface-container-low hover:bg-surface-container-low transition-colors';
    tr.innerHTML = '<td class="py-3 px-4 font-body-sm text-body-sm text-on-surface">' + s.date + '</td><td class="py-3 px-4 font-data-mono text-data-mono text-on-surface-variant">' + s.shift + '</td><td class="py-3 px-4 font-body-sm text-body-sm text-on-surface-variant">' + s.role + '</td><td class="py-3 px-4 text-right"><span class="inline-flex items-center gap-1 px-2 py-1 rounded-full ' + cfg.bg + ' ' + cfg.text + ' font-label-md text-label-md"><span class="w-1.5 h-1.5 rounded-full ' + cfg.dot + '"></span> ' + cfg.label + '</span></td>';
    stbody.appendChild(tr);
  });

  // Earnings
  var earnCard = document.querySelector('.md\\:col-span-4 .space-y-md > div:first-child');
  if (earnCard) {
    earnCard.querySelector('.font-label-md.text-label-md.text-on-surface-variant').textContent = employee.earnings.period;
    earnCard.querySelector('h2').textContent = '$' + employee.earnings.total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    var earnItems = earnCard.querySelectorAll('.font-data-mono');
    if (earnItems[0]) earnItems[0].textContent = '$' + employee.earnings.baseSalary.toFixed(2);
    if (earnItems[1]) earnItems[1].textContent = '$' + employee.earnings.commissions.toFixed(2);
    if (earnItems[2]) earnItems[2].textContent = employee.earnings.tips === null ? 'Not tracked' : '$' + employee.earnings.tips.toFixed(2);
  }

  // Permissions
  var toggles = document.querySelectorAll('.md\\:col-span-4 .space-y-4 input[type="checkbox"]');
  if (toggles[0]) toggles[0].checked = employee.permissions.pos;
  if (toggles[1]) toggles[1].checked = employee.permissions.voidComps;
  if (toggles[2]) toggles[2].checked = employee.permissions.inventoryView;
})();
