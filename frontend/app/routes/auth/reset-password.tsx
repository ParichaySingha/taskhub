import React, { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type z from 'zod';
import { resetPasswordSchema } from '~/lib/schema';
import { Link, useSearchParams } from 'react-router';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { FormField, FormItem, FormLabel } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { useResetPasswordMutation } from '~/hooks/use-auth';
import { toast } from 'sonner';

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate: resetPassword, isPending } = useResetPasswordMutation();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: ResetPasswordFormData) => {
    if (!token) {
      toast.error("Invalid token");
      return;
    }

    resetPassword(
      { ...values, token: token as string },
      {
        onSuccess: () => {
          setIsSuccess(true);
        },
        onError: (error: any) => {
          const errorMessage = error.response?.data?.message;
          toast.error(errorMessage);
          console.log(error);
        }
      }
    );
  };

  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <div className='w-full max-w-md space-y-6'>
        <div className='flex flex-col items-center justify-center space-y-2'>
          <h1 className='text-2xl font-bold'>Reset Password</h1>
          <p className='text-sm text-muted-foreground'>Enter your new password</p>
        </div>

        <Card>
          <CardHeader>
            <Link to="/sign-in" className="flex items-center gap-2">
              <ArrowLeft className='w-4 h-4' />
              <span>Back to Sign In</span>
            </Link>
          </CardHeader>

          <CardContent>
            {isSuccess ? (
              <div className='flex flex-col items-center justify-center space-y-2'>
                <CheckCircle className='w-10 h-10 text-green-500' />
                <h1 className='text-2xl font-bold'>Password reset successfully</h1>
                <p className='text-sm text-muted-foreground'>
                  Please login with your new password
                </p>
              </div>
            ) : (
              <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <Input
                          id="newPassword"
                          type="password"
                          placeholder="Enter your new password"
                          {...field}
                        />
                        {fieldState.error && (
                          <p className="text-destructive text-sm">
                            {fieldState.error.message}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Enter your confirm password"
                          {...field}
                        />
                        {fieldState.error && (
                          <p className="text-destructive text-sm">
                            {fieldState.error.message}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? (
                      <Loader2 className='w-4 h-4 animate-spin' />
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </form>
              </FormProvider>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ResetPassword
