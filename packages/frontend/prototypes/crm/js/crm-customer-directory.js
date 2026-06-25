
const directoryData = {
  enrolledCount: "12,450",
  segments: [
    { label: "VIP Members", count: "1,240", change: "+12%", changeClass: "text-tertiary-container", icon: "star", iconBg: "bg-secondary-container", iconColor: "text-primary-container", badge: { text: "Active", color: "#166534", bg: "#dcfce7" } },
    { label: "Loyal", count: "4,850", change: "+5%", changeClass: "text-tertiary-container", icon: "favorite", iconBg: "bg-surface-container-high", iconColor: "text-on-surface-variant", badge: null },
    { label: "Occasional", count: "5,100", change: "-2%", changeClass: "text-on-surface-variant", icon: "local_cafe", iconBg: "bg-surface-container-high", iconColor: "text-on-surface-variant", badge: null },
    { label: "Inactive (90d+)", count: "1,260", change: "+8%", changeClass: "text-[#991b1b]", icon: "snooze", iconBg: "bg-[#fee2e2]", iconColor: "text-[#991b1b]", badge: null }
  ],
  customers: [
    { initials: "JD", name: "Jane Doe", email: "jane.doe@example.com", tag: "VIP", tagBg: "bg-secondary-container", tagColor: "text-on-secondary-container", lastVisit: "Oct 24, 2023", totalSpent: "$4,250.00", points: "12,500", avatar: null },
    { initials: "MS", name: "Michael Smith", email: "m.smith@example.com", tag: "Loyal", tagBg: "bg-surface-container-high", tagColor: "text-on-surface-variant", lastVisit: "Oct 22, 2023", totalSpent: "$1,840.50", points: "3,200", avatar: null },
    { initials: "SJ", name: "Sarah Jenkins", email: "sarah.j@company.net", tag: "Inactive", tagBg: "bg-[#fee2e2]", tagColor: "text-[#991b1b]", lastVisit: "Jul 15, 2023", totalSpent: "$350.00", points: "450", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBHpueHxXi2SoXXe_gQ_DJVgty_ukoQZg6neMVEP0AtT5yJWfnmU-HCrefKddwUtqZtBJ2-fDNCHE0ujGRm948JhsX68aYEK0yacCZdfRhyh3J9TnZcIfCil7Em2Kq2D212KxL7Kw648sPv7XYLSCTJkGU4mDxWjrq5isaIr6gyhAPJACkQS5o_mbxyfilIOwLFx1rDsM_k63Dnz9MmPZFILyzFtl3keIH060cIy_HTNi1CZN02-49cI4SG-EvlsejZVupEusm2liNv", lastVisitClass: "" },
    { initials: "DR", name: "David Rodriguez", email: "david.r@example.com", tag: "Occasional", tagBg: "bg-surface-container-high", tagColor: "text-on-surface-variant", lastVisit: "Oct 10, 2023", totalSpent: "$620.75", points: "1,100", avatar: null, lastVisitClass: "" }
  ],
  showingFrom: 1,
  showingTo: 4,
  totalEntries: 12450,
  currentPage: 1,
  totalPages: 3113
};



(function() {
  document.querySelector('[data-field="enrolledCount"]').textContent = directoryData.enrolledCount;
  document.querySelector('[data-field="showingFrom"]').textContent = directoryData.showingFrom;
  document.querySelector('[data-field="showingTo"]').textContent = directoryData.showingTo;
  document.querySelector('[data-field="totalEntries"]').textContent = directoryData.totalEntries.toLocaleString();
  document.querySelector('[data-field="currentPage"]').textContent = directoryData.currentPage;
  document.querySelector('[data-field="totalPages"]').textContent = directoryData.totalPages.toLocaleString();
  var segEl = document.querySelector('[data-container="segments"]');
  if (segEl) {
    segEl.innerHTML = directoryData.segments.map(function(s) {
      var badgeHtml = s.badge ? '<span class="bg-[' + s.badge.bg + '] text-[' + s.badge.color + '] px-2 py-1 rounded font-label-md text-[10px] uppercase tracking-wider flex items-center gap-1"><span class="w-1.5 h-1.5 bg-[' + s.badge.color + '] rounded-full"></span> ' + s.badge.text + '</span>' : '';
      return '<div class="bg-surface-container-lowest border border-surface-container-high rounded-xl p-md flex flex-col justify-between hover:-translate-y-[2px] transition-transform duration-200 ambient-shadow">' +
        '<div class="flex justify-between items-start mb-md">' +
        '<div class="w-10 h-10 rounded-lg ' + s.iconBg + ' ' + s.iconColor + ' flex items-center justify-center">' +
        '<span class="material-symbols-outlined' + (s.icon === 'star' ? '" style="font-variation-settings: \'FILL\' 1;"' : '"') + '>' + s.icon + '</span>' +
        '</div>' +
        badgeHtml +
        '</div>' +
        '<div>' +
        '<p class="font-body-sm text-body-sm text-on-surface-variant mb-xs">' + s.label + '</p>' +
        '<div class="flex items-baseline gap-sm">' +
        '<h3 class="font-headline-md text-headline-md">' + s.count + '</h3>' +
        '<span class="font-data-mono text-[12px] ' + s.changeClass + '">' + s.change + '</span>' +
        '</div>' +
        '</div>' +
        '</div>';
    }).join('');
  }
  var rowEl = document.querySelector('[data-container="customerRows"]');
  if (rowEl) {
    rowEl.innerHTML = directoryData.customers.map(function(c) {
      var avatarHtml = c.avatar
        ? '<img class="w-8 h-8 rounded-full object-cover" src="' + c.avatar + '"/>'
        : '<div class="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold text-xs">' + c.initials + '</div>';
      return '<tr class="table-row-hover group transition-colors">' +
        '<td class="px-md py-3"><div class="flex items-center gap-sm">' + avatarHtml +
        '<div><p class="font-semibold text-on-background">' + c.name + '</p><p class="text-on-surface-variant text-[12px]">' + c.email + '</p></div></div></td>' +
        '<td class="px-md py-3"><span class="inline-flex items-center gap-1 px-2 py-1 rounded ' + c.tagBg + ' ' + c.tagColor + ' font-label-md text-[10px] uppercase">' + c.tag + '</span></td>' +
        '<td class="px-md py-3 ' + (c.lastVisitClass || 'text-on-surface-variant') + '">' + c.lastVisit + '</td>' +
        '<td class="px-md py-3 font-data-mono text-right">' + c.totalSpent + '</td>' +
        '<td class="px-md py-3 font-data-mono text-right text-tertiary-container">' + c.points + '</td>' +
        '<td class="px-md py-3 text-center"><button class="text-on-surface-variant hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"><span class="material-symbols-outlined text-[20px]">more_vert</span></button></td>' +
        '</tr>';
    }).join('');
  }
})();
