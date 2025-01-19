import { Pinecone } from "@pinecone-database/pinecone";
import { convertToAscii } from "./utils";
import { getEmbeddings } from "./geminiai";

export async function getmatchesFromEmbeddings(embeddings:number[],fileKey:string){

  
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! })
    const index = pc.index("chatpdf-ai")
    


    try {
        const namespace = index.namespace(convertToAscii(fileKey));

          const queryResult = await namespace.query({
            topK:5,
            vector: embeddings,
            includeMetadata:true,
          })
          return queryResult.matches || [];

      } catch (error) {
        console.log("error while Query embeddings",error)
      }

    

}

export async function getContext(query:string, filekey: string){

    const queryembeddings =await getEmbeddings(query);

    const matches  =await getmatchesFromEmbeddings(queryembeddings,filekey);
      
    // console.log(matches)
    const qualifyDocs = matches?.filter(match => match.score);

    type Metadata = {
        text : string ,
        pageNumber: number
    }

    let docs = qualifyDocs?.map((match) => (match.metadata as Metadata).text);
       
    return docs?.join("\n").substring(0, 3000);
}