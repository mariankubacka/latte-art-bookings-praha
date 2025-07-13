import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";

interface RegistrationFormFieldsProps {
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
}

export function RegistrationFormFields({
  name,
  setName,
  email,
  setEmail
}: RegistrationFormFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Meno a priezvisko *</Label>
        <Input
          id="name"
          type="text"
          placeholder="Zadajte vaše meno"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-mailová adresa *</Label>
        <Input
          id="email"
          type="email"
          placeholder="vas@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Mail className="w-4 h-4 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Informácia o kurze</p>
            <p>
              Na váš e-mail vám pošleme potvrdenie a ďalšie informácie o kurze.
              Kurz prebieha v Prahe, presná adresa bude v potvrdení.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}