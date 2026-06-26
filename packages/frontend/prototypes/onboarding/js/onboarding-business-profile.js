(function() {
  var STEPS = [
    { label: 'Business Profile', icon: 'storefront' },
    { label: 'Service Area', icon: 'grid_view' },
    { label: 'Modules', icon: 'extension' },
    { label: 'Final Review', icon: 'verified' }
  ];
  var STEP = 1;
  var logoDataUrl = '';

  function el(id) { return document.getElementById(id); }
  function val(id) { var e = el(id); return e ? e.value : ''; }
  function setVal(id, v) { var e = el(id); if (e) e.value = v; }

  function load() {
    return Utils.storage.get('onboarding_profile', {
      restaurantName: '', cuisineType: '', locations: 1,
      adminEmail: '', adminPassword: '', logo: ''
    });
  }

  function collect() {
    return {
      restaurantName: val('restaurant-name').trim(),
      cuisineType: val('cuisine-type'),
      locations: parseInt(val('locations')) || 1,
      adminEmail: val('admin-email').trim(),
      adminPassword: val('admin-password'),
      logo: logoDataUrl
    };
  }

  function save(data) { Utils.storage.set('onboarding_profile', data); }

  function updateProgress() {
    var sl = el('step-label');
    var sn = el('step-name');
    var pb = el('progress-bar');
    if (sl) sl.textContent = 'Step ' + STEP + ' of ' + STEPS.length;
    if (sn) sn.textContent = STEPS[STEP - 1].label;
    if (pb) pb.style.width = (STEP / STEPS.length * 100) + '%';
  }

  function validate(data) {
    if (!data.restaurantName) { Utils.notify('Enter a restaurant name.', 'error'); return false; }
    if (!data.cuisineType) { Utils.notify('Select a cuisine type.', 'error'); return false; }
    if (data.locations < 1) { Utils.notify('At least 1 location required.', 'error'); return false; }
    if (!data.adminEmail) { Utils.notify('Enter an admin email.', 'error'); return false; }
    if (!data.adminPassword || data.adminPassword.length < 6) { Utils.notify('Password must be 6+ characters.', 'error'); return false; }
    return true;
  }

  function setupLogo() {
    var area = document.querySelector('.border-dashed');
    if (!area) return;
    var inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/png,image/jpeg,image/gif';
    inp.style.display = 'none';
    area.appendChild(inp);
    area.style.cursor = 'pointer';
    area.addEventListener('click', function() { inp.click(); });
    area.addEventListener('dragover', function(e) { e.preventDefault(); area.classList.add('border-primary'); });
    area.addEventListener('dragleave', function() { area.classList.remove('border-primary'); });
    area.addEventListener('drop', function(e) {
      e.preventDefault(); area.classList.remove('border-primary');
      var f = e.dataTransfer.files[0]; if (f) handleFile(f, area);
    });
    inp.addEventListener('change', function(e) {
      var f = e.target.files[0]; if (f) handleFile(f, area);
    });
  }

  function handleFile(file, area) {
    if (!file.type.startsWith('image/')) { Utils.notify('Upload an image file.', 'error'); return; }
    if (file.size > 10 * 1024 * 1024) { Utils.notify('File under 10MB please.', 'error'); return; }
    var r = new FileReader();
    r.onload = function(e) {
      logoDataUrl = e.target.result;
      area.innerHTML = '<img src="' + logoDataUrl + '" class="max-h-32 mx-auto rounded" alt="Logo"/>';
      Utils.notify('Logo uploaded.', 'success');
    };
    r.readAsDataURL(file);
  }

  function findBtn(text) {
    return Array.from(document.querySelectorAll('button')).filter(function(b) {
      return b.textContent.replace(/[\n\r]/g, '').trim().indexOf(text) === 0;
    })[0];
  }

  function init() {
    var data = load();
    setVal('restaurant-name', data.restaurantName);
    setVal('cuisine-type', data.cuisineType);
    setVal('locations', data.locations);
    setVal('admin-email', data.adminEmail);
    setVal('admin-password', data.adminPassword);
    if (data.logo) {
      logoDataUrl = data.logo;
      var area = document.querySelector('.border-dashed');
      if (area) area.innerHTML = '<img src="' + logoDataUrl + '" class="max-h-32 mx-auto rounded" alt="Logo"/>';
    }
    updateProgress();
    setupLogo();
    var sb = findBtn('Save Draft');
    if (sb) sb.addEventListener('click', function() { save(collect()); Utils.notify('Draft saved.', 'success'); });
    var cb = findBtn('Continue');
    if (cb) cb.addEventListener('click', function() {
      var d = collect();
      if (!validate(d)) return;
      save(d);
      window.location.href = 'onboarding-areas-tables.html';
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
