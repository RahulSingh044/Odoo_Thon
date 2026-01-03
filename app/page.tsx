import LoginForm from "@/components/auth/login";
import RegisterForm from "@/components/auth/register";

export default function Home() {
  return (
    <div className="min-h-screen">
      <LoginForm />
      {/* <RegisterForm /> */}
    </div>
  );
}
