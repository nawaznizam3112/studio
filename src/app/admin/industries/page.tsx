
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getIndustries } from "@/app/actions";
import { CreateIndustryForm } from "@/components/admin/create-industry-form";

export default async function IndustriesPage() {
    const { industries, error } = await getIndustries();

    if (error) {
        return <div>Error: {error}</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Manage Industries</h1>
                <p className="text-muted-foreground">Add new business industries to the platform.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-1">
                    <CreateIndustryForm />
                </div>

                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Existing Industries</CardTitle>
                            <CardDescription>A list of all industries currently on the platform.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <ul className="space-y-3">
                                {industries && industries.length > 0 ? (
                                    industries.map((industry) => (
                                        <li key={industry.id} className="flex items-center justify-between rounded-md border p-4">
                                            <p className="font-medium">{industry.name}</p>
                                        </li>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground">No industries found.</p>
                                )}
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
