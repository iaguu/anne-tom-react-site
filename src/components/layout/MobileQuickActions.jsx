import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { formatCurrencyBRL } from "../../utils/menu";

const WHATSAPP_URL =
  "https://api.whatsapp.com/send?phone=5511932507007&text=Oi%20Anne%20%26%20Tom%2C%20quero%20fazer%20um%20pedido";

const MOBILE_HIDE_PATHS = new Set(["/checkout", "/confirmacao"]);

const MobileQuickActions = () => {
  const { items, total } = useCart();
  const location = useLocation();
  const { pathname } = location;

  if (MOBILE_HIDE_PATHS.has(pathname)) {
    return null;
  }

  const isCardapio = pathname === "/cardapio";
  const primaryLabel = isCardapio ? "Ver carrinho" : "Montar pedido agora";
  const primaryPath = isCardapio ? "/checkout" : "/cardapio";

  return (
    <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 pointer-events-none">
      <div
        className="max-w-6xl mx-auto px-4"
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom, 16px) + 0.25rem)",
        }}
      >
        <div className="pointer-events-auto rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur">
          <div className="flex flex-col gap-2">
            <Link
              to={primaryPath}
              className="block w-full text-center rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:brightness-110 transition"
              aria-label={primaryLabel}
            >
              {primaryLabel}
            </Link>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="block w-full text-center rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 transition"
              aria-label="Abrir WhatsApp da Anne & Tom"
            >
              Pedir pelo WhatsApp
            </a>

            {items.length > 0 && (
              <p className="text-[11px] text-slate-500 tracking-tight">
                {`${items.length} item${items.length > 1 ? "s" : ""} no carrinho · ${formatCurrencyBRL(
                  total
                )}`}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileQuickActions;
