import { formatIDR } from '@/lib/utils';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import type { UiProduct } from '@/lib/mock-data';

export function ComparisonTable({ product }: { product: UiProduct }) {
  const cheapest = Math.min(...product.marketplaces.map((item) => item.price));

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="text-sm font-semibold text-slate-900">Perbandingan harga real-time</div>
        <div className="mt-1 text-xs text-slate-500">Data marketplace aktif untuk MVP: Shopee, Tokopedia, TikTok Shop</div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Marketplace</th>
              <th className="px-5 py-3">Harga</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {product.marketplaces.map((item) => {
              const isCheapest = item.price === cheapest;
              return (
                <tr key={item.marketplace.slug} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4 font-semibold text-slate-900">{item.marketplace.name}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className={isCheapest ? 'font-extrabold text-emerald-600' : 'font-bold text-slate-900'}>{formatIDR(item.price)}</span>
                      {isCheapest ? <Badge className="bg-emerald-50 text-emerald-700">Termurah</Badge> : null}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{item.stockStatus.replaceAll('_', ' ')}</td>
                  <td className="px-5 py-4">
                    <Button size="sm" variant="primary">Beli Sekarang</Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
