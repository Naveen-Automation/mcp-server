#!/usr/bin/env node ;

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import z from "zod";
import { sendPostRequest, sendGetRequest, sendPutRequest, sendDeleteRequest } from "./utilities/api-utilities.js";


const server = new McpServer({
    name: "API Testing MCP Server",
    version: "0.0.1",
    capabilities: {
        resources: {},
        tools: {},
        propmts: {}
    }
});

/**
 * MCP Tool: Send POST Request
 * Creates or submits data to a server endpoint
 */
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
        const { status, body } = await sendPostRequest(params.url, params.headers, params.data, params.timeout || 30000);
        
        // Check if the response contains an error from the utility function
        if (status === 0 || (body && typeof body === 'object' && body.error === true)) {
            return {
                content: [{
                    type: "text",
                    text: `❌ POST Request Failed\n\n` +
                          `${body.message || 'Unknown error'}\n\n` +
                          `${body.details ? body.details + '\n\n' : ''}` +
                          `Additional Information:\n` +
                          `- URL: ${body.url || params.url}\n` +
                          `- Status Code: ${status}\n` +
                          `${body.originalError ? `- Original Error: ${body.originalError}\n` : ''}`
                }],
                isError: true
            };
        }
        
        return {
            content: [{
                type: "text",
                text: `✅ POST Request Successful\n\n` +
                      `Status Code: ${status}\n\n` +
                      `Response:\n${JSON.stringify(body, null, 2)}`
            }]
        };
    } catch (error) {
        return {
            content: [{
                type: "text",
                text: `❌ Unexpected Error in POST Request\n\n` +
                      `An unexpected error occurred while processing the POST request.\n\n` +
                      `Error Details: ${error instanceof Error ? error.message : String(error)}\n\n` +
                      `URL: ${params.url}\n\n` +
                      `This is likely a programming error. Please report this issue if it persists.`
            }],
            isError: true
        };
    }
});

/**
 * MCP Tool: Send GET Request
 * Retrieves data from a server endpoint with path and query parameters
 */
server.tool("send-get-request", "send the get request", {
    url: z.string(),
    headers: z.object({}).passthrough().optional(),
    pathParams: z.object({}).passthrough().optional(),
    queryParams: z.object({}).passthrough().optional(),
    timeout: z.number().optional()
}, {
    title: "Send Get Request",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false
}, async (params) => {
    try {
        const { status, body } = await sendGetRequest(params.url, params.headers, params.pathParams, params.queryParams, params.timeout || 30000);
        
        // Check if the response contains an error from the utility function
        if (status === 0 || (body && typeof body === 'object' && body.error === true)) {
            return {
                content: [{
                    type: "text",
                    text: `❌ GET Request Failed\n\n` +
                          `${body.message || 'Unknown error'}\n\n` +
                          `${body.details ? body.details + '\n\n' : ''}` +
                          `Additional Information:\n` +
                          `- URL: ${body.url || params.url}\n` +
                          `- Status Code: ${status}\n` +
                          `${body.originalError ? `- Original Error: ${body.originalError}\n` : ''}`
                }],
                isError: true
            };
        }
        
        return {
            content: [{
                type: "text",
                text: `✅ GET Request Successful\n\n` +
                      `Status Code: ${status}\n\n` +
                      `Response:\n${JSON.stringify(body, null, 2)}`
            }]
        };
    } catch (error) {
        return {
            content: [{
                type: "text",
                text: `❌ Unexpected Error in GET Request\n\n` +
                      `An unexpected error occurred while processing the GET request.\n\n` +
                      `Error Details: ${error instanceof Error ? error.message : String(error)}\n\n` +
                      `URL: ${params.url}\n\n` +
                      `This is likely a programming error. Please report this issue if it persists.`
            }],
            isError: true
        };
    }
});

/**
 * MCP Tool: Send PUT Request
 * Updates existing data on a server endpoint
 */
server.tool("send-put-request", "send the put request", {
    url: z.string(),
    data: z.object({}).passthrough().optional(),
    headers: z.object({}).passthrough().optional(),
    pathParams: z.object({}).passthrough().optional(),
    queryParams: z.object({}).passthrough().optional(),
    timeout: z.number().optional()
}, {
    title: "Send Put Request",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false
}, async (params) => {
    try {
        const { status, body } = await sendPutRequest(params.url, params.headers, params.data, params.pathParams, params.queryParams, params.timeout || 30000);
        
        // Check if the response contains an error from the utility function
        if (status === 0 || (body && typeof body === 'object' && body.error === true)) {
            return {
                content: [{
                    type: "text",
                    text: `❌ PUT Request Failed\n\n` +
                          `${body.message || 'Unknown error'}\n\n` +
                          `${body.details ? body.details + '\n\n' : ''}` +
                          `Additional Information:\n` +
                          `- URL: ${body.url || params.url}\n` +
                          `- Status Code: ${status}\n` +
                          `${body.originalError ? `- Original Error: ${body.originalError}\n` : ''}`
                }],
                isError: true
            };
        }
        
        return {
            content: [{
                type: "text",
                text: `✅ PUT Request Successful\n\n` +
                      `Status Code: ${status}\n\n` +
                      `Response:\n${JSON.stringify(body, null, 2)}`
            }]
        };
    } catch (error) {
        return {
            content: [{
                type: "text",
                text: `❌ Unexpected Error in PUT Request\n\n` +
                      `An unexpected error occurred while processing the PUT request.\n\n` +
                      `Error Details: ${error instanceof Error ? error.message : String(error)}\n\n` +
                      `URL: ${params.url}\n\n` +
                      `This is likely a programming error. Please report this issue if it persists.`
            }],
            isError: true
        };
    }
});

/**
 * MCP Tool: Send DELETE Request
 * Deletes data from a server endpoint
 */
server.tool("send-delete-request", "send the delete request", {
    url: z.string(),
    headers: z.object({}).passthrough().optional(),
    pathParams: z.object({}).passthrough().optional(),
    queryParams: z.object({}).passthrough().optional(),
    timeout: z.number().optional()
}, {
    title: "Send Delete Request",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: false,
    openWorldHint: false
}, async (params) => {
    try {
        const { status, body } = await sendDeleteRequest(params.url, params.headers, params.pathParams, params.queryParams, params.timeout || 30000);
        
        // Check if the response contains an error from the utility function
        if (status === 0 || (body && typeof body === 'object' && body.error === true)) {
            return {
                content: [{
                    type: "text",
                    text: `❌ DELETE Request Failed\n\n` +
                          `${body.message || 'Unknown error'}\n\n` +
                          `${body.details ? body.details + '\n\n' : ''}` +
                          `Additional Information:\n` +
                          `- URL: ${body.url || params.url}\n` +
                          `- Status Code: ${status}\n` +
                          `${body.originalError ? `- Original Error: ${body.originalError}\n` : ''}`
                }],
                isError: true
            };
        }
        
        return {
            content: [{
                type: "text",
                text: `✅ DELETE Request Successful\n\n` +
                      `Status Code: ${status}\n\n` +
                      `Response:\n${JSON.stringify(body, null, 2)}`
            }]
        };
    } catch (error) {
        return {
            content: [{
                type: "text",
                text: `❌ Unexpected Error in DELETE Request\n\n` +
                      `An unexpected error occurred while processing the DELETE request.\n\n` +
                      `Error Details: ${error instanceof Error ? error.message : String(error)}\n\n` +
                      `URL: ${params.url}\n\n` +
                      `This is likely a programming error. Please report this issue if it persists.`
            }],
            isError: true
        };
    }
});



/**
 * @description Initializes and starts the MCP Server.
 *
 * This asynchronous function creates a new `StdioServerTransport` instance,
 * connects the server using the provided transport, and logs a message
 * indicating that the MCP Server is running.
 * @returns {Promise<void>} A promise that resolves when the server has started.
 * @author Veeranki Naveen Goud
 */
async function main(): Promise<void> {
    try {
        const transport = new StdioServerTransport();
        await server.connect(transport);
        console.log("✅ MCP Server is running successfully...");
    } catch (error) {
        console.error("❌ Failed to start MCP Server");
        console.error("Error details:", error instanceof Error ? error.message : String(error));
        console.error("\nPossible causes:");
        console.error("- The server port might already be in use");
        console.error("- Required dependencies might not be installed");
        console.error("- Configuration issues in the MCP setup");
        console.error("\nPlease check the error message above and verify your setup.");
        process.exit(1);
    }
}

main().catch((error) => {
    console.error("❌ Unhandled error in main process");
    console.error("Error:", error instanceof Error ? error.message : String(error));
    console.error("\nThe MCP server encountered an unexpected error and will now exit.");
    console.error("If this issue persists, please report it with the error details above.");
    process.exit(1);
});