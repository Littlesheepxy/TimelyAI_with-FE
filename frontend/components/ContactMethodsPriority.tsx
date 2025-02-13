import React from "react"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { Label } from "@/components/ui/label"
import { GripVertical } from "lucide-react"

interface ContactMethod {
  id: string
  name: string
}

interface ContactMethodsPriorityProps {
  contactMethods: ContactMethod[]
  onDragEnd: (result: any) => void
}

export function ContactMethodsPriority({ contactMethods, onDragEnd }: ContactMethodsPriorityProps) {
  return (
    <div className="mt-4">
      <Label>触达方式优先级（拖拽调整顺序）</Label>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="contactMethods">
          {(provided) => (
            <ul
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="mt-2 bg-gray-50 p-2 rounded-md"
            >
              {contactMethods.map((method, index) => (
                <Draggable key={method.id} draggableId={method.id} index={index}>
                  {(provided, snapshot) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`flex items-center p-2 mb-2 bg-white rounded-md shadow-sm transition-shadow ${
                        snapshot.isDragging ? "shadow-md" : ""
                      }`}
                    >
                      <div {...provided.dragHandleProps} className="mr-2 cursor-grab active:cursor-grabbing">
                        <GripVertical className="text-gray-400" size={20} />
                      </div>
                      <span>{method.name}</span>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  )
}

