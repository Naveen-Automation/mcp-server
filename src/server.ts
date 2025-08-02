import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import z from "zod";
import { sendPostRequest } from "./utilities/api-utilities.js";


const server = new McpServer({
    name: "My MCP Server",
    version: "1.0.0",
    capabilities: {
        resources: {},
        tools: {},
        propmts: {}
    }
});

server.tool("send-post-request", "send the post request", {
    url: z.string(),
    data: z.object({}).passthrough().optional(),
    headers: z.object({}).passthrough().optional(),
    timeout: z.number().optional()
}, {
    title: "Send Post Request",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false
}, async (params) => {
    try {
        const { status, body } = await sendPostRequest(params.url, params.headers, params.data);
        return {
            content: [{
                type: "text",
                text: `Post request successfully sent\nStatus: ${status}\nResponse: ${JSON.stringify(body, null, 2)}`
            }]
        };
    } catch (error) {
        return {
            content: [{ type: "text", text: `Error occurred while sending POST request: ${error instanceof Error ? error.message : String(error)}` }]
        };
    }
});



/**
 * @description Initializes and starts the MCP Server.
 *
 * This asynchronous function creates a new `StdioServerTransport` instance,
 * connects the server using the provided transport, and logs a message
 * indicating that the MCP Server is running.
 *
 * @returns {Promise<void>} A promise that resolves when the server has started.
 */
async function main(): Promise<void> {
    const transport = new StdioServerTransport()
    await server.connect(transport);
    console.log("MCP Server is running...");
}

main();