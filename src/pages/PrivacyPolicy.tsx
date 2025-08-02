import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTranslation } from "react-i18next";

const PrivacyPolicy = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{t('pages.privacy.title')}</h1>
          <p className="text-muted-foreground">
            {t('pages.privacy.lastUpdated')} {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('pages.privacy.sections.informationCollection')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">{t('pages.privacy.content.personalInformation')}</h4>
                <p className="text-muted-foreground">
                  {t('pages.privacy.content.personalInformationText')}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">{t('pages.privacy.content.usageInformation')}</h4>
                <p className="text-muted-foreground">
                  {t('pages.privacy.content.usageInformationText')}
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">{t('pages.privacy.content.technicalInformation')}</h4>
                <p className="text-muted-foreground">
                  {t('pages.privacy.content.technicalInformationText')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('pages.privacy.sections.informationUsage')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                             <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                 {t('pages.privacy.content.informationUsageList', { returnObjects: true }).map((item, index) => (
                   <li key={index}>{item}</li>
                 ))}
               </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('pages.privacy.sections.informationSharing')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground mb-4">
                {t('pages.privacy.content.informationSharingText')}
              </p>
                             <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                 {t('pages.privacy.content.informationSharingList', { returnObjects: true }).map((item, index) => (
                   <li key={index}>{item}</li>
                 ))}
               </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('pages.privacy.sections.dataSecurity')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {t('pages.privacy.content.dataSecurityText')}
              </p>
            </CardContent>
          </Card>

                     <Card>
             <CardHeader>
               <CardTitle>{t('pages.privacy.sections.userRights')}</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
               <div>
                 <h4 className="font-semibold mb-2">{t('pages.privacy.content.accountManagement')}</h4>
                 <p className="text-muted-foreground">
                   {t('pages.privacy.content.accountManagementText')}
                 </p>
               </div>
               <div>
                 <h4 className="font-semibold mb-2">{t('pages.privacy.content.dataPortability')}</h4>
                 <p className="text-muted-foreground">
                   {t('pages.privacy.content.dataPortabilityText')}
                 </p>
               </div>
               <div>
                 <h4 className="font-semibold mb-2">{t('pages.privacy.content.accountDeletion')}</h4>
                 <p className="text-muted-foreground">
                   {t('pages.privacy.content.accountDeletionText')}
                 </p>
               </div>
             </CardContent>
           </Card>

                     <Card>
             <CardHeader>
               <CardTitle>{t('pages.privacy.sections.cookies')}</CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-muted-foreground">
                 {t('pages.privacy.content.cookiesText')}
               </p>
             </CardContent>
           </Card>

                     <Card>
             <CardHeader>
               <CardTitle>{t('pages.privacy.sections.children')}</CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-muted-foreground">
                 {t('pages.privacy.content.childrenPrivacyText')}
               </p>
             </CardContent>
           </Card>

                     <Card>
             <CardHeader>
               <CardTitle>{t('pages.privacy.sections.international')}</CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-muted-foreground">
                 {t('pages.privacy.content.internationalTransfersText')}
               </p>
             </CardContent>
           </Card>

                     <Card>
             <CardHeader>
               <CardTitle>{t('pages.privacy.sections.changes')}</CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-muted-foreground">
                 {t('pages.privacy.content.changesText')}
               </p>
             </CardContent>
           </Card>

                     <Card>
             <CardHeader>
               <CardTitle>{t('pages.privacy.sections.contact')}</CardTitle>
             </CardHeader>
             <CardContent>
               <p className="text-muted-foreground mb-4">
                 {t('pages.privacy.content.contactText')}
               </p>
               <div className="space-y-2 text-muted-foreground">
                 <p><strong>{t('pages.privacy.content.contactEmail')}</strong> {t('pages.privacy.content.contactEmailValue')}</p>
                 <p><strong>{t('pages.privacy.content.contactAddress')}</strong> {t('pages.privacy.content.contactAddressValue')}</p>
               </div>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;