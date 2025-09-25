import React from 'react'
import { signInSchema } from '~/lib/schema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '~/components/ui/card';
import { Form, FormField, FormItem } from '~/components/ui/form';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useLoginMutation } from '~/hooks/use-auth';
import { toast } from 'sonner';
import { useAuth } from '~/provider/auth-context';

type SignInFormData = z.infer<typeof signInSchema>;

const SignIn = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutate, isPending: isLoggingIn } = useLoginMutation();

  const handleOnSubmit = (values: SignInFormData) => {
    mutate(values, {
      onSuccess: (data) => {
        login(data);
        console.log(data);
        toast.success("Login successful");
        navigate("/dashboard");
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || "An error occurred";
        console.log(error);
        toast.error(errorMessage);
      }
    });
  }
  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4'
    >
      <Card className='max-w-md w-full shadow-xl'>
        <CardHeader className='text-center'>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleOnSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email"
                      type="email" 
                      placeholder="email@example.com" 
                      {...field} 
                    />
                    {fieldState.error && (
                      <p className="text-destructive text-sm">{fieldState.error.message}</p>
                    )}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <div className='flex items-center justify-between'>
                      <Label htmlFor="password">Password</Label>
                      <Link to="/forgot-password" className="text-sm text-blue-600">Forgot password?</Link>
                    </div>
                    <Input 
                      id="password"
                      type="password" 
                      placeholder="Enter your password" 
                      {...field} 
                    />
                    {fieldState.error && (
                      <p className="text-destructive text-sm">{fieldState.error.message}</p>
                    )}
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoggingIn}>
                {isLoggingIn ? <Loader2 className="w-4 h-4 mr-2" /> : "Sign In"}
              </Button>
            </form>
          </Form>
          <CardFooter>
            <p className="text-sm text-muted-foreground mt-2">
              Don&apos;t have an account?{" "} 
              <Link to="/sign-up" className="text-primary underline">Sign up</Link>
            </p>
          </CardFooter>
        </CardContent>
      </Card>
    </div>
  )
}

export default SignIn