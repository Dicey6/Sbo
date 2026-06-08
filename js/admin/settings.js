// ============================================
// ADMIN - PROJECT SETTINGS
// ============================================

// Load settings into admin form
async function loadSettingsForAdmin() {
    try {
        const { data, error } = await supabase
            .from('settings')
            .select('*')
            .eq('id', 1)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        
        if (data) {
            document.getElementById('setContractAddress').value = data.contract_address || '';
            document.getElementById('setOfficialX').value = data.official_x || '';
            document.getElementById('setCommunityX').value = data.community_x || '';
            document.getElementById('setTotalPool').value = data.total_pooled_sol || 25;
            document.getElementById('setShowStats').checked = data.show_token_stats || false;
        } else {
            // Default values
            document.getElementById('setTotalPool').value = 25;
        }
    } catch (error) {
        console.error('Error loading settings:', error);
        showToast('Error loading settings', 'error');
    }
}

// Save settings
async function saveSettings(event) {
    event.preventDefault();
    showLoading();
    
    const settings = {
        contract_address: document.getElementById('setContractAddress').value,
        official_x: document.getElementById('setOfficialX').value,
        community_x: document.getElementById('setCommunityX').value,
        total_pooled_sol: parseFloat(document.getElementById('setTotalPool').value) || 0,
        show_token_stats: document.getElementById('setShowStats').checked,
        updated_at: new Date()
    };
    
    try {
        const { error } = await supabase
            .from('settings')
            .upsert({ id: 1, ...settings });
        
        if (error) throw error;
        
        showToast('✅ Settings saved successfully!', 'success');
        
        // Update public page stats if visible
        if (settings.show_token_stats && settings.contract_address) {
            // Trigger public page update via localStorage or just notify
            localStorage.setItem('settingsUpdated', Date.now());
        }
        
    } catch (error) {
        console.error('Error saving settings:', error);
        showToast('Error saving settings', 'error');
    } finally {
        hideLoading();
    }
}

// Setup settings form listener
function setupSettingsListener() {
    const form = document.getElementById('settingsForm');
    if (form) {
        form.addEventListener('submit', saveSettings);
    }
}

// Make global
window.loadSettingsForAdmin = loadSettingsForAdmin;
window.saveSettings = saveSettings;
window.setupSettingsListener = setupSettingsListener;