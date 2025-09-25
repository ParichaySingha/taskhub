import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { Form } from '~/components/ui/form';
import type z from 'zod';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import { FormField, FormItem, FormLabel } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { useForgotPasswordMutation } from '~/hooks/use-auth';
import { forgotPasswordSchema } from '~/lib/schema';
import { toast } from 'sonner';
import { Link } from 'react-router';

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const { mutate: forgotPassword, isPending: isForgotPasswordPending } = useForgotPasswordMutation();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPassword(data, {
      onSuccess: () => {
        setIsSuccess(true);
      },
      onError: (error: any) => {
        console.log(error);
        toast.error(error.response?.data?.message || "An error occurred");
      }
    });
  }
  
  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <div className='w-full max-w-md space-y-6'>
        <div className='flex flex-col items-center justify-center space-y-2'>
          <h1 className='text-2xl font-bold'>Forgot Password</h1>
          <p className='text-sm text-muted-foreground'>Enter your email to reset your password</p>
        </div>

        <Card>
          <CardHeader>
            <Link to="/sign-in" className='flex items-center gap-2'>
              <ArrowLeft className='w-4 h-4' />
              <span>Back to Sign In</span>
            </Link>
          </CardHeader>

          <CardContent>
            {isSuccess ? (
              <div className='flex flex-col items-center justify-center space-y-2'>
                <CheckCircle className='w-10 h-10 text-green-500' />
                <h1 className='text-2xl font-bold'>Password reset email sent</h1>
                <p className='text-sm text-muted-foreground'>Please check your email for a link to reset your password</p>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          {...field}
                        />
                        {fieldState.error && (
                          <p className="text-destructive text-sm">{fieldState.error.message}</p>
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
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ForgotPassword