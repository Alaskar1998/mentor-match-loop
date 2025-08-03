import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  MessageCircle, 
  Phone, 
  Clock, 
  CheckCircle,
  Send,
  User,
  AlertCircle,
  Lightbulb
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";

interface ContactForm {
  name: string;
  email: string;
  inquiryType: string;
  message: string;
}

const ContactSupport = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactForm, setContactForm] = useState<ContactForm>({
    name: "",
    email: "",
    inquiryType: "",
    message: ""
  });

  const inquiryTypes = [
    {
      value: "collaboration",
      label: "Collaboration",
      description: "I want to collaborate or partner with Maharat Hub",
      icon: User,
      color: "bg-blue-100 text-blue-800"
    },
    {
      value: "problem",
      label: "Problem/Issue",
      description: "I'm experiencing a technical issue or problem",
      icon: AlertCircle,
      color: "bg-red-100 text-red-800"
    },
    {
      value: "feature",
      label: "Feature Request",
      description: "I'd like to suggest a new feature or improvement",
      icon: Lightbulb,
      color: "bg-green-100 text-green-800"
    },
    {
      value: "general",
      label: "General Inquiry",
      description: "I have a general question or feedback",
      icon: MessageCircle,
      color: "bg-gray-100 text-gray-800"
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call - replace with actual email service integration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would typically send the email using a service like:
      // - EmailJS
      // - Formspree
      // - Netlify Forms
      // - Your own backend API
      
      console.log("Contact form submitted:", contactForm);
      
      toast({
        title: t('contactSupport.form.success'),
        description: t('contactSupport.form.successDescription'),
        icon: <CheckCircle className="h-4 w-4" />
      });

      // Reset form
      setContactForm({
        name: "",
        email: "",
        inquiryType: "",
        message: ""
      });
    } catch (error) {
      toast({
        title: t('contactSupport.form.error'),
        description: t('contactSupport.form.errorDescription'),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t('contactSupport.title')}</h1>
          <p className="text-xl text-muted-foreground mb-8">
            {t('contactSupport.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  {t('contactSupport.form.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name and Email */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('contactSupport.form.name')} *</Label>
                      <Input
                        id="name"
                        placeholder={t('contactSupport.form.namePlaceholder')}
                        value={contactForm.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('contactSupport.form.email')} *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={t('contactSupport.form.emailPlaceholder')}
                        value={contactForm.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Inquiry Type */}
                  <div className="space-y-2">
                    <Label htmlFor="inquiryType">{t('contactSupport.form.inquiryType')} *</Label>
                    <Select
                      value={contactForm.inquiryType}
                      onValueChange={(value) => handleInputChange("inquiryType", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('contactSupport.form.inquiryTypePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {inquiryTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="w-4 h-4" />
                              {t(`contactSupport.inquiryTypes.${type.value}.label`)}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message">{t('contactSupport.form.message')} *</Label>
                    <Textarea
                      id="message"
                      placeholder={t('contactSupport.form.messagePlaceholder')}
                      value={contactForm.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      rows={6}
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t('contactSupport.form.sending')}
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        {t('contactSupport.form.sendMessage')}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Inquiry Types Info */}
            <Card>
              <CardHeader>
                <CardTitle>{t('contactSupport.sidebar.inquiryTypes')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {inquiryTypes.map((type) => (
                  <div key={type.value} className="flex items-start gap-3">
                    <Badge className={type.color}>
                      <type.icon className="w-3 h-3 mr-1" />
                      {t(`contactSupport.inquiryTypes.${type.value}.label`)}
                    </Badge>
                    <p className="text-sm text-muted-foreground">{t(`contactSupport.inquiryTypes.${type.value}.description`)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Response Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {t('contactSupport.sidebar.responseTime')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{t('contactSupport.sidebar.responseTimeDescription')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{t('contactSupport.sidebar.detailedResponses')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{t('contactSupport.sidebar.followUpSupport')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Other Contact Methods */}
            <Card>
              <CardHeader>
                <CardTitle>{t('contactSupport.sidebar.otherWays')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{t('contactSupport.sidebar.email')}</div>
                    <div className="text-sm text-muted-foreground">{t('contactSupport.sidebar.emailAddress')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{t('contactSupport.sidebar.liveChat')}</div>
                    <div className="text-sm text-muted-foreground">{t('contactSupport.sidebar.liveChatDescription')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{t('contactSupport.sidebar.phone')}</div>
                    <div className="text-sm text-muted-foreground">{t('contactSupport.sidebar.phoneDescription')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Link */}
            <Card>
              <CardHeader>
                <CardTitle>{t('contactSupport.sidebar.quickHelp')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {t('contactSupport.sidebar.quickHelpDescription')}
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <a href="/help">{t('contactSupport.sidebar.viewFAQ')}</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSupport; 