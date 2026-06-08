// ============================================
// SUBMISSIONS - Submit and Display
// ============================================

// Load submissions for a specific bounty
async function loadSubmissions(bountyId) {
    try {
        const { data, error } = await supabase
            .from('submissions')
            .select('*')
            .eq('bounty_id', bountyId)
            .eq('approved', true)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        displaySubmissions(bountyId, data || []);
        
    } catch (error) {
        console.error('Error loading submissions:', error);
    }
}

// Display submissions for a bounty
function displaySubmissions(bountyId, submissions) {
    const container = document.querySelector(`#submissions-${bountyId} .submissions-grid`);
    
    if (!container) return;
    
    if (submissions.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #9CA3AF; margin-top: 20px;">No submissions yet. Be the first!</p>';
        return;
    }
    
    container.innerHTML = submissions.map(sub => `
        <div class="submission-card">
            ${sub.media_type === 'image' ? 
                `<img src="${sub.media_url}" alt="Submission" class="submission-media" loading="lazy">` :
                `<video src="${sub.media_url}" controls class="submission-media" preload="metadata"></video>`
            }
            <div class="submission-nickname">🏆 ${escapeHtml(sub.nickname)}</div>
            ${sub.note ? `<div class="submission-note">💬 ${escapeHtml(sub.note)}</div>` : ''}
            <div class="submission-date">📅 ${new Date(sub.created_at).toLocaleDateString()}</div>
        </div>
    `).join('');
}

// Handle submission form
async function handleSubmission(event) {
    event.preventDefault();
    
    const bountyId = document.getElementById('submitBountyId').value;
    const nickname = document.getElementById('nickname').value.trim();
    const mediaFile = document.getElementById('mediaFile').files[0];
    const note = document.getElementById('submissionNote').value.trim();
    
    if (!nickname) {
        showToast('Please enter a nickname', 'error');
        return;
    }
    
    if (!mediaFile) {
        showToast('Please upload an image or video', 'error');
        return;
    }
    
    if (mediaFile.size > 10 * 1024 * 1024) {
        showToast('File size must be less than 10MB', 'error');
        return;
    }
    
    showLoading();
    
    try {
        // Upload file
        const mediaUrl = await uploadFile(mediaFile, bountyId);
        const mediaType = mediaFile.type.startsWith('image/') ? 'image' : 'video';
        
        // Save to database
        const { error } = await supabase
            .from('submissions')
            .insert({
                bounty_id: bountyId,
                nickname: nickname,
                media_url: mediaUrl,
                media_type: mediaType,
                note: note || null,
                approved: true,
                created_at: new Date()
            });
        
        if (error) throw error;
        
        showToast('Submission successful!', 'success');
        closeModal();
        
        // Reload submissions for this bounty
        loadSubmissions(bountyId);
        
        // Reset form
        document.getElementById('submissionForm').reset();
        document.getElementById('mediaPreview').classList.add('hidden');
        
    } catch (error) {
        console.error('Error submitting:', error);
        showToast('Error submitting entry', 'error');
    } finally {
        hideLoading();
    }
}

// Setup submission form listener
function setupSubmissionListener() {
    const form = document.getElementById('submissionForm');
    if (form) {
        form.addEventListener('submit', handleSubmission);
    }
}

// Make global
window.loadSubmissions = loadSubmissions;
window.setupSubmissionListener = setupSubmissionListener;