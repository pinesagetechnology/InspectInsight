const path = require('path');
const { merge } = require("webpack-merge");
const common = require("./webpack.common");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = merge(common, {
    mode: "production",
    output: {
        filename: '[name].[contenthash].js',  // Use content hashes to ensure unique filenames
        chunkFilename: '[name].[contenthash].chunk.js',  // Define how non-entry chunks are named
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/'  // Ensure this is set if you're referencing assets or chunks in HTML
    },
    optimization: {
        splitChunks: {
            chunks: "all",
            name: false,  // Optionally control naming to avoid conflicts
        }
    },
    module: {
        rules: [
            {
                test: /\.s?css$/i,
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"]
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "static/css/main.[contenthash:8].css",
            chunkFilename: "[id].[contenthash].css",
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'public'),
                    to: path.resolve(__dirname, 'dist'),
                    // Optionally ignore certain files (e.g., index.html if you're handling it with HtmlWebpackPlugin)
                    globOptions: {
                        ignore: ['**/index.html'],
                    },
                }
            ]
        })
    ]
});
