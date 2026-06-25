
  var modulesData = [
    { id: "pos", name: "POS &amp; Tables", icon: "point_of_sale", iconBgClass: "bg-secondary-container text-primary", hasGradient: false, description: "Core point-of-sale functionality including table management, splitting bills, and direct kitchen routing. Essential for dine-in operations.", planLabel: "Included in Core", planClass: "font-label-md text-label-md text-secondary", statusLabel: "Active", statusClass: "font-label-md text-label-md text-tertiary-container bg-tertiary-fixed px-sm py-xs rounded", checked: true },
    { id: "inv", name: "Advanced Inventory", icon: "inventory_2", iconBgClass: "bg-primary-fixed text-primary-fixed-variant", hasGradient: true, gradientFrom: "from-primary-fixed-dim/20", description: "Recipe costing (Escandallos), automated supplier ordering based on par levels, and real-time theoretical vs. actual variance reporting.", planLabel: "Pro Feature", planClass: "font-label-md text-label-md text-primary bg-primary-fixed-dim/30 px-sm py-xs rounded", statusLabel: "Optional", statusClass: "font-label-md text-label-md text-secondary", checked: false },
    { id: "del", name: "Omni-channel Delivery", icon: "local_shipping", iconBgClass: "bg-secondary-container text-primary", hasGradient: false, description: "Centralize orders from UberEats, Glovo, and your own white-label app directly into a single kitchen display system (KDS).", planLabel: "Pro Feature", planClass: "font-label-md text-label-md text-primary bg-primary-fixed-dim/30 px-sm py-xs rounded", statusLabel: "Active", statusClass: "font-label-md text-label-md text-tertiary-container bg-tertiary-fixed px-sm py-xs rounded", checked: true },
    { id: "crm", name: "CRM &amp; Loyalty", icon: "loyalty", iconBgClass: "bg-tertiary-fixed text-tertiary-fixed-variant", hasGradient: true, gradientFrom: "from-tertiary-fixed-dim/20", description: "Customer database management, automated marketing campaigns, and points-based loyalty programs to drive repeat business.", planLabel: "Enterprise", planClass: "font-label-md text-label-md text-on-surface bg-surface-dim px-sm py-xs rounded border border-outline-variant", statusLabel: "Optional", statusClass: "font-label-md text-label-md text-secondary", checked: false }
  ];
  var steps = [
    { label: "Business Profile", icon: "storefront" },
    { label: "Service Area", icon: "grid_view" },
    { label: "Modules", icon: "extension", active: true },
    { label: "Final Review", icon: "verified" }
  ];



  function renderModules() {
    var container = document.getElementById('module-grid');
    container.innerHTML = modulesData.map(function(m) {
      var gradientHtml = m.hasGradient ? '<div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ' + m.gradientFrom + ' to-transparent rounded-bl-full z-0"></div>' : '';
      var checkedAttr = m.checked ? 'checked=""' : '';
      return '<div class="module-card bg-surface-container-lowest border border-surface-container-highest rounded-lg p-lg flex flex-col relative overflow-hidden">' + gradientHtml + '<div class="flex justify-between items-start mb-md relative z-10"><div class="flex items-center gap-sm"><div class="w-10 h-10 rounded-lg ' + m.iconBgClass + ' flex items-center justify-center"><span class="material-symbols-outlined">' + m.icon + '</span></div><h3 class="font-headline-md text-headline-md text-on-surface">' + m.name + '</h3></div><div class="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in"><input ' + checkedAttr + ' class="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer opacity-0 z-20" id="toggle_' + m.id + '" name="toggle_' + m.id + '" type="checkbox"/><label class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer" for="toggle_' + m.id + '"></label></div></div><p class="font-body-sm text-body-sm text-on-surface-variant flex-grow relative z-10">' + m.description + '</p><div class="mt-md pt-sm border-t border-surface-container-high flex justify-between items-center relative z-10"><span class="' + m.planClass + '">' + m.planLabel + '</span><span class="' + m.statusClass + '">' + m.statusLabel + '</span></div></div>';
    }).join('');
  }
  renderModules();
