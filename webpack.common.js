const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv');

dotenv.config(); // This will load your .env file into process.env

module.exports = {
    entry: './src/index.tsx',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'static/js/[name].[contenthash:8].js',
        chunkFilename: 'static/js/[name].[contenthash:8].chunk.js',
        publicPath: '/'
    },
    experiments: { asyncWebAssembly: true },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.wasm'],
        modules: [__dirname, "node_modules"],
    },
    module: {
        rules: [
            {
                test: /\.(png|svg|jpg|jpeg|gif|ifc)$/,
                type: 'asset/resource'
            },
            {
                test: /\.(js|jsx|ts|tsx)$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.wasm$/,
                type: "asset/resource",
            },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, '/public/index.html'),
            filename: 'index.html',
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'public'),
                    to: path.resolve(__dirname, 'build'),
                    globOptions: {
                        ignore: ['**/index.html'],
                    },
                },
                {
                    from: path.resolve(__dirname, 'staticwebapp.config.json'),
                    to: path.resolve(__dirname, 'build'),
                },
                {
                    from: 'public/manifest.json',
                    to: 'manifest.json'
                },
                {
                    from: 'public/offline.html',
                    to: 'offline.html'
                },
                {
                    from: 'public/favicon.ico',
                    to: 'favicon.ico'
                },
                {
                    from: 'public/logo192.png',
                    to: 'logo192.png'
                },
                {
                    from: 'public/logo512.png',
                    to: 'logo512.png'
                },
                {
                    from: 'public/maskable_icon.png',
                    to: 'maskable_icon.png'
                },
                {
                    from: 'public/screenshot1.png',
                    to: 'screenshot1.png'
                },
                {
                    from: 'public/screenshot2.png',
                    to: 'screenshot2.png'
                },
                {
                    from: 'public/screenshot_mobile1.png',
                    to: 'screenshot_mobile1.png'
                },
                {
                    from: 'public/screenshot_mobile2.png',
                    to: 'screenshot_mobile2.png'
                },
                {
                    from: path.resolve(__dirname, 'node_modules/web-ifc/web-ifc.wasm'),
                    to: 'web-ifc.wasm'
                },
                {
                    from: path.resolve(__dirname, 'node_modules/web-ifc/web-ifc-mt.wasm'),
                    to: 'web-ifc-mt.wasm'
                },
            ]
        }),
        new webpack.DefinePlugin({
            'process.env.REACT_APP_USE_MOCK': JSON.stringify(process.env.REACT_APP_USE_MOCK),
            'process.env.REACT_APP_API_LOCAL_URL': JSON.stringify(process.env.REACT_APP_API_LOCAL_URL),
            'process.env.REACT_APP_API_URL': JSON.stringify(process.env.REACT_APP_API_URL),
            'process.env.REACT_APP_GOOGLE_MAPS_API_KEY': JSON.stringify(process.env.REACT_APP_GOOGLE_MAPS_API_KEY),
            'process.env.REACT_APP_GOOGLE_MAPS_MAP_ID': JSON.stringify(process.env.REACT_APP_GOOGLE_MAPS_MAP_ID),
            'process.env.REACT_APP_ASSET_LOCAL_URL': JSON.stringify(process.env.REACT_APP_ASSET_LOCAL_URL),
            'process.env.REACT_APP_ASSET_URL': JSON.stringify(process.env.REACT_APP_ASSET_URL),
            'process.env.PUBLIC_URL': JSON.stringify(''),
            'process.env.REACT_APP_USER_API_LOCAL_URL': JSON.stringify(process.env.REACT_APP_USER_API_LOCAL_URL),
            'process.env.REACT_APP_USER_API_URL': JSON.stringify(process.env.REACT_APP_USER_API_URL),
            'process.env.REACT_APP_SUBSCRIPTION_KEY': JSON.stringify(process.env.REACT_APP_SUBSCRIPTION_KEY),
            'process.env.REACT_APP_GEN_API_URL': JSON.stringify(process.env.REACT_APP_GEN_API_URL),
            'process.env.REACT_APP_GEN_API_LOCAL_URL': JSON.stringify(process.env.REACT_APP_GEN_API_LOCAL_URL),

        })
    ]
};