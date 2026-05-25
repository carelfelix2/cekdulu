import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class ProductImportService {
  private readonly logger = new Logger(ProductImportService.name);

  constructor(private readonly prismaService: PrismaService) {}

  private get prisma() {
    return this.prismaService.client;
  }

  private getScraperBase() {
    return (process.env.SCRAPER_API_BASE_URL || 'http://localhost:8010').replace(/\/$/, '');
  }

  private slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 80);
  }

  private buildProductSlug(name: string, itemId?: string | null) {
    const base = this.slugify(name || 'produk') || 'produk';
    const tailSource = itemId || `${Date.now()}`;
    const tail = this.slugify(String(tailSource)).replace(/-/g, '').slice(-10);
    return tail ? `${base}-${tail}` : base;
  }

  async fetchProduct(url: string) {
    this.logger.log(`Import fetch requested for ${url}`);
    // basic validation
    try {
      const parsed = new URL(url);
      if (!parsed.hostname) throw new Error('Invalid URL');
    } catch (err) {
      throw new BadRequestException('Invalid URL');
    }

    // detect marketplace
    const marketplace = this.detectMarketplace(url);
    if (marketplace === 'unknown') {
      throw new BadRequestException('Unsupported marketplace');
    }

    const scraperBase = this.getScraperBase();
    if (!scraperBase) throw new BadRequestException('SCRAPER_API_BASE_URL not configured. Run scraper server or set SCRAPER_API_BASE_URL');

    const endpoint = `${scraperBase}/product`;
    this.logger.log(`Calling scraper ${endpoint} for ${url}`);

    const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
    if (!res.ok) {
      const text = await res.text();
      this.logger.error(`Scraper returned ${res.status}: ${text}`);
      throw new BadRequestException(`Scraper error ${res.status}: ${text}`);
    }

    const data = await res.json();
    if (!data || !data.productName) {
      throw new BadRequestException('Scraper returned empty data');
    }

    return { product: data };
  }

  private detectMarketplace(url: string) {
    try {
      const u = new URL(url);
      const host = u.hostname.toLowerCase();
      if (host.includes('shopee.')) return 'shopee';
      if (host.includes('tokopedia.')) return 'tokopedia';
      if (host.includes('lazada.')) return 'lazada';
      if (host.includes('blibli.')) return 'blibli';
      if (host.includes('bukalapak.')) return 'bukalapak';
      return 'unknown';
    } catch (err) {
      return 'unknown';
    }
  }

  async saveProduct(productData: any, createdBy: string | null) {
    this.logger.log('Saving imported product');
    if (!productData || !productData.productUrl) throw new BadRequestException('Invalid product data');

    const marketplace = await this.prisma.marketplace.findFirst({ where: { OR: [{ slug: productData.marketplace }, { id: productData.marketplace }] } });
    if (!marketplace) throw new BadRequestException('Marketplace not configured');

    const productUrl = String(productData.productUrl);
    const itemId = productData.itemId ? String(productData.itemId) : null;
    const shopId = productData.shopId ? String(productData.shopId) : null;
    const productName = String(productData.productName ?? productData.title ?? 'Imported product');

    // deduplicate by productUrl or marketplace+itemId
    let existingListing = null;
    if (productUrl) {
      existingListing = await this.prisma.productListing.findFirst({ where: { externalUrl: productUrl } });
    }
    if (!existingListing && itemId) {
      existingListing = await this.prisma.productListing.findFirst({ where: { AND: [{ marketplaceId: marketplace.id }, { externalId: itemId }] } });
    }

    // slug
    const slug = this.buildProductSlug(productName, itemId);

    let product = await this.prisma.product.findUnique({ where: { slug } });
    if (!product) {
      product = await this.prisma.product.create({ data: { slug, name: productName, description: productData.description ?? null, imageUrl: productData.imageUrl ?? null, status: 'DRAFT' } as any });
      this.logger.log(`Created product ${product.id}`);
    } else {
      // update minimal fields
      await this.prisma.product.update({ where: { id: product.id }, data: { name: productName, imageUrl: productData.imageUrl ?? product.imageUrl } as any });
    }

    // create/update listing
    let listing = existingListing
      ? await this.prisma.productListing.update({ where: { id: existingListing.id }, data: { title: productName, externalUrl: productUrl, price: productData.price ?? existingListing.price, originalPrice: productData.originalPrice ?? existingListing.originalPrice, imageUrl: productData.imageUrl ?? existingListing.imageUrl, soldCount: productData.soldCount ?? existingListing.soldCount, reviewCount: productData.reviewCount ?? existingListing.reviewCount } as any })
      : await this.prisma.productListing.create({ data: { productId: product.id, marketplaceId: marketplace.id, externalId: itemId ?? String(Date.now()), title: productName, externalUrl: productUrl, price: productData.price ?? 0, originalPrice: productData.originalPrice ?? null, imageUrl: productData.imageUrl ?? null, rating: productData.rating ?? 0, reviewCount: productData.reviewCount ?? 0, soldCount: productData.soldCount ?? 0 } as any });

    // product price snapshot
    if (Number.isFinite(productData.price) && productData.price > 0) {
      await this.prisma.productPrice.create({ data: { productId: product.id, marketplaceId: marketplace.id, price: productData.price, originalPrice: productData.originalPrice ?? null, discount: productData.discount ?? 0, rating: productData.rating ?? 0, soldCount: productData.soldCount ?? 0, reviewCount: productData.reviewCount ?? 0, productUrl, isActive: true } as any });
    }

    // create affiliate link
    const shortCode = `imp-${product.id.slice(0, 6)}`;
    const tracking = `import-${Date.now()}`;
    const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_BASE_URL ?? 'http://localhost:3000'}/go/${product.id}`;
    const affiliate = await this.prisma.affiliateLink.create({ data: { productId: product.id, marketplaceId: marketplace.id, url: productUrl, affiliateUrl: redirectUrl, shortCode, trackingCode: tracking, isPrimary: true, isActive: true } as any });

    // record raw as scrapedProduct for now
    await this.prisma.scrapedProduct.create({ data: { productName, productUrl, imageUrl: productData.imageUrl ?? null, price: productData.price ?? null, rating: productData.rating ?? 0, soldCount: productData.soldCount ?? 0, reviewCount: productData.reviewCount ?? 0, itemId, shopId, marketplaceId: marketplace.id, keyword: 'import', rawData: productData, status: 'APPROVED' } as any });

    return { productId: product.id, listingId: listing.id, affiliateId: affiliate.id };
  }

  async history(opts: { limit?: number }) {
    const items = await this.prisma.scrapedProduct.findMany({ orderBy: { scrapedAt: 'desc' }, take: opts.limit ?? 50, include: { marketplace: true } });
    return items;
  }
}
