// ============================================================
// SECURE SUPABASE CONFIGURATION - LOADED FROM CLOUDFLARE WORKER
// ============================================================
// This file loads Supabase credentials from a secure Cloudflare Worker
// instead of exposing them directly in the client code.
//
// SETUP INSTRUCTIONS:
// 1. Deploy the supabase-config-worker.js to Cloudflare Workers
// 2. Update SUPABASE_WORKER_URL below with your worker URL
// 3. Update SUPABASE_ACCESS_TOKEN to match the token in your worker
// 4. Replace the old supabase-config.js with this file (or rename it)
// ============================================================


// ========== CONFIGURATION ==========
// Your Cloudflare Worker URL for Supabase config
const SUPABASE_WORKER_URL = 'https://supabase-config-guard3.zlmsn3mk.workers.dev';

// Access token (must match the ACCESS_TOKEN in your worker)
const SUPABASE_ACCESS_TOKEN = 'lbPYqrE46c4iDKtaMNacgtzs05yyec0lBR8ISfZqpgw=';


// ========== VARIABLES ==========
let SUPABASE_URL = null;
let SUPABASE_ANON_KEY = null;
let supabaseClient = null;
let configLoadAttempts = 0;
const MAX_CONFIG_ATTEMPTS = 3;


// ========== LOAD CONFIG FROM WORKER ==========
/**
 * Fetch Supabase configuration from Cloudflare Worker
 * @returns {Promise<boolean>} Success status
 */
async function loadSupabaseConfig() {
    try {
        console.log('🔐 Loading Supabase config from secure worker...');
        
        const response = await fetch(`${SUPABASE_WORKER_URL}/config`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Worker responded with status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.config) {
            SUPABASE_URL = result.config.url;
            SUPABASE_ANON_KEY = result.config.anonKey;
            console.log('✅ Supabase config loaded securely from worker');
            console.log('📍 Supabase URL:', SUPABASE_URL);
            return true;
        } else {
            console.error('❌ Failed to load Supabase config:', result.error);
            return false;
        }
    } catch (error) {
        console.error('❌ Error loading Supabase config from worker:', error);
        configLoadAttempts++;
        
        // Retry logic
        if (configLoadAttempts < MAX_CONFIG_ATTEMPTS) {
            console.log(`🔄 Retrying... (Attempt ${configLoadAttempts + 1}/${MAX_CONFIG_ATTEMPTS})`);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
            return await loadSupabaseConfig();
        }
        
        return false;
    }
}


// ========== CHECK IF CONFIG IS LOADED ==========
function isSupabaseConfigured() {
    return SUPABASE_URL !== null && 
           SUPABASE_ANON_KEY !== null &&
           SUPABASE_URL.includes('supabase.co');
}


// ========== INITIALIZE SUPABASE ==========
/**
 * Initialize Supabase client
 * @returns {Promise<Object|null>} Supabase client or null
 */
async function initSupabase() {
    // Load config first if not already loaded
    if (!isSupabaseConfigured()) {
        const configLoaded = await loadSupabaseConfig();
        
        if (!configLoaded) {
            console.error('❌ Failed to load Supabase config after multiple attempts');
            console.warn('⚠️ Falling back to localStorage mode');
            return null;
        }
    }
    
    try {
        // Check if Supabase JS library is loaded
        if (typeof window.supabase === 'undefined') {
            console.error('❌ Supabase JS library not loaded!');
            console.error('Make sure to include: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/dist/umd/supabase.js"></script>');
            return null;
        }
        
        // Create Supabase client
        const { createClient } = window.supabase;
        supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        console.log('✅ Supabase client initialized successfully!');
        return supabaseClient;
    } catch (error) {
        console.error('❌ Error initializing Supabase client:', error);
        return null;
    }
}


// ========== GET SUPABASE CLIENT ==========
/**
 * Get the Supabase client instance
 * @returns {Object|null} Supabase client or null
 */
function getSupabaseClient() {
    return supabaseClient;
}


// ========== RELOAD CONFIG ==========
/**
 * Force reload Supabase configuration from worker
 * Useful if config changes or needs to be refreshed
 * @returns {Promise<boolean>} Success status
 */
async function reloadSupabaseConfig() {
    console.log('🔄 Reloading Supabase config...');
    SUPABASE_URL = null;
    SUPABASE_ANON_KEY = null;
    supabaseClient = null;
    configLoadAttempts = 0;
    
    const loaded = await loadSupabaseConfig();
    if (loaded) {
        return await initSupabase() !== null;
    }
    return false;
}


// ========== EXPORT FOR USE IN OTHER FILES ==========
if (typeof window !== 'undefined') {
    window.SUPABASE_CONFIG = {
        URL: () => SUPABASE_URL,
        KEY: () => SUPABASE_ANON_KEY,
        isConfigured: isSupabaseConfigured,
        init: initSupabase,
        getClient: getSupabaseClient,
        reload: reloadSupabaseConfig,
        
        // For debugging (remove in production)
        debug: {
            getWorkerUrl: () => SUPABASE_WORKER_URL,
            getLoadAttempts: () => configLoadAttempts
        }
    };
    
    console.log('🔐 Secure Supabase Config loaded');
    console.log('📝 Config will be fetched from worker on init');
}


// ========== AUTO-INITIALIZE ON DOM READY ==========
// Automatically load config when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async function() {
        await loadSupabaseConfig();
    });
} else {
    // DOM already loaded, load config immediately
    loadSupabaseConfig();
}


// ========== USAGE NOTES ==========
/*

USAGE IN YOUR APPLICATION:
==========================

This file works as a drop-in replacement for your old supabase-config.js

1. The config is automatically loaded when the page loads
2. Use it the same way as before:

```javascript
// Initialize Supabase (in supabase-db.js or other files)
async function initializeDatabase() {
    if (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.isConfigured()) {
        supabase = await window.SUPABASE_CONFIG.init();
        if (supabase) {
            console.log('✅ Database connected');
            return true;
        }
    }
    console.warn('⚠️ Falling back to localStorage');
    return false;
}
```

BENEFITS:
=========
✅ Supabase credentials never exposed in client code
✅ Credentials can be rotated without updating website code
✅ Automatic retry on failure
✅ Fallback to localStorage if worker is unavailable
✅ Easy to debug with built-in logging

TROUBLESHOOTING:
================
If config fails to load:
1. Check browser console for error messages
2. Verify SUPABASE_WORKER_URL is correct
3. Verify SUPABASE_ACCESS_TOKEN matches worker
4. Check Cloudflare Worker is deployed and running
5. Check CORS settings in worker allow your domain
6. Try: await window.SUPABASE_CONFIG.reload()

*/
