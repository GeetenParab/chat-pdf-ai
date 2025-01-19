import { GoogleGenerativeAI} from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY!);

export async function getEmbeddings(text: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(text.replace(/\n/g, " "));
    const embedding = await result.embedding;
    return embedding.values;
  } catch (error) {
    console.log("error calling google embeddings api", error);
    throw error;
  }
}

