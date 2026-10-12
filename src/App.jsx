import { useEffect, useState } from "react";
import axios from "axios";
import "./index.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const emptyForm = {
  studentName: "",
  email: "",
  fatherName: "",
  courseName: "",
  feeStructure: "",
  subjects: "",
  classTiming: "",
};

function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function fetchStudents() {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(`${API}/students`);
      setStudents(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Students load nahi hue. Backend server aur API URL check karo."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStudents();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    const payload = {
      ...form,
      feeStructure: Number(form.feeStructure),
      subjects: form.subjects
        .split(",")
        .map((subject) => subject.trim())
        .filter(Boolean),
    };

    setSaving(true);

    try {
      if (editingId) {
        await axios.put(`${API}/students/${editingId}`, payload);
        setNotice("Student successfully update ho gaya!");
      } else {
        await axios.post(`${API}/students`, payload);
        setNotice("New student successfully add ho gaya!");
      }

      resetForm();
      await fetchStudents();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Save nahi hua. Backend aur database connection check karo."
      );
    } finally {
      setSaving(false);
    }
  }

  function startEdit(student) {
    setEditingId(student._id);
    setForm({
      studentName: student.studentName || "",
      email: student.email || "",
      fatherName: student.fatherName || "",
      courseName: student.courseName || "",
      feeStructure: String(student.feeStructure ?? ""),
      subjects: (student.subjects || []).join(", "),
      classTiming: student.classTiming || "",
    });

    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteStudent(student) {
    const confirmed = window.confirm(
      `Kya aap ${student.studentName} ka record delete karna chahte hain?`
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      await axios.delete(`${API}/students/${student._id}`);

      if (editingId === student._id) resetForm();

      setNotice("Student record delete ho gaya!");
      await fetchStudents();
    } catch (err) {
      setError(
        err.response?.data?.message || "Student delete nahi ho saka."
      );
    }
  }

  const filteredStudents = students.filter((student) => {
    const query = search.toLowerCase();

    return [
      student.studentName,
      student.email,
      student.courseName,
      student.fatherName,
    ].some((value) => (value || "").toLowerCase().includes(query));
  });

  const totalFees = students.reduce(
    (sum, student) => sum + Number(student.feeStructure || 0),
    0
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">S</div>
          <div>
            <h2>StudentHub</h2>
            <p>Management Portal</p>
          </div>
        </div>

        <p className="nav-heading">WORKSPACE</p>
        <div className="nav-item active">
          <span>▦</span> Dashboard
        </div>
        <div className="nav-item">
          <span>♙</span> Students
        </div>

        <div className="sidebar-bottom">
          <div className="avatar">SM</div>
          <div>
            <strong>Administrator</strong>
            <p>Student Manager</p>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">MANAGEMENT / OVERVIEW</p>
            <h1>Student Dashboard</h1>
          </div>
          <div className="live-status">
            <span className="status-dot" />
            Student Portal
          </div>
        </header>

        <section className="welcome-banner">
          <div>
            <p className="banner-label">STUDENT MANAGEMENT SYSTEM</p>
            <h2>Manage your students with ease.</h2>
            <p>
              Add records, manage courses and keep your student data organized.
            </p>
          </div>
          <div className="banner-symbol">✦</div>
        </section>

        {error && (
          <div className="alert error-alert">
            <span>{error}</span>
            <button type="button" onClick={() => setError("")}>×</button>
          </div>
        )}

        {notice && (
          <div className="alert success-alert">
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice("")}>×</button>
          </div>
        )}

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon purple">♙</div>
            <p>Total Students</p>
            <h3>{students.length}</h3>
            <span>Registered student records</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">✓</div>
            <p>Database Status</p>
            <h3 className="status-text">{loading ? "Checking" : error ? "Check API" : "Connected"}</h3>
            <span>Student records API</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">₨</div>
            <p>Total Fee Value</p>
            <h3>{totalFees.toLocaleString("en-PK")}</h3>
            <span>Sum of recorded fees</span>
          </div>
        </section>

        <section className="panel form-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">STUDENT DETAILS</p>
              <h2>{editingId ? "Edit Student" : "Add New Student"}</h2>
            </div>
            {editingId && (
              <button className="btn btn-light" type="button" onClick={resetForm}>
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <label>
                Student Name *
                <input
                  name="studentName"
                  value={form.studentName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                />
              </label>

              <label>
                Email Address *
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="student@example.com"
                  required
                />
              </label>

              <label>
                Father's Name *
                <input
                  name="fatherName"
                  value={form.fatherName}
                  onChange={handleChange}
                  placeholder="Enter father's name"
                  required
                />
              </label>

              <label>
                Course Name *
                <input
                  name="courseName"
                  value={form.courseName}
                  onChange={handleChange}
                  placeholder="e.g. Web Development"
                  required
                />
              </label>

              <label>
                Fee Structure (PKR) *
                <input
                  name="feeStructure"
                  type="number"
                  min="0"
                  value={form.feeStructure}
                  onChange={handleChange}
                  placeholder="e.g. 15000"
                  required
                />
              </label>

              <label>
                Class Timing *
                <input
                  name="classTiming"
                  value={form.classTiming}
                  onChange={handleChange}
                  placeholder="e.g. 4 PM - 6 PM"
                  required
                />
              </label>

              <label className="full-width">
                Subjects *
                <input
                  name="subjects"
                  value={form.subjects}
                  onChange={handleChange}
                  placeholder="HTML, CSS, JavaScript"
                  required
                />
                <small>Har subject ke darmiyan comma lagao.</small>
              </label>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-light"
                onClick={resetForm}
              >
                Clear Form
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Save Changes"
                  : "+ Add Student"}
              </button>
            </div>
          </form>
        </section>

        <section className="panel table-panel">
          <div className="panel-heading table-heading">
            <div>
              <p className="eyebrow">STUDENT DIRECTORY</p>
              <h2>All Students <span className="count-badge">{students.length}</span></h2>
            </div>

            <div className="table-tools">
              <input
                className="search-input"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search students..."
                aria-label="Search students"
              />
              <button className="btn btn-light" onClick={fetchStudents} type="button">
                ↻ Refresh
              </button>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>STUDENT</th>
                  <th>FATHER'S NAME</th>
                  <th>COURSE</th>
                  <th>FEE (PKR)</th>
                  <th>SUBJECTS</th>
                  <th>CLASS TIMING</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="empty-state">
                      Loading student records...
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-state">
                      {search
                        ? "No matching students found."
                        : "No students yet. Add your first student above."}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student._id}>
                      <td>
                        <div className="student-cell">
                          <div className="student-avatar">
                            {(student.studentName || "?").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong>{student.studentName}</strong>
                            <small>{student.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>{student.fatherName}</td>
                      <td><span className="course-tag">{student.courseName}</span></td>
                      <td>{Number(student.feeStructure).toLocaleString("en-PK")}</td>
                      <td>{(student.subjects || []).join(", ")}</td>
                      <td>{student.classTiming}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-btn edit-btn"
                            type="button"
                            onClick={() => startEdit(student)}
                            title="Edit student"
                          >
                            Edit
                          </button>
                          <button
                            className="action-btn delete-btn"
                            type="button"
                            onClick={() => deleteStudent(student)}
                            title="Delete student"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            Showing {filteredStudents.length} of {students.length} student records
          </div>
        </section>

        <footer className="page-footer">
          StudentHub · Student Management System
        </footer>
      </main>
    </div>
  );
}

export default App;