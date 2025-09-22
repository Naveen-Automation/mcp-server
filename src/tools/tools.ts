import z from "zod";
import { sendPostRequest, sendGetRequest, sendPutRequest, sendDeleteRequest } from "../utilities/api-utilities.js";

/**
 * @description Registers MCP tools to the provided server instance.
 * @param server The MCP server instance to register tools on.
 * @author Veeranki Naveen Goud
 */
export function registerMcpTools(server: any) {
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
    }, async (params: any) => {
        try {
            const { status, body } = await sendPostRequest(params.url, params.headers, params.data, params.timeout || 30000);
            return {
                content: [{ type: "text", text: `Post request successfully sent\nStatus: ${status}\nResponse: ${JSON.stringify(body, null, 2)}` }]
            };
        } catch (error) {
            return {
                content: [{ type: "text", text: `Error occurred while sending POST request: ${error instanceof Error ? error.message : String(error)}` }]
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
    }, async (params: any) => {
        try {
            const { status, body } = await sendGetRequest(params.url, params.headers, params.pathParams, params.queryParams, params.timeout || 30000);
            return {
                content: [{ type: "text", text: `Get request successfully sent\nStatus: ${status}\nResponse: ${JSON.stringify(body, null, 2)}`}]
            };
        } catch (error) {
            return {
                content: [{ type: "text", text: `Error occurred while sending GET request: ${error instanceof Error ? error.message : String(error)}` }]
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
    }, async (params: any) => {
        try {
            const { status, body } = await sendPutRequest(params.url, params.headers, params.data, params.pathParams, params.queryParams, params.timeout || 30000);
            return {
                content: [{ type: "text", text: `Put request successfully sent\nStatus: ${status}\nResponse: ${JSON.stringify(body, null, 2)}` }]
            };
        } catch (error) {
            return {
                content: [{ type: "text", text: `Error occurred while sending PUT request: ${error instanceof Error ? error.message : String(error)}` }]
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
    }, async (params: any) => {
        try {
            const { status, body } = await sendDeleteRequest(params.url, params.headers, params.pathParams, params.queryParams,params.timeout || 30000);
            return {
                content: [{ type: "text", text: `Delete request successfully sent\nStatus: ${status}\nResponse: ${JSON.stringify(body, null, 2)}` }]
            };
        } catch (error) {
            return {
                content: [{ type: "text", text: `Error occurred while sending DELETE request: ${error instanceof Error ? error.message : String(error)}` }]
            };
        }
    });
    return server;
}