interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: string;
}

export default function PlaceholderPage({ title, description, icon }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h2
        className="text-2xl font-bold text-white mb-2"
        style={{ fontFamily: "'Orbitron', sans-serif" }}
      >
        {title}
      </h2>
      <p className="text-[#4A6080] text-sm max-w-sm leading-relaxed">{description}</p>
      <div className="mt-6 px-4 py-2 rounded-xl border border-[#1A2F4E] text-xs text-[#4A6080] font-mono">
        Coming soon · A.S.T.R.A v2.0
      </div>
    </div>
  );
}
