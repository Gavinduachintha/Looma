import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Loginpage from "./pages/Loginpage";
import Signuppage from "./pages/Signuppage";
import Layout from "./components/Layout";
import Events from "./pages/Events.jsx";
import Emails from "./pages/Emails.jsx";
import About from "./pages/About.jsx";
import Trash from "./pages/Trash.jsx";
import Auth from "./pages/Auth.jsx";
import Compose from "./context/Compose.jsx";
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<Loginpage />} />
        <Route path="/signup" element={<Signuppage />} />
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/about"
          element={
            <Layout>
              <About />
            </Layout>
          }
        />
        <Route
          path="/events"
          element={
            <Layout>
              <Events />
            </Layout>
          }
        />
        <Route
          path="/emails"
          element={
            <Layout>
              <Emails />
            </Layout>
          }
        />
        <Route
          path="/auth"
          element={
            <Layout>
              <Auth />
            </Layout>
          }
        />
        <Route
          path="/trash"
          element={
            <Layout>
              <Trash />
            </Layout>
          }
        />
        <Route
          path="/compose"
          element={
            <Layout>
              <Compose />
            </Layout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
