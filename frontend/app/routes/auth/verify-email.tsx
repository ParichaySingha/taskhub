import React from 'react'
import { Link, useSearchParams } from 'react-router';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { ArrowLeft, CheckCircle, Loader2, XCircle } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { useVerifyEmailMutation } from '~/hooks/use-auth';

const VerifyEmail = () => {

  const [searchParams] = useSearchParams();

  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate, isPending: isVerifying } = useVerifyEmailMutation();
  
  useEffect(() => {
    const token = searchParams.get("token");

    if(token){
      mutate({ token }, {
        onSuccess: () => {
          setIsSuccess(true);
        },
        onError: (error: any) => {
          const errorMessage = error.response?.data?.message || "An error occurred";
          setIsSuccess(false);
          console.log(error);
          toast.error(errorMessage);
        }
      });
    }

  }, [searchParams]);
  

  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1 className='text-2xl font-bold'>Verify Email</h1>
      <p className='text-sm text-gray-500'>Verifying your email...</p>

      <Card className='max-w-md w-full shadow-xl mt-4'>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6">
            {isVerifying ? <>
              <Loader2 className="w-10 h-10 text-gray-500" />
              <h3 className="text-lg font-semibold">Verifying email...</h3>
              <p className="text-sm text-gray-500">
                Please wait while we verify your email.
              </p>
            </> : isSuccess ? (
              <>
                <CheckCircle className="w-10 h-10 text-green-500" />
                <h3 className="text-lg font-semibold">Email Verified</h3>
                <p className="text-sm text-gray-500">
                  Your email has been verified successfully.
                </p>
                <Link to="/sign-in" className="text-sm text-blue-500">
                  <Button variant="outline">Back to Sign in</Button>
                </Link>
              </>
            ) : (
              <>
                <XCircle className="w-10 h-10 text-red-500 mb-4" />
                <h3 className="text-lg font-semibold">Email Verification Failed</h3>
                <p className="text-sm text-gray-500">
                  Your email verification failed. Please try again.
                </p>
                <Link to="/sign-in" className="text-sm text-blue-500 mt-4">
                  <Button variant="outline">Back to Sign in</Button>
                </Link>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default VerifyEmail

function mutate(arg0: { token: string | null; }, arg1: { onSuccess: () => void; onError: (error: any) => void; }) {
  throw new Error('Function not implemented.');
}
