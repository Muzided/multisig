import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface StatsCardProps {
  title: string
  description: string
  value: string | number
}

export function StatsCard({ title, description, value }: StatsCardProps) {
  return (
    <Card
      className="border-zinc-200/80 bg-gradient-to-b from-white to-zinc-50 shadow-md hover:shadow-lg 
      transition-all duration-300 hover:-translate-y-0.5 text-zinc-900 
      dark:border-zinc-800 dark:bg-zinc-900 dark:from-zinc-900 dark:to-zinc-900 dark:text-zinc-100 
      dark:shadow-none dark:hover:shadow-none dark:hover:translate-y-0 dark:hover:bg-zinc-900/80"
    >
      <CardHeader className="pb-2">
        <CardTitle
          className="text-lg bg-gradient-to-r from-zinc-900 to-zinc-700 bg-clip-text text-transparent
          dark:from-white dark:to-zinc-300"
        >
          {title}
        </CardTitle>
        <CardDescription className="text-zinc-500 dark:text-zinc-400">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent
          dark:from-blue-400 dark:to-blue-500"
        >
          {value}
        </div>
      </CardContent>
    </Card>
  )
}

