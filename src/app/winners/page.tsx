import { PageHeader } from "@/components/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { winners } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Trophy } from "lucide-react";

export default function WinnersPage() {
  return (
    <div>
      <PageHeader
        title="Winner Circle"
        description="A complete list of all lucky draw winners from your campaigns."
      />
      <div className="p-6 pt-0">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Winner</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Date Won</TableHead>
                  <TableHead className="text-right">Prize</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {winners.map((winner) => (
                  <TableRow key={winner.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={winner.avatar} data-ai-hint={winner.avatarHint} />
                          <AvatarFallback>{winner.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {winner.name}
                      </div>
                    </TableCell>
                    <TableCell>{winner.campaignName}</TableCell>
                    <TableCell>{winner.winDate}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2 text-yellow-500">
                        <Trophy className="h-4 w-4" />
                        <span>Lucky Draw Prize</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
