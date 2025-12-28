// src/components/checkout/PagamentoStep.jsx
import React from "react";

const PagamentoStep = ({
  subtotal,
  taxaEntrega,
  desconto,
  totalFinal,
  pagamento,
  setPagamento,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="font-semibold text-lg">Pagamento e finalização</h2>

      <div className="grid sm:grid-cols-3 gap-4 text-xs">
        {["pix", "cartao", "dinheiro"].map((tipo) => (
          <button
            key={tipo}
            type="button"
            onClick={() => setPagamento(tipo)}
            className={`premium-pill w-full text-xs ${
              pagamento === tipo ? "premium-pill--active" : ""
            }`}
          >
            {tipo === "pix" && "Pix (recomendado)"}
            {tipo === "cartao" && "Cartão (maquininha na entrega)"}
            {tipo === "dinheiro" && "Dinheiro"}
          </button>
        ))}
      </div>

      <div className="premium-card bg-white border border-slate-200 rounded-2xl p-4 text-sm space-y-2">
        <p className="flex justify-between">
          <span>Subtotal</span>
          <b>R$ {subtotal.toFixed(2).replace(".", ",")}</b>
        </p>
        <p className="flex justify-between">
          <span>Taxa de entrega</span>
          <b>R$ {taxaEntrega.toFixed(2).replace(".", ",")}</b>
        </p>
        {desconto > 0 && (
          <p className="flex justify-between text-emerald-600">
            <span>Desconto</span>
            <b>- R$ {desconto.toFixed(2).replace(".", ",")}</b>
          </p>
        )}
        <hr />
        <p className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>R$ {totalFinal.toFixed(2).replace(".", ",")}</span>
        </p>
      </div>
    </div>
  );
};

export default PagamentoStep;
