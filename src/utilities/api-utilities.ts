import { request } from "@playwright/test";


export async function sendPostRequest(url: string, headers: any, body: any) {
    try {
        let options: any = {
            "headers": headers,
            "data": body
        };
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
            status: 0,
            body: `Error occurred while sending POST request: ${error instanceof Error ? error.message : String(error)}`
        };
    }
}
