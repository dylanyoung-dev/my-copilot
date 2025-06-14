'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { CopilotChat } from '@/components/copilot/copilot-chat';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { enumTokenCategories, IToken } from '@/models/IToken';
import { Separator } from '@radix-ui/react-separator';
import { useTokens } from '@/hooks/use-tokens';
import { useInstances } from '@/hooks/use-instances';

export default function CopilotPage() {
  const { tokens } = useTokens();
  const { instances } = useInstances();

  // You can now use `tokens` and `instances` directly
  // For example, to find the active AI token:
  const aiToken = tokens.find((t) => t.active && t.category === enumTokenCategories.AI);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Copilot</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>{' '}
        <div className="container mx-auto py-6 px-4">
          <div className="">
            <div className="p-6">
              {aiToken ? (
                <CopilotChat tokens={tokens} instances={instances} />
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    Please configure an AI service token in settings to use the Copilot.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
