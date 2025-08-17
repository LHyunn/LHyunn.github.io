document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const mainContainer = document.getElementById('main-container');
    const sidebarList = document.getElementById('sidebar-list');
    const sidebarTitle = document.getElementById('sidebar-title');
    const postContent = document.getElementById('post-content');
    
    // Header Links
    const homeLink = document.getElementById('home-link');
    const researchLink = document.getElementById('research-link');
    const aboutLink = document.getElementById('about-link');

    // --- Core Functions ---

    // Generic function to fetch and render markdown content
    function loadContent(path) {
        return fetch(path)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.text();
            })
            .then(markdown => {
                // Strip YAML frontmatter from the beginning of the file
                const contentWithoutFrontmatter = markdown.replace(/^---\s*[\s\S]*?---\s*/, '').trim();
                postContent.innerHTML = marked.parse(contentWithoutFrontmatter);
                document.querySelectorAll('pre code').forEach(block => {
                    hljs.highlightElement(block);
                });
            });
    }

    // Populates the sidebar with the list of research items
    function populateSidebar() {
        sidebarTitle.textContent = 'Research';

        fetch('research.json')
            .then(response => {
                if (!response.ok) throw new Error(`Failed to load research.json`);
                return response.json();
            })
            .then(items => {
                sidebarList.innerHTML = ''; // Clear current list

                // Group items by category
                const groupedItems = items.reduce((acc, item) => {
                    const category = item.category || 'Uncategorized';
                    if (!acc[category]) {
                        acc[category] = [];
                    }
                    acc[category].push(item);
                    return acc;
                }, {});

                let globalIndex = 0;
                for (const category in groupedItems) {
                    // Add category header
                    const categoryLi = document.createElement('li');
                    categoryLi.className = 'sidebar-category';
                    categoryLi.textContent = category;
                    sidebarList.appendChild(categoryLi);

                    // Add items for this category
                    groupedItems[category].forEach(item => {
                        const li = document.createElement('li');
                        li.textContent = item.title;
                        li.dataset.path = item.path;
                        
                        const currentIndex = globalIndex;
                        li.addEventListener('click', () => {
                            loadContent(item.path);
                            updateActiveSidebarItem(currentIndex);
                        });
                        sidebarList.appendChild(li);
                        globalIndex++;
                    });
                }

                // Automatically load the first item overall
                if (items.length > 0) {
                    loadContent(items[0].path);
                    updateActiveSidebarItem(0);
                } else {
                    postContent.innerHTML = `<p>No items found.</p>`;
                }
            })
            .catch(error => {
                console.error(`Error populating sidebar:`, error);
                postContent.innerHTML = `<p>Error loading content list.</p>`;
            });
    }

    // Updates the active item in the sidebar
    function updateActiveSidebarItem(activeIndex) {
        // Select only clickable items, not category headers
        const listItems = sidebarList.querySelectorAll('li:not(.sidebar-category)');
        listItems.forEach((li, index) => {
            if (index === activeIndex) {
                li.classList.add('active');
            } else {
                li.classList.remove('active');
            }
        });
    }

    // --- Page Loaders ---

    function showResearchView() {
        mainContainer.classList.remove('sidebar-hidden');
        populateSidebar();
    }

    function showAboutView() {
        mainContainer.classList.add('sidebar-hidden');
        loadContent('about.md').catch(error => {
            console.error('Error loading about page:', error);
            postContent.innerHTML = `<p>Error loading about page.</p>`;
        });
    }

    // --- Event Listeners ---

    homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        showAboutView();
    });

    researchLink.addEventListener('click', (e) => {
        e.preventDefault();
        showResearchView();
    });

    aboutLink.addEventListener('click', (e) => {
        e.preventDefault();
        showAboutView();
    });

    // --- Initial Page Load ---
    showAboutView(); // Load the "About" page by default
});
