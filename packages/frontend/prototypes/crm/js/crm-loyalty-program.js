
const loyaltyData = {
  analytics: [
    { label: "Points Issued (MTD)", value: "245,092", icon: "toll", valueClass: "text-primary", change: "+12.5% vs last month", changeColor: "text-tertiary-container", hasTrendIcon: true, hasBorder: false },
    { label: "Points Redeemed (MTD)", value: "89,450", icon: "redeem", valueClass: "text-on-surface", change: "Liabilities reduced by $894.50", changeColor: "text-on-surface-variant", hasTrendIcon: false, hasBorder: true },
    { label: "Conversion Rate", value: "36.5%", icon: "swap_horiz", valueClass: "text-primary", change: "+2.1% indicating healthy engagement", changeColor: "text-tertiary-container", hasTrendIcon: true, hasBorder: false }
  ],
  rewards: [
    { name: "Free Draft Beer", cost: "50", type: "Beverage", status: "Active", statusClass: "bg-tertiary-container/10 text-on-tertiary-container", paused: false },
    { name: "$10 Off Total Bill", cost: "100", type: "Discount", status: "Active", statusClass: "bg-tertiary-container/10 text-on-tertiary-container", paused: false },
    { name: "Exclusive Chef's Tasting", cost: "1500", type: "Experience", status: "Paused", statusClass: "bg-surface-variant text-on-surface-variant", paused: true }
  ],
  campaigns: [
    { title: "Double Points on Tuesdays", desc: "Encourage mid-week traffic by doubling base points for all dine-in checks.", badge: "2x Multiplier", status: "Live", imgType: "img", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBA3ZGaK9uiItMAKeN6in27GOI6tobFzzl7516sHqAbEaG-VufRRQFQ8x3RuKgdO9voqkrD8bk_TAq0yLvdaVRNtzJ2OAMjIdFnBDf5Ehe2ZYCMwBm9gr9Y6umlT2cVSM0rNLtHLJmsHq-EYSKtuJFuAJKHvoHdB4jCGzuE2nUpNo3GKH7sCRvKArzKGUA0eMXi0UhAFB5kldMEeP3WNDD-PCawq9bKKXnfQw8QCA3_16RgLVhi2kVytruGJKmiLvvrTlUXQZtofXUG" },
    { title: "VIP Anniversary Bonus", desc: "Award 500 bonus points to Platinum members on their signup anniversary.", badge: "Flat 500pt", status: "Live", imgType: "icon", icon: "celebration" }
  ]
};



(function() {
  var aEl = document.querySelector('[data-container="analytics"]');
  if (aEl) {
    aEl.innerHTML = loyaltyData.analytics.map(function(a) {
      var changeIcon = a.hasTrendIcon ? '<span class="material-symbols-outlined text-sm">trending_up</span>' : '';
      var borderClass = a.hasBorder ? 'pt-sm border-t border-outline-variant' : '';
      return '<div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col gap-sm">' +
        '<div class="flex justify-between items-center text-on-surface-variant">' +
        '<span class="font-body-md text-body-md font-semibold">' + a.label + '</span>' +
        '<span class="material-symbols-outlined text-md">' + a.icon + '</span>' +
        '</div>' +
        '<div class="font-display-lg text-display-lg ' + a.valueClass + ' font-data-mono mt-sm">' + a.value + '</div>' +
        '<div class="flex items-center gap-xs ' + a.changeColor + ' font-label-md text-label-md mt-auto ' + borderClass + '">' +
        changeIcon +
        '<span>' + a.change + '</span>' +
        '</div>' +
        '</div>';
    }).join('');
  }
  var rEl = document.querySelector('[data-container="rewards"]');
  if (rEl) {
    rEl.innerHTML = loyaltyData.rewards.map(function(r) {
      var nameClass = r.paused ? 'text-on-surface-variant' : '';
      var fadedClass = r.paused ? 'text-on-surface-variant' : '';
      var editBtn = '<button class="text-on-surface-variant hover:text-primary mx-1"><span class="material-symbols-outlined text-sm">edit</span></button>';
      var deleteBtn = r.paused ? '' : '<button class="text-on-surface-variant hover:text-error mx-1"><span class="material-symbols-outlined text-sm">delete</span></button>';
      return '<tr class="border-b border-outline-variant hover:bg-surface-container-high transition-colors group">' +
        '<td class="p-md font-semibold ' + nameClass + '">' + r.name + '</td>' +
        '<td class="p-md font-data-mono text-data-mono ' + fadedClass + '">' + r.cost + '</td>' +
        '<td class="p-md ' + fadedClass + '">' + r.type + '</td>' +
        '<td class="p-md"><span class="inline-flex items-center px-2 py-1 rounded-full ' + r.statusClass + ' font-label-md text-[10px] uppercase tracking-wider">' + r.status + '</span></td>' +
        '<td class="p-md text-right opacity-0 group-hover:opacity-100 transition-opacity">' + editBtn + deleteBtn + '</td>' +
        '</tr>';
    }).join('');
  }
  var cEl = document.querySelector('[data-container="campaigns"]');
  if (cEl) {
    cEl.innerHTML = loyaltyData.campaigns.map(function(c) {
      var mediaHtml = c.imgType === 'icon'
        ? '<div class="w-24 h-24 rounded-lg bg-surface-container-low overflow-hidden shrink-0 flex items-center justify-center bg-secondary/10"><span class="material-symbols-outlined text-4xl text-secondary">' + c.icon + '</span></div>'
        : '<div class="w-24 h-24 rounded-lg bg-surface-container-low overflow-hidden shrink-0 relative"><img class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" src="' + c.img + '"/></div>';
      return '<div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex gap-md items-start group hover:border-primary-fixed-dim transition-colors cursor-pointer">' +
        mediaHtml +
        '<div class="flex flex-col flex-1 h-full">' +
        '<div class="flex justify-between items-start">' +
        '<h4 class="font-body-lg text-body-lg font-semibold text-on-surface">' + c.title + '</h4>' +
        '<span class="material-symbols-outlined text-on-surface-variant">more_vert</span>' +
        '</div>' +
        '<p class="font-body-sm text-body-sm text-on-surface-variant mt-xs line-clamp-2">' + c.desc + '</p>' +
        '<div class="mt-auto pt-sm flex justify-between items-center">' +
        '<span class="font-data-mono text-data-mono text-primary text-xs bg-primary/10 px-2 py-1 rounded">' + c.badge + '</span>' +
        '<span class="font-label-md text-label-md text-tertiary-container flex items-center gap-xs">' +
        '<span class="w-2 h-2 rounded-full bg-tertiary-container animate-pulse"></span> ' + c.status +
        '</span>' +
        '</div>' +
        '</div>' +
        '</div>';
    }).join('');
  }
})();
