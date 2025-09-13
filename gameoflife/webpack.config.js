const path = require("path");

const output_path = path.join(__dirname, "dist");

module.exports = {
    mode: "development",
    entry: "./index.ts",
    output: {
        filename: "./bundle.js",
        path: output_path,
    },
    devServer: {
        hot: true,
        port: 8080,
    },
};
