import { Link, NavLink } from "react-router-dom";
import { Menu } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();    
  return (
    <header className="bg-green-700 text-white shadow-md">
      <div className="mx-auto max-w-5xl flex items-center justify-between p-4">
        <Link to="/" className="font-semibold text-lg">
          Agro<span className="font-light">Shop</span>
        </Link>
        <button
          aria-label="Abrir menu"
          className="md:hidden"
          onClick={() => setOpen((o) => !o)}
        >
          <Menu />
        </button>
        <nav
          className={`${
            open ? "block" : "hidden"
          } md:block absolute md:static inset-x-0 top-full bg-green-700 md:bg-transparent p-4 md:p-0`}
        >
          <ul className="flex flex-col md:flex-row gap-4 md:gap-6">
            <li>
              <Link to="/" onClick={() => setOpen(false)}>
                Início
              </Link>
            </li>
            <li>
              <Link to="/catalog" onClick={() => setOpen(false)}>
                Catálogo
              </Link>
            </li>
            <li>
              <Link to="/cart" onClick={() => setOpen(false)}>
                Carrinho
              </Link>
            </li>
            <li>
              <Link to="/login" onClick={() => setOpen(false)}>
                Login
              </Link>
            </li>
            <li>
              <Link to="/about" onClick={() => setOpen(false)}>
                Sobre
              </Link>
            </li>
            <li>
              {user?.role === "admin" && (
                <NavLink to="/admin/products" className="font-semibold text-green-600">
                  Admin
                </NavLink>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
