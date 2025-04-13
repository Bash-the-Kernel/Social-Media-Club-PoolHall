console.log("Register animations loaded");

document.addEventListener('DOMContentLoaded', () => {
  // Elements to animate
  const registerHeading = document.querySelector('.profile h1');
  const registerForm = document.querySelector('.profile form');
  const navLinks = document.querySelectorAll('nav a');

  console.log("Found elements:", {
    registerHeading: !!registerHeading,
    registerForm: !!registerForm,
    navLinks: navLinks.length
  });

  // Set initial styles
  if (registerHeading) {
    registerHeading.style.opacity = "0";
    registerHeading.style.transform = "translateY(-30px)";
  }

  if (registerForm) {
    registerForm.style.opacity = "0";
    registerForm.style.transform = "translateY(20px)";
  }

  navLinks.forEach(link => {
    link.style.opacity = "0";
    link.style.transform = "translateX(-15px)";
  });

  // Start animations with a slight delay
  setTimeout(() => {
    try {
      console.log("Starting register animations...");

      // Heading animation
      anime.animate(registerHeading, {
        translateY: [-30, 0],
        opacity: [0, 1],
        duration: 1200,
        easing: 'easeOutExpo'
      });

      // Register form animation
      anime.animate(registerForm, {
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 1000,
        easing: 'easeOutExpo',
        delay: 300
      });

      // Navigation links animation
      anime.animate(navLinks, {
        translateX: [-15, 0],
        opacity: [0, 1],
        duration: 1000,
        easing: 'easeOutQuad',
        delay: anime.stagger(150) // Stagger animation for each link
      });

      console.log("Register animations executed");
    } catch (e) {
      console.error("Register animation attempt failed:", e);
    }
  }, 100);
});