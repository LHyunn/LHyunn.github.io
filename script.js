document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const mainContainer = document.getElementById('main-container');
    const sidebarList = document.getElementById('sidebar-list');
    const sidebarTitle = document.getElementById('sidebar-title');
    const postContent = document.getElementById('post-content');

    // Header Links & Toggles
    const homeLink = document.getElementById('home-link');
    const researchLink = document.getElementById('research-link');
    const aboutLink = document.getElementById('about-link');
    const themeCheckbox = document.getElementById('theme-checkbox');
    const langCheckbox = document.getElementById('lang-checkbox');

    // --- State Management ---
    let currentLanguage = 'en';
    let currentView = 'about'; // 'about' or 'research'

    // --- Language Management ---
    function applyLanguage(lang) {
        currentLanguage = lang;
        if (lang === 'ko') {
            langCheckbox.checked = true;
        } else {
            langCheckbox.checked = false;
        }
        // Re-render the current view with the new language
        renderCurrentView();
    }

    function toggleLanguage() {
        const newLanguage = langCheckbox.checked ? 'ko' : 'en';
        localStorage.setItem('language', newLanguage);
        applyLanguage(newLanguage);
    }

    // --- Theme Management ---
    function applyTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark-mode');
            themeCheckbox.checked = true;
        } else {
            document.body.classList.remove('dark-mode');
            themeCheckbox.checked = false;
        }
    }

    function toggleTheme() {
        const newTheme = themeCheckbox.checked ? 'dark' : 'light';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    }

    // --- Core Functions ---
    function loadContent(path) {
        return fetch(path)
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.text();
            })
            .then(markdown => {
                const contentWithoutFrontmatter = markdown.replace(/^---\s*[\s\S]*?---\s*/, '').trim();
                postContent.innerHTML = marked.parse(contentWithoutFrontmatter);
                document.querySelectorAll('pre code').forEach(block => hljs.highlightElement(block));
            });
    }

    function populateSidebar() {
        const jsonPath = `research.${currentLanguage}.json`;
        sidebarTitle.textContent = currentLanguage === 'ko' ? '연구' : 'Research';

        fetch(jsonPath)
            .then(response => response.json())
            .then(items => {
                sidebarList.innerHTML = '';
                const groupedItems = items.reduce((acc, item) => {
                    const category = item.category || 'Uncategorized';
                    if (!acc[category]) acc[category] = [];
                    acc[category].push(item);
                    return acc;
                }, {});

                let globalIndex = 0;
                for (const category in groupedItems) {
                    const categoryLi = document.createElement('li');
                    categoryLi.className = 'sidebar-category';
                    categoryLi.textContent = category;
                    sidebarList.appendChild(categoryLi);

                    groupedItems[category].forEach(item => {
                        const li = document.createElement('li');
                        li.textContent = item.title;
                        const currentIndex = globalIndex;
                        li.addEventListener('click', () => {
                            loadContent(item.path);
                            updateActiveSidebarItem(currentIndex);
                        });
                        sidebarList.appendChild(li);
                        globalIndex++;
                    });
                }

                if (items.length > 0) {
                    loadContent(items[0].path);
                    updateActiveSidebarItem(0);
                } else {
                    postContent.innerHTML = `<p>No items found.</p>`;
                }
            })
            .catch(error => console.error(`Error populating sidebar:`, error));
    }

    function updateActiveSidebarItem(activeIndex) {
        const listItems = sidebarList.querySelectorAll('li:not(.sidebar-category)');
        listItems.forEach((li, index) => {
            li.classList.toggle('active', index === activeIndex);
        });
    }

    // --- View Management ---
    function renderCurrentView() {
        if (currentView === 'about') {
            showAboutView();
        } else if (currentView === 'research') {
            showResearchView();
        }
    }

    function showResearchView() {
        currentView = 'research';
        mainContainer.classList.remove('sidebar-hidden');
        populateSidebar();
    }

    function showAboutView() {
        currentView = 'about';
        mainContainer.classList.add('sidebar-hidden');
        loadContent(`about.${currentLanguage}.md`).catch(error => {
            console.error('Error loading about page:', error);
            postContent.innerHTML = `<p>Error loading about page.</p>`;
        });
    }

    // --- Event Listeners ---
    homeLink.addEventListener('click', (e) => { e.preventDefault(); showAboutView(); });
    researchLink.addEventListener('click', (e) => { e.preventDefault(); showResearchView(); });
    aboutLink.addEventListener('click', (e) => { e.preventDefault(); showAboutView(); });
    themeCheckbox.addEventListener('change', toggleTheme);
    langCheckbox.addEventListener('change', toggleLanguage);

    // --- Initial Page Load ---
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

    const savedLanguage = localStorage.getItem('language');
    const browserLanguage = navigator.language.startsWith('ko') ? 'ko' : 'en';
    applyLanguage(savedLanguage || browserLanguage);
});
