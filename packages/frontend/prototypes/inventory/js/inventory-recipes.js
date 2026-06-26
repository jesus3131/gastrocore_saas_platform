(function() {
  var INGREDIENTS_KEY = 'inv_ingredients';
  var RECIPES_KEY = 'inv_recipes';
  var SELECTED_RECIPE_KEY = 'inv_selected_recipe';

  var CATEGORIES = ['Proteínas', 'Panadería', 'Lácteos', 'Vegetales', 'Salsas', 'Bebidas', 'Especias', 'Congelados'];

  var DEFAULT_INGREDIENTS = [
    { id: 'ing_1', name: 'Carne de Res (Angus)', sku: 'CAR-001', category: 'Proteínas', unit: 'kg', currentStock: 45.5, minimumStock: 10, unitCost: 12.50, supplier: 'Carnes Premium SA' },
    { id: 'ing_2', name: 'Pan Brioche Artesanal', sku: 'PAN-042', category: 'Panadería', unit: 'uds', currentStock: 12, minimumStock: 20, unitCost: 0.80, supplier: 'Panadería Artesanal' },
    { id: 'ing_3', name: 'Queso Cheddar Curado', sku: 'LAC-015', category: 'Lácteos', unit: 'kg', currentStock: 8.2, minimumStock: 10, unitCost: 18.00, supplier: 'Lácteos del Valle' },
    { id: 'ing_4', name: 'Tomate Bola Hidropónico', sku: 'VEG-008', category: 'Vegetales', unit: 'kg', currentStock: 15.0, minimumStock: 5, unitCost: 2.20, supplier: 'HidroVerde' },
    { id: 'ing_5', name: 'Lechuga Romana', sku: 'VEG-012', category: 'Vegetales', unit: 'kg', currentStock: 8.0, minimumStock: 3, unitCost: 1.50, supplier: 'HidroVerde' },
    { id: 'ing_6', name: 'Cebolla Morada', sku: 'VEG-015', category: 'Vegetales', unit: 'kg', currentStock: 12.5, minimumStock: 5, unitCost: 1.20, supplier: 'Campo Fresco' },
    { id: 'ing_7', name: 'Salsa Secreta', sku: 'SAL-001', category: 'Salsas', unit: 'l', currentStock: 3.0, minimumStock: 2, unitCost: 5.00, supplier: "Chef's Choice" },
    { id: 'ing_8', name: 'Papa Russet', sku: 'VEG-020', category: 'Vegetales', unit: 'kg', currentStock: 25.0, minimumStock: 10, unitCost: 1.80, supplier: 'Campo Fresco' },
    { id: 'ing_9', name: 'Aceite de Oliva Extra', sku: 'SAL-002', category: 'Salsas', unit: 'l', currentStock: 5.0, minimumStock: 2, unitCost: 12.00, supplier: 'Olivares del Sur' },
    { id: 'ing_10', name: 'Harina de Trigo', sku: 'PAN-050', category: 'Panadería', unit: 'kg', currentStock: 20.0, minimumStock: 10, unitCost: 1.50, supplier: 'Molinos Unidos' },
    { id: 'ing_11', name: 'Mantequilla sin Sal', sku: 'LAC-020', category: 'Lácteos', unit: 'kg', currentStock: 4.0, minimumStock: 3, unitCost: 8.50, supplier: 'Lácteos del Valle' },
    { id: 'ing_12', name: 'Pechuga de Pollo', sku: 'CAR-005', category: 'Proteínas', unit: 'kg', currentStock: 18.0, minimumStock: 8, unitCost: 9.80, supplier: 'Carnes Premium SA' },
    { id: 'ing_13', name: 'Sal de Mar', sku: 'ESP-001', category: 'Especias', unit: 'kg', currentStock: 2.0, minimumStock: 0.5, unitCost: 3.00, supplier: 'Especias Finas' },
    { id: 'ing_14', name: 'Pimienta Negra Molida', sku: 'ESP-002', category: 'Especias', unit: 'kg', currentStock: 1.5, minimumStock: 0.5, unitCost: 4.50, supplier: 'Especias Finas' },
    { id: 'ing_15', name: 'Queso Mozzarella', sku: 'LAC-025', category: 'Lácteos', unit: 'kg', currentStock: 6.0, minimumStock: 5, unitCost: 14.00, supplier: 'Lácteos del Valle' },
    { id: 'ing_16', name: 'Base de Pizza', sku: 'PAN-055', category: 'Panadería', unit: 'uds', currentStock: 30, minimumStock: 15, unitCost: 1.20, supplier: 'Panadería Artesanal' }
  ];

  var DEFAULT_RECIPES = [
    { id: 'rec_1', name: 'Hamburguesa Gourmet', menuItem: 'Hamburguesa Gourmet', servings: 1, category: 'Principales', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJJxnXXsXJuW-kRXtxkTQTmwCa3emt7ZVVP5vbjPjDYWETmXKrPs78z6R7a2DqKxmS3VblTCuxWPe7IvsQpMXmThBsGs0YIvkkp2--jdwTrwgyLDmktstu3ElbmfGFmoq68X1wkABJW1-WkyYpTdM5obRB8DQ_Tt2pDd8Sg628G27kOjRFur01KtUtziWXj0hQi9cJtDwb6-UCXbZ0DPpglH-hTry5ye2fuGLQqSGNNiZOoifDEbnLODaFyHWVysTzUt4Gp5z-Vfpt', menuStatus: 'Activo en Menú', ingredients: [{ ingredientId: 'ing_1', quantity: 0.2 }, { ingredientId: 'ing_2', quantity: 1 }, { ingredientId: 'ing_3', quantity: 0.04 }, { ingredientId: 'ing_4', quantity: 0.05 }, { ingredientId: 'ing_5', quantity: 0.03 }, { ingredientId: 'ing_6', quantity: 0.02 }, { ingredientId: 'ing_7', quantity: 0.02 }] },
    { id: 'rec_2', name: 'Pizza Margherita', menuItem: 'Pizza Margherita', servings: 1, category: 'Principales', image: '', menuStatus: 'Activo en Menú', ingredients: [{ ingredientId: 'ing_15', quantity: 0.15 }, { ingredientId: 'ing_16', quantity: 1 }, { ingredientId: 'ing_4', quantity: 0.08 }, { ingredientId: 'ing_9', quantity: 0.01 }] },
    { id: 'rec_3', name: 'Papas Fritas con Trufa', menuItem: 'Papas Fritas Trufadas', servings: 1, category: 'Entradas', image: '', menuStatus: 'Activo en Menú', ingredients: [{ ingredientId: 'ing_8', quantity: 0.3 }, { ingredientId: 'ing_9', quantity: 0.005 }, { ingredientId: 'ing_13', quantity: 0.002 }] },
    { id: 'rec_4', name: 'Pollo a la Plancha', menuItem: 'Pollo Plancha', servings: 1, category: 'Principales', image: '', menuStatus: 'Activo en Menú', ingredients: [{ ingredientId: 'ing_12', quantity: 0.25 }, { ingredientId: 'ing_9', quantity: 0.01 }, { ingredientId: 'ing_13', quantity: 0.002 }, { ingredientId: 'ing_14', quantity: 0.001 }] },
    { id: 'rec_5', name: 'Ensalada César', menuItem: 'Ensalada César', servings: 1, category: 'Entradas', image: '', menuStatus: 'Activo en Menú', ingredients: [{ ingredientId: 'ing_5', quantity: 0.1 }, { ingredientId: 'ing_12', quantity: 0.08 }, { ingredientId: 'ing_15', quantity: 0.02 }, { ingredientId: 'ing_7', quantity: 0.015 }] },
    { id: 'rec_6', name: 'Tostadas de Aguacate', menuItem: 'Tostadas Aguacate', servings: 1, category: 'Desayunos', image: '', menuStatus: 'Inactivo', ingredients: [{ ingredientId: 'ing_10', quantity: 0.1 }, { ingredientId: 'ing_9', quantity: 0.005 }, { ingredientId: 'ing_13', quantity: 0.001 }] }
  ];

  function seed() {
    if (!Utils.storage.get(INGREDIENTS_KEY)) Utils.storage.set(INGREDIENTS_KEY, DEFAULT_INGREDIENTS);
    if (!Utils.storage.get(RECIPES_KEY)) Utils.storage.set(RECIPES_KEY, DEFAULT_RECIPES);
  }

  function getIngredients() { return Utils.storage.get(INGREDIENTS_KEY, []); }
  function saveIngredients(d) { Utils.storage.set(INGREDIENTS_KEY, d); }
  function getRecipes() { return Utils.storage.get(RECIPES_KEY, []); }
  function saveRecipes(d) { Utils.storage.set(RECIPES_KEY, d); }
  function getSelectedId() { return Utils.storage.get(SELECTED_RECIPE_KEY); }
  function setSelectedId(id) { Utils.storage.set(SELECTED_RECIPE_KEY, id); }

  function findIngredient(id) {
    var ings = getIngredients();
    for (var i = 0; i < ings.length; i++) { if (ings[i].id === id) return ings[i]; }
    return null;
  }

  var SEARCH_TERM = '';

  function computeRecipeCost(recipe) {
    var ings = getIngredients();
    var total = 0;
    recipe.ingredients.forEach(function(ri) {
      for (var i = 0; i < ings.length; i++) {
        if (ings[i].id === ri.ingredientId) { total += ri.quantity * ings[i].unitCost; break; }
      }
    });
    return Math.round(total * 100) / 100;
  }

  function computeMetrics() {
    var ings = getIngredients();
    var lowStock = ings.filter(function(i) { return i.currentStock < i.minimumStock; });
    var totalValue = ings.reduce(function(sum, i) { return sum + i.currentStock * i.unitCost; }, 0);
    return { total: ings.length, lowStock: lowStock.length, totalValue: Math.round(totalValue * 100) / 100 };
  }

  function renderIngredientTable() {
    var tbody = document.querySelector('.overflow-x-auto table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    var ings = getIngredients();
    var term = SEARCH_TERM.toLowerCase();
    var filtered = term ? ings.filter(function(i) { return i.name.toLowerCase().indexOf(term) >= 0 || i.category.toLowerCase().indexOf(term) >= 0 || i.sku.toLowerCase().indexOf(term) >= 0; }) : ings;

    var statusMap = {
      optimal: { label: 'Óptimo', classes: 'bg-green-100 text-green-800' },
      critical: { label: 'Crítico', classes: 'bg-red-100 text-red-700', icon: '<span class="material-symbols-outlined text-[14px]">warning</span> ' },
      reorder: { label: 'Por Pedir', classes: 'bg-blue-100 text-blue-800' }
    };

    filtered.forEach(function(item) {
      var isLow = item.currentStock < item.minimumStock;
      var s = isLow ? (item.currentStock === 0 ? statusMap.critical : (item.currentStock < item.minimumStock * 0.5 ? statusMap.critical : statusMap.reorder)) : statusMap.optimal;
      var tr = document.createElement('tr');
      tr.className = 'hover:bg-surface-container transition-colors group cursor-pointer' + (isLow ? ' bg-red-50' : '');
      tr.setAttribute('data-ingredient-id', item.id);
      var stockHtml = isLow
        ? '<span class="font-data-mono text-data-mono font-bold text-red-600">' + item.currentStock + ' <span class="text-on-surface-variant">' + item.unit + '</span></span>'
        : '<span class="font-data-mono text-data-mono">' + item.currentStock + ' <span class="text-on-surface-variant">' + item.unit + '</span></span>';
      tr.innerHTML = '<td class="p-md"><div class="font-medium text-on-surface">' + item.name + '</div><div class="text-on-surface-variant text-[11px] mt-0.5">SKU: ' + item.sku + '</div></td><td class="p-md text-on-surface-variant">' + item.category + '</td><td class="p-md text-right">' + stockHtml + '</td><td class="p-md text-right font-data-mono text-data-mono">' + Utils.formatCurrency(item.unitCost) + '</td><td class="p-md text-center"><span class="inline-flex items-center ' + (s.icon ? 'gap-1 ' : '') + 'px-2 py-1 rounded-full ' + s.classes + ' font-label-md text-[11px]">' + (s.icon || '') + s.label + '</span></td>';
      tbody.appendChild(tr);

      tr.addEventListener('click', function() {
        var id = this.dataset.ingredientId;
        var ings = getIngredients();
        var item = null;
        for (var i = 0; i < ings.length; i++) { if (ings[i].id === id) { item = ings[i]; break; } }
        if (!item) return;
        Utils.prompt({
          title: 'Edit Ingredient: ' + item.name,
          fields: [
            { name: 'name', label: 'Name', type: 'text' },
            { name: 'sku', label: 'SKU', type: 'text' },
            { name: 'category', label: 'Category', type: 'select', options: CATEGORIES.map(function(c) { return { value: c, label: c }; }) },
            { name: 'unit', label: 'Unit', type: 'text' },
            { name: 'currentStock', label: 'Current Stock', type: 'number' },
            { name: 'minimumStock', label: 'Minimum Stock', type: 'number' },
            { name: 'unitCost', label: 'Unit Cost', type: 'number' },
            { name: 'supplier', label: 'Supplier', type: 'text' }
          ],
          data: { name: item.name, sku: item.sku, category: item.category, unit: item.unit, currentStock: item.currentStock, minimumStock: item.minimumStock, unitCost: item.unitCost, supplier: item.supplier },
          onSave: function(vals) {
            for (var i = 0; i < ings.length; i++) {
              if (ings[i].id === id) {
                ings[i].name = vals.name;
                ings[i].sku = vals.sku;
                ings[i].category = vals.category;
                ings[i].unit = vals.unit;
                ings[i].currentStock = parseFloat(vals.currentStock) || 0;
                ings[i].minimumStock = parseFloat(vals.minimumStock) || 0;
                ings[i].unitCost = parseFloat(vals.unitCost) || 0;
                ings[i].supplier = vals.supplier;
                break;
              }
            }
            saveIngredients(ings);
            renderIngredientTable();
            renderMetrics();
            var sel = getSelectedId();
            if (sel) renderRecipeDetail(sel);
            Utils.notify('Ingredient updated');
          }
        });
      });
    });

    // Add delete button per row; also add action column if not present
    var headerRow = document.querySelector('.overflow-x-auto table thead tr');
    if (headerRow && headerRow.children.length < 6) {
      var th = document.createElement('th');
      th.className = 'p-md font-label-md text-label-md text-on-surface-variant font-semibold text-center';
      th.textContent = 'Actions';
      headerRow.appendChild(th);
    }

    // Add actions cells
    var rows = tbody.querySelectorAll('tr[data-ingredient-id]');
    rows.forEach(function(row) {
      if (row.children.length < 6) {
        var td = document.createElement('td');
        td.className = 'p-md text-center';
        td.innerHTML = '<button class="ing-delete text-red-400 hover:text-red-600 text-[18px]" data-id="' + row.dataset.ingredientId + '">&times;</button>';
        row.appendChild(td);
        td.querySelector('.ing-delete').addEventListener('click', function(e) {
          e.stopPropagation();
          var id = this.dataset.id;
          Utils.confirm('Are you sure you want to delete this ingredient?', function() {
            var ings = getIngredients().filter(function(i) { return i.id !== id; });
            saveIngredients(ings);
            renderIngredientTable();
            renderMetrics();
            Utils.notify('Ingredient deleted');
          });
        });
      }
    });
  }

  function renderMetrics() {
    var metrics = computeMetrics();
    var spans = document.querySelectorAll('.font-data-mono');
    // Find the summary box
    var summaryBox = document.querySelector('.bg-surface-container-low\\.rounded-lg');
    if (summaryBox) {
      var dataSpans = summaryBox.querySelectorAll('.font-data-mono');
      if (dataSpans[0]) dataSpans[0].textContent = Utils.formatCurrency(metrics.totalValue);
      // Add metric display near top if area exists
    }
    // Add metric bar if not present
    var sectionHeader = document.querySelector('.xl\\:col-span-8 .flex.flex-col.sm\\:flex-row');
    if (sectionHeader) {
      var existing = document.getElementById('inventory-metrics-bar');
      if (!existing) {
        var bar = document.createElement('div');
        bar.id = 'inventory-metrics-bar';
        bar.className = 'flex gap-4 mt-2 text-sm text-on-surface-variant';
        bar.innerHTML = '<span>🧾 Total Ingredients: <strong>' + metrics.total + '</strong></span><span>⚠️ Low Stock: <strong class="text-red-600">' + metrics.lowStock + '</strong></span><span>💰 Inventory Value: <strong>' + Utils.formatCurrency(metrics.totalValue) + '</strong></span>';
        sectionHeader.parentNode.insertBefore(bar, sectionHeader.nextSibling);
      } else {
        existing.innerHTML = '<span>🧾 Total Ingredients: <strong>' + metrics.total + '</strong></span><span>⚠️ Low Stock: <strong class="text-red-600">' + metrics.lowStock + '</strong></span><span>💰 Inventory Value: <strong>' + Utils.formatCurrency(metrics.totalValue) + '</strong></span>';
      }
    }
  }

  function renderRecipeDetail(recipeId) {
    var recipes = getRecipes();
    var recipe = null;
    for (var i = 0; i < recipes.length; i++) { if (recipes[i].id === recipeId) { recipe = recipes[i]; break; } }
    if (!recipe) { recipe = recipes[0]; if (!recipe) return; recipeId = recipe.id; }
    setSelectedId(recipeId);

    var cost = computeRecipeCost(recipe);
    var suggestedPrice = Math.round(cost * 3.5 * 100) / 100;

    // Image
    var imgDiv = document.querySelector('.bg-cover.bg-center');
    if (imgDiv) {
      if (recipe.image) { imgDiv.style.backgroundImage = "url('" + recipe.image + "')"; }
      else { imgDiv.style.backgroundImage = "url('https://placehold.co/400x400/eee/999?text=" + encodeURIComponent(recipe.name) + "')"; }
    }

    // Name
    var h5 = document.querySelector('.xl\\:col-span-4 h5');
    if (h5) h5.textContent = recipe.name;

    // Category
    var catP = document.querySelector('.xl\\:col-span-4 .font-body-sm.text-body-sm.text-on-surface-variant.mt-xs');
    if (catP) catP.textContent = 'Categoría: ' + (recipe.category || '');

    // Status
    var statusSpan = document.querySelector('.xl\\:col-span-4 .px-2.py-0\\.5.rounded');
    if (statusSpan) statusSpan.textContent = recipe.menuStatus || '';

    // Ingredients list
    var ingContainer = document.querySelector('.space-y-sm.flex-1');
    if (ingContainer) {
      ingContainer.innerHTML = '';
      recipe.ingredients.forEach(function(ri) {
        var ing = findIngredient(ri.ingredientId);
        var ingName = ing ? ing.name : '(Unknown)';
        var ingUnit = ing ? ing.unit : '';
        var ingCost = ing ? Math.round(ri.quantity * ing.unitCost * 100) / 100 : 0;
        var div = document.createElement('div');
        div.className = 'flex justify-between items-center py-xs border-b border-surface-container border-dashed';
        div.innerHTML = '<div class="flex flex-col"><span class="font-body-sm text-body-sm font-medium">' + ingName + '</span><span class="font-label-md text-[11px] text-on-surface-variant">' + ri.quantity + ' ' + ingUnit + '</span></div><span class="font-data-mono text-data-mono font-medium">' + Utils.formatCurrency(ingCost) + '</span>';
        ingContainer.appendChild(div);
      });
    }

    // Financial summary
    var summaryBox = document.querySelector('.bg-surface-container-low\\.rounded-lg');
    if (summaryBox) {
      var dataSpans = summaryBox.querySelectorAll('.font-data-mono');
      if (dataSpans[0]) dataSpans[0].textContent = Utils.formatCurrency(cost);
      if (dataSpans[1]) dataSpans[1].textContent = '30%';
      if (dataSpans[2]) dataSpans[2].textContent = Utils.formatCurrency(suggestedPrice);
      if (dataSpans[3]) dataSpans[3].textContent = Utils.formatCurrency(suggestedPrice * 0.9);

      var alertP = summaryBox.querySelector('.font-label-md.text-\\[11px\\].text-error');
      if (alertP) {
        var marginDiff = suggestedPrice - suggestedPrice * 0.9;
        alertP.textContent = 'Precio sugerido: ' + Utils.formatCurrency(suggestedPrice) + ' (costo × 3.5). Ajuste recomendado: ' + Utils.formatCurrency(marginDiff) + '.';
      }
    }

    // Recipe action buttons
    var rightPanel = document.querySelector('.xl\\:col-span-4');
    if (rightPanel) {
      var existingActions = document.getElementById('recipe-actions');
      if (!existingActions) {
        var actionsDiv = document.createElement('div');
        actionsDiv.id = 'recipe-actions';
        actionsDiv.className = 'flex gap-2 mt-4';
        actionsDiv.innerHTML = '<button id="btn-edit-recipe" class="flex-1 bg-primary-container text-on-primary py-2 rounded-lg text-label-md font-label-md hover:opacity-90">Edit Recipe</button><button id="btn-delete-recipe" class="flex-1 bg-red-50 text-red-600 border border-red-200 py-2 rounded-lg text-label-md font-label-md hover:bg-red-100">Delete</button><button id="btn-add-recipe" class="flex-1 bg-blue-600 text-white py-2 rounded-lg text-label-md font-label-md hover:bg-blue-700">+ New Recipe</button>';
        var detailSection = rightPanel.querySelector('.bg-surface-container-lowest');
        if (detailSection) detailSection.appendChild(actionsDiv);
      }
    }

    document.getElementById('btn-edit-recipe') && document.getElementById('btn-edit-recipe').addEventListener('click', function() { editRecipe(recipeId); });
    document.getElementById('btn-delete-recipe') && document.getElementById('btn-delete-recipe').addEventListener('click', function() {
      Utils.confirm('Delete recipe "' + recipe.name + '"?', function() {
        var recipes = getRecipes().filter(function(r) { return r.id !== recipeId; });
        saveRecipes(recipes);
        setSelectedId(null);
        renderRecipeDetail(recipes.length ? recipes[0].id : null);
        renderRecipeSelector();
        Utils.notify('Recipe deleted');
      });
    });
    document.getElementById('btn-add-recipe') && document.getElementById('btn-add-recipe').addEventListener('click', function() { addNewRecipe(); });
  }

  function editRecipe(recipeId) {
    var recipes = getRecipes();
    var recipe = null;
    for (var i = 0; i < recipes.length; i++) { if (recipes[i].id === recipeId) { recipe = recipes[i]; break; } }
    if (!recipe) return;
    var ings = getIngredients();
    var ingOptions = ings.map(function(ing) { return '<option value="' + ing.id + '">' + ing.name + ' ($' + ing.unitCost.toFixed(2) + '/' + ing.unit + ')</option>'; }).join('');

    var content = '<div class="space-y-3">';
    content += '<div><label class="block text-sm font-medium text-gray-700">Recipe Name</label><input id="ef-name" class="w-full border rounded-lg px-3 py-2 text-sm" value="' + recipe.name + '"/></div>';
    content += '<div><label class="block text-sm font-medium text-gray-700">Category</label><input id="ef-category" class="w-full border rounded-lg px-3 py-2 text-sm" value="' + (recipe.category || '') + '"/></div>';
    content += '<div><label class="block text-sm font-medium text-gray-700">Menu Item Reference</label><input id="ef-menuItem" class="w-full border rounded-lg px-3 py-2 text-sm" value="' + (recipe.menuItem || '') + '"/></div>';
    content += '<div><label class="block text-sm font-medium text-gray-700">Servings</label><input id="ef-servings" type="number" class="w-full border rounded-lg px-3 py-2 text-sm" value="' + (recipe.servings || 1) + '"/></div>';
    content += '<div><label class="block text-sm font-medium text-gray-700">Menu Status</label><input id="ef-menuStatus" class="w-full border rounded-lg px-3 py-2 text-sm" value="' + (recipe.menuStatus || 'Activo en Menú') + '"/></div>';
    content += '<hr><div class="font-medium text-sm">Ingredients</div><div id="ef-ingredients">';
    recipe.ingredients.forEach(function(ri, idx) {
      content += '<div class="flex gap-2 mb-2"><select class="ef-ing-select flex-1 border rounded-lg px-3 py-2 text-sm" data-idx="' + idx + '">' + ingOptions.replace('value="' + ri.ingredientId + '"', 'value="' + ri.ingredientId + '" selected') + '</select><input class="ef-ing-qty border rounded-lg px-3 py-2 text-sm w-20" type="number" step="0.001" value="' + ri.quantity + '" data-idx="' + idx + '"/></div>';
    });
    content += '</div>';
    content += '<button id="ef-add-ing" class="text-sm text-blue-600 hover:underline">+ Add Ingredient</button>';
    content += '</div>';

    Utils.modal({
      title: 'Edit Recipe: ' + recipe.name,
      content: content,
      confirmText: 'Save',
      onConfirm: function() {
        var name = document.getElementById('ef-name').value.trim();
        if (!name) { Utils.notify('Name required', 'error'); return; }
        var updated = {
          id: recipeId,
          name: name,
          category: document.getElementById('ef-category').value,
          menuItem: document.getElementById('ef-menuItem').value,
          servings: parseInt(document.getElementById('ef-servings').value) || 1,
          menuStatus: document.getElementById('ef-menuStatus').value,
          image: recipe.image,
          ingredients: []
        };
        var selects = document.querySelectorAll('.ef-ing-select');
        var qtys = document.querySelectorAll('.ef-ing-qty');
        selects.forEach(function(sel, idx) {
          var qty = parseFloat(qtys[idx] ? qtys[idx].value : 0) || 0;
          if (sel.value) updated.ingredients.push({ ingredientId: sel.value, quantity: qty });
        });
        for (var i = 0; i < recipes.length; i++) {
          if (recipes[i].id === recipeId) { recipes[i] = updated; break; }
        }
        saveRecipes(recipes);
        renderRecipeDetail(recipeId);
        renderRecipeSelector();
        Utils.notify('Recipe updated');
      }
    });

    setTimeout(function() {
      document.getElementById('ef-add-ing') && document.getElementById('ef-add-ing').addEventListener('click', function() {
        var container = document.getElementById('ef-ingredients');
        if (!container) return;
        var idx = container.children.length;
        var div = document.createElement('div');
        div.className = 'flex gap-2 mb-2';
        div.innerHTML = '<select class="ef-ing-select flex-1 border rounded-lg px-3 py-2 text-sm" data-idx="' + idx + '">' + ingOptions + '</select><input class="ef-ing-qty border rounded-lg px-3 py-2 text-sm w-20" type="number" step="0.001" value="0" data-idx="' + idx + '"/>';
        container.appendChild(div);
      });
    }, 50);
  }

  function addNewRecipe() {
    var ings = getIngredients();
    var ingOptions = ings.map(function(ing) { return '<option value="' + ing.id + '">' + ing.name + ' ($' + ing.unitCost.toFixed(2) + '/' + ing.unit + ')</option>'; }).join('');
    var content = '<div class="space-y-3">';
    content += '<div><label class="block text-sm font-medium text-gray-700">Recipe Name</label><input id="nf-name" class="w-full border rounded-lg px-3 py-2 text-sm"/></div>';
    content += '<div><label class="block text-sm font-medium text-gray-700">Menu Item Reference</label><input id="nf-menuItem" class="w-full border rounded-lg px-3 py-2 text-sm"/></div>';
    content += '<div><label class="block text-sm font-medium text-gray-700">Category</label><input id="nf-category" class="w-full border rounded-lg px-3 py-2 text-sm" value="Principales"/></div>';
    content += '<div><label class="block text-sm font-medium text-gray-700">Servings</label><input id="nf-servings" type="number" class="w-full border rounded-lg px-3 py-2 text-sm" value="1"/></div>';
    content += '<hr><div class="font-medium text-sm">Ingredients</div><div id="nf-ingredients">';
    content += '<div class="flex gap-2 mb-2"><select class="nf-ing-select flex-1 border rounded-lg px-3 py-2 text-sm">' + ingOptions + '</select><input class="nf-ing-qty border rounded-lg px-3 py-2 text-sm w-20" type="number" step="0.001" value="0"/></div>';
    content += '</div>';
    content += '<button id="nf-add-ing" class="text-sm text-blue-600 hover:underline">+ Add Ingredient</button>';
    content += '</div>';

    Utils.modal({
      title: 'Add New Recipe',
      content: content,
      confirmText: 'Create',
      onConfirm: function() {
        var name = document.getElementById('nf-name').value.trim();
        if (!name) { Utils.notify('Name required', 'error'); return; }
        var recipes = getRecipes();
        var ingredients = [];
        var selects = document.querySelectorAll('.nf-ing-select');
        var qtys = document.querySelectorAll('.nf-ing-qty');
        selects.forEach(function(sel, idx) {
          var qty = parseFloat(qtys[idx] ? qtys[idx].value : 0) || 0;
          if (sel.value && qty > 0) ingredients.push({ ingredientId: sel.value, quantity: qty });
        });
        if (!ingredients.length) { Utils.notify('Add at least one ingredient', 'error'); return; }
        var newRecipe = {
          id: Utils.uid(),
          name: name,
          menuItem: document.getElementById('nf-menuItem').value || name,
          servings: parseInt(document.getElementById('nf-servings').value) || 1,
          category: document.getElementById('nf-category').value || 'Principales',
          image: '',
          menuStatus: 'Activo en Menú',
          ingredients: ingredients
        };
        recipes.push(newRecipe);
        saveRecipes(recipes);
        renderRecipeDetail(newRecipe.id);
        renderRecipeSelector();
        Utils.notify('Recipe created');
      }
    });

    setTimeout(function() {
      document.getElementById('nf-add-ing') && document.getElementById('nf-add-ing').addEventListener('click', function() {
        var container = document.getElementById('nf-ingredients');
        if (!container) return;
        var div = document.createElement('div');
        div.className = 'flex gap-2 mb-2';
        div.innerHTML = '<select class="nf-ing-select flex-1 border rounded-lg px-3 py-2 text-sm">' + ingOptions + '</select><input class="nf-ing-qty border rounded-lg px-3 py-2 text-sm w-20" type="number" step="0.001" value="0"/>';
        container.appendChild(div);
      });
    }, 50);
  }

  function renderRecipeSelector() {
    var recipes = getRecipes();
    var header = document.querySelector('.xl\\:col-span-4 h4');
    if (!header) return;
    var container = header.parentNode;
    var existing = document.getElementById('recipe-selector');
    if (!existing) {
      var sel = document.createElement('select');
      sel.id = 'recipe-selector';
      sel.className = 'ml-2 border border-outline-variant rounded-lg px-2 py-1 text-sm bg-surface';
      recipes.forEach(function(r) {
        var opt = document.createElement('option');
        opt.value = r.id;
        opt.textContent = r.name;
        if (r.id === getSelectedId()) opt.selected = true;
        sel.appendChild(opt);
      });
      sel.addEventListener('change', function() {
        renderRecipeDetail(this.value);
      });
      container.appendChild(sel);
    } else {
      existing.innerHTML = '';
      recipes.forEach(function(r) {
        var opt = document.createElement('option');
        opt.value = r.id;
        opt.textContent = r.name;
        if (r.id === getSelectedId()) opt.selected = true;
        existing.appendChild(opt);
      });
    }
  }

  function setupSearch() {
    var input = document.querySelector('input[placeholder*="Buscar"]');
    if (!input) return;
    input.addEventListener('input', function() {
      SEARCH_TERM = this.value;
      renderIngredientTable();
    });
  }

  function setupAddIngredient() {
    // Find "Realizar Pedido" or "Ajuste" buttons area and add ingredient button
    var btnGroup = document.querySelector('.xl\\:col-span-8 .flex.gap-sm');
    if (!btnGroup) return;
    var existing = document.getElementById('btn-add-ingredient');
    if (!existing) {
      var btn = document.createElement('button');
      btn.id = 'btn-add-ingredient';
      btn.className = 'px-md py-sm bg-primary text-on-primary font-label-md text-label-md rounded-lg flex items-center gap-xs hover:opacity-90 transition-opacity shadow-sm';
      btn.innerHTML = '<span class="material-symbols-outlined text-[18px]">add</span> Add Ingredient';
      btn.addEventListener('click', function() {
        Utils.prompt({
          title: 'Add New Ingredient',
          fields: [
            { name: 'name', label: 'Name', type: 'text' },
            { name: 'sku', label: 'SKU', type: 'text' },
            { name: 'category', label: 'Category', type: 'select', options: CATEGORIES.map(function(c) { return { value: c, label: c }; }) },
            { name: 'unit', label: 'Unit', type: 'text' },
            { name: 'currentStock', label: 'Current Stock', type: 'number' },
            { name: 'minimumStock', label: 'Minimum Stock', type: 'number' },
            { name: 'unitCost', label: 'Unit Cost', type: 'number' },
            { name: 'supplier', label: 'Supplier', type: 'text' }
          ],
          onSave: function(vals) {
            if (!vals.name.trim()) { Utils.notify('Name required', 'error'); return; }
            var ings = getIngredients();
            ings.push({
              id: Utils.uid(),
              name: vals.name,
              sku: vals.sku || (vals.name.slice(0,3).toUpperCase() + '-' + String(ings.length + 1).padStart(3, '0')),
              category: vals.category || 'Otros',
              unit: vals.unit || 'kg',
              currentStock: parseFloat(vals.currentStock) || 0,
              minimumStock: parseFloat(vals.minimumStock) || 0,
              unitCost: parseFloat(vals.unitCost) || 0,
              supplier: vals.supplier || ''
            });
            saveIngredients(ings);
            renderIngredientTable();
            renderMetrics();
            Utils.notify('Ingredient added');
          }
        });
      });
      btnGroup.appendChild(btn);
    }
  }

  // Global for inline compatibility
  window.inventoryItems = [];
  window.recipeDetail = {};

  document.addEventListener('DOMContentLoaded', function() {
    seed();
    renderIngredientTable();
    renderMetrics();
    var recipes = getRecipes();
    if (recipes.length) {
      var sel = getSelectedId();
      if (!sel || !recipes.some(function(r) { return r.id === sel; })) { sel = recipes[0].id; setSelectedId(sel); }
      renderRecipeDetail(sel);
    }
    renderRecipeSelector();
    setupSearch();
    setupAddIngredient();
  });
})();
