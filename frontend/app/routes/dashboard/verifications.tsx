import { useAuth } from "~/provider/auth-context";
import { useVerifications } from "~/hooks/use-verification";
import { VerificationCard } from "~/components/verification/verification-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { RefreshCw, Shield, Clock, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";

export function meta() {
  return [
    { title: "Verifications - TaskHub" },
    { name: "description", content: "Manage task status verification requests" },
  ];
}

export default function VerificationsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("pending");

  const {
    data: verificationRequests,
    isLoading: isLoadingRequests,
    refetch: refetchRequests,
  } = useVerifications("requests", { status: activeTab });

  const {
    data: myVerificationRequests,
    isLoading: isLoadingMyRequests,
    refetch: refetchMyRequests,
  } = useVerifications("my-requests", { status: "all" });

  const {
    data: stats,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useVerifications("stats");

  const handleRefresh = () => {
    refetchRequests();
    refetchMyRequests();
    refetchStats();
  };

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
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Verifications</h1>
            <p className="text-gray-600">Manage task status verification requests</p>
          </div>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {Boolean(stats && typeof stats === 'object') && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats as any)?.total || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{(stats as any)?.pending || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{(stats as any)?.approved || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{(stats as any)?.rejected || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Requests</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="my-requests">My Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Verification Requests</CardTitle>
              <CardDescription>
                Tasks that require your verification to change status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingRequests ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading requests...</span>
                </div>
              ) : verificationRequests && (verificationRequests as any[]).length > 0 ? (
                <div className="space-y-4">
                  {(verificationRequests as any[]).map((verification) => (
                    <VerificationCard
                      key={verification._id}
                      verification={verification}
                      onUpdate={refetchRequests}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No pending verification requests</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Approved Requests</CardTitle>
              <CardDescription>
                Verification requests that have been approved
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingRequests ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading requests...</span>
                </div>
              ) : verificationRequests && (verificationRequests as any[]).length > 0 ? (
                <div className="space-y-4">
                  {(verificationRequests as any[]).map((verification) => (
                    <VerificationCard
                      key={verification._id}
                      verification={verification}
                      onUpdate={refetchRequests}
                      readOnly
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No approved verification requests</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rejected Requests</CardTitle>
              <CardDescription>
                Verification requests that have been rejected
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingRequests ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading requests...</span>
                </div>
              ) : verificationRequests && (verificationRequests as any[]).length > 0 ? (
                <div className="space-y-4">
                  {(verificationRequests as any[]).map((verification) => (
                    <VerificationCard
                      key={verification._id}
                      verification={verification}
                      onUpdate={refetchRequests}
                      readOnly
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <XCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No rejected verification requests</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Verification Requests</CardTitle>
              <CardDescription>
                Verification requests you have submitted
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingMyRequests ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading my requests...</span>
                </div>
              ) : myVerificationRequests && (myVerificationRequests as any[]).length > 0 ? (
                <div className="space-y-4">
                  {(myVerificationRequests as any[]).map((verification) => (
                    <VerificationCard
                      key={verification._id}
                      verification={verification}
                      onUpdate={refetchMyRequests}
                      readOnly
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No verification requests submitted</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
