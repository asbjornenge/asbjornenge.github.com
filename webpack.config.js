module.exports = {
    cache: true,
    entry: "./entry.js",
    output: {
        path: __dirname+'/build',
        filename: "bundle.js"
    },
    module: {
        noParse : [
            /moment/
        ],
        loaders: [
            { 
                test: /\.css$/, 
                loader: "style!css" 
            },
            {
                test: /\.styl$/,
                loader: 'style-loader!css-loader!stylus-loader'
            },
            {
                test: /\.jsx$/,
                loader: 'jsx-loader'
            },
            { test: /\.jpg$/,    loader: "url-loader?limit=30000&minetype=image/jpg" },
            { test: /\.png$/,    loader: "url-loader?limit=30000&minetype=image/png" }
        ]
    }
};