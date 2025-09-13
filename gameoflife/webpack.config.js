const path = require("path");

const output_path = path.join(__dirname, "dist");

module.exports = {
    mode: "development",
    entry: "./index.ts",
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    output: {
        filename: "./bundle.js",
        path: output_path,
    },
    devServer: {
        hot: true,
        port: 8080,
    },
};
