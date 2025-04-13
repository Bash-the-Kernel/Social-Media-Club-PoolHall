console.log("Feed animations loaded");

document.addEventListener('DOMContentLoaded', () => {
  // Elements to animate
  const heading = document.querySelector('.profile > h1');
  const postForm = document.querySelector('.profile > form');
  const posts = document.querySelectorAll('.post');
  const navLinks = document.querySelectorAll('nav a');

  console.log("Found elements:", {
    heading: !!heading,
    postForm: !!postForm,
    posts: posts.length,
    navLinks: navLinks.length
  });

  // Create pool balls container
  const poolBallsContainer = document.createElement('div');
  poolBallsContainer.className = 'pool-balls-container';
  poolBallsContainer.style.position = 'fixed';
  poolBallsContainer.style.top = '0';
  poolBallsContainer.style.left = '0';
  poolBallsContainer.style.width = '100%';
  poolBallsContainer.style.height = '100%';
  poolBallsContainer.style.overflow = 'hidden';
  poolBallsContainer.style.pointerEvents = 'none';
  poolBallsContainer.style.zIndex = '-1';
  document.body.appendChild(poolBallsContainer);

  // Pool ball colors and patterns
  const poolBallTypes = [
    { number: 1, color: '#FDD835', solidColor: true },
    { number: 2, color: '#1E88E5', solidColor: true },
    { number: 3, color: '#E53935', solidColor: true },
    { number: 4, color: '#6D4C41', solidColor: true },
    { number: 5, color: '#FF9800', solidColor: true },
    { number: 6, color: '#43A047', solidColor: true },
    { number: 7, color: '#8E24AA', solidColor: true },
    { number: 8, color: '#000000', solidColor: true },
    { number: 9, color: '#FDD835', solidColor: false },
    { number: 10, color: '#1E88E5', solidColor: false },
    { number: 11, color: '#E53935', solidColor: false },
    { number: 12, color: '#6D4C41', solidColor: false },
    { number: 13, color: '#FF9800', solidColor: false },
    { number: 14, color: '#43A047', solidColor: false },
    { number: 15, color: '#8E24AA', solidColor: false }
  ];

  // Create pool balls - all the same size and bigger
  const numBalls = 15;
  const ballSize = 80; // Fixed larger size for all balls
  const poolBalls = [];
  
  for (let i = 0; i < numBalls; i++) {
    const ballInfo = poolBallTypes[i % poolBallTypes.length];
    
    const ball = document.createElement('div');
    ball.className = 'pool-ball';
    ball.style.position = 'absolute';
    ball.style.width = `${ballSize}px`;
    ball.style.height = `${ballSize}px`;
    ball.style.borderRadius = '50%';
    ball.style.backgroundColor = ballInfo.color;
    ball.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
    ball.style.display = 'flex';
    ball.style.alignItems = 'center';
    ball.style.justifyContent = 'center';
    ball.style.fontSize = `${ballSize/2}px`;
    ball.style.fontWeight = 'bold';
    ball.style.color = 'white';
    ball.style.textShadow = '1px 1px 2px rgba(0,0,0,0.5)';
    
    // Add number to ball
    ball.textContent = ballInfo.number;
    
    // For striped balls
    if (!ballInfo.solidColor) {
      ball.style.backgroundImage = `
        linear-gradient(
          to bottom,
          white 0%,
          white 40%,
          ${ballInfo.color} 40%,
          ${ballInfo.color} 60%,
          white 60%,
          white 100%
        )
      `;
      
      // Add a second div for the circle with number
      const circle = document.createElement('div');
      circle.style.width = `${ballSize * 0.6}px`;
      circle.style.height = `${ballSize * 0.6}px`;
      circle.style.borderRadius = '50%';
      circle.style.backgroundColor = 'white';
      circle.style.display = 'flex';
      circle.style.alignItems = 'center';
      circle.style.justifyContent = 'center';
      circle.style.position = 'relative';
      circle.textContent = ballInfo.number;
      circle.style.color = 'black';
      circle.style.fontSize = `${ballSize/3}px`;
      circle.style.fontWeight = 'bold';
      
      ball.textContent = '';
      ball.appendChild(circle);
    }
    
    // Set initial random position
    ball.style.left = `${Math.random() * 100}vw`;
    ball.style.top = `${Math.random() * 100}vh`;
    
    // Store random direction and speed for each ball
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.5 + Math.random() * 1.5;
    
    poolBalls.push({
      element: ball,
      x: parseFloat(ball.style.left),
      y: parseFloat(ball.style.top),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: ballSize
    });
    
    poolBallsContainer.appendChild(ball);
  }

  // Set initial styles for page elements
  if (heading) {
    heading.style.opacity = "0";
    heading.style.transform = "translateY(-30px)";
  }

  if (postForm) {
    postForm.style.opacity = "0";
    postForm.style.transform = "translateY(20px)";
  }

  posts.forEach((post, index) => {
    post.style.opacity = "0";
    post.style.transform = "translateY(30px)";
  });

  navLinks.forEach(link => {
    link.style.opacity = "0";
    link.style.transform = "translateX(-15px)";
  });

  // Animation for pool balls
  function animatePoolBalls() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    poolBalls.forEach(ball => {
      // Update position
      ball.x += ball.vx;
      ball.y += ball.vy;
      
      // Bounce off the walls
      if (ball.x < 0 || ball.x > width - ball.size) {
        ball.vx *= -1;
        // Add a little spin effect on collision
        anime.animate(ball.element, {
          rotate: ball.vx > 0 ? '360deg' : '-360deg',
          duration: 1000,
          easing: 'easeOutQuad'
        });
      }
      
      if (ball.y < 0 || ball.y > height - ball.size) {
        ball.vy *= -1;
        // Add a little spin effect on collision
        anime.animate(ball.element, {
          rotate: ball.vy > 0 ? '360deg' : '-360deg',
          duration: 1000,
          easing: 'easeOutQuad'
        });
      }
      
      // Apply new position
      ball.element.style.left = `${ball.x}px`;
      ball.element.style.top = `${ball.y}px`;
    });
    
    requestAnimationFrame(animatePoolBalls);
  }

  // Start animations with a slight delay
  setTimeout(() => {
    try {
      console.log("Starting animations...");

      // Start pool ball animation
      animatePoolBalls();

      // Heading animation
      anime.animate(heading, {
        translateY: [-30, 0],
        opacity: [0, 1],
        duration: 1200,
        easing: 'easeOutExpo'
      });

      // Navigation links animation
      anime.animate(navLinks, {
        translateX: [-15, 0],
        opacity: [0, 1],
        duration: 1000,
        easing: 'easeOutQuad',
        delay: anime.stagger(150)
      });

      // Post form animation
      anime.animate(postForm, {
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 1000,
        easing: 'easeOutExpo',
        delay: 300
      });

      // Posts animation with staggered delay
      anime.animate(posts, {
        translateY: [30, 0],
        opacity: [0, 1],
        duration: 800,
        easing: 'easeOutQuad',
        delay: anime.stagger(200, {start: 500}) // Start after form animation
      });

      // Add hover effect for posts
      posts.forEach(post => {
        post.addEventListener('mouseenter', () => {
          anime.animate(post, {
            scale: 1.02,
            boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
            duration: 300,
            easing: 'easeOutQuad'
          });
        });
        
        post.addEventListener('mouseleave', () => {
          anime.animate(post, {
            scale: 1,
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            duration: 300,
            easing: 'easeOutQuad'
          });
        });
      });

      console.log("Animation commands executed");
    } catch (e) {
      console.error("Animation attempt failed:", e);
    }
  }, 100);
});