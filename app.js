/**
 * Static Website Optimizer Agent - Main Application Logic
 */

// DOM Elements
const urlInput = document.getElementById('urlInput');
const fetchBtn = document.getElementById('fetchBtn');
const htmlInput = document.getElementById('htmlInput');
const runBtn = document.getElementById('runBtn');
const fetchError = document.getElementById('fetchError');

const resultsPlaceholder = document.getElementById('resultsPlaceholder');
const processingView = document.getElementById('processingView');
const resultsView = document.getElementById('resultsView');
const timeline = document.getElementById('timeline');
const issuesContainer = document.getElementById('issuesContainer');

// State
let isProcessing = false;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    fetchBtn.addEventListener('click', handleFetchUrl);
    runBtn.addEventListener('click', runAudit);
});

async function handleFetchUrl() {
    const url = urlInput.value.trim();
    if (!url) return;

    fetchBtn.disabled = true;
    fetchBtn.textContent = 'Fetching...';
    fetchError.classList.add('hidden');
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const text = await response.text();
        htmlInput.value = text;
    } catch (error) {
        console.error('Fetch error:', error);
        fetchError.textContent = "Could not fetch URL (likely CORS). Please paste HTML manually.";
        fetchError.classList.remove('hidden');
    } finally {
        fetchBtn.disabled = false;
        fetchBtn.textContent = 'Fetch HTML';
    }
}

async function runAudit() {
    const html = htmlInput.value.trim();
    if (!html) {
        alert("Please provide some HTML to analyze.");
        return;
    }

    startProcessing();

    // 1. Parse HTML
    await updateTimeline('Parsing HTML Structure...', 0);
    await new Promise(r => setTimeout(r, 400));
    
    let doc;
    try {
        doc = analyzer.parseHtml(html);
        await updateTimeline('Parsing HTML Structure...', 1); // Mark done
    } catch (e) {
        console.error(e);
        alert("Failed to parse HTML.");
        resetView();
        return;
    }

    // 2. SEO Checks
    await updateTimeline('Running SEO Analysis...', 0);
    await new Promise(r => setTimeout(r, 600));
    const seoIssues = analyzer.checkSEO(doc);
    await updateTimeline('Running SEO Analysis...', 1);

    // 3. Accessibility Checks
    await updateTimeline('Checking Accessibility...', 0);
    await new Promise(r => setTimeout(r, 600));
    const a11yIssues = analyzer.checkAccessibility(doc);
    await updateTimeline('Checking Accessibility...', 1);

    // 4. Structure Checks
    await updateTimeline('Reviewing HTML Structure...', 0);
    await new Promise(r => setTimeout(r, 500));
    const structureIssues = analyzer.checkStructure(doc);
    await updateTimeline('Reviewing HTML Structure...', 1);

    // 5. Performance Checks
    await updateTimeline('Scanning for Performance...', 0);
    await new Promise(r => setTimeout(r, 500));
    const perfIssues = analyzer.checkPerformance(doc);
    await updateTimeline('Scanning for Performance...', 1);

    // 6. Compile Results
    await updateTimeline('Compiling Report...', 0);
    await new Promise(r => setTimeout(r, 400));
    
    const allIssues = [
        ...seoIssues, 
        ...a11yIssues, 
        ...structureIssues, 
        ...perfIssues
    ];
    
    renderResults(allIssues);
}

function startProcessing() {
    isProcessing = true;
    resultsPlaceholder.classList.add('hidden');
    resultsView.classList.add('hidden');
    processingView.classList.remove('hidden');
    timeline.innerHTML = ''; // Clear previous timeline
    runBtn.disabled = true;
    runBtn.classList.add('opacity-75', 'cursor-not-allowed');
}

/**
 * Updates the timeline UI.
 * status: 0 = pending/active, 1 = completed
 */
async function updateTimeline(text, status) {
    // Check if this step already exists
    let existingItem = Array.from(timeline.children).find(child => child.dataset.text === text);
    
    if (!existingItem) {
        // Create new item
        const item = document.createElement('div');
        item.className = 'timeline-item active';
        item.dataset.text = text; // for finding it later
        item.innerHTML = `
            <div class="timeline-dot"></div>
            <span class="text-slate-700 font-medium">${text}</span>
        `;
        timeline.appendChild(item);
        // Scroll to bottom of timeline
        item.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } else {
        if (status === 1) {
            existingItem.classList.remove('active');
            existingItem.classList.add('completed');
            const span = existingItem.querySelector('span');
            span.classList.add('text-green-700');
            // Optional: add a checkmark
        }
    }
}

function renderResults(issues) {
    processingView.classList.add('hidden');
    resultsView.classList.remove('hidden');
    runBtn.disabled = false;
    runBtn.classList.remove('opacity-75', 'cursor-not-allowed');
    isProcessing = false;

    issuesContainer.innerHTML = '';

    if (issues.length === 0) {
        issuesContainer.innerHTML = `
            <div class="text-center p-10 bg-green-50 rounded-xl border border-green-100">
                <span class="text-4xl">🎉</span>
                <h3 class="text-xl font-bold text-green-800 mt-2">Amazing Job!</h3>
                <p class="text-green-700 mt-1">No significant issues found. Your code looks great.</p>
            </div>
        `;
        return;
    }

    // Group by Category
    const categories = ['SEO', 'Accessibility', 'Structure', 'Performance'];
    
    categories.forEach(cat => {
        const catIssues = issues.filter(i => i.category === cat);
        if (catIssues.length > 0) {
            const section = document.createElement('div');
            section.innerHTML = `<h3 class="text-lg font-bold text-slate-800 mb-3 border-b border-slate-200 pb-2">${cat} <span class="text-xs font-normal text-slate-500 ml-2">(${catIssues.length})</span></h3>`;
            
            catIssues.forEach(issue => {
                const card = document.createElement('div');
                card.className = `issue-card bg-white p-4 rounded-lg border border-slate-200 shadow-sm mb-3 border-l-4 ${getSeverityColor(issue.severity)}`;
                card.innerHTML = `
                    <div class="flex justify-between items-start mb-1">
                        <h4 class="font-semibold text-slate-800">${issue.title}</h4>
                        <span class="text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wider ${getSeverityBadge(issue.severity)}">${issue.severity}</span>
                    </div>
                    <p class="text-sm text-slate-600 mb-2">${issue.description}</p>
                    <div class="text-sm bg-slate-50 p-2 rounded text-slate-700 border border-slate-100">
                        <span class="font-semibold text-indigo-600">💡 Fix:</span> ${issue.suggestion}
                    </div>
                `;
                section.appendChild(card);
            });
            issuesContainer.appendChild(section);
        }
    });
}

function getSeverityColor(severity) {
    switch(severity) {
        case 'error': return 'border-l-red-500';
        case 'warning': return 'border-l-amber-500';
        default: return 'border-l-blue-500';
    }
}

function getSeverityBadge(severity) {
    switch(severity) {
        case 'error': return 'bg-red-100 text-red-700';
        case 'warning': return 'bg-amber-100 text-amber-800';
        default: return 'bg-blue-100 text-blue-700';
    }
}

function resetView() {
    processingView.classList.add('hidden');
    resultsView.classList.add('hidden');
    resultsPlaceholder.classList.remove('hidden');
    runBtn.disabled = false;
    runBtn.classList.remove('opacity-75', 'cursor-not-allowed');
}
