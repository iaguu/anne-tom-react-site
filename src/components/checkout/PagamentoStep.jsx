// src/components/checkout/PagamentoStep.jsx
import React, { useEffect, useState } from "react";

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
}) => {
  const [pixCopied, setPixCopied] = useState(false);
  const pixCode = pixPayment?.copiaColar || pixPayment?.qrcode || "";
  const pixExpiresAt = pixPayment?.expiresAt || "";
  const pixReady = Boolean(pixCode);
  const [pixCountdown, setPixCountdown] = useState("");

  const formatPixExpiresAt = (value) => {
    if (!value) return "";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleString();
  };

  const pixButtonLabel = pixReady
    ? "Pix gerado"
    : pixLoading
    ? "Gerando Pix..."
    : "Gerar Pix";
  const pixCopyLabel = pixCopied ? "Codigo copiado" : "Copiar codigo";
  const pixExpiresLabel = pixExpiresAt
    ? formatPixExpiresAt(pixExpiresAt)
    : "";

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
        `Expira em ${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
          2,
          "0"
        )}`
      );
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [pixExpiresAt]);

  const handleCopyPix = async () => {
    if (!pixCode || !navigator?.clipboard) return;
    try {
      await navigator.clipboard.writeText(pixCode);
      setPixCopied(true);
      window.setTimeout(() => setPixCopied(false), 2000);
    } catch (_err) {
      setPixCopied(false);
    }
  };
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
              pagamento === tipo ? "premium-pill--accent" : ""
            }`}
          >
            {tipo === "pix" && "Pix (recomendado)"}
            {tipo === "cartao" && "Cartão (maquininha na entrega)"}
            {tipo === "dinheiro" && "Dinheiro"}
          </button>
        ))}
      </div>

      {pagamento === "pix" && (
        <div className="premium-card pix-box bg-white border border-slate-200 rounded-2xl p-4 text-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Pix instantaneo
              </p>
              <p className="text-sm text-slate-500">
                Gere o codigo para pagar direto no seu banco.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onCreatePix && onCreatePix()}
              disabled={pixLoading || pixReady}
              className="premium-button-ghost px-4 py-2 text-[11px] disabled:opacity-60"
            >
              {pixButtonLabel}
            </button>
          </div>

          {pixError && (
            <p className="text-[11px] text-amber-700">{pixError}</p>
          )}

          {pixReady && (
            <>
              <div className="space-y-2">
                <label className="text-sm text-slate-500">
                  Codigo copia e cola
                </label>
                <textarea
                  readOnly
                  className="premium-field pix-box__field w-full text-[12px] min-h-[90px]"
                  value={pixCode}
                />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleCopyPix}
                    className="premium-button-ghost px-3 py-2 text-[12px]"
                  >
                    {pixCopyLabel}
                  </button>
                  {pixExpiresLabel && (
                    <span className="text-[12px] text-slate-500 flex flex-wrap items-center gap-2">
                      <span>Valido ate: {pixExpiresLabel}</span>
                      {pixCountdown && (
                        <span className="pix-countdown">
                          {pixCountdown}
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-slate-500">
                Abra seu banco, escolha Pix copia e cola e cole o codigo acima.
              </p>
            </>
          )}
        </div>
      )}

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
