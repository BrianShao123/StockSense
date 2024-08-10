import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

export default function PartnersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Partners</CardTitle>
        <CardDescription>View partners and their statuses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-full p-4 bg-gray-200 rounded-md">
          <span className="text-2xl font-bold text-gray-400">Coming Soon</span>
        </div>
      </CardContent>
    </Card>
  );
}
