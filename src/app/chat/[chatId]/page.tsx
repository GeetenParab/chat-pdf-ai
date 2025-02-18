import ChatComponent from '@/components/ui/ChatComponent'
import ChatSidebar from '@/components/ui/ChatSidebar'
import PDFViewer from '@/components/ui/PDFViewer'
import { db } from '@/lib/db'
import { chats } from '@/lib/db/schema'
import { auth } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import React from 'react'

type Props =  {
       params:{
         chatId: string
       }
}

const page = async ({params}:Props ) => {

    const  chatid  = await params;
    const chatId = chatid.chatId;
    
    const  { userId } = await auth();
     
    if(!userId) return redirect('/sign-in')


    const chat  = await db.select().from(chats).where(eq(chats.userId,userId))

    if(!chat){
        return redirect("/")
    }
    if(!chat.find((chat) => chat.id === parseInt(chatId))){
        return redirect("/")
    }

    const currentChat = chat.find((chat) => chat.id === parseInt(chatId));

  return (
    <div className="flex max-h-screen ">
    <div className="flex w-full max-h-screen ">
      {/* chat sidebar */}
      <div className="flex-[1] max-w-xs">
        <ChatSidebar chats={chat} chatId={parseInt(chatId)}  />
      </div>
      {/* pdf viewer */}
      <div className="max-h-screen p-4 oveflow-scroll flex-[5]">
        <PDFViewer pdf_url={currentChat?.pdfUrl || ""} />
      </div>
      {/* chat component */}
      <div className="flex-[3] border-l-4 max-h-screen border-l-slate-200">
        <ChatComponent chatId={parseInt(chatId)} />
      </div>
    </div>
  </div>
  )
}

export default page
