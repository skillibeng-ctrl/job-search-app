import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./component/NavBar";
import Career from "./component/Career";
import Hero from "./component/Hero";
import Companies from "./component/Companies";
import Dream from "./component/Dream";
import Resources from "./component/Resources";
import Footer from "./components/ui/Footer";

// Page Imports
import Jobs from "./pages/Job";
import JobDetail from "./pages/JobDetail";
import SavedJobs from "./pages/SavedJobs";
import Applications from "./pages/Applications";
import SignIn from "./pages/SignIn";
import Register from "./pages/Register";
import Salaries from "./pages/Salaries";
import ResumeTemplates from "./pages/ResumeTemplates";
import ResumeMatch from "./pages/ResumeMatch";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("jobflow_user");
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch { localStorage.removeItem("jobflow_user"); }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("jobflow_user");
    setUser(null);
  };

  return (
    <Router>
      <div className="App flex min-h-screen flex-col">
        <NavBar user={user} onLogout={handleLogout} />

        {/* Pages that have their own <main id="main"> (Jobs, Resources, Salaries, ...) must not be wrapped in another <main>, so this is a div. */}
        <div className="flex-grow">
          <Routes>
            {/* Home */}
            <Route
              path="/"
              element={
                <main id="main">
                  <Hero />
                  <Career />
                  <Dream />
                </main>
              }
            />

            {/* Auth */}
            <Route path="/signin" element={<SignIn setUser={setUser} />} />
            <Route path="/register" element={<Register setUser={setUser} />} />

            {/* App Pages */}
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/saved" element={<SavedJobs />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/match" element={<ResumeMatch />} />

            {/* Resources */}
            <Route path="/salaries" element={<Salaries />} />
            <Route path="/resume-templates" element={<ResumeTemplates />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/resources" element={<Resources />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </Router>
  );
}

export default App;