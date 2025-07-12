import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Calendar, Clock, MapPin, Coffee } from "lucide-react";

interface RegistrationSuccessCardProps {
  registrationData: {
    date: Date;
    name: string;
    email: string;
  };
}

export function RegistrationSuccessCard({ registrationData }: RegistrationSuccessCardProps) {
  const { date, name, email } = registrationData;

  return (
    <Card className="h-fit animate-fade-in">
      <CardContent className="pt-6">
        <div className="text-center space-y-6">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto animate-scale-in" />
          
          <div className="space-y-3">
            <h3 className="text-3xl font-bold text-green-700">Úspešne prihlásený!</h3>
            <p className="text-lg text-muted-foreground">
              Ďakujeme za registráciu, {name}!
            </p>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-6 space-y-4">
            <h4 className="text-xl font-semibold text-green-800 mb-4">
              Detaily vašej rezervácie
            </h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-3">
                <Calendar className="w-5 h-5 text-green-600" />
                <p className="text-green-800 font-medium text-lg">
                  {date.toLocaleDateString('sk-SK', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
              
              <div className="flex items-center justify-center gap-3">
                <Clock className="w-5 h-5 text-green-600" />
                <p className="text-green-800 font-medium">
                  9:00 - 17:00
                </p>
              </div>

              <div className="flex items-center justify-center gap-3">
                <MapPin className="w-5 h-5 text-green-600" />
                <p className="text-green-800 font-medium">
                  Praha (adresa v e-maile)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Coffee className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Čo ďalej?</p>
                <p>
                  Potvrdenie rezervácie a presné informácie o lokácii sme poslali na <strong>{email}</strong>.
                  Nezabudnite si so sebou priniesť dobrú náladu!
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Coffee className="w-5 h-5 text-orange-600" />
              <p className="text-orange-900 font-semibold text-lg">
                Vidíme sa na kurze! ☕
              </p>
            </div>
            <p className="text-orange-800 text-sm">
              Tešíme sa na vás a na krásne latte art vzory, ktoré si spolu vytvoríme.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}