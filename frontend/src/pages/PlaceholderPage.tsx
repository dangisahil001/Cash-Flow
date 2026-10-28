import DashboardLayout from '../layouts/DashboardLayout';

export default function PlaceholderPage({ title, description }: { title: string, description: string }) {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary-900">{title}</h1>
        <p className="text-secondary-500">{description}</p>
      </div>
      <div className="card p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
          <span className="text-primary-500 text-2xl font-bold">🚧</span>
        </div>
        <h2 className="text-xl font-bold text-secondary-900 mb-2">Under Construction</h2>
        <p className="text-secondary-500 max-w-md">
          This page is part of the future feature rollout. Stay tuned!
        </p>
      </div>
    </DashboardLayout>
  );
}
