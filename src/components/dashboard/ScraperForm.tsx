import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin, Radius, ListOrdered, AlertTriangle, ArrowRight, Loader2, Sparkles } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PhotonFeature {
  properties: {
    name: string;
    display_address?: string;
    district?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  geometry: {
    coordinates: [number, number]; // [lon, lat]
  };
}

interface ScraperFormProps {
  form: {
    query: string;
    location: string;
    limit: string | number;
    radius: string | number;
  };
  setForm: (form: any) => void;
  handleScrape: (e: React.FormEvent) => void;
  onReset: () => void;
  isPending: boolean;
  error: string | null;
}

export function ScraperForm({ form, setForm, handleScrape, onReset, isPending, error }: ScraperFormProps) {
  const [suggestions, setSuggestions] = useState<PhotonFeature[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  const businessOptions = ["Cafe", "Petshop", "Klinik", "Bengkel"];
  const [isOther, setIsOther] = useState(!businessOptions.includes(form.query) && form.query !== "");

  // Handle dropdown change
  const handleSelectChange = (value: string) => {
    if (value === "other") {
      setIsOther(true);
      setForm({ ...form, query: "" });
    } else {
      setIsOther(false);
      setForm({ ...form, query: value });
    }
  };

  // Debounced location search
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (form.location.length < 3) {
        setSuggestions([]);
        return;
      }

      setIsLoadingSuggestions(true);
      try {
        const response = await fetch(
          `/api/location-suggest?q=${encodeURIComponent(form.location)}`
        );
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        setSuggestions(data.features || []);
      } catch (error) {
        console.error("Autocomplete error:", error);
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 400);
    return () => clearTimeout(timer);
  }, [form.location]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectValue = isOther ? "other" : (businessOptions.includes(form.query) ? form.query : "");

  return (
    <Card className="bg-white overflow-hidden border border-gray-100 shadow-sm mb-8 rounded-3xl transition-all hover:shadow-md">
      <CardHeader className="bg-gray-50/50 pb-4 border-b border-gray-100 px-8 py-6">
        <CardTitle className="text-lg font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          Parameter Pencarian
        </CardTitle>
      </CardHeader>

      <CardContent className="p-8">
        <form onSubmit={handleScrape} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="business-type" className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">
              Jenis Bisnis
            </label>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors z-10" />
              <Select
                value={selectValue}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger id="business-type" className="h-12 pl-11 bg-white border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 rounded-xl font-semibold text-gray-900 placeholder:text-gray-400 transition-all">
                  <SelectValue placeholder="Pilih Jenis Bisnis" />
                </SelectTrigger>
                <SelectContent>
                  {businessOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                  <SelectItem value="other">Lainnya (Isi sendiri)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isOther && (
              <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <Input
                  type="text"
                  value={form.query}
                  onChange={(e) => setForm({ ...form, query: e.target.value })}
                  placeholder="Masukkan jenis bisnis..."
                  required
                  className="h-12 bg-white border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 rounded-xl font-semibold text-gray-900 placeholder:text-gray-400 transition-all"
                />
              </div>
            )}
          </div>

          <div className="space-y-2 relative" ref={suggestionRef}>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">
              Lokasi Target
            </label>
            <div className="relative group">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <Input
                type="text"
                value={form.location}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setForm({ ...form, location: e.target.value });
                  setShowSuggestions(true);
                }}
                placeholder="Contoh: Bekasi, Jakarta Selatan"
                required
                className="h-12 pl-11 bg-white border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 rounded-xl font-semibold text-gray-900 placeholder:text-gray-400 transition-all"
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && (suggestions.length > 0 || isLoadingSuggestions) && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl max-h-60 overflow-auto py-2 animate-in fade-in zoom-in duration-200">
                  {isLoadingSuggestions ? (
                    <div className="px-4 py-3 text-xs text-gray-400 flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" /> Mencari lokasi...
                    </div>
                  ) : (
                    suggestions.map((feature, index) => {
                      const { name, display_address, district, city, state } = feature.properties;
                      const subAddress = display_address || [district, city, state].filter(Boolean).join(', ');
                      const fullLocation = display_address ? `${name}, ${display_address}` : [name, district, city, state].filter(Boolean).join(', ');

                      return (
                        <button
                          key={index}
                          type="button"
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex flex-col gap-0.5 group/item"
                          onClick={() => {
                            setForm({
                              ...form,
                              location: fullLocation,
                              lat: feature.geometry.coordinates[1],
                              lng: feature.geometry.coordinates[0]
                            });
                            setSuggestions([]);
                            setShowSuggestions(false);
                          }}
                        >
                          <span className="text-sm font-bold text-gray-900 group-hover/item:text-blue-700 transition-colors">{name}</span>
                          <span className="text-[10px] text-gray-500 line-clamp-1">
                            {subAddress}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">
                Radius (KM)
              </label>
              <div className="relative group">
                <Radius className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <Input
                  type="number"
                  value={form.radius}
                  onChange={(e) => setForm({ ...form, radius: e.target.value })}
                  min="1"
                  max="50"
                  placeholder="5"
                  className="h-12 pl-11 bg-white border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 rounded-xl font-semibold text-gray-900 placeholder:text-gray-400 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">
                Limit Data
              </label>
              <div className="relative group">
                <ListOrdered className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                <Input
                  type="number"
                  value={form.limit}
                  onChange={(e) => setForm({ ...form, limit: e.target.value })}
                  min="1"
                  max="50"
                  placeholder="20"
                  className="h-12 pl-11 bg-white border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 rounded-xl font-semibold text-gray-900 placeholder:text-gray-400 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 h-12 rounded-xl text-xs font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mencari...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Mulai Pencarian
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={() => {
                onReset();
                setIsOther(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              variant="ghost"
              className="h-12 px-6 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
            >
              Reset
            </Button>
          </div>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex gap-3">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[10px] text-red-900 uppercase tracking-wider mb-1">Gagal Memuat Data</p>
                <p className="text-xs font-medium leading-relaxed opacity-80 break-words">{error}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
