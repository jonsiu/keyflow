import TypingInterface from '@/components/TypingInterface';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">KeyFlow</h1>
          <p className="text-foreground/80 text-lg">
            Effortless Typing Mastery
          </p>
        </div>

        <TypingInterface />
      </div>
    </main>
  );
}
