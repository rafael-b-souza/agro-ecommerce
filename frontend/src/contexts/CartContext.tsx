import React, { createContext, useContext, useReducer, useEffect } from "react";
import toast from "react-hot-toast";

export interface CartItem {
  id: string;
  name: string;
  price_cents: number;
  image_url?: string | null;
  quantity: number;
}

interface State {
  items: CartItem[];
}

const initialState: State = { items: [] };

type Action =
  | { type: "ADD"; payload: CartItem }
  | { type: "REMOVE"; payload: { id: string } }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; payload: CartItem[] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD": {
      const exists = state.items.find((i) => i.id === action.payload.id);
      if (exists) {
        return {
          items: state.items.map((i) =>
            i.id === action.payload.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { items: [...state.items, action.payload] };
    }
    case "REMOVE":
      return { items: state.items.filter((i) => i.id !== action.payload.id) };
    case "CLEAR":
      return { items: [] };
    case "HYDRATE":
      return { items: Array.isArray(action.payload) ? action.payload : [] };
    default:
      return state;
  }
}

const CartContext = createContext<{
  state: State;
  add: (item: CartItem) => void;
  remove: (id: string) => void;
  clear: () => void;
}>({
  state: initialState,
  add: () => {},
  remove: () => {},
  clear: () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("/api/cart", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((items: CartItem[]) => {
        dispatch({ type: "HYDRATE", payload: items });
      })
      .catch(() => {
        toast.error("Erro ao carregar carrinho");
      });
  }, []);

  function add(item: CartItem) {
    dispatch({ type: "ADD", payload: item });

    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: item.id,
          quantity: 1,
        }),
      }).catch(() => toast.error("Erro ao adicionar item"));
    }
  }

  function remove(id: string) {
    dispatch({ type: "REMOVE", payload: { id } });

    const token = localStorage.getItem("token");
    if (token) {
      fetch(`/api/cart/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => toast.error("Erro ao remover item do carrinho"));
    }
  }

  function clear() {
    dispatch({ type: "CLEAR" });

    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/cart", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => toast.error("Erro ao limpar carrinho"));
    }
  }

  return (
    <CartContext.Provider value={{ state, add, remove, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
