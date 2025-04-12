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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs"
import { CreditCard, ReceiptText, History } from "lucide-react"

export default function AdminPay() {
  return (
    <div className=" h-full w-full container mx-auto py-8 max-w-6xl">      
      <Tabs defaultValue="doulas" className="mb-8">
        <TabsList className="grid grid-cols-3 w-full max-w-lg mx-auto">
          <TabsTrigger value="doulas" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span>Pay Doulas</span>
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <ReceiptText className="h-4 w-4" />
            <span>Pay Expenses</span>
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span>Past Transactions</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="expenses" className="mt-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-1/3">
              <Card className="h-full shadow-md transition-all duration-300 hover:shadow-lg">
                <CardHeader className=" rounded-t-lg border-b">
                  <CardTitle className="flex items-center gap-2">
                    <ReceiptText className="h-5 w-5 text-slate-500" />
                    Add an Expense
                  </CardTitle>
                  <CardDescription>
                    Describe your expense below
                  </CardDescription>
                </CardHeader>
          
                <CardContent className="pt-6">
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="expense-name" className="font-medium">Expense Name</Label>
                      <Input 
                        id="expense-name" 
                        placeholder="e.g. Lunch with clients" 
                        className="focus:ring-2 focus:ring-offset-1"
                      />
                    </div>
          
                    <div className="space-y-2">
                      <Label htmlFor="due-date" className="font-medium">Date Due</Label>
                      <Input 
                        id="due-date" 
                        type="date" 
                        className="focus:ring-2 focus:ring-offset-1"
                      />
                    </div>
          
                    <div className="space-y-2">
                      <Label htmlFor="amount" className="font-medium">Amount Paying</Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <span className="text-gray-500">$</span>
                        </div>
                        <Input 
                          id="amount" 
                          type="number" 
                          placeholder="0.00" 
                          className="pl-8 focus:ring-2 focus:ring-offset-1"
                        />
                      </div>
                    </div>
          
                    <div className="space-y-2">
                      <Label htmlFor="notes" className="font-medium">Notes</Label>
                      <Input 
                        id="notes" 
                        placeholder="Optional notes..." 
                        className="focus:ring-2 focus:ring-offset-1"
                      />
                    </div>
                  </form>
                </CardContent>
          
                <CardFooter className="flex justify-between border-t pt-4  rounded-b-lg">
                  <Button variant="outline">Cancel</Button>
                  <Button>Submit</Button>
                </CardFooter>
              </Card>
            </div>
          
            <div className="w-full lg:w-2/3">
              <Card className="h-full shadow-md transition-all duration-300 hover:shadow-lg">
                <CardHeader className=" rounded-t-lg border-b">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-slate-500" />
                    Payment Method
                  </CardTitle>
                  <CardDescription>
                    Add a new payment method to your account
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="grid gap-6 pt-6">
                  <RadioGroup defaultValue="card" className="grid grid-cols-3 gap-4">
                    <div>
                      <RadioGroupItem
                        value="card"
                        id="card"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="card"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-slate-200 bg-transparent p-4 hover:bg-slate-50 hover:border-slate-300 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-all duration-200"
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
                      />
                      <Label
                        htmlFor="paypal"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-slate-200 bg-transparent p-4 hover:bg-slate-50 hover:border-slate-300 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-all duration-200"
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
                      />
                      <Label
                        htmlFor="apple"
                        className="flex flex-col items-center justify-between rounded-md border-2 border-slate-200 bg-transparent p-4 hover:bg-slate-50 hover:border-slate-300 peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary transition-all duration-200"
                      >
                        <Icons.apple className="mb-3 h-6 w-6" />
                        Apple
                      </Label>
                    </div>
                  </RadioGroup>
          
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="font-medium">Name</Label>
                      <Input 
                        id="name" 
                        placeholder="First Last" 
                        className="focus:ring-2 focus:ring-offset-1"
                      />
                    </div>
          
                    <div className="space-y-2">
                      <Label htmlFor="city" className="font-medium">City</Label>
                      <Input 
                        id="city" 
                        placeholder="Your city" 
                        className="focus:ring-2 focus:ring-offset-1"
                      />
                    </div>
                  </div>
          
                  <div className="space-y-2">
                    <Label htmlFor="number" className="font-medium">Card number</Label>
                    <Input 
                      id="number" 
                      placeholder="1234 5678 9012 3456" 
                      className="focus:ring-2 focus:ring-offset-1"
                    />
                  </div>
          
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="month" className="font-medium">Month</Label>
                      <Select>
                        <SelectTrigger id="month" className="focus:ring-2 focus:ring-offset-1">
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
          
                    <div className="space-y-2">
                      <Label htmlFor="year" className="font-medium">Year</Label>
                      <Select>
                        <SelectTrigger id="year" className="focus:ring-2 focus:ring-offset-1">
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
          
                    <div className="space-y-2">
                      <Label htmlFor="cvc" className="font-medium">CVC</Label>
                      <Input 
                        id="cvc" 
                        placeholder="123" 
                        className="focus:ring-2 focus:ring-offset-1"
                      />
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="border-t pt-4 bg-slate-50 rounded-b-lg">
                  <Button className="w-full">Process Payment</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="doulas">
          <div className="text-center py-16 bg-slate-50 rounded-lg">
            <CreditCard className="h-16 w-16 mx-auto text-slate-300" />
            <h3 className="mt-4 text-xl font-medium">Doula Payments</h3>
            <p className="text-slate-500 mt-2">This tab will contain Doula payment options</p>
          </div>
        </TabsContent>
        
        <TabsContent value="transactions">
          <div className="text-center py-16 bg-slate-50 rounded-lg">
            <History className="h-16 w-16 mx-auto text-slate-300" />
            <h3 className="mt-4 text-xl font-medium">Past Transactions</h3>
            <p className="text-slate-500 mt-2">This tab will display transaction history</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}