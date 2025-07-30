const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Name - CV</title>
    <link rel="stylesheet" href="/styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>
<body>
    <div class="container">
        <header class="header">
            <div class="profile-section">
                <div class="profile-image">
                    <img src="https://via.placeholder.com/150x150/4A90E2/ffffff?text=Photo" alt="Profile Photo">
                </div>
                <div class="profile-info">
                    <h1 class="name">Your Full Name</h1>
                    <h2 class="title">Your Professional Title</h2>
                    <p class="tagline">A brief, compelling tagline about your professional expertise</p>
                </div>
            </div>
            <div class="contact-info">
                <div class="contact-item">
                    <i class="fas fa-envelope"></i>
                    <span>your.email@example.com</span>
                </div>
                <div class="contact-item">
                    <i class="fas fa-phone"></i>
                    <span>+1 (555) 123-4567</span>
                </div>
                <div class="contact-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>Your City, Country</span>
                </div>
                <div class="contact-item">
                    <i class="fab fa-linkedin"></i>
                    <span>linkedin.com/in/yourprofile</span>
                </div>
                <div class="contact-item">
                    <i class="fab fa-github"></i>
                    <span>github.com/yourusername</span>
                </div>
            </div>
        </header>

        <main class="main-content">
            <section class="section">
                <h3 class="section-title">
                    <i class="fas fa-user"></i>
                    About Me
                </h3>
                <p class="about-text">
                    Write a compelling summary of your professional background, key skills, and career objectives. 
                    This should be 2-3 sentences that capture your unique value proposition and what you bring to potential employers.
                </p>
            </section>

            <section class="section">
                <h3 class="section-title">
                    <i class="fas fa-briefcase"></i>
                    Work Experience
                </h3>
                <div class="experience-item">
                    <div class="experience-header">
                        <h4 class="job-title">Job Title</h4>
                        <span class="job-date">Month Year - Present</span>
                    </div>
                    <h5 class="company-name">Company Name</h5>
                    <ul class="job-responsibilities">
                        <li>Key achievement or responsibility that demonstrates your impact</li>
                        <li>Another significant accomplishment with quantifiable results if possible</li>
                        <li>Third responsibility that showcases relevant skills</li>
                    </ul>
                </div>

                <div class="experience-item">
                    <div class="experience-header">
                        <h4 class="job-title">Previous Job Title</h4>
                        <span class="job-date">Month Year - Month Year</span>
                    </div>
                    <h5 class="company-name">Previous Company Name</h5>
                    <ul class="job-responsibilities">
                        <li>Notable achievement or responsibility from this role</li>
                        <li>Another key accomplishment that shows career progression</li>
                        <li>Additional responsibility relevant to your field</li>
                    </ul>
                </div>
            </section>

            <section class="section">
                <h3 class="section-title">
                    <i class="fas fa-graduation-cap"></i>
                    Education
                </h3>
                <div class="education-item">
                    <div class="education-header">
                        <h4 class="degree">Degree Name</h4>
                        <span class="education-date">Year</span>
                    </div>
                    <h5 class="institution">University/Institution Name</h5>
                    <p class="education-details">Relevant coursework, honors, or achievements</p>
                </div>
            </section>

            <section class="section">
                <h3 class="section-title">
                    <i class="fas fa-cog"></i>
                    Skills
                </h3>
                <div class="skills-grid">
                    <div class="skill-category">
                        <h4 class="skill-category-title">Technical Skills</h4>
                        <div class="skill-tags">
                            <span class="skill-tag">Skill 1</span>
                            <span class="skill-tag">Skill 2</span>
                            <span class="skill-tag">Skill 3</span>
                            <span class="skill-tag">Skill 4</span>
                        </div>
                    </div>
                    <div class="skill-category">
                        <h4 class="skill-category-title">Languages</h4>
                        <div class="skill-tags">
                            <span class="skill-tag">English (Native)</span>
                            <span class="skill-tag">Language 2 (Level)</span>
                            <span class="skill-tag">Language 3 (Level)</span>
                        </div>
                    </div>
                </div>
            </section>

            <section class="section">
                <h3 class="section-title">
                    <i class="fas fa-project-diagram"></i>
                    Projects
                </h3>
                <div class="project-item">
                    <div class="project-header">
                        <h4 class="project-title">Project Name</h4>
                        <div class="project-links">
                            <a href="#" class="project-link">
                                <i class="fas fa-external-link-alt"></i> Live Demo
                            </a>
                            <a href="#" class="project-link">
                                <i class="fab fa-github"></i> Code
                            </a>
                        </div>
                    </div>
                    <p class="project-description">
                        Brief description of the project, technologies used, and your role in its development.
                    </p>
                    <div class="project-tech">
                        <span class="tech-tag">Technology 1</span>
                        <span class="tech-tag">Technology 2</span>
                        <span class="tech-tag">Technology 3</span>
                    </div>
                </div>

                <div class="project-item">
                    <div class="project-header">
                        <h4 class="project-title">Another Project</h4>
                        <div class="project-links">
                            <a href="#" class="project-link">
                                <i class="fas fa-external-link-alt"></i> Live Demo
                            </a>
                            <a href="#" class="project-link">
                                <i class="fab fa-github"></i> Code
                            </a>
                        </div>
                    </div>
                    <p class="project-description">
                        Description of another significant project showcasing different skills or technologies.
                    </p>
                    <div class="project-tech">
                        <span class="tech-tag">Technology A</span>
                        <span class="tech-tag">Technology B</span>
                        <span class="tech-tag">Technology C</span>
                    </div>
                </div>
            </section>
        </main>
    </div>
</body>
</html>`;

const cssContent = `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #2c3e50;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    padding: 20px;
}

.container {
    max-width: 1000px;
    margin: 0 auto;
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.header {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    color: white;
    padding: 40px;
    position: relative;
    overflow: hidden;
}

.header::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="20" cy="80" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    animation: float 20s infinite linear;
    pointer-events: none;
}

@keyframes float {
    0% { transform: translateX(-100px) translateY(-100px); }
    100% { transform: translateX(100px) translateY(100px); }
}

.profile-section {
    display: flex;
    align-items: center;
    gap: 30px;
    margin-bottom: 30px;
    position: relative;
    z-index: 1;
}

.profile-image {
    flex-shrink: 0;
}

.profile-image img {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    border: 4px solid rgba(255, 255, 255, 0.3);
    transition: transform 0.3s ease;
}

.profile-image img:hover {
    transform: scale(1.05);
}

.profile-info h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 8px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.profile-info h2 {
    font-size: 1.4rem;
    font-weight: 400;
    opacity: 0.9;
    margin-bottom: 12px;
}

.tagline {
    font-size: 1.1rem;
    opacity: 0.8;
    max-width: 400px;
}

.contact-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
    position: relative;
    z-index: 1;
}

.contact-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
}

.contact-item:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
}

.contact-item i {
    font-size: 1.2rem;
    width: 20px;
    text-align: center;
}

.main-content {
    padding: 40px;
}

.section {
    margin-bottom: 40px;
}

.section-title {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 1.5rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 24px;
    padding-bottom: 12px;
    border-bottom: 2px solid #e8f4fd;
    position: relative;
}

.section-title::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 50px;
    height: 2px;
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    border-radius: 1px;
}

.section-title i {
    color: #4facfe;
    font-size: 1.3rem;
}

.about-text {
    font-size: 1.1rem;
    line-height: 1.8;
    color: #5a6c7d;
}

.experience-item, .education-item, .project-item {
    background: #f8fbff;
    padding: 24px;
    border-radius: 16px;
    margin-bottom: 20px;
    border-left: 4px solid #4facfe;
    transition: all 0.3s ease;
}

.experience-item:hover, .education-item:hover, .project-item:hover {
    transform: translateX(8px);
    box-shadow: 0 8px 25px rgba(79, 172, 254, 0.1);
}

.experience-header, .education-header, .project-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
    flex-wrap: wrap;
    gap: 12px;
}

.job-title, .degree, .project-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: #2c3e50;
}

.job-date, .education-date {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
}

.company-name, .institution {
    color: #4facfe;
    font-weight: 500;
    margin-bottom: 16px;
    font-size: 1.1rem;
}

.job-responsibilities {
    list-style: none;
    padding-left: 0;
}

.job-responsibilities li {
    position: relative;
    padding-left: 24px;
    margin-bottom: 8px;
    color: #5a6c7d;
    line-height: 1.6;
}

.job-responsibilities li::before {
    content: '▶';
    position: absolute;
    left: 0;
    color: #4facfe;
    font-size: 0.8rem;
}

.skills-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
}

.skill-category {
    background: #f8fbff;
    padding: 24px;
    border-radius: 16px;
    border: 1px solid #e8f4fd;
}

.skill-category-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 16px;
}

.skill-tags, .project-tech {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.skill-tag, .tech-tag {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
    transition: transform 0.2s ease;
}

.skill-tag:hover, .tech-tag:hover {
    transform: translateY(-2px);
}

.project-links {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.project-link {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: #4facfe;
    color: white;
    text-decoration: none;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
    transition: all 0.3s ease;
}

.project-link:hover {
    background: #2196f3;
    transform: translateY(-2px);
}

.project-description {
    color: #5a6c7d;
    line-height: 1.6;
    margin-bottom: 16px;
}

.education-details {
    color: #5a6c7d;
    font-style: italic;
}

@media (max-width: 768px) {
    .container {
        margin: 10px;
        border-radius: 16px;
    }
    
    .header {
        padding: 30px 20px;
    }
    
    .profile-section {
        flex-direction: column;
        text-align: center;
        gap: 20px;
    }
    
    .profile-info h1 {
        font-size: 2rem;
    }
    
    .contact-info {
        grid-template-columns: 1fr;
    }
    
    .main-content {
        padding: 30px 20px;
    }
    
    .experience-header, .education-header, .project-header {
        flex-direction: column;
        align-items: flex-start;
    }
    
    .skills-grid {
        grid-template-columns: 1fr;
    }
    
    .project-links {
        justify-content: flex-start;
    }
}`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    const headers = new Headers({
      'Cache-Control': 'public, max-age=86400',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    });

    if (pathname === '/' || pathname === '/index.html') {
      headers.set('Content-Type', 'text/html; charset=utf-8');
      return new Response(htmlContent, { headers });
    }

    if (pathname === '/styles.css') {
      headers.set('Content-Type', 'text/css; charset=utf-8');
      return new Response(cssContent, { headers });
    }

    return new Response('Not Found', { 
      status: 404,
      headers: { 'Content-Type': 'text/plain' }
    });
  },
};