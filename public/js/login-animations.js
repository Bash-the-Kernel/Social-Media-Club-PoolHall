console.log("Login animations loaded");

document.addEventListener('DOMContentLoaded', () => {
  // Elements to animate
  const loginHeading = document.querySelector('.login-container h1');
  const loginForm = document.querySelector('.login-container form');
  const oauthButtons = document.querySelectorAll('.oauth-buttons a');
  const createAccountLink = document.querySelector('.create-account a');

  console.log("Found elements:", {
    loginHeading: !!loginHeading,
    loginForm: !!loginForm,
    oauthButtons: oauthButtons.length,
    createAccountLink: !!createAccountLink
  });

  // Set initial styles
  if (loginHeading) {
    loginHeading.style.opacity = "0";
    loginHeading.style.transform = "translateY(-30px)";
  }

  if (loginForm) {
    loginForm.style.opacity = "0";
    loginForm.style.transform = "translateY(20px)";
  }

  oauthButtons.forEach(button => {
    button.style.opacity = "0";
    button.style.transform = "translateX(-15px)";
  });

  if (createAccountLink) {
    createAccountLink.style.opacity = "0";
    createAccountLink.style.transform = "translateY(10px)";
  }

  // Start animations with a slight delay
  setTimeout(() => {
    try {
      console.log("Starting login animations...");

      // Heading animation
      anime.animate(loginHeading, {
        translateY: [-30, 0],
        opacity: [0, 1],
        duration: 1200,
        easing: 'easeOutExpo'
      });

      // Login form animation
      anime.animate(loginForm, {
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 1000,
        easing: 'easeOutExpo',
        delay: 300
      });

      // OAuth buttons animation
      anime.animate(oauthButtons, {
        translateX: [-15, 0],
        opacity: [0, 1],
        duration: 1000,
        easing: 'easeOutQuad',
        delay: anime.stagger(150) // Stagger animation for each button
      });

      // Create account link animation
      anime.animate(createAccountLink, {
        translateY: [10, 0],
        opacity: [0, 1],
        duration: 800,
        easing: 'easeOutQuad',
        delay: 1000 // Start after other animations
      });

      console.log("Login animations executed");
    } catch (e) {
      console.error("Login animation attempt failed:", e);
    }
  }, 100);
});