import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { formatIDR } from '@/lib/utils';

export function DealCard({ deal }: { deal: { title: string; marketplace: string; discount: number; saving: number; endsIn: string } }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge className="bg-orange-50 text-orange-700">Flash Deal</Badge>
          <h3 className="mt-3 text-lg font-extrabold tracking-tight text-slate-900">{deal.title}</h3>
          <p className="mt-2 text-sm text-slate-500">{deal.marketplace}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-orange-500">-{deal.discount}%</div>
          <div className="text-sm font-semibold text-emerald-600">Hemat {formatIDR(deal.saving)}</div>
        </div>
      </div>
      <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">Sisa waktu: {deal.endsIn}</div>
    </Card>
  );
}
