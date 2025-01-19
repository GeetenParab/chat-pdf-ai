import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import {  downloadFromS3 } from "./s3-server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

import { RecursiveCharacterTextSplitter ,Document} from "@pinecone-database/doc-splitter";
import { getEmbeddings } from "./geminiai";
import md5 from "md5"
import { convertToAscii } from "./utils";


  

export const getPineconeClient = () => {
  return new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });
};

type PDFpage = {
  pageContent :string,
  metadata : {
    loc: {pageNumber:number}
  }
}

export async function loadS3IntoPinecone(filekey:string){
  // 1. obtain pdf by pages (download and read pdf )
       console.log("downloading s3 into file system")
       const file_name = await downloadFromS3(filekey);
       if(!file_name){
        throw new Error('could not download from s3')
       }

       const loader = new PDFLoader(file_name);
       const pages  = (await loader.load() ) as PDFpage[];

       console.log(pages)
       console.log(pages.length)
       //2. split and segment the pdf;
       const documents  =await Promise.all(pages.map(prepareDoc));
       console.log(documents)
       console.log(documents.length)

       // 3 vectorize and embed individual document
       const vectors = await Promise.all(documents.flat().map(embedDocument));
        //  console.log(vectors);
       if (vectors.some(v => v === undefined)) {
        throw new Error('Some vectors are undefined');
      }

           // 4. upload to pinecone
  const client = await getPineconeClient();
  const pineconeIndex = await client.index("chatpdf-ai");

  const namespace = pineconeIndex.namespace(convertToAscii(filekey));
  
  console.log('inserting vectors into pinecode')
  //
  
  
  await namespace.upsert(vectors as PineconeRecord[]);

  return documents[0];
    
}

async function embedDocument(doc:Document){
          try {
            const embeddings = await getEmbeddings(doc.pageContent);
            const hash = md5(doc.pageContent);

            return {
              id: hash,
              values: embeddings,
              metadata: {
                text: doc.metadata.text,
                pageNumber: doc.metadata.pageNumber,
              },
            } as PineconeRecord;
            
          } catch (error) {
            console.log("error embedding document",error);
          }
}


export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};



async function prepareDoc(page: PDFpage){

    let {pageContent , metadata} = page;
    pageContent = pageContent.replace(/\n/g,'')

  const splitter = new RecursiveCharacterTextSplitter();

  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: metadata.loc.pageNumber,
        text: truncateStringByBytes(pageContent, 36000),
      },
    }),
  ]);
  return docs;
}
