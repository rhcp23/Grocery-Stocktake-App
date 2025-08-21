// Web Share API integration for the grocery shopping app

// Enhanced share functionality with fallbacks
const ShareAPI = {
    // Check if Web Share API is supported
    isSupported() {
        return 'share' in navigator;
    },

    // Share shopping list with native sharing
    async shareList(items, title = 'My Shopping List') {
        if (items.length === 0) {
            throw new Error('Shopping list is empty');
        }

        const shareData = this.formatShareData(items, title);
        
        if (this.isSupported()) {
            try {
                await navigator.share(shareData);
                return { success: true, method: 'native' };
            } catch (error) {
                if (error.name === 'AbortError') {
                    return { success: false, reason: 'cancelled' };
                }
                throw error;
            }
        } else {
            // Fallback to clipboard or manual sharing
            return this.fallbackShare(shareData.text);
        }
    },

    // Format shopping list data for sharing
    formatShareData(items, title) {
        const activeItems = items.filter(item => !item.completed);
        const completedItems = items.filter(item => item.completed);
        
        let text = `🛒 ${title}\n`;
        text += `Generated: ${new Date().toLocaleDateString()}\n\n`;
        
        if (activeItems.length > 0) {
            text += `📝 To Buy (${activeItems.length} items):\n`;
            activeItems.forEach(item => {
                text += `• ${item.name}`;
                if (item.quantity > 1) text += ` (${item.quantity})`;
                if (item.category) text += ` - ${item.category}`;
                text += '\n';
            });
            text += '\n';
        }
        
        if (completedItems.length > 0) {
            text += `✅ Completed (${completedItems.length} items):\n`;
            completedItems.forEach(item => {
                text += `• ${item.name}`;
                if (item.quantity > 1) text += ` (${item.quantity})`;
                text += '\n';
            });
        }

        return {
            title: title,
            text: text,
            url: window.location.href
        };
    },

    // Fallback sharing methods
    async fallbackShare(text) {
        // Try clipboard first
        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(text);
                return { success: true, method: 'clipboard' };
            } catch (error) {
                console.warn('Clipboard write failed:', error);
            }
        }

        // Create a shareable link (mailto, SMS, etc.)
        const encodedText = encodeURIComponent(text);
        const shareOptions = {
            email: `mailto:?subject=My Shopping List&body=${encodedText}`,
            sms: `sms:?body=${encodedText}`,
            whatsapp: `https://wa.me/?text=${encodedText}`,
            telegram: `https://t.me/share/url?text=${encodedText}`
        };

        return { success: true, method: 'manual', options: shareOptions, text };
    },

    // Show sharing options modal
    showShareModal(shareData) {
        const modal = document.createElement('div');
        modal.className = 'share-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5); display: flex; align-items: center;
            justify-content: center; z-index: 1000; padding: 20px;
            animation: fadeIn 0.3s ease;
        `;
        
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const bgColor = isDark ? '#1e293b' : '#ffffff';
        const textColor = isDark ? '#f1f5f9' : '#1e293b';
        
        modal.innerHTML = `
            <div style="
                background: ${bgColor}; 
                color: ${textColor}; 
                padding: 24px; 
                border-radius: 16px; 
                max-width: 500px; 
                width: 100%; 
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                animation: slideUp 0.3s ease;
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0; font-size: 1.25rem; font-weight: 600;">Share Shopping List</h3>
                    <button class="close-modal" style="
                        background: none; 
                        border: none; 
                        font-size: 24px; 
                        cursor: pointer; 
                        color: ${textColor};
                        padding: 4px;
                        border-radius: 4px;
                    ">×</button>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">Share via:</label>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; margin-bottom: 16px;">
                        <button class="share-btn" data-method="email" style="
                            background: #059669; color: white; border: none; padding: 12px; 
                            border-radius: 8px; cursor: pointer; font-weight: 500;
                            display: flex; align-items: center; justify-content: center; gap: 8px;
                        ">📧 Email</button>
                        <button class="share-btn" data-method="sms" style="
                            background: #2563eb; color: white; border: none; padding: 12px; 
                            border-radius: 8px; cursor: pointer; font-weight: 500;
                            display: flex; align-items: center; justify-content: center; gap: 8px;
                        ">💬 SMS</button>
                        <button class="share-btn" data-method="whatsapp" style="
                            background: #25d366; color: white; border: none; padding: 12px; 
                            border-radius: 8px; cursor: pointer; font-weight: 500;
                            display: flex; align-items: center; justify-content: center; gap: 8px;
                        ">📱 WhatsApp</button>
                        <button class="share-btn copy-btn" style="
                            background: #64748b; color: white; border: none; padding: 12px; 
                            border-radius: 8px; cursor: pointer; font-weight: 500;
                            display: flex; align-items: center; justify-content: center; gap: 8px;
                        ">📋 Copy</button>
                    </div>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 8px; font-weight: 500;">Preview:</label>
                    <textarea readonly style="
                        width: 100%; height: 150px; padding: 12px; 
                        border: 2px solid #e2e8f0; border-radius: 8px; 
                        font-family: monospace; font-size: 14px; resize: vertical;
                        background: ${isDark ? '#0f172a' : '#f8fafc'};
                        color: ${textColor};
                    ">${shareData.text}</textarea>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => modal.remove());
        
        const shareButtons = modal.querySelectorAll('.share-btn');
        shareButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const method = e.target.getAttribute('data-method');
                if (method === 'copy') {
                    this.copyToClipboard(shareData.text);
                } else {
                    this.openShareMethod(method, shareData);
                }
            });
        });
        
        const copyBtn = modal.querySelector('.copy-btn');
        copyBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(shareData.text);
                copyBtn.textContent = '✅ Copied!';
                copyBtn.style.background = '#059669';
                setTimeout(() => {
                    copyBtn.innerHTML = '📋 Copy';
                    copyBtn.style.background = '#64748b';
                }, 2000);
            } catch (error) {
                console.error('Copy failed:', error);
                // Select text as fallback
                const textarea = modal.querySelector('textarea');
                textarea.select();
                textarea.setSelectionRange(0, 99999);
            }
        });
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        
        // Focus first button
        modal.querySelector('.share-btn').focus();
    },

    // Open specific share method
    openShareMethod(method, shareData) {
        const encodedText = encodeURIComponent(shareData.text);
        const encodedTitle = encodeURIComponent(shareData.title);
        
        const urls = {
            email: `mailto:?subject=${encodedTitle}&body=${encodedText}`,
            sms: `sms:?body=${encodedText}`,
            whatsapp: `https://wa.me/?text=${encodedText}`,
            telegram: `https://t.me/share/url?text=${encodedText}`
        };
        
        if (urls[method]) {
            window.open(urls[method], '_blank');
        }
    },

    // Copy to clipboard utility
    async copyToClipboard(text) {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(text);
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    }
};

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes slideUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    
    .share-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .share-btn:active {
        transform: translateY(0);
    }
`;
document.head.appendChild(style);

// Make ShareAPI available globally
window.ShareAPI = ShareAPI;

document.addEventListener('DOMContentLoaded', () => {
    const shareButton = document.getElementById('share-button');
    const shoppingList = document.getElementById('shopping-list');

    shareButton.addEventListener('click', async () => {
        const items = Array.from(shoppingList.children).map(item => ({
            name: item.textContent,
            completed: item.classList.contains('completed'),
            quantity: item.dataset.quantity ? parseInt(item.dataset.quantity) : 1,
            category: item.dataset.category || null
        }));

        try {
            const result = await ShareAPI.shareList(items);
            if (result.success) {
                console.log('Share successful via', result.method);
            } else if (result.method === 'manual') {
                ShareAPI.showShareModal(result);
            }
        } catch (error) {
            console.error('Error sharing:', error);
            alert('An error occurred while trying to share the list.');
        }
    });
});