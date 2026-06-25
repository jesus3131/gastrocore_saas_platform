
const staffSummary = { totalEmployees: 142, newHires: 3, activeShifts: 38, totalCommissions: 12450, pendingApprovals: 4 };
const staffRoster = [
  { initials: "MV", name: "Maria Vasquez", role: "Head Waiter", status: "clocked-in", performance: 4.9 },
  { initials: "JC", name: "James Chen", role: "Sous Chef", status: "clocked-in", performance: 4.7 },
  { initials: "SA", name: "Sarah Adams", role: "Floor Manager", status: "off", performance: 4.8 },
  { initials: "RJ", name: "Robert Jones", role: "Bartender", status: "late", performance: 4.2 }
];
const shiftTimeline = [
  { time: "08:00 - 16:00", label: "Morning Prep &amp; Service", description: "4 Kitchen, 2 Front of House", initials: ["JC", "AL"], extra: "+4", active: false },
  { time: "15:00 - 23:00", label: "Evening Peak Service", description: "6 Kitchen, 8 Front of House", initials: ["MV", "SA"], extra: "+12", active: true }
];
const commissionItems = [
  { name: "Maria Vasquez", reason: "Wine Upsell Target Reached", amount: 125.00 },
  { name: "David Kim", reason: "Private Event Gratuity Share", amount: 340.50 }
];



(function() {
  var sections = document.querySelectorAll('section');

  // Summary metrics
  var metricValues = sections[0].querySelectorAll('.font-data-mono.text-display-lg');
  var metricSubtexts = sections[0].querySelectorAll('.font-body-sm');
  metricValues[0].textContent = staffSummary.totalEmployees;
  metricValues[1].textContent = staffSummary.activeShifts;
  metricValues[2].textContent = '$' + staffSummary.totalCommissions.toLocaleString();
  var icon0 = metricSubtexts[0].querySelector('.material-symbols-outlined');
  if (icon0) { metricSubtexts[0].innerHTML = ''; metricSubtexts[0].appendChild(icon0); metricSubtexts[0].appendChild(document.createTextNode(' +' + staffSummary.newHires + ' this month')); }
  metricSubtexts[1].textContent = 'Currently clocked in';
  metricSubtexts[2].textContent = 'Pending approval: ' + staffSummary.pendingApprovals;

  // Staff roster
  var tbody = sections[1].querySelector('tbody');
  var statusMap = { 'clocked-in': { bg: 'bg-tertiary/10', text: 'text-tertiary', dot: 'bg-tertiary', label: 'Clocked In' }, 'off': { bg: 'bg-surface-variant', text: 'text-on-surface-variant', dot: 'bg-outline', label: 'Off' }, 'late': { bg: 'bg-error-container', text: 'text-on-error-container', dot: 'bg-error', label: 'Late' } };
  staffRoster.forEach(function(m) {
    var s = statusMap[m.status] || statusMap['off'];
    var av = m.status === 'off' ? 'bg-surface-variant text-on-surface-variant' : 'bg-secondary-container text-on-secondary-container';
    var nc = m.status === 'off' ? 'text-on-surface-variant' : '';
    var rc = m.status === 'off' ? 'text-on-surface-variant' : '';
    var tr = document.createElement('tr');
    tr.className = 'border-b border-outline-variant/50 hover:bg-surface-container-low transition-colors group';
    tr.innerHTML = '<td class="px-md py-sm flex items-center gap-3"><div class="w-8 h-8 rounded-full ' + av + ' flex items-center justify-center font-bold text-xs">' + m.initials + '</div><span class="font-medium ' + nc + '">' + m.name + '</span></td><td class="px-md py-sm ' + rc + '">' + m.role + '</td><td class="px-md py-sm"><span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ' + s.bg + ' ' + s.text + ' font-label-md text-[10px] uppercase"><span class="w-1.5 h-1.5 rounded-full ' + s.dot + '"></span> ' + s.label + '</span></td><td class="px-md py-sm text-right font-data-mono">' + m.performance + ' / 5.0</td><td class="px-md py-sm text-center"><button class="text-secondary hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"><span class="material-symbols-outlined text-[18px]">more_vert</span></button></td>';
    tbody.appendChild(tr);
  });

  // Shift timeline
  var tc = sections[2].querySelector('.p-md');
  shiftTimeline.forEach(function(e) {
    var bc = e.active ? 'border-primary' : 'border-tertiary-container';
    var tmc = e.active ? 'font-data-mono text-body-sm text-primary font-bold' : 'font-data-mono text-body-sm text-on-surface-variant';
    var cc = e.active ? 'flex-1 bg-primary-container/5 py-2 px-3 rounded border border-primary/20 flex justify-between items-center shadow-sm' : 'flex-1 bg-surface py-2 px-3 rounded border border-outline-variant/50 flex justify-between items-center';
    var pulse = e.active ? '<div class="absolute -left-[5px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary animate-pulse"></div>' : '';
    var ah = '';
    e.initials.forEach(function(i) { ah += '<div class="w-6 h-6 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-[10px] border border-surface">' + i + '</div>'; });
    ah += '<div class="w-6 h-6 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center text-[10px] border border-surface">' + e.extra + '</div>';
    var div = document.createElement('div');
    div.className = 'flex items-center gap-md border-l-2 ' + bc + ' pl-sm py-1 relative';
    div.innerHTML = pulse + '<div class="w-24 flex-shrink-0 ' + tmc + '">' + e.time + '</div><div class="' + cc + '"><div><span class="font-label-md text-label-md text-on-surface block">' + e.label + '</span><span class="font-body-sm text-body-sm text-on-surface-variant">' + e.description + '</span></div><div class="flex -space-x-2">' + ah + '</div></div>';
    tc.appendChild(div);
  });

  // Commission items
  var cc2 = sections[3].querySelector('.flex-1.overflow-y-auto');
  commissionItems.forEach(function(item) {
    var d = document.createElement('div');
    d.className = 'border border-outline-variant rounded p-3 hover:border-primary-container/50 transition-colors bg-surface relative overflow-hidden group';
    d.innerHTML = '<div class="absolute top-0 left-0 w-1 h-full bg-tertiary-container"></div><div class="pl-2 flex justify-between items-start mb-2"><div><h4 class="font-label-md text-label-md text-on-surface">' + item.name + '</h4><p class="font-body-sm text-[11px] text-on-surface-variant">' + item.reason + '</p></div><span class="font-data-mono text-body-md font-bold text-on-surface">$' + item.amount.toFixed(2) + '</span></div><div class="pl-2 flex gap-2 mt-3"><button class="flex-1 bg-surface-variant hover:bg-surface-container-highest text-on-surface-variant font-label-md text-[11px] py-1.5 rounded transition-colors">Review</button><button class="flex-1 bg-primary text-on-primary font-label-md text-[11px] py-1.5 rounded hover:opacity-90 transition-opacity">Approve</button></div>';
    cc2.appendChild(d);
  });

  // Bulk approve count
  var ab = sections[3].querySelector('button.border-outline');
  if (ab) ab.innerHTML = '<span class="material-symbols-outlined text-[18px]">fact_check</span> Bulk Approve All (' + staffSummary.pendingApprovals + ')';
})();
