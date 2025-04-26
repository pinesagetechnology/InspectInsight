const path = require('path');
const { merge } = require("webpack-merge");
const common = require("./webpack.common");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { InjectManifest } = require('workbox-webpack-plugin');

module.exports = merge(common, {
    mode: "production",
    output: {
        filename: '[name].[contenthash].js',
        chunkFilename: '[name].[contenthash].chunk.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/'
    },
    optimization: {
        splitChunks: {
            chunks: "all",
            name: false,
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
        // Add the InjectManifest plugin with adjusted options
        new InjectManifest({
            swSrc: './src/service-worker-template.js',
            swDest: 'service-worker.js',
            include: [/\.js$/, /\.css$/, /\.html$/, /\.wasm$/],
            maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
            // Add additional options to prevent issues
            dontCacheBustURLsMatching: /\.[0-9a-f]{8}\./,  // Don't cache bust files that already have a hash
            exclude: [
                /\.map$/,  // Exclude source maps
                /asset-manifest\.json$/,  // Exclude asset manifest
                /LICENSE/,  // Exclude license files
                /\.DS_Store/,  // Exclude macOS system files
                /^manifest.*\.js?$/,  // Exclude manifest files
            ],
        })
    ]
});