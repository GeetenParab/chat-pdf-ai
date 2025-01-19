import { cn } from '@/lib/utils'
import { Message } from 'ai/react'
import { Loader2 } from 'lucide-react'
import React from 'react'

type Props = {
  messages: Message[]
  isLoading: boolean
  isPending: boolean
}

const MessageList = ({ messages, isLoading, isPending }: Props) => {
  if (isPending) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  if (!messages) return null

  return (
    <div className="flex flex-col gap-4 px-4 py-2">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn("flex", {
            "justify-end pl-10": message.role === "user",
            "justify-start pr-10": message.role === "assistant",
          })}
        >
          <div
            className={cn(
              "rounded-lg px-3 py-3 text-sm shadow-md ring-1 ring-gray-900/10", 
              {
                "bg-blue-600 text-white": message.role === "user",
                "bg-white": message.role === "assistant",
              }
            )}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex justify-center py-2">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      )}
    </div>
  )
}

export default MessageList