import React from "react";

interface Params {
  categorySlug: string;
}

const CategoryPage = async ({ params }: { params: Promise<Params> }) => {
  const slug = await params;

  return <div>{slug.categorySlug}</div>;
};

export default CategoryPage;
