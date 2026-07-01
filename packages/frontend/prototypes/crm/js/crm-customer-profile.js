var profileData = { name: '', email: '', phone: '', location: '', lifetimeValue: '$0.00', lifetimeValueChange: '', totalVisits: '0', lastVisit: '', avgTicket: '$0.00', avgTicketNote: '', loyaltyPoints: '0', loyaltyTier: '', tags: [], recentOrders: [], favoriteItems: [], loyalty: { tier: '', nextTier: '', pointsProgress: '', progressWidth: '0%', benefits: [] }, preferences: { allergies: 'None recorded', dietary: 'None', seating: 'No preference' }, notes: [] };

(function() {
  function getParam(name) { var m = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search); return m ? decodeURIComponent(m[1]) : null; }

  function generateOrders(customerId, customerName) {
    var items = ['Wagyu Burger', 'Truffle Fries', 'Old Fashioned', 'Ribeye Steak', 'Caesar Salad', 'Margherita Pizza', 'Seared Scallops', 'White Wine', 'Red Wine', 'Iced Tea', 'Tiramisu', 'Bruschetta', 'Lobster Bisque', 'Creme Brulee', 'Espresso Martini'];
    var statuses = ['completed', 'completed', 'completed', 'completed', 'completed', 'completed', 'cancelled'];
    var orders = [];
    for (var i = 1; i <= 6; i++) {
      var d = new Date(); d.setDate(d.getDate() - i * 7 - Math.floor(Math.random() * 5));
      var numItems = Math.floor(Math.random() * 3) + 1;
      var ordered = [];
      for (var j = 0; j < numItems; j++) { var idx = Math.floor(Math.random() * items.length); if (ordered.indexOf(items[idx]) === -1) ordered.push(items[idx]); }
      var total = (Math.random() * 120 + 25).toFixed(2);
      var st = statuses[Math.floor(Math.random() * statuses.length)];
      orders.push({ date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), id: '#ORD-' + (8900 + i), items: ordered.join(', '), total: '$' + total, status: st });
    }
    return orders;
  }

  function computeFavorites(orders) {
    var map = {};
    orders.forEach(function(o) {
      o.items.split(', ').forEach(function(item) {
        map[item] = (map[item] || 0) + 1;
      });
    });
    var sorted = Object.keys(map).sort(function(a, b) { return map[b] - map[a]; }).slice(0, 6);
    var images = ['https://lh3.googleusercontent.com/aida-public/AB6AXuDRBkwGfeRFpV6BlFRQ6pd3PxNCk8L1NneRsTrpI6ybG9IiJgmPU4-OLBPLlJv66jqH_kOe5O-tI66RXGR25rh1HG1CPtpVSFefgNF5tpi29OjEan8AzsX_o7XwzQOfqeLqyf0VbBrLa0W2u9r113igLKpIsC0YWkKRpCs5Lr_Q1W-5hole4Q_NlXWljBg9hVkbOKm_Bqnfk_QtOf__YSwDT6f0CqiPADOVHdif1q3lcQQzeUdRcY2uGgsQDxhrqOT5cgeiVjo-A_zL', 'https://lh3.googleusercontent.com/aida-public/AB6AXuDz_pOFwexpzlTWGpg1ZMNOr_R4gfdaGaZTfvYLrrCHz9k9u1DzJqdoUTpDvlwjd3G1ITBGYMPRX0_v3Yaa1_uD2WYJnVFuSkZYnW_s7UyBqcmB_MbhinPs6remk1_slBmhTDHFX7JgXhEKkUEYvIbtizEs2JvwO2ubd9dZQDnYgNgBctxsYoEk32DtS9wiAcFOTi_aUCiHmZ6kgufd6kIZkvN-_nkDM66zbvyceLSIKPTQg6S2MypwBeEWIxHCcTbXZtmO8xM2pZHq', 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCZMyieEzc7JoMzeR78snLwPvwtM-CMfVVDjhaxFCQxIRhcnpG_z7a4NAoT3AOfqOZITLD1OkuBz75c8THagKLKnfhXRIMJCkjzDBfj60hQ9tppc93J3gffyQ3goqBomYDalRDPTHohNuV8pE9QhVei06VgLg_SI0IxJzQjg4UrWFJp--yR61BIAUcyPbRJ9tghFPYFYdDw0K_uBhO4FNPWY9vrpCKEn3U0nQsUEdMpmtlm7ghPCSUuPmmPAu9J87zkR8fgDeWIJ3M'];
    return sorted.map(function(name, i) { return { name: name, count: map[name], img: images[i % images.length] }; });
  }

  function getTier(points) {
    if (points >= 15000) return { name: 'Diamond', next: null, progress: '100%', pts: points, target: points, benefits: ['Priority Reservations', 'Complimentary Dessert', '2x Points Multiplier', 'VIP Event Access'] };
    if (points >= 10000) return { name: 'Platinum', next: 'Diamond', progress: Math.round(points / 15000 * 100) + '%', pts: points.toLocaleString(), target: '15,000', benefits: ['Priority Reservations', 'Complimentary Dessert', '1.5x Points Multiplier'] };
    if (points >= 5000) return { name: 'Gold', next: 'Platinum', progress: Math.round(points / 10000 * 100) + '%', pts: points.toLocaleString(), target: '10,000', benefits: ['Priority Seating', 'Birthday Treat', '1.25x Points Multiplier'] };
    if (points >= 1000) return { name: 'Silver', next: 'Gold', progress: Math.round(points / 5000 * 100) + '%', pts: points.toLocaleString(), target: '5,000', benefits: ['Birthday Treat', 'Early Bird Access'] };
    return { name: 'Bronze', next: 'Silver', progress: Math.round(points / 1000 * 100) + '%', pts: points.toLocaleString(), target: '1,000', benefits: ['Welcome Offer'] };
  }

  function saveNotes(id, notes) {
    var customers = Utils.storage.get('crm_customers', []);
    for (var i = 0; i < customers.length; i++) { if (customers[i].id === id) { customers[i].notes = notes; break; } }
    Utils.storage.set('crm_customers', customers);
  }

  function render(customer) {
    if (!customer) return;
    var tier = getTier(customer.points);
    var orders = customer._orders || generateOrders(customer.id, customer.name);
    var favorites = computeFavorites(orders);
    var notes = customer.notes || [];

    profileData = {
      name: customer.name, email: customer.email, phone: customer.phone, location: 'Chicago, IL',
      lifetimeValue: Utils.formatCurrency(customer.totalSpent),
      lifetimeValueChange: '+' + Math.round((customer.totalSpent / (customer.visits || 1)) / 10) + '% this year',
      totalVisits: String(customer.visits),
      lastVisit: 'Last visit: ' + (function() { var d = new Date(customer.lastVisit); return d.toLocaleDateString(); })(),
      avgTicket: Utils.formatCurrency(customer.visits > 0 ? customer.totalSpent / customer.visits : 0),
      avgTicketNote: customer.visits > 10 ? 'Consistently above avg' : 'Growing steadily',
      loyaltyPoints: customer.points.toLocaleString(),
      loyaltyTier: tier.name + ' Tier',
      tags: customer.tags && customer.tags.length ? customer.tags.map(function(t) {
        if (t === 'VIP') return { label: 'VIP', icon: 'star', bg: '#fef08a', text: '#854d0e', border: '#fde047' };
        if (t === 'New') return { label: 'New', dot: true, bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' };
        return { label: t, dot: true, bg: '#e0e7ff', text: '#3730a3', border: '#c7d2fe' };
      }) : [{ label: 'Active', dot: true, bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' }],
      recentOrders: orders,
      favoriteItems: favorites,
      loyalty: {
        tier: tier.name + ' Member',
        nextTier: tier.next ? 'Next Tier: ' + tier.next : 'Highest Tier Reached',
        pointsProgress: tier.pts + ' / ' + tier.target + ' pts',
        progressWidth: tier.progress,
        benefits: tier.benefits
      },
      notes: notes
    };

    var fields = {
      'breadcrumb-name': customer.name, 'customer-name': customer.name,
      'email': customer.email, 'phone': customer.phone, 'location': 'Chicago, IL',
      'lifetimeValue': Utils.formatCurrency(customer.totalSpent),
      'lifetimeValueChange': profileData.lifetimeValueChange,
      'totalVisits': String(customer.visits),
      'lastVisit': profileData.lastVisit,
      'avgTicket': Utils.formatCurrency(customer.visits > 0 ? customer.totalSpent / customer.visits : 0),
      'avgTicketNote': profileData.avgTicketNote,
      'loyaltyPoints': customer.points.toLocaleString(),
      'loyaltyTier': tier.name + ' Tier',
      'loyalty-tier': profileData.loyalty.tier,
      'next-tier': profileData.loyalty.nextTier,
      'points-progress': profileData.loyalty.pointsProgress,
      'allergies': 'None recorded',
      'dietary': 'No restrictions',
      'seating': 'No preference'
    };
    Object.keys(fields).forEach(function(k) { var el = document.querySelector('[data-field="' + k + '"]'); if (el) el.textContent = fields[k]; });

    var pr = document.querySelector('[data-field="progress-bar"]');
    if (pr) pr.style.width = profileData.loyalty.progressWidth;

    var tagsEl = document.querySelector('[data-container="tags"]');
    if (tagsEl) {
      tagsEl.innerHTML = profileData.tags.map(function(t) {
        if (t.icon) return '<span class="bg-[' + t.bg + '] text-[' + t.text + '] font-label-md text-label-md px-sm py-[2px] rounded-full flex items-center gap-1 border border-[' + t.border + ']"><span class="material-symbols-outlined fill text-[14px]">' + t.icon + '</span> ' + t.label + '</span>';
        return '<span class="bg-[' + t.bg + '] text-[' + t.text + '] font-label-md text-label-md px-sm py-[2px] rounded-full flex items-center gap-1 border border-[' + t.border + ']"><span class="w-2 h-2 rounded-full bg-[#10b981]"></span> ' + t.label + '</span>';
      }).join('');
    }

    var oEl = document.querySelector('[data-container="orders"]');
    if (oEl) {
      oEl.innerHTML = orders.map(function(o) {
        var isC = o.status === 'cancelled';
        var sbg = isC ? 'bg-error-container text-on-error-container border-[#fecaca]' : 'bg-[#d1fae5] text-[#065f46] border-[#a7f3d0]';
        return '<tr class="hover:bg-surface-container-low transition-colors group">' +
          '<td class="px-md py-md whitespace-nowrap">' + o.date + '</td>' +
          '<td class="px-md py-md font-data-mono text-outline">' + o.id + '</td>' +
          '<td class="px-md py-md truncate max-w-[200px]" title="' + o.items + '">' + o.items + '</td>' +
          '<td class="px-md py-md text-right font-data-mono">' + o.total + '</td>' +
          '<td class="px-md py-md text-center"><span class="inline-flex items-center px-2 py-1 rounded-full ' + sbg + ' text-[11px] font-semibold leading-none border">' + o.status.charAt(0).toUpperCase() + o.status.slice(1) + '</span></td></tr>';
      }).join('');
    }

    var fEl = document.querySelector('[data-container="favorites"]');
    if (fEl) {
      fEl.innerHTML = favorites.map(function(f) {
        return '<div class="border border-outline-variant rounded-lg p-sm flex items-start gap-sm hover:border-primary transition-colors cursor-pointer bg-surface">' +
          '<div class="w-12 h-12 rounded bg-surface-container-high flex-shrink-0 overflow-hidden"><img class="w-full h-full object-cover" src="' + f.img + '"/></div>' +
          '<div><h4 class="font-label-md text-label-md text-on-surface">' + f.name + '</h4><p class="font-body-sm text-body-sm text-on-surface-variant">Ordered ' + f.count + ' time' + (f.count > 1 ? 's' : '') + '</p></div></div>';
      }).join('');
    }

    var bEl = document.querySelector('[data-container="benefits"]');
    if (bEl) {
      bEl.innerHTML = profileData.loyalty.benefits.map(function(b) {
        return '<li class="flex items-center gap-xs"><span class="material-symbols-outlined text-[16px] text-[#4ade80]">check</span> ' + b + '</li>';
      }).join('');
    }

    renderNotes(notes, customer.id);
  }

  function renderNotes(notes, customerId) {
    var nEl = document.querySelector('[data-container="notes"]');
    if (!nEl) return;
    nEl.innerHTML = notes.map(function(n, i) {
      return '<div class="relative pl-sm border-l-2 border-[#fbbf24] note-item" data-idx="' + i + '">' +
        '<div class="flex justify-between items-center mb-xs">' +
        '<span class="font-label-md text-label-md text-[#92400e]">' + n.author + '</span>' +
        '<div class="flex items-center gap-1">' +
        '<span class="font-data-mono text-[11px] text-[#b45309]">' + n.date + '</span>' +
        '<button class="edit-note text-[#b45309] hover:text-[#78350f]" data-idx="' + i + '"><span class="material-symbols-outlined text-[14px]">edit</span></button>' +
        '<button class="delete-note text-[#b45309] hover:text-red-600" data-idx="' + i + '"><span class="material-symbols-outlined text-[14px]">close</span></button>' +
        '</div></div>' +
        '<p class="font-body-sm text-body-sm text-[#78350f] note-text">' + n.text + '</p></div>';
    }).join('');

    nEl.querySelectorAll('.edit-note').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var i = parseInt(btn.dataset.idx);
        var note = notes[i];
        Utils.prompt({ title: 'Edit Note', fields: [{ name: 'text', label: 'Note', type: 'textarea' }], data: { text: note.text }, onSave: function(vals) {
          notes[i].text = vals.text;
          saveNotes(customerId, notes);
          renderNotes(notes, customerId);
          Utils.notify('Note updated', 'success');
        }});
      });
    });
    nEl.querySelectorAll('.delete-note').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var i = parseInt(btn.dataset.idx);
        Utils.confirm('Delete this note?', function() {
          notes.splice(i, 1);
          saveNotes(customerId, notes);
          renderNotes(notes, customerId);
          Utils.notify('Note deleted', 'success');
        });
      });
    });
  }

  function init() {
    var id = getParam('id');
    var customers = Utils.storage.get('crm_customers', []);
    var customer = id ? customers.filter(function(c) { return c.id === id; })[0] : customers[0];
    if (!customer && customers.length) customer = customers[0];

    if (customer) {
      if (!customer.notes) customer.notes = [
        { author: 'System', date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), text: 'Customer profile created.' }
      ];
      var key = customer.id + '_orders';
      customer._orders = Utils.storage.get(key, null);
      if (!customer._orders) {
        customer._orders = generateOrders(customer.id, customer.name);
        Utils.storage.set(key, customer._orders);
      }
      render(customer);
    }

    var editBtn = Array.from(document.querySelectorAll('button')).find(function(b) { return b.textContent.trim() === 'Edit Profile'; });
    if (editBtn) editBtn.addEventListener('click', function() {
      Utils.prompt({ title: 'Edit Customer', fields: [
        { name: 'name', label: 'Full Name' }, { name: 'email', label: 'Email' }, { name: 'phone', label: 'Phone' }
      ], data: { name: customer.name, email: customer.email, phone: customer.phone }, onSave: function(vals) {
        customer.name = vals.name; customer.email = vals.email; customer.phone = vals.phone;
        var all = Utils.storage.get('crm_customers', []);
        for (var i = 0; i < all.length; i++) { if (all[i].id === customer.id) { all[i].name = vals.name; all[i].email = vals.email; all[i].phone = vals.phone; break; } }
        Utils.storage.set('crm_customers', all);
        render(customer);
        Utils.notify('Profile updated', 'success');
      }});
    });

    var addNoteBtn = Array.from(document.querySelectorAll('button')).find(function(b) { return b.textContent.trim() === 'Add Note' || b.querySelector('.material-symbols-outlined')?.textContent.trim() === 'add' && b.closest('[data-container]')?.dataset?.container !== 'notes'; });
    if (!addNoteBtn) {
      document.querySelectorAll('button').forEach(function(b) {
        var icon = b.querySelector('.material-symbols-outlined');
        if (icon && icon.textContent.trim() === 'add' && b.closest('#notes-area') === null) {
          var h3 = b.closest('div')?.querySelector('h3');
          if (h3 && h3.textContent.trim() === 'Internal Notes') addNoteBtn = b;
        }
      });
    }
    var notesHeader = Array.from(document.querySelectorAll('h3')).find(function(h) { return h.textContent.trim() === 'Internal Notes'; });
    if (notesHeader) {
      var parent = notesHeader.closest('div');
      if (parent) addNoteBtn = parent.querySelector('button');
    }
    if (addNoteBtn) addNoteBtn.addEventListener('click', function() {
      Utils.prompt({ title: 'Add Note', fields: [{ name: 'text', label: 'Note', type: 'textarea' }], onSave: function(vals) {
        customer.notes.push({ author: 'Staff', date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), text: vals.text });
        saveNotes(customer.id, customer.notes);
        renderNotes(customer.notes, customer.id);
        Utils.notify('Note added', 'success');
      }});
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
