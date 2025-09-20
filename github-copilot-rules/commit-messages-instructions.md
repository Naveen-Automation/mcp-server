# COMMIT MESSAGE INSTRUCTIONS

## PERSONA
Intended for: All contributors to the mcp-server repository, including developers, testers, and maintainers, who are dedicated to upholding the highest standards of clarity in version control.

## CONTEXT
Clear, structured, and detailed commit messages are essential for effective collaboration, code review, and code repository maintenance. Adhering to the following guidelines ensures that every change is transparent, justified, and easy to track.

## COMMIT MESSAGE GUIDELINES

### 1. Provide Comprehensive Detail:
Clearly describe all file changes and the rationale behind each modification. Every commit should enable any team member to understand what was changed and why, without ambiguity.

### 2. Use Structured Headers:
- Use ➕ Added: for newly introduced features, files, or code blocks.
- Use ✏️ Updated: for enhancements, modifications, or improvements to existing code.
- Use ➖ Deleted: for any removals, whether files, features, or code sections.

### 3. Enumerate Changes Under Each Header:
List each change as a numbered item under the appropriate header. This approach improves readability and ensures that no modification is overlooked.

## Example Commit Message Format

➕ **Added:**
1. Implemented user authentication logic in `auth.service.ts` to verify the user.
2. Introduced new API endpoint for user registration in `user.controller.ts` to allow user registration via API calls.

✏️ **Updated:**
1. Refactored error handling in `login.component.ts` for improved user feedback.
2. Enhanced logging in `app.module.ts` to include request IDs.

➖ **Deleted:**
1. Removed deprecated `legacy-auth.ts` module to avoid compatibility issues.