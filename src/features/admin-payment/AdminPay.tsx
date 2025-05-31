
import { Icons } from "./icons"
import { Button } from "@/common/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card"
import { Input } from "@/common/components/ui/input"
import { Label } from "@/common/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/common/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select"

export default function AdminPay() {
  return (
    <div className="container">
      <div className="pb-25">
      </div>
    <div className="flex gap-6">
    <div className="w-1/4">
      <Card className="h-full shadow-md transition-all duration-300 ease-in-out hover:shadow-lg">
        <CardHeader>
          <CardTitle>Add an Expense</CardTitle>
          <CardDescription>Describe your expense below</CardDescription>
        </CardHeader>
  
        <CardContent>
          <form className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="expense-name">Expense Name</Label>
              <Input id="expense-name" placeholder="e.g. Lunch with clients" />
            </div>
  
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="due-date">Date Due</Label>
              <Input id="due-date" type="date" />
            </div>
  
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="amount">Amount Paying</Label>
              <Input id="amount" type="number" placeholder="e.g. 200.00" />
            </div>
  
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" placeholder="Optional notes..." />
            </div>
          </form>
        </CardContent>
  
        <CardFooter className="flex justify-between">
          <Button variant="outline">Cancel</Button>
          <Button>Submit</Button>
        </CardFooter>
      </Card>
    </div>
  
    <div className="w-3/4">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>
            Add a new payment method to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <RadioGroup defaultValue="card" className="grid grid-cols-3 gap-4">
            <div>
              <RadioGroupItem
                value="card"
                id="card"
                className="peer sr-only"
                aria-label="Card"
              />
              <Label
                htmlFor="card"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="mb-3 h-6 w-6"
                >
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <path d="M2 10h20" />
                </svg>
                Card
              </Label>
            </div>
            <div>
              <RadioGroupItem
                value="paypal"
                id="paypal"
                className="peer sr-only"
                aria-label="Paypal"
              />
              <Label
                htmlFor="paypal"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Icons.paypal className="mb-3 h-6 w-6" />
                Paypal
              </Label>
            </div>
            <div>
              <RadioGroupItem
                value="apple"
                id="apple"
                className="peer sr-only"
                aria-label="Apple"
              />
              <Label
                htmlFor="apple"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Icons.apple className="mb-3 h-6 w-6" />
                Apple
              </Label>
            </div>
          </RadioGroup>
  
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="First Last" />
          </div>
  
          <div className="grid gap-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" placeholder="" />
          </div>
  
          <div className="grid gap-2">
            <Label htmlFor="number">Card number</Label>
            <Input id="number" placeholder="" />
          </div>
  
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="month">Expires</Label>
              <Select>
                <SelectTrigger id="month" aria-label="Month">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(12)].map((_, i) => (
                    <SelectItem key={i + 1} value={`${i + 1}`}>
                      {new Date(0, i).toLocaleString("default", { month: "long" })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
  
            <div className="grid gap-2">
              <Label htmlFor="year">Year</Label>
              <Select>
                <SelectTrigger id="year" aria-label="Year">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() + i
                    return (
                      <SelectItem key={year} value={`${year}`}>
                        {year}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
  
            <div className="grid gap-2">
              <Label htmlFor="cvc">CVC</Label>
              <Input id="cvc" placeholder="CVC" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Continue</Button>
        </CardFooter>
      </Card>
    </div>
  </div>
</div>
  
  )
}