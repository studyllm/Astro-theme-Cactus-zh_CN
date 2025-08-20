import { handler } from '../server/entry.mjs';

export async function onRequest(context) {
  try {
    // 将 EdgeOne Functions 的 context 转换为标准的 Request
    const request = context.request;
    
    // 调用 Astro SSR handler
    const response = await handler(request);
    
    return response;
  } catch (error) {
    console.error('SSR Error:', error);
    return new Response('Internal Server Error', { 
      status: 500,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }
}
