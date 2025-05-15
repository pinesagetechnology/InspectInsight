const path = require('path');
const { merge } = require("webpack-merge");
const common = require("./webpack.common");

module.exports = merge(common, {
    mode: "development",
    devtool: "inline-source-map",
    module: {
        rules: [
            {
                test: /\.scss$/i,
                use: [
                    'style-loader',
                    {
                        loader: 'dts-css-modules-loader',
                        options: {
                            namedExport: true,
                        }
                    },
                    'css-loader',
                    'sass-loader'
                ],
            }
        ]
    },
    devServer: {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
        },
        static: [
            {
                directory: path.join(__dirname, 'build'),
            },
            {
                directory: path.join(__dirname, 'public'),
            },
        ],
        compress: true,
        port: 8080,
        open: true, // Automatically open the browser
        historyApiFallback: true, // Support HTML5 History API based routing
    }
});