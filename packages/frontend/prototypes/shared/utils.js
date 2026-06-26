const Utils = {
  uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8) },

  storage: {
    get(key, fallback = null) {
      try { const d = localStorage.getItem('gc_' + key); return d ? JSON.parse(d) : fallback }
      catch { return fallback }
    },
    set(key, val) { try { localStorage.setItem('gc_' + key, JSON.stringify(val)) } catch {} },
    remove(key) { try { localStorage.removeItem('gc_' + key) } catch {} }
  },

  formatCurrency(n) { return '$' + Number(n).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },

  formatDate(d) { const dt = new Date(d); return dt.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) },

  formatDateShort(d) { const dt = new Date(d); return dt.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }) },

  today() { return new Date().toISOString().slice(0, 10) },

  notify(message, type = 'success') {
    const container = document.getElementById('toast-container') || (() => {
      const el = document.createElement('div');
      el.id = 'toast-container';
      el.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2';
      document.body.appendChild(el);
      return el;
    })();
    const colors = { success: 'bg-green-600', error: 'bg-red-600', info: 'bg-blue-600', warning: 'bg-yellow-600' };
    const toast = document.createElement('div');
    toast.className = `${colors[type] || 'bg-gray-700'} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-up text-sm`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 0.3s'; setTimeout(() => toast.remove(), 300) }, 3000);
  },

  modal({ title, content, onConfirm, confirmText = 'Guardar', cancelText = 'Cancelar', width = 'max-w-lg' }) {
    const existing = document.getElementById('modal-overlay');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.id = 'modal-overlay';
    overlay.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/40';
    overlay.innerHTML = `
      <div class="bg-white rounded-xl shadow-2xl ${width} w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-4 border-b">
          <h3 class="text-lg font-semibold">${title}</h3>
          <button class="modal-close text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <div class="p-4">${content}</div>
        <div class="flex justify-end gap-2 p-4 border-t bg-gray-50">
          <button class="modal-close px-4 py-2 text-sm rounded-lg border hover:bg-gray-100">${cancelText}</button>
          <button class="modal-confirm px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700">${confirmText}</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelectorAll('.modal-close').forEach(b => b.addEventListener('click', () => overlay.remove()));
    overlay.querySelector('.modal-confirm')?.addEventListener('click', () => { onConfirm(); overlay.remove() });
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove() });
    return overlay;
  },

  confirm(message, onYes) {
    Utils.modal({
      title: 'Confirmar',
      content: `<p class="text-gray-600">${message}</p>`,
      confirmText: 'Sí',
      cancelText: 'Cancelar',
      onConfirm: onYes,
      width: 'max-w-sm'
    });
  },

  prompt({ title, fields, data = {}, onSave }) {
    let html = '<div class="space-y-3">';
    fields.forEach(f => {
      const val = data[f.name] || '';
      if (f.type === 'select') {
        html += `<div><label class="block text-sm font-medium text-gray-700 mb-1">${f.label}</label><select id="field-${f.name}" class="w-full border rounded-lg px-3 py-2 text-sm">${f.options.map(o => `<option value="${o.value}" ${val === o.value ? 'selected' : ''}>${o.label}</option>`).join('')}</select></div>`;
      } else if (f.type === 'textarea') {
        html += `<div><label class="block text-sm font-medium text-gray-700 mb-1">${f.label}</label><textarea id="field-${f.name}" class="w-full border rounded-lg px-3 py-2 text-sm" rows="3">${val}</textarea></div>`;
      } else {
        html += `<div><label class="block text-sm font-medium text-gray-700 mb-1">${f.label}</label><input id="field-${f.name}" type="${f.type || 'text'}" value="${val}" class="w-full border rounded-lg px-3 py-2 text-sm" /></div>`;
      }
    });
    html += '</div>';
    Utils.modal({
      title, content: html,
      onConfirm: () => {
        const vals = {};
        fields.forEach(f => { vals[f.name] = document.getElementById('field-' + f.name)?.value || '' });
        onSave(vals);
      }
    });
  }
};
