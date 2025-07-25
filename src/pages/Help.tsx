import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  HelpCircle, 
  Mail, 
  MessageCircle, 
  BookOpen, 
  Video, 
  Users, 
  Shield, 
  CreditCard,
  Search,
  Phone,
  ExternalLink
} from "lucide-react";

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const faqItems = [
    {
      category: "Getting Started",
      icon: BookOpen,
      questions: [
        {
          q: "How do I create an account?",
          a: "Click the 'Sign In' button in the header and then select 'Sign Up'. Fill in your details and verify your email address to get started."
        },
        {
          q: "How do I find people to exchange skills with?",
          a: "Use the search bar to find skills you want to learn, browse learning requests, or explore user profiles. You can filter by location, skill level, and other criteria."
        },
        {
          q: "How does skill exchange work?",
          a: "SkillExchange connects people who want to teach with those who want to learn. You can offer skills you're good at and learn new skills from others in the community."
        },
        {
          q: "Is SkillExchange free to use?",
          a: "Yes! SkillExchange offers a free tier with basic features. We also have premium plans with additional features like unlimited invitations and priority support."
        }
      ]
    },
    {
      category: "Account & Profile",
      icon: Users,
      questions: [
        {
          q: "How do I edit my profile?",
          a: "Go to your Dashboard and click on 'Profile' in the sidebar. You can update your bio, skills, location, and other information there."
        },
        {
          q: "How do I add skills to my profile?",
          a: "In your profile settings, you can add skills you want to teach and skills you want to learn. Be specific about your skill level and experience."
        },
        {
          q: "Can I change my username?",
          a: "Yes, you can update your display name in the Settings page under the Profile tab."
        },
        {
          q: "How do I delete my account?",
          a: "You can delete your account in Settings > Account > Danger Zone. Please note that this action is permanent and cannot be undone."
        }
      ]
    },
    {
      category: "Invitations & Messages",
      icon: MessageCircle,
      questions: [
        {
          q: "How do I send an invitation?",
          a: "Find a user you'd like to learn from and click 'Send Invitation' on their profile. Premium users can include personalized messages with their invitations."
        },
        {
          q: "What's the difference between free and premium invitations?",
          a: "Free users have limited invitations per month and cannot send personalized messages. Premium users get unlimited invitations with custom messages."
        },
        {
          q: "How do I respond to invitations?",
          a: "Check your Dashboard > Invites to see received invitations. You can accept, decline, or respond with questions."
        },
        {
          q: "Can I message users directly?",
          a: "You can message users you've connected with through accepted invitations. All conversations happen within SkillExchange for safety."
        }
      ]
    },
    {
      category: "Premium Features",
      icon: CreditCard,
      questions: [
        {
          q: "What are the benefits of premium membership?",
          a: "Premium members get unlimited invitations, personalized messages, priority matching, advanced analytics, and priority support."
        },
        {
          q: "How much does premium cost?",
          a: "We offer several premium plans starting at $9/month. Check our Pricing page for current rates and features."
        },
        {
          q: "Can I cancel my premium subscription?",
          a: "Yes, you can cancel anytime from Settings > Billing. Your premium features will remain active until the end of your billing period."
        },
        {
          q: "Do you offer refunds?",
          a: "We offer a 14-day money-back guarantee for new premium subscriptions. Contact support for refund requests."
        }
      ]
    },
    {
      category: "Safety & Privacy",
      icon: Shield,
      questions: [
        {
          q: "Is it safe to meet people from SkillExchange?",
          a: "We recommend starting with video calls and meeting in public places. Never share personal information like your home address or financial details."
        },
        {
          q: "How do you verify users?",
          a: "We verify email addresses and offer optional phone verification. Verified users have badges on their profiles."
        },
        {
          q: "What information is visible on my profile?",
          a: "You control what information is visible. Check Settings > Privacy to manage your profile visibility and contact information sharing."
        },
        {
          q: "How do I report inappropriate behavior?",
          a: "Use the report button on user profiles or contact our support team immediately. We take safety seriously and investigate all reports."
        }
      ]
    }
  ];

  const filteredFAQ = faqItems.map(category => ({
    ...category,
    questions: category.questions.filter(
      item => 
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement contact form submission
    console.log("Contact form submitted:", contactForm);
    alert("Thank you for your message! We'll get back to you soon.");
    setContactForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Find answers to common questions and get support
          </p>
          
          {/* Search */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
              
              {filteredFAQ.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">No articles found matching your search.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {filteredFAQ.map((category, categoryIndex) => (
                    <Card key={categoryIndex}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                          <category.icon className="w-5 h-5" />
                          {category.category}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Accordion type="single" collapsible>
                          {category.questions.map((item, index) => (
                            <AccordionItem key={index} value={`item-${categoryIndex}-${index}`}>
                              <AccordionTrigger className="text-left">
                                {item.q}
                              </AccordionTrigger>
                              <AccordionContent className="text-muted-foreground">
                                {item.a}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-3">
                  <BookOpen className="w-4 h-4" />
                  Getting Started Guide
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Video className="w-4 h-4" />
                  Video Tutorials
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Shield className="w-4 h-4" />
                  Safety Guidelines
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Users className="w-4 h-4" />
                  Community Guidelines
                </Button>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      placeholder="Your name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="Your email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="Subject"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Describe your issue..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      rows={4}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Support Options */}
            <Card>
              <CardHeader>
                <CardTitle>Other Ways to Get Help</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Email Support</div>
                    <div className="text-sm text-muted-foreground">support@skillexchange.com</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Live Chat</div>
                    <div className="text-sm text-muted-foreground">Available 24/7</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Phone Support</div>
                    <div className="text-sm text-muted-foreground">Premium members only</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">All systems operational</span>
                </div>
                <Button variant="link" className="p-0 h-auto text-sm gap-1">
                  View status page
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;