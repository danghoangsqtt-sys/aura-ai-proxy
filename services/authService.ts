/**
 * Service for CLIProxyAPI Authentication (Bring Your Own Account via Proxy)
 */
export const authService = {
    /**
     * Start CLIProxy OAuth Flow for Gemini
     * Fetches alias from management API and saves it
     */
    async loginWithProxy() {
        try {
            console.log('[AuthService] -> Initiating proxy bypass login for Gemini...');
            
            // is_webui=1 tells the proxy to start the local callback forwarder on port 8085
            const proxyUrl = import.meta.env.VITE_PROXY_URL?.replace(/\/$/, '') || 'http://127.0.0.1:8317';
            const response = await fetch(`${proxyUrl}/v0/management/gemini-cli-auth-url?is_webui=1`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': 'Bearer admin123'
                }
            });

            if (!response.ok) {
                throw new Error(`Lỗi từ Proxy Server (${response.status})`);
            }

            const data = await response.json();
            // The proxy returns: { url: "https://...", state: "gem-...", status: "ok" }
            const authUrl = data.url;
            const state = data.state;
            
            if (!authUrl) {
                throw new Error('Proxy không trả về url hợp lệ.');
            }

            // Open the Google OAuth popup
            console.log('[AuthService] -> Opening OAuth popup:', authUrl);
            window.open(authUrl, '_blank', 'width=500,height=700,menubar=no,toolbar=no');

            // Save state for session tracking (OAuth flow identifier)
            const alias = state || 'gemini-cli-bypassed';
            localStorage.setItem('aura_proxy_alias', alias);
            // The chat API key is the static key defined in CLIProxyAPI config.yaml api-keys list
            localStorage.setItem('aura_chat_api_key', 'aura-internal-bypass');
            localStorage.setItem('aura_logged_in', '1');
            console.info('[AuthService] -> [Success]: OAuth initiated. State:', alias);
            
            return { email: 'proxy_connected@localhost', name: 'Người dùng (Proxy)', $id: 'proxy' };
        } catch (error: any) {
            console.error('[AuthService] -> [ERROR]: Proxy login failed:', error.message);
            throw error;
        }
    },

    /**
     * Complete login (called when app starts)
     */
    async completeLogin() {
        if (localStorage.getItem('aura_logged_in') === '1' && localStorage.getItem('aura_proxy_alias')) {
            return { email: 'proxy_connected@localhost', name: 'Người dùng (Proxy)', $id: 'proxy' };
        }
        return null;
    },

    /**
     * Log out
     */
    async logout() {
        const guestFlag = sessionStorage.getItem('aura_guest_mode');
        if (guestFlag === '1') {
            sessionStorage.removeItem('aura_guest_mode');
            console.info('[AuthService] -> [Guest]: Guest session cleared.');
            return;
        }
        
        localStorage.removeItem('aura_logged_in');
        localStorage.removeItem('aura_proxy_alias');
        console.info('[AuthService] -> [Success]: User logged out.');
    },

    /**
     * Get the current user info
     */
    async getCurrentUser() {
        const guestFlag = sessionStorage.getItem('aura_guest_mode');
        if (guestFlag === '1') return null;

        if (localStorage.getItem('aura_logged_in') === '1' && localStorage.getItem('aura_proxy_alias')) {
            return { email: 'proxy_connected@localhost', name: 'Người dùng (Proxy)', $id: 'proxy' };
        }
        
        return null;
    },

    /**
     * Retrieve the Proxy Alias to send as Bearer Token
     */
    async getAIToken(): Promise<string> {
        const guestFlag = sessionStorage.getItem('aura_guest_mode');
        if (guestFlag === '1') {
            throw new Error('Chế độ Guest không hỗ trợ AI. Vui lòng đăng nhập.');
        }

        // Use the dedicated chat API key (matches api-keys in CLIProxyAPI config.yaml)
        const chatKey = localStorage.getItem('aura_chat_api_key');
        if (chatKey) return chatKey;

        // Fallback to alias for backward compatibility
        const alias = localStorage.getItem('aura_proxy_alias');
        if (!alias) {
            throw new Error('Không tìm thấy auth alias. Vui lòng đăng nhập lại.');
        }

        return alias;
    }
};

/**
 * Check if the user is a guest
 */
export const isGuestUser = (user: any): boolean => {
    return user?.email === 'guest@localhost';
};
