import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Eye, Database, Cookie, UserCheck, Mail } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
            <p className="text-lg text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          <Card className="bg-card border-border mb-8">
            <CardHeader>
              <CardTitle>Our Commitment to Your Privacy</CardTitle>
              <CardDescription>
                At GameHub, we take your privacy seriously. This Privacy Policy explains how we collect, 
                use, disclose, and safeguard your information when you visit our website and use our gaming platform.
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="space-y-8">
            {/* Information We Collect */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-5 w-5 mr-2 text-primary" />
                  Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Personal Information</h3>
                  <p className="text-muted-foreground mb-2">
                    We may collect personal information that you voluntarily provide to us when you:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                    <li>Contact us through our contact form</li>
                    <li>Subscribe to our newsletter</li>
                    <li>Submit feedback or reviews</li>
                    <li>Report bugs or technical issues</li>
                  </ul>
                  <p className="text-muted-foreground mt-2">
                    This information may include your name, email address, and any other information you choose to provide.
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-foreground mb-2">Automatically Collected Information</h3>
                  <p className="text-muted-foreground mb-2">
                    When you visit our website, we automatically collect certain information about your device and usage:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                    <li>IP address and geographic location</li>
                    <li>Browser type and version</li>
                    <li>Operating system</li>
                    <li>Pages visited and time spent on each page</li>
                    <li>Games played and play duration</li>
                    <li>Referring website</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* How We Use Information */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-primary" />
                  How We Use Your Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  We use the information we collect for various purposes, including:
                </p>
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>To provide, operate, and maintain our gaming platform</li>
                  <li>To improve, personalize, and expand our website and services</li>
                  <li>To understand and analyze how you use our website</li>
                  <li>To develop new games, products, services, and features</li>
                  <li>To communicate with you about updates, security alerts, and support</li>
                  <li>To respond to your comments, questions, and customer service requests</li>
                  <li>To detect, prevent, and address technical issues and security threats</li>
                  <li>To comply with legal obligations and protect our legal rights</li>
                </ul>
              </CardContent>
            </Card>

            {/* Cookies and Tracking */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Cookie className="h-5 w-5 mr-2 text-primary" />
                  Cookies and Tracking Technologies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We use cookies and similar tracking technologies to track activity on our website and hold certain information.
                </p>
                
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Types of Cookies We Use:</h3>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                    <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
                    <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website</li>
                    <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                    <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
                  </ul>
                </div>

                <p className="text-muted-foreground">
                  You can control cookies through your browser settings. However, disabling certain cookies may affect 
                  the functionality of our website.
                </p>
              </CardContent>
            </Card>

            {/* Third-Party Services */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Third-Party Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Our website may contain links to third-party websites and services, including:
                </p>
                
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li><strong>Google Analytics:</strong> For website analytics and performance monitoring</li>
                  <li><strong>Google AdSense:</strong> For displaying advertisements</li>
                  <li><strong>Social Media Platforms:</strong> For sharing and social features</li>
                  <li><strong>Game Developers:</strong> Some games may be hosted by third-party developers</li>
                </ul>

                <p className="text-muted-foreground">
                  These third-party services have their own privacy policies. We encourage you to review their 
                  privacy policies before interacting with them.
                </p>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCheck className="h-5 w-5 mr-2 text-primary" />
                  Data Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  We implement appropriate technical and organizational security measures to protect your personal 
                  information against unauthorized access, alteration, disclosure, or destruction.
                </p>
                
                <p className="text-muted-foreground">
                  However, please note that no method of transmission over the internet or electronic storage is 
                  100% secure. While we strive to use commercially acceptable means to protect your personal 
                  information, we cannot guarantee absolute security.
                </p>
              </CardContent>
            </Card>

            {/* Children's Privacy */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Children's Privacy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Our website is intended for general audiences and is not directed to children under the age of 13. 
                  We do not knowingly collect personal information from children under 13.
                </p>
                
                <p className="text-muted-foreground">
                  If you are a parent or guardian and believe that your child has provided us with personal information, 
                  please contact us immediately. We will take steps to remove such information from our servers.
                </p>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Your Privacy Rights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Depending on your location, you may have certain rights regarding your personal information:
                </p>
                
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>The right to access your personal information</li>
                  <li>The right to rectify inaccurate personal information</li>
                  <li>The right to erase your personal information</li>
                  <li>The right to restrict processing of your personal information</li>
                  <li>The right to data portability</li>
                  <li>The right to object to processing</li>
                </ul>
              </CardContent>
            </Card>

            {/* Changes to Privacy Policy */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Changes to This Privacy Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
                  the new Privacy Policy on this page and updating the "Last updated" date.
                </p>
                
                <p className="text-muted-foreground">
                  You are advised to review this Privacy Policy periodically for any changes. Changes to this 
                  Privacy Policy are effective when they are posted on this page.
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-primary" />
                  Contact Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
                </p>
                
                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-medium text-foreground">GameHub Privacy Team</p>
                  <p className="text-muted-foreground">Email: privacy@gamehub.com</p>
                  <p className="text-muted-foreground">Address: 123 Gaming Street, San Francisco, CA 94105</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;