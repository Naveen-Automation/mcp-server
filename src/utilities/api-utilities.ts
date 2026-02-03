import { request } from "@playwright/test";

/**
 * @description Validates that the provided URL is well-formed and uses http/https protocol
 * @param {string} url - The URL to validate
 * @throws {Error} When URL is invalid or uses unsupported protocol
 * @author Veeranki Naveen Goud
 */
function validateUrl(url: string): void {
    // Check if URL is provided, is a string type, and is not empty after trimming whitespace
    if (!url || typeof url !== 'string' || url.trim() === '') {
        throw new Error('URL is required and must be a non-empty string. Please provide a valid URL.');
    }
    
    try {
        // Use the built-in URL constructor from the Web API to parse and validate the URL
        // This will throw a TypeError if the URL is malformed
        const urlObj = new URL(url);
        
        // Check if the protocol is HTTP or HTTPS - other protocols like ftp:, file:, etc. are not supported
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
            throw new Error(`Unsupported protocol '${urlObj.protocol}'. Only HTTP and HTTPS protocols are supported. Please use a URL starting with 'http://' or 'https://'.`);
        }
    } catch (error) {
        // TypeError is thrown by the URL constructor when the URL format is invalid
        if (error instanceof TypeError) {
            throw new Error(`Invalid URL format: '${url}'. Please provide a valid URL starting with 'http://' or 'https://'. Example: 'https://api.example.com/endpoint'`);
        }
        // Re-throw other errors (like our protocol validation error)
        throw error;
    }
}

/**
 * @description Helper function to replace path parameters in URL templates with actual values.
 * Supports both {param} and :param formats for path parameter replacement.
 * @param {string} url - The URL template containing path parameter placeholders
 * @param {any} pathParams - Object containing key-value pairs for path parameter replacement
 * @return {string} The final URL with path parameters replaced
 * @author Veeranki Naveen Goud
 */
function buildUrlWithPathParams(url: string, pathParams?: any): string {
    // If no path parameters provided, return the original URL unchanged
    if (!pathParams) return url;
    
    let finalUrl = url;
    // Iterate through all keys in the pathParams object
    Object.keys(pathParams).forEach(key => {
        const value = pathParams[key];
        // Only replace if value is not undefined or null
        if (value !== undefined && value !== null) {
            // Replace both {key} and :key formats using a regular expression
            // Example: /users/{id} or /users/:id both become /users/123 when id=123
            // The 'g' flag ensures all occurrences are replaced, not just the first one
            finalUrl = finalUrl.replace(new RegExp(`{${key}}|:${key}`, 'g'), String(value));
        }
    });
    return finalUrl;
}

/**
 * @description Safely parses response body as JSON or falls back to text
 * @param {any} apiResponse - The API response object
 * @param {string} method - HTTP method being used (for error context)
 * @param {string} url - URL being requested (for error context)
 * @return {Promise<any>} The parsed response body
 * @author Veeranki Naveen Goud
 */
async function parseResponseBody(apiResponse: any, method: string, url: string): Promise<any> {
    try {
        // Get the content-type header from the response using Playwright's headers() method
        // Default to empty string if header is not present
        const contentType = apiResponse.headers()['content-type'] || '';
        
        // Check if the response is JSON based on content-type header
        if (contentType.includes('application/json')) {
            try {
                // Use Playwright's json() method to parse the response as JSON
                return await apiResponse.json();
            } catch (jsonError) {
                // If JSON parsing fails (malformed JSON), fallback to text
                // This can happen when server claims JSON but sends invalid JSON
                const text = await apiResponse.text();
                return text || `Response received but could not be parsed as JSON. Content-Type: ${contentType}`;
            }
        }
        
        // For non-JSON content types (text/html, text/plain, etc.), retrieve as text
        // Use Playwright's text() method to get the raw response body
        const text = await apiResponse.text();
        return text || 'Empty response body';
    } catch (error) {
        // If any unexpected error occurs during parsing, return an error message
        return `Failed to parse response body for ${method} request to ${url}. Error: ${error instanceof Error ? error.message : String(error)}`;
    }
}

/**
 * @description Generates a detailed error message for HTTP status errors
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {number} status - HTTP status code
 * @param {string} url - The URL that was requested
 * @param {any} responseBody - The response body from the server
 * @return {object} Structured error response
 * @author Veeranki Naveen Goud
 */
function createHttpStatusError(method: string, status: number, url: string, responseBody: any) {
    // Create a structured error object with consistent format for HTTP status errors
    // This provides user-friendly error messages with actionable information
    return {
        error: true, // Flag to indicate this is an error response
        message: `${method} request failed with HTTP status ${status}`,
        // Provide detailed explanation of common HTTP status code ranges
        details: `The server responded with status ${status} which indicates an error. Common causes:\n` +
                 `- Status 400-499: Client errors (bad request, unauthorized, not found, etc.)\n` +
                 `- Status 500-599: Server errors (internal server error, service unavailable, etc.)\n` +
                 `URL: ${url}\n` +
                 `Response: ${JSON.stringify(responseBody, null, 2)}`, // Format JSON with 2-space indentation for readability
        url,
        statusCode: status,
        response: responseBody
    };
}

/**
 * @description Generates detailed error information based on error type
 * @param {Error | unknown} error - The error that occurred
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {string} url - The URL that was requested
 * @param {number} timeout - Timeout value in milliseconds
 * @return {object} Structured error response with message and details
 * @author Veeranki Naveen Goud
 */
function createDetailedError(error: unknown, method: string, url: string, timeout: number) {
    // Initialize with a generic error message
    let errorMessage = `An unexpected error occurred while sending ${method} request.`;
    let errorDetails = '';
    
    // Type guard to check if error is an Error instance (has a message property)
    if (error instanceof Error) {
        // Categorize errors based on error message patterns from Playwright/Node.js
        
        // Timeout errors - occur when request exceeds the specified timeout value
        if (error.message.includes('timeout') || error.message.includes('Timeout')) {
            errorMessage = 'Request timeout';
            errorDetails = `The ${method} request to ${url} timed out after ${timeout}ms. ` +
                          `This usually means:\n` +
                          `- The server is taking too long to respond\n` +
                          `- The server may be down or unreachable\n` +
                          `- Network connectivity issues\n` +
                          `\nSuggestions:\n` +
                          `- Increase the timeout value if the endpoint is known to be slow\n` +
                          `- Check if the server is running and accessible\n` +
                          `- Verify your network connection`;
        } 
        // ECONNREFUSED - Node.js error code indicating connection was actively refused by the server
        else if (error.message.includes('ECONNREFUSED')) {
            errorMessage = 'Connection refused';
            errorDetails = `Could not connect to ${url}. The connection was refused. ` +
                          `This usually means:\n` +
                          `- The server is not running at the specified URL\n` +
                          `- The port is incorrect\n` +
                          `- A firewall is blocking the connection\n` +
                          `\nPlease verify the URL and ensure the server is running.`;
        } 
        // ENOTFOUND or getaddrinfo - DNS resolution failures
        // These errors occur when the domain name cannot be resolved to an IP address
        else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
            errorMessage = 'Host not found';
            errorDetails = `Could not resolve hostname in URL: ${url}. ` +
                          `This usually means:\n` +
                          `- The domain name is misspelled\n` +
                          `- The domain does not exist\n` +
                          `- DNS resolution issues\n` +
                          `\nPlease check the URL and try again.`;
        } 
        // Validation errors from our own validateUrl function
        else if (error.message.includes('Invalid URL') || error.message.includes('URL is required')) {
            errorMessage = error.message;
            errorDetails = ''; // No additional details needed for validation errors
        } 
        // Fallback for any other error types
        else {
            errorMessage = error.message;
            errorDetails = `URL: ${url}\nTimeout: ${timeout}ms`;
        }
    }
    
    // Return a structured error object with consistent format
    return {
        error: true,
        message: errorMessage,
        details: errorDetails,
        url,
        originalError: error instanceof Error ? error.message : String(error) // Preserve original error for debugging
    };
}

/**
 * @description Sends an HTTP POST request to the specified URL with headers, body data, and optional path parameters.
 * Handles JSON and text response parsing automatically and manages request context lifecycle.
 * @param {string} url - The target URL for the POST request (can contain path parameter placeholders)
 * @param {any} headers - HTTP headers to include in the request
 * @param {any} body - Request body data to be sent with the POST request
 * @param {number} timeout - Request timeout in milliseconds (default: 30000ms)
 * @return {Promise<{status: number, body: any}>} Promise resolving to an object containing HTTP status code and response body
 * @author Veeranki Naveen Goud
 */

export async function sendPostRequest(url: string, headers: any, body: any, timeout: number = 30000) {
    // Initialize apiRequest to null so we can track if it was created (for cleanup in catch block)
    let apiRequest: any = null;
    
    try {
        // Validate URL before making request (checks format, protocol, etc.)
        validateUrl(url);
        
        // Ensure timeout is a positive value
        if (timeout <= 0) {
            throw new Error(`Invalid timeout value: ${timeout}ms. Timeout must be greater than 0. Recommended value: 30000ms (30 seconds).`);
        }
        
        // Validate that headers, if provided, is an object and not an array
        // Headers should be key-value pairs like {"Content-Type": "application/json"}
        if (headers && (typeof headers !== 'object' || Array.isArray(headers))) {
            throw new Error('Headers must be an object containing key-value pairs. Example: {"Content-Type": "application/json"}');
        }
        
        // Prepare request options for Playwright's API context
        let options: any = {
            "headers": headers || {}, // Use provided headers or empty object
            "data": body, // Request payload
            "timeout": timeout // Request timeout in milliseconds
        };
        
        // Create a new API request context using Playwright's request API
        // This context manages the HTTP request/response lifecycle
        apiRequest = await request.newContext();
        
        // Execute the POST request using Playwright's request context
        const apiResponse: any = await apiRequest.post(url, options);
        
        // Extract status code from the response
        const status = apiResponse.status();
        
        // Parse the response body (handles JSON and text responses)
        const responseBody = await parseResponseBody(apiResponse, 'POST', url);
        
        // Clean up the request context to free resources
        await apiRequest.dispose();
        
        // Check if the response indicates an error (status code outside 2xx range)
        // Playwright's ok() method returns false for status codes outside 200-299
        if (!apiResponse.ok()) {
            return {
                status,
                body: createHttpStatusError('POST', status, url, responseBody)
            };
        }
        
        // Return successful response with status and parsed body
        return { status, body: responseBody };
        
    } catch (error) {
        // Clean up request context if it was created before the error occurred
        if (apiRequest) {
            try {
                await apiRequest.dispose();
            } catch (disposeError) {
                // Silently ignore errors during cleanup to avoid masking the original error
            }
        }
        
        // Return a structured error response with detailed error information
        return {
            status: 0, // Status 0 indicates the request never completed
            body: createDetailedError(error, 'POST', url, timeout)
        };
    }
}

/**
 * @description Sends an HTTP GET request to the specified URL with headers, optional path parameters, and query parameters.
 * Automatically constructs the final URL with path and query parameter substitution and handles response parsing.
 * @param {string} url - The target URL for the GET request (can contain path parameter placeholders)
 * @param {any} headers - HTTP headers to include in the request
 * @param {any} pathParams - Optional object containing path parameter values for URL template replacement
 * @param {any} queryParams - Optional object containing query parameters to append to the URL
 * @param {number} timeout - Request timeout in milliseconds (default: 30000ms)
 * @return {Promise<{status: number, body: any}>} Promise resolving to an object containing HTTP status code and response body
 * @author Veeranki Naveen Goud
 */
export async function sendGetRequest(url: string, headers: any, pathParams?: any, queryParams?: any, timeout: number = 30000) {
    // Initialize apiRequest to null so we can track if it was created (for cleanup in catch block)
    let apiRequest: any = null;
    
    try {
        // Validate URL before making request (checks format, protocol, etc.)
        validateUrl(url);
        
        // Ensure timeout is a positive value
        if (timeout <= 0) {
            throw new Error(`Invalid timeout value: ${timeout}ms. Timeout must be greater than 0. Recommended value: 30000ms (30 seconds).`);
        }
        
        // Validate that headers, if provided, is an object and not an array
        if (headers && (typeof headers !== 'object' || Array.isArray(headers))) {
            throw new Error('Headers must be an object containing key-value pairs. Example: {"Content-Type": "application/json"}');
        }
        
        // Replace path parameters in the URL template (e.g., /users/{id} becomes /users/123)
        let finalUrl = buildUrlWithPathParams(url, pathParams);
        
        // Build and append query parameters to the URL if provided
        if (queryParams) {
            // Use URLSearchParams API to properly encode query parameters
            const urlParams = new URLSearchParams();
            Object.keys(queryParams).forEach(key => {
                // Only add non-null and non-undefined values
                if (queryParams[key] !== undefined && queryParams[key] !== null) {
                    // Convert value to string and add to URLSearchParams
                    urlParams.append(key, String(queryParams[key]));
                }
            });
            // Convert URLSearchParams to query string (e.g., "key1=value1&key2=value2")
            const queryString = urlParams.toString();
            if (queryString) {
                // Append query string to URL, using & if URL already has ? else use ?
                finalUrl = `${finalUrl}${finalUrl.includes('?') ? '&' : '?'}${queryString}`;
            }
        }

        // Prepare request options for Playwright's API context
        let options: any = {
            "headers": headers || {},
            "timeout": timeout
        };
        
        // Create a new API request context using Playwright's request API
        apiRequest = await request.newContext();
        
        // Execute the GET request using Playwright's request context
        const apiResponse: any = await apiRequest.get(finalUrl, options);
        
        // Extract status code from the response
        const status = apiResponse.status();
        
        // Parse the response body (handles JSON and text responses)
        const responseBody = await parseResponseBody(apiResponse, 'GET', finalUrl);
        
        // Clean up the request context to free resources
        await apiRequest.dispose();
        
        // Check if the response indicates an error (status code outside 2xx range)
        if (!apiResponse.ok()) {
            return {
                status,
                body: createHttpStatusError('GET', status, finalUrl, responseBody)
            };
        }
        
        // Return successful response with status and parsed body
        return { status, body: responseBody };
        
    } catch (error) {
        // Clean up request context if it was created before the error occurred
        if (apiRequest) {
            try {
                await apiRequest.dispose();
            } catch (disposeError) {
                // Silently ignore errors during cleanup
            }
        }
        
        // Return a structured error response with detailed error information
        return {
            status: 0,
            body: createDetailedError(error, 'GET', url, timeout)
        };
    }
}

/**
 * @description Sends an HTTP PUT request to the specified URL with headers, body data, optional path parameters, and query parameters.
 * Used for updating existing resources. Handles URL construction, request execution, and response parsing automatically.
 * @param {string} url - The target URL for the PUT request (can contain path parameter placeholders)
 * @param {any} headers - HTTP headers to include in the request
 * @param {any} body - Request body data containing the updated resource information
 * @param {any} pathParams - Optional object containing path parameter values for URL template replacement
 * @param {any} queryParams - Optional object containing query parameters to append to the URL
 * @param {number} timeout - Request timeout in milliseconds (default: 30000ms)
 * @return {Promise<{status: number, body: any}>} Promise resolving to an object containing HTTP status code and response body
 * @author Veeranki Naveen Goud
 */
export async function sendPutRequest(url: string, headers: any, body: any, pathParams?: any, queryParams?: any, timeout: number = 30000) {
    // Initialize apiRequest to null so we can track if it was created (for cleanup in catch block)
    let apiRequest: any = null;
    
    try {
        // Validate URL before making request (checks format, protocol, etc.)
        validateUrl(url);
        
        // Ensure timeout is a positive value
        if (timeout <= 0) {
            throw new Error(`Invalid timeout value: ${timeout}ms. Timeout must be greater than 0. Recommended value: 30000ms (30 seconds).`);
        }
        
        // Validate that headers, if provided, is an object and not an array
        if (headers && (typeof headers !== 'object' || Array.isArray(headers))) {
            throw new Error('Headers must be an object containing key-value pairs. Example: {"Content-Type": "application/json"}');
        }
        
        // Replace path parameters in the URL template (e.g., /users/{id} becomes /users/123)
        let finalUrl = buildUrlWithPathParams(url, pathParams);
        
        // Build and append query parameters to the URL if provided
        if (queryParams) {
            // Use URLSearchParams API to properly encode query parameters
            const urlParams = new URLSearchParams();
            Object.keys(queryParams).forEach(key => {
                // Only add non-null and non-undefined values
                if (queryParams[key] !== undefined && queryParams[key] !== null) {
                    urlParams.append(key, String(queryParams[key]));
                }
            });
            // Convert URLSearchParams to query string
            const queryString = urlParams.toString();
            if (queryString) {
                // Append query string to URL, using & if URL already has ? else use ?
                finalUrl = `${finalUrl}${finalUrl.includes('?') ? '&' : '?'}${queryString}`;
            }
        }

        // Prepare request options for Playwright's API context
        let options: any = {
            "headers": headers || {},
            "data": body, // Request payload for updating resource
            "timeout": timeout
        };
        
        // Create a new API request context using Playwright's request API
        apiRequest = await request.newContext();
        
        // Execute the PUT request using Playwright's request context
        const apiResponse: any = await apiRequest.put(finalUrl, options);
        
        // Extract status code from the response
        const status = apiResponse.status();
        
        // Parse the response body (handles JSON and text responses)
        const responseBody = await parseResponseBody(apiResponse, 'PUT', finalUrl);
        
        // Clean up the request context to free resources
        await apiRequest.dispose();
        
        // Check if the response indicates an error (status code outside 2xx range)
        if (!apiResponse.ok()) {
            return {
                status,
                body: createHttpStatusError('PUT', status, finalUrl, responseBody)
            };
        }
        
        // Return successful response with status and parsed body
        return { status, body: responseBody };
        
    } catch (error) {
        // Clean up request context if it was created before the error occurred
        if (apiRequest) {
            try {
                await apiRequest.dispose();
            } catch (disposeError) {
                // Silently ignore errors during cleanup
            }
        }
        
        // Return a structured error response with detailed error information
        return {
            status: 0,
            body: createDetailedError(error, 'PUT', url, timeout)
        };
    }
}

/**
 * @description Sends an HTTP DELETE request to the specified URL with headers, optional path parameters, and query parameters.
 * Used for deleting resources. Constructs the final URL with parameter substitution and handles response processing.
 * @param {string} url - The target URL for the DELETE request (can contain path parameter placeholders)
 * @param {any} headers - HTTP headers to include in the request
 * @param {any} pathParams - Optional object containing path parameter values for URL template replacement
 * @param {any} queryParams - Optional object containing query parameters to append to the URL
 * @param {number} timeout - Request timeout in milliseconds (default: 30000ms)
 * @return {Promise<{status: number, body: any}>} Promise resolving to an object containing HTTP status code and response body
 * @author Veeranki Naveen Goud
 */
export async function sendDeleteRequest(url: string, headers: any, pathParams?: any, queryParams?: any, timeout: number = 30000) {
    // Initialize apiRequest to null so we can track if it was created (for cleanup in catch block)
    let apiRequest: any = null;
    
    try {
        // Validate URL before making request (checks format, protocol, etc.)
        validateUrl(url);
        
        // Ensure timeout is a positive value
        if (timeout <= 0) {
            throw new Error(`Invalid timeout value: ${timeout}ms. Timeout must be greater than 0. Recommended value: 30000ms (30 seconds).`);
        }
        
        // Validate that headers, if provided, is an object and not an array
        if (headers && (typeof headers !== 'object' || Array.isArray(headers))) {
            throw new Error('Headers must be an object containing key-value pairs. Example: {"Content-Type": "application/json"}');
        }
        
        // Replace path parameters in the URL template (e.g., /users/{id} becomes /users/123)
        let finalUrl = buildUrlWithPathParams(url, pathParams);
        
        // Build and append query parameters to the URL if provided
        if (queryParams) {
            // Use URLSearchParams API to properly encode query parameters
            const urlParams = new URLSearchParams();
            Object.keys(queryParams).forEach(key => {
                // Only add non-null and non-undefined values
                if (queryParams[key] !== undefined && queryParams[key] !== null) {
                    urlParams.append(key, String(queryParams[key]));
                }
            });
            // Convert URLSearchParams to query string
            const queryString = urlParams.toString();
            if (queryString) {
                // Append query string to URL, using & if URL already has ? else use ?
                finalUrl = `${finalUrl}${finalUrl.includes('?') ? '&' : '?'}${queryString}`;
            }
        }

        // Prepare request options for Playwright's API context
        let options: any = {
            "headers": headers || {},
            "timeout": timeout
        };
        
        // Create a new API request context using Playwright's request API
        apiRequest = await request.newContext();
        
        // Execute the DELETE request using Playwright's request context
        const apiResponse: any = await apiRequest.delete(finalUrl, options);
        
        // Extract status code from the response
        const status = apiResponse.status();
        
        // Parse the response body (handles JSON and text responses)
        const responseBody = await parseResponseBody(apiResponse, 'DELETE', finalUrl);
        
        // Clean up the request context to free resources
        await apiRequest.dispose();
        
        // Check if the response indicates an error (status code outside 2xx range)
        if (!apiResponse.ok()) {
            return {
                status,
                body: createHttpStatusError('DELETE', status, finalUrl, responseBody)
            };
        }
        
        // Return successful response with status and parsed body
        return { status, body: responseBody };
        
    } catch (error) {
        // Clean up request context if it was created before the error occurred
        if (apiRequest) {
            try {
                await apiRequest.dispose();
            } catch (disposeError) {
                // Silently ignore errors during cleanup
            }
        }
        
        // Return a structured error response with detailed error information
        return {
            status: 0,
            body: createDetailedError(error, 'DELETE', url, timeout)
        };
    }
}
