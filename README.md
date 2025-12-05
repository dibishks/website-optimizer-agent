# Static Website Optimizer Agent

A browser-based "agent" that helps developers audit and optimize static websites. It analyzes HTML structure, SEO basics, accessibility, and performance indicators directly in your browser.

![Agent Preview](https://via.placeholder.com/800x400?text=Agent+Preview+Image)

## Features

-   **Zero Backend**: Runs 100% in the browser using the DOMParser API.
-   **Agentic UX**: Visual timeline shows the analysis steps in real-time.
-   **Comprehensive Checks**:
    -   **SEO**: Title, Meta Descriptions, Viewport settings.
    -   **Accessibility**: Alt tags, generic link text, semantic landmarks.
    -   **Structure**: Heading hierarchy, inline styles usage.
    -   **Performance**: Image counts, large inline scripts, render-blocking resources.
-   **CORS Handling**: Attempts to fetch URLs, but gracefully falls back to direct HTML input if blocked.

## Why use this tool?

-   **Instant Feedback**: No need to wait for CI/CD pipelines or deployments to check your code.
-   **Privacy Focused**: All analysis happens locally in your browser. Your code is never sent to a server.
-   **Zero Setup**: Unlike other linters or tools that require Node.js, npm, or complex config files, this runs instantly.
-   **Educational**: Learn best practices for SEO and Accessibility as you code, with clear explanations for every issue.

## Usage

### Running Locally

1.  Clone this repository or download the files.
2.  Open `index.html` in your web browser.
3.  That's it! No `npm install` or build steps required.

### Deploying to GitHub Pages

1.  Upload the files (`index.html`, `style.css`, `app.js`, `analyzer.js`) to a GitHub repository.
2.  Go to **Settings > Pages**.
3.  Select the `main` branch as the source.
4.  Your agent will be live at `https://<username>.github.io/<repo-name>/`.

## Technical Details

-   **Stack**: Vanilla HTML5, CSS3 (with Tailwind via CDN), and JavaScript (ES6+).
-   **Architecture**:
    -   `analyzer.js`: Pure function logic for auditing DOM nodes.
    -   `app.js`: UI controller and event management.
    -   `style.css`: Custom animations and specific overrides.

## Limitations

-   **CORS**: Browsers restrict fetching fetching content from other domains via JavaScript. The "Fetch URL" feature will only work on sites that allow cross-origin requests. For most sites, pasting the HTML source is the recommended method.
-   **Static Analysis**: The agent analyzes static HTML string. It does not execute JavaScript on the target page, so it may miss issues in single-page apps (SPAs) that render content dynamically.
