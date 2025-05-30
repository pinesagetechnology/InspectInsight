export const setUpAPIEnv = () => {
    if (process.env.REACT_APP_USE_MOCK === 'true') {
        window.API_URL = process.env.REACT_APP_API_LOCAL_URL
    } else {
        window.API_URL = process.env.REACT_APP_API_URL
    }

    return;
}

export const setUpAssetAPIEnv = () => {
    if (process.env.REACT_APP_USE_MOCK === 'true') {
        window.ASSET_URL = process.env.REACT_APP_ASSET_LOCAL_URL
    } else {
        window.ASSET_URL = process.env.REACT_APP_ASSET_URL
    }

    return;
}


export const setUpAuthAPIEnv = () => {
    if (process.env.REACT_APP_USE_MOCK === 'true') {
        window.USER_API_URL = process.env.REACT_APP_USER_API_LOCAL_URL
    } else {
        window.USER_API_URL = process.env.REACT_APP_USER_API_URL
    }

    return;
}

export const setUpgenAIAPIEnv = () => {
    if (process.env.REACT_APP_USE_MOCK === 'true') {
        window.GEN_API_URL = process.env.REACT_APP_GEN_API_LOCAL_URL
    } else {
        window.GEN_API_URL = process.env.REACT_APP_GEN_API_URL
    }

    return;
}
