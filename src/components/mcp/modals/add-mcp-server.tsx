import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useInstances } from '@/hooks/use-instances';
import { useMcpServers } from '@/hooks/use-mcp-servers';
import { useTokens } from '@/hooks/use-tokens';
import { IHeaderConfig } from '@/models/IHeaderConfig';
import { IMcpServer } from '@/models/IMcpServer';
import { IYamlServerConfig } from '@/models/IYamlConfig';
import { populateHeaderValues } from '@/utils/headerUtils';
import { ChevronLeft, Server, Settings } from 'lucide-react';
import { FC, useEffect, useState } from 'react';
import { SelectionMcpType } from '../ui/selection-mcp-type';
import { PreconfiguredServerSelector } from '../ui/preconfigured-server-selector';
import { HeaderConfigSelector } from '../ui/header-config-selector';
import Head from 'next/head';

interface AddMcpServerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (server: Omit<IMcpServer, 'id'>) => void;
}

type ModalMode = 'selection' | 'preconfigured' | 'custom' | 'headers';

const AddMcpServerModal: FC<AddMcpServerModalProps> = ({ open, onOpenChange, onSubmit }) => {
  const [mode, setMode] = useState<ModalMode>('selection');
  const [form, setForm] = useState<Omit<IMcpServer, 'id'>>({
    name: '',
    url: '',
    security: 'open',
    type: 'http',
    isActive: true,
    headers: [],
    apiDefinitionId: '',
  });
  const [headers, setHeaders] = useState<IHeaderConfig[]>([]);
  const [newHeader, setNewHeader] = useState<IHeaderConfig>({ key: '', value: '', required: false });
  const { tokens } = useTokens();
  const { instances } = useInstances();
  const { preconfiguredServers, isLoading } = useMcpServers();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedServer, setSelectedServer] = useState<IYamlServerConfig | null>(null);

  useEffect(() => {
    if (preconfiguredServers.length > 0) {
      // Extract and log all unique categories from the server configurations
      const availableCategories = Array.from(
        new Set(preconfiguredServers.map((s: IYamlServerConfig) => s.category || 'Other'))
      );

      console.log('Available categories:', availableCategories);
      console.log('Preconfigured servers:', preconfiguredServers);

      // Set the first category as selected if none is selected
      if (!selectedCategory) {
        setSelectedCategory(availableCategories[0]);
      }
    }
  }, [preconfiguredServers, selectedCategory]);

  // Reset when modal closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setMode('selection');
      setForm({
        name: '',
        url: '',
        security: 'open',
        type: 'http',
        isActive: true,
        headers: [],
        apiDefinitionId: '',
      });
      setHeaders([]);
      setNewHeader({ key: '', value: '', required: false });
    }
    onOpenChange(newOpen);
  }; // Handle preconfigured server selection

  const handlePreconfiguredSelect = (server: IYamlServerConfig) => {
    // Get any predefined headers for this server directly from the server config
    let serverHeaders: IHeaderConfig[] = [];

    if (server.headers && server.headers.length > 0) {
      // Use the headers defined in YAML
      serverHeaders = [...server.headers];

      // Populate values from existing tokens and instances
      serverHeaders = populateHeaderValues(serverHeaders);

      // If headers require values, show the header config screen
      const missingRequiredHeaders = serverHeaders.some((h) => h.required && !h.value);

      if (missingRequiredHeaders) {
        setForm({
          name: server.name,
          url: server.url,
          type: server.type,
          security: server.security,
          isActive: true,
          headers: serverHeaders,
          apiDefinitionId: server.apiDefinitionId || '',
        });
        setHeaders(serverHeaders);
        setSelectedServer(server);
        setMode('headers');
        return;
      }
    }

    onSubmit({
      name: server.name,
      url: server.url,
      type: server.type as 'http' | 'sse',
      security: server.security as 'open' | 'oauth',
      isActive: true,
      headers: serverHeaders,
      apiDefinitionId: server.apiDefinitionId || '',
    });
    handleOpenChange(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!form) return;
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form?.security === 'oauth') {
      alert('OAuth is currently disabled and coming soon. Please use open security for now.');
      return;
    }

    // Include the current headers
    const finalForm = {
      ...form,
      headers: headers.length > 0 ? headers : form.headers,
    };

    handleOpenChange(false);
  };

  const renderContent = () => {
    switch (mode) {
      case 'selection':
        return (
          <SelectionMcpType
            onSelectPreconfigured={() => setMode('preconfigured')}
            onSelectCustom={() => setMode('custom')}
          />
        );

      case 'preconfigured':
        return (
          <PreconfiguredServerSelector
            preconfiguredServers={preconfiguredServers}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            isLoading={isLoading}
            onBack={() => setMode('selection')}
            onSelect={handlePreconfiguredSelect}
          />
        );

      case 'custom':
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Button type="button" variant="ghost" size="sm" onClick={() => setMode('selection')} className="mb-2">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Server Name</label>
                <Input name="name" value={form.name} onChange={handleChange} placeholder="My MCP Server" required />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Server URL</label>
                <Input
                  name="url"
                  value={form.url}
                  onChange={handleChange}
                  placeholder="https://example.com/mcp"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Type</label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="http">HTTP</option>
                    <option value="sse">SSE</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Security</label>
                  <select
                    name="security"
                    value={form.security}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="open">Open</option>
                    <option value="oauth">OAuth</option>
                  </select>
                </div>
              </div>

              {form.security === 'oauth' && (
                <div className="text-sm text-muted-foreground bg-yellow-50 border border-yellow-200 rounded p-2">
                  OAuth is currently disabled and coming soon.
                </div>
              )}
            </div>{' '}
            <Button type="submit" className="w-full">
              Add Server
            </Button>
          </form>
        );

      case 'headers':
        return (
          <HeaderConfigSelector
            headers={headers}
            instances={instances}
            onHeadersChange={setHeaders}
            onBack={() => setMode('preconfigured')}
            onCancel={() => setMode('preconfigured')}
            onSave={() => {
              const finalForm = {
                ...form,
                headers: headers,
              };

              onSubmit(finalForm);
              handleOpenChange(false);
            }}
            server={
              {
                ...selectedServer!,
                id: 'temp-id', // Add required id
                isActive: true, // Add required isActive
              } as IMcpServer
            }
          />
        );
    }
  };

  const getDialogSize = () => {
    switch (mode) {
      case 'selection':
        return 'sm:max-w-md';
      case 'preconfigured':
        return 'sm:max-w-4xl';
      case 'custom':
        return 'sm:max-w-lg';
      case 'headers':
        return 'sm:max-w-2xl';
      default:
        return 'sm:max-w-md';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={`${getDialogSize()} mx-auto w-full`}>
        <DialogHeader>
          <DialogTitle>Add MCP Server</DialogTitle>
          <DialogDescription>
            {mode === 'selection' && 'Choose how you want to add a new MCP server.'}
            {mode === 'preconfigured' && 'Select from available preconfigured servers.'}
            {mode === 'custom' && 'Configure your own Model Context Protocol server.'}
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export { AddMcpServerModal };
