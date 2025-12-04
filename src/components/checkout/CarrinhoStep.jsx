// src/components/checkout/CarrinhoStep.jsx
import React from "react";
import { Link } from "react-router-dom";

const CarrinhoStep = ({ items, updateQuantity, removeItem }) => {
  if (!items.length) {
    return (
      <p className="text-sm text-slate-500">
        Seu carrinho está vazio.{" "}
        <Link to="/cardapio" className="underline">
          Voltar ao cardápio
        </Link>
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={`${item.id}-${item.tamanho}`}
          className="flex justify-between items-center p-4 bg-slate-50 border border-slate-200 rounded-xl"
        >
          <div className="space-y-1">
            <p className="font-semibold">
              {item.quantidade}x {item.nome}
            </p>
            <p className="text-[12px] text-slate-500">
              {item.tamanho}
              {item.meio && ` · meio a meio com ${item.meio}`}
            </p>
            {Array.isArray(item.extras) && item.extras.length > 0 && (
              <p className="text-[11px] text-slate-500">
                Adicionais: {item.extras.join(", ")}
              </p>
            )}
            <p className="text-sm font-medium">
              R$ {(item.precoUnitario * item.quantidade)
                .toFixed(2)
                .replace(".", ",")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              value={item.quantidade}
              onChange={(e) =>
                updateQuantity(
                  item.id,
                  item.tamanho,
                  Number(e.target.value) || 1
                )
              }
              className="w-16 px-2 py-1 rounded border border-slate-300 text-right text-xs bg-white"
            />
            <button
              onClick={() => removeItem(item.id, item.tamanho)}
              className="text-[11px] text-red-500 hover:text-red-600"
            >
              Remover
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CarrinhoStep;
