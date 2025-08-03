import React from "react";
import { Link } from "react-router-dom";
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
    <section className="py-12 sm:py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6 px-2">
              {t('faq.title')}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-4">
              {t('faq.subtitle')}
            </p>
          </div>

          {/* FAQ Accordion */}
          <Accordion type="single" collapsible className="space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-border rounded-lg px-4 sm:px-6 shadow-card hover:shadow-elegant transition-all duration-300 bg-card"
              >
                <AccordionTrigger className="text-left hover:no-underline py-4 sm:py-6 text-base sm:text-lg font-semibold text-foreground hover:text-primary transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-4 sm:pb-6 text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Still have questions CTA */}
          <div className="text-center mt-8 sm:mt-12 p-6 sm:p-8 bg-gradient-subtle rounded-lg border border-border">
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4 px-2">
              {t('actions.stillHaveQuestions')}
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 px-4">
              {t('actions.cantFindLookingFor')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link to="/contact" className="px-4 sm:px-6 py-2 sm:py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm sm:text-base">
                {t('actions.contactSupport')}
              </Link>
              <Link to="/help" className="px-4 sm:px-6 py-2 sm:py-3 border border-border text-foreground rounded-lg hover:bg-muted transition-colors font-medium text-sm sm:text-base">
                {t('actions.viewHelpCenter')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});