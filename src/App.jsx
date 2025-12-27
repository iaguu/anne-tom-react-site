// src/App.jsx
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import HomeAnneTom from "./pages/HomeAnneTom";
import CardapioPage from "./pages/CardapioPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage.jsx";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import DeliveryPage from "./pages/DeliveryPage";
import PromotionsPage from "./pages/PromotionsPage";
import EventsPage from "./pages/EventsPage";
import FaqPage from "./pages/FaqPage";
import AllergensPage from "./pages/AllergensPage";
import LoyaltyPage from "./pages/LoyaltyPage";
import CareersPage from "./pages/CareersPage";
import GalleryPage from "./pages/GalleryPage";

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
          <Route path="/sobre" element={<AboutPage />} />
          <Route path="/contato" element={<ContactPage />} />
          <Route path="/entrega" element={<DeliveryPage />} />
          <Route path="/promocoes" element={<PromotionsPage />} />
          <Route path="/eventos" element={<EventsPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/alergenos" element={<AllergensPage />} />
          <Route path="/fidelidade" element={<LoyaltyPage />} />
          <Route path="/trabalhe-conosco" element={<CareersPage />} />
          <Route path="/galeria" element={<GalleryPage />} />
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
