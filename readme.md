# Swagger to Postman (CLI Tool) 🚀
[![Update Postman Collection](https://github.com/runotr13/swagger-to-postman/actions/workflows/postman-sync.yml/badge.svg)](https://github.com/runotr13/swagger-to-postman/actions/workflows/postman-sync.yml)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/github%20actions-%232671E5.svg?style=for-the-badge&logo=githubactions&logoColor=white)

Generate dynamic, automated Postman collections and environments directly from your Swagger/OpenAPI documentation. This tool leverages **Faker.js** to populate requests with realistic mock data, ensuring a robust and production-ready testing workflow.

---

## 🛠 Features

- **Smart Mocking:** Automatically detects field names like `email`, `name`, `id`, and `password` to generate context-aware data.
- **Recursive Parsing:** Deeply crawls nested objects and arrays in your Swagger schemas.
- **Postman SDK:** Built on top of the official `postman-collection` library.
- **Environment Automation:** Auto-generates `baseUrl` and security variables (API Key, Bearer Token).
- **CI/CD Ready:** Built-in support for synchronizing collections directly to Postman Cloud.
- **Clean Architecture:** Modular code structure for easy maintenance and scalability.

---

## 📂 Project Structure

The project is organized following the **Single Responsibility Principle**:

```text
src/
├── core/               # Postman SDK logic (Collection & Environment)
├── generators/         # Mock data engine and schema traversal
├── helpers/            # Utility functions (e.g., Postman Cloud Sync)
├── services/           # Swagger analysis and business logic
└── index.ts            # CLI Entry point & Command management
```

## Build and Link locally:

```bash
npm run build
npm link
```

## Development

```bash
npm run start -- --url ./swagger.json
```

## Running the Tool

```bash
# Using a local file
gen-postman --url ./swagger.json --output ./test-output

# Using a remote URL
gen-postman --url [https://petstore.swagger.io/v2/swagger.json](https://petstore.swagger.io/v2/swagger.json) --output ./petstore-output
```

## 📖 CLI Arguments

| Argument   | Shorthand | Description                                             | Default    |
| :--------- | :-------- | :------------------------------------------------------ | :--------- |
| `--url`    | `-u`      | **(Required)** Path to local swagger.json or remote URL | N/A        |
| `--output` | `-o`      | Target directory for generated files                    | `./output` |
