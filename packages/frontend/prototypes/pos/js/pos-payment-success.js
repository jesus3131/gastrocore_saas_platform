
  const transaction = {
    total: 29.58,
    method: { icon: "credit_card", label: "Visa ****4242" },
    date: "Oct 24, 2023 - 14:32",
    id: "TXN-8492-AB"
  };



  document.getElementById('txn-total').textContent = '$' + transaction.total.toFixed(2);
  document.getElementById('txn-method-icon').textContent = transaction.method.icon;
  document.getElementById('txn-method').textContent = transaction.method.label;
  document.getElementById('txn-date').textContent = transaction.date;
  document.getElementById('txn-id').textContent = transaction.id;
