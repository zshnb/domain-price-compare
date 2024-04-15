"use client"

import {Button} from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import {Input} from "@/components/ui/input"
import {zodResolver} from "@hookform/resolvers/zod"
import {useForm} from "react-hook-form"
import {z} from "zod"
import {DomainInfo, DomainRegister} from "@/components/domainTable/domainTable.type";
import {useTranslation} from "@/app/i18n/client";
import {useLocaleContext} from "@/context/LocaleContext";

export type DomainFormProps = {
  onStart: () => void
  onFetchDomainInfo: (domainInfo: DomainInfo) => void,
  onFinish: () => void
}
export default function DomainForm({onFetchDomainInfo, onStart, onFinish}: DomainFormProps) {
  const lang = useLocaleContext().lang
  const {t} = useTranslation(lang)
  const formSchema = z.object({
    domain: z.string()
      .regex(new RegExp('[a-zA-Z0-9]+\\.([a-z]+)'), t('index.domainForm.invalidDomainMessage'))
  })
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      domain: "",
    },
    mode: 'onChange'
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    onStart()
    const registers = Object.keys(DomainRegister)
    try {
      const tencentResponse = await fetch(`/api/tencent?domain=${values.domain}`)
      const json = await tencentResponse.json()
      onFetchDomainInfo(json.data)
      if (json.data.available) {
        await Promise.all([...registers.filter(it => it !== 'tencent').map(async it => {
          try {
            const res = await fetch(`/api/${it}?domain=${values.domain}`);
            if (res.ok) {
              const json = await res.json();
              onFetchDomainInfo(json.data);
            }
          } catch (error) {
            console.error(error);
          }
        })])
      }
    } catch (e) {
    } finally {
      onFinish()
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex items-center justify-center gap-x-2">
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
        <Button type="submit" className='!mt-0'>{t('index.domainForm.submitButton')}</Button>
      </form>
    </Form>
  )
}
