// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');
    
    // Theme Toggle Functionality
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;
    
    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        body.classList.add('dark-theme');
    }
    
    // Toggle theme on button click
    themeToggle.addEventListener('click', function() {
        body.classList.toggle('dark-theme');
        
        // Save theme preference
        const theme = body.classList.contains('dark-theme') ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
    });
    
    // Handle navigation clicks
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and sections
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding section
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
            
            // Smooth scroll to section with header offset
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = targetSection.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        });
    });
    
    // Handle CTA links in intro section
    const ctaLinks = document.querySelectorAll('.cta-link');
    ctaLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                // Remove active class from all links and sections
                navLinks.forEach(l => l.classList.remove('active'));
                sections.forEach(s => s.classList.remove('active'));
                
                // Add active class to target link and section
                const targetNavLink = document.querySelector(`[href="#${targetId}"]`);
                if (targetNavLink) {
                    targetNavLink.classList.add('active');
                }
                targetSection.classList.add('active');
                
                // Smooth scroll to section with header offset
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add smooth scrolling for all anchor links with header offset
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20; // 20px extra padding
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Add loading animation for profile image
    const profileImg = document.querySelector('.profile-img');
    if (profileImg) {
        // Set initial opacity to 0 for fade-in effect
        profileImg.style.opacity = '0';
        
        profileImg.addEventListener('load', function() {
            this.style.opacity = '1';
        });
        
        profileImg.addEventListener('error', function() {
            // If image fails to load, show a placeholder
            this.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            this.style.display = 'flex';
            this.style.alignItems = 'center';
            this.style.justifyContent = 'center';
            this.style.color = 'white';
            this.style.fontSize = '3rem';
            this.style.opacity = '1';
            this.innerHTML = '👨‍💻';
        });
        
        // If image is already loaded (cached), show it immediately
        if (profileImg.complete) {
            profileImg.style.opacity = '1';
        }
    }
    
    // Add hover effects for blog posts
    const blogPosts = document.querySelectorAll('.blog-post');
    blogPosts.forEach(post => {
        post.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(10px)';
        });
        
        post.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });
    
    // Add intersection observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.resource-card, .blog-post');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // -------- Data-driven rendering for Blogs and Resources --------
    async function fetchJSON(path) {
        try {
            const res = await fetch(path, { cache: 'no-store' });
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return await res.json();
        } catch (e) {
            console.warn('Failed to load', path, e);
            return null;
        }
    }

    function renderBlogs(blogs) {
        const container = document.querySelector('.blog-posts');
        if (!container || !Array.isArray(blogs)) return;
        container.innerHTML = blogs.map(b => `
            <div class="blog-post">
                <div class="blog-date">${b.date || ''}</div>
                <div class="blog-content">
                    <h3 class="blog-title">
                        <a href="${b.url}" target="_blank" rel="noopener">${b.title}</a>
                    </h3>
                    <p class="blog-excerpt">${b.excerpt || ''}</p>
                </div>
            </div>
        `).join('');
    }

    function renderResources(resources) {
        const grid = document.querySelector('.resources-grid');
        if (!grid || !Array.isArray(resources)) return;
        grid.innerHTML = resources.map(r => `
            <div class="resource-card">
                <div class="resource-icon">${r.icon || '📘'}</div>
                <h3 class="resource-title">${r.title}</h3>
                <p class="resource-description">${r.description || ''}</p>
                ${r.link ? `<a href="${r.link}" target="_blank" class="resource-link">${r.cta || 'Open'}</a>` : ''}
            </div>
        `).join('');
    }

    (async () => {
        const [blogs, resources] = await Promise.all([
            fetchJSON('data/blogs.json'),
            fetchJSON('data/resources.json')
        ]);
        if (blogs) renderBlogs(blogs);
        if (resources) renderResources(resources);
    })();

    // Figure media: prefer MP4 video, fallback to GIF, else keep dots
    const figureVideo = document.getElementById('homeFigureVideo');
    const figureGif = document.getElementById('homeFigureGif');
    if (figureVideo) {
        figureVideo.addEventListener('canplay', () => {
            figureVideo.style.display = 'block';
            if (figureGif) figureGif.style.display = 'none';
        });
        figureVideo.addEventListener('error', () => {
            if (figureGif) figureGif.style.display = 'block';
        });
        // If the video source is missing, show GIF if available
        if (!figureVideo.getAttribute('src')) {
            if (figureGif) figureGif.style.display = 'block';
        }
    }

    // Animated colorful orbiting dots on transparent canvas
    const orbitCanvas = document.getElementById('orbitCanvas');
    if (orbitCanvas) {
        const ctx = orbitCanvas.getContext('2d');
        let width, height, centerX, centerY, scale;
        const deviceRatio = window.devicePixelRatio || 1;

        function resize() {
            const rect = orbitCanvas.getBoundingClientRect();
            width = Math.floor(rect.width);
            height = Math.floor(rect.height);
            orbitCanvas.width = Math.floor(width * deviceRatio);
            orbitCanvas.height = Math.floor(height * deviceRatio);
            ctx.setTransform(deviceRatio, 0, 0, deviceRatio, 0, 0);
            centerX = width / 2;
            centerY = height / 2;
            scale = Math.min(width, height) / 2.6;
        }

        resize();
        window.addEventListener('resize', resize);

        const TWO_PI = Math.PI * 2;
        const particles = Array.from({ length: 160 }, (_, i) => {
            const orbit = 0.3 + Math.random() * 0.7; // radius factor
            const speed = (0.4 + Math.random() * 0.8) * (Math.random() < 0.5 ? -1 : 1);
            const angle = Math.random() * TWO_PI;
            const size = 1.2 + Math.random() * 2.4;
            const hue = Math.floor(200 + Math.random() * 140); // blue-purple-green range
            const sat = 70 + Math.random() * 30;
            const light = 55 + Math.random() * 20;
            return { orbit, speed, angle, size, hue, sat, light, z: Math.random() };
        });

        let last = performance.now();
        function tick(now) {
            const dt = Math.min(40, now - last) / 1000; // seconds
            last = now;

            ctx.clearRect(0, 0, width, height);

            // gentle rotation of the whole system
            const t = now * 0.0001;
            const rot = t % TWO_PI;
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(rot);

            for (const p of particles) {
                p.angle += p.speed * dt * 0.6;
                const r = p.orbit * scale * (0.8 + 0.2 * Math.sin(t * 2 + p.orbit * 5));
                const x = Math.cos(p.angle) * r;
                const y = Math.sin(p.angle) * r * 0.6; // slight ellipse

                // depth effect
                const alpha = 0.6 + 0.4 * Math.sin(p.angle + p.z * 6);
                ctx.fillStyle = `hsla(${p.hue}, ${p.sat}%, ${p.light}%, ${alpha})`;
                ctx.beginPath();
                ctx.arc(x, y, p.size, 0, TWO_PI);
                ctx.fill();
            }

            ctx.restore();
            requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
    }
});

// Utility function to update social links
function updateSocialLinks(links) {
    const socialLinks = document.querySelectorAll('.social-link');
    const platforms = ['twitter', 'linkedin', 'github', 'medium'];
    
    platforms.forEach((platform, index) => {
        if (socialLinks[index] && links[platform]) {
            socialLinks[index].href = links[platform];
        }
    });
}

// Utility function to update personal information
function updatePersonalInfo(info) {
    const nameElements = document.querySelectorAll('.logo, .highlight');
    const titleElement = document.querySelector('title');
    
    if (info.name) {
        nameElements.forEach(el => {
            el.textContent = info.name;
        });
        if (titleElement) {
            titleElement.textContent = `${info.name} - AI Engineer`;
        }
    }
    
    if (info.title) {
        const introText = document.querySelector('.intro-text p:first-child');
        if (introText) {
            introText.textContent = info.title;
        }
    }
    
    if (info.description) {
        const descriptionElements = document.querySelectorAll('.intro-text p:not(:first-child)');
        if (descriptionElements.length >= 2) {
            descriptionElements[0].textContent = info.description;
        }
    }
    
    if (info.writingFocus) {
        const descriptionElements = document.querySelectorAll('.intro-text p:not(:first-child)');
        if (descriptionElements.length >= 2) {
            descriptionElements[1].textContent = info.writingFocus;
        }
    }
}

// Example usage (you can customize these values):
// updatePersonalInfo({
//     name: "Your Name",
//     title: "an AI engineer and technical writer.",
//     description: "I help developers build intelligent AI solutions.",
//     writingFocus: "My writing focuses on machine learning and AI engineering."
// });

// updateSocialLinks({
//     twitter: "https://twitter.com/yourusername",
//     linkedin: "https://linkedin.com/in/yourusername",
//     github: "https://github.com/yourusername",
//     medium: "https://medium.com/@yourusername"
// });
