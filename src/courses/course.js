import { db } from "../utils/firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

// Renders the courses page, showing all courses for the user and a form to add new ones
export async function renderCourses(appDiv, user, route) {
  // Query Firestore for courses owned by the current user
  const q = query(collection(db, "courses"), where("owner", "==", user.uid));
  const snap = await getDocs(q);
  let courses = [];
  // Collect all course documents into an array
  snap.forEach(doc => courses.push({ id: doc.id, ...doc.data() }));

  // Render the course list and add form
  appDiv.innerHTML = `
    <h2>Your Courses</h2>
    <ul>
      ${courses.map(c => `<li>
        <a href="#" class="course-link" data-id="${c.id}">${c.title}</a>
      </li>`).join("")}
    </ul>
    <h3>Add Course</h3>
    <form id="add-course-form">
      <input type="text" id="course-title" placeholder="Course Title" required />
      <button type="submit">Add</button>
    </form>
    <div id="course-error" class="error"></div>
  `;

  // Attach click handlers to each course link to show lessons
  document.querySelectorAll(".course-link").forEach(link => {
    link.onclick = (e) => {
      e.preventDefault();
      route("lessons", { courseId: link.dataset.id, courseTitle: link.textContent });
    };
  });

  // Handle add course form submission
  document.getElementById("add-course-form").onsubmit = async (e) => {
    e.preventDefault();
    const title = document.getElementById("course-title").value;
    try {
      // Add new course to Firestore
      await addDoc(collection(db, "courses"), { title, owner: user.uid });
      // Re-render courses page to show new course
      renderCourses(appDiv, user, route);
    } catch (err) {
      document.getElementById("course-error").textContent = err.message;
    }
  };
}