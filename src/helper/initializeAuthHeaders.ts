/**
 * Centralized utility for initializing all API instances with authentication
 */
import { setAuthorize as setApiAuthorize } from './api';
import { setAuthorize as setAssetApiAuthorize } from './assetAPI';
import { setAuthorize as setAuthApiAuthorize } from './authAPI';

export const initializeAuthHeaders = async (): Promise<void> => {
    try {
        // Initialize all API instances with auth headers
        await Promise.all([
            setApiAuthorize(),
            setAssetApiAuthorize(),
            setAuthApiAuthorize()
        ]);
        console.log('All API instances initialized with auth headers');
    } catch (error) {
        console.error('Failed to initialize API auth headers:', error);
        throw error;
    }
};