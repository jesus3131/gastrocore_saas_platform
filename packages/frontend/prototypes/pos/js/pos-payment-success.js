function loadTransaction() {
  const params = new URLSearchParams(window.location.search);
  const txnId = params.get('txnId');
  let txn = null;
  if (txnId) {
    const transactions = Utils.storage.get('pos_transactions', []);
    txn = transactions.find(t => t.id === txnId);
  }
  if (!txn) {
    txn = {
      id: 'TXN-' + Utils.uid().slice(0, 8).toUpperCase(),
      total: 29.58,
      method: { icon: "credit_card", label: "Visa ****4242" },
      date: new Date().toISOString(),
      items: [
        { name: "Hamburguesa Gourmet", qty: 1, price: 18.50 },
        { name: "Coca Cola Zero", qty: 2, price: 3.50 }
      ]
    };
  }
  document.getElementById('txn-total').textContent = Utils.formatCurrency(txn.total);
  document.getElementById('txn-method-icon').textContent = txn.method?.icon || 'credit_card';
  document.getElementById('txn-method').textContent = txn.method?.label || 'Tarjeta';
  document.getElementById('txn-date').textContent = Utils.formatDate(txn.date);
  document.getElementById('txn-id').textContent = txn.id;

  document.querySelectorAll('.print-btn').forEach(b => b.addEventListener('click', () => window.print()));
  document.querySelectorAll('.back-btn').forEach(b => b.addEventListener('click', () => { window.location.href = 'pos-table-map.html' }));
}

document.addEventListener('DOMContentLoaded', loadTransaction);
