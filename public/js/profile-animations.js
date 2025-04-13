console.log("Profile animations loaded");

document.addEventListener('DOMContentLoaded', () => {
  // Elements to animate
  const profileHeading = document.querySelector('.profile h1');
  const profilePicture = document.querySelector('.profile img');
  const profileDetails = document.querySelectorAll('.profile p');
  const followActions = document.querySelector('.follow-actions');
  const editProfileForm = document.querySelector('.profile form');
  const navLinks = document.querySelectorAll('nav a');

  console.log("Found elements:", {
    profileHeading: !!profileHeading,
    profilePicture: !!profilePicture,
    profileDetails: profileDetails.length,
    followActions: !!followActions,
    editProfileForm: !!editProfileForm,
    navLinks: navLinks.length
  });

  // Set initial styles
  if (profileHeading) {
    profileHeading.style.opacity = "0";
    profileHeading.style.transform = "translateY(-30px)";
  }

  if (profilePicture) {
    profilePicture.style.opacity = "0";
    profilePicture.style.transform = "scale(0.8)";
  }

  profileDetails.forEach(detail => {
    detail.style.opacity = "0";
    detail.style.transform = "translateX(-20px)";
  });

  if (followActions) {
    followActions.style.opacity = "0";
    followActions.style.transform = "translateY(20px)";
  }

  if (editProfileForm) {
    editProfileForm.style.opacity = "0";
    editProfileForm.style.transform = "translateY(20px)";
  }

  navLinks.forEach(link => {
    link.style.opacity = "0";
    link.style.transform = "translateX(-15px)";
  });

  // Start animations with a slight delay
  setTimeout(() => {
    try {
      console.log("Starting profile animations...");

      // Profile heading animation
      anime.animate(profileHeading, {
        translateY: [-30, 0],
        opacity: [0, 1],
        duration: 1200,
        easing: 'easeOutExpo'
      });

      // Profile picture animation
      anime.animate(profilePicture, {
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 1000,
        easing: 'easeOutExpo',
        delay: 300
      });

      // Profile details animation
      anime.animate(profileDetails, {
        translateX: [-20, 0],
        opacity: [0, 1],
        duration: 1000,
        easing: 'easeOutExpo',
        delay: anime.stagger(200) // Stagger animation for each detail
      });

      // Follow actions animation
      if (followActions) {
        anime.animate(followActions, {
          translateY: [20, 0],
          opacity: [0, 1],
          duration: 800,
          easing: 'easeOutExpo',
          delay: 1000
        });
      }

      // Edit profile form animation
      if (editProfileForm) {
        anime.animate(editProfileForm, {
          translateY: [20, 0],
          opacity: [0, 1],
          duration: 800,
          easing: 'easeOutExpo',
          delay: 1000
        });
      }

      // Navigation links animation
      anime.animate(navLinks, {
        translateX: [-15, 0],
        opacity: [0, 1],
        duration: 1000,
        easing: 'easeOutQuad',
        delay: anime.stagger(150) // Stagger animation for each link
      });

      console.log("Profile animations executed");
    } catch (e) {
      console.error("Profile animation attempt failed:", e);
    }
  }, 100);
});