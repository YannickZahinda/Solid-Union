import { useEffect, useState } from "react";
import { getAllProducts, addProduct } from "@/services/productService";

const SellerDashboard = () => {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    getAllProducts().then(setProducts);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">My Products</h1>
      <ul>
        {products.map((p) => (
          <li key={p._id}>{p.title} - ${p.price}</li>
        ))}
      </ul>
    </div>
  );
};

export default SellerDashboard;
