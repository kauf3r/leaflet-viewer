import { AppLayout } from '@/components/layout/AppLayout';
import { ClientOnly } from '@/components/ClientOnly';

export default function Home() {
  return (
    <ClientOnly fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading GeoTIFF Viewer...</p>
        </div>
      </div>
    }>
      <AppLayout />
    </ClientOnly>
  );
}
