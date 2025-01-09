export const setUpEnv = () => {
    if (process.env.REACT_APP_USE_MOCK === 'true') {
            window.API_URL = process.env.REACT_APP_API_LOCAL_URL
            window.ASSET_URL = process.env.REACT_APP_ASSET_LOCAL_URL
    } else {
        window.API_URL = process.env.REACT_APP_API_URL
        window.ASSET_URL = process.env.REACT_APP_ASSET_URL
    }

    return;
}
