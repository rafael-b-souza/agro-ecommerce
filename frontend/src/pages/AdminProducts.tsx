import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export interface Product {
  id: string;
  name: string;
  price_cents: number;
  image_url?: string | null;
  stock_qty?: number;
  is_active?: boolean;
}

const token   = localStorage.getItem("token") ?? "";

const headers = { Authorization: `Bearer ${token}` };

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState(""); // "9.90"
  const [imageUrl, setImageUrl] = useState("");
  const [stockQty, setStockQty] = useState("");
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setEditing(null);
    setName("");
    setPrice("");
    setImageUrl("");
    setStockQty("");
    setIsActive(true);
  };

  const fmtPrice = (cents: number) =>
    (cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  async function fetchProducts() {
    try {
      const res = await fetch("/api/admin/products?page=1&limit=100", {
        headers,
      });
      if (!res.ok) throw await res.json();

      const payload = await res.json();
      const list: Product[] = Array.isArray(payload)
        ? payload
        : payload.data ?? payload.rows ?? [];

      setProducts(list);
    } catch (err: any) {
      toast.error(err?.error ?? "Falha ao buscar produtos");
    } finally {
      setLoading(false);
    }
  }

  async function saveProduct() {
    if (!name.trim() || !price.trim()) {
      toast.error("Nome e preço são obrigatórios");
      return;
    }
    const priceNumber = Number(price.replace(",", "."));
    if (Number.isNaN(priceNumber) || priceNumber < 0) {
      toast.error("Preço inválido");
      return;
    }

    const body = JSON.stringify({
      name,
      price: priceNumber,
      imageUrl: imageUrl || null,
      stockQty: stockQty ? Number(stockQty) : 0,
      isActive,
    });

    try {
      let res: Response;

      if (editing) {
        res = await fetch(`/api/admin/products/${editing.id}`, {
          method: "PUT",
          headers,
          body,
        });
      } else {
        res = await fetch("/api/admin/products", {
          method: "POST",
          headers,
          body,
        });
      }

      if (!res.ok) throw await res.json();

      toast.success(editing ? "Produto atualizado!" : "Produto criado!");
      resetForm();
      fetchProducts();
    } catch (err: any) {
      toast.error(err?.error ?? "Erro ao salvar produto");
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm("Remover este produto?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: headers.Authorization },
      });
      if (!res.ok) throw await res.json();

      toast.success("Produto removido");
      setProducts((cur) => cur.filter((p) => p.id !== id));
    } catch (err: any) {
      toast.error(err?.error ?? "Erro ao remover produto");
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin • Produtos</h1>

      {/* formulário */}
      <div className="border p-4 rounded mb-8 space-y-3">
        <h2 className="font-semibold">
          {editing ? "Editar produto" : "Novo produto"}
        </h2>

        <input
          className="w-full p-2 border rounded"
          placeholder="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full p-2 border rounded"
          placeholder="Preço (ex.: 9.90)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          className="w-full p-2 border rounded"
          placeholder="URL da imagem"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />

        <input
          className="w-full p-2 border rounded"
          placeholder="Estoque"
          value={stockQty}
          onChange={(e) => setStockQty(e.target.value)}
        />

        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Ativo
        </label>

        <div className="flex gap-2">
          <button
            onClick={saveProduct}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            {editing ? "Atualizar" : "Criar"}
          </button>

          {editing && (
            <button
              onClick={resetForm}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500 animate-pulse">Carregando…</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500">Nenhum produto cadastrado.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Nome</th>
                <th className="p-2 text-left">Preço</th>
                <th className="p-2 text-left">Estoque</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-2">{p.name}</td>
                  <td className="p-2">{fmtPrice(p.price_cents)}</td>
                  <td className="p-2">{p.stock_qty ?? 0}</td>
                  <td className="p-2">
                    {p.is_active ? (
                      <span className="text-green-600">Ativo</span>
                    ) : (
                      <span className="text-red-600">Inativo</span>
                    )}
                  </td>
                  <td className="p-2 flex gap-2">
                    <button
                      onClick={() => {
                        setEditing(p);
                        setName(p.name);
                        setPrice((p.price_cents / 100).toString());
                        setImageUrl(p.image_url ?? "");
                        setStockQty(String(p.stock_qty ?? 0));
                        setIsActive(Boolean(p.is_active));
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => deleteProduct(p.id)}
                      className="text-red-600 hover:underline"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
