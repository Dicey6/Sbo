// ============================================
// BOUNTIES - Load and Display
// ============================================

// Load all active bounties
async function loadBounties() {
    showLoading();
    
    try {
        const { data, error } = await supabase
            .from('bounties')
            .select('*')
            .in('status', ['active'])
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        displayBounties(data || []);
        
    } catch (error) {
        console.error('Error loading bounties:', error);
        showToast('Error loading bounties', 'error');
    } finally {
        hideLoading();
    }
}

// Display bounties in the grid
function displayBounties(bounties) {
    const container = document.getElementById('bountiesContainer');
    
    if (!container) return;
    
    if (bounties.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No active bounties available at the moment.</p>
                <p>Check back soon for new hunting opportunities!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = bounties.map(bounty => `
        <div class="bounty-card" data-bounty-id="${bounty.id}">
            <h3 class="bounty-title">${escapeHtml(bounty.title)}</h3>
            <p class="bounty-description">${escapeHtml(bounty.description)}</p>
            
            ${bounty.instructions ? `
                <div class="bounty-instructions">
                    <strong>📝 Instructions:</strong><br>
                    ${escapeHtml(bounty.instructions)}
                </div>
            ` : ''}
            
            <div class="bounty-details">
                <span class="bounty-reward">💰 ${bounty.reward_pool} SOL</span>
                <span class="bounty-status ${bounty.status}">${bounty.status.toUpperCase()}</span>
            </div>
            
            <button class="btn-submit" onclick="openSubmissionModal('${bounty.id}')">
                📤 Submit Entry
            </button>
            
            <div id="submissions-${bounty.id}" class="submissions-section">
                <div class="submissions-grid"></div>
            </div>
        </div>
    `).join('');
    
    // Load submissions for each bounty
    bounties.forEach(bounty => {
        loadSubmissions(bounty.id);
    });
}

// Helper to escape HTML
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Make global
window.loadBounties = loadBounties;