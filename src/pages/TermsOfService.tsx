import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileText, Scale, Users, Ban, AlertTriangle, Mail } from "lucide-react";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Scale className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-foreground mb-4">Terms of Service</h1>
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
              <CardTitle>Agreement to Terms</CardTitle>
              <CardDescription>
                By accessing and using GameHub, you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="space-y-8">
            {/* Acceptance of Terms */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  Acceptance of Terms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  These Terms of Service ("Terms") govern your use of the GameHub website located at gamehub.com 
                  (the "Service") operated by GameHub ("us", "we", or "our").
                </p>
                
                <p className="text-muted-foreground mb-4">
                  Your access to and use of the Service is conditioned on your acceptance of and compliance with 
                  these Terms. These Terms apply to all visitors, users and others who access or use the Service.
                </p>

                <p className="text-muted-foreground">
                  By accessing or using our Service you agree to be bound by these Terms. If you disagree with 
                  any part of these terms then you may not access the Service.
                </p>
              </CardContent>
            </Card>

            {/* Use License */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Use License</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Permission is granted to temporarily access and play the games on GameHub for personal, 
                  non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>modify or copy the materials</li>
                  <li>use the materials for any commercial purpose or for any public display (commercial or non-commercial)</li>
                  <li>attempt to decompile or reverse engineer any software contained on GameHub's website</li>
                  <li>remove any copyright or other proprietary notations from the materials</li>
                  <li>use automated tools to access the Service</li>
                </ul>

                <p className="text-muted-foreground">
                  This license shall automatically terminate if you violate any of these restrictions and may be 
                  terminated by GameHub at any time. Upon terminating your viewing of these materials or upon the 
                  termination of this license, you must destroy any downloaded materials in your possession whether 
                  in electronic or printed format.
                </p>
              </CardContent>
            </Card>

            {/* User Accounts */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  User Accounts and Conduct
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">User Responsibilities</h3>
                  <p className="text-muted-foreground mb-2">When using our Service, you agree to:</p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                    <li>Provide accurate and truthful information</li>
                    <li>Use the Service in compliance with all applicable laws</li>
                    <li>Respect the rights and dignity of other users</li>
                    <li>Not engage in any harmful or disruptive behavior</li>
                    <li>Not attempt to gain unauthorized access to any part of the Service</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-foreground mb-2">Prohibited Activities</h3>
                  <p className="text-muted-foreground mb-2">You may not use our Service to:</p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                    <li>Upload, post, or transmit any harmful, threatening, abusive, or illegal content</li>
                    <li>Impersonate any person or entity</li>
                    <li>Violate any intellectual property rights</li>
                    <li>Distribute malware, viruses, or other harmful code</li>
                    <li>Spam or send unsolicited communications</li>
                    <li>Interfere with or disrupt the Service or servers</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Content and Intellectual Property */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Content and Intellectual Property</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Our Content</h3>
                  <p className="text-muted-foreground">
                    The Service and its original content, features, and functionality are and will remain the 
                    exclusive property of GameHub and its licensors. The Service is protected by copyright, 
                    trademark, and other laws. Our trademarks and trade dress may not be used in connection 
                    with any product or service without our prior written consent.
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-foreground mb-2">Third-Party Content</h3>
                  <p className="text-muted-foreground">
                    Some games and content on our platform may be owned by third-party developers and publishers. 
                    All rights to such content remain with their respective owners. We display this content under 
                    appropriate licensing agreements.
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-foreground mb-2">User-Generated Content</h3>
                  <p className="text-muted-foreground">
                    If you submit any content to us (such as feedback, reviews, or comments), you grant us a 
                    non-exclusive, royalty-free, perpetual, and worldwide license to use, modify, and display 
                    such content in connection with our Service.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Privacy and Data */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Privacy and Data Collection</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect 
                  your information when you use our Service. By using our Service, you agree to the collection 
                  and use of information in accordance with our Privacy Policy.
                </p>
                
                <p className="text-muted-foreground">
                  We may use cookies and similar tracking technologies to enhance your experience on our website. 
                  By continuing to use our Service, you consent to our use of cookies as described in our Privacy Policy.
                </p>
              </CardContent>
            </Card>

            {/* Disclaimers */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-primary" />
                  Disclaimers and Limitation of Liability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Service Availability</h3>
                  <p className="text-muted-foreground">
                    We strive to keep our Service available 24/7, but we do not guarantee uninterrupted access. 
                    The Service may be unavailable due to maintenance, updates, or technical issues beyond our control.
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-foreground mb-2">Disclaimer of Warranties</h3>
                  <p className="text-muted-foreground">
                    The information on this website is provided on an "as is" basis. To the fullest extent 
                    permitted by law, we exclude all representations, warranties, and conditions relating to 
                    our website and the use of this website.
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold text-foreground mb-2">Limitation of Liability</h3>
                  <p className="text-muted-foreground">
                    In no event shall GameHub, its officers, directors, employees, or agents, be liable to you 
                    for any direct, indirect, incidental, special, punitive, or consequential damages whatsoever 
                    resulting from any loss of use, data, or profits, arising out of or in connection with your 
                    use of the Service.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Termination */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Ban className="h-5 w-5 mr-2 text-primary" />
                  Termination
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  We may terminate or suspend your access immediately, without prior notice or liability, for any 
                  reason whatsoever, including without limitation if you breach the Terms.
                </p>
                
                <p className="text-muted-foreground">
                  Upon termination, your right to use the Service will cease immediately. If you wish to terminate 
                  your account, you may simply discontinue using the Service.
                </p>
              </CardContent>
            </Card>

            {/* Changes to Terms */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Changes to Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. 
                  If a revision is material, we will try to provide at least 30 days notice prior to any new 
                  terms taking effect.
                </p>
                
                <p className="text-muted-foreground">
                  What constitutes a material change will be determined at our sole discretion. By continuing 
                  to access or use our Service after those revisions become effective, you agree to be bound 
                  by the revised terms.
                </p>
              </CardContent>
            </Card>

            {/* Governing Law */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Governing Law</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  These Terms shall be interpreted and governed by the laws of the State of California, United States, 
                  without regard to its conflict of law provisions. Our failure to enforce any right or provision 
                  of these Terms will not be considered a waiver of those rights.
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
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                
                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-medium text-foreground">GameHub Legal Team</p>
                  <p className="text-muted-foreground">Email: legal@gamehub.com</p>
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

export default TermsOfService;