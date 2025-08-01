import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslation } from "react-i18next";

export const FAQSection = React.memo(() => {
  const { t } = useTranslation();

  const faqs = [
    {
      question: t('faq.questions.howSkillExchangeWorks.question'),
      answer: t('faq.questions.howSkillExchangeWorks.answer')
    },
    {
      question: t('faq.questions.isItFree.question'),
      answer: t('faq.questions.isItFree.answer')
    },
    {
      question: t('faq.questions.howToFindTeacher.question'),
      answer: t('faq.questions.howToFindTeacher.answer')
    },
    {
      question: t('faq.questions.noSkillsToTeach.question'),
      answer: t('faq.questions.noSkillsToTeach.answer')
    },
    {
      question: t('faq.questions.safeLearningEnvironment.question'),
      answer: t('faq.questions.safeLearningEnvironment.answer')
    },
    {
      question: t('faq.questions.multipleSkills.question'),
      answer: t('faq.questions.multipleSkills.answer')
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              {t('faq.title')}
            </h2>
            <p className="text-xl text-muted-foreground">
              {t('faq.subtitle')}
            </p>
          </div>

          {/* FAQ Accordion */}
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-border rounded-lg px-6 shadow-card hover:shadow-elegant transition-all duration-300 bg-card"
              >
                <AccordionTrigger className="text-left hover:no-underline py-6 text-lg font-semibold text-foreground hover:text-primary transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-6 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Still have questions CTA */}
          <div className="text-center mt-12 p-8 bg-gradient-subtle rounded-lg border border-border">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              {t('actions.stillHaveQuestions')}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t('actions.cantFindLookingFor')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium">
                {t('actions.contactSupport')}
              </button>
              <button className="px-6 py-3 border border-border text-foreground rounded-lg hover:bg-muted transition-colors font-medium">
                {t('actions.viewHelpCenter')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});