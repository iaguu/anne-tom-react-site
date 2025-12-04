// src/App.jsx
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import HomeAnneTom from "./pages/HomeAnneTom";
import CardapioPage from "./pages/CardapioPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage.jsx";

const AppContent = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div key={location.pathname} className="page-fade">
        <Routes location={location}>
          <Route path="/" element={<HomeAnneTom />} />
          <Route path="/cardapio" element={<CardapioPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/confirmacao" element={<OrderConfirmationPage />} />
        </Routes>
      </div>
    </div>
  );
};

const App = () => (
  <CartProvider>
    <AppContent />
  </CartProvider>
);

export default App;
