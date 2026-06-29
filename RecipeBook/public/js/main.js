let currentCategory = 'All';
let searchQuery = '';
let searchTimer = null;
let allCategories = [];

const CATEGORY_ICONS = {
  'Breakfast': '🍳', 'Lunch': '🥪', 'Dinner': '🍽️', 'Appetizer': '🫙',
  'Side Dish': '🥦', 'Salad': '🥗', 'Soup': '🍲', 'Dessert': '🍰',
  'Snack': '🍿', 'Beverage': '🥃', 'Sauce & Condiment': '🫙', 'Baked Goods': '🍞'
};

async function init() {
  await loadCategories();
  await loadRecipes();
}

async function loadCategories() {
  try {
    const res = await fetch('/api/recipes/categories');
    allCategories = await res.json();
    await renderCategoryTabs();
  } catch (e) {
    console.error('Failed to load categories', e);
  }
}

async function renderCategoryTabs() {
  const container = document.getElementById('categoryTabs');
  const totalCount = await countRecipes();
  const tabs = [{ category: 'All', count: totalCount }].concat(allCategories);
  container.innerHTML = tabs.map(c =>
    `<button class="cat-tab ${c.category === currentCategory ? 'active' : ''}"
      data-cat="${c.category}"
      onclick="selectCategory('${c.category}')">${esc(c.category)}${c.count != null ? ` <span style="opacity:0.5;font-size:0.75em">${c.count}</span>` : ''}</button>`
  ).join('');
}

async function countRecipes() {
  try {
    const res = await fetch('/api/recipes?limit=1');
    const data = await res.json();
    return data.total || 0;
  } catch { return 0; }
}

function selectCategory(cat) {
  currentCategory = cat;
  document.querySelectorAll('.cat-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.cat === cat);
  });
  loadRecipes();
}

document.getElementById('searchInput').addEventListener('input', e => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    searchQuery = e.target.value.trim();
    loadRecipes();
  }, 300);
});

async function loadRecipes() {
  const grid = document.getElementById('recipesGrid');
  const empty = document.getElementById('emptyState');
  grid.innerHTML = '<div class="loading-state">Loading...</div>';
  empty.style.display = 'none';

  try {
    const params = new URLSearchParams({ limit: 100 });
    if (currentCategory !== 'All') params.set('category', currentCategory);
    if (searchQuery) params.set('search', searchQuery);

    const res = await fetch('/api/recipes?' + params);
    const data = await res.json();
    const recipes = data.recipes || [];

    updateHeroStats(data.total);

    if (recipes.length === 0) {
      grid.innerHTML = '';
      empty.style.display = 'block';
    } else {
      grid.innerHTML = recipes.map(renderCard).join('');
    }
  } catch {
    grid.innerHTML = '<div class="loading-state">Failed to load recipes.</div>';
  }
}

function updateHeroStats(total) {
  document.getElementById('heroStats').innerHTML = `
    <div class="stat-item"><span class="stat-num">${total || 0}</span><span class="stat-label">Recipes</span></div>
    <div class="stat-item"><span class="stat-num">${allCategories.length}</span><span class="stat-label">Categories</span></div>
  `;
}

function renderCard(r) {
  const icon = CATEGORY_ICONS[r.category] || '🍴';
  const image = r.image_path
    ? `<img class="card-image" src="${r.image_path}" alt="${esc(r.title)}" loading="lazy">`
    : `<div class="card-image-placeholder">${icon}</div>`;

  const metaParts = [
    r.prep_time && `<span class="meta-item">⏱ ${r.prep_time}</span>`,
    r.cook_time && `<span class="meta-item">🔥 ${r.cook_time}</span>`,
    r.servings && `<span class="meta-item">👥 ${r.servings}</span>`
  ].filter(Boolean);

  const tags = (r.tags || []).slice(0, 3).map(t => `<span class="tag">${esc(t)}</span>`).join('');

  return `
    <div class="recipe-card" onclick="openRecipe(${r.id})">
      ${image}
      <div class="card-body">
        <div class="card-category">${icon} ${esc(r.category)}</div>
        <div class="card-title">${esc(r.title)}</div>
        ${r.description ? `<div class="card-desc">${esc(r.description)}</div>` : ''}
        ${metaParts.length ? `<div class="card-meta">${metaParts.join('')}</div>` : ''}
        ${tags ? `<div class="card-tags">${tags}</div>` : ''}
      </div>
    </div>`;
}

async function openRecipe(id) {
  try {
    const res = await fetch(`/api/recipes/${id}`);
    if (!res.ok) throw new Error('Not found');
    const r = await res.json();
    renderRecipeDetail(r);
    document.getElementById('recipeModal').classList.add('open');
    document.body.style.overflow = 'hidden';
  } catch {
    showToast('Failed to load recipe.', 'error');
  }
}

function renderRecipeDetail(r) {
  const icon = CATEGORY_ICONS[r.category] || '🍴';

  const image = r.image_path
    ? `<img class="recipe-detail-image" src="${r.image_path}" alt="${esc(r.title)}">`
    : '';

  const metaParts = [
    r.prep_time && `<div class="recipe-meta-item"><span class="recipe-meta-label">Prep Time</span><span class="recipe-meta-value">${esc(r.prep_time)}</span></div>`,
    r.cook_time && `<div class="recipe-meta-item"><span class="recipe-meta-label">Cook Time</span><span class="recipe-meta-value">${esc(r.cook_time)}</span></div>`,
    r.servings && `<div class="recipe-meta-item"><span class="recipe-meta-label">Servings</span><span class="recipe-meta-value">${esc(r.servings)}</span></div>`
  ].filter(Boolean);

  const ingredients = (r.ingredients || []).map(i => `<li>${esc(i)}</li>`).join('');
  const instructions = (r.instructions || []).map((s, i) =>
    `<li><span class="step-num">${i + 1}</span><span>${esc(s)}</span></li>`
  ).join('');
  const tags = (r.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join('');

  document.getElementById('recipeContent').innerHTML = `
    <div class="recipe-detail-header">
      ${image}
      <div class="recipe-detail-category">${icon} ${esc(r.category)}</div>
      <h1 class="recipe-detail-title">${esc(r.title)}</h1>
      ${r.description ? `<p class="recipe-detail-desc">${esc(r.description)}</p>` : ''}
      ${metaParts.length ? `<div class="recipe-detail-meta">${metaParts.join('')}</div>` : ''}
    </div>
    <div class="recipe-detail-body">
      <div>
        <div class="section-heading">Ingredients</div>
        <ul class="ingredients-list">${ingredients}</ul>
      </div>
      <div>
        <div class="section-heading">Instructions</div>
        <ol class="instructions-list">${instructions}</ol>
      </div>
    </div>
    ${tags ? `<div class="recipe-detail-tags">${tags}</div>` : ''}
    <div class="recipe-detail-actions">
      <button class="btn-danger" onclick="deleteRecipe(${r.id})">Delete Recipe</button>
    </div>
  `;
}

async function deleteRecipe(id) {
  if (!confirm('Delete this recipe? This cannot be undone.')) return;
  try {
    const res = await fetch(`/api/recipes/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    showToast('Recipe deleted.', 'success');
    closeRecipeModal();
    await loadCategories();
    await loadRecipes();
  } catch {
    showToast('Failed to delete recipe.', 'error');
  }
}

function closeRecipeModal(e) {
  if (e && e.target !== document.getElementById('recipeModal')) return;
  document.getElementById('recipeModal').classList.remove('open');
  document.body.style.overflow = '';
}

let selectedFiles = [];

function openUploadModal() {
  clearUpload();
  document.getElementById('uploadModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeUploadModal(e) {
  if (e && e.target !== document.getElementById('uploadModal')) return;
  document.getElementById('uploadModal').classList.remove('open');
  document.body.style.overflow = '';
  clearUpload();
}

function handleFileSelect(e) {
  const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
  if (!files.length) return;
  selectedFiles = files;
  renderQueue();
  document.getElementById('processBtn').disabled = false;
  document.getElementById('processBtn').textContent = `Extract ${files.length} Recipe${files.length > 1 ? 's' : ''}`;
}

function renderQueue() {
  const queueEl = document.getElementById('fileQueue');
  queueEl.style.display = 'flex';
  queueEl.innerHTML = selectedFiles.map((f, i) => `
    <div class="queue-item" id="qitem-${i}">
      <img class="queue-thumb" id="qthumb-${i}" src="" alt="">
      <span class="queue-name">${esc(f.name)}</span>
      <span class="queue-status pending" id="qstatus-${i}">Waiting</span>
    </div>`).join('');

  selectedFiles.forEach((f, i) => {
    const reader = new FileReader();
    reader.onload = ev => { document.getElementById(`qthumb-${i}`).src = ev.target.result; };
    reader.readAsDataURL(f);
  });
}

function setQueueStatus(i, status, label) {
  const el = document.getElementById(`qstatus-${i}`);
  if (!el) return;
  el.className = `queue-status ${status}`;
  el.textContent = label;
  document.getElementById(`qitem-${i}`)?.scrollIntoView({ block: 'nearest' });
}

function clearUpload() {
  selectedFiles = [];
  document.getElementById('photoInput').value = '';
  document.getElementById('fileQueue').style.display = 'none';
  document.getElementById('fileQueue').innerHTML = '';
  document.getElementById('processBtn').disabled = true;
  document.getElementById('processBtn').textContent = 'Extract Recipes';
  document.getElementById('uploadStatus').style.display = 'none';
  document.getElementById('statusText').textContent = 'Processing...';
}

async function processBulk() {
  if (!selectedFiles.length) return;
  const statusEl = document.getElementById('uploadStatus');
  const statusText = document.getElementById('statusText');
  const processBtn = document.getElementById('processBtn');
  processBtn.disabled = true;

  let done = 0, errors = 0;
  const total = selectedFiles.length;
  let lastId = null;

  statusEl.style.display = 'flex';

  for (let i = 0; i < total; i++) {
    setQueueStatus(i, 'active', 'Reading...');
    statusText.textContent = `Processing ${i + 1} of ${total}...`;

    const formData = new FormData();
    formData.append('photo', selectedFiles[i]);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.status === 409 && data.duplicate) {
        setQueueStatus(i, 'duplicate', 'Duplicate');
        continue;
      }
      if (!res.ok) throw new Error(data.error || 'Failed');
      const label = data.recipe.title.slice(0, 22) + (data.recipe.title.length > 22 ? '…' : '');
      setQueueStatus(i, 'done', label);
      done++;
      lastId = data.id;
    } catch (err) {
      setQueueStatus(i, 'error', 'Error');
      errors++;
    }
  }

  statusEl.style.display = 'none';

  const msg = errors === 0
    ? `${done} recipe${done > 1 ? 's' : ''} added to your cookbook!`
    : `${done} added, ${errors} failed.`;
  showToast(msg, errors === 0 ? 'success' : 'error');

  closeUploadModal();
  await loadCategories();
  await loadRecipes();
  if (lastId && done === 1) openRecipe(lastId);
}

const zone = document.getElementById('uploadZone');
zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
zone.addEventListener('drop', e => {
  e.preventDefault();
  zone.classList.remove('drag-over');
  const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
  if (!files.length) return;
  selectedFiles = files;
  renderQueue();
  document.getElementById('processBtn').disabled = false;
  document.getElementById('processBtn').textContent = `Extract ${files.length} Recipe${files.length > 1 ? 's' : ''}`;
});

function showToast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

init();
