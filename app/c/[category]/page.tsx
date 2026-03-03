// app/c/[category]/page.tsx
import CategoryClient from "./CategoryClient";

export default async function Page({
  params,
}: {
  params: { category: string } | Promise<{ category: string }>;
}) {
  const resolved = await Promise.resolve(params);
  const category = resolved.category ?? "elektronik";

 return <CategoryClient category={String(category)} />;
}

