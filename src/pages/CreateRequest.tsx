import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Coins, Crown, Info } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const SKILL_LEVELS = ["Beginner", "Intermediate", "Expert"];
const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany", 
  "France", "Spain", "Italy", "Japan", "South Korea", "India", "Brazil",
  "United Arab Emirates", "Saudi Arabia", "Egypt", "Jordan", "Lebanon",
  "Kuwait", "Qatar", "Bahrain", "Oman", "Morocco", "Tunisia", "Algeria",
  "Libya", "Iraq", "Syria", "Yemen", "Palestine", "Sudan", "Iran",
  "Turkey", "Israel", "Cyprus"
];

interface LearningRequest {
  skill: string;
  level: string;
  description: string;
  country: string;
  urgency: string;
}

export const CreateRequest = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [request, setRequest] = useState<LearningRequest>({
    skill: "",
    level: "",
    description: "",
    country: "",
    urgency: "flexible"
  });

  // Mock user data - in real app, this would come from user profile/subscription
  const [userTier] = useState<"free" | "premium">("free");
  const remainingPosts = userTier === "premium" ? 2 : 0; // For premium users
  const postPrice = 2.99; // Price per post for free users

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to create a learning request");
      return;
    }

    if (!request.skill || !request.level || !request.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      if (userTier === "free") {
        // Free user - needs to pay
        await handlePayment();
      } else if (userTier === "premium" && remainingPosts > 0) {
        // Premium user with remaining posts
        await submitRequest();
      } else if (userTier === "premium" && remainingPosts === 0) {
        // Premium user exceeded free posts
        await handlePayment();
      }
    } catch (error) {
      toast.error("Failed to create request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async () => {
    // TODO: Integrate with Stripe for one-off payment
    toast.info(`Payment integration needed - $${postPrice} per post`);
    // After successful payment, call submitRequest()
    await submitRequest();
  };

  const submitRequest = async () => {
    // TODO: Submit to backend/database
    console.log("Submitting request:", request);
    toast.success("Learning request created successfully!");
    navigate("/requests-feed");
  };

  const isPaymentRequired = userTier === "free" || (userTier === "premium" && remainingPosts === 0);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Create Learning Request</h1>
            <p className="text-muted-foreground">
              Tell the community what you want to learn and get matched with teachers
            </p>
          </div>

          {/* User Status */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {userTier === "premium" ? (
                    <Crown className="w-5 h-5 text-amber-500" />
                  ) : (
                    <Coins className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div>
                    <div className="font-medium">
                      {userTier === "premium" ? "Premium Member" : "Free Member"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {userTier === "premium" 
                        ? `${remainingPosts} free posts remaining this month`
                        : `$${postPrice} per learning request post`
                      }
                    </div>
                  </div>
                </div>
                {userTier === "premium" && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                    <Crown className="w-3 h-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="skill">What do you want to learn? *</Label>
                <Input
                  id="skill"
                  placeholder="e.g., Guitar, Spanish, Photography, Coding"
                  value={request.skill}
                  onChange={(e) => setRequest(prev => ({ ...prev, skill: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="level">Your current level *</Label>
                <Select onValueChange={(value) => setRequest(prev => ({ ...prev, level: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your current level" />
                  </SelectTrigger>
                  <SelectContent>
                    {SKILL_LEVELS.map(level => (
                      <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Tell us more about what you want to learn *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your learning goals, preferred teaching style, time availability, etc."
                  value={request.description}
                  onChange={(e) => setRequest(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="country">Your Country</Label>
                <Select onValueChange={(value) => setRequest(prev => ({ ...prev, country: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map(country => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="urgency">Urgency</Label>
                <Select onValueChange={(value) => setRequest(prev => ({ ...prev, urgency: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="How urgent is this request?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent - Within a week</SelectItem>
                    <SelectItem value="soon">Soon - Within a month</SelectItem>
                    <SelectItem value="flexible">Flexible - No rush</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isPaymentRequired && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    {userTier === "free" 
                      ? `This post costs $${postPrice}. You'll be redirected to payment after clicking "Create Request".`
                      : "You've used all your free posts this month. This post will be charged separately."
                    }
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => navigate(-1)} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isAuthenticated}
                  className="flex-1"
                >
                  {isSubmitting ? "Creating..." : `Create Request ${isPaymentRequired ? `($${postPrice})` : ""}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};