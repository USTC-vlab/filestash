const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

let config = {
    entry: {
        app: path.join(__dirname, 'client', 'index.js')
    },
    output: {
        path: path.join(__dirname, 'dist', 'data', 'public'),
        publicPath: '/',
        filename: 'assets/js/[name]_[chunkhash].js',
        chunkFilename: "assets/js/chunk_[name]_[id]_[chunkhash].js"
    },
    resolve: {
        fallback: {
            crypto: false,
            path: require.resolve("path-browserify")
        }
    },
    module: {
        rules: [
            {
                test: path.join(__dirname, 'client'),
                use: ['babel-loader'],
                exclude: /node_modules/
            },
            {
                test: /\.html$/,
                loader: 'html-loader',
                options: {
                    sources: {
                        urlFilter: (attribute, value, resourcePath) => {
                            return false;
                        }
                    }
                }
            },
            {
                test: /\.scss$/,
                use: ['style-loader', {
                    loader: 'css-loader',
                    options: {
                        // Don't know why but esModule true fails to load css
                        esModule: false,
                    }
                }, 'sass-loader'],
            },
            {
                test: /\.css$/,
                use: ['style-loader', {
                    loader: 'css-loader',
                    options: {
                        esModule: false,
                    }
                }],
            },
            {
                test: /\.(pdf|jpg|png|gif|svg|ico|woff|woff2|eot|ttf)$/,
                loader: "url-loader"
            },
            {
                test: /[a-z]+\.worker\.js$/,
                loader: "worker-loader",
                options: { name: 'assets/js/[name]_[hash].js' }
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'client', 'index.html'),
            inject: true,
            minify: {
                collapseWhitespace: true,
                removeComments: true,
                minifyJS: true,
                minifyCSS: true,
            }
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: "locales/*.json", to: "assets/", context: path.join(__dirname, 'client') },
                { from: "manifest.json", to: "assets/", context: path.join(__dirname, 'client') },
                { from: "worker/*.js", to: "assets/", context: path.join(__dirname, 'client') },
                { from: "assets/logo/*", context: path.join(__dirname, 'client') },
                { from: "assets/icons/*", context: path.join(__dirname, 'client') },
                { from: "assets/fonts/*", context: path.join(__dirname, 'client') },
            ],
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: "node_modules/pdfjs-dist/", to: "assets/vendor/pdfjs/" }
            ]
        }),
    ]
};


if (process.env.NODE_ENV === 'production') {
    config.optimization = {
        minimize: true
    };
    config.plugins.push(new CompressionPlugin({
        filename: "[path][base].gz[query]",
        algorithm: "gzip",
        test: /\.js$|\.json$|\.html$|\.svg|\.ico$/,
        threshold: 0,
        minRatio: 0.8
    }));
    config.plugins.push(new CompressionPlugin({
        filename: "[path][base].br[query]",
        algorithm: "brotliCompress",
        test: /\.js$|\.json$|\.html$|\.svg|\.ico$/,
        threshold: 0,
        minRatio: 0.8
    }));
    config.mode = "production";
} else {
    config.devtool = 'source-map';
    config.mode = "development";
}
if (process.env.BUNDLE_ANALYZE) {
    config.plugins.push(new BundleAnalyzerPlugin());
}

module.exports = config;
