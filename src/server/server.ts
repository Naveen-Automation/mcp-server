#!/usr/bin/env node ;

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerMcpTools } from "../tools/tools.js";

// Creating MCP Server instance
let server = new McpServer({
    name: "API Testing MCP",
    version: "0.0.1",
    capabilities: {
        resources: {},
        tools: {},
        propmts: {}
    }
});

// Registering MCP tools
server = registerMcpTools(server);

/**
 * @description Initializes and starts the MCP Server.
 * This asynchronous function creates a new `StdioServerTransport` instance,
 * connects the server using the provided transport, and logs a message
 * indicating that the MCP Server is running.
 * @author Veeranki Naveen Goud
 */
async function main(){
    const transport = new StdioServerTransport()
    await server.connect(transport);
    console.log("API Testing MCP Server is running...");
}

// Starting the server
main();
