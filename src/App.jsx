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
import Applications from "./pages/Applications"; // 🔥 Added
import SignIn from "./pages/SignIn"; // 🔥 Added
import Register from "./pages/Register"; // 🔥 Added

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
        {/* 🔥 4. Pass user and onLogout to NavBar */}
        <NavBar user={user} onLogout={handleLogout} />
        
        <main className="flex-grow">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Career />
                  <Hero />
                  <Dream /> 
                </>
              }
            />
            
            {/* 🔥 5. Auth Routes */}
            <Route path="/signin" element={<SignIn setUser={setUser} />} />
            <Route path="/register" element={<Register setUser={setUser} />} />

            {/* Job Routes */}
            <Route path="/jobs" element={<Jobs />} /> 
            <Route path="/jobs/:id" element={<JobDetail />}/>
            <Route path="/saved" element={<SavedJobs />}/>
            
            {/* 🔥 6. Applications Route */}
            <Route path="/applications" element={<Applications />} />

            <Route path="/companies" element={<Companies />} />
            <Route path="/resources" element={<Resources />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;