const MASTER_LIST_KEY = 'masterList';
const SHOPPING_LIST_KEY = 'shoppingList';

function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

// Master List Functions
function getMasterList() {
    return getFromLocalStorage(MASTER_LIST_KEY);
}

function addItemToMasterList(item) {
    const masterList = getMasterList();
    const newItem = {
        id: Date.now(),
        name: item.name,
        category: item.category || 'Other',
        quantity: item.quantity || 1
    };
    masterList.push(newItem);
    saveToLocalStorage(MASTER_LIST_KEY, masterList);
    return newItem;
}

function deleteItemFromMasterList(itemId) {
    const masterList = getMasterList();
    const filteredList = masterList.filter(item => item.id !== itemId);
    saveToLocalStorage(MASTER_LIST_KEY, filteredList);
}

// Shopping List Functions
function getShoppingList() {
    return getFromLocalStorage(SHOPPING_LIST_KEY);
}

function addItemToShoppingList(item) {
    const shoppingList = getShoppingList();
    const newItem = {
        ...item,
        completed: false,
        addedAt: Date.now()
    };
    shoppingList.push(newItem);
    saveToLocalStorage(SHOPPING_LIST_KEY, shoppingList);
    return newItem;
}

function toggleItemCompleted(itemId) {
    const shoppingList = getShoppingList();
    const updatedList = shoppingList.map(item => 
        item.id === itemId ? {...item, completed: !item.completed} : item
    );
    saveToLocalStorage(SHOPPING_LIST_KEY, updatedList);
}

function clearCompletedItems() {
    const shoppingList = getShoppingList();
    const activeItems = shoppingList.filter(item => !item.completed);
    saveToLocalStorage(SHOPPING_LIST_KEY, activeItems);
}

function clearAllItems() {
    saveToLocalStorage(SHOPPING_LIST_KEY, []);
}

// Legacy function names for compatibility with existing ui.js
function addItemToStorage(item) {
    return addItemToMasterList(item);
}

function getItemsFromStorage() {
    return getMasterList();
}

// Make functions available globally
window.Storage = {
    getMasterList,
    addItemToMasterList,
    deleteItemFromMasterList,
    getShoppingList,
    addItemToShoppingList,
    toggleItemCompleted,
    clearCompletedItems,
    clearAllItems,
    addItemToStorage,
    getItemsFromStorage
};