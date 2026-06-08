// ============================================
// ADMIN - MANAGE BOUNTIES
// ============================================

// Create new bounty
async function createBounty(event) {
    event.preventDefault();
    showLoading();
    
    const bounty = {
        title: document.getElementById('bountyTitle').value,
        description: document.getElementById('bountyDesc').value,
        instructions: document.getElementById('bountyInstructions').value,
        reward_pool: parseFloat(document.getElementById('bountyReward').value),
        status: document.getElementById('bountyStatus').value,
        created_at: new Date()
    };
    
    if (!bounty.title || !bounty.description || !bounty.instructions || !bounty.reward_pool) {
        showToast('Please fill all required fields', 'error');
        hideLoading();
        return;
    }
    
    try {
        const { error } = await supabase
            .from('bounties')
            .insert(bounty);
        
        if (error) throw error;
        
        showToast('✅ Bounty created successfully!', 'success');
        document.getElementById('createBountyForm').reset();
        await loadAllBountiesForAdmin();
        
    } catch (error) {
        console.error('Error creating bounty:', error);
        showToast('Error creating bounty', 'error');
    } finally {
        hideLoading();
    }
}

// Load all bounties for management
async function loadAllBountiesForAdmin() {
    try {
        const { data, error } = await supabase
            .from('bounties')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        displayManageBounties(data || []);
        
    } catch (error) {
        console.error('Error loading bounties:', error);
        showToast('Error loading bounties', 'error');
    }
}

// Display bounties in management section
function displayManageBounties(bounties) {
    const container = document.getElementById('manageBountiesList');
    
    if (!container) return;
    
    if (bounties.length === 0) {
        container.innerHTML = '<div class="empty-state">No bounties created yet</div>';
        return;
    }
    
    container.innerHTML = bounties.map(bounty => `
        <div class="manage-item">
            <div class="manage-item-info">
                <h4>${escapeHtml(bounty.title)}</h4>
                <p>💰 ${bounty.reward_pool} SOL | Status: <span style="color: ${getStatusColor(bounty.status)}">${bounty.status.toUpperCase()}</span></p>
                <small>📅 Created: ${new Date(bounty.created_at).toLocaleDateString()}</small>
                ${bounty.instructions ? `<small>📝 Has instructions</small>` : ''}
            </div>
            <div class="button-group">
                <button class="btn-secondary" onclick="editBounty('${bounty.id}')">✏️ Edit</button>
                <button class="btn-secondary" onclick="toggleBountyStatus('${bounty.id}', '${bounty.status}')">
                    ${bounty.status === 'active' ? '⏸️ Pause' : bounty.status === 'paused' ? '▶️ Activate' : '🔚 Ended'}
                </button>
                <button class="btn-danger" onclick="deleteBounty('${bounty.id}')">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

// Helper for status color
function getStatusColor(status) {
    switch(status) {
        case 'active': return '#14F195';
        case 'paused': return '#F59E0B';
        case 'ended': return '#EF4444';
        default: return '#9CA3AF';
    }
}

// Edit bounty
window.editBounty = async function(bountyId) {
    showLoading();
    
    try {
        const { data, error } = await supabase
            .from('bounties')
            .select('*')
            .eq('id', bountyId)
            .single();
        
        if (error) throw error;
        
        // Fill edit form
        document.getElementById('editId').value = data.id;
        document.getElementById('editTitle').value = data.title;
        document.getElementById('editDesc').value = data.description;
        document.getElementById('editInstructions').value = data.instructions || '';
        document.getElementById('editReward').value = data.reward_pool;
        document.getElementById('editStatus').value = data.status;
        
        // Show modal
        const modal = document.getElementById('editModal');
        modal.classList.remove('hidden');
        
    } catch (error) {
        console.error('Error loading bounty:', error);
        showToast('Error loading bounty', 'error');
    } finally {
        hideLoading();
    }
};

// Update bounty
async function updateBounty(event) {
    event.preventDefault();
    showLoading();
    
    const bountyId = document.getElementById('editId').value;
    const updatedBounty = {
        title: document.getElementById('editTitle').value,
        description: document.getElementById('editDesc').value,
        instructions: document.getElementById('editInstructions').value,
        reward_pool: parseFloat(document.getElementById('editReward').value),
        status: document.getElementById('editStatus').value
    };
    
    try {
        const { error } = await supabase
            .from('bounties')
            .update(updatedBounty)
            .eq('id', bountyId);
        
        if (error) throw error;
        
        showToast('✅ Bounty updated successfully!', 'success');
        document.getElementById('editModal').classList.add('hidden');
        await loadAllBountiesForAdmin();
        
    } catch (error) {
        console.error('Error updating bounty:', error);
        showToast('Error updating bounty', 'error');
    } finally {
        hideLoading();
    }
}

// Toggle bounty status
window.toggleBountyStatus = async function(bountyId, currentStatus) {
    let newStatus;
    if (currentStatus === 'active') newStatus = 'paused';
    else if (currentStatus === 'paused') newStatus = 'active';
    else return;
    
    showLoading();
    
    try {
        const { error } = await supabase
            .from('bounties')
            .update({ status: newStatus })
            .eq('id', bountyId);
        
        if (error) throw error;
        
        showToast(`Bounty ${newStatus === 'active' ? 'activated' : 'paused'}`, 'success');
        await loadAllBountiesForAdmin();
        
    } catch (error) {
        console.error('Error toggling status:', error);
        showToast('Error updating status', 'error');
    } finally {
        hideLoading();
    }
};

// Delete bounty
window.deleteBounty = async function(bountyId) {
    if (!confirm('⚠️ Are you sure you want to delete this bounty? This will also delete ALL submissions for this bounty.')) return;
    
    showLoading();
    
    try {
        const { error } = await supabase
            .from('bounties')
            .delete()
            .eq('id', bountyId);
        
        if (error) throw error;
        
        showToast('✅ Bounty deleted successfully!', 'success');
        await loadAllBountiesForAdmin();
        await loadAllSubmissionsForAdmin();
        
    } catch (error) {
        console.error('Error deleting bounty:', error);
        showToast('Error deleting bounty', 'error');
    } finally {
        hideLoading();
    }
};

// Setup create bounty listener
function setupCreateBountyListener() {
    const form = document.getElementById('createBountyForm');
    if (form) {
        form.addEventListener('submit', createBounty);
    }
}

// Setup edit bounty listener
function setupEditBountyListener() {
    const form = document.getElementById('editForm');
    if (form) {
        form.addEventListener('submit', updateBounty);
    }
}

// Make global
window.loadAllBountiesForAdmin = loadAllBountiesForAdmin;
window.displayManageBounties = displayManageBounties;
window.setupCreateBountyListener = setupCreateBountyListener;
window.setupEditBountyListener = setupEditBountyListener;