import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Save, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function AdminRecaptcha() {
  const [siteKey, setSiteKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Načítať existujúce nastavenia
  useEffect(() => {
    const loadSettings = async () => {
      try {
        console.log('🔍 Loading ReCaptcha settings from database...');
        
        const { data, error } = await supabase
          .from('recaptcha_settings')
          .select('site_key, secret_key')
          .single();

        console.log('🔍 Database response:', { data, error });

        if (error && error.code !== 'PGRST116') {
          console.error('❌ Error loading settings:', error);
          toast({
            title: "Chyba",
            description: `Nepodarilo sa načítať nastavenia: ${error.message}`,
            variant: "destructive",
          });
        } else if (data) {
          console.log('✅ Loaded existing settings');
          setSiteKey(data.site_key || "");
          setSecretKey(data.secret_key || "");
        } else {
          console.log('ℹ️ No existing settings found');
        }
      } catch (err) {
        console.error('💥 Failed to load ReCaptcha settings:', err);
        toast({
          title: "Chyba",
          description: "Nepodarilo sa načítať nastavenia",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [toast]);

  const handleSave = async () => {
    if (!siteKey.trim() || !secretKey.trim()) {
      toast({
        title: "Chyba",
        description: "Prosím vyplňte oba kľúče",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      console.log('🔐 Saving ReCaptcha settings:', { 
        siteKey: siteKey.slice(0, 10) + '...', 
        secretKey: secretKey.slice(0, 10) + '...' 
      });
      
      const { data, error } = await supabase
        .from('recaptcha_settings')
        .upsert({
          id: 1, // Používame pevné ID pre singleton záznam
          site_key: siteKey.trim(),
          secret_key: secretKey.trim(),
        }, {
          onConflict: 'id'
        })
        .select();

      console.log('🔐 Supabase response:', { data, error });

      if (error) {
        throw error;
      }

      console.log('✅ ReCaptcha settings saved successfully');
      toast({
        title: "Úspech",
        description: "ReCaptcha nastavenia boli uložené",
      });
    } catch (error) {
      console.error('❌ Error saving ReCaptcha settings:', error);
      toast({
        title: "Chyba",
        description: `Nepodarilo sa uložiť nastavenia: ${error instanceof Error ? error.message : 'Neznáma chyba'}`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p className="text-muted-foreground">Načítavam nastavenia...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">ReCaptcha Nastavenia</h1>
          <p className="text-muted-foreground">Konfigurácia Google ReCaptcha pre web</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Google ReCaptcha v3
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="site-key">Site Key (verejný kľúč)</Label>
            <Input
              id="site-key"
              type="text"
              placeholder="6Lc..."
              value={siteKey}
              onChange={(e) => setSiteKey(e.target.value)}
              className="font-mono"
            />
            <p className="text-sm text-muted-foreground">
              Tento kľúč sa používa vo frontend aplikácii a môže byť viditeľný verejnosti.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secret-key">Secret Key (súkromný kľúč)</Label>
            <div className="relative">
              <Input
                id="secret-key"
                type={showSecretKey ? "text" : "password"}
                placeholder="6Lc..."
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="font-mono pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2"
                onClick={() => setShowSecretKey(!showSecretKey)}
              >
                {showSecretKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Tento kľúč sa používa na backend validáciu a musí byť udržaný v tajnosti.
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-muted/50">
            <h3 className="font-semibold mb-2">Ako získať ReCaptcha kľúče:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
              <li>Prejdite na <a href="https://www.google.com/recaptcha/admin/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google reCAPTCHA Admin konzolu</a></li>
              <li>Vytvorte novú stránku alebo upravte existujúcu</li>
              <li>Vyberte reCAPTCHA v3</li>
              <li>Pridajte vašu doménu</li>
              <li>Skopírujte Site Key a Secret Key sem</li>
            </ol>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="w-full"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Ukladám..." : "Uložiť nastavenia"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}