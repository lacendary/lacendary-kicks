type SneakerOverviewProps = {
  overview: string;
};

export default function SneakerOverview({
  overview,
}: SneakerOverviewProps) {
  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold mb-4">
        Overview
      </h2>

      <div
        dangerouslySetInnerHTML={{
          __html: overview || "",
        }}
      />
    </section>
  );
}