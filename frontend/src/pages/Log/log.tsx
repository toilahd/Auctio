import { Button } from "@/components/ui/button";

const Log = () => {
  const googleLogin = async () => {
    window.location.href = "http://localhost:4000/login/federated/google";
  };

  return (
    <div className="max-w-4xl w-full m-auto">
      <h1>Login Page</h1>
      <form
        action={"http://localhost:4000/login"}
        method="POST"
        className="flex flex-col gap-4"
      >
        <div>
          <label htmlFor="username">Username:</label>
          <input className="border" type="text" id="username" name="username" />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            className="border"
            type="password"
            id="password"
            name="password"
          />
        </div>
        <Button type="submit" className="w-min">
          Login
        </Button>
      </form>

      <hr className="my-4" />

      <Button onClick={googleLogin}>Sign in with Google</Button>
    </div>
  );
};

export default Log;
