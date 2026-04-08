
import { Client, Account, Databases, Storage } from 'appwrite';

console.info('[Appwrite] -> [Init]: Configuring Appwrite Client...');

const client = new Client();

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;

if (!endpoint || !projectId) {
    console.error('[Appwrite] -> [ERROR]: Missing Appwrite configuration in environment variables.');
}

client
    .setEndpoint(endpoint || 'https://localhost/v1')
    .setProject(projectId || 'dummy_project');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Collections Configuration
export const APPWRITE_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || 'auramain';
export const COLLECTION_MINDMAPS = import.meta.env.VITE_APPWRITE_COLLECTION_MINDMAPS || 'mindmaps';
export const COLLECTION_SETTINGS = import.meta.env.VITE_APPWRITE_COLLECTION_SETTINGS || 'settings';
export const COLLECTION_USERDATA = import.meta.env.VITE_APPWRITE_COLLECTION_ID || 'userdata';
export const COLLECTION_EXAMS = import.meta.env.VITE_APPWRITE_COLLECTION_EXAMS || 'exams';
export const COLLECTION_DOCUMENTS = import.meta.env.VITE_APPWRITE_COLLECTION_DOCUMENTS || 'documents';
export const COLLECTION_VOCABULARY = import.meta.env.VITE_APPWRITE_COLLECTION_VOCABULARY || 'vocabulary';

// Storage Configuration
export const BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID || 'Documents';

export default client;
