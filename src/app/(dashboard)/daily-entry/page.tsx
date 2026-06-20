"use client";

import { useState } from "react";
import { Check, ChevronRight, Save } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/shared/page-header";

import { AttendanceStep } from "@/components/daily-entry/attendance-step";
import { DieselStep } from "@/components/daily-entry/diesel-step";
import { ExpenseStep } from "@/components/daily-entry/expense-step";

const STEPS = [
  { id: "attendance", title: "Attendance", description: "Mark workers' attendance" },
  { id: "diesel", title: "Diesel", description: "Log tractor fuel usage" },
  { id: "expense", title: "Expenses", description: "Record daily expenses" },
];

export default function DailyEntryPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo(0, 0);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Daily farm entry saved successfully!", {
        description: "Attendance, diesel logs, and expenses have been recorded.",
      });
      router.push("/");
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader 
        title="Daily Farm Entry" 
        description="Fastest way to record all your daily farm activities."
      />

      <div className="space-y-4">
        {/* Progress Tracker */}
        <div className="hidden sm:flex justify-between items-center mb-8 relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-muted -z-10 -translate-y-1/2"></div>
          <div 
            className="absolute top-1/2 left-0 h-1 bg-primary -z-10 -translate-y-1/2 transition-all duration-300"
            style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
          ></div>
          
          {STEPS.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div key={step.id} className="flex flex-col items-center bg-background px-2">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors ${
                    isActive 
                      ? "border-primary bg-primary text-primary-foreground" 
                      : isCompleted
                        ? "border-primary bg-primary/20 text-primary"
                        : "border-muted bg-background text-muted-foreground"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <span className={`mt-2 text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Mobile Progress */}
        <div className="sm:hidden space-y-2 mb-6">
          <div className="flex justify-between text-sm font-medium">
            <span>{STEPS[currentStep].title}</span>
            <span className="text-muted-foreground">Step {currentStep + 1} of {STEPS.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="shadow-md border-primary/20 animate-fade-in">
          <CardHeader>
            <CardTitle>{STEPS[currentStep].title}</CardTitle>
            <CardDescription>{STEPS[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[300px]">
            {currentStep === 0 && <AttendanceStep />}
            {currentStep === 1 && <DieselStep />}
            {currentStep === 2 && <ExpenseStep />}
          </CardContent>
          <CardFooter className="flex justify-between border-t p-6 bg-muted/20">
            <Button 
              variant="outline" 
              onClick={handleBack} 
              disabled={currentStep === 0 || isSubmitting}
            >
              Back
            </Button>
            <Button 
              onClick={handleNext} 
              disabled={isSubmitting}
              className={currentStep === STEPS.length - 1 ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {isSubmitting ? (
                "Saving..."
              ) : currentStep === STEPS.length - 1 ? (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save All Entries
                </>
              ) : (
                <>
                  Next Step <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
