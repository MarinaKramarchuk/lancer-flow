"use client";
import React, { useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AccountFormData, accountSchema } from "@/app/lib/schema";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Controller } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { Button } from "./ui/button";
import useFetch from "@/hooks/use-fetch";
import { createAccount } from "@/actions/dashboard";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";


const CreateAccountDrawer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);

  const {
    register, 
    handleSubmit, 
    formState: { errors }, 
    setValue,
    reset,
    control,
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "CURRENT",
      balance: 0,
      isDefault: false,
      currency: "USD",
    },
  });

  const { 
    data: newAccount, 
    error, 
    fn: createAccountFn, 
    loading: createAccountLoading, 

  } = useFetch(createAccount);

  const onSubmit = async (data: AccountFormData) => {
    const result = await createAccountFn(data);
    if (result) {
      toast.success("Account created successfully!");
      reset(); 
      setOpen(false); 
    } else if (error) {
      toast.error(error.message || "Failed to create account.");
    }
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create New Account</DrawerTitle>
        </DrawerHeader>
        <DrawerDescription>Fill out the form below to add a new bank account.</DrawerDescription>
        <div className="px-4 pb-4">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2 mb-4">
              <label htmlFor="name" className="text-sm font-medium mb-2 block">
                Account Name
              </label>
              <Input
                id="name"
                placeholder="e.g., Main Checking"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2 mb-4">
              <label htmlFor="type" className="text-sm font-medium mb-2 block">
                Account Type
              </label>

              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CURRENT">Current</SelectItem>
                      <SelectItem value="SAVINGS">Savings</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2 mb-4">
              <label htmlFor="balance" className="text-sm font-medium mb-2 block">
                Initial Balance
              </label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("balance", { valueAsNumber: true })}
              />
              {errors.balance && (
                <p className="text-sm text-red-500">{errors.balance.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
              <label htmlFor="isDefault" className="text-sm font-medium block cursor-pointer">
                Set as Default Account
              </label>

              <p className="text-sm text-muted-foreground">This account will be used as the default for new transactions.</p>
              </div>
              <Controller
                control={control}
                name="isDefault"
                render={({ field }) => (
                  <Switch
                    id="isDefault"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
            <div className="flex gap-4 pt-4">
              <DrawerClose asChild>
                <Button type="button" variant="outline" className="flex-1 cursor-pointer">
                  Cancel
                </Button>
              </DrawerClose>

              <Button
                type="submit"
                className="ml-2 flex-1 cursor-pointer"
                disabled={createAccountLoading}
              >
                {createAccountLoading ? (
                  <><Loader2 className="mr-2  h-4 w-4 inline animate-spin" /> Creating...</>) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default CreateAccountDrawer;