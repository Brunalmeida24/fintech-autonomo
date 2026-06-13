"use client";

import { useState, useEffect } from "react";

type Transacao = {
  id: number;
  valor: number;
  imposto: number;
  liquido: number;
  data: string;
  descricao: string;
};

export default function Home() {
  const [saldoPessoal, setSaldoPessoal] = useState(0);
  const [saldoProfissional, setSaldoProfissional] = useState(0);
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [showEntrada, setShowEntrada] = useState(false);
  const [showNota, setShowNota] = useState(false);
  const [showSucesso, setShowSucesso] = useState(false);
  const [valorInput, setValorInput] = useState("");
  const [descricaoInput, setDescricaoInput] = useState("");
  const [ultimaTransacao, setUltimaTransacao] = useState<Transacao | null>(null);
  const [notaGerada, setNotaGerada] = useState<Transacao | null>(null);

  const ALIQUOTA_IMPOSTO = 0.06; // 6% (estilo MEI/Simples)
  const PERCENTUAL_PROFISSIONAL = 0.7; // 70% reservado pro negócio
  const PERCENTUAL_PESSOAL = 0.3; // 30% livre

  useEffect(() => {
    const dados = localStorage.getItem("finautonomo_dados");
    if (dados) {
      const parsed = JSON.parse(dados);
      setSaldoPessoal(parsed.saldoPessoal || 0);
      setSaldoProfissional(parsed.saldoProfissional || 0);
      setTransacoes(parsed.transacoes || []);
    }
  }, []);

  const salvarDados = (
    novoPessoal: number,
    novoProfissional: number,
    novasTransacoes: Transacao[]
  ) => {
    localStorage.setItem(
      "finautonomo_dados",
      JSON.stringify({
        saldoPessoal: novoPessoal,
        saldoProfissional: novoProfissional,
        transacoes: novasTransacoes,
      })
    );
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const confirmarEntrada = () => {
    const valor = parseFloat(valorInput.replace(",", "."));
    if (!valor || valor <= 0) return;

    const imposto = valor * ALIQUOTA_IMPOSTO;
    const liquido = valor - imposto;
    const paraProfissional = liquido * PERCENTUAL_PROFISSIONAL;
    const paraPessoal = liquido * PERCENTUAL_PESSOAL;

    const novoPessoal = saldoPessoal + paraPessoal;
    const novoProfissional = saldoProfissional + paraProfissional;

    const novaTransacao: Transacao = {
      id: Date.now(),
      valor,
      imposto,
      liquido,
      data: new Date().toLocaleString("pt-BR"),
      descricao: descricaoInput || "Recebimento de freela",
    };

    const novasTransacoes = [novaTransacao, ...transacoes].slice(0, 10);

    setSaldoPessoal(novoPessoal);
    setSaldoProfissional(novoProfissional);
    setTransacoes(novasTransacoes);
    salvarDados(novoPessoal, novoProfissional, novasTransacoes);
    setUltimaTransacao(novaTransacao);

    setShowEntrada(false);
    setValorInput("");
    setDescricaoInput("");
    setShowSucesso(true);

    setTimeout(() => setShowSucesso(false), 2500);
  };

  const abrirNota = () => {
    if (!ultimaTransacao && transacoes.length === 0) {
      setUltimaTransacao({
        id: Date.now(),
        valor: 200,
        imposto: 12,
        liquido: 188,
        data: new Date().toLocaleString("pt-BR"),
        descricao: "Serviço prestado",
      });
      setNotaGerada({
        id: Date.now(),
        valor: 200,
        imposto: 12,
        liquido: 188,
        data: new Date().toLocaleString("pt-BR"),
        descricao: "Serviço prestado",
      });
    } else {
      setNotaGerada(ultimaTransacao || transacoes[0]);
    }
    setShowNota(true);
  };

  const saldoTotal = saldoPessoal + saldoProfissional;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] to-[#13131f] text-white pb-24">
      {/* Header */}
      <header className="px-6 pt-8 pb-4">
        <p className="text-sm text-gray-400">Olá, Autônomo 👋</p>
        <h1 className="text-2xl font-bold mt-1">Minha Carteira</h1>
      </header>

      {/* Saldo Total */}
      <div className="px-6 mb-6">
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-6 shadow-2xl shadow-purple-900/40">
          <p className="text-white/70 text-sm mb-1">Saldo Total</p>
          <p className="text-4xl font-bold tracking-tight">
            {formatarMoeda(saldoTotal)}
          </p>
        </div>
      </div>

      {/* Saldos Separados */}
      <div className="px-6 grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
            <p className="text-xs text-gray-400">Pessoal</p>
          </div>
          <p className="text-xl font-bold text-emerald-400">
            {formatarMoeda(saldoPessoal)}
          </p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            <p className="text-xs text-gray-400">Profissional</p>
          </div>
          <p className="text-xl font-bold text-blue-400">
            {formatarMoeda(saldoProfissional)}
          </p>
        </div>
      </div>

      {/* Ações */}
      <div className="px-6 grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => setShowEntrada(true)}
          className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all rounded-2xl py-4 px-4 flex flex-col items-center gap-2 shadow-lg shadow-emerald-900/30"
        >
          <span className="text-2xl">💰</span>
          <span className="text-sm font-semibold">Recebi um Pagamento</span>
        </button>
        <button
          onClick={abrirNota}
          className="bg-white/10 hover:bg-white/20 active:scale-95 transition-all rounded-2xl py-4 px-4 flex flex-col items-center gap-2 border border-white/10"
        >
          <span className="text-2xl">🧾</span>
          <span className="text-sm font-semibold">Emitir Nota</span>
        </button>
      </div>

      {/* Histórico */}
      <div className="px-6">
        <h2 className="text-sm font-semibold text-gray-400 mb-3">
          Últimas movimentações
        </h2>
        {transacoes.length === 0 ? (
          <div className="bg-white/5 rounded-2xl p-6 text-center border border-white/10">
            <p className="text-gray-500 text-sm">
              Nenhuma movimentação ainda.
              <br />
              Toque em &quot;Recebi um Pagamento&quot; para simular.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {transacoes.map((t) => (
              <div
                key={t.id}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-sm">{t.descricao}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t.data}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-400">
                    +{formatarMoeda(t.valor)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Imposto: {formatarMoeda(t.imposto)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: Simular Entrada */}
      {showEntrada && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end z-50">
          <div className="bg-[#13131f] border-t border-white/10 rounded-t-3xl w-full p-6 animate-slideUp">
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6"></div>
            <h2 className="text-xl font-bold mb-1">Simular Recebimento</h2>
            <p className="text-sm text-gray-400 mb-6">
              Digite o valor que você recebeu por um serviço, corrida ou freela.
            </p>

            <label className="text-xs text-gray-400 mb-1 block">Valor recebido</label>
            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                R$
              </span>
              <input
                type="number"
                inputMode="decimal"
                placeholder="200,00"
                value={valorInput}
                onChange={(e) => setValorInput(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-lg font-semibold focus:outline-none focus:border-emerald-400"
                autoFocus
              />
            </div>

            <label className="text-xs text-gray-400 mb-1 block">
              Descrição (opcional)
            </label>
            <input
              type="text"
              placeholder="Ex: Corrida de app, Design de logo..."
              value={descricaoInput}
              onChange={(e) => setDescricaoInput(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-4 mb-6 focus:outline-none focus:border-emerald-400"
            />

            {valorInput && parseFloat(valorInput.replace(",", ".")) > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 space-y-2 animate-scaleIn">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Valor bruto</span>
                  <span>{formatarMoeda(parseFloat(valorInput.replace(",", ".")))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Imposto estimado (6%)</span>
                  <span className="text-red-400">
                    - {formatarMoeda(parseFloat(valorInput.replace(",", ".")) * ALIQUOTA_IMPOSTO)}
                  </span>
                </div>
                <div className="h-px bg-white/10"></div>
                <div className="flex justify-between text-sm font-bold">
                  <span>Líquido disponível</span>
                  <span className="text-emerald-400">
                    {formatarMoeda(
                      parseFloat(valorInput.replace(",", ".")) * (1 - ALIQUOTA_IMPOSTO)
                    )}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowEntrada(false)}
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-4 font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEntrada}
                disabled={!valorInput || parseFloat(valorInput.replace(",", ".")) <= 0}
                className="flex-1 bg-emerald-500 disabled:bg-emerald-500/30 disabled:cursor-not-allowed rounded-2xl py-4 font-semibold"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Nota Fiscal */}
      {showNota && notaGerada && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-6">
          <div className="bg-white text-gray-900 rounded-2xl w-full max-w-sm p-6 animate-scaleIn shadow-2xl">
            <div className="text-center border-b border-dashed border-gray-300 pb-4 mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl mx-auto mb-2 flex items-center justify-center text-white text-xl font-bold">
                NF
              </div>
              <h3 className="font-bold text-lg">Nota Fiscal de Serviço</h3>
              <p className="text-xs text-gray-500">Eletrônica (NFS-e) — Simulação</p>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Número</span>
                <span className="font-mono">
                  #{String(notaGerada.id).slice(-6)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Data emissão</span>
                <span>{notaGerada.data}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Descrição</span>
                <span className="text-right max-w-[60%]">{notaGerada.descricao}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-300 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Valor do serviço</span>
                <span>{formatarMoeda(notaGerada.valor)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">ISS / Imposto (6%)</span>
                <span>{formatarMoeda(notaGerada.imposto)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200">
                <span>Valor líquido</span>
                <span>{formatarMoeda(notaGerada.liquido)}</span>
              </div>
            </div>

            <button
              onClick={() => setShowNota(false)}
              className="w-full bg-gray-900 text-white rounded-2xl py-4 font-semibold mt-6"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Toast de Sucesso */}
      {showSucesso && (
        <div className="fixed top-6 left-6 right-6 z-50 animate-slideUp">
          <div className="bg-emerald-500 rounded-2xl p-4 flex items-center gap-3 shadow-xl shadow-emerald-900/40">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center animate-checkmark">
              <span className="text-emerald-500 font-bold">✓</span>
            </div>
            <div>
              <p className="font-bold text-sm">Pagamento recebido!</p>
              <p className="text-xs text-white/80">
                Saldo dividido automaticamente entre Pessoal e Profissional.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}