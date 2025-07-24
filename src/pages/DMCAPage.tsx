import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Copyright, AlertTriangle, FileText, Send, Mail, Clock } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const DMCAPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    copyrightWork: "",
    infringingUrl: "",
    description: "",
    contactInfo: "",
    electronicSignature: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "DMCA Notice Submitted",
        description: "We will review your notice within 24-48 hours and take appropriate action.",
      });
      setFormData({
        name: "",
        email: "",
        organization: "",
        copyrightWork: "",
        infringingUrl: "",
        description: "",
        contactInfo: "",
        electronicSignature: ""
      });
      setIsSubmitting(false);
    }, 1000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Copyright className="h-16 w-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-foreground mb-4">DMCA Copyright Policy</h1>
            <p className="text-lg text-muted-foreground">
              Digital Millennium Copyright Act (DMCA) Notice and Takedown Procedure
            </p>
          </div>

          <Card className="bg-card border-border mb-8">
            <CardHeader>
              <CardTitle>Copyright Protection</CardTitle>
              <CardDescription>
                GameHub respects the intellectual property rights of others and expects our users to do the same. 
                We comply with the Digital Millennium Copyright Act (DMCA) and will respond to valid copyright 
                infringement notices promptly.
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="space-y-8">
            {/* Overview */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  DMCA Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  The Digital Millennium Copyright Act (DMCA) provides a legal framework for addressing copyright 
                  infringement on digital platforms. If you believe that your copyrighted work has been copied 
                  and is accessible on our website in a way that constitutes copyright infringement, you may 
                  submit a DMCA takedown notice.
                </p>

                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">Important Note:</h3>
                  <p className="text-muted-foreground text-sm">
                    Filing a false DMCA claim may result in legal liability for damages, including costs and 
                    attorneys' fees. Please ensure that you have a good faith belief that the material is 
                    infringing before submitting a notice.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Our Process */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Our DMCA Process</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">1</div>
                    <h3 className="font-semibold text-foreground mb-1">Submit Notice</h3>
                    <p className="text-sm text-muted-foreground">File a complete DMCA takedown notice with all required information</p>
                  </div>
                  
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">2</div>
                    <h3 className="font-semibold text-foreground mb-1">Review & Action</h3>
                    <p className="text-sm text-muted-foreground">We review the notice and remove infringing content within 24-48 hours</p>
                  </div>
                  
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">3</div>
                    <h3 className="font-semibold text-foreground mb-1">Notification</h3>
                    <p className="text-sm text-muted-foreground">We notify the uploader and provide counter-notice procedure</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Required Information */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-primary" />
                  Required Information for DMCA Notice
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  To file a valid DMCA takedown notice, you must include all of the following information:
                </p>
                
                <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                  <li>A physical or electronic signature of the copyright owner or authorized agent</li>
                  <li>Identification of the copyrighted work claimed to have been infringed</li>
                  <li>Identification of the material that is claimed to be infringing and location on our website</li>
                  <li>Your contact information (address, telephone number, email address)</li>
                  <li>A statement that you have a good faith belief that the use is not authorized</li>
                  <li>A statement that the information in the notice is accurate and you are authorized to act</li>
                  <li>A statement made under penalty of perjury that you are the copyright owner or authorized to act</li>
                </ul>
              </CardContent>
            </Card>

            {/* DMCA Notice Form */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Submit DMCA Takedown Notice</CardTitle>
                <CardDescription>
                  Please fill out all required fields. Incomplete notices may not be processed.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Contact Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Your full legal name"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="organization">Organization (if applicable)</Label>
                      <Input
                        id="organization"
                        value={formData.organization}
                        onChange={(e) => handleInputChange('organization', e.target.value)}
                        placeholder="Company or organization name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contactInfo">Complete Contact Information *</Label>
                      <Textarea
                        id="contactInfo"
                        value={formData.contactInfo}
                        onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                        placeholder="Full mailing address, phone number, and any other contact details"
                        rows={3}
                        required
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Copyright Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Copyright Information</h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="copyrightWork">Description of Copyrighted Work *</Label>
                      <Textarea
                        id="copyrightWork"
                        value={formData.copyrightWork}
                        onChange={(e) => handleInputChange('copyrightWork', e.target.value)}
                        placeholder="Describe the copyrighted work that you claim has been infringed (e.g., game title, artwork, music, etc.)"
                        rows={3}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="infringingUrl">URL of Infringing Material *</Label>
                      <Input
                        id="infringingUrl"
                        value={formData.infringingUrl}
                        onChange={(e) => handleInputChange('infringingUrl', e.target.value)}
                        placeholder="https://gamehub.com/game/example-game"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Detailed Description of Infringement *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Explain how the material on our website infringes your copyright. Be as specific as possible."
                        rows={4}
                        required
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Legal Statements */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Legal Declarations</h3>
                    
                    <div className="bg-muted p-4 rounded-lg space-y-3">
                      <div className="flex items-start space-x-2">
                        <input type="checkbox" id="goodFaith" required className="mt-1" />
                        <label htmlFor="goodFaith" className="text-sm text-muted-foreground">
                          I have a good faith belief that use of the copyrighted material described above is not 
                          authorized by the copyright owner, its agent, or the law.
                        </label>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <input type="checkbox" id="accurate" required className="mt-1" />
                        <label htmlFor="accurate" className="text-sm text-muted-foreground">
                          I swear, under penalty of perjury, that the information in this notification is accurate 
                          and that I am the copyright owner or am authorized to act on behalf of the copyright owner.
                        </label>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="electronicSignature">Electronic Signature *</Label>
                      <Input
                        id="electronicSignature"
                        value={formData.electronicSignature}
                        onChange={(e) => handleInputChange('electronicSignature', e.target.value)}
                        placeholder="Type your full legal name as your electronic signature"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        By typing your name above, you are providing an electronic signature that has the same 
                        legal effect as a handwritten signature.
                      </p>
                    </div>
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? (
                      "Submitting DMCA Notice..."
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit DMCA Takedown Notice
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Counter-Notice Information */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Counter-Notice Procedure</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  If you believe that your content was removed by mistake or misidentification, you may file a 
                  counter-notice. The counter-notice must include:
                </p>
                
                <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                  <li>Your physical or electronic signature</li>
                  <li>Identification of the material removed and its location before removal</li>
                  <li>A statement under penalty of perjury that you have a good faith belief the material was removed by mistake</li>
                  <li>Your name, address, phone number, and consent to federal court jurisdiction</li>
                </ul>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-primary" />
                  DMCA Agent Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  You may also send DMCA notices via email or postal mail to our designated DMCA agent:
                </p>
                
                <div className="bg-muted p-4 rounded-lg">
                  <p className="font-medium text-foreground">GameHub DMCA Agent</p>
                  <p className="text-muted-foreground">Email: dmca@gamehub.com</p>
                  <p className="text-muted-foreground">Address: 123 Gaming Street, San Francisco, CA 94105</p>
                  <p className="text-muted-foreground">Phone: +1 (555) 123-4567</p>
                </div>

                <div className="flex items-center space-x-2 mt-4 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Response time: 24-48 hours for valid DMCA notices</span>
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

export default DMCAPage;