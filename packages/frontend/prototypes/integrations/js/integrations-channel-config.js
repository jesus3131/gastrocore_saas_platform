
const channelIntegrations = [
  { name: "UberEats", id: "STR-84729", status: "connected", bgColor: "#000000", textColor: "white", initials: "UE", autoSync: true, hasConfigure: true, markups: 15 },
  { name: "Deliveroo", id: null, status: "disconnected", bgColor: "#00CCBC", textColor: "white", initials: "D", autoSync: false, hasConfigure: false, markups: 0 },
  { name: "Glovo", id: "GL-9921", status: "connected", bgColor: "#FFC244", textColor: "#00A082", initials: "G", autoSync: false, hasConfigure: true, markups: 0 }
];
const menuMappings = [
  { category: "Appetizers &amp; Starters", items: 12, platformCategory: "Starters", status: "mapped" },
  { category: "Main Courses - Burgers", items: 8, platformCategory: "Burgers", status: "mapped" },
  { category: "Seasonal Specials (Summer)", items: 4, platformCategory: "", status: "unmapped" },
  { category: "Beverages &amp; Sodas", items: 15, platformCategory: "Beverages", status: "mapped" }
];



(function() {
  var grid = document.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.xl\\:grid-cols-4');

  // Integration cards
  var activeIdx = 0;
  channelIntegrations.forEach(function(ch, idx) {
    var isConnected = ch.status === 'connected';
    var isActive = idx === 0;
    var cardBorder = isActive ? 'border-2 border-primary' : 'border border-outline-variant';
    var cardShadow = isActive ? 'shadow-sm' : 'hover:shadow-md';

    var card = document.createElement('div');
    card.className = 'bg-surface-container-lowest ' + cardBorder + ' rounded-xl p-6 relative overflow-hidden transition-all ' + cardShadow;

    // Status badge
    var badgeHtml = '';
    if (isConnected) {
      badgeHtml = '<div class="absolute top-0 right-0 p-3"><div class="bg-tertiary-fixed/20 text-tertiary-fixed text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-tertiary-fixed animate-pulse"></span> Connected</div></div>';
    } else {
      badgeHtml = '<div class="absolute top-0 right-0 p-3"><div class="bg-error/10 text-error text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider flex items-center gap-1"> Disconnected</div></div>';
    }

    var idText = ch.id ? 'ID: ' + ch.id : 'Not configured';

    var syncHtml = '';
    if (isConnected) {
      syncHtml = '<div class="flex justify-between items-center py-2 border-t border-outline-variant/30"><span class="text-label-md font-label-md text-on-surface-variant">Auto Sync</span><label class="relative inline-flex items-center cursor-pointer"><input ' + (ch.autoSync ? 'checked="" ' : '') + 'class="sr-only peer" type="checkbox" value=""/><div class="w-9 h-5 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\'\'] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-container"></div></label></div>';
    } else {
      syncHtml = '<div class="flex justify-between items-center py-2 border-t border-outline-variant/30"><span class="text-label-md font-label-md text-outline">Auto Sync</span><label class="relative inline-flex items-center cursor-pointer opacity-50"><input class="sr-only peer" disabled="" type="checkbox" value=""/><div class="w-9 h-5 bg-outline-variant rounded-full after:content-[\'\'] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-4 after:w-4"></div></label></div>';
    }

    var btnHtml = ch.hasConfigure
      ? '<button class="w-full bg-primary-container text-on-primary py-2 rounded-lg text-label-md font-label-md hover:opacity-90 transition-opacity">Configure</button>'
      : '<button class="w-full bg-surface text-primary border border-outline-variant py-2 rounded-lg text-label-md font-label-md hover:bg-surface-container-high transition-colors">Connect Account</button>';

    card.innerHTML = badgeHtml + '<div class="flex items-center gap-4 mb-4"><div class="w-12 h-12 rounded-lg" style="background-color:' + ch.bgColor + ';display:flex;align-items:center;justify-content:center;flex-shrink:0"><span style="color:' + ch.textColor + ';font-weight:bold;font-size:1.25rem">' + ch.initials + '</span></div><div><h3 class="text-headline-md font-headline-md text-on-surface leading-tight">' + ch.name + '</h3><p class="text-body-sm font-body-sm text-on-surface-variant">' + idText + '</p></div></div><div class="space-y-4">' + syncHtml + btnHtml + '</div>';

    grid.appendChild(card);
  });

  // Update markup value
  var markupInput = document.querySelector('input[type="number"][value="15"]');
  if (markupInput && channelIntegrations[0]) markupInput.value = channelIntegrations[0].markups;

  // Menu mapping table
  var mtbody = document.querySelector('.overflow-x-auto table tbody');
  menuMappings.forEach(function(m) {
    var isUnmapped = m.status === 'unmapped';
    var tr = document.createElement('tr');
    tr.className = 'hover:bg-surface-container-lowest transition-colors group' + (isUnmapped ? ' bg-error-container/10' : '');

    var selectHtml = '';
    if (isUnmapped) {
      selectHtml = '<select class="w-full bg-surface border border-error rounded-md py-1.5 px-3 text-body-sm font-body-sm text-on-surface focus:border-error focus:ring-1 focus:ring-error"><option disabled="" selected="" value="">Select category...</option><option>Specials</option><option>Limited Time Offers</option></select>';
    } else {
      selectHtml = '<select class="w-full bg-surface border border-outline-variant rounded-md py-1.5 px-3 text-body-sm font-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary">' +
        (m.platformCategory === 'Starters' ? '<option selected="">Starters</option><option>Snacks</option><option>Small Plates</option>' : '') +
        (m.platformCategory === 'Burgers' ? '<option selected="">Burgers</option><option>Sandwiches</option><option>Mains</option>' : '') +
        (m.platformCategory === 'Beverages' ? '<option>Drinks</option><option selected="">Beverages</option><option>Alcoholic Drinks</option>' : '') +
        '</select>';
    }

    var statusHtml = isUnmapped
      ? '<span class="inline-flex items-center gap-1 text-error text-label-md font-label-md"><span class="material-symbols-outlined text-[16px]">error</span> Unmapped</span>'
      : '<span class="inline-flex items-center gap-1 text-tertiary-fixed text-label-md font-label-md"><span class="material-symbols-outlined text-[16px]">check_circle</span> Mapped</span>';

    tr.innerHTML = '<td class="px-6 py-4 font-medium text-on-surface">' + m.category + '</td><td class="px-6 py-4 text-on-surface-variant text-data-mono font-data-mono">' + m.items + '</td><td class="px-6 py-4">' + selectHtml + '</td><td class="px-6 py-4 text-right">' + statusHtml + '</td>';
    mtbody.appendChild(tr);
  });
})();
