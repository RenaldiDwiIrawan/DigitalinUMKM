'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, MapPin, Radius, ListOrdered, AlertTriangle, ArrowRight, Loader2, Sparkles } from "lucide-react"

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
  return (
    <Card className="glass overflow-hidden border-0 shadow-2xl shadow-blue-900/5 ring-1 ring-white/20 mb-10 rounded-[2.5rem]">
      <CardHeader className="bg-white/40 pb-5 border-b border-white/20">
        <CardTitle className="text-xl font-black tracking-tighter uppercase text-gray-900">Parameter Pencarian</CardTitle>
      </CardHeader>

      <CardContent className="p-8">
        <form onSubmit={handleScrape} className="space-y-8">
          <div className="space-y-3">
            <label className="block text-[11px] font-black text-blue-700/80 uppercase tracking-[0.2em] mb-2 px-1">
              Jenis Bisnis
            </label>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <Input
                type="text"
                value={form.query}
                onChange={(e) => setForm({ ...form, query: e.target.value })}
                placeholder="Contoh: Cafe, Petshop, Klinik"
                required
                className="h-12 pl-11 bg-white/50 border-white/60 focus:bg-white focus:ring-blue-600/30 rounded-xl font-bold text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[11px] font-black text-blue-700/80 uppercase tracking-[0.2em] mb-2 px-1">
              Lokasi Target
            </label>
            <div className="relative group">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <Input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Contoh: Bekasi, Jakarta Selatan"
                required
                className="h-12 pl-11 bg-white/50 border-white/60 focus:bg-white focus:ring-blue-600/30 rounded-xl font-bold text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-3">
              <label className="block text-[11px] font-black text-blue-700/80 uppercase tracking-[0.2em] mb-2 px-1">
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
                  className="h-12 pl-11 bg-white/50 border-white/60 focus:bg-white focus:ring-blue-600/30 rounded-xl font-bold text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="block text-[11px] font-black text-blue-700/80 uppercase tracking-[0.2em] mb-2 px-1">
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
                  className="h-12 pl-11 bg-white/50 border-white/60 focus:bg-white focus:ring-blue-600/30 rounded-xl font-bold text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5 pt-2">
            <Button
              type="submit"
              disabled={isPending}
              variant="premium"
              className="flex-1 h-14 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Mulai"
              )}
            </Button>
            <Button
              type="button"
              onClick={() => {
                onReset();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              variant="outline"
              className="h-14 rounded-xl border-2 border-white/50 bg-white/30 text-gray-500 hover:bg-white hover:text-red-600 hover:border-red-100 transition-all font-black uppercase tracking-[0.2em] text-[9px]"
            >
              Reset
            </Button>
          </div>
        </form>

        {error && (
          <div className="mt-6 p-5 bg-red-50 border border-red-100 text-red-700 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-lg shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black mb-0.5 text-red-900 uppercase tracking-wider text-[9px]">Error Detected</p>
                <p className="text-xs font-medium leading-relaxed opacity-80 break-words">{error}</p>
              </div>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  )
}
