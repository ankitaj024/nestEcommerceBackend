import { Injectable } from '@nestjs/common';
import axios from 'axios';
import cosineSimilarity from 'compute-cosine-similarity';
import Together from 'together-ai';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class ProductAIService {
  private together: any;
  private readonly TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
  private readonly EMBEDDING_MODEL = process.env.EMBEDDING_MODEL;
  constructor(private readonly prisma: PrismaService) {
    this.together = new Together({
      apiKey: process.env.TOGETHER_API_KEY || '',
    });
  }

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
    const keywords = [
      'product',
      'category',
      'price',
      'brand',
      'cheapest',
      'expensive',
      'list',
      'cost',
      'available',
      'items',
      'lowest',
      'highest',
    ];
    const productQuery = keywords.some((word) =>
      query.toLowerCase().includes(word),
    );

    // Get category data from DB
    const categories = await this.prisma.category.findMany();
    const queryEmbedding = await this.generateEmbedding(query);

    // Vector search using MongoDB Atlas
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

    const bestMatch = (result as any)?.cursor?.firstBatch || [];

    let simplifiedData: any[] = [];

    if (productQuery && bestMatch.length > 0) {
      const grouped = new Map<string, any[]>();
      for (const prod of bestMatch) {
        // console.log(prod.categoryId.$oid);
        const categoryName = await this.prisma.category.findFirst({
          where: {
            id: prod.categoryId.$oid,
          },
        });
        
         const brand = await this.prisma.brand.findFirst({
          where: {
            id: prod.brandId.$oid,
          },
        });
        const catName = categoryName.name || 'Unknown';
        if (!grouped.has(catName)) grouped.set(catName, []);
        grouped.get(catName).push({
          name: prod.title,
          price: prod.price,
          brand: brand.name || 'Unknown',
        });
      }

      for (const [category, products] of grouped.entries()) {
        const sorted = [...products].sort((a, b) => a.price - b.price);
        simplifiedData.push({
          category,
          totalProducts: products.length,
          lowestPriceProduct: sorted[0],
          highestPriceProduct: sorted[sorted.length - 1],
          products,
        });
      }
    }

    // Prepare category names list
    const categoryNames = categories.map((cat) => cat.name);

    // ✅ Conversational prompt with category awareness
    const prompt = `
You are a helpful and friendly assistant for an e-commerce platform.

User query: "${query}"

Product data (up to 3 matched categories):
${JSON.stringify(simplifiedData.slice(0, 3), null, 2)}

Available category names:
${categoryNames.join(', ')}

Instructions:
- If the question is about product price, list a few product names, their price and brand.
- If the question is about total products in a category, respond with the count and category name.
- If the category exists but no products were found, politely say "There are no matching products in the ${query} category right now."
- Keep your answer friendly, short, and conversational.
-keep the new lines in new line not in same line .
- Don’t show JSON or technical details.
- if any thing which is not related to our database please reply with polite excuse .  
`.trim();

    let response;
    try {
      response = await this.together.chat.completions.create({
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
        max_tokens: 512,
        messages: [
          {
            role: 'system',
            content: 'You are a smart and friendly e-commerce assistant.',
          },
          { role: 'user', content: prompt },
        ],
      });
    } catch (error) {
      console.error('Together API error:', error);
      throw new Error('Failed to get response from Together API');
    }

    let messageContent =
      response.choices?.[0]?.message?.content?.trim() ||
      'No response generated.';

    // Optional: Clean code block formatting
    messageContent = messageContent
      .replace(/^```[\s\S]*?\n/, '')
      .replace(/```$/, '')
      .trim();

    return { message: messageContent };
  }
}
