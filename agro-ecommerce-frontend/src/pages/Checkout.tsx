import { useState } from "react";
import { useCart } from "../contexts/CartContext";
import { toast } from "react-hot-toast";
import { IMaskInput } from 'react-imask';

export default function Checkout() {
  const { state, clear } = useCart();
  const items = state.items;
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState("");
  const [card, setCard] = useState("");
  const [exp, setExp] = useState("");
  const [cvv, setCvv] = useState("");

  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  const token = localStorage.getItem("token");
  const total = items.reduce((sum, item) => sum + item.price_cents * item.quantity, 0);
  const frete = total * 0.1;
  const totalFinal = total + frete;

  const handleBuscarCep = async () => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (data.erro) {
        toast.error("CEP não encontrado.");
      } else {
        setRua(data.logradouro || "");
        setBairro(data.bairro || "");
        setCidade(data.localidade || "");
        setEstado(data.uf || "");
      }
    } catch {
      toast.error("Erro ao buscar CEP.");
    }
  };

  const handleCheckout = async () => {
    setShowModal(false);
    if (!name || !card || !exp || !cvv || !cep || !rua || !numero || !bairro || !cidade || !estado) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          endereco: { cep, rua, numero, complemento, bairro, cidade, estado },
        }),
      });

      const data = await res.json();
      toast.success(`Pedido realizado com sucesso! ID: ${data.orderId}`);
      clear();
    } catch {
      toast.error("Erro ao finalizar pedido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto relative">
      <div className="bg-green-50 border border-green-600 text-green-800 px-4 py-2 mb-4 rounded text-sm flex items-center gap-2">
        <span>🔒</span> Checkout seguro. Seus dados estão protegidos.
      </div>

      <h1 className="text-2xl font-bold mb-6 text-center">Pagamento</h1>

      <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
        <input
          placeholder="Nome no cartão"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="block p-3 border rounded w-full"
        />
        <IMaskInput
          mask="9999 9999 9999 9999"
          placeholder="Número do cartão"
          value={card}
          onChange={(value: any) => setCard(value)}
          className="block p-3 border rounded w-full"
        />
        <div className="flex space-x-4">
          <IMaskInput
            mask="99/99"
            placeholder="Validade (MM/AA)"
            value={exp}
            onChange={(value: any) => setExp(value)}
            className="p-3 border rounded w-1/2"
          />
          <IMaskInput
            mask="999"
            placeholder="CVV"
            value={cvv}
            onChange={(value: any) => setCvv(value)}
            className="p-3 border rounded w-1/2"
          />
        </div>

        <hr className="my-4" />
        <IMaskInput
          mask="00000-000"
          value={cep}
          onAccept={(value: any) => setCep(value)}
          onBlur={handleBuscarCep}   
          placeholder="CEP"
          className="block p-3 border rounded w-full"
        />
        <input
          placeholder="Rua"
          value={rua}
          onChange={(e) => setRua(e.target.value)}
          className="block p-3 border rounded w-full"
        />
        <div className="flex space-x-4">
          <input
            placeholder="Número"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            className="p-3 border rounded w-1/2"
          />
          <input
            placeholder="Complemento"
            value={complemento}
            onChange={(e) => setComplemento(e.target.value)}
            className="p-3 border rounded w-1/2"
          />
        </div>
        <input
          placeholder="Bairro"
          value={bairro}
          onChange={(e) => setBairro(e.target.value)}
          className="block p-3 border rounded w-full"
        />
        <div className="flex space-x-4">
          <input
            placeholder="Cidade"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
            className="p-3 border rounded w-2/3"
          />
          <input
            placeholder="UF"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="p-3 border rounded w-1/3"
          />
        </div>

        <hr className="my-4" />
        <div className="text-sm text-gray-700">
          <p>Subtotal: <span className="font-medium">R$ {(total / 100).toFixed(2)}</span></p>
          <p>Frete: <span className="font-medium">R$ {(frete / 100).toFixed(2)}</span></p>
          <p className="font-bold text-lg mt-2">Total: R$ {(totalFinal / 100).toFixed(2)}</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 transition text-white py-3 rounded font-semibold text-lg"
        >
          {loading ? "Processando..." : "Finalizar pagamento"}
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full space-y-4 shadow-lg">
            <h2 className="text-xl font-semibold">Confirmar Pedido</h2>
            <p className="text-sm text-gray-700">
              <strong>Entrega:</strong> {rua}, {numero} {complemento && `- ${complemento}`}, {bairro}, {cidade} - {estado} ({cep})
            </p>
            <p className="text-sm text-gray-700">
              <strong>Total:</strong> R$ {(totalFinal / 100).toFixed(2)}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded border"
              >
                Cancelar
              </button>
              <button
                onClick={handleCheckout}
                className="px-4 py-2 rounded bg-green-600 text-white"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
