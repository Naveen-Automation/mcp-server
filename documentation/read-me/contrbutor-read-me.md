# Playwright API MCP Server

A powerful Model Context Protocol (MCP) server that provides HTTP API testing capabilities using Playwright. This server enables you to perform GET, POST, PUT, and DELETE requests with advanced features like path parameters, query parameters, and comprehensive error handling.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## 🌟 Overview

The Playwright API MCP Server is a TypeScript-based server that implements the Model Context Protocol to provide HTTP API testing capabilities. It leverages Playwright's robust request handling to offer reliable API interactions with features like:

- Full CRUD operations (GET, POST, PUT, DELETE)
- Path parameter templating
- Query parameter handling
- Comprehensive error handling
- JSON and text response parsing

## ✨ Features

- **🚀 Complete HTTP Methods**: Support for GET, POST, PUT, DELETE requests
- **🔗 Path Parameters**: Dynamic URL templating with `{param}` and `:param` formats
- **🔍 Query Parameters**: Automatic URL encoding and parameter handling
- **📝 JSON/Text Parsing**: Automatic response parsing based on content type
- **🛡️ Error Handling**: Comprehensive error handling with detailed messages
- **📊 Status Reporting**: HTTP status codes and response bodies returned
- **🔧 TypeScript**: Fully typed with comprehensive documentation

## 📋 Prerequisites

Before installing and running the MCP server, ensure you have the following installed:

### Required Software

1. **Node.js** (version 18.0.0 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **npm** (usually comes with Node.js)
   - Verify installation: `npm --version`

3. **TypeScript** (Required solely for MCP server development; not necessary for running the MCP server.)
   ```bash
   npm install -g typescript
   ```

### MCP-Compatible Client

You'll need an MCP-compatible client to interact with the server:


- **VS Code** with MCP extension
- **Claude Desktop** with MCP support
- Any application that supports the Model Context Protocol specification

## 🚀 Installation

### Step 1: Clone or Download the Project

```bash
# Clone the repository (if using Git)
git clone <repository-url>
cd mcp-server

# Or download and extract the project files
```

### Step 2: Install Dependencies

```bash
# Install all required dependencies
npm install
```

This will install:
- `@modelcontextprotocol/sdk` - MCP framework
- `@playwright/test` - HTTP request handling
- `typescript` - TypeScript compiler
- `tsx` - TypeScript execution
- `zod` - Runtime type validation

### Step 3: Build the Project

```bash
# Compile TypeScript to JavaScript
npm run build
```

### Step 4: Verify Installation

```bash
# Run the development server to test
npm run dev
```

You should see: `MCP Server is running...`

## ⚙️ Configuration

### MCP Client Configuration

To use this server with your MCP client, add the following configuration:

#### For Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "playwright-api": {
      "command": "node",
      "args": ["build/server.js"],
      "cwd": "/path/to/your/mcp-server"
    }
  }
}
```

#### For VS Code

Create or update `.vscode/mcp.json`:

```json
{
  "servers": {
    "playwright-api-mcp": {
      "type": "stdio",
      "command": "node",
      "args": ["build/server.js"],
      "cwd": "${workspaceFolder}",
      "dev": {
        "watch": "build/**/*.js",
        "debug": {
          "type": "node"
        }
      }
    }
  },
  "inputs": []
}
```

## 📖 Usage

### Starting the Server

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm run build
npm start
```

#### With MCP Inspector (for debugging)
```bash
npm run inspect
```

This opens the MCP Inspector at `http://localhost:6274` for testing and debugging.

### Basic Workflow

1. **Start the MCP Server**
2. **Connect your MCP Client**
3. **Use the available tools** for API testing

## 📚 API Reference

The server provides four main tools for HTTP operations:

### 🔧 Available Tools

#### 1. `send-get-request`
Performs HTTP GET requests with full parameter support.

**Parameters:**
- `url` (string, required): Target URL
- `headers` (object, optional): HTTP headers
- `pathParams` (object, optional): Path parameter replacements
- `queryParams` (object, optional): Query parameters
- `timeout` (number, optional): Request timeout in milliseconds

#### 2. `send-post-request`
Performs HTTP POST requests for creating resources.

**Parameters:**
- `url` (string, required): Target URL
- `data` (object, optional): Request body data
- `headers` (object, optional): HTTP headers
- `timeout` (number, optional): Request timeout in milliseconds

#### 3. `send-put-request`
Performs HTTP PUT requests for updating resources.

**Parameters:**
- `url` (string, required): Target URL
- `data` (object, optional): Request body data
- `headers` (object, optional): HTTP headers
- `pathParams` (object, optional): Path parameter replacements
- `queryParams` (object, optional): Query parameters
- `timeout` (number, optional): Request timeout in milliseconds

#### 4. `send-delete-request`
Performs HTTP DELETE requests for removing resources.

**Parameters:**
- `url` (string, required): Target URL
- `headers` (object, optional): HTTP headers
- `pathParams` (object, optional): Path parameter replacements
- `queryParams` (object, optional): Query parameters
- `timeout` (number, optional): Request timeout in milliseconds

## 💡 Examples

### Example 1: Simple GET Request

```json
{
  "tool": "send-get-request",
  "parameters": {
    "url": "https://jsonplaceholder.typicode.com/posts/1",
    "headers": {
      "Accept": "application/json"
    }
  }
}
```

**Response:**
```
Get request successfully sent
Status: 200
Response: {
  "userId": 1,
  "id": 1,
  "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
  "body": "quia et suscipit..."
}
```

### Example 2: POST Request with Authentication

```json
{
  "tool": "send-post-request",
  "parameters": {
    "url": "https://restful-booker.herokuapp.com/auth",
    "headers": {
      "Content-Type": "application/json"
    },
    "data": {
      "username": "admin",
      "password": "password123"
    }
  }
}
```

**Response:**
```
Post request successfully sent
Status: 200
Response: {
  "token": "abc123def456"
}
```

### Example 3: GET with Path and Query Parameters

```json
{
  "tool": "send-get-request",
  "parameters": {
    "url": "https://api.example.com/users/{userId}/posts",
    "pathParams": {
      "userId": 123
    },
    "queryParams": {
      "page": 1,
      "limit": 10,
      "sort": "created_at"
    },
    "headers": {
      "Authorization": "Bearer your-token-here"
    }
  }
}
```

**Final URL:** `https://api.example.com/users/123/posts?page=1&limit=10&sort=created_at`

### Example 4: PUT Request to Update Resource

```json
{
  "tool": "send-put-request",
  "parameters": {
    "url": "https://jsonplaceholder.typicode.com/posts/{id}",
    "pathParams": {
      "id": 1
    },
    "headers": {
      "Content-Type": "application/json"
    },
    "data": {
      "title": "Updated Title",
      "body": "Updated content",
      "userId": 1
    }
  }
}
```

### Example 5: DELETE Request

```json
{
  "tool": "send-delete-request",
  "parameters": {
    "url": "https://jsonplaceholder.typicode.com/posts/{id}",
    "pathParams": {
      "id": 1
    },
    "headers": {
      "Authorization": "Bearer your-token-here"
    }
  }
}
```

## 🔧 Troubleshooting

### Common Issues

#### 1. "MCP Server is not running"

**Solution:**
```bash
# Check if the server is running
npm run dev

# If build fails, try:
npm run build
```

#### 2. "Module not found" errors

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

#### 3. TypeScript compilation errors

**Solution:**
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Fix any type errors and rebuild
npm run build
```

#### 4. Connection timeout issues

**Solution:**
- Check your internet connection
- Verify the target API is accessible
- Increase timeout parameter in requests

#### 5. Authentication failures

**Solution:**
- Verify API keys and tokens
- Check header format and spelling
- Ensure proper encoding of credentials

### Debug Mode

Use the MCP Inspector for debugging:

```bash
npm run inspect
```

This provides a web interface at `http://localhost:6274` to test tools interactively.

### Logging

The server logs important events to the console. Monitor the output for:
- Server startup confirmation
- Request/response information
- Error messages and stack traces

## 🏗️ Project Structure

```
mcp-server/
├── src/
│   ├── server.ts              # Main MCP server implementation
│   └── utilities/
│       └── api-utilities.ts   # HTTP request utilities
├── build/                     # Compiled JavaScript files
├── .vscode/
│   └── mcp.json              # VS Code MCP configuration
├── package.json              # Project dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── README.md                 # This documentation
```

## 🔗 External References

- **Model Context Protocol**: [Official Documentation](https://modelcontextprotocol.io/)
- **Playwright**: [Official Documentation](https://playwright.dev/)
- **TypeScript**: [Official Documentation](https://www.typescriptlang.org/)
- **Zod**: [Schema Validation](https://zod.dev/)
- **Claude Desktop MCP**: [Setup Guide](https://docs.anthropic.com/claude/docs/mcp)

## 📋 Available Scripts

- `npm run dev` - Start development server with tsx
- `npm run build` - Compile TypeScript to JavaScript
- `npm run build:watch` - Watch mode compilation
- `npm run inspect` - Start with MCP Inspector for debugging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and add tests
4. Commit your changes: `git commit -am 'Add new feature'`
5. Push to the branch: `git push origin feature/new-feature`
6. Submit a pull request

## 📝 License

This project is licensed under the ISC License. See the LICENSE file for details.

## 👨‍💻 Author

**Veeranki Naveen Goud**
- GitHub: [@Naveen-Automation](https://github.com/Naveen-Automation)

---

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review the [Examples](#examples) for usage patterns
3. Open an issue on the GitHub repository
4. Consult the [MCP Documentation](https://modelcontextprotocol.io/)

---

**Happy API Testing! 🚀**
