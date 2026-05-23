import { Injectable } from '@nestjs/common';

@Injectable()
export class OpenSearchService {
  private get baseUrl() {
    return process.env.OPENSEARCH_URL ?? '';
  }

  async isAvailable() {
    if (!this.baseUrl) return false;
    try {
      const response = await fetch(`${this.baseUrl}/_cluster/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  async search(index: string, query: string) {
    if (!(await this.isAvailable())) {
      return null;
    }

    const response = await fetch(`${this.baseUrl}/${index}/_search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        size: 20,
        query: {
          multi_match: {
            query,
            fields: ['name^3', 'slug^2', 'description', 'brandName', 'categoryName']
          }
        }
      })
    });

    if (!response.ok) return null;
    return response.json();
  }
}
