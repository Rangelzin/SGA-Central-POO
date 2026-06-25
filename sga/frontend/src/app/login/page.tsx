"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth/use-auth";
import { homeRouteFor } from "@/lib/auth/rbac";
import { getApiMessage } from "@/lib/api/client";
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas";


export default function LoginPage() {
  const router = useRouter();
  const { login, user, isAuthenticated, isLoading } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Usuário já logado não precisa ver o login
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      router.replace(homeRouteFor(user.role));
    }
  }, [isLoading, isAuthenticated, user, router]);

  async function onSubmit(values: LoginFormValues) {
    try {
      const loggedUser = await login(values);
      toast.success(`Bem-vindo(a), ${loggedUser.name}!`);
      router.replace(homeRouteFor(loggedUser.role));
    } catch (error) {
      toast.error(getApiMessage(error));
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="size-7" aria-hidden />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight">SGA</h1>
          <p className="text-sm text-muted-foreground">
            Sistema de Gestão Acadêmica
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Entrar</CardTitle>
            <CardDescription>
              Acesse com seu e-mail institucional.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          autoComplete="email"
                          placeholder="voce@sga.edu.br"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="current-password"
                          placeholder="••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting && (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  )}
                  Entrar
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
