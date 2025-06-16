// Swagger UI Authentication Form Script

// Function to initialize the auth form
function initAuthForm() {
    // Check if we already have values in localStorage
    const clientId = localStorage.getItem('dhan_client_id') || '';
    const accessToken = localStorage.getItem('dhan_access_token') || '';
    
    // Create the form container
    const formContainer = document.createElement('div');
    formContainer.className = 'swagger-auth-form';
    formContainer.style.cssText = 'padding: 20px; background-color: #f8f9fa; border-radius: 5px; margin-bottom: 20px;';
    
    // Create form HTML
    formContainer.innerHTML = `
        <h3 style="margin-top: 0; color: #3b4151;">Dhan API Authentication</h3>
        <p style="color: #666;">Enter your Client ID and Access Token to test the API</p>
        
        <div style="margin-bottom: 15px;">
            <label for="clientId" style="display: block; margin-bottom: 5px; font-weight: bold;">Client ID:</label>
            <input type="text" id="clientId" value="${clientId}" 
                   style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
        </div>
        
        <div style="margin-bottom: 15px;">
            <label for="accessToken" style="display: block; margin-bottom: 5px; font-weight: bold;">Access Token:</label>
            <input type="text" id="accessToken" value="${accessToken}" 
                   style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;" />
        </div>
        
        <button id="saveAuth" style="background-color: #4990e2; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer;">
            Save Credentials
        </button>
        <span id="authStatus" style="margin-left: 10px; display: none;"></span>
    `;
    
    // Find the Swagger UI container and insert our form before it
    const swaggerContainer = document.querySelector('.swagger-ui');
    if (swaggerContainer && swaggerContainer.parentNode) {
        swaggerContainer.parentNode.insertBefore(formContainer, swaggerContainer);
        
        // Add event listener to the save button
        document.getElementById('saveAuth').addEventListener('click', saveCredentials);
    }
}

// Function to save credentials to localStorage
function saveCredentials() {
    const clientId = document.getElementById('clientId').value.trim();
    const accessToken = document.getElementById('accessToken').value.trim();
    
    // Save to localStorage
    localStorage.setItem('dhan_client_id', clientId);
    localStorage.setItem('dhan_access_token', accessToken);
    
    // Show success message
    const statusEl = document.getElementById('authStatus');
    statusEl.textContent = 'Credentials saved!';
    statusEl.style.color = 'green';
    statusEl.style.display = 'inline';
    
    // Hide message after 3 seconds
    setTimeout(() => {
        statusEl.style.display = 'none';
    }, 3000);
    
    // Reload the page to apply the new token to Swagger UI
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

// Function to intercept Swagger UI requests and add the auth token
function addAuthInterceptor() {
    // Get stored credentials
    const clientId = localStorage.getItem('dhan_client_id');
    const accessToken = localStorage.getItem('dhan_access_token');
    
    if (!clientId || !accessToken) return;
    
    // Create a MutationObserver to watch for Swagger UI initialization
    const observer = new MutationObserver((mutations) => {
        // Check if Swagger UI has been fully loaded
        if (document.querySelector('.swagger-ui .opblock')) {
            // Disconnect the observer once we've found what we need
            observer.disconnect();
            
            // Override fetch to inject our headers
            const originalFetch = window.fetch;
            window.fetch = function(url, options = {}) {
                // Only intercept API requests, not Swagger UI internal requests
                if (url.toString().includes('/api/')) {
                    // Create headers if they don't exist
                    if (!options.headers) {
                        options.headers = {};
                    }
                    
                    // Add our auth headers
                    options.headers['X-Client-ID'] = clientId;
                    options.headers['Authorization'] = `Bearer ${accessToken}`;
                }
                
                return originalFetch.call(this, url, options);
            };
            
            console.log('Dhan API auth interceptor initialized');
        }
    });
    
    // Start observing the document
    observer.observe(document.body, { childList: true, subtree: true });
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for Swagger UI to initialize
    setTimeout(() => {
        initAuthForm();
        addAuthInterceptor();
    }, 1000);
});