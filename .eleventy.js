module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/index.html");

  return {
    dir: {
      input: "src",
      output: "dist"
    }
  };
};
