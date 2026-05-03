"use client"

import { useState, useCallback } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
} from "@dnd-kit/core"
import { snapCenterToCursor } from "@dnd-kit/modifiers"
import { cn } from "@/lib/utils"
import { KanbanColumn } from "@/components/kanban/kanban-column"
import { DealCard } from "@/components/kanban/deal-card"
import { DealModal } from "@/components/kanban/deal-modal"
import { updateDealStageAction, deleteDealAction } from "./actions"
import { Kanban } from "lucide-react"

// Detects the column under the cursor first; falls back to nearest column center.
// This makes dropping feel immediate — as soon as the cursor enters a column it's recognized.
const collisionDetection: CollisionDetection = (args) => {
  const pointer = pointerWithin(args)
  if (pointer.length > 0) return pointer
  return closestCenter(args)
}

export const STAGES = [
  { key: "novo_cliente",        label: "Novo cliente",          color: "#3B82F6" },
  { key: "apresentar_proposta", label: "Apresentar a proposta", color: "#06B6D4" },
  { key: "proposta_aceita",     label: "Proposta aceita",       color: "#F59E0B" },
  { key: "obra_andamento",      label: "Obra em andamento",     color: "#F97316" },
  { key: "obra_finalizada",     label: "Obra finalizada",       color: "#22C55E" },
  { key: "cliente_perdido",     label: "Cliente Perdido",       color: "#EF4444" },
  { key: "cliente_stand_by",    label: "Cliente em stand by",   color: "#64748B" },
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
  const [deals, setDeals]           = useState<Deal[]>(initialDeals)
  const [activeId, setActiveId]     = useState<string | null>(null)
  const [overStageId, setOverStage] = useState<string | null>(null)
  const [ownerFilter, setOwner]     = useState("")
  const [modalOpen, setModalOpen]   = useState(false)
  const [editingDeal, setEditing]   = useState<Deal | null>(null)
  const [defaultStage, setDefault]  = useState("novo_cliente")

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
    setOverStage(null)
  }

  function handleDragOver(event: DragOverEvent) {
    const { over } = event
    if (over) setOverStage(over.id as string)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)

    // Use the live `over.id` or fall back to the last column we hovered (overStageId)
    const newStage = (over?.id ?? overStageId) as string | null
    setOverStage(null)

    if (!newStage) return
    const dealId = active.id as string
    const deal   = deals.find((d) => d.id === dealId)
    if (!deal || deal.stage === newStage) return

    // Optimistic update
    setDeals((prev) => prev.map((d) => d.id === dealId ? { ...d, stage: newStage } : d))
    const result = await updateDealStageAction(dealId, newStage)
    if (result.error) {
      // Revert on server error
      setDeals((prev) => prev.map((d) => d.id === dealId ? { ...d, stage: deal.stage } : d))
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border bg-background px-4 sm:px-6 py-3">
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
        {deals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20 text-center px-4">
            <Kanban className="mb-4 h-12 w-12 text-muted-foreground/30" />
            <p className="text-base font-semibold text-foreground">Nenhum negócio ainda</p>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-xs">
              Crie seu primeiro negócio clicando no botão + em qualquer coluna do pipeline.
            </p>
          </div>
        ) : (
        <div className="kanban-board flex gap-4 p-6 min-w-max">
          <DndContext
            sensors={sensors}
            collisionDetection={collisionDetection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
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

            <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }} modifiers={[snapCenterToCursor]}>
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
        )}
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
