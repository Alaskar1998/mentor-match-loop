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
import { useTranslation } from "react-i18next";

const Help = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const faqItems = [
    {
      category: t('help.categories.gettingStarted'),
      icon: BookOpen,
      questions: [
        {
          q: t('faq.questions.howSkillExchangeWorks.question'),
          a: t('faq.questions.howSkillExchangeWorks.answer')
        },
        {
          q: t('faq.questions.isItFree.question'),
          a: t('faq.questions.isItFree.answer')
        },
        {
          q: t('faq.questions.howToFindTeacher.question'),
          a: t('faq.questions.howToFindTeacher.answer')
        },
        {
          q: t('faq.questions.noSkillsToTeach.question'),
          a: t('faq.questions.noSkillsToTeach.answer')
        }
      ]
    },
    {
      category: t('help.categories.accountProfile'),
      icon: Users,
      questions: [
        {
          q: t('faq.questions.editProfile.question'),
          a: t('faq.questions.editProfile.answer')
        },
        {
          q: t('faq.questions.addSkills.question'),
          a: t('faq.questions.addSkills.answer')
        },
        {
          q: t('faq.questions.changeUsername.question'),
          a: t('faq.questions.changeUsername.answer')
        },
        {
          q: t('faq.questions.deleteAccount.question'),
          a: t('faq.questions.deleteAccount.answer')
        }
      ]
    },
    {
      category: t('help.categories.invitationsMessages'),
      icon: MessageCircle,
      questions: [
        {
          q: t('faq.questions.sendInvitation.question'),
          a: t('faq.questions.sendInvitation.answer')
        },
        {
          q: t('faq.questions.invitationDifference.question'),
          a: t('faq.questions.invitationDifference.answer')
        },
        {
          q: t('faq.questions.respondInvitation.question'),
          a: t('faq.questions.respondInvitation.answer')
        },
        {
          q: t('faq.questions.messageUsers.question'),
          a: t('faq.questions.messageUsers.answer')
        }
      ]
    },
    {
      category: t('help.categories.premiumFeatures'),
      icon: CreditCard,
      questions: [
        {
          q: t('faq.questions.premiumBenefits.question'),
          a: t('faq.questions.premiumBenefits.answer')
        },
        {
          q: t('faq.questions.premiumCost.question'),
          a: t('faq.questions.premiumCost.answer')
        },
        {
          q: t('faq.questions.cancelPremium.question'),
          a: t('faq.questions.cancelPremium.answer')
        },
        {
          q: t('faq.questions.refunds.question'),
          a: t('faq.questions.refunds.answer')
        }
      ]
    },
    {
      category: t('help.categories.safetySecurity'),
      icon: Shield,
      questions: [
        {
          q: t('faq.questions.safety.question'),
          a: t('faq.questions.safety.answer')
        },
        {
          q: t('faq.questions.verifyUsers.question'),
          a: t('faq.questions.verifyUsers.answer')
        },
        {
          q: t('faq.questions.profileVisibility.question'),
          a: t('faq.questions.profileVisibility.answer')
        },
        {
          q: t('faq.questions.reportBehavior.question'),
          a: t('faq.questions.reportBehavior.answer')
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
    alert(t('contactSupport.form.success'));
    setContactForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t('help.title')}</h1>
          <p className="text-xl text-muted-foreground mb-8">
            {t('help.subtitle')}
          </p>
          
          {/* Search */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder={t('help.searchPlaceholder')}
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
              <h2 className="text-2xl font-bold mb-6">{t('faq.title')}</h2>
              
              {filteredFAQ.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">{t('help.noArticlesFound')}</p>
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
                <CardTitle>{t('help.quickLinks.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-3">
                  <BookOpen className="w-4 h-4" />
                  {t('help.quickLinks.gettingStartedGuide')}
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Video className="w-4 h-4" />
                  {t('help.quickLinks.videoTutorials')}
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Shield className="w-4 h-4" />
                  {t('help.quickLinks.safetyGuidelines')}
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Users className="w-4 h-4" />
                  {t('help.quickLinks.communityGuidelines')}
                </Button>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card>
              <CardHeader>
                <CardTitle>{t('help.contact.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      placeholder={t('help.contact.namePlaceholder')}
                      value={contactForm.name}
                      onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder={t('help.contact.emailPlaceholder')}
                      value={contactForm.email}
                      onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder={t('help.contact.subjectPlaceholder')}
                      value={contactForm.subject}
                      onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Textarea
                      placeholder={t('help.contact.messagePlaceholder')}
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      rows={4}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {t('help.contact.sendMessage')}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Support Options */}
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

                         {/* Status */}
             <Card>
               <CardHeader>
                 <CardTitle>{t('contactSupport.systemStatus.title')}</CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="flex items-center gap-2 mb-2">
                   <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                   <span className="font-medium">{t('contactSupport.systemStatus.operational')}</span>
                 </div>
                 <Button variant="link" className="p-0 h-auto text-sm gap-1">
                   {t('contactSupport.systemStatus.viewStatusPage')}
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