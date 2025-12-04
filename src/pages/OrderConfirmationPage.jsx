// src/pages/OrderConfirmationPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const formatCurrencyBRL = (value) =>
  Number(value || 0).toFixed(2).replace(".", ",");

const OrderConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [resumo, setResumo] = useState(null);

  useEffect(() => {
    // 1) Tenta via state (navegação direta do checkout)
    if (location.state?.orderSummary) {
      setResumo(location.state.orderSummary);
      try {
        localStorage.setItem(
          "lastOrderSummary",
          JSON.stringify(location.state.orderSummary)
        );
      } catch {
        // ignora erros de storage
      }
      return;
    }

    // 2) Fallback via localStorage (reload / volta)
    try {
      const salvo = localStorage.getItem("lastOrderSummary");
      if (salvo) {
        setResumo(JSON.parse(salvo));
      }
    } catch {
      // ignora
    }
  }, [location.state]);

  const semResumo = !resumo || !resumo.items || !resumo.items.length;

  const totalItens = semResumo
    ? 0
    : resumo.items.reduce((acc, item) => acc + Number(item.quantidade || 0), 0);

  // Se a API/checkout mandar algum identificador, a gente exibe
  const codigoPedido =
    resumo?.codigoPedido ||
    resumo?.idPedido ||
    resumo?.numeroPedido ||
    null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900 flex flex-col">
      {/* HEADER */}
      <header className="border-b bg-white/90 backdrop-blur">
        <div className="max-w-6xl mx-auto h-16 px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center">
              A&amp;T
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold">Anne &amp; Tom Pizzaria</p>
              <p className="text-[11px] text-slate-500">
                Zona Norte • São Paulo
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => navigate("/cardapio")}
            className="text-[11px] border rounded-full px-4 py-1.5 bg-white hover:bg-slate-50"
          >
            Montar um novo pedido →
          </button>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl">
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-8 space-y-6">
            {/* ÍCONE / TÍTULO */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 via-emerald-200 to-emerald-300 text-emerald-700 flex items-center justify-center text-lg shadow-inner">
                ✓
              </div>
              <div className="space-y-1">
                <h1 className="text-xl font-semibold">
                  Pedido enviado com sucesso!
                </h1>
                <p className="text-xs text-slate-500">
                  Recebemos o seu pedido e ele já foi encaminhado para o sistema
                  interno da Anne &amp; Tom. Agora é com a cozinha. 🍕
                </p>
                {codigoPedido && (
                  <p className="text-[11px] text-slate-500 mt-1">
                    <span className="font-semibold text-slate-700">
                      Número do pedido:&nbsp;
                    </span>
                    {codigoPedido}
                  </p>
                )}
              </div>
            </div>

            {/* STATUS / PRAZO */}
            <div className="bg-slate-50 rounded-2xl px-4 py-3 text-xs flex flex-col gap-1 border border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Status inicial</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-100 text-[10px] font-semibold text-emerald-700">
                  Em preparação
                </span>
              </div>
              <p className="flex justify-between">
                <span className="text-slate-500">Previsão de entrega</span>
                <span className="font-semibold text-slate-800">
                  35 a 55 minutos
                </span>
              </p>
              {resumo?.dados?.bairro && (
                <p className="flex justify-between">
                  <span className="text-slate-500">Bairro</span>
                  <span className="font-semibold text-slate-800">
                    {resumo.dados.bairro}
                  </span>
                </p>
              )}
            </div>

            {/* RESUMO DO PEDIDO */}
            {!semResumo ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-semibold text-slate-800">
                    Resumo do pedido
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {totalItens} item(s)
                  </p>
                </div>

                <div className="border border-slate-100 rounded-2xl divide-y divide-slate-100 text-xs">
                  {resumo.items.map((item, idx) => (
                    <div
                      key={`${item.id}-${idx}`}
                      className="px-4 py-3 flex justify-between gap-3"
                    >
                      <div>
                        <p className="font-semibold">
                          {item.quantidade}x {item.nome}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {item.tamanho}
                          {item.meio && ` · meio a meio com ${item.meio}`}
                          {item.obsPizza && ` · ${item.obsPizza}`}
                        </p>
                      </div>
                      <p className="text-slate-700 font-medium whitespace-nowrap">
                        R{"$ "}
                        {formatCurrencyBRL(
                          (item.precoUnitario || 0) *
                            (item.quantidade || 0)
                        )}
                      </p>
                    </div>
                  ))}
                </div>

                {/* TOTAIS */}
                <div className="pt-1 space-y-1 text-xs">
                  <p className="flex justify-between">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-medium">
                      R$ {formatCurrencyBRL(resumo.subtotal || 0)}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500">Entrega</span>
                    <span className="font-medium">
                      R$ {formatCurrencyBRL(resumo.taxaEntrega || 0)}
                    </span>
                  </p>
                  {Number(resumo.desconto || 0) > 0 && (
                    <p className="flex justify-between text-emerald-600">
                      <span>Desconto</span>
                      <span>
                        - R$ {formatCurrencyBRL(resumo.desconto || 0)}
                      </span>
                    </p>
                  )}
                  <p className="flex justify-between pt-1 text-sm font-semibold">
                    <span>Total</span>
                    <span>
                      R$ {formatCurrencyBRL(resumo.totalFinal || 0)}
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-[11px] text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700">
                  Não encontramos o resumo do pedido.
                </p>
                <p>
                  Isso pode acontecer se você recarregou a página ou acessou
                  este link diretamente. Seu pedido provavelmente foi enviado,
                  mas o resumo não pôde ser reconstituído aqui.
                </p>
                <p>
                  Se tiver dúvida, fale com a Anne pelo WhatsApp ou volte ao
                  cardápio para montar um novo pedido.
                </p>
              </div>
            )}

            {/* DADOS DO CLIENTe */}
            {resumo?.dados && (
              <div className="border-t border-slate-100 pt-4 text-[11px] space-y-1">
                <p className="text-slate-500 font-semibold text-xs">
                  Dados do cliente
                </p>
                {resumo.dados.nome && (
                  <p>
                    <span className="text-slate-500">Nome: </span>
                    <span className="font-medium">
                      {resumo.dados.nome}
                    </span>
                  </p>
                )}
                {resumo.dados.telefone && (
                  <p>
                    <span className="text-slate-500">WhatsApp: </span>
                    <span className="font-medium">
                      {resumo.dados.telefone}
                    </span>
                  </p>
                )}
                {resumo.dados.endereco && (
                  <p>
                    <span className="text-slate-500">Endereço: </span>
                    <span className="font-medium">
                      {resumo.dados.endereco}
                    </span>
                  </p>
                )}
                {resumo.dados.obsGerais && (
                  <p>
                    <span className="text-slate-500">Observações: </span>
                    <span className="font-medium">
                      {resumo.dados.obsGerais}
                    </span>
                  </p>
                )}
              </div>
            )}

            {/* AÇÕES FINAIS */}
            <div className="pt-2 flex flex-col sm:flex-row justify-between gap-3 text-xs">
              <Link
                to="/cardapio"
                className="inline-flex items-center justify-center px-4 py-2 rounded-full border border-slate-300 bg-white hover:bg-slate-50"
              >
                Voltar ao cardápio
              </Link>

              <button
                type="button"
                onClick={() =>
                  window.open("https://wa.me/5511932507007", "_blank")
                }
                className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:brightness-110"
              >
                Acompanhar pelo WhatsApp
              </button>
            </div>
          </div>

          {/* Mensagem extra embaixo */}
          <p className="mt-4 text-[11px] text-center text-slate-500">
            Se precisar ajustar algo no pedido, envie uma mensagem pelo WhatsApp
            o quanto antes. A equipe da Anne &amp; Tom te ajuda rapidinho.
          </p>
        </div>
      </main>
    </div>
  );
};

export default OrderConfirmationPage;
