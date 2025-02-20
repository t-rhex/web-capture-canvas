import { Card, CardContent } from '@/components/ui/card';
import { Monitor, Smartphone, Tablet, Info, ArrowRight } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const commonDevices = [
  {
    category: 'Mobile Devices',
    icon: Smartphone,
    devices: [
      { name: 'iPhone 13/14', width: 390, height: 844 },
      { name: 'iPhone 13/14 Pro Max', width: 428, height: 926 },
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'Google Pixel 7', width: 412, height: 915 },
      { name: 'Samsung Galaxy S21', width: 360, height: 800 },
    ],
  },
  {
    category: 'Tablets',
    icon: Tablet,
    devices: [
      { name: 'iPad Pro 12.9"', width: 1024, height: 1366 },
      { name: 'iPad Air', width: 820, height: 1180 },
      { name: 'Samsung Galaxy Tab S7', width: 800, height: 1280 },
      { name: 'Surface Pro 8', width: 912, height: 1368 },
    ],
  },
  {
    category: 'Desktop Displays',
    icon: Monitor,
    devices: [
      { name: 'HD Display', width: 1366, height: 768 },
      { name: 'Full HD (1080p)', width: 1920, height: 1080 },
      { name: '2K Display', width: 2560, height: 1440 },
      { name: '4K Display', width: 3840, height: 2160 },
    ],
  },
];

const breakpoints = [
  { name: 'Mobile', width: '<640px', description: 'Small devices like phones' },
  { name: 'Tablet', width: '≥768px', description: 'Tablets and larger phones in landscape' },
  { name: 'Laptop', width: '≥1024px', description: 'Laptops and smaller desktop displays' },
  { name: 'Desktop', width: '≥1280px', description: 'Standard desktop displays' },
  { name: 'Large Desktop', width: '≥1536px', description: 'Large and high-resolution displays' },
];

export function SizeGuide() {
  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Screenshot Size Guide</h3>
          <p className="text-sm text-muted-foreground">
            Understanding common device dimensions and responsive breakpoints for better screenshot
            coverage.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="devices">
            <AccordionTrigger>Common Device Dimensions</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6">
                {commonDevices.map((category) => (
                  <div key={category.category} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <category.icon className="w-4 h-4 text-muted-foreground" />
                      <h4 className="font-medium">{category.category}</h4>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Device</TableHead>
                          <TableHead>Width</TableHead>
                          <TableHead>Height</TableHead>
                          <TableHead>Aspect Ratio</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {category.devices.map((device) => (
                          <TableRow key={device.name}>
                            <TableCell>{device.name}</TableCell>
                            <TableCell>{device.width}px</TableCell>
                            <TableCell>{device.height}px</TableCell>
                            <TableCell>{(device.width / device.height).toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="breakpoints">
            <AccordionTrigger>Responsive Breakpoints</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {breakpoints.map((breakpoint) => (
                    <div key={breakpoint.name} className="p-4 rounded-lg border bg-card space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{breakpoint.name}</h4>
                        <span className="text-sm text-muted-foreground">{breakpoint.width}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{breakpoint.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="tips">
            <AccordionTrigger>Capture Tips</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-muted-foreground mt-1" />
                  <div className="space-y-2">
                    <p className="text-sm">Best practices for capturing responsive designs:</p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                      <li>Capture at standard breakpoints for consistent testing</li>
                      <li>Include both portrait and landscape orientations for mobile/tablet</li>
                      <li>Test at different zoom levels (100%, 125%, 150%)</li>
                      <li>Consider retina/high-DPI displays (2x, 3x scaling)</li>
                      <li>Check both minimum and maximum supported viewport sizes</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <ArrowRight className="w-4 h-4 text-muted-foreground mt-1" />
                  <div className="space-y-2">
                    <p className="text-sm">Recommended capture sequence:</p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>1. Desktop (1920×1080) - Primary layout</p>
                      <p>2. Tablet (768×1024) - Adaptive layout</p>
                      <p>3. Mobile (375×667) - Mobile-first design</p>
                      <p>4. Additional sizes based on your analytics data</p>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
