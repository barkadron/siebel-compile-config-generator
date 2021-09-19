import { mergeWithRules, CustomizeRule } from 'webpack-merge';
import common, { PATHS } from './common';

export default mergeWithRules({
    module: {
        rules: {
            test: CustomizeRule.Merge,
        },
    },
})(common, {
    mode: 'development',
    devtool: 'eval',
});
