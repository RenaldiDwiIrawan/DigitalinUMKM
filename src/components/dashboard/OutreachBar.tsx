'use client'

import { useState, useEffect } from "react"
import { MessageCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDashboard } from "@/context/DashboardContext"
import { formatPhoneNumber } from "@/lib/utils"

export function OutreachBar() {
  const { selectedLeadNames, leads, clearSelection, selectionMode, form } = useDashboard()
  const [currentIndex, setCurrentIndex] = useState(0)

  // Reset index if selection changes significantly
  useEffect(() => {
    if (currentIndex >= selectedLeadNames.length) {
      setCurrentIndex(0)
    }
  }, [selectedLeadNames.length, currentIndex])

  if (!selectionMode || selectedLeadNames.length === 0) return null

  const handleSendNext = () => {
    const name = selectedLeadNames[currentIndex]
    const lead = leads.find(l => l.name === name)
    if (lead?.phone) {
      const phone = formatPhoneNumber(lead.phone)
      const message = `Halo *${lead.name}*, saya melihat bisnis Anda di *${form.location}*. Saya ingin menawarkan jasa pembuatan website profesional untuk membantu meningkatkan omzet Anda. Apakah Anda tertarik?`
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')

      // Advance queue
      if (currentIndex < selectedLeadNames.length - 1) {
        setCurrentIndex(currentIndex + 1)
      }
    }
  }

  const currentLeadName = selectedLeadNames[currentIndex]

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-lg px-4 animate-in slide-in-from-bottom-10 duration-500">
      <div className="bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/20">
            {currentIndex + 1}/{selectedLeadNames.length}
          </div>
          <div>
            <p className="text-white text-xs font-bold uppercase tracking-wider">Antrean Pesan</p>
            <p className="text-gray-400 text-[10px] font-medium">Klik tombol untuk kirim pesan berikutnya</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={clearSelection} variant="ghost" size="icon" className="h-10 w-10 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl">
            <X className="w-4 h-4" />
          </Button>
          <Button onClick={handleSendNext} className="h-10 px-5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-green-500/20">
            <MessageCircle className="w-4 h-4" />
            Hubungi {currentLeadName}
          </Button>
        </div>
      </div>
    </div>
  )
}
