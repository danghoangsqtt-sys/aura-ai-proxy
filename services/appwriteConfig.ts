
import { Client, Account, Databases, Storage } from 'appwrite';

console.info('[Appwrite] -> [Init]: Configuring Appwrite Client...');

const client = new Client();

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;

if (!endpoint || !projectId) {
    console.error('[Appwrite] -> [ERROR]: Missing Appwrite configuration in environment variables.');
}

client
    .setEndpoint(endpoint || '')
    .setProject(projectId || '');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Collections Configuration
export const APPWRITE_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || '';
export const COLLECTION_MINDMAPS = 'mindmaps'; // Ensure this matches your Appwrite console
export const COLLECTION_SETTINGS = 'settings';
export const COLLECTION_USERDATA = import.meta.env.VITE_APPWRITE_COLLECTION_ID || 'userdata';

export default client;
