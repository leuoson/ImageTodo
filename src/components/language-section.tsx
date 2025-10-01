import * as RadioGroup from "@radix-ui/react-radio-group"
import { type Locale, useTranslation } from "@/lib/i18n"
import { cn } from "@/lib/utils"

interface LanguageSectionProps {
  locale: Locale
  onLocaleChange: (locale: Locale) => void
}

export function LanguageSection({
  locale,
  onLocaleChange
}: LanguageSectionProps) {
  const t = useTranslation(locale)

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-foreground">
        {t.language}
      </h3>
      <RadioGroup.Root
        value={locale}
        onValueChange={(value) => onLocaleChange(value as Locale)}
        className="space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroup.Item
            value="zh-CN"
            id="zh-CN"
            className={cn(
              "w-4 h-4 rounded-full border border-input",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
              "transition-colors"
            )}
          >
            <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:w-2 after:h-2 after:rounded-full after:bg-primary-foreground" />
          </RadioGroup.Item>
          <label
            htmlFor="zh-CN"
            className="text-sm text-foreground cursor-pointer select-none"
          >
            {t.chinese}
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <RadioGroup.Item
            value="en"
            id="en"
            className={cn(
              "w-4 h-4 rounded-full border border-input",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
              "transition-colors"
            )}
          >
            <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:w-2 after:h-2 after:rounded-full after:bg-primary-foreground" />
          </RadioGroup.Item>
          <label
            htmlFor="en"
            className="text-sm text-foreground cursor-pointer select-none"
          >
            {t.english}
          </label>
        </div>
      </RadioGroup.Root>
    </div>
  )
}
