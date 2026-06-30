import { embedText } from './apps/api/src/lib/gemini.ts';
import { index } from './apps/api/src/lib/pinecone.ts';

async function test() {
  try {
    console.log("Testing embedText...");
    const values = await embedText("test string");
    console.log("Embedding successful, length:", values.length);
    
    console.log("Testing Pinecone upsert...");
    await index.upsert([{ id: 'test-1', values, metadata: { text: "test string" } }]);
    console.log("Pinecone upsert successful!");
  } catch (e) {
    console.error("Error occurred:");
    console.error(e);
  }
}

test();
