"use client";
import { useEffect, useState } from "react";
import Header from "./Header";

interface Category {
  _id?: string;
  name: string;
}

export default function HeaderWithCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    fetch("https://lindo-project.onrender.com/category/getAllCategories")
      .then((res) => res.json())
      .then((data) => {
        let cats = [];
        if (Array.isArray(data)) cats = data;
        else if (data && Array.isArray(data.categories)) cats = data.categories;
        setCategories(cats);
      })
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);
  return <Header
    categories={categories}
    loading={loading}
    onCategoryClick={(cat) => {
      if (cat._id) {
        // Navigate to all-products with category filtering
        window.location.href = `/all-products?category=${encodeURIComponent(cat.name)}`;
      }
    }}
  />;
} 