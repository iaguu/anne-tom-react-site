// src/pages/PromotionsPage.jsx
import React from "react";
import SiteLayout from "../components/layout/SiteLayout";
import { Link } from "react-router-dom";

const promos = [
  {
    title: "Combo familia",
    text: "2 pizzas grandes + 1 refri 2L. Ideal para 4 a 6 pessoas.",
  },
  {
    title: "Noite dos queijos",
    text: "Sabores com queijos especiais e borda recheada.",
  },
  {
    title: "Sobremesa da casa",
    text: "Pizza doce com preco especial ao fechar o pedido.",
  },
];

const PromotionsPage = () => (
  <SiteLayout
    title="Promocoes e combos"
    subtitle="Ofertas especiais da semana e combos para dividir."
  >
    <section className="grid md:grid-cols-3 gap-4">
      {promos.map((promo) => (
        <div
          key={promo.title}
          className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2"
        >
          <p className="text-sm font-semibold text-slate-800">
            {promo.title}
          </p>
          <p className="text-xs text-slate-600">{promo.text}</p>
        </div>
      ))}
    </section>

    <section className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            Quer receber as promocoes por WhatsApp?
          </p>
          <p className="text-xs text-slate-600">
            Avise seu numero e a gente manda as novidades.
          </p>
        </div>
        <Link
          to="/contato"
          className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold"
        >
          Quero receber
        </Link>
      </div>
    </section>
  </SiteLayout>
);

export default PromotionsPage;
