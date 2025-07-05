export function renderDashboard(appDiv, user) {
  appDiv.innerHTML = `
    <h2>Dashboard</h2>
    <p>Welcome, ${user?.displayName || user?.email || "User"}!</p>
    <p>Use the navigation to view courses or logout.</p>
  `;
}