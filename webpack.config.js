const path = require('path');

/** @type {import('webpack').Configuration} */
module.exports = {
    mode: 'production',
    devtool: 'source-map',
    entry: {
        action: './src/entrypoint.ts',
        cli: './src/cli.ts',
    },
    output: {
        path: path.resolve(__dirname, 'lib'),
        filename: '[name].js',
        clean: true,
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
        },
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    target: 'node',
    node: false,
};
