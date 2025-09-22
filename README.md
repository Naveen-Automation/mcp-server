  
  <p align="center">
    <img src="./documentation/screen-shots/mcp-logo.png" alt="MCP LOGO" width=400 height=400>
  </p>
  
  # API Testing Using MCP Server (End User Guide)

A ready-to-use Model Context Protocol (MCP) server for HTTP API testing, powered by Playwright. This guide helps you install, configure, and run the MCP server locally as an npm package.
<br>
<br>


## 📋 Table of Contents

- [Overview](#🌟-overview)
- [Prerequisites](#📋-prerequisites)
- [Setup](#🚀-setup)
- [Configurations](#⚙️-configurations)
- [Usage](#📖-usage)
- [Troubleshooting](#🔧-troubleshooting)
- [Support](#🆘-support)
<br>
<br>


## 🌟 Overview   

The Playwright API MCP Server enables API testing via the Model Context Protocol. It supports GET, POST, PUT, and DELETE requests.
<br>
<br>

## 📋 Prerequisites

- **Node.js**: v18.0.0 or higher.
- **npm**: Comes with Node.js.
- **VS Code**: MCP-compatible client.
- **Github Copilot**: Make sure the GitHub Copilot extension is installed and enabled in VS Code.<br>  Watch the video to understand how to enable Github Copilot: https://www.youtube.com/watch?v=etP5wq4Zl20
- **How to use Github Copilot for free** Watch the Video: https://www.youtube.com/watch?v=X_Aet9ndh_Y
<br>
<br>


## 🚀 Setup
1. **Create a Node.js Project in VS Code**:
      - Create a new folder with a meaningful name (e.g. `my-project`).
      - Open the folder in Visual Studio Code.
      - Launch the integrated terminal (via `View > Terminal`).
      - Choose your preferred shell (e.g. `Git Bash, Command Prompt, or PowerShell`).
      - Run the following command to initialise the project:
        ```
        npm init -y
        ```
      - This will generate a package.json file with default settings

  <br>

2. **Install the MCP Server Package**  
      - Now, run the below command to install the mcp server package.
        ```bash
        npm i @automate-io/api-testing-mcp@latest
        ```
   
<br>


## ⚙️ Configurations
1. Open your project folder in VS Code
2. If the `mcp.json` file does not already exist, create it inside the `root/.vscode/` directory.
If the file is already present, you can skip this step
3. Add the `api-testing-mcp` configuration under the `servers` key in the `mcp.json` file, as shown below

    <img src="./documentation/screen-shots/mcp-client-config-v2.png" alt="MCP Client Config">

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
- **❗Important Note**: If you are working in a `monorepo`, ensure the `args` field in your `mcp.json` file is correctly configured. Refer to the [Monorepo MCP Configuration](./documentation/read-me/mcp-config-monorepo-vs-standalone.md) guide for detailed instructions.<br>
If your test code resides in a `standalone` repository, no changes are needed, you are good to go.


<br>
<br>


## 📖 Usage

1. **Start the MCP Server**
  - Click the highlighted start button in the mcp.json file as shown below to start the MCP server.

    <img src="./documentation/screen-shots/server-start-button-v2.png" alt="Server Start Button">

    <br>


2. **Input the prompt** 
  
  - Open GitHub Copilot chat window in  VS Code with Agent mode selected.

  - Enter a prompt that outlines the API you wish to test.
  For example, to test a `POST` endpoint, your input should be like below:

    <img src="./documentation/screen-shots//mcp-usage-v2.png" alt="MCP Usage">

    <br>

    **Sample prompt used in above screenshot**
     
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

    <br>


3. **Results Output** 
  - LLM will call the right MCP server tools to process your request of testing the GET api with provided test data. The output would look like below:
    <img src="./documentation/screen-shots/post-execution-v2.png" alt="Post Execution Insights">
<br>
<br>



## 🔧 Troubleshooting

- **Server not running?**  
  Double-check your MCP client configuration.

- **Module not found?**  
  Reinstall the package:
  ```
  npm i @automate-io/api-testing-mcp@latest
  ```
<br>


## 🆘 Support

- Review this guide and your MCP client documentation.
- For issues, open [GitHub Issues](https://github.com/Naveen-Automation/mcp-server/issues) here.
- Consult [Model Context Protocol Documentation](https://modelcontextprotocol.io/).

---
<br>


**Happy API Testing! 🚀**






