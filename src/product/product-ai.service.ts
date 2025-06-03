import { Injectable } from '@nestjs/common';
import axios from 'axios';
import cosineSimilarity from 'compute-cosine-similarity';
import Together from "together-ai";
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class ProductAIService {
  private readonly TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
  private readonly EMBEDDING_MODEL = process.env.EMBEDDING_MODEL;
  constructor(private readonly prisma: PrismaService) {}

  async generateEmbedding(text: string) {
    console.log(' thisis embed 3 ', text);
    console.log(this.EMBEDDING_MODEL, this.TOGETHER_API_KEY);
    const response = await axios.post(
      'https://api.together.xyz/v1/embeddings',
      {
        model: this.EMBEDDING_MODEL,
        input: [text],
      },
      {
        headers: {
          Authorization: `Bearer ${this.TOGETHER_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data.data[0].embedding;
  }

  async generateAndSaveProductEmbeddings() {
    const products = await this.prisma.product.findMany();
    console.log(' here is you in generate  1    ');

    for (const product of products) {
      const text = `${product.title} ${product.description}`;
      const embedding = await this.generateEmbedding(text);
      console.log(' here is you in generate  2     ');
      await this.prisma.product.update({
        where: { id: product.id },
        data: { embedding },
      });
    }
  }

  async matchProductsToCategories(query: string) {
    const categories = await this.prisma.category.findMany();
    const productCount  = await this.prisma.product.count()
    const queryEmbedding = await this.generateEmbedding(query);
    const result = await this.prisma.$runCommandRaw({
      aggregate: 'Product',
      pipeline: [
        {
          $vectorSearch: {
            queryVector: queryEmbedding,
            path: 'embedding',
            numCandidates: 100,
            limit: 100,
            index: 'vector_index',
          },
        },
      ],
      cursor: {},
    });
    const bestMatch = (result as any)?.cursor?.firstBatch;
    console.log(bestMatch.length);

    //  return bestMatch;


const together = new Together();

const response = await together.chat.completions.create({
  messages: [
    {
      role: "user",
      content: `use  the query ${query} and answer with this data here are the catagory in my database ${categories} and products ${bestMatch} and total product is ${bestMatch.length}`
    }
  ],
  model: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free"
});

const answer = response.choices[0].message.content
return answer


    // function cosineSimilarity(a: number[], b: number[]) {
    //   if (!a || !b || a.length !== b.length) return 0;

    //   const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    //   const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    //   const normB = Math.sqrt(b.reduce((sum, val) => sum + val*val, 0)); // FIXED

    //   if (normA === 0 || normB === 0) return 0;

    //   return dot / (normA * normB);
    // }

    // const categoryCounts = {};

    // // for (const product of products) {

    //   const matchingProducts = products.filter((product) => {
    //     const similarity = cosineSimilarity(product.embedding, queryEmbedding);
    //     return similarity >= 0.8; // Adjust threshold as needed
    //   });

    //    matchingProducts.length;
    // // }

    // return {
    //   query,
    //   matches: matchingProducts.length,
    // };
  }
}
