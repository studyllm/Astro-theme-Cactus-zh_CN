import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

// 服务器端渲染 - 动态提供 config.yml
export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    // 读取 public/admin/config.yml 文件
    const configPath = path.join(process.cwd(), 'public', 'admin', 'config.yml');
    
    if (!fs.existsSync(configPath)) {
      return new Response('Config file not found', { 
        status: 404,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
    }
    
    const configContent = fs.readFileSync(configPath, 'utf-8');
    
    return new Response(configContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/yaml',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error reading config.yml:', error);
    return new Response('Internal server error', { 
      status: 500,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }
}; 
