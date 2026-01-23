import { request } from "@playwright/test";

/**
 * @description Validates that the provided URL is well-formed and uses http/https protocol
 * @param {string} url - The URL to validate
 * @throws {Error} When URL is invalid or uses unsupported protocol
 * @author Veeranki Naveen Goud
 */
function validateUrl(url: string): void {
    if (!url || typeof url !== 'string' || url.trim() === '') {
        throw new Error('URL is required and must be a non-empty string. Please provide a valid URL.');
    }
    
    try {
        const urlObj = new URL(url);
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
            throw new Error(`Unsupported protocol '${urlObj.protocol}'. Only HTTP and HTTPS protocols are supported. Please use a URL starting with 'http://' or 'https://'.`);
        }
    } catch (error) {
        if (error instanceof TypeError) {
            throw new Error(`Invalid URL format: '${url}'. Please provide a valid URL starting with 'http://' or 'https://'. Example: 'https://api.example.com/endpoint'`);
        }
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
    if (!pathParams) return url;
    
    let finalUrl = url;
    Object.keys(pathParams).forEach(key => {
        const value = pathParams[key];
        if (value !== undefined && value !== null) {
            // Replace both {key} and :key formats
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
        const contentType = apiResponse.headers()['content-type'] || '';
        
        // Try to parse as JSON if content-type indicates JSON
        if (contentType.includes('application/json')) {
            try {
                return await apiResponse.json();
            } catch (jsonError) {
                // If JSON parsing fails, try text
                const text = await apiResponse.text();
                return text || `Response received but could not be parsed as JSON. Content-Type: ${contentType}`;
            }
        }
        
        // For non-JSON content, get text
        const text = await apiResponse.text();
        return text || 'Empty response body';
    } catch (error) {
        return `Failed to parse response body for ${method} request to ${url}. Error: ${error instanceof Error ? error.message : String(error)}`;
    }
}

/**

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
    let apiRequest: any = null;
    
    try {
        // Validate URL before making request
        validateUrl(url);
        
        // Validate timeout
        if (timeout <= 0) {
            throw new Error(`Invalid timeout value: ${timeout}ms. Timeout must be greater than 0. Recommended value: 30000ms (30 seconds).`);
        }
        
        let options: any = {
            "headers": headers || {},
            "data": body,
            "timeout": timeout
        };
        
        apiRequest = await request.newContext();
        const apiResponse: any = await apiRequest.post(url, options);
        
        const status = apiResponse.status();
        const responseBody = await parseResponseBody(apiResponse, 'POST', url);
        
        await apiRequest.dispose();
        
        if (!apiResponse.ok()) {
            return {
                status,
                body: {
                    error: true,
                    message: `POST request failed with HTTP status ${status}`,
                    details: `The server responded with status ${status} which indicates an error. Common causes:\n` +
                             `- Status 400-499: Client errors (bad request, unauthorized, not found, etc.)\n` +
                             `- Status 500-599: Server errors (internal server error, service unavailable, etc.)\n` +
                             `URL: ${url}\n` +
                             `Response: ${JSON.stringify(responseBody, null, 2)}`,
                    url,
                    statusCode: status,
                    response: responseBody
                }
            };
        }
        
        return { status, body: responseBody };
        
    } catch (error) {
        // Clean up request context if it was created
        if (apiRequest) {
            try {
                await apiRequest.dispose();
            } catch (disposeError) {
                // Ignore dispose errors
            }
        }
        
        // Provide detailed error information based on error type
        let errorMessage = 'An unexpected error occurred while sending POST request.';
        let errorDetails = '';
        
        if (error instanceof Error) {
            if (error.message.includes('timeout') || error.message.includes('Timeout')) {
                errorMessage = 'Request timeout';
                errorDetails = `The POST request to ${url} timed out after ${timeout}ms. ` +
                              `This usually means:\n` +
                              `- The server is taking too long to respond\n` +
                              `- The server may be down or unreachable\n` +
                              `- Network connectivity issues\n` +
                              `\nSuggestions:\n` +
                              `- Increase the timeout value if the endpoint is known to be slow\n` +
                              `- Check if the server is running and accessible\n` +
                              `- Verify your network connection`;
            } else if (error.message.includes('ECONNREFUSED')) {
                errorMessage = 'Connection refused';
                errorDetails = `Could not connect to ${url}. The connection was refused. ` +
                              `This usually means:\n` +
                              `- The server is not running at the specified URL\n` +
                              `- The port is incorrect\n` +
                              `- A firewall is blocking the connection\n` +
                              `\nPlease verify the URL and ensure the server is running.`;
            } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
                errorMessage = 'Host not found';
                errorDetails = `Could not resolve hostname in URL: ${url}. ` +
                              `This usually means:\n` +
                              `- The domain name is misspelled\n` +
                              `- The domain does not exist\n` +
                              `- DNS resolution issues\n` +
                              `\nPlease check the URL and try again.`;
            } else if (error.message.includes('Invalid URL') || error.message.includes('URL is required')) {
                errorMessage = error.message;
                errorDetails = '';
            } else {
                errorMessage = error.message;
                errorDetails = `URL: ${url}\nTimeout: ${timeout}ms`;
            }
        }
        
        return {
            status: 0,
            body: {
                error: true,
                message: errorMessage,
                details: errorDetails,
                url,
                originalError: error instanceof Error ? error.message : String(error)
            }
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
    let apiRequest: any = null;
    
    try {
        // Validate URL before making request
        validateUrl(url);
        
        // Validate timeout
        if (timeout <= 0) {
            throw new Error(`Invalid timeout value: ${timeout}ms. Timeout must be greater than 0. Recommended value: 30000ms (30 seconds).`);
        }
        
        let finalUrl = buildUrlWithPathParams(url, pathParams);
        
        if (queryParams) {
            const urlParams = new URLSearchParams();
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key] !== undefined && queryParams[key] !== null) {
                    urlParams.append(key, String(queryParams[key]));
                }
            });
            const queryString = urlParams.toString();
            if (queryString) {
                finalUrl = `${finalUrl}${finalUrl.includes('?') ? '&' : '?'}${queryString}`;
            }
        }

        let options: any = {
            "headers": headers || {},
            "timeout": timeout
        };
        
        apiRequest = await request.newContext();
        const apiResponse: any = await apiRequest.get(finalUrl, options);
        
        const status = apiResponse.status();
        const responseBody = await parseResponseBody(apiResponse, 'GET', finalUrl);
        
        await apiRequest.dispose();
        
        if (!apiResponse.ok()) {
            return {
                status,
                body: {
                    error: true,
                    message: `GET request failed with HTTP status ${status}`,
                    details: `The server responded with status ${status} which indicates an error. Common causes:\n` +
                             `- Status 400-499: Client errors (bad request, unauthorized, not found, etc.)\n` +
                             `- Status 500-599: Server errors (internal server error, service unavailable, etc.)\n` +
                             `URL: ${finalUrl}\n` +
                             `Response: ${JSON.stringify(responseBody, null, 2)}`,
                    url: finalUrl,
                    statusCode: status,
                    response: responseBody
                }
            };
        }
        
        return { status, body: responseBody };
        
    } catch (error) {
        // Clean up request context if it was created
        if (apiRequest) {
            try {
                await apiRequest.dispose();
            } catch (disposeError) {
                // Ignore dispose errors
            }
        }
        
        // Provide detailed error information based on error type
        let errorMessage = 'An unexpected error occurred while sending GET request.';
        let errorDetails = '';
        
        if (error instanceof Error) {
            if (error.message.includes('timeout') || error.message.includes('Timeout')) {
                errorMessage = 'Request timeout';
                errorDetails = `The GET request to ${url} timed out after ${timeout}ms. ` +
                              `This usually means:\n` +
                              `- The server is taking too long to respond\n` +
                              `- The server may be down or unreachable\n` +
                              `- Network connectivity issues\n` +
                              `\nSuggestions:\n` +
                              `- Increase the timeout value if the endpoint is known to be slow\n` +
                              `- Check if the server is running and accessible\n` +
                              `- Verify your network connection`;
            } else if (error.message.includes('ECONNREFUSED')) {
                errorMessage = 'Connection refused';
                errorDetails = `Could not connect to ${url}. The connection was refused. ` +
                              `This usually means:\n` +
                              `- The server is not running at the specified URL\n` +
                              `- The port is incorrect\n` +
                              `- A firewall is blocking the connection\n` +
                              `\nPlease verify the URL and ensure the server is running.`;
            } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
                errorMessage = 'Host not found';
                errorDetails = `Could not resolve hostname in URL: ${url}. ` +
                              `This usually means:\n` +
                              `- The domain name is misspelled\n` +
                              `- The domain does not exist\n` +
                              `- DNS resolution issues\n` +
                              `\nPlease check the URL and try again.`;
            } else if (error.message.includes('Invalid URL') || error.message.includes('URL is required')) {
                errorMessage = error.message;
                errorDetails = '';
            } else {
                errorMessage = error.message;
                errorDetails = `URL: ${url}\nTimeout: ${timeout}ms`;
            }
        }
        
        return {
            status: 0,
            body: {
                error: true,
                message: errorMessage,
                details: errorDetails,
                url,
                originalError: error instanceof Error ? error.message : String(error)
            }
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
    let apiRequest: any = null;
    
    try {
        // Validate URL before making request
        validateUrl(url);
        
        // Validate timeout
        if (timeout <= 0) {
            throw new Error(`Invalid timeout value: ${timeout}ms. Timeout must be greater than 0. Recommended value: 30000ms (30 seconds).`);
        }
        
        let finalUrl = buildUrlWithPathParams(url, pathParams);
        
        if (queryParams) {
            const urlParams = new URLSearchParams();
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key] !== undefined && queryParams[key] !== null) {
                    urlParams.append(key, String(queryParams[key]));
                }
            });
            const queryString = urlParams.toString();
            if (queryString) {
                finalUrl = `${finalUrl}${finalUrl.includes('?') ? '&' : '?'}${queryString}`;
            }
        }

        let options: any = {
            "headers": headers || {},
            "data": body,
            "timeout": timeout
        };
        
        apiRequest = await request.newContext();
        const apiResponse: any = await apiRequest.put(finalUrl, options);
        
        const status = apiResponse.status();
        const responseBody = await parseResponseBody(apiResponse, 'PUT', finalUrl);
        
        await apiRequest.dispose();
        
        if (!apiResponse.ok()) {
            return {
                status,
                body: {
                    error: true,
                    message: `PUT request failed with HTTP status ${status}`,
                    details: `The server responded with status ${status} which indicates an error. Common causes:\n` +
                             `- Status 400-499: Client errors (bad request, unauthorized, not found, etc.)\n` +
                             `- Status 500-599: Server errors (internal server error, service unavailable, etc.)\n` +
                             `URL: ${finalUrl}\n` +
                             `Response: ${JSON.stringify(responseBody, null, 2)}`,
                    url: finalUrl,
                    statusCode: status,
                    response: responseBody
                }
            };
        }
        
        return { status, body: responseBody };
        
    } catch (error) {
        // Clean up request context if it was created
        if (apiRequest) {
            try {
                await apiRequest.dispose();
            } catch (disposeError) {
                // Ignore dispose errors
            }
        }
        
        // Provide detailed error information based on error type
        let errorMessage = 'An unexpected error occurred while sending PUT request.';
        let errorDetails = '';
        
        if (error instanceof Error) {
            if (error.message.includes('timeout') || error.message.includes('Timeout')) {
                errorMessage = 'Request timeout';
                errorDetails = `The PUT request to ${url} timed out after ${timeout}ms. ` +
                              `This usually means:\n` +
                              `- The server is taking too long to respond\n` +
                              `- The server may be down or unreachable\n` +
                              `- Network connectivity issues\n` +
                              `\nSuggestions:\n` +
                              `- Increase the timeout value if the endpoint is known to be slow\n` +
                              `- Check if the server is running and accessible\n` +
                              `- Verify your network connection`;
            } else if (error.message.includes('ECONNREFUSED')) {
                errorMessage = 'Connection refused';
                errorDetails = `Could not connect to ${url}. The connection was refused. ` +
                              `This usually means:\n` +
                              `- The server is not running at the specified URL\n` +
                              `- The port is incorrect\n` +
                              `- A firewall is blocking the connection\n` +
                              `\nPlease verify the URL and ensure the server is running.`;
            } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
                errorMessage = 'Host not found';
                errorDetails = `Could not resolve hostname in URL: ${url}. ` +
                              `This usually means:\n` +
                              `- The domain name is misspelled\n` +
                              `- The domain does not exist\n` +
                              `- DNS resolution issues\n` +
                              `\nPlease check the URL and try again.`;
            } else if (error.message.includes('Invalid URL') || error.message.includes('URL is required')) {
                errorMessage = error.message;
                errorDetails = '';
            } else {
                errorMessage = error.message;
                errorDetails = `URL: ${url}\nTimeout: ${timeout}ms`;
            }
        }
        
        return {
            status: 0,
            body: {
                error: true,
                message: errorMessage,
                details: errorDetails,
                url,
                originalError: error instanceof Error ? error.message : String(error)
            }
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
    let apiRequest: any = null;
    
    try {
        // Validate URL before making request
        validateUrl(url);
        
        // Validate timeout
        if (timeout <= 0) {
            throw new Error(`Invalid timeout value: ${timeout}ms. Timeout must be greater than 0. Recommended value: 30000ms (30 seconds).`);
        }
        
        let finalUrl = buildUrlWithPathParams(url, pathParams);
        
        if (queryParams) {
            const urlParams = new URLSearchParams();
            Object.keys(queryParams).forEach(key => {
                if (queryParams[key] !== undefined && queryParams[key] !== null) {
                    urlParams.append(key, String(queryParams[key]));
                }
            });
            const queryString = urlParams.toString();
            if (queryString) {
                finalUrl = `${finalUrl}${finalUrl.includes('?') ? '&' : '?'}${queryString}`;
            }
        }

        let options: any = {
            "headers": headers || {},
            "timeout": timeout
        };
        
        apiRequest = await request.newContext();
        const apiResponse: any = await apiRequest.delete(finalUrl, options);
        
        const status = apiResponse.status();
        const responseBody = await parseResponseBody(apiResponse, 'DELETE', finalUrl);
        
        await apiRequest.dispose();
        
        if (!apiResponse.ok()) {
            return {
                status,
                body: {
                    error: true,
                    message: `DELETE request failed with HTTP status ${status}`,
                    details: `The server responded with status ${status} which indicates an error. Common causes:\n` +
                             `- Status 400-499: Client errors (bad request, unauthorized, not found, etc.)\n` +
                             `- Status 500-599: Server errors (internal server error, service unavailable, etc.)\n` +
                             `URL: ${finalUrl}\n` +
                             `Response: ${JSON.stringify(responseBody, null, 2)}`,
                    url: finalUrl,
                    statusCode: status,
                    response: responseBody
                }
            };
        }
        
        return { status, body: responseBody };
        
    } catch (error) {
        // Clean up request context if it was created
        if (apiRequest) {
            try {
                await apiRequest.dispose();
            } catch (disposeError) {
                // Ignore dispose errors
            }
        }
        
        // Provide detailed error information based on error type
        let errorMessage = 'An unexpected error occurred while sending DELETE request.';
        let errorDetails = '';
        
        if (error instanceof Error) {
            if (error.message.includes('timeout') || error.message.includes('Timeout')) {
                errorMessage = 'Request timeout';
                errorDetails = `The DELETE request to ${url} timed out after ${timeout}ms. ` +
                              `This usually means:\n` +
                              `- The server is taking too long to respond\n` +
                              `- The server may be down or unreachable\n` +
                              `- Network connectivity issues\n` +
                              `\nSuggestions:\n` +
                              `- Increase the timeout value if the endpoint is known to be slow\n` +
                              `- Check if the server is running and accessible\n` +
                              `- Verify your network connection`;
            } else if (error.message.includes('ECONNREFUSED')) {
                errorMessage = 'Connection refused';
                errorDetails = `Could not connect to ${url}. The connection was refused. ` +
                              `This usually means:\n` +
                              `- The server is not running at the specified URL\n` +
                              `- The port is incorrect\n` +
                              `- A firewall is blocking the connection\n` +
                              `\nPlease verify the URL and ensure the server is running.`;
            } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
                errorMessage = 'Host not found';
                errorDetails = `Could not resolve hostname in URL: ${url}. ` +
                              `This usually means:\n` +
                              `- The domain name is misspelled\n` +
                              `- The domain does not exist\n` +
                              `- DNS resolution issues\n` +
                              `\nPlease check the URL and try again.`;
            } else if (error.message.includes('Invalid URL') || error.message.includes('URL is required')) {
                errorMessage = error.message;
                errorDetails = '';
            } else {
                errorMessage = error.message;
                errorDetails = `URL: ${url}\nTimeout: ${timeout}ms`;
            }
        }
        
        return {
            status: 0,
            body: {
                error: true,
                message: errorMessage,
                details: errorDetails,
                url,
                originalError: error instanceof Error ? error.message : String(error)
            }
        };
    }
}
