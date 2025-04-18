const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const webpack = require('webpack');
const dotenv = require('dotenv');

dotenv.config(); // This will load your .env file into process.env

module.exports = {
    entry: './src/index.tsx',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js',  // Explicitly define the output file name
        publicPath: '/'  // Ensure this is set if you're referencing assets or chunks in HTML
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
        new webpack.DefinePlugin({
            'process.env.REACT_APP_USE_MOCK': JSON.stringify(process.env.REACT_APP_USE_MOCK),
            'process.env.REACT_APP_API_LOCAL_URL': JSON.stringify(process.env.REACT_APP_API_LOCAL_URL),
            'process.env.REACT_APP_API_URL': JSON.stringify(process.env.REACT_APP_API_URL),
            'process.env.REACT_APP_GOOGLE_MAPS_API_KEY': JSON.stringify(process.env.REACT_APP_GOOGLE_MAPS_API_KEY),
            'process.env.REACT_APP_ASSET_LOCAL_URL': JSON.stringify(process.env.REACT_APP_ASSET_LOCAL_URL),
            'process.env.REACT_APP_ASSET_URL': JSON.stringify(process.env.REACT_APP_ASSET_URL),
        })
    ]
};
