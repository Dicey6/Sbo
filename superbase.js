// ============================================
// SUPABASE CONFIGURATION - SOL BOUNTY
// ============================================

const SUPABASE_URL = 'https://jsrmgdaqqovdvrsfdyfb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impzcm1nZGFxcW92ZHZyc2ZkeWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MjUxOTYsImV4cCI6MjA5NjUwMTE5Nn0.LwRM51qKUUaAv8TbO1Hv8X9454es6Ao35VDgSqKH4OM';

// Initialize Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Storage bucket name
const STORAGE_BUCKET = 'bounty-media';

// ============================================
// HELPER FUNCTIONS
// ============================================

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

function showLoading() {
    const loader = document.getElementById('loading');
    if (loader) loader.classList.remove('hidden');
}

function hideLoading() {
    const loader = document.getElementById('loading');
    if (loader) loader.classList.add('hidden');
}

async function uploadFile(file, bountyId) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${bountyId}/${Date.now()}.${fileExt}`;
    const filePath = `submissions/${fileName}`;
    
    const { data, error } = await supabaseClient.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabaseClient.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);
    
    return publicUrl;
}

async function deleteFile(fileUrl) {
    if (!fileUrl) return;
    const filePath = fileUrl.split('/').slice(-3).join('/');
    const { error } = await supabaseClient.storage
        .from(STORAGE_BUCKET)
        .remove([filePath]);
    if (error) console.error('Error deleting file:', error);
}

function copyToClipboard() {
    const contractElement = document.getElementById('contractAddress');
    if (!contractElement) return;
    const text = contractElement.textContent;
    navigator.clipboard.writeText(text).then(() => {
        showToast('Contract address copied!', 'success');
    }).catch(() => {
        showToast('Failed to copy', 'error');
    });
}

// Make functions available globally
window.showToast = showToast;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.uploadFile = uploadFile;
window.deleteFile = deleteFile;
window.copyToClipboard = copyToClipboard;
window.supabase = supabaseClient;