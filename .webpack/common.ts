import path from 'path';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CircularDependencyPlugin from 'circular-dependency-plugin';
import packageInfo from '../package.json';

export const PATHS = {
    src: path.resolve(__dirname, '..', 'src'),
    build: path.resolve(__dirname, '..', 'build'),
};

export default {
    entry: {
        [packageInfo.name]: path.resolve(PATHS.src, 'index.ts'),
    },
    target: 'node',
    node: {
        __filename: true, // чтобы корректно работало определение имени команды по имени файла
        __dirname: false, // чтобы корректно работало определение корневой директории
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                // include: PATHS.src,
                exclude: /node_modules/,
            },
            {
                /**
                 * FIX FOR:
                 *  DevTools failed to load SourceMap:
                 *  Could not load content for webpack://15-puzzle-game/node_modules/sockjs-client/dist/sockjs.js.map:
                 *  HTTP error: status code 404, net::ERR_UNKNOWN_URL_SCHEME
                 *
                 * https://stackoverflow.com/questions/61767538/devtools-failed-to-load-sourcemap-for-webpack-node-modules-js-map-http-e
                 */
                test: /\.js$/,
                enforce: 'pre',
                use: 'source-map-loader',
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.json'],
    },
    output: {
        path: PATHS.build,
        filename: '[name].js',
        // chunkFilename: '[name].js',
    },
    plugins: [
        new CleanWebpackPlugin(),
        new CircularDependencyPlugin({
            exclude: /node_modules/,
            failOnError: true,
            cwd: process.cwd(),
        }),
        // new CopyPlugin([
        //     {
        //         from: PATHS.scripts,
        //         to: path.basename(PATHS.scripts),
        //     },
        //     {
        //         from: PATHS.lib,
        //         to: path.basename(PATHS.lib),
        //     },
        // ]),
        // new webpack.BannerPlugin({
        //     banner: '#!/usr/bin/env node',
        //     raw: true,
        //     include: /^cli\.js$/i,
        // }),
        // new webpack.ContextReplacementPlugin(
        //     // fix for WARNING Critical dependency: the request of a dependency is an expression
        //     /(.+)?cli(.+)?commands(\\|\/)(.+)?/,
        //     PATHS.src,
        //     {}
        // ),
    ],
    // optimization: {
    //     splitChunks: {
    //         cacheGroups: {
    //             vendor: {
    //                 test: /node_modules/,
    //                 chunks: 'initial',
    //                 name: 'vendor',
    //                 enforce: true,
    //             },
    //         },
    //     },
    // },
    ignoreWarnings: [
        {
            module: /node_modules\/yargs/, // чтобы скрыть ворнинги от yargs
        },
    ],
    stats: {
        errorDetails: true,
    },
};
