import React from 'react'
import { signInSchema, signUpSchema } from '~/lib/schema';
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
import { useSignUpMutation } from '~/hooks/use-auth';
import { toast } from 'sonner';

export type SignUpFormData = z.infer<typeof signUpSchema>;

const SignUp = () => {
  const navigate = useNavigate();
  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const { mutate: signUp, isPending } = useSignUpMutation();

  const handleOnSubmit = (values: SignUpFormData) => {
    signUp(values, {
        onSuccess: () => {
            toast.success("Email verification requested", {
              description: "Please check your email for a verification link. If you don't see it, please check your spam folder.",
            });

            form.reset();
            navigate("/sign-in");
        },
        onError: (error: any) => {
            const errorMessage =
                error.response?.data?.message || "An error occurred";
            console.log(error);
            toast.error(errorMessage);
        },
    });
};

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
                name="name"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name"
                      type="text" 
                      placeholder="Enter your name" 
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
                    <Label htmlFor="password">Password</Label>
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
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input 
                      id="confirmPassword"
                      type="password" 
                      placeholder="Confirm your password" 
                      {...field} 
                    />
                    {fieldState.error && (
                      <p className="text-destructive text-sm">{fieldState.error.message}</p>
                    )}
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Signing up..." : "Sign up"}
              </Button>
            </form>
          </Form>
          <CardFooter>
            <p className="text-sm text-muted-foreground mt-2">
              Already have an account?{" "} 
              <Link to="/sign-in" className="text-primary underline">Sign in</Link>
            </p>
          </CardFooter>
        </CardContent>
      </Card>
    </div>
  )
}

export default SignUp

