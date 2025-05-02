
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import GemFetchButton from "@/components/GemFetchButton";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to Admin Data Nexus</h1>
        <p className="text-xl text-gray-600 mb-8">Your central hub for bid and document management</p>
        <div className="flex flex-col gap-4 sm:flex-row sm:gap-6 justify-center">
          <Link to="/admin">
            <Button className="bg-primary hover:bg-primary/90">
              Go to Admin Dashboard
            </Button>
          </Link>
          <GemFetchButton />
        </div>
      </div>
    </div>
  );
};

export default Index;
