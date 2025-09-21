# Quick Sample Prompt



## Task
- Use the available MCP tools to test a all the endpoints present in the attached swagger file present at root/
Base URL of the API:  https://fakerestapi.azurewebsites.net

## Expected Output Format
- Also generate a html summary report of the outcome exatly same as `consolidated-api-testing-report.html` template file present in `node_modules/@automate-io/api-testing-mcp/dist/tesmplates` folder.
- Name the file as `Request Type-API Name`. For example if the request type is GET and it if the api name is GetBooking then report name should be `GET-getbooking`

## Persona
- Not applicable

## Contraints
- Not applicable

## Dependencies
- Not applicable

## Processing Logic
- Not applicable

## Validation Checklist
- Not applicable

## Quality Standards
- Not applicable


<!-- - Use the available MCP tools to test a all the endpoints present in the attached swagger file

- Summarise the test execution for each endpoint.
    1. If tests fail then explain the root cause of the failure and suggest potential solution to fix the issue.

- If it is a bug in the API then draft a Xray bug summary, description by following industry best bug reporting practices.

- Generate an HTML test report with a clean, readable layout:
    1. Display request details (endpoint, headers, body) on the left side of the screen
    2. Display response details (status code, headers, body) on the right side of the screen
    3. Save the html report as name (http verb type + meaningful name of the api)  in the following directory: root/test-report/ -->