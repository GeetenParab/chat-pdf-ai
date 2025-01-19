"use client"

import { Input } from './input'
import { Message, useChat } from 'ai/react'
import { Send } from 'lucide-react'
import MessageList from './MessageList'
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

type Props = { chatId: number }

const ChatComponent = ({ chatId }: Props) => {
  const { data, isPending } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: async () => {
      const response = await axios.post<Message[]>('/api/get-messages', { chatId })
      return response.data
    }
  })

  const { input, handleInputChange, handleSubmit, messages, isLoading } = useChat({
    api: '/api/chat',
    streamProtocol: "text",
    body: { chatId },
    initialMessages: data || [],
  })

  React.useEffect(() => {
    const messageContainer = document.getElementById("message-container")
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight
    }
  }, [messages])

  return (
    <div className="flex flex-col h-[calc(105vh-3.5rem)]">
      {/* Header */}
      <div className="sticky top-0 inset-x-0 p-2 bg-white h-fit border-b">
        <h3 className="text-xl font-bold">Chat</h3>
      </div>

      {/* Messages */}
      <div 
        id="message-container"
        className="flex-1 overflow-y-auto"
      >
        <MessageList 
          messages={messages} 
          isLoading={isLoading} 
          isPending={isPending} 
        />
      </div>

      {/* Input Form */}
      <div className="sticky bottom-0 inset-x-0 px-2 py-3 bg-white border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input 
            value={input} 
            onChange={handleInputChange} 
            placeholder="Ask any question..." 
            className="w-full"
          />
          <button 
            type="submit"
            className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatComponent