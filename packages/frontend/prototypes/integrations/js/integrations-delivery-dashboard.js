
const deliveryOrders = {
  new: [
    { platform: "UberEats", orderNumber: "#UE-8492", items: ["2x Truffle Burger", "1x Sweet Potato Fries"], timer: "02:45", timerClass: "bg-error-container", logoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBfkbnJcHyLmia7k5XJDGGr3ke0OaJfX-hgUR8BT23HuhLjUazE69cwLfGyTYyoRcTCRGzax5vZJGnXANFjsEm6NG9WU6WLrx3KTLyDNMZgucSeQjizCPIMvkPAGcCa7Cl1zTTE6CZVaO2md0Z9sxd00loWq_ffA6qtIC_IBnN6Uok3vR7gW8f0tWtXhbQLNQy5tKJ2rN_fQxyP7R7IqZDhV9bxv0xctmmRDQkrN3FJBt3t6eFmbMDXBOyCWR2TZeufw-mLIuLfd_56", logoAlt: "UberEats logo", buttonLabel: "Accept Order", buttonClass: "bg-primary-container text-on-primary-container border-primary-container/20 hover:bg-primary-container/90" }
  ],
  preparing: [
    { platform: "Rappi", orderNumber: "#RA-1102", items: ["1x Margherita Pizza", "2x Garlic Knots"], timer: "12:20", timerClass: "bg-[rgba(0,35,111,0.1)] text-primary", logoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuA5lk7a7JxDDiaOOn2y0CYCDvPxqiE6w0uThJsVvDU7rlvn4j3jCJ6ZqLWdvSCkxHwr965AjTU8luqRfKWRsLISqJoihgXeEnq-mYIs9Dl4iEckSnthvCVkDLUf1KC64Bo2vPkTrt93smbKDCsYKP5rLc1jlX1HSIkwRq4eH7xyElW4sqzUT7U950MHG38jOfSNTShDYSZHE7HHoUj0PqQ1EtZMd6GDBLgdEIN20eYDxlT93iIhkPzX6BJB7p-Hd9AGU5jzO09K74QB", logoAlt: "Rappi logo", buttonLabel: "Mark Ready", buttonClass: "bg-surface text-on-surface-variant border-outline-variant hover:bg-surface-container-high" }
  ],
  outForDelivery: [
    { platform: "Glovo", orderNumber: "#GL-9021", courier: "Miguel T.", eta: "4 mins", timerClass: "bg-[rgba(39,195,138,0.1)] text-on-tertiary-container", logoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDTScEaK1YKFoZ3-LC7EfT7puchWpChoW9cYq4w5CHb818pDdBGQ_sMxsMdv0Zo-aRmNnrTi330Lk63Qe-G_YuLkMbvXGw_I_ZS7jOScDJfKeNLeiWDfdQGmWv-0p1ZMe-FYV4PL3DY6p5ylV_2a_r8BgVVK5_SWHEkcFxQouQyGiltJDWebryJZEo9Pe5duMjdu1n4PfsJpImZbibi9akG7-wftRhrHpnqu_4P4bkVEnprj3_Rh97ZfQ4KrOgKZuLOCGGTY1wh34St", logoAlt: "Glovo logo" }
  ]
};
const channelVolume = [
  { initials: "UE", name: "UberEats", percentage: 65, barClass: "bg-primary-container" },
  { initials: "RA", name: "Rappi", percentage: 25, barClass: "bg-secondary-container" },
  { initials: "GL", name: "Glovo", percentage: 10, barClass: "bg-tertiary-container" }
];
const prepTimes = [
  { platform: "UberEats", time: "14m", span: false },
  { platform: "Rappi", time: "16m", span: false },
  { platform: "Global Average", time: "15.2m", span: true }
];



(function() {
  // Order cards
  var cols = document.querySelectorAll('.col-span-12.lg\\:col-span-8 .grid.grid-cols-1.md\\:grid-cols-3 > div .p-4.space-y-4');
  var statuses = ['new', 'preparing', 'outForDelivery'];
  statuses.forEach(function(key, i) {
    var orders = deliveryOrders[key];
    var container = cols[i];
    orders.forEach(function(o) {
      var card = document.createElement('div');
      card.className = 'bg-surface-container-lowest border border-outline-variant rounded-lg p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 transition-transform';
      var topHtml = '<div class="flex justify-between items-start mb-3"><div class="flex items-center gap-2"><img alt="' + (o.logoAlt || '') + '" class="w-6 h-6 object-contain" src="' + o.logoUrl + '"/><span class="text-data-mono font-data-mono text-on-surface font-bold">' + o.orderNumber + '</span></div>';
      if (o.timer !== undefined) {
        topHtml += '<span class="' + o.timerClass + ' text-label-md font-label-md px-2 py-1 rounded-md flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">timer</span> ' + o.timer + '</span>';
      } else {
        topHtml += '<span class="' + o.timerClass + ' text-label-md font-label-md px-2 py-1 rounded-md flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">moped</span> En Route</span>';
      }
      topHtml += '</div>';
      var bodyHtml = '<div class="text-body-sm font-body-sm text-on-surface-variant mb-4">';
      if (o.items) {
        o.items.forEach(function(item) { bodyHtml += '<p>' + item + '</p>'; });
      }
      if (o.courier) {
        bodyHtml += '<p>Courier: ' + o.courier + '</p><p>ETA: ' + o.eta + '</p>';
      }
      bodyHtml += '</div>';
      var btnHtml = '';
      if (o.buttonLabel) {
        btnHtml += '<button class="w-full ' + o.buttonClass + ' text-label-md font-label-md py-2 rounded transition-colors">' + o.buttonLabel + '</button>';
      }
      card.innerHTML = topHtml + bodyHtml + btnHtml;
      container.appendChild(card);
    });
  });

  // Order column counts
  var badges = document.querySelectorAll('.col-span-12.lg\\:col-span-8 .grid.grid-cols-1.md\\:grid-cols-3 > div .bg-primary-container.rounded-full');
  if (badges[0]) badges[0].textContent = deliveryOrders.new.length;
  if (badges[1]) badges[1].textContent = deliveryOrders.preparing.length;
  if (badges[2]) badges[2].textContent = deliveryOrders.outForDelivery.length;

  // Channel volume
  var volContainer = document.querySelector('.space-y-5');
  if (volContainer) {
    channelVolume.forEach(function(ch) {
      var div = document.createElement('div');
      div.className = 'flex items-center justify-between';
      div.innerHTML = '<div class="flex items-center gap-3"><div class="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center">' + ch.initials + '</div><span class="text-body-md font-body-md text-on-surface-variant">' + ch.name + '</span></div><div class="flex items-center gap-3 w-1/2"><div class="h-2 ' + ch.barClass + ' rounded-full flex-1" style="width: ' + ch.percentage + '%;"></div><span class="text-data-mono font-data-mono text-on-surface">' + ch.percentage + '%</span></div>';
      volContainer.appendChild(div);
    });
  }

  // Prep times
  var prepGrid = document.querySelector('.grid.grid-cols-2.gap-4');
  if (prepGrid) {
    prepTimes.forEach(function(pt) {
      var div = document.createElement('div');
      div.className = 'bg-surface p-4 rounded-lg border border-outline-variant text-center' + (pt.span ? ' col-span-2' : '');
      var valueClass = pt.span ? 'text-display-lg font-display-lg text-on-surface' : 'text-headline-md font-headline-md text-primary';
      div.innerHTML = '<span class="block text-label-md font-label-md text-on-surface-variant mb-1">' + pt.platform + '</span><span class="' + valueClass + '">' + pt.time + '</span>';
      prepGrid.appendChild(div);
    });
  }
})();
