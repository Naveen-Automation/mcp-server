import { request } from "@playwright/test";

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
 * @description Sends an HTTP POST request to the specified URL with headers, body data, and optional path parameters.
 * Handles JSON and text response parsing automatically and manages request context lifecycle.
 * @param {string} url - The target URL for the POST request (can contain path parameter placeholders)
 * @param {any} headers - HTTP headers to include in the request
 * @param {any} body - Request body data to be sent with the POST request
 * @param {any} pathParams - Optional object containing path parameter values for URL template replacement
 * @return {Promise<{status: number, body: any}>} Promise resolving to an object containing HTTP status code and response body
 * @author Veeranki Naveen Goud
 */

export async function sendPostRequest(url: string, headers: any, body: any, pathParams?: any) {
    try {
        const finalUrl = buildUrlWithPathParams(url, pathParams);
        let options: any = {
            "headers": headers,
            "data": body
        };
        const apiRequest: any = await request.newContext();
        const apiResponse: any = await apiRequest.post(finalUrl, options);
        if (!apiResponse.ok()) {
            throw new Error(`Request failed with status ${apiResponse.status()}`);
        }
        else {
            let body: any = null;
            if (apiResponse) {
                body = await apiResponse.json();
            } else {
                body = await apiResponse.text();
            }
            await apiRequest.dispose();
            return { status: apiResponse.status(), body };
        }
    } catch (error) {
        return {
            status: 0,
            body: `Error occurred while sending POST request: ${error instanceof Error ? error.message : String(error)}`
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
 * @return {Promise<{status: number, body: any}>} Promise resolving to an object containing HTTP status code and response body
 * @author Veeranki Naveen Goud
 */
export async function sendGetRequest(url: string, headers: any, pathParams?: any, queryParams?: any) {
    try {
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
            "headers": headers
        };
        const apiRequest: any = await request.newContext();
        const apiResponse: any = await apiRequest.get(finalUrl, options);
        if (!apiResponse.ok()) {
            throw new Error(`Request failed with status ${apiResponse.status()}`);
        }
        else {
            let body: any = null;
            if (apiResponse) {
                body = await apiResponse.json();
            } else {
                body = await apiResponse.text();
            }
            await apiRequest.dispose();
            return { status: apiResponse.status(), body };
        }
    } catch (error) {
        return {
            status: 0,
            body: `Error occurred while sending GET request: ${error instanceof Error ? error.message : String(error)}`
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
 * @return {Promise<{status: number, body: any}>} Promise resolving to an object containing HTTP status code and response body
 * @author Veeranki Naveen Goud
 */
export async function sendPutRequest(url: string, headers: any, body: any, pathParams?: any, queryParams?: any) {
    try {
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
            "headers": headers,
            "data": body
        };
        const apiRequest: any = await request.newContext();
        const apiResponse: any = await apiRequest.put(finalUrl, options);
        if (!apiResponse.ok()) {
            throw new Error(`Request failed with status ${apiResponse.status()}`);
        }
        else {
            let body: any = null;
            if (apiResponse) {
                body = await apiResponse.json();
            } else {
                body = await apiResponse.text();
            }
            await apiRequest.dispose();
            return { status: apiResponse.status(), body };
        }
    } catch (error) {
        return {
            status: 0,
            body: `Error occurred while sending PUT request: ${error instanceof Error ? error.message : String(error)}`
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
 * @return {Promise<{status: number, body: any}>} Promise resolving to an object containing HTTP status code and response body
 * @author Veeranki Naveen Goud
 */
export async function sendDeleteRequest(url: string, headers: any, pathParams?: any, queryParams?: any) {
    try {
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
            "headers": headers
        };
        const apiRequest: any = await request.newContext();
        const apiResponse: any = await apiRequest.delete(finalUrl, options);
        if (!apiResponse.ok()) {
            throw new Error(`Request failed with status ${apiResponse.status()}`);
        }
        else {
            let body: any = null;
            if (apiResponse) {
                body = await apiResponse.json();
            } else {
                body = await apiResponse.text();
            }
            await apiRequest.dispose();
            return { status: apiResponse.status(), body };
        }
    } catch (error) {
        return {
            status: 0,
            body: `Error occurred while sending DELETE request: ${error instanceof Error ? error.message : String(error)}`
        };
    }
}
