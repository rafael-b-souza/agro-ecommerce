import { useCart } from "../contexts/CartContext";

interface Product {
  id: string;
  name: string;
  image_url: string | null;
  price_cents: number;
}

export default function ProductCard({ product }: { product: Product }) {

  const { add } = useCart();
  
  const handleAdd = () => {
    add({
      id: product.id,
      name: product.name,
      price_cents: product.price_cents,
      image_url: product.image_url,
      quantity: 1,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
      <img
        src={product.image_url ?? "https://via.placeholder.com/300x200?text=Imagem"}
        alt={product.name}
        className="h-40 w-full object-cover"
      />
      <div className="p-3 flex-1 flex flex-col justify-between">
        <h3 className="text-sm font-medium mb-2 line-clamp-2">{product.name}</h3>
        <div className="mt-auto flex items-center justify-between">
          <span className="font-semibold text-emerald-700">
            R$ {(product.price_cents / 100).toFixed(2)}
          </span>
          <button
            onClick={handleAdd}
            className="px-3 py-1 text-xs bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
