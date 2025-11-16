# shadcn/ui Components

This directory contains all the shadcn/ui components configured for the Farm Expense Tracker project.

## Available Components

### 1. Button
A versatile button component with multiple variants and sizes.

```jsx
import { Button } from "@/components/ui/button"

<Button>Click me</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Delete</Button>
<Button size="sm">Small</Button>
```

### 2. Card
A container component for displaying content in cards.

```jsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### 3. Input
A styled input field component.

```jsx
import { Input } from "@/components/ui/input"

<Input type="text" placeholder="Enter text" />
<Input type="email" placeholder="Email" />
<Input type="number" placeholder="Amount" />
```

### 4. Label
A label component for form fields.

```jsx
import { Label } from "@/components/ui/label"

<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />
```

### 5. Select
A dropdown select component.

```jsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### 6. Table
A table component for displaying tabular data.

```jsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Item 1</TableCell>
      <TableCell>₹100</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### 7. Tabs
A tabs component for organizing content.

```jsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

<Tabs defaultValue="expenses">
  <TabsList>
    <TabsTrigger value="expenses">Expenses</TabsTrigger>
    <TabsTrigger value="yields">Yields</TabsTrigger>
  </TabsList>
  <TabsContent value="expenses">Expenses content</TabsContent>
  <TabsContent value="yields">Yields content</TabsContent>
</Tabs>
```

### 8. Dialog
A modal dialog component.

```jsx
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    <p>Dialog content</p>
  </DialogContent>
</Dialog>
```

### 9. Calendar
A date picker component.

```jsx
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

const [date, setDate] = useState()

<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">
      {date ? format(date, "PPP") : "Pick a date"}
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0">
    <Calendar mode="single" selected={date} onSelect={setDate} />
  </PopoverContent>
</Popover>
```

## Importing Components

You can import components individually:

```jsx
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
```

Or import from the index file:

```jsx
import { Button, Card, Input } from "@/components/ui"
```

## Styling

All components use Tailwind CSS and are styled according to the theme defined in `app/globals.css`. The components automatically adapt to light/dark mode based on the CSS variables.

## Dependencies

The components require the following packages (already installed):
- `@radix-ui/react-*` - UI primitives
- `class-variance-authority` - For variant management
- `clsx` and `tailwind-merge` - For className utilities
- `lucide-react` - For icons
- `react-day-picker` - For calendar component

