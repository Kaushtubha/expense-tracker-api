/**
 * EXPENZA - FRONTEND APPLICATION JAVASCRIPT
 * Handles authentication, API interactions, reactive dashboard updates,
 * Chart.js analytics, and modal operations.
 */

// Category Theme Mapping
const CATEGORY_COLORS = {
  Food: '#10B981',
  Transport: '#06B6D4',
  Utilities: '#6366F1',
  Entertainment: '#EC4899',
  Health: '#EF4444',
  Shopping: '#F59E0B',
  Rent: '#8B5CF6',
  Other: '#9CA3AF',
};

// Global App State
const now = new Date();
const currentDefaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

const state = {
  token: localStorage.getItem('expenza_token') || null,
  user: JSON.parse(localStorage.getItem('expenza_user') || 'null'),
  currentMonth: currentDefaultMonth,
  page: 1,
  limit: 10,
  categoryFilter: '',
  searchQuery: '',
  startDate: '',
  endDate: '',
  chartInstance: null,
  activeEditExpenseId: null,
  activeDeleteExpenseId: null,
};

// DOM Elements
const authView = document.getElementById('auth-view');
const dashboardView = document.getElementById('dashboard-view');
const userProfile = document.getElementById('user-profile');
const userNameEl = document.getElementById('user-name');
const avatarEl = document.getElementById('user-avatar');
const logoutBtn = document.getElementById('logout-btn');

// Inputs & Filter Elements
const monthInput = document.getElementById('month-input');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const startDateInput = document.getElementById('start-date');
const endDateInput = document.getElementById('end-date');
const resetFiltersBtn = document.getElementById('reset-filters-btn');
const pagePrevBtn = document.getElementById('prev-page-btn');
const pageNextBtn = document.getElementById('next-page-btn');
const pageInfoEl = document.getElementById('page-info');

// Modals
const expenseModal = document.getElementById('expense-modal');
const modalTitle = document.getElementById('modal-title');
const expenseForm = document.getElementById('expense-form');
const expenseAmount = document.getElementById('expense-amount');
const expenseCategory = document.getElementById('expense-category');
const expenseDate = document.getElementById('expense-date');
const expenseDesc = document.getElementById('expense-desc');
const closeModalBtn = document.getElementById('close-modal-btn');
const cancelModalBtn = document.getElementById('cancel-modal-btn');
const openAddModalBtn = document.getElementById('open-add-modal-btn');

const deleteModal = document.getElementById('delete-modal');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

// --- Helper Functions ---

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3500);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount || 0);
}

function formatDate(isoString) {
  if (!isoString) return '-';
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// API Wrapper with automatic JWT authorization header injection
async function apiRequest(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    logout();
    showToast('Session expired. Please log in again.', 'error');
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const errorMsg =
      data.message || (data.errors && data.errors[0]?.message) || 'Request failed';
    throw new Error(errorMsg);
  }

  return data;
}

// --- Auth Operations ---

function setAuthState(token, user) {
  state.token = token;
  state.user = user;
  if (token) {
    localStorage.setItem('expenza_token', token);
    localStorage.setItem('expenza_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('expenza_token');
    localStorage.removeItem('expenza_user');
  }
  renderApp();
}

function logout() {
  setAuthState(null, null);
  showToast('Logged out successfully', 'info');
}

// --- Dashboard & Analytics Rendering ---

async function loadDashboard() {
  if (!state.token) return;

  try {
    await Promise.all([loadExpenses(), loadSummary()]);
  } catch (err) {
    console.error('Failed to load dashboard:', err);
  }
}

async function loadSummary() {
  try {
    const res = await apiRequest(`/api/expenses/summary?month=${state.currentMonth}`);
    const summary = res.data;

    // Update Metric Cards
    document.getElementById('metric-total-spent').textContent = formatCurrency(summary.totalSpent);
    document.getElementById('metric-month-label').textContent = state.currentMonth;

    if (summary.breakdown && summary.breakdown.length > 0) {
      const topCat = summary.breakdown[0];
      document.getElementById('metric-top-category').textContent = topCat.category;
      document.getElementById('metric-top-category-amount').textContent = formatCurrency(topCat.totalAmount);
    } else {
      document.getElementById('metric-top-category').textContent = 'None';
      document.getElementById('metric-top-category-amount').textContent = '$0.00';
    }

    // Render Progress Breakdown List
    renderBreakdownList(summary.breakdown, summary.totalSpent);

    // Render Donut Chart
    renderChart(summary.breakdown);
  } catch (err) {
    console.error('Failed to load summary:', err);
  }
}

function renderBreakdownList(breakdown, totalSpent) {
  const container = document.getElementById('category-breakdown-list');
  container.innerHTML = '';

  if (!breakdown || breakdown.length === 0) {
    container.innerHTML = '<p class="text-muted" style="text-align: center; margin-top: 2rem;">No spending recorded for this month.</p>';
    return;
  }

  breakdown.forEach((item) => {
    const percentage = totalSpent > 0 ? Math.round((item.totalAmount / totalSpent) * 100) : 0;
    const color = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other;

    const div = document.createElement('div');
    div.className = 'breakdown-item';
    div.innerHTML = `
      <div class="breakdown-header">
        <span>${item.category} (${item.count})</span>
        <span><strong>${formatCurrency(item.totalAmount)}</strong> <small class="text-muted">(${percentage}%)</small></span>
      </div>
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" style="width: ${percentage}%; background: ${color};"></div>
      </div>
    `;
    container.appendChild(div);
  });
}

function renderChart(breakdown) {
  const canvas = document.getElementById('category-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  if (state.chartInstance) {
    state.chartInstance.destroy();
  }

  if (!breakdown || breakdown.length === 0) {
    state.chartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['No Data'],
        datasets: [{
          data: [1],
          backgroundColor: ['rgba(255, 255, 255, 0.08)'],
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
        },
        cutout: '72%',
      },
    });
    return;
  }

  const labels = breakdown.map((b) => b.category);
  const data = breakdown.map((b) => b.totalAmount);
  const colors = breakdown.map((b) => CATEGORY_COLORS[b.category] || CATEGORY_COLORS.Other);

  state.chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor: '#111827',
        borderWidth: 2,
        hoverOffset: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#f9fafb',
            font: { family: 'Inter', size: 12 },
            boxWidth: 12,
            padding: 12,
          },
        },
        tooltip: {
          callbacks: {
            label(context) {
              const val = formatCurrency(context.raw);
              return ` ${context.label}: ${val}`;
            },
          },
        },
      },
      cutout: '72%',
    },
  });
}

// --- Expenses List & Table ---

async function loadExpenses() {
  const params = new URLSearchParams({
    page: state.page,
    limit: state.limit,
  });

  if (state.categoryFilter) params.append('category', state.categoryFilter);
  if (state.startDate) params.append('startDate', state.startDate);
  if (state.endDate) params.append('endDate', state.endDate);

  const res = await apiRequest(`/api/expenses?${params.toString()}`);
  const expenses = res.data || [];
  const pagination = res.pagination || { total: expenses.length, page: 1, limit: state.limit, totalPages: 1 };

  // Update Total Count Metric
  document.getElementById('metric-total-count').textContent = pagination.total;

  renderExpensesTable(expenses);
  renderPagination(pagination);
}

function renderExpensesTable(expenses = []) {
  const tbody = document.getElementById('expenses-table-body');
  tbody.innerHTML = '';

  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const filtered = state.searchQuery
    ? safeExpenses.filter(
        (e) =>
          (e.description && e.description.toLowerCase().includes(state.searchQuery.toLowerCase())) ||
          (e.category && e.category.toLowerCase().includes(state.searchQuery.toLowerCase()))
      )
    : safeExpenses;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 3rem 1rem;" class="text-muted">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">💸</div>
          <p>No expenses found matching your criteria.</p>
        </td>
      </tr>
    `;
    return;
  }

  filtered.forEach((exp) => {
    const color = CATEGORY_COLORS[exp.category] || CATEGORY_COLORS.Other;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <span class="category-tag" style="background: ${color}22; color: ${color}; border: 1px solid ${color}44;">
          ${exp.category}
        </span>
      </td>
      <td>${escapeHtml(exp.description || '—')}</td>
      <td>${formatDate(exp.date)}</td>
      <td class="amount-cell">${formatCurrency(exp.amount)}</td>
      <td>
        <div class="actions-cell">
          <button class="btn-icon" title="Edit" onclick="openEditModal('${exp._id}', '${exp.amount}', '${exp.category}', '${exp.date}', '${escapeHtml(exp.description || '')}')">
            ✎
          </button>
          <button class="btn-icon" style="color: var(--accent-rose);" title="Delete" onclick="openDeleteModal('${exp._id}')">
            ✕
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderPagination(pagination) {
  pageInfoEl.textContent = `Page ${pagination.page} of ${pagination.totalPages} (${pagination.total} items)`;
  pagePrevBtn.disabled = pagination.page <= 1;
  pageNextBtn.disabled = pagination.page >= pagination.totalPages;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>'"]/g, (tag) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  }[tag] || tag));
}

// --- Modals Controller ---

function openCreateModal() {
  state.activeEditExpenseId = null;
  modalTitle.textContent = 'Add New Expense';
  expenseAmount.value = '';
  expenseCategory.value = 'Food';
  expenseDate.value = new Date().toISOString().slice(0, 10);
  expenseDesc.value = '';
  highlightCategoryChip('Food');
  expenseModal.classList.add('active');
}

window.openEditModal = function (id, amount, category, date, desc) {
  state.activeEditExpenseId = id;
  modalTitle.textContent = 'Edit Expense';
  expenseAmount.value = amount;
  expenseCategory.value = category;
  expenseDate.value = date ? new Date(date).toISOString().slice(0, 10) : '';
  expenseDesc.value = desc;
  highlightCategoryChip(category);
  expenseModal.classList.add('active');
};

function closeExpenseModal() {
  expenseModal.classList.remove('active');
}

window.openDeleteModal = function (id) {
  state.activeDeleteExpenseId = id;
  deleteModal.classList.add('active');
};

function closeDeleteModal() {
  deleteModal.classList.remove('active');
  state.activeDeleteExpenseId = null;
}

function highlightCategoryChip(selectedCategory) {
  document.querySelectorAll('.category-chip').forEach((chip) => {
    if (chip.dataset.category === selectedCategory) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });
}

// --- Event Listeners Initialization ---

function initEventListeners() {
  monthInput.value = state.currentMonth;
  monthInput.addEventListener('change', (e) => {
    state.currentMonth = e.target.value;
    loadSummary();
  });

  logoutBtn.addEventListener('click', logout);

  searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    loadExpenses();
  });

  categoryFilter.addEventListener('change', (e) => {
    state.categoryFilter = e.target.value;
    state.page = 1;
    loadExpenses();
  });

  startDateInput.addEventListener('change', (e) => {
    state.startDate = e.target.value;
    state.page = 1;
    loadExpenses();
  });

  endDateInput.addEventListener('change', (e) => {
    state.endDate = e.target.value;
    state.page = 1;
    loadExpenses();
  });

  resetFiltersBtn.addEventListener('click', () => {
    state.searchQuery = '';
    state.categoryFilter = '';
    state.startDate = '';
    state.endDate = '';
    state.page = 1;
    searchInput.value = '';
    categoryFilter.value = '';
    startDateInput.value = '';
    endDateInput.value = '';
    loadExpenses();
  });

  pagePrevBtn.addEventListener('click', () => {
    if (state.page > 1) {
      state.page--;
      loadExpenses();
    }
  });

  pageNextBtn.addEventListener('click', () => {
    state.page++;
    loadExpenses();
  });

  openAddModalBtn.addEventListener('click', openCreateModal);
  closeModalBtn.addEventListener('click', closeExpenseModal);
  cancelModalBtn.addEventListener('click', closeExpenseModal);
  cancelDeleteBtn.addEventListener('click', closeDeleteModal);

  document.querySelectorAll('.category-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      expenseCategory.value = chip.dataset.category;
      highlightCategoryChip(chip.dataset.category);
    });
  });

  expenseForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      amount: parseFloat(expenseAmount.value),
      category: expenseCategory.value,
      date: expenseDate.value ? new Date(expenseDate.value).toISOString() : new Date().toISOString(),
      description: expenseDesc.value.trim(),
    };

    try {
      if (state.activeEditExpenseId) {
        await apiRequest(`/api/expenses/${state.activeEditExpenseId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        showToast('Expense updated successfully!', 'success');
      } else {
        await apiRequest('/api/expenses', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        showToast('New expense added!', 'success');
      }

      closeExpenseModal();
      loadDashboard();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  confirmDeleteBtn.addEventListener('click', async () => {
    if (!state.activeDeleteExpenseId) return;

    try {
      await apiRequest(`/api/expenses/${state.activeDeleteExpenseId}`, {
        method: 'DELETE',
      });
      showToast('Expense deleted', 'success');
      closeDeleteModal();
      loadDashboard();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  const authTabLogin = document.getElementById('auth-tab-login');
  const authTabSignup = document.getElementById('auth-tab-signup');
  const signupFields = document.getElementById('signup-fields');
  const authForm = document.getElementById('auth-form');
  const authSubmitBtn = document.getElementById('auth-submit-btn');
  const demoLoginBtn = document.getElementById('demo-login-btn');

  let authMode = 'login';

  authTabLogin.addEventListener('click', () => {
    authMode = 'login';
    authTabLogin.classList.add('active');
    authTabSignup.classList.remove('active');
    signupFields.classList.add('hidden');
    authSubmitBtn.textContent = 'Sign In';
  });

  authTabSignup.addEventListener('click', () => {
    authMode = 'signup';
    authTabSignup.classList.add('active');
    authTabLogin.classList.remove('active');
    signupFields.classList.remove('hidden');
    authSubmitBtn.textContent = 'Create Account';
  });

  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const name = document.getElementById('auth-name').value.trim();

    try {
      if (authMode === 'signup') {
        const res = await apiRequest('/api/auth/signup', {
          method: 'POST',
          body: JSON.stringify({ name, email, password }),
        });
        setAuthState(res.data.token, res.data.user);
        showToast('Welcome to Expenza!', 'success');
      } else {
        const res = await apiRequest('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        setAuthState(res.data.token, res.data.user);
        showToast('Signed in successfully', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  demoLoginBtn.addEventListener('click', async () => {
    const demoEmail = 'demo@expenza.dev';
    const demoPassword = 'Password123!';

    try {
      let authResult;
      try {
        authResult = await apiRequest('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: demoEmail, password: demoPassword }),
        });
      } catch (loginErr) {
        authResult = await apiRequest('/api/auth/signup', {
          method: 'POST',
          body: JSON.stringify({
            name: 'Demo Reviewer',
            email: demoEmail,
            password: demoPassword,
          }),
        });

        // Seed initial sample expenses for the current active month
        const sampleExpenses = [
          { amount: 18.5, category: 'Food', description: 'Artisan coffee & breakfast', date: `${state.currentMonth}-02` },
          { amount: 45.0, category: 'Transport', description: 'Metro pass & ride share', date: `${state.currentMonth}-05` },
          { amount: 130.0, category: 'Utilities', description: 'Gigabit Fiber Internet & Cloud backup', date: `${state.currentMonth}-08` },
          { amount: 82.5, category: 'Food', description: 'Weekend dinner with team', date: `${state.currentMonth}-11` },
          { amount: 35.0, category: 'Entertainment', description: 'Streaming & movie tickets', date: `${state.currentMonth}-12` },
          { amount: 110.0, category: 'Shopping', description: 'Noise-canceling headphones', date: `${state.currentMonth}-14` },
        ];

        for (const item of sampleExpenses) {
          await apiRequest('/api/expenses', {
            method: 'POST',
            body: JSON.stringify(item),
          });
        }
      }

      setAuthState(authResult.data.token, authResult.data.user);
      showToast('Welcome to the Demo Account!', 'success');
      await loadDashboard();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

// --- App Render Logic ---

function renderApp() {
  if (state.token && state.user) {
    authView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
    userProfile.classList.remove('hidden');

    userNameEl.textContent = state.user.name || 'User';
    avatarEl.textContent = (state.user.name || 'U').charAt(0).toUpperCase();

    loadDashboard();
  } else {
    authView.classList.remove('hidden');
    dashboardView.classList.add('hidden');
    userProfile.classList.add('hidden');
  }
}

// Run on page load
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  renderApp();
});
