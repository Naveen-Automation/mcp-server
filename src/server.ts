 import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

 const server = new McpServer({
    name: "My MCP Server",
    version: "1.0.0",
    capabilities: {
        resources:{},
        tools: {},
        propmts: {}
    }
});

async function main(){
    const transport = new StdioServerTransport
    await server.connect(transport);
    console.log("MCP Server is running...");
}

main();