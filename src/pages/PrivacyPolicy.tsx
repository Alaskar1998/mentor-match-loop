import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Personal Information</h4>
                <p className="text-muted-foreground">
                  When you create an account, we collect information such as your name, email address, 
                  profile picture, bio, country, and skills. We also collect any additional information 
                  you choose to provide in your profile.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Usage Information</h4>
                <p className="text-muted-foreground">
                  We collect information about how you use SkillExchange, including your interactions, 
                  messages sent, skills exchanged, and platform activity.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Technical Information</h4>
                <p className="text-muted-foreground">
                  We automatically collect certain technical information, including your IP address, 
                  device type, browser information, and operating system.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Provide and maintain our skill exchange platform</li>
                <li>Match you with appropriate learning partners</li>
                <li>Facilitate communication between users</li>
                <li>Send you notifications about your account and platform activity</li>
                <li>Improve our services and develop new features</li>
                <li>Ensure platform security and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Information Sharing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>With other users:</strong> Your profile information is visible to other platform users to facilitate skill exchanges</li>
                <li><strong>Service providers:</strong> We may share information with trusted third-party service providers who assist in operating our platform</li>
                <li><strong>Legal requirements:</strong> We may disclose information when required by law or to protect our rights and safety</li>
                <li><strong>Business transfers:</strong> In the event of a merger or acquisition, user information may be transferred as part of the business assets</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Data Security</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We implement appropriate security measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction. This includes encryption, 
                secure servers, and regular security assessments. However, no internet transmission is 
                100% secure, and we cannot guarantee absolute security.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Your Rights and Choices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Account Management</h4>
                <p className="text-muted-foreground">
                  You can update, correct, or delete your account information at any time through your profile settings.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Data Portability</h4>
                <p className="text-muted-foreground">
                  You have the right to request a copy of your personal data in a portable format.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Account Deletion</h4>
                <p className="text-muted-foreground">
                  You may delete your account at any time. Upon deletion, your personal information will be removed from our systems, though some information may be retained for legal or legitimate business purposes.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We use cookies and similar technologies to enhance your experience, analyze platform usage, 
                and provide personalized content. You can control cookie settings through your browser, 
                though this may affect platform functionality.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                SkillExchange is not intended for children under 13 years of age. We do not knowingly 
                collect personal information from children under 13. If we become aware that we have 
                collected such information, we will take steps to delete it promptly.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your information may be transferred to and processed in countries other than your own. 
                We ensure appropriate safeguards are in place to protect your data in accordance with 
                this privacy policy and applicable laws.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We may update this privacy policy from time to time. We will notify you of any material 
                changes by posting the new policy on this page and updating the "Last updated" date. 
                Your continued use of SkillExchange after changes become effective constitutes acceptance 
                of the revised policy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                If you have any questions about this privacy policy or our data practices, please contact us:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Email:</strong> privacy@skillexchange.com</p>
                <p><strong>Address:</strong> SkillExchange Privacy Team, 123 Learning Street, Education City, EC 12345</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;