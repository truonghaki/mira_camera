export function EmptyState({ title, description }: { title: string; description?: string }) {
  return <div className="app-empty"><p className="font-semibold text-ink">{title}</p>{description ? <p className="mt-1 text-sm text-[#7A6C76]">{description}</p> : null}</div>;
}

export function ErrorState({ message }: { message: string }) {
  return <div className="rounded-xl border border-[#F6C8D6] bg-[#FFF0F5] px-4 py-3 text-sm text-[#A53A63]">{message}</div>;
}

export function LoadingState() {
  return <div className="app-empty"><p className="text-sm font-medium text-[#7A6C76]">Đang tải dữ liệu...</p></div>;
}