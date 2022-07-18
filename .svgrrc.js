const svgrOptions = {
  titleProp: true,
  icon: true,
  svgProps: {
    height: "auto",
  },
  memo: true,
  jsxImportSource: {
    source: "@emotion/react",
    specifiers: ["jsx"],
  },
};

const fileLoaderOptions = {
  limit: 16384,
  name(resourcePath, resourceQuery) {
    if (process.env.NODE_ENV === "development") {
      return "[path][name].[ext]";
    }
    return "[contenthash].[ext]";
  },
};

module.exports = { svgrOptions, fileLoaderOptions };
