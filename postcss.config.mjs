const config = {
  plugins: {
    "postcss-import": {}, // Handles @import rules
    "postcss-nesting": {}, // Modern nesting support
    "@tailwindcss/postcss": {},
    autoprefixer: {}, // Auto-prefixing
    ...(process.env.NODE_ENV === "production" ? { cssnano: {} } : {}), // Minification
  },
};

export default config;
