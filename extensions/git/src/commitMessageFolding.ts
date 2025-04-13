/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';

/**
 * Provides folding ranges for git commit messages.
 * This allows users to fold different sections of their commit messages,
 * making it easier to organize and read longer messages.
 */
export class GitCommitMessageFoldingProvider implements vscode.FoldingRangeProvider {

	/**
	 * Provides folding ranges for a given document.
	 * This implementation follows these folding rules:
	 * 1. Consecutive empty lines create fold boundaries
	 * 2. Markdown-style headers (lines starting with #) create fold boundaries
	 * 3. Comment sections (lines starting with #) are foldable
	 */
	public provideFoldingRanges(
		document: vscode.TextDocument,
		_context: vscode.FoldingContext,
		_token: vscode.CancellationToken
	): vscode.FoldingRange[] {
		// Don't process if it's not a git commit message
		if (document.languageId !== 'git-commit') {
			return [];
		}

		const ranges: vscode.FoldingRange[] = [];
		const lineCount = document.lineCount;

		let startLine = 0;
		let inCommentSection = false;
		let commentSectionStart = -1;

		for (let line = 0; line < lineCount; line++) {
			const lineText = document.lineAt(line).text;

			// Handle comment sections (lines starting with #)
			if (lineText.startsWith('#')) {
				if (!inCommentSection) {
					inCommentSection = true;
					commentSectionStart = line;
				}
				// Continue to next line
				continue;
			} else if (inCommentSection) {
				// End of comment section
				if (line > commentSectionStart + 1) { // Only create a range if it spans multiple lines
					ranges.push(new vscode.FoldingRange(
						commentSectionStart,
						line - 1,
						vscode.FoldingRangeKind.Comment
					));
				}
				inCommentSection = false;
			}

			// Handle markdown-style headers (## Header)
			if (lineText.match(/^#+\s+/)) {
				if (line > startLine) {
					// End previous section
					ranges.push(new vscode.FoldingRange(
						startLine,
						line - 1,
						vscode.FoldingRangeKind.Region
					));
				}
				startLine = line;
				continue;
			}

			// Handle paragraph breaks (empty lines)
			if (lineText.trim() === '') {
				if (line > startLine + 1) { // Only create a range if it spans multiple lines
					ranges.push(new vscode.FoldingRange(
						startLine,
						line - 1,
						vscode.FoldingRangeKind.Region
					));
				}
				startLine = line + 1; // Start new section after the empty line
			}
		}

		// Add the last section if needed
		if (inCommentSection && commentSectionStart < lineCount - 1) {
			ranges.push(new vscode.FoldingRange(
				commentSectionStart,
				lineCount - 1,
				vscode.FoldingRangeKind.Comment
			));
		} else if (startLine < lineCount - 1) {
			ranges.push(new vscode.FoldingRange(
				startLine,
				lineCount - 1,
				vscode.FoldingRangeKind.Region
			));
		}

		return ranges;
	}
}

/**
 * Registers the Git commit message folding provider.
 */
export function registerCommitMessageFolding(context: vscode.ExtensionContext): void {
	const provider = new GitCommitMessageFoldingProvider();

	// Register for git-commit language
	const disposable = vscode.languages.registerFoldingRangeProvider(
		{ language: 'git-commit' },
		provider
	);

	context.subscriptions.push(disposable);
}
