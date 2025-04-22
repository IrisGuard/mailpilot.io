import { Variable } from "@/types";
import { t } from "@/constants/i18n";

export const getTemplateVariables = (): Variable[] => {
  return [
    { key: "{{name}}", label: t('contactName'), example: "John Doe" },
    { key: "{{email}}", label: t('contactEmail'), example: "john@example.com" },
    { key: "{{company}}", label: t('companyName'), example: "Acme Inc." },
    { key: "{{role}}", label: t('contactRole'), example: "Marketing Manager" },
    { key: "{{date}}", label: t('currentDate'), example: "June 15, 2023" },
    { key: "{{sender}}", label: t('yourName'), example: "Jane Smith" },
  ];
};