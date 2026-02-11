import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NavBar from "./component/NavBar";
import Career from "./component/Career";
import Hero from "./component/Hero";
import Companies from "./component/Companies";
import Dream from "./component/Dream";
import Resources from "./component/Resources";
import Footer from "./body/Footer";

function App() {
  return (
    <Router>
      <div className="App">
        <NavBar />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Career />
                <Hero />
                <Dream /> 
               <Footer/>
              </>
            }
          />
          <Route path="/Companies" element={<Companies />} />
          <Route path="/Resources" element={<Resources />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
