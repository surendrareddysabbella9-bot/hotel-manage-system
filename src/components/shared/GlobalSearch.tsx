import { useState, useEffect, useRef } from "react";
import { Search, Loader2, Utensils, Receipt, Armchair } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import { ROUTES } from "@/constants";

interface GlobalSearchProps {
  className?: string;
}

export function GlobalSearch({ className }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ orders: any[], menuItems: any[], tables: any[] }>({ orders: [], menuItems: [], tables: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults({ orders: [], menuItems: [], tables: [] });
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await apiFetch(`/search?q=${encodeURIComponent(query)}`);
        setResults(res);
        setShowDropdown(true);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const hasResults = results.orders.length > 0 || results.menuItems.length > 0 || results.tables.length > 0;

  return (
    <div ref={wrapperRef} className={cn("relative w-full max-w-md", className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => {
          if (query.trim().length >= 2) setShowDropdown(true);
        }}
        placeholder="Search orders, menu, tables…"
        className="pl-9 bg-background/50 backdrop-blur-sm"
        aria-label="Global Search"
      />

      {showDropdown && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-2xl z-50 overflow-hidden flex flex-col max-h-[70vh]">
          {isSearching ? (
            <div className="p-4 text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="size-4 animate-spin" /> Searching...
            </div>
          ) : !hasResults ? (
            <div className="p-4 text-sm text-muted-foreground text-center">
              No results found for "{query}"
            </div>
          ) : (
            <div className="overflow-y-auto">
              
              {/* Orders */}
              {results.orders.length > 0 && (
                <div className="border-b last:border-b-0">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/30">Orders</div>
                  {results.orders.map((o) => (
                    <button
                      key={o.id}
                      className="w-full px-4 py-2 text-sm text-left hover:bg-muted transition-colors flex items-center gap-3"
                      onClick={() => {
                        setShowDropdown(false);
                        navigate(ROUTES.customer.tracking); // Or admin order page depending on user, for now generic route
                      }}
                    >
                      <Receipt className="size-4 text-primary" />
                      <div className="flex flex-col">
                        <span className="font-medium">{o.order_number}</span>
                        <span className="text-xs text-muted-foreground capitalize">{o.status} • ₹{o.total}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Menu Items */}
              {results.menuItems.length > 0 && (
                <div className="border-b last:border-b-0">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/30">Menu</div>
                  {results.menuItems.map((m) => (
                    <button
                      key={m.id}
                      className="w-full px-4 py-2 text-sm text-left hover:bg-muted transition-colors flex items-center gap-3"
                      onClick={() => {
                        setShowDropdown(false);
                        navigate(ROUTES.customer.menu);
                      }}
                    >
                      <Utensils className="size-4 text-primary" />
                      <div className="flex flex-col">
                        <span className="font-medium">{m.name}</span>
                        <span className="text-xs text-muted-foreground">₹{m.price}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Tables */}
              {results.tables.length > 0 && (
                <div className="border-b last:border-b-0">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-muted/30">Tables</div>
                  {results.tables.map((t) => (
                    <button
                      key={t.id}
                      className="w-full px-4 py-2 text-sm text-left hover:bg-muted transition-colors flex items-center gap-3"
                      onClick={() => {
                        setShowDropdown(false);
                        navigate('/'); // tables don't have a specific customer route yet
                      }}
                    >
                      <Armchair className="size-4 text-primary" />
                      <div className="flex flex-col">
                        <span className="font-medium">Table {t.number}</span>
                        <span className="text-xs text-muted-foreground">{t.section} • {t.capacity} seats</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
