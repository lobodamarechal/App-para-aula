import { PageHeader } from "@/components/dashboard/page-header";
import { AssistantChat } from "@/components/assistant/chat";

export const metadata = { title: "Assistente IA · Family Budget AI Pro" };

export default function AssistantPage() {
  return (
    <div>
      <PageHeader
        title="Assistente Financeiro IA"
        description="Conversa com o Claude sobre as tuas finanças — com base nos teus dados reais."
      />
      <AssistantChat />
    </div>
  );
}
