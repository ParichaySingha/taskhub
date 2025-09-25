import { BackButton } from "~/components/back-button";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import {
  useChangePassword,
  useUpdateUserProfile,
  useUserProfileQuery,
} from "~/hooks/use-user";
import { useAuth } from "~/provider/auth-context";
import type { User } from "~/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { useState, useRef } from "react";

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Current password is required" }),
    newPassword: z.string().min(8, { message: "New password is required" }),
    confirmPassword: z
      .string()
      .min(8, { message: "Confirm password is required" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const profileSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  profilePicture: z.string().optional(),
  logo: z.string().optional(),
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export type ProfileFormData = z.infer<typeof profileSchema>;

const Profile = () => {
  const { data: user, isPending } = useUserProfileQuery() as {
    data: User;
    isPending: boolean;
  };
  const { logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      profilePicture: user?.profilePicture || "",
      logo: user?.logo || "",
    },
    values: {
      name: user?.name || "",
      profilePicture: user?.profilePicture || "",
      logo: user?.logo || "",
    },
  });

  const { mutate: updateUserProfile, isPending: isUpdatingProfile } =
    useUpdateUserProfile();
  const {
    mutate: changePassword,
    isPending: isChangingPassword,
    error,
  } = useChangePassword();

  const handlePasswordChange = (values: ChangePasswordFormData) => {
    changePassword(values, {
      onSuccess: () => {
        toast.success(
          "Password updated successfully. You will be logged out. Please login again."
        );
        form.reset();

        setTimeout(() => {
          logout();
          navigate("/sign-in");
        }, 3000);
      },
      onError: (error: any) => {
        const errorMessage =
          error.response?.data?.error || "Failed to update password";
        toast.error(errorMessage);
        console.log(error);
      },
    });
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (file.size > maxSize) {
      toast.error("Image size should be less than 5MB. Please select a smaller image.");
      return;
    }

    setUploading(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        setPreviewImage(base64String);
        profileForm.setValue("profilePicture", base64String);
        setUploading(false);
      };
      reader.onerror = () => {
        toast.error("Failed to read the image file");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to process the image");
      setUploading(false);
    }
  };

  const handleRemoveAvatar = () => {
    setPreviewImage(null);
    profileForm.setValue("profilePicture", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleLogoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (file.size > maxSize) {
      toast.error("Logo size should be less than 5MB. Please select a smaller image.");
      return;
    }

    setLogoUploading(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        setPreviewLogo(base64String);
        profileForm.setValue("logo", base64String);
        setLogoUploading(false);
      };
      reader.onerror = () => {
        toast.error("Failed to read the logo file");
        setLogoUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to process the logo");
      setLogoUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setPreviewLogo(null);
    profileForm.setValue("logo", "");
    if (logoInputRef.current) {
      logoInputRef.current.value = "";
    }
  };

  const handleProfileFormSubmit = (values: ProfileFormData) => {
    updateUserProfile(
      { 
        name: values.name, 
        profilePicture: values.profilePicture || "",
        logo: values.logo || ""
      },
      {
        onSuccess: (data: unknown) => {
          const updatedUser = data as User;
          toast.success("Profile updated successfully");
          setPreviewImage(null); // Clear preview after successful update
          setPreviewLogo(null); // Clear logo preview after successful update
          // Update the auth context with the new user data
          updateUser(updatedUser);
        },
        onError: (error: any) => {
          const errorMessage =
            error.response?.data?.error || "Failed to update profile";
          toast.error(errorMessage);
          console.log(error);
        },
      }
    );
  };

  if (isPending)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin" />
      </div>
    );

  return (
    <div className="space-y-8">
      <div className="px-4 md:px-0">
        <BackButton />
        <h3 className="text-lg font-medium">Profile Information</h3>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form
              onSubmit={profileForm.handleSubmit(handleProfileFormSubmit)}
              className="grid gap-4"
            >
              <div className="flex items-center space-x-4 mb-6">
                <Avatar className="h-20 w-20 bg-gray-600">
                  <AvatarImage
                    src={
                      previewImage ||
                      profileForm.watch("profilePicture") ||
                      user?.profilePicture
                    }
                    alt={user?.name}
                  />
                  <AvatarFallback className="text-xl">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={uploading || isUpdatingProfile}
                    style={{ display: "none" }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || isUpdatingProfile}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Change Avatar"
                    )}
                  </Button>
                  {(previewImage || user?.profilePicture) && (
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={handleRemoveAvatar}
                      disabled={uploading || isUpdatingProfile}
                    >
                      Remove Avatar
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Logo Upload Section */}
              <div className="mb-6">
                <Label className="text-lg font-semibold mb-4 block">Company/Personal Logo</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a logo that will be displayed in the sidebar instead of the text "TaskHub".
                  Recommended size: 200x200px or smaller. Max file size: 5MB.
                </p>
                
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-full max-w-md h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                       onClick={() => logoInputRef.current?.click()}>
                    {previewLogo || profileForm.watch("logo") || user?.logo ? (
                      <img
                        src={previewLogo || profileForm.watch("logo") || user?.logo}
                        alt="Logo preview"
                        className="w-full h-full object-contain rounded-lg"
                      />
                    ) : (
                      <div className="text-gray-400 text-center">
                        <div className="text-4xl mb-2">🏢</div>
                        <div className="text-sm font-medium">Click to upload logo</div>
                        <div className="text-xs">or drag and drop</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      ref={logoInputRef}
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      disabled={logoUploading || isUpdatingProfile}
                      style={{ display: "none" }}
                    />
                    <Button
                      type="button"
                      size="default"
                      variant="outline"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={logoUploading || isUpdatingProfile}
                      className="min-w-[120px]"
                    >
                      {logoUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        "Upload Logo"
                      )}
                    </Button>
                    {(previewLogo || user?.logo) && (
                      <Button
                        type="button"
                        size="default"
                        variant="destructive"
                        onClick={handleRemoveLogo}
                        disabled={logoUploading || isUpdatingProfile}
                        className="min-w-[120px]"
                      >
                        Remove Logo
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={user?.email}
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  Your email address cannot be changed.
                </p>
              </div>
              <Button
                type="submit"
                className="w-fit"
                disabled={isUpdatingProfile || isPending}
              >
                {isUpdatingProfile ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Update your password.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handlePasswordChange)}
              className="grid gap-4"
            >
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error.message}</AlertDescription>
                </Alert>
              )}

              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input
                          id="current-password"
                          type="password"
                          placeholder="********"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="********"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          id="confirm-password"
                          placeholder="********"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="mt-2 w-fit"
                disabled={isPending || isChangingPassword}
              >
                {isPending || isChangingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;