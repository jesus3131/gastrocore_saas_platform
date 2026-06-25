
  var areasData = [
    { id: "main-room", name: "Main Room", icon: "restaurant", iconBgClass: "bg-primary-fixed text-primary", estTables: 15, capacity: 60, status: "active", mapPosition: "top-10 left-10", mapSize: "w-64 h-64", mapClass: "border-2 border-primary border-dashed rounded-lg bg-primary-fixed bg-opacity-20", mapColor: "text-primary", cardShadow: "shadow-sm hover:shadow" },
    { id: "terrace", name: "Terrace", icon: "deck", iconBgClass: "bg-tertiary-fixed text-on-tertiary-fixed-variant", estTables: 8, capacity: 32, status: "active", mapPosition: "top-10 right-10", mapSize: "w-48 h-80", mapClass: "border-2 border-tertiary border-dashed rounded-lg bg-tertiary-fixed bg-opacity-20", mapColor: "text-tertiary", cardShadow: "" },
    { id: "bar-area", name: "Bar Area", icon: "local_bar", iconBgClass: "bg-surface-variant text-on-surface-variant", estTables: 0, capacity: 0, status: "incomplete", mapPosition: "bottom-10 left-10", mapSize: "w-80 h-32", mapClass: "border-2 border-outline border-dashed rounded-lg bg-surface-variant bg-opacity-50", mapColor: "text-on-surface-variant", cardShadow: "" }
  ];
  var steps = [
    { label: "Business Profile", icon: "storefront", completed: true },
    { label: "Service Area", icon: "grid_view", active: true },
    { label: "Modules", icon: "extension", active: false },
    { label: "Final Review", icon: "verified", active: false }
  ];



  function renderAreaCards() {
    var container = document.getElementById('area-cards');
    container.innerHTML = areasData.map(function(a) {
      if (a.status === 'incomplete') {
        return '<div class="border border-outline-variant rounded-lg p-md bg-surface-container-lowest relative group cursor-pointer hover:-translate-y-[2px] transition-transform opacity-60"><div class="flex justify-between items-start mb-sm"><div class="flex items-center gap-sm"><div class="w-8 h-8 rounded ' + a.iconBgClass + ' flex items-center justify-center"><span class="material-symbols-outlined text-[20px]">' + a.icon + '</span></div><h4 class="font-label-md text-body-md font-semibold text-on-surface-variant">' + a.name + '</h4></div><div class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-xs"><button class="text-secondary hover:text-primary"><span class="material-symbols-outlined text-[18px]">edit</span></button><button class="text-secondary hover:text-error"><span class="material-symbols-outlined text-[18px]">delete</span></button></div></div><div class="text-center py-sm"><button class="text-primary font-label-md text-label-md hover:underline">Configure Settings</button></div></div>';
      }
      var shadow = a.cardShadow ? ' ' + a.cardShadow : '';
      return '<div class="border border-outline-variant rounded-lg p-md bg-surface-container-lowest relative group cursor-pointer hover:-translate-y-[2px] transition-transform' + shadow + '"><div class="flex justify-between items-start mb-sm"><div class="flex items-center gap-sm"><div class="w-8 h-8 rounded ' + a.iconBgClass + ' flex items-center justify-center"><span class="material-symbols-outlined text-[20px]">' + a.icon + '</span></div><h4 class="font-label-md text-body-md font-semibold">' + a.name + '</h4></div><div class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-xs"><button class="text-secondary hover:text-primary"><span class="material-symbols-outlined text-[18px]">edit</span></button><button class="text-secondary hover:text-error"><span class="material-symbols-outlined text-[18px]">delete</span></button></div></div><div class="grid grid-cols-2 gap-sm mt-md"><div><label class="block font-label-md text-label-md text-on-surface-variant mb-xs">Est. Tables</label><input class="w-full bg-surface border border-outline-variant rounded px-sm py-xs font-data-mono text-body-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" type="number" value="' + a.estTables + '"/></div><div><label class="block font-label-md text-label-md text-on-surface-variant mb-xs">Capacity</label><input class="w-full bg-surface border border-outline-variant rounded px-sm py-xs font-data-mono text-body-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none" type="number" value="' + a.capacity + '"/></div></div></div>';
    }).join('');
  }
  function renderMapZones() {
    var container = document.getElementById('map-zones');
    container.innerHTML = areasData.map(function(a) {
      if (a.status === 'incomplete') {
        return '<div class="absolute ' + a.mapPosition + ' ' + a.mapSize + ' ' + a.mapClass + ' flex items-center justify-center"><span class="font-label-md text-body-sm text-on-surface-variant flex items-center gap-xs"><span class="material-symbols-outlined text-[16px]">add</span> Drop ' + a.name + ' Here</span></div>';
      }
      return '<div class="absolute ' + a.mapPosition + ' ' + a.mapSize + ' ' + a.mapClass + ' flex flex-col items-center justify-center"><span class="font-label-md text-body-md font-bold ' + a.mapColor + ' mb-xs">' + a.name + '</span><span class="font-data-mono text-body-sm ' + a.mapColor + '">' + a.estTables + ' Tables</span></div>';
    }).join('');
  }
  renderAreaCards();
  renderMapZones();
