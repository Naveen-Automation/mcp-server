import { request } from "@playwright/test";


export async function sendPostRequest(url: string, options: any) {
    try {
        const apiRequest: any = await request.newContext();
        const apiResponse: any = await apiRequest.post(url, options);
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
            content: [{ type: "text", text: `Error occurred while sending POST request: ${error instanceof Error ? error.message : String(error)}` }]
        };
    }
}
