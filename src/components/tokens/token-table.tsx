import { Eye, EyeOff, MoreHorizontal, Power, PowerOff, Trash2 } from 'lucide-react';
import { FC, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

import { IToken } from '@/models/IToken';

interface TokenTableProps {
  tokens: IToken[];
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
}

export const TokenTable: FC<TokenTableProps> = ({ tokens, onDelete, onToggleActive }) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [visibleTokens, setVisibleTokens] = useState<string[]>([]);

  const toggleTokenVisibility = (id: string) => {
    setVisibleTokens((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const maskToken = (token: string) => '•'.repeat(20) + token.slice(-4);

  return (
    <>
      {' '}
      <Table>
        {' '}
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Token</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {' '}
          {tokens.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                No API tokens configured. Add your first token to get started.
              </TableCell>
            </TableRow>
          ) : (
            tokens.map((token) => (
              <TableRow key={token.id}>
                <TableCell>{token.name}</TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline">{token.category}</Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Token Category</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>{' '}
                <TableCell>
                  <Badge variant="secondary">{token.provider}</Badge>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={token.active ? 'default' : 'outline'}
                          size="sm"
                          className={token.active ? 'bg-green-500 hover:bg-green-600' : 'text-muted-foreground'}
                          onClick={() => onToggleActive(token.id)}
                        >
                          {token.active ? <Power className="h-4 w-4 mr-1" /> : <PowerOff className="h-4 w-4 mr-1" />}
                          {token.active ? 'Active' : 'Inactive'}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{token.active ? 'Deactivate token' : 'Activate token'}</p>
                        <p className="text-xs text-muted-foreground">Only one token per provider can be active</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell className="font-mono">
                  <div className="flex items-center gap-2">
                    {visibleTokens.includes(token.id) ? token.token : maskToken(token.token)}
                    <Button variant="ghost" size="sm" onClick={() => toggleTokenVisibility(token.id)}>
                      {visibleTokens.includes(token.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setDeleteId(token.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Token</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this API token? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  onDelete(deleteId);
                  setDeleteId(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
