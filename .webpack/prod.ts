// import path from 'path';
import { mergeWithRules, CustomizeRule } from 'webpack-merge';
import TerserPlugin from 'terser-webpack-plugin';
// import common, { PATHS } from './common';
import common from './common';

export default mergeWithRules({
    module: {
        rules: {
            test: CustomizeRule.Merge,
        },
    },
})(common, {
    mode: 'production',
    // devtool: 'nosources-source-map',
    // output: {
    //     pathinfo: true,
    // },
    optimization: {
        minimize: true,
        // prevent the creation of a LICENSE.txt
        // https://github.com/webpack-contrib/terser-webpack-plugin/issues/229
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    format: {
                        comments: false,
                    },
                },
                extractComments: false,
            }),
        ],
        // Once your build outputs multiple chunks, this option will ensure they share the webpack runtime
        // instead of having their own. This also helps with long-term caching, since the chunks will only
        // change when actual code changes, not the webpack runtime.
        // runtimeChunk: {
        //     name: 'runtime',
        // },
    },
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000,
    },
});
