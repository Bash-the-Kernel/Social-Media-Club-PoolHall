console.log("Animations.js loaded");

document.addEventListener('DOMContentLoaded', () => {
  // Check if elements exist
  const welcomeHeading = document.querySelector('#welcome-heading');
  const navLinks = document.querySelectorAll('.nav-link');
  
  console.log("Found welcome heading:", !!welcomeHeading);
  console.log("Found nav links:", navLinks.length);
  
  // Set initial styles to make animation visible
  if (welcomeHeading) {
    welcomeHeading.style.opacity = "0";
    welcomeHeading.style.transform = "translateY(-50px)";
    console.log("Set initial styles for heading");
  }
  
  navLinks.forEach(link => {
    link.style.opacity = "0";
    link.style.transform = "translateX(-20px)";
    console.log("Set initial styles for nav link");
  });
  
  // Add a small delay to ensure styles are applied before animation
  setTimeout(() => {
    try {
      console.log("Starting animations...");
      
      // Welcome heading animation
      anime.animate('#welcome-heading', {
        translateY: [-50, 0],
        opacity: [0, 1],
        duration: 1500,
        easing: 'easeOutExpo'
      });
      
      // Nav links animation
      anime.animate('.nav-link', {
        translateX: [-20, 0],
        opacity: [0, 1],
        duration: 1200,
        easing: 'easeOutExpo',
        delay: anime.stagger(300)
      });
      
      console.log("Animation commands executed");
    } catch (e) {
      console.error("Animation attempt failed:", e);
    }
  }, 100);
});