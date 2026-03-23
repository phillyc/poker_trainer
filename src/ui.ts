/**
 * Show a toast notification
 */
export function showToast(message: string, type: 'success' | 'error'): void {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Remove after animation
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 2000);
}

/**
 * Show a confirmation dialog using a modal
 * Returns a Promise that resolves to true if confirmed, false if cancelled
 */
export function showConfirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'confirm-modal-overlay';
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'confirm-modal';
        
        // Create message
        const messageDiv = document.createElement('div');
        messageDiv.className = 'confirm-message';
        messageDiv.textContent = message;
        
        // Create buttons container
        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'confirm-buttons';
        
        // Create confirm button
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'confirm-btn confirm-btn-ok';
        confirmBtn.textContent = 'OK';
        confirmBtn.addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(true);
        });
        
        // Create cancel button
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'confirm-btn confirm-btn-cancel';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(false);
        });
        
        // Assemble modal
        buttonsDiv.appendChild(confirmBtn);
        buttonsDiv.appendChild(cancelBtn);
        modal.appendChild(messageDiv);
        modal.appendChild(buttonsDiv);
        overlay.appendChild(modal);
        
        // Add to DOM
        document.body.appendChild(overlay);
        
        // Trigger animation
        setTimeout(() => {
            overlay.classList.add('show');
        }, 10);
        
        // Handle escape key
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                document.body.removeChild(overlay);
                document.removeEventListener('keydown', handleEscape);
                resolve(false);
            }
        };
        document.addEventListener('keydown', handleEscape);
    });
}

/**
 * Setup mobile navigation toggle
 */
export function setupMobileNavigation(): void {
    const mobileNavToggle = document.getElementById('mobile-nav-toggle');
    const navBar = document.getElementById('nav-bar');
    const navBackdrop = document.getElementById('nav-backdrop');
    const hamburgerIcon = mobileNavToggle?.querySelector('.hamburger-icon') as HTMLElement;
    const closeIcon = mobileNavToggle?.querySelector('.close-icon') as HTMLElement;
    
    if (!mobileNavToggle || !navBar || !navBackdrop) return;
    
    function openNav(): void {
        navBar!.classList.add('mobile-open');
        navBackdrop!.classList.add('show');
        if (hamburgerIcon) hamburgerIcon.style.display = 'none';
        if (closeIcon) closeIcon.style.display = 'block';
        // Prevent body scroll when nav is open
        document.body.style.overflow = 'hidden';
    }
    
    function closeNav(): void {
        navBar!.classList.remove('mobile-open');
        navBackdrop!.classList.remove('show');
        if (hamburgerIcon) hamburgerIcon.style.display = 'block';
        if (closeIcon) closeIcon.style.display = 'none';
        // Restore body scroll
        document.body.style.overflow = '';
    }
    
    // Toggle nav on button click
    mobileNavToggle.addEventListener('click', () => {
        if (navBar.classList.contains('mobile-open')) {
            closeNav();
        } else {
            openNav();
        }
    });
    
    // Close nav on backdrop click
    navBackdrop.addEventListener('click', () => {
        closeNav();
    });
    
    // Close nav when clicking a nav button (optional - for better UX)
    const navButtons = navBar.querySelectorAll('.nav-button, .preset-button, .mode-toggle-btn');
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Small delay to allow the action to complete
            setTimeout(() => {
                closeNav();
            }, 300);
        });
    });
    
    // Close nav on window resize (if resizing to desktop)
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeNav();
        }
    });
}
