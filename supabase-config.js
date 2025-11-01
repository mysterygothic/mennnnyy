// ============================================================
// CLOUDFLARE WORKER: SUPABASE CONFIG PROTECTION
// ============================================================
// This worker securely serves Supabase credentials without exposing them
// in the client-side code. Deploy this to Cloudflare Workers.
//
// DEPLOYMENT INSTRUCTIONS:
// 1. Go to Cloudflare Dashboard → Workers & Pages
// 2. Create a new Worker named: supabase-config-guard
// 3. Copy this entire code
// 4. Add your Supabase credentials in the CONFIGURATION section below
// 5. Deploy the worker
// 6. Note the worker URL (e.g., https://supabase-config-guard.YOUR-SUBDOMAIN.workers.dev)
// ============================================================


// ========== CONFIGURATION ==========
// ⚠️ IMPORTANT: Replace these with your actual Supabase credentials!
const SUPABASE_CONFIG = {
    url: 'https://noooysoqieuuaogrhlty.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vb295c29xaWV1dWFvZ3JobHR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEyNTExMjgsImV4cCI6MjA3NjgyNzEyOH0.W9EexKNYoErZf_8DmiBv0KfvYKy-pbBlvC3lMVEf7Bc'
};

// Allowed origins (domains that can access this worker)
const ALLOWED_ORIGINS = [
    'https://sheikh-resturant.com',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'http://localhost:5500',
    'http://127.0.0.1:5500'
];

// Secret access token (optional extra security layer)
// If set, clients must send this token in the Authorization header
const ACCESS_TOKEN = 'lbPYqrE46c4iDKtaMNacgtzs05yyec0lBR8ISfZqpgw=';


// ========== CORS HEADERS ==========
function corsHeaders(origin) {
    const cleanOrigin = origin ? origin.replace(/\/$/, '') : '';
    const isAllowed = ALLOWED_ORIGINS.some(allowed => 
        allowed.replace(/\/$/, '') === cleanOrigin
    );
    
    return {
        'Access-Control-Allow-Origin': isAllowed ? cleanOrigin : ALLOWED_ORIGINS[0],
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json'
    };
}


// ========== MAIN HANDLER ==========
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});


async function handleRequest(request) {
    const origin = request.headers.get('Origin');
    const url = new URL(request.url);
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, { 
            status: 204,
            headers: corsHeaders(origin) 
        });
    }
    
    try {
        // Route: Get Supabase config
        if (url.pathname === '/config' && request.method === 'GET') {
            return handleGetConfig(request, origin);
        } 
        // Route: Health check
        else if (url.pathname === '/health' && request.method === 'GET') {
            return new Response(JSON.stringify({ 
                status: 'ok',
                service: 'supabase-config-guard',
                timestamp: new Date().toISOString()
            }), {
                headers: corsHeaders(origin)
            });
        }
        // 404 for unknown routes
        else {
            return new Response(JSON.stringify({ 
                error: 'Not found',
                message: 'Available endpoints: /config (GET), /health (GET)'
            }), {
                status: 404,
                headers: corsHeaders(origin)
            });
        }
    } catch (error) {
        return new Response(JSON.stringify({ 
            success: false, 
            error: error.message 
        }), {
            status: 500,
            headers: corsHeaders(origin)
        });
    }
}


// ========== GET CONFIG HANDLER ==========
async function handleGetConfig(request, origin) {
    // Verify access token (optional security layer)
    if (ACCESS_TOKEN) {
        const authHeader = request.headers.get('Authorization');
        const expectedHeader = `Bearer ${ACCESS_TOKEN}`;
        
        // Check if auth header exists and matches
        if (!authHeader || authHeader !== expectedHeader) {
            console.log('❌ Auth failed:', {
                received: authHeader,
                expected: expectedHeader
            });
            
            return new Response(JSON.stringify({ 
                success: false, 
                error: 'Unauthorized: Invalid or missing access token',
                hint: 'Make sure to send Authorization header with Bearer token'
            }), {
                status: 401,
                headers: corsHeaders(origin)
            });
        }
    }
    
    // Return Supabase configuration
    return new Response(JSON.stringify({ 
        success: true,
        config: {
            url: SUPABASE_CONFIG.url,
            anonKey: SUPABASE_CONFIG.anonKey
        },
        timestamp: new Date().toISOString()
    }), {
        headers: corsHeaders(origin)
    });
}


// ========== USAGE INSTRUCTIONS ==========
/*

CLIENT-SIDE USAGE:
==================

Replace your supabase-config.js with this code:

```javascript
// Supabase Configuration - Loaded from Cloudflare Worker
const SUPABASE_WORKER_URL = 'https://supabase-config-guard.YOUR-SUBDOMAIN.workers.dev';
const SUPABASE_ACCESS_TOKEN = 'sheikh-supabase-secure-2024'; // Must match worker

let SUPABASE_URL = null;
let SUPABASE_ANON_KEY = null;
let supabaseClient = null;

// Fetch config from worker
async function loadSupabaseConfig() {
    try {
        const response = await fetch(`${SUPABASE_WORKER_URL}/config`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`
            }
        });
        
        const result = await response.json();
        
        if (result.success && result.config) {
            SUPABASE_URL = result.config.url;
            SUPABASE_ANON_KEY = result.config.anonKey;
            console.log('✅ Supabase config loaded securely from worker');
            return true;
        } else {
            console.error('❌ Failed to load Supabase config:', result.error);
            return false;
        }
    } catch (error) {
        console.error('❌ Error loading Supabase config:', error);
        return false;
    }
}

// Initialize Supabase
async function initSupabase() {
    // Load config first
    const configLoaded = await loadSupabaseConfig();
    
    if (!configLoaded || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
        console.error('❌ Supabase config not loaded!');
        return null;
    }
    
    try {
        if (typeof window.supabase === 'undefined') {
            console.error('❌ Supabase JS library not loaded!');
            return null;
        }
        
        const { createClient } = window.supabase;
        supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        console.log('✅ Supabase connected successfully!');
        return supabaseClient;
    } catch (error) {
        console.error('❌ Error initializing Supabase:', error);
        return null;
    }
}

function getSupabaseClient() {
    return supabaseClient;
}

// Export
if (typeof window !== 'undefined') {
    window.SUPABASE_CONFIG = {
        init: initSupabase,
        getClient: getSupabaseClient,
        isConfigured: () => SUPABASE_URL !== null && SUPABASE_ANON_KEY !== null
    };
}
```

*/
