// Default configuration values
const defaultConfig = {
    API_URL: '',
    ASSET_URL: '',
    USER_API_URL: '',
    GEN_API_URL: '',
    USE_MOCK: false,
    GOOGLE_MAPS_API_KEY: '',
    GOOGLE_MAPS_MAP_ID: '',
    SUBSCRIPTION_KEY: '',
};

// Configuration that will be loaded at runtime
let runtimeConfig = { ...defaultConfig };

// Function to load configuration
export const loadConfig = async () => {
    try {
        // In web environment, use the injected environment variables
        if (typeof window !== 'undefined') {
            runtimeConfig = {
                API_URL: process.env.REACT_APP_API_URL || '',
                ASSET_URL: process.env.REACT_APP_ASSET_URL || '',
                USER_API_URL: process.env.REACT_APP_USER_API_URL || '',
                GEN_API_URL: process.env.REACT_APP_GEN_API_URL || '',
                USE_MOCK: process.env.REACT_APP_USE_MOCK === 'true',
                GOOGLE_MAPS_API_KEY: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
                GOOGLE_MAPS_MAP_ID: process.env.REACT_APP_GOOGLE_MAPS_MAP_ID || '',
                SUBSCRIPTION_KEY: process.env.REACT_APP_SUBSCRIPTION_KEY || '',
            };
        }

        // In native environment, you can load from a config file
        // This will be implemented when we set up the native build
        if (window.capacitor) {
            // TODO: Implement native config loading
            // This could be from a config file in the app's assets
            // or from a remote configuration service
        }

        // Set the config values on the window object for backward compatibility
        Object.assign(window, runtimeConfig);
        
        return runtimeConfig;
    } catch (error) {
        console.error('Error loading configuration:', error);
        return defaultConfig;
    }
};

// Function to get a config value
export const getConfig = (key: keyof typeof defaultConfig) => {
    return runtimeConfig[key];
};

// Export the current config
export const config = runtimeConfig; 