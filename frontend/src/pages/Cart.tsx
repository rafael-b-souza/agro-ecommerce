import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";

export default function Cart() {
  const { state, remove, clear } = useCart();
  const navigate = useNavigate();

  const items = state.items;
  const subtotal = items.reduce(
    (acc, item) => acc + item.price_cents * item.quantity,
    0
  );
  const shipping = Math.round(subtotal * 0.1); // frete 10%
  const total = subtotal + shipping;

  return (
    <section className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Seu Carrinho</h1>

      {items.length === 0 ? (
        <p className="text-center">
          Seu carrinho está vazio.{" "}
          <Link to="/catalog" className="text-green-600 underline">
            Ver produtos
          </Link>
        </p>
      ) : (
        <>
          <div className="grid gap-4 justify-items-center grid-cols-1 sm:grid-cols-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col items-center border rounded-lg p-4 shadow w-full max-w-xs"
              >
                <img
                  src={
                    item.image_url ??
                    "https://via.placeholder.com/150x150?text=Produto"
                  }
                  alt={item.name}
                  className="w-32 h-32 object-cover rounded mb-2"
                />
                <p className="font-semibold text-center">{item.name}</p>
                <p className="text-sm text-gray-600">
                  Quantidade: {item.quantity}
                </p>
                <p className="font-medium mt-1">
                  R$ {((item.price_cents * item.quantity) / 100).toFixed(2)}
                </p>
                <button
                  onClick={() => remove(item.id)}
                  className="text-red-500 text-sm mt-2 hover:underline"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t pt-4 text-right">
            <p>Subtotal: R$ {(subtotal / 100).toFixed(2)}</p>
            <p>Frete (10%): R$ {(shipping / 100).toFixed(2)}</p>
            <p className="text-xl font-bold">Total: R$ {(total / 100).toFixed(2)}</p>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row justify-end gap-2">
            <button
              onClick={clear}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Limpar Carrinho
            </button>
            <button
              onClick={() => navigate("/checkout")}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Finalizar Pedido
            </button>
          </div>
        </>
      )}
    </section>
  );
}
