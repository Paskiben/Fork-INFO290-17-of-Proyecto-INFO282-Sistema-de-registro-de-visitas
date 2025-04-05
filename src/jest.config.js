// jest.config.js
module.exports = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  
  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",
  
  // A list of paths to directories that Jest should use to search for files in
  roots: ["<rootDir>"],
  
  // The test environment that will be used for testing
  testEnvironment: "node",
  
  // A map from regular expressions to paths to transformers
  transform: {
    "^.+\\.(js|jsx|mjs|cjs|ts|tsx)$": "babel-jest"
  },
  
  // Allow importing modules without specifying file extensions
  moduleFileExtensions: ["js", "jsx", "json", "node"],
  
  // Setup files to run before each test
  // setupFiles: ["<rootDir>/jest.setup.js"],
  
  // Mock all imports from these modules
  moduleNameMapper: {
    "\\.json$": "<rootDir>/__mocks__/fileMock.js"
  },
  
  // Configure Jest to gracefully handle non-JS assets
  transformIgnorePatterns: [
    "/node_modules/(?!(@react-native|react-native|expo-sqlite|expo))"
  ],
  
  // Create a mock for any import that doesn't exist
  unmockedModulePathPatterns: [],
  
  // Don't look for test files in node_modules
  testPathIgnorePatterns: ["/node_modules/"],
  
  // Resolve modules just like webpack does
  // modulePaths: ["<rootDir>"]
};
