export function MapLegend() {
  return (
    <div className="flex items-center gap-6 text-sm font-body font-medium text-wiraText-secondary">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-none bg-cluster-potensial ring-2 ring-white shadow-sm" />
        <span>Potensial</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-none bg-cluster-ramai ring-2 ring-white shadow-sm" />
        <span>Ramai</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-none bg-cluster-sepi ring-2 ring-white shadow-sm" />
        <span>Sepi</span>
      </div>
    </div>
  );
}
