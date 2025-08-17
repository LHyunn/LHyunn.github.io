document.addEventListener('DOMContentLoaded', () => {
    const postList = document.getElementById('post-list');
    const postContent = document.getElementById('post-content');

    let posts = [];

    // Fetch the list of posts
    fetch('posts.json')
        .then(response => response.json())
        .then(data => {
            posts = data;
            renderPostList();
            // Load the first post by default
            if (posts.length > 0) {
                loadPost(posts[0].path, 0);
            }
        })
        .catch(error => {
            console.error('Error fetching posts:', error);
            postContent.innerHTML = '<p>Failed to load post list. Please make sure posts.json is configured correctly.</p>';
        });

    // Render the list of posts in the sidebar
    function renderPostList() {
        postList.innerHTML = '';
        posts.forEach((post, index) => {
            const li = document.createElement('li');
            li.textContent = post.title;
            li.dataset.path = post.path;
            li.dataset.index = index;
            li.addEventListener('click', () => loadPost(post.path, index));
            postList.appendChild(li);
        });
    }

    // Load a specific post
    function loadPost(path, index) {
        fetch(path)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(markdown => {
                // Convert markdown to HTML using marked.js
                postContent.innerHTML = marked.parse(markdown);
                
                // Highlight code blocks using highlight.js
                document.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });

                // Update active state in the sidebar
                updateActivePost(index);
            })
            .catch(error => {
                console.error('Error loading post:', error);
                postContent.innerHTML = `<p>Error loading post: ${path}.</p><p>Make sure the file exists and the path in posts.json is correct.</p>`;
            });
    }
    
    // Update the active post in the sidebar
    function updateActivePost(activeIndex) {
        const listItems = postList.querySelectorAll('li');
        listItems.forEach((li, index) => {
            if (index === activeIndex) {
                li.classList.add('active');
            } else {
                li.classList.remove('active');
            }
        });
    }
});
