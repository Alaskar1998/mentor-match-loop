import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const TermsOfUse = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Terms of Use</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            By accessing and using SkillExchange, you agree to be bound by these Terms of Use. 
            If you do not agree to these terms, please do not use our platform.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                These Terms of Use ("Terms") govern your use of the SkillExchange platform ("Service") 
                operated by SkillExchange ("we," "us," or "our"). By creating an account or using our 
                Service, you agree to comply with and be bound by these Terms and our Privacy Policy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Description of Service</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                SkillExchange is a platform that connects individuals who want to exchange skills and knowledge. 
                Our Service allows users to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Create profiles showcasing their skills and learning interests</li>
                <li>Search for and connect with other users</li>
                <li>Send invitations and messages to potential learning partners</li>
                <li>Participate in skill exchange sessions</li>
                <li>Rate and review other users</li>
                <li>Access premium features through paid subscriptions</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. User Accounts and Registration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Account Creation</h4>
                <p className="text-muted-foreground">
                  You must provide accurate, current, and complete information when creating your account. 
                  You are responsible for maintaining the security of your account credentials.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Age Requirements</h4>
                <p className="text-muted-foreground">
                  You must be at least 13 years old to use SkillExchange. Users between 13-17 must have 
                  parental consent to use the platform.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Account Responsibility</h4>
                <p className="text-muted-foreground">
                  You are responsible for all activities that occur under your account. You must notify 
                  us immediately of any unauthorized use of your account.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. User Conduct and Prohibited Uses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground mb-4">You agree not to use SkillExchange to:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Violate any laws, regulations, or third-party rights</li>
                <li>Post false, misleading, or fraudulent information</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Send spam, unsolicited messages, or commercial content</li>
                <li>Share inappropriate, offensive, or explicit content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use automated tools to access or interact with our Service</li>
                <li>Impersonate other individuals or organizations</li>
                <li>Engage in any form of discrimination or hate speech</li>
                <li>Solicit personal information from minors</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Intellectual Property Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Platform Content</h4>
                <p className="text-muted-foreground">
                  The SkillExchange platform, including its design, features, and functionality, is owned 
                  by us and protected by copyright, trademark, and other intellectual property laws.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">User Content</h4>
                <p className="text-muted-foreground">
                  You retain ownership of content you post on SkillExchange but grant us a non-exclusive, 
                  worldwide, royalty-free license to use, display, and distribute your content in connection 
                  with operating our Service.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Premium Features and Payments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Subscription Plans</h4>
                <p className="text-muted-foreground">
                  SkillExchange offers premium subscription plans with enhanced features. Subscription 
                  fees are billed in advance on a monthly or annual basis.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Billing and Cancellation</h4>
                <p className="text-muted-foreground">
                  Subscriptions automatically renew unless cancelled. You may cancel your subscription 
                  at any time through your account settings. Refunds are not provided for partial 
                  subscription periods.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Virtual Currency</h4>
                <p className="text-muted-foreground">
                  Our platform may include virtual currency ("App Coins") for accessing certain features. 
                  Virtual currency has no real-world value and cannot be exchanged for cash.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Privacy and Data Protection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your privacy is important to us. Please review our Privacy Policy, which explains how 
                we collect, use, and protect your information when you use our Service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Disclaimers and Limitations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Service Availability</h4>
                <p className="text-muted-foreground">
                  We strive to maintain service availability but do not guarantee uninterrupted access. 
                  We may temporarily suspend or restrict access for maintenance or other reasons.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">User Interactions</h4>
                <p className="text-muted-foreground">
                  SkillExchange facilitates connections between users but is not responsible for the 
                  quality, safety, or legality of user interactions, skill exchanges, or user-generated content.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">No Warranties</h4>
                <p className="text-muted-foreground">
                  Our Service is provided "as is" without warranties of any kind, either express or implied, 
                  including but not limited to merchantability, fitness for a particular purpose, or non-infringement.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To the maximum extent permitted by law, SkillExchange shall not be liable for any indirect, 
                incidental, special, consequential, or punitive damages, including but not limited to loss 
                of profits, data, or use, arising out of or relating to your use of our Service, regardless 
                of the theory of liability.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Indemnification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                You agree to indemnify and hold SkillExchange harmless from any claims, damages, losses, 
                liabilities, and expenses arising out of your use of our Service, violation of these Terms, 
                or infringement of any third-party rights.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>11. Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                We may terminate or suspend your account at any time for violation of these Terms or for any other reason. 
                You may also terminate your account at any time by contacting us or using account deletion features.
              </p>
              <p className="text-muted-foreground">
                Upon termination, your right to use the Service will cease immediately, and we may delete 
                your account and associated data, subject to applicable law.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>12. Governing Law and Disputes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Governing Law</h4>
                <p className="text-muted-foreground">
                  These Terms are governed by and construed in accordance with the laws of [Your Jurisdiction], 
                  without regard to its conflict of law principles.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Dispute Resolution</h4>
                <p className="text-muted-foreground">
                  Any disputes arising out of or relating to these Terms or our Service shall be resolved 
                  through binding arbitration or in the courts of [Your Jurisdiction].
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>13. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We reserve the right to modify these Terms at any time. We will notify users of material 
                changes by posting the updated Terms on our platform and updating the "Last updated" date. 
                Your continued use of SkillExchange after changes become effective constitutes acceptance 
                of the revised Terms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>14. Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                If you have any questions about these Terms of Use, please contact us:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Email:</strong> legal@skillexchange.com</p>
                <p><strong>Address:</strong> SkillExchange Legal Team, 123 Learning Street, Education City, EC 12345</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse;