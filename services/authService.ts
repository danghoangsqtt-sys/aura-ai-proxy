/**
 * Service for CLIProxyAPI Authentication (Bring Your Own Account via Proxy)
 */
export const authService = {
    /**
     * Start CLIProxy OAuth Flow for Gemini (Mock Fallback)
     */
    async mockProxyLogin() {
        console.log('[AuthService] -> No Google Client ID, using mock proxy login...');
        const user = { email: 'proxy_connected@localhost', name: 'Sinh viên Ẩn danh', $id: 'proxy', picture: '' };
        localStorage.setItem('aura_user_profile', JSON.stringify(user));
        localStorage.setItem('aura_chat_api_key', 'aura-internal-bypass');
        localStorage.setItem('aura_logged_in', '1');
        return user;
    },

    /**
     * Fetch actual Google Profile from Access Token and log in
     */
    async loginWithGoogleAccessToken(accessToken: string) {
        try {
            console.log('[AuthService] -> Fetching Google Profile from Access Token...');
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (!res.ok) throw new Error('Không thể tải dữ liệu hồ sơ Google.');
            
            const profile = await res.json();
            
            const user = {
                email: profile.email,
                name: profile.name,
                picture: profile.picture,
                $id: profile.sub
            };
            
            // Save real profile data
            localStorage.setItem('aura_user_profile', JSON.stringify(user));
            // Keep proxy authorization key intact
            localStorage.setItem('aura_chat_api_key', 'aura-internal-bypass');
            localStorage.setItem('aura_logged_in', '1');
            
            return user;
        } catch (error: any) {
            console.error('[AuthService] -> [ERROR]: Error fetching profile:', error.message);
            throw error;
        }
    },

    /**
     * Complete login (called when app starts)
     */
    async completeLogin() {
        if (localStorage.getItem('aura_logged_in') === '1') {
            const profileData = localStorage.getItem('aura_user_profile');
            return profileData ? JSON.parse(profileData) : { email: 'proxy_connected@localhost', name: 'Người dùng (Proxy)', $id: 'proxy' };
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

        if (localStorage.getItem('aura_logged_in') === '1') {
            const profileData = localStorage.getItem('aura_user_profile');
            return profileData ? JSON.parse(profileData) : { email: 'proxy_connected@localhost', name: 'Người dùng (Proxy)', $id: 'proxy' };
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
