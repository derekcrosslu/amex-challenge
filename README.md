# Caching Fetch Library Project

This project consists of a framework, a caching fetch library, and a web application that displays a directory of people.

## Project Structure

- `application/`: Contains the main application code
- `caching-fetch-library/`: Contains the caching fetch library (to be implemented)
- `framework/`: Contains the framework code (server, client runtime, and MSW mock server)

## Setup and Running the Project

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

3. Visit [http://localhost:3000](http://localhost:3000) to see the app running.

## Configuration Choices

1. **TypeScript**: The project uses TypeScript for type safety and better developer experience. The `tsconfig.json` file is already present.

2. **ESLint**: Added for code linting and maintaining code quality. Configuration file: `.eslintrc.js`

3. **Prettier**: Added for consistent code formatting. Configuration file: `.prettierrc`

4. **Jest**: Added for unit testing. Configuration file: `jest.config.js`

5. **Husky and lint-staged**: Added for pre-commit hooks to ensure code quality. Configuration files: `.husky/` and `.lintstagedrc`

6. **GitHub Actions**: Added for CI/CD pipeline. Configuration file: `.github/workflows/ci.yml`

## Known Issues and Next Steps

1. Implement the caching fetch library in `caching-fetch-library/cachingFetch.ts`
2. Add more comprehensive unit tests for the application and framework
3. Improve error handling and add logging throughout the application
4. Optimize performance, especially for the caching mechanism
5. Enhance the UI/UX of the people directory application

## Contributing

Please read the CONTRIBUTING.md file for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.