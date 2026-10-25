import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./component/NavBar";
import Career from "./component/Career";
import Hero from "./component/Hero";
import Companies from "./component/Companies";
import Dream from "./component/Dream";
import Resources from "./component/Resources";
import Footer from "./body/Footer";
import Jobs from "./pages/Job"; 
import JobDetail from "./pages/JobDetail";
import SavedJobs from "./pages/SavedJobs";

function App() {
  return (
    <Router>
      {/* flex-col and min-h-screen ensure the footer stays at the bottom */}
      <div className="App flex flex-col min-h-screen">
        <NavBar />
        
        
        <main className="flex-grow">
          <Routes>
            <Route path="/jobs/:id" element={<JobDetail />}/>
            <Route path="/saved" element={<SavedJobs />}/>
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
            {/* 2. Add the Jobs route */}
            <Route path="/jobs" element={<Jobs />} /> 
            
            <Route path="/companies" element={<Companies />} />
            <Route path="/resources" element={<Resources />} />
          </Routes>
        </main>
        
        {/* 3. Move Footer here so it shows on ALL pages */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;