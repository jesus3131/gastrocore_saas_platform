(function() {
  var STEPS = [
    { label: 'Business Profile', icon: 'storefront' },
    { label: 'Service Area', icon: 'grid_view' },
    { label: 'Modules', icon: 'extension' },
    { label: 'Final Review', icon: 'verified' }
  ];

  function loadData() {
    return {
      profile: Utils.storage.get('onboarding_profile', {}),
      areas: Utils.storage.get('onboarding_areas', []),
      modules: Utils.storage.get('onboarding_modules', { modules: [] })
    };
  }

  function getModuleIcon(id) {
    var icons = {
      pos: 'point_of_sale', inventory: 'inventory_2', hr: 'group',
      crm: 'loyalty', analytics: 'bar_chart', integrations: 'integration_instructions'
    };
    return icons[id] || 'extension';
  }

  function getModuleName(id) {
    var names = {
      pos: 'POS & Tables', inventory: 'Advanced Inventory', hr: 'HR & Staffing',
      crm: 'CRM & Loyalty', analytics: 'Analytics & Reports', integrations: 'Integrations'
    };
    return names[id] || id;
  }

  function getAreaIcon(type) {
    var icons = { dining: 'restaurant', bar: 'local_bar', terrace: 'deck', private: 'meeting_room' };
    return icons[type] || 'room';
  }

  function getAreaTypeLabel(type) {
    var labels = { dining: 'Dining Room', bar: 'Bar', terrace: 'Terrace', private: 'Private Room' };
    return labels[type] || type;
  }

  function render() {
    var data = loadData();
    renderProfile(data.profile);
    renderAdmin(data.profile);
    renderModules(data.modules);
    renderAreas(data.areas);
  }

  function renderProfile(profile) {
    var container = document.getElementById('profile-summary');
    if (!container) return;
    container.innerHTML =
      '<div class="flex justify-between items-start">' +
        '<div class="flex flex-col gap-md flex-1">' +
          '<div><p class="font-label-md text-label-md text-secondary">Restaurant Name</p><p class="font-body-md text-body-md text-on-surface font-semibold">' + (profile.restaurantName || '-') + '</p></div>' +
          '<div><p class="font-label-md text-label-md text-secondary">Cuisine Type</p><p class="font-body-md text-body-md text-on-surface">' + (profile.cuisineType || '-') + '</p></div>' +
          '<div><p class="font-label-md text-label-md text-secondary">Locations</p><p class="font-body-md text-body-md text-on-surface">' + (profile.locations || '-') + '</p></div>' +
        '</div>' +
        '<a href="onboarding-business-profile.html" class="flex items-center gap-xs text-primary font-label-md text-label-md hover:underline whitespace-nowrap"><span class="material-symbols-outlined text-[16px]">edit</span> Edit</a>' +
      '</div>';
  }

  function renderAdmin(profile) {
    var container = document.getElementById('admin-account');
    if (!container) return;
    var email = profile.adminEmail || '-';
    var initials = email !== '-' ? email.charAt(0).toUpperCase() : '?';
    var passwordSet = profile.adminPassword ? profile.adminPassword.length > 0 : false;
    container.innerHTML =
      '<div class="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-headline-md text-headline-md">' + initials + '</div>' +
      '<div class="flex-1">' +
        '<p class="font-body-md text-body-md text-on-surface font-semibold">' + (profile.adminEmail || 'Not set') + '</p>' +
        '<p class="font-body-sm text-body-sm text-secondary">' + email + '</p>' +
        (passwordSet ? '<div class="mt-xs inline-flex items-center gap-xs px-xs py-base bg-tertiary-container/10 text-tertiary-fixed-dim rounded font-label-md text-label-md"><span class="material-symbols-outlined text-[16px]">check_circle</span> Password set</div>' : '<div class="mt-xs inline-flex items-center gap-xs px-xs py-base bg-error-container/10 text-error rounded font-label-md text-label-md"><span class="material-symbols-outlined text-[16px]">warning</span> No password set</div>') +
      '</div>';
  }

  function renderModules(modules) {
    var container = document.getElementById('modules-list');
    if (!container) return;
    var ids = modules.modules || [];
    var count = ids.length;
    var headerCount = container.closest('.bg-surface-container-lowest')?.querySelector('.font-data-mono');
    if (headerCount) headerCount.textContent = count + ' Selected';
    if (ids.length === 0) {
      container.innerHTML = '<li class="font-body-sm text-body-sm text-secondary p-sm">No modules selected.</li>';
      return;
    }
    container.innerHTML = ids.map(function(id) {
      return '<li class="flex items-center justify-between p-sm border border-outline-variant rounded bg-surface">' +
        '<span class="font-body-sm text-body-sm text-on-surface flex items-center gap-sm">' +
          '<span class="material-symbols-outlined text-primary text-[18px]">' + getModuleIcon(id) + '</span> ' + getModuleName(id) +
        '</span>' +
        '<span class="material-symbols-outlined text-tertiary-container">check</span>' +
      '</li>';
    }).join('');
  }

  function renderAreas(areas) {
    var container = document.getElementById('coverage-zones');
    if (!container) return;
    if (areas.length === 0) {
      container.innerHTML = '<span class="font-body-sm text-body-sm text-secondary">No service areas configured.</span>';
      return;
    }
    container.innerHTML = areas.map(function(a) {
      var cap = 0;
      for (var i = 0; i < a.tables.length; i++) cap += a.tables[i].capacity;
      return '<div class="flex items-center gap-sm px-sm py-xs bg-surface-container rounded border border-outline-variant">' +
        '<span class="material-symbols-outlined text-[16px] text-primary">' + getAreaIcon(a.type) + '</span>' +
        '<span class="font-label-md text-label-md text-on-surface">' + a.name + '</span>' +
        '<span class="font-data-mono text-data-mono text-[11px] text-secondary">' + getAreaTypeLabel(a.type) + '</span>' +
        '<span class="font-data-mono text-data-mono text-[11px] text-secondary ml-auto">' + a.tables.length + ' tbls / ' + cap + ' pax</span>' +
      '</div>';
    }).join('');
  }

  function findFinalizeBtn() {
    return Array.from(document.querySelectorAll('button')).filter(function(b) {
      return b.textContent.indexOf('Finalize') !== -1;
    })[0];
  }

  function finalize() {
    var data = loadData();
    var tenant = {
      id: Utils.uid(),
      name: data.profile.restaurantName || 'Unnamed Restaurant',
      cuisine: data.profile.cuisineType || '',
      locations: data.profile.locations || 1,
      adminEmail: data.profile.adminEmail || '',
      createdAt: Utils.today(),
      status: 'active',
      modules: data.modules.modules || [],
      areas: data.areas.map(function(a) { return { id: a.id, name: a.name, type: a.type, tables: a.tables }; }),
      metrics: {
        totalAreas: data.areas.length,
        totalTables: data.areas.reduce(function(sum, a) { return sum + a.tables.length; }, 0),
        totalCapacity: data.areas.reduce(function(sum, a) {
          return sum + a.tables.reduce(function(s, t) { return s + (t.capacity || 0); }, 0);
        }, 0)
      }
    };
    Utils.storage.set('onboarding_complete', tenant);
    Utils.notify('Workspace created successfully!', 'success');
    var btn = findFinalizeBtn();
    if (btn) {
      btn.innerHTML = '<span class="material-symbols-outlined">check_circle</span> Launched!';
      btn.disabled = true;
      btn.classList.remove('bg-primary-container', 'hover:bg-primary');
      btn.classList.add('bg-tertiary-container', 'cursor-default');
    }
    setTimeout(function() {
      window.location.href = '../dashboard.html';
    }, 2000);
  }

  function init() {
    render();
    var finalizeBtn = findFinalizeBtn();
    if (finalizeBtn) {
      finalizeBtn.addEventListener('click', finalize);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
