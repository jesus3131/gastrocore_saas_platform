
const profileData = {
  name: "Jane Doe",
  email: "jane.doe@example.com",
  phone: "+1 (555) 012-3456",
  location: "Chicago, IL",
  lifetimeValue: "$4,250.00",
  lifetimeValueChange: "+12% this year",
  totalVisits: "24",
  lastVisit: "Last visit: 2 days ago",
  avgTicket: "$177.08",
  avgTicketNote: "Consistently above avg",
  loyaltyPoints: "12,500",
  loyaltyTier: "Platinum Tier",
  tags: [
    { label: "VIP", icon: "star", bg: "#fef08a", text: "#854d0e", border: "#fde047" },
    { label: "Active", dot: true, bg: "#d1fae5", text: "#065f46", border: "#a7f3d0" }
  ],
  recentOrders: [
    { date: "Oct 24, 2023", id: "#ORD-8924", items: "Wagyu Burger, Truffle Fries, Old Fashioned", total: "$85.50", status: "completed" },
    { date: "Oct 12, 2023", id: "#ORD-8810", items: "Seared Scallops, White Wine (Glass)", total: "$62.00", status: "completed" },
    { date: "Sep 28, 2023", id: "#ORD-8742", items: "Ribeye Steak, Asparagus, Red Wine (Bottle)", total: "$145.00", status: "cancelled" },
    { date: "Sep 15, 2023", id: "#ORD-8605", items: "Wagyu Burger, Caesar Salad, Iced Tea", total: "$54.25", status: "completed" }
  ],
  favoriteItems: [
    { name: "Wagyu Burger", count: 14, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDRBkwGfeRFpV6BlFRQ6pd3PxNCk8L1NneRsTrpI6ybG9IiJgmPU4-OLBPLlJv66jqH_kOe5O-tI66RXGR25rh1HG1CPtpVSFefgNF5tpi29OjEan8AzsX_o7XwzQOfqeLqyf0VbBrLa0W2u9r113igLKpIsC0YWkKRpCs5Lr_Q1W-5hole4Q_NlXWljBg9hVkbOKm_Bqnfk_QtOf__YSwDT6f0CqiPADOVHdif1q3lcQQzeUdRcY2uGgsQDxhrqOT5cgeiVjo-A_zL" },
    { name: "Old Fashioned", count: 9, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDz_pOFwexpzlTWGpg1ZMNOr_R4gfdaGaZTfvYLrrCHz9k9u1DzJqdoUTpDvlwjd3G1ITBGYMPRX0_v3Yaa1_uD2WYJnVFuSkZYnW_s7UyBqcmB_MbhinPs6remk1_slBmhTDHFX7JgXhEKkUEYvIbtizEs2JvwO2ubd9dZQDnYgNgBctxsYoEk32DtS9wiAcFOTi_aUCiHmZ6kgufd6kIZkvN-_nkDM66zbvyceLSIKPTQg6S2MypwBeEWIxHCcTbXZtmO8xM2pZHq" },
    { name: "Truffle Fries", count: 12, img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBCZMyieEzc7JoMzeR78snLwPvwtM-CMfVVDjhaxFCQxIRhcnpG_z7a4NAoT3AOfqOZITLD1OkuBz75c8THagKLKnfhXRIMJCkjzDBfj60hQ9tppc93J3gffyQ3goqBomYDalRDPTHohNuV8pE9QhVei06VgLg_SI0IxJzQjg4UrWFJp--yR61BIAUcyPbRJ9tghFPYFYdDw0K_uBhO4FNPWY9vrpCKEn3U0nQsUEdMpmtlm7ghPCSUuPmmPAu9J87zkR8fgDeWIJ3M" }
  ],
  loyalty: {
    tier: "Platinum Member",
    nextTier: "Next Tier: Diamond",
    pointsProgress: "12,500 / 15,000 pts",
    progressWidth: "83%",
    benefits: ["Priority Reservations", "Complimentary Dessert", "1.5x Points Multiplier"]
  },
  preferences: {
    allergies: "None recorded",
    dietary: "Pescatarian",
    seating: "Window Seat, Quiet Area"
  },
  notes: [
    { author: "Michael T. (Manager)", date: "Oct 24, 2023", text: "Celebrating 5th wedding anniversary tonight. Brought out complimentary champagne toast." },
    { author: "Sarah L. (Server)", date: "Sep 15, 2023", text: "Prefers sparkling water with lime. Always asks for extra truffle oil on fries." },
    { author: "Host Stand", date: "Aug 02, 2023", text: "Needs a little extra time with the menu. Do not rush." }
  ]
};



(function() {
  var fields = {
    'breadcrumb-name': profileData.name,
    'customer-name': profileData.name,
    'email': profileData.email,
    'phone': profileData.phone,
    'location': profileData.location,
    'lifetimeValue': profileData.lifetimeValue,
    'lifetimeValueChange': profileData.lifetimeValueChange,
    'totalVisits': profileData.totalVisits,
    'lastVisit': profileData.lastVisit,
    'avgTicket': profileData.avgTicket,
    'avgTicketNote': profileData.avgTicketNote,
    'loyaltyPoints': profileData.loyaltyPoints,
    'loyaltyTier': profileData.loyaltyTier,
    'loyalty-tier': profileData.loyalty.tier,
    'next-tier': profileData.loyalty.nextTier,
    'points-progress': profileData.loyalty.pointsProgress,
    'allergies': profileData.preferences.allergies,
    'dietary': profileData.preferences.dietary,
    'seating': profileData.preferences.seating
  };
  Object.keys(fields).forEach(function(key) {
    var el = document.querySelector('[data-field="' + key + '"]');
    if (el) el.textContent = fields[key];
  });
  var progressBar = document.querySelector('[data-field="progress-bar"]');
  if (progressBar) progressBar.style.width = profileData.loyalty.progressWidth;
  var tagsEl = document.querySelector('[data-container="tags"]');
  if (tagsEl) {
    tagsEl.innerHTML = profileData.tags.map(function(t) {
      if (t.icon) {
        return '<span class="bg-[' + t.bg + '] text-[' + t.text + '] font-label-md text-label-md px-sm py-[2px] rounded-full flex items-center gap-1 border border-[' + t.border + ']"><span class="material-symbols-outlined fill text-[14px]">' + t.icon + '</span> ' + t.label + '</span>';
      }
      return '<span class="bg-[' + t.bg + '] text-[' + t.text + '] font-label-md text-label-md px-sm py-[2px] rounded-full flex items-center gap-1 border border-[' + t.border + ']"><span class="w-2 h-2 rounded-full bg-[#10b981]"></span> ' + t.label + '</span>';
    }).join('');
  }
  var ordersEl = document.querySelector('[data-container="orders"]');
  if (ordersEl) {
    ordersEl.innerHTML = profileData.recentOrders.map(function(o) {
      var isCancelled = o.status === 'cancelled';
      var statusBg = isCancelled ? 'bg-error-container text-on-error-container border-[#fecaca]' : 'bg-[#d1fae5] text-[#065f46] border-[#a7f3d0]';
      var statusLabel = o.status.charAt(0).toUpperCase() + o.status.slice(1);
      return '<tr class="hover:bg-surface-container-low transition-colors group">' +
        '<td class="px-md py-md whitespace-nowrap">' + o.date + '</td>' +
        '<td class="px-md py-md font-data-mono text-outline">' + o.id + '</td>' +
        '<td class="px-md py-md truncate max-w-[200px]" title="' + o.items + '">' + o.items + '</td>' +
        '<td class="px-md py-md text-right font-data-mono">' + o.total + '</td>' +
        '<td class="px-md py-md text-center"><span class="inline-flex items-center px-2 py-1 rounded-full ' + statusBg + ' text-[11px] font-semibold leading-none border">' + statusLabel + '</span></td>' +
      '</tr>';
    }).join('');
  }
  var favEl = document.querySelector('[data-container="favorites"]');
  if (favEl) {
    favEl.innerHTML = profileData.favoriteItems.map(function(f) {
      var countLabel = 'Ordered ' + f.count + ' time' + (f.count !== 1 ? 's' : '');
      return '<div class="border border-outline-variant rounded-lg p-sm flex items-start gap-sm hover:border-primary transition-colors cursor-pointer bg-surface">' +
        '<div class="w-12 h-12 rounded bg-surface-container-high flex-shrink-0 overflow-hidden">' +
        '<img class="w-full h-full object-cover" src="' + f.img + '"/>' +
        '</div>' +
        '<div>' +
        '<h4 class="font-label-md text-label-md text-on-surface">' + f.name + '</h4>' +
        '<p class="font-body-sm text-body-sm text-on-surface-variant">' + countLabel + '</p>' +
        '</div>' +
        '</div>';
    }).join('');
  }
  var benefitsEl = document.querySelector('[data-container="benefits"]');
  if (benefitsEl) {
    benefitsEl.innerHTML = profileData.loyalty.benefits.map(function(b) {
      return '<li class="flex items-center gap-xs"><span class="material-symbols-outlined text-[16px] text-[#4ade80]">check</span> ' + b + '</li>';
    }).join('');
  }
  var notesEl = document.querySelector('[data-container="notes"]');
  if (notesEl) {
    notesEl.innerHTML = profileData.notes.map(function(n) {
      return '<div class="relative pl-sm border-l-2 border-[#fbbf24]">' +
        '<div class="flex justify-between items-center mb-xs">' +
        '<span class="font-label-md text-label-md text-[#92400e]">' + n.author + '</span>' +
        '<span class="font-data-mono text-[11px] text-[#b45309]">' + n.date + '</span>' +
        '</div>' +
        '<p class="font-body-sm text-body-sm text-[#78350f]">' + n.text + '</p>' +
        '</div>';
    }).join('');
  }
})();
