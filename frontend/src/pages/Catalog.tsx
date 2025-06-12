import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import toast from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  image_url: string | null;
  price_cents: number;
}

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/categories"); // Assumindo proxy já configurado
        if (!res.ok) throw new Error("Falha ao buscar categorias");
        const json = await res.json();
        setCategories(json.data ?? json);
      } catch (e) {
        toast.error("Erro ao carregar categorias");
      }
    })();
  }, []);
  

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(
          selectedCategory
            ? `/api/products?category=${selectedCategory}`
            : "/api/products"
        );
        if (!res.ok) throw new Error("Falha ao buscar produtos");
        const json = await res.json();
        setProducts(json.data ?? json);
      } catch (e) {
        toast.error((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedCategory]);
  

  if (loading) return <p className="text-center">Carregando…</p>;

  return (
    <section className="max-w-screen-lg mx-auto p-4">
      {/* Título fora da grid */}
      <h1 className="text-2xl font-bold mb-6">Catálogo</h1>
  
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="mb-4 px-3 py-2 border rounded col-span-full"
        >
          <option value="">Todas as categorias</option>
          {categories.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
  
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
  
        {products.length === 0 && (
          <p className="col-span-full text-center text-sm text-gray-500">
            Nenhum produto encontrado.
          </p>
        )}
      </div>
    </section>
  );  
}
