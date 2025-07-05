import { db } from "../utils/firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

// Renders the lessons page for a given course, and a form to add lessons
export async function renderLessons(appDiv, user, data, route) {
  const { courseId, courseTitle } = data;
  // Query Firestore for lessons belonging to this course
  const q = query(collection(db, "lessons"), where("courseId", "==", courseId));
  const snap = await getDocs(q);
  let lessons = [];
  // Collect all lesson documents into an array
  snap.forEach(doc => lessons.push({ id: doc.id, ...doc.data() }));

  // Render the lesson list and add form
  appDiv.innerHTML = `
    <h2>Lessons for "${courseTitle}"</h2>
    <ul>
      ${lessons.map(l => `<li>${l.title}</li>`).join("")}
    </ul>
    <h3>Add Lesson</h3>
    <form id="add-lesson-form">
      <input type="text" id="lesson-title" placeholder="Lesson Title" required />
      <button type="submit">Add</button>
    </form>
    <div id="lesson-error" class="error"></div>
    <button id="back-to-courses">Back to Courses</button>
  `;

  // Handle back button to return to courses page
  document.getElementById("back-to-courses").onclick = () => route("courses");

  // Handle add lesson form submission
  document.getElementById("add-lesson-form").onsubmit = async (e) => {
    e.preventDefault();
    const title = document.getElementById("lesson-title").value;
    try {
      // Add new lesson to Firestore
      await addDoc(collection(db, "lessons"), { title, courseId });
      // Re-render lessons page to show new lesson
      renderLessons(appDiv, user, data, route);
    } catch (err) {
      document.getElementById("lesson-error").textContent = err.message;
    }
  };
}