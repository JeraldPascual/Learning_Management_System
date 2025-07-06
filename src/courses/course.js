import { db } from "../utils/firebase";
import { collection, addDoc, getDocs, query, where, orderBy, doc, deleteDoc } from "firebase/firestore";

// Renders the courses page, showing all courses for the user and a form to add new ones
export async function renderCourses(appDiv, user, route) {
  appDiv.innerHTML = `
    <div class="mb-8">
      <h2 class="text-2xl font-bold mb-4">Add Course</h2>
      <form id="add-course-form" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 bg-white p-4 rounded-lg shadow">
        <input type="text" id="courseName" placeholder="Course Name" required class="input input-bordered w-full" />
        <input type="text" id="courseCode" placeholder="Course Code" required class="input input-bordered w-full" />
        <input type="number" id="unit" placeholder="Unit" required class="input input-bordered w-full" min="1" />
        <select id="semester" required class="input input-bordered w-full">
          <option value="">Semester</option>
          <option value="1">1</option>
          <option value="2">2</option>
        </select>
        <input type="text" id="lecturer" placeholder="Lecturer" required class="input input-bordered w-full" />
        <button type="submit" class="btn btn-primary col-span-1 sm:col-span-2 md:col-span-5">Add Course</button>
      </form>
      <div id="course-error" class="text-red-500 text-sm mt-2"></div>
    </div>
    <div id="courses-table"></div>
  `;

  // Handle form submission
  document.getElementById("add-course-form").onsubmit = async (e) => {
    e.preventDefault();
    const course = {
      name: document.getElementById("courseName").value,
      code: document.getElementById("courseCode").value,
      unit: document.getElementById("unit").value,
      semester: document.getElementById("semester").value,
      lecturer: document.getElementById("lecturer").value,
      createdAt: new Date().toISOString(),
      uid: user.uid // <-- Add this line
    };
    try {
      // Save to Firestore or your backend
      await addCourseToDB(course); // Implement this function
      renderCourses(appDiv, user, route); // Refresh the table
    } catch (err) {
      document.getElementById("course-error").textContent = err.message;
    }
  };

  // Fetch and render courses table
  renderCoursesTable(user.uid);
}

async function renderCoursesTable(uid) {
  const courses = await fetchCoursesFromDB(uid);

  document.getElementById("courses-table").innerHTML = `
    <div class="overflow-x-auto">
      <table class="table table-zebra w-full text-sm">
        <thead>
          <tr>
            <th>#</th>
            <th>Course Name</th>
            <th>Code</th>
            <th>Unit</th>
            <th>Semester</th>
            <th>Lecturer</th>
            <th>Created</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${courses.map((c, i) => `
            <tr>
              <th>${i + 1}</th>
              <td class="break-words max-w-xs">${c.name}</td>
              <td>${c.code}</td>
              <td>${c.unit}</td>
              <td>${c.semester}</td>
              <td class="break-words max-w-xs">${c.lecturer}</td>
              <td>${new Date(c.createdAt).toLocaleDateString()}</td>
              <td>
                <button class="btn btn-xs btn-error" data-id="${c.id}" title="Delete">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;

  // Add event listeners for delete buttons
  document.querySelectorAll('.btn-error[data-id]').forEach(btn => {
    btn.onclick = async (e) => {
      const id = btn.getAttribute('data-id');
      if (confirm("Are you sure you want to delete this course?")) {
        await deleteDoc(doc(db, "courses", id));
        renderCoursesTable(uid); // Refresh table
      }
    };
  });
}

// Example using Firestore
async function addCourseToDB(course) {
  await addDoc(collection(db, "courses"), course);
}

async function fetchCoursesFromDB(uid) {
  const q = query(
    collection(db, "courses"),
    where("uid", "==", uid),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}