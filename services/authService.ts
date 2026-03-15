
import { ID } from 'appwrite';
import { account } from './appwriteConfig';

/**
 * Dịch vụ xác thực người dùng sử dụng Appwrite
 */
export const authService = {
    /**
     * Đăng ký tài khoản mới
     */
    async register(email: string, password: string, name: string) {
        try {
            const user = await account.create(ID.unique(), email, password, name);
            console.info('[AuthService] -> [Success]: User registered successfully.');
            return user;
        } catch (error: any) {
            console.error('[AuthService] -> [ERROR]: Registration failed:', error.message);
            throw error;
        }
    },

    /**
     * Đăng nhập
     */
    async login(email: string, password: string) {
        try {
            const session = await account.createEmailPasswordSession(email, password);
            console.info('[AuthService] -> [Success]: User authenticated successfully.');
            return session;
        } catch (error: any) {
            console.error('[AuthService] -> [ERROR]: Authentication failed:', error.message);
            throw error;
        }
    },

    /**
     * Đăng xuất
     */
    async logout() {
        try {
            await account.deleteSession('current');
            console.info('[AuthService] -> [Success]: User logged out.');
        } catch (error: any) {
            console.error('[AuthService] -> [ERROR]: Logout failed:', error.message);
            throw error;
        }
    },

    /**
     * Lấy thông tin user hiện tại
     */
    async getCurrentUser() {
        try {
            const user = await account.get();
            return user;
        } catch (error: any) {
            // Không log error ở đây vì có thể là trạng thái chưa login bình thường
            return null;
        }
    }
};
