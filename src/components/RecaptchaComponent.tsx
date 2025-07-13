import { useRef, forwardRef, useImperativeHandle } from "react";
import ReCAPTCHA from "react-google-recaptcha";

interface RecaptchaComponentProps {
  onVerify: (token: string | null) => void;
  siteKey?: string;
}

export interface RecaptchaComponentRef {
  reset: () => void;
  execute: () => void;
}

export const RecaptchaComponent = forwardRef<RecaptchaComponentRef, RecaptchaComponentProps>(
  ({ onVerify, siteKey }, ref) => {
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        recaptchaRef.current?.reset();
      },
      execute: () => {
        recaptchaRef.current?.execute();
      },
    }));

    // Ak nie je siteKey nastavený, zobraziť informatívnu správu
    if (!siteKey) {
      return (
        <div className="border-2 border-dashed border-muted rounded-lg p-6 bg-muted/20">
          <div className="text-center text-muted-foreground">
            <p className="font-medium">ReCaptcha nie je nakonfigurovaná</p>
            <p className="text-sm mt-1">
              Pre aktiváciu kontaktujte administrátora alebo nastavte ReCaptcha kľúče v admin paneli.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-center">
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={siteKey}
          onChange={onVerify}
          size="normal"
          theme="light"
        />
      </div>
    );
  }
);

RecaptchaComponent.displayName = "RecaptchaComponent";