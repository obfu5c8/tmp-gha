const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/entrypoint.ts",
  output: {
    path: path.resolve(__dirname, "lib"),
    filename: "action.js",
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
  target: "node",
  node: false,
};
