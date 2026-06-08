// ============================================
// ADMIN - MAIN (Auth & Initialization)
// ============================================

const ADMIN_PASSWORD = 'Jmelodies@20';
let isAdminVerified = false;

// Setup password gate
function setupPasswordGate() {
    const verifyBtn = document.getElementById('verifyBtn');
    const passwordInput = document.getElementById('adminPassword');
    const gate = document.getElementById('passwordGate');
    const dashboard = document.getElementById('adminDashboard');
    const errorMsg = document.getElementById('passwordError');
    
    verifyBtn.addEventListener('click', () => {
        const enteredPassword = passwordInput.value;
        
        if (enteredPassword === ADMIN_PASSWORD) {
            isAdminVerified = true;
            gate.classList.add('hidden');
            dashboard.classList.remove('hidden');
            initializeAdminDashboard();
            showToast('✅ Access granted! Welcome, Admin.', 'success');
        } else {
            errorMsg.classList.remove('hidden');
            setTimeout(() => errorMsg.classList.add('hidden'), 3000);
            passwordInput.value = '';
        }
    });
    
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') verifyBtn.click();
    });
}

// Initialize admin dashboard
async function initializeAdminDashboard() {
    showLoading();
    
    try {
        // Load all data
        await loadSettingsForAdmin();
        await loadAllBountiesForAdmin();
        await loadAllSubmissionsForAdmin();
        
        // Setup real-time listeners
        setupRealtimeSubscriptions();
        
        // Close edit modal when clicking outside
        setupModalClose();
        
        showToast('📊 Dashboard ready', 'success');
        
    } catch (error) {
        console.error('Error initializing admin:', error);
        showToast('Error loading admin data', 'error');
    } finally {
        hideLoading();
    }
}

// Setup modal close functionality
function setupModalClose() {
    const editModal = document.getElementById('editModal');
    const closeBtn = editModal.querySelector('.modal-close');
    
    closeBtn.onclick = () => {
        editModal.classList.add('hidden');
    };
    
    window.onclick = (event) => {
        if (event.target === editModal) {
            editModal.classList.add('hidden');
        }
    };
}

// Logout function
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', () => {
        isAdminVerified = false;
        document.getElementById('passwordGate').classList.remove('hidden');
        document.getElementById('adminDashboard').classList.add('hidden');
        document.getElementById('adminPassword').value = '';
        showToast('👋 Logged out successfully', 'success');
    });
}

// Initialize everything when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Sol Bounty - Admin Panel Initializing...');
    
    // Setup all event listeners
    setupPasswordGate();
    setupLogout();
    setupSettingsListener();
    setupCreateBountyListener();
    setupEditBountyListener();
    
    console.log('Sol Bounty - Admin Panel Ready');
});