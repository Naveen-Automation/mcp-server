#!/usr/bin/env node ;

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import z from "zod"; // Zod library for runtime type validation and schema definition
import { sendPostRequest, sendGetRequest, sendPutRequest, sendDeleteRequest } from "./utilities/api-utilities.js";


// Initialize the MCP (Model Context Protocol) server with configuration
const server = new McpServer({
    name: "API Testing MCP Server",
    version: "0.0.1",
    capabilities: {
        resources: {}, // Resources that the server can provide
        tools: {}, // Tools that the server offers (defined below)
        propmts: {} // Note: typo in original code - should be "prompts"
    }
});

/**
 * MCP Tool: Send POST Request
 * Creates or submits data to a server endpoint
 */
server.tool("send-post-request", "send the post request", {
    // Schema definition using Zod for runtime validation of tool parameters
    url: z.string(), // URL must be a string
    data: z.object({}).passthrough().optional(), // Request body - any object shape, optional
    headers: z.object({}).passthrough().optional(), // Headers - any object shape, optional
    timeout: z.number().optional() // Timeout in ms - number, optional
}, {
    // Tool metadata for the MCP protocol
    title: "Send Post Request",
    readOnlyHint: false, // This operation modifies data
    destructiveHint: false, // Not destructive (doesn't delete data)
    idempotentHint: false, // Not idempotent (multiple calls may have different effects)
    openWorldHint: false
}, async (params) => {
    try {
        // Call the API utility function with user-provided parameters
        const { status, body } = await sendPostRequest(params.url, params.headers, params.data, params.timeout || 30000);
        
        // Check if the response contains an error from the utility function
        // Status 0 indicates request didn't complete, or body.error flag is set
        if (status === 0 || (body && typeof body === 'object' && body.error === true)) {
            // Format and return error response with user-friendly message
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
                isError: true // Flag to indicate this is an error response
            };
        }
        
        // Format and return successful response
        return {
            content: [{
                type: "text",
                // Use JSON.stringify with 2-space indentation for readable output
                text: `✅ POST Request Successful\n\n` +
                      `Status Code: ${status}\n\n` +
                      `Response:\n${JSON.stringify(body, null, 2)}`
            }]
        };
    } catch (error) {
        // Catch unexpected errors that weren't handled by the utility function
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
    // Schema definition using Zod for runtime validation
    url: z.string(),
    headers: z.object({}).passthrough().optional(),
    pathParams: z.object({}).passthrough().optional(), // For URL path replacement
    queryParams: z.object({}).passthrough().optional(), // For URL query string
    timeout: z.number().optional()
}, {
    // Tool metadata for the MCP protocol
    title: "Send Get Request",
    readOnlyHint: true, // GET is read-only, doesn't modify server state
    destructiveHint: false,
    idempotentHint: true, // GET is idempotent - same request returns same result
    openWorldHint: false
}, async (params) => {
    try {
        // Call the API utility function with all parameters
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
    // Schema definition using Zod for runtime validation
    url: z.string(),
    data: z.object({}).passthrough().optional(), // Request body with updated data
    headers: z.object({}).passthrough().optional(),
    pathParams: z.object({}).passthrough().optional(),
    queryParams: z.object({}).passthrough().optional(),
    timeout: z.number().optional()
}, {
    // Tool metadata for the MCP protocol
    title: "Send Put Request",
    readOnlyHint: false, // PUT modifies data
    destructiveHint: false, // Not destructive (updates, doesn't delete)
    idempotentHint: true, // PUT is idempotent - same request gives same result
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
    // Schema definition using Zod for runtime validation
    url: z.string(),
    headers: z.object({}).passthrough().optional(),
    pathParams: z.object({}).passthrough().optional(),
    queryParams: z.object({}).passthrough().optional(),
    timeout: z.number().optional()
}, {
    // Tool metadata for the MCP protocol
    title: "Send Delete Request",
    readOnlyHint: false,
    destructiveHint: true, // DELETE is destructive - removes data
    idempotentHint: false, // Not idempotent - deleting same resource twice has different effects
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
        // Create a transport for stdio communication (communicates via stdin/stdout)
        // This is how the MCP server communicates with clients
        const transport = new StdioServerTransport();
        
        // Connect the MCP server using the stdio transport
        await server.connect(transport);
        
        // Log success message to stdout
        console.log("✅ MCP Server is running successfully...");
    } catch (error) {
        // Log detailed error information to stderr
        console.error("❌ Failed to start MCP Server");
        console.error("Error details:", error instanceof Error ? error.message : String(error));
        console.error("\nPossible causes:");
        console.error("- The server port might already be in use");
        console.error("- Required dependencies might not be installed");
        console.error("- Configuration issues in the MCP setup");
        console.error("\nPlease check the error message above and verify your setup.");
        
        // Exit with error code 1 to indicate failure
        process.exit(1);
    }
}

// Execute the main function and add a catch handler for any unhandled promise rejections
main().catch((error) => {
    console.error("❌ Unhandled error in main process");
    console.error("Error:", error instanceof Error ? error.message : String(error));
    console.error("\nThe MCP server encountered an unexpected error and will now exit.");
    console.error("If this issue persists, please report it with the error details above.");
    
    // Exit with error code 1
    process.exit(1);
});