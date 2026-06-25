
const kpis = [
  { value: "$4.2M", change: "8.4%", trend: "trending_up", pos: true },
  { value: "$38.45", change: "2.1%", trend: "trending_up", pos: true },
  { value: "28.5%", change: "1.2%", trend: "trending_up", pos: false },
  { value: "14.2%", change: "0.5%", trend: "trending_up", pos: true }
];
const chartData = {
  yLabels: ["$1.2M", "$800k", "$400k", "$0"],
  weeks: [
    { label: "W1", budget: 60, actual: 65 },
    { label: "W2", budget: 75, actual: 70 },
    { label: "W3", budget: 85, actual: 90 },
    { label: "W4", budget: 65, actual: 80 }
  ]
};
const leaderboardData = [
  { initials: "DT", name: "Downtown Flagship", revenue: "$345K", vsTarget: "+12.4%", margin: "18.2%", pos: true },
  { initials: "WP", name: "Westside Plaza", revenue: "$298K", vsTarget: "+8.1%", margin: "16.5%", pos: true },
  { initials: "AP", name: "Airport Terminal C", revenue: "$275K", vsTarget: "+5.2%", margin: "15.8%", pos: true },
  { initials: "SO", name: "Southcenter Mall", revenue: "$242K", vsTarget: "-1.5%", margin: "14.1%", pos: false },
  { initials: "NV", name: "Northville Strip", revenue: "$215K", vsTarget: "-3.2%", margin: "13.5%", pos: false }
];



(function(){
  var kpiGrid = document.querySelector('.xl\\:grid-cols-4');
  if (kpiGrid) {
    var kids = kpiGrid.children;
    for (var i = 0; i < kpis.length; i++) {
      var val = kids[i].querySelector('.font-headline-lg');
      if (val) val.textContent = kpis[i].value;
      var badge = kids[i].querySelector('.items-baseline .flex.items-center');
      if (badge) {
        var ib = badge.querySelector('.material-symbols-outlined');
        if (ib) ib.textContent = kpis[i].trend;
        for (var j = 0; j < badge.childNodes.length; j++) {
          if (badge.childNodes[j].nodeType === 3) { badge.childNodes[j].textContent = ' ' + kpis[i].change; break; }
        }
        badge.className = badge.className.replace(/text-error|text-on-tertiary-container|bg-error-container|bg-tertiary-fixed-dim\\/20/g,' ') + (kpis[i].pos ? ' text-on-tertiary-container bg-tertiary-fixed-dim/20' : ' text-error bg-error-container');
      }
    }
  }
  var chartArea = document.querySelector('.h-\\[300px\\]');
  if (chartArea) {
    var yBox = chartArea.querySelector('.border-r.font-label-md');
    if (yBox) { var ys = yBox.querySelectorAll('span'); for (var i = 0; i < chartData.yLabels.length; i++) { if (ys[i]) ys[i].textContent = chartData.yLabels[i]; } }
    var wks = chartArea.querySelectorAll('.flex-col.items-center.justify-end');
    for (var i = 0; i < chartData.weeks.length; i++) {
      if (wks[i]) {
        var wKids = wks[i].children;
        if (wKids[0]) wKids[0].style.height = chartData.weeks[i].budget + '%';
        if (wKids[1]) wKids[1].style.height = chartData.weeks[i].actual + '%';
        var wl = wks[i].querySelector('span:last-child');
        if (wl) wl.textContent = chartData.weeks[i].label;
      }
    }
  }
  var lbTbody = document.querySelector('.lg\\:col-span-8 table tbody');
  if (lbTbody) {
    var lbRows = lbTbody.querySelectorAll('tr');
    for (var i = 0; i < leaderboardData.length; i++) {
      var c = lbRows[i].querySelectorAll('td');
      var idiv = c[0].querySelector('.w-8');
      if (idiv) idiv.textContent = leaderboardData[i].initials;
      for (var j = 0; j < c[0].childNodes.length; j++) {
        if (c[0].childNodes[j].nodeType === 3) { c[0].childNodes[j].textContent = ' ' + leaderboardData[i].name; break; }
      }
      c[1].textContent = leaderboardData[i].revenue;
      c[2].textContent = leaderboardData[i].vsTarget;
      c[2].className = c[2].className.replace(/text-on-tertiary-container|text-on-surface-variant/g,' ') + (leaderboardData[i].pos ? ' text-on-tertiary-container' : ' text-on-surface-variant');
      c[3].textContent = leaderboardData[i].margin;
    }
  }
})();
