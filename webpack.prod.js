// webpack.prod.js - Updated for comprehensive precaching
const path = require('path');
const { merge } = require("webpack-merge");
const common = require("./webpack.common");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { InjectManifest } = require('workbox-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = merge(common, {
    mode: "production",
    output: {
        filename: '[name].[contenthash].js',
        chunkFilename: '[name].[contenthash].chunk.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/'
    },
    // Disable code splitting to bundle everything in main.js
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: false, // Keep console logs for debugging
                    },
                },
            }),
        ],
        splitChunks: {
            // Change this to force single bundle if needed
            // For offline-first, having fewer chunks can be advantageous
            chunks: 'all',
            name: false,
            cacheGroups: {
                // Bundle all vendor code together
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all',
                    priority: 20
                },
                // Bundle React-related code together
                reactVendor: {
                    test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/,
                    name: 'react-vendor',
                    chunks: 'all',
                    priority: 30
                },
                // Bundle Redux related code
                reduxVendor: {
                    test: /[\\/]node_modules[\\/](redux|react-redux|@reduxjs)[\\/]/,
                    name: 'redux-vendor',
                    chunks: 'all',
                    priority: 25
                },
                // Bundle MUI related code
                muiVendor: {
                    test: /[\\/]node_modules[\\/](@mui|@emotion)[\\/]/,
                    name: 'mui-vendor',
                    chunks: 'all',
                    priority: 25
                },
                // Create a single CSS bundle
                styles: {
                    name: 'styles',
                    test: /\.css$/,
                    chunks: 'all',
                    enforce: true,
                    priority: 40
                },
                // Default behavior for everything else
                default: {
                    minChunks: 2,
                    priority: 10,
                    reuseExistingChunk: true
                }
            }
        }
    },
    module: {
        rules: [
            {
                test: /\.scss$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                localIdentName: '[name]__[local]--[hash:base64:5]',
                            },
                        },
                    },
                    'sass-loader'
                ],
            },
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "static/css/[name].[contenthash:8].css",
            chunkFilename: "static/css/[id].[contenthash:8].css",
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'public'),
                    to: path.resolve(__dirname, 'dist'),
                    globOptions: {
                        ignore: ['**/index.html'],
                    },
                }
            ]
        }),
        // Enhanced InjectManifest configuration - the key to precaching
        new InjectManifest({
            swSrc: './src/service-worker-template.js',
            swDest: 'service-worker.js',
            // Include all essential files in the precache manifest
            include: [
                /\.html$/,          // HTML files
                /\.js$/,            // JavaScript files
                /\.css$/,           // CSS files
                /\.wasm$/,          // WebAssembly files
                /\.(png|jpg|jpeg|gif|svg|ico)$/,  // Image files
                /\.json$/,          // JSON files (manifest, etc.)
                /web-ifc(-mt)?\.wasm$/, // IFC specific WASM files
            ],
            // Allow for larger file sizes in the precache
            maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB - increased for WASM files

            // Don't apply cache busting to files that already have content hashes
            dontCacheBustURLsMatching: /\.[0-9a-f]{8}\./,

            // Files to exclude from precaching
            exclude: [
                /\.map$/,           // Source maps
                /asset-manifest\.json$/,
                /LICENSE/,
                /\.DS_Store/,
                /^manifest.*\.js?$/,
                // Add any other files you want to exclude
            ],

            // Inject additional manifest entries beyond what webpack processes
            additionalManifestEntries: [
                { url: '/', revision: null },
                { url: '/offline.html', revision: null },
                { url: '/index.html', revision: null },
                { url: '/web-ifc.wasm', revision: null },
                { url: '/web-ifc-mt.wasm', revision: null },
                // Add main application routes
                { url: '/Home', revision: null },
                { url: '/inspectionDetail', revision: null },
                { url: '/conditionRating', revision: null },
                { url: '/ifcViewer', revision: null },
                { url: '/inspectorComments', revision: null },
                { url: '/inspectionReview', revision: null },
                { url: '/previousInspection', revision: null },
                { url: '/previousInspectionDetal', revision: null },
            ]
        })
    ]
});