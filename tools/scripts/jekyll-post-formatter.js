const headerTable = document.getElementById('header-table').getElementsByTagName('tbody')[0];
const contentInput = document.getElementById('content-input');
const markdownOutput = document.getElementById('markdown-output');
const copyButton = document.getElementById('copy-button');
const saveHeaderButton = document.getElementById('save-header');
const resetHeaderButton = document.getElementById('reset-header');
const addTextButton = document.getElementById('add-text');
const addDateButton = document.getElementById('add-date');
const addColorButton = document.getElementById('add-color');
const downloadButton = document.getElementById('download-button');
const previewHeader = document.getElementById('preview-header');
const previewContent = document.getElementById('preview-content');
const filenameInput = document.getElementById('filename-input');

const defaultHeaders = [
    { key: 'layout', value: 'post', type: 'text' },
    { key: 'date', value: '', type: 'date' },
    { key: 'title', value: '', type: 'text' },
    { key: 'author', value: '', type: 'text' },
    { key: 'categories', value: '[]', type: 'text' },
    { key: 'tags', value: '[]', type: 'text' },
    { key: 'image', value: '', type: 'text' },
    { key: 'description', value: '', type: 'text' },
    { key: 'video_embed', value: '', type: 'text' },
    { key: 'tags_color', value: '', type: 'color' },
    { key: 'featured', value: 'false', type: 'text' },
    { key: 'topper', value: 'false', type: 'text' },
    { key: 'hidden', value: 'false', type: 'text' },
    { key: 'toc', value: 'false', type: 'text' }
];

function populateHeaderTable(headers) {
    headerTable.innerHTML = '';
    for (const header of headers) {
        if (header.key === 'date' && !header.value) {
            header.value = getCurrentDateTime();
        }
        addHeaderRow(header.key, header.value, header.type || 'text'); // Use saved type or default to 'text'
    }
}

function addHeaderRow(key = '', value = '', type = 'text') {
    const row = headerTable.insertRow();
    const keyCell = row.insertCell();
    const valueCell = row.insertCell();
    const actionsCell = row.insertCell();

    keyCell.innerHTML = `<input type="text" value="${key}" placeholder="Key">`;

    // Create input field based on type
    if (type === 'date') {
        valueCell.innerHTML = `<input type="datetime-local" value="${value}">`;
    } else if (type === 'color') {
        valueCell.innerHTML = `<input type="color" value="${value}">
                               <input type="text" placeholder="Hex Code" value="${value}" style="width: 80px;">`;
        const colorPicker = valueCell.querySelector('input[type="color"]');
        const hexInput = valueCell.querySelector('input[type="text"]');
        colorPicker.addEventListener('input', () => {
            hexInput.value = colorPicker.value;
        });
        hexInput.addEventListener('input', () => {
            if (/^#[0-9A-Fa-f]{6}$/.test(hexInput.value)) {
                colorPicker.value = hexInput.value;
            }
        });
    } else {
        valueCell.innerHTML = `<input type="text" value="${value}" placeholder="Value">`;
    }

    actionsCell.innerHTML = `<button class="delete-row">Delete</button>`;
    actionsCell.querySelector('.delete-row').addEventListener('click', () => {
        headerTable.deleteRow(row.rowIndex - 1);
    });
}

function addDateRow() {
    const row = headerTable.insertRow();
    const keyCell = row.insertCell();
    const valueCell = row.insertCell();
    const actionsCell = row.insertCell();
    keyCell.innerHTML = `<input type="text" value="date" placeholder="Key" readonly>`;
    valueCell.innerHTML = `<input type="datetime-local" value="${getCurrentDateTime()}">`;
    actionsCell.innerHTML = `<button class="delete-row">Delete</button>`;
    actionsCell.querySelector('.delete-row').addEventListener('click', () => {
        headerTable.deleteRow(row.rowIndex - 1);
    });
}

function addColorRow() {
    const row = headerTable.insertRow();
    const keyCell = row.insertCell();
    const valueCell = row.insertCell();
    const actionsCell = row.insertCell();
    keyCell.innerHTML = `<input type="text" value="color" placeholder="Key">`;
    valueCell.innerHTML = `<input type="color" value="#ffffff">
                           <input type="text" placeholder="Hex Code" value="#ffffff" style="width: 80px;">`;
    actionsCell.innerHTML = `<button class="delete-row">Delete</button>`;
    const colorPicker = valueCell.querySelector('input[type="color"]');
    const hexInput = valueCell.querySelector('input[type="text"]');
    colorPicker.addEventListener('input', () => {
        hexInput.value = colorPicker.value;
    });
    hexInput.addEventListener('input', () => {
        if (/^#[0-9A-Fa-f]{6}$/.test(hexInput.value)) {
            colorPicker.value = hexInput.value;
        }
    });
    actionsCell.querySelector('.delete-row').addEventListener('click', () => {
        headerTable.deleteRow(row.rowIndex - 1);
    });
}

function getTableHeaderData() {
    const rows = headerTable.rows;
    const headers = [];
    for (let i = 0; i < rows.length; i++) {
        const keyInput = rows[i].cells[0].querySelector('input');
        const valueInput = rows[i].cells[1].querySelector('input:not([type="color"])');
        if (keyInput && valueInput) {
            if (keyInput.value) {
                headers.push({ key: keyInput.value, value: valueInput.value });
            }
        }
    }
    return headers;
}

function getCurrentDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function convertToMarkdownFormat(html) {
    const turndownService = new TurndownService({
        headingStyle: 'atx',
        codeBlockStyle: 'fenced'
    });
    turndownService.use(turndownPluginGfm.gfm);

    // --- Custom Rules ---
    // Remove surrounding asterisks added by turndown
    turndownService.addRule('removeDoubleAsterisks', {
        filter: function (node, options) {
            return (
                node.nodeName === 'STRONG' || node.nodeName === 'EM'
            );
        },
        replacement: function (content) {
            return content;
        }
    });
    // --- End Custom Rules ---

    const markdown = turndownService.turndown(html);
    return markdown;
}

function updateOutputAndPreview() {
    const descriptionRow = Array.from(headerTable.rows).find(row => row.cells[0].querySelector('input').value === 'description');
    let description = descriptionRow ? descriptionRow.cells[1].querySelector('input:not([type="color"])').value : '';
    if (!description) {
        const plainTextContent = contentInput.value;
        description = plainTextContent.slice(0, 150).trim() + '...';
        if (descriptionRow) {
            descriptionRow.cells[1].querySelector('input').value = description;
        }
    }

    const header = generateHeader();
    const content = contentInput.value;
    const markdownContent = content;

    markdownOutput.value = `${header}\n\n${markdownContent}`;
    updatePreview(markdownContent);
}

function generateHeader() {
    const headers = getTableHeaderData();
    let header = '---\n';
    for (const h of headers) {
        if (h.key === 'date' && h.value) {
            // Convert to ISO 8601 format with timezone offset
            const date = new Date(h.value);
            const timezoneOffset = date.getTimezoneOffset() * 60000; // Get offset in milliseconds
            const localISOTime = (new Date(date - timezoneOffset)).toISOString().slice(0, 19).replace('T', ' ');
            h.value = `${localISOTime} +0300`;
        }
        header += `${h.key}: ${h.value}\n`;
    }
    header += '---\n';
    return header;
}

async function copyToClipboard() {
    const markdownContent = markdownOutput.value;
    if (navigator.clipboard) {
        try {
            await navigator.clipboard.writeText(markdownContent);
            alert('Markdown copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy to clipboard:', err);
            alert('Failed to copy to clipboard. Please copy manually.');
        }
    } else {
        markdownOutput.select();
        document.execCommand('copy');
        alert('Markdown copied to clipboard!');
    }
}

function saveHeaderToLocalStorage() {
    const rows = headerTable.rows;
    const headers = [];
    for (let i = 0; i < rows.length; i++) {
        const keyInput = rows[i].cells[0].querySelector('input');
        const valueInput = rows[i].cells[1].querySelector('input:not([type="color"])');
        const type = rows[i].cells[1].querySelector('input').type; // Get the input type
        if (keyInput && valueInput) {
            if (keyInput.value) {
                headers.push({ key: keyInput.value, value: valueInput.value, type: type }); // Save the type
            }
        }
    }
    localStorage.setItem(`headers`, JSON.stringify(headers));
    alert('Header saved!');
}

function resetHeaderToDefault() {
    populateHeaderTable(defaultHeaders);
}

function updateFilename() {
    const title = getTableHeaderData().find(h => h.key === 'title')?.value || '';
    const formattedTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const currentDate = new Date().toISOString().slice(0, 10);
    const defaultFilename = `${currentDate}-${formattedTitle}.md`;
    filenameInput.value = defaultFilename;
}

function downloadMarkdownFile() {
    const markdownContent = markdownOutput.value;
    if (!markdownContent) {
        alert("Please generate the Markdown first.");
        return;
    }
    const fileName = filenameInput.value;
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
}

// Function to update the Markdown preview
function updatePreview(content) {
    const converter = new showdown.Converter();

    // Format headers for code block preview
    const headers = getTableHeaderData();
    let headerBlock = '';
    if (headers.length > 0) {
        headerBlock = "```yaml\n"; // Start YAML code block
        for (const h of headers) {
            headerBlock += `${h.key}: ${h.value}\n`;
        }
        headerBlock += "```\n\n"; // End YAML code block
    }
    previewHeader.innerHTML = converter.makeHtml(headerBlock);
    previewContent.innerHTML = converter.makeHtml(content);
}

// Event Listeners
contentInput.addEventListener('input', () => {
    updateOutputAndPreview();
    updateFilename();
});
headerTable.addEventListener('input', () => {
    updateOutputAndPreview();
    updateFilename();
});
filenameInput.addEventListener('input', updateFilename);
copyButton.addEventListener('click', copyToClipboard);
saveHeaderButton.addEventListener('click', saveHeaderToLocalStorage);
resetHeaderButton.addEventListener('click', resetHeaderToDefault);
downloadButton.addEventListener('click', downloadMarkdownFile);
addTextButton.addEventListener('click', () => addHeaderRow());
addDateButton.addEventListener('click', () => addDateRow());
addColorButton.addEventListener('click', () => addColorRow());

// Paste event listener for contentInput
contentInput.addEventListener('paste', (event) => {
    event.preventDefault();
    const clipboardData = event.clipboardData;
    if (clipboardData && clipboardData.types.includes('text/html')) {
        const pastedData = clipboardData.getData('text/html');
        const markdown = convertToMarkdownFormat(pastedData);
        const start = contentInput.selectionStart;
        const end = contentInput.selectionEnd;
        const text = contentInput.value;
        contentInput.value = text.substring(0, start) + markdown + text.substring(end);
    } else if (clipboardData) {
        const pastedData = clipboardData.getData('text/plain');
        insertAtCursor(contentInput, pastedData);
    }
    updateOutputAndPreview();
    updateFilename();
});

// Helper function to insert text at cursor position
function insertAtCursor(inputField, text) {
    const start = inputField.selectionStart;
    const end = inputField.selectionEnd;
    const originalText = inputField.value;
    inputField.value = originalText.substring(0, start) + text + originalText.substring(end);
    inputField.selectionStart = inputField.selectionEnd = start + text.length;
    inputField.focus();
}

// Initial Setup
const savedHeaders = localStorage.getItem('headers');
if (savedHeaders) {
    populateHeaderTable(JSON.parse(savedHeaders));
} else {
    populateHeaderTable(defaultHeaders);
}
updateOutputAndPreview();
updateFilename();