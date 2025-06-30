import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { ZadexApi } from "@/services/zadexApi";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferredCurrency, setPreferredCurrency] = useState("ILS");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await ZadexApi.register(
        name,
        email,
        password,
        preferredCurrency
      );

      if (response.success && response.data) {
        // Registration successful
        localStorage.setItem("userData", JSON.stringify(response.data));
        navigate("/login"); // Redirect to login page
      } else {
        // Handle registration error
        setError(
          response.error || "Registration failed. Please check your details."
        );
        console.error("Registration failed:", response.error);
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Registration error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-white">
            Create Account
          </CardTitle>
          <CardDescription className="text-center text-slate-300">
            Join Zadex digital wallet platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert
              variant="destructive"
              className="bg-red-900/50 border-red-800 text-red-200"
            >
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                placeholder="Create a password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredCurrency" className="text-white">
                Preferred Currency
              </Label>
              <select
                id="preferredCurrency"
                value={preferredCurrency}
                onChange={(e) => setPreferredCurrency(e.target.value)}
                required
                className="bg-slate-700/50 border-slate-600 text-white w-full rounded px-3 py-2 focus:border-blue-500"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="ILS">ILS - Israeli Shekel</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="JPY">JPY - Japanese Yen</option>
              </select>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </form>

          <div className="text-center">
            <p className="text-slate-300">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
