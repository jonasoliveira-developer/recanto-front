import React, { useState, useRef, useEffect } from "react";

interface CustomSelectProps {
  options: Array<{ id: string | number; label: string }>;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CustomSelect({ options, value, onChange, placeholder }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedLabel = options.find(opt => String(opt.id) === String(value))?.label || "";

  return (
    <div ref={ref} className="relative w-full">
      <div
        className="rounded border px-3 py-2 text-base sm:text-lg sm:px-4 sm:py-3 bg-white flex items-center justify-between cursor-pointer select-none"
        onClick={() => setOpen(o => !o)}
        tabIndex={0}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setOpen(o => !o); }}
      >
        <span className={selectedLabel ? "text-black" : "text-gray-400"}>
          {selectedLabel || placeholder || "Selecione"}
        </span>
        <span className={`ml-2 transition-transform ${open ? "rotate-180" : "rotate-0"}`}>▼</span>
      </div>
      {open && (
        <div className="absolute left-0 right-0 mt-1 bg-white border rounded shadow-lg z-50 max-h-60 overflow-auto">
          <input
            className="w-1/2 m-2 px-3 py-2 border-2 border-green-500 rounded-lg outline-none text-base bg-white text-gray-700 placeholder:text-gray-400 focus:border-green-600 transition-colors duration-200 shadow-sm"
            placeholder="Buscar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
          <ul className="max-h-48 overflow-auto">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-gray-500">Nenhum resultado</li>
            )}
            {filtered.map(opt => (
              <li
                key={String(opt.id)}
                className={`px-3 py-2 cursor-pointer hover:bg-[#DDA329] hover:text-white ${String(value) === String(opt.id) ? "bg-[#DDA329] text-white" : ""}`}
                onClick={() => { onChange(opt.id.toString()); setOpen(false); setSearch(""); }}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
