import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

const TermsOfUse = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{t('pages.terms.title')}</h1>
          <p className="text-muted-foreground">
            {t('pages.terms.lastUpdated')} {new Date().toLocaleDateString()}
          </p>
        </div>

        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {t('pages.terms.acceptance')}
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('pages.terms.sections.acceptance')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {t('pages.terms.content.acceptanceText')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('pages.terms.sections.description')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {t('pages.terms.content.descriptionText')}
              </p>
                             <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                 {t('pages.terms.content.descriptionList', { returnObjects: true }).map((item, index) => (
                   <li key={index}>{item}</li>
                 ))}
               </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('pages.terms.sections.accounts')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">{t('pages.terms.content.accountCreation')}</h4>
                <p className="text-muted-foreground">
                  {t('pages.terms.content.accountCreationText')}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">{t('pages.terms.content.ageRequirements')}</h4>
                <p className="text-muted-foreground">
                  {t('pages.terms.content.ageRequirementsText')}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">{t('pages.terms.content.accountResponsibility')}</h4>
                <p className="text-muted-foreground">
                  {t('pages.terms.content.accountResponsibilityText')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('pages.terms.sections.conduct')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground mb-4">{t('pages.terms.content.prohibitedUses')}</p>
                             <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                 {t('pages.terms.content.prohibitedList', { returnObjects: true }).map((item, index) => (
                   <li key={index}>{item}</li>
                 ))}
               </ul>
            </CardContent>
          </Card>

                     <Card>
             <CardHeader>
               <CardTitle>{t('pages.terms.sections.intellectualProperty')}</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <div>
                 <h4 className="font-semibold mb-2">{t('pages.terms.content.platformContent')}</h4>
                 <p className="text-muted-foreground">
                   {t('pages.terms.content.platformContentText')}
                 </p>
               </div>
               <div>
                 <h4 className="font-semibold mb-2">{t('pages.terms.content.userContent')}</h4>
                 <p className="text-muted-foreground">
                   {t('pages.terms.content.userContentText')}
                 </p>
               </div>
             </CardContent>
           </Card>

                     <Card>
             <CardHeader>
               <CardTitle>{t('pages.terms.sections.premiumFeatures')}</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <div>
                 <h4 className="font-semibold mb-2">{t('pages.terms.content.subscriptionPlans')}</h4>
                 <p className="text-muted-foreground">
                   {t('pages.terms.content.subscriptionPlansText')}
                 </p>
               </div>
               <div>
                 <h4 className="font-semibold mb-2">{t('pages.terms.content.billingCancellation')}</h4>
                 <p className="text-muted-foreground">
                   {t('pages.terms.content.billingCancellationText')}
                 </p>
               </div>
               <div>
                 <h4 className="font-semibold mb-2">{t('pages.terms.content.virtualCurrency')}</h4>
                 <p className="text-muted-foreground">
                   {t('pages.terms.content.virtualCurrencyText')}
                 </p>
               </div>
             </CardContent>
           </Card>

                     <Card>
             <CardHeader>
               <CardTitle>{t('pages.terms.sections.privacy')}</CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-muted-foreground">
                 {t('pages.terms.content.privacyText')}
               </p>
             </CardContent>
           </Card>

                     <Card>
             <CardHeader>
               <CardTitle>{t('pages.terms.sections.disclaimers')}</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <div>
                 <h4 className="font-semibold mb-2">{t('pages.terms.content.serviceAvailability')}</h4>
                 <p className="text-muted-foreground">
                   {t('pages.terms.content.serviceAvailabilityText')}
                 </p>
               </div>
               <div>
                 <h4 className="font-semibold mb-2">{t('pages.terms.content.userInteractions')}</h4>
                 <p className="text-muted-foreground">
                   {t('pages.terms.content.userInteractionsText')}
                 </p>
               </div>
               <div>
                 <h4 className="font-semibold mb-2">{t('pages.terms.content.noWarranties')}</h4>
                 <p className="text-muted-foreground">
                   {t('pages.terms.content.noWarrantiesText')}
                 </p>
               </div>
             </CardContent>
           </Card>

                     <Card>
             <CardHeader>
               <CardTitle>{t('pages.terms.sections.liability')}</CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-muted-foreground">
                 {t('pages.terms.content.liabilityText')}
               </p>
             </CardContent>
           </Card>

                     <Card>
             <CardHeader>
               <CardTitle>{t('pages.terms.sections.indemnification')}</CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-muted-foreground">
                 {t('pages.terms.content.indemnificationText')}
               </p>
             </CardContent>
           </Card>

                     <Card>
             <CardHeader>
               <CardTitle>{t('pages.terms.sections.termination')}</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <p className="text-muted-foreground">
                 {t('pages.terms.content.terminationText')}
               </p>
               <p className="text-muted-foreground">
                 {t('pages.terms.content.terminationText2')}
               </p>
             </CardContent>
           </Card>

                     <Card>
             <CardHeader>
               <CardTitle>{t('pages.terms.sections.governingLaw')}</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <div>
                 <h4 className="font-semibold mb-2">{t('pages.terms.content.governingLaw')}</h4>
                 <p className="text-muted-foreground">
                   {t('pages.terms.content.governingLawText')}
                 </p>
               </div>
               <div>
                 <h4 className="font-semibold mb-2">{t('pages.terms.content.disputeResolution')}</h4>
                 <p className="text-muted-foreground">
                   {t('pages.terms.content.disputeResolutionText')}
                 </p>
               </div>
             </CardContent>
           </Card>

                     <Card>
             <CardHeader>
               <CardTitle>{t('pages.terms.sections.changes')}</CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-muted-foreground">
                 {t('pages.terms.content.changesText')}
               </p>
             </CardContent>
           </Card>

                     <Card>
             <CardHeader>
               <CardTitle>{t('pages.terms.sections.contact')}</CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-muted-foreground mb-4">
                 {t('pages.terms.content.contactText')}
               </p>
               <div className="space-y-2 text-muted-foreground">
                 <p><strong>{t('pages.terms.content.contactEmail')}</strong> {t('pages.terms.content.contactEmailValue')}</p>
                 <p><strong>{t('pages.terms.content.contactAddress')}</strong> {t('pages.terms.content.contactAddressValue')}</p>
               </div>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;