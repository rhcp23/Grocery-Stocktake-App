// Main JavaScript file for the grocery shopping app

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// Initialize all app functionality
function initializeApp() {
    UI.initTheme();
    loadMasterList();
    loadShoppingList();
    setupEventListeners();
    setupSearchFunctionality();
}

// Load master inventory list from localStorage
function loadMasterList() {
    const masterList = Storage.getMasterList();
    UI.renderMasterList(masterList);
}

// Load shopping list from localStorage
function loadShoppingList() {
    const shoppingList = Storage.getShoppingList();
    UI.renderShoppingList(shoppingList);
}

// Set up all event listeners
function setupEventListeners() {
    // Form submission
    const addForm = document.getElementById('add-item-form');
    if (addForm) {
        addForm.addEventListener('submit', handleAddItem);
    }

    // Tab navigation with empty shopping list check
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.getAttribute('data-tab');
            
            // Check if switching to shopping list and it's empty
            if (tab === 'shopping') {
                const shoppingList = Storage.getShoppingList();
                if (shoppingList.length === 0) {
                    showEmptyShoppingListPopup();
                    return; // Don't switch tabs
                }
            }
            
            UI.switchTab(tab);
        });
    });

    // Toggle add form
    const toggleButton = document.getElementById('toggle-add-form');
    if (toggleButton) {
        toggleButton.addEventListener('click', UI.toggleAddForm);
    }

    // Theme toggle
    const themeButton = document.getElementById('theme-toggle');
    if (themeButton) {
        themeButton.addEventListener('click', UI.toggleTheme);
    }

    // Sort controls
    const masterSortSelect = document.getElementById('master-sort');
    if (masterSortSelect) {
        masterSortSelect.addEventListener('change', (e) => {
            UI.currentMasterSort = e.target.value;
            loadMasterList(); // Reload with new sort
        });
    }

    const shoppingSortSelect = document.getElementById('shopping-sort');
    if (shoppingSortSelect) {
        shoppingSortSelect.addEventListener('change', (e) => {
            UI.currentShoppingSort = e.target.value;
            loadShoppingList(); // Reload with new sort
        });
    }

    // Category filter buttons
    const categoryFilterBar = document.getElementById('category-filter-bar');
    if (categoryFilterBar) {
        categoryFilterBar.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-filter-btn')) {
                const category = e.target.getAttribute('data-category');
                UI.currentCategoryFilter = category;
                loadShoppingList(); // Reload with new filter
            }
        });
    }

    // Master list interactions (event delegation)
    const masterList = document.getElementById('master-list');
    if (masterList) {
        masterList.addEventListener('click', handleMasterListClick);
    }

    // Shopping list interactions (event delegation)
    const shoppingList = document.getElementById('shopping-list');
    if (shoppingList) {
        shoppingList.addEventListener('click', handleShoppingListClick);
    }

    // List control buttons
    const clearCompletedBtn = document.getElementById('clear-completed');
    if (clearCompletedBtn) {
        clearCompletedBtn.addEventListener('click', clearCompletedItems);
    }

    const clearAllBtn = document.getElementById('clear-all');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', clearAllItems);
    }

    const shareBtn = document.getElementById('share-list');
    if (shareBtn) {
        shareBtn.addEventListener('click', shareShoppingList);
    }
}

// Handle adding new item to master list
function handleAddItem(event) {
    event.preventDefault();
    
    const itemName = document.getElementById('item-name').value.trim();
    const itemCategory = document.getElementById('item-category').value;
    const itemQuantity = parseInt(document.getElementById('item-quantity').value) || 1;

    if (itemName) {
        // Check if item already exists in master list
        const existingItems = Storage.getMasterList();
        const isDuplicate = existingItems.some(item => 
            item.name.toLowerCase() === itemName.toLowerCase() && 
            item.category === itemCategory
        );

        if (isDuplicate) {
            alert('This item already exists in your master list!');
            return;
        }

        const newItem = {
            name: itemName,
            category: itemCategory,
            quantity: itemQuantity
        };

        Storage.addItemToMasterList(newItem);
        loadMasterList();
        
        // Reset form and hide it
        event.target.reset();
        document.getElementById('item-quantity').value = 1; // Reset to default
        UI.toggleAddForm();
        
        // Show success feedback
        showNotification('Item added to master list!', 'success');
    }
}

// Handle clicks on the master list
function handleMasterListClick(event) {
    const target = event.target;
    
    if (target.classList.contains('delete-item')) {
        const itemId = parseInt(target.getAttribute('data-id'));
        
        if (confirm('Are you sure you want to delete this item from your master list?')) {
            Storage.deleteItemFromMasterList(itemId);
            loadMasterList();
            showNotification('Item deleted from master list', 'success');
        }
    }
    
    if (target.classList.contains('add-to-shopping')) {
        const itemId = parseInt(target.getAttribute('data-id'));
        const masterList = Storage.getMasterList();
        const item = masterList.find(item => item.id === itemId);
        
        if (item) {
            // Check if item already exists in shopping list
            const shoppingList = Storage.getShoppingList();
            const existsInShopping = shoppingList.some(shopItem => 
                shopItem.name.toLowerCase() === item.name.toLowerCase()
            );

            if (existsInShopping) {
                showNotification('Item already in shopping list!', 'warning');
                return;
            }

            Storage.addItemToShoppingList(item);
            loadShoppingList();
            showNotification('Item added to shopping list!', 'success');
        }
    }
}

// Handle clicks on the shopping list
function handleShoppingListClick(event) {
    const target = event.target;
    
    if (target.classList.contains('check-item')) {
        const itemId = parseInt(target.getAttribute('data-id'));
        UI.toggleCheckOff(itemId);
        
        // Provide feedback
        const isChecked = target.checked;
        showNotification(isChecked ? 'Item completed!' : 'Item unchecked', 'info');
    }
}

// Clear completed items from shopping list
function clearCompletedItems() {
    const shoppingList = Storage.getShoppingList();
    const completedCount = shoppingList.filter(item => item.completed).length;
    
    if (completedCount === 0) {
        showNotification('No completed items to clear', 'info');
        return;
    }

    if (confirm(`Clear ${completedCount} completed item(s)?`)) {
        Storage.clearCompletedItems();
        loadShoppingList();
        showNotification(`${completedCount} completed item(s) cleared`, 'success');
    }
}

// Clear all items from shopping list
function clearAllItems() {
    const shoppingList = Storage.getShoppingList();
    
    if (shoppingList.length === 0) {
        showNotification('Shopping list is already empty', 'info');
        return;
    }

    if (confirm('Clear entire shopping list?')) {
        Storage.clearAllItems();
        loadShoppingList();
        showNotification('Shopping list cleared', 'success');
    }
}

// Share shopping list using the enhanced ShareAPI
async function shareShoppingList() {
    const shoppingList = Storage.getShoppingList();
    
    if (shoppingList.length === 0) {
        showNotification('Shopping list is empty - nothing to share!', 'warning');
        return;
    }

    try {
        const result = await ShareAPI.shareList(shoppingList, 'My Grocery List');
        
        if (result.success) {
            if (result.method === 'native') {
                showNotification('List shared successfully!', 'success');
            } else if (result.method === 'clipboard') {
                showNotification('Shopping list copied to clipboard!', 'success');
            }
        } else if (result.reason === 'cancelled') {
            // User cancelled sharing, no notification needed
            return;
        } else if (result.method === 'manual') {
            // Show the share modal for manual sharing
            const shareData = ShareAPI.formatShareData(shoppingList, 'My Grocery List');
            ShareAPI.showShareModal(shareData);
        }
    } catch (error) {
        console.error('Error sharing:', error);
        showNotification('Unable to share list. Please try again.', 'error');
        
        // Fallback: show share modal
        const shareData = ShareAPI.formatShareData(shoppingList, 'My Grocery List');
        ShareAPI.showShareModal(shareData);
    }
}

// Fallback share method
function fallbackShare(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Shopping list copied to clipboard!', 'success');
        }).catch(() => {
            showShareModal(text);
        });
    } else {
        showShareModal(text);
    }
}

// Show share modal as last resort
function showShareModal(text) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.5); display: flex; align-items: center;
        justify-content: center; z-index: 1000; padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 20px; border-radius: 12px; max-width: 400px; width: 100%;">
            <h3 style="margin: 0 0 15px 0;">Share Shopping List</h3>
            <textarea readonly style="width: 100%; height: 200px; margin-bottom: 15px; padding: 10px; border: 1px solid #ccc; border-radius: 8px; font-family: monospace;">${text}</textarea>
            <button onclick="this.parentElement.parentElement.remove()" style="background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; width: 100%;">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.querySelector('textarea').select();
}

// Setup search functionality
function setupSearchFunctionality() {
    const masterSearch = document.getElementById('search-master');
    const shoppingSearch = document.getElementById('search-shopping');
    
    if (masterSearch) {
        masterSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value;
            const allItems = Storage.getMasterList();
            const filteredItems = UI.filterItems(allItems, searchTerm);
            UI.renderMasterList(filteredItems);
        });
    }
    
    if (shoppingSearch) {
        shoppingSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value;
            const allItems = Storage.getShoppingList();
            const filteredItems = UI.filterItems(allItems, searchTerm);
            UI.renderShoppingList(filteredItems);
        });
    }
}

// Show notification to user
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 1000;
        padding: 12px 20px; border-radius: 8px; color: white;
        font-weight: 500; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateX(100%); transition: transform 0.3s ease;
    `;
    
    // Set background color based on type
    const colors = {
        success: '#059669',
        error: '#dc2626',
        warning: '#d97706',
        info: '#2563eb'
    };
    
    notification.style.backgroundColor = colors[type] || colors.info;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Show popup for empty shopping list
function showEmptyShoppingListPopup() {
    showNotification('Shopping list is empty. Add items to view it.', 'info');
}