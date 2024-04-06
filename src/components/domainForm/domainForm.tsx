"use client"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {DomainInfo} from "@/components/domainTable/domainTable.type";

const formSchema = z.object({
  domain: z.string().min(1, {
    message: 'domain must have at least 1 character',
  }),
})

export type DomainFormProps = {
  onFetchDomainInfo: (domainInfo: DomainInfo) => void,
}
export default function DomainForm({onFetchDomainInfo}: DomainFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      domain: "",
    },
  })

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    fetch(`/api/tencent?domain=${values.domain}`).then(async res => {
      const json = await res.json()
      onFetchDomainInfo(json.data)
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex items-center justify-center gap-x-2">
        <FormField
          control={form.control}
          name="domain"
          render={({ field }) => (
            <FormItem className='basis-1/3'>
              <FormControl>
                <Input placeholder="请输入域名" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className='!mt-0'>Submit</Button>
      </form>
    </Form>
  )
}
