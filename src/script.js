document.addEventListener('DOMContentLoaded', () => {
    const searchBar = document.getElementById('search-bar');
    const categoriesContainer = document.getElementById('categories-container');
    const toolContent = document.getElementById('tool-content');
    const backButton = document.getElementById('back-button');
    const baseUrl = document.querySelector('meta[name="base-url"]').getAttribute('content');
    const homeLink = document.getElementById('home-link');
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    // Fetch the apps.json file using the dynamically set base URL
    fetch(`${baseUrl}apps.json`)
        .then(response => response.json())
        .then(appsData => {
            // Store appsData in localStorage
            localStorage.setItem('appsData', JSON.stringify(appsData));

            // Populate the sidebar with tools
            populateSidebar(appsData);

            // Handle routing based on URL
            handleRouting(appsData);

            searchBar.addEventListener('input', () => {
                const searchTerm = searchBar.value.toLowerCase();
                const filteredCategories = filterCategories(searchTerm, appsData);
                displayCategories(filteredCategories);
            });
        })
        .catch(error => {
            console.error('Error fetching or parsing apps.json:', error);
        });

    // Toggle sidebar visibility
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('show');
        mainContent.classList.toggle('sidebar-open');
        menuToggle.classList.toggle('show');
    });

    // Add event listener to the back button
    backButton.addEventListener('click', () => {
        const appsData = JSON.parse(localStorage.getItem('appsData'));
        if (appsData) {
            window.history.pushState({ isHomePage: true }, '', baseUrl);
            showHomePage();
            displayCategories(appsData.categories);
            document.body.classList.remove('tool-page');
        }
    });

    homeLink.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default link behavior
        window.history.pushState({ isHomePage: true }, '', baseUrl);
        const appsData = JSON.parse(localStorage.getItem('appsData'));
        if (appsData) {
            showHomePage();
            displayCategories(appsData.categories);
        }
        document.body.classList.remove('tool-page');
    });

    // Listen for popstate event to handle browser back/forward navigation
    window.addEventListener('popstate', (event) => {
        const appsData = JSON.parse(localStorage.getItem('appsData'));
        if (appsData) {
            handleRouting(appsData);
        }
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
        document.body.classList.add('tool-page');
        categoriesContainer.style.display = 'none';
        toolContent.style.display = 'block';
        backButton.style.display = 'block';
        document.querySelector('.big-head').classList.add('small-head');
        document.querySelector('.big-head').classList.remove('big-head');
        searchBar.style.display = 'none'; // Hide the search bar
        menuToggle.classList.add('show');
    }
    
    function showHomePage() {
        document.body.classList.remove('tool-page');
        categoriesContainer.style.display = 'block';
        toolContent.style.display = 'none';
        backButton.style.display = 'none';
        const bigHeadElem = document.querySelector('.small-head');
        if (bigHeadElem) {
            bigHeadElem.classList.add('big-head');
            bigHeadElem.classList.remove('small-head');
        }
        searchBar.style.display = 'block'; // Show the search bar
        sidebar.classList.remove('show');
        if (window.innerWidth <= 768) { // Check if it's a mobile screen
            menuToggle.classList.remove('show');
        }
    }

    function populateSidebar(appsData) {
        const sidebarMenu = document.getElementById('sidebar-menu');
        sidebarMenu.innerHTML = ''; // Clear existing menu items
    
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
    
        for (const categoryName in appsData.categories) {
            const category = appsData.categories[categoryName];
    
            const categoryItem = document.createElement('li');
            categoryItem.classList.add('sidebar-category-title');
            categoryItem.textContent = categoryName;
            sidebarMenu.appendChild(categoryItem);
    
            const subList = document.createElement('ul');
            subList.classList.add('sub-list');
            categoryItem.addEventListener('click', function(event) {
                event.stopPropagation();
                // const isVisible = subList.style.display !== 'none';
                // subList.style.display = isVisible ? 'none' : 'block';
            
                // Remove 'active' class from all category items
                document.querySelectorAll('.sidebar-category-title').forEach(cat => {
                    if (cat !== categoryItem) {
                        cat.classList.remove('active');
                        // Also hide their sub-lists
                        //cat.nextElementSibling.style.display = 'none';
                    }
                });
            
                // Toggle 'active' class on the clicked category item
                categoryItem.classList.toggle('active', !isVisible);
            });
    
            const baseColor = categoryColors[categoryName] || "#7f8c8d";
            const toolListItems = createToolListItems(category, baseColor);
            subList.appendChild(toolListItems);
    
            sidebarMenu.appendChild(categoryItem);
            sidebarMenu.appendChild(subList);
        }
    }

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
                // Load dependencies from apps.json (if any) first
                if (tool.dependencies && Array.isArray(tool.dependencies)) {
                    tool.dependencies.forEach(dependencyUrl => {
                        const script = document.createElement('script');
                        script.src = dependencyUrl;
                        script.async = false; // Ensure scripts are executed in order
                        document.body.appendChild(script);
                    });
                }
                // Load the tool-specific script
                const toolScript = document.createElement('script');
                toolScript.src = `${baseUrl}tools/${tool.folderName}/script.js`;
                toolScript.async = false; // Ensure tool script executes after dependencies
                document.body.appendChild(toolScript);
            })
            .catch(error => {
                console.error(`Error loading tool HTML: ${error}`);
                toolContent.innerHTML = '<p>Error loading tool.</p>';
            });
    }

    // updated display categories to match href as well
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
                categoryBlock.id = categoryName.toLowerCase().replace(/\s+/g, '-');

                const categoryTitle = document.createElement('h2');
                categoryTitle.classList.add('category-title');
                categoryTitle.textContent = categoryName;
                categoryBlock.appendChild(categoryTitle);

                const toolList = document.createElement('div');
                toolList.classList.add('tool-list');

                const baseColor = categoryColors[categoryName] || "#7f8c8d";

                const toolListItems = createToolListItems(category, baseColor);
                toolList.appendChild(toolListItems);

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

    // Function to create tool list items for both the sidebar and homepage
    function createToolListItems(category, baseColor) {
        const fragment = document.createDocumentFragment();
        category.forEach(tool => {
            const toolCard = document.createElement('a');
            toolCard.classList.add('tool-card');
            toolCard.href = `/?tool=${tool.folderName}`;
            toolCard.style.background = `linear-gradient(135deg, ${baseColor}, ${lightenColor(baseColor, 10)})`;

            const toolName = document.createElement('div');
            toolName.classList.add('tool-name');
            toolName.textContent = tool.name;

            const toolDescription = document.createElement('div');
            toolDescription.classList.add('tool-description');
            toolDescription.textContent = tool.description;

            toolCard.appendChild(toolName);
            toolCard.appendChild(toolDescription);

            // Add click event listener to each tool card
            toolCard.addEventListener('click', (event) => {
                event.preventDefault();
                const appsData = JSON.parse(localStorage.getItem('appsData'));
                loadTool(tool.folderName, appsData);
                showToolPage();
            });

            fragment.appendChild(toolCard);
        });
        return fragment;
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
});