
  var steps = [
    { label: "Business Profile", icon: "storefront", active: true },
    { label: "Service Area", icon: "grid_view", active: false },
    { label: "Modules", icon: "extension", active: false },
    { label: "Final Review", icon: "verified", active: false }
  ];
  var currentStep = 1;
  var totalSteps = 4;
</script>
</head>
<body class="bg-background text-on-background font-body-md min-h-screen">
<!-- TopNavBar: Suppressed because this is a linear onboarding process -->
<header class="bg-surface-container-lowest border-b border-outline-variant fixed top-0 left-0 w-full z-50 flex justify-between items-center px-lg h-16">
<div class="font-headline-md text-headline-md font-bold text-primary">RestoFlow B2B</div>
<div class="flex gap-4">
<span class="material-symbols-outlined text-primary cursor-pointer hover:bg-surface-container-low transition-colors rounded-full p-2" data-icon="help">help</span>
</div>
</header>
<div class="flex pt-16 h-screen">
<!-- SideNavBar: Suppressed for mobile, shown on desktop -->
<nav class="hidden md:flex bg-surface-container-low fixed left-0 top-16 bottom-0 w-64 flex-col py-md border-r border-outline-variant">
<div class="px-md mb-lg">
<h2 class="font-headline-md text-headline-md font-bold text-primary">Onboarding</h2>
<p class="font-body-sm text-body-sm text-secondary mt-1">Setup Progress</p>
</div>
<ul class="flex-1 overflow-y-auto">
<li>
<a class="flex items-center px-md py-3 text-primary bg-surface-container-high font-label-md text-label-md font-bold border-r-4 border-primary hover:bg-surface-container-high transition-all duration-200 ease-in-out group" href="#">
<span class="material-symbols-outlined mr-3" data-icon="storefront">storefront</span>
                        Business Profile
                    </a>
</li>
<li>
<a class="flex items-center px-md py-3 text-secondary font-label-md text-label-md hover:bg-surface-container-high transition-all duration-200 ease-in-out group" href="#">
<span class="material-symbols-outlined mr-3" data-icon="grid_view">grid_view</span>
                        Service Area
                    </a>
</li>
<li>
<a class="flex items-center px-md py-3 text-secondary font-label-md text-label-md hover:bg-surface-container-high transition-all duration-200 ease-in-out group" href="#">
<span class="material-symbols-outlined mr-3" data-icon="extension">extension</span>
                        Modules
                    </a>
</li>
<li>
<a class="flex items-center px-md py-3 text-secondary font-label-md text-label-md hover:bg-surface-container-high transition-all duration-200 ease-in-out group" href="#">
<span class="material-symbols-outlined mr-3" data-icon="verified">verified</span>
                        Final Review
                    </a>
</li>
</ul>
</nav>
<!-- Main Content Area -->
<main class="flex-1 md:ml-64 p-lg overflow-y-auto bg-surface flex justify-center">
<!-- Fixed-width centered container for administrative settings -->
<div class="w-full max-w-3xl">
<!-- Progress Indicator -->
<div class="mb-xl">
<div class="flex justify-between items-center mb-2">
<span class="font-label-md text-label-md text-secondary" id="step-label"></span>
<span class="font-label-md text-label-md text-primary" id="step-name"></span>
</div>
<div class="w-full bg-surface-container-highest rounded-full h-2">
<div class="bg-primary h-2 rounded-full w-1/4 transition-all duration-500 ease-out" id="progress-bar"></div>
</div>
</div>
<!-- Main Form Card -->
<div class="bg-surface-container-lowest border border-surface-container-high rounded-lg overflow-hidden">
<div class="bg-surface-container-lowest px-lg py-md border-b border-surface-container-high">
<h1 class="font-headline-lg text-headline-lg text-on-surface">Establish Your Brand</h1>
<p class="font-body-md text-body-md text-secondary mt-2">Enter the core details of your restaurant operation. This information will be used across your RestoFlow instance.</p>
</div>
<form class="p-lg flex flex-col gap-lg">
<!-- Logo Upload (Bento Style) -->
<div class="col-span-full">
<label class="block font-label-md text-label-md text-on-surface mb-sm">Brand Logo</label>
<div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-outline-variant border-dashed rounded-lg hover:bg-surface-container-lowest transition-colors cursor-pointer group">
<div class="space-y-1 text-center">
<span class="material-symbols-outlined text-4xl text-outline group-hover:text-primary transition-colors" data-icon="cloud_upload">cloud_upload</span>
<div class="flex text-sm text-secondary justify-center">
<span class="relative cursor-pointer bg-surface-container-lowest rounded-md font-body-sm text-body-sm text-primary hover:text-primary-container focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
<span>Upload a file</span>
</span>
<p class="pl-1 font-body-sm text-body-sm">or drag and drop</p>
</div>
<p class="font-label-md text-label-md text-secondary">PNG, JPG, GIF up to 10MB</p>
</div>
</div>
</div>
<!-- Grid Layout for Inputs -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-md">
<!-- Restaurant Name -->
<div class="col-span-1 md:col-span-2">
<label class="block font-label-md text-label-md text-on-surface mb-sm" for="restaurant-name">Legal Business Name or DBA</label>
<input class="w-full bg-surface-container-lowest border border-outline-variant rounded px-sm py-2 text-on-surface font-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" id="restaurant-name" placeholder="e.g., Grand Central Brasserie" type="text"/>
</div>
<!-- Cuisine Type -->
<div>
<label class="block font-label-md text-label-md text-on-surface mb-sm" for="cuisine-type">Primary Cuisine Type</label>
<div class="relative">
<select class="w-full bg-surface-container-lowest border border-outline-variant rounded px-sm py-2 text-on-surface font-body-md appearance-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" id="cuisine-type">
<option disabled="" selected="" value="">Select Cuisine</option>
<option value="italian">Italian</option>
<option value="french">French</option>
<option value="american">American</option>
<option value="japanese">Japanese</option>
<option value="mexican">Mexican</option>
<option value="other">Other</option>
</select>
<div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-secondary">
<span class="material-symbols-outlined text-sm" data-icon="expand_more">expand_more</span>
</div>
</div>
</div>
<!-- Number of Locations -->
<div>
<label class="block font-label-md text-label-md text-on-surface mb-sm" for="locations">Number of Locations</label>
<input class="w-full bg-surface-container-lowest border border-outline-variant rounded px-sm py-2 text-on-surface font-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" id="locations" min="1" placeholder="1" type="number"/>
</div>
</div>
<!-- Actions -->
<div class="mt-lg pt-lg border-t border-surface-container-high flex justify-end gap-md">
<button class="px-lg py-2 border border-secondary text-secondary font-label-md text-label-md rounded hover:bg-surface-container-low transition-colors" type="button">
                                Save Draft
                            </button>
<button class="px-lg py-2 bg-primary-container text-on-primary rounded font-label-md text-label-md hover:bg-on-primary-fixed transition-colors flex items-center gap-sm" type="button">
                                Continue
                                <span class="material-symbols-outlined text-sm" data-icon="arrow_forward">arrow_forward</span>
</button>
</div>
</form>
</div>
<!-- Informational Note -->
<p class="mt-md text-center font-body-sm text-body-sm text-secondary">
                    Need help? Contact <a class="text-primary hover:underline" href="#">Support</a> or review our <a class="text-primary hover:underline" href="#">Setup Guide</a>.
                </p>
</div>
</main>
</div>
<script>
  document.getElementById('step-label').textContent = 'Step ' + currentStep + ' of ' + totalSteps;
  document.getElementById('step-name').textContent = steps[currentStep - 1].label;
