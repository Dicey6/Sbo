// ============================================
// ADMIN - SUBMISSIONS MODERATION
// ============================================

// Load all submissions for admin
async function loadAllSubmissionsForAdmin() {
    try {
        const { data, error } = await supabase
            .from('submissions')
            .select(`
                *,
                bounties (
                    title
                )
            `)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        displaySubmissionsForAdmin(data || []);
        
    } catch (error) {
        console.error('Error loading submissions:', error);
        showToast('Error loading submissions', 'error');
    }
}

// Display submissions in admin panel
function displaySubmissionsForAdmin(submissions) {
    const container = document.getElementById('submissionsList');
    
    if (!container) return;
    
    if (submissions.length === 0) {
        container.innerHTML = '<div class="empty-state">No submissions yet</div>';
        return;
    }
    
    container.innerHTML = submissions.map(sub => `
        <div class="submission-item">
            <div class="submission-item-info">
                <h4>🎭 ${escapeHtml(sub.nickname)}</h4>
                <p><strong>Bounty:</strong> ${escapeHtml(sub.bounties?.title || 'Unknown')}</p>
                ${sub.note ? `<p><strong>Note:</strong> ${escapeHtml(sub.note)}</p>` : ''}
                <p><strong>Status:</strong> <span style="color: ${sub.approved ? '#10B981' : '#F59E0B'}">${sub.approved ? '✅ Approved' : '⏳ Pending'}</span></p>
                <small>📅 Submitted: ${new Date(sub.created_at).toLocaleString()}</small>
                <div class="media-preview-mini" style="margin-top: 8px;">
                    <a href="${sub.media_url}" target="_blank" style="color: #14F195;">
                        ${sub.media_type === 'image' ? '📷 View Image' : '🎥 View Video'}
                    </a>
                </div>
            </div>
            <div class="button-group">
                <button class="btn-secondary" onclick="toggleApproveSubmission('${sub.id}', ${!sub.approved})">
                    ${sub.approved ? '❌ Reject' : '✅ Approve'}
                </button>
                <button class="btn-danger" onclick="deleteSubmission('${sub.id}', '${sub.media_url}')">
                    🗑️ Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Toggle approval status
window.toggleApproveSubmission = async function(submissionId, approve) {
    showLoading();
    
    try {
        const { error } = await supabase
            .from('submissions')
            .update({ approved: approve })
            .eq('id', submissionId);
        
        if (error) throw error;
        
        showToast(`✅ Submission ${approve ? 'approved' : 'rejected'}`, 'success');
        await loadAllSubmissionsForAdmin();
        
    } catch (error) {
        console.error('Error updating submission:', error);
        showToast('Error updating submission', 'error');
    } finally {
        hideLoading();
    }
};

// Delete submission
window.deleteSubmission = async function(submissionId, mediaUrl) {
    if (!confirm('⚠️ Are you sure you want to delete this submission?')) return;
    
    showLoading();
    
    try {
        // Delete from storage if media exists
        if (mediaUrl && mediaUrl.includes('supabase')) {
            await deleteFile(mediaUrl);
        }
        
        // Delete from database
        const { error } = await supabase
            .from('submissions')
            .delete()
            .eq('id', submissionId);
        
        if (error) throw error;
        
        showToast('✅ Submission deleted successfully!', 'success');
        await loadAllSubmissionsForAdmin();
        
    } catch (error) {
        console.error('Error deleting submission:', error);
        showToast('Error deleting submission', 'error');
    } finally {
        hideLoading();
    }
};

// Setup real-time listener for submissions (admin)
function setupRealtimeSubscriptions() {
    supabase
        .channel('admin_submissions')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'submissions' }, 
            () => {
                loadAllSubmissionsForAdmin();
            }
        )
        .subscribe();
    
    supabase
        .channel('admin_bounties')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'bounties' }, 
            () => {
                loadAllBountiesForAdmin();
            }
        )
        .subscribe();
}

// Make global
window.loadAllSubmissionsForAdmin = loadAllSubmissionsForAdmin;
window.displaySubmissionsForAdmin = displaySubmissionsForAdmin;
window.setupRealtimeSubscriptions = setupRealtimeSubscriptions;