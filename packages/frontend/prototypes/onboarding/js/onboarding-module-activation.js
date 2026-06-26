(function() {
  var STORAGE_KEY = 'onboarding_modules';
  var STEP = 3;
  var STEPS = [
    { label: 'Business Profile', icon: 'storefront' },
    { label: 'Service Area', icon: 'grid_view' },
    { label: 'Modules', icon: 'extension' },
    { label: 'Final Review', icon: 'verified' }
  ];

  var MODULES = [
    {
      id: 'pos', name: 'POS &amp; Tables', icon: 'point_of_sale',
      iconBg: 'bg-secondary-container text-primary',
      description: 'Core point-of-sale with table management, bill splitting, and direct kitchen routing. Essential for dine-in operations.',
      features: ['Table Management', 'Bill Splitting', 'Kitchen Routing', 'Payment Processing'],
      active: true
    },
    {
      id: 'inventory', name: 'Advanced Inventory', icon: 'inventory_2',
      iconBg: 'bg-primary-fixed text-primary-fixed-variant',
      description: 'Recipe costing, automated supplier ordering, real-time theoretical vs actual variance reporting.',
      features: ['Recipe Costing', 'Supplier Orders', 'Variance Reports', 'Stock Alerts'],
      active: true
    },
    {
      id: 'hr', name: 'HR &amp; Staffing', icon: 'group',
      iconBg: 'bg-tertiary-fixed text-tertiary-fixed-variant',
      description: 'Employee scheduling, time tracking, payroll integration, and role-based access control.',
      features: ['Scheduling', 'Time Tracking', 'Payroll Integration', 'Role-Based Access'],
      active: false
    },
    {
      id: 'crm', name: 'CRM &amp; Loyalty', icon: 'loyalty',
      iconBg: 'bg-secondary-container text-primary',
      description: 'Customer database, automated marketing campaigns, and points-based loyalty programs.',
      features: ['Customer Database', 'Marketing Campaigns', 'Loyalty Programs', 'Analytics'],
      active: false
    },
    {
      id: 'analytics', name: 'Analytics &amp; Reports', icon: 'bar_chart',
      iconBg: 'bg-primary-fixed text-primary-fixed-variant',
      description: 'Real-time business intelligence dashboards, sales reports, and performance metrics.',
      features: ['Real-time Dashboards', 'Sales Reports', 'Performance Metrics', 'Custom Reports'],
      active: false
    },
    {
      id: 'integrations', name: 'Integrations', icon: 'integration_instructions',
      iconBg: 'bg-surface-variant text-on-surface-variant',
      description: 'Connect with third-party services: delivery platforms, accounting, and payment gateways.',
      features: ['Delivery Platforms', 'Accounting Sync', 'Payment Gateways', 'API Access'],
      active: false
    }
  ];

  function load() {
    var saved = Utils.storage.get(STORAGE_KEY, {});
    if (saved.modules) {
      MODULES.forEach(function(m) {
        if (saved.modules.indexOf(m.id) !== -1) m.active = true;
        else m.active = false;
      });
    }
    return MODULES;
  }

  function save() {
    var activeIds = [];
    MODULES.forEach(function(m) { if (m.active) activeIds.push(m.id); });
    Utils.storage.set(STORAGE_KEY, { modules: activeIds });
  }

  function updateProgress() {
    var pb = document.getElementById('progress-bar');
    if (pb) pb.style.width = (STEP / STEPS.length * 100) + '%';
  }

  function render() {
    var container = document.getElementById('module-grid');
    if (!container) return;
    container.innerHTML = MODULES.map(function(m) {
      var checked = m.active ? 'checked=""' : '';
      var features = m.features.map(function(f) {
        return '<li class="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-xs"><span class="material-symbols-outlined text-[14px] text-tertiary-container">check</span>' + f + '</li>';
      }).join('');
      return '<div class="module-card bg-surface-container-lowest border border-surface-container-highest rounded-lg p-lg flex flex-col relative overflow-hidden">' +
        '<div class="flex justify-between items-start mb-md relative z-10">' +
          '<div class="flex items-center gap-sm">' +
            '<div class="w-10 h-10 rounded-lg ' + m.iconBg + ' flex items-center justify-center"><span class="material-symbols-outlined">' + m.icon + '</span></div>' +
            '<h3 class="font-headline-md text-headline-md text-on-surface">' + m.name + '</h3>' +
          '</div>' +
          '<div class="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">' +
            '<input ' + checked + ' class="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer opacity-0 z-20" id="toggle_' + m.id + '" type="checkbox" data-module="' + m.id + '"/>' +
            '<label class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer" for="toggle_' + m.id + '"></label>' +
          '</div>' +
        '</div>' +
        '<p class="font-body-sm text-body-sm text-on-surface-variant mb-sm">' + m.description + '</p>' +
        '<ul class="space-y-xs">' + features + '</ul>' +
      '</div>';
    }).join('');
    attachToggleEvents();
  }

  function attachToggleEvents() {
    MODULES.forEach(function(m) {
      var cb = document.getElementById('toggle_' + m.id);
      if (cb) {
        cb.addEventListener('change', function() {
          m.active = cb.checked;
          save();
        });
      }
    });
  }

  function findBtn(text) {
    return Array.from(document.querySelectorAll('button')).filter(function(b) {
      return b.textContent.replace(/[\n\r]/g, '').trim().indexOf(text) === 0;
    })[0];
  }

  function init() {
    load();
    render();
    updateProgress();
    save();

    var backBtn = findBtn('Back');
    if (backBtn) backBtn.addEventListener('click', function() { window.location.href = 'onboarding-areas-tables.html'; });

    var contBtn = findBtn('Continue');
    if (contBtn) contBtn.addEventListener('click', function() {
      save();
      window.location.href = 'onboarding-final-review.html';
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
