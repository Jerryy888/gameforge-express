import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit3, Trash2, MonitorSpeaker, Copy, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const mockAds = [
  {
    id: 1,
    name: "Header Banner",
    position: "header",
    size: "728x90",
    code: `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-1234567890123456"
     data-ad-slot="1234567890"
     data-ad-format="auto"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>`,
    isActive: true,
    createdAt: "2024-01-15"
  },
  {
    id: 2,
    name: "Sidebar Rectangle",
    position: "sidebar",
    size: "300x250",
    code: `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-1234567890123456"
     data-ad-slot="0987654321"
     data-ad-format="auto"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>`,
    isActive: true,
    createdAt: "2024-01-20"
  }
];

const adPositions = [
  { value: "header", label: "Header Banner", size: "728x90" },
  { value: "footer", label: "Footer Banner", size: "728x90" },
  { value: "sidebar", label: "Sidebar", size: "300x250" },
  { value: "content", label: "Content Area", size: "728x90" },
  { value: "game-page", label: "Game Page", size: "300x250" },
  { value: "mobile-banner", label: "Mobile Banner", size: "320x50" }
];

const AdManagement = () => {
  const [ads, setAds] = useState(mockAds);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewAd, setPreviewAd] = useState<any>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    position: "",
    code: "",
    isActive: true
  });

  const handleAddAd = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newAd = {
        id: ads.length + 1,
        name: formData.name,
        position: formData.position,
        size: adPositions.find(p => p.value === formData.position)?.size || "Unknown",
        code: formData.code,
        isActive: formData.isActive,
        createdAt: new Date().toISOString().split('T')[0]
      };

      setAds([...ads, newAd]);
      setIsAddDialogOpen(false);
      resetForm();
      
      toast({
        title: "Ad created successfully",
        description: `${formData.name} has been added to your ads.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create ad. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAd = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAds(ads.map(ad => 
        ad.id === editingAd.id 
          ? { 
              ...ad, 
              name: formData.name,
              position: formData.position,
              size: adPositions.find(p => p.value === formData.position)?.size || ad.size,
              code: formData.code,
              isActive: formData.isActive
            }
          : ad
      ));
      
      setEditingAd(null);
      resetForm();
      
      toast({
        title: "Ad updated successfully",
        description: `${formData.name} has been updated.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update ad. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAd = async (adId: number) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setAds(ads.filter(ad => ad.id !== adId));
      
      toast({
        title: "Ad deleted",
        description: "The advertisement has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete ad. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleAd = async (adId: number, isActive: boolean) => {
    try {
      setAds(ads.map(ad => 
        ad.id === adId ? { ...ad, isActive } : ad
      ));
      
      toast({
        title: isActive ? "Ad activated" : "Ad deactivated",
        description: `The advertisement has been ${isActive ? "enabled" : "disabled"}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to toggle ad status.",
        variant: "destructive",
      });
    }
  };

  const copyAdCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code copied",
      description: "Ad code has been copied to clipboard.",
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      position: "",
      code: "",
      isActive: true
    });
  };

  const openEditDialog = (ad: any) => {
    setEditingAd(ad);
    setFormData({
      name: ad.name,
      position: ad.position,
      code: ad.code,
      isActive: ad.isActive
    });
  };

  const getPositionLabel = (position: string) => {
    return adPositions.find(p => p.value === position)?.label || position;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ad Management</h1>
          <p className="text-muted-foreground">
            Manage AdSense codes and advertisement placements across your site.
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Advertisement
            </Button>
          </DialogTrigger>
          <AdDialog 
            isEdit={false}
            formData={formData}
            setFormData={setFormData}
            onSave={handleAddAd}
            isLoading={isLoading}
            adPositions={adPositions}
          />
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{ads.length}</div>
            <p className="text-sm text-muted-foreground">Total Ads</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">
              {ads.filter(ad => ad.isActive).length}
            </div>
            <p className="text-sm text-muted-foreground">Active Ads</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">
              {ads.filter(ad => !ad.isActive).length}
            </div>
            <p className="text-sm text-muted-foreground">Inactive Ads</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">
              {new Set(ads.map(ad => ad.position)).size}
            </div>
            <p className="text-sm text-muted-foreground">Ad Positions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MonitorSpeaker className="h-5 w-5 mr-2" />
            Advertisements ({ads.length})
          </CardTitle>
          <CardDescription>
            Manage your AdSense codes and ad placements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ads.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell>
                    <div className="font-medium">{ad.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Created {ad.createdAt}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getPositionLabel(ad.position)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {ad.size}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={ad.isActive}
                        onCheckedChange={(checked) => handleToggleAd(ad.id, checked)}
                      />
                      <Badge variant={ad.isActive ? "default" : "secondary"}>
                        {ad.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setPreviewAd(ad)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyAdCode(ad.code)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      
                      <Dialog open={editingAd?.id === ad.id} onOpenChange={(open) => {
                        if (!open) setEditingAd(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openEditDialog(ad)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <AdDialog 
                          isEdit={true}
                          formData={formData}
                          setFormData={setFormData}
                          onSave={handleEditAd}
                          isLoading={isLoading}
                          adPositions={adPositions}
                        />
                      </Dialog>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Advertisement</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{ad.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteAd(ad.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!previewAd} onOpenChange={() => setPreviewAd(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Ad Code Preview: {previewAd?.name}</DialogTitle>
            <DialogDescription>
              Copy this code and paste it into your website where you want the ad to appear.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Position: {getPositionLabel(previewAd?.position)}</Label>
              <p className="text-sm text-muted-foreground">Size: {previewAd?.size}</p>
            </div>
            
            <div>
              <Label>Ad Code:</Label>
              <Textarea
                readOnly
                value={previewAd?.code || ""}
                className="font-mono text-sm h-40"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => copyAdCode(previewAd?.code || "")}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const AdDialog = ({ isEdit, formData, setFormData, onSave, isLoading, adPositions }: any) => {
  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{isEdit ? "Edit Advertisement" : "Add New Advertisement"}</DialogTitle>
        <DialogDescription>
          {isEdit ? "Update advertisement settings" : "Create a new ad placement with AdSense code"}
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Ad Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Header Banner Ad"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Select 
              value={formData.position} 
              onValueChange={(value) => setFormData({...formData, position: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select position" />
              </SelectTrigger>
              <SelectContent>
                {adPositions.map((position: any) => (
                  <SelectItem key={position.value} value={position.value}>
                    {position.label} ({position.size})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="code">AdSense Code</Label>
          <Textarea
            id="code"
            value={formData.code}
            onChange={(e) => setFormData({...formData, code: e.target.value})}
            placeholder="Paste your AdSense code here..."
            rows={8}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Paste the complete AdSense code provided by Google
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="active"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
          />
          <Label htmlFor="active">Active</Label>
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={isLoading}>
          {isLoading ? "Saving..." : (isEdit ? "Update Ad" : "Create Ad")}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default AdManagement;