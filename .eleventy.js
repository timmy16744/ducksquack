module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/index.html");

  return {
    htmlTemplateEngine: false,
    dir: {
      input: "src",
      output: "dist"
    }
  };
};
