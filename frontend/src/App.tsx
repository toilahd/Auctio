import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [apiResult, setApiResult] = useState<string>("Nothing");
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const response = await fetch("http://localhost:4000/whoami", {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setApiResult(JSON.stringify(data, null, 2));
        } else {
          console.error("Failed to fetch user info");
          setApiResult("Failed to fetch user info");
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
        setApiResult("Error fetching user info");
      }
    };

    getUserInfo();
  }, []);
  return (
    <div className="max-w-4xl w-full m-auto">
      <pre>{apiResult}</pre>

      <a href="/Log">Go to login page</a>
      {/* <div className="flex flex-wrap gap-2">
        {[1, 2, 3, 4, 5].map((_, index) => (
          <ItemCard key={index} />
        ))}
      </div> */}
    </div>
  );
}

export default App;
