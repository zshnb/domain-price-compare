"use client"

import {Button} from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem, FormMessage
} from "@/components/ui/form";
import {Input} from "@/components/ui/input"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {z} from "zod"
import {useTranslation} from "@/app/i18n/client";
import {useLocaleContext} from "@/context/LocaleContext";
import { DomainInfo, DomainRegister } from "@/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { useRef, useState } from "react";

export type DomainFormProps = {
  onStart: () => void
  onFetchDomainInfo: (domainInfo: DomainInfo) => void,
  onFinish: () => void
}
export default function DomainForm({onFetchDomainInfo, onStart, onFinish}: DomainFormProps) {
  const lang = useLocaleContext().lang
  const {t} = useTranslation(lang)
  const customTldRef = useRef('')
  const formSchema = z.object({
    domain: z.string()
      .min(1, t('index.domainForm.invalidDomainMessage')),
    tld: z.string()
  })
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      domain: "",
      tld: ".com"
    },
    mode: 'onChange'
  })

  const [tlds, setTlds] = useState(['.com', '.cn', '.org', '.net', '.ai', '.io', '.vip', '.xyz', '.tv', '.top', '.site', '.icu'])
  async function onSubmit(values: z.infer<typeof formSchema>) {
    onStart()
    const parallelRegisters = Object.keys(DomainRegister.byApi)
    const domain = `${values.domain}${values.tld}`
    try {
      const tencentResponse = await fetch(`/api/tencent?domain=${domain}`)
      const json = await tencentResponse.json()
      onFetchDomainInfo(json.data)
      if (json.data.available) {
        await Promise.all([...parallelRegisters.filter(it => it !== 'tencent').map(async it => {
          try {
            const res = await fetch(`/api/${it}?domain=${domain}`);
            if (res.ok) {
              const json = await res.json();
              onFetchDomainInfo(json.data);
            }
          } catch (error) {
            console.error(error);
          }
        })])
        for (const key in DomainRegister.byCrawl) {
          try {
            const res = await fetch(`/api/${key}?domain=${domain}`);
            if (res.ok) {
              const json = await res.json();
              onFetchDomainInfo(json.data);
            }
          } catch (error) {
            console.error(error);
          }
        }
      }
    } catch (e) {
    } finally {
      onFinish()
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex items-center justify-center gap-x-2 mb-10">
        <FormField
          control={form.control}
          name="domain"
          render={({field}) => (
            <FormItem className='basis-1/3'>
              <FormControl>
                <Input placeholder={t('index.domainForm.domainInputPlaceholder')} {...field} />
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tld"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-[200px] justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value || t('index.domainForm.selectTld')}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Input
                    onChange={(e) => customTldRef.current = (e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (!customTldRef.current.startsWith(".")) {
                          customTldRef.current = `.${customTldRef.current}`;
                        }
                        form.setValue("tld", customTldRef.current);
                      }
                    }}
                    placeholder={t("index.domainForm.inputCustomTld")}
                  />
                  <Command>
                    <CommandGroup>
                      <CommandList>
                        {tlds.map((it) => (
                          <CommandItem
                            value={it}
                            key={it}
                            onSelect={() => {
                              form.setValue("tld", it)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                it === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {it}
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className='!mt-0'>{t('index.domainForm.submitButton')}</Button>
      </form>
    </Form>
  )
}
