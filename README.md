# API Testing Using MCP Server (End User Guide)

A ready-to-use Model Context Protocol (MCP) server for HTTP API testing, powered by Playwright. This guide helps you install, configure, and run the MCP server locally as an npm package.

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Setup](#installation)
- [Configurations](#mcp-client-configuration)
- [Usage](#usage)
- [Troubleshooting](#troubleshooting)
- [Support](#support)

## 🌟 Overview

The Playwright API MCP Server enables API testing via the Model Context Protocol. It supports GET, POST, PUT, and DELETE requests.

## 📋 Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm** (comes with Node.js)
- **VS Code MCP extension** (MCP-compatible client)

> **Note:** If you are using VS Code, make sure the GitHub Copilot extension is installed and enabled


## 🚀 Setup

1. **Install the MCP Server Package**  
   Run the below command in terminal (`cmd` or `git bash` or `powershell`):
   ```bash
   npm i @automate-io/api-testing-mcp@latest
   ```



## ⚙️ Configurations

### VS Code:

- Create `mcp.json` json file under `root/.vscode/` folder
- Add the `api-testing-mcp` configurations as show below in the `mcp.json` file.

<img src="./documentation/images/mcp-client-config.png" alt="MCP Client Config">


```json
{
  "servers": {
    "api-testing-mcp": {
      "type": "stdio",
      "command": "node",
      "args": ["node_modules/@automate-io/api-testing-mcp/dist/server.js"],
      "cwd": "${workspaceFolder}"
    }
  },
  "inputs": []
}
```
- Note: Update the cwd (current working directory) value if your node_modules aren't located at the root.
For instance, in a monorepo setup where application and test code reside in separate folders with their own package.json files, adjust `cwd` value accordingly


## 📖 Usage

1. **Start the MCP Server**
 - Click the highlighted start button in the mcp.json file as shown below to start the MCP server.

<img src="./documentation/images/server-start-button.png" alt="Server Start Button">


2. **Input the prompt**
   Follow these steps to use MCP server tools for the api testing:
   
  - Open GitHub Copilot chat window in  VS Code with Agent mode selected.
 
  - Enter a prompt that outlines the API you wish to test.
  For example, to test a `POST` endpoint, your input should be like below:

<img src="./documentation/images//mcp-usage.png" alt="MCP Usage">

  ### Sample Prompt to copy
     
```text
- Use the available MCP tools to test a GET API for with the following configuration:

    API Details to fetch booking details of id = 681
      1. Base URL: https://restful-booker.herokuapp.com
      2. Endpoint: booking/id
      3. Request Headers: Content-Type: application/json
      4. Request Body: Not Applicable

- Generate an HTML test report with a clean, readable layout:
    1. Display request details (endpoint, headers, body) on the left side of the screen
    2. Display response details (status code, headers, body) on the right side of the screen
    3. Save the report as get-booking-details-by-id.html in the following directory: root/test-report/
```
     
  - LLM will call the right MCP server tools to process your request of testing the GET api with provided test data. The output would look like below:
  
<img src="./documentation/images/post-execution.png" alt="Post Execution Insights">

## 🔧 Troubleshooting

- **Server not running?**  
  Double-check your MCP client configuration.

- **Module not found?**  
  Reinstall the package:
  ```
  npm i @automate-io/api-testing-mcp@latest
  ```

- **Client connection issues?**  
  Double-check your MCP client configuration.

## 🆘 Support

- Review this guide and your MCP client documentation.
- For issues, visit the [GitHub repository](https://github.com/Naveen-Automation/mcp-server) or open an issue.
- Consult [Model Context Protocol Documentation](https://modelcontextprotocol.io/).

---

**Happy API Testing! 🚀**






