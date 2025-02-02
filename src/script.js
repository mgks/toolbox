document.addEventListener('DOMContentLoaded', () => {
    const searchBar = document.getElementById('search-bar');
    const categoriesContainer = document.getElementById('categories-container');
    const toolContent = document.getElementById('tool-content');
    const backButton = document.getElementById('back-button');
    const baseUrl = document.querySelector('meta[name="base-url"]').getAttribute('content');
    const homeLink = document.getElementById('home-link');

    // Fetch the apps.json file
    fetch(`${baseUrl}apps.json`)
        .then(response => response.json())
        .then(appsData => {
            // Store appsData in localStorage
            localStorage.setItem('appsData', JSON.stringify(appsData));

            // Handle routing based on URL
            handleRouting(appsData);

            // Add event listener for search bar
            searchBar.addEventListener('input', () => {
                const searchTerm = searchBar.value.toLowerCase();
                const filteredCategories = filterCategories(searchTerm, appsData);
                displayCategories(filteredCategories);
            });
        })
        .catch(error => {
            console.error('Error fetching or parsing apps.json:', error);
        });

    function handleRouting(appsData) {
        const urlParams = new URLSearchParams(window.location.search);
        const toolName = urlParams.get('tool');

        if (toolName) {
            // Tool page: Load the specific tool
            showToolPage();
            loadTool(toolName, appsData);
        } else {
            // Home page or other routes: Display categories
            showHomePage();
            displayCategories(appsData.categories);
        }
    }

    function showToolPage() {
        categoriesContainer.style.display = 'none';
        toolContent.style.display = 'block';
        backButton.style.display = 'block';
        document.querySelector('.big-head').classList.add('small-head');
        document.querySelector('.big-head').classList.remove('big-head');
        searchBar.style.display = 'none'; // Hide the search bar
    }

    function showHomePage() {
        categoriesContainer.style.display = 'block';
        toolContent.style.display = 'none';
        backButton.style.display = 'none';
        const bigHeadElem = document.querySelector('.small-head');
        if (bigHeadElem) {
            bigHeadElem.classList.add('big-head');
            bigHeadElem.classList.remove('small-head');
        }
        searchBar.style.display = 'block'; // Show the search bar
    }

    // Add event listener to the back button
    backButton.addEventListener('click', () => {
        const appsData = JSON.parse(localStorage.getItem('appsData'));
        if (appsData) {
            showHomePage();
            displayCategories(appsData.categories);
        }
    });

    homeLink.addEventListener('click', (event) => {
        event.preventDefault();
        const appsData = JSON.parse(localStorage.getItem('appsData'));
        if (appsData) {
            showHomePage();
            displayCategories(appsData.categories);
        }
    });

    function loadTool(toolName, appsData) {
        const tool = findTool(toolName, appsData);

        if (!tool) {
            console.error('Tool not found:', toolName);
            toolContent.innerHTML = '<p>Tool not found.</p>';
            return;
        }

        document.title = `${tool.name} - Toolbox`;

        const descriptionMeta = document.querySelector('meta[name="description"]');
        if (descriptionMeta) {
            descriptionMeta.setAttribute('content', tool.description);
        } else {
            const newMeta = document.createElement('meta');
            newMeta.setAttribute('name', 'description');
            newMeta.setAttribute('content', tool.description);
            document.head.appendChild(newMeta);
        }

        const keywordsMeta = document.querySelector('meta[name="keywords"]');
        if (keywordsMeta) {
            keywordsMeta.setAttribute('content', tool.keywords);
        } else {
            const newMeta = document.createElement('meta');
            newMeta.setAttribute('name', 'keywords');
            newMeta.setAttribute('content', tool.keywords);
            document.head.appendChild(newMeta);
        }

        // Update the URL in the address bar without reloading the page
        const toolUrl = `${baseUrl}?tool=${tool.folderName}`;
        window.history.pushState({ tool: tool.folderName }, tool.name, toolUrl);

        // Fetch and load the tool's HTML content
        fetch(`${baseUrl}tools/${tool.folderName}/index.html`)
            .then(response => response.text())
            .then(html => {
                toolContent.innerHTML = html;
                loadScripts(tool);
            })
            .catch(error => {
                console.error(`Error loading tool HTML: ${error}`);
                toolContent.innerHTML = '<p>Error loading tool.</p>';
            });
    }

    function loadScripts(tool) {
        // Function to load script sequentially
        function loadScript(url, callback) {
            const script = document.createElement('script');
            script.src = url;
            script.async = false; // Scripts are loaded and executed in order
            script.onload = callback; // Call the callback function when the script is loaded
            document.body.appendChild(script);
        }
    
        // Check if the tool has dependencies
        if (tool.dependencies && Array.isArray(tool.dependencies)) {
            // Load all dependencies first using recursion
            function loadDependenciesRecursively(index) {
                if (index < tool.dependencies.length) {
                    loadScript(tool.dependencies[index], () => {
                        loadDependenciesRecursively(index + 1);
                    });
                } else {
                    // All dependencies are loaded, now load the tool script
                    loadScript(`${baseUrl}tools/${tool.folderName}/script.js`, () => {
                        console.log(`Script for ${tool.name} loaded successfully.`);
                    });
                }
            }
            loadDependenciesRecursively(0);
        } else {
            // No dependencies, just load the tool script
            loadScript(`${baseUrl}tools/${tool.folderName}/script.js`, () => {
                console.log(`Script for ${tool.name} loaded successfully.`);
            });
        }
    }

    // Updated display categories to handle tools
    function displayCategories(categories) {
        categoriesContainer.innerHTML = '';

        if (Object.keys(categories).length === 0) {
            const noResultsMessage = document.createElement('p');
            noResultsMessage.textContent = 'No results found.';
            noResultsMessage.classList.add('no-results');
            categoriesContainer.appendChild(noResultsMessage);
        } else {
            const categoryColors = {
                "Code Formatting and Minification": "#3498db",
                "Code Validation": "#2ecc71",
                "Text Manipulation": "#f39c12",
                "Data Conversion and Encoding": "#9b59b6",
                "Network Tools": "#e74c3c",
                "Security and Cryptography": "#34495e",
                "Images": "#1abc9c",
                "Development Utilities": "#e67e22",
                "Other": "#7f8c8d"
            };

            for (const categoryName in categories) {
                const category = categories[categoryName];
                const categoryBlock = document.createElement('div');
                categoryBlock.classList.add('category-block');

                const categoryTitle = document.createElement('h2');
                categoryTitle.classList.add('category-title');
                categoryTitle.textContent = categoryName;
                categoryBlock.appendChild(categoryTitle);

                const toolList = document.createElement('div');
                toolList.classList.add('tool-list');

                const baseColor = categoryColors[categoryName] || "#7f8c8d";

                for (const tool of category) {
                    const toolCard = document.createElement('a');
                    toolCard.classList.add('tool-card');
                    // Use query parameter for local development and clean URL for GitHub Pages
                    const toolUrl = `/?tool=${tool.folderName}`;
                    toolCard.href = toolUrl;

                    const gradient = `linear-gradient(135deg, ${baseColor}, ${lightenColor(baseColor, 10)})`;
                    toolCard.style.background = gradient;

                    const toolName = document.createElement('div');
                    toolName.classList.add('tool-name');
                    toolName.textContent = tool.name;
                    toolCard.appendChild(toolName);

                    const toolDescription = document.createElement('div');
                    toolDescription.classList.add('tool-description');
                    toolDescription.textContent = tool.description;
                    toolCard.appendChild(toolDescription);

                    toolList.appendChild(toolCard);
                }

                categoryBlock.appendChild(toolList);
                categoriesContainer.appendChild(categoryBlock);
            }
        }
    }

    // Function to lighten a color for the gradient
    function lightenColor(color, percent) {
        const num = parseInt(color.replace("#",""), 16),
              amt = Math.round(2.55 * percent),
              R = (num >> 16) + amt,
              G = (num >> 8 & 0x00FF) + amt,
              B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
    }

    function filterCategories(searchTerm, appsData) {
        const filteredCategories = {};
        for (const categoryName in appsData.categories) {
            const category = appsData.categories[categoryName];
            const filteredTools = category.filter(tool => {
                return tool.name.toLowerCase().includes(searchTerm) ||
                    tool.description.toLowerCase().includes(searchTerm);
            });
    
            if (filteredTools.length > 0) {
                filteredCategories[categoryName] = filteredTools;
            }
        }
        return filteredCategories;
    }
    
    function findTool(toolName, appsData) {
        const lowerCaseToolName = toolName.toLowerCase();
        for (const category in appsData.categories) {
            const foundTool = appsData.categories[category].find(tool => 
                tool.name.toLowerCase() === lowerCaseToolName || 
                (tool.folderName && tool.folderName.toLowerCase() === lowerCaseToolName)
            );
            if (foundTool) return foundTool;
        }
        return null;
    }

    // Service Worker Registration (for offline support)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register(`${baseUrl}sw.js`)
                .then((registration) => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                }, (err) => {
                    console.log('ServiceWorker registration failed: ', err);
                });
        });
    }

    // Listen for popstate event to handle browser back/forward navigation
    window.addEventListener('popstate', (event) => {
        const appsData = JSON.parse(localStorage.getItem('appsData'));
        if (appsData) {
            if (event.state && event.state.tool) {
                loadTool(event.state.tool, appsData);
            } else {
                // Handle as a regular navigation
                handleRouting(appsData);
            }
        }
    });
});