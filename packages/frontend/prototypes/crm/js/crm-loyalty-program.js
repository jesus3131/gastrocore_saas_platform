var loyaltyData = { analytics: [], rewards: [], campaigns: [] };

(function() {
  var STORAGE_KEY = 'crm_loyalty';

  var defaults = {
    earnRate: 1,
    burnRate: 100,
    expiryOption: '12 Months Inactivity',
    rewards: [
      { id: 'rew-1', name: 'Free Draft Beer', cost: 50, type: 'Beverage', active: true },
      { id: 'rew-2', name: '$10 Off Total Bill', cost: 100, type: 'Discount', active: true },
      { id: 'rew-3', name: 'Exclusive Chef\'s Tasting', cost: 1500, type: 'Experience', active: false }
    ],
    campaigns: [
      { id: 'cmp-1', title: 'Double Points on Tuesdays', desc: 'Encourage mid-week traffic by doubling base points for all dine-in checks.', badge: '2x Multiplier', active: true, icon: 'celebration' },
      { id: 'cmp-2', title: 'VIP Anniversary Bonus', desc: 'Award 500 bonus points to Platinum members on their signup anniversary.', badge: 'Flat 500pt', active: true, icon: 'celebration' },
      { id: 'cmp-3', title: 'Happy Hour Boost', desc: '1.5x points on all drinks during happy hour (3-6pm).', badge: '1.5x', active: false, icon: 'celebration' }
    ]
  };

  var data = Utils.storage.get(STORAGE_KEY);
  if (!data || !data.rewards) { data = JSON.parse(JSON.stringify(defaults)); Utils.storage.set(STORAGE_KEY, data); }

  var allCustomers = Utils.storage.get('crm_customers', []);
  var totalPoints = allCustomers.reduce(function(s, c) { return s + (c.points || 0); }, 0);
  var activeMembers = allCustomers.filter(function(c) { return c.visits > 0 && new Date(c.lastVisit) > new Date(Date.now() - 90 * 86400000); }).length;

  function render() {
    var activeRewards = data.rewards.filter(function(r) { return r.active; }).length;
    var redeemedVal = allCustomers.length * 120;
    var rewardsGiven = data.rewards.filter(function(r) { return r.active; }).length * 3;

    loyaltyData = {
      analytics: [
        { label: 'Active Members', value: activeMembers.toLocaleString(), icon: 'groups', valueClass: 'text-primary', change: '+' + Math.round(activeMembers / Math.max(1, allCustomers.length) * 100) + '% of customers', changeColor: 'text-tertiary-container', hasTrendIcon: true, hasBorder: false },
        { label: 'Points Redeemed', value: redeemedVal.toLocaleString(), icon: 'redeem', valueClass: 'text-on-surface', change: 'Estimated liability reduction', changeColor: 'text-on-surface-variant', hasTrendIcon: false, hasBorder: true },
        { label: 'Rewards Given', value: String(rewardsGiven), icon: 'card_giftcard', valueClass: 'text-primary', change: '+2 this period', changeColor: 'text-tertiary-container', hasTrendIcon: true, hasBorder: false }
      ],
      rewards: data.rewards.map(function(r) {
        var paused = !r.active;
        return {
          name: r.name, cost: String(r.cost), type: r.type,
          status: r.active ? 'Active' : 'Paused',
          statusClass: r.active ? 'bg-tertiary-container/10 text-on-tertiary-container' : 'bg-surface-variant text-on-surface-variant',
          paused: paused, _id: r.id
        };
      }),
      campaigns: data.campaigns.map(function(c) {
        return {
          title: c.title, desc: c.desc, badge: c.badge,
          status: c.active ? 'Live' : 'Paused',
          imgType: 'icon', icon: c.icon || 'celebration', _id: c.id, _active: c.active
        };
      })
    };

    var aEl = document.querySelector('[data-container="analytics"]');
    if (aEl) {
      aEl.innerHTML = loyaltyData.analytics.map(function(a) {
        var ci = a.hasTrendIcon ? '<span class="material-symbols-outlined text-sm">trending_up</span>' : '';
        var bc = a.hasBorder ? 'pt-sm border-t border-outline-variant' : '';
        return '<div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col gap-sm">' +
          '<div class="flex justify-between items-center text-on-surface-variant"><span class="font-body-md text-body-md font-semibold">' + a.label + '</span><span class="material-symbols-outlined text-md">' + a.icon + '</span></div>' +
          '<div class="font-display-lg text-display-lg ' + a.valueClass + ' font-data-mono mt-sm">' + a.value + '</div>' +
          '<div class="flex items-center gap-xs ' + a.changeColor + ' font-label-md text-label-md mt-auto ' + bc + '">' + ci + '<span>' + a.change + '</span></div></div>';
      }).join('');
    }

    var rEl = document.querySelector('[data-container="rewards"]');
    if (rEl) {
      rEl.innerHTML = loyaltyData.rewards.map(function(r) {
        var nc = r.paused ? 'text-on-surface-variant' : '';
        return '<tr class="border-b border-outline-variant hover:bg-surface-container-high transition-colors group" data-id="' + r._id + '">' +
          '<td class="p-md font-semibold ' + nc + '">' + r.name + '</td>' +
          '<td class="p-md font-data-mono text-data-mono ' + nc + '">' + r.cost + '</td>' +
          '<td class="p-md ' + nc + '">' + r.type + '</td>' +
          '<td class="p-md"><span class="inline-flex items-center px-2 py-1 rounded-full ' + r.statusClass + ' font-label-md text-[10px] uppercase tracking-wider">' + r.status + '</span></td>' +
          '<td class="p-md text-right opacity-0 group-hover:opacity-100 transition-opacity">' +
          '<button class="edit-reward text-on-surface-variant hover:text-primary mx-1" data-id="' + r._id + '"><span class="material-symbols-outlined text-sm">edit</span></button>' +
          '<button class="delete-reward text-on-surface-variant hover:text-error mx-1" data-id="' + r._id + '"><span class="material-symbols-outlined text-sm">delete</span></button>' +
          '</td></tr>';
      }).join('');

      rEl.querySelectorAll('.edit-reward').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var id = btn.dataset.id;
          var rw = data.rewards.filter(function(r) { return r.id === id; })[0];
          if (!rw) return;
          Utils.prompt({ title: 'Edit Reward Tier', fields: [
            { name: 'name', label: 'Reward Name' }, { name: 'cost', label: 'Points Required' }, { name: 'type', label: 'Type' }
          ], data: { name: rw.name, cost: String(rw.cost), type: rw.type }, onSave: function(vals) {
            rw.name = vals.name; rw.cost = parseInt(vals.cost) || 0; rw.type = vals.type;
            Utils.storage.set(STORAGE_KEY, data); render(); Utils.notify('Reward updated', 'success');
          }});
        });
      });
      rEl.querySelectorAll('.delete-reward').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var id = btn.dataset.id;
          Utils.confirm('Delete this reward tier?', function() {
            data.rewards = data.rewards.filter(function(r) { return r.id !== id; });
            Utils.storage.set(STORAGE_KEY, data); render(); Utils.notify('Reward deleted', 'success');
          });
        });
      });
    }

    var cEl = document.querySelector('[data-container="campaigns"]');
    if (cEl) {
      cEl.innerHTML = data.campaigns.map(function(c) {
        var mediaHtml = '<div class="w-24 h-24 rounded-lg bg-surface-container-low overflow-hidden shrink-0 flex items-center justify-center bg-secondary/10"><span class="material-symbols-outlined text-4xl text-secondary">' + (c.icon || 'celebration') + '</span></div>';
        var statusClass = c.active ? 'text-tertiary-container' : 'text-on-surface-variant';
        var pulse = c.active ? 'animate-pulse' : '';
        return '<div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex gap-md items-start group hover:border-primary-fixed-dim transition-colors" data-id="' + c.id + '">' +
          mediaHtml +
          '<div class="flex flex-col flex-1 h-full">' +
          '<div class="flex justify-between items-start">' +
          '<h4 class="font-body-lg text-body-lg font-semibold text-on-surface">' + c.title + '</h4>' +
          '<button class="toggle-campaign text-on-surface-variant hover:text-primary" data-id="' + c.id + '"><span class="material-symbols-outlined">' + (c.active ? 'toggle_on' : 'toggle_off') + '</span></button>' +
          '</div>' +
          '<p class="font-body-sm text-body-sm text-on-surface-variant mt-xs line-clamp-2">' + c.desc + '</p>' +
          '<div class="mt-auto pt-sm flex justify-between items-center">' +
          '<span class="font-data-mono text-data-mono text-primary text-xs bg-primary/10 px-2 py-1 rounded">' + c.badge + '</span>' +
          '<span class="font-label-md text-label-md ' + statusClass + ' flex items-center gap-xs">' +
          '<span class="w-2 h-2 rounded-full bg-tertiary-container ' + pulse + '"></span> ' + (c.active ? 'Live' : 'Paused') +
          '</span></div></div></div>';
      }).join('');

      cEl.querySelectorAll('.toggle-campaign').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var id = btn.dataset.id;
          for (var i = 0; i < data.campaigns.length; i++) { if (data.campaigns[i].id === id) { data.campaigns[i].active = !data.campaigns[i].active; break; } }
          Utils.storage.set(STORAGE_KEY, data); render(); Utils.notify('Campaign toggled', 'info');
        });
      });
    }
  }

  function init() {
    render();

    var earnInput = document.querySelector('input[type="number"]');
    if (earnInput) { earnInput.value = data.earnRate;
      earnInput.addEventListener('change', function() { data.earnRate = parseInt(this.value) || 1; });
    }

    var expirySelect = document.querySelector('select');
    if (expirySelect) {
      for (var i = 0; i < expirySelect.options.length; i++) { if (expirySelect.options[i].text === data.expiryOption) { expirySelect.selectedIndex = i; break; } }
      expirySelect.addEventListener('change', function() { data.expiryOption = this.options[this.selectedIndex].text; Utils.storage.set(STORAGE_KEY, data); });
    }

    var saveEngineBtn = Array.from(document.querySelectorAll('button')).find(function(b) { return b.textContent.trim() === 'Save Engine Config'; });
    if (saveEngineBtn) saveEngineBtn.addEventListener('click', function() { Utils.storage.set(STORAGE_KEY, data); Utils.notify('Engine config saved', 'success'); });

    var newRewardBtn = Array.from(document.querySelectorAll('button')).find(function(b) { return b.textContent.trim() === 'New Reward Tier'; });
    if (newRewardBtn) newRewardBtn.addEventListener('click', function() {
      Utils.prompt({ title: 'New Reward Tier', fields: [
        { name: 'name', label: 'Reward Name' }, { name: 'cost', label: 'Points Required' }, { name: 'type', label: 'Type' }
      ], onSave: function(vals) {
        data.rewards.push({ id: 'rew-' + Utils.uid(), name: vals.name, cost: parseInt(vals.cost) || 0, type: vals.type, active: true });
        Utils.storage.set(STORAGE_KEY, data); render(); Utils.notify('Reward tier added', 'success');
      }});
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
