// src/components/checkout/PagamentoStep.jsx
import React, { useEffect, useState } from "react";

// Ícones SVG simples para manter consistência visual
const PixIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="4"
      y="4"
      width="16"
      height="16"
      rx="4"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <path
      d="M9 12L11 10L13 12L11 14L9 12Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13 8L15 10L13 12L15 14L13 16"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CardIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="3"
      y="6"
      width="18"
      height="12"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M3 10H21"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <rect
      x="7"
      y="13"
      width="4"
      height="2"
      rx="0.6"
      fill="currentColor"
    />
  </svg>
);

const MoneyIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="3"
      y="6"
      width="18"
      height="12"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <circle cx="12" cy="12" r="2.3" stroke="currentColor" strokeWidth="1.4" />
    <path
      d="M7 9.5C7.5 9 8.3 8.5 9 8.5"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      d="M17 14.5C16.5 15 15.7 15.5 15 15.5"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

const PagamentoStep = ({
  subtotal,
  taxaEntrega,
  desconto,
  totalFinal,
  pagamento,
  setPagamento,
  pixPayment,
  pixLoading,
  pixError,
  onCreatePix,
  cardPayment,
  cardLoading,
  cardError,
  onCreateCard,
  cardData,
  setCardData,
}) => {
  const [pixCopied, setPixCopied] = useState(false);

  const pixCode = pixPayment?.copiaColar || pixPayment?.qrcode || "";
  const pixExpiresAt = pixPayment?.expiresAt || "";
  const pixReady = Boolean(pixCode);
  const [pixCountdown, setPixCountdown] = useState("");

  // Para cartão, tentar extrair url de todos os lugares possíveis
  const cardCheckoutUrl = cardPayment?.checkoutUrl || cardPayment?.metadata?.providerRaw?.url || cardPayment?.metadata?.url || cardPayment?.url || "";

  const formatPixExpiresAt = (value) => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleString();
  };

  // pixButtonLabel removido (não utilizado)

  const pixCopyLabel = pixCopied ? "Código copiado" : "Copiar código";

  const pixExpiresLabel = pixExpiresAt
    ? formatPixExpiresAt(pixExpiresAt)
    : "";

  // Atualiza countdown do Pix
  useEffect(() => {
    if (!pixExpiresAt) {
      setPixCountdown("");
      return undefined;
    }
    const expiresAtMs = new Date(pixExpiresAt).getTime();
    if (Number.isNaN(expiresAtMs)) {
      setPixCountdown("");
      return undefined;
    }
    const updateCountdown = () => {
      const remainingMs = expiresAtMs - Date.now();
      if (remainingMs <= 0) {
        setPixCountdown("Expirado");
        return;
      }
      const totalSeconds = Math.ceil(remainingMs / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      setPixCountdown(
        `Expira em ${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      );
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [pixExpiresAt]);

  // Automatizar cópia do Pix ao gerar
  useEffect(() => {
    if (pagamento === "pix" && pixReady && pixCode && navigator?.clipboard) {
      navigator.clipboard.writeText(pixCode).then(() => {
        setPixCopied(true);
        window.setTimeout(() => setPixCopied(false), 2000);
        console.log("[PagamentoStep][pix] Código Pix copiado automaticamente.");
      }).catch(() => {
        setPixCopied(false);
      });
    }
  }, [pagamento, pixReady, pixCode]);

  // Automatizar abertura do checkout do cartão
  useEffect(() => {
    if (pagamento === "cartao" && cardCheckoutUrl && !cardLoading) {
      console.log("[PagamentoStep][card] Abrindo checkout automaticamente:", cardCheckoutUrl);
      window.open(cardCheckoutUrl, "_blank", "noopener,noreferrer");
    }
  }, [pagamento, cardCheckoutUrl, cardLoading]);


  // Remover handlers manuais, tudo é automático agora

  // Campos do cartão (mantido para possível futura UI de cartão direto)
  // handleCardInput removido (não utilizado)

  return (
    <div className="space-y-6">
      <h2 className="font-semibold text-lg">Pagamento e finalização</h2>

      {/* Seleção de método */}
      <div className="grid sm:grid-cols-3 gap-4 text-xs">
        <button
          type="button"
          onClick={() => setPagamento("pix")}
          className={`premium-pill w-full flex items-center gap-2 text-xs justify-center ${
            pagamento === "pix" ? "premium-pill--accent" : ""
          }`}
        >
          <PixIcon className="h-4 w-4" />
          <span>Pix (recomendado)</span>
        </button>

        <button
          type="button"
          onClick={() => setPagamento("cartao")}
          className={`premium-pill w-full flex items-center gap-2 text-xs justify-center ${
            pagamento === "cartao" ? "premium-pill--accent" : ""
          }`}
        >
          <CardIcon className="h-4 w-4" />
          <span>Cartão (Pagar agora)</span>
        </button>

        <button
          type="button"
          onClick={() => setPagamento("dinheiro")}
          className={`premium-pill w-full flex items-center gap-2 text-xs justify-center ${
            pagamento === "dinheiro" ? "premium-pill--accent" : ""
          }`}
        >
          <MoneyIcon className="h-4 w-4" />
          <span>Dinheiro</span>
        </button>
      </div>

      {/* Tag AxionPAY */}
      <div className="flex justify-center mt-2">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-slate-500 text-[11px] font-normal premium-axionpay-tag" style={{ boxShadow: "none" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="12" fill="#fff" />
            <path
              d="M7.5 12l3 3.5 6-7"
              stroke="#06B26B"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>
            Powered by{" "}
            <b className="tracking-wide font-semibold text-slate-600">
              AxionPAY
            </b>
          </span>
        </span>
      </div>

      {/* PIX */}
      {pagamento === "pix" && (
        <div className="premium-card pix-box bg-white border border-slate-200 rounded-2xl p-4 text-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Pix instantâneo
              </p>
              <p className="text-sm text-slate-500">
                O código é gerado automaticamente ao chegar nesta etapa.
              </p>
            </div>
          </div>
          {pixError && (
            <p className="text-[11px] text-amber-700">{pixError}</p>
          )}
          {pixReady && (
            <>
              <div className="space-y-2">
                <label className="text-sm text-slate-500">
                  Código copia e cola
                </label>
                <textarea
                  readOnly
                  className="premium-field pix-box__field w-full text-[12px] min-h-[90px]"
                  value={pixCode}
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="premium-button-ghost px-3 py-2 text-[12px] cursor-default select-none">
                    {pixCopyLabel}
                  </span>
                  {pixExpiresLabel && (
                    <span className="text-[12px] text-slate-500 flex flex-wrap items-center gap-2">
                      <span>Válido até: {pixExpiresLabel}</span>
                      {pixCountdown && (
                        <span className="pix-countdown">{pixCountdown}</span>
                      )}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-slate-500">
                Abra seu banco, escolha Pix copia e cola e cole o código acima.
              </p>
            </>
          )}
          {!pixReady && !pixLoading && !pixError && (
            <p className="text-[11px] text-slate-500">
              Estamos preparando seu Pix. Aguarde alguns segundos.
            </p>
          )}
        </div>
      )}

      {/* CARTÃO */}
      {pagamento === "cartao" && (
        <div className="premium-card bg-white border border-slate-200 rounded-2xl p-4 text-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Cartão de crédito
              </p>
              <p className="text-sm text-slate-500">
                O link para pagamento é gerado automaticamente. O checkout será aberto em nova aba.
              </p>
            </div>
          </div>
          {cardError && (
            <p className="text-[11px] text-amber-700">{cardError}</p>
          )}
          {cardCheckoutUrl && (
            <p className="text-[11px] text-slate-500 break-all">
              Link gerado: {cardCheckoutUrl}
            </p>
          )}
          {cardLoading && (
            <p className="text-[11px] text-slate-500">Preparando checkout...</p>
          )}
        </div>
      )}

      {/* DINHEIRO */}
      {pagamento === "cartao" && (
        <div className="premium-card bg-white border border-slate-200 rounded-2xl p-4 text-xs space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-800 mb-1">Cartão de crédito</p>
              {cardPayment && cardPayment.metadata?.providerRaw?.url ? (
                <a
                  href={cardPayment.metadata.providerRaw.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="premium-button px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition"
                >
                  Abrir checkout AxionPAY
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => onCreateCard && onCreateCard()}
                  disabled={cardLoading}
                  className="premium-button px-4 py-2 text-xs font-semibold bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition disabled:opacity-60"
                >
                  {cardLoading ? "Gerando link..." : "Gerar link de pagamento"}
                </button>
              )}
            </div>
            {cardError && (
              <p className="text-[11px] text-amber-700 mt-2 sm:mt-0">{cardError}</p>
            )}
          </div>

        </div>
      )}

      {/* Resumo do pedido */}
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
