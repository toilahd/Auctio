import { useEffect, useState } from "react";

const AccountPage = ({ isSelf = false }: { isSelf: boolean }) => {
  const [accountData, setAccountData] = useState<any>(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/whoami`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        setAccountData(data);
      } catch (error) {
        console.error("Error fetching account data:", error);
      }
    };

    fetchAccountData();
  }, []);

  return (
    <div>
      Account Page
      {isSelf && <h1>Tài khoản của tôi</h1>}
      {accountData ? (
        <pre>{JSON.stringify(accountData, null, 2)}</pre>
      ) : (
        <p>Đang tải dữ liệu tài khoản...</p>
      )}
    </div>
  );
};

export default AccountPage;
