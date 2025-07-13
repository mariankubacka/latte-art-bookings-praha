import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RecaptchaComponent } from "@/components/RecaptchaComponent";
import { CourseDetailsCard } from "@/components/CourseDetailsCard";
import { RegistrationFormFields } from "@/components/RegistrationFormFields";
import { useRegistrationForm } from "@/hooks/use-registration-form";
import { UserCheck, Shield } from "lucide-react";

interface RegistrationFormProps {
  selectedDate: Date;
  onComplete: (registrationData: { date: Date; name: string; email: string }) => void;
}

export function RegistrationForm({ selectedDate, onComplete }: RegistrationFormProps) {
  const {
    name,
    setName,
    email,
    setEmail,
    isSubmitting,
    recaptchaRef,
    recaptchaSettings,
    isLoadingRecaptcha,
    handleRecaptchaChange,
    handleSubmit
  } = useRegistrationForm({ selectedDate, onComplete });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="w-5 h-5" />
          Prihlásenie na kurz
        </CardTitle>
        <CardDescription>
          Vyplňte svoje údaje pre prihlásenie na kurz latte art
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <CourseDetailsCard selectedDate={selectedDate} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <RegistrationFormFields
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
            />

            {/* ReCaptcha v3 - neviditeľná, len informácia */}
            {!isLoadingRecaptcha && recaptchaSettings?.site_key && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <Label className="text-sm text-muted-foreground">
                    Táto stránka je chránená pomocou reCAPTCHA v3
                  </Label>
                </div>
                <RecaptchaComponent
                  ref={recaptchaRef}
                  onVerify={handleRecaptchaChange}
                  siteKey={recaptchaSettings?.site_key}
                />
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Prihlasuje sa..." : "Prihlásiť sa na kurz"}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}