module.exports = function(eleventyConfig) {
  // Copy static assets
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/writings");
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/index.html");
  
  // Disable template processing for HTML files to avoid conflicts
  return {
    htmlTemplateEngine: false,
    dataTemplateEngine: "njk",
    dir: {
      input: "src",
      output: "dist"
    }
  };
};
