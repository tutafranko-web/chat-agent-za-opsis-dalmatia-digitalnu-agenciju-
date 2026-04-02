import { CATEGORIES } from "@/lib/activities-data";

interface ActivityGridProps {
  locale: "hr" | "en";
}

export function ActivityGrid({ locale }: ActivityGridProps) {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-12">
          {CATEGORIES.map((category) => (
            <div key={category.name}>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">{category.emoji}</span>
                <span>
                  {locale === "hr" ? category.nameHr : category.name}
                </span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {category.activities.map((activity) => (
                  <div
                    key={activity.name}
                    className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 hover:border-zinc-600 transition-colors"
                  >
                    <p className="text-sm font-medium text-zinc-300">
                      {locale === "hr" ? activity.nameHr : activity.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
