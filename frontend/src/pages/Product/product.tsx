import { useParams } from "react-router-dom";

const ProductDetails = () => {
  const { id } = useParams();
  return (
    <div className="container mx-auto p-4">
      <h1 className="">Product Details Page of {id}</h1>
      <p>Details about the product will be shown here.</p>
    </div>
  );
};

export default ProductDetails;
