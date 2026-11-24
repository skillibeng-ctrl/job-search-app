import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./component/NavBar";
import Career from "./component/Career";
import Hero from "./component/Hero";
import Companies from "./component/Companies";
import Dream from "./component/Dream";
import Resources from "./component/Resources";
import Footer from "./components/ui/Footer";
import Preferences from "./component/Preferences";


import Jobs from "./pages/Job"; 
import JobDetail from "./pages/JobDetail";
import SavedJobs from "./pages/SavedJobs";
import Applications from "./pages/Applications"; 
import SignIn from "./pages/SignIn"; 
import Register from "./pages/Register";
import Salaries from "./pages/Salaries" 
import ResumeTemplates from "./pages/ResumeTemplates";
import ResumeBuilder from "./pages/ResumeBuilder";
import ResumeMatch from "./pages/ResumeMatch"; 
import Employers from "./pages/Employers";
import Legal from "./pages/Legal";
import PostJob from "./pages/PostJob";
import Profile from "./pages/Profile";
// import Settings from "./pages/Settings";
import Help from "./pages/Help";
import ProtectedRoute from "./component/ProtectedRoute";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("jobflow_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("jobflow_user");
    setUser(null);
  };

  return (
    <Router>
      <div className="App flex flex-col min-h-screen">
        <NavBar user={user} onLogout={handleLogout} />
        
        <main className="flex-grow">
          {/* 🔥 ALL ROUTES MUST GO INSIDE THIS ROUTES TAG */}
          <Routes>
            {/* Home */}
            <Route
              path="/"
              element={
                <>
                  <Hero />
                  <Career />
                  <Dream /> 
                </>
              }
            />
            
            {/* Auth */}
            <Route path="/signin" element={<SignIn setUser={setUser} />} />
            <Route path="/register" element={<Register setUser={setUser} />} />

            {/* App Pages */}
            <Route path="/jobs" element={<Jobs />} /> 
            <Route path="/jobs/:id" element={<JobDetail />}/>
            <Route path="/saved" element={<SavedJobs />}/>
            <Route path="/applications" element={<Applications />} />
            <Route path="/prefrences" element={<Preferences />} />
            
            {/* Resources */}
            <Route path="/salaries" element={<Salaries />} />
            <Route path="/resume-templates" element={<ResumeTemplates />} />
            <Route path="/resume-builder" element={<ResumeBuilder />} />
            <Route path="/match" element={<ResumeMatch />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/resources" element={<Resources />} />

            {/* User Profile */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<Help />} />

            {/* Employer Routes */}
            <Route path="/employers" element={<Employers />} />
            
            {/* 🔥 THE PROTECTED ROUTE (Notice it is inside Routes) */}
            <Route element={<ProtectedRoute allowedRole="employer" />}>
              <Route path="/employers/post" element={<PostJob />} />
            </Route>

            {/* Legal */}
            <Route path="/privacy" element={<Legal />} />
            <Route path="/terms" element={<Legal />} />
            <Route path="/cookies" element={<Legal />} />
          </Routes>
          {/* 🔥 END OF ROUTES */}
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;