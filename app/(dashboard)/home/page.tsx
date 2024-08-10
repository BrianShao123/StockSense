import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import PieChart from '@/components/ui/pie-chart';
import { News } from '@/components/ui/news';
import { LineComponent } from '@/components/ui/line-chart';

export default function HomePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Home</CardTitle>
        <CardDescription>View relevant summary entries and data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="col-span-1">
            <PieChart />
          </div>
          <div className="col-span-1">
            <LineComponent />
          </div>
          <div className="col-span-1">
            <News />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
