// src/pages/GalleryPage.jsx
import React from "react";
import SiteLayout from "../components/layout/SiteLayout";

const photos = [
  "Forno a lenha e borda crocante",
  "Queijos especiais e finalizacao no forno",
  "Pizza doce com calda e frutas",
  "Borda recheada no ponto",
  "Massa descansada e aberta na hora",
  "Entrega caprichada",
];

const GalleryPage = () => (
  <SiteLayout
    title="Galeria"
    subtitle="Fotos e bastidores da cozinha da Anne & Tom."
  >
    <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {photos.map((caption, index) => (
        <div
          key={`${caption}-${index}`}
          className="bg-white border border-slate-200 rounded-2xl overflow-hidden"
        >
          <div className="h-36 bg-gradient-to-br from-amber-200 via-orange-200 to-rose-200" />
          <div className="p-4">
            <p className="text-xs text-slate-600">{caption}</p>
          </div>
        </div>
      ))}
    </section>
  </SiteLayout>
);

export default GalleryPage;
