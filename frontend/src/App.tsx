import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import About from "./pages/About";
import Footer from "./components/Footer";
import Cart from './pages/Cart';
import Login from "./pages/Login";
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import AdminProducts from './pages/AdminProducts';
import { useAuth } from "./contexts/AuthContext"

export default function App() {
  const { user } = useAuth(); 

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/checkout" element={<Checkout />} />
            {user?.role === "admin" && (
              <Route path="/admin/products" element={<AdminProducts />} />
            )}
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
