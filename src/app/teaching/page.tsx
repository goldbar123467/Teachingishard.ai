'use client';

import { MainLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TeachingPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-2 mb-6">
          <h1 className="text-3xl font-bold">Teaching</h1>
          <p className="text-muted-foreground">
            Access teaching resources and methodology tools
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Teaching resources page is under development.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
