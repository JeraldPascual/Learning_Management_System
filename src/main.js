// Import authentication and page rendering modules
import { login } from "./auth/login";
import { signup } from "./auth/signup";
import { logout } from "./auth/logout";
import { auth } from "./utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { renderDashboard } from "./dashboard/dashboard";
import { renderCourses } from "./courses/course";
import { renderLessons } from "./courses/lesson";
import { requireAuth } from "./utils/authguard";
import gsap from "gsap";

// Get the main content div
const appDiv = document.getElementById("app");

// Render the login page and handle login logic
function renderLogin() {
  setAppBackground(true); // Ensure background is set
  gsapPageTransition(() => {
    appDiv.innerHTML = `
      <div class="flex items-center justify-center w-full h-full min-h-[400px]">
        <form id="login-form"
          class="w-full max-w-md flex flex-col justify-center bg-white text-gray-900 rounded-2xl shadow-lg p-8 dark:bg-gray-900 dark:text-gray-100"
        >
          <h2 class="text-3xl font-bold mb-8 text-center">Login</h2>
          <div class="mb-4">
            <label class="block mb-1 text-sm font-medium" for="email">Email</label> 
            <input type="email" id="email" placeholder="Email" required
              class="input w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div class="mb-4">
            <label class="block mb-1 text-sm font-medium" for="password">Password</label>
            <input type="password" id="password" placeholder="Password" required
              class="input w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <button type="submit"
            class="btn btn-neutral mt-2 w-full py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">
            Login
          </button>
          <div id="login-error" class="text-red-500 text-sm mt-2"></div>
          <p class="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?
            <a href="#" id="goto-signup" class="text-blue-600 hover:underline">Sign up</a>
          </p>
        </form>
      </div>
    `;
    // Handle login form submission
    document.getElementById("login-form").onsubmit = async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      try {
        await login(email, password); // Try to log in
        route("dashboard"); // Go to dashboard on success
      } catch (err) {
        document.getElementById("login-error").textContent = err.message; // Show error
      }
    };
    // Link to signup page
    document.getElementById("goto-signup").onclick = (e) => {
      e.preventDefault();
      route("signup");
    };
  });
}

// Render the signup page and handle signup logic
function renderSignup() {
  setAppBackground(true); // Ensure background is set
  gsapPageTransition(() => { 
    appDiv.innerHTML = `
    <div class="flex items-center justify-center w-full h-full min-h-[400px]">
      <form id="signup-form"
        class="w-full max-w-md flex flex-col justify-center bg-white text-gray-900 rounded-2xl shadow-lg p-8 dark:bg-gray-900 dark:text-gray-100"
      >
        <h2 class="text-3xl font-bold mb-8 text-center">Sign Up</h2>
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium" for="displayName">Display Name</label>
          <input type="text" id="displayName" placeholder="Display Name" required
            class="input w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium" for="email">Email</label>
          <input type="email" id="email" placeholder="Email" required
            class="input w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div class="mb-4">
          <label class="block mb-1 text-sm font-medium" for="password">Password</label>
          <input type="password" id="password" placeholder="Password" required
            class="input w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <button type="submit"
          class="btn btn-neutral mt-2 w-full py-2 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">
          Sign Up
        </button>
        <div id="signup-error" class="text-red-500 text-sm mt-2"></div>
        <p class="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?
          <a href="#" id="goto-login" class="text-blue-600 hover:underline">Login</a>
        </p>
      </form>
    </div>
  `;
  // Handle signup form submission
  document.getElementById("signup-form").onsubmit = async (e) => {
    e.preventDefault();
    const displayName = document.getElementById("displayName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try {
      await signup(email, password, displayName); // Try to sign up
      route("dashboard"); // Go to dashboard on success
    } catch (err) {
      document.getElementById("signup-error").textContent = err.message; // Show error
    }
  };
  // Link to login page
  document.getElementById("goto-login").onclick = (e) => {
    e.preventDefault();
    route("login");
  };

}); // End of gsapPageTransition
}

// Render the sidebar navigation based on user state
function renderSidebar(user, currentPage) {
  const isDashboard = currentPage === "dashboard";
  const isCourses = currentPage === "courses";
  const sidebar = document.getElementById("sidebar");
  sidebar.innerHTML = `
    <a href="#">
      <h1 class="text-4xl font-semibold text-gray-800 dark:text-gray-200">Learning Management System</h1>
    </a>
    <div class="flex flex-col justify-between flex-1 mt-6 h-full overflow-hidden">
      <nav>
        ${user ? `
          <a id="nav-dashboard" class="flex items-center px-4 py-2 ${isDashboard ? "text-gray-700 bg-gray-100 rounded-md dark:bg-gray-800 dark:text-gray-200" : "text-gray-600 transition-colors duration-300 transform rounded-md dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-200 hover:text-gray-700"} cursor-pointer">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M19 11H5M19 11C20.1046 11 21 11.8954 21 13V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V13C3 11.8954 3.89543 11 5 11M19 11V9C19 7.89543 18.1046 7 17 7M5 11V9C5 7.89543 5.89543 7 7 7M7 7V5C7 3.89543 7.89543 3 9 3H15C16.1046 3 17 3.89543 17 5V7M7 7H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span class="mx-4 font-medium">Dashboard</span>
          </a>
          <a id="nav-courses" class="flex items-center px-4 py-2 mt-5 ${isCourses ? "text-gray-700 bg-gray-100 rounded-md dark:bg-gray-800 dark:text-gray-200" : "text-gray-600 transition-colors duration-300 transform rounded-md dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-200 hover:text-gray-700"} cursor-pointer">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span class="mx-4 font-medium">Courses</span>
          </a>
          <a id="nav-logout" class="flex items-center px-4 py-2 mt-5 text-gray-600 transition-colors duration-300 transform rounded-md dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-800 dark:hover:text-white hover:text-red-700 cursor-pointer">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M15 5V7M15 11V13M15 17V19M5 5C3.89543 5 3 5.89543 3 7V10C4.10457 10 5 10.8954 5 12C5 13.1046 4.10457 14 3 14V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V14C19.8954 14 19 13.1046 19 12C19 10.8954 19.8954 10 21 10V7C21 5.89543 20.1046 5 19 5H5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <span class="mx-4 font-medium">Logout</span>
          </a>
        ` : ""}
      </nav>
      ${user ? `
      <a href="#" class="flex items-center px-4 -mx-2 mt-8">
       <span class="mx-2 font-medium text-gray-800 dark:text-gray-200">${user.displayName || user.email}</span>
      </a>
      ` : ""}
    </div>
  `;

  if (user) {
    document.getElementById("nav-dashboard").onclick = () => route("dashboard");
    document.getElementById("nav-courses").onclick = () => route("courses");
    document.getElementById("nav-logout").onclick = async () => {
      await logout();
      route("login");
    };
  }
}

// SPA routing logic: renders the correct page based on state
async function route(page, data) {
  // Protect dashboard, courses, and lessons routes
  if (["dashboard", "courses", "lessons"].includes(page)) {
    try {
      await requireAuth();
    } catch {
      renderLogin();
      setAppBackground(true); // Show background for login
      return;
    }
  }
  const user = auth.currentUser;
  renderSidebar(user, page);

  // If not logged in, force login/signup
  if (!user && page !== "login" && page !== "signup") {
    renderLogin();
    setAppBackground(true);
    return;
  }

  // Set background for login/signup, remove for dashboard/courses/lessons
  if (page === "login" || page === "signup") {
    setAppBackground(true);
  } else {
    setAppBackground(false);
  }

  switch (page) {
    case "dashboard":
      renderDashboard(appDiv, user);
      break;
    case "courses":
      renderCourses(appDiv, user, route);
      break;
    case "lessons":
      renderLessons(appDiv, user, data, route);
      break;
    case "signup":
      renderSignup();
      break;
    case "login":
    default:
      renderLogin();
  }
}

// Listen for auth state changes and route accordingly
onAuthStateChanged(auth, (user) => {
  renderSidebar(user);
  if (user) {
    route("dashboard");
  } else {
    route("login");
  }
});

// Initial sidebar render (for first load)
if (document.querySelector("nav")) renderSidebar(null);

// Set app background based on state
function setAppBackground(enabled) {
  const main = document.getElementById("app");
  if (enabled) {
    main.classList.add("bg-pattern");
    gsap.to(main, { opacity: 0.8, duration: 0.5 });
  } else {
    main.classList.remove("bg-pattern");
    gsap.to(main, { opacity: 1, duration: 0.5 });
    main.style.background = "none";
  }
}

// If using ES modules:
// import gsap from "gsap";

function gsapPageTransition(callback) {
  const main = document.getElementById("app");
  gsap.to(main, {
    opacity: 0,
    duration: 0.3,
    onComplete: () => {
      callback();
      gsap.fromTo(main, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    }
  });
}
