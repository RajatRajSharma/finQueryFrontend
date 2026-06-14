import {
  Header,
  Hero,
  ValueCards,
  HowItHelps,
  UseCases,
  Contact,
  Footer,
} from "@/features/marketing";

function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ValueCards />
        <HowItHelps />
        <UseCases />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

export default Home;
