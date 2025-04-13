# Git Commit Message Folding

This feature adds folding support to Git commit messages in VS Code, allowing users to fold different sections when writing a commit message in `.git/COMMIT_EDITMSG`.

## Folding Functionality

The folding provider recognizes several structural elements in commit messages:

1. **Paragraphs**: Text separated by empty lines can be folded
2. **Headers**: Markdown-style headers (lines starting with #, ##, etc.) create folding regions
3. **Comments**: Git comment blocks (lines starting with #) can be folded

## Testing the Feature

To test this feature:

1. Open a repository in VS Code
2. Start a Git commit (e.g., `git commit` or using the Source Control panel)
3. Write a commit message with multiple paragraphs, headers, or sections
4. The folding icons should appear in the gutter, allowing you to collapse sections

### Example Commit Message Structure

```
Fix bug in authentication module

This commit fixes several issues in the authentication module:

## Issue 1
- The token validation was failing for special characters
- Added proper escaping to handle all Unicode characters

## Issue 2
- Session timeout handling was incorrect
- Fixed timing logic to properly respect the configured timeout

# Please enter the commit message for your changes. Lines starting
# with '#' will be ignored, and an empty message aborts the commit.
# On branch main
# Changes to be committed:
#   modified:   auth.js
#   modified:   session.js
```

In this example, you should be able to fold:
- The entire message
- Each section starting with a header (## Issue 1, ## Issue 2)
- The comment block at the bottom

## Implementation Notes

The folding provider is implemented in `commitMessageFolding.ts` and registered in the main extension activation function. It specifically targets documents with the `git-commit` language ID.
