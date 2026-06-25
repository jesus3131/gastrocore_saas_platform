
  var profileData = {
    legalName: "Gourmet Collective Operations LLC",
    address: "1440 Corporate Way, Suite 200<br/>San Francisco, CA 94103",
    taxId: "XX-XXXX892"
  };
  var adminData = {
    initials: "JD",
    name: "John Doe",
    email: "admin@gourmetcollective.com",
    verified: true
  };
  var reviewModules = [
    { name: "Inventory Core", icon: "inventory_2" },
    { name: "POS Integration", icon: "receipt_long" },
    { name: "Staff Management", icon: "group" },
    { name: "Financial Reporting", icon: "bar_chart" }
  ];
  var coverageZones = ["North Region (Tier 1)", "Downtown Core"];
  var totalSteps = 4;



  document.getElementById('profile-summary').innerHTML = '<div><p class="font-label-md text-label-md text-secondary">Legal Name</p><p class="font-body-md text-body-md text-on-surface">' + profileData.legalName + '</p></div><div><p class="font-label-md text-label-md text-secondary">Primary Address</p><p class="font-body-md text-body-md text-on-surface">' + profileData.address + '</p></div><div><p class="font-label-md text-label-md text-secondary">Tax ID / EIN</p><p class="font-data-mono text-data-mono text-on-surface">' + profileData.taxId + '</p></div>';
  document.getElementById('admin-account').innerHTML = '<div class="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-headline-md text-headline-md">' + adminData.initials + '</div><div><p class="font-body-md text-body-md text-on-surface font-semibold">' + adminData.name + '</p><p class="font-body-sm text-body-sm text-secondary">' + adminData.email + '</p>' + (adminData.verified ? '<div class="mt-xs inline-flex items-center gap-xs px-xs py-base bg-tertiary-container/10 text-tertiary-fixed-dim rounded font-label-md text-label-md" style="background-color: rgba(78, 222, 163, 0.1); color: #4edea3;"><span class="material-symbols-outlined text-[16px]">check_circle</span> Verified</div>' : '') + '</div>';
  document.getElementById('modules-list').innerHTML = reviewModules.map(function(m) {
    return '<li class="flex items-center justify-between p-sm border border-outline-variant rounded bg-surface"><span class="font-body-sm text-body-sm text-on-surface flex items-center gap-sm"><span class="material-symbols-outlined text-primary text-[18px]">' + m.icon + '</span> ' + m.name + '</span><span class="material-symbols-outlined text-tertiary-fixed-dim" style="color: #4edea3;">check</span></li>';
  }).join('');
  document.getElementById('coverage-zones').innerHTML = coverageZones.map(function(z) {
    return '<span class="px-xs py-base bg-surface-container rounded border border-outline-variant font-data-mono text-data-mono text-[12px] text-on-surface">' + z + '</span>';
  }).join('');
