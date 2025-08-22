// UI functions for the grocery shopping app
const UI = {
    // Current sort settings
    currentMasterSort: 'name-asc',
    currentShoppingSort: 'name-asc',
    currentCategoryFilter: 'all',

    // Sort items based on the selected criteria
    sortItems(items, sortBy) {
        const sortedItems = [...items];
        
        switch (sortBy) {
            case 'name-asc':
                return sortedItems.sort((a, b) => a.name.localeCompare(b.name));
            case 'name-desc':
                return sortedItems.sort((a, b) => b.name.localeCompare(a.name));
            case 'quantity-asc':
                return sortedItems.sort((a, b) => a.quantity - b.quantity);
            case 'quantity-desc':
                return sortedItems.sort((a, b) => b.quantity - a.quantity);
            case 'category-asc':
                return sortedItems.sort((a, b) => a.category.localeCompare(b.category));
            case 'category-desc':
                return sortedItems.sort((a, b) => b.category.localeCompare(a.category));
            case 'completed-asc':
                return sortedItems.sort((a, b) => (a.completed || false) - (b.completed || false));
            case 'completed-desc':
                return sortedItems.sort((a, b) => (b.completed || false) - (a.completed || false));
            default:
                return sortedItems;
        }
    },

    // Filter items by category
    filterByCategory(items, category) {
        if (category === 'all') {
            return items;
        }
        return items.filter(item => item.category === category);
    },

    // Update category filter buttons
    updateCategoryFilterButtons() {
        const buttons = document.querySelectorAll('.category-filter-btn');
        buttons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-category') === this.currentCategoryFilter) {
                btn.classList.add('active');
            }
        });
    },

    // Hide category filter bar if shopping list is empty
    updateCategoryFilterBarVisibility(items) {
        const filterSection = document.getElementById('category-filter-section');
        if (items.length === 0) {
            filterSection.style.display = 'none';
        } else {
            filterSection.style.display = 'block';
        }
    },

    // Render master list items grouped by category
    renderMasterList(items = []) {
        const masterListEl = document.getElementById('master-list');
        
        if (items.length === 0) {
            masterListEl.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📦</div>
                    <h3>No items in master list</h3>
                    <p>Add items to your master inventory to get started!</p>
                </div>
            `;
            return;
        }
        
        // Group items by category
        const groupedItems = items.reduce((acc, item) => {
            const category = item.category || 'Other';
            if (!acc[category]) acc[category] = [];
            acc[category].push(item);
            return acc;
        }, {});

        let html = '';
        
        // Render each category (categories are already sorted alphabetically)
        Object.keys(groupedItems).sort().forEach(category => {
            const categoryEmoji = this.getCategoryEmoji(category);
            html += `<div class="category-header">${categoryEmoji} ${category}</div>`;
            
            // Sort items within each category based on current sort setting
            const sortedCategoryItems = this.sortItems(groupedItems[category], this.currentMasterSort);
            
            sortedCategoryItems.forEach(item => {
                html += `
                    <div class="master-item">
                        <div class="master-item-content">
                            <div class="master-item-info">
                                <div class="master-item-name">${item.name}</div>
                                <div class="master-item-details">
                                    <span>Qty: ${item.quantity}</span>
                                    <span>Category: ${item.category}</span>
                                </div>
                            </div>
                            <div class="master-item-actions">
                                <button class="btn btn-primary btn-sm add-to-shopping" data-id="${item.id}">+ Add</button>
                                <button class="btn btn-danger btn-sm delete-item" data-id="${item.id}">🗑️</button>
                            </div>
                        </div>
                    </div>
                `;
            });
        });
        
        masterListEl.innerHTML = html;
    },

    // Render shopping list items
    renderShoppingList(items = []) {
        const shoppingListEl = document.getElementById('shopping-list');
        const countEl = document.getElementById('shopping-count');
        
        // Update category filter bar visibility
        this.updateCategoryFilterBarVisibility(items);
        
        // Update count
        const activeCount = items.filter(item => !item.completed).length;
        const totalCount = items.length;
        countEl.textContent = `${activeCount}/${totalCount} items`;
        
        if (items.length === 0) {
            shoppingListEl.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🛒</div>
                    <h3>Shopping list is empty</h3>
                    <p>Add items from your master list to start shopping!</p>
                </div>
            `;
            return;
        }

        // Apply category filter
        const filteredItems = this.filterByCategory(items, this.currentCategoryFilter);
        
        // Sort items based on current sort setting
        const sortedItems = this.sortItems(filteredItems, this.currentShoppingSort);

        // Update filter buttons
        this.updateCategoryFilterButtons();

        let html = '';
        sortedItems.forEach(item => {
            html += `
                <div class="shopping-item ${item.completed ? 'completed' : ''}">
                    <label class="item-label">
                        <input type="checkbox" class="item-checkbox check-item" data-id="${item.id}" ${item.completed ? 'checked' : ''}>
                        <span class="item-text">${item.name} (${item.quantity}) - ${item.category}</span>
                    </label>
                </div>
            `;
        });
        
        // Show message if category filter results in no items
        if (sortedItems.length === 0 && this.currentCategoryFilter !== 'all') {
            html = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <h3>No items in this category</h3>
                    <p>Try selecting a different category or add more items to your shopping list.</p>
                </div>
            `;
        }
        
        shoppingListEl.innerHTML = html;
    },

    // Get emoji for category
    getCategoryEmoji(category) {
        const emojis = {
            'Produce': '🥬',
            'Dairy': '🥛',
            'Meat': '🥩',
            'Pantry': '🥫',
            'Frozen': '🧊',
            'Bakery': '🍞',
            'Other': '📦'
        };
        return emojis[category] || '📦';
    },

    // Toggle item completion in shopping list
    toggleCheckOff(itemId) {
        Storage.toggleItemCompleted(parseInt(itemId));
        this.renderShoppingList(Storage.getShoppingList());
    },

    // Show/hide add form
    toggleAddForm() {
        const form = document.getElementById('add-item-form');
        const button = document.getElementById('toggle-add-form');
        
        if (form.classList.contains('hidden')) {
            form.classList.remove('hidden');
            button.textContent = '- Cancel';
            document.getElementById('item-name').focus();
        } else {
            form.classList.add('hidden');
            button.textContent = '+ Add Item';
        }
    },

    // Switch between tabs
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-section`).classList.add('active');
    },

    // Toggle dark mode
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update button emoji
        const button = document.getElementById('theme-toggle');
        button.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    },

    // Initialize theme
    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const button = document.getElementById('theme-toggle');
        button.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    },

    // Filter items based on search
    filterItems(items, searchTerm) {
        if (!searchTerm) return items;
        
        return items.filter(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
};

// Make UI available globally
window.UI = UI;