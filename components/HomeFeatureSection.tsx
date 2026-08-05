import HomeFeatureCard from "./HomeFeatureCard";

export default function HomeFeatureCards() {
  return (
    <section className="grid grid-cols-3 gap-6">

      <HomeFeatureCard
  title="Explore the Archive"
  description="Browse the complete sneaker archive with cinematic videos, photography, stories and more."
  button="Explore"
  href="/archive"
/>

      <HomeFeatureCard
  title="Lacendary Picks"
  description="Our curated selection of sneakers that moved the culture forward."
  button="Discover Picks"
  href="/lacendary-picks"
/>

      <HomeFeatureCard
  title="Tale of the Tape"
  description="Compare sneakers side by side with detailed imagery, specs and more."
  button="Compare Now"
  href="/compare"
/>

    </section>
  );
}