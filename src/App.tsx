import Header from "./components/Header/Header";
import Hero from "./components/Hero/Hero";
import ValueCards from "./components/ValueCards/ValueCards";
import HowItHelps from "./components/HowItHelps/HowItHelps";
import UseCases from "./components/UseCases/UseCases";
import Contact from "./components/Contact/Contact";
import Footer from "./components/Footer/Footer";

function App() {
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

export default App;
