import "./App.css";
import ItemCard from "./components/ItemCard";

function App() {
  return (
    <div className="max-w-7xl w-full m-auto">
      <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((_, index) => (
          <ItemCard key={index} />
        ))}
      </div>
    </div>
  );
}

export default App;
