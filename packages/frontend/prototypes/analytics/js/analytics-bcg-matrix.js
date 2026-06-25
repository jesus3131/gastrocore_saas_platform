
const metricCards = [
  { value: "$14,520.00", change: "+12.5%", trend: "trending_up", pos: true, subtitle: "vs $12,900.00 ayer" },
  { value: "$42.50", change: null, trend: null, pos: true, subtitle: "Objetivo: $45.00" },
  { value: "82", change: "82%", trend: null, pos: true, subtitle: null, isProgress: true },
  { value: "24.5", change: "-1.2%", trend: "trending_down", pos: false, subtitle: "Afectado por costo proteína", suffix: "%" }
];
const bcgQuadrants = {
  estrella: { items: ["Salm\u00f3n Glaseado", "Risotto de Hongos"] },
  interrogante: { items: ["Ceviche Vegano", "Tarta de Higo"] },
  vaca: { items: ["Hamburguesa Cl\u00e1sica", "Ensalada C\u00e9sar", "Gaseosas"] },
  perro: { items: ["Sopa de Cebolla", "Carpaccio Zucchini"] }
};
const peakHours = [
  { time: "13:00 - 15:00", label: "Alta (85%)", width: 85, cls: "bg-primary-container" },
  { time: "16:00 - 18:00", label: "Baja (20%)", width: 20, cls: "bg-secondary-fixed-dim" },
  { time: "19:00 - 21:00", label: "Cr\u00edtica (98%)", width: 98, cls: "bg-error relative z-10" },
  { time: "22:00 - 23:30", label: "Media (45%)", width: 45, cls: "bg-primary-fixed-dim" }
];
const topDishes = [
  { name: "Salm\u00f3n Glaseado", cat: "Plato Fuerte", cost: "$8.50", price: "$28.00", margin: "70% ($19.50)" },
  { name: "Risotto de Hongos", cat: "Plato Fuerte", cost: "$4.20", price: "$22.00", margin: "81% ($17.80)" },
  { name: "Copa de Malbec (Casa)", cat: "Bebidas", cost: "$1.50", price: "$9.00", margin: "83% ($7.50)" },
  { name: "Volc\u00e1n de Chocolate", cat: "Postres", cost: "$2.10", price: "$11.00", margin: "81% ($8.90)" },
  { name: "Limonada Menta Jengibre", cat: "Bebidas", cost: "$0.80", price: "$5.50", margin: "85% ($4.70)" }
];
</script>
</head>
<body class="bg-surface text-on-surface font-body-md text-body-md m-0 p-0 flex min-h-screen">
<!-- SideNavBar (Shared Component) -->
<aside class="bg-surface-container border-r border-outline-variant h-screen w-64 fixed left-0 top-0 flex flex-col py-md px-sm z-50">
<!-- Header / Brand -->
<div class="flex items-center gap-sm mb-lg px-sm">
<div class="w-10 h-10 rounded-lg overflow-hidden bg-surface-container-lowest border border-outline-variant flex items-center justify-center shrink-0">
<img alt="Logo del Restaurante" class="w-full h-full object-cover" data-alt="A sleek, minimalist corporate logo for a high-end restaurant management software, featuring geometric shapes in deep cobalt blue on a pristine white background. Bright, modern, flat design." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDYdwEDOgs4EZ-O4ZErbj_4nMAGhZlAsFzUcL5wRE9sCPyCSIBKUHnV9F9vQw_VTlUpkVXGPo0KkBR_Xt-cMJk9t-bGUfhpAZVGUdJTDQSAFwFT1joRR4rHu7M3fxCV4dn5e1-af57xNI5NfRKG8PvcK2b8zU-IZCYzLkWfhvConOGdM7NWexdi9J_gsiXbYcQo-IR9pbscc9MTc3EmisWpewHE1NloR6qvRJwpQMmD1oN-wwXZVy1Uta58xPeEnNAeoFEV-dajH3j"/>
</div>
<div>
<h1 class="font-headline-md text-headline-md font-bold text-primary">RestoPro Enterprise</h1>
<p class="font-label-md text-label-md text-on-surface-variant">Administrador</p>
</div>
</div>
<!-- Navigation Tabs -->
<nav class="flex-1 overflow-y-auto">
<ul class="flex flex-col gap-xs">
<li>
<a class="flex items-center gap-sm px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200" href="#">
<span class="material-symbols-outlined">point_of_sale</span>
<span class="font-body-md text-body-md">POS</span>
</a>
</li>
<li>
<a class="flex items-center gap-sm px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200" href="#">
<span class="material-symbols-outlined">inventory_2</span>
<span class="font-body-md text-body-md">Inventario</span>
</a>
</li>
<!-- ACTIVE TAB -->
<li>
<a class="flex items-center gap-sm px-md py-sm rounded-lg bg-secondary-container text-on-secondary-container font-bold Active: scale-95 transition-transform duration-150" href="#">
<span class="material-symbols-outlined filled">analytics</span>
<span class="font-body-md text-body-md">Analítica</span>
</a>
</li>
<li>
<a class="flex items-center gap-sm px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200" href="#">
<span class="material-symbols-outlined">badge</span>
<span class="font-body-md text-body-md">Personal</span>
</a>
</li>
<li>
<a class="flex items-center gap-sm px-md py-sm rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200" href="#">
<span class="material-symbols-outlined">settings</span>
<span class="font-body-md text-body-md">Configuración</span>
</a>
</li>
</ul>
</nav>
<!-- CTA -->
<div class="mt-auto pt-md">
<button class="w-full bg-primary-container text-on-primary py-sm rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity flex items-center justify-center gap-sm">
<span class="material-symbols-outlined text-[18px]">add</span>
                Nuevo Pedido
            </button>
</div>
</aside>
<!-- Main Content Wrapper -->
<div class="flex-1 ml-64 flex flex-col min-h-screen">
<!-- TopAppBar (Shared Component) -->
<header class="bg-surface-container-lowest border-b border-outline-variant docked full-width top-0 sticky z-40 flex justify-between items-center h-16 px-lg">
<div class="flex items-center gap-lg">
<span class="font-headline-md text-headline-md font-extrabold text-on-surface hidden">RestoPro</span> <!-- Hidden as requested by visual hierarchy, relying on sidebar -->
<!-- Navigation Links (Branches) -->
<nav class="hidden md:flex gap-md">
<!-- Active Link -->
<a class="text-primary font-bold border-b-2 border-primary py-sm font-label-md text-label-md Active: opacity-80 transition-opacity" href="#">Sucursal Principal</a>
<a class="text-on-surface-variant hover:text-on-surface py-sm font-label-md text-label-md hover:bg-surface-container-high rounded-lg px-sm" href="#">Sucursal Norte</a>
<a class="text-on-surface-variant hover:text-on-surface py-sm font-label-md text-label-md hover:bg-surface-container-high rounded-lg px-sm" href="#">Sucursal Sur</a>
</nav>
</div>
<!-- Trailing Actions -->
<div class="flex items-center gap-md">
<button class="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full p-sm transition-colors">
<span class="material-symbols-outlined">notifications</span>
</button>
<button class="text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-full p-sm transition-colors">
<span class="material-symbols-outlined">help</span>
</button>
<div class="w-8 h-8 rounded-full overflow-hidden border border-outline-variant ml-sm shrink-0">
<img alt="Avatar de Usuario" class="w-full h-full object-cover" data-alt="A professional headshot of a restaurant manager, smiling subtly, wearing a neat uniform. Shot in a bright, modern office space with soft lighting. Corporate professional aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDblYWPHNVAKYo1VZll58RI_6ghDBi8wXaBH_HA7miAP4RS98Gb5j5H0QWsmNGwgNl06K46VM31h8HPx7dQuqlnTo_P9aVnZ3V--hO6eNqB_63eSMmi0bcoygNlwAmj2IJcXuj9cNEaJPzKGEHl7aSATwnEhESa3hnCFKn7sTWLO10wHVKd2lGJvIq3GuLT6Hk13QXCt3RaDy2OvR86WkloZ9bZa-9pNbSEduJNtyimSzOOSznz4d92Rd-cyNEpwG2suqehILZlpKNd"/>
</div>
</div>
</header>
<!-- Dashboard Canvas -->
<main class="p-lg gap-lg flex flex-col">
<div class="flex justify-between items-end mb-sm">
<div>
<h2 class="font-headline-lg text-headline-lg text-on-surface">Rendimiento Operativo</h2>
<p class="font-body-md text-body-md text-on-surface-variant mt-xs">Resumen analítico de la jornada actual vs proyección.</p>
</div>
<div class="flex gap-sm">
<button class="border border-outline text-on-surface px-md py-sm rounded-lg font-label-md text-label-md flex items-center gap-xs hover:bg-surface-container transition-colors">
<span class="material-symbols-outlined text-[18px]">calendar_today</span>
                        Hoy
                    </button>
<button class="border border-outline text-on-surface px-md py-sm rounded-lg font-label-md text-label-md flex items-center gap-xs hover:bg-surface-container transition-colors">
<span class="material-symbols-outlined text-[18px]">download</span>
                        Exportar
                    </button>
</div>
</div>
<!-- 1. Metrics Overview (Bento Row 1) -->
<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-md">
<!-- Metric 1: Ventas Hoy -->
<div class="bg-surface-container-lowest border border-surface-container rounded-lg p-md flex flex-col justify-between hover:-translate-y-[2px] transition-transform duration-200">
<div class="flex justify-between items-start mb-md">
<span class="font-body-sm text-body-sm text-on-surface-variant uppercase tracking-wide">Ventas Hoy</span>
<div class="bg-[rgba(39,195,138,0.1)] text-on-tertiary-container px-sm py-xs rounded flex items-center gap-xs font-label-md text-label-md">
<span class="material-symbols-outlined text-[14px]">trending_up</span>
                            +12.5%
                        </div>
</div>
<div>
<span class="font-headline-lg text-headline-lg text-on-surface">$14,520.00</span>
<p class="font-body-sm text-body-sm text-on-surface-variant mt-xs">vs $12,900.00 ayer</p>
</div>
</div>
<!-- Metric 2: Ticket Promedio -->
<div class="bg-surface-container-lowest border border-surface-container rounded-lg p-md flex flex-col justify-between hover:-translate-y-[2px] transition-transform duration-200">
<div class="flex justify-between items-start mb-md">
<span class="font-body-sm text-body-sm text-on-surface-variant uppercase tracking-wide">Ticket Promedio</span>
<span class="material-symbols-outlined text-outline-variant">receipt_long</span>
</div>
<div>
<span class="font-headline-lg text-headline-lg text-on-surface">$42.50</span>
<p class="font-body-sm text-body-sm text-on-surface-variant mt-xs">Objetivo: $45.00</p>
</div>
</div>
<!-- Metric 3: Ocupación Actual -->
<div class="bg-surface-container-lowest border border-surface-container rounded-lg p-md flex flex-col justify-between hover:-translate-y-[2px] transition-transform duration-200">
<div class="flex justify-between items-start mb-md">
<span class="font-body-sm text-body-sm text-on-surface-variant uppercase tracking-wide">Ocupación Actual</span>
<div class="bg-[rgba(30,58,138,0.1)] text-primary-container px-sm py-xs rounded flex items-center gap-xs font-label-md text-label-md">
<span class="material-symbols-outlined text-[14px]">table_restaurant</span>
                            En Proceso
                        </div>
</div>
<div>
<div class="flex items-baseline gap-xs">
<span class="font-headline-lg text-headline-lg text-on-surface">82</span>
<span class="font-body-lg text-body-lg text-on-surface-variant">%</span>
</div>
<div class="w-full bg-surface-container-high rounded-full h-1.5 mt-sm overflow-hidden">
<div class="bg-primary-container h-1.5 rounded-full" style="width: 82%"></div>
</div>
</div>
</div>
<!-- Metric 4: Margen Beneficio -->
<div class="bg-surface-container-lowest border border-surface-container rounded-lg p-md flex flex-col justify-between hover:-translate-y-[2px] transition-transform duration-200">
<div class="flex justify-between items-start mb-md">
<span class="font-body-sm text-body-sm text-on-surface-variant uppercase tracking-wide">Margen Neto (Mes)</span>
<div class="bg-[rgba(186,26,26,0.1)] text-error px-sm py-xs rounded flex items-center gap-xs font-label-md text-label-md">
<span class="material-symbols-outlined text-[14px]">trending_down</span>
                            -1.2%
                        </div>
</div>
<div>
<div class="flex items-baseline gap-xs">
<span class="font-headline-lg text-headline-lg text-on-surface">24.5</span>
<span class="font-body-lg text-body-lg text-on-surface-variant">%</span>
</div>
<p class="font-body-sm text-body-sm text-on-surface-variant mt-xs">Afectado por costo proteína</p>
</div>
</div>
</div>
<!-- Middle Row (Bento) -->
<div class="grid grid-cols-1 lg:grid-cols-3 gap-md mt-md">
<!-- 2. Matriz BCG (Col-span 2) -->
<div class="lg:col-span-2 bg-surface-container-lowest border border-surface-container rounded-lg flex flex-col overflow-hidden">
<div class="bg-surface-container-low px-md py-sm border-b border-surface-container flex justify-between items-center">
<h3 class="font-headline-md text-headline-md text-on-surface text-[18px]">Matriz BCG de Menú</h3>
<span class="material-symbols-outlined text-outline-variant text-[20px]">info</span>
</div>
<div class="p-md flex-1 flex flex-col relative">
<!-- Y-axis Label -->
<div class="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 origin-center text-on-surface-variant font-label-md text-label-md tracking-wider">CRECIMIENTO DEMANDA</div>
<div class="pl-lg pb-lg h-full flex flex-col gap-xs relative">
<!-- Matrix Grid -->
<div class="grid grid-cols-2 grid-rows-2 h-full gap-xs relative">
<!-- Quadrant: Estrella -->
<div class="bg-[#f0f9ff] border border-[#bae6fd] rounded-lg p-sm relative flex flex-col">
<div class="flex justify-between items-start mb-sm">
<span class="font-label-md text-label-md text-[#0369a1] uppercase">Estrella</span>
<span class="material-symbols-outlined text-[#38bdf8]">star</span>
</div>
<ul class="text-body-sm font-body-sm text-[#0c4a6e] space-y-xs">
<li>• Salmón Glaseado</li>
<li>• Risotto de Hongos</li>
</ul>
</div>
<!-- Quadrant: Interrogante -->
<div class="bg-[#fefce8] border border-[#fef08a] rounded-lg p-sm relative flex flex-col">
<div class="flex justify-between items-start mb-sm">
<span class="font-label-md text-label-md text-[#a16207] uppercase">Interrogante</span>
<span class="material-symbols-outlined text-[#facc15]">help_outline</span>
</div>
<ul class="text-body-sm font-body-sm text-[#713f12] space-y-xs">
<li>• Ceviche Vegano</li>
<li>• Tarta de Higo</li>
</ul>
</div>
<!-- Quadrant: Vaca -->
<div class="bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg p-sm relative flex flex-col">
<div class="flex justify-between items-start mb-sm">
<span class="font-label-md text-label-md text-[#15803d] uppercase">Vaca Lechera</span>
<span class="material-symbols-outlined text-[#4ade80]">pets</span> <!-- closest to cow conceptually in default icons -->
</div>
<ul class="text-body-sm font-body-sm text-[#14532d] space-y-xs">
<li>• Hamburguesa Clásica</li>
<li>• Ensalada César</li>
<li>• Gaseosas</li>
</ul>
</div>
<!-- Quadrant: Perro -->
<div class="bg-[#fef2f2] border border-[#fecaca] rounded-lg p-sm relative flex flex-col">
<div class="flex justify-between items-start mb-sm">
<span class="font-label-md text-label-md text-[#b91c1c] uppercase">Perro</span>
<span class="material-symbols-outlined text-[#f87171]">close</span>
</div>
<ul class="text-body-sm font-body-sm text-[#7f1d1d] space-y-xs">
<li>• Sopa de Cebolla</li>
<li>• Carpaccio Zucchini</li>
</ul>
</div>
</div>
<!-- X-axis Label -->
<div class="absolute bottom-0 left-1/2 -translate-x-1/2 text-on-surface-variant font-label-md text-label-md tracking-wider">PARTICIPACIÓN RENTABILIDAD</div>
</div>
</div>
</div>
<!-- 4. Reporte de horas pico -->
<div class="bg-surface-container-lowest border border-surface-container rounded-lg flex flex-col overflow-hidden">
<div class="bg-surface-container-low px-md py-sm border-b border-surface-container flex justify-between items-center">
<h3 class="font-headline-md text-headline-md text-on-surface text-[18px]">Horas Pico (Hoy)</h3>
<span class="material-symbols-outlined text-outline-variant text-[20px]">schedule</span>
</div>
<div class="p-md flex-1 flex flex-col justify-center gap-md">
<!-- Bar Item -->
<div>
<div class="flex justify-between text-body-sm font-body-sm mb-xs">
<span class="text-on-surface font-semibold">13:00 - 15:00</span>
<span class="text-on-surface-variant">Alta (85%)</span>
</div>
<div class="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
<div class="bg-primary-container h-2 rounded-full" style="width: 85%"></div>
</div>
</div>
<!-- Bar Item -->
<div>
<div class="flex justify-between text-body-sm font-body-sm mb-xs">
<span class="text-on-surface font-semibold">16:00 - 18:00</span>
<span class="text-on-surface-variant">Baja (20%)</span>
</div>
<div class="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
<div class="bg-secondary-fixed-dim h-2 rounded-full" style="width: 20%"></div>
</div>
</div>
<!-- Bar Item -->
<div>
<div class="flex justify-between text-body-sm font-body-sm mb-xs">
<span class="text-on-surface font-semibold">19:00 - 21:00</span>
<span class="text-on-surface-variant">Crítica (98%)</span>
</div>
<div class="w-full bg-surface-container-high rounded-full h-2 overflow-hidden relative">
<!-- Pulsing effect for critical -->
<div class="absolute inset-0 bg-error opacity-20 animate-pulse"></div>
<div class="bg-error h-2 rounded-full relative z-10" style="width: 98%"></div>
</div>
</div>
<!-- Bar Item -->
<div>
<div class="flex justify-between text-body-sm font-body-sm mb-xs">
<span class="text-on-surface font-semibold">22:00 - 23:30</span>
<span class="text-on-surface-variant">Media (45%)</span>
</div>
<div class="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
<div class="bg-primary-fixed-dim h-2 rounded-full" style="width: 45%"></div>
</div>
</div>
</div>
</div>
</div>
<!-- Bottom Row: 3. Top 5 Platos Rentables (Table) -->
<div class="bg-surface-container-lowest border border-surface-container rounded-lg flex flex-col overflow-hidden mt-md mb-lg">
<div class="bg-surface-container-low px-md py-sm border-b border-surface-container flex justify-between items-center">
<h3 class="font-headline-md text-headline-md text-on-surface text-[18px]">Top 5 Platos más Rentables</h3>
<button class="text-primary text-body-sm font-label-md hover:underline">Ver Menú Completo</button>
</div>
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse">
<thead>
<tr class="border-b border-surface-container">
<th class="py-sm px-md font-label-md text-label-md text-on-surface-variant uppercase bg-surface-container-lowest">Plato</th>
<th class="py-sm px-md font-label-md text-label-md text-on-surface-variant uppercase bg-surface-container-lowest">Categoría</th>
<th class="py-sm px-md font-label-md text-label-md text-on-surface-variant uppercase bg-surface-container-lowest text-right">Costo Prod.</th>
<th class="py-sm px-md font-label-md text-label-md text-on-surface-variant uppercase bg-surface-container-lowest text-right">Precio Venta</th>
<th class="py-sm px-md font-label-md text-label-md text-on-surface-variant uppercase bg-surface-container-lowest text-right">Margen Neto</th>
</tr>
</thead>
<tbody class="font-body-sm text-body-sm text-on-surface divide-y divide-surface-container">
<tr class="hover:bg-surface-container-low transition-colors group">
<td class="py-sm px-md font-medium">Salmón Glaseado</td>
<td class="py-sm px-md text-on-surface-variant">Plato Fuerte</td>
<td class="py-sm px-md text-right font-data-mono text-data-mono">$8.50</td>
<td class="py-sm px-md text-right font-data-mono text-data-mono">$28.00</td>
<td class="py-sm px-md text-right text-on-tertiary-container font-semibold font-data-mono text-data-mono">
                                    70% ($19.50)
                                </td>
</tr>
<tr class="hover:bg-surface-container-low transition-colors group bg-surface-container-lowest">
<td class="py-sm px-md font-medium">Risotto de Hongos</td>
<td class="py-sm px-md text-on-surface-variant">Plato Fuerte</td>
<td class="py-sm px-md text-right font-data-mono text-data-mono">$4.20</td>
<td class="py-sm px-md text-right font-data-mono text-data-mono">$22.00</td>
<td class="py-sm px-md text-right text-on-tertiary-container font-semibold font-data-mono text-data-mono">
                                    81% ($17.80)
                                </td>
</tr>
<tr class="hover:bg-surface-container-low transition-colors group">
<td class="py-sm px-md font-medium">Copa de Malbec (Casa)</td>
<td class="py-sm px-md text-on-surface-variant">Bebidas</td>
<td class="py-sm px-md text-right font-data-mono text-data-mono">$1.50</td>
<td class="py-sm px-md text-right font-data-mono text-data-mono">$9.00</td>
<td class="py-sm px-md text-right text-on-tertiary-container font-semibold font-data-mono text-data-mono">
                                    83% ($7.50)
                                </td>
</tr>
<tr class="hover:bg-surface-container-low transition-colors group bg-surface-container-lowest">
<td class="py-sm px-md font-medium">Volcán de Chocolate</td>
<td class="py-sm px-md text-on-surface-variant">Postres</td>
<td class="py-sm px-md text-right font-data-mono text-data-mono">$2.10</td>
<td class="py-sm px-md text-right font-data-mono text-data-mono">$11.00</td>
<td class="py-sm px-md text-right text-on-tertiary-container font-semibold font-data-mono text-data-mono">
                                    81% ($8.90)
                                </td>
</tr>
<tr class="hover:bg-surface-container-low transition-colors group">
<td class="py-sm px-md font-medium">Limonada Menta Jengibre</td>
<td class="py-sm px-md text-on-surface-variant">Bebidas</td>
<td class="py-sm px-md text-right font-data-mono text-data-mono">$0.80</td>
<td class="py-sm px-md text-right font-data-mono text-data-mono">$5.50</td>
<td class="py-sm px-md text-right text-on-tertiary-container font-semibold font-data-mono text-data-mono">
                                    85% ($4.70)
                                </td>
</tr>
</tbody>
</table>
</div>
</div>
</main>
</div>
<script>
(function(){
  var cardGrid = document.querySelector('.md\\:grid-cols-2.xl\\:grid-cols-4');
  if (cardGrid) {
    var kids = cardGrid.children;
    // Card 0: Ventas Hoy
    kids[0].querySelector('.font-headline-lg').textContent = metricCards[0].value;
    var b0 = kids[0].querySelector('.flex.justify-between .flex.items-center');
    if (b0) {
      b0.querySelector('.material-symbols-outlined').textContent = metricCards[0].trend;
      for (var j=0;j<b0.childNodes.length;j++) if (b0.childNodes[j].nodeType===3) { b0.childNodes[j].textContent=' '+metricCards[0].change; break; }
    }
    var subs = kids[0].querySelectorAll('.font-body-sm.text-on-surface-variant');
    if (subs.length) subs[subs.length-1].textContent = metricCards[0].subtitle;
    // Card 1: Ticket Promedio
    kids[1].querySelector('.font-headline-lg').textContent = metricCards[1].value;
    var subs1 = kids[1].querySelectorAll('.font-body-sm.text-on-surface-variant');
    if (subs1.length) subs1[subs1.length-1].textContent = metricCards[1].subtitle;
    // Card 2: Ocupaci&oacute;n Actual
    kids[2].querySelector('.font-headline-lg').textContent = metricCards[2].value;
    var pb = kids[2].querySelector('.bg-primary-container.h-1\\.5');
    if (pb) pb.style.width = metricCards[2].change;
    // Card 3: Margen Neto
    kids[3].querySelector('.font-headline-lg').textContent = metricCards[3].value;
    var b3 = kids[3].querySelector('.flex.justify-between .flex.items-center');
    if (b3) {
      b3.querySelector('.material-symbols-outlined').textContent = metricCards[3].trend;
      for (var j=0;j<b3.childNodes.length;j++) if (b3.childNodes[j].nodeType===3) { b3.childNodes[j].textContent=' '+metricCards[3].change; break; }
    }
    var subs3 = kids[3].querySelectorAll('.font-body-sm.text-on-surface-variant');
    if (subs3.length) subs3[subs3.length-1].textContent = metricCards[3].subtitle;
  }
  // BCG Quadrants
  var quadUl = document.querySelector('.grid.grid-cols-2.grid-rows-2.h-full');
  if (quadUl) {
    var uls = quadUl.querySelectorAll('ul');
    var quadItems = [bcgQuadrants.estrella.items, bcgQuadrants.interrogante.items, bcgQuadrants.vaca.items, bcgQuadrants.perro.items];
    for (var i=0; i<uls.length; i++) {
      var lis = uls[i].querySelectorAll('li');
      for (var j=0; j<lis.length; j++) {
        lis[j].textContent = '\u2022 ' + quadItems[i][j];
      }
    }
  }
  // Peak Hours
  var phSection = document.querySelector('.lg\\:grid-cols-3 > .bg-surface-container-lowest:last-child');
  if (phSection) {
    var phBars = phSection.querySelectorAll('.p-md > div');
    for (var i=0; i<peakHours.length; i++) {
      var jd = phBars[i].querySelector('.flex.justify-between');
      if (jd) {
        var sp = jd.querySelectorAll('span');
        if (sp[0]) sp[0].textContent = peakHours[i].time;
        if (sp[1]) sp[1].textContent = peakHours[i].label;
      }
      var bc = phBars[i].querySelector('.bg-surface-container-high');
      if (bc) {
        var bar = bc.lastElementChild;
        if (bar) {
          bar.style.width = peakHours[i].width + '%';
          var cls = 'h-2 rounded-full ' + peakHours[i].cls;
          if (bar.className.indexOf('absolute') > -1) cls = 'absolute inset-0 bg-error opacity-20 animate-pulse';
          else bar.className = cls;
        }
      }
    }
  }
  // Top 5 Dishes
  var dRows = document.querySelectorAll('table tbody tr');
  for (var i=0; i<topDishes.length; i++) {
    var c = dRows[i].querySelectorAll('td');
    if (c.length >= 5) {
      c[0].textContent = topDishes[i].name;
      c[1].textContent = topDishes[i].cat;
      c[2].textContent = topDishes[i].cost;
      c[3].textContent = topDishes[i].price;
      c[4].textContent = topDishes[i].margin;
    }
  }
})();
