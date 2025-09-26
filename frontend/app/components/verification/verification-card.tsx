import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { useUpdateVerificationStatus } from "~/hooks/use-verification";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, User, Calendar, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Verification } from "~/hooks/use-verification";

interface VerificationCardProps {
  verification: Verification;
  onUpdate: () => void;
  readOnly?: boolean;
}

export const VerificationCard = ({ verification, onUpdate, readOnly = false }: VerificationCardProps) => {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const updateVerificationStatus = useUpdateVerificationStatus();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await updateVerificationStatus.mutateAsync({
        verificationId: verification._id,
        data: {
          status: "approved",
          verificationNotes: notes.trim() || undefined,
        },
      });
      toast.success("Verification request approved");
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to approve verification");
    } finally {
      setIsProcessing(false);
      setShowNotes(false);
      setNotes("");
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      await updateVerificationStatus.mutateAsync({
        verificationId: verification._id,
        data: {
          status: "rejected",
          verificationNotes: notes.trim() || undefined,
        },
      });
      toast.success("Verification request rejected");
      onUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to reject verification");
    } finally {
      setIsProcessing(false);
      setShowNotes(false);
      setNotes("");
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{verification.task.title}</CardTitle>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Project: {verification.project.title}</span>
              <span>•</span>
              <span>Workspace: {verification.workspace.name}</span>
            </div>
          </div>
          <Badge className={`${getStatusColor(verification.status)} flex items-center space-x-1`}>
            {getStatusIcon(verification.status)}
            <span className="capitalize">{verification.status}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Change Request */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">Status Change Request</h4>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                {verification.currentStatus}
              </Badge>
              <span className="text-gray-400">→</span>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                {verification.requestedStatus}
              </Badge>
            </div>
          </div>
          {verification.reason && (
            <p className="text-sm text-gray-600 mt-2">{verification.reason}</p>
          )}
        </div>

        {/* Request Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 text-sm">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Requested by:</span>
            <span className="font-medium">{verification.requestedBy.name}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Requested:</span>
            <span className="font-medium">
              {formatDistanceToNow(new Date(verification.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>

        {/* Verification Notes */}
        {verification.verificationNotes && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <MessageSquare className="h-4 w-4 text-blue-600" />
              <h4 className="font-medium text-blue-900">Verification Notes</h4>
            </div>
            <p className="text-sm text-blue-800">{verification.verificationNotes}</p>
            {verification.verifiedBy && (
              <p className="text-xs text-blue-600 mt-2">
                By {verification.verifiedBy.name} on{" "}
                {formatDistanceToNow(new Date(verification.verifiedAt!), { addSuffix: true })}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {!readOnly && verification.status === "pending" && (
          <div className="space-y-3">
            {!showNotes && (
              <div className="flex space-x-2">
                <Button
                  onClick={() => setShowNotes(true)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => setShowNotes(true)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            )}

            {showNotes && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="notes">Verification Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add notes about your decision..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={handleReject}
                    disabled={isProcessing}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => {
                      setShowNotes(false);
                      setNotes("");
                    }}
                    variant="outline"
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Task Description */}
        {verification.task.description && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-2">Task Description</h4>
            <p className="text-sm text-gray-600">{verification.task.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
