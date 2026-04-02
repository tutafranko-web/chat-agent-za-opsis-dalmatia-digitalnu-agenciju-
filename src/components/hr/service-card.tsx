import Link from "next/link";

interface ServiceCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
}

export function ServiceCard({ title, description, href, icon }: ServiceCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-600 transition-colors group">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
        {description}
      </p>
      <Link
        href={href}
        className="inline-flex items-center text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors group-hover:underline"
      >
        {"Saznajte više →"}
      </Link>
    </div>
  );
}
