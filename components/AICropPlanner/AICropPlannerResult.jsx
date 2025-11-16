"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, AlertTriangle, IndianRupee, Calendar, Sprout } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export function AICropPlannerResult({ result }) {
  if (!result) return null

  const { crop_plan, estimated_budget, risk_factors, additional_recommendations } = result

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crop Plan & Budget Estimation</CardTitle>
        <CardDescription>AI-generated recommendations for your farm</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="plan" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="plan">Crop Plan</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
            <TabsTrigger value="risks">Risks</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          {/* Crop Plan Tab */}
          <TabsContent value="plan" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Sprout className="h-5 w-5" />
                  Recommended Varieties
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {crop_plan?.recommended_varieties?.map((variety, index) => (
                    <li key={index} className="text-muted-foreground">{variety}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Planting Calendar
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                    <span className="font-medium">Land Preparation:</span>
                    <span className="text-muted-foreground">{crop_plan?.planting_calendar?.land_preparation}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                    <span className="font-medium">Sowing:</span>
                    <span className="text-muted-foreground">{crop_plan?.planting_calendar?.sowing}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                    <span className="font-medium">Harvesting:</span>
                    <span className="text-muted-foreground">{crop_plan?.planting_calendar?.harvesting}</span>
                  </div>
                  
                  {crop_plan?.planting_calendar?.fertilization_schedule && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Fertilization Schedule:</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {crop_plan.planting_calendar.fertilization_schedule.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {crop_plan?.planting_calendar?.irrigation_schedule && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Irrigation Schedule:</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {crop_plan.planting_calendar.irrigation_schedule.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {crop_plan?.planting_calendar?.pest_control_schedule && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Pest Control Schedule:</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {crop_plan.planting_calendar.pest_control_schedule.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Budget Tab */}
          <TabsContent value="budget" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-2">
                  <IndianRupee className="h-5 w-5 text-primary" />
                  <span className="text-lg font-semibold">Total Estimated Cost</span>
                </div>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(estimated_budget?.total_estimated_cost ?? 0)}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Cost Breakdown</h3>
                <div className="space-y-2">
                  {Object.entries(estimated_budget?.cost_breakdown || {}).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between items-center p-3 rounded bg-muted/50"
                    >
                      <span className="font-medium capitalize">
                        {key.replace(/_/g, " ")}
                      </span>
                      <span className="text-muted-foreground">
                        {typeof value === "number" ? formatCurrency(value) : value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {estimated_budget?.notes && (
                <div className="p-3 rounded bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    <strong>Notes:</strong> {estimated_budget.notes}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Risks Tab */}
          <TabsContent value="risks" className="space-y-4">
            <div className="space-y-3">
              {risk_factors && risk_factors.length > 0 ? (
                risk_factors.map((risk, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900"
                  >
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-yellow-900 dark:text-yellow-100">{risk}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No specific risk factors identified.</p>
              )}
            </div>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-4">
            <div className="space-y-3">
              {additional_recommendations && additional_recommendations.length > 0 ? (
                additional_recommendations.map((recommendation, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900"
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-green-900 dark:text-green-100">{recommendation}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No additional recommendations.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

