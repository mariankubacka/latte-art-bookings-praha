import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Users, Award } from "lucide-react";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

export function AboutSection() {
  const { elementRef: headerRef, isVisible: headerVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });
  const { elementRef: card1Ref, isVisible: card1Visible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.3, delay: 100 });
  const { elementRef: card2Ref, isVisible: card2Visible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.3, delay: 200 });
  const { elementRef: card3Ref, isVisible: card3Visible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.3, delay: 300 });

  return (
    <section className="py-16 px-4 bg-secondary/30">
      <div className="container mx-auto max-w-4xl">
        <div 
          ref={headerRef}
          className={`text-center mb-12 transition-all duration-700 ${
            headerVisible 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-3xl font-bold mb-4">O kurzoch</h2>
          <p className="text-lg text-muted-foreground">
            Profesionálne kurzy latte art s osobným prístupom a malými skupinkami
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Card 
            ref={card1Ref}
            className={`hover-scale transition-all duration-700 ${
              card1Visible 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-12 scale-95'
            }`}
          >
            <CardHeader className="text-center">
              <Clock className="w-12 h-12 mx-auto mb-4 text-primary transition-transform duration-500 hover:scale-110" />
              <CardTitle>Flexibilný čas</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Kurzy prebíhajú streda až piatok, vždy od 9:00 do 17:00. 
                Vyberte si deň, ktorý vám vyhovuje.
              </CardDescription>
            </CardContent>
          </Card>

          <Card 
            ref={card2Ref}
            className={`hover-scale transition-all duration-700 ${
              card2Visible 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-12 scale-95'
            }`}
          >
            <CardHeader className="text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-primary transition-transform duration-500 hover:scale-110" />
              <CardTitle>Malé skupiny</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Maximálne 5 účastníkov na kurz pre individuálny prístup 
                a kvalitné učenie.
              </CardDescription>
            </CardContent>
          </Card>

          <Card 
            ref={card3Ref}
            className={`hover-scale transition-all duration-700 ${
              card3Visible 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-12 scale-95'
            }`}
          >
            <CardHeader className="text-center">
              <Award className="w-12 h-12 mx-auto mb-4 text-primary transition-transform duration-500 hover:scale-110" />
              <CardTitle>Profesionálny barista</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Učíte sa od skúseného baristu s rokmi praxe 
                v najlepších kaviarňach Prahy.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}