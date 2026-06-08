// ============================================
// MAIN - Initialize Public Page
// ============================================

// Load settings from Supabase
async function loadSettings() {
    try {
        const { data, error } = await supabase
            .from('settings')
            .select('*')
            .eq('id', 1)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        
        if (data) {
            // Update contract address
            const contractEl = document.getElementById('contractAddress');
            if (contractEl) {
                contractEl.textContent = data.contract_address || 'Not set';
            }
            
            // Update X links
            const officialX = document.getElementById('officialX');
            const communityX = document.getElementById('communityX');
            
            if (officialX) {
                officialX.href = data.official_x || '#';
                officialX.textContent = data.official_x || 'Not set';
            }
            
            if (communityX) {
                communityX.href = data.community_x || '#';
                communityX.textContent = data.community_x || 'Not set';
            }
            
            // Update total pooled SOL bar
            const totalPool = data.total_pooled_sol || 25;
            const poolAmount = document.getElementById('totalPoolAmount');
            const progressFill = document.getElementById('progressFill');
            
            if (poolAmount) poolAmount.textContent = `${totalPool} SOL`;
            if (progressFill) {
                // Max visual at 1000 SOL for full bar
                const percentage = Math.min((totalPool / 1000) * 100, 100);
                progressFill.style.width = `${percentage}%`;
                progressFill.textContent = percentage > 15 ? `${totalPool} SOL` : '';
            }
            
            // Show/hide token stats section
            const statsSection = document.getElementById('tokenStatsSection');
            if (data.show_token_stats && data.contract_address && data.contract_address !== 'Not set') {
                statsSection.classList.remove('hidden');
                fetchDexData(data.contract_address);
            } else {
                statsSection.classList.add('hidden');
            }
        }
        
    } catch (error) {
        console.error('Error loading settings:', error);
        showToast('Error loading settings', 'error');
    }
}

// Setup real-time listener for new submissions
function setupRealtimeListener() {
    supabase
        .channel('submissions_changes')
        .on('postgres_changes', 
            { event: 'INSERT', schema: 'public', table: 'submissions' }, 
            (payload) => {
                // Reload submissions for affected bounty
                if (payload.new && payload.new.bounty_id && payload.new.approved) {
                    loadSubmissions(payload.new.bounty_id);
                }
            }
        )
        .subscribe();
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Sol Bounty - Public Page Initializing...');
    
    // Setup UI
    setupUIEventListeners();
    setupSubmissionListener();
    
    // Load data
    await loadSettings();
    await loadBounties();
    
    // Setup real-time
    setupRealtimeListener();
    
    console.log('Sol Bounty - Ready!');
});