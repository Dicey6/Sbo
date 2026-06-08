// ============================================
// UI HANDLERS - Modals, Preview, Forms
// ============================================

// Open submission modal
function openSubmissionModal(bountyId) {
    const modal = document.getElementById('submissionModal');
    const bountyIdInput = document.getElementById('submitBountyId');
    
    bountyIdInput.value = bountyId;
    modal.classList.remove('hidden');
    
    // Reset form
    const form = document.getElementById('submissionForm');
    form.reset();
    const preview = document.getElementById('mediaPreview');
    preview.classList.add('hidden');
    preview.innerHTML = '';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('submissionModal');
    modal.classList.add('hidden');
}

// Preview image/video before upload
function previewMedia(file) {
    const preview = document.getElementById('mediaPreview');
    
    if (!file) {
        preview.classList.add('hidden');
        preview.innerHTML = '';
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        if (file.type.startsWith('image/')) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        } else if (file.type.startsWith('video/')) {
            preview.innerHTML = `<video src="${e.target.result}" controls></video>`;
        }
        preview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

// Setup event listeners for UI
function setupUIEventListeners() {
    // Modal close button
    const closeBtn = document.querySelector('#submissionModal .modal-close');
    if (closeBtn) {
        closeBtn.onclick = closeModal;
    }
    
    // Click outside modal to close
    window.onclick = (event) => {
        const modal = document.getElementById('submissionModal');
        if (event.target === modal) {
            closeModal();
        }
    };
    
    // Media file preview
    const mediaInput = document.getElementById('mediaFile');
    if (mediaInput) {
        mediaInput.addEventListener('change', (e) => {
            previewMedia(e.target.files[0]);
        });
    }
}

// Make functions global
window.openSubmissionModal = openSubmissionModal;
window.closeModal = closeModal;