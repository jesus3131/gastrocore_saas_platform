
const inventoryItems = [
  { name: "Carne de Res (Angus)", sku: "CAR-001", category: "Proteínas", stock: "45.5", unit: "kg", cost: 12.50, status: "optimal" },
  { name: "Pan Brioche Artesanal", sku: "PAN-042", category: "Panadería", stock: "12", unit: "uds", cost: 0.80, status: "critical" },
  { name: "Queso Cheddar Curado", sku: "LAC-015", category: "Lácteos", stock: "8.2", unit: "kg", cost: 18.00, status: "reorder" },
  { name: "Tomate Bola Hidropónico", sku: "VEG-008", category: "Vegetales", stock: "15.0", unit: "kg", cost: 2.20, status: "optimal" }
];
const recipeDetail = {
  name: "Hamburguesa Gourmet",
  category: "Principales",
  image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCJJxnXXsXJuW-kRXtxkTQTmwCa3emt7ZVVP5vbjPjDYWETmXKrPs78z6R7a2DqKxmS3VblTCuxWPe7IvsQpMXmThBsGs0YIvkkp2--jdwTrwgyLDmktstu3ElbmfGFmoq68X1wkABJW1-WkyYpTdM5obRB8DQ_Tt2pDd8Sg628G27kOjRFur01KtUtziWXj0hQi9cJtDwb6-UCXbZ0DPpglH-hTry5ye2fuGLQqSGNNiZOoifDEbnLODaFyHWVysTzUt4Gp5z-Vfpt",
  imageAlt: "A highly appetizing, professional food photography shot of a gourmet beef burger with melted cheddar, fresh brioche bun, and crisp vegetables on a dark slate board, studio lighting.",
  menuStatus: "Activo en Menú",
  ingredients: [
    { name: "Carne de Res (Angus)", quantity: "0.200 kg", cost: 2.50 },
    { name: "Pan Brioche Artesanal", quantity: "1 ud", cost: 0.80 },
    { name: "Queso Cheddar Curado", quantity: "0.040 kg", cost: 0.72 },
    { name: "Tomate, Lechuga, Cebolla", quantity: "Mix (0.080 kg)", cost: 0.45 },
    { name: "Salsa Secreta / Mermas", quantity: "Estimado 5%", cost: 0.25 }
  ],
  totalCost: 4.72,
  desiredMargin: 30,
  suggestedPrice: 15.73,
  currentPrice: 14.50,
  marginAdjustment: 1.23
};
</script>
<!-- Tailwind CSS with custom config -->
<script src="../../shared/design-tokens.js">


(function() {
  // Inventory table
  var tbody = document.querySelector('.overflow-x-auto table tbody');
  var statusMap = {
    optimal: { label: 'Óptimo', classes: 'bg-tertiary-fixed-dim/20 text-tertiary-container' },
    critical: { label: 'Crítico', classes: 'bg-error-container text-on-error-container', icon: '<span class="material-symbols-outlined text-[14px]">warning</span> ' },
    reorder: { label: 'Por Pedir', classes: 'bg-[#1E3A8A]/10 text-[#1E3A8A]' }
  };
  inventoryItems.forEach(function(item) {
    var s = statusMap[item.status] || statusMap.optimal;
    var isCritical = item.status === 'critical';
    var tr = document.createElement('tr');
    tr.className = 'hover:bg-surface-container transition-colors group cursor-pointer' + (isCritical ? ' bg-error-container/10' : '');
    var stockHtml = isCritical
      ? '<span class="font-data-mono text-data-mono font-bold text-error">' + item.stock + ' <span class="text-on-surface-variant">' + item.unit + '</span></span>'
      : '<span class="font-data-mono text-data-mono">' + item.stock + ' <span class="text-on-surface-variant">' + item.unit + '</span></span>';
    tr.innerHTML = '<td class="p-md"><div class="font-medium text-on-surface">' + item.name + '</div><div class="text-on-surface-variant text-[11px] mt-0.5">SKU: ' + item.sku + '</div></td><td class="p-md text-on-surface-variant">' + item.category + '</td><td class="p-md text-right">' + stockHtml + '</td><td class="p-md text-right font-data-mono text-data-mono">$' + item.cost.toFixed(2) + '</td><td class="p-md text-center"><span class="inline-flex items-center ' + (s.icon ? 'gap-1 ' : '') + 'px-2 py-1 rounded-full ' + s.classes + ' font-label-md text-[11px]">' + (s.icon || '') + s.label + '</span></td>';
    tbody.appendChild(tr);
  });

  // Recipe detail header
  var detail = recipeDetail;
  var imgDiv = document.querySelector('.bg-cover.bg-center');
  if (imgDiv) {
    imgDiv.setAttribute('data-alt', detail.imageAlt);
    imgDiv.style.backgroundImage = "url('" + detail.image + "')";
  }
  var h5 = document.querySelector('.xl\\:col-span-4 h5');
  if (h5) h5.textContent = detail.name;
  var catP = document.querySelector('.xl\\:col-span-4 .font-body-sm.text-body-sm.text-on-surface-variant.mt-xs');
  if (catP) catP.textContent = 'Categor\u00eda: ' + detail.category;
  var statusSpan = document.querySelector('.xl\\:col-span-4 .px-2.py-0\\.5.rounded');
  if (statusSpan) statusSpan.textContent = detail.menuStatus;

  // Ingredients list
  var ingContainer = document.querySelector('.space-y-sm.flex-1');
  detail.ingredients.forEach(function(ing) {
    var div = document.createElement('div');
    div.className = 'flex justify-between items-center py-xs border-b border-surface-container border-dashed';
    div.innerHTML = '<div class="flex flex-col"><span class="font-body-sm text-body-sm font-medium">' + ing.name + '</span><span class="font-label-md text-[11px] text-on-surface-variant">' + ing.quantity + '</span></div><span class="font-data-mono text-data-mono font-medium">$' + ing.cost.toFixed(2) + '</span>';
    ingContainer.appendChild(div);
  });

  // Financial summary
  var summaryBox = document.querySelector('.bg-surface-container-low.rounded-lg');
  if (summaryBox) {
    var dataSpans = summaryBox.querySelectorAll('.font-data-mono');
    // dataSpans[0] = total cost, dataSpans[1] = margin %, dataSpans[2] = suggested price, dataSpans[3] = current price
    if (dataSpans[0]) dataSpans[0].textContent = '$' + detail.totalCost.toFixed(2);
    if (dataSpans[1]) dataSpans[1].textContent = detail.desiredMargin + '%';
    if (dataSpans[2]) dataSpans[2].textContent = '$' + detail.suggestedPrice.toFixed(2);
    if (dataSpans[3]) dataSpans[3].textContent = '$' + detail.currentPrice.toFixed(2);

    // Alert text
    var alertP = summaryBox.querySelector('.font-label-md.text-\\[11px\\].text-error');
    if (alertP) alertP.textContent = 'El precio actual no cumple con el margen objetivo. Se sugiere un ajuste de $' + detail.marginAdjustment.toFixed(2) + '.';
  }
})();
