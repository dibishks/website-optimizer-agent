/**
 * Static Website Optimizer Agent - Analyzer Logic
 */

const analyzer = {
    /**
     * Parse HTML string into a Document object
     * @param {string} htmlString 
     * @returns {Document}
     */
    parseHtml: (htmlString) => {
        const parser = new DOMParser();
        return parser.parseFromString(htmlString, 'text/html');
    },

    /**
     * Check for SEO related issues
     * @param {Document} doc 
     * @returns {Array} issues
     */
    checkSEO: (doc) => {
        const issues = [];
        const title = doc.querySelector('title');
        const description = doc.querySelector('meta[name="description"]');
        const viewport = doc.querySelector('meta[name="viewport"]');
        const canonical = doc.querySelector('link[rel="canonical"]');

        // Title Checks
        if (!title) {
            issues.push({
                category: 'SEO',
                severity: 'error',
                title: 'Missing <title> tag',
                description: 'The document does not have a <title> element.',
                suggestion: 'Add a <title> element to the <head> section.'
            });
        } else {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = title.innerHTML;
            const titleText = tempDiv.textContent.trim() || ''; // Use innerHTML then textContent to decode entities if any
            if (titleText.length < 10) {
                issues.push({
                    category: 'SEO',
                    severity: 'warning',
                    title: 'Title too short',
                    description: `Title is only ${titleText.length} characters long.`,
                    suggestion: 'Expand your title to be descriptive (aim for 30-60 characters).'
                });
            } else if (titleText.length > 70) {
                issues.push({
                    category: 'SEO',
                    severity: 'warning',
                    title: 'Title too long',
                    description: `Title is ${titleText.length} characters long.`,
                    suggestion: 'Shorten your title to ensure it displays fully in search results (max ~60-70 chars).'
                });
            }
        }

        // Meta Description
        if (!description) {
            issues.push({
                category: 'SEO',
                severity: 'error',
                title: 'Missing Meta Description',
                description: 'No <meta name="description"> tag found.',
                suggestion: 'Add a meta description to summarize your page for search engines.'
            });
        }

        // Viewport
        if (!viewport) {
            issues.push({
                category: 'SEO',
                severity: 'error',
                title: 'Missing Viewport Meta Tag',
                description: 'No <meta name="viewport"> tag found.',
                suggestion: 'Add <meta name="viewport" content="width=device-width, initial-scale=1.0"> for mobile responsiveness.'
            });
        }

        return issues;
    },

    /**
     * Check for Accessibility issues
     * @param {Document} doc 
     * @returns {Array} issues
     */
    checkAccessibility: (doc) => {
        const issues = [];
        
        // Image Alt Texts
        const images = doc.querySelectorAll('img');
        let missingAltCount = 0;
        images.forEach(img => {
            if (!img.hasAttribute('alt')) missingAltCount++;
        });

        if (missingAltCount > 0) {
            issues.push({
                category: 'Accessibility',
                severity: 'error',
                title: 'Images missing Alt text',
                description: `Found ${missingAltCount} <img> tag(s) without an alt attribute.`,
                suggestion: 'Add descriptive alt attributes to all images for screen readers.'
            });
        }

        // Generic Links
        const links = doc.querySelectorAll('a');
        const genericTerms = ['click here', 'read more', 'more', 'link', 'here'];
        let genericLinkCount = 0;
        links.forEach(link => {
            const text = link.textContent.trim().toLowerCase();
            if (genericTerms.includes(text)) genericLinkCount++;
        });

        if (genericLinkCount > 0) {
            issues.push({
                category: 'Accessibility',
                severity: 'warning',
                title: 'Non-descriptive Link Text',
                description: `Found ${genericLinkCount} link(s) satisfying generic text like "click here".`,
                suggestion: 'Use descriptive text for links that explains their destination (e.g., "Read more about pricing").'
            });
        }

        // Landmarks
        const landmarks = ['main', 'nav', 'header', 'footer', 'aside'];
        const foundLandmarks = landmarks.filter(tag => doc.querySelector(tag));
        if (foundLandmarks.length === 0) {
            issues.push({
                category: 'Accessibility',
                severity: 'info',
                title: 'No Semantic Landmarks Found',
                description: 'Document does not use <main>, <nav>, <header>, or <footer>.',
                suggestion: 'Use semantic HTML5 landmark elements to improve navigation for screen readers.'
            });
        }

        return issues;
    },

    /**
     * Check for HTML Structure issues
     * @param {Document} doc 
     * @returns {Array} issues
     */
    checkStructure: (doc) => {
        const issues = [];

        // H1 Checks
        const h1s = doc.querySelectorAll('h1');
        if (h1s.length === 0) {
            issues.push({
                category: 'Structure',
                severity: 'error',
                title: 'Missing H1 Heading',
                description: 'No <h1> tag found on the page.',
                suggestion: 'Add exactly one <h1> tag to describe the main topic of the page.'
            });
        } else if (h1s.length > 1) {
            issues.push({
                category: 'Structure',
                severity: 'warning',
                title: 'Multiple H1 Headings',
                description: `Found ${h1s.length} <h1> tags.`,
                suggestion: 'Best practice is to have only one <h1> per page representing the main title.'
            });
        }

        // Heading Order
        // A simple linear scan of all headings
        const allHeadings = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        let previousLevel = 0;
        let skippedLevels = false;
        
        for (const heading of allHeadings) {
            const currentLevel = parseInt(heading.tagName.substring(1));
            // e.g., Prev H2, Current H4 (Skipped H3)
            if (currentLevel > previousLevel + 1) {
                skippedLevels = true;
                break; 
            }
            previousLevel = currentLevel;
        }

        if (skippedLevels) {
            issues.push({
                category: 'Structure',
                severity: 'warning',
                title: 'Skipped Heading Levels',
                description: 'Heading levels should not be skipped (e.g., going from H2 to H4).',
                suggestion: 'Ensure your heading hierarchy is sequential (e.g., H2 → H3).'
            });
        }

        // Inline Styles
        const elementsWithStyle = doc.querySelectorAll('[style]');
        if (elementsWithStyle.length > 10) {
            issues.push({
                category: 'Structure',
                severity: 'info',
                title: 'Heavy use of Inline Styles',
                description: `Found ${elementsWithStyle.length} elements with inline 'style' attributes.`,
                suggestion: 'Move styles to valid CSS classes or an external stylesheet for better maintainability.'
            });
        }

        return issues;
    },

    /**
     * Check for Performance issues
     * @param {Document} doc 
     * @returns {Array} issues
     */
    checkPerformance: (doc) => {
        const issues = [];

        // Image Count
        const images = doc.querySelectorAll('img');
        if (images.length > 30) {
            issues.push({
                category: 'Performance',
                severity: 'warning',
                title: 'High Image Count',
                description: `Page contains ${images.length} images.`,
                suggestion: 'Lazy load images and consider if all are necessary for the initial view.'
            });
        }

        // Large Inline Scripts
        const scripts = doc.querySelectorAll('script:not([src])');
        let largeScripts = 0;
        scripts.forEach(script => {
            if (script.textContent.length > 2000) largeScripts++;
        });

        if (largeScripts > 0) {
            issues.push({
                category: 'Performance',
                severity: 'info',
                title: 'Large Inline Scripts',
                description: `Found ${largeScripts} large inline script block(s).`,
                suggestion: 'Move large JavaScript logic to external .js files to take advantage of browser caching.'
            });
        }

        // Blocking Resources in Head (Simulated check)
        const headScripts = doc.head ? doc.head.querySelectorAll('script[src]') : [];
        let blockingScripts = 0;
        headScripts.forEach(script => {
            if (!script.hasAttribute('async') && !script.hasAttribute('defer')) {
                blockingScripts++;
            }
        });

        if (blockingScripts > 0) {
            issues.push({
                category: 'Performance',
                severity: 'warning',
                title: 'Render-blocking Scripts',
                description: `Found ${blockingScripts} script(s) in <head> that are not async or defer.`,
                suggestion: 'Add "defer" or "async" attributes to scripts in the <head> to prevent blocking page render.'
            });
        }

        return issues;
    }
};
