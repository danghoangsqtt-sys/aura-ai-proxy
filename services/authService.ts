import { OAuthProvider } from 'appwrite';
import { account } from './appwriteConfig';

/**
 * Service for Appwrite Authentication via Google OAuth (Bring Your Own Account)
 */
export const authService = {
    /**
     * Start Google OAuth Flow
     */
    loginWithGoogle() {
        try {
            // Using a generic fallback redirect back to the current app host
            const redirectUrl = `${window.location.protocol}//${window.location.host}`;
            
            // Starts OAuth flow. Will redirect out of the page.
            // We explicitly request 'cloud-platform' here so you don't need to configure it in Appwrite Console
            account.createOAuth2Session(
                OAuthProvider.Google, 
                redirectUrl, 
                redirectUrl,
                ['profile', 'email', 'https://www.googleapis.com/auth/cloud-platform']
            );
        } catch (error: any) {
            console.error('[AuthService] -> [ERROR]: Start OAuth failed:', error.message);
            throw error;
        }
    },

    /**
     * Complete login (called when app starts/redirected back)
     * Checks if session exists and updates flag
     */
    async completeLogin() {
        try {
            const user = await account.get();
            localStorage.setItem('aura_logged_in', '1');
            console.info('[AuthService] -> [Success]: Google OAuth session retrieved.');
            return user;
        } catch (error) {
            return null; // Not logged in yet
        }
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
        try {
            localStorage.removeItem('aura_logged_in');
            await account.deleteSession('current');
            console.info('[AuthService] -> [Success]: User logged out.');
        } catch (error: any) {
            console.error('[AuthService] -> [ERROR]: Logout failed:', error.message);
            throw error;
        }
    },

    /**
     * Get the current user info
     */
    async getCurrentUser() {
        const guestFlag = sessionStorage.getItem('aura_guest_mode');
        if (guestFlag === '1') return null;

        try {
            const user = await account.get();
            localStorage.setItem('aura_logged_in', '1');
            return user;
        } catch {
            localStorage.removeItem('aura_logged_in');
            return null;
        }
    },

    /**
     * Retrieve the Google access token (`ya29...`) to send to the proxy
     */
    async getAIToken(): Promise<string> {
        const guestFlag = sessionStorage.getItem('aura_guest_mode');
        if (guestFlag === '1') {
            throw new Error('Chế độ Guest không hỗ trợ tính năng AI qua tài khoản cá nhân. Vui lòng đăng nhập bằng Google.');
        }

        try {
            const session = await account.getSession('current');
            if (session && session.providerAccessToken) {
                return session.providerAccessToken;
            }
            throw new Error('Không tìm thấy Google Access Token. Vui lòng đăng nhập lại.');
        } catch (error) {
            throw new Error('Lỗi lấy token xác thực AI. Phiên đăng nhập có thể đã hết hạn.');
        }
    }
};

/**
 * Check if the user is a guest
 */
export const isGuestUser = (user: any): boolean => {
    return user?.email === 'guest@localhost';
};
