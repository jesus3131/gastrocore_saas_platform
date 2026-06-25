
const kpis = [
  { value: "$142,500", change: "+5.2%", trend: "trending_up", pos: true },
  { value: "28.4%", change: "-1.1%", trend: "arrow_downward", pos: true },
  { value: "$45,200", change: "+2.0%", trend: "trending_up", pos: false }
];
const topCategories = [
  { name: "Beverages (Alcoholic)", margin: 82 },
  { name: "Appetizers", margin: 74 },
  { name: "Desserts", margin: 68 },
  { name: "Salads & Soups", margin: 65 },
  { name: "Mains (Pasta)", margin: 61 }
];
const wasteData = [
  { ing: "Beef Tenderloin", theo: "$4,250.00", actual: "$4,890.00", var: "15.0%", impact: "-$640.00", pos: false },
  { ing: "Avocado (Case)", theo: "$850.00", actual: "$1,020.00", var: "20.0%", impact: "-$170.00", pos: false },
  { ing: "Olive Oil (EVOO)", theo: "$620.00", actual: "$695.00", var: "12.1%", impact: "-$75.00", pos: false },
  { ing: "Chicken Breast", theo: "$1,200.00", actual: "$1,180.00", var: "1.6%", impact: "+$20.00", pos: true }
];
const bcgItems = [
  { name: "Dry Aged Ribeye" },
  { name: "Signature Cocktail" },
  { name: "House Burger" },
  { name: "Truffle Fries" },
  { name: "Lobster Thermidor" },
  { name: "Vegan Meatloaf" }
];



(function(){
  var grid = document.querySelector('.grid-cols-1.md\\:grid-cols-3');
  if (grid) {
    var kids = grid.children;
    for (var i = 0; i < kpis.length; i++) {
      var val = kids[i].querySelector('.font-display-lg');
      if (val) val.textContent = kpis[i].value;
      var badge = kids[i].querySelector('.items-end .flex.items-center');
      if (badge) {
        var ib = badge.querySelector('.material-symbols-outlined');
        if (ib) ib.textContent = kpis[i].trend;
        var tb = badge.querySelector('.ml-1');
        if (tb) tb.textContent = kpis[i].change;
        badge.className = badge.className.replace(/bg-(tertiary-container|error-container)\\/10|bg-error-container/g,' ') + (kpis[i].pos ? ' bg-tertiary-container/10' : ' bg-error-container');
      }
    }
  }
  var catSec = document.querySelector('.xl\\:col-span-5');
  if (catSec) {
    var cBars = catSec.querySelectorAll('.p-lg > .w-full');
    for (var i = 0; i < topCategories.length; i++) {
      var nm = cBars[i].querySelector('.font-medium');
      var mg = cBars[i].querySelector('.font-data-mono');
      var br = cBars[i].querySelector('.rounded-full > div');
      if (nm) nm.textContent = topCategories[i].name;
      if (mg) mg.textContent = topCategories[i].margin + '% Margin';
      if (br) br.style.width = topCategories[i].margin + '%';
    }
  }
  var wTbody = document.querySelector('.xl\\:col-span-7 tbody');
  if (wTbody) {
    var wRows = wTbody.querySelectorAll('tr');
    for (var i = 0; i < wasteData.length; i++) {
      var c = wRows[i].querySelectorAll('td');
      c[0].textContent = wasteData[i].ing;
      c[1].textContent = wasteData[i].theo;
      c[2].textContent = wasteData[i].actual;
      var vs = c[3].querySelector('span');
      if (vs) {
        var vi = vs.querySelector('.material-symbols-outlined');
        if (vi) vi.textContent = wasteData[i].pos ? 'trending_down' : 'trending_up';
        for (var j = 0; j < vs.childNodes.length; j++) {
          if (vs.childNodes[j].nodeType === 3) { vs.childNodes[j].textContent = ' ' + wasteData[i].var; break; }
        }
        vs.className = vs.className.replace(/bg-(error-container|tertiary-container)\\/50|text-error|text-on-tertiary-container/g,' ') + (wasteData[i].pos ? ' bg-tertiary-container/10 text-on-tertiary-container' : ' bg-error-container/50 text-error');
      }
      c[4].textContent = wasteData[i].impact;
      c[4].className = c[4].className.replace(/text-error|text-on-tertiary-container/g,' ') + (wasteData[i].pos ? ' text-on-tertiary-container' : ' text-error');
    }
  }
  var bEls = document.querySelectorAll('.xl\\:col-span-12 .group .hidden');
  for (var i = 0; i < bcgItems.length; i++) {
    if (bEls[i]) bEls[i].textContent = bcgItems[i].name;
  }
})();
