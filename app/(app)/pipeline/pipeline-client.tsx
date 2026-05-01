"use client"

import { useState, useCallback } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { cn } from "@/lib/utils"
import { KanbanColumn } from "@/components/kanban/kanban-column"
import { DealCard } from "@/components/kanban/deal-card"
import { DealModal } from "@/components/kanban/deal-modal"
import { updateDealStageAction, deleteDealAction } from "./actions"

export const STAGES = [
  { key: "new_lead",       label: "Novo Lead",          color: "#3B82F6" },
  { key: "contacted",      label: "Contato Realizado",   color: "#06B6D4" },
  { key: "proposal_sent",  label: "Proposta Enviada",    color: "#F59E0B" },
  { key: "negotiation",    label: "Negociação",           color: "#F97316" },
  { key: "closed_won",     label: "Fechado Ganho",       color: "#22C55E" },
  { key: "closed_lost",    label: "Fechado Perdido",     color: "#EF4444" },
]

interface Profile {
  id: string
  name: string | null
  email: string
}

interface Lead {
  id: string
  name: string
}

interface Deal {
  id: string
  title: string
  value: number
  stage: string
  due_date: string | null
  lead_id: string | null
  owner_id: string
  lead?: { id: string; name: string } | null
  owner?: { name: string | null; email: string } | null
}

interface PipelineClientProps {
  initialDeals: Deal[]
  leads: Lead[]
  memberProfiles: Profile[]
  currentUserId: string
  isAdmin: boolean
}

export function PipelineClient({
  initialDeals,
  leads,
  memberProfiles,
  currentUserId,
  isAdmin,
}: PipelineClientProps) {
  const [deals, setDeals]         = useState<Deal[]>(initialDeals)
  const [activeId, setActiveId]   = useState<string | null>(null)
  const [ownerFilter, setOwner]   = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editingDeal, setEditing] = useState<Deal | null>(null)
  const [defaultStage, setDefault]= useState("new_lead")

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )

  const activeDeal = deals.find((d) => d.id === activeId)

  const filtered = ownerFilter ? deals.filter((d) => d.owner_id === ownerFilter) : deals

  function openNew(stage: string) {
    setEditing(null)
    setDefault(stage)
    setModalOpen(true)
  }

  function openEdit(deal: Deal) {
    setEditing(deal)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditing(null)
  }

  const handleDelete = useCallback(async (dealId: string) => {
    setDeals((prev) => prev.filter((d) => d.id !== dealId))
    const result = await deleteDealAction(dealId)
    if (result.error) {
      // restore deal on error
      setDeals((prev) => [...prev, ...initialDeals.filter((d) => d.id === dealId)])
    }
  }, [initialDeals])

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)

    if (!over) return
    const dealId   = active.id as string
    const newStage = over.id as string
    const deal     = deals.find((d) => d.id === dealId)
    if (!deal || deal.stage === newStage) return

    // Optimistic update
    setDeals((prev) => prev.map((d) => d.id === dealId ? { ...d, stage: newStage } : d))
    const result = await updateDealStageAction(dealId, newStage)
    if (result.error) {
      // Revert
      setDeals((prev) => prev.map((d) => d.id === dealId ? { ...d, stage: deal.stage } : d))
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filter bar */}
      <div className="flex items-center gap-3 border-b border-border bg-background px-6 py-3">
        <span className="text-sm text-muted-foreground">Responsável:</span>
        <select
          value={ownerFilter}
          onChange={(e) => setOwner(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Todos</option>
          {memberProfiles.map((p) => (
            <option key={p.id} value={p.id}>{p.name ?? p.email}</option>
          ))}
        </select>
        {ownerFilter && (
          <button
            onClick={() => setOwner("")}
            className="text-xs text-muted-foreground underline hover:text-foreground"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="kanban-board flex gap-4 p-6 min-w-max">
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            {STAGES.map((stage, i) => (
              <div
                key={stage.key}
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <KanbanColumn
                  stage={stage}
                  deals={filtered.filter((d) => d.stage === stage.key)}
                  onAddDeal={openNew}
                  onEditDeal={openEdit}
                  onDeleteDeal={handleDelete}
                />
              </div>
            ))}

            <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
              {activeDeal ? (
                <DealCard
                  deal={activeDeal}
                  isOverlay
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <DealModal
          deal={editingDeal}
          defaultStage={defaultStage}
          leads={leads}
          memberProfiles={memberProfiles}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          onClose={closeModal}
        />
      )}
    </div>
  )
}
