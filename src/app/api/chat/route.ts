
import { getContext } from '@/lib/context';
import { db } from '@/lib/db';
import { chats,messages as _messages} from '@/lib/db/schema';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { eq } from 'drizzle-orm';

import { NextRequest, NextResponse } from 'next/server';

interface Message {
    role: string;
    content: string;
  }

export async function POST(req: NextRequest) {
  try {
    const { messages,chatId} = await req.json();
    const chat = await db.select().from(chats).where(eq(chats.id,chatId));

    if(chat.length != 1){
      return NextResponse.json({'error':'chat not found'},{status:404});
    }
    // console.log(chat);
    const filekey  = chat[0].fileKey;
    
    const userMessages = messages.filter((message: Message) => message.role === "user");
    const lastMessage = userMessages[userMessages.length - 1];
    // console.log(lastMessage);
    
    if (!lastMessage) {
      return NextResponse.json({ error: 'No user message found' }, { status: 400 });
    }


    //
    await db.insert(_messages).values({
      chatId,
      content: lastMessage.content,
      role: "user",
    });

    const context = await getContext(lastMessage.content,filekey)

      // console.log(context,"hello")

    const apiKey = process.env.GOOGLE_AI_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key is not set");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel(
      { 
        model: "gemini-1.5-flash" ,
        systemInstruction: `AI assistant is a brand new, powerful, human-like artificial intelligence.
      The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
      AI is a well-behaved and well-mannered individual.
      AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
      AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
      AI assistant is a big fan of Pinecone and Vercel.
      START CONTEXT BLOCK
      ${context}
      END OF CONTEXT BLOCK
      AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
      If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
      AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
      AI assistant will not invent anything that is not drawn directly from the context.
      `
      }
       
    );
    
    // const systemPrompt = `AI assistant is a brand new, powerful, human-like artificial intelligence.
    // The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
    // AI is a well-behaved and well-mannered individual.
    // AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.`
  const promptmessages = JSON.stringify(userMessages)
    const prompt = `${promptmessages}\n\nUser: ${lastMessage.content}`;
    
    // console.log("Sending prompt to Gemini:", prompt);

    const result = await model.generateContent([prompt]);
    const response = result.response;
    const text = response.text();
    
    console.log("Full response:", text);

    await db.insert(_messages).values({
      chatId,
      content: text,
      role: "system",
    });
    // Add the AI's response to the messages array
  //  messages.push({
  //     role: "assistant",
  //     content: text
  //   });
    // console.log(messages)
    
   



  return NextResponse.json(text);

  } catch (error) {
    console.error("Error processing request:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}










// import { GoogleGenerativeAI} from "@google/generative-ai";

// import { Message, OpenAIStream, StreamingTextResponse } from "ai";
// import { getContext } from "@/lib/context";
// import { db } from "@/lib/db";
// import { chats, messages as _messages } from "@/lib/db/schema";
// import { eq } from "drizzle-orm";
// import { NextResponse } from "next/server";
// import { Message } from 'ai/react';

// export const runtime = "edge";

// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY!);

// export async function POST(req: Request) {
//   try {
//     const { messages, chatId } = await req.json();
//     const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
//     if (_chats.length != 1) {
//       return NextResponse.json({ error: "chat not found" }, { status: 404 });
//     }
//     const fileKey = _chats[0].fileKey;
//     const lastMessage = messages[messages.length - 1];
//     const context = await getContext(lastMessage.content, fileKey);

//     const prompt = {
//       role: "system",
//       content: `AI assistant is a brand new, powerful, human-like artificial intelligence.
//       The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
//       AI is a well-behaved and well-mannered individual.
//       AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.
//       AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.
//       AI assistant is a big fan of Pinecone and Vercel.
//       START CONTEXT BLOCK
//       ${context}
//       END OF CONTEXT BLOCK
//       AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
//       If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer to that question".
//       AI assistant will not apologize for previous responses, but instead will indicated new information was gained.
//       AI assistant will not invent anything that is not drawn directly from the context.
//       `,
//     };

//     const response = await openai.createChatCompletion({
//       model: "gpt-3.5-turbo",
//       messages: [
//         prompt,
//         ...messages.filter((message: Message) => message.role === "user"),
//       ],
//       stream: true,
//     });
//     const stream = OpenAIStream(response, {
//       onStart: async () => {
//         // save user message into db
//         await db.insert(_messages).values({
//           chatId,
//           content: lastMessage.content,
//           role: "user",
//         });
//       },
//       onCompletion: async (completion) => {
//         // save ai message into db
//         await db.insert(_messages).values({
//           chatId,
//           content: completion,
//           role: "system",
//         });
//       },
//     });
//     return new StreamingTextResponse(stream);
//   } catch (error) {}
// }


